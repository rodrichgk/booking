import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { barbershops } from '@/lib/db/schema';
import { desc, eq } from 'drizzle-orm';

// GET - List all barbershops (for admin dropdown and public listing)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('activeOnly') === 'true';
    const limit = parseInt(searchParams.get('limit') || '50');

    let query = db
      .select({
        id: barbershops.id,
        name: barbershops.name,
        city: barbershops.city,
        rating: barbershops.rating,
        reviewCount: barbershops.reviewCount,
        isActive: barbershops.isActive,
        images: barbershops.images,
        address: barbershops.address,
        description: barbershops.description,
      })
      .from(barbershops)
      .orderBy(desc(barbershops.rating))
      .limit(limit);

    if (activeOnly) {
      query = query.where(eq(barbershops.isActive, true)) as typeof query;
    }

    const barbershopsList = await query;

    return NextResponse.json({ barbershops: barbershopsList });
  } catch (error) {
    console.error('Error fetching barbershops:', error);
    return NextResponse.json(
      { error: 'Failed to fetch barbershops' },
      { status: 500 }
    );
  }
}
