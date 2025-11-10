// Load environment variables FIRST
import { config } from 'dotenv';
import { join } from 'path';
config({ path: join(process.cwd(), '.env.local') });

// Import db after env is loaded
const { db } = require('../src/lib/db');
const { users, barbers, services, barbershops } = require('../src/lib/db/schema');
const { eq } = require('drizzle-orm');

async function createGuestReferences() {
  try {
    console.log('🔄 Creating guest references for bookings...\n');

    const guestId = '00000000-0000-0000-0000-000000000000';

    // Get any active barbershop to attach guest resources to
    const [shop] = await db
      .select()
      .from(barbershops)
      .where(eq(barbershops.isActive, true))
      .limit(1);

    if (!shop) {
      console.error('❌ No active barbershop found!');
      process.exit(1);
    }

    console.log(`📍 Using barbershop: ${shop.name}\n`);

    // Create guest barber
    const existingBarber = await db
      .select()
      .from(barbers)
      .where(eq(barbers.id, guestId))
      .limit(1);

    if (existingBarber.length === 0) {
      await db.insert(barbers).values({
        id: guestId,
        userId: guestId,
        barbershopId: shop.id,
        specialties: ['Any Service'],
        isActive: true,
      });
      console.log('✅ Guest barber created');
    } else {
      console.log('✅ Guest barber already exists');
    }

    // Create guest service
    const existingService = await db
      .select()
      .from(services)
      .where(eq(services.id, guestId))
      .limit(1);

    if (existingService.length === 0) {
      await db.insert(services).values({
        id: guestId,
        barbershopId: shop.id,
        name: 'General Service',
        description: 'Default service for guest bookings',
        price: '0',
        duration: 60,
        category: 'general',
      });
      console.log('✅ Guest service created');
    } else {
      console.log('✅ Guest service already exists');
    }

    console.log('\n📝 Guest references summary:');
    console.log(`   User ID: ${guestId}`);
    console.log(`   Barber ID: ${guestId}`);
    console.log(`   Service ID: ${guestId}`);
    console.log('\n✨ Bookings can now use placeholder IDs!');
    
  } catch (error) {
    console.error('❌ Error creating guest references:', error);
    process.exit(1);
  }
}

createGuestReferences()
  .then(() => {
    console.log('\n✅ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
