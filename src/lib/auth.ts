import { NextAuthOptions } from 'next-auth';
import { DrizzleAdapter } from '@auth/drizzle-adapter';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { db } from './db';
import { users } from './db/schema';
import { eq } from 'drizzle-orm';
import { headers } from 'next/headers';
import { getClientIp, isIpBlocked, logSecurityEvent, countRecentFailedLogins } from './security';
import { getMaxLoginAttempts } from './settings';

// Error codes thrown from authorize(); the sign-in page maps them to messages.
export const AUTH_ERROR_TOO_MANY_ATTEMPTS = 'TOO_MANY_ATTEMPTS';
export const AUTH_ERROR_IP_BLOCKED = 'IP_BLOCKED';

/** Request headers, or null when called outside a request (never throws). */
async function requestHeaders(): Promise<Headers | null> {
  try {
    return await headers();
  } catch {
    return null;
  }
}

export const authOptions: NextAuthOptions = {
  adapter: DrizzleAdapter(db) as any,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        phone: { label: 'Phone', type: 'tel' },
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials, req) {
        try {
          if (!credentials?.password) {
            return null;
          }

          // Trim all credential values to avoid whitespace/URL param leakage.
          // NextAuth serializes undefined as the string "undefined", so filter that out.
          const email = (credentials.email && credentials.email !== 'undefined') ? credentials.email.trim() : '';
          const phone = (credentials.phone && credentials.phone !== 'undefined') ? credentials.phone.trim() : '';
          const username = (credentials.username && credentials.username !== 'undefined') ? credentials.username.trim() : '';
          const password = credentials.password;

          const identifier = email || phone || username;
          if (!identifier) {
            return null;
          }

          const ip = getClientIp(req?.headers as any);
          const userAgent = (req?.headers as any)?.['user-agent'] ?? null;

          if (await isIpBlocked(ip)) {
            await logSecurityEvent({ type: 'blocked_request', email: identifier, ip, userAgent, details: 'Connexion refusée : IP bloquée', status: 'failed' });
            throw new Error(AUTH_ERROR_IP_BLOCKED);
          }

          // Brute-force protection: too many recent failures for this identifier or IP.
          const maxAttempts = await getMaxLoginAttempts();
          if ((await countRecentFailedLogins(identifier, ip)) >= maxAttempts) {
            await logSecurityEvent({ type: 'failed_login', email: identifier, ip, userAgent, details: 'Trop de tentatives, connexion bloquée 15 min', status: 'failed' });
            throw new Error(AUTH_ERROR_TOO_MANY_ATTEMPTS);
          }

          const fail = async (details: string) => {
            await logSecurityEvent({ type: 'failed_login', email: identifier, ip, userAgent, details, status: 'failed' });
            return null;
          };

          const safeSelect = {
            id: users.id,
            email: users.email,
            password: users.password,
            name: users.name,
            role: users.role,
            image: users.image,
          };

          let user;
          if (username) {
            user = await db.select(safeSelect).from(users).where(eq(users.username, username)).limit(1);
          } else if (email) {
            user = await db.select(safeSelect).from(users).where(eq(users.email, email)).limit(1);
          } else {
            user = await db.select(safeSelect).from(users).where(eq(users.phone, phone)).limit(1);
          }

          if (!user.length) {
            return fail('Compte inconnu');
          }

          const isPasswordValid = await bcrypt.compare(password, user[0].password || '');
          if (!isPasswordValid) {
            return fail('Mot de passe incorrect');
          }

          await logSecurityEvent({ type: 'login', email: user[0].email, userId: user[0].id, ip, userAgent, details: 'Identifiants' });

          return {
            id: user[0].id,
            email: user[0].email,
            name: user[0].name,
            role: user[0].role,
            image: user[0].image || undefined,
          };
        } catch (error) {
          // Let our coded errors reach the sign-in page; anything else is a plain failure.
          if (error instanceof Error && (error.message === AUTH_ERROR_IP_BLOCKED || error.message === AUTH_ERROR_TOO_MANY_ATTEMPTS)) {
            throw error;
          }
          console.error('Authorize error:', error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },
  jwt: {
    maxAge: 24 * 60 * 60, // 24 hours
  },
  callbacks: {
    async signIn({ account }) {
      // Credentials are checked in authorize(); here we only gate OAuth sign-ins.
      if (account?.provider === 'credentials') return true;
      const h = await requestHeaders();
      const ip = getClientIp(h);
      if (await isIpBlocked(ip)) {
        await logSecurityEvent({ type: 'blocked_request', ip, userAgent: h?.get('user-agent'), details: `Connexion ${account?.provider ?? ''} refusée : IP bloquée`, status: 'failed' });
        return false;
      }
      return true;
    },
    async jwt({ token, user, trigger, account }) {
      try {
        // Always fetch fresh role from database on every request
        if (token.sub) {
          const dbUser = await db
            .select({
              role: users.role,
              email: users.email,
              name: users.name,
            })
            .from(users)
            .where(eq(users.id, token.sub))
            .limit(1);

          if (dbUser.length > 0) {
            token.role = dbUser[0].role;
            token.email = dbUser[0].email;
            token.name = dbUser[0].name;
          }
        }

        // Also handle initial sign in
        if (user) {
          token.role = user.role;
        }

        return token;
      } catch (error) {
        console.error('JWT callback error:', error);
        return token; // Return token to avoid crashing the session
      }
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!;
        session.user.role = token.role as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
      }
      return session;
    },
  },
  events: {
    async signIn({ user, account }) {
      if (account?.provider === 'credentials') return; // already logged in authorize()
      const h = await requestHeaders();
      await logSecurityEvent({ type: 'login', email: user.email, userId: user.id, ip: getClientIp(h), userAgent: h?.get('user-agent'), details: account?.provider === 'google' ? 'Google' : account?.provider });
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/signin',
  },
  debug: process.env.NODE_ENV === 'development',
};
