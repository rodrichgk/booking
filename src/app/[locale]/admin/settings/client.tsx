'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { Globe, CreditCard, Mail, Shield, Palette, Save, RotateCcw, Store, Star, X, Send } from 'lucide-react';
import { Header } from '@/components/ui/header';
import { Footer } from '@/components/ui/footer';
import { useToast } from '@/hooks/use-toast';
import {
  PageHeader, PageShell, Tabs, Panel, Switch, Spinner, btn, inputClass, labelClass,
} from '@/components/dashboard/ui';

interface SettingsData {
  general: { siteName: string; siteUrl: string; defaultLanguage: string; timezone: string; maintenanceMode: boolean };
  payment: { subscriptionPrice: number; currency: string; paymentProvider: string; autoRenewal: boolean };
  email: { smtpHost: string; smtpPort: number; senderEmail: string; senderName: string };
  notifications: { emailNotifications: boolean; smsNotifications: boolean; pushNotifications: boolean; bookingReminders: boolean };
  security: { twoFactorAuth: boolean; sessionTimeout: number; maxLoginAttempts: number; passwordMinLength: number };
  appearance: {
    primaryColor: string;
    darkMode: boolean;
    compactMode: boolean;
    featuredMode: 'manual' | 'popularity' | 'rating';
    featuredBarbershopIds: string[];
  };
}

type Section = keyof SettingsData;

interface Barbershop {
  id: string;
  name: string;
  city: string;
  rating: string | null;
  reviewCount: number | null;
  isActive: boolean;
}

interface SettingsClientProps {
  settings: SettingsData;
  locale: string;
  currentUserRole: string;
}

function Row({ title, description, control }: { title: string; description?: ReactNode; control: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-6 px-5 py-4 sm:px-6">
      <div className="min-w-0">
        <p className="text-sm font-medium text-gray-900">{title}</p>
        {description && <p className="mt-0.5 text-sm text-gray-500">{description}</p>}
      </div>
      <div className="flex-shrink-0">{control}</div>
    </div>
  );
}

function FieldBlock({ id, label, help, children }: { id: string; label: string; help?: string; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className={labelClass}>{label}</label>
      {children}
      {help && <p className="mt-1.5 text-xs text-gray-500">{help}</p>}
    </div>
  );
}

export function SettingsClient({ settings: initialSettings }: SettingsClientProps) {
  const { toast } = useToast();
  const [saved, setSaved] = useState(initialSettings);
  const [settings, setSettings] = useState(initialSettings);
  const [activeTab, setActiveTab] = useState<Section>('payment');
  const [saving, setSaving] = useState(false);
  const [barbershops, setBarbershops] = useState<Barbershop[]>([]);
  const [testEmail, setTestEmail] = useState('');
  const [sendingTest, setSendingTest] = useState(false);

  useEffect(() => {
    fetch('/api/barbershops')
      .then((res) => res.json())
      .then((data) => setBarbershops(data.barbershops || []))
      .catch((error) => console.error('Error fetching barbershops:', error));
  }, []);

  const set = <S extends Section>(section: S, patch: Partial<SettingsData[S]>) =>
    setSettings((prev) => ({ ...prev, [section]: { ...prev[section], ...patch } }));

  const isDirty = JSON.stringify(settings[activeTab]) !== JSON.stringify(saved[activeTab]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: activeTab, value: settings[activeTab], description: `${activeTab} settings` }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error);
      setSaved((prev) => ({ ...prev, [activeTab]: settings[activeTab] }));
      toast({ variant: 'success', title: 'Paramètres enregistrés' });
    } catch (err) {
      toast({ variant: 'error', title: 'Enregistrement impossible', description: err instanceof Error ? err.message : undefined });
    } finally {
      setSaving(false);
    }
  };

  const handleSendTest = async (e: React.FormEvent) => {
    e.preventDefault();
    setSendingTest(true);
    try {
      const res = await fetch('/api/admin/email/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: testEmail }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error);
      toast({ variant: 'success', title: 'Email de test envoyé', description: testEmail });
    } catch (err) {
      toast({ variant: 'error', title: 'Échec de l’envoi', description: err instanceof Error ? err.message : undefined });
    } finally {
      setSendingTest(false);
    }
  };

  const tabs: { id: Section; label: string; icon: typeof Globe }[] = [
    { id: 'payment', label: 'Paiement', icon: CreditCard },
    { id: 'email', label: 'Email', icon: Mail },
    { id: 'appearance', label: 'Accueil', icon: Palette },
    { id: 'general', label: 'Général', icon: Globe },
    { id: 'security', label: 'Sécurité', icon: Shield },
  ];

  const { general, payment, email, security, appearance } = settings;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <PageHeader title="Paramètres" description="Configuration de la plateforme.">
        <Tabs tabs={tabs} active={activeTab} onChange={setActiveTab} />
      </PageHeader>

      <PageShell>
        <div className="max-w-3xl space-y-4">

        <Panel>
          {activeTab === 'payment' && (
            <div className="grid gap-4 px-5 py-5 sm:grid-cols-2 sm:px-6">
              <FieldBlock id="sub-price" label="Prix de l’abonnement (par mois)" help="Appliqué aux nouveaux paiements Stripe.">
                <input
                  id="sub-price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={Number.isFinite(payment.subscriptionPrice) ? payment.subscriptionPrice : ''}
                  onChange={(e) => set('payment', { subscriptionPrice: parseFloat(e.target.value) })}
                  className={inputClass}
                />
              </FieldBlock>
              <FieldBlock id="sub-currency" label="Devise" help="Utilisée par Stripe au paiement.">
                <select id="sub-currency" value={payment.currency} onChange={(e) => set('payment', { currency: e.target.value })} className={inputClass}>
                  <option value="EUR">EUR</option>
                  <option value="USD">USD</option>
                  <option value="GBP">GBP</option>
                </select>
              </FieldBlock>
            </div>
          )}

          {activeTab === 'email' && (
            <div className="divide-y divide-gray-100">
              <div className="grid gap-4 px-5 py-5 sm:grid-cols-2 sm:px-6">
                <FieldBlock id="sender-name" label="Nom de l’expéditeur" help="Affiché comme expéditeur de tous les emails.">
                  <input id="sender-name" type="text" value={email.senderName} onChange={(e) => set('email', { senderName: e.target.value })} className={inputClass} />
                </FieldBlock>
                <FieldBlock id="sender-email" label="Adresse de l’expéditeur" help="Doit appartenir à un domaine vérifié dans Resend.">
                  <input id="sender-email" type="email" value={email.senderEmail} onChange={(e) => set('email', { senderEmail: e.target.value })} className={inputClass} />
                </FieldBlock>
              </div>
              <div className="px-5 py-5 sm:px-6">
                <h3 className="text-sm font-medium text-gray-900">Envoyer un email de test</h3>
                <p className="mt-0.5 text-sm text-gray-500">Enregistrez d’abord vos modifications : le test utilise l’expéditeur enregistré.</p>
                <form onSubmit={handleSendTest} className="mt-3 flex flex-col gap-2 sm:flex-row">
                  <label htmlFor="test-email" className="sr-only">Adresse de test</label>
                  <input id="test-email" type="email" required value={testEmail} onChange={(e) => setTestEmail(e.target.value)} placeholder="vous@exemple.fr" className={inputClass} />
                  <button type="submit" disabled={sendingTest} className={btn.secondary}>
                    {sendingTest ? <Spinner className="h-3.5 w-3.5" /> : <Send className="h-4 w-4" />}
                    Envoyer
                  </button>
                </form>
              </div>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="space-y-4 px-5 py-5 sm:px-6">
              <FieldBlock id="featured-mode" label="Salons en vedette sur la page d’accueil" help="Trois salons visibles sont affichés.">
                <select
                  id="featured-mode"
                  value={appearance.featuredMode}
                  onChange={(e) => set('appearance', { featuredMode: e.target.value as SettingsData['appearance']['featuredMode'] })}
                  className={inputClass}
                >
                  <option value="rating">Les mieux notés</option>
                  <option value="popularity">Les plus réservés</option>
                  <option value="manual">Sélection manuelle</option>
                </select>
              </FieldBlock>

              {appearance.featuredMode === 'manual' && (
                <div className="space-y-3">
                  <p className="text-sm text-gray-500">
                    Affichés dans cet ordre. Si un salon choisi est masqué, il est remplacé par un salon parmi les mieux notés.
                  </p>
                  {appearance.featuredBarbershopIds.length === 0 ? (
                    <p className="text-sm text-gray-500">Aucun salon sélectionné.</p>
                  ) : (
                    <ol className="divide-y divide-gray-100 rounded-lg border border-gray-200">
                      {appearance.featuredBarbershopIds.map((shopId, index) => {
                        const shop = barbershops.find((s) => s.id === shopId);
                        return (
                          <li key={shopId} className="flex items-center gap-3 px-4 py-2.5">
                            <span className="w-4 text-right text-sm tabular-nums text-gray-400">{index + 1}</span>
                            <Store className="h-4 w-4 text-gray-400" />
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-sm font-medium text-gray-900">{shop?.name || 'Salon introuvable'}</span>
                              {shop && <span className="block text-xs text-gray-500">{shop.city}{shop.isActive ? '' : ', masqué'}</span>}
                            </span>
                            {shop?.rating && (
                              <span className="inline-flex items-center gap-1 text-xs tabular-nums text-gray-500">
                                <Star className="h-3.5 w-3.5 fill-primary-500 text-primary-500" />
                                {shop.rating}
                              </span>
                            )}
                            <button
                              onClick={() => set('appearance', { featuredBarbershopIds: appearance.featuredBarbershopIds.filter((id) => id !== shopId) })}
                              className={btn.icon}
                              aria-label={`Retirer ${shop?.name || 'ce salon'}`}
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </li>
                        );
                      })}
                    </ol>
                  )}
                  <div>
                    <label htmlFor="add-featured" className="sr-only">Ajouter un salon</label>
                    <select
                      id="add-featured"
                      value=""
                      onChange={(e) => {
                        if (e.target.value) set('appearance', { featuredBarbershopIds: [...appearance.featuredBarbershopIds, e.target.value] });
                      }}
                      className={inputClass}
                    >
                      <option value="" disabled>Ajouter un salon...</option>
                      {barbershops
                        .filter((shop) => shop.isActive && !appearance.featuredBarbershopIds.includes(shop.id))
                        .map((shop) => (
                          <option key={shop.id} value={shop.id}>{shop.name}, {shop.city}</option>
                        ))}
                    </select>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'general' && (
            <div className="divide-y divide-gray-100">
              <div className="px-5 py-5 sm:px-6">
                <FieldBlock id="site-name" label="Nom du site" help="Affiché sur la page de maintenance.">
                  <input id="site-name" type="text" value={general.siteName} onChange={(e) => set('general', { siteName: e.target.value })} className={`${inputClass} sm:max-w-sm`} />
                </FieldBlock>
              </div>
              <Row
                title="Mode maintenance"
                description="Les visiteurs voient une page de maintenance et les réservations sont suspendues. Les admins gardent l’accès."
                control={<Switch label="Mode maintenance" tone="danger" checked={general.maintenanceMode} onChange={(v) => set('general', { maintenanceMode: v })} />}
              />
            </div>
          )}

          {activeTab === 'security' && (
            <div className="grid gap-4 px-5 py-5 sm:grid-cols-2 sm:px-6">
              <FieldBlock id="max-attempts" label="Tentatives de connexion" help="Échecs autorisés en 15 minutes avant blocage temporaire (3 à 50).">
                <input id="max-attempts" type="number" min="3" max="50" value={security.maxLoginAttempts} onChange={(e) => set('security', { maxLoginAttempts: parseInt(e.target.value) || 0 })} className={inputClass} />
              </FieldBlock>
              <FieldBlock id="password-length" label="Longueur minimale du mot de passe" help="Pour les nouveaux comptes et les réinitialisations (6 à 64).">
                <input id="password-length" type="number" min="6" max="64" value={security.passwordMinLength} onChange={(e) => set('security', { passwordMinLength: parseInt(e.target.value) || 0 })} className={inputClass} />
              </FieldBlock>
            </div>
          )}

          <div className="flex items-center justify-between gap-3 border-t border-gray-100 bg-gray-50/60 px-5 py-3 sm:px-6">
            <p className="text-sm text-gray-500">{isDirty ? 'Modifications non enregistrées' : 'Tout est enregistré'}</p>
            <div className="flex gap-2">
              <button
                onClick={() => setSettings((prev) => ({ ...prev, [activeTab]: saved[activeTab] }))}
                disabled={!isDirty || saving}
                className={`${btn.ghost} ${btn.sm}`}
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Annuler
              </button>
              <button onClick={handleSave} disabled={!isDirty || saving} className={`${btn.primary} ${btn.sm}`}>
                {saving ? <Spinner className="h-3 w-3" /> : <Save className="h-3.5 w-3.5" />}
                Enregistrer
              </button>
            </div>
          </div>
        </Panel>
        </div>
      </PageShell>

      <Footer />
    </div>
  );
}
