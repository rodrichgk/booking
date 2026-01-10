import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Only allow dev/admin users to run migrations
    const userRole = (session?.user as any)?.role;
    if (!session?.user || !['dev', 'admin'].includes(userRole)) {
      return NextResponse.json(
        { error: 'Non autorisé - Admin/Dev requis' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { migration } = body;

    if (!migration) {
      // Run all pending migrations
      const migrations = [
        // Site settings table
        `CREATE TABLE IF NOT EXISTS site_settings (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          key VARCHAR(255) NOT NULL UNIQUE,
          value JSONB NOT NULL,
          description TEXT,
          updated_by UUID REFERENCES "user"(id),
          created_at TIMESTAMP DEFAULT NOW() NOT NULL,
          updated_at TIMESTAMP DEFAULT NOW() NOT NULL
        )`,
        // Add image column to services
        `ALTER TABLE services ADD COLUMN IF NOT EXISTS image TEXT`,
        // Stripe subscription columns for barbershops
        `ALTER TABLE barbershops ADD COLUMN IF NOT EXISTS stripe_customer_id VARCHAR(255)`,
        `ALTER TABLE barbershops ADD COLUMN IF NOT EXISTS stripe_subscription_id VARCHAR(255)`,
        `ALTER TABLE barbershops ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(50) DEFAULT 'inactive'`,
        `ALTER TABLE barbershops ADD COLUMN IF NOT EXISTS current_period_end TIMESTAMP`,
      ];

      const results = [];
      for (const migrationSql of migrations) {
        try {
          await db.execute(sql.raw(migrationSql));
          results.push({ sql: migrationSql.substring(0, 50) + '...', status: 'success' });
        } catch (error: any) {
          results.push({ sql: migrationSql.substring(0, 50) + '...', status: 'error', error: error.message });
        }
      }

      return NextResponse.json({
        success: true,
        message: 'Migrations exécutées',
        results,
      });
    }

    // Run specific migration
    await db.execute(sql.raw(migration));

    return NextResponse.json({
      success: true,
      message: 'Migration exécutée avec succès',
    });
  } catch (error: any) {
    console.error('Migration error:', error);
    return NextResponse.json(
      { error: error.message || 'Une erreur est survenue' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Only allow dev/admin users
    const userRole = (session?.user as any)?.role;
    if (!session?.user || !['dev', 'admin'].includes(userRole)) {
      return NextResponse.json(
        { error: 'Non autorisé - Admin/Dev requis' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      message: 'Migration API ready',
      instructions: 'POST to this endpoint to run migrations. Send empty body to run all pending migrations.',
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Une erreur est survenue' },
      { status: 500 }
    );
  }
}
