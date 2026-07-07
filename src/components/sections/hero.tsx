'use client';

import { useState } from 'react';
import { Link } from '@/routing';
import { useTranslations, useLocale } from 'next-intl';
import { Search, MapPin, Calendar, Star } from 'lucide-react';

const translations = {
  fr: {
    locationPlaceholder: 'Ville ou code postal',
    stat1Value: 'Afro & texturés',
    stat1Label: 'Notre spécialité',
    stat2Value: '24/7',
    stat2Label: 'Réservation en ligne',
    stat3Value: 'Marseille → NY',
    stat3Label: 'Nos villes',
    easyBooking: 'Réservation Facile',
    onlineAlways: '24h/24 En Ligne',
    topRated: 'Très Bien Noté',
    expertStylists: 'Coiffeurs Experts',
  },
  en: {
    locationPlaceholder: 'City or zip code',
    stat1Value: 'Afro & textured',
    stat1Label: 'Our specialty',
    stat2Value: '24/7',
    stat2Label: 'Online booking',
    stat3Value: 'Marseille → NY',
    stat3Label: 'Our cities',
    easyBooking: 'Easy Booking',
    onlineAlways: 'Online 24/7',
    topRated: 'Top Rated',
    expertStylists: 'Expert Stylists',
  },
};

export function Hero() {
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  const t = useTranslations('hero');
  const locale = useLocale() as 'fr' | 'en';
  const text = translations[locale] || translations.fr;

  return (
    <section className="relative bg-gradient-to-br from-primary-50 via-white to-accent-50 pt-16 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-sans font-bold text-gray-900 leading-tight">
                {t('title')}
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed font-body">
                {t('subtitle')}
              </p>
            </div>

            {/* Search Form */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder={t('searchPlaceholder')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent font-body"
                  />
                </div>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder={text.locationPlaceholder}
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent font-body"
                  />
                </div>
              </div>
              <Link
                href={`/barbershops?search=${searchQuery}&location=${location}`}
                className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
              >
                <Search className="w-5 h-5" />
                <span className="font-body">{t('findSalons')}</span>
              </Link>
            </div>

            {/* Value props (grounded in reality — no vanity metrics) */}
            <div className="grid grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-xl md:text-2xl font-bold text-primary-600 font-sans leading-tight">{text.stat1Value}</div>
                <div className="text-sm text-gray-600 font-body">{text.stat1Label}</div>
              </div>
              <div className="text-center">
                <div className="text-xl md:text-2xl font-bold text-primary-600 font-sans leading-tight">{text.stat2Value}</div>
                <div className="text-sm text-gray-600 font-body">{text.stat2Label}</div>
              </div>
              <div className="text-center">
                <div className="text-xl md:text-2xl font-bold text-primary-600 font-sans leading-tight">{text.stat3Value}</div>
                <div className="text-sm text-gray-600 font-body">{text.stat3Label}</div>
              </div>
            </div>
          </div>

          {/* Right Content - Hero Image */}
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1560066984-138dadb4c035?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                alt="Professional barber working on natural hair"
                className="w-full h-[500px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            </div>

            {/* Floating Cards */}
            <div className="absolute -top-4 -left-4 bg-white rounded-xl shadow-lg p-4 border border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900 font-body">{text.easyBooking}</div>
                  <div className="text-sm text-gray-600 font-body">{text.onlineAlways}</div>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-4 -right-4 bg-white rounded-xl shadow-lg p-4 border border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-accent-100 rounded-full flex items-center justify-center">
                  <Star className="w-6 h-6 text-accent-600" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900 font-body">{text.topRated}</div>
                  <div className="text-sm text-gray-600 font-body">{text.expertStylists}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
