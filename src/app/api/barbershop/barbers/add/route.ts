import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { barbers, users, barbershops } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { barbershopId, name, email, phone, password, specialties } = await request.json();

    if (!barbershopId || !name || !email || !password) {
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

    // Check if email already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser.length > 0) {
      return NextResponse.json({ 
        error: 'Un utilisateur avec cet email existe déjà' 
      }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user with barber role
    const [newUser] = await db.insert(users).values({
      name,
      email,
      phone: phone || null,
      password: hashedPassword,
      role: 'barber',
    }).returning();

    // Check if already a barber at this barbershop (shouldn't happen but safety check)
    const existingBarber = await db
      .select()
      .from(barbers)
      .where(
        and(
          eq(barbers.userId, newUser.id),
          eq(barbers.barbershopId, barbershopId)
        )
      )
      .limit(1);

    if (existingBarber.length > 0) {
      return NextResponse.json({ 
        error: 'This user is already a barber at this barbershop' 
      }, { status: 400 });
    }

    // Add the barber profile
    await db.insert(barbers).values({
      userId: newUser.id,
      barbershopId: barbershopId,
      specialties: specialties || [],
      isActive: true,
    });

    return NextResponse.json({ 
      message: 'Coiffeur créé et ajouté avec succès',
      barberId: newUser.id
    });

  } catch (error) {
    console.error('Add barber error:', error);
    return NextResponse.json(
      { error: 'Failed to add barber' },
      { status: 500 }
    );
  }
}
