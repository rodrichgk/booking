// Load environment variables FIRST
import { config } from 'dotenv';
import { join } from 'path';
config({ path: join(process.cwd(), '.env.local') });

// Import db after env is loaded
const { db } = require('../src/lib/db');
const { sql } = require('drizzle-orm');

async function checkBookingsSchema() {
  try {
    console.log('🔍 Checking bookings table schema...\n');

    const result = await db.execute(sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'bookings'
      ORDER BY ordinal_position;
    `);

    console.log('Current columns in bookings table:');
    console.log('────────────────────────────────────────────────');
    result.forEach((row: any) => {
      console.log(`${row.column_name.padEnd(25)} ${row.data_type.padEnd(20)} ${row.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });
    console.log('────────────────────────────────────────────────\n');
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkBookingsSchema()
  .then(() => {
    console.log('✨ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
