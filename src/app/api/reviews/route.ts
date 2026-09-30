import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { reviews, barbershops, barbers, users } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { findReviewableBooking } from '@/lib/reviews';

// GET - Fetch reviews for a barbershop or barber
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const barbershopId = searchParams.get('barbershopId');
    const barberId = searchParams.get('barberId');
    const limit = parseInt(searchParams.get('limit') || '10');

    let query = db
      .select({
        id: reviews.id,
        rating: reviews.rating,
        comment: reviews.comment,
        createdAt: reviews.createdAt,
        customerName: users.name,
        customerImage: users.image,
      })
      .from(reviews)
      .innerJoin(users, eq(reviews.customerId, users.id))
      .orderBy(desc(reviews.createdAt))
      .limit(limit);

    if (barbershopId) {
      query = query.where(eq(reviews.barbershopId, barbershopId)) as typeof query;
    } else if (barberId) {
      query = query.where(eq(reviews.barberId, barberId)) as typeof query;
    }

    const reviewsList = await query;

    return NextResponse.json({ reviews: reviewsList });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}

// POST - Create a new review
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Vous devez être connecté pour laisser un avis' },
        { status: 401 }
      );
    }

    const userId = (session.user as any).id;
    const body = await request.json();
    const { barbershopId, barberId, rating, comment } = body;

    // Validate rating
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'La note doit être entre 1 et 5' },
        { status: 400 }
      );
    }

    // At least one target must be specified
    if (!barbershopId && !barberId) {
      return NextResponse.json(
        { error: 'Vous devez spécifier un salon ou un coiffeur' },
        { status: 400 }
      );
    }

    // Only customers with a past, not yet reviewed booking can post (one review per visit)
    const booking = await findReviewableBooking(userId, { barbershopId, barberId });
    if (!booking) {
      return NextResponse.json(
        { error: 'Vous pourrez laisser un avis après votre rendez-vous.' },
        { status: 403 }
      );
    }

    // Create the review
    const [newReview] = await db
      .insert(reviews)
      .values({
        customerId: userId,
        barbershopId: barbershopId || null,
        barberId: barberId || null,
        bookingId: booking.id,
        rating,
        comment: typeof comment === 'string' && comment.trim() ? comment.trim().slice(0, 2000) : null,
      })
      .returning();

    // Update barbershop rating if applicable
    if (barbershopId) {
      const shopReviews = await db
        .select({ rating: reviews.rating })
        .from(reviews)
        .where(eq(reviews.barbershopId, barbershopId));
      
      const avgRating = shopReviews.reduce((sum, r) => sum + r.rating, 0) / shopReviews.length;
      
      await db
        .update(barbershops)
        .set({
          rating: avgRating.toFixed(2),
          reviewCount: shopReviews.length,
          updatedAt: new Date(),
        })
        .where(eq(barbershops.id, barbershopId));
    }

    // Update barber rating if applicable
    if (barberId) {
      const barberReviews = await db
        .select({ rating: reviews.rating })
        .from(reviews)
        .where(eq(reviews.barberId, barberId));
      
      const avgRating = barberReviews.reduce((sum, r) => sum + r.rating, 0) / barberReviews.length;
      
      await db
        .update(barbers)
        .set({
          rating: avgRating.toFixed(2),
          updatedAt: new Date(),
        })
        .where(eq(barbers.id, barberId));
    }

    return NextResponse.json({
      success: true,
      message: 'Avis ajouté avec succès',
      review: newReview,
    });
  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue' },
      { status: 500 }
    );
  }
}
