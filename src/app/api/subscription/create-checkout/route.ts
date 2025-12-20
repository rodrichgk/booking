import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { email, shopId } = await request.json();

    // TODO: Integrate with Stripe for real payment processing
    // For now, this is a placeholder that will be integrated with Stripe later
    // 
    // Example Stripe integration:
    // const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    // const session = await stripe.checkout.sessions.create({
    //   payment_method_types: ['card'],
    //   line_items: [{
    //     price_data: {
    //       currency: 'eur',
    //       product_data: {
    //         name: 'Barbershop Professional Plan',
    //       },
    //       recurring: {
    //         interval: 'month',
    //       },
    //       unit_amount: 2990, // €29.90 in cents
    //     },
    //     quantity: 1,
    //   }],
    //   mode: 'subscription',
    //   success_url: `${process.env.NEXTAUTH_URL}/subscription/success?shopId=${shopId}`,
    //   cancel_url: `${process.env.NEXTAUTH_URL}/subscription?shopId=${shopId}`,
    //   customer_email: email,
    //   metadata: {
    //     shopId: shopId,
    //   },
    // });

    // For demonstration purposes, return a mock success URL
    // In production, replace this with actual Stripe checkout URL
    return NextResponse.json({ 
      checkoutUrl: `/subscription/success?mock=true${shopId ? `&shopId=${shopId}` : ''}`,
      message: 'Checkout session created (demo mode)',
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
