import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { CSVImportClient } from './client';

export default async function CSVImportPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect(`/${locale}/auth/signin`);
  }

  const userRole = (session.user as any)?.role;
  if (!['admin', 'dev'].includes(userRole)) {
    redirect(`/${locale}/my-space`);
  }

  return <CSVImportClient locale={locale} />;
}
