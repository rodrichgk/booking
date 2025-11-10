import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { barbershops } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ barbershopId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const currentUserRole = (session.user as any).role;
    
    // Only dev and admin users can renew subscriptions
    if (!['dev', 'admin'].includes(currentUserRole)) {
      return NextResponse.json({ error: 'Forbidden: Insufficient permissions' }, { status: 403 });
    }

    const { barbershopId } = await params;

    // Renew subscription by updating createdAt (simulates renewal date)
    await db
      .update(barbershops)
      .set({ 
        createdAt: new Date(), // Reset creation date for subscription calculation
        updatedAt: new Date(),
        isActive: true
      })
      .where(eq(barbershops.id, barbershopId));

    return NextResponse.json({ 
      success: true, 
      message: 'Subscription renewed successfully',
      nextExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    });
  } catch (error) {
    console.error('Error renewing subscription:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
