import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { barbershops, bookings } from '@/lib/db/schema';
import { and, desc, eq, inArray, notInArray, sql } from 'drizzle-orm';
import { getSetting } from '@/lib/settings';

const LIMIT = 3;

type FeaturedShop = {
  id: string;
  name: string;
  city: string;
  rating: string | null;
  reviewCount: number | null;
  images: string[] | null;
};

const shopFields = {
  id: barbershops.id,
  name: barbershops.name,
  city: barbershops.city,
  rating: barbershops.rating,
  reviewCount: barbershops.reviewCount,
  images: barbershops.images,
};

/**
 * Homepage "featured salons", following admin Settings > Apparence:
 * manual selection (in the chosen order), most booked, or best rated.
 * Only visible salons are ever returned; a manual list is topped up with the
 * best-rated salons if some picks are hidden or missing.
 */
export async function GET() {
  try {
    const { featuredMode, featuredBarbershopIds } = await getSetting('appearance');
    const visible = eq(barbershops.isActive, true);
    let shops: FeaturedShop[] = [];

    if (featuredMode === 'popularity') {
      shops = await db
        .select(shopFields)
        .from(barbershops)
        .leftJoin(bookings, eq(bookings.barbershopId, barbershops.id))
        .where(visible)
        .groupBy(barbershops.id)
        .orderBy(desc(sql`count(${bookings.id})`), desc(barbershops.rating))
        .limit(LIMIT);
    } else if (featuredMode === 'manual' && featuredBarbershopIds?.length) {
      const picked = await db
        .select(shopFields)
        .from(barbershops)
        .where(and(visible, inArray(barbershops.id, featuredBarbershopIds)));
      const order = new Map(featuredBarbershopIds.map((id, i) => [id, i]));
      shops = picked.sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0)).slice(0, LIMIT);
    }

    if (shops.length < LIMIT) {
      const taken = shops.map((s) => s.id);
      const fill = await db
        .select(shopFields)
        .from(barbershops)
        .where(taken.length ? and(visible, notInArray(barbershops.id, taken)) : visible)
        .orderBy(desc(barbershops.rating), desc(barbershops.reviewCount))
        .limit(LIMIT - shops.length);
      shops = [...shops, ...fill];
    }

    return NextResponse.json(
      { barbershops: shops },
      { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } }
    );
  } catch (error) {
    console.error('Error fetching featured barbershops:', error);
    return NextResponse.json({ barbershops: [] });
  }
}
