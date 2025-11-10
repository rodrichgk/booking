import { redirect } from 'next/navigation';

// Redirect old /my-barbershops routes to new /my-space routes
export default async function ManageBarbershopPage({ 
  params 
}: { 
  params: Promise<{ id: string; locale: string }> 
}) {
  const { id, locale } = await params;
  redirect(`/${locale}/my-space/${id}`);
}
