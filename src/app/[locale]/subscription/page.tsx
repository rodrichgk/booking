import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { SubscriptionClient } from './client';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'subscription' });
  
  return {
    title: t('title'),
    description: t('description'),
  };
}

export default async function SubscriptionPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect(`/${locale}/auth/signin`);
  }

  const userRole = (session.user as any).role;
  const userEmail = session.user.email;

  return (
    <div className="min-h-screen bg-white">
      <SubscriptionClient 
        locale={locale}
        userEmail={userEmail || ''}
        userRole={userRole}
      />
    </div>
  );
}
