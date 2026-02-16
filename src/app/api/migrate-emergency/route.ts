import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';

// TEMPORARY emergency migration endpoint - no auth required
// Protected by a secret key. DELETE THIS FILE after running.

export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get('secret');

  if (secret !== 'orphelia-migrate-2026') {
    return NextResponse.json({ error: 'Invalid secret' }, { status: 403 });
  }

  const migrations = [
    `ALTER TABLE "user" ADD COLUMN IF NOT EXISTS username VARCHAR(50) UNIQUE`,
    `ALTER TABLE barbers ADD COLUMN IF NOT EXISTS barber_type VARCHAR(100)`,
    `UPDATE barbers SET barber_type = 'Coiffeur' WHERE barber_type = 'Coiffeur Homme'`,
    `UPDATE barbers SET barber_type = 'Coiffeuse' WHERE barber_type = 'Coiffeuse Femme'`,
    `ALTER TABLE barbershops ADD COLUMN IF NOT EXISTS co_owner_id UUID REFERENCES "user"(id)`,
    `ALTER TABLE barbers ADD COLUMN IF NOT EXISTS opening_hours JSONB`,
  ];

  const results = [];
  for (const migrationSql of migrations) {
    try {
      await db.execute(sql.raw(migrationSql));
      results.push({ sql: migrationSql, status: 'success' });
    } catch (error: any) {
      results.push({ sql: migrationSql, status: 'error', error: error.message });
    }
  }

  return NextResponse.json({ success: true, results });
}
