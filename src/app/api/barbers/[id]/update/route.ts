import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { barbers, barbershops } from '@/lib/db/schema';
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

    // Get the barber
    const [barber] = await db
      .select()
      .from(barbers)
      .where(eq(barbers.id, id))
      .limit(1);

    if (!barber) {
      return NextResponse.json(
        { error: 'Coiffeur non trouvé' },
        { status: 404 }
      );
    }

    // Check if user is the barber or the shop owner
    const [shop] = await db
      .select()
      .from(barbershops)
      .where(eq(barbershops.id, barber.barbershopId))
      .limit(1);

    const isOwner = shop?.ownerId === session.user.id;
    const isBarber = barber.userId === session.user.id;

    if (!isOwner && !isBarber) {
      return NextResponse.json(
        { error: 'Non autorisé à modifier ce profil' },
        { status: 403 }
      );
    }

    // Update barber
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (body.name !== undefined) {
      updateData.name = body.name;
    }
    if (body.profileImage !== undefined) {
      updateData.profileImage = body.profileImage;
    }
    if (body.galleryImages !== undefined) {
      updateData.galleryImages = body.galleryImages;
    }
    if (body.bio !== undefined) {
      updateData.bio = body.bio;
    }
    if (body.specialties !== undefined) {
      updateData.specialties = body.specialties;
    }
    if (body.experience !== undefined) {
      updateData.experience = body.experience;
    }
    if (body.barberType !== undefined) {
      updateData.barberType = body.barberType;
    }

    await db
      .update(barbers)
      .set(updateData)
      .where(eq(barbers.id, id));

    return NextResponse.json({
      success: true,
      message: 'Profil mis à jour avec succès',
    });
  } catch (error) {
    console.error('Error updating barber:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue' },
      { status: 500 }
    );
  }
}
