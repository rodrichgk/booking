'use client';

import { useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Link } from '@/routing';
import { MapPin, ChevronRight, Scissors } from 'lucide-react';
import { Header } from '@/components/ui/header';
import { Footer } from '@/components/ui/footer';
import { DirectoryHeader, PublicShell, SearchField, ChipGroup, ResultsBar, EmptyResults } from '@/components/public/ui';
import { btn, formatEuro } from '@/components/dashboard/ui';
import { SERVICE_CATEGORIES, categoryLabel, formatDuration } from '@/lib/service-categories';
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

type Sort = 'price-asc' | 'price-desc' | 'duration';

const normalize = (s: string) => s.toLocaleLowerCase('fr').normalize('NFD').replace(/[̀-ͯ]/g, '');

export function ServicesClient({ services }: { services: ServiceRow[]; locale: string }) {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('search') ?? '');
  const [location, setLocation] = useState(searchParams.get('location') ?? '');
  const [category, setCategory] = useState(searchParams.get('category') ?? 'all');
  const [sort, setSort] = useState<Sort>('price-asc');

  const categoryOptions = useMemo(() => {
    const options = SERVICE_CATEGORIES.map((c) => ({ id: c.id as string, label: c.label as string, count: services.filter((s) => s.category === c.id).length }))
      .filter((c) => c.count > 0);
    return [{ id: 'all', label: 'Toutes' }, ...options];
  }, [services]);

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

      <DirectoryHeader
        title="Prestations"
        description="Coupes, tresses, colorations et soins pour cheveux afro, bouclés et texturés. Comparez les tarifs des salons et réservez."
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <SearchField label="Prestation" value={query} onChange={setQuery} placeholder="Nattes, dégradé, locks..." />
          <SearchField icon={MapPin} label="Ville" value={location} onChange={setLocation} placeholder="Ville" />
        </div>
        {categoryOptions.length > 2 && (
          <div className="mt-4">
            <ChipGroup label="Catégorie" value={category} onChange={setCategory} options={categoryOptions} />
          </div>
        )}
      </DirectoryHeader>

      <PublicShell>
        <ResultsBar count={results.length} noun={['prestation', 'prestations']}>
          <label className="flex items-center gap-2 text-sm text-gray-600">
            Trier par
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as Sort)}
              className="rounded-lg border border-gray-300 bg-white py-1.5 pl-3 pr-8 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            >
              <option value="price-asc">Prix croissant</option>
              <option value="price-desc">Prix décroissant</option>
              <option value="duration">Durée</option>
            </select>
          </label>
        </ResultsBar>

        {results.length === 0 ? (
          <div className="pb-16">
            <EmptyResults
              title={services.length === 0 ? 'Aucune prestation pour le moment' : 'Aucune prestation ne correspond'}
              action={services.length > 0 ? <button onClick={reset} className={btn.secondary}>Effacer la recherche</button> : undefined}
            >
              {services.length === 0 ? 'Les salons partenaires publieront bientôt leurs tarifs.' : 'Essayez un autre mot-clé ou une autre ville.'}
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
                      <span className="flex-shrink-0 font-medium tabular-nums text-gray-900">{formatEuro(service.price)}</span>
                    </span>
                    <span className="mt-0.5 block truncate text-sm text-gray-600">
                      {service.barbershopName}, {service.barbershopCity}
                    </span>
                    <span className="mt-1 block text-xs text-gray-500">
                      {[formatDuration(service.duration), categoryLabel(service.category)].filter(Boolean).join(', ')}
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
