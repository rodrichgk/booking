'use client';

import { Store, MapPin, ArrowRight, User, Calendar, CheckCircle, Plus, Star, ChevronRight, Scissors } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import {
  Panel, PanelHeader, SectionHeading, StatGrid, Stat, Badge, EmptyState,
  btn, formatEuro, type BadgeTone,
} from '@/components/dashboard/ui';

interface Barbershop {
  id: string;
  name: string;
  description: string | null;
  address: string;
  city: string;
  phone: string | null;
  email: string | null;
  website: string | null;
  rating: string | null;
  reviewCount: number | null;
  isActive: boolean;
  createdAt: Date;
  subscriptionStatus: string;
}

interface BarberProfile {
  id: string;
  barbershopId: string;
  profileImage: string | null;
  galleryImages: string[] | null;
  youtubeLinks: string[] | null;
  bio: string | null;
  specialties: string[] | null;
  experience: number | null;
  rating: string | null;
}

interface Booking {
  id: string;
  barbershopId: string;
  barbershopName: string | null;
  barbershopCity: string | null;
  barbershopImage: string[] | null;
  barberName: string | null;
  serviceName: string | null;
  startTime: Date;
  endTime: Date;
  status: string | null;
  totalPrice: string;
}

interface MySpaceClientProps {
  barbershops: Barbershop[];
  barberProfile?: BarberProfile | null;
  bookings?: Booking[];
  locale: string;
  userRole: string;
  userName: string;
  subscriptionPrice: number;
}

const SUBSCRIPTION: Record<string, { label: string; tone: BadgeTone }> = {
  active: { label: 'Abonnement actif', tone: 'success' },
  past_due: { label: 'Paiement en retard', tone: 'warning' },
  expired: { label: 'Abonnement expiré', tone: 'danger' },
  canceled: { label: 'Abonnement annulé', tone: 'neutral' },
  inactive: { label: 'Sans abonnement', tone: 'neutral' },
};

const formatDay = (d: Date) =>
  new Date(d).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
const formatTime = (d: Date) =>
  new Date(d).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

export function MySpaceClient({ barbershops, bookings = [], locale, subscriptionPrice }: MySpaceClientProps) {
  const t = useTranslations('mySpace');

  // Accounts that own or co-own at least one salon get the owner view.
  if (barbershops.length > 0) {
    const activeCount = barbershops.filter(b => b.subscriptionStatus === 'active').length;
    return (
      <div className="space-y-8">
        <SectionHeading
          title="Mes salons"
          description="Gérez vos salons, leur équipe et leurs réservations."
          actions={
            <Link href={`/${locale}/my-space/add-shop`} className={btn.secondary}>
              <Plus className="h-4 w-4" />
              {t('addShop')}
            </Link>
          }
        />

        <StatGrid columns={3}>
          <Stat label={t('totalLocations')} icon={Store} value={barbershops.length} />
          <Stat label={t('activeShops')} icon={CheckCircle} value={activeCount} hint={activeCount < barbershops.length ? `${barbershops.length - activeCount} à renouveler` : 'Tous vos salons sont visibles'} tone={activeCount < barbershops.length ? 'attention' : 'default'} />
          <Stat label={t('monthlyCost')} icon={Calendar} value={formatEuro(activeCount * subscriptionPrice)} hint={`${formatEuro(subscriptionPrice)} par salon`} />
        </StatGrid>

        <Panel>
          <ul className="divide-y divide-gray-100">
            {barbershops.map((shop) => {
              const status = SUBSCRIPTION[shop.subscriptionStatus] ?? SUBSCRIPTION.inactive;
              const needsRenewal = shop.subscriptionStatus !== 'active';
              return (
                <li key={shop.id} className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:px-6">
                  <span className="inline-flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-500">
                    <Store className="h-6 w-6" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="truncate font-display text-base font-semibold text-gray-900">{shop.name}</h3>
                      <Badge tone={status.tone}>{status.label}</Badge>
                      {!shop.isActive && shop.subscriptionStatus === 'active' && <Badge tone="warning">Masqué</Badge>}
                    </div>
                    <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-gray-400" />
                        {shop.address}, {shop.city}
                      </span>
                      {shop.rating && (
                        <span className="inline-flex items-center gap-1 tabular-nums">
                          <Star className="h-3.5 w-3.5 fill-primary-500 text-primary-500" />
                          {shop.rating}
                          <span className="text-gray-400">({shop.reviewCount} {t('reviewsCount')})</span>
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="flex flex-shrink-0 flex-wrap gap-2">
                    {needsRenewal && (
                      <Link href={`/${locale}/subscription?shopId=${shop.id}`} className={btn.secondary}>
                        {t('subscribeNow')}
                      </Link>
                    )}
                    <Link href={`/${locale}/my-space/${shop.id}`} className={btn.primary}>
                      {t('manageShop')}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </li>
              );
            })}
          </ul>
        </Panel>
      </div>
    );
  }

  // Customer view
  const now = new Date();
  const upcoming = bookings
    .filter(b => new Date(b.startTime) >= now && b.status !== 'cancelled')
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  const completed = bookings.filter(b => b.status === 'completed');

  return (
    <div className="space-y-8">
      <StatGrid columns={3}>
        <Stat label={t('upcomingBookings')} icon={Calendar} value={upcoming.length} />
        <Stat label={t('completedAppointmentsCount')} icon={CheckCircle} value={completed.length} />
        <Stat label={t('totalBookings')} icon={Scissors} value={bookings.length} hint="10 dernières réservations" />
      </StatGrid>

      <div className="grid items-start gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Panel>
            <PanelHeader title={t('upcomingAppointmentsTitle')} />
            {upcoming.length === 0 ? (
              <EmptyState
                icon={Calendar}
                title={t('noUpcomingBookings')}
                description="Trouvez un salon près de chez vous et réservez en quelques clics."
                action={
                  <Link href={`/${locale}/barbershops`} className={btn.primary}>
                    {t('bookNow')}
                  </Link>
                }
              />
            ) : (
              <ul className="divide-y divide-gray-100">
                {upcoming.slice(0, 5).map((booking) => (
                  <li key={booking.id}>
                    <Link
                      href={`/${locale}/barbershops/${booking.barbershopId}`}
                      className="group flex items-center gap-4 px-5 py-4 transition-colors hover:bg-gray-50 sm:px-6"
                    >
                      {booking.barbershopImage?.[0] ? (
                        <Image src={booking.barbershopImage[0]} alt="" width={56} height={56} className="h-14 w-14 flex-shrink-0 rounded-lg object-cover" />
                      ) : (
                        <span className="inline-flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100">
                          <Store className="h-6 w-6 text-gray-400" />
                        </span>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium capitalize text-primary-700">
                          {formatDay(booking.startTime)}, {formatTime(booking.startTime)}
                        </p>
                        <p className="truncate font-medium text-gray-900">{booking.barbershopName}</p>
                        <p className="truncate text-sm text-gray-500">
                          {[booking.serviceName, booking.barberName, booking.barbershopCity].filter(Boolean).join(', ')}
                        </p>
                      </div>
                      <span className="hidden text-sm font-medium tabular-nums text-gray-900 sm:block">{formatEuro(booking.totalPrice)}</span>
                      <ChevronRight className="h-4 w-4 flex-shrink-0 text-gray-300 group-hover:text-gray-500" />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          {completed.length > 0 && (
            <Panel>
              <PanelHeader title={t('recentHistory')} />
              <ul className="divide-y divide-gray-100">
                {completed.slice(0, 5).map((booking) => (
                  <li key={booking.id} className="flex items-center justify-between gap-4 px-5 py-3 sm:px-6">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-gray-900">{booking.barbershopName}</p>
                      <p className="truncate text-sm text-gray-500">
                        {new Date(booking.startTime).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                        {booking.serviceName ? `, ${booking.serviceName}` : ''}
                      </p>
                    </div>
                    <Link href={`/${locale}/barbershops/${booking.barbershopId}`} className={`${btn.ghost} ${btn.sm}`}>
                      Réserver à nouveau
                    </Link>
                  </li>
                ))}
              </ul>
            </Panel>
          )}
        </div>

        <Panel>
          <PanelHeader title={t('quickActions')} />
          <ul className="divide-y divide-gray-100">
            {[
              { href: `/${locale}/barbershops`, icon: Store, title: t('findSalon'), desc: t('discoverBestSalons') },
              { href: `/${locale}/barbers`, icon: User, title: t('proProfessionals'), desc: t('findIdealBarber') },
              { href: `/${locale}/my-space/add-shop`, icon: Plus, title: t('addShop'), desc: t('createYourBarbershop') },
            ].map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="group flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-gray-50 sm:px-6">
                  <item.icon className="h-5 w-5 flex-shrink-0 text-gray-400 group-hover:text-primary-600" />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium text-gray-900">{item.title}</span>
                    <span className="block truncate text-xs text-gray-500">{item.desc}</span>
                  </span>
                  <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-gray-500" />
                </Link>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </div>
  );
}
