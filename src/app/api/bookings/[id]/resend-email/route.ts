import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { bookings, barbershops, barbers, users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { Resend } from 'resend';

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

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Fetch the booking
    const [booking] = await db
      .select()
      .from(bookings)
      .where(eq(bookings.id, id))
      .limit(1);

    if (!booking) {
      return NextResponse.json(
        { error: 'Réservation introuvable' },
        { status: 404 }
      );
    }

    if (!booking.customerEmail || !booking.customerName) {
      return NextResponse.json(
        { error: 'Informations client manquantes pour envoyer l\'email' },
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
      .where(eq(barbershops.id, booking.barbershopId))
      .limit(1);

    if (!barbershop) {
      return NextResponse.json(
        { error: 'Salon introuvable' },
        { status: 404 }
      );
    }

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

    const appointmentDateTime = new Date(booking.startTime);
    const resendClient = getResend();

    // Send confirmation email to customer
    const emailResponse = await resendClient.emails.send({
      from: 'Orphelia <noreply@orphelia.net>',
      to: booking.customerEmail,
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
                <p>Bonjour <strong>${booking.customerName}</strong>,</p>
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
                  
                  ${booking.notes ? `
                  <div class="detail-row">
                    <div class="detail-label">📝 Notes:</div>
                    <div class="detail-value">${booking.notes}</div>
                  </div>
                  ` : ''}
                </div>
                
                <p><strong>Important:</strong> Veuillez arriver 5 minutes avant l'heure de votre rendez-vous.</p>
                
                <p>Si vous devez annuler ou modifier votre rendez-vous, veuillez contacter le salon directement.</p>
                
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

    if (emailResponse.error) {
      throw new Error(JSON.stringify(emailResponse.error));
    }

    // Send notification to barbershop
    if (barbershop.email) {
      await resendClient.emails.send({
        from: 'Orphelia <noreply@orphelia.net>',
        to: barbershop.email,
        subject: `Rappel de réservation - ${booking.customerName}`,
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
                  <h1>📅 Rappel de Réservation</h1>
                </div>
                <div class="content">
                  <p>Voici un rappel pour la réservation suivante.</p>
                  
                  <div class="booking-details">
                    <h3>Détails de la réservation</h3>
                    <p><strong>Client:</strong> ${booking.customerName}</p>
                    <p><strong>Email:</strong> ${booking.customerEmail}</p>
                    <p><strong>Téléphone:</strong> ${booking.customerPhone}</p>
                    ${barberInfo ? `<p><strong>Coiffeur:</strong> ${barberInfo.name}</p>` : ''}
                    <p><strong>Date & Heure:</strong> ${formatDate(appointmentDateTime)}</p>
                    ${booking.notes ? `<p><strong>Notes:</strong> ${booking.notes}</p>` : ''}
                  </div>
                  
                  <p>Vous pouvez gérer vos réservations depuis votre tableau de bord.</p>
                </div>
              </div>
            </body>
          </html>
        `,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Emails renvoyés avec succès',
    });
  } catch (error: any) {
    console.error('Error resending booking emails:', error);
    return NextResponse.json(
      {
        error: 'Échec du renvoi des emails',
        details: error.message || 'Unknown error',
      },
      { status: 500 }
    );
  }
}
