'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { 
  CheckCircle, Store, Users, Calendar, Star, BarChart3, 
  CreditCard, Shield, Zap, Globe, MessageSquare, Clock
} from 'lucide-react';
import Link from 'next/link';
import { Header } from '@/components/ui/header';
import { Footer } from '@/components/ui/footer';

interface SubscriptionClientProps {
  locale: string;
  userEmail: string;
  userRole: string;
  shopId?: string;
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
  };
  
  const IconComponent = iconMap[iconName];
  return IconComponent ? <IconComponent className={className} /> : null;
};

export function SubscriptionClient({ 
  locale, 
  userEmail, 
  userRole,
  shopId
}: SubscriptionClientProps) {
  const [loading, setLoading] = useState(false);

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
        window.location.href = data.checkoutUrl;
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

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link href={`/${locale}`} className="text-primary-600 hover:text-primary-700 font-semibold">
            ← Back to Home
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Grow Your Barbershop Business
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Join hundreds of barbershops using our platform to manage bookings, 
            grow their customer base, and increase revenue.
          </p>
        </div>

        {/* Pricing Card */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border-4 border-primary-500">
            <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-8 py-12 text-center text-white">
              <h2 className="text-3xl font-bold mb-4">Professional Plan</h2>
              <div className="flex items-center justify-center mb-4">
                <span className="text-6xl font-bold">€29.90</span>
                <span className="text-2xl ml-2">/month</span>
              </div>
              <p className="text-primary-100 text-lg">
                Everything you need to run a successful barbershop
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
                  disabled={loading}
                  className="inline-flex items-center px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      {renderIcon('CreditCard', 'w-5 h-5 mr-3')}
                      Subscribe Now
                    </>
                  )}
                </button>
                <p className="text-sm text-gray-500 mt-4">
                  Cancel anytime • No long-term contracts • Secure payment
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto mt-20">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="font-semibold text-lg text-gray-900 mb-2">
                How does the subscription work?
              </h3>
              <p className="text-gray-600">
                You pay €29.90 per month per barbershop location. This gives you access to our complete 
                platform including online booking, staff management, and analytics.
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="font-semibold text-lg text-gray-900 mb-2">
                Can I cancel anytime?
              </h3>
              <p className="text-gray-600">
                Yes! There are no long-term contracts. You can cancel your subscription at any time 
                from your dashboard.
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="font-semibold text-lg text-gray-900 mb-2">
                How many barbers can I add?
              </h3>
              <p className="text-gray-600">
                You can add unlimited barbers/hairdressers to your barbershop. Each barber gets their 
                own schedule and booking calendar.
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="font-semibold text-lg text-gray-900 mb-2">
                What payment methods do you accept?
              </h3>
              <p className="text-gray-600">
                We accept all major credit cards (Visa, Mastercard, American Express) through our 
                secure payment processor Stripe.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
    <Footer />
    </>
  );
}
