import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { barbershops, users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userRole = (session.user as any).role;
    const userEmail = session.user.email;

    // Get barbershop
    const [shop] = await db
      .select()
      .from(barbershops)
      .where(eq(barbershops.id, id))
      .limit(1);

    if (!shop) {
      return NextResponse.json({ error: 'Barbershop not found' }, { status: 404 });
    }

    // Verify ownership or admin access
    if (userRole !== 'admin' && userRole !== 'dev') {
      if (!shop.ownerId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      }

      const [owner] = await db
        .select({ email: users.email })
        .from(users)
        .where(eq(users.id, shop.ownerId))
        .limit(1);

      if (!owner || owner.email !== userEmail) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      }
    }

    // Toggle isActive status
    const newStatus = !shop.isActive;
    await db
      .update(barbershops)
      .set({ isActive: newStatus })
      .where(eq(barbershops.id, id));

    return NextResponse.json({ 
      success: true, 
      isActive: newStatus,
      message: newStatus ? 'Salon activé' : 'Salon désactivé'
    });
  } catch (error) {
    console.error('Error toggling barbershop status:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
