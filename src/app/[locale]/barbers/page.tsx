import { db } from '@/lib/db';
import { barbers, users, barbershops } from '@/lib/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { firstImage } from '@/lib/images';
import { BarbersClient } from './client';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const fr = locale === 'fr';
  return {
    title: fr ? 'Coiffeurs et coiffeuses spécialistes afro' : 'Afro hair stylists',
    description: fr
      ? 'Trouvez un coiffeur ou une coiffeuse spécialiste des cheveux afro, bouclés et texturés.'
      : 'Find a stylist specialised in afro, curly and textured hair.',
  };
}

export default async function BarbersPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  // Fetch all active barbers with their barbershop info
  const allBarbers = await db
    .select({
      id: barbers.id,
      // Public page: display name and photo only, never the account email/phone.
      name: sql<string>`COALESCE(${barbers.name}, ${users.name})`,
      profileImage: barbers.profileImage,
      barberType: barbers.barberType,
      specialties: barbers.specialties,
      experience: barbers.experience,
      rating: barbers.rating,
      isActive: barbers.isActive,
      barbershopId: barbers.barbershopId,
      barbershopName: barbershops.name,
      barbershopCity: barbershops.city,
      barbershopAddress: barbershops.address,
      // Backdrops for barbers without a portrait: their first work photo, else the salon photo.
      galleryImages: barbers.galleryImages,
      barbershopImages: barbershops.images,
    })
    .from(barbers)
    .innerJoin(users, eq(barbers.userId, users.id))
    .innerJoin(barbershops, eq(barbers.barbershopId, barbershops.id))
    .where(and(eq(barbershops.isActive, true), eq(barbers.isActive, true))); // Only show active barbers from active shops

  // Only send the first photo of each list to the browser.
  const list = allBarbers.map(({ galleryImages, barbershopImages, ...b }) => ({
    ...b,
    workImage: firstImage(galleryImages),
    barbershopImage: firstImage(barbershopImages),
  }));

  return <BarbersClient barbers={list as any} locale={locale} />;
}
