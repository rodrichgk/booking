import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { bookings } from '@/lib/db/schema';
import { and, eq, gte, lt } from 'drizzle-orm';

/**
 * Busy time ranges for a salon on a given day, so the booking form can grey
 * out taken slots instead of failing at the last step. Public: returns only
 * start/end/barber, never who booked.
 *
 * GET /api/barbershops/:id/availability?from=<ISO>&to=<ISO>
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const from = new Date(searchParams.get('from') ?? '');
  const to = new Date(searchParams.get('to') ?? '');

  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime()) || to <= from || to.getTime() - from.getTime() > 2 * 86_400_000) {
    return NextResponse.json({ error: 'Invalid range' }, { status: 400 });
  }

  try {
    const busy = await db
      .select({ barberId: bookings.barberId, start: bookings.startTime, end: bookings.endTime })
      .from(bookings)
      .where(and(eq(bookings.barbershopId, id), eq(bookings.status, 'confirmed'), gte(bookings.startTime, from), lt(bookings.startTime, to)));

    return NextResponse.json(
      { busy: busy.map((b) => ({ barberId: b.barberId, start: b.start.toISOString(), end: b.end.toISOString() })) },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (error) {
    console.error('Error fetching availability:', error);
    return NextResponse.json({ busy: [] });
  }
}
