'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, AlertCircle, Info } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { Panel, PanelBody, Notice, Spinner, btn, inputClass, labelClass, backLinkClass } from '@/components/dashboard/ui';

interface AddBarbershopClientProps {
  locale: string;
  userRole: string;
}

type FormData = {
  name: string;
  description: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  website: string;
  ownerEmail: string;
};

export function AddBarbershopClient({ locale }: AddBarbershopClientProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    address: '',
    city: '',
    phone: '',
    email: '',
    website: '',
    ownerEmail: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/barbershops/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json().catch(() => ({}));

      if (response.ok) {
        toast({ variant: 'success', title: 'Salon créé', description: 'Il reste masqué jusqu’au paiement de l’abonnement.' });
        router.push(`/${locale}/admin/barbershops`);
      } else {
        setError(data.error || 'Impossible de créer le salon.');
      }
    } catch (err) {
      console.error('Error creating barbershop:', err);
      setError('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const field = (name: keyof FormData, label: string, opts: { type?: string; required?: boolean; placeholder?: string; help?: string } = {}) => (
    <div>
      <label htmlFor={`new-shop-${name}`} className={labelClass}>
        {label}
        {opts.required && <span className="text-red-600" aria-hidden="true"> *</span>}
      </label>
      <input
        id={`new-shop-${name}`}
        type={opts.type || 'text'}
        name={name}
        value={formData[name]}
        onChange={handleChange}
        required={opts.required}
        placeholder={opts.placeholder}
        aria-describedby={opts.help ? `new-shop-${name}-help` : undefined}
        className={inputClass}
      />
      {opts.help && <p id={`new-shop-${name}-help`} className="mt-1.5 text-xs text-gray-500">{opts.help}</p>}
    </div>
  );

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex items-start gap-3">
        <Link href={`/${locale}/admin/barbershops`} className={backLinkClass} aria-label="Retour aux salons">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">Nouveau salon</h1>
          <p className="mt-1 text-sm text-gray-600">Créer un salon au nom d’un propriétaire existant.</p>
        </div>
      </div>

      <div className="space-y-4">
        <Notice tone="neutral" icon={Info}>
          Le salon est créé masqué. Il devient visible une fois l’abonnement payé ou activé manuellement depuis la liste des salons.
        </Notice>

        {error && (
          <Notice tone="danger" icon={AlertCircle}>
            <span role="alert">{error}</span>
          </Notice>
        )}

        <Panel>
          <form onSubmit={handleSubmit}>
            <PanelBody className="space-y-8">
              <fieldset className="space-y-4">
                <legend className="font-display text-base font-semibold text-gray-900">Propriétaire</legend>
                {field('ownerEmail', 'Email du propriétaire', {
                  type: 'email',
                  required: true,
                  placeholder: 'proprietaire@exemple.fr',
                  help: 'La personne doit déjà avoir un compte sur la plateforme.',
                })}
              </fieldset>

              <fieldset className="space-y-4">
                <legend className="font-display text-base font-semibold text-gray-900">Le salon</legend>
                {field('name', 'Nom du salon', { required: true, placeholder: 'Ex : Salon Kitoko' })}
                <div>
                  <label htmlFor="new-shop-description" className={labelClass}>Description</label>
                  <textarea
                    id="new-shop-description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={4}
                    className={`${inputClass} resize-none`}
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  {field('address', 'Adresse', { required: true, placeholder: '42 rue Myrha' })}
                  {field('city', 'Ville', { required: true, placeholder: 'Paris' })}
                </div>
              </fieldset>

              <fieldset className="space-y-4">
                <legend className="font-display text-base font-semibold text-gray-900">Contact</legend>
                <div className="grid gap-4 sm:grid-cols-2">
                  {field('phone', 'Téléphone', { type: 'tel', placeholder: '01 42 57 18 93' })}
                  {field('email', 'Email', { type: 'email', placeholder: 'contact@salon.fr' })}
                </div>
                {field('website', 'Site web', { type: 'url', placeholder: 'https://www.salon.fr' })}
              </fieldset>
            </PanelBody>

            <div className="flex flex-col-reverse gap-2 border-t border-gray-100 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
              <Link href={`/${locale}/admin/barbershops`} className={btn.secondary}>
                Annuler
              </Link>
              <button type="submit" disabled={loading} className={btn.primary}>
                {loading && <Spinner className="h-3.5 w-3.5" />}
                Créer le salon
              </button>
            </div>
          </form>
        </Panel>
      </div>
    </div>
  );
}
