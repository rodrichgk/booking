'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/routing';
import { barberTypeLabel } from '@/lib/barber-types';
import { Check, ChevronLeft, ChevronRight, CalendarCheck, MapPin, Users } from 'lucide-react';
import { Header } from '@/components/ui/header';
import { Footer } from '@/components/ui/footer';
import { useToast } from '@/hooks/use-toast';
import { PublicShell, Media } from '@/components/public/ui';
import { btn, formatEuro, inputClass, Spinner } from '@/components/dashboard/ui';
import { SERVICE_CATEGORIES, categoryName, formatDuration } from '@/lib/service-categories';
import { formatTime, type OpeningHours } from '@/lib/opening-hours';
import { cn } from '@/lib/utils';

interface Barbershop {
  id: string;
  name: string;
  address: string;
  city: string;
  isActive: boolean;
  openingHours: OpeningHours | null;
}

interface Barber {
  id: string;
  name: string | null;
  profileImage?: string | null;
  barberType?: string | null;
  specialties: string[] | null;
  isActive: boolean;
  openingHours?: OpeningHours | null;
}

interface Service {
  id: string;
  name: string;
  description: string | null;
  price: string;
  duration: number;
  category: string | null;
}

interface UserInfo {
  name: string;
  email: string;
  phone: string;
}

interface BookingClientProps {
  shop: Barbershop;
  barbers: Barber[];
  services: Service[];
  locale: string;
  userInfo: UserInfo | null;
  /** YYYY-MM-DD dates on which the salon is exceptionally closed. */
  closedDates?: string[];
}

type StepId = 'service' | 'barber' | 'datetime' | 'details';
type Busy = { barberId: string | null; start: number; end: number };

const ON_SITE = 'on-site';
const ANY = 'any';
const DEFAULT_DURATION = 60;
const SLOT_STEP = 30;
const DAYS_PER_PAGE = 14;
const DAY_KEYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

const localKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const toMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + (m || 0);
};
const toHHMM = (minutes: number) => `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
const atTime = (dateKey: string, hhmm: string) => new Date(`${dateKey}T${hhmm}:00`);

/** Hours that apply on a day: the barber's own weekly hours win over the salon's. */
function hoursFor(date: Date, shopHours: OpeningHours | null, barber?: Barber) {
  const day = DAY_KEYS[date.getDay()];
  const own = barber?.openingHours?.[day];
  if (own) return own.closed ? null : own;
  const shop = shopHours?.[day];
  if (shop) return shop.closed ? null : shop;
  return shopHours ? null : { open: '09:00', close: '19:00', closed: false };
}

export function BookingClient({ shop, barbers, services, userInfo, closedDates = [] }: BookingClientProps) {
  const t = useTranslations('site.book');
  const locale = useLocale();
  const dateLocale = locale === 'en' ? 'en-GB' : 'fr-FR';
  const tm = (hhmm: string) => formatTime(hhmm, locale);
  const eur = (v: string | number) => formatEuro(v, locale);
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const activeBarbers = barbers.filter((b) => b.isActive);
  const hasBarbers = activeBarbers.length > 0;

  // Links can preselect a service (?serviceId=) and/or a barber (?barberId=).
  const initialService = services.some((s) => s.id === searchParams.get('serviceId')) ? searchParams.get('serviceId') : null;
  const initialBarber = activeBarbers.some((b) => b.id === searchParams.get('barberId')) ? searchParams.get('barberId') : null;

  const [serviceId, setServiceId] = useState<string | null>(initialService);
  const [barberId, setBarberId] = useState<string | null>(initialBarber);
  const [dateKey, setDateKey] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [busy, setBusy] = useState<Busy[]>([]);
  const [loadingBusy, setLoadingBusy] = useState(false);
  const [customerName, setCustomerName] = useState(userInfo?.name || '');
  const [customerEmail, setCustomerEmail] = useState(userInfo?.email || '');
  const [customerPhone, setCustomerPhone] = useState(userInfo?.phone || '');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  const steps: StepId[] = hasBarbers ? ['service', 'barber', 'datetime', 'details'] : ['service', 'datetime', 'details'];
  const firstOpen = !serviceId ? 'service' : hasBarbers && !barberId ? 'barber' : 'datetime';
  const [open, setOpen] = useState<StepId>(firstOpen);

  const serviceGroups = useMemo(() => {
    const groups: { id: string; label: string; items: Service[] }[] = SERVICE_CATEGORIES.map((c) => ({
      id: c.id,
      label: categoryName(c, locale),
      items: services.filter((s) => s.category === c.id),
    }));
    groups.push({ id: 'other', label: t('otherServices'), items: services.filter((s) => !SERVICE_CATEGORIES.some((c) => c.id === s.category)) });
    return groups.filter((g) => g.items.length > 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [services, locale]);

  const service = services.find((s) => s.id === serviceId);
  const barber = activeBarbers.find((b) => b.id === barberId);
  const duration = service?.duration ?? DEFAULT_DURATION;

  // Consecutive days, closed ones kept (disabled) so the calendar reads naturally.
  const days = useMemo(() => {
    const today = new Date();
    return Array.from({ length: 60 }, (_, i) => {
      const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() + i);
      const key = localKey(d);
      const open = !closedDates.includes(key) && !!hoursFor(d, shop.openingHours, barber);
      return { date: d, key, open };
    });
  }, [closedDates, shop.openingHours, barber]);

  // Load taken slots for the chosen day
  useEffect(() => {
    if (!dateKey) return;
    let active = true;
    setLoadingBusy(true);
    const from = atTime(dateKey, '00:00');
    const to = new Date(from.getTime() + 86_400_000);
    fetch(`/api/barbershops/${shop.id}/availability?from=${from.toISOString()}&to=${to.toISOString()}`)
      .then((res) => (res.ok ? res.json() : { busy: [] }))
      .then((data) => {
        if (!active) return;
        setBusy((data.busy || []).map((b: { barberId: string | null; start: string; end: string }) => ({ barberId: b.barberId, start: Date.parse(b.start), end: Date.parse(b.end) })));
      })
      .catch(() => active && setBusy([]))
      .finally(() => active && setLoadingBusy(false));
    return () => {
      active = false;
    };
  }, [dateKey, shop.id]);

  const slots = useMemo(() => {
    if (!dateKey) return [];
    const date = atTime(dateKey, '00:00');
    const hours = hoursFor(date, shop.openingHours, barber);
    if (!hours) return [];
    const now = Date.now();
    const out: { time: string; available: boolean }[] = [];
    for (let m = toMinutes(hours.open); m + duration <= toMinutes(hours.close); m += SLOT_STEP) {
      const start = atTime(dateKey, toHHMM(m)).getTime();
      if (start <= now) continue;
      const end = start + duration * 60_000;
      const overlaps = (b: Busy) => start < b.end && end > b.start;
      let available = true;
      if (barber) {
        available = !busy.some((b) => b.barberId === barber.id && overlaps(b));
      } else if (hasBarbers) {
        // "No preference": free as long as at least one barber is.
        available = activeBarbers.some((a) => !busy.some((b) => b.barberId === a.id && overlaps(b)));
      }
      out.push({ time: toHHMM(m), available });
    }
    return out;
  }, [dateKey, shop.openingHours, barber, busy, duration, hasBarbers, activeBarbers]);

  const done: Record<StepId, boolean> = {
    service: !!serviceId,
    barber: !hasBarbers || !!barberId,
    datetime: !!dateKey && !!time,
    details: !!customerName.trim() && !!customerEmail.trim() && !!customerPhone.trim(),
  };
  const canConfirm = steps.every((s) => done[s]);

  const goNext = (from: StepId) => {
    const next = steps[steps.indexOf(from) + 1];
    if (next) setOpen(next);
  };

  const dateLabel = dateKey
    ? atTime(dateKey, '00:00').toLocaleDateString(dateLocale, { weekday: 'long', day: 'numeric', month: 'long' })
    : null;

  const handleConfirm = async () => {
    if (!canConfirm || !dateKey || !time) return;
    setIsSubmitting(true);
    setError(null);
    const onSite = [serviceId === ON_SITE && 'prestation', barberId === ANY && hasBarbers && 'coiffeur'].filter(Boolean);
    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          barbershopId: shop.id,
          barberId: barber ? barber.id : null,
          serviceId: service ? service.id : null,
          appointmentDate: atTime(dateKey, time).toISOString(),
          customerName: customerName.trim(),
          customerEmail: customerEmail.trim(),
          customerPhone: customerPhone.trim(),
          notes: onSite.length ? `${notes ? `${notes}\n` : ''}[À choisir sur place : ${onSite.join(', ')}]` : notes,
        }),
      });
      const data = await response.json().catch(() => ({}));
      // 409: the slot (or the day) is no longer available.
      if (response.status === 409) throw new SlotTakenError(t('slotTaken'));
      if (!response.ok) throw new Error(data.error || t('bookingFailed'));
      setConfirmed(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      const message = err instanceof Error ? err.message : t('errorGeneric');
      setError(message);
      toast({ variant: 'error', title: t('bookingImpossible'), description: message });
      // A slot taken in the meantime: send the customer back to pick another one.
      if (err instanceof SlotTakenError) {
        setTime(null);
        setOpen('datetime');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const summary = (
    <dl className="space-y-3 text-sm">
      <SummaryRow label={t('service')} value={service ? service.name : serviceId === ON_SITE ? t('chooseOnSite') : null} empty={t('toChoose')} />
      {hasBarbers && <SummaryRow label={t('stylist')} value={barber ? barber.name : barberId === ANY ? t('noPreference') : null} empty={t('toChoose')} />}
      <SummaryRow label={t('date')} value={dateLabel && time ? t('dateAt', { date: dateLabel, time: tm(time) }) : null} empty={t('toChoose')} capitalize />
      {service && (
        <div className="flex items-baseline justify-between border-t border-gray-100 pt-3">
          <dt className="text-gray-600">{formatDuration(service.duration, locale)}</dt>
          <dd className="font-display text-lg font-semibold tabular-nums text-gray-900">{eur(service.price)}</dd>
        </div>
      )}
    </dl>
  );

  if (confirmed) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <PublicShell>
          <div className="mx-auto max-w-lg py-16">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-green-50 text-green-600">
              <CalendarCheck className="h-6 w-6" />
            </span>
            <h1 className="mt-5 font-display text-3xl font-semibold tracking-tight text-gray-900">{t('confirmedTitle')}</h1>
            <p className="mt-2 text-gray-600">
              {t.rich('confirmedText', { email: customerEmail, b: (chunks) => <strong className="font-medium text-gray-900">{chunks}</strong> })}
            </p>
            <div className="mt-8 rounded-xl border border-gray-200 bg-white p-5">
              <p className="font-medium text-gray-900">{shop.name}</p>
              <p className="mb-4 flex items-center gap-1.5 text-sm text-gray-600">
                <MapPin className="h-3.5 w-3.5 text-gray-400" />
                {shop.address}, {shop.city}
              </p>
              {summary}
            </div>
            <div className="mt-8 flex flex-wrap gap-2">
              <Link href={`/barbershops/${shop.id}`} className={btn.primary}>{t('backToSalon')}</Link>
              <Link href="/my-space" className={btn.secondary}>{t('myAppointments')}</Link>
            </div>
          </div>
        </PublicShell>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <PublicShell>
        <nav aria-label={t('breadcrumb')} className="flex items-center gap-1.5 pt-6 text-sm text-gray-500">
          <Link href="/barbershops" className="hover:text-gray-900">{t('salons')}</Link>
          <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
          <Link href={`/barbershops/${shop.id}`} className="truncate hover:text-gray-900">{shop.name}</Link>
          <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
          <span className="text-gray-900">{t('booking')}</span>
        </nav>
        <h1 className="pt-3 font-display text-3xl font-semibold tracking-tight text-gray-900">{t('title', { name: shop.name })}</h1>

        <div className="grid gap-8 py-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <ol className="space-y-3">
            {/* 1. Service */}
            <Step
              index={steps.indexOf('service') + 1}
              title={t('service')}
              open={open === 'service'}
              done={done.service}
              summary={service ? `${service.name}, ${eur(service.price)}` : serviceId === ON_SITE ? t('chooseOnSite') : undefined}
              onEdit={() => setOpen('service')}
            >
              <div className="space-y-6">
                {serviceGroups.map((group) => (
                    <div key={group.id}>
                      <p className="mb-2 text-sm font-medium text-gray-500">{group.label}</p>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {group.items.map((s) => (
                          <Choice
                            key={s.id}
                            selected={serviceId === s.id}
                            onClick={() => {
                              setServiceId(s.id);
                              setTime(null);
                              goNext('service');
                            }}
                          >
                            <span className="flex items-baseline justify-between gap-3">
                              <span className="font-medium text-gray-900">{s.name}</span>
                              <span className="flex-shrink-0 text-sm font-medium tabular-nums text-gray-900">{eur(s.price)}</span>
                            </span>
                            {s.description && <span className="mt-0.5 line-clamp-2 block text-sm text-gray-600">{s.description}</span>}
                            <span className="mt-1 block text-xs text-gray-500">{formatDuration(s.duration, locale)}</span>
                          </Choice>
                        ))}
                      </div>
                    </div>
                  ))}
                <Choice
                  dashed
                  selected={serviceId === ON_SITE}
                  onClick={() => {
                    setServiceId(ON_SITE);
                    setTime(null);
                    goNext('service');
                  }}
                >
                  <span className="font-medium text-gray-900">{t('onSiteTitle')}</span>
                  <span className="block text-sm text-gray-600">{t('onSiteText')}</span>
                </Choice>
              </div>
            </Step>

            {/* 2. Barber */}
            {hasBarbers && (
              <Step
                index={steps.indexOf('barber') + 1}
                title={t('stylist')}
                open={open === 'barber'}
                done={done.barber}
                summary={barber ? barber.name ?? undefined : barberId === ANY ? t('noPreference') : undefined}
                onEdit={() => setOpen('barber')}
                locked={!done.service}
              >
                <div className="grid gap-2 sm:grid-cols-2">
                  <Choice
                    selected={barberId === ANY}
                    onClick={() => {
                      setBarberId(ANY);
                      setTime(null);
                      goNext('barber');
                    }}
                  >
                    <span className="flex items-center gap-3">
                      <span className="inline-flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-500">
                        <Users className="h-5 w-5" />
                      </span>
                      <span>
                        <span className="block font-medium text-gray-900">{t('noPreference')}</span>
                        <span className="block text-sm text-gray-600">{t('firstAvailable')}</span>
                      </span>
                    </span>
                  </Choice>
                  {activeBarbers.map((b) => (
                    <Choice
                      key={b.id}
                      selected={barberId === b.id}
                      onClick={() => {
                        setBarberId(b.id);
                        setTime(null);
                        goNext('barber');
                      }}
                    >
                      <span className="flex items-center gap-3">
                        <Media src={b.profileImage} name={b.name || t('stylist')} rounded="rounded-full" className="h-11 w-11 flex-shrink-0" sizes="44px" />
                        <span className="min-w-0">
                          <span className="block truncate font-medium text-gray-900">{b.name}</span>
                          <span className="block truncate text-sm text-gray-600">{barberTypeLabel(b.barberType, locale) || b.specialties?.[0] || t('stylist')}</span>
                        </span>
                      </span>
                    </Choice>
                  ))}
                </div>
              </Step>
            )}

            {/* 3. Date & time */}
            <Step
              index={steps.indexOf('datetime') + 1}
              title={t('dateTime')}
              open={open === 'datetime'}
              done={done.datetime}
              summary={dateLabel && time ? t('dateAt', { date: dateLabel, time: tm(time) }) : undefined}
              onEdit={() => setOpen('datetime')}
              locked={!done.service || !done.barber}
            >
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-medium capitalize text-gray-900">
                  {days[page * DAYS_PER_PAGE].date.toLocaleDateString(dateLocale, { month: 'long', year: 'numeric' })}
                </p>
                <div className="flex gap-1">
                  <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0} className={btn.icon} aria-label={t('previousDates')}>
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(Math.ceil(days.length / DAYS_PER_PAGE) - 1, p + 1))}
                    disabled={(page + 1) * DAYS_PER_PAGE >= days.length}
                    className={btn.icon}
                    aria-label={t('nextDates')}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-7 gap-1.5">
                {days.slice(page * DAYS_PER_PAGE, (page + 1) * DAYS_PER_PAGE).map((d) => {
                  const selected = d.key === dateKey;
                  return (
                    <button
                      key={d.key}
                      disabled={!d.open}
                      onClick={() => {
                        setDateKey(d.key);
                        setTime(null);
                      }}
                      aria-pressed={selected}
                      aria-label={d.date.toLocaleDateString(dateLocale, { weekday: 'long', day: 'numeric', month: 'long' }) + (d.open ? '' : `, ${t('closed')}`)}
                      className={cn(
                        'flex flex-col items-center rounded-lg border py-2 text-center transition-colors',
                        selected
                          ? 'border-gray-900 bg-gray-900 text-white'
                          : d.open
                            ? 'border-gray-200 bg-white text-gray-900 hover:border-gray-400'
                            : 'cursor-not-allowed border-transparent text-gray-300'
                      )}
                    >
                      <span className={cn('text-[11px] uppercase', selected ? 'text-white/70' : 'text-gray-500')}>
                        {d.date.toLocaleDateString(dateLocale, { weekday: 'short' }).replace('.', '')}
                      </span>
                      <span className="font-display text-base font-semibold tabular-nums">{d.date.getDate()}</span>
                    </button>
                  );
                })}
              </div>

              {dateKey && (
                <div className="mt-6">
                  <p className="mb-2 text-sm font-medium capitalize text-gray-900">{dateLabel}</p>
                  {loadingBusy ? (
                    <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-6">
                      {Array.from({ length: 12 }).map((_, i) => <div key={i} className="h-10 animate-pulse rounded-lg bg-gray-100" />)}
                    </div>
                  ) : slots.length === 0 || slots.every((s) => !s.available) ? (
                    <p className="rounded-lg bg-gray-50 px-4 py-3 text-sm text-gray-600">{t('noSlots')}</p>
                  ) : (
                    <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-6">
                      {slots.map((slot) => (
                        <button
                          key={slot.time}
                          disabled={!slot.available}
                          onClick={() => {
                            setTime(slot.time);
                            goNext('datetime');
                          }}
                          aria-pressed={time === slot.time}
                          className={cn(
                            'h-10 rounded-lg border text-sm font-medium tabular-nums transition-colors',
                            time === slot.time
                              ? 'border-gray-900 bg-gray-900 text-white'
                              : slot.available
                                ? 'border-gray-200 bg-white text-gray-900 hover:border-gray-400'
                                : 'cursor-not-allowed border-transparent bg-gray-50 text-gray-300 line-through'
                          )}
                        >
                          {tm(slot.time)}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </Step>

            {/* 4. Contact */}
            <Step
              index={steps.indexOf('details') + 1}
              title={t('details')}
              open={open === 'details'}
              done={done.details && open !== 'details'}
              summary={done.details ? `${customerName}, ${customerPhone}` : undefined}
              onEdit={() => setOpen('details')}
              locked={!done.datetime}
            >
              <form
                className="grid gap-4 sm:grid-cols-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleConfirm();
                }}
              >
                <Field id="bk-name" label={t('fullName')} value={customerName} onChange={setCustomerName} autoComplete="name" required />
                <Field id="bk-phone" label={t('phone')} type="tel" value={customerPhone} onChange={setCustomerPhone} autoComplete="tel" placeholder="06 12 34 56 78" required />
                <Field id="bk-email" label={t('email')} type="email" value={customerEmail} onChange={setCustomerEmail} autoComplete="email" placeholder={t('emailPlaceholder')} required className="sm:col-span-2" />
                <div className="sm:col-span-2">
                  <label htmlFor="bk-notes" className="mb-1.5 block text-sm font-medium text-gray-800">
                    {t('notes')} <span className="font-normal text-gray-500">{t('optional')}</span>
                  </label>
                  <textarea
                    id="bk-notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    placeholder={t('notesPlaceholder')}
                    className={cn(inputClass, 'resize-none')}
                  />
                </div>
                <button type="submit" className="hidden" aria-hidden="true" tabIndex={-1} />
              </form>
            </Step>
          </ol>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <p className="font-display text-base font-semibold text-gray-900">{shop.name}</p>
              <p className="mb-4 flex items-center gap-1.5 text-sm text-gray-600">
                <MapPin className="h-3.5 w-3.5 flex-shrink-0 text-gray-400" />
                <span className="truncate">{shop.address}, {shop.city}</span>
              </p>
              {summary}
              {error && <p role="alert" className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
              <button onClick={handleConfirm} disabled={!canConfirm || isSubmitting} className={cn(btn.primary, 'mt-5 w-full py-2.5')}>
                {isSubmitting && <Spinner className="h-4 w-4" />}
                {t('confirm')}
              </button>
              <p className="mt-3 text-center text-xs text-gray-500">{t('payAtSalon')}</p>
            </div>
          </aside>
        </div>
      </PublicShell>

      <Footer />
    </div>
  );
}

/** Thrown when the booking API answers 409 (slot or day no longer available). */
class SlotTakenError extends Error {}

function Step({
  index,
  title,
  open,
  done,
  summary,
  onEdit,
  locked,
  children,
}: {
  index: number;
  title: string;
  open: boolean;
  done: boolean;
  summary?: string;
  onEdit: () => void;
  locked?: boolean;
  children: React.ReactNode;
}) {
  const t = useTranslations('site.book');
  return (
    <li className={cn('rounded-xl border bg-white', open ? 'border-gray-300' : 'border-gray-200')}>
      <div className="flex items-center gap-3 px-5 py-4">
        <span
          className={cn(
            'inline-flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-sm font-semibold tabular-nums',
            done && !open ? 'bg-primary-50 text-primary-700' : open ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-400'
          )}
        >
          {done && !open ? <Check className="h-4 w-4" /> : index}
        </span>
        <div className="min-w-0 flex-1">
          <h2 className={cn('font-display text-base font-semibold', locked && !open ? 'text-gray-400' : 'text-gray-900')}>{title}</h2>
          {!open && summary && <p className="truncate text-sm text-gray-600 first-letter:uppercase">{summary}</p>}
        </div>
        {!open && done && (
          <button onClick={onEdit} className={cn(btn.ghost, btn.sm)}>
            {t('edit')}
          </button>
        )}
      </div>
      {open && <div className="border-t border-gray-100 px-5 pb-5 pt-4">{children}</div>}
    </li>
  );
}

function Choice({ selected, onClick, dashed, children }: { selected: boolean; onClick: () => void; dashed?: boolean; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        'block w-full rounded-lg border px-4 py-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
        selected ? 'border-primary-500 bg-primary-50/60 ring-1 ring-primary-500' : dashed ? 'border-dashed border-gray-300 hover:border-gray-400' : 'border-gray-200 hover:border-gray-400'
      )}
    >
      {children}
    </button>
  );
}

function SummaryRow({ label, value, empty, capitalize }: { label: string; value: string | null | undefined; empty: string; capitalize?: boolean }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-gray-500">{label}</dt>
      <dd className={cn('text-right', value ? 'text-gray-900' : 'text-gray-400', capitalize && value && 'first-letter:uppercase')}>{value || empty}</dd>
    </div>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  className,
  ...props
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  className?: string;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'className' | 'id'>) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-gray-800">{label}</label>
      <input id={id} value={value} onChange={(e) => onChange(e.target.value)} className={inputClass} {...props} />
    </div>
  );
}
