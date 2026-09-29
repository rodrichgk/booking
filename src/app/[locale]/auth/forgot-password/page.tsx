'use client';

import { useState } from 'react';
import { MailCheck } from 'lucide-react';
import { Link } from '@/routing';
import { AuthShell, AuthField, AuthStatus, SubmitButton, FormAlert, authLinkClass } from '@/components/auth/auth-ui';
import { btn } from '@/components/dashboard/ui';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSent, setIsSent] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const response = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
                throw new Error(data.error || 'Une erreur est survenue');
            }
            setIsSent(true);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Une erreur est survenue');
        } finally {
            setIsLoading(false);
        }
    };

    const backToSignIn = (
        <>
            Vous vous en souvenez ?{' '}
            <Link href="/auth/signin" className={authLinkClass}>Se connecter</Link>
        </>
    );

    if (isSent) {
        return (
            <AuthShell title="Vérifiez vos emails" footer={backToSignIn}>
                <AuthStatus
                    icon={MailCheck}
                    title="Lien envoyé"
                    action={
                        <button type="button" onClick={() => setIsSent(false)} className={btn.secondary}>
                            Utiliser une autre adresse
                        </button>
                    }
                >
                    Si un compte est associé à <strong className="font-medium text-gray-900">{email}</strong>, vous allez recevoir un lien
                    pour choisir un nouveau mot de passe. Pensez à regarder dans vos spams.
                </AuthStatus>
            </AuthShell>
        );
    }

    return (
        <AuthShell
            title="Mot de passe oublié ?"
            description="Indiquez votre adresse email, nous vous envoyons un lien pour le réinitialiser."
            footer={backToSignIn}
        >
            {error && <FormAlert>{error}</FormAlert>}
            <form className="space-y-5" onSubmit={handleSubmit}>
                <AuthField
                    label="Adresse email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="vous@exemple.fr"
                    disabled={isLoading}
                />
                <SubmitButton loading={isLoading}>Envoyer le lien</SubmitButton>
            </form>
        </AuthShell>
    );
}
