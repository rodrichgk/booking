'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Star, MapPin, Scissors, Award, ArrowLeft, Calendar, Clock, DollarSign, Info, Phone, ChevronLeft, ChevronRight } from 'lucide-react';
import { Header } from '@/components/ui/header';
import { Footer } from '@/components/ui/footer';

interface BarberProfileClientProps {
  barber: {
    id: string;
    barbershopId: string;
    name: string;
    email: string;
    phone: string | null;
    profileImage: string | null;
    galleryImages: string[];
    youtubeLinks: string[];
    bio: string | null;
    specialties: string[];
    experience: number | null;
    rating: string | null;
    barbershopName: string;
    barbershopAddress: string;
    barbershopCity: string;
    barbershopPhone: string | null;
  };
  stats: {
    totalBookings: number;
    completedBookings: number;
  };
  services: Array<{
    id: string;
    name: string;
    description: string | null;
    price: string;
    duration: number;
    category: string | null;
  }>;
  locale: string;
}

export function BarberProfileClient({ barber, stats, services, locale }: BarberProfileClientProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const rating = parseFloat(barber.rating || '0');
  const galleryImages = barber.galleryImages || [];
  const youtubeLinks = barber.youtubeLinks || [];

  const nextImage = () => {
    setSelectedImageIndex((prev) => (prev + 1) % galleryImages.length);
  };

  const prevImage = () => {
    setSelectedImageIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Profile Image */}
            <div className="relative">
              {barber.profileImage ? (
                <Image
                  src={barber.profileImage}
                  alt={barber.name}
                  width={200}
                  height={200}
                  className="rounded-full border-4 border-white shadow-xl"
                />
              ) : (
                <div className="w-48 h-48 rounded-full bg-white/20 flex items-center justify-center">
                  <Scissors className="w-24 h-24 text-white" />
                </div>
              )}
              {rating > 0 && (
                <div className="absolute bottom-0 right-0 bg-white text-primary-600 px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="font-bold">{rating.toFixed(1)}</span>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-4xl font-display font-bold mb-2">{barber.name}</h1>
              {barber.experience && (
                <p className="text-primary-100 text-lg mb-4 flex items-center justify-center md:justify-start gap-2">
                  <Award className="w-5 h-5" />
                  {barber.experience} years of experience
                </p>
              )}
              
              {/* Barbershop Info */}
              <div className="flex flex-col md:flex-row items-center gap-4 text-primary-100">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>{barber.barbershopName}, {barber.barbershopCity}</span>
                </div>
                {barber.barbershopPhone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    <span>{barber.barbershopPhone}</span>
                  </div>
                )}
              </div>

              {/* Stats */}
              <div className="flex items-center justify-center md:justify-start gap-6 mt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold">{stats.completedBookings}</div>
                  <div className="text-sm text-primary-100">Completed</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold">{stats.totalBookings}</div>
                  <div className="text-sm text-primary-100">Total Bookings</div>
                </div>
                {rating > 0 && (
                  <div className="text-center">
                    <div className="text-3xl font-bold">{rating.toFixed(1)}</div>
                    <div className="text-sm text-primary-100">Rating</div>
                  </div>
                )}
              </div>

              {/* CTA Button */}
              <Link
                href={`/${locale}/barbers/${barber.id}/booking`}
                className="inline-block mt-6 bg-white text-primary-600 px-8 py-3 rounded-lg font-bold hover:bg-primary-50 transition-colors shadow-lg"
              >
                <Calendar className="w-5 h-5 inline-block mr-2" />
                Book with {barber.name.split(' ')[0]}
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* About */}
            {barber.bio && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-2xl font-display font-bold mb-4">About</h2>
                <p className="text-gray-700 leading-relaxed">{barber.bio}</p>
              </div>
            )}

            {/* Specialties */}
            {barber.specialties && barber.specialties.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-2xl font-display font-bold mb-4">Specialties</h2>
                <div className="flex flex-wrap gap-2">
                  {barber.specialties.map((specialty, index) => (
                    <span
                      key={index}
                      className="bg-primary-100 text-primary-700 px-4 py-2 rounded-full font-semibold"
                    >
                      {specialty}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Gallery */}
            {galleryImages.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-2xl font-display font-bold mb-4">Work Gallery</h2>
                
                {/* Main Image */}
                <div className="relative aspect-[4/3] rounded-lg overflow-hidden mb-4">
                  <Image
                    src={galleryImages[selectedImageIndex]}
                    alt={`Work by ${barber.name}`}
                    fill
                    className="object-cover"
                  />
                  {galleryImages.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                      >
                        <ChevronLeft className="w-6 h-6" />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                      >
                        <ChevronRight className="w-6 h-6" />
                      </button>
                    </>
                  )}
                </div>

                {/* Thumbnails */}
                {galleryImages.length > 1 && (
                  <div className="grid grid-cols-4 gap-2">
                    {galleryImages.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImageIndex(index)}
                        className={`relative aspect-square rounded-lg overflow-hidden ${
                          index === selectedImageIndex ? 'ring-4 ring-primary-500' : ''
                        }`}
                      >
                        <Image
                          src={image}
                          alt={`Work ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* YouTube Videos */}
            {youtubeLinks.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-2xl font-display font-bold mb-4">Video Portfolio</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {youtubeLinks.map((link, index) => {
                    const videoId = link.split('v=')[1]?.split('&')[0] || link.split('/').pop();
                    return (
                      <div key={index} className="relative aspect-video rounded-lg overflow-hidden bg-gray-100">
                        <iframe
                          src={`https://www.youtube.com/embed/${videoId}`}
                          title={`Video ${index + 1}`}
                          className="w-full h-full"
                          allowFullScreen
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Services */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-display font-bold mb-4">Available Services</h2>
              <div className="space-y-3">
                {services.map((service) => (
                  <div key={service.id} className="border-b border-gray-100 pb-3 last:border-0">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-semibold text-gray-900">{service.name}</h3>
                      <span className="text-primary-600 font-bold">€{service.price}</span>
                    </div>
                    {service.description && (
                      <p className="text-sm text-gray-600 mb-1">{service.description}</p>
                    )}
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Clock className="w-4 h-4" />
                      <span>{service.duration} min</span>
                    </div>
                  </div>
                ))}
              </div>
              
              <Link
                href={`/${locale}/barbers/${barber.id}/booking`}
                className="block w-full mt-6 bg-primary-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-primary-700 transition-colors text-center"
              >
                Book Now
              </Link>
            </div>

            {/* Location */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-display font-bold mb-4">Location</h2>
              <div className="space-y-3">
                <div>
                  <div className="font-semibold text-gray-900">{barber.barbershopName}</div>
                  <div className="text-gray-600 text-sm">{barber.barbershopAddress}</div>
                  <div className="text-gray-600 text-sm">{barber.barbershopCity}</div>
                </div>
                {barber.barbershopPhone && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <Phone className="w-4 h-4" />
                    <span className="text-sm">{barber.barbershopPhone}</span>
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
