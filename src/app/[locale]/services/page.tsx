import { Suspense } from 'react';
import { db } from '@/lib/db';
import { services as servicesTable, barbershops } from '@/lib/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { ServicesClient } from './client';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const fr = locale === 'fr';
  return {
    title: fr ? 'Prestations : coupes, tresses, soins' : 'Services: cuts, braids, treatments',
    description: fr
      ? 'Coupes, tresses, colorations et soins pour cheveux afro, bouclés et texturés, dans les salons partenaires.'
      : 'Cuts, braids, colour and treatments for afro, curly and textured hair in partner salons.',
  };
}

export default async function ServicesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  // Active services from visible salons only
  const rows = await db
    .select({
      id: servicesTable.id,
      name: servicesTable.name,
      description: servicesTable.description,
      image: servicesTable.image,
      price: servicesTable.price,
      duration: servicesTable.duration,
      category: servicesTable.category,
      barbershopId: servicesTable.barbershopId,
      barbershopName: barbershops.name,
      barbershopCity: barbershops.city,
      barbershopRating: barbershops.rating,
    })
    .from(servicesTable)
    .innerJoin(barbershops, eq(servicesTable.barbershopId, barbershops.id))
    .where(and(sql`${servicesTable.isActive} IS NOT FALSE`, eq(barbershops.isActive, true)));

  return (
    <Suspense>
      <ServicesClient services={rows} locale={locale} />
    </Suspense>
  );
}
