import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { db } from '@/lib/db';
import { barbers, users, barbershops, services, bookings } from '@/lib/db/schema';
import { eq, sql, and } from 'drizzle-orm';
import { BarberProfileClient } from './client';

export async function generateMetadata({ params }: { params: Promise<{ id: string; locale: string }> }) {
  const { id, locale } = await params;
  
  const [barber] = await db
    .select({
      name: users.name,
    })
    .from(barbers)
    .innerJoin(users, eq(barbers.userId, users.id))
    .where(eq(barbers.id, id))
    .limit(1);

  if (!barber) {
    return {
      title: 'Barber Not Found',
    };
  }

  return {
    title: `${barber.name} - Professional Barber Profile`,
    description: `View ${barber.name}'s portfolio, ratings, and book an appointment`,
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
      name: users.name,
      email: users.email,
      phone: users.phone,
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

  // Get barber's statistics
  const [stats] = await db
    .select({
      totalBookings: sql<number>`COUNT(DISTINCT ${bookings.id})`.as('total_bookings'),
      completedBookings: sql<number>`COUNT(DISTINCT CASE WHEN ${bookings.status} = 'completed' THEN ${bookings.id} END)`.as('completed_bookings'),
    })
    .from(bookings)
    .where(eq(bookings.barberId, id));

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
      stats={{
        totalBookings: stats?.totalBookings || 0,
        completedBookings: stats?.completedBookings || 0,
      }}
      services={shopServices as any}
      locale={locale}
    />
  );
}
