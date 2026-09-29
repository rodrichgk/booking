import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { barbershops, barbers, users, services } from '@/lib/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { getUpcomingClosures } from '@/lib/closures';
import { BookingClient } from './client';

export default async function BookingPage({
  params
}: {
  params: Promise<{ id: string; locale: string }>
}) {
  const { id, locale } = await params;
  const session = await getServerSession(authOptions);

  // Fetch barbershop from database
  const [shop] = await db
    .select({
      id: barbershops.id,
      name: barbershops.name,
      address: barbershops.address,
      city: barbershops.city,
      isActive: barbershops.isActive,
      openingHours: barbershops.openingHours,
    })
    .from(barbershops)
    .where(eq(barbershops.id, id))
    .limit(1);

  if (!shop || !shop.isActive) {
    notFound();
  }

  // Fetch barbers for this barbershop
  const shopBarbers = await db
    .select({
      id: barbers.id,
      name: sql<string>`COALESCE(${barbers.name}, ${users.name})`,
      profileImage: barbers.profileImage,
      barberType: barbers.barberType,
      specialties: barbers.specialties,
      experience: barbers.experience,
      rating: barbers.rating,
      isActive: barbers.isActive,
      openingHours: barbers.openingHours,
    })
    .from(barbers)
    .innerJoin(users, eq(barbers.userId, users.id))
    .where(and(eq(barbers.barbershopId, id), eq(barbers.isActive, true)));

  // Fetch active services for this barbershop
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
    // Deactivated services cannot be booked (the booking API rejects them).
    .where(and(eq(services.barbershopId, id), sql`${services.isActive} IS NOT FALSE`));

  const closedDates = (await getUpcomingClosures(id)).map((c) => c.date);

  // Get user info from session
  // Prefill the contact step from the account (the session has no phone number).
  let userInfo: { name: string; email: string; phone: string } | null = null;
  if (session?.user) {
    const [account] = (session.user as any).id
      ? await db.select({ name: users.name, email: users.email, phone: users.phone }).from(users).where(eq(users.id, (session.user as any).id)).limit(1)
      : [];
    userInfo = {
      name: account?.name || session.user.name || '',
      email: account?.email || session.user.email || '',
      phone: account?.phone || '',
    };
  }

  return (
    <Suspense>
      <BookingClient shop={shop as any} barbers={shopBarbers as any} services={shopServices as any} locale={locale} userInfo={userInfo} closedDates={closedDates} />
    </Suspense>
  );
}
