'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import { Link } from '@/routing';
import { useSettings } from '@/contexts/settings-context';
import { AuthShell, AuthField, AuthStatus, SubmitButton, FormAlert, authLinkClass } from '@/components/auth/auth-ui';
import { btn, Spinner } from '@/components/dashboard/ui';

function ResetPasswordForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');
    // Configurable in admin Settings > Security; the API enforces the same value.
    const { passwordMinLength } = useSettings();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [done, setDone] = useState(false);

    if (!token) {
        return (
            <AuthStatus
                icon={AlertTriangle}
                tone="danger"
                title="Lien invalide"
                action={<Link href="/auth/forgot-password" className={btn.primary}>Demander un nouveau lien</Link>}
            >
                Ce lien de réinitialisation est incomplet ou a expiré.
            </AuthStatus>
        );
    }

    if (done) {
        return (
            <AuthStatus
                icon={CheckCircle}
                tone="success"
                title="Mot de passe modifié"
                action={<Link href="/auth/signin" className={btn.primary}>Se connecter</Link>}
            >
                Vous allez être redirigé vers la page de connexion.
            </AuthStatus>
        );
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password.length < passwordMinLength) {
            setError(`Le mot de passe doit contenir au moins ${passwordMinLength} caractères.`);
            return;
        }
        if (password !== confirmPassword) {
            setError('Les mots de passe ne correspondent pas.');
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, password }),
            });
            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
                throw new Error(data.error || 'Une erreur est survenue');
            }
            setDone(true);
            setTimeout(() => router.push('/auth/signin'), 2500);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Une erreur est survenue');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            {error && <FormAlert>{error}</FormAlert>}
            <form className="space-y-5" onSubmit={handleSubmit}>
                <AuthField
                    label="Nouveau mot de passe"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    help={`${passwordMinLength} caractères minimum.`}
                    disabled={isLoading}
                />
                <AuthField
                    label="Confirmer le mot de passe"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isLoading}
                />
                <SubmitButton loading={isLoading}>Enregistrer le mot de passe</SubmitButton>
            </form>
        </>
    );
}

export default function ResetPasswordPage() {
    return (
        <AuthShell
            title="Nouveau mot de passe"
            description="Choisissez le mot de passe que vous utiliserez pour vous connecter."
            footer={<Link href="/auth/signin" className={authLinkClass}>Retour à la connexion</Link>}
        >
            <Suspense fallback={<Spinner className="h-5 w-5 text-gray-400" />}>
                <ResetPasswordForm />
            </Suspense>
        </AuthShell>
    );
}
