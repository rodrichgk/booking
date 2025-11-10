import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { barbershops, barbers, users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { BarbershopDetailClient } from './client';

export default async function BarbershopDetailsPage({ 
  params 
}: { 
  params: Promise<{ id: string; locale: string }> 
}) {
  const { id, locale } = await params;

  // Fetch barbershop from database
  const [shop] = await db
    .select({
      id: barbershops.id,
      name: barbershops.name,
      description: barbershops.description,
      address: barbershops.address,
      city: barbershops.city,
      phone: barbershops.phone,
      email: barbershops.email,
      website: barbershops.website,
      images: barbershops.images,
      rating: barbershops.rating,
      reviewCount: barbershops.reviewCount,
      isActive: barbershops.isActive,
    })
    .from(barbershops)
    .where(eq(barbershops.id, id))
    .limit(1);

  if (!shop || !shop.isActive) {
    notFound();
  }

  // Fetch barbers for this barbershop
  const shopBarbers = await db
    .select({
      id: barbers.id,
      name: users.name,
      email: users.email,
      specialties: barbers.specialties,
      experience: barbers.experience,
      rating: barbers.rating,
      isActive: barbers.isActive,
    })
    .from(barbers)
    .innerJoin(users, eq(barbers.userId, users.id))
    .where(eq(barbers.barbershopId, id));

  return <BarbershopDetailClient shop={shop as any} barbers={shopBarbers as any} locale={locale} />;
}
