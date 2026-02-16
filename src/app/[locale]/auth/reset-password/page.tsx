'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link } from '@/routing';
import { useToast } from '@/hooks/use-toast';

function ResetPasswordForm() {
    const { toast } = useToast();
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    if (!token) {
        return (
            <div className="text-center space-y-4">
                <div className="mx-auto h-12 w-12 bg-red-100 rounded-full flex items-center justify-center">
                    <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900">Lien invalide</h3>
                <p className="text-sm text-gray-500">Le lien de réinitialisation est manquant ou invalide.</p>
                <Link href="/auth/forgot-password" className="text-amber-600 hover:text-amber-500 font-medium block">
                    Demander un nouveau lien
                </Link>
            </div>
        );
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast({
                title: "Erreur",
                description: "Les mots de passe ne correspondent pas",
                variant: "error",
            });
            return;
        }

        if (password.length < 8) {
            toast({
                title: "Erreur",
                description: "Le mot de passe doit contenir au moins 8 caractères",
                variant: "error",
            });
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ token, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Une erreur est survenue');
            }

            toast({
                title: "Succès !",
                description: "Votre mot de passe a été réinitialisé. Vous pouvez maintenant vous connecter.",
                variant: "success",
            });

            // Redirect to login after delay
            setTimeout(() => {
                router.push('/auth/signin');
            }, 2000);

        } catch (error: any) {
            toast({
                title: "Erreur",
                description: error.message,
                variant: "error",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            <div className="text-center">
                <h2 className="text-3xl font-extrabold text-gray-900">Réinitialiser le mot de passe</h2>
                <p className="mt-2 text-sm text-gray-600">
                    Entrez votre nouveau mot de passe ci-dessous.
                </p>
            </div>

            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                <div className="space-y-4">
                    <Input
                        label="Nouveau mot de passe"
                        name="password"
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Minimum 8 caractères"
                        disabled={isLoading}
                    />

                    <Input
                        label="Confirmer le mot de passe"
                        name="confirmPassword"
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirmez votre nouveau mot de passe"
                        disabled={isLoading}
                    />
                </div>

                <Button
                    type="submit"
                    className="w-full"
                    loading={isLoading}
                    disabled={isLoading}
                >
                    Réinitialiser le mot de passe
                </Button>
            </form>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center px-4">
            <div className="max-w-md w-full bg-white rounded-xl shadow-xl p-8">
                <Suspense fallback={<div className="text-center">Chargement...</div>}>
                    <ResetPasswordForm />
                </Suspense>
            </div>
        </div>
    );
}
