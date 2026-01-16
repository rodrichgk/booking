import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getTranslations } from 'next-intl/server';
import { db } from '@/lib/db';
import { courses, courseVideos, coursePurchases } from '@/lib/db/schema';
import { eq, desc, and, or } from 'drizzle-orm';
import Link from 'next/link';
import { Video, Clock, Star, Play } from 'lucide-react';
import { Header } from '@/components/ui/header';
import { Footer } from '@/components/ui/footer';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;

    return {
        title: locale === 'fr' ? 'Cours Vidéo' : 'Video Courses',
        description: locale === 'fr'
            ? 'Apprenez des meilleurs professionnels avec nos cours vidéo'
            : 'Learn from the best professionals with our video courses',
    };
}

export default async function CoursesPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const session = await getServerSession(authOptions);

    const translations = {
        fr: {
            title: 'Cours Vidéo',
            subtitle: 'Apprenez des meilleurs professionnels',
            free: 'Gratuit',
            videos: 'vidéos',
            video: 'vidéo',
            viewCourse: 'Voir le cours',
            purchased: 'Acheté',
            noCourses: 'Aucun cours disponible pour le moment',
            featured: 'En vedette',
        },
        en: {
            title: 'Video Courses',
            subtitle: 'Learn from the best professionals',
            free: 'Free',
            videos: 'videos',
            video: 'video',
            viewCourse: 'View Course',
            purchased: 'Purchased',
            noCourses: 'No courses available at the moment',
            featured: 'Featured',
        },
    };

    const t = translations[locale as keyof typeof translations] || translations.en;

    // Fetch active courses
    let allCourses: any[] = [];
    let userPurchases: string[] = [];

    try {
        const coursesData = await db
            .select()
            .from(courses)
            .where(eq(courses.isActive, true))
            .orderBy(desc(courses.isFeatured), desc(courses.createdAt));

        allCourses = await Promise.all(
            coursesData.map(async (course) => {
                const videos = await db
                    .select()
                    .from(courseVideos)
                    .where(eq(courseVideos.courseId, course.id));
                return {
                    ...course,
                    videoCount: videos.length,
                };
            })
        );

        // Get user's purchases if logged in
        if (session?.user?.id) {
            const purchases = await db
                .select({ courseId: coursePurchases.courseId })
                .from(coursePurchases)
                .where(
                    and(
                        eq(coursePurchases.userId, session.user.id),
                        or(
                            eq(coursePurchases.status, 'completed'),
                            eq(coursePurchases.status, 'bypassed')
                        )
                    )
                );
            userPurchases = purchases.map(p => p.courseId);
        }
    } catch (error) {
        console.error('Error loading courses:', error);
    }

    const formatPrice = (cents: number, currency: string) => {
        if (cents === 0) return t.free;
        return new Intl.NumberFormat(locale === 'fr' ? 'fr-FR' : 'en-US', {
            style: 'currency',
            currency: currency,
        }).format(cents / 100);
    };

    const userRole = (session?.user as any)?.role;
    const hasAdminAccess = ['dev', 'admin'].includes(userRole);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Header />
            <main className="flex-1">
                {/* Hero Section */}
                <div className="bg-gradient-to-br from-indigo-600 to-purple-700 text-white py-16 px-4">
                    <div className="max-w-6xl mx-auto text-center">
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">{t.title}</h1>
                        <p className="text-xl text-indigo-100">{t.subtitle}</p>
                    </div>
                </div>

                {/* Courses Grid */}
                <div className="max-w-6xl mx-auto px-4 py-12">
                    {allCourses.length === 0 ? (
                        <div className="text-center py-16">
                            <Video className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                            <p className="text-gray-500">{t.noCourses}</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {allCourses.map((course) => {
                                const isPurchased = userPurchases.includes(course.id) || hasAdminAccess;

                                return (
                                    <Link
                                        key={course.id}
                                        href={`/${locale}/courses/${course.id}`}
                                        className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300 group"
                                    >
                                        {/* Thumbnail */}
                                        <div className="aspect-video bg-gray-100 relative overflow-hidden">
                                            {course.thumbnail ? (
                                                <img
                                                    src={course.thumbnail}
                                                    alt={course.title}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-100 to-purple-100">
                                                    <Video className="w-12 h-12 text-indigo-300" />
                                                </div>
                                            )}

                                            {/* Badges */}
                                            <div className="absolute top-3 left-3 flex gap-2">
                                                {course.isFeatured && (
                                                    <span className="px-2 py-1 bg-yellow-500 text-white text-xs font-medium rounded-full flex items-center gap-1">
                                                        <Star className="w-3 h-3" fill="currentColor" />
                                                        {t.featured}
                                                    </span>
                                                )}
                                                {isPurchased && (
                                                    <span className="px-2 py-1 bg-green-500 text-white text-xs font-medium rounded-full">
                                                        {t.purchased}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Play overlay */}
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                                <div className="w-14 h-14 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity transform scale-90 group-hover:scale-100">
                                                    <Play className="w-6 h-6 text-indigo-600 ml-1" fill="currentColor" />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div className="p-5">
                                            <h3 className="font-semibold text-lg text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">
                                                {course.title}
                                            </h3>

                                            {course.description && (
                                                <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                                                    {course.description}
                                                </p>
                                            )}

                                            <div className="flex items-center justify-between">
                                                <span className="flex items-center gap-1.5 text-sm text-gray-500">
                                                    <Video className="w-4 h-4" />
                                                    {course.videoCount} {course.videoCount === 1 ? t.video : t.videos}
                                                </span>

                                                <span className={`font-bold ${course.priceInCents === 0 ? 'text-green-600' : 'text-indigo-600'}`}>
                                                    {formatPrice(course.priceInCents, course.currency)}
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
}
