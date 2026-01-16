import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { courses, courseVideos } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// GET - Get course details (public)
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const [course] = await db
            .select()
            .from(courses)
            .where(eq(courses.id, id));

        if (!course) {
            return NextResponse.json({ error: 'Course not found' }, { status: 404 });
        }

        // Don't show inactive courses to public
        if (!course.isActive) {
            return NextResponse.json({ error: 'Course not available' }, { status: 404 });
        }

        // Get videos (only basic info for public - titles only)
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

        return NextResponse.json({
            course,
            videos,
            videoCount: videos.length,
        });
    } catch (error) {
        console.error('Error fetching course:', error);
        return NextResponse.json(
            { error: 'Failed to fetch course' },
            { status: 500 }
        );
    }
}
