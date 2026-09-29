'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Store, Search, Star, Mail, Phone, MapPin, Eye, EyeOff, Plus, Scissors, TrendingUp, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { Header } from '@/components/ui/header';
import { Footer } from '@/components/ui/footer';
import { useToast } from '@/hooks/use-toast';
import { useConfirm } from '@/components/dashboard/confirm-dialog';
import {
  PageHeader, PageShell, Tabs, Panel, StatGrid, Stat, Badge, EmptyState, Spinner,
  btn, inputClass, formatEuro, type BadgeTone,
} from '@/components/dashboard/ui';

interface Barbershop {
  id: string;
  name: string;
  description: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  website: string;
  rating: string;
  reviewCount: number;
  isActive: boolean;
  createdAt: string;
  ownerName: string | null;
  ownerEmail: string | null;
  ownerPhone: string;
  barberCount: number;
  subscriptionStatus: string;
  subscriptionExpiry: string;
}

interface BarbershopManagementClientProps {
  initialBarbershops: Barbershop[];
  locale: string;
  currentUserRole: string;
  subscriptionPrice: number;
}

type StatusFilter = 'all' | 'active' | 'attention' | 'inactive';

const SUBSCRIPTION: Record<string, { label: string; tone: BadgeTone }> = {
  active: { label: 'Actif', tone: 'success' },
  past_due: { label: 'Paiement en retard', tone: 'warning' },
  expired: { label: 'Expiré', tone: 'danger' },
  canceled: { label: 'Annulé', tone: 'neutral' },
  inactive: { label: 'En attente', tone: 'neutral' },
};

// Shops an admin should look at: payment problems or lapsed subscriptions.
const needsAttention = (s: string) => s === 'past_due' || s === 'expired' || s === 'canceled';

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });

export function BarbershopManagementClient({ initialBarbershops, locale, subscriptionPrice }: BarbershopManagementClientProps) {
  const t = useTranslations('admin');
  const { toast } = useToast();
  const confirm = useConfirm();
  const [barbershops, setBarbershops] = useState(initialBarbershops);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [busyId, setBusyId] = useState<string | null>(null);

  const summary = useMemo(() => {
    const active = barbershops.filter(b => b.subscriptionStatus === 'active');
    const rated = barbershops.filter(b => parseFloat(b.rating) > 0);
    return {
      active: active.length,
      visible: barbershops.filter(b => b.isActive).length,
      attention: barbershops.filter(b => needsAttention(b.subscriptionStatus)).length,
      inactive: barbershops.filter(b => b.subscriptionStatus === 'inactive').length,
      barbers: barbershops.reduce((acc, b) => acc + (Number(b.barberCount) || 0), 0),
      avgRating: rated.length ? rated.reduce((acc, b) => acc + parseFloat(b.rating), 0) / rated.length : null,
    };
  }, [barbershops]);

  const filtered = barbershops.filter((shop) => {
    const q = searchTerm.trim().toLowerCase();
    const matchesSearch = !q || [shop.name, shop.ownerName, shop.ownerEmail, shop.city, shop.address]
      .some((value) => value?.toLowerCase().includes(q));
    const matchesStatus =
      statusFilter === 'all'
      || (statusFilter === 'active' && shop.subscriptionStatus === 'active')
      || (statusFilter === 'attention' && needsAttention(shop.subscriptionStatus))
      || (statusFilter === 'inactive' && shop.subscriptionStatus === 'inactive');
    return matchesSearch && matchesStatus;
  });

  const handleVisibilityToggle = async (shop: Barbershop) => {
    const ok = await confirm(
      shop.isActive
        ? { title: `Masquer ${shop.name} ?`, description: 'Le salon ne sera plus visible pour les clients.', confirmLabel: 'Masquer', tone: 'danger' }
        : { title: `Rendre ${shop.name} visible ?`, confirmLabel: 'Rendre visible' }
    );
    if (!ok) return;

    setBusyId(shop.id);
    try {
      const response = await fetch(`/api/barbershops/${shop.id}/toggle-status`, { method: 'POST' });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Mise à jour impossible');
      setBarbershops(prev => prev.map(b => (b.id === shop.id ? { ...b, isActive: data.isActive } : b)));
      toast({ variant: 'success', title: data.message || 'Visibilité mise à jour' });
    } catch (err) {
      toast({ variant: 'error', title: 'Erreur', description: err instanceof Error ? err.message : 'Une erreur est survenue' });
    } finally {
      setBusyId(null);
    }
  };

  const handleSubscriptionToggle = async (shop: Barbershop) => {
    const action = shop.subscriptionStatus === 'active' ? 'deactivate' : 'activate';
    const ok = await confirm(
      action === 'activate'
        ? { title: `Activer l’abonnement de ${shop.name} ?`, description: 'L’abonnement est activé manuellement pour 30 jours, sans paiement.', confirmLabel: 'Activer 30 jours' }
        : { title: `Désactiver l’abonnement de ${shop.name} ?`, description: 'Le salon devra repasser par le paiement pour redevenir actif.', confirmLabel: 'Désactiver', tone: 'danger' }
    );
    if (!ok) return;

    setBusyId(shop.id);
    try {
      const response = await fetch(`/api/admin/barbershops/${shop.id}/subscription`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Mise à jour impossible');
      toast({ variant: 'success', title: data.message || 'Abonnement mis à jour' });
      window.location.reload();
    } catch (err) {
      toast({ variant: 'error', title: 'Erreur', description: err instanceof Error ? err.message : 'Une erreur est survenue' });
      setBusyId(null);
    }
  };

  const tabs: { id: StatusFilter; label: string; count: number }[] = [
    { id: 'all', label: 'Tous', count: barbershops.length },
    { id: 'active', label: 'Actifs', count: summary.active },
    { id: 'attention', label: 'À régulariser', count: summary.attention },
    { id: 'inactive', label: 'En attente', count: summary.inactive },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <PageHeader
        title="Salons"
        description={`Abonnement à ${formatEuro(subscriptionPrice)} par mois et par salon.`}
        actions={
          <Link href={`/${locale}/admin/barbershops/new`} className={btn.primary}>
            <Plus className="h-4 w-4" />
            Ajouter un salon
          </Link>
        }
      >
        <Tabs tabs={tabs} active={statusFilter} onChange={setStatusFilter} />
      </PageHeader>

      <PageShell className="space-y-6">
        <StatGrid>
          <Stat label="Abonnements actifs" icon={CheckCircle} value={summary.active} hint={`${summary.visible} salons visibles`} />
          <Stat label="Revenu mensuel" icon={TrendingUp} value={formatEuro(summary.active * subscriptionPrice)} hint="abonnements actifs" />
          <Stat label="Coiffeurs" icon={Scissors} value={summary.barbers} hint="dans tous les salons" />
          <Stat label="Note moyenne" icon={Star} value={summary.avgRating ? summary.avgRating.toFixed(1) : '-'} hint="salons ayant des avis" />
        </StatGrid>

        <div className="relative max-w-md">
          <label htmlFor="shop-search" className="sr-only">{t('searchBarbershops')}</label>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            id="shop-search"
            type="search"
            placeholder={t('searchBarbershops')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`${inputClass} pl-9`}
          />
        </div>

        <Panel className="overflow-hidden">
          {filtered.length === 0 ? (
            <EmptyState icon={Store} title={t('noBarbershopsFound')} description={t('tryDifferentFilter')} />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-gray-200 bg-gray-50 text-xs font-medium text-gray-500">
                  <tr>
                    <th scope="col" className="px-5 py-3 sm:px-6">Salon</th>
                    <th scope="col" className="hidden px-4 py-3 md:table-cell">Propriétaire</th>
                    <th scope="col" className="px-4 py-3">Abonnement</th>
                    <th scope="col" className="hidden px-4 py-3 lg:table-cell">Activité</th>
                    <th scope="col" className="px-4 py-3"><span className="sr-only">Actions</span></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map((shop) => {
                    const sub = SUBSCRIPTION[shop.subscriptionStatus] ?? { label: shop.subscriptionStatus, tone: 'neutral' as BadgeTone };
                    const busy = busyId === shop.id;
                    return (
                      <tr key={shop.id} className="align-top hover:bg-gray-50/60">
                        <td className="px-5 py-4 sm:px-6">
                          <p className="font-medium text-gray-900">{shop.name}</p>
                          <p className="mt-0.5 flex items-center gap-1.5 text-gray-500">
                            <MapPin className="h-3.5 w-3.5 flex-shrink-0 text-gray-400" />
                            <span className="truncate">{shop.city}</span>
                          </p>
                          {!shop.isActive && (
                            <Badge tone="warning" icon={EyeOff} className="mt-1.5">Masqué</Badge>
                          )}
                        </td>
                        <td className="hidden px-4 py-4 md:table-cell">
                          {shop.ownerName ? (
                            <>
                              <p className="text-gray-900">{shop.ownerName}</p>
                              <p className="mt-0.5 flex items-center gap-1.5 text-gray-500">
                                <Mail className="h-3.5 w-3.5 text-gray-400" />
                                {shop.ownerEmail}
                              </p>
                              {shop.ownerPhone && (
                                <p className="mt-0.5 flex items-center gap-1.5 text-gray-500">
                                  <Phone className="h-3.5 w-3.5 text-gray-400" />
                                  {shop.ownerPhone}
                                </p>
                              )}
                            </>
                          ) : (
                            <span className="text-gray-400">Aucun propriétaire</span>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          <Badge tone={sub.tone}>{sub.label}</Badge>
                          <p className="mt-1 whitespace-nowrap text-xs tabular-nums text-gray-500">
                            {shop.subscriptionStatus === 'active' ? 'Jusqu’au' : 'Échéance'} {formatDate(shop.subscriptionExpiry)}
                          </p>
                        </td>
                        <td className="hidden px-4 py-4 text-gray-600 lg:table-cell">
                          <p className="flex items-center gap-1.5 tabular-nums">
                            <Star className="h-3.5 w-3.5 text-gray-400" />
                            {parseFloat(shop.rating) > 0 ? `${parseFloat(shop.rating).toFixed(1)} (${shop.reviewCount} avis)` : 'Pas d’avis'}
                          </p>
                          <p className="mt-0.5 flex items-center gap-1.5 tabular-nums">
                            <Scissors className="h-3.5 w-3.5 text-gray-400" />
                            {shop.barberCount} coiffeur{Number(shop.barberCount) > 1 ? 's' : ''}
                          </p>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => handleSubscriptionToggle(shop)}
                                disabled={busy}
                                className={`${btn.ghost} ${btn.sm}`}
                                title={shop.subscriptionStatus === 'active' ? 'Suspendre l’abonnement' : 'Activer l’abonnement 30 jours'}
                              >
                                {busy && <Spinner className="h-3 w-3" />}
                                {shop.subscriptionStatus === 'active' ? 'Suspendre' : 'Activer'}
                              </button>
                              <button
                                onClick={() => handleVisibilityToggle(shop)}
                                disabled={busy}
                                className={btn.icon}
                                aria-label={shop.isActive ? `Masquer ${shop.name}` : `Rendre ${shop.name} visible`}
                                title={shop.isActive ? 'Masquer' : 'Rendre visible'}
                              >
                                {shop.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </button>
                              <Link href={`/${locale}/my-space/${shop.id}`} className={`${btn.secondary} ${btn.sm} ml-1`}>
                                Gérer
                              </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Panel>
      </PageShell>

      <Footer />
    </div>
  );
}
