import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { courseVideos, courses } from '@/lib/db/schema';
import { eq, and, max } from 'drizzle-orm';

// GET - List all videos for a course
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userRole = (session.user as any).role;
        if (!['dev', 'admin'].includes(userRole)) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { id } = await params;

        // Verify course exists
        const [course] = await db
            .select()
            .from(courses)
            .where(eq(courses.id, id));

        if (!course) {
            return NextResponse.json({ error: 'Course not found' }, { status: 404 });
        }

        const videos = await db
            .select()
            .from(courseVideos)
            .where(eq(courseVideos.courseId, id))
            .orderBy(courseVideos.order);

        return NextResponse.json({ videos });
    } catch (error) {
        console.error('Error fetching videos:', error);
        return NextResponse.json(
            { error: 'Failed to fetch videos' },
            { status: 500 }
        );
    }
}

// POST - Add a video to a course
export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userRole = (session.user as any).role;
        if (!['dev', 'admin'].includes(userRole)) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { id } = await params;

        // Verify course exists
        const [course] = await db
            .select()
            .from(courses)
            .where(eq(courses.id, id));

        if (!course) {
            return NextResponse.json({ error: 'Course not found' }, { status: 404 });
        }

        const body = await request.json();
        const { title, description, youtubeVideoId, duration } = body;

        if (!title || !youtubeVideoId) {
            return NextResponse.json(
                { error: 'Title and YouTube Video ID are required' },
                { status: 400 }
            );
        }

        // Get the next order number
        const existingVideos = await db
            .select()
            .from(courseVideos)
            .where(eq(courseVideos.courseId, id));

        const maxOrder = existingVideos.reduce((max, v) => Math.max(max, v.order || 0), 0);

        const [newVideo] = await db
            .insert(courseVideos)
            .values({
                courseId: id,
                title,
                description: description || null,
                youtubeVideoId,
                order: maxOrder + 1,
                duration: duration || null,
                createdAt: new Date(),
                updatedAt: new Date(),
            })
            .returning();

        return NextResponse.json({ video: newVideo }, { status: 201 });
    } catch (error) {
        console.error('Error adding video:', error);
        return NextResponse.json(
            { error: 'Failed to add video' },
            { status: 500 }
        );
    }
}

// PATCH - Update video order or details
export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userRole = (session.user as any).role;
        if (!['dev', 'admin'].includes(userRole)) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { id } = await params; // This is the course ID
        const body = await request.json();
        const { videoId, title, description, youtubeVideoId, order, duration } = body;

        if (!videoId) {
            return NextResponse.json({ error: 'Video ID is required' }, { status: 400 });
        }

        const [existingVideo] = await db
            .select()
            .from(courseVideos)
            .where(and(eq(courseVideos.id, videoId), eq(courseVideos.courseId, id)));

        if (!existingVideo) {
            return NextResponse.json({ error: 'Video not found' }, { status: 404 });
        }

        const updateData: any = { updatedAt: new Date() };
        if (title !== undefined) updateData.title = title;
        if (description !== undefined) updateData.description = description;
        if (youtubeVideoId !== undefined) updateData.youtubeVideoId = youtubeVideoId;
        if (order !== undefined) updateData.order = order;
        if (duration !== undefined) updateData.duration = duration;

        const [updatedVideo] = await db
            .update(courseVideos)
            .set(updateData)
            .where(eq(courseVideos.id, videoId))
            .returning();

        return NextResponse.json({ video: updatedVideo });
    } catch (error) {
        console.error('Error updating video:', error);
        return NextResponse.json(
            { error: 'Failed to update video' },
            { status: 500 }
        );
    }
}

// DELETE - Remove a video from a course
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userRole = (session.user as any).role;
        if (!['dev', 'admin'].includes(userRole)) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { id } = await params; // Course ID
        const { searchParams } = new URL(request.url);
        const videoId = searchParams.get('videoId');

        if (!videoId) {
            return NextResponse.json({ error: 'Video ID is required' }, { status: 400 });
        }

        const [existingVideo] = await db
            .select()
            .from(courseVideos)
            .where(and(eq(courseVideos.id, videoId), eq(courseVideos.courseId, id)));

        if (!existingVideo) {
            return NextResponse.json({ error: 'Video not found' }, { status: 404 });
        }

        await db.delete(courseVideos).where(eq(courseVideos.id, videoId));

        return NextResponse.json({ message: 'Video deleted successfully' });
    } catch (error) {
        console.error('Error deleting video:', error);
        return NextResponse.json(
            { error: 'Failed to delete video' },
            { status: 500 }
        );
    }
}
