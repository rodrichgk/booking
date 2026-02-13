import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { barbers, users, barbershops } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ barberId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { barberId } = await params;
    const userId = (session.user as any).id;
    const userRole = (session.user as any).role;

    // Get the barber record with barbershop info
    const barberRecord = await db
      .select()
      .from(barbers)
      .leftJoin(barbershops, eq(barbers.barbershopId, barbershops.id))
      .where(eq(barbers.id, barberId))
      .limit(1);

    if (barberRecord.length === 0) {
      return NextResponse.json({ error: 'Barber not found' }, { status: 404 });
    }

    // Check if user owns the barbershop, is co-owner, or is admin
    const shop = barberRecord[0].barbershops;
    const isOwner = shop?.ownerId === userId;
    const isCoOwner = shop?.coOwnerId === userId;
    const isAdmin = ['dev', 'admin'].includes(userRole);

    if (!isOwner && !isCoOwner && !isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Delete the barber
    await db.delete(barbers).where(eq(barbers.id, barberId));

    return NextResponse.json({ message: 'Barber removed successfully' });

  } catch (error) {
    console.error('Remove barber error:', error);
    return NextResponse.json(
      { error: 'Failed to remove barber' },
      { status: 500 }
    );
  }
}
