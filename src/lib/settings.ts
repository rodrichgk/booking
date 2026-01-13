import { db } from '@/lib/db';
import { siteSettings } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// Default settings values
const DEFAULT_SETTINGS = {
    general: {
        siteName: 'Orphelia',
        siteUrl: 'https://www.orphelia.net',
        defaultLanguage: 'fr',
        timezone: 'Europe/Paris',
        maintenanceMode: false,
    },
    payment: {
        subscriptionPrice: 29.9,
        currency: 'EUR',
        paymentProvider: 'stripe',
        autoRenewal: true,
    },
    email: {
        smtpHost: 'smtp.orphelia.net',
        smtpPort: 587,
        senderEmail: 'noreply@orphelia.net',
        senderName: 'Orphelia',
    },
    notifications: {
        emailNotifications: true,
        smsNotifications: false,
        pushNotifications: true,
        bookingReminders: true,
    },
    security: {
        twoFactorAuth: false,
        sessionTimeout: 24,
        maxLoginAttempts: 5,
        passwordMinLength: 8,
    },
    appearance: {
        primaryColor: '#6366f1',
        darkMode: false,
        compactMode: false,
        featuredMode: 'manual' as const,
        featuredBarbershopIds: [] as string[],
    },
};

export type SiteSettings = typeof DEFAULT_SETTINGS;
export type SettingsKey = keyof SiteSettings;

// Cache for settings to avoid repeated DB calls
let settingsCache: Partial<SiteSettings> | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 60 * 1000; // 1 minute cache

// Get a specific setting section from the database
export async function getSetting<K extends SettingsKey>(key: K): Promise<SiteSettings[K]> {
    try {
        const [setting] = await db
            .select()
            .from(siteSettings)
            .where(eq(siteSettings.key, key))
            .limit(1);

        if (setting?.value) {
            return setting.value as SiteSettings[K];
        }
    } catch (error) {
        console.error(`Error fetching setting ${key}:`, error);
    }

    return DEFAULT_SETTINGS[key];
}

// Get all settings (with caching)
export async function getAllSettings(): Promise<SiteSettings> {
    const now = Date.now();

    // Return cached settings if still valid
    if (settingsCache && (now - cacheTimestamp) < CACHE_TTL) {
        return { ...DEFAULT_SETTINGS, ...settingsCache };
    }

    try {
        const dbSettings = await db.select().from(siteSettings);

        const merged = { ...DEFAULT_SETTINGS };
        for (const setting of dbSettings) {
            const key = setting.key as SettingsKey;
            if (key in merged && setting.value) {
                (merged as any)[key] = setting.value;
            }
        }

        // Update cache
        settingsCache = merged;
        cacheTimestamp = now;

        return merged;
    } catch (error) {
        console.error('Error fetching all settings:', error);
        return DEFAULT_SETTINGS;
    }
}

// Clear the settings cache (call after updating settings)
export function clearSettingsCache(): void {
    settingsCache = null;
    cacheTimestamp = 0;
}

// Convenience getters for common settings
export async function getSubscriptionPrice(): Promise<number> {
    const payment = await getSetting('payment');
    return payment.subscriptionPrice;
}

export async function getSubscriptionPriceCents(): Promise<number> {
    const price = await getSubscriptionPrice();
    return Math.round(price * 100);
}

export async function isMaintenanceMode(): Promise<boolean> {
    const general = await getSetting('general');
    return general.maintenanceMode;
}

export async function getSiteName(): Promise<string> {
    const general = await getSetting('general');
    return general.siteName;
}

export async function isDarkMode(): Promise<boolean> {
    const appearance = await getSetting('appearance');
    return appearance.darkMode;
}
