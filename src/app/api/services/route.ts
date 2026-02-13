import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { services, barbershops, users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { barbershopId, name, description, image, price, duration, category } = await request.json();

    if (!barbershopId || !name || !price || !duration) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
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

    // Create the service
    const [newService] = await db.insert(services).values({
      barbershopId,
      name,
      description: description || null,
      image: image || null,
      price: price.toString(),
      duration,
      category: category || null,
      isActive: true,
    }).returning();

    return NextResponse.json({ 
      message: 'Service créé avec succès',
      service: newService
    });

  } catch (error) {
    console.error('Create service error:', error);
    return NextResponse.json(
      { error: 'Failed to create service' },
      { status: 500 }
    );
  }
}
