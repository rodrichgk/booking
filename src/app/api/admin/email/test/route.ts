import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
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

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
        }

        const userRole = (session.user as any).role;
        if (!['dev', 'admin'].includes(userRole)) {
            return NextResponse.json({ error: 'Accès réservé aux administrateurs' }, { status: 403 });
        }

        const body = await request.json();
        const { to } = body;

        if (!to) {
            return NextResponse.json({ error: 'Email requis' }, { status: 400 });
        }

        const resend = getResend();

        const { data, error } = await resend.emails.send({
            from: 'Orphelia <noreply@orphelia.net>',
            to: [to],
            subject: '✓ Email de Test - Orphelia',
            html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #6366f1; margin-bottom: 20px;">Email de Test</h1>
          <p style="color: #374151; font-size: 16px; line-height: 1.6;">
            Félicitations ! Si vous recevez cet email, cela signifie que la configuration Resend fonctionne correctement.
          </p>
          <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #6b7280; font-size: 14px;">
              <strong>Date d'envoi:</strong> ${new Date().toLocaleString('fr-FR')}
            </p>
            <p style="margin: 8px 0 0; color: #6b7280; font-size: 14px;">
              <strong>Envoyé par:</strong> ${(session.user as any).email || 'Admin'}
            </p>
          </div>
          <p style="color: #6b7280; font-size: 14px;">
            Cet email a été envoyé depuis le panneau d'administration Orphelia.
          </p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
          <p style="color: #9ca3af; font-size: 12px; text-align: center;">
            © ${new Date().getFullYear()} Orphelia - Plateforme de réservation
          </p>
        </div>
      `,
        });

        if (error) {
            console.error('Resend error:', error);
            return NextResponse.json(
                { error: error.message || 'Erreur lors de l\'envoi' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Email envoyé avec succès',
            id: data?.id,
        });

    } catch (error: any) {
        console.error('Test email error:', error);
        return NextResponse.json(
            { error: error.message || 'Une erreur est survenue' },
            { status: 500 }
        );
    }
}
