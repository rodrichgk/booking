import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';

// TEMPORARY emergency migration endpoint - no auth required
// Protected by a secret key in the URL query parameter
// DELETE THIS FILE after running the migration successfully

export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get('secret');

  if (secret !== 'orphelia-migrate-2026') {
    return NextResponse.json({ error: 'Invalid secret' }, { status: 403 });
  }

  const migrations = [
    `ALTER TABLE "user" ADD COLUMN IF NOT EXISTS username VARCHAR(50) UNIQUE`,
    `ALTER TABLE barbers ADD COLUMN IF NOT EXISTS barber_type VARCHAR(100)`,
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

  return NextResponse.json({
    success: true,
    message: 'Emergency migrations executed',
    results,
  });
}
