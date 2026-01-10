import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { SubscriptionClient } from './client';
import { db } from '@/lib/db';
import { barbershops } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'subscription' });

  return {
    title: t('title'),
    description: t('description'),
  };
}

export default async function SubscriptionPage({
  params,
  searchParams
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ shopId?: string }>;
}) {
  const { locale } = await params;
  const { shopId } = await searchParams;
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect(`/${locale}/auth/signin`);
  }

  const userRole = (session.user as any).role;
  const userEmail = session.user.email;

  // Fetch shop data if shopId is provided
  let shopData = null;
  if (shopId) {
    const [shop] = await db
      .select({
        id: barbershops.id,
        name: barbershops.name,
        subscriptionStatus: barbershops.subscriptionStatus,
        currentPeriodEnd: barbershops.currentPeriodEnd,
        stripeCustomerId: barbershops.stripeCustomerId,
        stripeSubscriptionId: barbershops.stripeSubscriptionId,
        isActive: barbershops.isActive,
        createdAt: barbershops.createdAt,
      })
      .from(barbershops)
      .where(eq(barbershops.id, shopId));

    if (shop) {
      shopData = {
        id: shop.id,
        name: shop.name,
        subscriptionStatus: shop.subscriptionStatus || 'inactive',
        currentPeriodEnd: shop.currentPeriodEnd?.toISOString() || null,
        hasStripeSubscription: !!shop.stripeSubscriptionId,
        isActive: shop.isActive,
      };
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <SubscriptionClient
        locale={locale}
        userEmail={userEmail || ''}
        userRole={userRole}
        shopId={shopId}
        shopData={shopData}
      />
    </div>
  );
}
