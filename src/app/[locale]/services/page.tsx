import { getTranslations } from 'next-intl/server';
import { Header } from '@/components/ui/header';
import { Footer } from '@/components/ui/footer';
import Link from 'next/link';
import { ServicesGrid } from '@/components/sections/services-grid';
import { db } from '@/lib/db';
import { services as servicesTable, barbershops } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

const categories = [
  { id: 'all', name: 'Tous les Services', icon: 'Star' },
  { id: 'cuts', name: 'Coupes', icon: 'Scissors' },
  { id: 'styling', name: 'Coiffage', icon: 'Sparkles' },
  { id: 'treatment', name: 'Soins', icon: 'Heart' },
  { id: 'color', name: 'Coloration', icon: 'Palette' },
  { id: 'maintenance', name: 'Entretien', icon: 'Zap' }
];

function getCategoryIcon(category: string | null): string {
  switch (category?.toLowerCase()) {
    case 'cuts':
    case 'coupe':
      return 'Scissors';
    case 'styling':
    case 'coiffage':
      return 'Sparkles';
    case 'treatment':
    case 'soins':
      return 'Heart';
    case 'color':
    case 'coloration':
      return 'Palette';
    case 'maintenance':
    case 'entretien':
      return 'Zap';
    default:
      return 'Star';
  }
}

function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (remainingMinutes === 0) {
    return `${hours}h`;
  }
  return `${hours}h${remainingMinutes}`;
}

function getDefaultImage(category: string | null): string {
  switch (category?.toLowerCase()) {
    case 'cuts':
    case 'coupe':
      return 'https://images.unsplash.com/photo-1560066984-138dadb4c035?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80';
    case 'styling':
    case 'coiffage':
      return 'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80';
    case 'treatment':
    case 'soins':
      return 'https://images.unsplash.com/photo-1559599101-f09722fb4948?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80';
    case 'color':
    case 'coloration':
      return 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80';
    default:
      return 'https://images.unsplash.com/photo-1560066984-138dadb4c035?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80';
  }
}

export default async function ServicesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'services' });
  const tCommon = await getTranslations({ locale, namespace: 'common' });

  // Fetch real services from the database (only from active barbershops)
  const dbServices = await db
    .select({
      id: servicesTable.id,
      name: servicesTable.name,
      description: servicesTable.description,
      image: servicesTable.image,
      price: servicesTable.price,
      duration: servicesTable.duration,
      category: servicesTable.category,
      isActive: servicesTable.isActive,
      barbershopId: servicesTable.barbershopId,
      barbershopName: barbershops.name,
    })
    .from(servicesTable)
    .innerJoin(barbershops, eq(servicesTable.barbershopId, barbershops.id))
    .where(
      and(
        eq(servicesTable.isActive, true),
        eq(barbershops.isActive, true)
      )
    );

  // Transform database services to the format expected by ServicesGrid
  const services = dbServices.map((service, index) => ({
    id: service.id,
    name: service.name,
    description: service.description || '',
    icon: getCategoryIcon(service.category),
    price: `€${parseFloat(service.price).toFixed(2)}`,
    duration: formatDuration(service.duration),
    image: service.image || getDefaultImage(service.category),
    popular: index < 3, // Mark first 3 as popular
    category: service.category || 'other',
    barbershopName: service.barbershopName,
    barbershopId: service.barbershopId,
    features: [],
  }));

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary-50 to-accent-50 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-display font-bold text-gray-900 mb-6">
                Nos Services Spécialisés
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Découvrez notre gamme complète de services dédiés aux cheveux afro, bouclés et texturés. 
                Des coupes expertes aux soins profonds, nous prenons soin de vos cheveux avec passion.
              </p>
            </div>
          </div>
        </section>

        <ServicesGrid services={services} categories={categories} />

        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-r from-primary-600 to-accent-600">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-6">
              Besoin de Conseils Personnalisés ?
            </h2>
            <p className="text-xl text-primary-100 mb-8">
              Nos experts sont là pour vous aider à choisir les meilleurs soins pour vos cheveux. 
              Contactez-nous pour une consultation gratuite.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact"
                className="bg-white text-primary-600 hover:bg-gray-50 font-semibold py-3 px-8 rounded-lg transition-colors duration-200"
              >
                Nous Contacter
              </Link>
              <Link
                href="/barbershops"
                className="bg-primary-700 hover:bg-primary-800 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200"
              >
                Trouver un Salon
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
