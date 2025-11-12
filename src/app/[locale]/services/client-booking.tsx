'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, Scissors, Sparkles, Palette, Heart, Zap, Crown, Clock, DollarSign, Users, ArrowRight } from 'lucide-react';
import { Header } from '@/components/ui/header';
import { Footer } from '@/components/ui/footer';

interface Service {
  name: string;
  description: string | null;
  minPrice: string;
  maxPrice: string;
  duration: number;
  category: string | null;
  serviceIds: string[];
  shopCount: number;
}

interface ServicesBookingClientProps {
  services: Service[];
  locale: string;
}

const categoryIcons: Record<string, any> = {
  'haircut': Scissors,
  'cut': Scissors,
  'styling': Sparkles,
  'color': Palette,
  'treatment': Heart,
  'maintenance': Zap,
  'special': Crown,
};

const categoryColors: Record<string, string> = {
  'haircut': 'blue',
  'cut': 'blue',
  'styling': 'purple',
  'color': 'pink',
  'treatment': 'green',
  'maintenance': 'orange',
  'special': 'yellow',
};

export function ServicesBookingClient({ services, locale }: ServicesBookingClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredServices = services.filter((service) => {
    if (searchQuery && !service.name.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !service.description?.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (selectedCategory && service.category !== selectedCategory) {
      return false;
    }
    return true;
  });

  const categories = Array.from(new Set(services.map(s => s.category).filter(Boolean)));

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; text: string; border: string; hover: string }> = {
      blue: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200', hover: 'hover:bg-blue-200' },
      purple: { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200', hover: 'hover:bg-purple-200' },
      pink: { bg: 'bg-pink-100', text: 'text-pink-700', border: 'border-pink-200', hover: 'hover:bg-pink-200' },
      green: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200', hover: 'hover:bg-green-200' },
      orange: { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200', hover: 'hover:bg-orange-200' },
      yellow: { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-200', hover: 'hover:bg-yellow-200' },
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
              Browse Our Services
            </h1>
            <p className="text-xl text-primary-100 max-w-3xl mx-auto">
              Choose a service and find the best-rated barbers for your needs
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search & Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <div className="flex gap-2 overflow-x-auto">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-colors ${
                  !selectedCategory
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-colors capitalize ${
                    selectedCategory === category
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service, index) => {
            const category = service.category || 'haircut';
            const Icon = categoryIcons[category] || Scissors;
            const colorClasses = getColorClasses(categoryColors[category] || 'blue');
            const priceRange = service.minPrice === service.maxPrice 
              ? `€${service.minPrice}`
              : `€${service.minPrice} - €${service.maxPrice}`;

            return (
              <div
                key={index}
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden border border-gray-100"
              >
                {/* Icon Header */}
                <div className={`${colorClasses.bg} p-6 flex items-center justify-between`}>
                  <div className={`w-16 h-16 rounded-full ${colorClasses.border} border-2 flex items-center justify-center bg-white`}>
                    <Icon className={`w-8 h-8 ${colorClasses.text}`} />
                  </div>
                  <div className={`px-3 py-1 rounded-full ${colorClasses.border} border bg-white`}>
                    <span className={`text-xs font-semibold uppercase ${colorClasses.text}`}>
                      {category}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-xl font-display font-bold text-gray-900 mb-2">
                    {service.name}
                  </h3>
                  {service.description && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {service.description}
                    </p>
                  )}

                  {/* Details */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <DollarSign className="w-4 h-4 text-primary-600" />
                      <span className="font-semibold">{priceRange}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Clock className="w-4 h-4 text-primary-600" />
                      <span>{service.duration} minutes</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Users className="w-4 h-4 text-primary-600" />
                      <span>{service.shopCount} barbershop{service.shopCount > 1 ? 's' : ''} offer this</span>
                    </div>
                  </div>

                  {/* Book Button */}
                  <Link
                    href={`/${locale}/services/${service.serviceIds[0]}/book`}
                    className="block w-full bg-primary-600 text-white text-center px-6 py-3 rounded-lg font-bold hover:bg-primary-700 transition-colors"
                  >
                    Find Barbers
                    <ArrowRight className="w-5 h-5 inline-block ml-2" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {filteredServices.length === 0 && (
          <div className="text-center py-12">
            <Scissors className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No services found</h3>
            <p className="text-gray-600">Try adjusting your search or filters</p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
