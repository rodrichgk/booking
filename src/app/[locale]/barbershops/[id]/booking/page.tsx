import { notFound } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { barbershops, barbers, users, services } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
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
      userId: barbers.userId,
      name: users.name,
      specialties: barbers.specialties,
      experience: barbers.experience,
      rating: barbers.rating,
      isActive: barbers.isActive,
      openingHours: barbers.openingHours,
    })
    .from(barbers)
    .innerJoin(users, eq(barbers.userId, users.id))
    .where(eq(barbers.barbershopId, id));

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
    .where(eq(services.barbershopId, id));

  // Get user info from session
  const userInfo = session?.user ? {
    name: session.user.name || '',
    email: session.user.email || '',
    phone: (session.user as any).phone || '',
  } : null;

  return <BookingClient shop={shop as any} barbers={shopBarbers as any} services={shopServices as any} locale={locale} userInfo={userInfo} />;
}
