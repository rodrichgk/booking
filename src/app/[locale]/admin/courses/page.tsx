import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { db } from '@/lib/db';
import { courses, courseVideos } from '@/lib/db/schema';
import { desc, eq } from 'drizzle-orm';
import { CoursesClient } from './client';
import { Header } from '@/components/ui/header';
import { Footer } from '@/components/ui/footer';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'admin' });

    return {
        title: t('courses') || 'Courses Management',
        description: t('coursesDesc') || 'Manage video courses',
    };
}

export default async function CoursesPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        redirect(`/${locale}/auth/signin`);
    }

    const userRole = (session.user as any).role;
    if (!['dev', 'admin'].includes(userRole)) {
        redirect(`/${locale}/profile`);
    }

    // Fetch all courses with video counts
    let allCourses: any[] = [];
    try {
        const coursesData = await db
            .select()
            .from(courses)
            .orderBy(desc(courses.createdAt));

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
    } catch (error) {
        console.error('Error loading courses:', error);
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Header />
            <main className="flex-1">
                <CoursesClient
                    initialCourses={allCourses}
                    locale={locale}
                    currentUserRole={userRole}
                />
            </main>
            <Footer />
        </div>
    );
}

