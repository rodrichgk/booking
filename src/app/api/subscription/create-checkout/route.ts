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

    const { email, shopId } = await request.json();
    const userRole = (session.user as any).role;

    if (!shopId) {
      return NextResponse.json({ error: 'Shop ID is required' }, { status: 400 });
    }

    // Admin/Dev bypass for testing - skip payment and go directly to success
    if (userRole === 'admin' || userRole === 'dev') {
      // For admin/dev, directly activate the subscription in DB
      const currentPeriodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

      await db
        .update(barbershops)
        .set({
          subscriptionStatus: 'active',
          currentPeriodEnd: currentPeriodEnd,
          isActive: true,
          updatedAt: new Date(),
        })
        .where(eq(barbershops.id, shopId));

      return NextResponse.json({
        checkoutUrl: `/subscription/success?bypass=true&shopId=${shopId}`,
        message: 'Admin bypass - subscription activated',
        shopId: shopId,
        bypass: true
      });
    }

    // Regular users - create Stripe checkout session
    if (!process.env.STRIPE_SECRET_KEY) {
      // Fallback if Stripe is not configured
      return NextResponse.json({
        checkoutUrl: `/subscription/success?mock=true&shopId=${shopId}`,
        message: 'Stripe not configured - demo mode',
        shopId: shopId
      });
    }

    // Get the barbershop to check for existing customer
    const [shop] = await db
      .select({
        id: barbershops.id,
        stripeCustomerId: barbershops.stripeCustomerId,
        name: barbershops.name,
      })
      .from(barbershops)
      .where(eq(barbershops.id, shopId));

    if (!shop) {
      return NextResponse.json({ error: 'Barbershop not found' }, { status: 404 });
    }

    // Create or retrieve Stripe customer
    let customerId = shop.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: email,
        metadata: {
          shopId: shopId,
          shopName: shop.name || '',
        },
      });
      customerId = customer.id;

      // Store customer ID
      await db
        .update(barbershops)
        .set({ stripeCustomerId: customerId, updatedAt: new Date() })
        .where(eq(barbershops.id, shopId));
    }

    // Create checkout session with subscription mode
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'eur',
          product_data: {
            name: 'AfroBook - Barbershop Professional Plan',
            description: 'Monthly subscription for barbershop listing and booking management',
          },
          recurring: {
            interval: 'month',
          },
          unit_amount: 2990, // €29.90 in cents
        },
        quantity: 1,
      }],
      mode: 'subscription',
      success_url: `${process.env.NEXTAUTH_URL}/{locale}/subscription/success?session_id={CHECKOUT_SESSION_ID}&shopId=${shopId}`.replace('{locale}', 'fr'),
      cancel_url: `${process.env.NEXTAUTH_URL}/subscription?shopId=${shopId}`,
      metadata: {
        shopId: shopId,
        userEmail: email,
      },
      subscription_data: {
        metadata: {
          shopId: shopId,
        },
      },
    });

    return NextResponse.json({
      checkoutUrl: checkoutSession.url,
      message: 'Stripe checkout session created',
      shopId: shopId
    });

  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
