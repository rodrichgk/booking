import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Stripe from 'stripe';
import { db } from '@/lib/db';
import { barbershops } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2023-10-16',
});

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { shopId } = await request.json();

        if (!shopId) {
            return NextResponse.json({ error: 'Shop ID is required' }, { status: 400 });
        }

        // Get the shop's Stripe subscription ID
        const [shop] = await db
            .select({
                stripeSubscriptionId: barbershops.stripeSubscriptionId,
                name: barbershops.name,
                ownerId: barbershops.ownerId,
            })
            .from(barbershops)
            .where(eq(barbershops.id, shopId));

        if (!shop) {
            return NextResponse.json({ error: 'Barbershop not found' }, { status: 404 });
        }

        if (!shop.stripeSubscriptionId) {
            return NextResponse.json({ error: 'No active subscription found' }, { status: 404 });
        }

        // Cancel the subscription at period end (customer keeps access until end of billing cycle)
        const subscription = await stripe.subscriptions.update(shop.stripeSubscriptionId, {
            cancel_at_period_end: true,
        });

        // Update local database
        await db
            .update(barbershops)
            .set({
                subscriptionStatus: 'canceled',
                updatedAt: new Date(),
            })
            .where(eq(barbershops.id, shopId));

        return NextResponse.json({
            success: true,
            message: 'Subscription will be canceled at the end of the current billing period',
            cancelAt: subscription.cancel_at ? new Date(subscription.cancel_at * 1000).toISOString() : null,
            currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
        });

    } catch (error: any) {
        console.error('Cancel subscription error:', error);
        return NextResponse.json(
            { error: 'Failed to cancel subscription', details: error.message },
            { status: 500 }
        );
    }
}
