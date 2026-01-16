import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { courses, courseVideos } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';

// GET - List all courses (admin only)
export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userRole = (session.user as any).role;
        if (!['dev', 'admin'].includes(userRole)) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const allCourses = await db
            .select()
            .from(courses)
            .orderBy(desc(courses.createdAt));

        // Get video counts for each course
        const coursesWithVideos = await Promise.all(
            allCourses.map(async (course) => {
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

// POST - Create a new course (admin only)
export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userRole = (session.user as any).role;
        if (!['dev', 'admin'].includes(userRole)) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const body = await request.json();
        const { title, description, thumbnail, priceInCents, currency, isActive, isFeatured } = body;

        if (!title) {
            return NextResponse.json({ error: 'Title is required' }, { status: 400 });
        }

        const [newCourse] = await db
            .insert(courses)
            .values({
                title,
                description: description || null,
                thumbnail: thumbnail || null,
                priceInCents: priceInCents || 0,
                currency: currency || 'EUR',
                isActive: isActive !== undefined ? isActive : true,
                isFeatured: isFeatured || false,
                createdBy: session.user.id,
                createdAt: new Date(),
                updatedAt: new Date(),
            })
            .returning();

        return NextResponse.json({ course: newCourse }, { status: 201 });
    } catch (error) {
        console.error('Error creating course:', error);
        return NextResponse.json(
            { error: 'Failed to create course' },
            { status: 500 }
        );
    }
}
