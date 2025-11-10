import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { Database, Download, RefreshCw, AlertTriangle, CheckCircle, Clock, HardDrive } from 'lucide-react';
import { DatabaseManagementClient } from './client';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'admin' });
  
  return {
    title: t('databaseManagement'),
    description: t('databaseManagementDesc'),
  };
}

export default async function DatabaseManagementPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect(`/${locale}/auth/signin`);
  }

  const userRole = (session.user as any).role;
  if (userRole !== 'dev') {
    redirect(`/${locale}/profile`);
  }

  // Simulate database stats (in real app, these would come from actual database queries)
  const dbStats = {
    totalSize: '2.4 GB',
    totalTables: 9,
    totalRecords: {
      users: 1234,
      barbershops: 56,
      bookings: 8942,
      reviews: 3421,
      sessions: 456,
    },
    lastBackup: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    nextBackup: new Date(Date.now() + 22 * 60 * 60 * 1000).toISOString(), // 22 hours from now
    backupStatus: 'success',
    connectionPool: {
      active: 5,
      idle: 15,
      max: 20,
    },
  };

  return (
    <div className="min-h-screen bg-white">
      <DatabaseManagementClient 
        dbStats={dbStats}
        locale={locale}
        currentUserRole={userRole}
      />
    </div>
  );
}
