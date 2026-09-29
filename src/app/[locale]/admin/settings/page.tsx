import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { db } from '@/lib/db';
import { siteSettings } from '@/lib/db/schema';
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

  // Default settings
  const defaultSettings = {
    general: {
      siteName: 'Orphelia',
      siteUrl: 'https://www.orphelia.net',
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
      smtpHost: 'smtp.orphelia.net',
      smtpPort: 587,
      senderEmail: 'noreply@orphelia.net',
      senderName: 'Orphelia',
    },
    notifications: {
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: true,
      bookingReminders: true,
    },
    security: {
      twoFactorAuth: false,
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

  // Load settings from database
  try {
    const dbSettings = await db.select().from(siteSettings);

    // Merge database settings with defaults
    for (const setting of dbSettings) {
      const key = setting.key as keyof typeof defaultSettings;
      if (key in defaultSettings && setting.value) {
        (defaultSettings as any)[key] = setting.value;
      }
    }
  } catch (error) {
    console.error('Error loading settings from database:', error);
    // Continue with default settings
  }

  return (
    <>
      <SettingsClient
        settings={defaultSettings}
        locale={locale}
        currentUserRole={userRole}
      />
    </>
  );
}
