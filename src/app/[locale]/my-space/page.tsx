import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import Image from 'next/image';
import Link from 'next/link';
import { Users, Calendar, Settings, BarChart3, Store, Scissors, Star, Clock, DollarSign, Shield, Database, MapPin, Heart, ArrowRight, Sparkles, TrendingUp, AlertCircle, Mail, Video, MessageSquare } from 'lucide-react';
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
    const totalBarbers = await db.select({ count: sql<number>`COUNT(*)` }).from(barbers).where(sql`user_id != '00000000-0000-0000-0000-000000000000'`);

    // Bookings today
    const bookingsToday = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(bookings)
      .where(gte(bookings.startTime, today));

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
    .where(eq(users.email, userEmail || ''))
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
          WHEN ${barbershops.isActive} = false THEN 'inactive'
          WHEN ${barbershops.createdAt} < NOW() - INTERVAL '1 month' THEN 'expired'
          ELSE 'active'
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
          WHEN ${barbershops.isActive} = false THEN 'inactive'
          WHEN ${barbershops.createdAt} < NOW() - INTERVAL '1 month' THEN 'expired'
          ELSE 'active'
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
        customerName: users.name,
        customerPhone: users.phone,
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

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <div className="bg-gradient-to-br from-gray-50 to-gray-100">
        {/* User Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {user.image ? (
                  <Image
                    src={user.image}
                    alt={user.name || ''}
                    width={80}
                    height={80}
                    className="rounded-full border-4 border-primary-100"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center border-4 border-primary-100">
                    <span className="text-3xl font-bold text-white">
                      {user.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{user.name}</h1>
                  <p className="text-gray-600 mt-1">{user.email}</p>
                  <span className="inline-flex items-center px-3 py-1 mt-2 rounded-full text-sm font-medium bg-primary-100 text-primary-800 capitalize">
                    {userRole === 'dev' && <Shield className="w-4 h-4 mr-1" />}
                    {userRole}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Email Verification Banner */}
        {!isEmailVerified && (
          <EmailVerificationBanner email={userEmail || ''} userName={user.name || ''} />
        )}

        {/* Dashboard Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {userRole === 'dev' && <DevDashboard locale={locale} stats={stats} />}
          {userRole === 'admin' && <AdminDashboard locale={locale} stats={stats} />}
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
      </div>

      <Footer />
    </div>
  );
}

// Dev Dashboard - Full system access
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

async function DevDashboard({ locale, stats: realStats }: { locale: string; stats: DashboardStats }) {
  const t = await getTranslations({ locale, namespace: 'mySpace' });

  const stats = [
    { label: t('totalUsers'), value: realStats.totalUsers.toString(), icon: Users, color: 'blue' },
    { label: t('barbershops'), value: realStats.totalBarbershops.toString(), icon: Store, color: 'green' },
    { label: t('bookingsToday'), value: realStats.bookingsToday.toString(), icon: Calendar, color: 'purple' },
    { label: t('revenue'), value: `€${realStats.monthlyRevenue}`, icon: DollarSign, color: 'yellow' },
  ];

  const sections = [
    {
      title: t('userManagement'),
      description: t('userManagementDesc'),
      icon: Users,
      color: 'blue',
      link: `/${locale}/admin/users`,
    },
    {
      title: t('barbershopManagement'),
      description: t('barbershopManagementDesc'),
      icon: Store,
      color: 'green',
      link: `/${locale}/admin/barbershops`,
    },
    {
      title: t('systemAnalytics'),
      description: t('systemAnalyticsDesc'),
      icon: BarChart3,
      color: 'purple',
      link: `/${locale}/admin/analytics`,
    },
    {
      title: t('databaseManagement'),
      description: t('databaseManagementDesc'),
      icon: Database,
      color: 'orange',
      link: `/${locale}/admin/database`,
    },
    {
      title: t('settings'),
      description: t('settingsDesc'),
      icon: Settings,
      color: 'gray',
      link: `/${locale}/admin/settings`,
    },
    {
      title: t('security'),
      description: t('securityDesc'),
      icon: Shield,
      color: 'red',
      link: `/${locale}/admin/security`,
    },
    {
      title: locale === 'fr' ? 'Cours Vidéo' : 'Video Courses',
      description: locale === 'fr' ? 'Gérer les cours vidéo et les tarifs' : 'Manage video courses and pricing',
      icon: Video,
      color: 'indigo',
      link: `/${locale}/admin/courses`,
    },
    {
      title: locale === 'fr' ? 'Marketing SMS' : 'SMS Marketing',
      description: locale === 'fr' ? 'Envoyer des campagnes SMS aux clients' : 'Send SMS campaigns to customers',
      icon: MessageSquare,
      color: 'teal',
      link: `/${locale}/admin/sms`,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
              </div>
              <div className={`p-3 bg-${stat.color}-100 rounded-lg`}>
                <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Admin Sections */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('systemAdministration')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sections.map((section) => (
            <Link
              key={section.title}
              href={section.link}
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md hover:border-primary-200 transition-all group"
            >
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-primary-50 rounded-lg group-hover:bg-primary-100 transition-colors">
                  <section.icon className="w-6 h-6 text-primary-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">{section.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{section.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

// Admin/Owner Dashboard - Business management
async function AdminDashboard({ locale, stats: realStats }: { locale: string; stats: DashboardStats }) {
  const t = await getTranslations({ locale, namespace: 'mySpace' });

  const stats = [
    { label: t('totalBookingsAdmin'), value: realStats.totalBookings.toString(), icon: Calendar, color: 'blue' },
    { label: t('activeBarbers'), value: realStats.totalBarbers.toString(), icon: Scissors, color: 'green' },
    { label: t('monthlyRevenue'), value: `€${realStats.monthlyRevenue}`, icon: DollarSign, color: 'yellow' },
    { label: t('avgRating'), value: realStats.avgRating, icon: Star, color: 'purple' },
  ];

  const sections = [
    { title: t('mySpaceLink'), icon: Store, link: `/${locale}/my-space`, desc: t('mySpaceDesc') },
    { title: t('staffManagement'), icon: Users, link: `/${locale}/admin/staff`, desc: t('staffManagementDesc') },
    { title: t('bookingsManagement'), icon: Calendar, link: `/${locale}/admin/bookings`, desc: t('bookingsManagementDesc') },
    { title: t('analytics'), icon: BarChart3, link: `/${locale}/admin/analytics`, desc: t('analyticsDesc') },
    { title: t('servicesPricing'), icon: DollarSign, link: `/${locale}/admin/services`, desc: t('servicesPricingDesc') },
    { title: t('settingsPreferences'), icon: Settings, link: `/${locale}/admin/settings`, desc: t('settingsPreferencesDesc') },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
              </div>
              <div className={`p-3 bg-${stat.color}-100 rounded-lg`}>
                <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('businessManagement')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sections.map((section) => (
            <Link
              key={section.title}
              href={section.link}
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md hover:border-primary-200 transition-all group"
            >
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-primary-50 rounded-lg group-hover:bg-primary-100 transition-colors">
                  <section.icon className="w-6 h-6 text-primary-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">{section.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{section.desc}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

