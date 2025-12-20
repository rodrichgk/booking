import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { bookings, barbers, users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Get the booking
    const [booking] = await db
      .select()
      .from(bookings)
      .where(eq(bookings.id, id))
      .limit(1);

    if (!booking) {
      return NextResponse.json(
        { error: 'Rendez-vous non trouvé' },
        { status: 404 }
      );
    }

    // Check if user is authorized to cancel (either the customer, the barber, or admin)
    const [currentUser] = await db
      .select({ id: users.id, role: users.role })
      .from(users)
      .where(eq(users.email, session.user.email))
      .limit(1);

    if (!currentUser) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    const isAdmin = currentUser.role === 'admin' || currentUser.role === 'dev';
    const isCustomer = booking.userId === currentUser.id;

    // Check if user is the barber
    let isBarber = false;
    if (booking.barberId) {
      const [barber] = await db
        .select({ userId: barbers.userId })
        .from(barbers)
        .where(eq(barbers.id, booking.barberId))
        .limit(1);
      
      isBarber = barber?.userId === currentUser.id;
    }

    if (!isAdmin && !isCustomer && !isBarber) {
      return NextResponse.json(
        { error: 'Non autorisé à annuler ce rendez-vous' },
        { status: 403 }
      );
    }

    // Check if booking can be cancelled
    if (booking.status === 'cancelled') {
      return NextResponse.json(
        { error: 'Ce rendez-vous est déjà annulé' },
        { status: 400 }
      );
    }

    if (booking.status === 'completed') {
      return NextResponse.json(
        { error: 'Impossible d\'annuler un rendez-vous terminé' },
        { status: 400 }
      );
    }

    // Cancel the booking
    await db
      .update(bookings)
      .set({
        status: 'cancelled',
        updatedAt: new Date(),
      })
      .where(eq(bookings.id, id));

    return NextResponse.json({
      success: true,
      message: 'Rendez-vous annulé avec succès',
    });
  } catch (error) {
    console.error('Error cancelling booking:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue' },
      { status: 500 }
    );
  }
}
