/**
 * First usable image URL from an images column. Most rows hold a JSON array,
 * but some older rows hold the array serialised as a string
 * ('["https://...", ...]'), so accept both, plus a bare URL string.
 */
export function firstImage(value: unknown): string | null {
  if (Array.isArray(value)) {
    const url = value.find((v) => typeof v === 'string' && v.trim());
    return url ? firstImage(url) : null;
  }
  if (typeof value !== 'string') return null;
  const s = value.trim();
  if (!s) return null;
  if (s.startsWith('[')) {
    try {
      return firstImage(JSON.parse(s));
    } catch {
      return null;
    }
  }
  return s;
}
