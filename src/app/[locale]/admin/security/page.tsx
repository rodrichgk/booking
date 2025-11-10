import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { Shield, AlertTriangle, Lock, Eye, Activity, Ban, CheckCircle } from 'lucide-react';
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

  // Security logs and data (in real app, these would come from security logs table)
  const securityData = {
    recentActivity: [
      {
        id: '1',
        type: 'login',
        user: 'Rodrich Gabhy KIBA',
        email: 'kibarodrich@gmail.com',
        ip: '192.168.1.53',
        location: 'Paris, France',
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        status: 'success',
      },
      {
        id: '2',
        type: 'role_change',
        user: 'Rodrich Gabhy KIBA',
        target: 'John Doe',
        action: 'Changed role from customer to barber',
        ip: '192.168.1.53',
        location: 'Paris, France',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        status: 'success',
      },
      {
        id: '3',
        type: 'failed_login',
        user: 'Unknown',
        email: 'test@example.com',
        ip: '185.220.101.182',
        location: 'Unknown',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        status: 'failed',
      },
    ],
    securityMetrics: {
      totalLogins: 1234,
      failedLogins: 45,
      blockedIPs: 12,
      activeSessions: 23,
      securityAlerts: 2,
    },
    blockedIPs: [
      { ip: '185.220.101.182', reason: 'Multiple failed attempts', blockedAt: new Date().toISOString() },
      { ip: '192.168.1.100', reason: 'Suspicious activity', blockedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() },
    ],
    securitySettings: {
      twoFactorRequired: true,
      ipWhitelist: false,
      sessionMonitoring: true,
      loginNotifications: true,
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
