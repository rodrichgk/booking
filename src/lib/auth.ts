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
        if (!credentials?.password) {
          console.log('❌ Authorize - No password provided');
          return null;
        }

        // Allow login with email, phone, or username
        const identifier = credentials.email || credentials.phone || credentials.username;
        if (!identifier) {
          console.log('❌ Authorize - No identifier provided');
          return null;
        }

        console.log('🔐 Authorize - Attempting login for:', identifier);
        if (credentials.email) console.log('   via Email');
        if (credentials.username) console.log('   via Username');
        if (credentials.phone) console.log('   via Phone');

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
          return null;
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user[0].password || ''
        );

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user[0].id,
          email: user[0].email,
          name: user[0].name,
          role: user[0].role,
          image: user[0].image || undefined,
        };
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
