// Load environment variables FIRST before any other imports
import { config } from 'dotenv';
import { join } from 'path';
config({ path: join(process.cwd(), '.env.local') });

// Now import everything else after env is loaded
const { db } = require('../src/lib/db');
const { barbershops, users, barbers } = require('../src/lib/db/schema');
const { eq } = require('drizzle-orm');

// Barber data with French names and specialties
const barberProfiles = [
  {
    firstName: 'Sophie',
    lastName: 'Martin',
    email: 'sophie.martin@barber.com',
    specialties: ['Coupes Afro', 'Tresses Africaines', 'Box Braids', 'Twists'],
    experience: 8,
    rating: '4.9',
  },
  {
    firstName: 'Aminata',
    lastName: 'Diallo',
    email: 'aminata.diallo@barber.com',
    specialties: ['Défrisage', 'Soins Naturels', 'Vanilles', 'Nattes Collées'],
    experience: 12,
    rating: '4.8',
  },
  {
    firstName: 'Jean-Paul',
    lastName: 'Dubois',
    email: 'jeanpaul.dubois@barber.com',
    specialties: ['Locks', 'Dreadlocks', 'Maintenance Locks', 'Twist Out'],
    experience: 10,
    rating: '4.7',
  },
  {
    firstName: 'Fatou',
    lastName: 'Keita',
    email: 'fatou.keita@barber.com',
    specialties: ['Extensions', 'Tissage', 'Perruques', 'Lace Wig'],
    experience: 6,
    rating: '4.9',
  },
  {
    firstName: 'Marc',
    lastName: 'Laurent',
    email: 'marc.laurent@barber.com',
    specialties: ['Coupes Modernes', 'Fade', 'Dégradé', 'Hair Design'],
    experience: 5,
    rating: '4.6',
  },
  {
    firstName: 'Khadija',
    lastName: 'Mbaye',
    email: 'khadija.mbaye@barber.com',
    specialties: ['Protective Styles', 'Crochet Braids', 'Faux Locs', 'Marley Twists'],
    experience: 7,
    rating: '4.8',
  },
  {
    firstName: 'Thomas',
    lastName: 'Bernard',
    email: 'thomas.bernard@barber.com',
    specialties: ['Coloration', 'Mèches', 'Balayage', 'Ombré'],
    experience: 9,
    rating: '4.7',
  },
  {
    firstName: 'Aissatou',
    lastName: 'Ndiaye',
    email: 'aissatou.ndiaye@barber.com',
    specialties: ['Cornrows', 'Ghana Braids', 'Fulani Braids', 'Lemonade Braids'],
    experience: 11,
    rating: '5.0',
  },
  {
    firstName: 'Pierre',
    lastName: 'Rousseau',
    email: 'pierre.rousseau@barber.com',
    specialties: ['Barbe', 'Rasage Traditionnel', 'Entretien Barbe', 'Design Barbe'],
    experience: 4,
    rating: '4.5',
  },
  {
    firstName: 'Marie',
    lastName: 'Dupont',
    email: 'marie.dupont@barber.com',
    specialties: ['Wash & Go', 'Twist Out', 'Braid Out', 'Cheveux Naturels'],
    experience: 6,
    rating: '4.8',
  },
  {
    firstName: 'Mamadou',
    lastName: 'Traore',
    email: 'mamadou.traore@barber.com',
    specialties: ['Coupes Classiques', 'Coupes Tendances', 'Rasage', 'Soins'],
    experience: 15,
    rating: '4.9',
  },
  {
    firstName: 'Sarah',
    lastName: 'Williams',
    email: 'sarah.williams@barber.com',
    specialties: ['Passion Twists', 'Spring Twists', 'Butterfly Locs', 'Knotless Braids'],
    experience: 5,
    rating: '4.7',
  },
  {
    firstName: 'Luc',
    lastName: 'Moreau',
    email: 'luc.moreau@barber.com',
    specialties: ['Coupe Enfant', 'Coupe Homme', 'Fade', 'Dégradé Américain'],
    experience: 8,
    rating: '4.6',
  },
  {
    firstName: 'Ndeye',
    lastName: 'Fall',
    email: 'ndeye.fall@barber.com',
    specialties: ['Sénégalaises', 'Vanilles', 'Twists', 'Tresses Collées'],
    experience: 9,
    rating: '4.8',
  },
  {
    firstName: 'Alexandre',
    lastName: 'Petit',
    email: 'alexandre.petit@barber.com',
    specialties: ['Coupe Fade', 'Pompadour', 'Undercut', 'Crew Cut'],
    experience: 7,
    rating: '4.7',
  },
  {
    firstName: 'Binta',
    lastName: 'Sow',
    email: 'binta.sow@barber.com',
    specialties: ['Big Chop', 'Transition Cheveux Naturels', 'Soins Hydratants', 'Deep Conditioning'],
    experience: 10,
    rating: '5.0',
  },
];

async function seedBarbers() {
  try {
    console.log('👨‍🦰 Starting barbers seeding...\n');

    // Get all active barbershops
    const allBarbershops = await db
      .select()
      .from(barbershops)
      .where(eq(barbershops.isActive, true));

    if (allBarbershops.length === 0) {
      console.error('❌ No barbershops found. Please run the main seed script first.');
      process.exit(1);
    }

    console.log(`✅ Found ${allBarbershops.length} barbershops\n`);

    let totalCreated = 0;
    let totalSkipped = 0;

    // Distribute barbers across barbershops (2-3 barbers per shop)
    for (let i = 0; i < barberProfiles.length; i++) {
      const profile = barberProfiles[i];
      const shopIndex = Math.floor(i / 2) % allBarbershops.length; // 2 barbers per shop
      const shop = allBarbershops[shopIndex];

      // Check if user already exists
      const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.email, profile.email))
        .limit(1);

      let userId: string;

      if (existingUser.length > 0) {
        userId = existingUser[0].id;
        console.log(`⏭️  User already exists: ${profile.firstName} ${profile.lastName}`);
      } else {
        // Create user account for the barber
        const [newUser] = await db.insert(users).values({
          name: `${profile.firstName} ${profile.lastName}`,
          email: profile.email,
          phone: `+33 6 ${Math.floor(10000000 + Math.random() * 90000000)}`,
          role: 'barber',
        }).returning();

        userId = newUser.id;
        console.log(`✅ Created user: ${profile.firstName} ${profile.lastName}`);
      }

      // Check if barber profile already exists for this user
      const existingBarber = await db
        .select()
        .from(barbers)
        .where(eq(barbers.userId, userId))
        .limit(1);

      if (existingBarber.length > 0) {
        console.log(`⏭️  Barber profile already exists for ${profile.firstName} ${profile.lastName}`);
        totalSkipped++;
      } else {
        // Create barber profile
        await db.insert(barbers).values({
          userId,
          barbershopId: shop.id,
          specialties: profile.specialties,
          experience: profile.experience,
          rating: profile.rating,
          isActive: true,
        });

        console.log(`✅ Added ${profile.firstName} ${profile.lastName} to ${shop.name} (${shop.city})`);
        totalCreated++;
      }
    }

    console.log('\n🎉 Barbers seeding completed!');
    console.log(`📊 Summary:`);
    console.log(`   - Created: ${totalCreated} barbers`);
    console.log(`   - Skipped: ${totalSkipped} (already exist)`);
    console.log(`   - Total: ${barberProfiles.length} barbers\n`);
    
    console.log('📝 Next steps:');
    console.log('1. Visit http://localhost:3000/fr/barbers to see all barbers');
    console.log('2. Visit http://localhost:3000/fr/barbershops to see shops with their teams');
    console.log('3. Each barbershop now has 2-3 barbers assigned!\n');
    
  } catch (error) {
    console.error('❌ Error seeding barbers:', error);
    process.exit(1);
  }
}

// Run the seed function
seedBarbers()
  .then(() => {
    console.log('✨ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
