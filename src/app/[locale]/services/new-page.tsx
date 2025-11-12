import { getTranslations } from 'next-intl/server';
import { db } from '@/lib/db';
import { services, barbershops } from '@/lib/db/schema';
import { eq, sql } from 'drizzle-orm';
import { ServicesBookingClient } from './client-booking';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  
  return {
    title: 'Our Services - Book Your Appointment',
    description: 'Browse all our professional services and find the perfect barber for your needs',
  };
}

export default async function ServicesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  // Fetch all active services with barbershop info and barber count
  const allServices = await db
    .select({
      id: services.id,
      name: services.name,
      description: services.description,
      price: services.price,
      duration: services.duration,
      category: services.category,
      barbershopId: services.barbershopId,
      barbershopName: barbershops.name,
      barbershopCity: barbershops.city,
      // Count how many barbershops offer this service
      availableShops: sql<number>`COUNT(DISTINCT ${services.barbershopId})`.as('available_shops'),
    })
    .from(services)
    .innerJoin(barbershops, eq(services.barbershopId, barbershops.id))
    .where(eq(services.isActive, true))
    .groupBy(services.id, services.name, services.description, services.price, services.duration, services.category, services.barbershopId, barbershops.name, barbershops.city);

  // Group services by name (same service offered by different shops)
  const groupedServices = allServices.reduce((acc, service) => {
    if (!acc[service.name]) {
      acc[service.name] = {
        name: service.name,
        description: service.description,
        minPrice: service.price,
        maxPrice: service.price,
        duration: service.duration,
        category: service.category,
        serviceIds: [service.id],
        shopCount: 1,
      };
    } else {
      acc[service.name].serviceIds.push(service.id);
      acc[service.name].shopCount++;
      const price = parseFloat(service.price);
      const minPrice = parseFloat(acc[service.name].minPrice);
      const maxPrice = parseFloat(acc[service.name].maxPrice);
      
      if (price < minPrice) acc[service.name].minPrice = service.price;
      if (price > maxPrice) acc[service.name].maxPrice = service.price;
    }
    return acc;
  }, {} as Record<string, any>);

  const uniqueServices = Object.values(groupedServices);

  return <ServicesBookingClient services={uniqueServices as any} locale={locale} />;
}
