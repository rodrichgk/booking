import { useTranslations } from 'next-intl';
import { Header } from '@/components/ui/header';
import { Footer } from '@/components/ui/footer';
import { Scissors, Sparkles, Palette, Zap, Crown, Heart, Star, Clock } from 'lucide-react';
import Link from 'next/link';
import { ServicesGrid } from '@/components/sections/services-grid';

const getServices = (t: any) => [
  {
    id: 'natural-cuts',
    name: 'Coupes Naturelles',
    description: 'Coupes expertes pour toutes les textures de cheveux naturels et motifs de boucles',
    icon: 'Scissors',
    price: 'À partir de 45€',
    duration: '45-60 min',
    image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    popular: true,
    category: 'cuts',
    features: [
      'Consultation personnalisée',
      'Coupe adaptée à votre texture',
      'Conseils d\'entretien',
      'Produits naturels'
    ]
  },
  {
    id: 'protective-styles',
    name: 'Coiffures Protectrices',
    description: 'Tresses, twists et styles qui protègent vos cheveux naturels',
    icon: 'Sparkles',
    price: 'À partir de 80€',
    duration: '2-4 heures',
    image: 'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    popular: true,
    category: 'styling',
    features: [
      'Tresses classiques et modernes',
      'Twists et vanilles',
      'Chignons protecteurs',
      'Durée 4-8 semaines'
    ]
  },
  {
    id: 'loc-maintenance',
    name: 'Entretien des Locks',
    description: 'Soins professionnels pour locks à chaque étape de développement',
    icon: 'Zap',
    price: 'À partir de 60€',
    duration: '1-2 heures',
    image: 'https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    popular: false,
    category: 'maintenance',
    features: [
      'Retouche des racines',
      'Nettoyage en profondeur',
      'Hydratation des locks',
      'Conseils de croissance'
    ]
  },
  {
    id: 'color-highlights',
    name: 'Coloration & Mèches',
    description: 'Techniques de coloration sûres pour cheveux texturés et naturels',
    icon: 'Palette',
    price: 'À partir de 120€',
    duration: '2-3 heures',
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    popular: false,
    category: 'color',
    features: [
      'Coloration sans ammoniaque',
      'Mèches naturelles',
      'Soins post-coloration',
      'Couleurs tendance'
    ]
  },
  {
    id: 'treatments',
    name: 'Soins Capillaires',
    description: 'Traitements profonds pour nourrir et réparer vos cheveux',
    icon: 'Heart',
    price: 'À partir de 50€',
    duration: '1-1.5 heures',
    image: 'https://images.unsplash.com/photo-1559599101-f09722fb4948?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    popular: true,
    category: 'treatment',
    features: [
      'Masques hydratants',
      'Soins protéinés',
      'Traitements à l\'huile chaude',
      'Produits bio et naturels'
    ]
  },
  {
    id: 'styling-special',
    name: 'Coiffage Événementiel',
    description: 'Coiffures élégantes pour occasions spéciales',
    icon: 'Crown',
    price: 'À partir de 90€',
    duration: '1.5-2.5 heures',
    image: 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    popular: false,
    category: 'styling',
    features: [
      'Chignons sophistiqués',
      'Coiffures de mariage',
      'Styles de soirée',
      'Accessoires inclus'
    ]
  }
];

const categories = [
  { id: 'all', name: 'Tous les Services', icon: 'Star' },
  { id: 'cuts', name: 'Coupes', icon: 'Scissors' },
  { id: 'styling', name: 'Coiffage', icon: 'Sparkles' },
  { id: 'treatment', name: 'Soins', icon: 'Heart' },
  { id: 'color', name: 'Coloration', icon: 'Palette' },
  { id: 'maintenance', name: 'Entretien', icon: 'Zap' }
];

export default function ServicesPage() {
  const t = useTranslations('services');
  const tCommon = useTranslations('common');
  const services = getServices(t);

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary-50 to-accent-50 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-display font-bold text-gray-900 mb-6">
                Nos Services Spécialisés
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Découvrez notre gamme complète de services dédiés aux cheveux afro, bouclés et texturés. 
                Des coupes expertes aux soins profonds, nous prenons soin de vos cheveux avec passion.
              </p>
            </div>
          </div>
        </section>

        <ServicesGrid services={services} categories={categories} />

        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-r from-primary-600 to-accent-600">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-6">
              Besoin de Conseils Personnalisés ?
            </h2>
            <p className="text-xl text-primary-100 mb-8">
              Nos experts sont là pour vous aider à choisir les meilleurs soins pour vos cheveux. 
              Contactez-nous pour une consultation gratuite.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact"
                className="bg-white text-primary-600 hover:bg-gray-50 font-semibold py-3 px-8 rounded-lg transition-colors duration-200"
              >
                Nous Contacter
              </Link>
              <Link
                href="/barbershops"
                className="bg-primary-700 hover:bg-primary-800 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200"
              >
                Trouver un Salon
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
