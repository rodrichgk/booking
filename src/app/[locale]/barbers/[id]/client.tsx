'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/routing';
import { barberTypeLabel } from '@/lib/barber-types';
import { Calendar, ChevronLeft, ChevronRight, Phone, MapPin, X } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { Header } from '@/components/ui/header';
import { Footer } from '@/components/ui/footer';
import { PublicShell, Rating, OpenStatus, Media, SectionTitle } from '@/components/public/ui';
import { btn, formatEuro } from '@/components/dashboard/ui';
import { formatDuration } from '@/lib/service-categories';
import type { OpeningHours } from '@/lib/opening-hours';
import { cn } from '@/lib/utils';

interface BarberProfileClientProps {
  barber: {
    id: string;
    barbershopId: string;
    name: string;
    barberType: string | null;
    profileImage: string | null;
    galleryImages: string[] | null;
    youtubeLinks: string[] | null;
    bio: string | null;
    specialties: string[] | null;
    experience: number | null;
    rating: string | null;
    barbershopName: string;
    barbershopAddress: string;
    barbershopCity: string;
    barbershopPhone: string | null;
    barbershopOpeningHours: OpeningHours | null;
  };
  services: Array<{
    id: string;
    name: string;
    description: string | null;
    price: string;
    duration: number;
    category: string | null;
  }>;
  locale: string;
}

/** Accepts watch?v=, youtu.be/, /embed/ and /shorts/ links. */
function youtubeId(link: string): string | null {
  const match = link.match(/(?:youtu\.be\/|v=|\/embed\/|\/shorts\/)([\w-]{11})/);
  return match ? match[1] : /^[\w-]{11}$/.test(link) ? link : null;
}

export function BarberProfileClient({ barber, services }: BarberProfileClientProps) {
  const t = useTranslations('site.stylist');
  const locale = useLocale();
  const gallery = barber.galleryImages ?? [];
  const videos = (barber.youtubeLinks ?? []).map(youtubeId).filter((id): id is string => !!id);
  const [viewer, setViewer] = useState<number | null>(null);
  const firstName = barber.name.split(' ')[0];
  const bookingHref = `/barbers/${barber.id}/booking`;

  const subtitle = [barberTypeLabel(barber.barberType, locale), barber.experience ? t('experience', { years: barber.experience }) : null].filter(Boolean).join(', ');

  return (
    <div className="min-h-screen bg-white pb-24 lg:pb-0">
      <Header />

      <PublicShell>
        <nav aria-label={t('breadcrumb')} className="flex items-center gap-1.5 pt-6 text-sm text-gray-500">
          <Link href="/barbers" className="hover:text-gray-900">{t('stylists')}</Link>
          <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
          <span className="truncate text-gray-900">{barber.name}</span>
        </nav>

        <header className="grid animate-fade-in-up gap-8 pt-6 md:grid-cols-[16rem_minmax(0,1fr)] md:items-end">
          <Media src={barber.profileImage} name={barber.name} priority sizes="256px" className="aspect-[4/5] w-full max-w-[16rem]" />
          <div className="min-w-0">
            <h1 className="font-display text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl">{barber.name}</h1>
            {subtitle && <p className="mt-1.5 text-lg text-gray-600">{subtitle}</p>}
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5">
              <Rating value={barber.rating} />
              <Link href={`/barbershops/${barber.barbershopId}`} className="inline-flex items-center gap-1.5 text-sm text-gray-600 underline-offset-2 hover:text-gray-900 hover:underline">
                <MapPin className="h-3.5 w-3.5 text-gray-400" aria-hidden="true" />
                {barber.barbershopName}, {barber.barbershopCity}
              </Link>
            </div>
            {barber.specialties && barber.specialties.length > 0 && (
              <ul className="mt-4 flex flex-wrap gap-1.5" aria-label={t('specialties')}>
                {barber.specialties.map((specialty) => (
                  <li key={specialty} className="rounded-full border border-gray-200 px-3 py-1 text-sm text-gray-700">{specialty}</li>
                ))}
              </ul>
            )}
            <Link href={bookingHref} className={cn(btn.primary, 'mt-6 hidden px-6 py-2.5 sm:inline-flex')}>
              <Calendar className="h-4 w-4" />
              {t('bookWith', { name: firstName })}
            </Link>
          </div>
        </header>

        <div className="grid gap-12 py-14 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="min-w-0 space-y-14">
            {barber.bio && (
              <section aria-labelledby="bio">
                <SectionTitle id="bio">{t('about')}</SectionTitle>
                <p className="max-w-[65ch] whitespace-pre-line leading-relaxed text-gray-700">{barber.bio}</p>
              </section>
            )}

            {gallery.length > 0 && (
              <section aria-labelledby="work">
                <SectionTitle id="work" aside={<span className="text-sm tabular-nums text-gray-500">{t('photoCount', { count: gallery.length })}</span>}>
                  {t('work')}
                </SectionTitle>
                <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {gallery.map((src, index) => (
                    <li key={src}>
                      <button onClick={() => setViewer(index)} className="group block w-full focus-visible:outline-none" aria-label={t('enlargePhoto', { n: index + 1 })}>
                        <Media src={src} name={barber.name} className="aspect-square ring-offset-2 group-focus-visible:ring-2 group-focus-visible:ring-primary-500" sizes="(max-width: 640px) 50vw, 20vw" />
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {videos.length > 0 && (
              <section aria-labelledby="videos">
                <SectionTitle id="videos">{t('videos')}</SectionTitle>
                <div className="grid gap-4 sm:grid-cols-2">
                  {videos.map((id, index) => (
                    <div key={id} className="aspect-video overflow-hidden rounded-xl bg-gray-100">
                      <iframe
                        src={`https://www.youtube-nocookie.com/embed/${id}`}
                        title={t('videoTitle', { n: index + 1, name: barber.name })}
                        loading="lazy"
                        className="h-full w-full"
                        allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {!barber.bio && gallery.length === 0 && videos.length === 0 && (
              <p className="text-gray-600">{t('emptyProfile', { name: firstName })}</p>
            )}
          </div>

          <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-xl border border-gray-200 p-5">
              <p className="font-display text-lg font-semibold text-gray-900">{t('services')}</p>
              {services.length === 0 ? (
                <p className="mt-2 text-sm text-gray-600">{t('servicesSoon')}</p>
              ) : (
                <ul className="mt-2 divide-y divide-gray-100">
                  {services.map((service) => (
                    <li key={service.id}>
                      <Link href={`${bookingHref}?serviceId=${service.id}`} className="group flex items-center gap-3 py-3">
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium text-gray-900 group-hover:text-primary-700">{service.name}</span>
                          <span className="block text-xs text-gray-500">{formatDuration(service.duration, locale)}</span>
                        </span>
                        <span className="text-sm tabular-nums text-gray-900">{formatEuro(service.price, locale)}</span>
                        <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-gray-500" aria-hidden="true" />
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
              <Link href={bookingHref} className={cn(btn.primary, 'mt-3 w-full py-2.5')}>
                <Calendar className="h-4 w-4" />
                {t('bookWith', { name: firstName })}
              </Link>
            </div>

            <div className="rounded-xl border border-gray-200 p-5">
              <p className="font-display text-base font-semibold text-gray-900">{t('salon')}</p>
              <Link href={`/barbershops/${barber.barbershopId}`} className="mt-2 block font-medium text-gray-900 hover:text-primary-700">
                {barber.barbershopName}
              </Link>
              <p className="text-sm text-gray-600">{barber.barbershopAddress}, {barber.barbershopCity}</p>
              <OpenStatus hours={barber.barbershopOpeningHours} className="mt-2" />
              {barber.barbershopPhone && (
                <a href={`tel:${barber.barbershopPhone}`} className="mt-3 flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900">
                  <Phone className="h-4 w-4 text-gray-400" />
                  {barber.barbershopPhone}
                </a>
              )}
            </div>
          </aside>
        </div>
      </PublicShell>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-gray-200 bg-white/95 px-4 py-3 backdrop-blur sm:hidden">
        <Link href={bookingHref} className={cn(btn.primary, 'w-full py-3')}>
          <Calendar className="h-4 w-4" />
          {t('bookWith', { name: firstName })}
        </Link>
      </div>

      {/* Photo viewer */}
      <Dialog.Root open={viewer !== null} onOpenChange={(open) => !open && setViewer(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-gray-950/90" />
          <Dialog.Content className="fixed inset-0 z-50 flex items-center justify-center p-4 focus:outline-none">
            <Dialog.Title className="sr-only">{t('workOf', { name: barber.name })}</Dialog.Title>
            {viewer !== null && (
              <>
                <div className="relative h-full max-h-[85dvh] w-full max-w-4xl">
                  <Image src={gallery[viewer]} alt={t('workAlt', { n: viewer + 1, name: barber.name })} fill sizes="100vw" className="object-contain" />
                </div>
                <Dialog.Close className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20" aria-label={t('close')}>
                  <X className="h-5 w-5" />
                </Dialog.Close>
                {gallery.length > 1 && (
                  <>
                    <button
                      onClick={() => setViewer((viewer - 1 + gallery.length) % gallery.length)}
                      className="absolute left-4 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
                      aria-label={t('previousPhoto')}
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </button>
                    <button
                      onClick={() => setViewer((viewer + 1) % gallery.length)}
                      className="absolute right-4 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
                      aria-label={t('nextPhoto')}
                    >
                      <ChevronRight className="h-6 w-6" />
                    </button>
                    <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-sm tabular-nums text-white/70">
                      {viewer + 1} / {gallery.length}
                    </p>
                  </>
                )}
              </>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <Footer />
    </div>
  );
}
