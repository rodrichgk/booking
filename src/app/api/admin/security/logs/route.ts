import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { securityLogs, blockedIps } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';

// Log a security event
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { type, email, ip, userAgent, location, details, status, userId } = body;

        if (!type) {
            return NextResponse.json({ error: 'Type is required' }, { status: 400 });
        }

        // Insert security log
        const [log] = await db
            .insert(securityLogs)
            .values({
                userId: userId || null,
                type,
                email: email || null,
                ip: ip || null,
                userAgent: userAgent || null,
                location: location || null,
                details: details || null,
                status: status || 'success',
            })
            .returning();

        return NextResponse.json({
            success: true,
            message: 'Security event logged',
            log,
        });
    } catch (error) {
        console.error('Error logging security event:', error);
        return NextResponse.json(
            { error: 'Failed to log security event' },
            { status: 500 }
        );
    }
}

// Get security logs (admin only)
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
        }

        const userRole = (session.user as any).role;
        if (!['dev', 'admin'].includes(userRole)) {
            return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '50');
        const type = searchParams.get('type');

        let logs;
        if (type && type !== 'all') {
            logs = await db
                .select()
                .from(securityLogs)
                .where(eq(securityLogs.type, type))
                .orderBy(desc(securityLogs.createdAt))
                .limit(limit);
        } else {
            logs = await db
                .select()
                .from(securityLogs)
                .orderBy(desc(securityLogs.createdAt))
                .limit(limit);
        }

        return NextResponse.json({ logs });
    } catch (error) {
        console.error('Error fetching security logs:', error);
        return NextResponse.json(
            { error: 'Failed to fetch security logs' },
            { status: 500 }
        );
    }
}
