import { NextAuthOptions } from 'next-auth';
import { DrizzleAdapter } from '@auth/drizzle-adapter';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { db } from './db';
import { users } from './db/schema';
import { eq } from 'drizzle-orm';

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

          // Trim all credential values to avoid whitespace/URL param leakage
          const email = credentials.email?.trim() || '';
          const phone = credentials.phone?.trim() || '';
          const username = credentials.username?.trim() || '';
          const password = credentials.password;

          const identifier = email || phone || username;
        if (!identifier) {
          return null;
        }

          console.log('🔐 Authorize - login for:', identifier);

        const safeSelect = {
          id: users.id,
          email: users.email,
          password: users.password,
          name: users.name,
          role: users.role,
          image: users.image,
        };

        let user;
        if (credentials.username) {
          user = await db
            .select(safeSelect)
            .from(users)
            .where(eq(users.username, credentials.username))
            .limit(1);
        } else if (credentials.email) {
          user = await db
            .select(safeSelect)
            .from(users)
            .where(eq(users.email, credentials.email))
            .limit(1);
        } else {
          user = await db
            .select(safeSelect)
            .from(users)
            .where(eq(users.phone, credentials.phone!))
            .limit(1);
        }

        if (!user.length) {
            console.log('❌ User not found:', identifier);
          return null;
        }

        const isPasswordValid = await bcrypt.compare(
            password,
          user[0].password || ''
        );

        if (!isPasswordValid) {
            console.log('❌ Invalid password for:', identifier);
          return null;
        }

          console.log('✅ Login OK:', user[0].email);

        return {
          id: user[0].id,
          email: user[0].email,
          name: user[0].name,
          role: user[0].role,
          image: user[0].image || undefined,
        };
        } catch (error) {
          console.error('❌ Authorize error:', error);
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
    async jwt({ token, user, trigger, account }) {
      try {
        // Always fetch fresh role from database on every request
        if (token.sub) {
          console.log('🔄 JWT Callback - Fetching fresh data for:', token.sub);
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
            console.log('✅ JWT Callback - Fresh data loaded', { role: token.role });
          } else {
            console.log('⚠️ JWT Callback - User not found in DB');
          }
        }

        // Also handle initial sign in
        if (user) {
          token.role = user.role;
          console.log('👤 JWT Callback - Initial sign in', { role: user.role });
        }

        return token;
      } catch (error) {
        console.error('❌ JWT Callback Error:', error);
        return token; // Return token to avoid crashing the session
      }
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!;
        session.user.role = token.role as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;

        console.log('📋 Session Callback - Role set to:', {
          email: session.user.email,
          role: session.user.role
        });
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/signin',
  },
  debug: process.env.NODE_ENV === 'development',
};
