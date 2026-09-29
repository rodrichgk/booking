import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { barbershops, users, barbers, services, bookings, reviews } from '@/lib/db/schema';
import { eq, or, inArray } from 'drizzle-orm';

export async function DELETE(
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

    // Delete the shop and everything that references it in one transaction, so a
    // failure part-way can't leave the shop half-deleted. Reviews go first: they
    // reference the shop's bookings, barbers and the shop itself.
    await db.transaction(async (tx) => {
      const shopBookingIds = tx.select({ id: bookings.id }).from(bookings).where(eq(bookings.barbershopId, id));
      const shopBarberIds = tx.select({ id: barbers.id }).from(barbers).where(eq(barbers.barbershopId, id));

      await tx.delete(reviews).where(
        or(
          eq(reviews.barbershopId, id),
          inArray(reviews.bookingId, shopBookingIds),
          inArray(reviews.barberId, shopBarberIds)
        )
      );
      await tx.delete(bookings).where(eq(bookings.barbershopId, id));
      await tx.delete(services).where(eq(services.barbershopId, id));
      await tx.delete(barbers).where(eq(barbers.barbershopId, id));
      await tx.delete(barbershops).where(eq(barbershops.id, id));
    });

    return NextResponse.json({ 
      success: true,
      message: 'Salon supprimé avec succès'
    });
  } catch (error) {
    console.error('Error deleting barbershop:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
