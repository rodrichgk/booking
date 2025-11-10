// Load environment variables FIRST before any other imports
import { config } from 'dotenv';
import { join } from 'path';
config({ path: join(process.cwd(), '.env.local') });

// Now import everything else after env is loaded
const { db } = require('../src/lib/db');
const { barbershops, users, barbers } = require('../src/lib/db/schema');
const { eq } = require('drizzle-orm');

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');

    // Get the admin user (you)
    const adminUser = await db
      .select()
      .from(users)
      .where(eq(users.email, 'kibarodrich@gmail.com'))
      .limit(1);

    if (adminUser.length === 0) {
      console.error('❌ Admin user not found. Please sign in first to create your account.');
      process.exit(1);
    }

    const ownerId = adminUser[0].id;
    console.log('✅ Found admin user:', adminUser[0].email);

    // Sample barbershops data
    const barbershopsData = [
      {
        name: 'Elite Barber Shop',
        description: 'Le salon de coiffure de référence à Paris. Spécialisé dans les coupes modernes et les styles traditionnels. Notre équipe expérimentée vous garantit un service de qualité supérieure.',
        address: '45 Rue de Rivoli',
        city: 'Paris',
        phone: '+33 1 42 60 30 45',
        email: 'contact@elitebarber.fr',
        website: 'https://www.elitebarber.fr',
        ownerId,
        isActive: true,
        rating: '4.8',
        reviewCount: 127,
      },
      {
        name: "The Gentleman's Cut",
        description: 'Salon de coiffure pour hommes situé au cœur de Lyon. Ambiance chaleureuse et professionnelle. Experts en coupes classiques et modernes, barbe et rasage traditionnel.',
        address: '12 Rue de la République',
        city: 'Lyon',
        phone: '+33 4 78 37 20 15',
        email: 'contact@gentlemanscut.fr',
        website: 'https://www.gentlemanscut.fr',
        ownerId,
        isActive: true,
        rating: '4.9',
        reviewCount: 203,
      },
      {
        name: 'Urban Style',
        description: 'Coiffeur barbier moderne à Marseille. Spécialisé dans les coupes tendance, dégradés et designs. Service rapide et professionnel dans une ambiance décontractée.',
        address: '89 La Canebière',
        city: 'Marseille',
        phone: '+33 4 91 54 12 78',
        email: 'contact@urbanstyle.fr',
        website: 'https://www.urbanstyle.fr',
        ownerId,
        isActive: true,
        rating: '4.7',
        reviewCount: 156,
      },
      {
        name: 'Classic Cuts',
        description: 'Votre barbier de quartier à Toulouse depuis 2010. Expertise en coupes classiques et modernes, entretien de barbe et soins capillaires. Ambiance conviviale garantie.',
        address: '23 Rue Alsace-Lorraine',
        city: 'Toulouse',
        phone: '+33 5 61 23 45 67',
        email: 'contact@classiccuts.fr',
        website: 'https://www.classiccuts.fr',
        ownerId,
        isActive: true,
        rating: '4.6',
        reviewCount: 98,
      },
      {
        name: 'Le Salon Parisien',
        description: 'Salon de coiffure haut de gamme à Nice. Services premium incluant coupe, coloration, soins et stylisme. Notre équipe de coiffeurs expérimentés est à votre écoute.',
        address: '15 Avenue Jean Médecin',
        city: 'Nice',
        phone: '+33 4 93 87 65 43',
        email: 'contact@salonparisien.fr',
        website: 'https://www.salonparisien.fr',
        ownerId,
        isActive: true,
        rating: '4.9',
        reviewCount: 234,
      },
      {
        name: 'Fresh Fade',
        description: "Le meilleur barbershop de Bordeaux pour vos coupes fade et dégradés. Ambiance moderne, musique et équipe jeune et dynamique. Réservation en ligne disponible.",
        address: "67 Cours de l'Intendance",
        city: 'Bordeaux',
        phone: '+33 5 56 48 23 90',
        email: 'contact@freshfade.fr',
        website: 'https://www.freshfade.fr',
        ownerId,
        isActive: true,
        rating: '4.8',
        reviewCount: 178,
      },
      {
        name: 'Barber & Co',
        description: "Barbershop traditionnel avec une touche moderne à Nantes. Spécialistes du rasage à l'ancienne, soins de la barbe et coupes sur mesure. Service de qualité depuis 2012.",
        address: 'Rue Crébillon',
        city: 'Nantes',
        phone: '+33 2 40 47 89 12',
        email: 'contact@barberco.fr',
        website: 'https://www.barberco.fr',
        ownerId,
        isActive: true,
        rating: '4.7',
        reviewCount: 145,
      },
      {
        name: 'Style Masters',
        description: 'Salon de coiffure mixte à Strasbourg. Équipe multiculturelle spécialisée dans tous types de cheveux. Coupes, colorations, soins et conseils personnalisés.',
        address: '18 Rue du Vieux-Marché-aux-Poissons',
        city: 'Strasbourg',
        phone: '+33 3 88 32 56 78',
        email: 'contact@stylemasters.fr',
        website: 'https://www.stylemasters.fr',
        ownerId,
        isActive: true,
        rating: '4.9',
        reviewCount: 189,
      },
    ];

    // Insert barbershops
    console.log('📍 Creating barbershops...');
    let createdCount = 0;
    const createdBarbershops = [];

    for (const shop of barbershopsData) {
      // Check if already exists
      const existing = await db
        .select()
        .from(barbershops)
        .where(eq(barbershops.name, shop.name))
        .limit(1);

      if (existing.length > 0) {
        console.log(`⏭️  Skipping "${shop.name}" - already exists`);
        createdBarbershops.push(existing[0]);
        continue;
      }

      const [created] = await db.insert(barbershops).values(shop).returning();
      createdBarbershops.push(created);
      createdCount++;
      console.log(`✅ Created: ${shop.name} in ${shop.city}`);
    }

    console.log(`\n✅ Created ${createdCount} new barbershops`);
    console.log(`📊 Total barbershops in database: ${createdBarbershops.length}`);

    // Now add some sample barbers for the first barbershop
    if (createdBarbershops.length > 0) {
      console.log('\n👨‍🦰 Adding sample barbers to first barbershop...');
      
      const firstShop = createdBarbershops[0];
      
      // Check if barbers already exist
      const existingBarbers = await db
        .select()
        .from(barbers)
        .where(eq(barbers.barbershopId, firstShop.id));

      if (existingBarbers.length > 0) {
        console.log(`⏭️  Barbers already exist for ${firstShop.name}`);
      } else {
        // Add the admin user as a barber
        await db.insert(barbers).values({
          userId: ownerId,
          barbershopId: firstShop.id,
          specialties: ['Fade', 'Beard', 'Classic Cut', 'Hair Design'],
          images: [],
          isActive: true,
        });
        console.log(`✅ Added admin as barber to ${firstShop.name}`);
      }
    }

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('1. Visit http://localhost:3000/fr/barbershops to see the shops');
    console.log('2. Visit http://localhost:3000/fr/admin/barbershops to manage them');
    console.log('3. Visit http://localhost:3000/fr/my-barbershops to manage your shops');
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

// Run the seed function
seedDatabase()
  .then(() => {
    console.log('\n✨ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
