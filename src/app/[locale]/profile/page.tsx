import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import Image from 'next/image';
import Link from 'next/link';
import { Users, Calendar, Settings, BarChart3, Store, Scissors, Star, Clock, DollarSign, Shield, Database, MapPin, Heart, ArrowRight, Sparkles, TrendingUp } from 'lucide-react';
import { Header } from '@/components/ui/header';
import { Footer } from '@/components/ui/footer';
import { db } from '@/lib/db';
import { users, barbershops, bookings, barbers, services } from '@/lib/db/schema';
import { eq, and, gte, sql, desc, lt } from 'drizzle-orm';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'profile' });
  
  return {
    title: t('dashboard'),
    description: t('dashboardDesc'),
  };
}

export default async function ProfilePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect(`/${locale}/auth/signin`);
  }

  const { user } = session;
  const userRole = (user as any).role || 'customer';

  // Fetch real statistics
  const totalUsers = await db.select({ count: sql<number>`COUNT(*)` }).from(users);
  const totalBarbershops = await db.select({ count: sql<number>`COUNT(*)` }).from(barbershops);
  const totalBarbers = await db.select({ count: sql<number>`COUNT(*)` }).from(barbers).where(sql`user_id != '00000000-0000-0000-0000-000000000000'`);
  
  // Bookings today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
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

  // Calculate monthly revenue (active shops * €29.90)
  const monthlyRevenue = (parseInt(String(activeBarbershops[0]?.count || 0)) * 29.9).toFixed(2);

  // Average rating
  const avgRatingResult = await db
    .select({ avg: sql<number>`AVG(CAST(${barbershops.rating} AS DECIMAL))` })
    .from(barbershops)
    .where(sql`${barbershops.rating} IS NOT NULL`);

  const stats = {
    totalUsers: parseInt(String(totalUsers[0]?.count || 0)),
    totalBarbershops: parseInt(String(totalBarbershops[0]?.count || 0)),
    totalBarbers: parseInt(String(totalBarbers[0]?.count || 0)),
    bookingsToday: parseInt(String(bookingsToday[0]?.count || 0)),
    totalBookings: parseInt(String(totalBookings[0]?.count || 0)),
    activeBarbershops: parseInt(String(activeBarbershops[0]?.count || 0)),
    monthlyRevenue,
    avgRating: parseFloat(String(avgRatingResult[0]?.avg || 0)).toFixed(1),
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

        {/* Dashboard Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {userRole === 'dev' && <DevDashboard locale={locale} stats={stats} />}
          {userRole === 'admin' && <AdminDashboard locale={locale} stats={stats} />}
          {userRole === 'barber' && <BarberDashboard locale={locale} />}
          {userRole === 'customer' && <CustomerDashboard locale={locale} />}
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

function DevDashboard({ locale, stats: realStats }: { locale: string; stats: DashboardStats }) {
  const stats = [
    { label: 'Total Users', value: realStats.totalUsers.toString(), icon: Users, color: 'blue' },
    { label: 'Barbershops', value: realStats.totalBarbershops.toString(), icon: Store, color: 'green' },
    { label: 'Bookings Today', value: realStats.bookingsToday.toString(), icon: Calendar, color: 'purple' },
    { label: 'Revenue', value: `€${realStats.monthlyRevenue}`, icon: DollarSign, color: 'yellow' },
  ];

  const sections = [
    {
      title: 'User Management',
      description: 'Manage all users, roles, and permissions',
      icon: Users,
      color: 'blue',
      link: `/${locale}/admin/users`,
    },
    {
      title: 'Barbershop Management',
      description: 'Manage barbershops and €29.9/month subscriptions',
      icon: Store,
      color: 'green',
      link: `/${locale}/admin/barbershops`,
    },
    {
      title: 'System Analytics',
      description: 'View system-wide analytics and reports',
      icon: BarChart3,
      color: 'purple',
      link: `/${locale}/admin/analytics`,
    },
    {
      title: 'Database Management',
      description: 'Database backups and maintenance',
      icon: Database,
      color: 'orange',
      link: `/${locale}/admin/database`,
    },
    {
      title: 'Settings',
      description: 'System configuration and settings',
      icon: Settings,
      color: 'gray',
      link: `/${locale}/admin/settings`,
    },
    {
      title: 'Security',
      description: 'Security logs and access control',
      icon: Shield,
      color: 'red',
      link: `/${locale}/admin/security`,
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
        <h2 className="text-2xl font-bold text-gray-900 mb-6">System Administration</h2>
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
function AdminDashboard({ locale, stats: realStats }: { locale: string; stats: DashboardStats }) {
  const stats = [
    { label: 'Total Bookings', value: realStats.totalBookings.toString(), icon: Calendar, color: 'blue' },
    { label: 'Active Barbers', value: realStats.totalBarbers.toString(), icon: Scissors, color: 'green' },
    { label: 'Monthly Revenue', value: `€${realStats.monthlyRevenue}`, icon: DollarSign, color: 'yellow' },
    { label: 'Avg Rating', value: realStats.avgRating, icon: Star, color: 'purple' },
  ];

  const sections = [
    { title: 'My Space', icon: Store, link: `/${locale}/my-space`, desc: 'Manage your space and profile' },
    { title: 'Staff Management', icon: Users, link: `/${locale}/admin/staff`, desc: 'Manage barbers and staff' },
    { title: 'Bookings', icon: Calendar, link: `/${locale}/admin/bookings`, desc: 'View and manage all bookings' },
    { title: 'Analytics', icon: BarChart3, link: `/${locale}/admin/analytics`, desc: 'Business analytics and insights' },
    { title: 'Services & Pricing', icon: DollarSign, link: `/${locale}/admin/services`, desc: 'Manage services and pricing' },
    { title: 'Settings', icon: Settings, link: `/${locale}/admin/settings`, desc: 'Business settings and preferences' },
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
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Business Management</h2>
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

// Barber Dashboard
function BarberDashboard({ locale }: { locale: string }) {
  const stats = [
    { label: 'Today\'s Bookings', value: '8', icon: Calendar, color: 'blue' },
    { label: 'This Week', value: '42', icon: Clock, color: 'green' },
    { label: 'Earnings (Month)', value: '€2.4k', icon: DollarSign, color: 'yellow' },
    { label: 'Rating', value: '4.9', icon: Star, color: 'purple' },
  ];

  const sections = [
    { title: 'My Schedule', icon: Calendar, href: `/${locale}/barber/schedule`, desc: 'View and manage your schedule' },
    { title: 'Bookings', icon: Clock, href: `/${locale}/barber/bookings`, desc: 'Today\'s and upcoming appointments' },
    { title: 'Earnings', icon: DollarSign, href: `/${locale}/barber/earnings`, desc: 'Track your earnings and tips' },
    { title: 'Reviews', icon: Star, href: `/${locale}/barber/reviews`, desc: 'View customer reviews and ratings' },
    { title: 'My Profile', icon: Users, href: `/${locale}/barber/profile`, desc: 'Manage your professional profile' },
    { title: 'Settings', icon: Settings, href: `/${locale}/barber/settings`, desc: 'Availability and preferences' },
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
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Professional Dashboard</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sections.map((section) => (
            <Link
              key={section.title}
              href={section.href}
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

// Customer Dashboard
async function CustomerDashboard({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: 'profile' });
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  // Fetch real user bookings
  const userBookings = userId ? await db
    .select({
      id: bookings.id,
      startTime: bookings.startTime,
      status: bookings.status,
      customerName: bookings.customerName,
      customerEmail: bookings.customerEmail,
      barbershopName: barbershops.name,
      barbershopImage: barbershops.images,
      barbershopCity: barbershops.city,
      serviceName: services.name,
      servicePrice: services.price,
      serviceDuration: services.duration,
      barberName: sql<string>`users.name`,
    })
    .from(bookings)
    .leftJoin(barbershops, eq(bookings.barbershopId, barbershops.id))
    .leftJoin(services, eq(bookings.serviceId, services.id))
    .leftJoin(barbers, eq(bookings.barberId, barbers.id))
    .leftJoin(users, eq(barbers.userId, users.id))
    .where(eq(bookings.customerEmail, session?.user?.email || ''))
    .orderBy(desc(bookings.startTime))
    .limit(10) : [];

  const now = new Date();
  const upcomingBookings = userBookings.filter(b => 
    new Date(b.startTime) > now && b.status !== 'cancelled'
  );
  const completedBookings = userBookings.filter(b => 
    b.status === 'completed' || (new Date(b.startTime) < now && b.status !== 'cancelled')
  );

  const stats = [
    { label: t('upcomingBookings'), value: upcomingBookings.length.toString(), icon: Calendar, gradient: 'from-blue-500 to-blue-600' },
    { label: t('completedAppointments'), value: completedBookings.length.toString(), icon: Clock, gradient: 'from-green-500 to-green-600' },
    { label: t('favorites'), value: '0', icon: Heart, gradient: 'from-pink-500 to-pink-600' },
    { label: t('reviewsGiven'), value: '0', icon: Star, gradient: 'from-yellow-500 to-yellow-600' },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-600 via-primary-500 to-orange-500 p-8 text-white shadow-xl">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 h-40 w-40 rounded-full bg-white/10 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mb-8 -ml-8 h-40 w-40 rounded-full bg-white/10 blur-3xl"></div>
        <div className="relative z-10">
          <div className="flex items-center space-x-2 mb-3">
            <Sparkles className="w-6 h-6" />
            <span className="font-display font-semibold text-sm uppercase tracking-wide">{t('welcomeBanner')}</span>
          </div>
          <h2 className="text-3xl font-display font-bold mb-2">{t('readyForNextLook')}</h2>
          <p className="text-white/90 mb-6 max-w-2xl">{t('discoverBestSalons')}</p>
          <Link
            href={`/${locale}/barbershops`}
            className="inline-flex items-center space-x-2 bg-white text-primary-600 px-6 py-3 rounded-lg font-display font-semibold uppercase text-sm tracking-wide hover:bg-gray-50 transition-colors shadow-lg"
          >
            <Store className="w-5 h-5" />
            <span>{t('exploreSalons')}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-xs font-display font-semibold text-gray-500 uppercase tracking-wide">{stat.label}</p>
                <p className="text-4xl font-display font-bold text-gray-900 mt-2">{stat.value}</p>
              </div>
              <div className={`p-3 bg-gradient-to-br ${stat.gradient} rounded-xl shadow-lg`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Upcoming Appointments */}
      {upcomingBookings.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-display font-bold text-gray-900">{t('upcomingAppointments')}</h3>
            <Link href={`/${locale}/my-space`} className="text-sm font-display font-semibold text-primary-600 hover:text-primary-700 uppercase tracking-wide flex items-center space-x-1">
              <span>{t('seeAll')}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-4">
            {upcomingBookings.slice(0, 3).map((booking) => (
              <div key={booking.id} className="flex items-center space-x-4 p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100 hover:border-primary-200 transition-colors">
                {booking.barbershopImage && booking.barbershopImage.length > 0 ? (
                  <img src={booking.barbershopImage[0]} alt={booking.barbershopName || ''} className="w-16 h-16 rounded-lg object-cover" />
                ) : (
                  <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-primary-600 rounded-lg flex items-center justify-center">
                    <Store className="w-8 h-8 text-white" />
                  </div>
                )}
                <div className="flex-1">
                  <h4 className="font-display font-bold text-gray-900">{booking.barbershopName}</h4>
                  <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                    <span className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(booking.startTime).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{new Date(booking.startTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                    </span>
                    {booking.barbershopCity && (
                      <span className="flex items-center space-x-1">
                        <MapPin className="w-4 h-4" />
                        <span>{booking.barbershopCity}</span>
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-700 mt-1 font-medium">{booking.serviceName}</p>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-display font-semibold bg-green-100 text-green-700 uppercase tracking-wide">
                    {t('confirmed')}
                  </span>
                  {booking.servicePrice && (
                    <p className="text-lg font-display font-bold text-gray-900 mt-2">€{booking.servicePrice}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div>
        <h3 className="text-xl font-display font-bold text-gray-900 mb-6">{t('quickActions')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link
            href={`/${locale}/barbershops`}
            className="group relative overflow-hidden bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl shadow-lg p-6 text-white hover:shadow-xl transition-all hover:scale-105"
          >
            <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-white/10 blur-2xl"></div>
            <div className="relative z-10">
              <Store className="w-10 h-10 mb-4" />
              <h4 className="font-display font-bold text-lg mb-2 uppercase tracking-wide">{t('findASalon')}</h4>
              <p className="text-white/90 text-sm mb-4">{t('findASalonDesc')}</p>
              <div className="flex items-center space-x-2 text-sm font-display font-semibold uppercase tracking-wide">
                <span>{t('explore')}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>

          <Link
            href={`/${locale}/my-space`}
            className="group bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md hover:border-primary-200 transition-all"
          >
            <Calendar className="w-10 h-10 text-primary-600 mb-4" />
            <h4 className="font-display font-bold text-lg text-gray-900 mb-2 uppercase tracking-wide">{t('myReservations')}</h4>
            <p className="text-gray-600 text-sm mb-4">{t('myReservationsDesc')}</p>
            <div className="flex items-center space-x-2 text-sm font-display font-semibold text-primary-600 uppercase tracking-wide">
              <span>{t('seeAll')}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            href={`/${locale}/barbers`}
            className="group bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md hover:border-primary-200 transition-all"
          >
            <Scissors className="w-10 h-10 text-primary-600 mb-4" />
            <h4 className="font-display font-bold text-lg text-gray-900 mb-2 uppercase tracking-wide">{t('proProfessionals')}</h4>
            <p className="text-gray-600 text-sm mb-4">{t('proProfessionalsDesc')}</p>
            <div className="flex items-center space-x-2 text-sm font-display font-semibold text-primary-600 uppercase tracking-wide">
              <span>{t('discover')}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      {completedBookings.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-display font-bold text-gray-900">{t('recentHistory')}</h3>
            <Link href={`/${locale}/my-space`} className="text-sm font-display font-semibold text-primary-600 hover:text-primary-700 uppercase tracking-wide flex items-center space-x-1">
              <span>{t('seeHistory')}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {completedBookings.slice(0, 4).map((booking) => (
              <div key={booking.id} className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg border border-gray-100">
                {booking.barbershopImage && booking.barbershopImage.length > 0 ? (
                  <img src={booking.barbershopImage[0]} alt={booking.barbershopName || ''} className="w-12 h-12 rounded-lg object-cover" />
                ) : (
                  <div className="w-12 h-12 bg-gradient-to-br from-gray-300 to-gray-400 rounded-lg flex items-center justify-center">
                    <Store className="w-6 h-6 text-white" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h5 className="font-display font-semibold text-gray-900 truncate text-sm">{booking.barbershopName}</h5>
                  <p className="text-xs text-gray-600">{booking.serviceName}</p>
                  <p className="text-xs text-gray-500 mt-1">{new Date(booking.startTime).toLocaleDateString('fr-FR')}</p>
                </div>
                <span className="text-sm font-display font-bold text-gray-900">€{booking.servicePrice}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
