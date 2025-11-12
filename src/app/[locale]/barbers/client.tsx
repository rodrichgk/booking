'use client';

import { useState } from 'react';
import { Link } from '@/routing';
import { Search, MapPin, Star, Filter, Scissors, Store, Phone, Mail } from 'lucide-react';
import { Header } from '@/components/ui/header';
import { Footer } from '@/components/ui/footer';

interface Barber {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  specialties: string[] | null;
  experience: number | null;
  rating: string | null;
  isActive: boolean;
  barbershopId: string;
  barbershopName: string;
  barbershopCity: string;
  barbershopAddress: string;
}

interface BarbersClientProps {
  barbers: Barber[];
  locale: string;
}

export function BarbersClient({ barbers, locale }: BarbersClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    rating: '',
    city: '',
    experience: ''
  });

  const filteredBarbers = barbers.filter(barber => {
    // Search by name or specialties
    if (searchQuery) {
      const nameMatch = barber.name?.toLowerCase().includes(searchQuery.toLowerCase());
      const specialtyMatch = barber.specialties?.some(s => 
        s.toLowerCase().includes(searchQuery.toLowerCase())
      );
      if (!nameMatch && !specialtyMatch) return false;
    }
    
    // Filter by location/city
    if (location && !barber.barbershopCity.toLowerCase().includes(location.toLowerCase())) {
      return false;
    }
    
    // Filter by rating
    if (filters.rating && barber.rating && parseFloat(barber.rating) < parseFloat(filters.rating)) {
      return false;
    }
    
    // Filter by city
    if (filters.city && barber.barbershopCity !== filters.city) {
      return false;
    }

    // Filter by experience
    if (filters.experience && barber.experience && barber.experience < parseInt(filters.experience)) {
      return false;
    }
    
    return true;
  });

  // Get unique cities for filter
  const uniqueCities = Array.from(new Set(barbers.map(b => b.barbershopCity))).sort();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Page Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-sans font-bold text-gray-900 mb-2">
            Trouvez Votre Coiffeur Parfait
          </h1>
          <p className="text-gray-600 font-body">
            Découvrez des coiffeurs et coiffeuses experts spécialisés dans les soins capillaires afro et naturels
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
                  placeholder="Rechercher un coiffeur ou spécialité..."
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
              <div className="grid md:grid-cols-4 gap-4">
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
                <div>
                  <label className="block text-sm font-body font-semibold text-gray-700 mb-2">
                    Expérience minimum
                  </label>
                  <select
                    value={filters.experience}
                    onChange={(e) => setFilters({...filters, experience: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg font-body"
                  >
                    <option value="">Toutes</option>
                    <option value="3">3+ ans</option>
                    <option value="5">5+ ans</option>
                    <option value="10">10+ ans</option>
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
            {filteredBarbers.length} coiffeur{filteredBarbers.length > 1 ? 's' : ''} trouvé{filteredBarbers.length > 1 ? 's' : ''}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBarbers.map((barber) => (
            <div
              key={barber.id}
              className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden border border-gray-200"
            >
              {/* Header */}
              <div className="relative h-32 bg-gradient-to-br from-accent-500 to-accent-700">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Scissors className="w-16 h-16 text-white opacity-20" />
                </div>
                {barber.experience && (
                  <div className="absolute top-4 right-4">
                    <div className="flex items-center space-x-1 bg-white px-3 py-1 rounded-full">
                      <Scissors className="w-3 h-3 text-gray-600" />
                      <span className="text-xs font-body font-semibold text-gray-700">{barber.experience} ans</span>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-sans font-bold text-gray-900">{barber.name || 'Coiffeur'}</h3>
                    {barber.rating && (
                      <div className="flex items-center space-x-1 mt-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-body font-semibold">{barber.rating}</span>
                      </div>
                    )}
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-sans font-bold text-lg">
                      {barber.name?.split(' ').map(n => n[0]).join('') || '?'}
                    </span>
                  </div>
                </div>
                
                {/* Barbershop */}
                <div className="flex items-center text-sm text-gray-600 mb-2">
                  <Store className="w-4 h-4 mr-2 flex-shrink-0 text-primary-600" />
                  <Link 
                    href={`/barbershops/${barber.barbershopId}`}
                    className="font-body hover:text-primary-600 truncate"
                  >
                    {barber.barbershopName}
                  </Link>
                </div>

                {/* Location */}
                <div className="flex items-center text-sm text-gray-600 mb-3">
                  <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span className="font-body truncate">{barber.barbershopCity}</span>
                </div>
                
                {/* Specialties */}
                {barber.specialties && barber.specialties.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {barber.specialties.slice(0, 3).map((specialty, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-primary-100 text-primary-700 rounded-full text-xs font-body"
                      >
                        {specialty}
                      </span>
                    ))}
                    {barber.specialties.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-body">
                        +{barber.specialties.length - 3}
                      </span>
                    )}
                  </div>
                )}

                {/* Contact */}
                <div className="pt-4 border-t border-gray-100 space-y-2">
                  {barber.phone && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="w-3 h-3 mr-2" />
                      <span className="font-body text-xs truncate">{barber.phone}</span>
                    </div>
                  )}
                  {barber.email && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Mail className="w-3 h-3 mr-2" />
                      <span className="font-body text-xs truncate">{barber.email}</span>
                    </div>
                  )}
                </div>

                {/* View Profile & Book */}
                <div className="mt-4 flex gap-2">
                  <Link
                    href={`/barbers/${barber.id}`}
                    className="flex-1 text-center bg-primary-600 text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-primary-700 transition-colors"
                  >
                    View Profile
                  </Link>
                  <Link
                    href={`/barbers/${barber.id}/booking`}
                    className="flex-1 text-center border-2 border-primary-600 text-primary-600 px-4 py-2 rounded-lg font-semibold text-sm hover:bg-primary-50 transition-colors"
                  >
                    Book Now
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredBarbers.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-sans font-semibold text-gray-900 mb-2">
              Aucun coiffeur trouvé
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
