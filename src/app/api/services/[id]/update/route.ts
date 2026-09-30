import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { services } from '@/lib/db/schema';
import { canManageShop } from '@/lib/shop-access';
import { eq } from 'drizzle-orm';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    // Get the service
    const [service] = await db
      .select()
      .from(services)
      .where(eq(services.id, id))
      .limit(1);

    if (!service) {
      return NextResponse.json(
        { error: 'Service non trouvé' },
        { status: 404 }
      );
    }

    // Owner, co-owner or admin of the service's shop
    if (!(await canManageShop(session, service.barbershopId))) {
      return NextResponse.json(
        { error: 'Non autorisé à modifier ce service' },
        { status: 403 }
      );
    }

    // Update service
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (body.name !== undefined) {
      updateData.name = body.name;
    }
    if (body.description !== undefined) {
      updateData.description = body.description;
    }
    if (body.image !== undefined) {
      updateData.image = body.image;
    }
    if (body.price !== undefined) {
      updateData.price = body.price;
    }
    if (body.duration !== undefined) {
      updateData.duration = body.duration;
    }
    if (body.category !== undefined) {
      updateData.category = body.category;
    }
    if (body.isActive !== undefined) {
      updateData.isActive = body.isActive;
    }

    await db
      .update(services)
      .set(updateData)
      .where(eq(services.id, id));

    return NextResponse.json({
      success: true,
      message: 'Service mis à jour avec succès',
    });
  } catch (error) {
    console.error('Error updating service:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue' },
      { status: 500 }
    );
  }
}
