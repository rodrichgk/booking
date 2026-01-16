import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { XCircle, ArrowLeft } from 'lucide-react';
import { Header } from '@/components/ui/header';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'courses' });

    return {
        title: t('purchaseCancelled') || 'Purchase Cancelled',
        description: t('purchaseCancelledDesc') || 'Your purchase was cancelled',
    };
}

export default async function CourseCancelPage({
    params,
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;

    const translations = {
        fr: {
            title: 'Achat annulé',
            subtitle: 'Votre achat a été annulé. Aucun paiement n\'a été effectué.',
            backToCourses: 'Retour aux cours',
            tryAgain: 'Réessayer',
        },
        en: {
            title: 'Purchase Cancelled',
            subtitle: 'Your purchase was cancelled. No payment was made.',
            backToCourses: 'Back to Courses',
            tryAgain: 'Try Again',
        },
    };

    const t = translations[locale as keyof typeof translations] || translations.en;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
            <Header />
            <div className="flex-1 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <XCircle className="w-10 h-10 text-gray-400" />
                    </div>

                    <h1 className="text-2xl font-bold text-gray-900 mb-2">{t.title}</h1>
                    <p className="text-gray-600 mb-8">{t.subtitle}</p>

                    <Link
                        href={`/${locale}/courses`}
                        className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        {t.backToCourses}
                    </Link>
                </div>
            </div>
        </div>
    );
}
