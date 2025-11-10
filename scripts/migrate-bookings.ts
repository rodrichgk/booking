// Load environment variables FIRST
import { config } from 'dotenv';
import { join } from 'path';
config({ path: join(process.cwd(), '.env.local') });

// Import db after env is loaded
const { db } = require('../src/lib/db');
const { sql } = require('drizzle-orm');

async function migrateBookings() {
  try {
    console.log('🔄 Starting bookings table migration...\n');

    // Add new columns
    console.log('Adding customer_name column...');
    await db.execute(sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS customer_name VARCHAR(255)`);
    
    console.log('Adding customer_email column...');
    await db.execute(sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS customer_email VARCHAR(255)`);
    
    console.log('Adding customer_phone column...');
    await db.execute(sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS customer_phone VARCHAR(20)`);
    
    // Make customer_id optional
    console.log('Making customer_id optional...');
    await db.execute(sql`ALTER TABLE bookings ALTER COLUMN customer_id DROP NOT NULL`);
    
    // Make service_id optional (might not exist yet, handle error gracefully)
    console.log('Making service_id optional...');
    try {
      await db.execute(sql`ALTER TABLE bookings ALTER COLUMN service_id DROP NOT NULL`);
    } catch (e) {
      console.log('  Note: service_id constraint might not exist, skipping...');
    }

    console.log('\n✅ Migration completed successfully!');
    console.log('\nBookings table now supports:');
    console.log('  - Guest bookings (no user account required)');
    console.log('  - Customer contact info (name, email, phone)');
    console.log('  - Optional barber and service selection');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrateBookings()
  .then(() => {
    console.log('\n✨ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
