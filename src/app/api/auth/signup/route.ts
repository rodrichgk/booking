import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { db } from '@/lib/db';
import { users, verificationTokens } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { Resend } from 'resend';
import { getEmailFrom, getPasswordMinLength } from '@/lib/settings';
import { getClientIp, isIpBlocked, logSecurityEvent } from '@/lib/security';
import { escapeHtml } from '@/lib/utils';

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

const signUpSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  username: z.string().min(3, 'Username must be at least 3 characters').regex(/^[a-zA-Z0-9_.-]+$/, 'Username can only contain letters, numbers, dots, hyphens and underscores').optional(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().optional(),
  role: z.enum(['customer', 'barber']).default('customer'),
});

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request.headers);
    if (await isIpBlocked(ip)) {
      await logSecurityEvent({ type: 'blocked_request', ip, userAgent: request.headers.get('user-agent'), details: 'Inscription refusée : IP bloquée', status: 'failed' });
      return NextResponse.json({ error: 'Les inscriptions depuis votre réseau sont bloquées.' }, { status: 403 });
    }

    const body = await request.json();
    
    // Validate input
    const validatedData = signUpSchema.parse(body);
    const { name, email, username, password, phone, role } = validatedData;

    // Minimum length is configurable in admin Settings > Security
    const minLength = await getPasswordMinLength();
    if (password.length < minLength) {
      return NextResponse.json(
        { error: `Le mot de passe doit contenir au moins ${minLength} caractères` },
        { status: 400 }
      );
    }

    // Check if user already exists by email
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: 'Un compte avec cet email existe déjà' },
        { status: 400 }
      );
    }

    // Check if username already taken
    if (username) {
      const existingUsername = await db
        .select()
        .from(users)
        .where(eq(users.username, username))
        .limit(1);

      if (existingUsername.length > 0) {
        return NextResponse.json(
          { error: 'Ce nom d\'utilisateur est déjà pris' },
          { status: 400 }
        );
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const newUser = await db
      .insert(users)
      .values({
        name,
        email,
        username: username || undefined,
        password: hashedPassword,
        phone,
        role,
      })
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
      });

    // Send verification email
    try {
      // Generate verification token
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

      // Send email - always use production URL for verification links
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.orphelia.net';
      const verificationUrl = `${baseUrl}/fr/auth/verify-email?token=${token}&email=${encodeURIComponent(email)}`;

      const resend = getResend();
      await resend.emails.send({
        from: await getEmailFrom(),
        to: email,
        subject: 'Vérifiez votre adresse email - Orphelia',
        html: `
          <!DOCTYPE html>
<html lang="fr" xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="x-apple-disable-message-reformatting">
  <title>Vérification Email Orphelia</title>
  <style>
    table, td, div, h1, p {font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;}
    
    /* Reset styles */
    body {margin: 0; padding: 0; word-spacing: normal; background-color: #f9fafb;}
    table {border-collapse: collapse;}
    
    /* Mobile styles */
    @media screen and (max-width: 530px) {
      .col-lge {max-width: 100% !important;}
      .content-padding {padding: 30px 20px !important;}
    }
  </style>
</head>
<body style="margin:0;padding:0;word-spacing:normal;background-color:#f9fafb;">
  
  <div role="article" aria-roledescription="email" lang="fr" style="text-size-adjust:100%;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;background-color:#f9fafb;">
    <table role="presentation" style="width:100%;border:none;border-spacing:0;">
      <tr>
        <td align="center" style="padding:40px 0;">
          
          <table role="presentation" style="width:94%;max-width:550px;border:none;border-spacing:0;text-align:left;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:16px;line-height:22px;color:#363636;">
            
            <tr>
              <td style="padding:0 0 20px 0;text-align:center;">
                <div style="display:inline-block;width:48px;height:48px;line-height:48px;border-radius:50%;background-color:#1a1a2e;color:#D4AF37;font-size:24px;font-weight:bold;text-align:center;">
                  O
                </div>
                <div style="margin-top:8px;font-size:14px;font-weight:600;letter-spacing:1px;color:#1a1a2e;text-transform:uppercase;">
                  Orphelia
                </div>
              </td>
            </tr>

            <tr>
              <td class="content-padding" style="padding:45px 40px;background-color:#ffffff;border-radius:12px;box-shadow: 0 4px 20px rgba(0,0,0,0.05);border:1px solid #eeeeee;">
                
                <h1 style="margin-top:0;margin-bottom:16px;font-size:24px;font-weight:700;color:#111111;text-align:center;">
                  Vérifiez votre email
                </h1>
                
                <p style="margin:0 0 20px 0;color:#555555;text-align:center;">
                  Bienvenue, <strong>${escapeHtml(name)}</strong> !
                </p>
                
                <p style="margin:0 0 30px 0;color:#555555;line-height:1.6;text-align:center;">
                  Merci de rejoindre Orphelia. Pour garantir la sécurité de votre compte et accéder à nos services exclusifs, veuillez valider votre adresse email.
                </p>

                <table role="presentation" style="margin:0 auto;border-spacing:0;border-collapse:separate;width:auto;">
                  <tr>
                    <td style="border-radius:6px;background-color:#1a1a2e;text-align:center;">
                      <a href="${verificationUrl}" target="_blank" style="background-color:#1a1a2e;border:1px solid #1a1a2e;border-radius:6px;color:#ffffff;display:inline-block;font-size:16px;font-weight:600;line-height:48px;padding:0 32px;text-align:center;text-decoration:none;width:auto;">
                        <span style="color:#D4AF37;">Vérifier mon email</span>
                      </a>
                    </td>
                  </tr>
                </table>

                <p style="margin:30px 0 0 0;font-size:13px;color:#888888;text-align:center;">
                  Ce lien est valide pendant 24 heures.
                </p>

              </td>
            </tr>

            <tr>
              <td style="padding:24px;text-align:center;font-size:12px;color:#999999;">
                <p style="margin:0 0 8px 0;">
                  Si vous n'avez pas créé de compte, vous pouvez ignorer cet email.
                </p>
                <p style="margin:0;">
                  © ${new Date().getFullYear()} Orphelia. Tous droits réservés.
                </p>
              </td>
            </tr>

          </table>
          
          </td>
      </tr>
    </table>
  </div>
</body>
</html>
        `,
      });
    } catch (emailError) {
      console.error('Error sending verification email:', emailError);
      // Don't fail the signup if email fails, user can request new verification
    }

    await logSecurityEvent({ type: 'signup', email, userId: newUser[0].id, ip, userAgent: request.headers.get('user-agent'), details: 'Création de compte' });

    return NextResponse.json(
      {
        message: 'Compte créé avec succès. Veuillez vérifier votre email.',
        user: newUser[0],
        emailSent: true,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Sign-up error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
