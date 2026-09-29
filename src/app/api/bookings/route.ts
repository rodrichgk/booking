import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { bookings, barbershops, barbers, users, services } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { Resend } from 'resend';
import { escapeHtml } from '@/lib/utils';
import { hasBookingConflict } from '@/lib/booking';

// Lazy initialization of Resend to avoid build-time errors
let resendInstance: Resend | null = null;
function getResend() {
  if (!resendInstance) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error('RESEND_API_KEY is not configured');
    }
    resendInstance = new Resend(apiKey);
  }
  return resendInstance;
}

const DEFAULT_DURATION_MINUTES = 60;

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user ? (session.user as any).id : null;

    const body = await request.json();
    const {
      barbershopId,
      barberId,
      serviceId,
      appointmentDate,
      customerName,
      customerEmail,
      customerPhone,
      notes,
    } = body;

    // Validate required fields
    if (!barbershopId || !appointmentDate || !customerName || !customerEmail || !customerPhone) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate appointment is in the future
    const appointmentDateTime = new Date(appointmentDate);
    if (isNaN(appointmentDateTime.getTime()) || appointmentDateTime <= new Date()) {
      return NextResponse.json(
        { error: 'Appointment date must be a valid date in the future' },
        { status: 400 }
      );
    }

    // Fetch barbershop details
    const [barbershop] = await db
      .select({
        id: barbershops.id,
        name: barbershops.name,
        address: barbershops.address,
        city: barbershops.city,
        email: barbershops.email,
      })
      .from(barbershops)
      .where(eq(barbershops.id, barbershopId))
      .limit(1);

    if (!barbershop) {
      return NextResponse.json({ error: 'Barbershop not found' }, { status: 404 });
    }

    // Resolve service to derive real duration and price (instead of hardcoding).
    let durationMinutes = DEFAULT_DURATION_MINUTES;
    let totalPrice = '0';
    if (serviceId) {
      const [service] = await db
        .select({ duration: services.duration, price: services.price, isActive: services.isActive })
        .from(services)
        .where(and(eq(services.id, serviceId), eq(services.barbershopId, barbershopId)))
        .limit(1);
      // The service must belong to this shop (otherwise a booking could take its
      // price and duration from another shop's service) and not be deactivated.
      if (!service || service.isActive === false) {
        return NextResponse.json({ error: 'Service not found' }, { status: 404 });
      }
      durationMinutes = service.duration ?? DEFAULT_DURATION_MINUTES;
      totalPrice = service.price ?? '0';
    }

    const endTime = new Date(appointmentDateTime.getTime() + durationMinutes * 60 * 1000);

    // Fetch barber info if specified
    let barberInfo: { id: string; name: string | null } | null = null;
    if (barberId) {
      const [barber] = await db
        .select({ id: barbers.id, name: users.name })
        .from(barbers)
        .innerJoin(users, eq(barbers.userId, users.id))
        .where(
          and(
            eq(barbers.id, barberId),
            eq(barbers.barbershopId, barbershopId),
            eq(barbers.isActive, true)
          )
        )
        .limit(1);
      if (!barber) {
        return NextResponse.json({ error: 'Barber not found' }, { status: 404 });
      }
      barberInfo = barber;
    }

    // Create the booking inside a transaction. The overlap check + insert run
    // atomically, and a partial UNIQUE INDEX on (barber_id, start_time) for
    // confirmed bookings is the authoritative guard against the read-then-insert
    // race for identical slots (two clients grabbing the same time at once).
    let booking;
    try {
      booking = await db.transaction(async (tx) => {
        if (barberId) {
          const existingBookings = await tx
            .select({ startTime: bookings.startTime, endTime: bookings.endTime })
            .from(bookings)
            .where(and(eq(bookings.barberId, barberId), eq(bookings.status, 'confirmed')));

          const conflict = hasBookingConflict(
            { start: appointmentDateTime.getTime(), end: endTime.getTime() },
            existingBookings.map((b) => ({
              start: new Date(b.startTime).getTime(),
              end: new Date(b.endTime).getTime(),
            }))
          );

          if (conflict) {
            throw new BookingConflictError();
          }
        }

        const [created] = await tx
          .insert(bookings)
          .values({
            userId: userId || null,
            barbershopId,
            barberId: barberId || null,
            serviceId: serviceId || null,
            startTime: appointmentDateTime,
            endTime,
            totalPrice,
            customerName,
            customerEmail,
            customerPhone,
            notes: notes || null,
            status: 'confirmed',
          })
          .returning();

        return created;
      });
    } catch (err: any) {
      // Unique-violation from the DB constraint => someone booked this exact slot first.
      if (err instanceof BookingConflictError || err?.code === '23505') {
        return NextResponse.json(
          { error: 'Ce coiffeur a déjà une réservation à cette heure. Veuillez choisir un autre horaire.' },
          { status: 409 }
        );
      }
      throw err;
    }

    // Send confirmation emails AFTER the booking is committed. Email delivery is
    // best-effort: a transient email failure must NOT lose a confirmed booking.
    const emailSent = await sendBookingEmails({
      booking,
      barbershop,
      barberInfo,
      appointmentDateTime,
      customerName,
      customerEmail,
      customerPhone,
      notes,
    });

    return NextResponse.json({
      success: true,
      emailSent,
      booking: {
        id: booking.id,
        appointmentDate: booking.startTime,
        status: booking.status,
      },
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 });
  }
}

class BookingConflictError extends Error {
  constructor() {
    super('Booking conflict');
    this.name = 'BookingConflictError';
  }
}

function formatDate(date: Date) {
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Paris',
  };
  return date.toLocaleDateString('fr-FR', options);
}

/**
 * Sends the customer + barbershop confirmation emails. Returns whether the
 * customer email was sent. Never throws — failures are logged, and the booking
 * (already committed) is preserved regardless.
 */
async function sendBookingEmails(args: {
  booking: { id: string };
  barbershop: { name: string; address: string; city: string; email: string | null };
  barberInfo: { name: string | null } | null;
  appointmentDateTime: Date;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  notes?: string;
}): Promise<boolean> {
  const { barbershop, barberInfo, appointmentDateTime, customerName, customerEmail, customerPhone, notes } = args;

  // All user-controlled values are HTML-escaped before interpolation.
  const safeName = escapeHtml(customerName);
  const safeNotes = notes ? escapeHtml(notes) : '';
  const safeBarber = barberInfo?.name ? escapeHtml(barberInfo.name) : '';
  const safeShopName = escapeHtml(barbershop.name);
  const safeAddress = `${escapeHtml(barbershop.address)}, ${escapeHtml(barbershop.city)}`;
  const safeDate = escapeHtml(formatDate(appointmentDateTime));

  try {
    const resendClient = getResend();
    const emailResponse = await resendClient.emails.send({
      from: 'Orphelia <noreply@orphelia.net>',
      to: customerEmail,
      subject: `Confirmation de votre rendez-vous chez ${barbershop.name}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
              .booking-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
              .detail-row { display: flex; padding: 10px 0; border-bottom: 1px solid #eee; }
              .detail-label { font-weight: bold; width: 150px; }
              .detail-value { flex: 1; }
              .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>✂️ Rendez-vous Confirmé!</h1>
              </div>
              <div class="content">
                <p>Bonjour <strong>${safeName}</strong>,</p>
                <p>Votre rendez-vous a été confirmé avec succès!</p>

                <div class="booking-details">
                  <h2 style="margin-top: 0;">Détails de votre rendez-vous</h2>

                  <div class="detail-row">
                    <div class="detail-label">📍 Salon:</div>
                    <div class="detail-value">${safeShopName}</div>
                  </div>

                  ${safeBarber ? `
                  <div class="detail-row">
                    <div class="detail-label">💇 Coiffeur:</div>
                    <div class="detail-value">${safeBarber}</div>
                  </div>
                  ` : ''}

                  <div class="detail-row">
                    <div class="detail-label">📅 Date & Heure:</div>
                    <div class="detail-value">${safeDate}</div>
                  </div>

                  <div class="detail-row">
                    <div class="detail-label">📍 Adresse:</div>
                    <div class="detail-value">${safeAddress}</div>
                  </div>

                  ${safeNotes ? `
                  <div class="detail-row">
                    <div class="detail-label">📝 Notes:</div>
                    <div class="detail-value">${safeNotes}</div>
                  </div>
                  ` : ''}
                </div>

                <p><strong>Important:</strong> Veuillez arriver 5 minutes avant l'heure de votre rendez-vous.</p>
                <p>Si vous devez annuler ou modifier votre rendez-vous, veuillez contacter le salon directement.</p>

                <div class="footer">
                  <p>Merci d'avoir choisi Orphelia!</p>
                  <p style="font-size: 12px; color: #999;">Ceci est un email automatique, merci de ne pas y répondre.</p>
                </div>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    if (emailResponse.error) {
      console.error('Customer email failed:', JSON.stringify(emailResponse.error));
      return false;
    }

    // Notify the barbershop (best-effort; not fatal).
    if (barbershop.email) {
      try {
        await resendClient.emails.send({
          from: 'Orphelia <noreply@orphelia.net>',
          to: barbershop.email,
          subject: `Nouvelle réservation - ${customerName}`,
          html: `
            <!DOCTYPE html>
            <html>
              <head>
                <meta charset="utf-8">
                <style>
                  body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                  .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                  .header { background: #667eea; color: white; padding: 20px; text-align: center; }
                  .content { background: #f9f9f9; padding: 30px; }
                  .booking-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
                </style>
              </head>
              <body>
                <div class="container">
                  <div class="header"><h1>📅 Nouvelle Réservation</h1></div>
                  <div class="content">
                    <p>Une nouvelle réservation a été effectuée pour votre salon.</p>
                    <div class="booking-details">
                      <h3>Détails de la réservation</h3>
                      <p><strong>Client:</strong> ${safeName}</p>
                      <p><strong>Email:</strong> ${escapeHtml(customerEmail)}</p>
                      <p><strong>Téléphone:</strong> ${escapeHtml(customerPhone)}</p>
                      ${safeBarber ? `<p><strong>Coiffeur:</strong> ${safeBarber}</p>` : ''}
                      <p><strong>Date & Heure:</strong> ${safeDate}</p>
                      ${safeNotes ? `<p><strong>Notes:</strong> ${safeNotes}</p>` : ''}
                    </div>
                    <p>Vous pouvez gérer vos réservations depuis votre tableau de bord.</p>
                  </div>
                </div>
              </body>
            </html>
          `,
        });
      } catch (shopEmailError: any) {
        console.error('Barbershop notification email failed:', shopEmailError?.message || shopEmailError);
      }
    }

    return true;
  } catch (emailError: any) {
    // Booking is already committed — log and move on, do NOT delete it.
    console.error('Confirmation email failed (booking preserved):', emailError?.message || emailError);
    return false;
  }
}
