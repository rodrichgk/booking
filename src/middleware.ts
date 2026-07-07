import createMiddleware from 'next-intl/middleware';
import { getToken } from 'next-auth/jwt';
import { NextRequest, NextResponse } from 'next/server';

const intlMiddleware = createMiddleware({
  // A list of all locales that are supported
  locales: ['fr', 'en'],

  // Used when no locale matches (French as specified in user rules)
  defaultLocale: 'fr',
});

// Localized admin section: /fr/admin/... or /en/admin/...
const ADMIN_PATH = /^\/(fr|en)\/admin(\/|$)/;

export default async function middleware(request: NextRequest) {
  const adminMatch = request.nextUrl.pathname.match(ADMIN_PATH);

  // Centralized role gate for the admin UI. API routes keep their own checks;
  // this is defense-in-depth so an unprotected admin page can't leak.
  if (adminMatch) {
    const locale = adminMatch[1];
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    const role = (token as any)?.role;

    if (!token) {
      const signInUrl = new URL(`/${locale}/auth/signin`, request.url);
      signInUrl.searchParams.set('callbackUrl', request.nextUrl.pathname);
      return NextResponse.redirect(signInUrl);
    }

    if (role !== 'admin' && role !== 'dev') {
      // Authenticated but not authorized.
      return NextResponse.redirect(new URL(`/${locale}`, request.url));
    }
  }

  return intlMiddleware(request);
}

export const config = {
  // Match only internationalized pathnames
  matcher: ['/', '/(fr|en)/:path*'],
};
