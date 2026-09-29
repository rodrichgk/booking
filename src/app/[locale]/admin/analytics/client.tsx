'use client';

import { useTranslations } from 'next-intl';
import { Users, Store, Calendar, Star, TrendingUp, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Header } from '@/components/ui/header';
import { Footer } from '@/components/ui/footer';
import {
  PageHeader, PageShell, Panel, PanelHeader, StatGrid, Stat, EmptyState, formatEuro,
} from '@/components/dashboard/ui';

interface Metrics {
  totalUsers: number;
  newUsers30d: number;
  totalBarbershops: number;
  visibleBarbershops: number;
  newBarbershops30d: number;
  totalBookings: number;
  bookings30d: number;
  bookings7d: number;
  monthlyRevenue: number;
  totalReviews: number;
  avgRating: number;
}

interface Barbershop {
  id: string;
  name: string;
  city: string;
  rating: string;
  reviewCount: number;
  bookingCount: number;
}

interface ActivityItem {
  type: string;
  name: string;
  createdAt: Date;
}

interface AnalyticsClientProps {
  metrics: Metrics;
  topBarbershops: Barbershop[];
  recentActivity: ActivityItem[];
  locale: string;
}

const ACTIVITY: Record<string, { label: string; icon: typeof Users }> = {
  user: { label: 'Nouvel utilisateur', icon: Users },
  barbershop: { label: 'Nouveau salon', icon: Store },
  booking: { label: 'Nouvelle réservation', icon: Calendar },
};

function timeAgo(date: Date | string) {
  const diff = Date.now() - new Date(date).getTime();
  const minutes = Math.round(diff / 60000);
  if (minutes < 1) return 'à l’instant';
  if (minutes < 60) return `il y a ${minutes} min`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `il y a ${hours} h`;
  const days = Math.round(hours / 24);
  if (days < 7) return `il y a ${days} j`;
  return new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

export function AnalyticsClient({ metrics, topBarbershops, recentActivity, locale }: AnalyticsClientProps) {
  const t = useTranslations('admin');
  const ranked = topBarbershops.filter(b => Number(b.bookingCount) > 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <PageHeader title={t('systemAnalytics')} description="Chiffres de la plateforme. Les évolutions portent sur les 30 derniers jours." />

      <PageShell className="space-y-6">
        <StatGrid>
          <Stat label="Réservations" icon={Calendar} value={metrics.totalBookings} hint={`+${metrics.bookings30d} sur 30 jours, dont ${metrics.bookings7d} cette semaine`} />
          <Stat label="Utilisateurs" icon={Users} value={metrics.totalUsers} hint={`+${metrics.newUsers30d} sur 30 jours`} />
          <Stat
            label="Salons visibles"
            icon={Store}
            value={`${metrics.visibleBarbershops}/${metrics.totalBarbershops}`}
            hint={`+${metrics.newBarbershops30d} nouveaux sur 30 jours`}
          />
          <Stat label="Revenu mensuel" icon={TrendingUp} value={formatEuro(metrics.monthlyRevenue)} hint={`soit ${formatEuro(metrics.monthlyRevenue * 12)} par an`} />
        </StatGrid>

        <div className="grid items-start gap-6 lg:grid-cols-5">
          <Panel className="lg:col-span-3">
            <PanelHeader
              title={t('topPerformingBarbershops')}
              description={
                metrics.totalReviews > 0
                  ? `Classés par nombre de réservations. Note moyenne de la plateforme : ${metrics.avgRating.toFixed(1)} sur ${metrics.totalReviews} avis.`
                  : 'Classés par nombre de réservations.'
              }
              actions={
                <Link href={`/${locale}/admin/barbershops`} className="inline-flex items-center gap-1 text-sm font-medium text-primary-700 hover:text-primary-800">
                  Tous les salons
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              }
            />
            {ranked.length === 0 ? (
              <EmptyState icon={Store} title="Aucune réservation pour l’instant" description="Le classement apparaîtra dès les premières réservations." />
            ) : (
              <ol className="divide-y divide-gray-100">
                {ranked.map((shop, index) => (
                  <li key={shop.id} className="flex items-center gap-4 px-5 py-3 sm:px-6">
                    <span className="w-6 text-right font-display text-sm font-semibold tabular-nums text-gray-400">{index + 1}</span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-gray-900">{shop.name}</p>
                      <p className="truncate text-xs text-gray-500">{shop.city}</p>
                    </div>
                    {parseFloat(shop.rating) > 0 && (
                      <span className="hidden items-center gap-1 text-xs tabular-nums text-gray-500 sm:inline-flex">
                        <Star className="h-3.5 w-3.5 fill-primary-500 text-primary-500" />
                        {parseFloat(shop.rating).toFixed(1)}
                      </span>
                    )}
                    <span className="w-24 text-right text-sm tabular-nums text-gray-900">
                      <span className="font-semibold">{shop.bookingCount}</span>
                      <span className="text-gray-500"> résa.</span>
                    </span>
                  </li>
                ))}
              </ol>
            )}
          </Panel>

          <Panel className="lg:col-span-2">
            <PanelHeader title={t('recentActivity')} />
            {recentActivity.length === 0 ? (
              <EmptyState title="Aucune activité récente" />
            ) : (
              <ul className="divide-y divide-gray-100">
                {recentActivity.slice(0, 12).map((item, index) => {
                  const meta = ACTIVITY[item.type] ?? { label: item.type, icon: Calendar };
                  return (
                    <li key={index} className="flex items-center gap-3 px-5 py-3 sm:px-6">
                      <span className="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-500">
                        <meta.icon className="h-4 w-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm text-gray-900">{item.name}</p>
                        <p className="text-xs text-gray-500">{meta.label}</p>
                      </div>
                      <time dateTime={new Date(item.createdAt).toISOString()} className="flex-shrink-0 text-xs tabular-nums text-gray-500">
                        {timeAgo(item.createdAt)}
                      </time>
                    </li>
                  );
                })}
              </ul>
            )}
          </Panel>
        </div>
      </PageShell>

      <Footer />
    </div>
  );
}
