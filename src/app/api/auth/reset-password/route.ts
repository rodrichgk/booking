import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq, and, gt } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { getPasswordMinLength } from '@/lib/settings';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { token, password } = body;

        if (!token || !password) {
            return NextResponse.json(
                { error: 'Token and password are required' },
                { status: 400 }
            );
        }

        // 1. Validate password strength (configurable in admin Settings > Security)
        const minLength = await getPasswordMinLength();
        if (password.length < minLength) {
            return NextResponse.json(
                { error: `Le mot de passe doit contenir au moins ${minLength} caractères` },
                { status: 400 }
            );
        }

        // 2. Find user with valid token and expiration
        const user = await db.query.users.findFirst({
            where: and(
                eq(users.resetPasswordToken, token),
                gt(users.resetPasswordExpires, new Date())
            ),
        });

        if (!user) {
            return NextResponse.json(
                { error: 'Invalid or expired token' },
                { status: 400 }
            );
        }

        // 3. Hash new password
        const hashedPassword = await bcrypt.hash(password, 10);

        // 4. Update user
        await db.update(users)
            .set({
                password: hashedPassword,
                resetPasswordToken: null,
                resetPasswordExpires: null,
            })
            .where(eq(users.id, user.id));

        return NextResponse.json({
            success: true,
            message: 'Password reset successfully',
        });

    } catch (error: any) {
        console.error('Reset password error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
