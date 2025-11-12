'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { 
  Database, Download, Upload, RefreshCw, AlertCircle, CheckCircle, Clock 
} from 'lucide-react';
import Link from 'next/link';
import { Header } from '@/components/ui/header';
import { Footer } from '@/components/ui/footer';

interface DBStats {
  totalSize: string;
  totalTables: number;
  totalRecords: {
    users: number;
    barbershops: number;
    bookings: number;
    reviews: number;
    sessions: number;
  };
  lastBackup: string;
  nextBackup: string;
  backupStatus: string;
  connectionPool: {
    active: number;
    idle: number;
    max: number;
  };
}

interface DatabaseManagementClientProps {
  dbStats: DBStats;
  locale: string;
  currentUserRole: string;
}

export function DatabaseManagementClient({ 
  dbStats, 
  locale, 
  currentUserRole 
}: DatabaseManagementClientProps) {
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleBackup = async () => {
    setIsBackingUp(true);
    try {
      const response = await fetch(`/${locale}/api/admin/database/backup`, {
        method: 'POST',
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `backup-${new Date().toISOString().split('T')[0]}.sql`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Backup failed:', error);
    } finally {
      setIsBackingUp(false);
    }
  };

  const handleRestore = async () => {
    setIsRestoring(true);
    // Implement restore functionality
    setTimeout(() => setIsRestoring(false), 3000);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'error': return <AlertTriangle className="w-5 h-5 text-red-500" />;
      default: return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
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
              <h1 className="text-3xl font-bold text-gray-900">Database Management</h1>
              <p className="text-gray-600 mt-1">Database backups and maintenance</p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleBackup}
                disabled={isBackingUp}
                className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
              >
                <Download className="w-4 h-4 mr-2" />
                {isBackingUp ? 'Backing Up...' : 'Download Backup'}
              </button>
              <button
                onClick={handleRestore}
                disabled={isRestoring}
                className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                {isRestoring ? 'Restoring...' : 'Restore Database'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Database Overview */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Database Overview</h2>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <HardDrive className="w-8 h-8 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Size</p>
                    <p className="text-2xl font-bold text-gray-900">{dbStats.totalSize}</p>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Tables</p>
                  <p className="text-xl font-bold text-gray-900">{dbStats.totalTables}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Connection Pool</p>
                  <p className="text-xl font-bold text-gray-900">
                    {dbStats.connectionPool.active}/{dbStats.connectionPool.max}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-600 mb-3">Record Count by Table</p>
                <div className="space-y-2">
                  {Object.entries(dbStats.totalRecords).map(([table, count]) => (
                    <div key={table} className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-600 capitalize">{table}</span>
                      <span className="text-sm font-medium text-gray-900">{count.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Backup Status */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Backup Status</h2>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Last Backup</p>
                  <p className="text-lg font-bold text-gray-900">{formatDate(dbStats.lastBackup)}</p>
                </div>
                {getStatusIcon(dbStats.backupStatus)}
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Next Scheduled Backup</p>
                  <p className="text-lg font-bold text-gray-900">{formatDate(dbStats.nextBackup)}</p>
                </div>
                <Clock className="w-5 h-5 text-gray-400" />
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Backup Schedule</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center justify-between">
                    <span>Full Backup</span>
                    <span className="font-medium">Daily at 2:00 AM</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Retention Period</span>
                    <span className="font-medium">30 days</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Storage Location</span>
                    <span className="font-medium">Local + Cloud</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <button className="w-full flex items-center justify-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors">
                  <Play className="w-4 h-4 mr-2" />
                  Schedule Custom Backup
                </button>
                <button className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg font-medium transition-colors">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  View Backup History
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Maintenance Tools */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mt-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Maintenance Tools</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button className="flex items-center justify-center px-4 py-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg font-medium transition-colors">
                <RefreshCw className="w-5 h-5 mr-2" />
                Optimize Database
              </button>
              <button className="flex items-center justify-center px-4 py-3 bg-yellow-50 hover:bg-yellow-100 text-yellow-700 rounded-lg font-medium transition-colors">
                <Database className="w-5 h-5 mr-2" />
                Analyze Tables
              </button>
              <button className="flex items-center justify-center px-4 py-3 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg font-medium transition-colors">
                <Trash2 className="w-5 h-5 mr-2" />
                Clear Old Sessions
              </button>
            </div>
            
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 mr-3" />
                <div>
                  <h3 className="text-sm font-medium text-yellow-800">Maintenance Notice</h3>
                  <p className="text-sm text-yellow-700 mt-1">
                    Some maintenance operations may temporarily affect system performance. 
                    Schedule these during off-peak hours when possible.
                  </p>
                </div>
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
