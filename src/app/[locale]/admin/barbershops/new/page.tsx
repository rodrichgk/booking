import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { Header } from '@/components/ui/header';
import { Footer } from '@/components/ui/footer';
import { AddBarbershopClient } from './client';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'admin' });
  
  return {
    title: 'Add Barbershop',
    description: 'Add a new barbershop to the platform',
  };
}

export default async function AddBarbershopPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect(`/${locale}/auth/signin`);
  }

  const userRole = (session.user as any).role;
  if (!['dev', 'admin'].includes(userRole)) {
    redirect(`/${locale}/profile`);
  }

  return (
    <>
      <Header />
      <AddBarbershopClient locale={locale} userRole={userRole} />
      <Footer />
    </>
  );
}
