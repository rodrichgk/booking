'use client';

import { useTranslations } from 'next-intl';

export function useSafeTranslations(namespace: string) {
  try {
    return useTranslations(namespace);
  } catch (error) {
    console.warn(`Translation namespace "${namespace}" not available during SSG:`, error);
    // Return a fallback function that returns the key itself
    return (key: string) => key;
  }
}
