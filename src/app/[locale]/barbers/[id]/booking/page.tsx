import { notFound, redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { barbers, barbershops } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

/**
 * Booking with a specific barber uses the salon's booking flow, with the
 * barber (and any ?serviceId=) preselected, so there is one flow to maintain
 * and it honours opening hours, closures and taken slots.
 */
export default async function BarberBookingRedirect({
  params,
  searchParams,
}: {
  params: Promise<{ id: string; locale: string }>;
  searchParams: Promise<{ serviceId?: string }>;
}) {
  const { id, locale } = await params;
  const { serviceId } = await searchParams;

  const [barber] = await db
    .select({ barbershopId: barbers.barbershopId, isActive: barbers.isActive, shopActive: barbershops.isActive })
    .from(barbers)
    .innerJoin(barbershops, eq(barbers.barbershopId, barbershops.id))
    .where(eq(barbers.id, id))
    .limit(1)
    .catch(() => []);

  if (!barber || !barber.isActive || !barber.shopActive) notFound();

  const query = new URLSearchParams({ barberId: id });
  if (serviceId) query.set('serviceId', serviceId);
  redirect(`/${locale}/barbershops/${barber.barbershopId}/booking?${query}`);
}
