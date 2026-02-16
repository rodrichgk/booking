'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link } from '@/routing'; // Assuming this exists for i18n routing
import { useToast } from '@/hooks/use-toast';

export default function ForgotPasswordPage() {
    const { toast } = useToast();
    // We can default to 'auth' or a generic fallback if keys are missing
    const t = useTranslations('auth'); // Ensure 'auth' namespace has relevant keys or fallback

    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSent, setIsSent] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Something went wrong');
            }

            setIsSent(true);
            toast({
                title: "Email envoyé",
                description: "Si un compte existe avec cet email, vous recevrez un lien de réinitialisation.",
                variant: "success",
            });
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

    if (isSent) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center px-4">
                <div className="max-w-md w-full bg-white rounded-xl shadow-xl p-8 text-center space-y-6">
                    <div className="mx-auto h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
                        <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Email envoyé !</h2>
                    <p className="text-gray-600">
                        Vérifiez votre boîte de réception (et vos spams). Si un compte est associé à <strong>{email}</strong>, vous recevrez les instructions pour réinitialiser votre mot de passe.
                    </p>
                    <div className="pt-4">
                        <Link href="/auth/signin" className="text-amber-600 hover:text-amber-500 font-medium">
                            Retour à la connexion
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center px-4">
            <div className="max-w-md w-full bg-white rounded-xl shadow-xl p-8 space-y-8">
                <div className="text-center">
                    <h2 className="text-3xl font-extrabold text-gray-900">Mot de passe oublié ?</h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Entrez votre adresse email pour recevoir un lien de réinitialisation.
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md shadow-sm -space-y-px">
                        <Input
                            label="Adresse Email"
                            name="email"
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="exemple@email.com"
                            disabled={isLoading}
                        />
                    </div>

                    <div>
                        <Button
                            type="submit"
                            className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                            loading={isLoading}
                            disabled={isLoading}
                        >
                            Envoyer le lien
                        </Button>
                    </div>

                    <div className="text-center">
                        <Link href="/auth/signin" className="font-medium text-amber-600 hover:text-amber-500">
                            Retour à la connexion
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
