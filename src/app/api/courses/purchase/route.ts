import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Stripe from 'stripe';
import { db } from '@/lib/db';
import { courses, coursePurchases } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2023-10-16',
});

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { courseId } = await request.json();
        const userId = session.user.id;
        const userRole = (session.user as any).role;
        const userEmail = session.user.email;

        if (!courseId) {
            return NextResponse.json({ error: 'Course ID is required' }, { status: 400 });
        }

        // Get the course
        const [course] = await db
            .select()
            .from(courses)
            .where(eq(courses.id, courseId));

        if (!course) {
            return NextResponse.json({ error: 'Course not found' }, { status: 404 });
        }

        if (!course.isActive) {
            return NextResponse.json({ error: 'Course is not available' }, { status: 400 });
        }

        // Check if user already has access
        const [existingPurchase] = await db
            .select()
            .from(coursePurchases)
            .where(
                and(
                    eq(coursePurchases.userId, userId),
                    eq(coursePurchases.courseId, courseId),
                    eq(coursePurchases.status, 'completed')
                )
            );

        if (existingPurchase) {
            return NextResponse.json({
                alreadyPurchased: true,
                message: 'You already have access to this course'
            });
        }

        // Check for bypassed access
        const [bypassedPurchase] = await db
            .select()
            .from(coursePurchases)
            .where(
                and(
                    eq(coursePurchases.userId, userId),
                    eq(coursePurchases.courseId, courseId),
                    eq(coursePurchases.status, 'bypassed')
                )
            );

        if (bypassedPurchase) {
            return NextResponse.json({
                alreadyPurchased: true,
                message: 'You already have access to this course'
            });
        }

        // Dev and Admin bypass payment
        if (['dev', 'admin'].includes(userRole)) {
            // Create a bypassed purchase record
            const [bypassPurchase] = await db
                .insert(coursePurchases)
                .values({
                    userId: userId,
                    courseId: courseId,
                    stripePaymentIntentId: null,
                    stripeSessionId: null,
                    amountPaid: 0,
                    currency: course.currency,
                    status: 'bypassed',
                    purchasedAt: new Date(),
                })
                .returning();

            return NextResponse.json({
                bypassedAccess: true,
                message: 'Access granted (admin/dev bypass)',
                purchaseId: bypassPurchase.id,
            });
        }

        // Check if course is free
        if (course.priceInCents === 0) {
            // Create a free purchase record
            const [freePurchase] = await db
                .insert(coursePurchases)
                .values({
                    userId: userId,
                    courseId: courseId,
                    stripePaymentIntentId: null,
                    stripeSessionId: null,
                    amountPaid: 0,
                    currency: course.currency,
                    status: 'completed',
                    purchasedAt: new Date(),
                })
                .returning();

            return NextResponse.json({
                freeAccess: true,
                message: 'Free course access granted',
                purchaseId: freePurchase.id,
            });
        }

        // Check if Stripe is configured
        if (!process.env.STRIPE_SECRET_KEY) {
            return NextResponse.json({
                error: 'Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable.',
                checkoutUrl: null
            }, { status: 500 });
        }

        // Create Stripe checkout session for paid course
        const checkoutSession = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            customer_email: userEmail,
            line_items: [{
                price_data: {
                    currency: course.currency.toLowerCase(),
                    product_data: {
                        name: course.title,
                        description: course.description || 'Video Course',
                    },
                    unit_amount: course.priceInCents,
                },
                quantity: 1,
            }],
            mode: 'payment',
            success_url: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/courses/success?session_id={CHECKOUT_SESSION_ID}&courseId=${courseId}`,
            cancel_url: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/courses/${courseId}`,
            metadata: {
                courseId: courseId,
                userId: userId,
                type: 'course_purchase',
            },
        });

        // Create a pending purchase record
        await db
            .insert(coursePurchases)
            .values({
                userId: userId,
                courseId: courseId,
                stripeSessionId: checkoutSession.id,
                amountPaid: course.priceInCents,
                currency: course.currency,
                status: 'pending',
                purchasedAt: new Date(),
            });

        return NextResponse.json({
            checkoutUrl: checkoutSession.url,
            sessionId: checkoutSession.id,
        });

    } catch (error) {
        console.error('Course purchase error:', error);
        return NextResponse.json(
            { error: 'Failed to process purchase' },
            { status: 500 }
        );
    }
}
