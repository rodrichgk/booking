// Load environment variables FIRST
import { config } from 'dotenv';
import { join } from 'path';
config({ path: join(process.cwd(), '.env.local') });

// Import db after env is loaded
const { db } = require('../src/lib/db');
const { users } = require('../src/lib/db/schema');
const { eq } = require('drizzle-orm');

async function createGuestUser() {
  try {
    console.log('🔄 Creating guest user for anonymous bookings...\n');

    const guestId = '00000000-0000-0000-0000-000000000000';

    // Check if guest user already exists
    const existing = await db
      .select()
      .from(users)
      .where(eq(users.id, guestId))
      .limit(1);

    if (existing.length > 0) {
      console.log('✅ Guest user already exists!');
      console.log(`   ID: ${existing[0].id}`);
      console.log(`   Email: ${existing[0].email}`);
      console.log(`   Name: ${existing[0].name}`);
    } else {
      // Create guest user
      await db.insert(users).values({
        id: guestId,
        email: 'guest@orphlia.com',
        name: 'Guest User',
        role: 'customer',
      });

      console.log('✅ Guest user created successfully!');
      console.log(`   ID: ${guestId}`);
      console.log(`   Email: guest@orphlia.com`);
      console.log(`   Name: Guest User`);
    }

    console.log('\n📝 This user will be used for all guest bookings (no login required)');
    
  } catch (error) {
    console.error('❌ Error creating guest user:', error);
    process.exit(1);
  }
}

createGuestUser()
  .then(() => {
    console.log('\n✨ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
