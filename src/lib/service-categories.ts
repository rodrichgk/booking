/** Service categories as stored in services.category, with their French labels. */
export const SERVICE_CATEGORIES = [
  { id: 'haircut', label: 'Coupes' },
  { id: 'beard', label: 'Barbe' },
  { id: 'styling', label: 'Coiffure' },
  { id: 'coloring', label: 'Coloration' },
  { id: 'treatment', label: 'Soins' },
  { id: 'combo', label: 'Forfaits' },
] as const;

export type ServiceCategoryId = (typeof SERVICE_CATEGORIES)[number]['id'];

export function categoryLabel(id: string | null | undefined): string | null {
  if (!id) return null;
  return SERVICE_CATEGORIES.find((c) => c.id === id)?.label ?? null;
}

/** "45 min", "1 h", "1 h 30" */
export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h} h ${String(m).padStart(2, '0')}` : `${h} h`;
}
