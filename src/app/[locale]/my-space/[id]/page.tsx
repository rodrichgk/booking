import { notFound, redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { barbershops, barbers, users, services, bookings } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { ManageBarbershopClient } from './client';

export default async function ManageBarbershopPage({ 
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
  const userRole = (session.user as any).role || 'customer';

  // Fetch the barbershop and verify ownership or admin/dev access
  const [shop] = await db
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
      ownerId: barbershops.ownerId,
      createdAt: barbershops.createdAt,
    })
    .from(barbershops)
    .where(eq(barbershops.id, id))
    .limit(1);

  if (!shop) {
    notFound();
  }

  // Verify ownership OR admin/dev access
  if (userRole !== 'admin' && userRole !== 'dev') {
    if (!shop.ownerId) {
      notFound(); // No owner assigned
    }

    const [owner] = await db
      .select({ email: users.email })
      .from(users)
      .where(eq(users.id, shop.ownerId))
      .limit(1);

    if (!owner || owner.email !== userEmail) {
      notFound(); // User doesn't own this barbershop
    }
  }

  // Fetch barbers for this barbershop
  const shopBarbers = await db
    .select({
      id: barbers.id,
      userId: barbers.userId,
      name: users.name,
      email: users.email,
      phone: users.phone,
      specialties: barbers.specialties,
      experience: barbers.experience,
      rating: barbers.rating,
      isActive: barbers.isActive,
      createdAt: barbers.createdAt,
    })
    .from(barbers)
    .innerJoin(users, eq(barbers.userId, users.id))
    .where(eq(barbers.barbershopId, id));

  // Fetch services for this barbershop
  const shopServices = await db
    .select({
      id: services.id,
      name: services.name,
      description: services.description,
      price: services.price,
      duration: services.duration,
      category: services.category,
      isActive: services.isActive,
      createdAt: services.createdAt,
    })
    .from(services)
    .where(eq(services.barbershopId, id));

  // Fetch bookings for stats (minimal fields)
  const shopBookings = await db
    .select({
      startTime: bookings.startTime,
      status: bookings.status,
    })
    .from(bookings)
    .where(eq(bookings.barbershopId, id));

  // Calculate subscription status
  const createdDate = new Date(shop.createdAt);
  const now = new Date();
  const daysSinceCreation = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
  
  let subscriptionStatus: 'active' | 'expired' | 'inactive';
  if (!shop.isActive) {
    subscriptionStatus = 'inactive';
  } else if (daysSinceCreation > 30) {
    subscriptionStatus = 'expired';
  } else {
    subscriptionStatus = 'active';
  }

  return (
    <ManageBarbershopClient 
      shop={shop as any} 
      barbers={shopBarbers as any}
      services={shopServices as any}
      bookings={shopBookings as any}
      subscriptionStatus={subscriptionStatus}
      locale={locale} 
    />
  );
}
