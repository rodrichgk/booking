import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Montserrat, DM_Sans } from 'next/font/google';
import { Providers } from '@/components/providers';
import { Analytics } from '@vercel/analytics/next';

const locales = ['fr', 'en'];

const montserrat = Montserrat({ 
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-montserrat',
});

const dmSans = DM_Sans({ 
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-dm-sans',
});

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as any)) notFound();

  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();

  return (
    <html lang={locale} className={`${montserrat.variable} ${dmSans.variable}`}>
      {/* 
        suppressHydrationWarning is added to prevent hydration mismatch errors
        caused by browser extensions (like CookieZ) that add attributes to the body tag.
        This is safe as we're only suppressing warnings for the body tag where external
        attributes might be added beyond our control.
      */}
      <body className="font-sans antialiased" suppressHydrationWarning={true}>
        <Providers>
          <NextIntlClientProvider messages={messages}>
            {children}
          </NextIntlClientProvider>
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}
