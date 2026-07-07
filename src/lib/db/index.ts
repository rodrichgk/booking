import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString =
  process.env.booking_POSTGRES_URL ||
  process.env.POSTGRES_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  process.env.POSTGRES_URL_NON_POOLING;

// During `next build`, page-data collection imports every route module and the
// NextAuth Drizzle adapter inspects `db` at module load. On environments without
// a database URL at build time (e.g. Vercel Preview) that would crash the build.
// postgres-js is lazy — it never opens a connection until a query actually runs,
// which does not happen during collection — so a placeholder URL is safe here.
// A missing URL at real runtime still fails loudly (the placeholder host is
// unreachable), and correctly-configured environments always provide the real one.
const isBuildPhase = process.env.NEXT_PHASE === 'phase-production-build';

if (!connectionString && !isBuildPhase) {
  throw new Error(
    'No Postgres URL found. Checked: booking_POSTGRES_URL, POSTGRES_URL, POSTGRES_PRISMA_URL, POSTGRES_URL_NON_POOLING'
  );
}

const client = postgres(connectionString || 'postgres://build:build@127.0.0.1:5432/build');

export const db = drizzle(client, { schema });

export * from './schema';
