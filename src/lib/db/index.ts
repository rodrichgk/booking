import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = 
  process.env.booking_POSTGRES_URL || 
  process.env.POSTGRES_URL || 
  process.env.POSTGRES_PRISMA_URL || 
  process.env.POSTGRES_URL_NON_POOLING;

if (!connectionString) {
  throw new Error('No Postgres URL found. Checked: booking_POSTGRES_URL, POSTGRES_URL, POSTGRES_PRISMA_URL, POSTGRES_URL_NON_POOLING');
}

// Create postgres client
const client = postgres(connectionString);

// Create drizzle instance
export const db = drizzle(client, { schema });

export * from './schema';
