import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { courses, courseVideos, coursePurchases } from '@/lib/db/schema';
import { eq, and, or, desc } from 'drizzle-orm';
import Link from 'next/link';
import { Video, Play, Clock, ArrowRight } from 'lucide-react';
import { Header } from '@/components/ui/header';
import { Footer } from '@/components/ui/footer';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;

    return {
        title: locale === 'fr' ? 'Mes Cours' : 'My Courses',
        description: locale === 'fr'
            ? 'Accédez à vos cours vidéo achetés'
            : 'Access your purchased video courses',
    };
}

export default async function MyCoursesPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        redirect(`/${locale}/auth/signin`);
    }

    const translations = {
        fr: {
            title: 'Mes Cours',
            subtitle: 'Continuez votre apprentissage',
            noCourses: 'Vous n\'avez pas encore de cours',
            exploreCourses: 'Explorer les cours',
            videos: 'vidéos',
            video: 'vidéo',
            continueWatching: 'Continuer',
            purchasedOn: 'Acheté le',
            freeAccess: 'Accès gratuit',
            adminAccess: 'Accès admin',
        },
        en: {
            title: 'My Courses',
            subtitle: 'Continue your learning',
            noCourses: 'You don\'t have any courses yet',
            exploreCourses: 'Explore Courses',
            videos: 'videos',
            video: 'video',
            continueWatching: 'Continue',
            purchasedOn: 'Purchased on',
            freeAccess: 'Free access',
            adminAccess: 'Admin access',
        },
    };

    const t = translations[locale as keyof typeof translations] || translations.en;

    const userId = session.user.id;
    const userRole = (session.user as any).role;
    const isAdmin = ['dev', 'admin'].includes(userRole);

    // Fetch user's purchased courses
    let userCourses: any[] = [];

    try {
        if (isAdmin) {
            // Admins see all active courses
            const allCourses = await db
                .select()
                .from(courses)
                .where(eq(courses.isActive, true))
                .orderBy(desc(courses.createdAt));

            userCourses = await Promise.all(
                allCourses.map(async (course) => {
                    const videos = await db
                        .select()
                        .from(courseVideos)
                        .where(eq(courseVideos.courseId, course.id));
                    return {
                        course,
                        purchase: null,
                        videoCount: videos.length,
                        isAdmin: true,
                    };
                })
            );
        } else {
            // Regular users see their purchases
            const purchases = await db
                .select()
                .from(coursePurchases)
                .where(
                    and(
                        eq(coursePurchases.userId, userId),
                        or(
                            eq(coursePurchases.status, 'completed'),
                            eq(coursePurchases.status, 'bypassed')
                        )
                    )
                )
                .orderBy(desc(coursePurchases.purchasedAt));

            userCourses = await Promise.all(
                purchases.map(async (purchase) => {
                    const [course] = await db
                        .select()
                        .from(courses)
                        .where(eq(courses.id, purchase.courseId));

                    if (!course) return null;

                    const videos = await db
                        .select()
                        .from(courseVideos)
                        .where(eq(courseVideos.courseId, course.id));

                    return {
                        course,
                        purchase,
                        videoCount: videos.length,
                        isAdmin: false,
                    };
                })
            );

            userCourses = userCourses.filter(Boolean);
        }
    } catch (error) {
        console.error('Error loading user courses:', error);
    }

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat(locale === 'fr' ? 'fr-FR' : 'en-US', {
            dateStyle: 'medium',
        }).format(date);
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Header />
            <main className="flex-1">
                {/* Page Header */}
                <div className="bg-gradient-to-br from-indigo-600 to-purple-700 text-white py-12 px-4">
                    <div className="max-w-6xl mx-auto">
                        <h1 className="text-3xl md:text-4xl font-bold mb-2">{t.title}</h1>
                        <p className="text-indigo-100">{t.subtitle}</p>
                    </div>
                </div>

                {/* Courses Grid */}
                <div className="max-w-6xl mx-auto px-4 py-12">
                    {userCourses.length === 0 ? (
                        <div className="text-center py-16">
                            <Video className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                            <p className="text-gray-500 mb-6">{t.noCourses}</p>
                            <Link
                                href={`/${locale}/courses`}
                                className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                            >
                                {t.exploreCourses}
                                <ArrowRight className="w-5 h-5" />
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {userCourses.map(({ course, purchase, videoCount, isAdmin }) => (
                                <div
                                    key={course.id}
                                    className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-shadow"
                                >
                                    {/* Thumbnail */}
                                    <div className="aspect-video bg-gray-100 relative">
                                        {course.thumbnail ? (
                                            <img
                                                src={course.thumbnail}
                                                alt={course.title}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-100 to-purple-100">
                                                <Video className="w-12 h-12 text-indigo-300" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="p-5">
                                        <h3 className="font-semibold text-lg text-gray-900 mb-2">
                                            {course.title}
                                        </h3>

                                        <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                                            <span className="flex items-center gap-1">
                                                <Video className="w-4 h-4" />
                                                {videoCount} {videoCount === 1 ? t.video : t.videos}
                                            </span>
                                            {purchase?.purchasedAt && (
                                                <span className="text-xs">
                                                    {t.purchasedOn} {formatDate(new Date(purchase.purchasedAt))}
                                                </span>
                                            )}
                                            {isAdmin && (
                                                <span className="text-xs text-indigo-600">{t.adminAccess}</span>
                                            )}
                                        </div>

                                        <Link
                                            href={`/${locale}/courses/${course.id}/watch`}
                                            className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                                        >
                                            <Play className="w-4 h-4" />
                                            {t.continueWatching}
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
}
