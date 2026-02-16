import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const email = searchParams.get('email');
        const password = searchParams.get('password');
        const secret = searchParams.get('secret');

        if (secret !== 'debug-2026') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        if (!email || !password) {
            return NextResponse.json({ error: 'Missing email or password' }, { status: 400 });
        }

        // Exact logic from lib/auth.ts
        const safeSelect = {
            id: users.id,
            email: users.email,
            password: users.password,
            name: users.name,
            role: users.role,
            image: users.image,
        };

        console.log('[DebugAuth] Querying user:', email);

        const user = await db
            .select(safeSelect)
            .from(users)
            .where(eq(users.email, email))
            .limit(1);

        if (!user.length) {
            return NextResponse.json({
                success: false,
                step: 'user_lookup',
                message: 'User not found in database',
            });
        }

        const dbUser = user[0];
        console.log('[DebugAuth] User found:', dbUser.id);
        console.log('[DebugAuth] Hash prefix:', dbUser.password?.substring(0, 7));

        if (!dbUser.password) {
            return NextResponse.json({
                success: false,
                step: 'password_check',
                message: 'User has no password hash (likely Google auth only)',
                user: { id: dbUser.id, role: dbUser.role, email: dbUser.email }
            });
        }

        const isPasswordValid = await bcrypt.compare(password, dbUser.password);

        if (!isPasswordValid) {
            // Debugging hash mismatch
            const testHash = await bcrypt.hash(password, 10);
            return NextResponse.json({
                success: false,
                step: 'password_comparison',
                message: 'Password does not match hash',
                debug: {
                    providedPasswordLength: password.length,
                    storedHashLength: dbUser.password.length,
                    storedHashPrefix: dbUser.password.substring(0, 10),
                    newHashExample: testHash.substring(0, 10) + '...',
                },
                user: { id: dbUser.id, role: dbUser.role, email: dbUser.email }
            });
        }

        return NextResponse.json({
            success: true,
            step: 'complete',
            message: 'Login should succeed',
            user: {
                id: dbUser.id,
                role: dbUser.role,
                email: dbUser.email,
                name: dbUser.name
            }
        });

    } catch (error: any) {
        console.error('[DebugAuth] Error:', error);
        return NextResponse.json({
            success: false,
            step: 'error',
            error: error.message || String(error)
        }, { status: 500 });
    }
}
