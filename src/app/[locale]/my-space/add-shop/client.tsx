'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ArrowLeft, AlertCircle, CreditCard } from 'lucide-react';
import Link from 'next/link';
import {
  Panel, PanelBody, Notice, Spinner, btn, inputClass, labelClass, backLinkClass, formatEuro,
} from '@/components/dashboard/ui';

interface AddShopClientProps {
  locale: string;
  subscriptionPrice: number;
}

export function AddShopClient({ locale, subscriptionPrice }: AddShopClientProps) {
  const router = useRouter();
  const t = useTranslations('mySpace');
  const tCommon = useTranslations('common');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    phone: '',
    email: '',
    website: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/barbershops/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json().catch(() => ({}));

      if (response.ok) {
        // Next step: subscribe so the new shop becomes visible.
        router.push(`/${locale}/subscription?shopId=${data.barbershopId}`);
      } else {
        setError(data.error || t('createShopError'));
      }
    } catch (err) {
      console.error('Error creating barbershop:', err);
      setError(t('createShopError'));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const field = (name: keyof typeof formData, label: string, opts: { type?: string; required?: boolean; placeholder?: string; autoComplete?: string } = {}) => (
    <div>
      <label htmlFor={`shop-${name}`} className={labelClass}>
        {label}
        {opts.required && <span className="text-red-600" aria-hidden="true"> *</span>}
      </label>
      <input
        id={`shop-${name}`}
        type={opts.type || 'text'}
        name={name}
        value={formData[name]}
        onChange={handleChange}
        required={opts.required}
        placeholder={opts.placeholder}
        autoComplete={opts.autoComplete}
        className={inputClass}
      />
    </div>
  );

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex items-start gap-3">
        <Link href={`/${locale}/my-space`} className={backLinkClass} aria-label={t('backToProfile')}>
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">{t('createBarbershop')}</h1>
          <p className="mt-1 text-sm text-gray-600">{t('createYourBarbershop')}</p>
        </div>
      </div>

      <div className="space-y-4">
        <Notice tone="brand" icon={CreditCard} title={`Abonnement : ${formatEuro(subscriptionPrice)} par mois et par salon`}>
          Vous réglerez l’abonnement à l’étape suivante. Le salon devient visible dès le paiement.
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
                <legend className="font-display text-base font-semibold text-gray-900">Le salon</legend>
                {field('name', t('shopName'), { required: true, placeholder: t('shopNamePlaceholder'), autoComplete: 'organization' })}
                <div>
                  <label htmlFor="shop-description" className={labelClass}>{t('shopDescription')}</label>
                  <textarea
                    id="shop-description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={4}
                    className={`${inputClass} resize-none`}
                    placeholder={t('shopDescriptionPlaceholder')}
                  />
                </div>
              </fieldset>

              <fieldset className="space-y-4">
                <legend className="font-display text-base font-semibold text-gray-900">Adresse</legend>
                {field('address', t('shopAddress'), { required: true, placeholder: t('shopAddressPlaceholder'), autoComplete: 'street-address' })}
                <div className="grid gap-4 sm:grid-cols-[1fr_1fr_8rem]">
                  {field('city', t('shopCity'), { required: true, placeholder: t('shopCityPlaceholder'), autoComplete: 'address-level2' })}
                  {field('state', 'Région', { placeholder: 'Île-de-France', autoComplete: 'address-level1' })}
                  {field('zipCode', 'Code postal', { placeholder: '75018', autoComplete: 'postal-code' })}
                </div>
              </fieldset>

              <fieldset className="space-y-4">
                <legend className="font-display text-base font-semibold text-gray-900">Contact</legend>
                <div className="grid gap-4 sm:grid-cols-2">
                  {field('phone', t('shopPhone'), { type: 'tel', placeholder: t('shopPhonePlaceholder'), autoComplete: 'tel' })}
                  {field('email', t('shopEmail'), { type: 'email', placeholder: t('shopEmailPlaceholder'), autoComplete: 'email' })}
                </div>
                {field('website', 'Site web', { type: 'url', placeholder: 'https://www.monsalon.fr', autoComplete: 'url' })}
              </fieldset>
            </PanelBody>

            <div className="flex flex-col-reverse gap-2 border-t border-gray-100 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
              <Link href={`/${locale}/my-space`} className={btn.secondary}>
                {tCommon('cancel')}
              </Link>
              <button type="submit" disabled={loading} className={btn.primary}>
                {loading && <Spinner className="h-3.5 w-3.5" />}
                {loading ? t('creatingShop') : t('createBarbershop')}
              </button>
            </div>
          </form>
        </Panel>
      </div>
    </div>
  );
}
