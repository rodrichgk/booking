import { notFound } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { barbershops, barbers, users, services } from '@/lib/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { BarbershopDetailClient } from './client';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [shop] = await db
    .select({ name: barbershops.name, city: barbershops.city, description: barbershops.description })
    .from(barbershops)
    .where(eq(barbershops.id, id))
    .limit(1);
  if (!shop) return {};
  return {
    title: `${shop.name}, ${shop.city}`,
    description: shop.description?.slice(0, 160) || `Réservez chez ${shop.name} à ${shop.city}.`,
  };
}

export default async function BarbershopDetailsPage({ 
  params 
}: { 
  params: Promise<{ id: string; locale: string }> 
}) {
  const { id, locale } = await params;
  const session = await getServerSession(authOptions);
  const isAuthenticated = !!session?.user;

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
      openingHours: barbershops.openingHours,
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
      // The display name set by the salon wins over the account name. No email: this is public.
      name: sql<string>`COALESCE(${barbers.name}, ${users.name})`,
      profileImage: barbers.profileImage,
      barberType: barbers.barberType,
      specialties: barbers.specialties,
      experience: barbers.experience,
      rating: barbers.rating,
      isActive: barbers.isActive,
    })
    .from(barbers)
    .innerJoin(users, eq(barbers.userId, users.id))
    .where(and(eq(barbers.barbershopId, id), eq(barbers.isActive, true)));

  // Fetch services for this barbershop
  const shopServices = await db
    .select({
      id: services.id,
      name: services.name,
      description: services.description,
      image: services.image,
      price: services.price,
      duration: services.duration,
      category: services.category,
      isActive: services.isActive,
    })
    .from(services)
    .where(and(eq(services.barbershopId, id), sql`${services.isActive} IS NOT FALSE`));

  return <BarbershopDetailClient shop={shop as any} barbers={shopBarbers as any} services={shopServices as any} locale={locale} isAuthenticated={isAuthenticated} />;
}
