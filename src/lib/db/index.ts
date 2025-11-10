import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.booking_POSTGRES_URL || process.env.POSTGRES_URL!;

if (!connectionString) {
  throw new Error('booking_POSTGRES_URL or POSTGRES_URL environment variable is not set');
}

// Create postgres client
const client = postgres(connectionString);

// Create drizzle instance
export const db = drizzle(client, { schema });

export * from './schema';
