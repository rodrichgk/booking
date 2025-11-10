import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { db } from '@/lib/db';
import { barbershops, users, barbers } from '@/lib/db/schema';
import { eq, desc, and, ilike, sql } from 'drizzle-orm';
import { Store, Search, Filter, DollarSign, CheckCircle, XCircle, Clock, Star } from 'lucide-react';
import { BarbershopManagementClient } from './client';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'admin' });
  
  return {
    title: t('barbershopManagement'),
    description: t('barbershopManagementDesc'),
  };
}

export default async function BarbershopManagementPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect(`/${locale}/auth/signin`);
  }

  const userRole = (session.user as any).role;
  if (!['dev', 'admin'].includes(userRole)) {
    redirect(`/${locale}/profile`);
  }

  // Fetch real barbershop data with owner info
  const allBarbershops = await db
    .select({
      id: barbershops.id,
      name: barbershops.name,
      description: sql<string>`COALESCE(${barbershops.description}, '')`.as('description'),
      address: barbershops.address,
      city: barbershops.city,
      phone: sql<string>`COALESCE(${barbershops.phone}, '')`.as('phone'),
      email: sql<string>`COALESCE(${barbershops.email}, '')`.as('email'),
      website: sql<string>`COALESCE(${barbershops.website}, '')`.as('website'),
      rating: sql<string>`COALESCE(${barbershops.rating}, '0')`.as('rating'),
      reviewCount: sql<number>`COALESCE(${barbershops.reviewCount}, 0)`.as('review_count'),
      isActive: sql<boolean>`COALESCE(${barbershops.isActive}, false)`.as('is_active'),
      createdAt: sql<string>`${barbershops.createdAt}::text`.as('created_at'),
      ownerName: users.name,
      ownerEmail: users.email,
      ownerPhone: sql<string>`COALESCE(${users.phone}, '')`.as('owner_phone'),
      barberCount: sql<number>`COUNT(${barbers.id})`.as('barber_count'),
      subscriptionStatus: sql<string>`
        CASE 
          WHEN ${barbershops.isActive} = false THEN 'inactive'
          WHEN ${barbershops.createdAt} < NOW() - INTERVAL '1 month' THEN 'expired'
          ELSE 'active'
        END
      `.as('subscription_status'),
      subscriptionExpiry: sql<string>`
        (${barbershops.createdAt} + INTERVAL '1 month')::text
      `.as('subscription_expiry'),
    })
    .from(barbershops)
    .leftJoin(users, eq(barbershops.ownerId, users.id))
    .leftJoin(barbers, eq(barbershops.id, barbers.barbershopId))
    .groupBy(barbershops.id, users.id)
    .orderBy(desc(barbershops.createdAt));

  // Get barbershop statistics
  const totalBarbershops = allBarbershops.length;
  const activeBarbershops = allBarbershops.filter(b => b.isActive).length;
  const pendingBarbershops = allBarbershops.filter(b => !b.isActive).length;
  const expiredBarbershops = allBarbershops.filter(b => 
    new Date(b.createdAt) < new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  ).length;
  const avgRating = allBarbershops.reduce((acc, b) => acc + (parseFloat(b.rating as string) || 0), 0) / totalBarbershops || 0;
  // Get accurate barber count (excluding guest placeholder)
  const totalBarbers = allBarbershops.reduce((acc, b) => acc + (parseInt(String(b.barberCount)) || 0), 0) - 1; // -1 to exclude guest placeholder
  const monthlyRevenue = activeBarbershops * 29.9;

  const stats = [
    { label: 'Total', value: totalBarbershops, icon: 'Store', color: 'blue' },
    { label: 'Active', value: activeBarbershops, icon: 'CheckCircle', color: 'green' },
    { label: 'Pending', value: pendingBarbershops, icon: 'Clock', color: 'yellow' },
    { label: 'Expired', value: expiredBarbershops, icon: 'XCircle', color: 'red' },
    { label: 'Total Barbers', value: totalBarbers, icon: 'Store', color: 'purple' },
    { label: 'Avg Rating', value: avgRating.toFixed(1), icon: 'Star', color: 'yellow' },
    { label: 'Monthly Revenue', value: `€${monthlyRevenue.toFixed(0)}`, icon: 'DollarSign', color: 'green' },
  ];

  return (
    <div className="min-h-screen bg-white">
      <BarbershopManagementClient 
        initialBarbershops={allBarbershops as any}
        initialStats={stats as any}
        locale={locale}
        currentUserRole={userRole}
      />
    </div>
  );
}
