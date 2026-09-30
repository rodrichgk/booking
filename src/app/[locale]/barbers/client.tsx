'use client';

import { useMemo, useState } from 'react';
import { Link } from '@/routing';
import { MapPin } from 'lucide-react';
import { Header } from '@/components/ui/header';
import { Footer } from '@/components/ui/footer';
import {
  DirectoryHeader, PublicShell, SearchField, ChipGroup, ResultsBar, Rating, Media, Place, EmptyResults,
} from '@/components/public/ui';
import { btn } from '@/components/dashboard/ui';

interface Barber {
  id: string;
  name: string | null;
  profileImage: string | null;
  barberType: string | null;
  specialties: string[] | null;
  experience: number | null;
  rating: string | null;
  barbershopId: string;
  barbershopName: string;
  barbershopCity: string;
}

interface BarbersClientProps {
  barbers: Barber[];
  locale: string;
}

type Sort = 'rating' | 'experience' | 'name';

const normalize = (s: string) => s.toLocaleLowerCase('fr').normalize('NFD').replace(/[̀-ͯ]/g, '');

export function BarbersClient({ barbers }: BarbersClientProps) {
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');
  const [type, setType] = useState('all');
  const [sort, setSort] = useState<Sort>('rating');

  // Types actually used by barbers on the platform (Coiffeuse, Tresses / Braids...)
  const types = useMemo(() => {
    const counts = new Map<string, number>();
    barbers.forEach((b) => b.barberType && counts.set(b.barberType, (counts.get(b.barberType) ?? 0) + 1));
    return Array.from(counts, ([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
  }, [barbers]);

  const results = useMemo(() => {
    const q = normalize(query.trim());
    const loc = normalize(location.trim());
    return barbers
      .filter((b) => {
        if (q && !normalize(`${b.name ?? ''} ${b.barberType ?? ''} ${(b.specialties ?? []).join(' ')} ${b.barbershopName}`).includes(q)) return false;
        if (loc && !normalize(b.barbershopCity).includes(loc)) return false;
        if (type !== 'all' && b.barberType !== type) return false;
        return true;
      })
      .sort((a, b) => {
        if (sort === 'name') return (a.name ?? '').localeCompare(b.name ?? '', 'fr');
        if (sort === 'experience') return (b.experience ?? 0) - (a.experience ?? 0);
        return parseFloat(b.rating ?? '0') - parseFloat(a.rating ?? '0');
      });
  }, [barbers, query, location, type, sort]);

  const reset = () => {
    setQuery('');
    setLocation('');
    setType('all');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <DirectoryHeader
        title="Trouvez votre coiffeur"
        description="Coiffeurs, coiffeuses et spécialistes des tresses, dans les salons partenaires. Voyez leur travail, puis réservez avec eux."
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <SearchField label="Nom ou spécialité" value={query} onChange={setQuery} placeholder="Nom, spécialité, salon..." />
          <SearchField icon={MapPin} label="Ville" value={location} onChange={setLocation} placeholder="Ville" />
        </div>
        {types.length > 1 && (
          <div className="mt-4">
            <ChipGroup
              label="Filtrer par métier"
              value={type}
              onChange={setType}
              options={[{ id: 'all', label: 'Tous' }, ...types.map((t) => ({ id: t.name, label: t.name, count: t.count }))]}
            />
          </div>
        )}
      </DirectoryHeader>

      <PublicShell>
        <ResultsBar count={results.length} noun={['coiffeur', 'coiffeurs']}>
          <label className="flex items-center gap-2 text-sm text-gray-600">
            Trier par
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as Sort)}
              className="rounded-lg border border-gray-300 bg-white py-1.5 pl-3 pr-8 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            >
              <option value="rating">Mieux notés</option>
              <option value="experience">Plus expérimentés</option>
              <option value="name">Nom</option>
            </select>
          </label>
        </ResultsBar>

        {results.length === 0 ? (
          <div className="pb-16">
            <EmptyResults
              title="Aucun coiffeur ne correspond"
              action={<button onClick={reset} className={btn.secondary}>Effacer la recherche</button>}
            >
              Essayez un autre nom, une autre spécialité ou une autre ville.
            </EmptyResults>
          </div>
        ) : (
          <ul key={`${type}|${sort}`} className="grid grid-cols-2 gap-x-4 gap-y-10 pb-16 sm:gap-x-6 md:grid-cols-3 lg:grid-cols-4">
            {results.map((barber, index) => {
              const name = barber.name || 'Coiffeur';
              return (
                <li key={barber.id} className="card-in min-w-0" style={{ ['--i' as string]: Math.min(index, 11) }}>
                  <Link href={`/barbers/${barber.id}`} className="group block focus-visible:outline-none">
                    <Media
                      src={barber.profileImage}
                      name={name}
                      priority={index < 4}
                      sizes="(max-width: 768px) 50vw, 25vw"
                      className="aspect-[4/5] ring-offset-2 group-focus-visible:ring-2 group-focus-visible:ring-primary-500"
                    />
                    <div className="mt-3 flex items-start justify-between gap-2">
                      <h2 className="truncate font-display text-base font-semibold text-gray-900 group-hover:text-primary-700">{name}</h2>
                      <Rating value={barber.rating} className="flex-shrink-0" />
                    </div>
                    <p className="truncate text-sm text-gray-600">
                      {[barber.barberType, barber.experience ? `${barber.experience} ans d’exp.` : null].filter(Boolean).join(', ') || 'Coiffeur'}
                    </p>
                    <Place className="mt-1 text-gray-500">{barber.barbershopName}, {barber.barbershopCity}</Place>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </PublicShell>

      <Footer />
    </div>
  );
}
