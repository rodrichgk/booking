export interface DayHours {
  open: string;
  close: string;
  closed: boolean;
}
export type OpeningHours = Record<string, DayHours>;

export const WEEK = [
  { key: 'monday', label: 'Lundi' },
  { key: 'tuesday', label: 'Mardi' },
  { key: 'wednesday', label: 'Mercredi' },
  { key: 'thursday', label: 'Jeudi' },
  { key: 'friday', label: 'Vendredi' },
  { key: 'saturday', label: 'Samedi' },
  { key: 'sunday', label: 'Dimanche' },
] as const;

const DAY_KEYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

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

const toMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + (m || 0);
};

/**
 * Open/closed right now, computed in Paris time so it is correct whatever
 * the server (UTC on Vercel) or visitor timezone. null when hours are unknown.
 */
export function openStatus(hours: OpeningHours | null | undefined, date = new Date()): { open: boolean; label: string } | null {
  if (!hours) return null;
  const { day, minutes } = parisNow(date);
  const today = hours[day];
  if (today && !today.closed && minutes >= toMinutes(today.open) && minutes < toMinutes(today.close)) {
    return { open: true, label: `Ouvert jusqu’à ${frTime(today.close)}` };
  }
  // Next opening: later today, or the next open day this week.
  if (today && !today.closed && minutes < toMinutes(today.open)) {
    return { open: false, label: `Ouvre à ${frTime(today.open)}` };
  }
  const start = DAY_KEYS.indexOf(day);
  for (let i = 1; i <= 7; i++) {
    const key = DAY_KEYS[(start + i) % 7];
    const d = hours[key];
    if (d && !d.closed) {
      const label = i === 1 ? 'demain' : WEEK.find((w) => w.key === key)?.label.toLowerCase();
      return { open: false, label: `Ouvre ${label} à ${frTime(d.open)}` };
    }
  }
  return { open: false, label: 'Fermé' };
}

export const todayKey = (date = new Date()) => parisNow(date).day;
