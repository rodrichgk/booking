'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { 
  Shield, AlertTriangle, Lock, Eye, Activity, Ban, CheckCircle, 
  RefreshCw, Download, Filter, Search, Globe, User, AlertCircle
} from 'lucide-react';

interface SecurityActivity {
  id: string;
  type: string;
  user: string;
  email?: string;
  target?: string;
  action?: string;
  ip: string;
  location: string;
  timestamp: string;
  status: string;
}

interface SecurityMetrics {
  totalLogins: number;
  failedLogins: number;
  blockedIPs: number;
  activeSessions: number;
  securityAlerts: number;
}

interface BlockedIP {
  ip: string;
  reason: string;
  blockedAt: string;
}

interface SecurityData {
  recentActivity: SecurityActivity[];
  securityMetrics: SecurityMetrics;
  blockedIPs: BlockedIP[];
  securitySettings: {
    twoFactorRequired: boolean;
    ipWhitelist: boolean;
    sessionMonitoring: boolean;
    loginNotifications: boolean;
    bruteForceProtection: boolean;
  };
}

interface SecurityClientProps {
  securityData: SecurityData;
  locale: string;
  currentUserRole: string;
}

export function SecurityClient({ 
  securityData, 
  locale, 
  currentUserRole 
}: SecurityClientProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activityFilter, setActivityFilter] = useState('all');

  const filteredActivity = securityData.recentActivity.filter(activity => {
    const matchesSearch = 
      activity.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.ip.includes(searchTerm);
    
    const matchesFilter = activityFilter === 'all' || activity.type === activityFilter;
    return matchesSearch && matchesFilter;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'login': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed_login': return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'role_change': return <User className="w-4 h-4 text-blue-500" />;
      case 'security_alert': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      default: return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const getActivityBadge = (type: string) => {
    switch (type) {
      case 'login': return 'bg-green-100 text-green-800';
      case 'failed_login': return 'bg-red-100 text-red-800';
      case 'role_change': return 'bg-blue-100 text-blue-800';
      case 'security_alert': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    return status === 'success' ? 
      <CheckCircle className="w-4 h-4 text-green-500" /> : 
      <AlertCircle className="w-4 h-4 text-red-500" />;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Security</h1>
              <p className="text-gray-600 mt-1">Security logs and access control</p>
            </div>
            <div className="flex items-center space-x-3">
              <button className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors">
                <Download className="w-4 h-4 mr-2" />
                Export Logs
              </button>
              <button className="flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Security Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Logins</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{securityData.securityMetrics.totalLogins}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Activity className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Failed Logins</p>
                <p className="text-3xl font-bold text-red-600 mt-2">{securityData.securityMetrics.failedLogins}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Blocked IPs</p>
                <p className="text-3xl font-bold text-orange-600 mt-2">{securityData.securityMetrics.blockedIPs}</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <Ban className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Sessions</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{securityData.securityMetrics.activeSessions}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <Eye className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Security Alerts</p>
                <p className="text-3xl font-bold text-yellow-600 mt-2">{securityData.securityMetrics.securityAlerts}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          {/* Security Activity */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Security Activity</h2>
              <p className="text-sm text-gray-600 mt-1">Recent security events and logs</p>
            </div>
            
            {/* Filters */}
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Search by user, email, or IP..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>
                <div className="sm:w-48">
                  <select
                    value={activityFilter}
                    onChange={(e) => setActivityFilter(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="all">All Activity</option>
                    <option value="login">Logins</option>
                    <option value="failed_login">Failed Logins</option>
                    <option value="role_change">Role Changes</option>
                    <option value="security_alert">Security Alerts</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Activity List */}
            <div className="p-6">
              <div className="space-y-4">
                {filteredActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-center w-8 h-8 bg-white rounded-full border border-gray-200">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{activity.user}</p>
                          {activity.email && (
                            <p className="text-xs text-gray-500">{activity.email}</p>
                          )}
                          {activity.action && (
                            <p className="text-xs text-gray-600 mt-1">{activity.action}</p>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getActivityBadge(activity.type)}`}>
                            {activity.type.replace('_', ' ')}
                          </span>
                          {getStatusIcon(activity.status)}
                        </div>
                      </div>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                        <div className="flex items-center">
                          <Globe className="w-3 h-3 mr-1" />
                          {activity.ip}
                        </div>
                        <div className="flex items-center">
                          <Activity className="w-3 h-3 mr-1" />
                          {activity.location}
                        </div>
                        <div className="flex items-center">
                          <Eye className="w-3 h-3 mr-1" />
                          {formatDate(activity.timestamp)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Blocked IPs */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Blocked IPs</h2>
              <p className="text-sm text-gray-600 mt-1">Currently blocked IP addresses</p>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {securityData.blockedIPs.map((blockedIP, index) => (
                  <div key={index} className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-red-900">{blockedIP.ip}</p>
                        <p className="text-xs text-red-700 mt-1">{blockedIP.reason}</p>
                        <p className="text-xs text-red-600 mt-2">
                          Blocked: {formatDate(blockedIP.blockedAt)}
                        </p>
                      </div>
                      <button className="text-red-600 hover:text-red-800">
                        <Ban className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 space-y-3">
                <button className="w-full flex items-center justify-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors">
                  <Ban className="w-4 h-4 mr-2" />
                  Block New IP
                </button>
                <button className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg font-medium transition-colors">
                  View All Blocked IPs
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mt-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Security Settings</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(securityData.securitySettings).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {value ? 'Enabled' : 'Disabled'}
                    </p>
                  </div>
                  <div className={`w-3 h-3 rounded-full ${value ? 'bg-green-500' : 'bg-gray-300'}`} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
