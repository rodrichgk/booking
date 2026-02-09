'use client';

import { useState } from 'react';
import { Link } from '@/routing';
import { Search, MapPin, Star, Clock, Filter, Store } from 'lucide-react';
import Image from 'next/image';
import { Header } from '@/components/ui/header';
import { Footer } from '@/components/ui/footer';

interface OpeningHours {
  [key: string]: { open: string; close: string; closed: boolean };
}

interface Barbershop {
  id: string;
  name: string;
  description: string | null;
  address: string;
  city: string;
  phone: string | null;
  email: string | null;
  website: string | null;
  images: string[] | null;
  rating: string | null;
  reviewCount: number | null;
  isActive: boolean;
  openingHours: OpeningHours | null;
}

// Check if barbershop is currently open
function isShopOpen(openingHours: OpeningHours | null): boolean {
  if (!openingHours) return false;
  
  const now = new Date();
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const today = days[now.getDay()];
  const todayHours = openingHours[today];
  
  if (!todayHours || todayHours.closed) return false;
  
  const currentTime = now.getHours() * 60 + now.getMinutes();
  const [openHour, openMin] = todayHours.open.split(':').map(Number);
  const [closeHour, closeMin] = todayHours.close.split(':').map(Number);
  const openTime = openHour * 60 + openMin;
  const closeTime = closeHour * 60 + closeMin;
  
  return currentTime >= openTime && currentTime < closeTime;
}

interface BarbershopsClientProps {
  barbershops: Barbershop[];
  locale: string;
}

export function BarbershopsClient({ barbershops, locale }: BarbershopsClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    rating: '',
    city: ''
  });

  const filteredShops = barbershops.filter(shop => {
    // Search by name or city
    if (searchQuery && 
        !shop.name.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !shop.city.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    // Filter by location/city
    if (location && !shop.city.toLowerCase().includes(location.toLowerCase())) {
      return false;
    }
    
    // Filter by rating
    if (filters.rating && shop.rating && parseFloat(shop.rating) < parseFloat(filters.rating)) {
      return false;
    }
    
    // Filter by city
    if (filters.city && shop.city !== filters.city) {
      return false;
    }
    
    return true;
  });

  // Get unique cities for filter
  const uniqueCities = Array.from(new Set(barbershops.map(shop => shop.city))).sort();

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
                  placeholder="Rechercher un salon..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent font-body"
                />
              </div>
              <div className="relative flex-1">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Ville"
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
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-body font-semibold text-gray-700 mb-2">
                    Ville
                  </label>
                  <select
                    value={filters.city}
                    onChange={(e) => setFilters({...filters, city: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg font-body"
                  >
                    <option value="">Toutes les villes</option>
                    {uniqueCities.map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
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
              className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden border border-gray-200"
            >
              {/* Header with image or gradient */}
              <div className="relative h-48 bg-gradient-to-br from-primary-500 to-primary-700">
                {shop.images && shop.images.length > 0 ? (
                  <Image
                    src={shop.images[0]}
                    alt={shop.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Store className="w-16 h-16 text-white opacity-20" />
                  </div>
                )}
                <div className="absolute top-4 right-4">
                  {isShopOpen(shop.openingHours) ? (
                    <span className="px-3 py-1 bg-green-500 text-white rounded-full text-xs font-body font-semibold shadow-lg">
                      {locale === 'fr' ? 'Ouvert' : 'Open'}
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-gray-500 text-white rounded-full text-xs font-body font-semibold shadow-lg">
                      {locale === 'fr' ? 'Fermé' : 'Closed'}
                    </span>
                  )}
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-sans font-bold text-gray-900">{shop.name}</h3>
                  {shop.rating && (
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-body font-semibold">{shop.rating}</span>
                      <span className="text-sm font-body text-gray-500">({shop.reviewCount})</span>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center text-sm text-gray-600 mb-3">
                  <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                  <span className="font-body">{shop.address}, {shop.city}</span>
                </div>
                
                {shop.description && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2 font-body">
                    {shop.description}
                  </p>
                )}
                
                {shop.phone && (
                  <div className="flex items-center text-sm text-gray-600 mb-2">
                    <Clock className="w-4 h-4 mr-1" />
                    <span className="font-body">{shop.phone}</span>
                  </div>
                )}

                <div className="mt-4 pt-4 border-t border-gray-100">
                  <span className="text-primary-600 font-semibold text-sm hover:text-primary-700">
                    Voir les détails →
                  </span>
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
