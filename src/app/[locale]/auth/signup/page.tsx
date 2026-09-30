'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { User, Scissors } from 'lucide-react';
import { AuthShell, AuthField, SubmitButton, GoogleButton, Divider, FormAlert, authLinkClass } from '@/components/auth/auth-ui';
import { Link } from '@/routing';
import { useToast } from '@/hooks/use-toast';
import { useSettings } from '@/contexts/settings-context';

interface SignUpFormData {
  name: string;
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
  phone: string;
  role: 'customer' | 'barber';
}

export default function SignUpPage() {
  const { toast } = useToast();
  const router = useRouter();
  const t = useTranslations('auth');
  const tCommon = useTranslations('common');
  const tErrors = useTranslations('errors');
  const ts = useTranslations('site.signup');
  // Configurable in admin Settings > Security; the API enforces the same value.
  const { passwordMinLength } = useSettings();
  
  const [formData, setFormData] = useState<SignUpFormData>({
    name: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: 'customer',
  });
  const [errors, setErrors] = useState<Partial<SignUpFormData>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name as keyof SignUpFormData]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<SignUpFormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = t('nameRequired');
    } else if (formData.name.trim().length < 2) {
      newErrors.name = t('nameMinLength');
    }

    if (!formData.email.trim()) {
      newErrors.email = t('invalidEmail');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t('invalidEmail');
    }

    if (formData.username && formData.username.trim().length > 0) {
      if (formData.username.trim().length < 3) {
        newErrors.username = ts('usernameMin');
      } else if (!/^[a-zA-Z0-9_.-]+$/.test(formData.username.trim())) {
        newErrors.username = ts('usernameChars');
      }
    }

    if (!formData.password) {
      newErrors.password = t('passwordRequired');
    } else if (formData.password.length < passwordMinLength) {
      newErrors.password = ts('passwordMin', { min: passwordMinLength });
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = t('confirmPasswordRequired');
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t('passwordsDoNotMatch');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setApiError('');

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          username: formData.username.trim() || undefined,
          password: formData.password,
          phone: formData.phone.trim() || undefined,
          role: formData.role,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || tErrors('somethingWentWrong'));
      }

      // Auto sign in after successful registration
      const signInResult = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (signInResult?.error) {
        // Registration successful but auto-login failed
        toast({
          title: ts('successTitle'),
          description: ts('checkEmail'),
          variant: "success",
        });
        router.push('/auth/signin?message=' + encodeURIComponent(ts('checkEmail')));
      } else {
        // Both registration and login successful
        toast({
          title: ts('welcomeTitle'),
          description: ts('verificationSent'),
          variant: "success",
        });
        router.push('/');
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : tErrors('somethingWentWrong');
      setApiError(errorMsg);
      toast({
        title: ts('errorTitle'),
        description: errorMsg,
        variant: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = () => {
    signIn('google', { callbackUrl: '/' });
  };

  const roles: { id: SignUpFormData['role']; title: string; description: string; icon: typeof User }[] = [
    { id: 'customer', title: ts('roleCustomer'), description: ts('roleCustomerText'), icon: User },
    { id: 'barber', title: ts('roleBarber'), description: ts('roleBarberText'), icon: Scissors },
  ];

  return (
    <AuthShell
      title={t('createAccountTitle')}
      description={t('joinCommunity')}
      footer={
        <>
          {t('alreadyHaveAccount')}{' '}
          <Link href="/auth/signin" className={authLinkClass}>{t('signIn')}</Link>
        </>
      }
    >
      {apiError && <FormAlert>{apiError}</FormAlert>}

      <GoogleButton onClick={handleGoogleSignUp}>{t('signUpWithGoogle')}</GoogleButton>
      <Divider>{ts('orWithEmail')}</Divider>

      <form className="space-y-5" onSubmit={handleSubmit} noValidate>
        <fieldset>
          <legend className="mb-1.5 text-sm font-medium text-gray-800">{t('accountType')}</legend>
          <div className="grid grid-cols-2 gap-2">
            {roles.map((role) => {
              const checked = formData.role === role.id;
              return (
                <label
                  key={role.id}
                  className={`flex cursor-pointer items-start gap-2.5 rounded-lg border px-3 py-2.5 transition-colors ${
                    checked ? 'border-primary-500 bg-primary-50/60 ring-1 ring-primary-500' : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value={role.id}
                    checked={checked}
                    onChange={handleInputChange}
                    className="sr-only"
                  />
                  <role.icon className={`mt-0.5 h-4 w-4 flex-shrink-0 ${checked ? 'text-primary-600' : 'text-gray-400'}`} />
                  <span>
                    <span className="block text-sm font-medium text-gray-900">{role.title}</span>
                    <span className="block text-xs text-gray-500">{role.description}</span>
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>

        <AuthField label={t('name')} name="name" autoComplete="name" value={formData.name} onChange={handleInputChange} error={errors.name} required />
        <AuthField
          label={t('email')}
          name="email"
          type="email"
          autoComplete="email"
          value={formData.email}
          onChange={handleInputChange}
          error={errors.email}
          placeholder={ts('emailPlaceholder')}
          required
        />
        <AuthField
          label={t('phoneOptional')}
          name="phone"
          type="tel"
          autoComplete="tel"
          value={formData.phone}
          onChange={handleInputChange}
          placeholder="06 12 34 56 78"
        />
        {formData.role === 'barber' && (
          <AuthField
            label={ts('usernameLabel')}
            name="username"
            autoComplete="username"
            value={formData.username}
            onChange={handleInputChange}
            error={errors.username}
            help={ts('usernameHelp')}
          />
        )}
        <AuthField
          label={t('password')}
          name="password"
          type="password"
          autoComplete="new-password"
          value={formData.password}
          onChange={handleInputChange}
          error={errors.password}
          help={ts('passwordHelp', { min: passwordMinLength })}
          required
        />
        <AuthField
          label={t('confirmPassword')}
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          value={formData.confirmPassword}
          onChange={handleInputChange}
          error={errors.confirmPassword}
          required
        />

        <SubmitButton loading={isLoading}>{t('createAccount')}</SubmitButton>
      </form>
    </AuthShell>
  );
}
