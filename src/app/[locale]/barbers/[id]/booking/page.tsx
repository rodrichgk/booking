import { notFound, redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { barbers, users, barbershops, services } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { BarberBookingClient } from './client';
import { getUpcomingClosures } from '@/lib/closures';

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
      title: 'Book Appointment',
    };
  }

  return {
    title: `Book with ${barber.name}`,
    description: `Schedule your appointment with ${barber.name}`,
  };
}

export default async function BarberBookingPage({ 
  params 
}: { 
  params: Promise<{ id: string; locale: string }> 
}) {
  const { id, locale } = await params;
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect(`/${locale}/auth/signin?callbackUrl=/${locale}/barbers/${id}/booking`);
  }

  // Fetch barber with barbershop info
  const [barberData] = await db
    .select({
      id: barbers.id,
      barbershopId: barbers.barbershopId,
      name: users.name,
      profileImage: barbers.profileImage,
      specialties: barbers.specialties,
      experience: barbers.experience,
      rating: barbers.rating,
      isActive: barbers.isActive,
      barbershopName: barbershops.name,
      barbershopAddress: barbershops.address,
      barbershopCity: barbershops.city,
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

  // The booking API needs the customer's contact details; take them from the
  // signed-in account (the form asks for the phone if the account has none).
  const [customer] = await db
    .select({ name: users.name, email: users.email, phone: users.phone })
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  // Fetch services available at this barber's barbershop
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

  const closedDates = (await getUpcomingClosures(barberData.barbershopId)).map((c) => c.date);

  return (
    <BarberBookingClient
      closedDates={closedDates} 
      barber={barberData as any}
      barbershop={{
        id: barberData.barbershopId,
        name: barberData.barbershopName,
        address: barberData.barbershopAddress,
        city: barberData.barbershopCity,
      }}
      services={shopServices as any}
      locale={locale}
      customer={{
        name: customer?.name || session.user.name || '',
        email: customer?.email || session.user.email || '',
        phone: customer?.phone || '',
      }}
    />
  );
}
