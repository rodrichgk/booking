import { db } from '@/lib/db';
import { barbershopClosures } from '@/lib/db/schema';
import { and, asc, eq, gte } from 'drizzle-orm';

export interface Closure {
  date: string; // YYYY-MM-DD
  reason: string | null;
}

const SHOP_TIMEZONE = 'Europe/Paris';

/** Calendar date (YYYY-MM-DD) of an instant, as seen in the salon's timezone. */
export function shopDateKey(date: Date): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: SHOP_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);
  const get = (type: string) => parts.find((p) => p.type === type)?.value;
  return `${get('year')}-${get('month')}-${get('day')}`;
}

export const isDateKey = (value: unknown): value is string =>
  typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value));

/**
 * Upcoming closures of a shop (today included). Returns [] if the
 * barbershop_closures table does not exist yet (migration not run), so
 * booking keeps working instead of failing.
 */
export async function getUpcomingClosures(barbershopId: string): Promise<Closure[]> {
  try {
    return await db
      .select({ date: barbershopClosures.date, reason: barbershopClosures.reason })
      .from(barbershopClosures)
      .where(and(eq(barbershopClosures.barbershopId, barbershopId), gte(barbershopClosures.date, shopDateKey(new Date()))))
      .orderBy(asc(barbershopClosures.date));
  } catch (error) {
    console.error('Could not load barbershop closures (has /api/migrate been run?):', error);
    return [];
  }
}

export async function isShopClosedOn(barbershopId: string, when: Date): Promise<boolean> {
  try {
    const [row] = await db
      .select({ id: barbershopClosures.id })
      .from(barbershopClosures)
      .where(and(eq(barbershopClosures.barbershopId, barbershopId), eq(barbershopClosures.date, shopDateKey(when))))
      .limit(1);
    return !!row;
  } catch (error) {
    console.error('Could not check barbershop closures (has /api/migrate been run?):', error);
    return false;
  }
}
