import { redirect } from 'next/navigation';
import { headers } from 'next/headers';

export default async function SignInRedirect() {
  // Get the locale from referer URL or default to 'fr'
  const headersList = await headers();
  const referer = headersList.get('referer') || '';
  
  // Extract locale from referer URL (e.g., /fr/ or /en/)
  let locale = 'fr'; // default
  const localeMatch = referer.match(/\/(fr|en)\//);
  if (localeMatch) {
    locale = localeMatch[1];
  } else {
    // Fallback to Accept-Language header
    const acceptLanguage = headersList.get('accept-language') || '';
    locale = acceptLanguage.includes('en') ? 'en' : 'fr';
  }
  
  redirect(`/${locale}/auth/signin`);
}
