import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { services, barbershops, users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const { name, description, image, price, duration, category } = await request.json();

    if (!name || !price || !duration) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get the service to verify ownership
    const [service] = await db
      .select()
      .from(services)
      .where(eq(services.id, id))
      .limit(1);

    if (!service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }

    // Verify the user owns the barbershop or is admin
    const userEmail = session.user.email;
    const userRole = (session.user as any).role;

    const barbershop = await db
      .select()
      .from(barbershops)
      .leftJoin(users, eq(barbershops.ownerId, users.id))
      .where(eq(barbershops.id, service.barbershopId))
      .limit(1);

    if (barbershop.length === 0) {
      return NextResponse.json({ error: 'Barbershop not found' }, { status: 404 });
    }

    const isOwner = barbershop[0].user?.email === userEmail;
    const isAdmin = ['dev', 'admin'].includes(userRole);

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Update the service
    const [updatedService] = await db
      .update(services)
      .set({
        name,
        description: description || null,
        image: image || null,
        price: price.toString(),
        duration,
        category: category || null,
        updatedAt: new Date(),
      })
      .where(eq(services.id, id))
      .returning();

    return NextResponse.json({ 
      message: 'Service modifié avec succès',
      service: updatedService
    });

  } catch (error) {
    console.error('Update service error:', error);
    return NextResponse.json(
      { error: 'Failed to update service' },
      { status: 500 }
    );
  }
}
