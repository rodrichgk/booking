import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { barbers, users, barbershops } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { barbershopId, email, specialties } = await request.json();

    if (!barbershopId || !email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verify the user owns this barbershop or is admin
    const userEmail = session.user.email;
    const userRole = (session.user as any).role;

    const barbershop = await db
      .select()
      .from(barbershops)
      .leftJoin(users, eq(barbershops.ownerId, users.id))
      .where(eq(barbershops.id, barbershopId))
      .limit(1);

    if (barbershop.length === 0) {
      return NextResponse.json({ error: 'Barbershop not found' }, { status: 404 });
    }

    const isOwner = barbershop[0].user?.email === userEmail;
    const isAdmin = ['dev', 'admin'].includes(userRole);

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Find the user to add as barber
    const userToAdd = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (userToAdd.length === 0) {
      return NextResponse.json({ 
        error: 'User not found. The user must have an account on the platform first.' 
      }, { status: 404 });
    }

    // Check if already a barber at this barbershop
    const existingBarber = await db
      .select()
      .from(barbers)
      .where(
        and(
          eq(barbers.userId, userToAdd[0].id),
          eq(barbers.barbershopId, barbershopId)
        )
      )
      .limit(1);

    if (existingBarber.length > 0) {
      return NextResponse.json({ 
        error: 'This user is already a barber at this barbershop' 
      }, { status: 400 });
    }

    // Add the barber
    await db.insert(barbers).values({
      userId: userToAdd[0].id,
      barbershopId: barbershopId,
      specialties: specialties || [],
      isActive: true,
    });

    return NextResponse.json({ 
      message: 'Barber added successfully',
      barberId: userToAdd[0].id
    });

  } catch (error) {
    console.error('Add barber error:', error);
    return NextResponse.json(
      { error: 'Failed to add barber' },
      { status: 500 }
    );
  }
}
