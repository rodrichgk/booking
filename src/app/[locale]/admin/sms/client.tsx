'use client';

import { useState, useEffect } from 'react';
import {
  MessageSquare, Send, Users, CreditCard, AlertCircle, CheckCircle,
  RefreshCw, Phone, Search, Filter, ChevronDown, X
} from 'lucide-react';
import Link from 'next/link';
import { Header } from '@/components/ui/header';
import { Footer } from '@/components/ui/footer';

interface User {
  id: string;
  name: string | null;
  phone: string | null;
  role: string;
}

interface Recipient {
  phone: string;
  firstName?: string;
  lastName?: string;
}

const TEMPLATE_VARIABLES = [
  { key: '{Prénom}', label: 'Prénom', description: 'Prénom du contact' },
  { key: '{Nom}', label: 'Nom', description: 'Nom du contact' },
];

interface SMSMarketingClientProps {
  locale: string;
}

export function SMSMarketingClient({ locale }: SMSMarketingClientProps) {
  const [message, setMessage] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [customNumbers, setCustomNumbers] = useState('');
  const [sender, setSender] = useState('Orphelia');
  const [isSending, setIsSending] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [credits, setCredits] = useState<number | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [result, setResult] = useState<{
    success: boolean;
    sent?: number;
    failed?: number;
    error?: string;
    simulated?: boolean;
  } | null>(null);
  const [importedContacts, setImportedContacts] = useState<Recipient[]>([]);

  // Load imported contacts from sessionStorage
  useEffect(() => {
    const stored = sessionStorage.getItem('smsImportedContacts');
    if (stored) {
      try {
        const contacts = JSON.parse(stored);
        setImportedContacts(contacts);
        // Clear after loading
        sessionStorage.removeItem('smsImportedContacts');
      } catch (e) {
        console.error('Error parsing imported contacts:', e);
      }
    }
  }, []);

  // Fetch users with phone numbers
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch('/api/admin/sms/send');
        if (res.ok) {
          const data = await res.json();
          setUsers(data.users || []);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setIsLoadingUsers(false);
      }
    };

    fetchUsers();
  }, []);

  // Fetch credits balance
  useEffect(() => {
    const fetchCredits = async () => {
      try {
        const res = await fetch('/api/admin/sms/credits');
        if (res.ok) {
          const data = await res.json();
          setCredits(data.credits);
        }
      } catch (error) {
        console.error('Error fetching credits:', error);
      }
    };

    fetchCredits();
  }, []);

  const filteredUsers = users.filter(user => {
    const matchesSearch = !searchQuery || 
      user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.phone?.includes(searchQuery);
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const selectAllFiltered = () => {
    const filteredIds = filteredUsers.map(u => u.id);
    setSelectedUsers(prev => {
      const allSelected = filteredIds.every(id => prev.includes(id));
      if (allSelected) {
        return prev.filter(id => !filteredIds.includes(id));
      }
      return [...new Set([...prev, ...filteredIds])];
    });
  };

  const getSelectedRecipients = (): Recipient[] => {
    // Get recipients from selected users
    const userRecipients: Recipient[] = users
      .filter(u => selectedUsers.includes(u.id) && u.phone)
      .map(u => {
        const nameParts = (u.name || '').split(' ');
        return {
          phone: u.phone!,
          firstName: nameParts[0] || '',
          lastName: nameParts.slice(1).join(' ') || '',
        };
      });
    
    // Parse custom numbers - support format: phone or phone,firstName,lastName
    const customRecipients: Recipient[] = customNumbers
      .split(/[\n;]/)
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(line => {
        const parts = line.split(',').map(p => p.trim());
        return {
          phone: parts[0],
          firstName: parts[1] || '',
          lastName: parts[2] || '',
        };
      });

    // Deduplicate by phone number, keeping first occurrence
    const seen = new Set<string>();
    const allRecipients: Recipient[] = [];
    // Priority: imported contacts first, then users, then custom
    for (const r of [...importedContacts, ...userRecipients, ...customRecipients]) {
      if (!seen.has(r.phone)) {
        seen.add(r.phone);
        allRecipients.push(r);
      }
    }
    return allRecipients;
  };

  const insertVariable = (variable: string) => {
    setMessage(prev => prev + variable);
  };

  const handleSend = async (simulate: boolean = false) => {
    const recipients = getSelectedRecipients();
    
    if (recipients.length === 0) {
      setResult({ success: false, error: 'Sélectionnez au moins un destinataire' });
      return;
    }

    if (!message.trim()) {
      setResult({ success: false, error: 'Le message ne peut pas être vide' });
      return;
    }

    if (simulate) {
      setIsSimulating(true);
    } else {
      setIsSending(true);
    }
    setResult(null);

    try {
      const res = await fetch('/api/admin/sms/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          recipients,
          sender: sender || 'Orphelia',
          simulate,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setResult({
          success: data.success,
          sent: data.sent,
          failed: data.failed,
          simulated: data.simulated,
        });
        
        // Refresh credits after sending
        if (!simulate) {
          const creditsRes = await fetch('/api/admin/sms/credits');
          if (creditsRes.ok) {
            const creditsData = await creditsRes.json();
            setCredits(creditsData.credits);
          }
        }
      } else {
        setResult({ success: false, error: data.error });
      }
    } catch (error: any) {
      setResult({ success: false, error: error.message || 'Une erreur est survenue' });
    } finally {
      setIsSending(false);
      setIsSimulating(false);
    }
  };

  const messageLength = message.length;
  const smsCount = Math.ceil(messageLength / 160) || 1;
  const totalRecipients = getSelectedRecipients().length;

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Marketing SMS</h1>
                <p className="text-gray-600 mt-1">Envoyez des campagnes SMS à vos clients</p>
              </div>
              <div className="flex items-center space-x-4">
                {credits !== null && (
                  <div className="flex items-center space-x-2 px-4 py-2 bg-green-50 border border-green-200 rounded-lg">
                    <CreditCard className="w-5 h-5 text-green-600" />
                    <span className="text-green-800 font-medium">{credits} crédits</span>
                  </div>
                )}
                <Link
                  href={`/${locale}/admin/sms/import`}
                  className="px-4 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg font-medium transition-colors"
                >
                  📥 Import CSV
                </Link>
                <Link
                  href={`/${locale}/admin`}
                  className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium"
                >
                  ← Retour
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Imported contacts banner */}
          {importedContacts.length > 0 && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                <div>
                  <p className="text-green-800 font-medium">
                    {importedContacts.length} contacts importés prêts à recevoir votre SMS
                  </p>
                  <p className="text-green-700 text-sm">
                    Les variables {'{Prénom}'} et {'{Nom}'} seront remplacées automatiquement
                  </p>
                </div>
              </div>
              <button
                onClick={() => setImportedContacts([])}
                className="text-green-600 hover:text-green-800 p-1"
                title="Effacer les contacts importés"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Message Composer */}
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <MessageSquare className="w-5 h-5 mr-2 text-primary-600" />
                  Composer le message
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Expéditeur
                    </label>
                    <input
                      type="text"
                      value={sender}
                      onChange={(e) => setSender(e.target.value.slice(0, 11))}
                      placeholder="Orphelia"
                      maxLength={11}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900"
                    />
                    <p className="text-xs text-gray-500 mt-1">Max 11 caractères, doit être enregistré chez SMS Factor</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Message
                    </label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      <span className="text-xs text-gray-500 self-center">Variables :</span>
                      {TEMPLATE_VARIABLES.map((v) => (
                        <button
                          key={v.key}
                          type="button"
                          onClick={() => insertVariable(v.key)}
                          className="px-2 py-1 text-xs bg-purple-100 hover:bg-purple-200 text-purple-700 rounded font-mono transition-colors"
                          title={v.description}
                        >
                          {v.key}
                        </button>
                      ))}
                    </div>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Salut {Prénom}, c'est Maggie ! Grande nouvelle..."
                      rows={6}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>{messageLength} caractères (variables non remplacées)</span>
                      <span>{smsCount} SMS par destinataire</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Numéros supplémentaires (optionnel)
                    </label>
                    <textarea
                      value={customNumbers}
                      onChange={(e) => setCustomNumbers(e.target.value)}
                      placeholder="Format: numéro,prénom,nom (un par ligne)&#10;Ex: 0612345678,Marie,Dupont&#10;0698765432,Jean,Martin"
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Format: numéro,prénom,nom - Le prénom et nom sont utilisés pour les variables {'{Prénom}'} et {'{Nom}'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Summary & Actions */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Résumé</h2>
                
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-gray-900">{totalRecipients}</p>
                    <p className="text-xs text-gray-600">Destinataires</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-gray-900">{smsCount}</p>
                    <p className="text-xs text-gray-600">SMS/personne</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-primary-600">{totalRecipients * smsCount}</p>
                    <p className="text-xs text-gray-600">Total SMS</p>
                  </div>
                </div>

                {result && (
                  <div className={`mb-4 p-4 rounded-lg ${result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                    <div className="flex items-start">
                      {result.success ? (
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 mr-2" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-2" />
                      )}
                      <div>
                        {result.success ? (
                          <>
                            <p className="text-green-800 font-medium">
                              {result.simulated ? 'Simulation réussie!' : 'Campagne envoyée!'}
                            </p>
                            <p className="text-green-700 text-sm">
                              {result.sent} SMS envoyés{result.failed ? `, ${result.failed} échoués` : ''}
                            </p>
                          </>
                        ) : (
                          <p className="text-red-800">{result.error}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex space-x-3">
                  <button
                    onClick={() => handleSend(true)}
                    disabled={isSimulating || isSending || totalRecipients === 0}
                    className="flex-1 flex items-center justify-center px-4 py-3 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 text-gray-700 disabled:text-gray-400 rounded-lg font-medium transition-colors"
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${isSimulating ? 'animate-spin' : ''}`} />
                    {isSimulating ? 'Simulation...' : 'Simuler'}
                  </button>
                  <button
                    onClick={() => handleSend(false)}
                    disabled={isSending || isSimulating || totalRecipients === 0}
                    className="flex-1 flex items-center justify-center px-4 py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 text-white rounded-lg font-medium transition-colors"
                  >
                    <Send className={`w-4 h-4 mr-2 ${isSending ? 'animate-pulse' : ''}`} />
                    {isSending ? 'Envoi...' : 'Envoyer'}
                  </button>
                </div>
              </div>
            </div>

            {/* Recipients Selection */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Users className="w-5 h-5 mr-2 text-primary-600" />
                Sélectionner les destinataires
                <span className="ml-2 px-2 py-0.5 bg-primary-100 text-primary-700 text-sm rounded-full">
                  {selectedUsers.length} sélectionnés
                </span>
              </h2>

              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Rechercher..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900"
                  />
                </div>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900"
                >
                  <option value="all">Tous les rôles</option>
                  <option value="customer">Clients</option>
                  <option value="barber">Coiffeurs</option>
                  <option value="admin">Admins</option>
                </select>
              </div>

              {/* Select All */}
              <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-200">
                <button
                  onClick={selectAllFiltered}
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  {filteredUsers.every(u => selectedUsers.includes(u.id)) 
                    ? 'Désélectionner tout' 
                    : 'Sélectionner tout'}
                </button>
                <span className="text-sm text-gray-500">
                  {filteredUsers.length} utilisateurs avec téléphone
                </span>
              </div>

              {/* Users List */}
              <div className="max-h-[400px] overflow-y-auto space-y-2">
                {isLoadingUsers ? (
                  <div className="text-center py-8 text-gray-500">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
                    Chargement...
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Phone className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    Aucun utilisateur trouvé
                  </div>
                ) : (
                  filteredUsers.map((user) => (
                    <label
                      key={user.id}
                      className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedUsers.includes(user.id)
                          ? 'bg-primary-50 border border-primary-200'
                          : 'bg-gray-50 hover:bg-gray-100 border border-transparent'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.id)}
                        onChange={() => toggleUserSelection(user.id)}
                        className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                      />
                      <div className="ml-3 flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {user.name || 'Sans nom'}
                        </p>
                        <p className="text-xs text-gray-500">{user.phone}</p>
                      </div>
                      <span className={`px-2 py-0.5 text-xs rounded-full ${
                        user.role === 'customer' ? 'bg-blue-100 text-blue-700' :
                        user.role === 'barber' ? 'bg-purple-100 text-purple-700' :
                        user.role === 'admin' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {user.role}
                      </span>
                    </label>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Info Box */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
            <div className="flex items-start">
              <AlertCircle className="w-6 h-6 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h3 className="text-blue-800 font-medium">Informations importantes</h3>
                <ul className="mt-2 text-sm text-blue-700 space-y-1">
                  <li>• Un SMS standard contient 160 caractères. Au-delà, le message sera divisé en plusieurs SMS.</li>
                  <li>• L'expéditeur doit être enregistré sur votre compte SMS Factor.</li>
                  <li>• Utilisez "Simuler" pour tester sans consommer de crédits.</li>
                  <li>• Les numéros français doivent commencer par 06 ou 07.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
