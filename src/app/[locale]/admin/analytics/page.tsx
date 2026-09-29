import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { db } from '@/lib/db';
import { users, barbershops, bookings, reviews, barbers } from '@/lib/db/schema';
import { sql, desc, and, gte, lte, eq } from 'drizzle-orm';
import { BarChart3, TrendingUp, Users, Store, Calendar, DollarSign, Star, Activity } from 'lucide-react';
import { AnalyticsClient } from './client';
import { getSubscriptionPrice } from '@/lib/settings';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'admin' });

  return {
    title: t('systemAnalytics'),
    description: t('systemAnalyticsDesc'),
  };
}

export default async function SystemAnalyticsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect(`/${locale}/auth/signin`);
  }

  const userRole = (session.user as any).role;
  if (!['dev', 'admin'].includes(userRole)) {
    redirect(`/${locale}/profile`);
  }

  const now = new Date();
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
  const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  // User analytics
  const totalUsers = await db.select({ count: sql<number>`count(*)` }).from(users);
  const newUsersLastMonth = await db
    .select({ count: sql<number>`count(*)` })
    .from(users)
    .where(gte(users.createdAt, lastMonth));
  const newUsersLastWeek = await db
    .select({ count: sql<number>`count(*)` })
    .from(users)
    .where(gte(users.createdAt, lastWeek));

  // Barbershop analytics
  const totalBarbershops = await db.select({ count: sql<number>`count(*)` }).from(barbershops);
  const activeBarbershops = await db
    .select({ count: sql<number>`count(*)` })
    .from(barbershops)
    .where(eq(barbershops.isActive, true));
  const newBarbershopsLastMonth = await db
    .select({ count: sql<number>`count(*)` })
    .from(barbershops)
    .where(gte(barbershops.createdAt, lastMonth));

  // Booking analytics
  const totalBookings = await db.select({ count: sql<number>`count(*)` }).from(bookings);
  const bookingsLastMonth = await db
    .select({ count: sql<number>`count(*)` })
    .from(bookings)
    .where(gte(bookings.createdAt, lastMonth));
  const bookingsLastWeek = await db
    .select({ count: sql<number>`count(*)` })
    .from(bookings)
    .where(gte(bookings.createdAt, lastWeek));

  // Revenue analytics (based on active barbershops * subscription price)
  const subscriptionPrice = await getSubscriptionPrice();

  // Review analytics
  const totalReviews = await db.select({ count: sql<number>`count(*)` }).from(reviews);
  const avgRating = await db
    .select({ avg: sql<number>`AVG(${reviews.rating})` })
    .from(reviews);

  // Top performing barbershops
  const topBarbershops = await db
    .select({
      id: barbershops.id,
      name: barbershops.name,
      city: barbershops.city,
      rating: sql<string>`COALESCE(${barbershops.rating}, '0')`.as('rating'),
      reviewCount: sql<number>`COALESCE(${barbershops.reviewCount}, 0)`.as('review_count'),
      bookingCount: sql<number>`COUNT(${bookings.id})`.as('booking_count'),
    })
    .from(barbershops)
    .leftJoin(bookings, eq(barbershops.id, bookings.barbershopId))
    .groupBy(barbershops.id)
    .orderBy(desc(sql`booking_count`))
    .limit(10);

  // Recent activity - get recent items from each table separately
  const recentUsers = await db
    .select({
      type: sql<string>`'user'`.as('type'),
      name: users.name,
      createdAt: users.createdAt,
    })
    .from(users)
    .orderBy(desc(users.createdAt))
    .limit(7);

  const recentBarbershops = await db
    .select({
      type: sql<string>`'barbershop'`.as('type'),
      name: barbershops.name,
      createdAt: barbershops.createdAt,
    })
    .from(barbershops)
    .orderBy(desc(barbershops.createdAt))
    .limit(7);

  const recentBookings = await db
    .select({
      type: sql<string>`'booking'`.as('type'),
      name: sql<string>`'Réservation #' || SUBSTRING(${bookings.id}::text, 1, 8)`.as('name'),
      createdAt: bookings.createdAt,
    })
    .from(bookings)
    .orderBy(desc(bookings.createdAt))
    .limit(6);

  // Combine and sort all activities
  const recentActivity = [...recentUsers, ...recentBarbershops, ...recentBookings]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 20);

  const n = (rows: { count: number }[]) => Number(rows[0]?.count) || 0;
  const metrics = {
    totalUsers: n(totalUsers),
    newUsers30d: n(newUsersLastMonth),
    totalBarbershops: n(totalBarbershops),
    visibleBarbershops: n(activeBarbershops),
    newBarbershops30d: n(newBarbershopsLastMonth),
    totalBookings: n(totalBookings),
    bookings30d: n(bookingsLastMonth),
    bookings7d: n(bookingsLastWeek),
    monthlyRevenue: n(activeBarbershops) * subscriptionPrice,
    totalReviews: n(totalReviews),
    avgRating: Number(avgRating[0]?.avg) || 0,
  };

  return (
    <AnalyticsClient
      metrics={metrics}
      topBarbershops={topBarbershops as any}
      recentActivity={recentActivity as any}
      locale={locale}
    />
  );
}
