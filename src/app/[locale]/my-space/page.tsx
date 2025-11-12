import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { db } from '@/lib/db';
import { barbershops, users, barbers, bookings, services } from '@/lib/db';
import { eq, sql, and, gte, desc } from 'drizzle-orm';
import { MySpaceClient } from './client';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'mySpace' });
  
  return {
    title: t('title'),
    description: t('description'),
  };
}

export default async function MySpacePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect(`/${locale}/auth/signin`);
  }

  const userRole = (session.user as any).role;
  const userEmail = session.user.email;

  // Check if user is a barber
  const barberProfile = await db
    .select({
      id: barbers.id,
      barbershopId: barbers.barbershopId,
      profileImage: barbers.profileImage,
      galleryImages: barbers.galleryImages,
      youtubeLinks: barbers.youtubeLinks,
      bio: barbers.bio,
      specialties: barbers.specialties,
      experience: barbers.experience,
      rating: barbers.rating,
    })
    .from(barbers)
    .leftJoin(users, eq(barbers.userId, users.id))
    .where(eq(users.email, userEmail || ''))
    .limit(1);

  // Check if user owns barbershops
  const userBarbershops = await db
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
      createdAt: barbershops.createdAt,
      subscriptionStatus: sql<string>`
        CASE 
          WHEN ${barbershops.isActive} = false THEN 'inactive'
          WHEN ${barbershops.createdAt} < NOW() - INTERVAL '1 month' THEN 'expired'
          ELSE 'active'
        END
      `.as('subscription_status'),
    })
    .from(barbershops)
    .leftJoin(users, eq(barbershops.ownerId, users.id))
    .where(eq(users.email, userEmail || ''));

  // Fetch customer bookings (upcoming and recent)
  const customerUser = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, userEmail || ''))
    .limit(1);

  const userBookings = customerUser.length > 0 ? await db
    .select({
      id: bookings.id,
      barbershopId: bookings.barbershopId,
      barbershopName: barbershops.name,
      barbershopCity: barbershops.city,
      barbershopImage: barbershops.images,
      barberName: sql<string>`${users.name}`.as('barber_name'),
      serviceName: services.name,
      startTime: bookings.startTime,
      endTime: bookings.endTime,
      status: bookings.status,
      totalPrice: bookings.totalPrice,
    })
    .from(bookings)
    .leftJoin(barbershops, eq(bookings.barbershopId, barbershops.id))
    .leftJoin(barbers, eq(bookings.barberId, barbers.id))
    .leftJoin(users, eq(barbers.userId, users.id))
    .leftJoin(services, eq(bookings.serviceId, services.id))
    .where(eq(bookings.userId, customerUser[0].id))
    .orderBy(desc(bookings.startTime))
    .limit(10) : [];

  return (
    <div className="min-h-screen bg-white">
      <MySpaceClient 
        barbershops={userBarbershops as any}
        barberProfile={barberProfile[0] as any}
        bookings={userBookings as any}
        locale={locale}
        userRole={userRole}
        userName={session.user.name || ''}
      />
    </div>
  );
}
