import { getTranslations } from 'next-intl/server';
import { db } from '@/lib/db';
import { barbershops } from '@/lib/db/schema';
import { eq, or, gt, and } from 'drizzle-orm';
import { BarbershopsClient } from './client';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'barbershop' });

  return {
    title: 'Barbershops - Find Your Perfect Salon',
    description: 'Discover expert barbershops specializing in afro and natural hair care',
  };
}

export default async function BarbershopsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const now = new Date();

  // Fetch barbershops with active subscriptions
  // A shop is valid if:
  // 1. subscriptionStatus is 'active' or 'trialing', OR
  // 2. subscriptionStatus is 'past_due' (grace period), OR
  // 3. currentPeriodEnd is in the future (even if status changed)
  const allBarbershops = await db
    .select({
      id: barbershops.id,
      name: barbershops.name,
      description: barbershops.description,
      address: barbershops.address,
      city: barbershops.city,
      phone: barbershops.phone,
      email: barbershops.email,
      website: barbershops.website,
      images: barbershops.images,
      rating: barbershops.rating,
      reviewCount: barbershops.reviewCount,
      isActive: barbershops.isActive,
      subscriptionStatus: barbershops.subscriptionStatus,
      currentPeriodEnd: barbershops.currentPeriodEnd,
      createdAt: barbershops.createdAt,
    })
    .from(barbershops)
    .where(
      and(
        eq(barbershops.isActive, true),
        or(
          eq(barbershops.subscriptionStatus, 'active'),
          eq(barbershops.subscriptionStatus, 'trialing'),
          eq(barbershops.subscriptionStatus, 'past_due'),
          gt(barbershops.currentPeriodEnd, now)
        )
      )
    );

  // Additional client-side filter for legacy shops (created < 30 days ago without subscription)
  // This maintains backwards compatibility during migration
  const validBarbershops = allBarbershops.filter(shop => {
    // If has currentPeriodEnd, check it's valid
    if (shop.currentPeriodEnd) {
      return new Date(shop.currentPeriodEnd) > now;
    }

    // Legacy: if no subscription data, fall back to 30-day createdAt check
    if (!shop.subscriptionStatus || shop.subscriptionStatus === 'inactive') {
      const createdDate = new Date(shop.createdAt);
      const daysSinceCreation = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
      return daysSinceCreation <= 30;
    }

    return true;
  });

  return <BarbershopsClient barbershops={validBarbershops as any} locale={locale} />;
}
