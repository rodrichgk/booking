'use client';

import { NextIntlClientProvider, IntlErrorCode, type AbstractIntlMessages } from 'next-intl';
import type { ReactNode } from 'react';

/**
 * Wraps NextIntlClientProvider with resilient error handling so a missing
 * translation key renders a fallback (the key) instead of throwing and crashing
 * the client render. Mirrors the server-side handling in src/i18n.ts.
 */
export function IntlProvider({
  locale,
  messages,
  children,
}: {
  locale: string;
  messages: AbstractIntlMessages;
  children: ReactNode;
}) {
  return (
    <NextIntlClientProvider
      locale={locale}
      messages={messages}
      onError={(error) => {
        if (error.code === IntlErrorCode.MISSING_MESSAGE) return;
        console.error(error);
      }}
      getMessageFallback={({ key }) => key}
    >
      {children}
    </NextIntlClientProvider>
  );
}
