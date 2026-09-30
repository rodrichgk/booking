'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/routing';
import { useSettings } from '@/contexts/settings-context';
import { AuthShell, AuthField, AuthStatus, SubmitButton, FormAlert, authLinkClass } from '@/components/auth/auth-ui';
import { btn, Spinner } from '@/components/dashboard/ui';

function ResetPasswordForm() {
    const t = useTranslations('site.reset');
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
                title={t('invalidTitle')}
                action={<Link href="/auth/forgot-password" className={btn.primary}>{t('newLink')}</Link>}
            >
                {t('invalidText')}
            </AuthStatus>
        );
    }

    if (done) {
        return (
            <AuthStatus
                icon={CheckCircle}
                tone="success"
                title={t('doneTitle')}
                action={<Link href="/auth/signin" className={btn.primary}>{t('signIn')}</Link>}
            >
                {t('doneText')}
            </AuthStatus>
        );
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password.length < passwordMinLength) {
            setError(t('passwordMin', { min: passwordMinLength }));
            return;
        }
        if (password !== confirmPassword) {
            setError(t('mismatch'));
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
                throw new Error(data.error || t('error'));
            }
            setDone(true);
            setTimeout(() => router.push('/auth/signin'), 2500);
        } catch (err) {
            setError(err instanceof Error ? err.message : t('error'));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            {error && <FormAlert>{error}</FormAlert>}
            <form className="space-y-5" onSubmit={handleSubmit}>
                <AuthField
                    label={t('newPassword')}
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    help={t('passwordHelp', { min: passwordMinLength })}
                    disabled={isLoading}
                />
                <AuthField
                    label={t('confirmPassword')}
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isLoading}
                />
                <SubmitButton loading={isLoading}>{t('save')}</SubmitButton>
            </form>
        </>
    );
}

export default function ResetPasswordPage() {
    const t = useTranslations('site.reset');
    return (
        <AuthShell
            title={t('title')}
            description={t('description')}
            footer={<Link href="/auth/signin" className={authLinkClass}>{t('backToSignIn')}</Link>}
        >
            <Suspense fallback={<Spinner className="h-5 w-5 text-gray-400" />}>
                <ResetPasswordForm />
            </Suspense>
        </AuthShell>
    );
}
