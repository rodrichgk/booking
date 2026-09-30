'use client';

import { useState } from 'react';
import { MailCheck } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/routing';
import { AuthShell, AuthField, AuthStatus, SubmitButton, FormAlert, authLinkClass } from '@/components/auth/auth-ui';
import { btn } from '@/components/dashboard/ui';

export default function ForgotPasswordPage() {
    const t = useTranslations('site.forgot');
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
                throw new Error(data.error || t('error'));
            }
            setIsSent(true);
        } catch (err) {
            setError(err instanceof Error ? err.message : t('error'));
        } finally {
            setIsLoading(false);
        }
    };

    const backToSignIn = (
        <>
            {t('remember')}{' '}
            <Link href="/auth/signin" className={authLinkClass}>{t('signIn')}</Link>
        </>
    );

    if (isSent) {
        return (
            <AuthShell title={t('checkTitle')} footer={backToSignIn}>
                <AuthStatus
                    icon={MailCheck}
                    title={t('sentTitle')}
                    action={
                        <button type="button" onClick={() => setIsSent(false)} className={btn.secondary}>
                            {t('otherAddress')}
                        </button>
                    }
                >
                    {t.rich('sentText', { email, b: (chunks) => <strong className="font-medium text-gray-900">{chunks}</strong> })}
                </AuthStatus>
            </AuthShell>
        );
    }

    return (
        <AuthShell
            title={t('title')}
            description={t('description')}
            footer={backToSignIn}
        >
            {error && <FormAlert>{error}</FormAlert>}
            <form className="space-y-5" onSubmit={handleSubmit}>
                <AuthField
                    label={t('emailLabel')}
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t('emailPlaceholder')}
                    disabled={isLoading}
                />
                <SubmitButton loading={isLoading}>{t('send')}</SubmitButton>
            </form>
        </AuthShell>
    );
}
