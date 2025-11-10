'use client';

import { useState } from 'react';
import { Link } from '@/routing';
import Image from 'next/image';
import { Star, MapPin, Clock, Phone, Calendar, Heart, Share2, Mail, Globe, Store, Scissors } from 'lucide-react';
import { Header } from '@/components/ui/header';
import { Footer } from '@/components/ui/footer';

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
}

interface Barber {
  id: string;
  name: string | null;
  email: string | null;
  specialties: string[] | null;
  experience: number | null;
  rating: string | null;
  isActive: boolean;
}

interface BarbershopDetailClientProps {
  shop: Barbershop;
  barbers: Barber[];
  locale: string;
}

export function BarbershopDetailClient({ shop, barbers, locale }: BarbershopDetailClientProps) {
  const [isFavorite, setIsFavorite] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <div className="relative h-96 bg-gradient-to-br from-primary-600 to-primary-800">
        {shop.images && shop.images.length > 0 ? (
          <Image
            src={shop.images[0]}
            alt={shop.name}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Store className="w-32 h-32 text-white opacity-20" />
          </div>
        )}
        <div className="absolute inset-0 bg-black bg-opacity-30"></div>
        <div className="absolute bottom-6 left-6 right-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-sans font-bold text-white mb-2 drop-shadow-lg">{shop.name}</h1>
              <div className="flex items-center space-x-4 text-white">
                {shop.rating && (
                  <div className="flex items-center space-x-1">
                    <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    <span className="font-body font-semibold">{shop.rating}</span>
                    <span className="font-body">({shop.reviewCount} avis)</span>
                  </div>
                )}
                <div className="flex items-center space-x-1">
                  <MapPin className="w-4 h-4" />
                  <span className="font-body text-sm">{shop.address}, {shop.city}</span>
                </div>
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setIsFavorite(!isFavorite)}
                className={`p-3 rounded-full transition-colors ${
                  isFavorite ? 'bg-red-500 text-white' : 'bg-white text-gray-700'
                }`}
              >
                <Heart className="w-5 h-5" fill={isFavorite ? 'currentColor' : 'none'} />
              </button>
              <button className="p-3 bg-white text-gray-700 rounded-full hover:bg-gray-100 transition-colors">
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* About */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <h2 className="text-2xl font-sans font-bold text-gray-900 mb-4">À propos</h2>
              <p className="text-gray-600 font-body leading-relaxed">
                {shop.description || 'Salon de coiffure professionnel spécialisé dans les soins capillaires.'}
              </p>
            </div>

            {/* Photo Gallery */}
            {shop.images && shop.images.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <h2 className="text-2xl font-sans font-bold text-gray-900 mb-4">Photos du Salon</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {shop.images.map((image, index) => (
                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden group">
                      <Image
                        src={image}
                        alt={`${shop.name} - Photo ${index + 1}`}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Team */}
            {barbers.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <h2 className="text-2xl font-sans font-bold text-gray-900 mb-6">Notre Équipe</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {barbers.map((barber) => (
                    <div key={barber.id} className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-sans font-bold text-xl">
                          {barber.name?.split(' ').map(n => n[0]).join('') || '?'}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-body font-semibold text-gray-900 truncate">{barber.name || 'Coiffeur'}</h3>
                        {barber.specialties && barber.specialties.length > 0 && (
                          <p className="text-sm text-gray-600 font-body truncate">
                            {barber.specialties.join(', ')}
                          </p>
                        )}
                        <div className="flex items-center space-x-3 mt-1">
                          {barber.experience && (
                            <div className="flex items-center space-x-1">
                              <Scissors className="w-3 h-3 text-gray-500" />
                              <span className="text-xs text-gray-600">{barber.experience} ans</span>
                            </div>
                          )}
                          {barber.rating && (
                            <div className="flex items-center space-x-1">
                              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                              <span className="text-sm font-body">{barber.rating}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {barbers.length === 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 text-center">
                <p className="text-gray-500 font-body">
                  Aucun coiffeur n'est actuellement disponible dans ce salon.
                </p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Booking Card */}
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-6 border border-gray-200">
              <h3 className="text-xl font-sans font-bold text-gray-900 mb-4">Réserver un rendez-vous</h3>
              <Link
                href={`/barbershops/${shop.id}/booking`}
                className="w-full bg-primary-600 hover:bg-primary-700 text-white font-body font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
              >
                <Calendar className="w-5 h-5" />
                <span>Choisir un créneau</span>
              </Link>
            </div>

            {/* Contact Info */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <h3 className="text-xl font-sans font-bold text-gray-900 mb-4">Informations de contact</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-body text-gray-900">{shop.address}</p>
                    <p className="font-body text-gray-600 text-sm">{shop.city}</p>
                  </div>
                </div>
                {shop.phone && (
                  <div className="flex items-center space-x-3">
                    <Phone className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    <a href={`tel:${shop.phone}`} className="font-body text-gray-900 hover:text-primary-600">
                      {shop.phone}
                    </a>
                  </div>
                )}
                {shop.email && (
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    <a href={`mailto:${shop.email}`} className="font-body text-gray-900 hover:text-primary-600 truncate">
                      {shop.email}
                    </a>
                  </div>
                )}
                {shop.website && (
                  <div className="flex items-center space-x-3">
                    <Globe className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    <a 
                      href={shop.website} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="font-body text-gray-900 hover:text-primary-600 truncate"
                    >
                      Site web
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
