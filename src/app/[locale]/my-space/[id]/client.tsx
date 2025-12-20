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
  const [isAddingService, setIsAddingService] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [isToggling, setIsToggling] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [shopActive, setShopActive] = useState(shop.isActive);
  const [serviceStatuses, setServiceStatuses] = useState<Record<string, boolean>>(
    services.reduce((acc, s) => ({ ...acc, [s.id]: s.isActive ?? true }), {})
  );
  
  // Service form states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serviceName, setServiceName] = useState('');
  const [serviceDescription, setServiceDescription] = useState('');
  const [servicePrice, setServicePrice] = useState('');
  const [serviceDuration, setServiceDuration] = useState('');
  const [serviceCategory, setServiceCategory] = useState('haircut');

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

  const handleToggleShopStatus = async () => {
    if (isToggling) return;
    
    const confirmMsg = shopActive 
      ? 'Êtes-vous sûr de vouloir désactiver ce salon ? Il ne sera plus visible sur la plateforme.'
      : 'Voulez-vous activer ce salon ?';
    
    if (!confirm(confirmMsg)) return;
    
    setIsToggling(true);
    try {
      const res = await fetch(`/api/barbershops/${shop.id}/toggle-status`, {
        method: 'POST',
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setShopActive(data.isActive);
        alert(data.message);
        window.location.reload();
      } else {
        alert(data.error || 'Une erreur est survenue');
      }
    } catch (error) {
      console.error('Error toggling shop status:', error);
      alert('Une erreur est survenue');
    } finally {
      setIsToggling(false);
    }
  };
  
  const handleDeleteShop = async () => {
    const confirmMsg = 'ATTENTION: Cette action est irréversible. Êtes-vous sûr de vouloir supprimer ce salon ?\n\nTapez "SUPPRIMER" pour confirmer.';
    const userInput = prompt(confirmMsg);
    
    if (userInput !== 'SUPPRIMER') {
      if (userInput !== null) {
        alert('Suppression annulée');
      }
      return;
    }
    
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/barbershops/${shop.id}/delete`, {
        method: 'DELETE',
      });
      
      const data = await res.json();
      
      if (res.ok) {
        alert(data.message);
        window.location.href = `/${locale}/my-space`;
      } else {
        alert(data.error || 'Une erreur est survenue');
      }
    } catch (error) {
      console.error('Error deleting shop:', error);
      alert('Une erreur est survenue');
    } finally {
      setIsDeleting(false);
    }
  };
  
  const handleToggleServiceStatus = async (serviceId: string) => {
    try {
      const res = await fetch(`/api/services/${serviceId}/toggle-status`, {
        method: 'POST',
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setServiceStatuses(prev => ({ ...prev, [serviceId]: data.isActive }));
        alert(data.message);
      } else {
        alert(data.error || 'Une erreur est survenue');
      }
    } catch (error) {
      console.error('Error toggling service status:', error);
      alert('Une erreur est survenue');
    }
  };
  
  const handleDeleteBarber = async (barberId: string, barberName: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir retirer ${barberName} de votre équipe ?`)) {
      return;
    }
    
    try {
      const res = await fetch(`/api/barbershop/barbers/${barberId}`, {
        method: 'DELETE',
      });
      
      const data = await res.json();
      
      if (res.ok) {
        alert('Coiffeur retiré avec succès');
        window.location.reload();
      } else {
        alert(data.error || 'Une erreur est survenue');
      }
    } catch (error) {
      console.error('Error deleting barber:', error);
      alert('Une erreur est survenue');
    }
  };
  
  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceName.trim() || !servicePrice || !serviceDuration) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          barbershopId: shop.id,
          name: serviceName,
          description: serviceDescription || null,
          price: parseFloat(servicePrice),
          duration: parseInt(serviceDuration),
          category: serviceCategory,
        }),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        alert('Service ajouté avec succès!');
        setServiceName('');
        setServiceDescription('');
        setServicePrice('');
        setServiceDuration('');
        setServiceCategory('haircut');
        setIsAddingService(false);
        window.location.reload();
      } else {
        alert(data.error || 'Une erreur est survenue');
      }
    } catch (error) {
      console.error('Error adding service:', error);
      alert('Une erreur est survenue');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleEditService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService || !serviceName.trim() || !servicePrice || !serviceDuration) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/services/${editingService.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: serviceName,
          description: serviceDescription || null,
          price: parseFloat(servicePrice),
          duration: parseInt(serviceDuration),
          category: serviceCategory,
        }),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        alert('Service modifié avec succès!');
        setEditingService(null);
        setServiceName('');
        setServiceDescription('');
        setServicePrice('');
        setServiceDuration('');
        setServiceCategory('haircut');
        window.location.reload();
      } else {
        alert(data.error || 'Une erreur est survenue');
      }
    } catch (error) {
      console.error('Error editing service:', error);
      alert('Une erreur est survenue');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const openEditServiceModal = (service: Service) => {
    setEditingService(service);
    setServiceName(service.name);
    setServiceDescription(service.description || '');
    setServicePrice(service.price);
    setServiceDuration(service.duration.toString());
    setServiceCategory(service.category || 'haircut');
  };
  
  const closeServiceModal = () => {
    setIsAddingService(false);
    setEditingService(null);
    setServiceName('');
    setServiceDescription('');
    setServicePrice('');
    setServiceDuration('');
    setServiceCategory('haircut');
  };

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
              <Link href="/my-space" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
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
              <div className={`px-3 py-1.5 rounded-lg font-semibold text-sm ${
                shopActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
              }`}>
                {shopActive ? '● Actif' : '● Inactif'}
              </div>
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
              <Link href={`/my-space/${shop.id}/bookings`}
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
              <Link 
                href={`/${locale}/admin/users?action=add&returnTo=/my-space/${shop.id}`}
                className="flex items-center space-x-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors">
                <Plus className="w-4 h-4" />
                <span>Ajouter un Coiffeur</span>
              </Link>
            </div>

            {barbers.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-12 border border-gray-200 text-center">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun coiffeur</h3>
                <p className="text-gray-600 mb-6">Commencez par ajouter votre premier coiffeur à votre équipe</p>
                <Link 
                  href={`/${locale}/admin/users?action=add&returnTo=/my-space/${shop.id}`}
                  className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors">
                  Ajouter un Coiffeur
                </Link>
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

                    <div className="flex items-center space-x-2 ml-4">
                      <button className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteBarber(barber.id, barber.name || 'ce coiffeur')}
                        className="px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors">
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
              <button 
                onClick={() => setIsAddingService(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors">
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
                              <button 
                                onClick={() => openEditServiceModal(service)}
                                className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleToggleServiceStatus(service.id)}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                                  serviceStatuses[service.id] ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' : 'bg-green-100 text-green-700 hover:bg-green-200'
                                }`}>
                                {serviceStatuses[service.id] ? 'Désactiver' : 'Activer'}
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
                <button 
                  onClick={() => setIsAddingService(true)}
                  className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors">
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

            {/* Inactive shop warning */}
            {!shopActive && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-orange-900">Salon désactivé</p>
                    <p className="text-sm text-orange-700 mt-1">
                      Votre salon n'est actuellement pas visible sur la plateforme. Les clients ne peuvent pas voir votre salon ni réserver de rendez-vous. Activez-le dans la zone de danger ci-dessous pour le rendre visible.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Shop Images Section */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-primary-100 rounded-lg">
                  <Store className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Photos du Salon</h3>
                  <p className="text-sm text-gray-600">Téléchargez des photos de votre salon</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Images du salon (max 5)
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-500 transition-colors cursor-pointer">
                    <Store className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Cliquez pour télécharger ou glissez-déposez</p>
                    <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF jusqu'à 4MB</p>
                    <button className="mt-4 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors">
                      Télécharger des photos
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Note: Upload Ting configuration nécessaire. Configurez UPLOADTHING_SECRET et UPLOADTHING_APP_ID dans .env.local
                  </p>
                </div>
                {/* TODO: Display existing images here */}
              </div>
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
                  <button 
                    onClick={handleToggleShopStatus}
                    disabled={isToggling}
                    className="w-full px-4 py-2 bg-white hover:bg-red-50 text-red-600 border border-red-300 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                    {isToggling ? 'Traitement...' : shopActive ? 'Désactiver le Salon' : 'Activer le Salon'}
                  </button>
                  <p className="text-sm text-gray-600 mt-2">
                    {shopActive ? 'Votre salon ne sera plus visible sur la plateforme' : 'Rendre votre salon visible sur la plateforme'}
                  </p>
                </div>
                <div>
                  <button 
                    onClick={handleDeleteShop}
                    disabled={isDeleting}
                    className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                    {isDeleting ? 'Suppression...' : 'Supprimer le Salon'}
                  </button>
                  <p className="text-sm text-gray-600 mt-2">Cette action est irréversible</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <Footer />
      
      {/* Add/Edit Service Modal */}
      {(isAddingService || editingService) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">
                  {editingService ? 'Modifier le Service' : 'Ajouter un Service'}
                </h3>
                <button 
                  onClick={closeServiceModal}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>
            <form onSubmit={editingService ? handleEditService : handleAddService} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom du service <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={serviceName}
                  onChange={(e) => setServiceName(e.target.value)}
                  placeholder="Ex: Coupe Homme"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={serviceDescription}
                  onChange={(e) => setServiceDescription(e.target.value)}
                  placeholder="Description du service..."
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prix (€) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={servicePrice}
                    onChange={(e) => setServicePrice(e.target.value)}
                    placeholder="29.90"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Durée (min) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="5"
                    step="5"
                    value={serviceDuration}
                    onChange={(e) => setServiceDuration(e.target.value)}
                    placeholder="30"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Catégorie <span className="text-red-500">*</span>
                </label>
                <select
                  value={serviceCategory}
                  onChange={(e) => setServiceCategory(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                  <option value="haircut">💇 Coupes</option>
                  <option value="beard">🧔 Barbe</option>
                  <option value="styling">✨ Coiffure</option>
                  <option value="coloring">🎨 Coloration</option>
                  <option value="treatment">💆 Soins</option>
                  <option value="combo">🎁 Forfaits</option>
                </select>
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={closeServiceModal}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                  {isSubmitting ? (editingService ? 'Modification...' : 'Ajout...') : (editingService ? 'Modifier' : 'Ajouter')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
