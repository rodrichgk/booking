'use client';

import { useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/routing';
import { ChevronRight, Scissors } from 'lucide-react';
import { Header } from '@/components/ui/header';
import { Footer } from '@/components/ui/footer';
import { DirectoryHero, PillSearch, PhotoCollage, PublicShell, ChipGroup, ResultsBar, EmptyResults } from '@/components/public/ui';
import { btn, formatEuro } from '@/components/dashboard/ui';
import { SERVICE_CATEGORIES, categoryLabel, categoryName, formatDuration } from '@/lib/service-categories';
import Image from 'next/image';

interface ServiceRow {
  id: string;
  name: string;
  description: string | null;
  image: string | null;
  price: string;
  duration: number;
  category: string | null;
  barbershopId: string;
  barbershopName: string;
  barbershopCity: string;
  barbershopRating: string | null;
}

const STOCK = [
  'https://images.unsplash.com/photo-1589156280159-27698a70f29e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1560066984-138dadb4c035?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
];

type Sort = 'price-asc' | 'price-desc' | 'duration';

const normalize = (s: string) => s.toLocaleLowerCase('fr').normalize('NFD').replace(/[̀-ͯ]/g, '');

export function ServicesClient({ services }: { services: ServiceRow[]; locale: string }) {
  const t = useTranslations('site.catalog');
  const tl = useTranslations('site.list');
  const locale = useLocale();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('search') ?? '');
  const [location, setLocation] = useState(searchParams.get('location') ?? '');
  const [category, setCategory] = useState(searchParams.get('category') ?? 'all');
  const [sort, setSort] = useState<Sort>('price-asc');

  const categoryOptions = useMemo(() => {
    const options = SERVICE_CATEGORIES.map((c) => ({ id: c.id as string, label: categoryName(c, locale), count: services.filter((s) => s.category === c.id).length }))
      .filter((c) => c.count > 0);
    return [{ id: 'all', label: t('allCategories') }, ...options];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [services, locale]);

  const results = useMemo(() => {
    const q = normalize(query.trim());
    const loc = normalize(location.trim());
    return services
      .filter((s) => {
        if (q && !normalize(`${s.name} ${s.description ?? ''} ${s.barbershopName}`).includes(q)) return false;
        if (loc && !normalize(s.barbershopCity).includes(loc)) return false;
        if (category !== 'all' && s.category !== category) return false;
        return true;
      })
      .sort((a, b) => {
        if (sort === 'duration') return a.duration - b.duration;
        const diff = parseFloat(a.price) - parseFloat(b.price);
        return sort === 'price-asc' ? diff : -diff;
      });
  }, [services, query, location, category, sort]);

  const reset = () => {
    setQuery('');
    setLocation('');
    setCategory('all');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <DirectoryHero
        title={t('title')}
        accent={t('accent')}
        description={t('description')}
        search={
          <PillSearch
            what={{ label: tl('what'), value: query, onChange: setQuery, placeholder: t('whatPlaceholder') }}
            where={{ label: tl('where'), value: location, onChange: setLocation, placeholder: t('wherePlaceholder') }}
          />
        }
        filters={
          categoryOptions.length > 2 ? (
            <ChipGroup label={t('category')} value={category} onChange={setCategory} options={categoryOptions} />
          ) : undefined
        }
        visual={<PhotoCollage images={services.map((s) => s.image).filter((x): x is string => !!x)} fallback={STOCK} />}
      />

      <PublicShell>
        <ResultsBar count={results.length} noun={[t('nounOne'), t('nounOther')]}>
          <label className="flex items-center gap-2 text-sm text-gray-600">
            {tl('sortBy')}
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as Sort)}
              className="rounded-lg border border-gray-300 bg-white py-1.5 pl-3 pr-8 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            >
              <option value="price-asc">{t('sortPriceAsc')}</option>
              <option value="price-desc">{t('sortPriceDesc')}</option>
              <option value="duration">{t('sortDuration')}</option>
            </select>
          </label>
        </ResultsBar>

        {results.length === 0 ? (
          <div className="pb-16">
            <EmptyResults
              title={services.length === 0 ? t('noneYetTitle') : t('emptyTitle')}
              action={services.length > 0 ? <button onClick={reset} className={btn.secondary}>{tl('clearSearch')}</button> : undefined}
            >
              {services.length === 0 ? t('noneYetText') : t('emptyText')}
            </EmptyResults>
          </div>
        ) : (
          <ul key={`${category}|${sort}`} className="grid grid-cols-1 gap-3 pb-16 md:grid-cols-2">
            {results.map((service, index) => (
              <li key={service.id} className="card-in min-w-0" style={{ ['--i' as string]: Math.min(index, 11) }}>
                <Link
                  href={`/barbershops/${service.barbershopId}/booking?serviceId=${service.id}`}
                  className="group flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-3 pr-4 transition-[border-color,box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-[0_10px_28px_-18px_rgba(17,24,39,0.35)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                >
                  <span className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                    {service.image ? (
                      <Image src={service.image} alt="" fill sizes="80px" className="object-cover" />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary-50 to-gray-100">
                        <Scissors className="h-6 w-6 text-primary-300" aria-hidden="true" />
                      </span>
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-baseline justify-between gap-3">
                      <span className="truncate font-medium text-gray-900 group-hover:text-primary-700">{service.name}</span>
                      <span className="flex-shrink-0 font-medium tabular-nums text-gray-900">{formatEuro(service.price, locale)}</span>
                    </span>
                    <span className="mt-0.5 block truncate text-sm text-gray-600">
                      {service.barbershopName}, {service.barbershopCity}
                    </span>
                    <span className="mt-1 block text-xs text-gray-500">
                      {[formatDuration(service.duration, locale), categoryLabel(service.category, locale)].filter(Boolean).join(', ')}
                    </span>
                  </span>
                  <ChevronRight className="h-4 w-4 flex-shrink-0 text-gray-300 group-hover:text-gray-500" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </PublicShell>

      <Footer />
    </div>
  );
}
