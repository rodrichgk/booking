import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { sessions } from '@/lib/db/schema';
import { lt } from 'drizzle-orm';

export async function POST() {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userRole = (session.user as any).role;
        if (userRole !== 'dev') {
            return NextResponse.json({ error: 'Forbidden - Dev only' }, { status: 403 });
        }

        // Delete expired sessions (sessions older than 24 hours)
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

        const result = await db
            .delete(sessions)
            .where(lt(sessions.expires, oneDayAgo));

        return NextResponse.json({
            success: true,
            message: 'Sessions expirées supprimées',
            deleted: 0, // Drizzle doesn't return count for delete
        });

    } catch (error: any) {
        console.error('Clear sessions error:', error);
        return NextResponse.json(
            { error: 'Failed to clear sessions', details: error.message },
            { status: 500 }
        );
    }
}
