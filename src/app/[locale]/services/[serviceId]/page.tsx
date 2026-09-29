import { notFound, redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { services } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

/**
 * /services/:id (and /services/:id/book) send the visitor to the salon's
 * booking flow with this service already selected.
 */
export default async function ServiceRedirectPage({ params }: { params: Promise<{ serviceId: string; locale: string }> }) {
  const { serviceId, locale } = await params;

  const [service] = await db
    .select({ barbershopId: services.barbershopId })
    .from(services)
    .where(eq(services.id, serviceId))
    .limit(1)
    .catch(() => []); // non-UUID ids from old links throw in Postgres

  if (!service) notFound();
  redirect(`/${locale}/barbershops/${service.barbershopId}/booking?serviceId=${serviceId}`);
}
