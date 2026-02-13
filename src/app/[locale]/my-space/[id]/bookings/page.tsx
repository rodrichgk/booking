import { notFound, redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { barbershops, barbers, users, services, bookings } from '@/lib/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { BookingsManagementClient } from './client';

export default async function BookingsManagementPage({ 
  params 
}: { 
  params: Promise<{ id: string; locale: string }> 
}) {
  const { id, locale } = await params;
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect(`/${locale}/auth/signin`);
  }

  const userEmail = session.user.email;
  const userRole = (session.user as any).role;

  // Fetch the barbershop
  const [shop] = await db
    .select({
      id: barbershops.id,
      name: barbershops.name,
      city: barbershops.city,
      address: barbershops.address,
      ownerId: barbershops.ownerId,
      coOwnerId: barbershops.coOwnerId,
    })
    .from(barbershops)
    .where(eq(barbershops.id, id))
    .limit(1);

  if (!shop) {
    notFound();
  }

  // Verify ownership, co-ownership, or admin/dev access
  if (userRole !== 'admin' && userRole !== 'dev') {
    const [currentUser] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, userEmail || ''))
      .limit(1);

    const isOwner = currentUser && shop.ownerId === currentUser.id;
    const isCoOwner = currentUser && shop.coOwnerId === currentUser.id;

    if (!isOwner && !isCoOwner) {
      notFound();
    }
  }

  // Fetch bookings for this barbershop with all related data
  const shopBookings = await db
    .select({
      id: bookings.id,
      startTime: bookings.startTime,
      endTime: bookings.endTime,
      status: bookings.status,
      notes: bookings.notes,
      customerName: bookings.customerName,
      customerEmail: bookings.customerEmail,
      customerPhone: bookings.customerPhone,
      createdAt: bookings.createdAt,
      // Join service info
      serviceName: services.name,
      servicePrice: services.price,
      serviceDuration: services.duration,
      // Join barber info
      barberName: users.name,
    })
    .from(bookings)
    .leftJoin(services, eq(bookings.serviceId, services.id))
    .leftJoin(barbers, eq(bookings.barberId, barbers.id))
    .leftJoin(users, eq(barbers.userId, users.id))
    .where(eq(bookings.barbershopId, id))
    .orderBy(desc(bookings.startTime));

  return (
    <BookingsManagementClient 
      shop={shop as any} 
      bookings={shopBookings as any}
      locale={locale} 
    />
  );
}
