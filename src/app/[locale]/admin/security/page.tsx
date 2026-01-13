import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { db } from '@/lib/db';
import { sessions, securityLogs, blockedIps, users } from '@/lib/db/schema';
import { sql, desc, eq, gt } from 'drizzle-orm';
import { SecurityClient } from './client';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'admin' });

  return {
    title: t('security'),
    description: t('securityDesc'),
  };
}

export default async function SecurityPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect(`/${locale}/auth/signin`);
  }

  const userRole = (session.user as any).role;
  if (userRole !== 'dev') {
    redirect(`/${locale}/profile`);
  }

  // Fetch real security data from database
  let recentActivity: any[] = [];
  let totalLogins = 0;
  let failedLogins = 0;
  let activeSessions = 0;
  let blockedIPsList: any[] = [];
  let blockedIPsCount = 0;

  try {
    // Fetch recent security logs (last 50)
    const logs = await db
      .select({
        id: securityLogs.id,
        type: securityLogs.type,
        email: securityLogs.email,
        ip: securityLogs.ip,
        location: securityLogs.location,
        details: securityLogs.details,
        status: securityLogs.status,
        timestamp: securityLogs.createdAt,
        userId: securityLogs.userId,
      })
      .from(securityLogs)
      .orderBy(desc(securityLogs.createdAt))
      .limit(50);

    // Get user names for logs
    for (const log of logs) {
      let userName = 'Inconnu';
      if (log.userId) {
        const [user] = await db
          .select({ name: users.name })
          .from(users)
          .where(eq(users.id, log.userId))
          .limit(1);
        if (user) userName = user.name;
      }
      recentActivity.push({
        id: log.id,
        type: log.type,
        user: userName,
        email: log.email || undefined,
        action: log.details || undefined,
        ip: log.ip || 'N/A',
        location: log.location || 'Inconnu',
        timestamp: log.timestamp.toISOString(),
        status: log.status,
      });
    }

    // Count total logins (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const [loginCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(securityLogs)
      .where(sql`${securityLogs.type} = 'login' AND ${securityLogs.createdAt} > ${thirtyDaysAgo}`);
    totalLogins = Number(loginCount?.count) || 0;

    // Count failed logins (last 30 days)
    const [failedCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(securityLogs)
      .where(sql`${securityLogs.type} = 'failed_login' AND ${securityLogs.createdAt} > ${thirtyDaysAgo}`);
    failedLogins = Number(failedCount?.count) || 0;

    // Count active sessions (not expired)
    const now = new Date();
    const [sessionCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(sessions)
      .where(gt(sessions.expires, now));
    activeSessions = Number(sessionCount?.count) || 0;

    // Fetch blocked IPs
    const ips = await db
      .select()
      .from(blockedIps)
      .orderBy(desc(blockedIps.createdAt))
      .limit(20);
    blockedIPsList = ips.map(ip => ({
      ip: ip.ip,
      reason: ip.reason || 'Non spécifié',
      blockedAt: ip.createdAt.toISOString(),
    }));
    blockedIPsCount = ips.length;

  } catch (error) {
    console.error('Error fetching security data:', error);
    // Tables might not exist yet, continue with empty data
  }

  const securityData = {
    recentActivity,
    securityMetrics: {
      totalLogins,
      failedLogins,
      blockedIPs: blockedIPsCount,
      activeSessions,
      securityAlerts: failedLogins > 10 ? Math.floor(failedLogins / 10) : 0,
    },
    blockedIPs: blockedIPsList,
    securitySettings: {
      twoFactorRequired: false,
      ipWhitelist: false,
      sessionMonitoring: true,
      loginNotifications: false,
      bruteForceProtection: true,
    },
  };

  return (
    <div className="min-h-screen bg-white">
      <SecurityClient
        securityData={securityData}
        locale={locale}
        currentUserRole={userRole}
      />
    </div>
  );
}
