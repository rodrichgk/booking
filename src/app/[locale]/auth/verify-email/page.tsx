'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, XCircle, Loader2, Mail } from 'lucide-react';
import { Link } from '@/routing';
import { AuthShell, AuthStatus } from '@/components/auth/auth-ui';
import { btn } from '@/components/dashboard/ui';

const SpinningLoader = ({ className }: { className?: string }) => <Loader2 className={`${className ?? ''} animate-spin`} />;

function VerifyEmail() {
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
          setErrorMessage(data.error || 'Une erreur est survenue.');
        }
      } catch {
        setStatus('error');
        setErrorMessage('Une erreur est survenue lors de la vérification.');
      }
    };

    verifyEmail();
  }, [token, email]);

  const signInButton = <Link href="/auth/signin" className={btn.primary}>Se connecter</Link>;

  if (status === 'loading') {
    return (
      <AuthStatus icon={SpinningLoader} title="Vérification en cours">
        Un instant, nous confirmons votre adresse email.
      </AuthStatus>
    );
  }

  if (status === 'success') {
    return (
      <AuthStatus icon={CheckCircle} tone="success" title="Email vérifié" action={signInButton}>
        Votre adresse est confirmée. Vous pouvez maintenant vous connecter.
      </AuthStatus>
    );
  }

  if (status === 'error') {
    return (
      <AuthStatus icon={XCircle} tone="danger" title="Vérification impossible" action={signInButton}>
        {errorMessage} Vous pourrez demander un nouveau lien depuis votre espace une fois connecté.
      </AuthStatus>
    );
  }

  return (
    <AuthStatus icon={Mail} tone="danger" title="Lien invalide" action={signInButton}>
      Ce lien de vérification est incomplet. Ouvrez le lien reçu par email, ou demandez-en un nouveau depuis votre espace.
    </AuthStatus>
  );
}

export default function VerifyEmailPage() {
  return (
    <AuthShell title="Vérification de l’email">
      <Suspense fallback={null}>
        <VerifyEmail />
      </Suspense>
    </AuthShell>
  );
}
