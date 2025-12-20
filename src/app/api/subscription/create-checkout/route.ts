import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Stripe from 'stripe';

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

    // Admin/Dev bypass for testing - skip payment and go directly to success
    if (userRole === 'admin' || userRole === 'dev') {
      return NextResponse.json({ 
        checkoutUrl: `/subscription/success?bypass=true${shopId ? `&shopId=${shopId}` : ''}`,
        message: 'Admin bypass - subscription activated',
        shopId: shopId,
        bypass: true
      });
    }

    // Regular users - create Stripe checkout session
    if (!process.env.STRIPE_SECRET_KEY) {
      // Fallback if Stripe is not configured
      return NextResponse.json({ 
        checkoutUrl: `/subscription/success?mock=true${shopId ? `&shopId=${shopId}` : ''}`,
        message: 'Stripe not configured - demo mode',
        shopId: shopId
      });
    }

    const checkoutSession = await stripe.checkout.sessions.create({
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
      success_url: `${process.env.NEXTAUTH_URL}/subscription/success?session_id={CHECKOUT_SESSION_ID}${shopId ? `&shopId=${shopId}` : ''}`,
      cancel_url: `${process.env.NEXTAUTH_URL}/subscription?shopId=${shopId}`,
      customer_email: email,
      metadata: {
        shopId: shopId || '',
        userEmail: email,
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
