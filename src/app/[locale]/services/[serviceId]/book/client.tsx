'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Star, MapPin, Scissors, Award, ArrowLeft, Calendar, Clock, DollarSign, Info } from 'lucide-react';
import { Header } from '@/components/ui/header';
import { Footer } from '@/components/ui/footer';

interface ServiceBarbersClientProps {
  service: {
    id: string;
    name: string;
    description: string | null;
    price: string;
    duration: number;
    category: string | null;
    barbershopId: string;
  };
  barbers: Array<{
    id: string;
    userId: string;
    barbershopId: string;
    name: string;
    profileImage: string | null;
    bio: string | null;
    specialties: string[];
    experience: number | null;
    rating: string | null;
    barbershopName: string;
    barbershopAddress: string;
    barbershopCity: string;
    barbershopPhone: string | null;
  }>;
  locale: string;
}

export function ServiceBarbersClient({ service, barbers, locale }: ServiceBarbersClientProps) {
  const [sortBy, setSortBy] = useState<'rating' | 'experience'>('rating');

  const sortedBarbers = [...barbers].sort((a, b) => {
    if (sortBy === 'rating') {
      const ratingA = parseFloat(a.rating || '0');
      const ratingB = parseFloat(b.rating || '0');
      return ratingB - ratingA;
    } else {
      return (b.experience || 0) - (a.experience || 0);
    }
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Button */}
        <Link
          href={`/${locale}/services`}
          className="inline-flex items-center text-gray-600 hover:text-primary-600 mb-6"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Services
        </Link>

        {/* Service Info Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex-1">
              <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">
                {service.name}
              </h1>
              {service.description && (
                <p className="text-gray-600 mb-4">{service.description}</p>
              )}
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <div className="flex items-center gap-2 text-gray-700">
                  <DollarSign className="w-5 h-5 text-primary-600" />
                  <span className="font-semibold">€{service.price}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <Clock className="w-5 h-5 text-primary-600" />
                  <span>{service.duration} minutes</span>
                </div>
                {service.category && (
                  <div className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full font-semibold capitalize">
                    {service.category}
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Info className="w-5 h-5 text-blue-500" />
              <span className="text-sm text-gray-600">
                {barbers.length} barber{barbers.length !== 1 ? 's' : ''} available
              </span>
            </div>
          </div>
        </div>

        {/* Sort Controls */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-display font-bold text-gray-900">
            Choose Your Barber
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => setSortBy('rating')}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                sortBy === 'rating'
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              <Star className="w-4 h-4 inline-block mr-1" />
              Top Rated
            </button>
            <button
              onClick={() => setSortBy('experience')}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                sortBy === 'experience'
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              <Award className="w-4 h-4 inline-block mr-1" />
              Most Experienced
            </button>
          </div>
        </div>

        {/* Barbers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedBarbers.map((barber) => {
            const rating = parseFloat(barber.rating || '0');
            
            return (
              <div
                key={barber.id}
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden border border-gray-100"
              >
                {/* Barber Image */}
                <div className="relative h-48 bg-gradient-to-br from-primary-500 to-primary-600">
                  {barber.profileImage ? (
                    <Image
                      src={barber.profileImage}
                      alt={barber.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Scissors className="w-16 h-16 text-white opacity-20" />
                    </div>
                  )}
                  
                  {/* Rating Badge */}
                  {rating > 0 && (
                    <div className="absolute top-4 right-4 bg-white px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-bold text-gray-900">{rating.toFixed(1)}</span>
                    </div>
                  )}

                  {/* Experience Badge */}
                  {barber.experience && (
                    <div className="absolute top-4 left-4 bg-white px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
                      <Award className="w-4 h-4 text-primary-600" />
                      <span className="text-sm font-semibold text-gray-900">
                        {barber.experience}y exp
                      </span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-xl font-display font-bold text-gray-900 mb-1">
                    {barber.name}
                  </h3>
                  
                  {/* Location */}
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                    <MapPin className="w-4 h-4" />
                    <span>{barber.barbershopName}, {barber.barbershopCity}</span>
                  </div>

                  {/* Bio */}
                  {barber.bio && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {barber.bio}
                    </p>
                  )}

                  {/* Specialties */}
                  {barber.specialties && barber.specialties.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {barber.specialties.slice(0, 3).map((specialty, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-primary-100 text-primary-700 rounded-full text-xs font-semibold"
                        >
                          {specialty}
                        </span>
                      ))}
                      {barber.specialties.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-semibold">
                          +{barber.specialties.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Link
                      href={`/${locale}/barbers/${barber.id}`}
                      className="flex-1 text-center border-2 border-primary-600 text-primary-600 px-4 py-2 rounded-lg font-semibold text-sm hover:bg-primary-50 transition-colors"
                    >
                      View Profile
                    </Link>
                    <Link
                      href={`/${locale}/barbers/${barber.id}/booking?serviceId=${service.id}`}
                      className="flex-1 text-center bg-primary-600 text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-primary-700 transition-colors"
                    >
                      <Calendar className="w-4 h-4 inline-block mr-1" />
                      Book
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {barbers.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg">
            <Scissors className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No barbers available</h3>
            <p className="text-gray-600 mb-4">
              We couldn't find any barbers offering this service at the moment.
            </p>
            <Link
              href={`/${locale}/services`}
              className="inline-block bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
            >
              Browse Other Services
            </Link>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
