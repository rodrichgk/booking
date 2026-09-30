import Image from 'next/image';
import { ArrowRight, ArrowUpRight, Search, CalendarCheck, Star } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/routing';
import { cn } from '@/lib/utils';
import { Reveal } from '@/components/ui/reveal';
import { Media, OpenStatus, Place, Rating } from '@/components/public/ui';
import type { FeaturedShop } from '@/lib/featured';

const photo = (id: string, w = 1000) => `https://images.unsplash.com/${id}?ixlib=rb-4.0.3&auto=format&fit=crop&w=${w}&q=80`;

/** Photos for the two large category tiles. Generic salon shots as fallback. */
const CATEGORY_PHOTOS: Record<string, string> = {
  styling: photo('photo-1589156280159-27698a70f29e'),
  haircut: photo('photo-1585747860715-2ba37e788b70'),
};
const FALLBACK_PHOTOS = [photo('photo-1521590832167-7bcbfaa6381f'), photo('photo-1503951914875-452162b0f3f1')];

export type CategoryStat = { id: string; label: string; count: number; minPrice: number | null };
export type CityStat = { city: string; count: number };

const euro = (n: number, locale: string) =>
  new Intl.NumberFormat(locale === 'en' ? 'en-GB' : 'fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: n % 1 ? 2 : 0 }).format(n);

function Heading({ children, aside }: { children: React.ReactNode; aside?: React.ReactNode }) {
  return (
    <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
      <h2 className="max-w-2xl font-display text-3xl font-semibold tracking-tight text-gray-900 md:text-4xl">{children}</h2>
      {aside}
    </div>
  );
}

function MoreLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="group inline-flex items-center gap-1.5 text-sm font-semibold text-gray-900 hover:text-primary-700">
      {children}
      <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
    </Link>
  );
}

/** Bento: the two biggest categories as photo tiles, the others as tinted tiles. */
export function CategoryBento({ categories }: { categories: CategoryStat[] }) {
  const t = useTranslations('site.home');
  const locale = useLocale();
  if (categories.length === 0) return null;
  const categoryMeta = (c: CategoryStat) =>
    !c.count
      ? t('seeSalons')
      : c.minPrice != null
        ? t('categoryMetaFrom', { count: c.count, price: euro(c.minPrice, locale) })
        : t('categoryMeta', { count: c.count });
  const [big, rest] = [categories.slice(0, 2), categories.slice(2)];
  const smallCols = ['', 'lg:grid-cols-1', 'lg:grid-cols-2', 'lg:grid-cols-3', 'lg:grid-cols-4'][Math.min(rest.length, 4)];
  let fallback = 0;

  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <Reveal>
        <Heading aside={<MoreLink href="/services">{t('allServices')}</MoreLink>}>{t('categoriesTitle')}</Heading>
      </Reveal>

      <div className={cn('grid gap-4', big.length > 1 && 'md:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]')}>
        {big.map((c, i) => {
          const src = CATEGORY_PHOTOS[c.id] ?? FALLBACK_PHOTOS[fallback++ % FALLBACK_PHOTOS.length];
          return (
            <Reveal key={c.id} delay={i * 100}>
              <Link
                href={`/services?category=${c.id}`}
                className="group relative flex aspect-[4/3] flex-col justify-end overflow-hidden rounded-2xl bg-gray-900 p-6 md:aspect-auto md:h-[26rem] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
              >
                <Image
                  src={src}
                  alt=""
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-950/80 via-gray-950/20 to-transparent" aria-hidden="true" />
                <div className="relative flex items-end justify-between gap-4">
                  <div>
                    <h3 className="font-display text-2xl font-semibold text-white md:text-3xl">{c.label}</h3>
                    <p className="mt-1 text-sm text-white/80">{categoryMeta(c)}</p>
                  </div>
                  <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-white text-gray-900 transition-transform duration-300 group-hover:-rotate-45">
                    <ArrowRight className="h-5 w-5" aria-hidden="true" />
                  </span>
                </div>
              </Link>
            </Reveal>
          );
        })}
      </div>

      {rest.length > 0 && (
        <div className={cn('mt-4 grid grid-cols-2 gap-4', smallCols)}>
          {rest.map((c, i) => (
            <Reveal key={c.id} delay={150 + i * 70}>
              <Link
                href={`/services?category=${c.id}`}
                className={cn(
                  'group flex h-full min-h-[8.5rem] flex-col justify-between rounded-2xl p-5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
                  i % 2 === 0 ? 'bg-primary-50 hover:bg-primary-100' : 'bg-gray-100 hover:bg-gray-200/70'
                )}
              >
                <ArrowUpRight className="h-5 w-5 self-end text-gray-400 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-gray-900" aria-hidden="true" />
                <div>
                  <h3 className="font-display text-lg font-semibold text-gray-900">{c.label}</h3>
                  <p className="mt-0.5 text-sm text-gray-600">{categoryMeta(c)}</p>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      )}
    </section>
  );
}

/** One large salon on the left, the next ones stacked on the right. */
export function FeaturedSalons({ shops }: { shops: FeaturedShop[] }) {
  const t = useTranslations('site.home');
  if (shops.length === 0) return null;
  const [lead, ...others] = shops;

  return (
    <section className="bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <Reveal>
          <Heading aside={<MoreLink href="/barbershops">{t('allSalons')}</MoreLink>}>{t('featuredTitle')}</Heading>
        </Reveal>

        <div className={cn('grid gap-8', others.length > 0 && 'lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]')}>
          <Reveal>
            <Link href={`/barbershops/${lead.id}`} className="group block focus-visible:outline-none">
              <Media
                src={lead.images?.[0]}
                name={lead.name}
                sizes="(max-width: 1024px) 100vw, 55vw"
                className="aspect-[16/10] ring-offset-2 group-focus-visible:ring-2 group-focus-visible:ring-primary-500"
                rounded="rounded-2xl"
              />
              <div className="mt-5 flex flex-wrap items-start justify-between gap-x-6 gap-y-2">
                <div className="min-w-0">
                  <h3 className="font-display text-2xl font-semibold text-gray-900 group-hover:text-primary-700">{lead.name}</h3>
                  <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1">
                    <Place>{lead.city}</Place>
                    <OpenStatus hours={lead.openingHours} />
                  </div>
                </div>
                <Rating value={lead.rating} count={lead.reviewCount} />
              </div>
              {lead.description && <p className="mt-3 line-clamp-2 max-w-[60ch] text-gray-600">{lead.description}</p>}
            </Link>
          </Reveal>

          {others.length > 0 && (
            <ul className="grid content-start gap-6">
              {others.map((shop, i) => (
                <li key={shop.id} className="min-w-0">
                  <Reveal delay={120 + i * 100}>
                    <Link
                      href={`/barbershops/${shop.id}`}
                      className="group grid grid-cols-[8rem_minmax(0,1fr)] items-center gap-5 rounded-2xl bg-white p-3 pr-5 transition-shadow duration-300 hover:shadow-[0_12px_32px_-16px_rgba(17,24,39,0.25)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 sm:grid-cols-[10rem_minmax(0,1fr)]"
                    >
                      <Media src={shop.images?.[0]} name={shop.name} sizes="160px" className="aspect-square" />
                      <div className="min-w-0">
                        <h3 className="truncate font-display text-lg font-semibold text-gray-900 group-hover:text-primary-700">{shop.name}</h3>
                        <Place className="mt-1">{shop.city}</Place>
                        <Rating value={shop.rating} count={shop.reviewCount} className="mt-2" />
                      </div>
                    </Link>
                  </Reveal>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}

const STEPS = [
  { icon: Search, key: 'search' },
  { icon: CalendarCheck, key: 'book' },
  { icon: Star, key: 'review' },
] as const;

/** Three steps on a line that draws itself as the section scrolls in. */
export function HowItWorks() {
  const t = useTranslations('site.home');
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <Reveal>
        <Heading>{t('howTitle')}</Heading>
      </Reveal>
      <Reveal>
        <ol className="relative grid gap-10 md:grid-cols-3 md:gap-8">
          <span aria-hidden="true" className="draw-line absolute left-6 right-[16%] top-6 hidden h-px bg-gray-300 md:block" />
          {STEPS.map((step, i) => (
            <li key={step.key} className="stagger-child relative" style={{ ['--i' as string]: i }}>
              <span className="relative flex h-12 w-12 items-center justify-center rounded-full border border-gray-200 bg-white text-primary-600">
                <step.icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <h3 className="mt-5 font-display text-xl font-semibold text-gray-900">{t(`steps.${step.key}.title`)}</h3>
              <p className="mt-2 max-w-[34ch] text-gray-600">{t(`steps.${step.key}.text`)}</p>
            </li>
          ))}
        </ol>
      </Reveal>
    </section>
  );
}

/** Big-type list of cities with salons, each linking to the filtered list. */
export function Cities({ cities }: { cities: CityStat[] }) {
  const t = useTranslations('site.home');
  if (cities.length < 2) return null;
  return (
    <section className="border-t border-gray-200">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <Reveal>
          <Heading>{t('citiesTitle')}</Heading>
        </Reveal>
        <Reveal>
          <ul className="flex flex-wrap gap-x-10 gap-y-4">
            {cities.map((c) => (
              <li key={c.city}>
                <Link
                  href={`/barbershops?location=${encodeURIComponent(c.city)}`}
                  className="group inline-flex items-baseline gap-2 font-display text-3xl font-semibold tracking-tight text-gray-900 transition-colors duration-300 hover:text-primary-600 md:text-5xl"
                >
                  {c.city}
                  <span className="text-sm font-medium tabular-nums text-gray-500">
                    {t('salonCount', { count: c.count })}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}

export function ForSalons() {
  const t = useTranslations('site.home');
  return (
    <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
      <Reveal>
        <div className="grid overflow-hidden rounded-2xl bg-primary-50 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
          <div className="p-8 md:p-12">
            <h2 className="font-display text-3xl font-semibold tracking-tight text-gray-900 md:text-4xl">{t('forSalonsTitle')}</h2>
            <p className="mt-4 max-w-[48ch] text-gray-700">
              {t('forSalonsText')}
            </p>
            <Link
              href="/auth/signup"
              className="press mt-8 inline-flex items-center gap-2 rounded-full bg-gray-900 px-6 py-3 text-sm font-semibold text-white hover:bg-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
            >
              {t('forSalonsCta')}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
          <div className="relative min-h-[14rem]">
            <Image src={photo('photo-1622286342621-4bd786c2447c')} alt="" fill sizes="(max-width: 768px) 100vw, 45vw" className="object-cover" />
          </div>
        </div>
      </Reveal>
    </section>
  );
}
