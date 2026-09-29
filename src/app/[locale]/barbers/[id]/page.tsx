import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { barbers, users, barbershops, services } from '@/lib/db/schema';
import { eq, sql, and } from 'drizzle-orm';
import { BarberProfileClient } from './client';

export async function generateMetadata({ params }: { params: Promise<{ id: string; locale: string }> }) {
  const { id, locale } = await params;
  
  const [barber] = await db
    .select({
      name: sql<string>`COALESCE(${barbers.name}, ${users.name})`,
      shop: barbershops.name,
      city: barbershops.city,
    })
    .from(barbers)
    .innerJoin(users, eq(barbers.userId, users.id))
    .innerJoin(barbershops, eq(barbers.barbershopId, barbershops.id))
    .where(eq(barbers.id, id))
    .limit(1);

  if (!barber) {
    return { title: locale === 'fr' ? 'Coiffeur introuvable' : 'Stylist not found' };
  }

  return {
    title: `${barber.name}, ${barber.shop} (${barber.city})`,
    description: `Découvrez le travail de ${barber.name} chez ${barber.shop} et réservez en ligne.`,
  };
}

export default async function BarberProfilePage({ 
  params 
}: { 
  params: Promise<{ id: string; locale: string }> 
}) {
  const { id, locale } = await params;

  // Fetch barber with user info and barbershop
  const [barberData] = await db
    .select({
      id: barbers.id,
      userId: barbers.userId,
      barbershopId: barbers.barbershopId,
      // Public page: never send the barber's account email/phone to the browser.
      name: sql<string>`COALESCE(${barbers.name}, ${users.name})`,
      barberType: barbers.barberType,
      profileImage: barbers.profileImage,
      galleryImages: barbers.galleryImages,
      youtubeLinks: barbers.youtubeLinks,
      bio: barbers.bio,
      specialties: barbers.specialties,
      experience: barbers.experience,
      rating: barbers.rating,
      isActive: barbers.isActive,
      barbershopName: barbershops.name,
      barbershopAddress: barbershops.address,
      barbershopCity: barbershops.city,
      barbershopPhone: barbershops.phone,
      barbershopOpeningHours: barbershops.openingHours,
      barbershopIsActive: barbershops.isActive,
    })
    .from(barbers)
    .innerJoin(users, eq(barbers.userId, users.id))
    .innerJoin(barbershops, eq(barbers.barbershopId, barbershops.id))
    .where(eq(barbers.id, id))
    .limit(1);

  if (!barberData || !barberData.isActive || !barberData.barbershopIsActive) {
    notFound();
  }

  // Get services available at this barber's shop
  const shopServices = await db
    .select({
      id: services.id,
      name: services.name,
      description: services.description,
      price: services.price,
      duration: services.duration,
      category: services.category,
    })
    .from(services)
    .where(
      and(
        eq(services.barbershopId, barberData.barbershopId),
        eq(services.isActive, true)
      )
    );

  return (
    <BarberProfileClient 
      barber={barberData as any}
      services={shopServices as any}
      locale={locale}
    />
  );
}
