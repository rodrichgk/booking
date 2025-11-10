import { redirect } from 'next/navigation';

// Redirect old /my-barbershops to new /my-space
export default async function MyBarbershopPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  redirect(`/${locale}/my-space`);
}
