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
