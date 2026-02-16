import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';

// TEMPORARY emergency migration endpoint - no auth required
// Protected by a secret key. DELETE THIS FILE after running.

export async function GET(request: NextRequest) {
  try {
    const secret = request.nextUrl.searchParams.get('secret');

    if (secret !== 'orphelia-migrate-2026') {
      return NextResponse.json({ error: 'Invalid secret' }, { status: 403 });
    }

    if (!db) {
      return NextResponse.json({ error: 'Database connection not initialized' }, { status: 500 });
    }

    const migrations = [
      `ALTER TABLE "user" ADD COLUMN IF NOT EXISTS reset_password_token VARCHAR(255)`,
      `ALTER TABLE "user" ADD COLUMN IF NOT EXISTS reset_password_expires TIMESTAMP`,
    ];

    const results = [];
    for (const migrationSql of migrations) {
      try {
        await db.execute(sql.raw(migrationSql));
        results.push({ sql: migrationSql, status: 'success' });
      } catch (error: any) {
        console.error(`Migration failed for: ${migrationSql}`, error);
        results.push({ sql: migrationSql, status: 'error', error: error.message || String(error) });
      }
    }

    return NextResponse.json({ success: true, results });
  } catch (globalError: any) {
    console.error('Global migration error:', globalError);
    return NextResponse.json({ error: globalError.message || 'Fatal error', details: String(globalError) }, { status: 500 });
  }
}
