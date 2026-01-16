import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { courses, coursePurchases } from '@/lib/db/schema';
import { eq, and, or } from 'drizzle-orm';

// GET - Check if current user has access to a course
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        const { id } = await params;

        // Check if course exists
        const [course] = await db
            .select()
            .from(courses)
            .where(eq(courses.id, id));

        if (!course) {
            return NextResponse.json({ error: 'Course not found' }, { status: 404 });
        }

        // Not logged in = no access
        if (!session || !session.user) {
            return NextResponse.json({
                hasAccess: false,
                reason: 'not_authenticated',
            });
        }

        const userId = session.user.id;
        const userRole = (session.user as any).role;

        // Dev and Admin always have access
        if (['dev', 'admin'].includes(userRole)) {
            return NextResponse.json({
                hasAccess: true,
                reason: 'admin_access',
            });
        }

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

        if (purchase) {
            return NextResponse.json({
                hasAccess: true,
                reason: 'purchased',
                purchaseId: purchase.id,
            });
        }

        // Free course check
        if (course.priceInCents === 0) {
            return NextResponse.json({
                hasAccess: true,
                reason: 'free_course',
            });
        }

        return NextResponse.json({
            hasAccess: false,
            reason: 'not_purchased',
        });
    } catch (error) {
        console.error('Error checking course access:', error);
        return NextResponse.json(
            { error: 'Failed to check access' },
            { status: 500 }
        );
    }
}
