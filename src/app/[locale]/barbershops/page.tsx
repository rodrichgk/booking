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
      images: barbershops.images,
      rating: barbershops.rating,
      reviewCount: barbershops.reviewCount,
      isActive: barbershops.isActive,
      createdAt: barbershops.createdAt,
    })
    .from(barbershops)
    .where(eq(barbershops.isActive, true)); // Only show active shops

  // Filter out shops with expired subscriptions (> 30 days since creation)
  const now = new Date();
  const validBarbershops = allBarbershops.filter(shop => {
    const createdDate = new Date(shop.createdAt);
    const daysSinceCreation = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
    return daysSinceCreation <= 30; // Only show shops with valid subscriptions
  });

  return <BarbershopsClient barbershops={validBarbershops as any} locale={locale} />;
}
