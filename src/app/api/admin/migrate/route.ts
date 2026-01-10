import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import postgres from 'postgres';

export async function POST(request: Request) {
    try {
        // Only allow admin/dev users to run migrations
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userRole = (session.user as any).role;
        if (userRole !== 'admin' && userRole !== 'dev') {
            return NextResponse.json({ error: 'Forbidden - Admin/Dev only' }, { status: 403 });
        }

        // Get connection string with OR pattern for Vercel
        const connectionString = process.env.booking_POSTGRES_URL || process.env.POSTGRES_URL;

        if (!connectionString) {
            return NextResponse.json({ error: 'Database connection not configured' }, { status: 500 });
        }

        const sql = postgres(connectionString);

        // Run the migration to add subscription columns
        const migrationResults = [];

        try {
            // Add stripe_customer_id column
            await sql`
        ALTER TABLE barbershops 
        ADD COLUMN IF NOT EXISTS stripe_customer_id VARCHAR(255)
      `;
            migrationResults.push('Added stripe_customer_id column');
        } catch (e: any) {
            migrationResults.push(`stripe_customer_id: ${e.message}`);
        }

        try {
            // Add stripe_subscription_id column
            await sql`
        ALTER TABLE barbershops 
        ADD COLUMN IF NOT EXISTS stripe_subscription_id VARCHAR(255)
      `;
            migrationResults.push('Added stripe_subscription_id column');
        } catch (e: any) {
            migrationResults.push(`stripe_subscription_id: ${e.message}`);
        }

        try {
            // Add subscription_status column
            await sql`
        ALTER TABLE barbershops 
        ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(50) DEFAULT 'inactive'
      `;
            migrationResults.push('Added subscription_status column');
        } catch (e: any) {
            migrationResults.push(`subscription_status: ${e.message}`);
        }

        try {
            // Add current_period_end column
            await sql`
        ALTER TABLE barbershops 
        ADD COLUMN IF NOT EXISTS current_period_end TIMESTAMP
      `;
            migrationResults.push('Added current_period_end column');
        } catch (e: any) {
            migrationResults.push(`current_period_end: ${e.message}`);
        }

        await sql.end();

        return NextResponse.json({
            success: true,
            message: 'Migration completed',
            results: migrationResults
        });

    } catch (error: any) {
        console.error('Migration error:', error);
        return NextResponse.json(
            { error: 'Migration failed', details: error.message },
            { status: 500 }
        );
    }
}
