'use client';

import { Store, MapPin, Phone, Mail, Globe, AlertCircle, CheckCircle, XCircle, ArrowRight, Settings, User, Image as ImageIcon, Video, Calendar, Clock, Heart, Star, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import Image from 'next/image';

interface Barbershop {
  id: string;
  name: string;
  description: string | null;
  address: string;
  city: string;
  phone: string | null;
  email: string | null;
  website: string | null;
  rating: string | null;
  reviewCount: number | null;
  isActive: boolean;
  createdAt: Date;
  subscriptionStatus: string;
}

interface BarberProfile {
  id: string;
  barbershopId: string;
  profileImage: string | null;
  galleryImages: string[] | null;
  youtubeLinks: string[] | null;
  bio: string | null;
  specialties: string[] | null;
  experience: number | null;
  rating: string | null;
}

interface Booking {
  id: string;
  barbershopId: string;
  barbershopName: string | null;
  barbershopCity: string | null;
  barbershopImage: string[] | null;
  barberName: string | null;
  serviceName: string | null;
  startTime: Date;
  endTime: Date;
  status: string | null;
  totalPrice: string;
}

interface MySpaceClientProps {
  barbershops: Barbershop[];
  barberProfile?: BarberProfile | null;
  bookings?: Booking[];
  locale: string;
  userRole: string;
  userName: string;
}

export function MySpaceClient({ 
  barbershops, 
  barberProfile,
  bookings = [],
  locale, 
  userRole,
  userName 
}: MySpaceClientProps) {
  const t = useTranslations('mySpace');
  const tCommon = useTranslations('common');

  // Determine user type
  const isBarber = !!barberProfile;
  const isShopOwner = barbershops.length > 0;
  const isCustomer = !isBarber && !isShopOwner;

  // Customer view - show bookings and stats
  if (isCustomer) {
    const now = new Date();
    const upcomingBookings = bookings.filter(b => new Date(b.startTime) >= now && b.status !== 'cancelled');
    const completedBookings = bookings.filter(b => b.status === 'completed');
    const cancelledBookings = bookings.filter(b => b.status === 'cancelled');
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
          {/* Hero Section */}
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-4xl font-display font-bold mb-2">👋 {t('welcome')}, {userName}!</h1>
                  <p className="text-primary-100 text-lg">{t('manageBookingsAndDiscover')}</p>
                </div>
                <Sparkles className="w-16 h-16 text-primary-200 hidden md:block" />
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-blue-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">{t('upcomingBookings')}</p>
                    <p className="text-4xl font-bold text-gray-900 mt-2">{upcomingBookings.length}</p>
                  </div>
                  <div className="p-4 bg-blue-100 rounded-full">
                    <Calendar className="w-8 h-8 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-green-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">{t('completedAppointmentsCount')}</p>
                    <p className="text-4xl font-bold text-gray-900 mt-2">{completedBookings.length}</p>
                  </div>
                  <div className="p-4 bg-green-100 rounded-full">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-purple-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">{t('totalBookings')}</p>
                    <p className="text-4xl font-bold text-gray-900 mt-2">{bookings.length}</p>
                  </div>
                  <div className="p-4 bg-purple-100 rounded-full">
                    <Star className="w-8 h-8 text-purple-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-12">
              {/* Upcoming Bookings */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                  <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white">
                    <h2 className="text-2xl font-display font-bold text-gray-900">{t('upcomingAppointmentsTitle')}</h2>
                  </div>
                  <div className="p-6">
                    {upcomingBookings.length === 0 ? (
                      <div className="text-center py-12">
                        <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 mb-4">{t('noUpcomingBookings')}</p>
                        <Link
                          href={`/${locale}/barbershops`}
                          className="inline-flex items-center px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-colors"
                        >
                          <Store className="w-4 h-4 mr-2" />
                          {t('bookNow')}
                        </Link>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {upcomingBookings.slice(0, 3).map((booking) => (
                          <div key={booking.id} className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 hover:shadow-md transition-all">
                            <div className="flex items-start gap-4">
                              {booking.barbershopImage && booking.barbershopImage[0] ? (
                                <Image
                                  src={booking.barbershopImage[0]}
                                  alt={booking.barbershopName || 'Barbershop'}
                                  width={80}
                                  height={80}
                                  className="rounded-lg object-cover"
                                />
                              ) : (
                                <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                                  <Store className="w-8 h-8 text-gray-400" />
                                </div>
                              )}
                              <div className="flex-1">
                                <h3 className="font-bold text-gray-900 text-lg">{booking.barbershopName}</h3>
                                <p className="text-sm text-gray-600 mb-2">
                                  <MapPin className="w-4 h-4 inline mr-1" />
                                  {booking.barbershopCity}
                                </p>
                                <div className="flex flex-wrap gap-3 text-sm">
                                  <span className="text-gray-700">
                                    <Calendar className="w-4 h-4 inline mr-1" />
                                    {new Date(booking.startTime).toLocaleDateString('fr-FR')}
                                  </span>
                                  <span className="text-gray-700">
                                    <Clock className="w-4 h-4 inline mr-1" />
                                    {new Date(booking.startTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                  <span className="font-semibold text-primary-600">{booking.totalPrice}€</span>
                                </div>
                                <p className="text-sm text-gray-500 mt-1">
                                  {booking.serviceName} • {booking.barberName}
                                </p>
                              </div>
                              <Link
                                href={`/${locale}/barbershops/${booking.barbershopId}`}
                                className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium transition-colors"
                              >
                                {t('view')}
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Recent History */}
                {completedBookings.length > 0 && (
                  <div className="bg-white rounded-xl shadow-lg overflow-hidden mt-8">
                    <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-white">
                      <h2 className="text-2xl font-display font-bold text-gray-900">{t('recentHistory')}</h2>
                    </div>
                    <div className="p-6">
                      <div className="space-y-3">
                        {completedBookings.slice(0, 3).map((booking) => (
                          <div key={booking.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div>
                              <p className="font-semibold text-gray-900">{booking.barbershopName}</p>
                              <p className="text-sm text-gray-600">
                                {new Date(booking.startTime).toLocaleDateString('fr-FR')} • {booking.serviceName}
                              </p>
                            </div>
                            <span className="text-green-600 font-semibold flex items-center">
                              <CheckCircle className="w-4 h-4 mr-1" />
                              {t('completed')}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                  <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-white">
                    <h2 className="text-xl font-display font-bold text-gray-900">{t('quickActions')}</h2>
                  </div>
                  <div className="p-6 space-y-4">
                    <Link
                      href={`/${locale}/barbershops`}
                      className="block p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-all group"
                    >
                      <div className="flex items-center">
                        <div className="p-3 bg-primary-100 rounded-lg mr-4 group-hover:bg-primary-200 transition-colors">
                          <Store className="w-6 h-6 text-primary-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{t('findSalon')}</h3>
                          <p className="text-sm text-gray-600">{t('discoverBestSalons')}</p>
                        </div>
                      </div>
                    </Link>

                    <Link
                      href={`/${locale}/barbers`}
                      className="block p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-all group"
                    >
                      <div className="flex items-center">
                        <div className="p-3 bg-purple-100 rounded-lg mr-4 group-hover:bg-purple-200 transition-colors">
                          <User className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{t('proProfessionals')}</h3>
                          <p className="text-sm text-gray-600">{t('findIdealBarber')}</p>
                        </div>
                      </div>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
    );
  }

  // Barber view - show profile and shop
  if (isBarber && !isShopOwner) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-gray-900">{t('title')}</h1>
                <p className="text-gray-600 mt-2">{t('barberProfile')}</p>
              </div>
              <Link
                href={`/${locale}/profile`}
                className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
              >
                {tCommon('back')}
              </Link>
            </div>
          </div>
        </div>

        {/* Barber Profile Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">{t('barberProfile')}</h2>
              <p className="text-gray-600 mt-1">{t('manageProfessionalProfile')}</p>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Profile Image */}
                <Link
                  href={`/${locale}/my-space/barber/profile`}
                  className="p-6 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="font-semibold text-gray-900 text-center mb-2">{t('profileImage')}</h3>
                  <p className="text-sm text-gray-600 text-center">{t('updateProfilePicture')}</p>
                </Link>
                
                {/* Gallery */}
                <Link
                  href={`/${locale}/my-space/barber/gallery`}
                  className="p-6 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="font-semibold text-gray-900 text-center mb-2">{t('gallery')}</h3>
                  <p className="text-sm text-gray-600 text-center">
                    {barberProfile?.galleryImages?.length || 0} {t('imagesCount')}
                  </p>
                </Link>
                
                {/* Videos */}
                <Link
                  href={`/${locale}/my-space/barber/videos`}
                  className="p-6 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <Video className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="font-semibold text-gray-900 text-center mb-2">{t('videos')}</h3>
                  <p className="text-sm text-gray-600 text-center">
                    {barberProfile?.youtubeLinks?.length || 0} {t('videosCount')}
                  </p>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Shop owner view (original My Barbershops functionality)
  const handleSubscribe = (barbershopId: string) => {
    window.location.href = `/${locale}/subscription?barbershopId=${barbershopId}`;
  };

  // No barbershops found for shop owner
  if (barbershops.length === 0 && !isBarber) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-2xl w-full bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <Store className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{t('createYourBarbershop')}</h2>
            <p className="text-gray-600 mb-2">
              {t('noBarbershopsYet')}
            </p>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
            <h3 className="font-semibold text-blue-900 mb-3">{t('howItWorksTitle')}</h3>
            <ol className="space-y-3 text-blue-800">
              <li className="flex items-start">
                <span className="font-bold mr-3 text-blue-600">1.</span>
                <span>{t('contactAdminStep')}</span>
              </li>
              <li className="flex items-start">
                <span className="font-bold mr-3 text-blue-600">2.</span>
                <span>{t('subscribeStep')}</span>
              </li>
              <li className="flex items-start">
                <span className="font-bold mr-3 text-blue-600">3.</span>
                <span>{t('addBarbersStep')}</span>
              </li>
            </ol>
          </div>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> {t('subscriptionNote')}
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href={`/${locale}/profile`}
              className="inline-flex items-center justify-center px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-colors"
            >
              {t('backToProfile')}
            </Link>
            <a
              href="mailto:support@orphelia.com?subject=Create Barbershop"
              className="inline-flex items-center justify-center px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-colors"
            >
              <Mail className="w-4 h-4 mr-2" />
              {t('contactAdmin')}
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Shop owner with barbershops
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">{t('title')}</h1>
              <p className="text-gray-600 mt-2">{t('myShop')}</p>
            </div>
            <Link
              href={`/${locale}/profile`}
              className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
            >
              {tCommon('back')}
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">{t('totalLocations')}</p>
                  <p className="text-3xl font-bold text-blue-900 mt-2">{barbershops.length}</p>
                </div>
                <Store className="w-12 h-12 text-blue-600 opacity-50" />
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">{t('activeShops')}</p>
                  <p className="text-3xl font-bold text-green-900 mt-2">
                    {barbershops.filter(b => b.subscriptionStatus === 'active').length}
                  </p>
                </div>
                <CheckCircle className="w-12 h-12 text-green-600 opacity-50" />
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-6 border border-red-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-600">{t('inactiveShops')}</p>
                  <p className="text-3xl font-bold text-red-900 mt-2">
                    {barbershops.filter(b => b.subscriptionStatus !== 'active').length}
                  </p>
                </div>
                <XCircle className="w-12 h-12 text-red-600 opacity-50" />
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">{t('monthlyCost')}</p>
                  <p className="text-3xl font-bold text-purple-900 mt-2">
                    €{(barbershops.filter(b => b.subscriptionStatus === 'active').length * 29.90).toFixed(2)}
                  </p>
                </div>
                <Settings className="w-12 h-12 text-purple-600 opacity-50" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Barbershops Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {barbershops.map((barbershop) => (
            <div
              key={barbershop.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* Status Banner */}
              {barbershop.subscriptionStatus !== 'active' && (
                <div className="bg-yellow-500 text-white px-4 py-2 text-sm font-medium flex items-center">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  {t('subscriptionRequired')}
                </div>
              )}
              {barbershop.subscriptionStatus === 'active' && (
                <div className="bg-green-500 text-white px-4 py-2 text-sm font-medium flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  {t('activeAndVisible')}
                </div>
              )}

              {/* Content */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">{barbershop.name}</h3>
                    <div className="flex items-center text-gray-600 text-sm">
                      <MapPin className="w-4 h-4 mr-1" />
                      {barbershop.city}
                    </div>
                  </div>
                  <Store className="w-10 h-10 text-gray-300" />
                </div>

                <div className="space-y-2 mb-4">
                  {barbershop.address && (
                    <p className="text-sm text-gray-600 flex items-start">
                      <MapPin className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                      {barbershop.address}
                    </p>
                  )}
                  {barbershop.phone && (
                    <p className="text-sm text-gray-600 flex items-center">
                      <Phone className="w-4 h-4 mr-2 flex-shrink-0" />
                      {barbershop.phone}
                    </p>
                  )}
                  {barbershop.email && (
                    <p className="text-sm text-gray-600 flex items-center">
                      <Mail className="w-4 h-4 mr-2 flex-shrink-0" />
                      {barbershop.email}
                    </p>
                  )}
                  {barbershop.website && (
                    <p className="text-sm text-gray-600 flex items-center">
                      <Globe className="w-4 h-4 mr-2 flex-shrink-0" />
                      <a href={barbershop.website} target="_blank" rel="noopener noreferrer" className="hover:text-primary-600">
                        {t('website')}
                      </a>
                    </p>
                  )}
                </div>

                {/* Rating */}
                {barbershop.rating && (
                  <div className="flex items-center mb-4">
                    <span className="text-yellow-500 text-lg font-bold mr-1">★</span>
                    <span className="text-gray-900 font-semibold">{barbershop.rating}</span>
                    <span className="text-gray-500 text-sm ml-1">({barbershop.reviewCount} {t('reviewsCount')})</span>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  {barbershop.subscriptionStatus !== 'active' ? (
                    <button
                      onClick={() => handleSubscribe(barbershop.id)}
                      className="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center"
                    >
                      {t('subscribeNow')}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </button>
                  ) : (
                    <Link
                      href={`/${locale}/my-space/${barbershop.id}`}
                      className="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center"
                    >
                      {t('manageShop')}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
