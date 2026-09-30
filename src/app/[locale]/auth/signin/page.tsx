'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { AuthShell, AuthField, SubmitButton, GoogleButton, Divider, FormAlert, authLinkClass } from '@/components/auth/auth-ui';
import { Link } from '@/routing';
import { useToast } from '@/hooks/use-toast';

export default function SignInPage() {
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations('auth');
  const tErrors = useTranslations('errors');
  const ts = useTranslations('site.signin');
  
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    username: '',
    password: '',
  });
  const [loginType, setLoginType] = useState<'email' | 'phone' | 'username'>('email');
  const [errors, setErrors] = useState<{ email?: string; phone?: string; username?: string; password?: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const message = searchParams.get('message');

  // Errors NextAuth passes back after a failed Google sign-in (?error=...)
  const oauthErrors: Record<string, string> = {
    AccessDenied: ts('accessDenied'),
    OAuthAccountNotLinked: ts('accountNotLinked'),
    OAuthSignin: ts('googleFailed'),
    OAuthCallback: ts('googleFailed'),
    Callback: ts('signInFailed'),
  };
  const oauthError = searchParams.get('error');
  const redirectError = oauthError ? oauthErrors[oauthError] ?? ts('signInFailed') : '';

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { email?: string; phone?: string; username?: string; password?: string } = {};

    if (loginType === 'email') {
      if (!formData.email.trim()) {
        newErrors.email = t('invalidEmail');
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = t('invalidEmail');
      }
    } else if (loginType === 'phone') {
      if (!formData.phone.trim()) {
        newErrors.phone = t('phoneRequired');
      } else if (!/^[+]?[\d\s\-\(\)]+$/.test(formData.phone)) {
        newErrors.phone = t('invalidPhone');
      }
    } else {
      if (!formData.username.trim()) {
        newErrors.username = ts('usernameRequired');
      }
    }

    if (!formData.password) {
      newErrors.password = t('passwordRequired');
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
      const result = await signIn('credentials', {
        email: loginType === 'email' ? formData.email : undefined,
        phone: loginType === 'phone' ? formData.phone : undefined,
        username: loginType === 'username' ? formData.username : undefined,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        // Coded errors come from authorize() in src/lib/auth.ts
        const message =
          result.error === 'TOO_MANY_ATTEMPTS'
            ? ts('tooManyAttempts')
            : result.error === 'IP_BLOCKED'
              ? ts('ipBlocked')
              : t('invalidCredentials');
        setApiError(message);
        toast({
          title: ts('errorTitle'),
          description: message,
          variant: "error",
        });
      } else {
        toast({
          title: ts('successTitle'),
          description: ts('successText'),
          variant: "success",
        });
        
        // Redirect based on user role or to home
        const callbackUrl = searchParams.get('callbackUrl') || '/';
        router.push(callbackUrl);
      }
    } catch (error) {
      setApiError(tErrors('somethingWentWrong'));
      toast({
        title: ts('error'),
        description: tErrors('somethingWentWrong'),
        variant: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    const callbackUrl = searchParams.get('callbackUrl') || '/';
    signIn('google', { callbackUrl });
  };

  const tabs: { id: typeof loginType; label: string }[] = [
    { id: 'email', label: ts('tabEmail') },
    { id: 'phone', label: ts('tabPhone') },
    { id: 'username', label: ts('tabUsername') },
  ];

  return (
    <AuthShell
      title={t('welcomeBack')}
      description={t('signInToAccount')}
      footer={
        <>
          {t('dontHaveAccount')}{' '}
          <Link href="/auth/signup" className={authLinkClass}>{t('signUp')}</Link>
        </>
      }
    >
      {message && <FormAlert tone="success">{message}</FormAlert>}
      {(apiError || redirectError) && <FormAlert>{apiError || redirectError}</FormAlert>}

      <GoogleButton onClick={handleGoogleSignIn}>{t('signInWithGoogle')}</GoogleButton>
      <Divider>{ts('orWithCredentials')}</Divider>

      <form className="space-y-5" onSubmit={handleSubmit} noValidate>
        <div role="tablist" aria-label={ts('signInWith')} className="grid grid-cols-3 gap-1 rounded-lg bg-gray-100 p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={loginType === tab.id}
              onClick={() => {
                setLoginType(tab.id);
                setErrors({});
              }}
              className={`rounded-md py-1.5 text-sm font-medium transition-colors ${
                loginType === tab.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loginType === 'email' ? (
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
        ) : loginType === 'phone' ? (
          <AuthField
            label={t('phone')}
            name="phone"
            type="tel"
            autoComplete="tel"
            value={formData.phone}
            onChange={handleInputChange}
            error={errors.phone}
            placeholder="06 12 34 56 78"
            required
          />
        ) : (
          <AuthField
            label={ts('tabUsername')}
            name="username"
            type="text"
            autoComplete="username"
            value={formData.username}
            onChange={handleInputChange}
            error={errors.username}
            help={ts('usernameHelp')}
            required
          />
        )}

        <AuthField
          label={t('password')}
          name="password"
          type="password"
          autoComplete="current-password"
          value={formData.password}
          onChange={handleInputChange}
          error={errors.password}
          required
          labelAside={
            <Link href="/auth/forgot-password" className="text-sm font-medium text-primary-700 hover:text-primary-800">
              {t('forgotPassword')}
            </Link>
          }
        />

        <SubmitButton loading={isLoading}>{t('signIn')}</SubmitButton>
      </form>
    </AuthShell>
  );
}
