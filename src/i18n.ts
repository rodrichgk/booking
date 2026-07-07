import { getRequestConfig } from 'next-intl/server';
import { IntlErrorCode } from 'next-intl';
import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  // This typically corresponds to the `[locale]` segment
  let locale = await requestLocale;

  // Ensure that a valid locale is used
  if (!locale || !routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale;
  }

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
    timeZone: 'Europe/Paris',
    // A missing translation must never crash a whole page. Swallow missing-message
    // errors (log them in dev) and fall back to the key so the page still renders.
    onError(error) {
      if (error.code === IntlErrorCode.MISSING_MESSAGE) {
        if (process.env.NODE_ENV !== 'production') {
          console.warn(`[i18n] ${error.message}`);
        }
        return;
      }
      console.error(error);
    },
    getMessageFallback({ key }) {
      return key;
    }
  };
});
