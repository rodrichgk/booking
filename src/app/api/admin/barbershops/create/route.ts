import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { barbershops, users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userRole = (session.user as any).role;
    if (!['dev', 'admin'].includes(userRole)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { name, description, address, city, phone, email, website, ownerEmail } = await request.json();

    if (!name || !address || !city || !ownerEmail) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Find the owner
    const owner = await db
      .select()
      .from(users)
      .where(eq(users.email, ownerEmail))
      .limit(1);

    if (owner.length === 0) {
      return NextResponse.json({ 
        error: 'Owner not found. The user must have an account first.' 
      }, { status: 404 });
    }

    // Create the barbershop
    const newBarbershop = await db.insert(barbershops).values({
      name,
      description: description || null,
      address,
      city,
      phone: phone || null,
      email: email || null,
      website: website || null,
      ownerId: owner[0].id,
      isActive: false, // Inactive until subscription is paid
      rating: '0',
      reviewCount: 0,
    }).returning();

    return NextResponse.json({ 
      message: 'Barbershop created successfully',
      barbershop: newBarbershop[0]
    });

  } catch (error) {
    console.error('Create barbershop error:', error);
    return NextResponse.json(
      { error: 'Failed to create barbershop' },
      { status: 500 }
    );
  }
}
