import { redirect } from 'next/navigation';
import { headers } from 'next/headers';

export default async function ErrorRedirect({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  // Get the locale from referer URL or default to 'fr'
  const headersList = await headers();
  const referer = headersList.get('referer') || '';
  
  // Extract locale from referer URL (e.g., /fr/auth/signin or /en/auth/signin)
  let locale = 'fr'; // default
  const localeMatch = referer.match(/\/(fr|en)\//);
  if (localeMatch) {
    locale = localeMatch[1];
  } else {
    // Fallback to Accept-Language header
    const acceptLanguage = headersList.get('accept-language') || '';
    locale = acceptLanguage.includes('en') ? 'en' : 'fr';
  }
  
  // Preserve the error parameter
  const params = await searchParams;
  const error = params.error ? `?error=${params.error}` : '';
  
  redirect(`/${locale}/auth/signin${error}`);
}
