import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const secret = request.nextUrl.searchParams.get('secret');

    if (secret !== 'orphelia-migrate-2026') {
      return NextResponse.json({ error: 'Invalid secret' }, { status: 403 });
    }

    // Dynamic import to catch initialization errors (e.g. missing env vars)
    let db;
    let sql;
    try {
      const dbModule = await import('@/lib/db');
      const drizzleModule = await import('drizzle-orm');
      db = dbModule.db;
      sql = drizzleModule.sql;
    } catch (importError: any) {
      console.error('Failed to initialize DB:', importError);
      return NextResponse.json({
        error: 'Database initialization failed. Check environment variables.',
        details: importError.message
      }, { status: 500 });
    }

    if (!db) {
      return NextResponse.json({ error: 'Database connection invalid' }, { status: 500 });
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
