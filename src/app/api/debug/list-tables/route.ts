import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';

// List all tables in the database
export async function GET(request: NextRequest) {
  try {
    // Get all table names from PostgreSQL
    const result = await db.execute(
      sql`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name`
    );

    return NextResponse.json({
      tables: result,
      count: result.length,
    });
  } catch (error: any) {
    return NextResponse.json({ 
      error: error.message, 
      code: error.code,
      detail: error.detail 
    }, { status: 500 });
  }
}
