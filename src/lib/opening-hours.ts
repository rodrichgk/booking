export interface DayHours {
  open: string;
  close: string;
  closed: boolean;
}
export type OpeningHours = Record<string, DayHours>;

export const WEEK = [
  { key: 'monday', label: 'Lundi', en: 'Monday' },
  { key: 'tuesday', label: 'Mardi', en: 'Tuesday' },
  { key: 'wednesday', label: 'Mercredi', en: 'Wednesday' },
  { key: 'thursday', label: 'Jeudi', en: 'Thursday' },
  { key: 'friday', label: 'Vendredi', en: 'Friday' },
  { key: 'saturday', label: 'Samedi', en: 'Saturday' },
  { key: 'sunday', label: 'Dimanche', en: 'Sunday' },
] as const;

const DAY_KEYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

type Locale = string | undefined;
const isEn = (locale: Locale) => locale === 'en';

/** Day name for a WEEK entry in the given locale (French by default). */
export function dayName(key: string, locale?: Locale): string {
  const d = WEEK.find((w) => w.key === key);
  if (!d) return key;
  return isEn(locale) ? d.en : d.label;
}

/** Weekday key and minutes since midnight, in the salons' timezone (Paris). */
function parisNow(date = new Date()): { day: string; minutes: number } {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Paris',
    weekday: 'long',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '';
  return {
    day: get('weekday').toLowerCase(),
    minutes: Number(get('hour')) * 60 + Number(get('minute')),
  };
}

/** "09:00" -> "9h", "09:30" -> "9h30" (French style). */
export function frTime(hhmm: string): string {
  const [h, m] = hhmm.split(':').map(Number);
  return m ? `${h}h${String(m).padStart(2, '0')}` : `${h}h`;
}

/** Clock time for display: "9h30" in French, "9:30am" in English. */
export function formatTime(hhmm: string, locale?: Locale): string {
  if (!isEn(locale)) return frTime(hhmm);
  const [h, m] = hhmm.split(':').map(Number);
  const suffix = h < 12 ? 'am' : 'pm';
  const h12 = h % 12 || 12;
  return m ? `${h12}:${String(m).padStart(2, '0')}${suffix}` : `${h12}${suffix}`;
}

const toMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + (m || 0);
};

/**
 * Open/closed right now, computed in Paris time so it is correct whatever
 * the server (UTC on Vercel) or visitor timezone. null when hours are unknown.
 */
export function openStatus(
  hours: OpeningHours | null | undefined,
  date = new Date(),
  locale?: Locale
): { open: boolean; label: string } | null {
  if (!hours) return null;
  const en = isEn(locale);
  const t = (hhmm: string) => formatTime(hhmm, locale);
  const { day, minutes } = parisNow(date);
  const today = hours[day];
  if (today && !today.closed && minutes >= toMinutes(today.open) && minutes < toMinutes(today.close)) {
    return { open: true, label: en ? `Open until ${t(today.close)}` : `Ouvert jusqu’à ${t(today.close)}` };
  }
  // Next opening: later today, or the next open day this week.
  if (today && !today.closed && minutes < toMinutes(today.open)) {
    return { open: false, label: en ? `Opens at ${t(today.open)}` : `Ouvre à ${t(today.open)}` };
  }
  const start = DAY_KEYS.indexOf(day);
  for (let i = 1; i <= 7; i++) {
    const key = DAY_KEYS[(start + i) % 7];
    const d = hours[key];
    if (d && !d.closed) {
      if (en) return { open: false, label: `Opens ${i === 1 ? 'tomorrow' : dayName(key, locale)} at ${t(d.open)}` };
      const label = i === 1 ? 'demain' : dayName(key).toLowerCase();
      return { open: false, label: `Ouvre ${label} à ${t(d.open)}` };
    }
  }
  return { open: false, label: en ? 'Closed' : 'Fermé' };
}

export const todayKey = (date = new Date()) => parisNow(date).day;
