import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price);
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

export function formatTime(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
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
