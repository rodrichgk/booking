'use client';

import { useMemo, useState } from 'react';
import { Link, useRouter } from '@/routing';
import {
  ArrowLeft, CalendarCheck, Mail, Phone, Send, Edit3, Check, X, MessageSquare, Scissors, User,
} from 'lucide-react';
import { Header } from '@/components/ui/header';
import { Footer } from '@/components/ui/footer';
import { useToast } from '@/hooks/use-toast';
import { useConfirm } from '@/components/dashboard/confirm-dialog';
import {
  PageHeader, PageShell, Tabs, Panel, Badge, EmptyState, Spinner,
  btn, inputClass, backLinkClass, formatEuro, type BadgeTone,
} from '@/components/dashboard/ui';

interface Barbershop {
  id: string;
  name: string;
  city: string;
  address: string;
}

interface Booking {
  id: string;
  startTime: Date;
  endTime: Date;
  status: string | null;
  notes: string | null;
  customerName: string | null;
  customerEmail: string | null;
  customerPhone: string | null;
  createdAt: Date;
  serviceName: string | null;
  servicePrice: string | null;
  serviceDuration: number | null;
  barberName: string | null;
}

interface BookingsManagementClientProps {
  shop: Barbershop;
  bookings: Booking[];
  locale: string;
}

type Filter = 'upcoming' | 'past' | 'cancelled' | 'all';

const STATUS: Record<string, { label: string; tone: BadgeTone }> = {
  confirmed: { label: 'Confirmé', tone: 'success' },
  completed: { label: 'Terminé', tone: 'neutral' },
  cancelled: { label: 'Annulé', tone: 'danger' },
  pending: { label: 'En attente', tone: 'warning' },
};

const dayKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;

function dayLabel(d: Date, now: Date) {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diff = Math.round((target.getTime() - today.getTime()) / 86_400_000);
  const long = d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: d.getFullYear() !== now.getFullYear() ? 'numeric' : undefined });
  if (diff === 0) return `Aujourd'hui, ${long}`;
  if (diff === 1) return `Demain, ${long}`;
  if (diff === -1) return `Hier, ${long}`;
  return long.charAt(0).toUpperCase() + long.slice(1);
}

const toLocalInput = (date: Date) => {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

export function BookingsManagementClient({ shop, bookings }: BookingsManagementClientProps) {
  const router = useRouter();
  const { toast } = useToast();
  const confirm = useConfirm();
  const [filter, setFilter] = useState<Filter>('upcoming');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [editingTimeId, setEditingTimeId] = useState<string | null>(null);
  const [newDateTime, setNewDateTime] = useState('');

  const now = useMemo(() => new Date(), []);

  const run = async (bookingId: string, action: () => Promise<Response>, success: string, fallbackError: string) => {
    setProcessingId(bookingId);
    try {
      const response = await action();
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || fallbackError);
      toast({ variant: 'success', title: success });
      return true;
    } catch (err) {
      toast({ variant: 'error', title: 'Erreur', description: err instanceof Error ? err.message : 'Une erreur est survenue' });
      return false;
    } finally {
      setProcessingId(null);
    }
  };

  const handleCancelBooking = async (booking: Booking) => {
    const ok = await confirm({
      title: 'Annuler ce rendez-vous ?',
      description: `${booking.customerName || 'Le client'}, ${new Date(booking.startTime).toLocaleString('fr-FR', { dateStyle: 'full', timeStyle: 'short' })}.`,
      confirmLabel: 'Annuler le rendez-vous',
      cancelLabel: 'Garder',
      tone: 'danger',
    });
    if (!ok) return;
    if (await run(booking.id, () => fetch(`/api/bookings/${booking.id}`, { method: 'DELETE' }), 'Rendez-vous annulé', "Impossible d'annuler")) {
      router.refresh();
    }
  };

  const handleMarkCompleted = async (bookingId: string) => {
    const done = await run(
      bookingId,
      () => fetch(`/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'completed' }),
      }),
      'Rendez-vous marqué comme terminé',
      'Impossible de mettre à jour'
    );
    if (done) router.refresh();
  };

  const handleResendEmail = (bookingId: string) =>
    run(bookingId, () => fetch(`/api/bookings/${bookingId}/resend-email`, { method: 'POST' }), 'Emails de confirmation renvoyés', 'Échec du renvoi des emails');

  const handleSaveTime = async (bookingId: string) => {
    if (!newDateTime) return;
    const done = await run(
      bookingId,
      () => fetch(`/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ startTime: new Date(newDateTime).toISOString() }),
      }),
      'Horaire modifié, le client a été prévenu par email',
      'Échec de la modification'
    );
    if (done) {
      setEditingTimeId(null);
      router.refresh();
    }
  };

  const counts = useMemo(() => ({
    upcoming: bookings.filter(b => new Date(b.startTime) >= now && b.status !== 'cancelled').length,
    past: bookings.filter(b => new Date(b.startTime) < now && b.status !== 'cancelled').length,
    cancelled: bookings.filter(b => b.status === 'cancelled').length,
    all: bookings.length,
  }), [bookings, now]);

  // Upcoming reads forward in time (next appointment first); everything else newest first.
  const groups = useMemo(() => {
    const list = bookings
      .filter((b) => {
        const d = new Date(b.startTime);
        if (filter === 'upcoming') return d >= now && b.status !== 'cancelled';
        if (filter === 'past') return d < now && b.status !== 'cancelled';
        if (filter === 'cancelled') return b.status === 'cancelled';
        return true;
      })
      .sort((a, b) => {
        const diff = new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
        return filter === 'upcoming' ? diff : -diff;
      });

    const byDay = new Map<string, { date: Date; items: Booking[] }>();
    for (const booking of list) {
      const d = new Date(booking.startTime);
      const key = dayKey(d);
      if (!byDay.has(key)) byDay.set(key, { date: d, items: [] });
      byDay.get(key)!.items.push(booking);
    }
    return Array.from(byDay.values());
  }, [bookings, filter, now]);

  const emptyCopy: Record<Filter, { title: string; description: string }> = {
    upcoming: { title: 'Aucun rendez-vous à venir', description: 'Les nouvelles réservations de vos clients apparaîtront ici.' },
    past: { title: 'Aucun rendez-vous passé', description: 'L’historique des rendez-vous honorés s’affichera ici.' },
    cancelled: { title: 'Aucune annulation', description: 'Les rendez-vous annulés s’afficheront ici.' },
    all: { title: 'Aucune réservation', description: 'Les réservations de vos clients apparaîtront ici.' },
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <PageHeader
        title="Réservations"
        description={`${shop.name}, ${shop.city}`}
        back={
          <Link href={`/my-space/${shop.id}`} className={backLinkClass} aria-label="Retour au salon">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        }
      >
        <Tabs<Filter>
          active={filter}
          onChange={setFilter}
          tabs={[
            { id: 'upcoming', label: 'À venir', count: counts.upcoming },
            { id: 'past', label: 'Passés', count: counts.past },
            { id: 'cancelled', label: 'Annulés', count: counts.cancelled },
            { id: 'all', label: 'Tous', count: counts.all },
          ]}
        />
      </PageHeader>

      <PageShell>
        {groups.length === 0 ? (
          <Panel>
            <EmptyState icon={CalendarCheck} title={emptyCopy[filter].title} description={emptyCopy[filter].description} />
          </Panel>
        ) : (
          <div className="space-y-8">
            {groups.map((group) => (
              <section key={dayKey(group.date)} aria-labelledby={`day-${dayKey(group.date)}`}>
                <div className="mb-3 flex items-baseline justify-between">
                  <h2 id={`day-${dayKey(group.date)}`} className="font-display text-sm font-semibold text-gray-900">
                    {dayLabel(group.date, now)}
                  </h2>
                  <span className="text-xs tabular-nums text-gray-500">
                    {group.items.length} rendez-vous
                  </span>
                </div>
                <Panel>
                  <ul className="divide-y divide-gray-100">
                    {group.items.map((booking) => {
                      const start = new Date(booking.startTime);
                      const isPast = start < now;
                      const isBusy = processingId === booking.id;
                      const isConfirmed = booking.status === 'confirmed';
                      // Upcoming + confirmed is the normal case, so it carries no badge.
                      // A past appointment still "confirmed" was never closed out.
                      const status = isConfirmed
                        ? isPast ? { label: 'À clôturer', tone: 'warning' as BadgeTone } : null
                        : STATUS[booking.status || 'pending'] ?? { label: booking.status || 'En attente', tone: 'neutral' as BadgeTone };
                      const isEditing = editingTimeId === booking.id;

                      return (
                        <li key={booking.id} className="grid gap-4 px-5 py-4 sm:px-6 lg:grid-cols-[5.5rem_1fr_auto] lg:items-start">
                          <div className="flex items-center gap-3 lg:block">
                            <p className="font-display text-lg font-semibold tabular-nums text-gray-900">
                              {start.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                            {booking.serviceDuration ? (
                              <p className="text-xs tabular-nums text-gray-500">{booking.serviceDuration} min</p>
                            ) : null}
                          </div>

                          <div className="min-w-0 space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="font-medium text-gray-900">{booking.customerName || 'Client'}</p>
                              {status && <Badge tone={status.tone}>{status.label}</Badge>}
                            </div>
                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600">
                              <span className="inline-flex items-center gap-1.5">
                                <Scissors className="h-3.5 w-3.5 text-gray-400" />
                                {booking.serviceName || 'Service non précisé'}
                                {booking.servicePrice && <span className="tabular-nums text-gray-500">({formatEuro(booking.servicePrice)})</span>}
                              </span>
                              <span className="inline-flex items-center gap-1.5">
                                <User className="h-3.5 w-3.5 text-gray-400" />
                                {booking.barberName || 'Sans préférence'}
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
                              {booking.customerPhone && (
                                <a href={`tel:${booking.customerPhone}`} className="inline-flex items-center gap-1.5 text-gray-600 hover:text-primary-700">
                                  <Phone className="h-3.5 w-3.5 text-gray-400" />
                                  {booking.customerPhone}
                                </a>
                              )}
                              {booking.customerEmail && (
                                <a href={`mailto:${booking.customerEmail}`} className="inline-flex min-w-0 items-center gap-1.5 text-gray-600 hover:text-primary-700">
                                  <Mail className="h-3.5 w-3.5 flex-shrink-0 text-gray-400" />
                                  <span className="truncate">{booking.customerEmail}</span>
                                </a>
                              )}
                            </div>
                            {booking.notes && (
                              <p className="flex gap-2 rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-700">
                                <MessageSquare className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-gray-400" />
                                <span className="break-words">{booking.notes}</span>
                              </p>
                            )}
                            {isEditing && (
                              <form
                                className="flex flex-col gap-2 pt-1 sm:flex-row sm:items-center"
                                onSubmit={(e) => {
                                  e.preventDefault();
                                  handleSaveTime(booking.id);
                                }}
                              >
                                <label htmlFor={`time-${booking.id}`} className="sr-only">Nouvel horaire</label>
                                <input
                                  id={`time-${booking.id}`}
                                  type="datetime-local"
                                  value={newDateTime}
                                  onChange={(e) => setNewDateTime(e.target.value)}
                                  className={`${inputClass} sm:w-60`}
                                />
                                <div className="flex gap-2">
                                  <button type="submit" disabled={isBusy} className={`${btn.primary} ${btn.sm}`}>
                                    {isBusy ? <Spinner className="h-3 w-3" /> : <Check className="h-3.5 w-3.5" />}
                                    Valider
                                  </button>
                                  <button type="button" onClick={() => setEditingTimeId(null)} className={`${btn.secondary} ${btn.sm}`}>
                                    Annuler
                                  </button>
                                </div>
                              </form>
                            )}
                          </div>

                          {isConfirmed && !isEditing && (
                            <div className="flex flex-wrap items-center gap-1 lg:justify-end">
                              {isPast ? (
                                <button onClick={() => handleMarkCompleted(booking.id)} disabled={isBusy} className={`${btn.secondary} ${btn.sm}`}>
                                  {isBusy ? <Spinner className="h-3 w-3" /> : <Check className="h-3.5 w-3.5" />}
                                  Marquer terminé
                                </button>
                              ) : (
                                <>
                                  <button
                                    onClick={() => {
                                      setNewDateTime(toLocalInput(start));
                                      setEditingTimeId(booking.id);
                                    }}
                                    disabled={isBusy}
                                    className={`${btn.ghost} ${btn.sm}`}
                                  >
                                    <Edit3 className="h-3.5 w-3.5" />
                                    Déplacer
                                  </button>
                                  <button onClick={() => handleResendEmail(booking.id)} disabled={isBusy} className={`${btn.ghost} ${btn.sm}`}>
                                    {isBusy ? <Spinner className="h-3 w-3" /> : <Send className="h-3.5 w-3.5" />}
                                    Renvoyer l&apos;email
                                  </button>
                                  <button onClick={() => handleCancelBooking(booking)} disabled={isBusy} className={`${btn.dangerGhost} ${btn.sm}`}>
                                    <X className="h-3.5 w-3.5" />
                                    Annuler
                                  </button>
                                </>
                              )}
                            </div>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </Panel>
              </section>
            ))}
          </div>
        )}
      </PageShell>

      <Footer />
    </div>
  );
}
