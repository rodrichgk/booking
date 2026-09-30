import { NextResponse } from 'next/server';
import { getFeaturedBarbershops } from '@/lib/featured';

/** Homepage featured salons (see getFeaturedBarbershops for the rules). */
export async function GET() {
  try {
    const shops = await getFeaturedBarbershops();
    return NextResponse.json(
      { barbershops: shops },
      { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } }
    );
  } catch (error) {
    console.error('Error fetching featured barbershops:', error);
    return NextResponse.json({ barbershops: [] });
  }
}
