import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { CheckCircle, Play, ArrowRight } from 'lucide-react';
import { Header } from '@/components/ui/header';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'courses' });

    return {
        title: t('purchaseSuccess') || 'Purchase Successful',
        description: t('purchaseSuccessDesc') || 'Your course purchase was successful',
    };
}

export default async function CourseSuccessPage({
    params,
    searchParams,
}: {
    params: Promise<{ locale: string }>;
    searchParams: Promise<{ session_id?: string; courseId?: string }>;
}) {
    const { locale } = await params;
    const { session_id, courseId } = await searchParams;
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        redirect(`/${locale}/auth/signin`);
    }

    const translations = {
        fr: {
            title: 'Achat réussi !',
            subtitle: 'Merci pour votre achat. Vous avez maintenant accès à ce cours.',
            watchNow: 'Commencer le cours',
            myCourses: 'Mes cours',
            backToCourses: 'Voir tous les cours',
        },
        en: {
            title: 'Purchase Successful!',
            subtitle: 'Thank you for your purchase. You now have access to this course.',
            watchNow: 'Start Course',
            myCourses: 'My Courses',
            backToCourses: 'View All Courses',
        },
    };

    const t = translations[locale as keyof typeof translations] || translations.en;

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex flex-col">
            <Header />
            <div className="flex-1 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-10 h-10 text-green-600" />
                    </div>

                    <h1 className="text-2xl font-bold text-gray-900 mb-2">{t.title}</h1>
                    <p className="text-gray-600 mb-8">{t.subtitle}</p>

                    <div className="space-y-3">
                        {courseId && (
                            <Link
                                href={`/${locale}/courses/${courseId}/watch`}
                                className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                            >
                                <Play className="w-5 h-5" />
                                {t.watchNow}
                            </Link>
                        )}

                        <Link
                            href={`/${locale}/my-courses`}
                            className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                        >
                            {t.myCourses}
                            <ArrowRight className="w-5 h-5" />
                        </Link>

                        <Link
                            href={`/${locale}/courses`}
                            className="block text-indigo-600 hover:text-indigo-700 text-sm mt-4"
                        >
                            {t.backToCourses}
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
