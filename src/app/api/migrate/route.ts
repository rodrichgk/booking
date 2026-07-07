import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';

// Vetted, idempotent schema migrations. This endpoint intentionally does NOT
// accept arbitrary SQL from the request body — it only runs this fixed list,
// and only for authenticated admin/dev users.
const MIGRATIONS: string[] = [
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
    `ALTER TABLE services ADD COLUMN IF NOT EXISTS image TEXT`,
    // Stripe subscription columns for barbershops
    `ALTER TABLE barbershops ADD COLUMN IF NOT EXISTS stripe_customer_id VARCHAR(255)`,
    `ALTER TABLE barbershops ADD COLUMN IF NOT EXISTS stripe_subscription_id VARCHAR(255)`,
    `ALTER TABLE barbershops ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(50) DEFAULT 'inactive'`,
    `ALTER TABLE barbershops ADD COLUMN IF NOT EXISTS current_period_end TIMESTAMP`,
    // Security logs table
    `CREATE TABLE IF NOT EXISTS security_logs (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID REFERENCES "user"(id),
        type VARCHAR(50) NOT NULL,
        email VARCHAR(255),
        ip VARCHAR(45),
        user_agent TEXT,
        location VARCHAR(255),
        details TEXT,
        status VARCHAR(20) NOT NULL DEFAULT 'success',
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
    )`,
    // Blocked IPs table
    `CREATE TABLE IF NOT EXISTS blocked_ips (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        ip VARCHAR(45) NOT NULL UNIQUE,
        reason TEXT,
        blocked_by UUID REFERENCES "user"(id),
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        expires_at TIMESTAMP
    )`,
    // Courses tables
    `CREATE TABLE IF NOT EXISTS courses (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        thumbnail TEXT,
        price_in_cents INTEGER NOT NULL DEFAULT 0,
        currency VARCHAR(10) NOT NULL DEFAULT 'EUR',
        is_active BOOLEAN DEFAULT true,
        is_featured BOOLEAN DEFAULT false,
        created_by UUID REFERENCES "user"(id),
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS course_videos (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        youtube_video_id VARCHAR(20) NOT NULL,
        "order" INTEGER DEFAULT 0,
        duration INTEGER,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS course_purchases (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID NOT NULL REFERENCES "user"(id),
        course_id UUID NOT NULL REFERENCES courses(id),
        stripe_payment_intent_id VARCHAR(255),
        stripe_session_id VARCHAR(255),
        amount_paid INTEGER NOT NULL,
        currency VARCHAR(10) NOT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'pending',
        purchased_at TIMESTAMP DEFAULT NOW() NOT NULL
    )`,
    `ALTER TABLE barbers ADD COLUMN IF NOT EXISTS name VARCHAR(255)`,
    `ALTER TABLE "user" ADD COLUMN IF NOT EXISTS username VARCHAR(50) UNIQUE`,
    `ALTER TABLE barbers ADD COLUMN IF NOT EXISTS barber_type VARCHAR(100)`,
    `UPDATE barbers SET barber_type = 'Coiffeur' WHERE barber_type = 'Coiffeur Homme'`,
    `UPDATE barbers SET barber_type = 'Coiffeuse' WHERE barber_type = 'Coiffeuse Femme'`,
    `ALTER TABLE barbershops ADD COLUMN IF NOT EXISTS co_owner_id UUID REFERENCES "user"(id)`,
    `ALTER TABLE barbers ADD COLUMN IF NOT EXISTS opening_hours JSONB`,
    `ALTER TABLE "user" ADD COLUMN IF NOT EXISTS reset_password_token VARCHAR(255)`,
    `ALTER TABLE "user" ADD COLUMN IF NOT EXISTS reset_password_expires TIMESTAMP`,
    // Prevent double-booking: at most one confirmed booking per barber per exact
    // start time. The application still guards against partial overlaps, but this
    // closes the read-then-insert race for identical slots at the database level.
    `CREATE UNIQUE INDEX IF NOT EXISTS bookings_barber_start_confirmed_unique
        ON bookings (barber_id, start_time)
        WHERE barber_id IS NOT NULL AND status = 'confirmed'`,
];

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        const userRole = (session?.user as any)?.role;
        if (!session?.user || !['dev', 'admin'].includes(userRole)) {
            return NextResponse.json({ error: 'Non autorisé - Admin/Dev requis' }, { status: 401 });
        }

        const results = [];
        for (const migrationSql of MIGRATIONS) {
            try {
                await db.execute(sql.raw(migrationSql));
                results.push({ sql: migrationSql.substring(0, 60) + '...', status: 'success' });
            } catch (error: any) {
                results.push({ sql: migrationSql.substring(0, 60) + '...', status: 'error', error: error.message });
            }
        }

        return NextResponse.json({ success: true, message: 'Migrations exécutées', results });
    } catch (error: any) {
        console.error('Migration error:', error);
        return NextResponse.json({ error: error.message || 'Une erreur est survenue' }, { status: 500 });
    }
}

export async function GET() {
    const session = await getServerSession(authOptions);
    const userRole = (session?.user as any)?.role;
    if (!session?.user || !['dev', 'admin'].includes(userRole)) {
        return NextResponse.json({ error: 'Non autorisé - Admin/Dev requis' }, { status: 401 });
    }
    return NextResponse.json({
        message: 'Migration API ready',
        instructions: 'POST to this endpoint (admin/dev session required) to run all pending migrations.',
    });
}
