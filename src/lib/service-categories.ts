/** Service categories as stored in services.category, with their labels. */
export const SERVICE_CATEGORIES = [
  { id: 'haircut', label: 'Coupes', en: 'Haircuts' },
  { id: 'beard', label: 'Barbe', en: 'Beard' },
  { id: 'styling', label: 'Coiffure', en: 'Styling' },
  { id: 'coloring', label: 'Coloration', en: 'Colour' },
  { id: 'treatment', label: 'Soins', en: 'Treatments' },
  { id: 'combo', label: 'Forfaits', en: 'Packages' },
] as const;

export type ServiceCategoryId = (typeof SERVICE_CATEGORIES)[number]['id'];

type Locale = string | undefined;
const isEn = (locale: Locale) => locale === 'en';

/** Label of a category entry in the given locale (French by default). */
export function categoryName(c: (typeof SERVICE_CATEGORIES)[number], locale?: Locale): string {
  return isEn(locale) ? c.en : c.label;
}

export function categoryLabel(id: string | null | undefined, locale?: Locale): string | null {
  if (!id) return null;
  const c = SERVICE_CATEGORIES.find((cat) => cat.id === id);
  return c ? categoryName(c, locale) : null;
}

/** "45 min", "1 h", "1 h 30" (fr) / "45 min", "1 hr", "1 hr 30" (en) */
export function formatDuration(minutes: number, locale?: Locale): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  const unit = isEn(locale) ? 'hr' : 'h';
  return m ? `${h} ${unit} ${String(m).padStart(2, '0')}` : `${h} ${unit}`;
}
