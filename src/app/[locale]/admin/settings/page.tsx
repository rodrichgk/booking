import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { Settings, Globe, CreditCard, Mail, Bell, Shield, Palette, Zap } from 'lucide-react';
import { SettingsClient } from './client';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'admin' });
  
  return {
    title: t('settings'),
    description: t('settingsDesc'),
  };
}

export default async function SettingsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect(`/${locale}/auth/signin`);
  }

  const userRole = (session.user as any).role;
  if (!['dev', 'admin'].includes(userRole)) {
    redirect(`/${locale}/profile`);
  }

  // System settings (in real app, these would come from a settings table)
  const systemSettings = {
    general: {
      siteName: 'AfroBook',
      siteUrl: 'https://afrobook.com',
      defaultLanguage: 'fr',
      timezone: 'Europe/Paris',
      maintenanceMode: false,
    },
    payment: {
      subscriptionPrice: 29.9,
      currency: 'EUR',
      paymentProvider: 'stripe',
      autoRenewal: true,
    },
    email: {
      smtpHost: 'smtp.afrobook.com',
      smtpPort: 587,
      senderEmail: 'noreply@afrobook.com',
      senderName: 'AfroBook',
    },
    notifications: {
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: true,
      bookingReminders: true,
    },
    security: {
      twoFactorAuth: true,
      sessionTimeout: 24,
      maxLoginAttempts: 5,
      passwordMinLength: 8,
    },
    appearance: {
      primaryColor: '#6366f1',
      darkMode: false,
      compactMode: false,
      featuredMode: 'manual' as const,
      featuredBarbershopIds: [] as string[],
    },
  };

  return (
    <div className="min-h-screen bg-white">
      <SettingsClient 
        settings={systemSettings}
        locale={locale}
        currentUserRole={userRole}
      />
    </div>
  );
}
