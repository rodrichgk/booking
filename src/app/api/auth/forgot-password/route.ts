import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { Resend } from 'resend';
import crypto from 'crypto';

// Lazy initialization of Resend
let resendInstance: Resend | null = null;
function getResend() {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
        console.error('RESEND_API_KEY is missing');
        return null;
    }
    if (!resendInstance) {
        resendInstance = new Resend(apiKey);
    }
    return resendInstance;
}

export async function POST(request: NextRequest) {
    try {
        const { email } = await request.json();

        if (!email) {
            return NextResponse.json(
                { error: 'Email required' },
                { status: 400 }
            );
        }

        // 1. Check if user exists
        const user = await db.query.users.findFirst({
            where: eq(users.email, email),
        });

        if (!user) {
            // Don't reveal that user doesn't exist for security
            return NextResponse.json({
                success: true,
                message: 'If an account exists with this email, you will receive a reset link.',
            });
        }

        // 2. Generate reset token
        const token = crypto.randomBytes(32).toString('hex');
        const expires = new Date();
        expires.setHours(expires.getHours() + 1); // Token valid for 1 hour

        // 3. Save token to DB
        await db.update(users)
            .set({
                resetPasswordToken: token,
                resetPasswordExpires: expires,
            })
            .where(eq(users.id, user.id));

        // 4. Send email
        const resend = getResend();
        if (resend) {
            const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${token}`;

            await resend.emails.send({
                from: 'Orphelia <onboarding@resend.dev>', // Update with your sender
                to: email,
                subject: 'Réinitialisation de votre mot de passe - Orphelia',
                html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #ea580c;">Réinitialisation de mot de passe</h1>
            <p>Bonjour ${user.name},</p>
            <p>Vous avez demandé la réinitialisation de votre mot de passe pour votre compte Orphelia.</p>
            <p>Cliquez sur le lien ci-dessous pour choisir un nouveau mot de passe :</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetLink}" style="background-color: #ea580c; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Réinitialiser mon mot de passe</a>
            </div>
            <p>Ce lien est valide pour 1 heure.</p>
            <p>Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet email.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            <p style="color: #666; font-size: 12px;">Si le bouton ne fonctionne pas, copiez-collez ce lien dans votre navigateur :<br>${resetLink}</p>
          </div>
        `,
            });
        } else {
            console.error("Resend client could not be initialized. Email not sent.");
        }

        return NextResponse.json({
            success: true,
            message: 'If an account exists with this email, you will receive a reset link.',
        });

    } catch (error: any) {
        console.error('Forgot password error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
