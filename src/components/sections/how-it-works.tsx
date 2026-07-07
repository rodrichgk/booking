'use client';

import { useLocale } from 'next-intl';
import { Search, Calendar, Scissors, Star } from 'lucide-react';
import { Reveal } from '@/components/ui/reveal';

const stepsData = {
  fr: [
    {
      id: 1,
      title: 'Trouvez le bon salon',
      description: 'Cherchez par ville et par spécialité — afro, bouclés, locks, tresses — et repérez les coiffeurs qui connaissent vraiment votre texture.',
      icon: Search,
      color: 'bg-blue-500',
    },
    {
      id: 2,
      title: 'Réservez en ligne',
      description: 'Choisissez le créneau et le coiffeur qui vous conviennent. Disponibilités en temps réel, confirmation immédiate par email.',
      icon: Calendar,
      color: 'bg-green-500',
    },
    {
      id: 3,
      title: 'Passez au salon',
      description: "Présentez-vous à l'heure et laissez faire des professionnels qui maîtrisent les cheveux afro et texturés.",
      icon: Scissors,
      color: 'bg-purple-500',
    },
    {
      id: 4,
      title: 'Donnez votre avis',
      description: "Notez votre passage pour aider la communauté à trouver les bonnes adresses, ville par ville.",
      icon: Star,
      color: 'bg-yellow-500',
    },
  ],
  en: [
    {
      id: 1,
      title: 'Find the right salon',
      description: 'Search by city and specialty — afro, curly, locks, braids — and find stylists who actually know your texture.',
      icon: Search,
      color: 'bg-blue-500',
    },
    {
      id: 2,
      title: 'Book online',
      description: 'Pick the time slot and stylist that suit you. Real-time availability, instant email confirmation.',
      icon: Calendar,
      color: 'bg-green-500',
    },
    {
      id: 3,
      title: 'Come in',
      description: 'Show up on time and let professionals who work with afro and textured hair every day take care of the rest.',
      icon: Scissors,
      color: 'bg-purple-500',
    },
    {
      id: 4,
      title: 'Leave a review',
      description: 'Rate your visit to help the community find the good addresses, city by city.',
      icon: Star,
      color: 'bg-yellow-500',
    },
  ],
};

const translations = {
  fr: {
    title: 'Comment ça marche',
    subtitle: "Réserver un coiffeur qui s'y connaît en cheveux afro et texturés, en quatre étapes.",
    step: 'Étape',
    readyToStart: 'Prêt à réserver ?',
    joinThousands: "Trouvez un salon spécialisé en cheveux afro, bouclés et texturés — à Marseille, à New York et partout où nous sommes présents.",
    findSalons: 'Trouver un salon',
    learnMore: 'En savoir plus',
  },
  en: {
    title: 'How it works',
    subtitle: 'Booking a stylist who knows afro and textured hair, in four steps.',
    step: 'Step',
    readyToStart: 'Ready to book?',
    joinThousands: 'Find a salon specializing in afro, curly and textured hair — in Marseille, in New York, and everywhere we operate.',
    findSalons: 'Find a salon',
    learnMore: 'Learn more',
  },
};

export function HowItWorks() {
  const locale = useLocale() as 'fr' | 'en';
  const steps = stepsData[locale] || stepsData.fr;
  const t = translations[locale] || translations.fr;

  return (
    <section className="py-16 bg-gradient-to-br from-gray-50 to-primary-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-4">
            {t.title}
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {t.subtitle}
          </p>
        </Reveal>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => {
            const IconComponent = step.icon;
            return (
              <Reveal key={step.id} delay={index * 120} className="relative h-full">
                <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all duration-300 text-center h-full">
                  <div className={`w-16 h-16 ${step.color} rounded-2xl flex items-center justify-center mx-auto mb-6`}>
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>

                  <div className="mb-4">
                    <div className="text-sm font-semibold text-primary-600 mb-2">
                      {t.step} {step.id}
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      {step.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>

                {/* Connector Arrow */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                    <div className="w-8 h-0.5 bg-gradient-to-r from-primary-300 to-primary-500"></div>
                    <div className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-1">
                      <div className="w-0 h-0 border-l-4 border-l-primary-500 border-t-2 border-t-transparent border-b-2 border-b-transparent"></div>
                    </div>
                  </div>
                )}
              </Reveal>
            );
          })}
        </div>

        <div className="text-center mt-12">
          <div className="bg-white rounded-2xl p-8 shadow-sm max-w-2xl mx-auto">
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">
              {t.readyToStart}
            </h3>
            <p className="text-gray-600 mb-6">
              {t.joinThousands}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200">
                {t.findSalons}
              </button>
              <button className="bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold py-3 px-8 rounded-lg transition-colors duration-200">
                {t.learnMore}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
