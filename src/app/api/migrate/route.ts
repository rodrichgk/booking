import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  // Simple security: check for secret key in query params
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');
  
  if (secret !== 'run-migration-2024') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Make user_id nullable (for guest bookings)
    await db.execute(sql`ALTER TABLE bookings ALTER COLUMN user_id DROP NOT NULL`);
    
    // Make barber_id nullable (when no specific barber is selected)
    await db.execute(sql`ALTER TABLE bookings ALTER COLUMN barber_id DROP NOT NULL`);
    
    // Make service_id nullable (when no specific service is selected)
    await db.execute(sql`ALTER TABLE bookings ALTER COLUMN service_id DROP NOT NULL`);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Migration completed successfully! Foreign keys are now nullable.' 
    });
  } catch (error: any) {
    console.error('Migration error:', error);
    return NextResponse.json({ 
      error: 'Migration failed', 
      details: error.message 
    }, { status: 500 });
  }
}
