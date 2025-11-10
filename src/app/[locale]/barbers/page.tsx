import { getTranslations } from 'next-intl/server';
import { db } from '@/lib/db';
import { barbers, users, barbershops } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { BarbersClient } from './client';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'barbershop' });
  
  return {
    title: 'Barbers & Hairdressers - Find Your Perfect Stylist',
    description: 'Discover expert barbers and hairdressers specializing in afro and natural hair care',
  };
}

export default async function BarbersPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  // Fetch all active barbers with their barbershop info
  const allBarbers = await db
    .select({
      id: barbers.id,
      name: users.name,
      email: users.email,
      phone: users.phone,
      specialties: barbers.specialties,
      experience: barbers.experience,
      rating: barbers.rating,
      isActive: barbers.isActive,
      barbershopId: barbers.barbershopId,
      barbershopName: barbershops.name,
      barbershopCity: barbershops.city,
      barbershopAddress: barbershops.address,
    })
    .from(barbers)
    .innerJoin(users, eq(barbers.userId, users.id))
    .innerJoin(barbershops, eq(barbers.barbershopId, barbershops.id))
    .where(eq(barbershops.isActive, true)); // Only show barbers from active shops

  return <BarbersClient barbers={allBarbers as any} locale={locale} />;
}
