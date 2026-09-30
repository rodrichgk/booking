import { getTranslations } from 'next-intl/server';
import { desc, eq, sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import { barbershops, services } from '@/lib/db/schema';
import { getFeaturedBarbershops } from '@/lib/featured';
import { SERVICE_CATEGORIES, categoryName } from '@/lib/service-categories';
import { Header } from '@/components/ui/header';
import { Footer } from '@/components/ui/footer';
import { HomeHero } from '@/components/home/hero';
import { CategoryBento, FeaturedSalons, HowItWorks, Cities, ForSalons, type CategoryStat, type CityStat } from '@/components/home/sections';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'site.home' });
  return { title: t('metaTitle'), description: t('metaDescription') };
}

// Counts and featured salons change slowly: refresh at most every 5 minutes.
export const revalidate = 300;

async function getCategoryStats(locale: string): Promise<CategoryStat[]> {
  const rows = await db
    .select({
      category: services.category,
      count: sql<number>`count(*)::int`,
      minPrice: sql<string | null>`min(${services.price})`,
    })
    .from(services)
    .innerJoin(barbershops, eq(services.barbershopId, barbershops.id))
    .where(sql`${barbershops.isActive} = true AND ${services.isActive} IS NOT FALSE`)
    .groupBy(services.category);

  const byId = new Map(rows.map((r) => [r.category, r]));
  const stats = SERVICE_CATEGORIES.map((c) => {
    const row = byId.get(c.id);
    return { id: c.id as string, label: categoryName(c, locale), count: row?.count ?? 0, minPrice: row?.minPrice ? parseFloat(row.minPrice) : null };
  });
  const offered = stats.filter((c) => c.count > 0).sort((a, b) => b.count - a.count);
  // No services yet: still show the categories (without counts) so the section is useful.
  return offered.length ? offered : stats;
}

async function getCityStats(): Promise<CityStat[]> {
  return db
    .select({ city: barbershops.city, count: sql<number>`count(*)::int` })
    .from(barbershops)
    .where(eq(barbershops.isActive, true))
    .groupBy(barbershops.city)
    .orderBy(desc(sql`count(*)`), barbershops.city)
    .limit(8);
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  // Each block degrades on its own: a failing query hides that section only.
  const [categories, featured, cities] = await Promise.all([
    getCategoryStats(locale).catch(() => [] as CategoryStat[]),
    getFeaturedBarbershops(3).catch(() => []),
    getCityStats().catch(() => [] as CityStat[]),
  ]);

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        <HomeHero />
        <CategoryBento categories={categories} />
        <FeaturedSalons shops={featured} />
        <HowItWorks />
        <Cities cities={cities} />
        <ForSalons />
      </main>
      <Footer />
    </div>
  );
}
