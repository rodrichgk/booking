'use client';

import { useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Link } from '@/routing';
import { MapPin } from 'lucide-react';
import { Header } from '@/components/ui/header';
import { Footer } from '@/components/ui/footer';
import {
  DirectoryHeader, PublicShell, SearchField, ChipGroup, ResultsBar, Rating, OpenStatus, Media, Place, EmptyResults,
} from '@/components/public/ui';
import { btn } from '@/components/dashboard/ui';
import type { OpeningHours } from '@/lib/opening-hours';

interface Barbershop {
  id: string;
  name: string;
  description: string | null;
  address: string;
  city: string;
  images: string[] | null;
  rating: string | null;
  reviewCount: number | null;
  openingHours: OpeningHours | null;
}

interface BarbershopsClientProps {
  barbershops: Barbershop[];
  locale: string;
}

type Sort = 'rating' | 'reviews' | 'name';

const normalize = (s: string) => s.toLocaleLowerCase('fr').normalize('NFD').replace(/[̀-ͯ]/g, '');

export function BarbershopsClient({ barbershops }: BarbershopsClientProps) {
  const searchParams = useSearchParams();
  // The homepage search sends ?search=...&location=...
  const [query, setQuery] = useState(searchParams.get('search') ?? '');
  const [location, setLocation] = useState(searchParams.get('location') ?? '');
  const [city, setCity] = useState('all');
  const [sort, setSort] = useState<Sort>('rating');

  const cities = useMemo(() => {
    const counts = new Map<string, number>();
    barbershops.forEach((s) => counts.set(s.city, (counts.get(s.city) ?? 0) + 1));
    return Array.from(counts, ([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
  }, [barbershops]);

  const results = useMemo(() => {
    const q = normalize(query.trim());
    const loc = normalize(location.trim());
    return barbershops
      .filter((shop) => {
        if (q && !normalize(`${shop.name} ${shop.description ?? ''}`).includes(q)) return false;
        if (loc && !normalize(`${shop.city} ${shop.address}`).includes(loc)) return false;
        if (city !== 'all' && shop.city !== city) return false;
        return true;
      })
      .sort((a, b) => {
        if (sort === 'name') return a.name.localeCompare(b.name, 'fr');
        if (sort === 'reviews') return (b.reviewCount ?? 0) - (a.reviewCount ?? 0);
        return parseFloat(b.rating ?? '0') - parseFloat(a.rating ?? '0') || (b.reviewCount ?? 0) - (a.reviewCount ?? 0);
      });
  }, [barbershops, query, location, city, sort]);

  const reset = () => {
    setQuery('');
    setLocation('');
    setCity('all');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <DirectoryHeader
        title="Trouvez votre salon"
        description="Des salons spécialisés dans les cheveux afro, bouclés et texturés. Choisissez, puis réservez en ligne."
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <SearchField label="Nom du salon" value={query} onChange={setQuery} placeholder="Nom du salon, style, tresses..." />
          <SearchField icon={MapPin} label="Ville ou adresse" value={location} onChange={setLocation} placeholder="Ville ou adresse" />
        </div>
        {cities.length > 1 && (
          <div className="mt-4">
            <ChipGroup
              label="Filtrer par ville"
              value={city}
              onChange={setCity}
              options={[{ id: 'all', label: 'Toutes les villes' }, ...cities.map((c) => ({ id: c.name, label: c.name, count: c.count }))]}
            />
          </div>
        )}
      </DirectoryHeader>

      <PublicShell>
        <ResultsBar count={results.length} noun={['salon', 'salons']}>
          <label className="flex items-center gap-2 text-sm text-gray-600">
            Trier par
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as Sort)}
              className="rounded-lg border border-gray-300 bg-white py-1.5 pl-3 pr-8 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            >
              <option value="rating">Mieux notés</option>
              <option value="reviews">Plus d’avis</option>
              <option value="name">Nom</option>
            </select>
          </label>
        </ResultsBar>

        {results.length === 0 ? (
          <div className="pb-16">
            <EmptyResults
              title="Aucun salon ne correspond"
              action={<button onClick={reset} className={btn.secondary}>Effacer la recherche</button>}
            >
              Essayez un autre nom ou une autre ville.
            </EmptyResults>
          </div>
        ) : (
          <ul key={`${city}|${sort}`} className="grid gap-x-6 gap-y-10 pb-16 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((shop, index) => (
              <li key={shop.id} className="card-in min-w-0" style={{ ['--i' as string]: Math.min(index, 11) }}>
                <Link href={`/barbershops/${shop.id}`} className="group block focus-visible:outline-none">
                  <Media
                    src={shop.images?.[0]}
                    name={shop.name}
                    priority={index < 3}
                    className="aspect-[4/3] ring-offset-2 group-focus-visible:ring-2 group-focus-visible:ring-primary-500"
                  />
                  <div className="mt-4 flex items-start justify-between gap-3">
                    <h2 className="font-display text-lg font-semibold leading-snug text-gray-900 group-hover:text-primary-700">{shop.name}</h2>
                    <Rating value={shop.rating} className="mt-0.5 flex-shrink-0" />
                  </div>
                  <Place className="mt-1">{shop.address}, {shop.city}</Place>
                  <div className="mt-2 flex items-center justify-between gap-3">
                    <OpenStatus hours={shop.openingHours} />
                    {shop.reviewCount ? <span className="text-xs tabular-nums text-gray-500">{shop.reviewCount} avis</span> : null}
                  </div>
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
