'use client';

import { useState } from 'react';
import { Scissors, Sparkles, Palette, Zap, Crown, Heart, Star, Clock } from 'lucide-react';
import Link from 'next/link';

interface Service {
  id: string;
  name: string;
  description: string;
  icon: string;
  price: string;
  duration: string;
  image: string;
  popular: boolean;
  category: string;
  features: string[];
  barbershopName?: string;
  barbershopId?: string;
}

interface Category {
  id: string;
  name: string;
  icon: string;
}

interface ServicesGridProps {
  services: Service[];
  categories: Category[];
}

const iconMap = {
  Scissors,
  Sparkles,
  Palette,
  Zap,
  Crown,
  Heart,
  Star,
  Clock
};

export function ServicesGrid({ services, categories }: ServicesGridProps) {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredServices = selectedCategory === 'all' 
    ? services 
    : services.filter(service => service.category === selectedCategory);

  return (
    <>
      {/* Categories Filter */}
      <section className="py-8 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-4">
            {categories.map((category) => {
              const IconComponent = iconMap[category.icon as keyof typeof iconMap];
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-full font-medium transition-all duration-200 ${
                    selectedCategory === category.id
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-50 hover:bg-primary-50 text-gray-700 hover:text-primary-700'
                  }`}
                >
                  <IconComponent className="w-5 h-5" />
                  <span>{category.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredServices.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">Aucun service disponible pour le moment.</p>
              <p className="text-gray-400 mt-2">Les salons actifs ajouteront bientôt leurs services.</p>
            </div>
          ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredServices.map((service) => {
              const IconComponent = iconMap[service.icon as keyof typeof iconMap];
              return (
                <div key={service.id} className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 group">
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
                    {service.barbershopName && (
                      <p className="text-sm text-primary-600 font-medium mb-2">
                        {service.barbershopName}
                      </p>
                    )}
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {service.description}
                    </p>
                    
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-lg font-bold text-primary-600">
                        {service.price}
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="w-4 h-4 mr-1" />
                        {service.duration}
                      </div>
                    </div>

                    {service.features.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-sm font-semibold text-gray-900 mb-2">Inclus :</h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {service.features.slice(0, 2).map((feature, index) => (
                            <li key={index} className="flex items-center">
                              <div className="w-1.5 h-1.5 bg-primary-500 rounded-full mr-2"></div>
                              {feature}
                            </li>
                          ))}
                          {service.features.length > 2 && (
                            <li className="text-primary-600 font-medium">
                              +{service.features.length - 2} autres avantages
                            </li>
                          )}
                        </ul>
                      </div>
                    )}

                    <Link
                      href={service.barbershopId ? `/barbershops/${service.barbershopId}` : `/barbershops`}
                      className="w-full bg-primary-600 hover:bg-primary-700 text-white text-center py-3 px-4 rounded-lg font-medium transition-colors duration-200 block"
                    >
                      Réserver ce Service
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
          )}
        </div>
      </section>
    </>
  );
}
