import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { Header } from '@/components/ui/header';
import { Footer } from '@/components/ui/footer';
import { AddShopClient } from './client';
import { getSubscriptionPrice } from '@/lib/settings';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'mySpace' });
  
  return {
    title: t('addShop'),
    description: t('createYourBarbershop'),
  };
}

export default async function AddShopPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect(`/${locale}/auth/signin`);
  }

  const subscriptionPrice = await getSubscriptionPrice();

  return (
    <>
      <Header />
      <AddShopClient locale={locale} subscriptionPrice={subscriptionPrice} />
      <Footer />
    </>
  );
}
