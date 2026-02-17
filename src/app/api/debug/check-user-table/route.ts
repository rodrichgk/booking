import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';

// Check user table structure and data
export async function GET(request: NextRequest) {
  try {
    // Get column names and types
    const columns = await db.execute(
      sql`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'user' ORDER BY ordinal_position`
    );

    // Get sample user data (first 3 users, emails only)
    const sampleUsers = await db.execute(
      sql`SELECT id, email, name, role FROM "user" LIMIT 5`
    );

    // Try to find the specific user
    const specificUser = await db.execute(
      sql`SELECT id, email, name, role FROM "user" WHERE email = 'maggy.cyanee@gmail.com'`
    );

    return NextResponse.json({
      columns,
      sampleUsers,
      specificUser,
      specificUserFound: specificUser.length > 0,
    });
  } catch (error: any) {
    return NextResponse.json({ 
      error: error.message, 
      code: error.code,
      detail: error.detail,
      stack: error.stack
    }, { status: 500 });
  }
}
