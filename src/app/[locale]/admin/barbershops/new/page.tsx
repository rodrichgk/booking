import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Header } from '@/components/ui/header';
import { Footer } from '@/components/ui/footer';
import { AddBarbershopClient } from './client';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const fr = locale === 'fr';

  return {
    title: fr ? 'Nouveau salon' : 'Add barbershop',
    description: fr ? 'Ajouter un salon à la plateforme' : 'Add a new barbershop to the platform',
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
    <div className="min-h-screen bg-gray-50">
      <Header />
      <AddBarbershopClient locale={locale} userRole={userRole} />
      <Footer />
    </div>
  );
}
