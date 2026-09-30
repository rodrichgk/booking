/**
 * Barber "types" are picked by salon owners from a fixed French list
 * (my-space BARBER_TYPES) and stored as-is. This gives their display label
 * in the visitor's language; unknown values are shown unchanged.
 */
const EN: Record<string, string> = {
  Coiffeur: 'Hairdresser',
  Coiffeuse: 'Hairdresser',
  'Tresses / Braids': 'Braids specialist',
  Barbier: 'Barber',
  Coloriste: 'Colourist',
  Mixte: 'All-round stylist',
};

export function barberTypeLabel(value: string | null | undefined, locale?: string): string | null {
  if (!value) return null;
  return locale === 'en' ? EN[value] ?? value : value;
}
