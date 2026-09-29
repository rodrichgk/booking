import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { barbers, users, barbershops } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { getPasswordMinLength } from '@/lib/settings';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { barbershopId, name, email, phone, password, specialties, barberType, username } = await request.json();

    if (!barbershopId || !name || !email || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate username format if provided
    if (username) {
      if (username.length < 3) {
        return NextResponse.json({ error: 'Le nom d\'utilisateur doit contenir au moins 3 caractères' }, { status: 400 });
      }
      if (!/^[a-zA-Z0-9_.-]+$/.test(username)) {
        return NextResponse.json({ error: 'Le nom d\'utilisateur ne peut contenir que des lettres, chiffres, points, tirets et underscores' }, { status: 400 });
      }
      const existingUsername = await db.select().from(users).where(eq(users.username, username)).limit(1);
      if (existingUsername.length > 0) {
        return NextResponse.json({ error: 'Ce nom d\'utilisateur est déjà pris' }, { status: 400 });
      }
    }

    // Verify the user owns this barbershop or is admin
    const userId = (session.user as any).id;
    const userRole = (session.user as any).role;

    const [barbershop] = await db
      .select()
      .from(barbershops)
      .where(eq(barbershops.id, barbershopId))
      .limit(1);

    if (!barbershop) {
      return NextResponse.json({ error: 'Barbershop not found' }, { status: 404 });
    }

    const isOwner = barbershop.ownerId === userId;
    const isCoOwner = barbershop.coOwnerId === userId;
    const isAdmin = ['dev', 'admin'].includes(userRole);

    if (!isOwner && !isCoOwner && !isAdmin) {
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

    const minLength = await getPasswordMinLength();
    if (typeof password !== 'string' || password.length < minLength) {
      return NextResponse.json(
        { error: `Le mot de passe doit contenir au moins ${minLength} caractères` },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user with barber role
    const [newUser] = await db.insert(users).values({
      name,
      email,
      username: username || undefined,
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
      barberType: barberType || null,
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
