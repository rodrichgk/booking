'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Activity, Ban, CheckCircle, AlertCircle, Search, ShieldAlert, LogIn, UserCog, X, Plus } from 'lucide-react';
import { Header } from '@/components/ui/header';
import { Footer } from '@/components/ui/footer';
import { useToast } from '@/hooks/use-toast';
import { useConfirm } from '@/components/dashboard/confirm-dialog';
import { Modal } from '@/components/dashboard/modal';
import {
  PageHeader, PageShell, Tabs, Panel, PanelHeader, StatGrid, Stat, Badge, EmptyState, Spinner,
  btn, inputClass, labelClass, type BadgeTone,
} from '@/components/dashboard/ui';

interface SecurityActivity {
  id: string;
  type: string;
  user: string;
  email?: string;
  action?: string;
  ip: string;
  location: string;
  timestamp: string;
  status: string;
}

interface BlockedIP {
  ip: string;
  reason: string;
  blockedAt: string;
}

interface SecurityData {
  recentActivity: SecurityActivity[];
  securityMetrics: { totalLogins: number; failedLogins: number; blockedIPs: number };
  blockedIPs: BlockedIP[];
}

interface SecurityClientProps {
  securityData: SecurityData;
  locale: string;
  currentUserRole: string;
}

type Filter = 'all' | 'login' | 'failed_login' | 'other';

const EVENT: Record<string, { label: string; tone: BadgeTone; icon: typeof Activity }> = {
  login: { label: 'Connexion', tone: 'neutral', icon: LogIn },
  failed_login: { label: 'Échec de connexion', tone: 'danger', icon: AlertCircle },
  role_change: { label: 'Changement de rôle', tone: 'brand', icon: UserCog },
  ip_blocked: { label: 'IP bloquée', tone: 'warning', icon: Ban },
  logout: { label: 'Déconnexion', tone: 'neutral', icon: Activity },
  password_change: { label: 'Mot de passe modifié', tone: 'brand', icon: UserCog },
};

const formatDate = (value: string) =>
  new Date(value).toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

export function SecurityClient({ securityData }: SecurityClientProps) {
  const router = useRouter();
  const { toast } = useToast();
  const confirm = useConfirm();
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [blockOpen, setBlockOpen] = useState(false);
  const [blockIp, setBlockIp] = useState('');
  const [blockReason, setBlockReason] = useState('');
  const [busy, setBusy] = useState<string | null>(null);

  const events = securityData.recentActivity;
  const filtered = events.filter((event) => {
    const q = searchTerm.trim().toLowerCase();
    const matchesSearch = !q || [event.user, event.email, event.ip].some((v) => v?.toLowerCase().includes(q));
    const matchesFilter =
      filter === 'all'
      || (filter === 'other' ? event.type !== 'login' && event.type !== 'failed_login' : event.type === filter);
    return matchesSearch && matchesFilter;
  });

  const handleBlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy('new');
    try {
      const res = await fetch('/api/admin/security/blocked-ips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ip: blockIp.trim(), reason: blockReason.trim() || undefined }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error);
      toast({ variant: 'success', title: 'IP bloquée', description: blockIp.trim() });
      setBlockOpen(false);
      setBlockIp('');
      setBlockReason('');
      router.refresh();
    } catch (err) {
      toast({ variant: 'error', title: 'Blocage impossible', description: err instanceof Error ? err.message : undefined });
    } finally {
      setBusy(null);
    }
  };

  const handleUnblock = async (ip: string) => {
    const ok = await confirm({ title: `Débloquer ${ip} ?`, description: 'Cette adresse pourra de nouveau accéder au site.', confirmLabel: 'Débloquer' });
    if (!ok) return;
    setBusy(ip);
    try {
      const res = await fetch(`/api/admin/security/blocked-ips?ip=${encodeURIComponent(ip)}`, { method: 'DELETE' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error);
      toast({ variant: 'success', title: 'IP débloquée', description: ip });
      router.refresh();
    } catch (err) {
      toast({ variant: 'error', title: 'Déblocage impossible', description: err instanceof Error ? err.message : undefined });
    } finally {
      setBusy(null);
    }
  };

  const { totalLogins, failedLogins, blockedIPs } = securityData.securityMetrics;
  const failureRate = totalLogins + failedLogins > 0 ? Math.round((failedLogins / (totalLogins + failedLogins)) * 100) : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <PageHeader title="Sécurité" description="Journal des connexions et adresses IP bloquées." />

      <PageShell className="space-y-6">
        <StatGrid columns={3}>
          <Stat label="Connexions réussies" icon={LogIn} value={totalLogins} hint="30 derniers jours" />
          <Stat
            label="Échecs de connexion"
            icon={AlertCircle}
            value={failedLogins}
            hint={`${failureRate} % des tentatives`}
            tone={failureRate >= 20 ? 'attention' : 'default'}
          />
          <Stat label="IP bloquées" icon={Ban} value={blockedIPs} />
        </StatGrid>

        <div className="grid items-start gap-6 lg:grid-cols-3">
          <Panel className="lg:col-span-2">
            <PanelHeader title="Journal" description="50 derniers événements" />
            <div className="border-b border-gray-100 px-5 pb-0 pt-3 sm:px-6">
              <div className="relative max-w-sm">
                <label htmlFor="security-search" className="sr-only">Rechercher</label>
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  id="security-search"
                  type="search"
                  placeholder="Utilisateur, email ou IP"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`${inputClass} pl-9`}
                />
              </div>
              <div className="-mb-px">
                <Tabs<Filter>
                  active={filter}
                  onChange={setFilter}
                  tabs={[
                    { id: 'all', label: 'Tout', count: events.length },
                    { id: 'login', label: 'Connexions', count: events.filter(e => e.type === 'login').length },
                    { id: 'failed_login', label: 'Échecs', count: events.filter(e => e.type === 'failed_login').length },
                    { id: 'other', label: 'Autres', count: events.filter(e => e.type !== 'login' && e.type !== 'failed_login').length },
                  ]}
                />
              </div>
            </div>
            {filtered.length === 0 ? (
              <EmptyState icon={ShieldAlert} title="Aucun événement" description={events.length ? 'Aucun résultat pour ce filtre.' : 'Les connexions apparaîtront ici.'} />
            ) : (
              <ul className="divide-y divide-gray-100">
                {filtered.map((event) => {
                  const meta = EVENT[event.type] ?? { label: event.type.replace(/_/g, ' '), tone: 'neutral' as BadgeTone, icon: Activity };
                  return (
                    <li key={event.id} className="flex items-start gap-3 px-5 py-3 sm:px-6">
                      <span className="mt-0.5 inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-500">
                        <meta.icon className="h-4 w-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-medium text-gray-900">{event.user !== 'Inconnu' ? event.user : event.email || 'Inconnu'}</p>
                          <Badge tone={meta.tone}>{meta.label}</Badge>
                          {event.status !== 'success' && event.type !== 'failed_login' && <Badge tone="danger">Échec</Badge>}
                        </div>
                        {event.action && <p className="mt-0.5 text-sm text-gray-600">{event.action}</p>}
                        <p className="mt-0.5 font-mono text-xs text-gray-500">
                          {event.ip}
                          {event.location && event.location !== 'Inconnu' ? `, ${event.location}` : ''}
                        </p>
                      </div>
                      <time dateTime={event.timestamp} className="flex-shrink-0 text-xs tabular-nums text-gray-500">{formatDate(event.timestamp)}</time>
                    </li>
                  );
                })}
              </ul>
            )}
          </Panel>

          <Panel>
            <PanelHeader
              title="IP bloquées"
              description="Liste de suivi. Le blocage n’est pas encore appliqué par le site."
              actions={
                <button onClick={() => setBlockOpen(true)} className={`${btn.secondary} ${btn.sm}`}>
                  <Plus className="h-3.5 w-3.5" />
                  Bloquer
                </button>
              }
            />
            {securityData.blockedIPs.length === 0 ? (
              <EmptyState icon={CheckCircle} title="Aucune IP bloquée" />
            ) : (
              <ul className="divide-y divide-gray-100">
                {securityData.blockedIPs.map((blocked) => (
                  <li key={blocked.ip} className="flex items-start gap-3 px-5 py-3 sm:px-6">
                    <div className="min-w-0 flex-1">
                      <p className="font-mono text-sm text-gray-900">{blocked.ip}</p>
                      <p className="mt-0.5 text-xs text-gray-500">{blocked.reason}</p>
                      <p className="text-xs tabular-nums text-gray-400">{formatDate(blocked.blockedAt)}</p>
                    </div>
                    <button onClick={() => handleUnblock(blocked.ip)} disabled={busy === blocked.ip} className={btn.icon} aria-label={`Débloquer ${blocked.ip}`} title="Débloquer">
                      {busy === blocked.ip ? <Spinner /> : <X className="h-4 w-4" />}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>
      </PageShell>

      <Footer />

      <Modal
        open={blockOpen}
        onClose={() => setBlockOpen(false)}
        title="Bloquer une adresse IP"
        footer={
          <>
            <button type="button" onClick={() => setBlockOpen(false)} className={btn.secondary}>Annuler</button>
            <button type="submit" form="block-ip-form" disabled={busy === 'new'} className={btn.danger}>
              {busy === 'new' && <Spinner className="h-3.5 w-3.5" />}
              Bloquer
            </button>
          </>
        }
      >
        <form id="block-ip-form" onSubmit={handleBlock} className="space-y-4">
          <div>
            <label htmlFor="block-ip" className={labelClass}>Adresse IP <span className="text-red-600" aria-hidden="true">*</span></label>
            <input id="block-ip" type="text" value={blockIp} onChange={(e) => setBlockIp(e.target.value)} required placeholder="203.0.113.42" className={`${inputClass} font-mono`} />
          </div>
          <div>
            <label htmlFor="block-reason" className={labelClass}>Raison</label>
            <input id="block-reason" type="text" value={blockReason} onChange={(e) => setBlockReason(e.target.value)} placeholder="Ex : tentatives de connexion répétées" className={inputClass} />
          </div>
        </form>
      </Modal>
    </div>
  );
}
