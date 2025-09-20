'use client';

import { useTranslations } from 'next-intl';
import { Search, Calendar, Scissors, Star } from 'lucide-react';

const getSteps = (t: any) => [
  {
    id: 1,
    title: 'Trouvez Votre Match Parfait',
    description: 'Recherchez des salons spécialisés dans votre type de cheveux et services préférés dans votre région.',
    icon: Search,
    color: 'bg-blue-500',
  },
  {
    id: 2,
    title: 'Réservez Votre Rendez-vous',
    description: 'Choisissez votre date, heure et coiffeur préférés. Consultez la disponibilité réelle et réservez instantanément.',
    icon: Calendar,
    color: 'bg-green-500',
  },
  {
    id: 3,
    title: 'Obtenez Votre Coupe Parfaite',
    description: 'Arrivez à votre rendez-vous et profitez d\'un service professionnel de coiffeurs experts vérifiés.',
    icon: Scissors,
    color: 'bg-purple-500',
  },
  {
    id: 4,
    title: 'Partagez Votre Expérience',
    description: 'Évaluez votre expérience et aidez d\'autres clients à trouver les meilleurs salons de la communauté.',
    icon: Star,
    color: 'bg-yellow-500',
  },
];

export function HowItWorks() {
  const t = useTranslations('howItWorks');
  const steps = getSteps(t);
  
  return (
    <section className="py-16 bg-gradient-to-br from-gray-50 to-primary-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-4">
            Comment Ça Marche
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Obtenir votre coupe parfaite n'a jamais été aussi facile. Suivez ces étapes simples pour réserver en toute confiance.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => {
            const IconComponent = step.icon;
            return (
              <div key={step.id} className="relative">
                <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all duration-300 text-center h-full">
                  <div className={`w-16 h-16 ${step.color} rounded-2xl flex items-center justify-center mx-auto mb-6`}>
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                  
                  <div className="mb-4">
                    <div className="text-sm font-semibold text-primary-600 mb-2">
                      Étape {step.id}
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
              </div>
            );
          })}
        </div>

        <div className="text-center mt-12">
          <div className="bg-white rounded-2xl p-8 shadow-sm max-w-2xl mx-auto">
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">
              Prêt à Commencer ?
            </h3>
            <p className="text-gray-600 mb-6">
              Rejoignez des milliers de clients satisfaits qui font confiance à AfroBook pour leurs besoins capillaires.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200">
                Trouver des Salons
              </button>
              <button className="bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold py-3 px-8 rounded-lg transition-colors duration-200">
                En Savoir Plus
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
