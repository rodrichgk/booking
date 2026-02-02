import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { barbershops } from '@/lib/db/schema';
import { isNotNull } from 'drizzle-orm';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userRole = (session.user as any).role;
    if (userRole !== 'admin' && userRole !== 'dev') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Clear all Stripe customer IDs (they were from test mode)
    const result = await db
      .update(barbershops)
      .set({ stripeCustomerId: null, updatedAt: new Date() })
      .where(isNotNull(barbershops.stripeCustomerId));

    return NextResponse.json({
      success: true,
      message: 'All test-mode Stripe customer IDs have been cleared. New live-mode customers will be created on next subscription attempt.',
    });

  } catch (error: any) {
    console.error('Fix stripe customers error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fix stripe customers' },
      { status: 500 }
    );
  }
}
