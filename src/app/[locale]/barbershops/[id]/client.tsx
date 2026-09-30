'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/routing';
import { Star, MapPin, Phone, Mail, Globe, Share2, Calendar, ChevronRight, MessageSquare, ArrowUpRight } from 'lucide-react';
import { Header } from '@/components/ui/header';
import { Footer } from '@/components/ui/footer';
import { useToast } from '@/hooks/use-toast';
import { PublicShell, Rating, OpenStatus, Media, SectionTitle } from '@/components/public/ui';
import { btn, formatEuro, inputClass, Spinner } from '@/components/dashboard/ui';
import { SERVICE_CATEGORIES, categoryName, formatDuration } from '@/lib/service-categories';
import { barberTypeLabel } from '@/lib/barber-types';
import { WEEK, todayKey, dayName, formatTime, type OpeningHours } from '@/lib/opening-hours';
import { cn } from '@/lib/utils';

interface Barbershop {
  id: string;
  name: string;
  description: string | null;
  address: string;
  city: string;
  phone: string | null;
  email: string | null;
  website: string | null;
  images: string[] | null;
  rating: string | null;
  reviewCount: number | null;
  openingHours: OpeningHours | null;
}

interface Barber {
  id: string;
  name: string | null;
  profileImage: string | null;
  barberType: string | null;
  experience: number | null;
  rating: string | null;
}

interface Service {
  id: string;
  name: string;
  description: string | null;
  price: string;
  duration: number;
  category: string | null;
}

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  customerName: string;
  customerImage: string | null;
}

interface BarbershopDetailClientProps {
  shop: Barbershop;
  barbers: Barber[];
  services: Service[];
  locale: string;
  isAuthenticated?: boolean;
  /** Signed-in customer with a past, not yet reviewed visit here. */
  canReview?: boolean;
}

export function BarbershopDetailClient({ shop, barbers, services, isAuthenticated = false, canReview = false }: BarbershopDetailClientProps) {
  const t = useTranslations('site.salon');
  const locale = useLocale();
  const { toast } = useToast();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewed, setReviewed] = useState(false);
  const [today, setToday] = useState<string | null>(null);

  const images = shop.images ?? [];
  const bookingHref = `/barbershops/${shop.id}/booking`;
  const mapsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${shop.name}, ${shop.address}, ${shop.city}`)}`;

  useEffect(() => setToday(todayKey()), []);

  const loadReviews = async () => {
    try {
      const res = await fetch(`/api/reviews?barbershopId=${shop.id}&limit=10`);
      const data = await res.json();
      setReviews(data.reviews || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoadingReviews(false);
    }
  };

  useEffect(() => {
    loadReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shop.id]);

  const groupedServices = useMemo(() => {
    const groups = SERVICE_CATEGORIES.map((c) => ({ id: c.id as string, label: categoryName(c, locale), items: services.filter((s) => s.category === c.id) }));
    const other = services.filter((s) => !SERVICE_CATEGORIES.some((c) => c.id === s.category));
    if (other.length) groups.push({ id: 'other', label: t('otherServices'), items: other });
    return groups.filter((g) => g.items.length > 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [services, locale]);

  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: shop.name, text: `${shop.name}, ${shop.city}`, url });
      } else {
        await navigator.clipboard.writeText(url);
        toast({ variant: 'success', title: t('linkCopied') });
      }
    } catch {
      // Share sheet dismissed: nothing to do.
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingReview(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ barbershopId: shop.id, rating: reviewRating, comment: reviewComment || null }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 403) throw new Error(t('reviewAfterVisit'));
      if (!res.ok) throw new Error(data.error);
      toast({ variant: 'success', title: t('reviewThanks') });
      setShowReviewForm(false);
      setReviewComment('');
      setReviewRating(5);
      setReviewed(true);
      loadReviews();
    } catch (err) {
      toast({ variant: 'error', title: t('errorTitle'), description: err instanceof Error && err.message ? err.message : t('errorGeneric') });
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="min-h-screen bg-white pb-24 lg:pb-0">
      <Header />

      <PublicShell>
        <nav aria-label={t('breadcrumb')} className="flex items-center gap-1.5 pt-6 text-sm text-gray-500">
          <Link href="/barbershops" className="hover:text-gray-900">{t('salons')}</Link>
          <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
          <span className="truncate text-gray-900">{shop.name}</span>
        </nav>

        <header className="flex animate-fade-in-up flex-col gap-4 pt-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <h1 className="font-display text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl">{shop.name}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5">
              <Rating value={shop.rating} count={shop.reviewCount} />
              <a href={mapsHref} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-gray-600 underline-offset-2 hover:text-gray-900 hover:underline">
                <MapPin className="h-3.5 w-3.5 text-gray-400" aria-hidden="true" />
                {shop.address}, {shop.city}
              </a>
              <OpenStatus hours={shop.openingHours} />
            </div>
          </div>
          <div className="flex flex-shrink-0 gap-2">
            <button onClick={handleShare} className={btn.secondary}>
              <Share2 className="h-4 w-4" />
              {t('share')}
            </button>
            <Link href={bookingHref} className={cn(btn.primary, 'hidden sm:inline-flex')}>
              <Calendar className="h-4 w-4" />
              {t('book')}
            </Link>
          </div>
        </header>

        {/* Gallery: one wide photo, or a main photo with up to four smaller ones */}
        <div className="hero-image-in anim-delay-100 mt-6">
          {images.length === 0 ? (
            <Media name={shop.name} className="aspect-[21/9] w-full" priority />
          ) : images.length < 3 ? (
            <div className={cn('grid gap-2', images.length === 2 && 'sm:grid-cols-2')}>
              {images.map((src, i) => (
                <Media key={src} src={src} name={shop.name} priority={i === 0} className={images.length === 1 ? 'aspect-[21/9]' : 'aspect-[4/3]'} />
              ))}
            </div>
          ) : (
            <div className="grid gap-2 sm:grid-cols-4 sm:grid-rows-2">
              <Media src={images[0]} name={shop.name} priority className="aspect-[4/3] sm:col-span-2 sm:row-span-2 sm:aspect-auto sm:h-full" sizes="(max-width: 640px) 100vw, 50vw" />
              {images.slice(1, 5).map((src, i, rest) => (
                <Media
                  key={src}
                  src={src}
                  name={shop.name}
                  className={cn('hidden aspect-[4/3] sm:block', rest.length === 2 && 'sm:col-span-2 sm:aspect-[8/3]', rest.length === 3 && i === 2 && 'sm:col-span-2 sm:aspect-[8/3]')}
                  sizes="25vw"
                />
              ))}
            </div>
          )}
        </div>

        <div className="grid gap-12 py-12 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="min-w-0 space-y-14">
            {shop.description && (
              <section aria-labelledby="about">
                <SectionTitle id="about">{t('about')}</SectionTitle>
                <p className="max-w-[65ch] whitespace-pre-line leading-relaxed text-gray-700">{shop.description}</p>
              </section>
            )}

            <section aria-labelledby="services">
              <SectionTitle id="services">{t('services')}</SectionTitle>
              {groupedServices.length === 0 ? (
                <p className="text-gray-600">{t('noServices')}</p>
              ) : (
                <div className="space-y-8">
                  {groupedServices.map((group) => (
                    <div key={group.id}>
                      <h3 className="mb-2 text-sm font-medium text-gray-500">{group.label}</h3>
                      <ul className="divide-y divide-gray-100 border-y border-gray-100">
                        {group.items.map((service) => (
                          <li key={service.id} className="flex items-center gap-4 py-4">
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-gray-900">{service.name}</p>
                              {service.description && <p className="mt-0.5 line-clamp-2 text-sm text-gray-600">{service.description}</p>}
                              <p className="mt-1 text-sm text-gray-500">{formatDuration(service.duration, locale)}</p>
                            </div>
                            <span className="text-sm font-medium tabular-nums text-gray-900">{formatEuro(service.price, locale)}</span>
                            <Link href={`${bookingHref}?serviceId=${service.id}`} className={cn(btn.secondary, btn.sm)}>
                              {t('choose')}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {barbers.length > 0 && (
              <section aria-labelledby="team">
                <SectionTitle id="team">{t('team')}</SectionTitle>
                <ul className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4">
                  {barbers.map((barber) => (
                    <li key={barber.id}>
                      <Link href={`/barbers/${barber.id}`} className="group block">
                        <Media src={barber.profileImage} name={barber.name || t('stylistFallback')} className="aspect-square" rounded="rounded-full" sizes="160px" />
                        <p className="mt-3 truncate text-center font-medium text-gray-900 group-hover:text-primary-700">{barber.name || t('stylistFallback')}</p>
                        <p className="truncate text-center text-sm text-gray-500">
                          {[barberTypeLabel(barber.barberType, locale), barber.experience ? t('experience', { years: barber.experience }) : null].filter(Boolean).join(', ') || t('stylistFallback')}
                        </p>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <section aria-labelledby="reviews">
              <SectionTitle
                id="reviews"
                aside={
                  canReview && !reviewed ? (
                    <button onClick={() => setShowReviewForm((v) => !v)} className={cn(btn.secondary, btn.sm)}>
                      {showReviewForm ? t('cancel') : t('leaveReview')}
                    </button>
                  ) : isAuthenticated ? null : (
                    <Link href={`/auth/signin?callbackUrl=${encodeURIComponent(`/barbershops/${shop.id}`)}`} className={cn(btn.ghost, btn.sm)}>
                      {t('signInToReview')}
                    </Link>
                  )
                }
              >
                {t('reviews')}
              </SectionTitle>

              {isAuthenticated && !canReview && !reviewed && (
                <p className="mb-6 text-sm text-gray-500">{t('reviewAfterVisit')}</p>
              )}

              {showReviewForm && !reviewed && (
                <form onSubmit={handleSubmitReview} className="mb-8 space-y-4 rounded-xl border border-gray-200 p-5">
                  <fieldset>
                    <legend className="mb-2 text-sm font-medium text-gray-800">{t('yourRating')}</legend>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewRating(star)}
                          aria-label={t('outOfFive', { value: star })}
                          aria-pressed={star <= reviewRating}
                          className="rounded p-0.5 transition-transform active:scale-90"
                        >
                          <Star className={cn('h-7 w-7', star <= reviewRating ? 'fill-primary-500 text-primary-500' : 'text-gray-300')} />
                        </button>
                      ))}
                    </div>
                  </fieldset>
                  <div>
                    <label htmlFor="review-comment" className="mb-1.5 block text-sm font-medium text-gray-800">
                      {t('yourComment')} <span className="font-normal text-gray-500">{t('optional')}</span>
                    </label>
                    <textarea
                      id="review-comment"
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      rows={3}
                      placeholder={t('commentPlaceholder')}
                      className={cn(inputClass, 'resize-none')}
                    />
                  </div>
                  <button type="submit" disabled={submittingReview} className={btn.primary}>
                    {submittingReview && <Spinner className="h-3.5 w-3.5" />}
                    {t('publishReview')}
                  </button>
                </form>
              )}

              {loadingReviews ? (
                <div className="space-y-6" aria-busy="true">
                  {[0, 1].map((i) => (
                    <div key={i} className="flex gap-3">
                      <div className="h-10 w-10 animate-pulse rounded-full bg-gray-100" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-32 animate-pulse rounded bg-gray-100" />
                        <div className="h-3 w-2/3 animate-pulse rounded bg-gray-100" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : reviews.length === 0 ? (
                <div className="flex items-center gap-3 rounded-xl bg-gray-50 px-5 py-6 text-gray-600">
                  <MessageSquare className="h-5 w-5 flex-shrink-0 text-gray-400" />
                  {t('noReviews')}
                </div>
              ) : (
                <ul className="space-y-8">
                  {reviews.map((review) => (
                    <li key={review.id} className="flex gap-3">
                      {review.customerImage ? (
                        <Image src={review.customerImage} alt="" width={40} height={40} className="h-10 w-10 flex-shrink-0 rounded-full object-cover" />
                      ) : (
                        <span className="inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gray-100 text-sm font-medium text-gray-600">
                          {review.customerName?.charAt(0).toUpperCase() || '?'}
                        </span>
                      )}
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-baseline gap-x-2">
                          <p className="font-medium text-gray-900">{review.customerName}</p>
                          <time className="text-xs text-gray-500" dateTime={review.createdAt}>
                            {new Date(review.createdAt).toLocaleDateString(locale === 'en' ? 'en-GB' : 'fr-FR', { month: 'long', year: 'numeric' })}
                          </time>
                        </div>
                        <div className="mt-1 flex gap-0.5" aria-label={t('outOfFive', { value: review.rating })}>
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star key={star} aria-hidden="true" className={cn('h-3.5 w-3.5', star <= review.rating ? 'fill-primary-500 text-primary-500' : 'text-gray-200')} />
                          ))}
                        </div>
                        {review.comment && <p className="mt-2 max-w-[65ch] text-gray-700">{review.comment}</p>}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>

          <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-xl border border-gray-200 p-5">
              <p className="font-display text-lg font-semibold text-gray-900">{t('bookTitle')}</p>
              <p className="mt-1 text-sm text-gray-600">{t('bookText')}</p>
              <Link href={bookingHref} className={cn(btn.primary, 'mt-4 w-full py-2.5')}>
                <Calendar className="h-4 w-4" />
                {t('book')}
              </Link>
            </div>

            {shop.openingHours && (
              <div className="rounded-xl border border-gray-200 p-5">
                <p className="font-display text-base font-semibold text-gray-900">{t('hours')}</p>
                <dl className="mt-3 space-y-1.5 text-sm">
                  {WEEK.map((day) => {
                    const hours = shop.openingHours?.[day.key];
                    const isToday = day.key === today;
                    return (
                      <div key={day.key} className={cn('flex justify-between gap-4', isToday ? 'font-medium text-gray-900' : 'text-gray-600')}>
                        <dt>{dayName(day.key, locale)}{isToday && <span className="sr-only"> ({t('today')})</span>}</dt>
                        <dd className="tabular-nums">
                          {!hours || hours.closed ? t('closed') : t('timeRange', { from: formatTime(hours.open, locale), to: formatTime(hours.close, locale) })}
                        </dd>
                      </div>
                    );
                  })}
                </dl>
              </div>
            )}

            <div className="rounded-xl border border-gray-200 p-5">
              <p className="font-display text-base font-semibold text-gray-900">{t('contact')}</p>
              <ul className="mt-3 space-y-2.5 text-sm">
                <li>
                  <a href={mapsHref} target="_blank" rel="noopener noreferrer" className="group flex gap-2.5 text-gray-700 hover:text-gray-900">
                    <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-400" />
                    <span>
                      {shop.address}, {shop.city}
                      <span className="mt-0.5 flex items-center gap-1 text-xs font-medium text-primary-700 group-hover:underline">
                        {t('directions')} <ArrowUpRight className="h-3 w-3" />
                      </span>
                    </span>
                  </a>
                </li>
                {shop.phone && (
                  <li>
                    <a href={`tel:${shop.phone}`} className="flex items-center gap-2.5 text-gray-700 hover:text-gray-900">
                      <Phone className="h-4 w-4 flex-shrink-0 text-gray-400" />
                      {shop.phone}
                    </a>
                  </li>
                )}
                {shop.email && (
                  <li>
                    <a href={`mailto:${shop.email}`} className="flex min-w-0 items-center gap-2.5 text-gray-700 hover:text-gray-900">
                      <Mail className="h-4 w-4 flex-shrink-0 text-gray-400" />
                      <span className="truncate">{shop.email}</span>
                    </a>
                  </li>
                )}
                {shop.website && (
                  <li>
                    <a href={shop.website} target="_blank" rel="noopener noreferrer" className="flex min-w-0 items-center gap-2.5 text-gray-700 hover:text-gray-900">
                      <Globe className="h-4 w-4 flex-shrink-0 text-gray-400" />
                      <span className="truncate">{shop.website.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')}</span>
                    </a>
                  </li>
                )}
              </ul>
            </div>
          </aside>
        </div>
      </PublicShell>

      {/* Mobile: booking stays one tap away */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-gray-200 bg-white/95 px-4 py-3 backdrop-blur lg:hidden">
        <Link href={bookingHref} className={cn(btn.primary, 'w-full py-3')}>
          <Calendar className="h-4 w-4" />
          {t('bookAt', { name: shop.name })}
        </Link>
      </div>

      <Footer />
    </div>
  );
}

