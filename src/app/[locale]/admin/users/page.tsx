import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { desc } from 'drizzle-orm';
import { Users, Search, Filter, MoreVertical, Shield, Crown, Scissors, User } from 'lucide-react';
import { UserManagementClient } from './client';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'admin' });
  
  return {
    title: t('userManagement'),
    description: t('userManagementDesc'),
  };
}

export default async function UserManagementPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect(`/${locale}/auth/signin`);
  }

  const userRole = (session.user as any).role;
  if (!['dev', 'admin'].includes(userRole)) {
    redirect(`/${locale}/profile`);
  }

  // Only the `user` table is queried: the NextAuth `accounts`/`sessions` tables
  // don't exist in production (sessions are JWT-based), so joining them crashes.
  const allUsers = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      phone: users.phone,
      role: users.role,
      image: users.image,
      emailVerified: users.emailVerified,
      createdAt: users.createdAt,
    })
    .from(users)
    .orderBy(desc(users.createdAt));

  return (
    <UserManagementClient
      initialUsers={allUsers as any}
      locale={locale}
      currentUserRole={userRole}
    />
  );
}
