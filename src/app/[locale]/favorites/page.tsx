import { redirect } from 'next/navigation';

// Redirect old /favorites routes to new /my-space routes
export default async function FavoritesPage({ 
  params 
}: { 
  params: Promise<{ locale: string }> 
}) {
  const { locale } = await params;
  redirect(`/${locale}/my-space`);
}
