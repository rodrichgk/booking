import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { services, barbers, users, barbershops } from '@/lib/db/schema';
import { eq, desc, and, sql } from 'drizzle-orm';
import { ServiceBarbersClient } from './client';

export async function generateMetadata({ params }: { params: Promise<{ serviceId: string; locale: string }> }) {
  const { serviceId } = await params;
  
  const [service] = await db
    .select({
      name: services.name,
    })
    .from(services)
    .where(eq(services.id, serviceId))
    .limit(1);

  if (!service) {
    return {
      title: 'Service Not Found',
    };
  }

  return {
    title: `Find Barbers for ${service.name}`,
    description: `Book an appointment with top-rated barbers who specialize in ${service.name}`,
  };
}

export default async function ServiceBarbersPage({ 
  params 
}: { 
  params: Promise<{ serviceId: string; locale: string }> 
}) {
  const { serviceId, locale } = await params;

  // Fetch the service details
  const [service] = await db
    .select({
      id: services.id,
      name: services.name,
      description: services.description,
      price: services.price,
      duration: services.duration,
      category: services.category,
      barbershopId: services.barbershopId,
    })
    .from(services)
    .where(eq(services.id, serviceId))
    .limit(1);

  if (!service) {
    notFound();
  }

  // Find all barbers at the barbershop that offers this service
  // Then get stats for each barber
  const barbersForService = await db
    .select({
      id: barbers.id,
      userId: barbers.userId,
      barbershopId: barbers.barbershopId,
      name: users.name,
      profileImage: barbers.profileImage,
      bio: barbers.bio,
      specialties: barbers.specialties,
      experience: barbers.experience,
      rating: barbers.rating,
      isActive: barbers.isActive,
      barbershopName: barbershops.name,
      barbershopAddress: barbershops.address,
      barbershopCity: barbershops.city,
      barbershopPhone: barbershops.phone,
    })
    .from(barbers)
    .innerJoin(users, eq(barbers.userId, users.id))
    .innerJoin(barbershops, eq(barbers.barbershopId, barbershops.id))
    .where(
      and(
        eq(barbers.barbershopId, service.barbershopId),
        eq(barbers.isActive, true),
        eq(barbershops.isActive, true)
      )
    )
    .orderBy(desc(barbers.rating)); // Sort by rating, highest first

  // Also get barbers from other shops that offer the same service
  const similarServices = await db
    .select({
      barbershopId: services.barbershopId,
    })
    .from(services)
    .where(
      and(
        eq(services.name, service.name),
        eq(services.isActive, true)
      )
    );

  const otherBarbershopIds = similarServices
    .map(s => s.barbershopId)
    .filter(id => id !== service.barbershopId);

  let otherBarbers: any[] = [];
  if (otherBarbershopIds.length > 0) {
    otherBarbers = await db
      .select({
        id: barbers.id,
        userId: barbers.userId,
        barbershopId: barbers.barbershopId,
        name: users.name,
        profileImage: barbers.profileImage,
        bio: barbers.bio,
        specialties: barbers.specialties,
        experience: barbers.experience,
        rating: barbers.rating,
        isActive: barbers.isActive,
        barbershopName: barbershops.name,
        barbershopAddress: barbershops.address,
        barbershopCity: barbershops.city,
        barbershopPhone: barbershops.phone,
      })
      .from(barbers)
      .innerJoin(users, eq(barbers.userId, users.id))
      .innerJoin(barbershops, eq(barbers.barbershopId, barbershops.id))
      .where(
        and(
          sql`${barbers.barbershopId} IN ${otherBarbershopIds}`,
          eq(barbers.isActive, true),
          eq(barbershops.isActive, true)
        )
      )
      .orderBy(desc(barbers.rating));
  }

  // Combine and sort all barbers by rating
  const allBarbers = [...barbersForService, ...otherBarbers].sort((a, b) => {
    const ratingA = parseFloat(a.rating || '0');
    const ratingB = parseFloat(b.rating || '0');
    return ratingB - ratingA;
  });

  return (
    <ServiceBarbersClient 
      service={service as any}
      barbers={allBarbers as any}
      locale={locale}
    />
  );
}
