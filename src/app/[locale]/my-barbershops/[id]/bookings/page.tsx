import { redirect } from 'next/navigation';

// Redirect old /my-barbershops/:id/bookings to the new /my-space bookings page
export default async function LegacyBookingsPage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const { id, locale } = await params;
  redirect(`/${locale}/my-space/${id}/bookings`);
}
