import { redirect } from 'next/navigation';

// Redirect old /bookings routes to new /my-space routes
export default async function BookingsPage({ 
  params 
}: { 
  params: Promise<{ locale: string }> 
}) {
  const { locale } = await params;
  redirect(`/${locale}/my-space`);
}
