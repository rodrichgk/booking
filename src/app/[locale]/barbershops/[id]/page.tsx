'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { Link } from '@/routing';
import { Star, MapPin, Clock, Phone, Calendar, Heart, Share2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

// Demo data - will be replaced with database calls later
const demoShops = {
  '1': {
    id: '1',
    name: 'Salon Afro Élégance',
    rating: 4.8,
    reviewCount: 127,
    address: '15 Rue de la République, 75011 Paris',
    phone: '+33 1 43 55 67 89',
    hours: 'Lun-Sam: 9h-19h, Dim: 10h-18h',
    description: 'Spécialiste des cheveux afro et métissés depuis 15 ans. Notre équipe d\'experts vous propose des soins personnalisés pour sublimer vos cheveux naturels.',
    images: [
      'https://images.unsplash.com/photo-1560066984-138dadb4c035?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1562322140-8baeececf3df?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    ],
    services: [
      { id: '1', name: 'Coupe Afro', price: 35, duration: 45 },
      { id: '2', name: 'Tresses Africaines', price: 80, duration: 180 },
      { id: '3', name: 'Défrisage', price: 65, duration: 120 },
      { id: '4', name: 'Soins Hydratants', price: 45, duration: 60 },
      { id: '5', name: 'Locks/Dreadlocks', price: 120, duration: 240 }
    ],
    barbers: [
      { id: '1', name: 'Aminata Diallo', specialty: 'Tresses & Nattes', rating: 4.9 },
      { id: '2', name: 'Marcus Johnson', specialty: 'Coupes Modernes', rating: 4.8 },
      { id: '3', name: 'Fatou Keita', specialty: 'Soins Naturels', rating: 4.7 }
    ]
  },
  '2': {
    id: '2',
    name: 'Natural Hair Studio',
    rating: 4.6,
    reviewCount: 89,
    address: '42 Avenue des Champs-Élysées, 75008 Paris',
    phone: '+33 1 42 25 78 90',
    hours: 'Mar-Sam: 10h-20h, Dim-Lun: Fermé',
    description: 'Studio moderne spécialisé dans les cheveux naturels et les styles protecteurs. Produits bio et techniques innovantes.',
    images: [
      'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1560066984-138dadb4c035?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    ],
    services: [
      { id: '1', name: 'Wash & Go', price: 25, duration: 30 },
      { id: '2', name: 'Twist Out', price: 40, duration: 90 },
      { id: '3', name: 'Protective Styles', price: 95, duration: 200 },
      { id: '4', name: 'Deep Conditioning', price: 35, duration: 45 }
    ],
    barbers: [
      { id: '1', name: 'Sarah Williams', specialty: 'Cheveux Naturels', rating: 4.8 },
      { id: '2', name: 'Khadija Mbaye', specialty: 'Styles Protecteurs', rating: 4.6 }
    ]
  }
};

export default function BarbershopDetailsPage() {
  const params = useParams();
  const shopId = params.id as string;
  const shop = demoShops[shopId as keyof typeof demoShops];
  const [selectedImage, setSelectedImage] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const t = useTranslations('barbershop');

  if (!shop) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-sans font-bold text-gray-900 mb-4">Salon non trouvé</h1>
          <Link href="/barbershops" className="btn-primary">
            Retour aux salons
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative h-96 bg-gray-900">
        <img
          src={shop.images[selectedImage]}
          alt={shop.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        <div className="absolute bottom-6 left-6 right-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-sans font-bold text-white mb-2">{shop.name}</h1>
              <div className="flex items-center space-x-4 text-white">
                <div className="flex items-center space-x-1">
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-body">{shop.rating}</span>
                  <span className="font-body">({shop.reviewCount} avis)</span>
                </div>
                <div className="flex items-center space-x-1">
                  <MapPin className="w-4 h-4" />
                  <span className="font-body text-sm">{shop.address}</span>
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
                <Heart className="w-5 h-5" />
              </button>
              <button className="p-3 bg-white text-gray-700 rounded-full">
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Image Gallery */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex space-x-2 overflow-x-auto">
            {shop.images.map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(index)}
                className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                  selectedImage === index ? 'border-primary-500' : 'border-gray-200'
                }`}
              >
                <img src={image} alt={`${shop.name} ${index + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* About */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-2xl font-sans font-bold text-gray-900 mb-4">À propos</h2>
              <p className="text-gray-600 font-body leading-relaxed">{shop.description}</p>
            </div>

            {/* Services */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-2xl font-sans font-bold text-gray-900 mb-6">Services</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {shop.services.map((service) => (
                  <div key={service.id} className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-body font-semibold text-gray-900">{service.name}</h3>
                      <span className="text-primary-600 font-sans font-bold">{service.price}€</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="w-4 h-4 mr-1" />
                      <span className="font-body">{service.duration} min</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Team */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-2xl font-sans font-bold text-gray-900 mb-6">Notre Équipe</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {shop.barbers.map((barber) => (
                  <div key={barber.id} className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-sans font-bold text-xl">
                        {barber.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-body font-semibold text-gray-900">{barber.name}</h3>
                      <p className="text-sm text-gray-600 font-body">{barber.specialty}</p>
                      <div className="flex items-center space-x-1 mt-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-body">{barber.rating}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Booking Card */}
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-6">
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
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-xl font-sans font-bold text-gray-900 mb-4">Informations</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="font-body text-gray-900">{shop.address}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <p className="font-body text-gray-900">{shop.phone}</p>
                </div>
                <div className="flex items-start space-x-3">
                  <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="font-body text-gray-900">{shop.hours}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
