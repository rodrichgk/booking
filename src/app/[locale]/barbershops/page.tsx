'use client';

// Force dynamic rendering to avoid SSG issues with client components
export const dynamic = 'force-dynamic';
export const dynamicParams = true;
export const revalidate = 0;

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/routing';
import { Search, MapPin, Star, Clock, Filter } from 'lucide-react';
import { Header } from '@/components/ui/header';
import { Footer } from '@/components/ui/footer';

// Demo data - will be replaced with database calls later
const demoBarbershops = [
  {
    id: '1',
    name: 'Salon Afro Élégance',
    rating: 4.8,
    reviewCount: 127,
    address: '15 Rue de la République, 75011 Paris',
    distance: '0.8 km',
    image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    specialties: ['Tresses', 'Défrisage', 'Soins naturels'],
    priceRange: '€€',
    openNow: true,
    nextAvailable: '14:30'
  },
  {
    id: '2',
    name: 'Natural Hair Studio',
    rating: 4.6,
    reviewCount: 89,
    address: '42 Avenue des Champs-Élysées, 75008 Paris',
    distance: '1.2 km',
    image: 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    specialties: ['Cheveux naturels', 'Protective styles'],
    priceRange: '€€€',
    openNow: false,
    nextAvailable: 'Demain 9:00'
  },
  {
    id: '3',
    name: 'Coiffure Royale',
    rating: 4.9,
    reviewCount: 203,
    address: '8 Boulevard Saint-Germain, 75005 Paris',
    distance: '2.1 km',
    image: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    specialties: ['Locks', 'Coupes afro', 'Coloration'],
    priceRange: '€€',
    openNow: true,
    nextAvailable: '16:00'
  },
  {
    id: '4',
    name: 'Beauté Noire',
    rating: 4.7,
    reviewCount: 156,
    address: '23 Rue de Rivoli, 75001 Paris',
    distance: '1.8 km',
    image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    specialties: ['Extensions', 'Tissage', 'Maquillage'],
    priceRange: '€€€',
    openNow: true,
    nextAvailable: '15:15'
  }
];

export default function BarbershopsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    priceRange: '',
    rating: '',
    openNow: false,
    specialties: [] as string[]
  });
  const t = useTranslations('barbershop');

  const filteredShops = demoBarbershops.filter(shop => {
    if (searchQuery && !shop.name.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !shop.specialties.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))) {
      return false;
    }
    if (filters.priceRange && shop.priceRange !== filters.priceRange) return false;
    if (filters.openNow && !shop.openNow) return false;
    if (filters.rating && shop.rating < parseFloat(filters.rating)) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Page Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-sans font-bold text-gray-900 mb-2">
            Trouvez Votre Salon Parfait
          </h1>
          <p className="text-gray-600 font-body">
            Découvrez des salons experts spécialisés dans les soins capillaires afro et naturels
          </p>
        </div>
      </div>

      {/* Search Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1 flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Rechercher un salon ou service..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent font-body"
                />
              </div>
              <div className="relative flex-1">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Ville ou code postal"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent font-body"
                />
              </div>
            </div>
            
            {/* Filter Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-6 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2 font-body"
            >
              <Filter className="w-5 h-5" />
              <span>Filtres</span>
            </button>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="grid md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-body font-semibold text-gray-700 mb-2">
                    Prix
                  </label>
                  <select
                    value={filters.priceRange}
                    onChange={(e) => setFilters({...filters, priceRange: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg font-body"
                  >
                    <option value="">Tous</option>
                    <option value="€">€ - Économique</option>
                    <option value="€€">€€ - Modéré</option>
                    <option value="€€€">€€€ - Premium</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-body font-semibold text-gray-700 mb-2">
                    Note minimum
                  </label>
                  <select
                    value={filters.rating}
                    onChange={(e) => setFilters({...filters, rating: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg font-body"
                  >
                    <option value="">Toutes</option>
                    <option value="4.5">4.5+ étoiles</option>
                    <option value="4.0">4.0+ étoiles</option>
                    <option value="3.5">3.5+ étoiles</option>
                  </select>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="openNow"
                    checked={filters.openNow}
                    onChange={(e) => setFilters({...filters, openNow: e.target.checked})}
                    className="mr-2"
                  />
                  <label htmlFor="openNow" className="text-sm font-body font-semibold text-gray-700">
                    Ouvert maintenant
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <p className="text-gray-600 font-body">
            {filteredShops.length} salon{filteredShops.length > 1 ? 's' : ''} trouvé{filteredShops.length > 1 ? 's' : ''}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredShops.map((shop) => (
            <Link
              key={shop.id}
              href={`/barbershops/${shop.id}`}
              className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden"
            >
              <div className="relative h-48">
                <img
                  src={shop.image}
                  alt={shop.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 right-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-body font-semibold ${
                    shop.openNow 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {shop.openNow ? 'Ouvert' : 'Fermé'}
                  </span>
                </div>
                <div className="absolute top-4 left-4">
                  <span className="px-2 py-1 bg-white rounded-full text-xs font-body font-semibold text-gray-700">
                    {shop.priceRange}
                  </span>
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-sans font-bold text-gray-900">{shop.name}</h3>
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-body font-semibold">{shop.rating}</span>
                    <span className="text-sm font-body text-gray-500">({shop.reviewCount})</span>
                  </div>
                </div>
                
                <div className="flex items-center text-sm text-gray-600 mb-3">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span className="font-body">{shop.address}</span>
                  <span className="mx-2">•</span>
                  <span className="font-body">{shop.distance}</span>
                </div>
                
                <div className="flex flex-wrap gap-1 mb-4">
                  {shop.specialties.slice(0, 3).map((specialty, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-primary-100 text-primary-700 rounded-full text-xs font-body"
                    >
                      {specialty}
                    </span>
                  ))}
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="w-4 h-4 mr-1" />
                    <span className="font-body">Prochain créneau: {shop.nextAvailable}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {filteredShops.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-sans font-semibold text-gray-900 mb-2">
              Aucun salon trouvé
            </h3>
            <p className="text-gray-600 font-body">
              Essayez de modifier vos critères de recherche ou vos filtres.
            </p>
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
}
