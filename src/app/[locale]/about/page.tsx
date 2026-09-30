import Image from 'next/image';
import { and, eq, ilike } from 'drizzle-orm';
import { ArrowRight, BadgeEuro, CalendarCheck, Star } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/routing';
import { db } from '@/lib/db';
import { barbershops } from '@/lib/db/schema';
import { firstImage } from '@/lib/images';
import { Header } from '@/components/ui/header';
import { Footer } from '@/components/ui/footer';
import { Reveal } from '@/components/ui/reveal';
import { ForSalons } from '@/components/home/sections';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'site.aboutPage' });
  return { title: t('metaTitle'), description: t('metaDescription') };
}

export const revalidate = 3600;

const FALLBACK_PHOTO =
  'https://images.unsplash.com/photo-1560066984-138dadb4c035?ixlib=rb-4.0.3&auto=format&fit=crop&w=1100&q=80';

/**
 * Legal notice (LCEN art. 6). Source: RNE / INSEE records for ROMY-J.
 * Labels and wording come from messages (site.aboutPage.legal.*); plain
 * identifiers stay here.
 */
const LEGAL: { key: string; value?: React.ReactNode }[] = [
  { key: 'publisher' },
  { key: 'headOffice', value: '61 boulevard Baille, 13006 Marseille' },
  { key: 'rcs', value: 'Marseille 901 745 455' },
  { key: 'siret', value: '901 745 455 00013' },
  { key: 'vat', value: 'FR79901745455' },
  { key: 'director' },
  { key: 'developer', value: 'Gabhy Rodrich Kiba' },
  { key: 'contact', value: <a href="mailto:contact@orphelia.net" className="text-primary-700 underline-offset-2 hover:underline">contact@orphelia.net</a> },
  { key: 'hosting' },
];

const PROMISES = [
  { icon: BadgeEuro, key: 'prices' },
  { icon: CalendarCheck, key: 'slots' },
  { icon: Star, key: 'reviews' },
] as const;

/** The ROMY-J salon listed on the platform (same address as the company). */
async function getHomeSalon() {
  const [shop] = await db
    .select({ id: barbershops.id, name: barbershops.name, images: barbershops.images })
    .from(barbershops)
    .where(and(eq(barbershops.isActive, true), ilike(barbershops.address, '%61%baille%')))
    .limit(1);
  return shop ?? null;
}

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'site.aboutPage' });
  const salon = await getHomeSalon().catch(() => null);
  const photo = firstImage(salon?.images) ?? FALLBACK_PHOTO;

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main>
        <section className="mx-auto grid max-w-7xl items-center gap-12 px-4 pb-16 pt-10 sm:px-6 md:pt-16 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-16 lg:px-8 lg:pb-24">
          <div>
            <h1 className="animate-fade-in-up font-display text-4xl font-semibold leading-[1.05] tracking-tight text-gray-900 md:text-5xl lg:text-6xl">
              {t.rich('title', { accent: (chunks) => <span className="whitespace-nowrap text-primary-600">{chunks}</span> })}
            </h1>
            <p className="anim-delay-100 mt-5 max-w-[52ch] animate-fade-in-up text-lg leading-relaxed text-gray-600">
              {t('intro')}
            </p>
            <div className="anim-delay-200 mt-8 flex animate-fade-in-up flex-wrap gap-3">
              <Link
                href="/barbershops"
                className="press inline-flex items-center gap-2 rounded-full bg-primary-600 px-6 py-3 text-sm font-semibold text-white hover:bg-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
              >
                {t('findSalon')}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              {salon && (
                <Link
                  href={`/barbershops/${salon.id}`}
                  className="press inline-flex items-center gap-2 rounded-full border border-gray-300 px-6 py-3 text-sm font-semibold text-gray-900 hover:border-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
                >
                  {t('ourSalon')}
                </Link>
              )}
            </div>
          </div>
          <div className="hero-image-in relative aspect-[4/3] overflow-hidden rounded-2xl bg-gray-100 lg:aspect-square">
            <Image src={photo} alt={salon ? t('photoAlt', { name: salon.name }) : t('photoAltFallback')} fill priority sizes="(max-width: 1024px) 100vw, 45vw" className="object-cover" />
          </div>
        </section>

        <section className="border-t border-gray-200">
          <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
            <Reveal>
              <h2 className="max-w-2xl font-display text-3xl font-semibold tracking-tight text-gray-900 md:text-4xl">
                {t('promisesTitle')}
              </h2>
              <p className="mt-4 max-w-[60ch] text-gray-600">
                {t('promisesText')}
              </p>
            </Reveal>
            <Reveal>
              <ul className="mt-12 grid gap-10 md:grid-cols-3 md:gap-8">
                {PROMISES.map((p, i) => (
                  <li key={p.key} className="stagger-child border-t-2 border-gray-900 pt-6" style={{ ['--i' as string]: i }}>
                    <p.icon className="h-6 w-6 text-primary-600" aria-hidden="true" />
                    <h3 className="mt-4 font-display text-xl font-semibold text-gray-900">{t(`promises.${p.key}.title`)}</h3>
                    <p className="mt-2 max-w-[36ch] text-gray-600">{t(`promises.${p.key}.text`)}</p>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </section>

        <ForSalons />

        <section id="mentions-legales" className="scroll-mt-24 bg-gray-50">
          <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
            <h2 className="font-display text-2xl font-semibold tracking-tight text-gray-900">{t('legalTitle')}</h2>
            <dl className="mt-8 grid gap-x-12 gap-y-6 sm:grid-cols-2">
              {LEGAL.map((row) => (
                <div key={row.key}>
                  <dt className="text-sm font-medium text-gray-500">{t(`legal.${row.key}`)}</dt>
                  <dd className="mt-1 text-gray-900">{row.value ?? t(`legal.${row.key}Value`)}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-10 max-w-[70ch] text-sm text-gray-500">
              {t.rich('legalFooter', {
                privacy: (chunks) => <Link href="/privacy" className="text-gray-700 underline underline-offset-2 hover:text-gray-900">{chunks}</Link>,
                cookies: (chunks) => <Link href="/cookies" className="text-gray-700 underline underline-offset-2 hover:text-gray-900">{chunks}</Link>,
              })}
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
