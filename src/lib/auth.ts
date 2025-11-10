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
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials, req) {
        if (!credentials?.password) {
          return null;
        }

        // Allow login with either email or phone
        const identifier = credentials.email || credentials.phone;
        if (!identifier) {
          return null;
        }

        const user = await db
          .select()
          .from(users)
          .where(
            credentials.email 
              ? eq(users.email, credentials.email)
              : eq(users.phone, credentials.phone!)
          )
          .limit(1);

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
    async jwt({ token, user, trigger }) {
      // On sign in or when explicitly requested, fetch user data from database
      if (user) {
        token.role = user.role;
      } else if (token.sub) {
        // Fetch fresh user data from database to get latest role
        const dbUser = await db
          .select()
          .from(users)
          .where(eq(users.id, token.sub))
          .limit(1);
        
        if (dbUser.length > 0) {
          token.role = dbUser[0].role;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!;
        session.user.role = token.role as string;
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
