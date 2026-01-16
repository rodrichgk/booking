import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { courses, courseVideos } from '@/lib/db/schema';
import { eq, desc, and } from 'drizzle-orm';

// GET - List active courses (public)
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const featured = searchParams.get('featured');

        let query = db
            .select()
            .from(courses)
            .where(eq(courses.isActive, true))
            .orderBy(desc(courses.createdAt));

        const allCourses = await query;

        // Filter featured if requested
        let filteredCourses = allCourses;
        if (featured === 'true') {
            filteredCourses = allCourses.filter(c => c.isFeatured);
        }

        // Get video counts for each course
        const coursesWithVideos = await Promise.all(
            filteredCourses.map(async (course) => {
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

        return NextResponse.json({ courses: coursesWithVideos });
    } catch (error) {
        console.error('Error fetching courses:', error);
        return NextResponse.json(
            { error: 'Failed to fetch courses' },
            { status: 500 }
        );
    }
}
