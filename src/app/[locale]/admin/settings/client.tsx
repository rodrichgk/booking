'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { 
  Settings, Globe, CreditCard, Mail, Bell, Shield, Palette, Zap,
  Save, RotateCcw, CheckCircle, AlertTriangle, Eye, EyeOff, Store, Star, Plus, X, GripVertical
} from 'lucide-react';
import Link from 'next/link';
import { Header } from '@/components/ui/header';
import { Footer } from '@/components/ui/footer';
import { useToast } from '@/hooks/use-toast';

interface SettingsData {
  general: {
    siteName: string;
    siteUrl: string;
    defaultLanguage: string;
    timezone: string;
    maintenanceMode: boolean;
  };
  payment: {
    subscriptionPrice: number;
    currency: string;
    paymentProvider: string;
    autoRenewal: boolean;
  };
  email: {
    smtpHost: string;
    smtpPort: number;
    senderEmail: string;
    senderName: string;
  };
  notifications: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    pushNotifications: boolean;
    bookingReminders: boolean;
  };
  security: {
    twoFactorAuth: boolean;
    sessionTimeout: number;
    maxLoginAttempts: number;
    passwordMinLength: number;
  };
  appearance: {
    primaryColor: string;
    darkMode: boolean;
    compactMode: boolean;
    featuredMode: 'manual' | 'popularity' | 'rating';
    featuredBarbershopIds: string[];
  };
}

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

export function SettingsClient({ 
  settings: initialSettings, 
  locale, 
  currentUserRole 
}: SettingsClientProps) {
  const { toast } = useToast();
  const [settings, setSettings] = useState(initialSettings);
  const [activeTab, setActiveTab] = useState('general');
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [barbershops, setBarbershops] = useState<Barbershop[]>([]);
  const [loadingShops, setLoadingShops] = useState(false);

  // Load barbershops for appearance settings
  useEffect(() => {
    const fetchBarbershops = async () => {
      setLoadingShops(true);
      try {
        const res = await fetch('/api/barbershops');
        const data = await res.json();
        setBarbershops(data.barbershops || []);
      } catch (error) {
        console.error('Error fetching barbershops:', error);
      } finally {
        setLoadingShops(false);
      }
    };
    fetchBarbershops();
  }, []);

  const tabs = [
    { id: 'general', label: 'General', icon: Globe },
    { id: 'payment', label: 'Payment', icon: CreditCard },
    { id: 'email', label: 'Email', icon: Mail },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'appearance', label: 'Appearance', icon: Palette },
  ];

  const handleSave = async (section: string) => {
    setSaving(true);
    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: section,
          value: settings[section as keyof SettingsData],
          description: `${section} settings`
        })
      });
      
      if (response.ok) {
        toast({
          variant: 'success',
          title: 'Succès',
          description: 'Paramètres enregistrés avec succès',
        });
      } else {
        const data = await response.json();
        toast({
          variant: 'error',
          title: 'Erreur',
          description: data.error || 'Erreur lors de l\'enregistrement',
        });
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast({
        variant: 'error',
        title: 'Erreur',
        description: 'Une erreur est survenue',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = (section: string) => {
    setSettings({
      ...settings,
      [section]: initialSettings[section as keyof SettingsData]
    });
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Site Name</label>
                <input
                  type="text"
                  value={settings.general.siteName}
                  onChange={(e) => setSettings({
                    ...settings,
                    general: { ...settings.general, siteName: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Site URL</label>
                <input
                  type="url"
                  value={settings.general.siteUrl}
                  onChange={(e) => setSettings({
                    ...settings,
                    general: { ...settings.general, siteUrl: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Default Language</label>
                <select
                  value={settings.general.defaultLanguage}
                  onChange={(e) => setSettings({
                    ...settings,
                    general: { ...settings.general, defaultLanguage: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="fr">French</option>
                  <option value="en">English</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
                <select
                  value={settings.general.timezone}
                  onChange={(e) => setSettings({
                    ...settings,
                    general: { ...settings.general, timezone: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="Europe/Paris">Europe/Paris</option>
                  <option value="Europe/London">Europe/London</option>
                  <option value="America/New_York">America/New_York</option>
                </select>
              </div>
            </div>
            <div className="flex items-center justify-between py-3 border-t border-gray-200">
              <div>
                <h3 className="text-sm font-medium text-gray-900">Maintenance Mode</h3>
                <p className="text-sm text-gray-500">Temporarily disable the site for maintenance</p>
              </div>
              <button
                onClick={() => setSettings({
                  ...settings,
                  general: { ...settings.general, maintenanceMode: !settings.general.maintenanceMode }
                })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.general.maintenanceMode ? 'bg-red-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.general.maintenanceMode ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        );

      case 'payment':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subscription Price (€/month)</label>
                <input
                  type="number"
                  step="0.1"
                  value={settings.payment.subscriptionPrice}
                  onChange={(e) => setSettings({
                    ...settings,
                    payment: { ...settings.payment, subscriptionPrice: parseFloat(e.target.value) }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                <select
                  value={settings.payment.currency}
                  onChange={(e) => setSettings({
                    ...settings,
                    payment: { ...settings.payment, currency: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="EUR">EUR (€)</option>
                  <option value="USD">USD ($)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-t border-gray-200">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Auto-Renewal</h3>
                  <p className="text-sm text-gray-500">Automatically renew subscriptions</p>
                </div>
                <button
                  onClick={() => setSettings({
                    ...settings,
                    payment: { ...settings.payment, autoRenewal: !settings.payment.autoRenewal }
                  })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.payment.autoRenewal ? 'bg-primary-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.payment.autoRenewal ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        );

      case 'security':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Session Timeout (hours)</label>
                <input
                  type="number"
                  value={settings.security.sessionTimeout}
                  onChange={(e) => setSettings({
                    ...settings,
                    security: { ...settings.security, sessionTimeout: parseInt(e.target.value) }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Max Login Attempts</label>
                <input
                  type="number"
                  value={settings.security.maxLoginAttempts}
                  onChange={(e) => setSettings({
                    ...settings,
                    security: { ...settings.security, maxLoginAttempts: parseInt(e.target.value) }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password Min Length</label>
                <input
                  type="number"
                  value={settings.security.passwordMinLength}
                  onChange={(e) => setSettings({
                    ...settings,
                    security: { ...settings.security, passwordMinLength: parseInt(e.target.value) }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-t border-gray-200">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Two-Factor Authentication</h3>
                  <p className="text-sm text-gray-500">Require 2FA for admin accounts</p>
                </div>
                <button
                  onClick={() => setSettings({
                    ...settings,
                    security: { ...settings.security, twoFactorAuth: !settings.security.twoFactorAuth }
                  })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.security.twoFactorAuth ? 'bg-primary-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.security.twoFactorAuth ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        );

      case 'appearance':
        return (
          <div className="space-y-6">
            {/* Featured Barbershops Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Salons en Vedette / Featured Barbershops</h3>
              <p className="text-sm text-gray-600 mb-4">
                Choisissez comment les salons sont affichés sur la page d'accueil / Choose how barbershops are displayed on the homepage
              </p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mode d'affichage / Display Mode</label>
                  <select
                    value={settings.appearance.featuredMode}
                    onChange={(e) => setSettings({
                      ...settings,
                      appearance: { ...settings.appearance, featuredMode: e.target.value as 'manual' | 'popularity' | 'rating' }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="manual">Manuel / Manual - Sélection manuelle des salons</option>
                    <option value="popularity">Popularité / Popularity - Par nombre de réservations</option>
                    <option value="rating">Note / Rating - Par meilleure note</option>
                  </select>
                </div>

                {settings.appearance.featuredMode === 'manual' && (
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">Salons sélectionnés / Selected Barbershops</h4>
                    
                    {/* Selected shops */}
                    <div className="space-y-2 mb-4">
                      {settings.appearance.featuredBarbershopIds.length === 0 ? (
                        <p className="text-sm text-gray-500 italic">Aucun salon sélectionné / No barbershops selected</p>
                      ) : (
                        settings.appearance.featuredBarbershopIds.map((shopId, index) => {
                          const shop = barbershops.find(s => s.id === shopId);
                          return (
                            <div key={shopId} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                              <div className="flex items-center space-x-3">
                                <GripVertical className="w-4 h-4 text-gray-400" />
                                <Store className="w-5 h-5 text-primary-600" />
                                <div>
                                  <p className="font-medium text-gray-900">{shop?.name || 'Unknown'}</p>
                                  <p className="text-sm text-gray-500">{shop?.city}</p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                {shop?.rating && (
                                  <div className="flex items-center text-sm text-yellow-600">
                                    <Star className="w-4 h-4 fill-current" />
                                    <span className="ml-1">{shop.rating}</span>
                                  </div>
                                )}
                                <button
                                  onClick={() => setSettings({
                                    ...settings,
                                    appearance: {
                                      ...settings.appearance,
                                      featuredBarbershopIds: settings.appearance.featuredBarbershopIds.filter(id => id !== shopId)
                                    }
                                  })}
                                  className="p-1 text-red-500 hover:bg-red-50 rounded"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>

                    {/* Add shop dropdown */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Ajouter un salon / Add a barbershop</label>
                      <select
                        onChange={(e) => {
                          if (e.target.value && !settings.appearance.featuredBarbershopIds.includes(e.target.value)) {
                            setSettings({
                              ...settings,
                              appearance: {
                                ...settings.appearance,
                                featuredBarbershopIds: [...settings.appearance.featuredBarbershopIds, e.target.value]
                              }
                            });
                          }
                          e.target.value = '';
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        defaultValue=""
                      >
                        <option value="" disabled>Sélectionner un salon...</option>
                        {barbershops
                          .filter(shop => !settings.appearance.featuredBarbershopIds.includes(shop.id))
                          .map(shop => (
                            <option key={shop.id} value={shop.id}>
                              {shop.name} - {shop.city} {shop.rating ? `(★${shop.rating})` : ''}
                            </option>
                          ))
                        }
                      </select>
                    </div>
                  </div>
                )}

                {settings.appearance.featuredMode !== 'manual' && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800">
                      {settings.appearance.featuredMode === 'popularity' 
                        ? 'Les salons seront classés automatiquement par nombre de réservations / Barbershops will be automatically sorted by booking count'
                        : 'Les salons seront classés automatiquement par note moyenne / Barbershops will be automatically sorted by average rating'
                      }
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Style / Theme</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Couleur Principale / Primary Color</label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="color"
                      value={settings.appearance.primaryColor}
                      onChange={(e) => setSettings({
                        ...settings,
                        appearance: { ...settings.appearance, primaryColor: e.target.value }
                      })}
                      className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={settings.appearance.primaryColor}
                      onChange={(e) => setSettings({
                        ...settings,
                        appearance: { ...settings.appearance, primaryColor: e.target.value }
                      })}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-4 mt-6">
                <div className="flex items-center justify-between py-3 border-t border-gray-200">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Mode Sombre / Dark Mode</h3>
                    <p className="text-sm text-gray-500">Activer le thème sombre / Enable dark theme</p>
                  </div>
                  <button
                    onClick={() => setSettings({
                      ...settings,
                      appearance: { ...settings.appearance, darkMode: !settings.appearance.darkMode }
                    })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.appearance.darkMode ? 'bg-primary-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.appearance.darkMode ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                <div className="flex items-center justify-between py-3 border-t border-gray-200">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Mode Compact / Compact Mode</h3>
                    <p className="text-sm text-gray-500">Affichage plus dense / Denser display</p>
                  </div>
                  <button
                    onClick={() => setSettings({
                      ...settings,
                      appearance: { ...settings.appearance, compactMode: !settings.appearance.compactMode }
                    })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.appearance.compactMode ? 'bg-primary-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.appearance.compactMode ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center py-12">
            <Settings className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Settings coming soon</h3>
            <p className="mt-1 text-sm text-gray-500">This section is under development</p>
          </div>
        );
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
              <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
              <p className="text-gray-600 mt-1">System configuration and settings</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="w-5 h-5 mr-2" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="p-6">
            {renderTabContent()}
            
            {/* Actions */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => handleReset(activeTab)}
                  className="flex items-center px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg font-medium transition-colors"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset to Default
                </button>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => handleSave(activeTab)}
                  disabled={saving}
                  className="flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
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
