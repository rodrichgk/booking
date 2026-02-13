'use client';

import { useState } from 'react';
import { signIn, getSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link } from '@/routing';
import { useToast } from '@/hooks/use-toast';

export default function SignInPage() {
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations('auth');
  const tErrors = useTranslations('errors');
  
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
        newErrors.username = 'Nom d\'utilisateur requis';
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
        setApiError(t('invalidCredentials'));
        toast({
          title: "❌ Erreur de connexion",
          description: t('invalidCredentials'),
          variant: "error",
        });
      } else {
        // Get the updated session to check user role
        const session = await getSession();
        
        toast({
          title: "✅ Connexion réussie!",
          description: "Bienvenue sur Orphelia",
          variant: "success",
        });
        
        // Redirect based on user role or to home
        const callbackUrl = searchParams.get('callbackUrl') || '/';
        router.push(callbackUrl);
      }
    } catch (error) {
      setApiError(tErrors('somethingWentWrong'));
      toast({
        title: "❌ Erreur",
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
      {/* Simple Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center">
              <span className="font-sans font-bold text-2xl text-gray-900 tracking-[0.3em] uppercase">
                ORPHELIA
              </span>
            </Link>
            <Link href="/" className="text-gray-700 hover:text-primary-600 font-medium transition-colors font-body">
              Retour à l'accueil
            </Link>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <div className="mx-auto h-12 w-12 bg-amber-600 rounded-full flex items-center justify-center">
              <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              {t('welcomeBack')}
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              {t('signInToAccount')}
            </p>
          </div>

        <div className="bg-white py-8 px-6 shadow-xl rounded-lg">
          {message && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-600">{message}</p>
            </div>
          )}

          {apiError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{apiError}</p>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => setLoginType('email')}
                  className={`flex-1 py-2 px-3 rounded-lg font-medium transition-colors text-sm ${
                    loginType === 'email'
                      ? 'bg-amber-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {t('email')}
                </button>
                <button
                  type="button"
                  onClick={() => setLoginType('phone')}
                  className={`flex-1 py-2 px-3 rounded-lg font-medium transition-colors text-sm ${
                    loginType === 'phone'
                      ? 'bg-amber-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {t('phone')}
                </button>
                <button
                  type="button"
                  onClick={() => setLoginType('username')}
                  className={`flex-1 py-2 px-3 rounded-lg font-medium transition-colors text-sm ${
                    loginType === 'username'
                      ? 'bg-amber-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Identifiant
                </button>
              </div>

              {loginType === 'email' ? (
                <Input
                  label={t('email')}
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  error={errors.email}
                  placeholder={t('email')}
                  required
                />
              ) : loginType === 'phone' ? (
                <Input
                  label={t('phone')}
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleInputChange}
                  error={errors.phone}
                  placeholder={t('phone')}
                  required
                />
              ) : (
                <Input
                  label="Nom d'utilisateur"
                  name="username"
                  type="text"
                  value={formData.username}
                  onChange={handleInputChange}
                  error={errors.username}
                  placeholder="Votre identifiant"
                  required
                />
              )}
            </div>

            <Input
              label={t('password')}
              name="password"
              type="password"
              value={formData.password}
              onChange={handleInputChange}
              error={errors.password}
              placeholder={t('password')}
              required
            />

            <div className="flex items-center justify-between">
              <div className="text-sm">
                <Link href="/auth/forgot-password" className="font-medium text-amber-600 hover:text-amber-500">
                  {t('forgotPassword')}
                </Link>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              loading={isLoading}
              disabled={isLoading}
            >
              {t('signIn')}
            </Button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">{t('orContinueWith')}</span>
              </div>
            </div>

            <div className="mt-6">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleGoogleSignIn}
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                {t('signInWithGoogle')}
              </Button>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              {t('dontHaveAccount')}{' '}
              <Link href="/auth/signup" className="font-medium text-amber-600 hover:text-amber-500">
                {t('signUp')}
              </Link>
            </p>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
