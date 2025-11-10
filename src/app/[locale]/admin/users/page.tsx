import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { db } from '@/lib/db';
import { users, accounts, sessions } from '@/lib/db/schema';
import { eq, desc, and, ilike, sql } from 'drizzle-orm';
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

  // Fetch real user data with stats
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
      lastLogin: sql<string>`MAX(${sessions.expires})`.as('last_login'),
      provider: sql<string>`ARRAY_AGG(DISTINCT ${accounts.provider})`.as('providers'),
    })
    .from(users)
    .leftJoin(accounts, eq(users.id, accounts.userId))
    .leftJoin(sessions, eq(users.id, sessions.userId))
    .groupBy(users.id)
    .orderBy(desc(users.createdAt));

  // Get user statistics
  const totalUsers = allUsers.length;
  const devUsers = allUsers.filter(u => u.role === 'dev').length;
  const adminUsers = allUsers.filter(u => u.role === 'admin').length;
  const barberUsers = allUsers.filter(u => u.role === 'barber').length;
  const customerUsers = allUsers.filter(u => u.role === 'customer').length;
  const verifiedUsers = allUsers.filter(u => u.emailVerified).length;
  const usersThisMonth = allUsers.filter(u => {
    const createdAt = new Date(u.createdAt);
    const thisMonth = new Date();
    return createdAt.getMonth() === thisMonth.getMonth() && 
           createdAt.getFullYear() === thisMonth.getFullYear();
  }).length;

  const stats = [
    { label: 'Total', value: totalUsers, icon: 'Users', color: 'blue' },
    { label: 'Devs', value: devUsers, icon: 'Shield', color: 'red' },
    { label: 'Admins', value: adminUsers, icon: 'Crown', color: 'yellow' },
    { label: 'Barbers', value: barberUsers, icon: 'Scissors', color: 'green' },
    { label: 'Customers', value: customerUsers, icon: 'User', color: 'gray' },
    { label: 'Verified', value: verifiedUsers, icon: 'Users', color: 'emerald' },
    { label: 'This Month', value: usersThisMonth, icon: 'Users', color: 'indigo' },
  ];

  return (
    <div className="min-h-screen bg-white">
      <UserManagementClient 
        initialUsers={allUsers as any}
        initialStats={stats as any}
        locale={locale}
        currentUserRole={userRole}
      />
    </div>
  );
}
