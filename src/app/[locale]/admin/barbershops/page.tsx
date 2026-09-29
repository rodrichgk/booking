import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { db } from '@/lib/db';
import { barbershops, users, barbers } from '@/lib/db/schema';
import { eq, desc, and, ilike, sql } from 'drizzle-orm';
import { Store, Search, Filter, DollarSign, CheckCircle, XCircle, Clock, Star } from 'lucide-react';
import { BarbershopManagementClient } from './client';
import { getSubscriptionPrice } from '@/lib/settings';

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

  // STRICT: Only dev and admin can access this page
  // Shop owners, barbers, and customers should use /my-space instead
  if (userRole !== 'dev' && userRole !== 'admin') {
    redirect(`/${locale}/my-space`);
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
      // Use actual database subscription fields
      subscriptionStatus: sql<string>`
        CASE 
          WHEN COALESCE(${barbershops.subscriptionStatus}, 'inactive') = 'active' 
               AND (${barbershops.currentPeriodEnd} IS NULL OR ${barbershops.currentPeriodEnd} > NOW()) THEN 'active'
          WHEN COALESCE(${barbershops.subscriptionStatus}, 'inactive') = 'canceled' THEN 'canceled'
          WHEN COALESCE(${barbershops.subscriptionStatus}, 'inactive') = 'past_due' THEN 'past_due'
          WHEN ${barbershops.currentPeriodEnd} IS NOT NULL AND ${barbershops.currentPeriodEnd} < NOW() THEN 'expired'
          WHEN ${barbershops.isActive} = false THEN 'inactive'
          WHEN ${barbershops.createdAt} < NOW() - INTERVAL '1 month' AND ${barbershops.currentPeriodEnd} IS NULL THEN 'expired'
          ELSE 'active'
        END
      `.as('subscription_status'),
      subscriptionExpiry: sql<string>`
        COALESCE(
          ${barbershops.currentPeriodEnd}::text,
          (${barbershops.createdAt} + INTERVAL '1 month')::text
        )
      `.as('subscription_expiry'),
      // Also fetch raw fields for debugging
      dbSubscriptionStatus: barbershops.subscriptionStatus,
      dbCurrentPeriodEnd: barbershops.currentPeriodEnd,
    })
    .from(barbershops)
    .leftJoin(users, eq(barbershops.ownerId, users.id))
    .leftJoin(barbers, and(eq(barbershops.id, barbers.barbershopId), eq(barbers.isActive, true)))
    .groupBy(barbershops.id, users.id)
    .orderBy(desc(barbershops.createdAt));

  const subscriptionPrice = await getSubscriptionPrice();

  return (
    <BarbershopManagementClient
      initialBarbershops={allBarbershops as any}
      locale={locale}
      currentUserRole={userRole}
      subscriptionPrice={subscriptionPrice}
    />
  );
}
