'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { 
  Store, Search, Filter, DollarSign, CheckCircle, XCircle, Clock, Star,
  MoreVertical, Mail, Phone, MapPin, Calendar, Edit, Eye, Ban, CreditCard
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface Barbershop {
  id: string;
  name: string;
  description: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  website: string;
  rating: string;
  reviewCount: number;
  isActive: boolean;
  createdAt: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  barberCount: number;
  subscriptionStatus: string;
  subscriptionExpiry: string;
}

interface Stat {
  label: string;
  value: string;
  icon: string;
  color: string;
}

interface BarbershopManagementClientProps {
  initialBarbershops: Barbershop[];
  initialStats: Stat[];
  locale: string;
  currentUserRole: string;
}

const renderIcon = (iconName: string, className: string) => {
  const iconMap: { [key: string]: any } = {
    Store,
    CheckCircle,
    XCircle,
    Clock,
    Star,
    DollarSign,
    Search,
    Filter,
    MoreVertical,
    Mail,
    Phone,
    MapPin,
    Calendar,
    Edit,
    Eye,
    Ban,
    CreditCard,
  };
  
  const IconComponent = iconMap[iconName];
  return IconComponent ? <IconComponent className={className} /> : null;
};

export function BarbershopManagementClient({ 
  initialBarbershops, 
  initialStats, 
  locale, 
  currentUserRole 
}: BarbershopManagementClientProps) {
  const [barbershops, setBarbershops] = useState(initialBarbershops);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(false);

  const filteredBarbershops = barbershops.filter(barbershop => {
    const matchesSearch = 
      barbershop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      barbershop.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      barbershop.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      barbershop.address.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || barbershop.subscriptionStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string, isActive: boolean) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Active
          </span>
        );
      case 'expired':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle className="w-3 h-3 mr-1" />
            Expired
          </span>
        );
      case 'inactive':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            Unknown
          </span>
        );
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const handleStatusToggle = async (barbershopId: string, currentStatus: boolean) => {
    setLoading(true);
    try {
      const response = await fetch(`/${locale}/api/admin/barbershops/${barbershopId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus })
      });

      if (response.ok) {
        setBarbershops(barbershops.map(b => 
          b.id === barbershopId ? { ...b, isActive: !currentStatus } : b
        ));
      }
    } catch (error) {
      console.error('Failed to update barbershop status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscriptionRenewal = async (barbershopId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/${locale}/api/admin/barbershops/${barbershopId}/renew`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        // Refresh the barbershops list
        window.location.reload();
      }
    } catch (error) {
      console.error('Failed to renew subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Barbershop Management</h1>
              <p className="text-gray-600 mt-1">Manage barbershops and €29.9/month subscriptions</p>
            </div>
            <Link
              href={`/${locale}/admin/barbershops/new`}
              className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Add Barbershop
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {initialStats.map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                </div>
                <div className={`p-3 bg-${stat.color}-100 rounded-lg`}>
                  {renderIcon(stat.icon, `w-6 h-6 text-${stat.color}-600`)}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mt-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search barbershops by name, owner, city, or address..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>
            <div className="sm:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="expired">Expired</option>
                <option value="inactive">Pending</option>
              </select>
            </div>
          </div>
        </div>

        {/* Barbershops Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mt-8 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Barbershop
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Owner
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subscription
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stats
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBarbershops.map((barbershop) => (
                  <tr key={barbershop.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{barbershop.name}</div>
                        <div className="text-sm text-gray-500">ID: {barbershop.id.slice(0, 8)}...</div>
                        {barbershop.website && (
                          <a 
                            href={barbershop.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-sm text-primary-600 hover:text-primary-800"
                          >
                            Website
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{barbershop.ownerName}</div>
                      <div className="text-sm text-gray-500 flex items-center mt-1">
                        <Mail className="w-3 h-3 mr-1 text-gray-400" />
                        {barbershop.ownerEmail}
                      </div>
                      {barbershop.ownerPhone && (
                        <div className="text-sm text-gray-500 flex items-center mt-1">
                          <Phone className="w-3 h-3 mr-1 text-gray-400" />
                          {barbershop.ownerPhone}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 flex items-center">
                        <MapPin className="w-4 h-4 mr-1 text-gray-400" />
                        {barbershop.city}
                      </div>
                      <div className="text-sm text-gray-500 truncate max-w-xs">
                        {barbershop.address}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-2">
                        {getStatusBadge(barbershop.subscriptionStatus, barbershop.isActive)}
                        <div className="text-xs text-gray-500">
                          Expires: {formatDate(barbershop.subscriptionExpiry)}
                        </div>
                        <div className="text-xs font-medium text-primary-600">
                          €29.9/month
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <div className="flex items-center">
                          <Star className="w-4 h-4 mr-1 text-yellow-400" />
                          {parseFloat(barbershop.rating || '0').toFixed(1)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {barbershop.reviewCount} reviews
                        </div>
                      </div>
                      <div className="text-sm text-gray-900 mt-1">
                        <div className="flex items-center">
                          <Store className="w-4 h-4 mr-1 text-gray-400" />
                          {barbershop.barberCount} barbers
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <Link
                          href={`/${locale}/admin/barbershops/${barbershop.id}`}
                          className="text-primary-600 hover:text-primary-900"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button className="text-primary-600 hover:text-primary-900">
                          <Edit className="w-4 h-4" />
                        </button>
                        {barbershop.subscriptionStatus === 'expired' && (
                          <button
                            onClick={() => handleSubscriptionRenewal(barbershop.id)}
                            className="text-green-600 hover:text-green-900"
                            title="Renew Subscription"
                          >
                            <CreditCard className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleStatusToggle(barbershop.id, barbershop.isActive)}
                          className={`${barbershop.isActive ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}`}
                          title={barbershop.isActive ? 'Deactivate' : 'Activate'}
                        >
                          {barbershop.isActive ? <Ban className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredBarbershops.length === 0 && (
            <div className="text-center py-12">
              <Store className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No barbershops found</h3>
              <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filter criteria</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
