// Load environment variables FIRST
import { config } from 'dotenv';
import { join } from 'path';
config({ path: join(process.cwd(), '.env.local') });

// Import db after env is loaded
const { db } = require('../src/lib/db');
const { services, barbershops } = require('../src/lib/db/schema');
const { eq } = require('drizzle-orm');

// Default services template that all barbershops can use
const defaultServiceTemplates = [
  // Haircuts
  {
    name: 'Coupe Homme Classique',
    description: 'Coupe de cheveux classique pour homme avec shampoing',
    duration: 30,
    price: '25.00',
    category: 'haircut',
  },
  {
    name: 'Coupe + Barbe',
    description: 'Coupe de cheveux et taille de barbe complète',
    duration: 45,
    price: '35.00',
    category: 'haircut',
  },
  {
    name: 'Coupe Dégradé',
    description: 'Coupe dégradé moderne (fade) avec finitions',
    duration: 40,
    price: '30.00',
    category: 'haircut',
  },
  {
    name: 'Coupe Enfant',
    description: 'Coupe de cheveux pour enfant (-12 ans)',
    duration: 20,
    price: '15.00',
    category: 'haircut',
  },
  // Barbe
  {
    name: 'Taille de Barbe',
    description: 'Taille et entretien de la barbe',
    duration: 20,
    price: '15.00',
    category: 'beard',
  },
  {
    name: 'Rasage Traditionnel',
    description: 'Rasage au rasoir avec serviette chaude',
    duration: 30,
    price: '25.00',
    category: 'beard',
  },
  {
    name: 'Design Barbe',
    description: 'Dessin et design personnalisé de barbe',
    duration: 35,
    price: '30.00',
    category: 'beard',
  },
  // Coiffure
  {
    name: 'Brushing',
    description: 'Brushing et mise en forme',
    duration: 25,
    price: '20.00',
    category: 'styling',
  },
  {
    name: 'Permanente',
    description: 'Permanente et mise en plis',
    duration: 90,
    price: '60.00',
    category: 'styling',
  },
  {
    name: 'Défrisage',
    description: 'Défrisage cheveux afro/crépus',
    duration: 120,
    price: '80.00',
    category: 'styling',
  },
  // Coloration
  {
    name: 'Coloration Simple',
    description: 'Coloration une teinte',
    duration: 60,
    price: '45.00',
    category: 'coloring',
  },
  {
    name: 'Mèches',
    description: 'Mèches et highlights',
    duration: 90,
    price: '70.00',
    category: 'coloring',
  },
  {
    name: 'Balayage',
    description: 'Balayage naturel',
    duration: 120,
    price: '90.00',
    category: 'coloring',
  },
  // Soins
  {
    name: 'Soin Capillaire',
    description: 'Soin hydratant et nourrissant',
    duration: 30,
    price: '25.00',
    category: 'treatment',
  },
  {
    name: 'Traitement Anti-Chute',
    description: 'Traitement spécial anti-chute de cheveux',
    duration: 45,
    price: '40.00',
    category: 'treatment',
  },
  {
    name: 'Soin Barbe',
    description: 'Soin hydratant pour la barbe',
    duration: 20,
    price: '18.00',
    category: 'treatment',
  },
  // Spécialisés
  {
    name: 'Coupe Afro',
    description: 'Coupe spécialisée cheveux afro/crépus',
    duration: 45,
    price: '35.00',
    category: 'haircut',
  },
  {
    name: 'Tresses',
    description: 'Tresses africaines',
    duration: 180,
    price: '100.00',
    category: 'styling',
  },
  {
    name: 'Locks/Dreadlocks',
    description: 'Création ou entretien de locks',
    duration: 150,
    price: '85.00',
    category: 'styling',
  },
  {
    name: 'Coupe + Couleur',
    description: 'Forfait coupe et coloration',
    duration: 90,
    price: '65.00',
    category: 'combo',
  },
];

async function seedServices() {
  try {
    console.log('🔄 Seeding services for all barbershops...\n');

    // Get all active barbershops
    const shops = await db
      .select()
      .from(barbershops)
      .where(eq(barbershops.isActive, true));

    console.log(`Found ${shops.length} active barbershops\n`);

    let totalCreated = 0;

    for (const shop of shops) {
      console.log(`📍 Adding services to: ${shop.name}`);

      // Add all default services to this shop
      for (const template of defaultServiceTemplates) {
        await db.insert(services).values({
          barbershopId: shop.id,
          ...template,
          isActive: true,
        });
        totalCreated++;
      }

      console.log(`   ✅ Added ${defaultServiceTemplates.length} services\n`);
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`✅ Successfully created ${totalCreated} services!`);
    console.log(`   ${shops.length} barbershops × ${defaultServiceTemplates.length} services each`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('📋 Service Categories:');
    console.log('   • Haircut (Coupes)');
    console.log('   • Beard (Barbe)');
    console.log('   • Styling (Coiffure)');
    console.log('   • Coloring (Coloration)');
    console.log('   • Treatment (Soins)');
    console.log('   • Combo (Forfaits)\n');

  } catch (error) {
    console.error('❌ Error seeding services:', error);
    process.exit(1);
  }
}

seedServices()
  .then(() => {
    console.log('✨ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
