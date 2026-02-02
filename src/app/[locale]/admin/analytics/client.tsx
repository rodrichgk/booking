'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { 
  BarChart3, TrendingUp, Users, Store, Calendar, DollarSign, 
  Star, Activity, ArrowUp, ArrowDown, Eye, Filter, Download
} from 'lucide-react';
import Link from 'next/link';
import { Header } from '@/components/ui/header';
import { Footer } from '@/components/ui/footer';

interface Stat {
  label: string;
  value: string;
  icon: string;
  color: string;
  change: string;
}

interface Barbershop {
  id: string;
  name: string;
  city: string;
  rating: string;
  reviewCount: number;
  bookingCount: number;
}

interface Activity {
  type: string;
  name: string;
  createdAt: Date;
}

interface AnalyticsClientProps {
  overviewStats: Stat[];
  topBarbershops: Barbershop[];
  recentActivity: Activity[];
  locale: string;
  currentUserRole: string;
}

const renderIcon = (iconName: string, className: string) => {
  const iconMap: { [key: string]: any } = {
    Users,
    Store,
    Calendar,
    DollarSign,
    Star,
    Activity,
    BarChart3,
    TrendingUp,
    ArrowUp,
    ArrowDown,
    Eye,
    Filter,
    Download,
  };
  
  const IconComponent = iconMap[iconName];
  return IconComponent ? <IconComponent className={className} /> : null;
};

export function AnalyticsClient({ 
  overviewStats, 
  topBarbershops, 
  recentActivity, 
  locale, 
  currentUserRole 
}: AnalyticsClientProps) {
  const t = useTranslations('admin');
  const [timeRange, setTimeRange] = useState('month');

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user': return <Users className="w-4 h-4 text-blue-500" />;
      case 'barbershop': return <Store className="w-4 h-4 text-green-500" />;
      case 'booking': return <Calendar className="w-4 h-4 text-purple-500" />;
      default: return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const getActivityBadge = (type: string) => {
    switch (type) {
      case 'user': return 'bg-blue-100 text-blue-800';
      case 'barbershop': return 'bg-green-100 text-green-800';
      case 'booking': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{t('systemAnalytics')}</h1>
              <p className="text-gray-600 mt-1">{t('viewSystemAnalytics')}</p>
            </div>
            <div className="flex items-center space-x-3">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900"
              >
                <option value="day">{t('last24Hours')}</option>
                <option value="week">{t('lastWeek')}</option>
                <option value="month">{t('lastMonth')}</option>
                <option value="year">{t('lastYear')}</option>
              </select>
              <button className="flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors">
                <Download className="w-4 h-4 mr-2" />
                {t('exportReport')}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {overviewStats.map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                  <p className="text-sm text-gray-500 mt-2 flex items-center">
                    <TrendingUp className="w-3 h-3 mr-1 text-green-500" />
                    {stat.change}
                  </p>
                </div>
                <div className={`p-3 bg-${stat.color}-100 rounded-lg ml-4`}>
                  {renderIcon(stat.icon, `w-6 h-6 text-${stat.color}-600`)}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          {/* Top Performing Barbershops */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">{t('topPerformingBarbershops')}</h2>
              <p className="text-sm text-gray-600 mt-1">{t('byNumberOfBookings')}</p>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {topBarbershops.map((barbershop, index) => (
                  <div key={barbershop.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center justify-center w-8 h-8 bg-primary-100 text-primary-600 rounded-full text-sm font-medium">
                        {index + 1}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{barbershop.name}</p>
                        <p className="text-xs text-gray-500">{barbershop.city}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">{barbershop.bookingCount} {t('bookings')}</p>
                      <div className="flex items-center text-xs text-gray-500">
                        <Star className="w-3 h-3 mr-1 text-yellow-400" />
                        {parseFloat(barbershop.rating || '0').toFixed(1)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-4 border-t border-gray-200">
                <Link
                  href={`/${locale}/admin/barbershops`}
                  className="text-sm text-primary-600 hover:text-primary-800 font-medium"
                >
                  {t('viewAllBarbershops')}
                </Link>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">{t('recentActivity')}</h2>
              <p className="text-sm text-gray-600 mt-1">{t('latestSystemActivity')}</p>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recentActivity.slice(0, 10).map((activity, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{activity.name}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getActivityBadge(activity.type)}`}>
                          {t(activity.type)}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatDate(activity.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-4 border-t border-gray-200">
                <button className="text-sm text-primary-600 hover:text-primary-800 font-medium">
                  {t('viewAllActivity')}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Revenue Overview */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mt-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">{t('revenueOverview')}</h2>
            <p className="text-sm text-gray-600 mt-1">{t('subscriptionBasedRevenue')}</p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-600">{t('monthlyRevenue')}</p>
                <p className="text-2xl font-bold text-green-600 mt-2">
                  €{overviewStats.find(s => s.label === t('monthlyRevenue'))?.value.replace('€', '') || '0'}
                </p>
                <p className="text-xs text-gray-500 mt-1">{t('fromActiveSubscriptions')}</p>
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-gray-600">{t('yearlyProjection')}</p>
                <p className="text-2xl font-bold text-blue-600 mt-2">
                  €{((parseFloat(overviewStats.find(s => s.label === t('monthlyRevenue'))?.value.replace('€', '') || '0')) * 12).toFixed(0)}
                </p>
                <p className="text-xs text-gray-500 mt-1">{t('basedOnCurrentSubscriptions')}</p>
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-gray-600">{t('activeSubscriptions')}</p>
                <p className="text-2xl font-bold text-purple-600 mt-2">
                  {overviewStats.find(s => s.label === t('activeBarbershops'))?.value || '0'}
                </p>
                <p className="text-xs text-gray-500 mt-1">{t('payingBarbershops')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <Footer />
    </>
  );
}
