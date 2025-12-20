import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { bookings, barbershops, barbers, users } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { Resend } from 'resend';

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

export async function POST(request: NextRequest) {
  try {
    // Get user session if authenticated
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
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate appointment is in the future
    const appointmentDateTime = new Date(appointmentDate);
    const now = new Date();
    
    if (appointmentDateTime <= now) {
      return NextResponse.json(
        { error: 'Appointment date must be in the future' },
        { status: 400 }
      );
    }

    // Check for double-booking if barber is specified
    if (barberId) {
      const endTime = new Date(appointmentDateTime);
      endTime.setHours(endTime.getHours() + 1);

      const existingBookings = await db
        .select()
        .from(bookings)
        .where(
          and(
            eq(bookings.barberId, barberId),
            eq(bookings.status, 'confirmed')
          )
        );

      // Check if there's any time overlap
      const hasConflict = existingBookings.some(existing => {
        const existingStart = new Date(existing.startTime);
        const existingEnd = new Date(existing.endTime);
        
        // Check for any overlap
        return (
          (appointmentDateTime >= existingStart && appointmentDateTime < existingEnd) || // New starts during existing
          (endTime > existingStart && endTime <= existingEnd) || // New ends during existing
          (appointmentDateTime <= existingStart && endTime >= existingEnd) // New contains existing
        );
      });

      if (hasConflict) {
        return NextResponse.json(
          { error: 'Ce coiffeur a déjà une réservation à cette heure. Veuillez choisir un autre horaire.' },
          { status: 409 }
        );
      }
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
      return NextResponse.json(
        { error: 'Barbershop not found' },
        { status: 404 }
      );
    }

    // Fetch barber info if specified
    let barberInfo = null;
    if (barberId) {
      const [barber] = await db
        .select({
          id: barbers.id,
          name: users.name,
        })
        .from(barbers)
        .innerJoin(users, eq(barbers.userId, users.id))
        .where(eq(barbers.id, barberId))
        .limit(1);
      
      barberInfo = barber;
    }

    // Create booking
    const endTime = new Date(appointmentDateTime);
    endTime.setHours(endTime.getHours() + 1); // Default 1 hour appointment
    
    const [booking] = await db
      .insert(bookings)
      .values({
        userId: userId || null, // Use authenticated user ID or null for guest
        barbershopId,
        barberId: barberId || null, // Null if no specific barber selected
        serviceId: serviceId || null, // Null if no specific service selected
        startTime: appointmentDateTime,
        endTime: endTime,
        totalPrice: '0', // TODO: Get from service price
        customerName,
        customerEmail,
        customerPhone,
        notes: notes || null,
        status: 'confirmed',
      })
      .returning();

    // Format date for email
    const formatDate = (date: Date) => {
      const options: Intl.DateTimeFormatOptions = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      };
      return date.toLocaleDateString('fr-FR', options);
    };

    // Send confirmation email to customer
    console.log('📧 Attempting to send email to customer:', customerEmail);
    console.log('📧 Using Resend API Key:', process.env.RESEND_API_KEY ? 'Present' : 'Missing');
    
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
                .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>✂️ Rendez-vous Confirmé!</h1>
                </div>
                <div class="content">
                  <p>Bonjour <strong>${customerName}</strong>,</p>
                  <p>Votre rendez-vous a été confirmé avec succès!</p>
                  
                  <div class="booking-details">
                    <h2 style="margin-top: 0;">Détails de votre rendez-vous</h2>
                    
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
                      <div class="detail-label">📅 Date & Heure:</div>
                      <div class="detail-value">${formatDate(appointmentDateTime)}</div>
                    </div>
                    
                    <div class="detail-row">
                      <div class="detail-label">📍 Adresse:</div>
                      <div class="detail-value">${barbershop.address}, ${barbershop.city}</div>
                    </div>
                    
                    ${notes ? `
                    <div class="detail-row">
                      <div class="detail-label">📝 Notes:</div>
                      <div class="detail-value">${notes}</div>
                    </div>
                    ` : ''}
                  </div>
                  
                  <p><strong>Important:</strong> Veuillez arriver 5 minutes avant l'heure de votre rendez-vous.</p>
                  
                  <p>Si vous devez annuler ou modifier votre rendez-vous, veuillez contacter le salon directement.</p>
                  
                  <div class="footer">
                    <p>Merci d'avoir choisi Orphlia!</p>
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

      console.log('✅ Customer email sent successfully:', emailResponse);

      // Check if email actually succeeded (Resend can return 200 with error in body)
      if (emailResponse.error) {
        throw new Error(JSON.stringify(emailResponse.error));
      }

      // Send notification to barbershop
      if (barbershop.email) {
        console.log('📧 Attempting to send email to barbershop:', barbershop.email);
        const resendClient = getResend();
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
                  <div class="header">
                    <h1>📅 Nouvelle Réservation</h1>
                  </div>
                  <div class="content">
                    <p>Une nouvelle réservation a été effectuée pour votre salon.</p>
                    
                    <div class="booking-details">
                      <h3>Détails de la réservation</h3>
                      <p><strong>Client:</strong> ${customerName}</p>
                      <p><strong>Email:</strong> ${customerEmail}</p>
                      <p><strong>Téléphone:</strong> ${customerPhone}</p>
                      ${barberInfo ? `<p><strong>Coiffeur:</strong> ${barberInfo.name}</p>` : ''}
                      <p><strong>Date & Heure:</strong> ${formatDate(appointmentDateTime)}</p>
                      ${notes ? `<p><strong>Notes:</strong> ${notes}</p>` : ''}
                    </div>
                    
                    <p>Vous pouvez gérer vos réservations depuis votre tableau de bord.</p>
                  </div>
                </div>
              </body>
            </html>
          `,
        });
      }
    } catch (emailError: any) {
      console.error('❌ Email sending failed!');
      console.error('Error type:', emailError.constructor.name);
      console.error('Error message:', emailError.message);
      console.error('Error details:', JSON.stringify(emailError, null, 2));
      
      if (emailError.statusCode) {
        console.error('HTTP Status Code:', emailError.statusCode);
      }
      
      // Delete the booking since email failed
      try {
        await db.delete(bookings).where(eq(bookings.id, booking.id));
        console.log('🗑️  Booking deleted due to email failure');
      } catch (deleteError) {
        console.error('Failed to delete booking:', deleteError);
      }
      
      return NextResponse.json(
        { 
          error: 'Échec de l\'envoi de l\'email de confirmation. Veuillez vérifier votre adresse email.',
          details: emailError.message || 'Unknown error',
          statusCode: emailError.statusCode || 500
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      booking: {
        id: booking.id,
        appointmentDate: booking.startTime,
        status: booking.status,
      },
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    );
  }
}
