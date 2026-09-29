'use client';

import { useState } from 'react';
import { Database, Download, Upload, CheckCircle, XCircle, ShieldCheck } from 'lucide-react';
import { Header } from '@/components/ui/header';
import { Footer } from '@/components/ui/footer';
import { useToast } from '@/hooks/use-toast';
import { useConfirm } from '@/components/dashboard/confirm-dialog';
import {
  PageHeader, PageShell, Panel, PanelHeader, PanelBody, Notice, Spinner, btn,
} from '@/components/dashboard/ui';

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
  lastBackup: string | null;
  nextBackup: string | null;
  backupStatus: string;
  connectionPool: { active: number; idle: number; max: number } | null;
}

interface DatabaseManagementClientProps {
  dbStats: DBStats;
  locale: string;
  currentUserRole: string;
}

const TABLES: Record<string, string> = {
  users: 'Utilisateurs',
  barbershops: 'Salons',
  barbers: 'Coiffeurs',
  services: 'Services',
  bookings: 'Réservations',
  reviews: 'Avis',
};

interface MigrationResult {
  status: 'success' | 'error';
  sql: string;
  error?: string;
}

export function DatabaseManagementClient({ dbStats }: DatabaseManagementClientProps) {
  const { toast } = useToast();
  const confirm = useConfirm();
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationResults, setMigrationResults] = useState<MigrationResult[]>([]);

  const totalRecords = Object.values(dbStats.totalRecords).reduce((a, b) => a + b, 0);

  // The backup route streams the .sql file itself on success, JSON only on error.
  const handleBackup = async () => {
    setIsBackingUp(true);
    try {
      const response = await fetch('/api/admin/database/backup', { method: 'POST' });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Échec de la sauvegarde');
      }
      const blob = await response.blob();
      const filename = response.headers.get('Content-Disposition')?.match(/filename="(.+)"/)?.[1] || 'backup.sql';
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();
      URL.revokeObjectURL(url);
      toast({ variant: 'success', title: 'Sauvegarde téléchargée', description: filename });
    } catch (err) {
      toast({ variant: 'error', title: 'Sauvegarde impossible', description: err instanceof Error ? err.message : undefined });
    } finally {
      setIsBackingUp(false);
    }
  };

  const handleRunMigrations = async () => {
    const ok = await confirm({
      title: 'Exécuter les migrations ?',
      description: 'Les modifications de schéma en attente sont appliquées à la base de production.',
      confirmLabel: 'Exécuter',
      tone: 'danger',
    });
    if (!ok) return;

    setIsMigrating(true);
    setMigrationResults([]);
    try {
      const response = await fetch('/api/migrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Échec des migrations');
      const results: MigrationResult[] = data.results || [];
      setMigrationResults(results);
      const errors = results.filter(r => r.status === 'error').length;
      toast({
        variant: errors ? 'warning' : 'success',
        title: errors ? `${errors} migration(s) en erreur` : 'Migrations appliquées',
        description: `${results.length - errors} réussie(s), ${errors} erreur(s)`,
      });
    } catch (err) {
      toast({ variant: 'error', title: 'Erreur', description: err instanceof Error ? err.message : undefined });
    } finally {
      setIsMigrating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <PageHeader title="Base de données" description="Volumes, sauvegardes et migrations de schéma." />

      <PageShell className="space-y-6">
        <div className="grid items-start gap-6 lg:grid-cols-2">
          <Panel>
            <PanelHeader title="Enregistrements" description={`${totalRecords.toLocaleString('fr-FR')} au total`} />
            <dl className="divide-y divide-gray-100">
              {Object.entries(TABLES).map(([table, label]) => (
                <div key={table} className="flex items-center justify-between px-5 py-3 text-sm sm:px-6">
                  <dt className="text-gray-600">{label}</dt>
                  <dd className="font-medium tabular-nums text-gray-900">
                    {(dbStats.totalRecords[table as keyof DBStats['totalRecords']] ?? 0).toLocaleString('fr-FR')}
                  </dd>
                </div>
              ))}
            </dl>
          </Panel>

          <Panel>
            <PanelHeader title="Sauvegardes" />
            <PanelBody className="space-y-4">
              <Notice tone="success" icon={ShieldCheck} title="Sauvegardes automatiques">
                Vercel Postgres sauvegarde la base chaque jour, avec restauration à un instant donné depuis la console Vercel.
              </Notice>
              <div>
                <h3 className="text-sm font-medium text-gray-900">Export SQL manuel</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Toutes les données, sous forme d’instructions INSERT. Le fichier contient des mots de passe chiffrés : conservez-le en lieu sûr.
                </p>
                <button onClick={handleBackup} disabled={isBackingUp} className={`${btn.secondary} mt-3`}>
                  {isBackingUp ? <Spinner className="h-3.5 w-3.5" /> : <Download className="h-4 w-4" />}
                  Télécharger un export SQL
                </button>
              </div>
            </PanelBody>
          </Panel>
        </div>

        <Panel>
          <PanelHeader
            icon={Database}
            title="Migrations"
            description="Applique les changements de schéma définis dans /api/migrate. Sans effet sur ceux déjà appliqués."
            actions={
              <button onClick={handleRunMigrations} disabled={isMigrating} className={btn.primary}>
                {isMigrating ? <Spinner className="h-3.5 w-3.5" /> : <Upload className="h-4 w-4" />}
                Exécuter les migrations
              </button>
            }
          />
          {migrationResults.length > 0 && (
            <ul className="divide-y divide-gray-100">
              {migrationResults.map((result, index) => (
                <li key={index} className="flex gap-3 px-5 py-3 sm:px-6">
                  {result.status === 'success'
                    ? <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" aria-label="Réussie" />
                    : <XCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-600" aria-label="Erreur" />}
                  <div className="min-w-0">
                    <code className="block truncate font-mono text-xs text-gray-700">{result.sql}</code>
                    {result.error && <p className="mt-1 text-xs text-red-700">{result.error}</p>}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </PageShell>

      <Footer />
    </div>
  );
}
