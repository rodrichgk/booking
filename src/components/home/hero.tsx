'use client';

import { useState, type FormEvent } from 'react';
import Image from 'next/image';
import { Search, MapPin } from 'lucide-react';
import { useRouter } from '@/routing';

const HERO_MAIN =
  'https://images.unsplash.com/photo-1560066984-138dadb4c035?ixlib=rb-4.0.3&auto=format&fit=crop&w=1100&q=80';
const HERO_SIDE =
  'https://images.unsplash.com/photo-1589156280159-27698a70f29e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80';

export function HomeHero() {
  const router = useRouter();
  const [what, setWhat] = useState('');
  const [where, setWhere] = useState('');

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const query = new URLSearchParams();
    if (what.trim()) query.set('search', what.trim());
    if (where.trim()) query.set('location', where.trim());
    const qs = query.toString();
    // A service or salon name is best matched on the services list; a city alone lists the salons.
    const base = what.trim() ? '/services' : '/barbershops';
    router.push(qs ? `${base}?${qs}` : base);
  };

  return (
    <section className="relative overflow-hidden bg-white">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 pb-16 pt-10 sm:px-6 md:pt-16 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-16 lg:px-8 lg:pb-24">
        <div>
          <h1 className="animate-fade-in-up font-display text-4xl font-semibold leading-[1.05] tracking-tight text-gray-900 md:text-5xl lg:text-6xl">
            Vos cheveux, entre de <span className="text-primary-600">bonnes mains</span>.
          </h1>
          <p className="anim-delay-100 mt-5 max-w-[46ch] animate-fade-in-up text-lg leading-relaxed text-gray-600">
            Salons spécialisés afro, bouclés et texturés. Comparez les prestations, choisissez un créneau, réservez en ligne.
          </p>

          <form
            onSubmit={onSubmit}
            role="search"
            className="anim-delay-200 mt-8 grid animate-fade-in-up gap-2 rounded-2xl border border-gray-200 bg-white p-2 shadow-[0_12px_40px_-16px_rgba(222,90,22,0.25)] sm:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_auto] sm:gap-0 sm:rounded-full"
          >
            <label className="flex flex-col rounded-xl px-4 py-2 transition-colors focus-within:bg-gray-50 sm:rounded-full sm:pl-6">
              <span className="text-xs font-semibold text-gray-900">Quoi</span>
              <span className="flex items-center gap-2">
                <Search className="h-4 w-4 flex-shrink-0 text-gray-400" aria-hidden="true" />
                <input
                  value={what}
                  onChange={(e) => setWhat(e.target.value)}
                  placeholder="Tresses, dégradé, salon"
                  className="w-full bg-transparent py-0.5 text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none"
                />
              </span>
            </label>
            <label className="flex flex-col rounded-xl px-4 py-2 transition-colors focus-within:bg-gray-50 sm:rounded-full sm:border-l sm:border-gray-200">
              <span className="text-xs font-semibold text-gray-900">Où</span>
              <span className="flex items-center gap-2">
                <MapPin className="h-4 w-4 flex-shrink-0 text-gray-400" aria-hidden="true" />
                <input
                  value={where}
                  onChange={(e) => setWhere(e.target.value)}
                  placeholder="Ville"
                  autoComplete="address-level2"
                  className="w-full bg-transparent py-0.5 text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none"
                />
              </span>
            </label>
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary-600 px-6 py-3.5 text-sm font-semibold text-white transition-[background-color,transform] duration-200 hover:bg-primary-700 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 sm:rounded-full"
            >
              <Search className="h-4 w-4" aria-hidden="true" />
              Rechercher
            </button>
          </form>
        </div>

        <div className="relative mx-auto w-full max-w-md lg:max-w-none">
          <div className="hero-image-in relative aspect-[4/5] overflow-hidden rounded-2xl bg-gray-100 sm:aspect-[5/4] lg:aspect-square">
            <Image src={HERO_MAIN} alt="Coiffeuse au travail dans un salon" fill priority sizes="(max-width: 1024px) 90vw, 45vw" className="object-cover" />
          </div>
          <div className="hero-image-in anim-delay-300 absolute -bottom-6 -left-6 hidden aspect-square w-40 overflow-hidden rounded-2xl border-4 border-white bg-gray-100 shadow-xl shadow-gray-900/10 sm:block lg:-left-10 lg:w-48">
            <Image src={HERO_SIDE} alt="" fill sizes="200px" className="object-cover" />
          </div>
        </div>
      </div>
    </section>
  );
}
