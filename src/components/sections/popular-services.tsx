'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Scissors, Sparkles, Palette, Zap } from 'lucide-react';

const services = [
  {
    id: '1',
    name: 'Natural Hair Cuts',
    description: 'Expert cuts for all natural hair textures and curl patterns',
    icon: Scissors,
    price: 'From $45',
    duration: '45-60 min',
    image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    popular: true,
  },
  {
    id: '2',
    name: 'Protective Styles',
    description: 'Braids, twists, and styles that protect your natural hair',
    icon: Sparkles,
    price: 'From $80',
    duration: '2-4 hours',
    image: 'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    popular: true,
  },
  {
    id: '3',
    name: 'Loc Maintenance',
    description: 'Professional care for locs at every stage of development',
    icon: Zap,
    price: 'From $60',
    duration: '1-2 hours',
    image: 'https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    popular: false,
  },
  {
    id: '4',
    name: 'Color & Highlights',
    description: 'Safe coloring techniques for textured and natural hair',
    icon: Palette,
    price: 'From $120',
    duration: '2-3 hours',
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    popular: false,
  },
];

export function PopularServices() {
  const t = useTranslations('services');
  const tCommon = useTranslations('common');
  
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-4">
            Services Populaires
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            De l'entretien quotidien aux coiffures d'occasion spéciale, trouvez le service parfait pour vos cheveux
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service) => {
            const IconComponent = service.icon;
            return (
              <div key={service.id} className="group relative">
                <div className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100">
                  <div className="relative">
                    <img
                      src={service.image}
                      alt={service.name}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {service.popular && (
                      <div className="absolute top-4 left-4">
                        <span className="bg-accent-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                          Populaire
                        </span>
                      </div>
                    )}
                    <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded-full p-3">
                      <IconComponent className="w-6 h-6 text-primary-600" />
                    </div>
                  </div>

                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                      {service.name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {service.description}
                    </p>
                    
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-lg font-bold text-primary-600">
                        {service.price}
                      </div>
                      <div className="text-sm text-gray-500">
                        {service.duration}
                      </div>
                    </div>

                    <Link
                      href={`/services/${service.id}`}
                      className="w-full bg-gray-50 hover:bg-primary-50 text-gray-900 hover:text-primary-700 text-center py-2 px-4 rounded-lg font-medium transition-all duration-200 block"
                    >
                      Réserver
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center mt-12">
          <Link
            href="/services"
            className="inline-flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200"
          >
            <span>Voir Tous les Services</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
