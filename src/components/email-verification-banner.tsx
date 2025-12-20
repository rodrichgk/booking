'use client';

import { useState } from 'react';
import { AlertCircle, Mail, X, Loader2 } from 'lucide-react';

interface EmailVerificationBannerProps {
  email: string;
  userName: string;
}

export function EmailVerificationBanner({ email, userName }: EmailVerificationBannerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState('');
  const [isDismissed, setIsDismissed] = useState(false);

  const handleResendVerification = async () => {
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name: userName }),
      });

      const data = await res.json();

      if (res.ok) {
        setIsSent(true);
      } else {
        setError(data.error || 'Une erreur est survenue');
      }
    } catch (err) {
      setError('Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  if (isDismissed) return null;

  return (
    <div className="bg-amber-50 border-b border-amber-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <AlertCircle className="w-5 h-5 text-amber-600" />
            </div>
            <div className="flex-1">
              {isSent ? (
                <p className="text-sm text-amber-800">
                  <span className="font-medium">Email envoyé!</span> Vérifiez votre boîte de réception à {email}
                </p>
              ) : (
                <p className="text-sm text-amber-800">
                  <span className="font-medium">Email non vérifié.</span> Veuillez vérifier votre adresse email pour accéder à toutes les fonctionnalités.
                </p>
              )}
              {error && (
                <p className="text-sm text-red-600 mt-1">{error}</p>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {!isSent && (
              <button
                onClick={handleResendVerification}
                disabled={isLoading}
                className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-amber-800 bg-amber-100 hover:bg-amber-200 rounded-lg transition-colors disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Mail className="w-4 h-4 mr-2" />
                )}
                Renvoyer l'email
              </button>
            )}
            <button
              onClick={() => setIsDismissed(true)}
              className="p-1 text-amber-600 hover:text-amber-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
