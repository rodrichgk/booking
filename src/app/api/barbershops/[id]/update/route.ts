import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { barbershops } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function PUT(
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
    const { name, address, city, phone, email, website, description } = body;

    // Validate required fields
    if (!name || !address || !city) {
      return NextResponse.json(
        { error: 'Nom, adresse et ville sont requis' },
        { status: 400 }
      );
    }

    // Verify the user owns this barbershop or is admin/dev
    const [shop] = await db
      .select()
      .from(barbershops)
      .where(eq(barbershops.id, id))
      .limit(1);

    if (!shop) {
      return NextResponse.json(
        { error: 'Salon non trouvé' },
        { status: 404 }
      );
    }

    const userRole = (session.user as any).role;
    const userId = (session.user as any).id;
    
    // Allow admin/dev to update any shop, otherwise check ownership or co-ownership
    if (userRole !== 'admin' && userRole !== 'dev' && shop.ownerId !== userId && shop.coOwnerId !== userId) {
      return NextResponse.json(
        { error: 'Vous n\'êtes pas autorisé à modifier ce salon' },
        { status: 403 }
      );
    }

    // Update the barbershop
    const [updatedShop] = await db
      .update(barbershops)
      .set({
        name,
        address,
        city,
        phone,
        email,
        website,
        description,
        updatedAt: new Date(),
      })
      .where(eq(barbershops.id, id))
      .returning();

    return NextResponse.json({
      success: true,
      message: 'Informations mises à jour avec succès',
      shop: updatedShop,
    });
  } catch (error) {
    console.error('Error updating barbershop:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la mise à jour' },
      { status: 500 }
    );
  }
}

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
    const { name, address, city, phone, email, website, description, images } = body;

    // Verify the user owns this barbershop
    const [shop] = await db
      .select()
      .from(barbershops)
      .where(eq(barbershops.id, id))
      .limit(1);

    if (!shop) {
      return NextResponse.json(
        { error: 'Salon non trouvé' },
        { status: 404 }
      );
    }

    const userId = (session.user as any).id;
    if (shop.ownerId !== userId) {
      const userRole = (session.user as any).role;
      if (userRole !== 'admin' && userRole !== 'dev') {
        return NextResponse.json(
          { error: 'Vous n\'êtes pas autorisé à modifier ce salon' },
          { status: 403 }
        );
      }
    }

    // Build update object dynamically
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (name) updateData.name = name;
    if (address) updateData.address = address;
    if (city) updateData.city = city;
    if (phone !== undefined) updateData.phone = phone;
    if (email !== undefined) updateData.email = email;
    if (website !== undefined) updateData.website = website;
    if (description !== undefined) updateData.description = description;
    if (images !== undefined) updateData.images = images;

    // Update the barbershop
    const [updatedShop] = await db
      .update(barbershops)
      .set(updateData)
      .where(eq(barbershops.id, id))
      .returning();

    return NextResponse.json({
      success: true,
      message: 'Informations mises à jour avec succès',
      shop: updatedShop,
    });
  } catch (error) {
    console.error('Error updating barbershop:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la mise à jour' },
      { status: 500 }
    );
  }
}
