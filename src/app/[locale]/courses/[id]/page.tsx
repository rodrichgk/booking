import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { courses, courseVideos, coursePurchases } from '@/lib/db/schema';
import { eq, and, or } from 'drizzle-orm';
import Link from 'next/link';
import { Video, Clock, Play, Check, Lock, ArrowLeft, ShoppingCart } from 'lucide-react';
import { CourseDetailClient } from './client';
import { Header } from '@/components/ui/header';
import { Footer } from '@/components/ui/footer';

export async function generateMetadata({ params }: { params: Promise<{ locale: string, id: string }> }) {
    const { id } = await params;

    const [course] = await db
        .select()
        .from(courses)
        .where(eq(courses.id, id));

    return {
        title: course?.title || 'Course',
        description: course?.description || 'Video course',
    };
}

export default async function CourseDetailPage({
    params,
}: {
    params: Promise<{ locale: string; id: string }>;
}) {
    const { locale, id } = await params;
    const session = await getServerSession(authOptions);

    // Fetch course
    const [course] = await db
        .select()
        .from(courses)
        .where(eq(courses.id, id));

    if (!course || !course.isActive) {
        redirect(`/${locale}/courses`);
    }

    // Fetch videos (basic info only)
    const videos = await db
        .select({
            id: courseVideos.id,
            title: courseVideos.title,
            order: courseVideos.order,
            duration: courseVideos.duration,
        })
        .from(courseVideos)
        .where(eq(courseVideos.courseId, id))
        .orderBy(courseVideos.order);

    // Check access
    let hasAccess = false;
    const userId = session?.user?.id;
    const userRole = (session?.user as any)?.role;

    if (['dev', 'admin'].includes(userRole)) {
        hasAccess = true;
    } else if (userId) {
        const [purchase] = await db
            .select()
            .from(coursePurchases)
            .where(
                and(
                    eq(coursePurchases.userId, userId),
                    eq(coursePurchases.courseId, id),
                    or(
                        eq(coursePurchases.status, 'completed'),
                        eq(coursePurchases.status, 'bypassed')
                    )
                )
            );
        hasAccess = !!purchase;
    }

    // Free courses are accessible to logged in users
    if (course.priceInCents === 0 && session?.user) {
        hasAccess = true;
    }

    const translations = {
        fr: {
            backToCourses: 'Retour aux cours',
            videos: 'vidéos',
            video: 'vidéo',
            free: 'Gratuit',
            buyNow: 'Acheter maintenant',
            watchNow: 'Regarder maintenant',
            alreadyPurchased: 'Cours acheté',
            signInToPurchase: 'Connectez-vous pour acheter',
            curriculum: 'Programme du cours',
            aboutCourse: 'À propos de ce cours',
            duration: 'Durée',
            minutes: 'min',
        },
        en: {
            backToCourses: 'Back to courses',
            videos: 'videos',
            video: 'video',
            free: 'Free',
            buyNow: 'Buy Now',
            watchNow: 'Watch Now',
            alreadyPurchased: 'Course Purchased',
            signInToPurchase: 'Sign in to purchase',
            curriculum: 'Course Curriculum',
            aboutCourse: 'About this course',
            duration: 'Duration',
            minutes: 'min',
        },
    };

    const t = translations[locale as keyof typeof translations] || translations.en;

    const formatPrice = (cents: number, currency: string) => {
        if (cents === 0) return t.free;
        return new Intl.NumberFormat(locale === 'fr' ? 'fr-FR' : 'en-US', {
            style: 'currency',
            currency: currency,
        }).format(cents / 100);
    };

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const totalDuration = videos.reduce((sum, v) => sum + (v.duration || 0), 0);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Header />
            <main className="flex-1">
                {/* Course Header */}
                <div className="bg-gradient-to-br from-indigo-600 to-purple-700 text-white">
                    <div className="max-w-6xl mx-auto px-4 py-8">
                        <Link
                            href={`/${locale}/courses`}
                            className="inline-flex items-center gap-2 text-indigo-200 hover:text-white mb-6 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            {t.backToCourses}
                        </Link>

                        <div className="grid md:grid-cols-3 gap-8">
                            {/* Course Info */}
                            <div className="md:col-span-2">
                                <h1 className="text-3xl md:text-4xl font-bold mb-4">{course.title}</h1>
                                {course.description && (
                                    <p className="text-lg text-indigo-100 mb-6">{course.description}</p>
                                )}

                                <div className="flex flex-wrap gap-4 text-sm">
                                    <span className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full">
                                        <Video className="w-4 h-4" />
                                        {videos.length} {videos.length === 1 ? t.video : t.videos}
                                    </span>
                                    {totalDuration > 0 && (
                                        <span className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full">
                                            <Clock className="w-4 h-4" />
                                            {Math.floor(totalDuration / 60)} {t.minutes}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Purchase Card */}
                            <div className="bg-white rounded-xl shadow-lg p-6 text-gray-900">
                                {course.thumbnail && (
                                    <img
                                        src={course.thumbnail}
                                        alt={course.title}
                                        className="w-full aspect-video object-cover rounded-lg mb-4"
                                    />
                                )}

                                <div className="text-center mb-6">
                                    <span className={`text-3xl font-bold ${course.priceInCents === 0 ? 'text-green-600' : 'text-gray-900'}`}>
                                        {formatPrice(course.priceInCents, course.currency)}
                                    </span>
                                </div>

                                <CourseDetailClient
                                    courseId={course.id}
                                    hasAccess={hasAccess}
                                    isLoggedIn={!!session?.user}
                                    locale={locale}
                                    isFree={course.priceInCents === 0}
                                    userRole={userRole}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Course Content */}
                <div className="max-w-6xl mx-auto px-4 py-12">
                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Video List */}
                        <div className="md:col-span-2">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">{t.curriculum}</h2>

                            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                                {videos.map((video, index) => (
                                    <div
                                        key={video.id}
                                        className={`flex items-center gap-4 p-4 ${index !== videos.length - 1 ? 'border-b border-gray-100' : ''}`}
                                    >
                                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-medium text-sm">
                                            {index + 1}
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-medium text-gray-900">{video.title}</h4>
                                            {video.duration && (
                                                <span className="text-sm text-gray-500">
                                                    {formatDuration(video.duration)}
                                                </span>
                                            )}
                                        </div>
                                        {hasAccess ? (
                                            <Play className="w-5 h-5 text-indigo-600" />
                                        ) : (
                                            <Lock className="w-5 h-5 text-gray-400" />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div>
                            {course.description && (
                                <div className="bg-white rounded-xl shadow-sm p-6">
                                    <h3 className="font-semibold text-gray-900 mb-3">{t.aboutCourse}</h3>
                                    <p className="text-gray-600 whitespace-pre-line">{course.description}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
