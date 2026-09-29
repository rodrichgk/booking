import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { courses, courseVideos, coursePurchases } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// GET - Get single course with videos
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

        const purchases = await db
            .select()
            .from(coursePurchases)
            .where(eq(coursePurchases.courseId, id));

        return NextResponse.json({
            course,
            videos,
            purchaseCount: purchases.length,
            totalRevenue: purchases.reduce((sum, p) => sum + (p.amountPaid || 0), 0),
        });
    } catch (error) {
        console.error('Error fetching course:', error);
        return NextResponse.json(
            { error: 'Failed to fetch course' },
            { status: 500 }
        );
    }
}

// PATCH - Update course
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

        const { id } = await params;
        const body = await request.json();
        const { title, description, thumbnail, priceInCents, currency, isActive, isFeatured } = body;

        const [existingCourse] = await db
            .select()
            .from(courses)
            .where(eq(courses.id, id));

        if (!existingCourse) {
            return NextResponse.json({ error: 'Course not found' }, { status: 404 });
        }

        const updateData: any = { updatedAt: new Date() };
        if (title !== undefined) updateData.title = title;
        if (description !== undefined) updateData.description = description;
        if (thumbnail !== undefined) updateData.thumbnail = thumbnail;
        if (priceInCents !== undefined) updateData.priceInCents = priceInCents;
        if (currency !== undefined) updateData.currency = currency;
        if (isActive !== undefined) updateData.isActive = isActive;
        if (isFeatured !== undefined) updateData.isFeatured = isFeatured;

        const [updatedCourse] = await db
            .update(courses)
            .set(updateData)
            .where(eq(courses.id, id))
            .returning();

        return NextResponse.json({ course: updatedCourse });
    } catch (error) {
        console.error('Error updating course:', error);
        return NextResponse.json(
            { error: 'Failed to update course' },
            { status: 500 }
        );
    }
}

// DELETE - Delete course
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

        const { id } = await params;

        const [existingCourse] = await db
            .select()
            .from(courses)
            .where(eq(courses.id, id));

        if (!existingCourse) {
            return NextResponse.json({ error: 'Course not found' }, { status: 404 });
        }

        // Purchase records are payment history and reference the course, so a
        // purchased course can't be deleted — it should be deactivated instead.
        const [purchase] = await db
            .select({ id: coursePurchases.id })
            .from(coursePurchases)
            .where(eq(coursePurchases.courseId, id))
            .limit(1);

        if (purchase) {
            return NextResponse.json(
                { error: 'This course has purchases and cannot be deleted. Deactivate it instead.' },
                { status: 409 }
            );
        }

        // Delete videos first (cascade should handle this, but being explicit)
        await db.delete(courseVideos).where(eq(courseVideos.courseId, id));

        // Delete the course
        await db.delete(courses).where(eq(courses.id, id));

        return NextResponse.json({ message: 'Course deleted successfully' });
    } catch (error) {
        console.error('Error deleting course:', error);
        return NextResponse.json(
            { error: 'Failed to delete course' },
            { status: 500 }
        );
    }
}
