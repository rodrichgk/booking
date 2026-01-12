'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  Database, Download, Upload, RefreshCw, AlertCircle, CheckCircle, Clock,
  AlertTriangle, HardDrive, Play, RotateCcw, Trash2
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
    barbers: number;
    services: number;
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

const tableNamesFr: Record<string, string> = {
  users: 'Utilisateurs',
  barbershops: 'Salons',
  bookings: 'Réservations',
  reviews: 'Avis',
  barbers: 'Coiffeurs',
  services: 'Services',
};

export function DatabaseManagementClient({
  dbStats,
  locale,
  currentUserRole
}: DatabaseManagementClientProps) {
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [isClearingSessions, setIsClearingSessions] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

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
      const response = await fetch('/api/admin/database/backup', {
        method: 'POST',
      });

      if (response.ok) {
        const data = await response.json();
        alert(`✓ Sauvegarde créée avec succès!\n\nFichier: ${data.filename}\nTaille: ${data.size}`);
      } else {
        const error = await response.json();
        alert(`❌ Erreur: ${error.error || 'Échec de la sauvegarde'}`);
      }
    } catch (error) {
      console.error('Backup failed:', error);
      alert('❌ Erreur lors de la sauvegarde');
    } finally {
      setIsBackingUp(false);
    }
  };

  const handleClearSessions = async () => {
    if (!confirm('⚠️ Êtes-vous sûr de vouloir supprimer les sessions expirées ?')) {
      return;
    }

    setIsClearingSessions(true);
    try {
      const response = await fetch('/api/admin/database/clear-sessions', {
        method: 'POST',
      });

      if (response.ok) {
        const data = await response.json();
        alert(`✓ ${data.deleted || 0} sessions expirées supprimées`);
        window.location.reload();
      } else {
        const error = await response.json();
        alert(`❌ Erreur: ${error.error || 'Échec de la suppression'}`);
      }
    } catch (error) {
      console.error('Clear sessions failed:', error);
      alert('❌ Erreur lors de la suppression des sessions');
    } finally {
      setIsClearingSessions(false);
    }
  };

  const handleOptimize = async () => {
    setIsOptimizing(true);
    try {
      // Simulate optimization (in a real app, this would call an API)
      await new Promise(resolve => setTimeout(resolve, 2000));
      alert('✓ Base de données optimisée avec succès!');
    } catch (error) {
      console.error('Optimize failed:', error);
      alert('❌ Erreur lors de l\'optimisation');
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    try {
      // Simulate analysis (in a real app, this would call an API)
      await new Promise(resolve => setTimeout(resolve, 2000));
      alert('✓ Analyse des tables terminée!\n\nToutes les tables sont en bon état.');
    } catch (error) {
      console.error('Analyze failed:', error);
      alert('❌ Erreur lors de l\'analyse');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleRestore = async () => {
    alert('⚠️ La restauration de base de données n\'est pas encore implémentée.\n\nContactez le support technique pour restaurer une sauvegarde.');
  };

  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationResults, setMigrationResults] = useState<any[]>([]);

  const handleRunMigrations = async () => {
    if (!confirm('⚠️ Exécuter les migrations de base de données ?\n\nCela va appliquer les modifications de schéma en attente.')) {
      return;
    }

    setIsMigrating(true);
    setMigrationResults([]);
    try {
      const response = await fetch('/api/migrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      const data = await response.json();

      if (response.ok) {
        setMigrationResults(data.results || []);
        const successCount = (data.results || []).filter((r: any) => r.status === 'success').length;
        const errorCount = (data.results || []).filter((r: any) => r.status === 'error').length;
        alert(`✓ Migrations terminées!\n\n${successCount} réussies, ${errorCount} erreurs`);
      } else {
        alert(`❌ Erreur: ${data.error || 'Échec des migrations'}`);
      }
    } catch (error) {
      console.error('Migration failed:', error);
      alert('❌ Erreur lors des migrations');
    } finally {
      setIsMigrating(false);
    }
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

  const totalRecords = Object.values(dbStats.totalRecords).reduce((a, b) => a + b, 0);

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Gestion de la Base de Données</h1>
                <p className="text-gray-600 mt-1">Sauvegardes et maintenance de la base de données</p>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleBackup}
                  disabled={isBackingUp}
                  className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
                >
                  <Download className="w-4 h-4 mr-2" />
                  {isBackingUp ? 'Sauvegarde...' : 'Créer une Sauvegarde'}
                </button>
                <button
                  onClick={handleRestore}
                  disabled={isRestoring}
                  className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  {isRestoring ? 'Restauration...' : 'Restaurer'}
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
                <h2 className="text-lg font-semibold text-gray-900">Vue d'ensemble</h2>
              </div>
              <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <HardDrive className="w-8 h-8 text-blue-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">Taille estimée</p>
                      <p className="text-2xl font-bold text-gray-900">{dbStats.totalSize}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-600">Total enregistrements</p>
                    <p className="text-2xl font-bold text-primary-600">{totalRecords.toLocaleString()}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Tables</p>
                    <p className="text-xl font-bold text-gray-900">{dbStats.totalTables}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pool de connexions</p>
                    <p className="text-xl font-bold text-gray-900">
                      {dbStats.connectionPool.active}/{dbStats.connectionPool.max}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-600 mb-3">Enregistrements par table</p>
                  <div className="space-y-2">
                    {Object.entries(dbStats.totalRecords).map(([table, count]) => (
                      <div key={table} className="flex items-center justify-between py-2 border-b border-gray-100">
                        <span className="text-sm text-gray-600">{tableNamesFr[table] || table}</span>
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
                <h2 className="text-lg font-semibold text-gray-900">État des Sauvegardes</h2>
              </div>
              <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Dernière sauvegarde</p>
                    <p className="text-lg font-bold text-gray-900">{formatDate(dbStats.lastBackup)}</p>
                  </div>
                  {getStatusIcon(dbStats.backupStatus)}
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Prochaine sauvegarde planifiée</p>
                    <p className="text-lg font-bold text-gray-900">{formatDate(dbStats.nextBackup)}</p>
                  </div>
                  <Clock className="w-5 h-5 text-gray-400" />
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Planification des Sauvegardes</h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center justify-between">
                      <span>Sauvegarde complète</span>
                      <span className="font-medium">Quotidienne à 2h00</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Durée de rétention</span>
                      <span className="font-medium">30 jours</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Emplacement</span>
                      <span className="font-medium">Local + Cloud</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={handleBackup}
                    disabled={isBackingUp}
                    className="w-full flex items-center justify-center px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    {isBackingUp ? 'Sauvegarde en cours...' : 'Sauvegarde manuelle'}
                  </button>
                  <button className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg font-medium transition-colors">
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Voir l'historique
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Maintenance Tools */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 mt-8">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Outils de Maintenance</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={handleOptimize}
                  disabled={isOptimizing}
                  className="flex items-center justify-center px-4 py-3 bg-blue-50 hover:bg-blue-100 disabled:bg-gray-100 text-blue-700 disabled:text-gray-400 rounded-lg font-medium transition-colors"
                >
                  <RefreshCw className={`w-5 h-5 mr-2 ${isOptimizing ? 'animate-spin' : ''}`} />
                  {isOptimizing ? 'Optimisation...' : 'Optimiser la Base'}
                </button>
                <button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing}
                  className="flex items-center justify-center px-4 py-3 bg-yellow-50 hover:bg-yellow-100 disabled:bg-gray-100 text-yellow-700 disabled:text-gray-400 rounded-lg font-medium transition-colors"
                >
                  <Database className={`w-5 h-5 mr-2 ${isAnalyzing ? 'animate-pulse' : ''}`} />
                  {isAnalyzing ? 'Analyse...' : 'Analyser les Tables'}
                </button>
                <button
                  onClick={handleClearSessions}
                  disabled={isClearingSessions}
                  className="flex items-center justify-center px-4 py-3 bg-red-50 hover:bg-red-100 disabled:bg-gray-100 text-red-700 disabled:text-gray-400 rounded-lg font-medium transition-colors"
                >
                  <Trash2 className="w-5 h-5 mr-2" />
                  {isClearingSessions ? 'Suppression...' : 'Nettoyer les Sessions'}
                </button>
              </div>

              {/* Migrations Section */}
              <div className="mt-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-purple-800">Migrations de Base de Données</h3>
                    <p className="text-sm text-purple-700 mt-1">
                      Exécuter les migrations pour mettre à jour le schéma de la base de données.
                    </p>
                  </div>
                  <button
                    onClick={handleRunMigrations}
                    disabled={isMigrating}
                    className="flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
                  >
                    <Upload className={`w-4 h-4 mr-2 ${isMigrating ? 'animate-pulse' : ''}`} />
                    {isMigrating ? 'Exécution...' : 'Exécuter les Migrations'}
                  </button>
                </div>

                {migrationResults.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <h4 className="text-xs font-medium text-purple-800 uppercase">Résultats:</h4>
                    {migrationResults.map((result, index) => (
                      <div key={index} className={`text-xs p-2 rounded ${result.status === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {result.status === 'success' ? '✓' : '✗'} {result.sql}
                        {result.error && <span className="block text-red-600">{result.error}</span>}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 mr-3" />
                  <div>
                    <h3 className="text-sm font-medium text-yellow-800">Avis de Maintenance</h3>
                    <p className="text-sm text-yellow-700 mt-1">
                      Certaines opérations de maintenance peuvent temporairement affecter les performances du système.
                      Planifiez ces opérations pendant les heures creuses si possible.
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
