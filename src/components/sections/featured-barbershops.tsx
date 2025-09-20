'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Star, MapPin, Clock, Heart } from 'lucide-react';

const featuredShops = [
  {
    id: '1',
    name: 'Crown & Glory Barbershop',
    image: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    rating: 4.9,
    reviewCount: 127,
    address: 'Brooklyn, NY',
    specialties: ['Natural Hair', 'Protective Styles', 'Loc Maintenance'],
    openNow: true,
    price: '$$',
  },
  {
    id: '2',
    name: 'Afro Artistry Studio',
    image: 'https://images.unsplash.com/photo-1622286346003-c8b4e2c6f0d9?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    rating: 4.8,
    reviewCount: 89,
    address: 'Atlanta, GA',
    specialties: ['Braids', 'Twist Outs', 'Color'],
    openNow: false,
    price: '$$$',
  },
  {
    id: '3',
    name: 'Royal Cuts & Styles',
    image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    rating: 4.7,
    reviewCount: 156,
    address: 'Chicago, IL',
    specialties: ['Fade Cuts', 'Beard Styling', 'Hot Towel'],
    openNow: true,
    price: '$$',
  },
];

export function FeaturedBarbershops() {
  const t = useTranslations('barbershop');
  const tCommon = useTranslations('common');
  
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-4">
            Salons en Vedette
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Découvrez les meilleurs salons de votre région, spécialisés dans les soins capillaires afro et naturels
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredShops.map((shop) => (
            <div key={shop.id} className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group">
              <div className="relative">
                <img
                  src={shop.image}
                  alt={shop.name}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <button className="absolute top-4 right-4 p-2 bg-white/90 rounded-full hover:bg-white transition-colors">
                  <Heart className="w-5 h-5 text-gray-600 hover:text-red-500" />
                </button>
                <div className="absolute bottom-4 left-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    shop.openNow 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {shop.openNow ? 'Ouvert' : 'Fermé'}
                  </span>
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-xl font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                    {shop.name}
                  </h3>
                  <span className="text-sm font-medium text-gray-600">{shop.price}</span>
                </div>

                <div className="flex items-center space-x-4 mb-3">
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-sm font-medium text-gray-900">{shop.rating}</span>
                    <span className="text-sm text-gray-600">({shop.reviewCount})</span>
                  </div>
                  <div className="flex items-center space-x-1 text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">{shop.address}</span>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex flex-wrap gap-2">
                    {shop.specialties.slice(0, 2).map((specialty) => (
                      <span
                        key={specialty}
                        className="px-2 py-1 bg-primary-50 text-primary-700 text-xs font-medium rounded-full"
                      >
                        {specialty}
                      </span>
                    ))}
                    {shop.specialties.length > 2 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                        +{shop.specialties.length - 2} autres
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex space-x-3">
                  <Link
                    href={`/barbershops/${shop.id}`}
                    className="flex-1 bg-primary-600 hover:bg-primary-700 text-white text-center py-2 px-4 rounded-lg font-medium transition-colors"
                  >
                    {t('viewDetails')}
                  </Link>
                  <Link
                    href={`/barbershops/${shop.id}/book`}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-900 text-center py-2 px-4 rounded-lg font-medium transition-colors"
                  >
                    {t('bookNow')}
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link
            href="/barbershops"
            className="inline-flex items-center space-x-2 bg-white border-2 border-primary-600 text-primary-600 hover:bg-primary-600 hover:text-white font-semibold py-3 px-8 rounded-lg transition-all duration-200"
          >
            <span>Voir Tous les Salons</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
