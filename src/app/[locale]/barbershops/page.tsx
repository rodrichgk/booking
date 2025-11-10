import { getTranslations } from 'next-intl/server';
import { db } from '@/lib/db';
import { barbershops } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { BarbershopsClient } from './client';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'barbershop' });
  
  return {
    title: 'Barbershops - Find Your Perfect Salon',
    description: 'Discover expert barbershops specializing in afro and natural hair care',
  };
}

export default async function BarbershopsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  // Fetch ONLY active barbershops from the database
  const allBarbershops = await db
    .select({
      id: barbershops.id,
      name: barbershops.name,
      description: barbershops.description,
      address: barbershops.address,
      city: barbershops.city,
      phone: barbershops.phone,
      email: barbershops.email,
      website: barbershops.website,
      rating: barbershops.rating,
      reviewCount: barbershops.reviewCount,
      isActive: barbershops.isActive,
    })
    .from(barbershops)
    .where(eq(barbershops.isActive, true)); // Only show active shops

  return <BarbershopsClient barbershops={allBarbershops as any} locale={locale} />;
}
