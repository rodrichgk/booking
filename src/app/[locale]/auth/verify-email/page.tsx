'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, XCircle, Loader2, Mail } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/routing';
import { AuthShell, AuthStatus } from '@/components/auth/auth-ui';
import { btn } from '@/components/dashboard/ui';

const SpinningLoader = ({ className }: { className?: string }) => <Loader2 className={`${className ?? ''} animate-spin`} />;

function VerifyEmail() {
  const t = useTranslations('site.verify');
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'no-token'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!token || !email) {
      setStatus('no-token');
      return;
    }

    const verifyEmail = async () => {
      try {
        const res = await fetch('/api/auth/verify-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, email }),
        });
        const data = await res.json().catch(() => ({}));
        if (res.ok) {
          setStatus('success');
        } else {
          setStatus('error');
          setErrorMessage(data.error || '');
        }
      } catch {
        setStatus('error');
        setErrorMessage('');
      }
    };

    verifyEmail();
  }, [token, email]);

  const signInButton = <Link href="/auth/signin" className={btn.primary}>{t('signIn')}</Link>;

  if (status === 'loading') {
    return (
      <AuthStatus icon={SpinningLoader} title={t('loadingTitle')}>
        {t('loadingText')}
      </AuthStatus>
    );
  }

  if (status === 'success') {
    return (
      <AuthStatus icon={CheckCircle} tone="success" title={t('successTitle')} action={signInButton}>
        {t('successText')}
      </AuthStatus>
    );
  }

  if (status === 'error') {
    return (
      <AuthStatus icon={XCircle} tone="danger" title={t('errorTitle')} action={signInButton}>
        {errorMessage || t('error')} {t('errorText')}
      </AuthStatus>
    );
  }

  return (
    <AuthStatus icon={Mail} tone="danger" title={t('invalidTitle')} action={signInButton}>
      {t('invalidText')}
    </AuthStatus>
  );
}

export default function VerifyEmailPage() {
  const t = useTranslations('site.verify');
  return (
    <AuthShell title={t('title')}>
      <Suspense fallback={null}>
        <VerifyEmail />
      </Suspense>
    </AuthShell>
  );
}
