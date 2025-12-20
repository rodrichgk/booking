import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { users, verificationTokens } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';
import { Resend } from 'resend';

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
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const email = body.email || session.user.email;
    const name = body.name || session.user.name || 'Utilisateur';

    // Check if user exists and is not already verified
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    if (user.emailVerified) {
      return NextResponse.json(
        { error: 'Email déjà vérifié' },
        { status: 400 }
      );
    }

    // Delete any existing verification tokens for this email
    await db
      .delete(verificationTokens)
      .where(eq(verificationTokens.identifier, email));

    // Generate new verification token
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create verification token
    await db
      .insert(verificationTokens)
      .values({
        identifier: email,
        token,
        expires,
      });

    // Send email
    const baseUrl = process.env.NEXTAUTH_URL || 'https://www.orphelia.net';
    const verificationUrl = `${baseUrl}/fr/auth/verify-email?token=${token}&email=${encodeURIComponent(email)}`;

    const resend = getResend();
    await resend.emails.send({
      from: 'Orphelia <onboarding@resend.dev>',
      to: email,
      subject: 'Vérifiez votre adresse email - Orphelia',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5; margin: 0; padding: 40px 20px;">
          <div style="max-width: 560px; margin: 0 auto; background-color: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <div style="background: linear-gradient(135deg, #FFD700, #B8860B); padding: 40px 20px; text-align: center;">
              <div style="width: 60px; height: 60px; background-color: white; border-radius: 50%; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center;">
                <span style="font-size: 32px; font-weight: bold; color: #B8860B;">O</span>
              </div>
              <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 600;">Orphelia</h1>
            </div>
            <div style="padding: 40px 30px;">
              <h2 style="color: #1a1a2e; margin: 0 0 16px; font-size: 20px;">Bonjour ${name} ! 👋</h2>
              <p style="color: #4b5563; line-height: 1.6; margin: 0 0 24px;">
                Vous avez demandé un nouveau lien de vérification. Pour activer votre compte et accéder à toutes les fonctionnalités, veuillez cliquer sur le bouton ci-dessous.
              </p>
              <div style="text-align: center; margin: 32px 0;">
                <a href="${verificationUrl}" style="display: inline-block; background: linear-gradient(135deg, #FFD700, #B8860B); color: #1a1a2e; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
                  Vérifier mon email
                </a>
              </div>
              <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 24px 0 0;">
                Ce lien expire dans 24 heures. Si vous n'avez pas demandé ce lien, vous pouvez ignorer cet email.
              </p>
            </div>
            <div style="background-color: #f9fafb; padding: 20px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                © ${new Date().getFullYear()} Orphelia. Tous droits réservés.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    return NextResponse.json({
      success: true,
      message: 'Email de vérification envoyé',
    });
  } catch (error: any) {
    console.error('Error resending verification email:', error);
    return NextResponse.json(
      { error: error.message || 'Une erreur est survenue' },
      { status: 500 }
    );
  }
}
