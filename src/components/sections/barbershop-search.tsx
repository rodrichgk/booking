'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Search, MapPin, Filter, SlidersHorizontal } from 'lucide-react';
import { specialties, serviceCategories } from '@/lib/utils';

export function BarbershopSearch() {
  const t = useTranslations('barbershop');
  const tCommon = useTranslations('common');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState('all');
  const [rating, setRating] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  const handleSpecialtyToggle = (specialty: string) => {
    setSelectedSpecialties(prev => 
      prev.includes(specialty) 
        ? prev.filter(s => s !== specialty)
        : [...prev, specialty]
    );
  };

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Main Search Bar */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher des salons, services ou coiffeurs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div className="lg:w-64 relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Ville, région ou code postal"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="lg:w-auto flex items-center justify-center space-x-2 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <SlidersHorizontal className="w-5 h-5" />
            <span>Filtres</span>
          </button>
          <button className="lg:w-auto bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-lg font-medium transition-colors">
            Rechercher
          </button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-gray-50 rounded-lg p-6 space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Specialties */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Spécialités</h3>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {specialties.map((specialty) => (
                    <label key={specialty} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedSpecialties.includes(specialty)}
                        onChange={() => handleSpecialtyToggle(specialty)}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-sm text-gray-700">{specialty}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Service Categories */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Services</h3>
                <div className="space-y-2">
                  {serviceCategories.map((category) => (
                    <label key={category} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(category)}
                        onChange={() => handleCategoryToggle(category)}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-sm text-gray-700">{category}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Gamme de Prix</h3>
                <div className="space-y-2">
                  {[
                    { value: 'all', label: 'Tous les Prix' },
                    { value: '$', label: '$ - Économique' },
                    { value: '$$', label: '$$ - Modéré' },
                    { value: '$$$', label: '$$$ - Premium' },
                    { value: '$$$$', label: '$$$$ - Luxe' },
                  ].map((option) => (
                    <label key={option.value} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="priceRange"
                        value={option.value}
                        checked={priceRange === option.value}
                        onChange={(e) => setPriceRange(e.target.value)}
                        className="border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-sm text-gray-700">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Rating */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Note Minimale</h3>
                <div className="space-y-2">
                  {[
                    { value: 'all', label: 'Toutes les Notes' },
                    { value: '4', label: '4+ Étoiles' },
                    { value: '4.5', label: '4.5+ Étoiles' },
                    { value: '4.8', label: '4.8+ Étoiles' },
                  ].map((option) => (
                    <label key={option.value} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="rating"
                        value={option.value}
                        checked={rating === option.value}
                        onChange={(e) => setRating(e.target.value)}
                        className="border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-sm text-gray-700">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Filter Actions */}
            <div className="flex justify-between items-center pt-4 border-t border-gray-200">
              <button
                onClick={() => {
                  setSelectedSpecialties([]);
                  setSelectedCategories([]);
                  setPriceRange('all');
                  setRating('all');
                }}
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                Effacer Tous les Filtres
              </button>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowFilters(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors">
                  Appliquer les Filtres
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
