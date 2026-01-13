import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Stripe from 'stripe';
import { db } from '@/lib/db';
import { barbershops } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getSubscriptionPriceCents, getSetting } from '@/lib/settings';

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

    // Check if Stripe is configured
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({
        error: 'Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable.',
        checkoutUrl: null
      }, { status: 500 });
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

    // Get dynamic subscription price from settings
    const priceInCents = await getSubscriptionPriceCents();
    const paymentSettings = await getSetting('payment');
    const currency = paymentSettings.currency.toLowerCase();

    // Create checkout session with subscription mode
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: currency,
          product_data: {
            name: 'Orphelia - Abonnement Salon Professionnel',
            description: 'Abonnement mensuel pour la gestion de salon et réservations',
          },
          recurring: {
            interval: 'month',
          },
          unit_amount: priceInCents,
        },
        quantity: 1,
      }],
      mode: 'subscription',
      success_url: `https://www.orphelia.net/fr/subscription/success?session_id={CHECKOUT_SESSION_ID}&shopId=${shopId}`,
      cancel_url: `https://www.orphelia.net/fr/subscription?shopId=${shopId}`,
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
