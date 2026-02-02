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

        // Get the shop's Stripe customer ID
        const [shop] = await db
            .select({
                stripeCustomerId: barbershops.stripeCustomerId,
                name: barbershops.name,
            })
            .from(barbershops)
            .where(eq(barbershops.id, shopId));

        if (!shop || !shop.stripeCustomerId) {
            return NextResponse.json({ error: 'No Stripe customer found for this shop' }, { status: 404 });
        }

        // Verify customer exists in current Stripe mode (test vs live)
        try {
            await stripe.customers.retrieve(shop.stripeCustomerId);
        } catch (customerError: any) {
            return NextResponse.json({ 
                error: 'Stripe customer not found. This may happen if you switched from test to live mode. Please create a new subscription.' 
            }, { status: 404 });
        }

        // Create Stripe Customer Portal session
        const portalSession = await stripe.billingPortal.sessions.create({
            customer: shop.stripeCustomerId,
            return_url: `${process.env.NEXTAUTH_URL}/fr/subscription?shopId=${shopId}`,
        });

        return NextResponse.json({
            url: portalSession.url,
        });

    } catch (error: any) {
        console.error('Portal session error:', error);
        return NextResponse.json(
            { error: 'Failed to create portal session', details: error.message },
            { status: 500 }
        );
    }
}
