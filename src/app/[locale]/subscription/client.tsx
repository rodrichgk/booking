'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  CheckCircle, Store, Users, Calendar, Star, BarChart3,
  CreditCard, Shield, Zap, Globe, MessageSquare, Clock,
  AlertTriangle, RefreshCw, XCircle
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from '@/routing';
import { Header } from '@/components/ui/header';
import { Footer } from '@/components/ui/footer';

interface ShopData {
  id: string;
  name: string;
  subscriptionStatus: string;
  currentPeriodEnd: string | null;
  hasStripeSubscription: boolean;
  isActive: boolean | null;
}

interface SubscriptionClientProps {
  locale: string;
  userEmail: string;
  userRole: string;
  shopId?: string;
  shopData?: ShopData | null;
}

const renderIcon = (iconName: string, className: string) => {
  const iconMap: { [key: string]: any } = {
    CheckCircle,
    Store,
    Users,
    Calendar,
    Star,
    BarChart3,
    CreditCard,
    Shield,
    Zap,
    Globe,
    MessageSquare,
    Clock,
    AlertTriangle,
    RefreshCw,
    XCircle,
  };

  const IconComponent = iconMap[iconName];
  return IconComponent ? <IconComponent className={className} /> : null;
};

export function SubscriptionClient({
  locale,
  userEmail,
  userRole,
  shopId,
  shopData
}: SubscriptionClientProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const features = [
    { icon: 'Store', title: 'Barbershop Listing', description: 'Get your barbershop listed on our platform' },
    { icon: 'Calendar', title: 'Online Booking System', description: '24/7 online booking for your customers' },
    { icon: 'Users', title: 'Staff Management', description: 'Manage your barbers and their schedules' },
    { icon: 'BarChart3', title: 'Analytics Dashboard', description: 'Track bookings, revenue, and performance' },
    { icon: 'Star', title: 'Customer Reviews', description: 'Build reputation with customer feedback' },
    { icon: 'MessageSquare', title: 'SMS Notifications', description: 'Automated booking confirmations' },
    { icon: 'Globe', title: 'Multi-language', description: 'French and English support' },
    { icon: 'Shield', title: 'Secure Payments', description: 'Safe and encrypted transactions' },
  ];

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/subscription/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail, shopId }),
      });

      const data = await response.json();

      if (data.checkoutUrl) {
        if (data.checkoutUrl.startsWith('http')) {
          window.location.href = data.checkoutUrl;
        } else {
          router.push(data.checkoutUrl);
        }
      } else {
        alert('Error creating checkout session. Please try again.');
      }
    } catch (error) {
      console.error('Subscription error:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Determine subscription state
  const isExpired = shopData?.currentPeriodEnd
    ? new Date(shopData.currentPeriodEnd) < new Date()
    : true;
  const isActive = shopData?.subscriptionStatus === 'active' && !isExpired;
  const isPastDue = shopData?.subscriptionStatus === 'past_due';
  const hasNeverSubscribed = !shopData?.hasStripeSubscription && shopData?.subscriptionStatus === 'inactive';

  // Format date
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // Days remaining
  const getDaysRemaining = () => {
    if (!shopData?.currentPeriodEnd) return 0;
    const end = new Date(shopData.currentPeriodEnd);
    const now = new Date();
    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, diff);
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <Link href={`/${locale}/my-space`} className="text-primary-600 hover:text-primary-700 font-semibold">
              ← Retour à Mon Espace
            </Link>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          {/* Shop Info Card - Only show if we have shop data */}
          {shopData && (
            <div className="max-w-4xl mx-auto mb-8">
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-primary-100 rounded-xl flex items-center justify-center">
                      <Store className="w-8 h-8 text-primary-600" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{shopData.name}</h2>
                      <p className="text-gray-500">Gestion de l'abonnement</p>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="flex flex-col items-end">
                    {isActive && (
                      <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-green-100 text-green-800">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Abonnement actif
                      </span>
                    )}
                    {isPastDue && (
                      <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-yellow-100 text-yellow-800">
                        <AlertTriangle className="w-4 h-4 mr-2" />
                        Paiement en retard
                      </span>
                    )}
                    {isExpired && !isPastDue && shopData.hasStripeSubscription && (
                      <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-red-100 text-red-800">
                        <XCircle className="w-4 h-4 mr-2" />
                        Abonnement expiré
                      </span>
                    )}
                    {hasNeverSubscribed && (
                      <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-gray-100 text-gray-800">
                        <Clock className="w-4 h-4 mr-2" />
                        Pas d'abonnement
                      </span>
                    )}
                  </div>
                </div>

                {/* Subscription Details */}
                {shopData.hasStripeSubscription && (
                  <div className="mt-6 pt-6 border-t border-gray-100">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <p className="text-sm text-gray-500">Statut</p>
                        <p className="text-lg font-semibold text-gray-900 capitalize">
                          {shopData.subscriptionStatus === 'active' ? 'Actif' :
                            shopData.subscriptionStatus === 'past_due' ? 'Paiement en retard' :
                              shopData.subscriptionStatus === 'canceled' ? 'Annulé' : 'Inactif'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Prochaine échéance</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {formatDate(shopData.currentPeriodEnd)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Jours restants</p>
                        <p className={`text-lg font-semibold ${getDaysRemaining() <= 7 ? 'text-red-600' : 'text-gray-900'}`}>
                          {getDaysRemaining()} jours
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="mt-6 pt-6 border-t border-gray-100">
                  {isActive && (
                    <div className="flex items-center justify-between">
                      <p className="text-green-600 font-medium">
                        ✓ Votre salon est visible sur la plateforme
                      </p>
                      <a
                        href="https://billing.stripe.com/p/login/test"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-600 hover:text-primary-700 font-medium"
                      >
                        Gérer le paiement →
                      </a>
                    </div>
                  )}

                  {isPastDue && (
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <p className="text-yellow-800 mb-3">
                        ⚠️ Votre paiement a échoué. Veuillez mettre à jour vos informations de paiement.
                      </p>
                      <button
                        onClick={handleSubscribe}
                        disabled={loading}
                        className="inline-flex items-center px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white font-semibold rounded-lg"
                      >
                        <CreditCard className="w-4 h-4 mr-2" />
                        Mettre à jour le paiement
                      </button>
                    </div>
                  )}

                  {isExpired && !isPastDue && shopData.hasStripeSubscription && (
                    <div className="bg-red-50 p-4 rounded-lg">
                      <p className="text-red-800 mb-3">
                        ⚠️ Votre abonnement a expiré. Votre salon n'est plus visible sur la plateforme.
                      </p>
                      <button
                        onClick={handleSubscribe}
                        disabled={loading}
                        className="inline-flex items-center px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg"
                      >
                        {loading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Traitement...
                          </>
                        ) : (
                          <>
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Renouveler l'abonnement
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {hasNeverSubscribed && (
                    <div className="text-center">
                      <p className="text-gray-600 mb-4">
                        Activez votre abonnement pour rendre votre salon visible sur la plateforme.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Hero Section - Only for new subscriptions or no shop */}
          {(!shopData || hasNeverSubscribed || (isExpired && !shopData.hasStripeSubscription)) && (
            <>
              <div className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                  {shopData ? `Activez ${shopData.name}` : 'Développez votre activité'}
                </h1>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                  Rejoignez des centaines de salons qui utilisent notre plateforme pour gérer leurs réservations.
                </p>
              </div>

              {/* Pricing Card */}
              <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border-4 border-primary-500">
                  <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-8 py-12 text-center text-white">
                    <h2 className="text-3xl font-bold mb-4">Plan Professionnel</h2>
                    <div className="flex items-center justify-center mb-4">
                      <span className="text-6xl font-bold">€29.90</span>
                      <span className="text-2xl ml-2">/mois</span>
                    </div>
                    <p className="text-primary-100 text-lg">
                      Tout ce dont vous avez besoin pour gérer votre salon
                    </p>
                  </div>

                  <div className="px-8 py-12">
                    {/* Features Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                      {features.map((feature) => (
                        <div key={feature.title} className="flex items-start space-x-4">
                          <div className="flex-shrink-0 p-2 bg-primary-100 rounded-lg">
                            {renderIcon(feature.icon, 'w-6 h-6 text-primary-600')}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900 mb-1">{feature.title}</h3>
                            <p className="text-sm text-gray-600">{feature.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* CTA Button */}
                    <div className="text-center">
                      <button
                        onClick={handleSubscribe}
                        disabled={loading || !shopId}
                        className="inline-flex items-center px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                            Traitement...
                          </>
                        ) : (
                          <>
                            {renderIcon('CreditCard', 'w-5 h-5 mr-3')}
                            {hasNeverSubscribed ? "S'abonner maintenant" : 'Renouveler'}
                          </>
                        )}
                      </button>
                      {!shopId && (
                        <p className="text-sm text-red-500 mt-4">
                          Veuillez sélectionner un salon depuis votre espace.
                        </p>
                      )}
                      <p className="text-sm text-gray-500 mt-4">
                        Annulez à tout moment • Pas de contrat • Paiement sécurisé
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* FAQ Section */}
              <div className="max-w-3xl mx-auto mt-16">
                <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
                  Questions fréquentes
                </h2>
                <div className="space-y-6">
                  <div className="bg-white rounded-xl p-6 shadow-sm">
                    <h3 className="font-semibold text-lg text-gray-900 mb-2">
                      Comment fonctionne l'abonnement ?
                    </h3>
                    <p className="text-gray-600">
                      Vous payez €29.90 par mois par salon. Cela vous donne accès à notre plateforme
                      complète incluant les réservations en ligne, la gestion du personnel et les statistiques.
                    </p>
                  </div>

                  <div className="bg-white rounded-xl p-6 shadow-sm">
                    <h3 className="font-semibold text-lg text-gray-900 mb-2">
                      Puis-je annuler à tout moment ?
                    </h3>
                    <p className="text-gray-600">
                      Oui ! Il n'y a pas de contrat à long terme. Vous pouvez annuler votre abonnement
                      à tout moment depuis votre tableau de bord.
                    </p>
                  </div>

                  <div className="bg-white rounded-xl p-6 shadow-sm">
                    <h3 className="font-semibold text-lg text-gray-900 mb-2">
                      Quels moyens de paiement acceptez-vous ?
                    </h3>
                    <p className="text-gray-600">
                      Nous acceptons toutes les principales cartes bancaires (Visa, Mastercard, American Express)
                      via notre processeur de paiement sécurisé Stripe.
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
