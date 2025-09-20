// Force dynamic rendering to avoid SSG issues with client components
export const dynamic = 'force-dynamic';
export const dynamicParams = true;
export const revalidate = 0;

import { useTranslations } from 'next-intl';
import { Header } from '@/components/ui/header';
import { Footer } from '@/components/ui/footer';
import { Heart, Users, Award, Scissors, Star, CheckCircle } from 'lucide-react';
import { Link } from '@/routing';

const teamMembers = [
  {
    id: 1,
    name: 'Amara Johnson',
    role: 'Fondatrice & CEO',
    image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    bio: 'Passionnée par les cheveux naturels depuis plus de 15 ans, Amara a créé Orphlia pour connecter notre communauté avec les meilleurs spécialistes capillaires.'
  },
  {
    id: 2,
    name: 'Marcus Thompson',
    role: 'Directeur Technique',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    bio: 'Expert en technologie avec une vision claire : rendre la réservation de services capillaires aussi simple que possible pour notre communauté.'
  },
  {
    id: 3,
    name: 'Kendra Williams',
    role: 'Responsable Partenariats',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    bio: 'Spécialiste en relations avec les salons, Kendra s\'assure que nous travaillons avec les meilleurs professionnels de la coiffure afro.'
  }
];

const values = [
  {
    icon: Heart,
    title: 'Passion pour les Cheveux Naturels',
    description: 'Nous célébrons la beauté naturelle des cheveux afro, bouclés et texturés sous toutes leurs formes.'
  },
  {
    icon: Users,
    title: 'Communauté Avant Tout',
    description: 'Nous créons des liens durables entre les clients et les professionnels qui comprennent leurs besoins uniques.'
  },
  {
    icon: Award,
    title: 'Excellence & Qualité',
    description: 'Nous sélectionnons rigoureusement nos partenaires pour garantir des services de la plus haute qualité.'
  },
  {
    icon: CheckCircle,
    title: 'Confiance & Transparence',
    description: 'Des avis authentiques, des prix transparents et des professionnels vérifiés pour votre tranquillité d\'esprit.'
  }
];

const stats = [
  { number: '10,000+', label: 'Clients Satisfaits' },
  { number: '500+', label: 'Salons Partenaires' },
  { number: '50+', label: 'Villes Couvertes' },
  { number: '4.9/5', label: 'Note Moyenne' }
];

export default function AboutPage() {
  const t = useTranslations('about');
  const tCommon = useTranslations('common');

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary-50 to-accent-50 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-display font-bold text-gray-900 mb-6">
                À Propos d'Orphlia
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
                Nous sommes une plateforme dédiée à la communauté afro, créée pour connecter 
                les personnes aux cheveux naturels avec les meilleurs spécialistes capillaires.
              </p>
              <div className="flex justify-center">
                <div className="w-24 h-1 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full"></div>
              </div>
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-6">
                  Notre Mission
                </h2>
                <p className="text-lg text-gray-600 mb-6">
                  Chez Orphlia, nous croyons que chaque personne mérite d'avoir accès à des 
                  professionnels qui comprennent et célèbrent la beauté unique des cheveux naturels, 
                  bouclés et texturés.
                </p>
                <p className="text-lg text-gray-600 mb-8">
                  Notre mission est de créer un pont entre notre communauté et les coiffeurs 
                  spécialisés, en rendant la recherche et la réservation de services capillaires 
                  aussi simple et accessible que possible.
                </p>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center space-x-2 bg-primary-50 px-4 py-2 rounded-full">
                    <Scissors className="w-5 h-5 text-primary-600" />
                    <span className="text-primary-700 font-medium">Expertise Spécialisée</span>
                  </div>
                  <div className="flex items-center space-x-2 bg-accent-50 px-4 py-2 rounded-full">
                    <Heart className="w-5 h-5 text-accent-600" />
                    <span className="text-accent-700 font-medium">Passion Authentique</span>
                  </div>
                </div>
              </div>
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1560066984-138dadb4c035?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
                  alt="Coiffure afro professionnelle"
                  className="rounded-2xl shadow-lg"
                />
                <div className="absolute -bottom-6 -right-6 bg-white p-6 rounded-2xl shadow-lg">
                  <div className="flex items-center space-x-3">
                    <Star className="w-8 h-8 text-yellow-400 fill-current" />
                    <div>
                      <div className="text-2xl font-bold text-gray-900">4.9/5</div>
                      <div className="text-sm text-gray-600">Note Moyenne</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-4">
                Orphlia en Chiffres
              </h2>
              <p className="text-lg text-gray-600">
                Notre impact grandissant dans la communauté
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-4xl md:text-5xl font-bold text-primary-600 mb-2">
                    {stat.number}
                  </div>
                  <div className="text-gray-600 font-medium">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-4">
                Nos Valeurs
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Les principes qui guident notre travail quotidien et notre engagement 
                envers notre communauté
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value, index) => {
                const IconComponent = value.icon;
                return (
                  <div key={index} className="text-center group">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-200">
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      {value.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {value.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-4">
                Notre Équipe
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Rencontrez les personnes passionnées qui travaillent chaque jour 
                pour améliorer votre expérience capillaire
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {teamMembers.map((member) => (
                <div key={member.id} className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all duration-300 text-center">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                  />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {member.name}
                  </h3>
                  <div className="text-primary-600 font-medium mb-4">
                    {member.role}
                  </div>
                  <p className="text-gray-600 leading-relaxed">
                    {member.bio}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-r from-primary-600 to-accent-600">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-6">
              Rejoignez Notre Communauté
            </h2>
            <p className="text-xl text-primary-100 mb-8">
              Que vous soyez client à la recherche du salon parfait ou professionnel 
              souhaitant rejoindre notre réseau, nous sommes là pour vous accompagner.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/barbershops"
                className="bg-white text-primary-600 hover:bg-gray-50 font-semibold py-3 px-8 rounded-lg transition-colors duration-200"
              >
                Trouver un Salon
              </Link>
              <Link
                href="/business/signup"
                className="bg-primary-700 hover:bg-primary-800 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200"
              >
                Devenir Partenaire
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
