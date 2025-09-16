'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Star, MapPin, Clock, Heart, Phone, Globe } from 'lucide-react';

// Mock data - in a real app, this would come from your database
const barbershops = [
  {
    id: '1',
    name: 'Crown & Glory Barbershop',
    image: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    rating: 4.9,
    reviewCount: 127,
    address: '123 Malcolm X Blvd, Brooklyn, NY 11233',
    city: 'Brooklyn',
    state: 'NY',
    phone: '(718) 555-0123',
    website: 'crownandglory.com',
    specialties: ['Natural Hair', 'Protective Styles', 'Loc Maintenance', 'Silk Press'],
    priceRange: '$$',
    openNow: true,
    nextAvailable: '2:30 PM Today',
    distance: '0.8 miles',
    featured: true,
  },
  {
    id: '2',
    name: 'Afro Artistry Studio',
    image: 'https://images.unsplash.com/photo-1622286346003-c8b4e2c6f0d9?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    rating: 4.8,
    reviewCount: 89,
    address: '456 Auburn Ave, Atlanta, GA 30312',
    city: 'Atlanta',
    state: 'GA',
    phone: '(404) 555-0456',
    website: 'afroartistry.com',
    specialties: ['Braids', 'Twist Outs', 'Color', 'Natural Cuts'],
    priceRange: '$$$',
    openNow: false,
    nextAvailable: '9:00 AM Tomorrow',
    distance: '1.2 miles',
    featured: false,
  },
  {
    id: '3',
    name: 'Royal Cuts & Styles',
    image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    rating: 4.7,
    reviewCount: 156,
    address: '789 South Side Dr, Chicago, IL 60637',
    city: 'Chicago',
    state: 'IL',
    phone: '(312) 555-0789',
    website: 'royalcuts.com',
    specialties: ['Fade Cuts', 'Beard Styling', 'Hot Towel', 'Classic Cuts'],
    priceRange: '$$',
    openNow: true,
    nextAvailable: '4:15 PM Today',
    distance: '2.1 miles',
    featured: false,
  },
  {
    id: '4',
    name: 'Natural Essence Salon',
    image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    rating: 4.9,
    reviewCount: 203,
    address: '321 Lenox Ave, New York, NY 10027',
    city: 'New York',
    state: 'NY',
    phone: '(212) 555-0321',
    website: 'naturalessence.com',
    specialties: ['Natural Hair', 'Treatments', 'Scalp Care', 'Protective Styles'],
    priceRange: '$$$',
    openNow: true,
    nextAvailable: '1:00 PM Today',
    distance: '0.5 miles',
    featured: true,
  },
  {
    id: '5',
    name: 'Urban Roots Barbershop',
    image: 'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    rating: 4.6,
    reviewCount: 74,
    address: '654 MLK Jr Way, Oakland, CA 94609',
    city: 'Oakland',
    state: 'CA',
    phone: '(510) 555-0654',
    website: 'urbanroots.com',
    specialties: ['Locs', 'Braids', 'Natural Cuts', 'Beard Care'],
    priceRange: '$$',
    openNow: false,
    nextAvailable: '10:30 AM Tomorrow',
    distance: '3.2 miles',
    featured: false,
  },
  {
    id: '6',
    name: 'Heritage Hair Studio',
    image: 'https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    rating: 4.8,
    reviewCount: 112,
    address: '987 Historic District, Savannah, GA 31401',
    city: 'Savannah',
    state: 'GA',
    phone: '(912) 555-0987',
    website: 'heritagehair.com',
    specialties: ['Traditional Styles', 'Loc Maintenance', 'Natural Hair', 'Treatments'],
    priceRange: '$$',
    openNow: true,
    nextAvailable: '3:45 PM Today',
    distance: '1.8 miles',
    featured: false,
  },
];

export function BarbershopGrid() {
  const [sortBy, setSortBy] = useState('featured');
  const [viewMode, setViewMode] = useState('grid');

  const sortedBarbershops = [...barbershops].sort((a, b) => {
    switch (sortBy) {
      case 'rating':
        return b.rating - a.rating;
      case 'distance':
        return parseFloat(a.distance) - parseFloat(b.distance);
      case 'price-low':
        return a.priceRange.length - b.priceRange.length;
      case 'price-high':
        return b.priceRange.length - a.priceRange.length;
      default:
        return b.featured ? 1 : -1;
    }
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Results Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            {barbershops.length} Barbershops Found
          </h2>
          <p className="text-gray-600">Showing results near you</p>
        </div>
        
        <div className="flex items-center space-x-4 mt-4 sm:mt-0">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="featured">Featured</option>
            <option value="rating">Highest Rated</option>
            <option value="distance">Nearest</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Barbershop Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {sortedBarbershops.map((shop) => (
          <div key={shop.id} className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group border border-gray-100">
            <div className="relative">
              <img
                src={shop.image}
                alt={shop.name}
                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <button className="absolute top-4 right-4 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors">
                <Heart className="w-5 h-5 text-gray-600 hover:text-red-500" />
              </button>
              
              {shop.featured && (
                <div className="absolute top-4 left-4">
                  <span className="bg-accent-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    Featured
                  </span>
                </div>
              )}
              
              <div className="absolute bottom-4 left-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  shop.openNow 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {shop.openNow ? 'Open Now' : 'Closed'}
                </span>
              </div>
            </div>

            <div className="p-6">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-xl font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                  {shop.name}
                </h3>
                <span className="text-sm font-medium text-gray-600">{shop.priceRange}</span>
              </div>

              <div className="flex items-center space-x-4 mb-3">
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-sm font-medium text-gray-900">{shop.rating}</span>
                  <span className="text-sm text-gray-600">({shop.reviewCount})</span>
                </div>
                <div className="flex items-center space-x-1 text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">{shop.distance}</span>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">{shop.address}</p>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>Next: {shop.nextAvailable}</span>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex flex-wrap gap-2">
                  {shop.specialties.slice(0, 3).map((specialty) => (
                    <span
                      key={specialty}
                      className="px-2 py-1 bg-primary-50 text-primary-700 text-xs font-medium rounded-full"
                    >
                      {specialty}
                    </span>
                  ))}
                  {shop.specialties.length > 3 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                      +{shop.specialties.length - 3} more
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-3 mb-4 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <Phone className="w-4 h-4" />
                  <span>{shop.phone}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Globe className="w-4 h-4" />
                  <span>{shop.website}</span>
                </div>
              </div>

              <div className="flex space-x-3">
                <Link
                  href={`/barbershops/${shop.id}`}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-900 text-center py-2 px-4 rounded-lg font-medium transition-colors"
                >
                  View Details
                </Link>
                <Link
                  href={`/barbershops/${shop.id}/book`}
                  className="flex-1 bg-primary-600 hover:bg-primary-700 text-white text-center py-2 px-4 rounded-lg font-medium transition-colors"
                >
                  Book Now
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Load More */}
      <div className="text-center mt-12">
        <button className="bg-white border-2 border-primary-600 text-primary-600 hover:bg-primary-600 hover:text-white font-semibold py-3 px-8 rounded-lg transition-all duration-200">
          Load More Barbershops
        </button>
      </div>
    </div>
  );
}
