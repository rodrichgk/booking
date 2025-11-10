'use client';

import { useState } from 'react';
import { Link } from '@/routing';
import { 
  Store, MapPin, Phone, Mail, Globe, Star, Calendar, Users, 
  Settings, CreditCard, Plus, Edit2, Trash2, Check, X, 
  AlertCircle, TrendingUp, Clock, ArrowLeft, Scissors, Euro, Tag
} from 'lucide-react';
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
  rating: string | null;
  reviewCount: number | null;
  isActive: boolean;
  ownerId: string;
  createdAt: Date;
}

interface Barber {
  id: string;
  userId: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  specialties: string[] | null;
  experience: number | null;
  rating: string | null;
  isActive: boolean;
  createdAt: Date;
}

interface Service {
  id: string;
  name: string;
  description: string | null;
  price: string;
  duration: number;
  category: string | null;
  isActive: boolean | null;
  createdAt: Date;
}

interface Booking {
  startTime: Date;
  status: string | null;
}

interface ManageBarbershopClientProps {
  shop: Barbershop;
  barbers: Barber[];
  services: Service[];
  bookings: Booking[];
  subscriptionStatus: 'active' | 'expired' | 'inactive';
  locale: string;
}

export function ManageBarbershopClient({ 
  shop, 
  barbers,
  services,
  bookings,
  subscriptionStatus,
  locale 
}: ManageBarbershopClientProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'barbers' | 'services' | 'settings'>('overview');
  const [isAddingBarber, setIsAddingBarber] = useState(false);

  // Calculate stats
  const totalBarbers = barbers.length;
  const activeBarbers = barbers.filter(b => b.isActive).length;
  const avgRating = barbers.length > 0 
    ? (barbers.reduce((sum, b) => sum + (parseFloat(b.rating || '0')), 0) / barbers.length).toFixed(1)
    : '0';
  
  // Calculate monthly bookings
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
  
  const monthlyBookings = bookings.filter(booking => {
    const bookingDate = new Date(booking.startTime);
    return bookingDate >= firstDayOfMonth && 
           bookingDate <= lastDayOfMonth &&
           booking.status !== 'cancelled';
  }).length;

  const tabs = [
    { id: 'overview' as const, label: 'Vue d\'ensemble', icon: TrendingUp },
    { id: 'barbers' as const, label: 'Équipe', icon: Users },
    { id: 'services' as const, label: 'Services', icon: Scissors },
    { id: 'settings' as const, label: 'Paramètres', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/my-barbershops" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </Link>
              <div>
                <h1 className="text-3xl font-sans font-bold text-gray-900">{shop.name}</h1>
                <div className="flex items-center space-x-4 mt-1">
                  <div className="flex items-center space-x-1 text-sm text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>{shop.city}</span>
                  </div>
                  {shop.rating && (
                    <div className="flex items-center space-x-1 text-sm text-gray-600">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span>{shop.rating} ({shop.reviewCount} avis)</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className={`px-4 py-2 rounded-lg font-semibold text-sm ${
                subscriptionStatus === 'active' ? 'bg-green-100 text-green-800' :
                subscriptionStatus === 'expired' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {subscriptionStatus === 'active' && '✓ Abonnement Actif'}
                {subscriptionStatus === 'expired' && '⚠ Abonnement Expiré'}
                {subscriptionStatus === 'inactive' && '✗ Inactif'}
              </div>
              {subscriptionStatus !== 'active' && (
                <Link href={`/subscription?shopId=${shop.id}`} className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold transition-colors">
                  Renouveler
                </Link>
              )}
            </div>
          </div>

          <div className="flex space-x-1 mt-6 border-b border-gray-200">
            {tabs.map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-3 border-b-2 font-medium transition-colors ${
                  activeTab === tab.id ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}>
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Coiffeurs</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{totalBarbers}</p>
                    <p className="text-xs text-gray-500 mt-1">{activeBarbers} actifs</p>
                  </div>
                  <div className="p-3 bg-primary-100 rounded-lg">
                    <Users className="w-6 h-6 text-primary-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Note Moyenne</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{avgRating}</p>
                    <p className="text-xs text-gray-500 mt-1">sur 5 étoiles</p>
                  </div>
                  <div className="p-3 bg-yellow-100 rounded-lg">
                    <Star className="w-6 h-6 text-yellow-600 fill-yellow-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Réservations</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{monthlyBookings}</p>
                    <p className="text-xs text-gray-500 mt-1">ce mois</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-lg">
                    <Calendar className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Informations du Salon</h2>
                <button className="flex items-center space-x-2 px-4 py-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                  <Edit2 className="w-4 h-4" />
                  <span className="font-medium">Modifier</span>
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Adresse</label>
                    <div className="flex items-start space-x-2 mt-1">
                      <MapPin className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
                      <p className="text-gray-900">{shop.address}, {shop.city}</p>
                    </div>
                  </div>

                  {shop.phone && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Téléphone</label>
                      <div className="flex items-center space-x-2 mt-1">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <p className="text-gray-900">{shop.phone}</p>
                      </div>
                    </div>
                  )}

                  {shop.email && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Email</label>
                      <div className="flex items-center space-x-2 mt-1">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <p className="text-gray-900">{shop.email}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  {shop.website && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Site Web</label>
                      <div className="flex items-center space-x-2 mt-1">
                        <Globe className="w-4 h-4 text-gray-400" />
                        <a href={shop.website} target="_blank" rel="noopener noreferrer"
                          className="text-primary-600 hover:text-primary-700">
                          {shop.website}
                        </a>
                      </div>
                    </div>
                  )}

                  {shop.description && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Description</label>
                      <p className="text-gray-900 mt-1">{shop.description}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <Link href={`/my-barbershops/${shop.id}/bookings`}
                className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:border-primary-300 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">Réservations</h3>
                    <p className="text-sm text-gray-600 mt-1">Gérer les rendez-vous</p>
                  </div>
                  <Calendar className="w-8 h-8 text-primary-600" />
                </div>
              </Link>

              <button onClick={() => setActiveTab('barbers')}
                className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:border-primary-300 transition-colors text-left">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">Équipe</h3>
                    <p className="text-sm text-gray-600 mt-1">Gérer les coiffeurs</p>
                  </div>
                  <Users className="w-8 h-8 text-primary-600" />
                </div>
              </button>

              <Link href={`/barbershops/${shop.id}`}
                className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:border-primary-300 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">Voir la Page</h3>
                    <p className="text-sm text-gray-600 mt-1">Page publique</p>
                  </div>
                  <Store className="w-8 h-8 text-primary-600" />
                </div>
              </Link>
            </div>
          </div>
        )}

        {activeTab === 'barbers' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Équipe</h2>
                <p className="text-gray-600 mt-1">Gérez les coiffeurs de votre salon</p>
              </div>
              <button onClick={() => setIsAddingBarber(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors">
                <Plus className="w-4 h-4" />
                <span>Ajouter un Coiffeur</span>
              </button>
            </div>

            {barbers.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-12 border border-gray-200 text-center">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun coiffeur</h3>
                <p className="text-gray-600 mb-6">Commencez par ajouter votre premier coiffeur à votre équipe</p>
                <button onClick={() => setIsAddingBarber(true)}
                  className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors">
                  Ajouter un Coiffeur
                </button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {barbers.map((barber) => (
                  <div key={barber.id} className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-bold text-lg">
                            {barber.name?.split(' ').map(n => n[0]).join('') || '?'}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{barber.name}</h3>
                          {barber.experience && (
                            <p className="text-sm text-gray-600">{barber.experience} ans d'expérience</p>
                          )}
                        </div>
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        barber.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {barber.isActive ? 'Actif' : 'Inactif'}
                      </div>
                    </div>

                    {barber.rating && (
                      <div className="flex items-center space-x-1 mb-3">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-semibold">{barber.rating}</span>
                      </div>
                    )}

                    {barber.specialties && barber.specialties.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {barber.specialties.slice(0, 2).map((specialty, index) => (
                          <span key={index} className="px-2 py-1 bg-primary-100 text-primary-700 rounded-full text-xs">
                            {specialty}
                          </span>
                        ))}
                        {barber.specialties.length > 2 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                            +{barber.specialties.length - 2}
                          </span>
                        )}
                      </div>
                    )}

                    <div className="space-y-2 text-sm">
                      {barber.email && (
                        <div className="flex items-center text-gray-600">
                          <Mail className="w-3 h-3 mr-2" />
                          <span className="truncate">{barber.email}</span>
                        </div>
                      )}
                      {barber.phone && (
                        <div className="flex items-center text-gray-600">
                          <Phone className="w-3 h-3 mr-2" />
                          <span>{barber.phone}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex space-x-2 mt-4 pt-4 border-t border-gray-100">
                      <button className="flex-1 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors">
                        Modifier
                      </button>
                      <button className="px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'services' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Services</h2>
                <p className="text-gray-600 mt-1">Gérez les services proposés par votre salon</p>
              </div>
              <button className="flex items-center space-x-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors">
                <Plus className="w-4 h-4" />
                <span>Ajouter un Service</span>
              </button>
            </div>

            <div className="grid gap-6">
              {['haircut', 'beard', 'styling', 'coloring', 'treatment', 'combo'].map((category) => {
                const categoryServices = services.filter(s => s.category === category);
                if (categoryServices.length === 0) return null;

                const categoryLabels: Record<string, string> = {
                  'haircut': '💇 Coupes',
                  'beard': '🧔 Barbe',
                  'styling': '✨ Coiffure',
                  'coloring': '🎨 Coloration',
                  'treatment': '💆 Soins',
                  'combo': '🎁 Forfaits',
                };

                return (
                  <div key={category} className="bg-white rounded-xl shadow-sm border border-gray-200">
                    <div className="px-6 py-4 border-b border-gray-200">
                      <h3 className="font-semibold text-gray-900 text-lg">{categoryLabels[category]}</h3>
                    </div>
                    <div className="divide-y divide-gray-100">
                      {categoryServices.map((service) => (
                        <div key={service.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3">
                                <h4 className="font-medium text-gray-900">{service.name}</h4>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  service.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                                }`}>
                                  {service.isActive ? 'Actif' : 'Inactif'}
                                </span>
                              </div>
                              {service.description && (
                                <p className="text-sm text-gray-600 mt-1">{service.description}</p>
                              )}
                              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                                <div className="flex items-center">
                                  <Euro className="w-3 h-3 mr-1" />
                                  <span className="font-medium text-gray-700">{service.price}€</span>
                                </div>
                                <div className="flex items-center">
                                  <Clock className="w-3 h-3 mr-1" />
                                  <span>{service.duration} min</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2 ml-4">
                              <button className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                                service.isActive ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' : 'bg-green-100 text-green-700 hover:bg-green-200'
                              }`}>
                                {service.isActive ? 'Désactiver' : 'Activer'}
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {services.length === 0 && (
              <div className="bg-white rounded-xl shadow-sm p-12 border border-gray-200 text-center">
                <Scissors className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun service</h3>
                <p className="text-gray-600 mb-6">Commencez par ajouter les services proposés par votre salon</p>
                <button className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors">
                  Ajouter un Service
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Paramètres</h2>
              <p className="text-gray-600 mt-1">Gérez les paramètres de votre salon</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-primary-100 rounded-lg">
                    <CreditCard className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Abonnement</h3>
                    <p className="text-sm text-gray-600">€29.90/mois</p>
                  </div>
                </div>
                <div className={`px-4 py-2 rounded-lg font-semibold ${
                  subscriptionStatus === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {subscriptionStatus === 'active' ? 'Actif' : 'Expiré'}
                </div>
              </div>
              {subscriptionStatus !== 'active' && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-red-900">Abonnement expiré</p>
                      <p className="text-sm text-red-700 mt-1">
                        Votre salon n'est plus visible sur la plateforme. Renouvelez votre abonnement pour continuer à recevoir des réservations.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              <Link href={`/subscription?shopId=${shop.id}`}
                className="block w-full text-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors">
                {subscriptionStatus === 'active' ? 'Gérer l\'abonnement' : 'Renouveler l\'abonnement'}
              </Link>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-red-200">
              <h3 className="font-semibold text-red-900 mb-4">Zone de Danger</h3>
              <div className="space-y-4">
                <div>
                  <button className="w-full px-4 py-2 bg-white hover:bg-red-50 text-red-600 border border-red-300 rounded-lg font-medium transition-colors">
                    Désactiver le Salon
                  </button>
                  <p className="text-sm text-gray-600 mt-2">Votre salon ne sera plus visible sur la plateforme</p>
                </div>
                <div>
                  <button className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors">
                    Supprimer le Salon
                  </button>
                  <p className="text-sm text-gray-600 mt-2">Cette action est irréversible</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
}
