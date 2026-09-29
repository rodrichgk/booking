'use client';

import { useState, useEffect } from 'react';
import {
  MessageSquare, Send, Users, CreditCard, AlertCircle, CheckCircle, Phone, Search, Upload, ArrowLeft, FlaskConical,
} from 'lucide-react';
import Link from 'next/link';
import { Header } from '@/components/ui/header';
import { Footer } from '@/components/ui/footer';
import { useConfirm } from '@/components/dashboard/confirm-dialog';
import {
  PageHeader, PageShell, Panel, PanelHeader, PanelBody, StatGrid, Stat, Badge, Notice, EmptyState, Spinner,
  btn, inputClass, labelClass, backLinkClass,
} from '@/components/dashboard/ui';

const ROLE_LABELS: Record<string, string> = { customer: 'Client', barber: 'Coiffeur', admin: 'Admin', dev: 'Dev' };

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
  const confirm = useConfirm();
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
  const totalSms = totalRecipients * smsCount;
  const allFilteredSelected = filteredUsers.length > 0 && filteredUsers.every(u => selectedUsers.includes(u.id));
  const notEnoughCredits = credits !== null && totalSms > credits;

  const confirmAndSend = async () => {
    const ok = await confirm({
      title: `Envoyer ${totalSms.toLocaleString('fr-FR')} SMS ?`,
      description: `${totalRecipients} destinataire${totalRecipients > 1 ? 's' : ''}, ${smsCount} SMS chacun. Les crédits sont débités immédiatement et l’envoi ne peut pas être annulé.`,
      confirmLabel: 'Envoyer la campagne',
      tone: 'danger',
    });
    if (ok) handleSend(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <PageHeader
        title="Campagnes SMS"
        description="Envoyez un SMS à vos clients via SMS Factor."
        back={
          <Link href={`/${locale}/my-space`} className={backLinkClass} aria-label="Retour">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        }
        actions={
          <>
            {credits !== null && (
              <Badge tone={credits > 0 ? 'neutral' : 'danger'} icon={CreditCard}>
                {credits.toLocaleString('fr-FR')} crédits
              </Badge>
            )}
            <Link href={`/${locale}/admin/sms/import`} className={btn.secondary}>
              <Upload className="h-4 w-4" />
              Importer un CSV
            </Link>
          </>
        }
      />

      <PageShell className="space-y-6">
        {importedContacts.length > 0 && (
          <Notice
            tone="success"
            icon={CheckCircle}
            title={`${importedContacts.length} contacts importés ajoutés aux destinataires`}
            action={
              <button onClick={() => setImportedContacts([])} className={`${btn.ghost} ${btn.sm}`}>
                Retirer
              </button>
            }
          >
            Les variables {'{Prénom}'} et {'{Nom}'} seront remplacées pour chacun.
          </Notice>
        )}

        <div className="grid items-start gap-6 lg:grid-cols-2">
          <div className="space-y-6">
            <Panel>
              <PanelHeader icon={MessageSquare} title="Message" />
              <PanelBody className="space-y-4">
                <div>
                  <label htmlFor="sms-sender" className={labelClass}>Expéditeur</label>
                  <input
                    id="sms-sender"
                    type="text"
                    value={sender}
                    onChange={(e) => setSender(e.target.value.slice(0, 11))}
                    placeholder="Orphelia"
                    maxLength={11}
                    className={inputClass}
                    aria-describedby="sms-sender-help"
                  />
                  <p id="sms-sender-help" className="mt-1.5 text-xs text-gray-500">11 caractères maximum, enregistré chez SMS Factor.</p>
                </div>

                <div>
                  <div className="mb-1.5 flex items-center justify-between gap-2">
                    <label htmlFor="sms-message" className="text-sm font-medium text-gray-800">Texte</label>
                    <div className="flex gap-1">
                      {TEMPLATE_VARIABLES.map((v) => (
                        <button
                          key={v.key}
                          type="button"
                          onClick={() => insertVariable(v.key)}
                          className="rounded-md border border-gray-200 bg-white px-2 py-0.5 font-mono text-xs text-gray-700 transition-colors hover:border-primary-300 hover:text-primary-700"
                          title={`Insérer : ${v.description}`}
                        >
                          {v.key}
                        </button>
                      ))}
                    </div>
                  </div>
                  <textarea
                    id="sms-message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Bonjour {Prénom}, votre salon vous offre -20 % cette semaine..."
                    rows={6}
                    className={`${inputClass} resize-none`}
                  />
                  <div className="mt-1.5 flex justify-between text-xs tabular-nums text-gray-500">
                    <span>{messageLength} caractères, variables non remplacées</span>
                    <span className={smsCount > 1 ? 'font-medium text-amber-700' : ''}>{smsCount} SMS par destinataire</span>
                  </div>
                </div>

                <div>
                  <label htmlFor="sms-custom" className={labelClass}>Numéros supplémentaires</label>
                  <textarea
                    id="sms-custom"
                    value={customNumbers}
                    onChange={(e) => setCustomNumbers(e.target.value)}
                    placeholder={'0612345678,Marie,Dupont\n0698765432,Jean,Martin'}
                    rows={3}
                    className={`${inputClass} resize-none font-mono`}
                    aria-describedby="sms-custom-help"
                  />
                  <p id="sms-custom-help" className="mt-1.5 text-xs text-gray-500">
                    Un par ligne : numéro, prénom, nom. Prénom et nom sont facultatifs.
                  </p>
                </div>
              </PanelBody>
            </Panel>

            <Panel>
              <StatGrid columns={3} className="rounded-b-none rounded-t-xl border-0 border-b">
                <Stat label="Destinataires" value={totalRecipients} />
                <Stat label="SMS chacun" value={smsCount} />
                <Stat label="Total" value={totalSms} tone={notEnoughCredits ? 'attention' : 'default'} hint={notEnoughCredits ? 'Crédits insuffisants' : undefined} />
              </StatGrid>
              <PanelBody className="space-y-4">
                {result && (
                  <Notice tone={result.success ? 'success' : 'danger'} icon={result.success ? CheckCircle : AlertCircle} title={result.success ? (result.simulated ? 'Simulation réussie' : 'Campagne envoyée') : undefined}>
                    {result.success ? `${result.sent} SMS envoyés${result.failed ? `, ${result.failed} en échec` : ''}.` : result.error}
                  </Notice>
                )}
                <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                  <button onClick={() => handleSend(true)} disabled={isSimulating || isSending || totalRecipients === 0} className={btn.secondary}>
                    {isSimulating ? <Spinner className="h-3.5 w-3.5" /> : <FlaskConical className="h-4 w-4" />}
                    Simuler sans envoyer
                  </button>
                  <button onClick={confirmAndSend} disabled={isSending || isSimulating || totalRecipients === 0 || !message.trim()} className={btn.primary}>
                    {isSending ? <Spinner className="h-3.5 w-3.5" /> : <Send className="h-4 w-4" />}
                    Envoyer
                  </button>
                </div>
                <p className="text-xs text-gray-500">
                  Un SMS fait 160 caractères ; au-delà il est découpé. La simulation ne consomme aucun crédit.
                </p>
              </PanelBody>
            </Panel>
          </div>

          <Panel>
            <PanelHeader
              icon={Users}
              title="Destinataires"
              description={`${selectedUsers.length} utilisateur${selectedUsers.length > 1 ? 's' : ''} sélectionné${selectedUsers.length > 1 ? 's' : ''}`}
            />
            <div className="space-y-3 border-b border-gray-100 px-5 py-4 sm:px-6">
              <div className="flex flex-col gap-2 sm:flex-row">
                <div className="relative flex-1">
                  <label htmlFor="sms-search" className="sr-only">Rechercher</label>
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    id="sms-search"
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Nom ou numéro"
                    className={`${inputClass} pl-9`}
                  />
                </div>
                <label htmlFor="sms-role" className="sr-only">Rôle</label>
                <select id="sms-role" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className={`${inputClass} sm:w-44`}>
                  <option value="all">Tous les rôles</option>
                  <option value="customer">Clients</option>
                  <option value="barber">Coiffeurs</option>
                  <option value="admin">Admins</option>
                </select>
              </div>
              <div className="flex items-center justify-between text-sm">
                <button onClick={selectAllFiltered} disabled={filteredUsers.length === 0} className="font-medium text-primary-700 hover:text-primary-800 disabled:text-gray-400">
                  {allFilteredSelected ? 'Tout désélectionner' : 'Tout sélectionner'}
                </button>
                <span className="tabular-nums text-gray-500">{filteredUsers.length} avec un téléphone</span>
              </div>
            </div>

            <div className="max-h-[32rem] overflow-y-auto">
              {isLoadingUsers ? (
                <div className="flex justify-center py-10"><Spinner className="h-5 w-5 text-gray-400" /></div>
              ) : filteredUsers.length === 0 ? (
                <EmptyState icon={Phone} title="Aucun utilisateur trouvé" description="Seuls les comptes avec un numéro de téléphone apparaissent ici." />
              ) : (
                <ul className="divide-y divide-gray-100">
                  {filteredUsers.map((user) => {
                    const checked = selectedUsers.includes(user.id);
                    return (
                      <li key={user.id}>
                        <label className={`flex cursor-pointer items-center gap-3 px-5 py-2.5 transition-colors sm:px-6 ${checked ? 'bg-primary-50/60' : 'hover:bg-gray-50'}`}>
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleUserSelection(user.id)}
                            className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                          />
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-medium text-gray-900">{user.name || 'Sans nom'}</span>
                            <span className="block font-mono text-xs text-gray-500">{user.phone}</span>
                          </span>
                          <Badge>{ROLE_LABELS[user.role] ?? user.role}</Badge>
                        </label>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </Panel>
        </div>
      </PageShell>

      <Footer />
    </div>
  );
}
