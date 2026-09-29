import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import Image from 'next/image';
import Link from 'next/link';
import { Users, Calendar, Settings, BarChart3, Store, Shield, Database, ArrowRight, TrendingUp, Video, MessageSquare } from 'lucide-react';
import { Badge, StatGrid, Stat, formatEuro } from '@/components/dashboard/ui';
import { Header } from '@/components/ui/header';
import { Footer } from '@/components/ui/footer';
import { db } from '@/lib/db';
import { barbershops, users, barbers, bookings, services } from '@/lib/db';
import { eq, sql, and, gte, desc, lt } from 'drizzle-orm';
import { MySpaceClient } from './client';
import { BarberSpaceClient } from './barber-client';
import { EmailVerificationBanner } from '@/components/email-verification-banner';
import { getSubscriptionPrice } from '@/lib/settings';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'mySpace' });

  return {
    title: t('title'),
    description: t('description'),
  };
}

export default async function MySpacePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect(`/${locale}/auth/signin`);
  }

  const { user } = session;
  const userRole = (user as any).role || 'customer';
  const userEmail = session.user.email;

  // Fetch user's email verification status
  const currentUser = await db
    .select({
      id: users.id,
      emailVerified: users.emailVerified,
    })
    .from(users)
    .where(eq(users.email, userEmail || ''))
    .limit(1);

  const isEmailVerified = currentUser[0]?.emailVerified !== null;

  // Define today for use across different role checks
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Initialize stats object (only fetch if user is admin or dev)
  let stats = {
    totalUsers: 0,
    totalBarbershops: 0,
    totalBarbers: 0,
    bookingsToday: 0,
    totalBookings: 0,
    activeBarbershops: 0,
    monthlyRevenue: '0.00',
    avgRating: '0.0',
  };

  // Fetch subscription price (needed for all roles)
  const subscriptionPrice = await getSubscriptionPrice();

  // ONLY fetch admin/dev statistics if user has admin or dev role
  if (userRole === 'admin' || userRole === 'dev') {
    // Fetch real statistics for admin/dev ONLY
    const totalUsers = await db.select({ count: sql<number>`COUNT(*)` }).from(users);
    const totalBarbershops = await db.select({ count: sql<number>`COUNT(*)` }).from(barbershops);
    const totalBarbers = await db.select({ count: sql<number>`COUNT(*)` }).from(barbers).where(and(sql`user_id != '00000000-0000-0000-0000-000000000000'`, eq(barbers.isActive, true)));

    // Bookings today (bounded to today; a bare ">= today" also counted every future booking)
    const bookingsToday = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(bookings)
      .where(and(
        gte(bookings.startTime, today),
        lt(bookings.startTime, new Date(today.getTime() + 24 * 60 * 60 * 1000))
      ));

    // Total bookings
    const totalBookings = await db.select({ count: sql<number>`COUNT(*)` }).from(bookings);

    // Active barbershops
    const activeBarbershops = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(barbershops)
      .where(eq(barbershops.isActive, true));

    // Calculate monthly revenue (active shops * subscription price)
    const monthlyRevenue = (parseInt(String(activeBarbershops[0]?.count || 0)) * subscriptionPrice).toFixed(2);

    // Average rating
    const avgRatingResult = await db
      .select({ avg: sql<number>`AVG(CAST(${barbershops.rating} AS DECIMAL))` })
      .from(barbershops)
      .where(sql`${barbershops.rating} IS NOT NULL`);

    stats = {
      totalUsers: parseInt(String(totalUsers[0]?.count || 0)),
      totalBarbershops: parseInt(String(totalBarbershops[0]?.count || 0)),
      totalBarbers: parseInt(String(totalBarbers[0]?.count || 0)),
      bookingsToday: parseInt(String(bookingsToday[0]?.count || 0)),
      totalBookings: parseInt(String(totalBookings[0]?.count || 0)),
      activeBarbershops: parseInt(String(activeBarbershops[0]?.count || 0)),
      monthlyRevenue,
      avgRating: parseFloat(String(avgRatingResult[0]?.avg || 0)).toFixed(1),
    };
  }

  // Check if user is a barber - ONLY fetch if user actually has barber role
  const barberProfile = (userRole === 'barber' || userRole === 'admin' || userRole === 'dev') ? await db
    .select({
      id: barbers.id,
      barbershopId: barbers.barbershopId,
      profileImage: barbers.profileImage,
      galleryImages: barbers.galleryImages,
      youtubeLinks: barbers.youtubeLinks,
      bio: barbers.bio,
      specialties: barbers.specialties,
      experience: barbers.experience,
      rating: barbers.rating,
    })
    .from(barbers)
    .leftJoin(users, eq(barbers.userId, users.id))
    .where(and(eq(users.email, userEmail || ''), eq(barbers.isActive, true)))
    .limit(1) : [];

  // Check if user owns or co-owns barbershops
  const currentUserId = currentUser[0]?.id;

  const ownedShops = currentUserId ? await db
    .select({
      id: barbershops.id,
      name: barbershops.name,
      description: barbershops.description,
      address: barbershops.address,
      city: barbershops.city,
      phone: barbershops.phone,
      email: barbershops.email,
      website: barbershops.website,
      rating: barbershops.rating,
      reviewCount: barbershops.reviewCount,
      isActive: barbershops.isActive,
      createdAt: barbershops.createdAt,
      subscriptionStatus: sql<string>`
        CASE 
          WHEN ${barbershops.subscriptionStatus} = 'active' AND (${barbershops.currentPeriodEnd} IS NULL OR ${barbershops.currentPeriodEnd} > NOW()) THEN 'active'
          WHEN ${barbershops.subscriptionStatus} = 'past_due' THEN 'past_due'
          WHEN ${barbershops.subscriptionStatus} = 'canceled' THEN 'canceled'
          WHEN ${barbershops.currentPeriodEnd} IS NOT NULL AND ${barbershops.currentPeriodEnd} < NOW() THEN 'expired'
          WHEN ${barbershops.subscriptionStatus} = 'inactive' OR ${barbershops.isActive} = false THEN 'inactive'
          ELSE CASE WHEN ${barbershops.createdAt} < NOW() - INTERVAL '30 days' THEN 'expired' ELSE 'active' END
        END
      `.as('subscription_status'),
    })
    .from(barbershops)
    .where(eq(barbershops.ownerId, currentUserId)) : [];

  const coOwnedShops = currentUserId ? await db
    .select({
      id: barbershops.id,
      name: barbershops.name,
      description: barbershops.description,
      address: barbershops.address,
      city: barbershops.city,
      phone: barbershops.phone,
      email: barbershops.email,
      website: barbershops.website,
      rating: barbershops.rating,
      reviewCount: barbershops.reviewCount,
      isActive: barbershops.isActive,
      createdAt: barbershops.createdAt,
      subscriptionStatus: sql<string>`
        CASE 
          WHEN ${barbershops.subscriptionStatus} = 'active' AND (${barbershops.currentPeriodEnd} IS NULL OR ${barbershops.currentPeriodEnd} > NOW()) THEN 'active'
          WHEN ${barbershops.subscriptionStatus} = 'past_due' THEN 'past_due'
          WHEN ${barbershops.subscriptionStatus} = 'canceled' THEN 'canceled'
          WHEN ${barbershops.currentPeriodEnd} IS NOT NULL AND ${barbershops.currentPeriodEnd} < NOW() THEN 'expired'
          WHEN ${barbershops.subscriptionStatus} = 'inactive' OR ${barbershops.isActive} = false THEN 'inactive'
          ELSE CASE WHEN ${barbershops.createdAt} < NOW() - INTERVAL '30 days' THEN 'expired' ELSE 'active' END
        END
      `.as('subscription_status'),
    })
    .from(barbershops)
    .where(eq(barbershops.coOwnerId, currentUserId)) : [];

  // Merge owned and co-owned shops, avoiding duplicates
  const seenIds = new Set(ownedShops.map(s => s.id));
  const userBarbershops = [
    ...ownedShops,
    ...coOwnedShops.filter(s => !seenIds.has(s.id)),
  ];

  // Fetch customer bookings ONLY if user is a customer
  let userBookings: any[] = [];

  if (userRole === 'customer') {
    const customerUser = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, userEmail || ''))
      .limit(1);

    userBookings = customerUser.length > 0 ? await db
      .select({
        id: bookings.id,
        barbershopId: bookings.barbershopId,
        barbershopName: barbershops.name,
        barbershopCity: barbershops.city,
        barbershopImage: barbershops.images,
        barberName: sql<string>`${users.name}`.as('barber_name'),
        serviceName: services.name,
        startTime: bookings.startTime,
        endTime: bookings.endTime,
        status: bookings.status,
        totalPrice: bookings.totalPrice,
      })
      .from(bookings)
      .leftJoin(barbershops, eq(bookings.barbershopId, barbershops.id))
      .leftJoin(barbers, eq(bookings.barberId, barbers.id))
      .leftJoin(users, eq(barbers.userId, users.id))
      .leftJoin(services, eq(bookings.serviceId, services.id))
      .where(eq(bookings.userId, customerUser[0].id))
      .orderBy(desc(bookings.startTime))
      .limit(10) : [];
  }

  // Fetch barber bookings ONLY if user is a barber
  let barberBookingsToday = 0;
  let barberBookingsWeek = 0;
  let barberMonthlyEarnings = 0;
  let barberRating = 0;

  if (userRole === 'barber' && barberProfile.length > 0) {
    const barberId = barberProfile[0].id;

    // Today's bookings
    const todayBookings = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(bookings)
      .where(and(
        eq(bookings.barberId, barberId),
        gte(bookings.startTime, today),
        lt(bookings.startTime, new Date(today.getTime() + 24 * 60 * 60 * 1000))
      ));

    barberBookingsToday = parseInt(String(todayBookings[0]?.count || 0));

    // This week's bookings
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());

    const weekBookings = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(bookings)
      .where(and(
        eq(bookings.barberId, barberId),
        gte(bookings.startTime, weekStart)
      ));

    barberBookingsWeek = parseInt(String(weekBookings[0]?.count || 0));

    // Monthly earnings
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    const monthEarnings = await db
      .select({ total: sql<number>`SUM(CAST(${bookings.totalPrice} AS DECIMAL))` })
      .from(bookings)
      .where(and(
        eq(bookings.barberId, barberId),
        gte(bookings.startTime, monthStart),
        eq(bookings.status, 'completed')
      ));

    barberMonthlyEarnings = parseFloat(String(monthEarnings[0]?.total || 0));
    barberRating = parseFloat(String(barberProfile[0].rating || 0));
  }

  // Fetch barber's upcoming bookings with details
  let barberBookingsList: any[] = [];
  let barberBarbershop: any = null;

  if (userRole === 'barber' && barberProfile.length > 0) {
    const barberId = barberProfile[0].id;

    // Get barbershop info
    if (barberProfile[0].barbershopId) {
      const shopInfo = await db
        .select({
          id: barbershops.id,
          name: barbershops.name,
          address: barbershops.address,
          city: barbershops.city,
        })
        .from(barbershops)
        .where(eq(barbershops.id, barberProfile[0].barbershopId))
        .limit(1);

      barberBarbershop = shopInfo[0] || null;
    }

    // Get upcoming bookings
    barberBookingsList = await db
      .select({
        id: bookings.id,
        // Guest bookings have no user account; fall back to the contact saved on the booking.
        customerName: sql<string>`COALESCE(${users.name}, ${bookings.customerName})`,
        customerPhone: sql<string | null>`COALESCE(${users.phone}, ${bookings.customerPhone})`,
        serviceName: services.name,
        servicePrice: services.price,
        startTime: bookings.startTime,
        endTime: bookings.endTime,
        status: bookings.status,
        totalPrice: bookings.totalPrice,
      })
      .from(bookings)
      .leftJoin(users, eq(bookings.userId, users.id))
      .leftJoin(services, eq(bookings.serviceId, services.id))
      .where(and(
        eq(bookings.barberId, barberId),
        gte(bookings.startTime, today)
      ))
      .orderBy(bookings.startTime)
      .limit(20);
  }

  const barberStats = {
    bookingsToday: barberBookingsToday,
    bookingsWeek: barberBookingsWeek,
    monthlyEarnings: barberMonthlyEarnings.toFixed(2),
    rating: barberRating.toFixed(1),
  };

  const roleLabel: Record<string, string> = {
    dev: 'Développeur',
    admin: 'Administrateur',
    barber: 'Coiffeur',
    customer: userBarbershops.length > 0 ? 'Propriétaire de salon' : 'Client',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-6 sm:px-6 lg:px-8">
          {user.image ? (
            <Image src={user.image} alt="" width={56} height={56} className="h-14 w-14 rounded-full object-cover ring-1 ring-gray-200" />
          ) : (
            <span className="inline-flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-primary-50 font-display text-xl font-semibold text-primary-700 ring-1 ring-primary-100">
              {user.name?.charAt(0).toUpperCase()}
            </span>
          )}
          <div className="min-w-0">
            <h1 className="truncate font-display text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">{user.name}</h1>
            <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-600">
              <span className="truncate">{user.email}</span>
              <Badge tone={userRole === 'dev' || userRole === 'admin' ? 'brand' : 'neutral'} icon={userRole === 'dev' || userRole === 'admin' ? Shield : undefined}>
                {roleLabel[userRole] || userRole}
              </Badge>
            </p>
          </div>
        </div>
      </div>

      {!isEmailVerified && <EmailVerificationBanner email={userEmail || ''} userName={user.name || ''} />}

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {(userRole === 'dev' || userRole === 'admin') && (
          <AdminHome locale={locale} stats={stats} role={userRole} />
        )}
        {userRole === 'barber' && (
          <BarberSpaceClient
            profile={barberProfile[0] as any}
            barbershop={barberBarbershop}
            bookings={barberBookingsList as any}
            stats={barberStats}
            locale={locale}
            userName={session.user.name || ''}
          />
        )}
        {userRole === 'customer' && (
          <MySpaceClient
            barbershops={userBarbershops as any}
            barberProfile={barberProfile[0] as any}
            bookings={userBookings as any}
            locale={locale}
            userRole={userRole}
            userName={session.user.name || ''}
            subscriptionPrice={subscriptionPrice}
          />
        )}
      </div>

      <Footer />
    </div>
  );
}

interface DashboardStats {
  totalUsers: number;
  totalBarbershops: number;
  totalBarbers: number;
  bookingsToday: number;
  totalBookings: number;
  activeBarbershops: number;
  monthlyRevenue: string;
  avgRating: string;
}

// Admin + dev home: platform figures and entry points to the admin tools.
// Links are filtered by role so nobody lands on a page that redirects them away.
async function AdminHome({ locale, stats, role }: { locale: string; stats: DashboardStats; role: string }) {
  const t = await getTranslations({ locale, namespace: 'mySpace' });
  const isDev = role === 'dev';
  const fr = locale === 'fr';

  const groups: { title: string; items: { title: string; desc: string; icon: typeof Users; href: string; devOnly?: boolean }[] }[] = [
    {
      title: fr ? 'Plateforme' : 'Platform',
      items: [
        { title: t('barbershopManagement'), desc: t('barbershopManagementDesc'), icon: Store, href: `/${locale}/admin/barbershops` },
        { title: t('userManagement'), desc: t('userManagementDesc'), icon: Users, href: `/${locale}/admin/users` },
        { title: t('systemAnalytics'), desc: t('systemAnalyticsDesc'), icon: BarChart3, href: `/${locale}/admin/analytics` },
      ],
    },
    {
      title: fr ? 'Contenu et marketing' : 'Content & marketing',
      items: [
        { title: fr ? 'Cours vidéo' : 'Video courses', desc: fr ? 'Gérer les cours vidéo et leurs tarifs' : 'Manage video courses and pricing', icon: Video, href: `/${locale}/admin/courses` },
        { title: fr ? 'Campagnes SMS' : 'SMS campaigns', desc: fr ? 'Envoyer des SMS aux clients' : 'Send SMS campaigns to customers', icon: MessageSquare, href: `/${locale}/admin/sms` },
      ],
    },
    {
      title: fr ? 'Système' : 'System',
      items: [
        { title: t('settings'), desc: t('settingsDesc'), icon: Settings, href: `/${locale}/admin/settings` },
        { title: t('security'), desc: t('securityDesc'), icon: Shield, href: `/${locale}/admin/security`, devOnly: true },
        { title: t('databaseManagement'), desc: t('databaseManagementDesc'), icon: Database, href: `/${locale}/admin/database`, devOnly: true },
      ],
    },
  ];

  return (
    <div className="space-y-10">
      <StatGrid>
        <Stat label={t('bookingsToday')} icon={Calendar} value={stats.bookingsToday} hint={`${stats.totalBookings} au total`} />
        <Stat label={t('barbershops')} icon={Store} value={stats.activeBarbershops} hint={`visibles sur ${stats.totalBarbershops}`} />
        <Stat label={t('totalUsers')} icon={Users} value={stats.totalUsers} hint={`dont ${stats.totalBarbers} coiffeurs`} />
        <Stat label={fr ? 'Revenu mensuel estimé' : 'Estimated monthly revenue'} icon={TrendingUp} value={formatEuro(stats.monthlyRevenue)} hint={fr ? 'salons visibles x abonnement' : 'visible shops x subscription'} />
      </StatGrid>

      {groups.map((group) => {
        const items = group.items.filter((item) => isDev || !item.devOnly);
        if (items.length === 0) return null;
        return (
          <section key={group.title}>
            <h2 className="mb-3 font-display text-sm font-semibold text-gray-900">{group.title}</h2>
            <div className="grid gap-px overflow-hidden rounded-xl border border-gray-200 bg-gray-200 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((item) => (
                <Link key={item.href} href={item.href} className="group flex items-start gap-4 bg-white p-5 transition-colors hover:bg-gray-50">
                  <span className="inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-500 transition-colors group-hover:bg-primary-50 group-hover:text-primary-600">
                    <item.icon className="h-5 w-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-1 font-medium text-gray-900">
                      {item.title}
                      <ArrowRight className="h-3.5 w-3.5 -translate-x-1 text-gray-400 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
                    </span>
                    <span className="mt-0.5 block text-sm text-gray-500">{item.desc}</span>
                  </span>
                </Link>
              ))}
              {/* Fill the last row so the hairline grid never shows an empty grey cell. */}
              {Array.from({ length: (2 - (items.length % 2)) % 2 }).map((_, i) => (
                <div key={`filler2-${i}`} aria-hidden="true" className="hidden bg-white sm:block lg:hidden" />
              ))}
              {Array.from({ length: (3 - (items.length % 3)) % 3 }).map((_, i) => (
                <div key={`filler3-${i}`} aria-hidden="true" className="hidden bg-white lg:block" />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
