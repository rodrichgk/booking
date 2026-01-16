'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Play, ShoppingCart, Check, Loader2, LogIn } from 'lucide-react';

interface CourseDetailClientProps {
    courseId: string;
    hasAccess: boolean;
    isLoggedIn: boolean;
    locale: string;
    isFree: boolean;
    userRole: string;
}

const translations = {
    fr: {
        buyNow: 'Acheter maintenant',
        watchNow: 'Regarder maintenant',
        getAccess: 'Obtenir l\'accès',
        alreadyPurchased: 'Cours acheté',
        signInToPurchase: 'Connectez-vous pour acheter',
        signIn: 'Se connecter',
        processing: 'Traitement...',
        error: 'Une erreur est survenue',
        freeAccess: 'Accès gratuit',
        adminAccess: 'Accès admin accordé',
    },
    en: {
        buyNow: 'Buy Now',
        watchNow: 'Watch Now',
        getAccess: 'Get Access',
        alreadyPurchased: 'Course Purchased',
        signInToPurchase: 'Sign in to purchase',
        signIn: 'Sign In',
        processing: 'Processing...',
        error: 'An error occurred',
        freeAccess: 'Free Access',
        adminAccess: 'Admin Access Granted',
    },
};

export function CourseDetailClient({
    courseId,
    hasAccess,
    isLoggedIn,
    locale,
    isFree,
    userRole,
}: CourseDetailClientProps) {
    const router = useRouter();
    const t = translations[locale as keyof typeof translations] || translations.en;
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const isAdmin = ['dev', 'admin'].includes(userRole);

    const handlePurchase = async () => {
        if (!isLoggedIn) {
            router.push(`/${locale}/auth/signin`);
            return;
        }

        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/courses/purchase', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ courseId }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Purchase failed');
            }

            // Already purchased
            if (data.alreadyPurchased) {
                router.push(`/${locale}/courses/${courseId}/watch`);
                return;
            }

            // Admin bypass or free access
            if (data.bypassedAccess || data.freeAccess) {
                router.push(`/${locale}/courses/${courseId}/watch`);
                return;
            }

            // Stripe checkout
            if (data.checkoutUrl) {
                window.location.href = data.checkoutUrl;
                return;
            }
        } catch (err: any) {
            setError(err.message || t.error);
        } finally {
            setLoading(false);
        }
    };

    const handleWatch = () => {
        router.push(`/${locale}/courses/${courseId}/watch`);
    };

    // Already has access - show watch button
    if (hasAccess) {
        return (
            <div className="space-y-3">
                <button
                    onClick={handleWatch}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
                >
                    <Play className="w-5 h-5" />
                    {t.watchNow}
                </button>

                <p className="text-center text-sm text-gray-500 flex items-center justify-center gap-1">
                    <Check className="w-4 h-4 text-green-500" />
                    {isAdmin ? t.adminAccess : isFree ? t.freeAccess : t.alreadyPurchased}
                </p>
            </div>
        );
    }

    // Not logged in
    if (!isLoggedIn) {
        return (
            <div className="space-y-3">
                <button
                    onClick={() => router.push(`/${locale}/auth/signin`)}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
                >
                    <LogIn className="w-5 h-5" />
                    {t.signIn}
                </button>
                <p className="text-center text-sm text-gray-500">{t.signInToPurchase}</p>
            </div>
        );
    }

    // Logged in but no access - show purchase button
    return (
        <div className="space-y-3">
            <button
                onClick={handlePurchase}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium disabled:opacity-50"
            >
                {loading ? (
                    <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        {t.processing}
                    </>
                ) : (
                    <>
                        <ShoppingCart className="w-5 h-5" />
                        {isFree ? t.getAccess : t.buyNow}
                    </>
                )}
            </button>

            {error && (
                <p className="text-center text-sm text-red-500">{error}</p>
            )}
        </div>
    );
}
