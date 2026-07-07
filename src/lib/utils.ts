import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Escape a string for safe interpolation into HTML (e.g. email templates).
 * Prevents HTML/script injection from user-supplied values like names and notes.
 */
export function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function formatPrice(price: number, locale: string = 'fr-FR', currency: string = 'EUR'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(price);
}

export function formatDate(date: Date, locale: string = 'fr-FR'): string {
  return new Intl.DateTimeFormat(locale, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

export function formatTime(date: Date, locale: string = 'fr-FR'): string {
  return new Intl.DateTimeFormat(locale, {
    hour: 'numeric',
    minute: '2-digit',
    hour12: locale.startsWith('en'),
  }).format(date);
}

export const hairTypes = [
  'Type 1 (Straight)',
  'Type 2A (Wavy)',
  'Type 2B (Wavy)',
  'Type 2C (Wavy)',
  'Type 3A (Curly)',
  'Type 3B (Curly)',
  'Type 3C (Curly)',
  'Type 4A (Coily)',
  'Type 4B (Coily)',
  'Type 4C (Coily)',
];

export const serviceCategories = [
  'Haircuts',
  'Styling',
  'Treatments',
  'Braiding',
  'Locs',
  'Color',
  'Beard Care',
  'Scalp Care',
];

export const specialties = [
  'Natural Hair',
  'Relaxed Hair',
  'Protective Styles',
  'Loc Maintenance',
  'Twist Outs',
  'Silk Press',
  'Braids',
  'Fade Cuts',
  'Beard Styling',
  'Hair Treatments',
];
