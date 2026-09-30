import { db } from '@/lib/db';
import { bookings, reviews } from '@/lib/db/schema';
import { and, desc, eq, inArray, lte, sql } from 'drizzle-orm';

/**
 * Only customers who actually came can review: a confirmed or completed
 * booking that has started, at this salon (or with this barber), and that has
 * not been reviewed yet. One review per booking. Returns the booking to attach
 * the review to, or null.
 */
export async function findReviewableBooking(
  userId: string,
  target: { barbershopId?: string | null; barberId?: string | null }
): Promise<{ id: string; barbershopId: string; barberId: string | null } | null> {
  if (!target.barbershopId && !target.barberId) return null;

  const [booking] = await db
    .select({ id: bookings.id, barbershopId: bookings.barbershopId, barberId: bookings.barberId })
    .from(bookings)
    .where(
      and(
        eq(bookings.userId, userId),
        target.barbershopId ? eq(bookings.barbershopId, target.barbershopId) : undefined,
        target.barberId ? eq(bookings.barberId, target.barberId) : undefined,
        inArray(bookings.status, ['confirmed', 'completed']),
        lte(bookings.startTime, new Date()),
        sql`NOT EXISTS (SELECT 1 FROM ${reviews} WHERE ${reviews.bookingId} = ${bookings.id})`
      )
    )
    .orderBy(desc(bookings.startTime))
    .limit(1);

  return booking ?? null;
}
