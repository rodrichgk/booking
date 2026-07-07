'use client';

import { useEffect, useState } from 'react';
import { Link } from '@/routing';
import { useTranslations, useLocale } from 'next-intl';
import { Star, MapPin } from 'lucide-react';
import { Reveal } from '@/components/ui/reveal';

interface FeaturedShop {
  id: string;
  name: string;
  city: string | null;
  rating: string | null;
  reviewCount: number | null;
  images: string[] | null;
}

const translations = {
  fr: {
    title: 'Salons en vedette',
    subtitle: 'Une sélection de nos salons partenaires, spécialisés dans les cheveux afro, bouclés et texturés — de Marseille à New York.',
    viewAll: 'Voir tous les salons',
  },
  en: {
    title: 'Featured salons',
    subtitle: 'A handful of our partner salons, specialists in afro, curly and textured hair — from Marseille to New York.',
    viewAll: 'View all salons',
  },
};

export function FeaturedBarbershops() {
  const t = useTranslations('barbershop');
  const locale = useLocale() as 'fr' | 'en';
  const text = translations[locale] || translations.fr;

  const [shops, setShops] = useState<FeaturedShop[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetch('/api/barbershops?activeOnly=true&limit=3')
      .then((res) => (res.ok ? res.json() : { barbershops: [] }))
      .then((data) => {
        if (active) setShops(Array.isArray(data.barbershops) ? data.barbershops : []);
      })
      .catch(() => {
        if (active) setShops([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  // Don't render a section full of nothing (or fake filler) — hide it until there
  // are real, active salons to show.
  if (loading || shops.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-4">
            {text.title}
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {text.subtitle}
          </p>
        </Reveal>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {shops.map((shop, index) => {
            const image = shop.images?.[0];
            const rating = shop.rating ? parseFloat(shop.rating) : 0;
            return (
              <Reveal key={shop.id} delay={index * 120}>
                <div className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group">
                <div className="relative">
                  {image ? (
                    <img
                      src={image}
                      alt={shop.name}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gradient-to-br from-primary-100 to-accent-100 flex items-center justify-center">
                      <span className="text-4xl font-display font-bold text-primary-600">
                        {shop.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-xl font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                      {shop.name}
                    </h3>
                  </div>

                  <div className="flex items-center space-x-4 mb-4 text-gray-600">
                    {rating > 0 && (
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm font-medium text-gray-900">{rating.toFixed(1)}</span>
                        {shop.reviewCount ? (
                          <span className="text-sm text-gray-600">({shop.reviewCount})</span>
                        ) : null}
                      </div>
                    )}
                    {shop.city && (
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-4 h-4" />
                        <span className="text-sm">{shop.city}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex space-x-3">
                    <Link
                      href={`/barbershops/${shop.id}`}
                      className="flex-1 bg-primary-600 hover:bg-primary-700 text-white text-center py-2 px-4 rounded-lg font-medium transition-colors"
                    >
                      {t('viewDetails')}
                    </Link>
                    <Link
                      href={`/barbershops/${shop.id}/booking`}
                      className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-900 text-center py-2 px-4 rounded-lg font-medium transition-colors"
                    >
                      {t('bookNow')}
                    </Link>
                  </div>
                </div>
                </div>
              </Reveal>
            );
          })}
        </div>

        <div className="text-center mt-12">
          <Link
            href="/barbershops"
            className="inline-flex items-center space-x-2 bg-white border-2 border-primary-600 text-primary-600 hover:bg-primary-600 hover:text-white font-semibold py-3 px-8 rounded-lg transition-all duration-200"
          >
            <span>{text.viewAll}</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
