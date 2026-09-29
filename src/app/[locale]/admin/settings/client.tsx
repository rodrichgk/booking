'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { Globe, CreditCard, Mail, Bell, Shield, Palette, Save, RotateCcw, Store, Star, X, Info, Send, AlertTriangle } from 'lucide-react';
import { Header } from '@/components/ui/header';
import { Footer } from '@/components/ui/footer';
import { useToast } from '@/hooks/use-toast';
import {
  PageHeader, PageShell, Tabs, Panel, Badge, Notice, Switch, Spinner, btn, inputClass, labelClass,
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

/** Marks a setting that is stored but not yet read anywhere in the app. */
function NotWired() {
  return <Badge tone="neutral" className="ml-2 align-middle">Pas encore actif</Badge>;
}

function Row({ title, description, control, notWired }: { title: string; description?: ReactNode; control: ReactNode; notWired?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-6 px-5 py-4 sm:px-6">
      <div className="min-w-0">
        <p className="text-sm font-medium text-gray-900">
          {title}
          {notWired && <NotWired />}
        </p>
        {description && <p className="mt-0.5 text-sm text-gray-500">{description}</p>}
      </div>
      <div className="flex-shrink-0">{control}</div>
    </div>
  );
}

function FieldBlock({ id, label, help, notWired, children }: { id: string; label: string; help?: string; notWired?: boolean; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className={labelClass}>
        {label}
        {notWired && <NotWired />}
      </label>
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
    { id: 'appearance', label: 'Apparence', icon: Palette },
    { id: 'general', label: 'Général', icon: Globe },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Sécurité', icon: Shield },
  ];

  const { general, payment, email, notifications, security, appearance } = settings;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <PageHeader title="Paramètres" description="Configuration de la plateforme.">
        <Tabs tabs={tabs} active={activeTab} onChange={setActiveTab} />
      </PageHeader>

      <PageShell>
        <div className="max-w-3xl space-y-4">
        <Notice tone="neutral" icon={Info}>
          Les réglages marqués « Pas encore actif » sont enregistrés mais ne sont pas encore utilisés par le site.
        </Notice>

        <Panel>
          {activeTab === 'payment' && (
            <div className="divide-y divide-gray-100">
              <div className="grid gap-4 px-5 py-5 sm:grid-cols-2 sm:px-6">
                <FieldBlock id="sub-price" label="Prix de l’abonnement (par mois)" help="Appliqué aux nouveaux paiements.">
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
              <Row
                title="Renouvellement automatique"
                description="Renouveler automatiquement les abonnements."
                notWired
                control={<Switch label="Renouvellement automatique" checked={payment.autoRenewal} onChange={(v) => set('payment', { autoRenewal: v })} />}
              />
            </div>
          )}

          {activeTab === 'email' && (
            <div className="divide-y divide-gray-100">
              <div className="px-5 py-5 sm:px-6">
                <h3 className="text-sm font-medium text-gray-900">Envoyer un email de test</h3>
                <p className="mt-0.5 text-sm text-gray-500">Vérifie que l’envoi via Resend fonctionne.</p>
                <form onSubmit={handleSendTest} className="mt-3 flex flex-col gap-2 sm:flex-row">
                  <label htmlFor="test-email" className="sr-only">Adresse de test</label>
                  <input id="test-email" type="email" required value={testEmail} onChange={(e) => setTestEmail(e.target.value)} placeholder="vous@exemple.fr" className={inputClass} />
                  <button type="submit" disabled={sendingTest} className={btn.secondary}>
                    {sendingTest ? <Spinner className="h-3.5 w-3.5" /> : <Send className="h-4 w-4" />}
                    Envoyer
                  </button>
                </form>
              </div>
              <div className="grid gap-4 px-5 py-5 sm:grid-cols-2 sm:px-6">
                <FieldBlock id="sender-email" label="Email expéditeur" notWired help="Les emails partent actuellement de noreply@orphelia.net.">
                  <input id="sender-email" type="email" value={email.senderEmail} onChange={(e) => set('email', { senderEmail: e.target.value })} className={inputClass} />
                </FieldBlock>
                <FieldBlock id="sender-name" label="Nom expéditeur" notWired>
                  <input id="sender-name" type="text" value={email.senderName} onChange={(e) => set('email', { senderName: e.target.value })} className={inputClass} />
                </FieldBlock>
              </div>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="divide-y divide-gray-100">
              <div className="space-y-4 px-5 py-5 sm:px-6">
                <FieldBlock id="featured-mode" label="Salons en vedette sur l’accueil" notWired>
                  <select
                    id="featured-mode"
                    value={appearance.featuredMode}
                    onChange={(e) => set('appearance', { featuredMode: e.target.value as SettingsData['appearance']['featuredMode'] })}
                    className={inputClass}
                  >
                    <option value="manual">Sélection manuelle</option>
                    <option value="popularity">Les plus réservés</option>
                    <option value="rating">Les mieux notés</option>
                  </select>
                </FieldBlock>

                {appearance.featuredMode === 'manual' && (
                  <div className="space-y-3">
                    {appearance.featuredBarbershopIds.length === 0 ? (
                      <p className="text-sm text-gray-500">Aucun salon sélectionné.</p>
                    ) : (
                      <ul className="divide-y divide-gray-100 rounded-lg border border-gray-200">
                        {appearance.featuredBarbershopIds.map((shopId) => {
                          const shop = barbershops.find((s) => s.id === shopId);
                          return (
                            <li key={shopId} className="flex items-center gap-3 px-4 py-2.5">
                              <Store className="h-4 w-4 text-gray-400" />
                              <span className="min-w-0 flex-1">
                                <span className="block truncate text-sm font-medium text-gray-900">{shop?.name || 'Salon introuvable'}</span>
                                {shop?.city && <span className="block text-xs text-gray-500">{shop.city}</span>}
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
                      </ul>
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
                          .filter((shop) => !appearance.featuredBarbershopIds.includes(shop.id))
                          .map((shop) => (
                            <option key={shop.id} value={shop.id}>{shop.name}, {shop.city}</option>
                          ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>
              <Row
                title="Mode sombre"
                description={
                  <span className="inline-flex items-start gap-1.5 text-amber-800">
                    <AlertTriangle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
                    Les pages n’ont pas de thème sombre : l’activer donne un affichage incohérent.
                  </span>
                }
                control={<Switch label="Mode sombre" checked={appearance.darkMode} onChange={(v) => set('appearance', { darkMode: v })} />}
              />
              <Row
                title="Mode compact"
                notWired
                control={<Switch label="Mode compact" checked={appearance.compactMode} onChange={(v) => set('appearance', { compactMode: v })} />}
              />
              <div className="px-5 py-4 sm:px-6">
                <FieldBlock id="primary-color" label="Couleur principale" notWired>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={appearance.primaryColor}
                      onChange={(e) => set('appearance', { primaryColor: e.target.value })}
                      className="h-9 w-12 cursor-pointer rounded-lg border border-gray-300"
                      aria-label="Choisir la couleur"
                    />
                    <input id="primary-color" type="text" value={appearance.primaryColor} onChange={(e) => set('appearance', { primaryColor: e.target.value })} className={`${inputClass} max-w-[10rem] font-mono`} />
                  </div>
                </FieldBlock>
              </div>
            </div>
          )}

          {activeTab === 'general' && (
            <div className="divide-y divide-gray-100">
              <div className="grid gap-4 px-5 py-5 sm:grid-cols-2 sm:px-6">
                <FieldBlock id="site-name" label="Nom du site" notWired>
                  <input id="site-name" type="text" value={general.siteName} onChange={(e) => set('general', { siteName: e.target.value })} className={inputClass} />
                </FieldBlock>
                <FieldBlock id="site-url" label="URL du site" notWired>
                  <input id="site-url" type="url" value={general.siteUrl} onChange={(e) => set('general', { siteUrl: e.target.value })} className={inputClass} />
                </FieldBlock>
                <FieldBlock id="default-language" label="Langue par défaut" notWired>
                  <select id="default-language" value={general.defaultLanguage} onChange={(e) => set('general', { defaultLanguage: e.target.value })} className={inputClass}>
                    <option value="fr">Français</option>
                    <option value="en">Anglais</option>
                  </select>
                </FieldBlock>
                <FieldBlock id="timezone" label="Fuseau horaire" notWired>
                  <select id="timezone" value={general.timezone} onChange={(e) => set('general', { timezone: e.target.value })} className={inputClass}>
                    <option value="Europe/Paris">Europe/Paris</option>
                    <option value="Europe/London">Europe/London</option>
                    <option value="America/New_York">America/New_York</option>
                  </select>
                </FieldBlock>
              </div>
              <Row
                title="Mode maintenance"
                description="Rendre le site temporairement indisponible."
                notWired
                control={<Switch label="Mode maintenance" tone="danger" checked={general.maintenanceMode} onChange={(v) => set('general', { maintenanceMode: v })} />}
              />
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="divide-y divide-gray-100">
              <Row title="Notifications par email" description="Emails pour les événements importants." notWired control={<Switch label="Notifications par email" checked={notifications.emailNotifications} onChange={(v) => set('notifications', { emailNotifications: v })} />} />
              <Row title="Rappels de rendez-vous" description="Rappeler les clients avant leur rendez-vous." notWired control={<Switch label="Rappels de rendez-vous" checked={notifications.bookingReminders} onChange={(v) => set('notifications', { bookingReminders: v })} />} />
              <Row title="Notifications push" description="Notifications navigateur en temps réel." notWired control={<Switch label="Notifications push" checked={notifications.pushNotifications} onChange={(v) => set('notifications', { pushNotifications: v })} />} />
              <Row title="Notifications SMS" description="Nécessite l’intégration d’un fournisseur SMS." control={<Switch label="Notifications SMS" checked={false} onChange={() => {}} disabled />} />
            </div>
          )}

          {activeTab === 'security' && (
            <div className="divide-y divide-gray-100">
              <div className="grid gap-4 px-5 py-5 sm:grid-cols-3 sm:px-6">
                <FieldBlock id="session-timeout" label="Durée de session (h)" notWired help="Actuellement fixée à 24 h dans le code.">
                  <input id="session-timeout" type="number" min="1" value={security.sessionTimeout} onChange={(e) => set('security', { sessionTimeout: parseInt(e.target.value) || 0 })} className={inputClass} />
                </FieldBlock>
                <FieldBlock id="max-attempts" label="Tentatives max." notWired>
                  <input id="max-attempts" type="number" min="1" value={security.maxLoginAttempts} onChange={(e) => set('security', { maxLoginAttempts: parseInt(e.target.value) || 0 })} className={inputClass} />
                </FieldBlock>
                <FieldBlock id="password-length" label="Mot de passe min." notWired>
                  <input id="password-length" type="number" min="6" value={security.passwordMinLength} onChange={(e) => set('security', { passwordMinLength: parseInt(e.target.value) || 0 })} className={inputClass} />
                </FieldBlock>
              </div>
              <Row
                title="Double authentification"
                description="Exiger la 2FA pour les comptes admin."
                notWired
                control={<Switch label="Double authentification" checked={security.twoFactorAuth} onChange={(v) => set('security', { twoFactorAuth: v })} />}
              />
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
