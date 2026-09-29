import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { blockedIps, securityLogs } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { clearBlockedIpCache, getClientIp } from '@/lib/security';

// Block an IP (admin only)
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
        }

        const userRole = (session.user as any).role;
        if (!['dev', 'admin'].includes(userRole)) {
            return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
        }

        const userId = (session.user as any).id;
        const body = await request.json();
        const { ip, reason, expiresAt } = body;

        if (!ip) {
            return NextResponse.json({ error: 'IP requise' }, { status: 400 });
        }

        // Blocking your own address would lock you out of the admin.
        if (ip === getClientIp(request.headers)) {
            return NextResponse.json({ error: 'Vous ne pouvez pas bloquer votre propre adresse IP' }, { status: 400 });
        }

        // Check if IP already blocked
        const [existing] = await db
            .select()
            .from(blockedIps)
            .where(eq(blockedIps.ip, ip))
            .limit(1);

        if (existing) {
            return NextResponse.json({ error: 'Cette IP est déjà bloquée' }, { status: 400 });
        }

        // Block the IP
        const [blocked] = await db
            .insert(blockedIps)
            .values({
                ip,
                reason: reason || 'Bloqué manuellement',
                blockedBy: userId,
                expiresAt: expiresAt ? new Date(expiresAt) : null,
            })
            .returning();
        clearBlockedIpCache();

        // Log the action
        await db.insert(securityLogs).values({
            userId,
            type: 'ip_blocked',
            ip,
            details: `IP bloquée: ${ip} - Raison: ${reason || 'Non spécifiée'}`,
            status: 'success',
        });

        return NextResponse.json({
            success: true,
            message: 'IP bloquée avec succès',
            blocked,
        });
    } catch (error) {
        console.error('Error blocking IP:', error);
        return NextResponse.json(
            { error: 'Erreur lors du blocage de l\'IP' },
            { status: 500 }
        );
    }
}

// Get blocked IPs (admin only)
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

        const ips = await db
            .select()
            .from(blockedIps)
            .orderBy(desc(blockedIps.createdAt));

        return NextResponse.json({ blockedIps: ips });
    } catch (error) {
        console.error('Error fetching blocked IPs:', error);
        return NextResponse.json(
            { error: 'Erreur lors de la récupération des IPs bloquées' },
            { status: 500 }
        );
    }
}

// Unblock an IP (admin only)
export async function DELETE(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
        }

        const userRole = (session.user as any).role;
        if (!['dev', 'admin'].includes(userRole)) {
            return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
        }

        const userId = (session.user as any).id;
        const { searchParams } = new URL(request.url);
        const ip = searchParams.get('ip');

        if (!ip) {
            return NextResponse.json({ error: 'IP requise' }, { status: 400 });
        }

        // Remove the IP from blocked list
        await db.delete(blockedIps).where(eq(blockedIps.ip, ip));
        clearBlockedIpCache();

        // Log the action
        await db.insert(securityLogs).values({
            userId,
            type: 'ip_unblocked',
            ip,
            details: `IP débloquée: ${ip}`,
            status: 'success',
        });

        return NextResponse.json({
            success: true,
            message: 'IP débloquée avec succès',
        });
    } catch (error) {
        console.error('Error unblocking IP:', error);
        return NextResponse.json(
            { error: 'Erreur lors du déblocage de l\'IP' },
            { status: 500 }
        );
    }
}
