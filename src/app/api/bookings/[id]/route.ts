import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { bookings, barbershops, barbers, users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { Resend } from 'resend';
import { getEmailFrom } from '@/lib/settings';

// Lazy initialization of Resend
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

// Format date for email
const formatDate = (date: Date) => {
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
};

// Cancel/Delete a booking
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Get the booking first to check if it exists
    const [booking] = await db
      .select()
      .from(bookings)
      .where(eq(bookings.id, id))
      .limit(1);

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Update status to cancelled instead of deleting
    await db
      .update(bookings)
      .set({ status: 'cancelled' })
      .where(eq(bookings.id, id));

    return NextResponse.json({
      success: true,
      message: 'Booking cancelled successfully',
    });
  } catch (error) {
    console.error('Error cancelling booking:', error);
    return NextResponse.json(
      { error: 'Failed to cancel booking' },
      { status: 500 }
    );
  }
}

// Update booking (status and/or time)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, startTime } = body;

    if (!status && !startTime) {
      return NextResponse.json(
        { error: 'Au moins un champ (status ou startTime) est requis' },
        { status: 400 }
      );
    }

    // Validate status if provided
    if (status) {
      const validStatuses = ['confirmed', 'cancelled', 'completed', 'pending'];
      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          { error: 'Invalid status' },
          { status: 400 }
        );
      }
    }

    // Get the booking first to check if it exists
    const [booking] = await db
      .select()
      .from(bookings)
      .where(eq(bookings.id, id))
      .limit(1);

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Build update fields
    const updateFields: Record<string, any> = {};
    if (status) {
      updateFields.status = status;
    }

    let newStartTime: Date | null = null;
    if (startTime) {
      newStartTime = new Date(startTime);
      const newEndTime = new Date(newStartTime);
      newEndTime.setHours(newEndTime.getHours() + 1);
      updateFields.startTime = newStartTime;
      updateFields.endTime = newEndTime;
    }

    // Update the booking
    await db
      .update(bookings)
      .set(updateFields)
      .where(eq(bookings.id, id));

    // If time was changed, send modification emails
    if (newStartTime && booking.customerEmail && booking.customerName) {
      try {
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
          .where(eq(barbershops.id, booking.barbershopId))
          .limit(1);

        // Fetch barber info if specified
        let barberInfo: { id: string; name: string | null } | null = null;
        if (booking.barberId) {
          const [barber] = await db
            .select({
              id: barbers.id,
              name: users.name,
            })
            .from(barbers)
            .innerJoin(users, eq(barbers.userId, users.id))
            .where(eq(barbers.id, booking.barberId))
            .limit(1);
          barberInfo = barber || null;
        }

        if (barbershop) {
          const resendClient = getResend();
          const oldDate = formatDate(new Date(booking.startTime));
          const newDate = formatDate(newStartTime);

          // Send modification email to customer
          await resendClient.emails.send({
            from: await getEmailFrom(),
            to: booking.customerEmail,
            subject: `Modification de votre rendez-vous chez ${barbershop.name}`,
            html: `
              <!DOCTYPE html>
              <html>
                <head>
                  <meta charset="utf-8">
                  <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .booking-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
                    .detail-row { display: flex; padding: 10px 0; border-bottom: 1px solid #eee; }
                    .detail-label { font-weight: bold; width: 150px; }
                    .detail-value { flex: 1; }
                    .old-time { color: #e53e3e; text-decoration: line-through; }
                    .new-time { color: #38a169; font-weight: bold; }
                    .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
                  </style>
                </head>
                <body>
                  <div class="container">
                    <div class="header">
                      <h1>📅 Rendez-vous Modifié</h1>
                    </div>
                    <div class="content">
                      <p>Bonjour <strong>${booking.customerName}</strong>,</p>
                      <p>L'horaire de votre rendez-vous a été modifié.</p>
                      
                      <div class="booking-details">
                        <h2 style="margin-top: 0;">Nouveau créneau</h2>
                        
                        <div class="detail-row">
                          <div class="detail-label">📍 Salon:</div>
                          <div class="detail-value">${barbershop.name}</div>
                        </div>
                        
                        ${barberInfo ? `
                        <div class="detail-row">
                          <div class="detail-label">💇 Coiffeur:</div>
                          <div class="detail-value">${barberInfo.name}</div>
                        </div>
                        ` : ''}
                        
                        <div class="detail-row">
                          <div class="detail-label">❌ Ancien horaire:</div>
                          <div class="detail-value old-time">${oldDate}</div>
                        </div>
                        
                        <div class="detail-row">
                          <div class="detail-label">✅ Nouvel horaire:</div>
                          <div class="detail-value new-time">${newDate}</div>
                        </div>
                        
                        <div class="detail-row">
                          <div class="detail-label">📍 Adresse:</div>
                          <div class="detail-value">${barbershop.address}, ${barbershop.city}</div>
                        </div>
                      </div>
                      
                      <p><strong>Important:</strong> Veuillez arriver 5 minutes avant l'heure de votre rendez-vous.</p>
                      
                      <div class="footer">
                        <p>Merci d'avoir choisi Orphelia!</p>
                        <p style="font-size: 12px; color: #999;">
                          Ceci est un email automatique, merci de ne pas y répondre.
                        </p>
                      </div>
                    </div>
                  </div>
                </body>
              </html>
            `,
          });

          // Send modification email to barbershop
          if (barbershop.email) {
            await resendClient.emails.send({
              from: await getEmailFrom(),
              to: barbershop.email,
              subject: `Rendez-vous modifié - ${booking.customerName}`,
              html: `
                <!DOCTYPE html>
                <html>
                  <head>
                    <meta charset="utf-8">
                    <style>
                      body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                      .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                      .header { background: #f5576c; color: white; padding: 20px; text-align: center; }
                      .content { background: #f9f9f9; padding: 30px; }
                      .booking-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
                      .old-time { color: #e53e3e; text-decoration: line-through; }
                      .new-time { color: #38a169; font-weight: bold; }
                    </style>
                  </head>
                  <body>
                    <div class="container">
                      <div class="header">
                        <h1>📅 Rendez-vous Modifié</h1>
                      </div>
                      <div class="content">
                        <p>L'horaire d'une réservation a été modifié.</p>
                        
                        <div class="booking-details">
                          <h3>Détails de la modification</h3>
                          <p><strong>Client:</strong> ${booking.customerName}</p>
                          <p><strong>Email:</strong> ${booking.customerEmail}</p>
                          <p><strong>Téléphone:</strong> ${booking.customerPhone}</p>
                          ${barberInfo ? `<p><strong>Coiffeur:</strong> ${barberInfo.name}</p>` : ''}
                          <p><strong>Ancien horaire:</strong> <span class="old-time">${oldDate}</span></p>
                          <p><strong>Nouvel horaire:</strong> <span class="new-time">${newDate}</span></p>
                        </div>
                        
                        <p>Vous pouvez gérer vos réservations depuis votre tableau de bord.</p>
                      </div>
                    </div>
                  </body>
                </html>
              `,
            });
          }
        }
      } catch (emailError) {
        console.error('Error sending modification emails:', emailError);
        // Don't fail the update if email fails - booking time is already updated
      }
    }

    return NextResponse.json({
      success: true,
      message: startTime ? 'Horaire mis à jour et emails envoyés' : 'Statut mis à jour',
      status: status || booking.status,
    });
  } catch (error) {
    console.error('Error updating booking:', error);
    return NextResponse.json(
      { error: 'Failed to update booking' },
      { status: 500 }
    );
  }
}
