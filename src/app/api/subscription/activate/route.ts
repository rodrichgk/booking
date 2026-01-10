import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { barbershops } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { shopId, stripeSubscriptionId } = await request.json();

    if (!shopId) {
      return NextResponse.json({ error: 'Shop ID is required' }, { status: 400 });
    }

    // Verify the barbershop exists
    const [barbershop] = await db
      .select()
      .from(barbershops)
      .where(eq(barbershops.id, shopId));

    if (!barbershop) {
      return NextResponse.json({ error: 'Barbershop not found' }, { status: 404 });
    }

    // Calculate subscription period end (30 days from now)
    const currentPeriodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    // Update the barbershop to activate subscription
    await db
      .update(barbershops)
      .set({
        subscriptionStatus: 'active',
        currentPeriodEnd: currentPeriodEnd,
        stripeSubscriptionId: stripeSubscriptionId || barbershop.stripeSubscriptionId,
        isActive: true,
        updatedAt: new Date(),
      })
      .where(eq(barbershops.id, shopId));

    return NextResponse.json({
      success: true,
      message: 'Subscription activated successfully',
      shopId: shopId,
      subscriptionStatus: 'active',
      expiresAt: currentPeriodEnd.toISOString()
    });

  } catch (error) {
    console.error('Subscription activation error:', error);
    return NextResponse.json(
      { error: 'Failed to activate subscription' },
      { status: 500 }
    );
  }
}
