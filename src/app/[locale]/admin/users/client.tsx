'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Users, Search, Shield, Crown, Scissors, User, Mail, Phone, CheckCircle, Edit, Trash2, UserPlus } from 'lucide-react';
import Image from 'next/image';
import { Header } from '@/components/ui/header';
import { Footer } from '@/components/ui/footer';
import { useToast } from '@/hooks/use-toast';
import { useConfirm } from '@/components/dashboard/confirm-dialog';
import { Modal } from '@/components/dashboard/modal';
import { useSettings } from '@/contexts/settings-context';
import {
  PageHeader, PageShell, Tabs, Panel, Badge, EmptyState, Spinner,
  btn, inputClass, labelClass, type BadgeTone,
} from '@/components/dashboard/ui';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  image: string | null;
  emailVerified: Date | null;
  createdAt: string;
}

interface UserManagementClientProps {
  initialUsers: User[];
  locale: string;
  currentUserRole: string;
}

type RoleFilter = 'all' | 'customer' | 'barber' | 'admin' | 'dev';

const ROLES: Record<string, { label: string; tone: BadgeTone; icon: typeof User }> = {
  dev: { label: 'Dev', tone: 'brand', icon: Shield },
  admin: { label: 'Admin', tone: 'brand', icon: Crown },
  barber: { label: 'Coiffeur', tone: 'neutral', icon: Scissors },
  customer: { label: 'Client', tone: 'neutral', icon: User },
};

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });

export function UserManagementClient({ initialUsers, currentUserRole }: UserManagementClientProps) {
  const t = useTranslations('admin');
  const { toast } = useToast();
  const confirm = useConfirm();
  const [users, setUsers] = useState(initialUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const isDev = currentUserRole === 'dev';

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: users.length };
    for (const u of users) c[u.role] = (c[u.role] || 0) + 1;
    return c;
  }, [users]);

  const joinedThisMonth = useMemo(() => {
    const now = new Date();
    return users.filter(u => {
      const d = new Date(u.createdAt);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;
  }, [users]);

  const filteredUsers = users.filter(user => {
    const q = searchTerm.trim().toLowerCase();
    const matchesSearch = !q
      || user.name.toLowerCase().includes(q)
      || user.email.toLowerCase().includes(q)
      || (user.phone && user.phone.includes(q));
    return matchesSearch && (roleFilter === 'all' || user.role === roleFilter);
  });

  const fail = (message: string) => toast({ variant: 'error', title: 'Erreur', description: message });

  const handleDeleteUser = async (user: User) => {
    const ok = await confirm({
      title: `Supprimer ${user.name} ?`,
      description: 'Le compte est supprimé définitivement. Impossible si la personne possède un salon, est coiffeur ou a des réservations.',
      confirmLabel: 'Supprimer',
      tone: 'danger',
    });
    if (!ok) return;
    setBusyId(user.id);
    try {
      const response = await fetch(`/api/admin/users/${user.id}`, { method: 'DELETE' });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) return fail(data.error || 'Impossible de supprimer cet utilisateur');
      setUsers(prev => prev.filter(u => u.id !== user.id));
      toast({ variant: 'success', title: 'Utilisateur supprimé' });
    } catch {
      fail('Impossible de supprimer cet utilisateur');
    } finally {
      setBusyId(null);
    }
  };

  const updateUser = async (userId: string, updates: Partial<User>) => {
    const response = await fetch(`/api/admin/users/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || 'Mise à jour impossible');
    setUsers(prev => prev.map(u => (u.id === userId ? { ...u, ...updates } : u)));
  };

  const handleRoleChange = async (user: User, role: string) => {
    if (role === user.role) return;
    const ok = await confirm({
      title: `Changer le rôle de ${user.name} ?`,
      description: `${ROLES[user.role]?.label ?? user.role} vers ${ROLES[role]?.label ?? role}. Les droits d'accès changent immédiatement.`,
      confirmLabel: 'Changer le rôle',
      tone: role === 'dev' || role === 'admin' ? 'danger' : 'default',
    });
    if (!ok) return;
    setBusyId(user.id);
    try {
      await updateUser(user.id, { role });
      toast({ variant: 'success', title: 'Rôle mis à jour' });
    } catch (err) {
      fail(err instanceof Error ? err.message : 'Mise à jour impossible');
    } finally {
      setBusyId(null);
    }
  };

  const handleSaveEdit = async (updates: Partial<User>) => {
    if (!editingUser) return;
    setSaving(true);
    try {
      await updateUser(editingUser.id, updates);
      setEditingUser(null);
      toast({ variant: 'success', title: 'Utilisateur mis à jour' });
    } catch (err) {
      fail(err instanceof Error ? err.message : 'Mise à jour impossible');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateUser = async (userData: NewUser) => {
    setSaving(true);
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) return fail(data.error || 'Création impossible');
      window.location.reload();
    } catch {
      fail('Création impossible');
    } finally {
      setSaving(false);
    }
  };

  const tabs: { id: RoleFilter; label: string; count: number }[] = [
    { id: 'all', label: 'Tous', count: counts.all || 0 },
    { id: 'customer', label: 'Clients', count: counts.customer || 0 },
    { id: 'barber', label: 'Coiffeurs', count: counts.barber || 0 },
    { id: 'admin', label: 'Admins', count: counts.admin || 0 },
    { id: 'dev', label: 'Devs', count: counts.dev || 0 },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <PageHeader
        title={t('userManagement')}
        description={`${users.length} comptes, dont ${joinedThisMonth} créés ce mois-ci.`}
        actions={
          <button onClick={() => setShowAddModal(true)} className={btn.primary}>
            <UserPlus className="h-4 w-4" />
            {t('addUser')}
          </button>
        }
      >
        <Tabs tabs={tabs} active={roleFilter} onChange={setRoleFilter} />
      </PageHeader>

      <PageShell className="space-y-4">
        <div className="relative max-w-md">
          <label htmlFor="user-search" className="sr-only">{t('searchUsers')}</label>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            id="user-search"
            type="search"
            placeholder={t('searchUsers')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`${inputClass} pl-9`}
          />
        </div>

        <Panel className="overflow-hidden">
          {filteredUsers.length === 0 ? (
            <EmptyState icon={Users} title={t('noUsersFound')} description={t('tryDifferentSearch')} />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-gray-200 bg-gray-50 text-xs font-medium text-gray-500">
                  <tr>
                    <th scope="col" className="px-5 py-3 sm:px-6">Utilisateur</th>
                    <th scope="col" className="px-4 py-3">{t('role')}</th>
                    <th scope="col" className="hidden px-4 py-3 md:table-cell">Contact</th>
                    <th scope="col" className="hidden px-4 py-3 lg:table-cell">{t('joined')}</th>
                    <th scope="col" className="px-4 py-3"><span className="sr-only">{t('actions')}</span></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredUsers.map((user) => {
                    const role = ROLES[user.role] ?? { label: user.role, tone: 'neutral' as BadgeTone, icon: User };
                    const busy = busyId === user.id;
                    return (
                      <tr key={user.id} className="hover:bg-gray-50/60">
                        <td className="px-5 py-3 sm:px-6">
                          <div className="flex items-center gap-3">
                            {user.image ? (
                              <Image src={user.image} alt="" width={36} height={36} className="h-9 w-9 rounded-full object-cover" />
                            ) : (
                              <span className="inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gray-100 text-sm font-medium text-gray-600">
                                {user.name.charAt(0).toUpperCase()}
                              </span>
                            )}
                            <div className="min-w-0">
                              <p className="flex items-center gap-1.5 truncate font-medium text-gray-900">
                                {user.name}
                                {user.emailVerified && (
                                  <CheckCircle className="h-3.5 w-3.5 flex-shrink-0 text-green-600" aria-label="Email vérifié" />
                                )}
                              </p>
                              <p className="truncate text-gray-500 md:hidden">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {isDev ? (
                            <select
                              value={user.role}
                              onChange={(e) => handleRoleChange(user, e.target.value)}
                              disabled={busy}
                              aria-label={`Rôle de ${user.name}`}
                              className="rounded-lg border border-gray-200 bg-white py-1 pl-2 pr-7 text-xs font-medium text-gray-800 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                            >
                              {Object.entries(ROLES).map(([value, r]) => (
                                <option key={value} value={value}>{r.label}</option>
                              ))}
                            </select>
                          ) : (
                            <Badge tone={role.tone} icon={role.icon}>{role.label}</Badge>
                          )}
                        </td>
                        <td className="hidden px-4 py-3 md:table-cell">
                          <p className="flex items-center gap-1.5 text-gray-700">
                            <Mail className="h-3.5 w-3.5 text-gray-400" />
                            {user.email}
                          </p>
                          {user.phone && (
                            <p className="mt-0.5 flex items-center gap-1.5 text-gray-500">
                              <Phone className="h-3.5 w-3.5 text-gray-400" />
                              {user.phone}
                            </p>
                          )}
                        </td>
                        <td className="hidden whitespace-nowrap px-4 py-3 tabular-nums text-gray-500 lg:table-cell">
                          {formatDate(user.createdAt)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-1">
                            <button onClick={() => setEditingUser(user)} className={btn.icon} aria-label={`Modifier ${user.name}`}>
                              <Edit className="h-4 w-4" />
                            </button>
                            <button onClick={() => handleDeleteUser(user)} disabled={busy} className={btn.iconDanger} aria-label={`Supprimer ${user.name}`}>
                              {busy ? <Spinner /> : <Trash2 className="h-4 w-4" />}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Panel>
      </PageShell>

      <Footer />

      {editingUser && (
        <EditUserModal user={editingUser} onClose={() => setEditingUser(null)} onSave={handleSaveEdit} loading={saving} />
      )}
      <AddUserModal open={showAddModal} onClose={() => setShowAddModal(false)} onSave={handleCreateUser} loading={saving} isDev={isDev} />
    </div>
  );
}

function EditUserModal({
  user,
  onClose,
  onSave,
  loading,
}: {
  user: User;
  onClose: () => void;
  onSave: (updates: Partial<User>) => void;
  loading: boolean;
}) {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [phone, setPhone] = useState(user.phone || '');

  return (
    <Modal
      open
      onClose={onClose}
      title="Modifier l’utilisateur"
      footer={
        <>
          <button type="button" onClick={onClose} className={btn.secondary}>Annuler</button>
          <button type="submit" form="edit-user-form" disabled={loading} className={btn.primary}>
            {loading && <Spinner className="h-3.5 w-3.5" />}
            Enregistrer
          </button>
        </>
      }
    >
      <form
        id="edit-user-form"
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          onSave({ name, email, phone: phone || null });
        }}
      >
        <div>
          <label htmlFor="edit-user-name" className={labelClass}>Nom</label>
          <input id="edit-user-name" type="text" value={name} onChange={(e) => setName(e.target.value)} required className={inputClass} />
        </div>
        <div>
          <label htmlFor="edit-user-email" className={labelClass}>Email</label>
          <input id="edit-user-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className={inputClass} />
        </div>
        <div>
          <label htmlFor="edit-user-phone" className={labelClass}>Téléphone</label>
          <input id="edit-user-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} />
        </div>
      </form>
    </Modal>
  );
}

interface NewUser {
  name: string;
  email: string;
  username?: string;
  phone?: string;
  role: string;
  password: string;
}

function AddUserModal({
  open,
  onClose,
  onSave,
  loading,
  isDev,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (userData: NewUser) => void;
  loading: boolean;
  isDev: boolean;
}) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('customer');
  const [password, setPassword] = useState('');
  const { passwordMinLength } = useSettings();

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Nouvel utilisateur"
      footer={
        <>
          <button type="button" onClick={onClose} className={btn.secondary}>Annuler</button>
          <button type="submit" form="add-user-form" disabled={loading} className={btn.primary}>
            {loading && <Spinner className="h-3.5 w-3.5" />}
            Créer le compte
          </button>
        </>
      }
    >
      <form
        id="add-user-form"
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          onSave({ name, email, username: username || undefined, phone: phone || undefined, role, password });
        }}
      >
        <div>
          <label htmlFor="new-user-name" className={labelClass}>Nom <span className="text-red-600" aria-hidden="true">*</span></label>
          <input id="new-user-name" type="text" value={name} onChange={(e) => setName(e.target.value)} required className={inputClass} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="new-user-email" className={labelClass}>Email <span className="text-red-600" aria-hidden="true">*</span></label>
            <input id="new-user-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className={inputClass} />
          </div>
          <div>
            <label htmlFor="new-user-phone" className={labelClass}>Téléphone</label>
            <input id="new-user-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="new-user-username" className={labelClass}>Identifiant</label>
            <input id="new-user-username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Facultatif" className={inputClass} />
          </div>
          <div>
            <label htmlFor="new-user-role" className={labelClass}>Rôle</label>
            <select id="new-user-role" value={role} onChange={(e) => setRole(e.target.value)} className={inputClass}>
              {Object.entries(ROLES)
                .filter(([value]) => isDev || value !== 'dev')
                .map(([value, r]) => (
                  <option key={value} value={value}>{r.label}</option>
                ))}
            </select>
          </div>
        </div>
        <div>
          <label htmlFor="new-user-password" className={labelClass}>Mot de passe <span className="text-red-600" aria-hidden="true">*</span></label>
          <input id="new-user-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={passwordMinLength} className={inputClass} />
          <p className="mt-1.5 text-xs text-gray-500">{passwordMinLength} caractères minimum.</p>
        </div>
      </form>
    </Modal>
  );
}
