import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { barbershops, users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const { openingHours } = await request.json();

    // Fetch the barbershop
    const [shop] = await db
      .select({
        id: barbershops.id,
        ownerId: barbershops.ownerId,
      })
      .from(barbershops)
      .where(eq(barbershops.id, id))
      .limit(1);

    if (!shop) {
      return NextResponse.json({ error: 'Barbershop not found' }, { status: 404 });
    }

    // Check authorization
    const userRole = (session.user as any).role;
    const userEmail = session.user.email;

    if (userRole !== 'admin' && userRole !== 'dev') {
      // Check if user is the owner
      if (shop.ownerId) {
        const [owner] = await db
          .select({ email: users.email })
          .from(users)
          .where(eq(users.id, shop.ownerId))
          .limit(1);

        if (!owner || owner.email !== userEmail) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }
      } else {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      }
    }

    // Update opening hours
    await db
      .update(barbershops)
      .set({
        openingHours,
        updatedAt: new Date(),
      })
      .where(eq(barbershops.id, id));

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error updating opening hours:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update opening hours' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const [shop] = await db
      .select({
        openingHours: barbershops.openingHours,
      })
      .from(barbershops)
      .where(eq(barbershops.id, id))
      .limit(1);

    if (!shop) {
      return NextResponse.json({ error: 'Barbershop not found' }, { status: 404 });
    }

    return NextResponse.json({ openingHours: shop.openingHours });
  } catch (error: any) {
    console.error('Error fetching opening hours:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch opening hours' },
      { status: 500 }
    );
  }
}
