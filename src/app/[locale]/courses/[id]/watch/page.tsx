import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { courses, courseVideos, coursePurchases } from '@/lib/db/schema';
import { eq, and, or } from 'drizzle-orm';
import Link from 'next/link';
import { ArrowLeft, Video, Play, CheckCircle } from 'lucide-react';
import { WatchPageClient } from './watch-client';
import { Header } from '@/components/ui/header';

export async function generateMetadata({ params }: { params: Promise<{ locale: string, id: string }> }) {
    const { id } = await params;

    const [course] = await db
        .select()
        .from(courses)
        .where(eq(courses.id, id));

    return {
        title: course ? `${course.title} - Watch` : 'Watch Course',
        description: course?.description || 'Watch video course',
    };
}

export default async function WatchCoursePage({
    params,
    searchParams,
}: {
    params: Promise<{ locale: string; id: string }>;
    searchParams: Promise<{ video?: string }>;
}) {
    const { locale, id } = await params;
    const { video: videoParam } = await searchParams;
    const session = await getServerSession(authOptions);

    // Must be logged in
    if (!session || !session.user) {
        redirect(`/${locale}/auth/signin`);
    }

    // Fetch course
    const [course] = await db
        .select()
        .from(courses)
        .where(eq(courses.id, id));

    if (!course) {
        redirect(`/${locale}/courses`);
    }

    // Check access
    let hasAccess = false;
    const userId = session.user.id;
    const userRole = (session.user as any).role;

    // Dev and Admin always have access
    if (['dev', 'admin'].includes(userRole)) {
        hasAccess = true;
    } else {
        // Check for completed or bypassed purchase
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

    // Free courses are accessible
    if (course.priceInCents === 0) {
        hasAccess = true;
    }

    // No access - redirect to course detail
    if (!hasAccess) {
        redirect(`/${locale}/courses/${id}`);
    }

    // Fetch all videos with full details (since user has access)
    const videos = await db
        .select()
        .from(courseVideos)
        .where(eq(courseVideos.courseId, id))
        .orderBy(courseVideos.order);

    if (videos.length === 0) {
        redirect(`/${locale}/courses/${id}`);
    }

    // Determine current video
    const currentVideoId = videoParam || videos[0].id;
    const currentVideo = videos.find(v => v.id === currentVideoId) || videos[0];
    const currentIndex = videos.findIndex(v => v.id === currentVideo.id);

    const translations = {
        fr: {
            backToCourse: 'Retour au cours',
            curriculum: 'Programme',
            nowPlaying: 'En lecture',
        },
        en: {
            backToCourse: 'Back to course',
            curriculum: 'Curriculum',
            nowPlaying: 'Now playing',
        },
    };

    const t = translations[locale as keyof typeof translations] || translations.en;

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="min-h-screen bg-gray-900 flex flex-col">
            <Header />
            {/* Course navigation bar */}
            <div className="bg-gray-800 border-b border-gray-700">
                <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                    <Link
                        href={`/${locale}/courses/${id}`}
                        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        {t.backToCourse}
                    </Link>
                    <h1 className="text-white font-medium truncate max-w-md">{course.title}</h1>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row">
                {/* Video Player */}
                <div className="flex-1">
                    <WatchPageClient
                        currentVideo={currentVideo}
                        videos={videos}
                        courseId={id}
                        locale={locale}
                    />

                    {/* Video Info */}
                    <div className="p-6 border-b border-gray-800">
                        <h2 className="text-xl font-semibold text-white mb-2">{currentVideo.title}</h2>
                        {currentVideo.description && (
                            <p className="text-gray-400">{currentVideo.description}</p>
                        )}
                    </div>
                </div>

                {/* Sidebar - Video List */}
                <div className="lg:w-80 bg-gray-800 border-l border-gray-700">
                    <div className="p-4 border-b border-gray-700">
                        <h3 className="text-white font-medium">{t.curriculum}</h3>
                    </div>
                    <div className="overflow-y-auto max-h-[calc(100vh-200px)]">
                        {videos.map((video, index) => (
                            <Link
                                key={video.id}
                                href={`/${locale}/courses/${id}/watch?video=${video.id}`}
                                className={`flex items-center gap-3 p-4 border-b border-gray-700 transition-colors ${video.id === currentVideo.id
                                    ? 'bg-primary-600/20 border-l-2 border-l-primary-500'
                                    : 'hover:bg-gray-700/50'
                                    }`}
                            >
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${video.id === currentVideo.id
                                    ? 'bg-primary-600 text-white'
                                    : 'bg-gray-700 text-gray-300'
                                    }`}>
                                    {video.id === currentVideo.id ? (
                                        <Play className="w-4 h-4" fill="currentColor" />
                                    ) : (
                                        index + 1
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className={`text-sm truncate ${video.id === currentVideo.id ? 'text-white font-medium' : 'text-gray-300'
                                        }`}>
                                        {video.title}
                                    </p>
                                    {video.duration && (
                                        <span className="text-xs text-gray-500">
                                            {formatDuration(video.duration)}
                                        </span>
                                    )}
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
