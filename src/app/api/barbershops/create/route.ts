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

    const userEmail = session.user.email;
    if (!userEmail) {
      return NextResponse.json({ error: 'User email not found' }, { status: 400 });
    }

    // Get user ID
    const [user] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, userEmail))
      .limit(1);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const { name, description, address, city, state, zipCode, phone, email, website } = body;

    // Validate required fields
    if (!name || !address || !city) {
      return NextResponse.json(
        { error: 'Name, address, and city are required' },
        { status: 400 }
      );
    }

    // Create the barbershop with the current user as owner
    const [newBarbershop] = await db
      .insert(barbershops)
      .values({
        name,
        description: description || null,
        address,
        city,
        state: state || null,
        zipCode: zipCode || null,
        phone: phone || null,
        email: email || null,
        website: website || null,
        ownerId: user.id,
        isActive: false,
        subscriptionStatus: 'inactive',
        openingHours: {
          monday: { open: '09:00', close: '19:00', closed: false },
          tuesday: { open: '09:00', close: '19:00', closed: false },
          wednesday: { open: '09:00', close: '19:00', closed: false },
          thursday: { open: '09:00', close: '19:00', closed: false },
          friday: { open: '09:00', close: '19:00', closed: false },
          saturday: { open: '09:00', close: '18:00', closed: false },
          sunday: { open: '09:00', close: '18:00', closed: true },
        },
      })
      .returning({ id: barbershops.id });

    return NextResponse.json({
      success: true,
      barbershopId: newBarbershop.id,
    });
  } catch (error: any) {
    console.error('Error creating barbershop:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create barbershop' },
      { status: 500 }
    );
  }
}
