import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock the database module
vi.mock('@/lib/db', () => ({
    db: {
        select: vi.fn(() => ({
            from: vi.fn(() => ({
                where: vi.fn(() => ({
                    limit: vi.fn(() => Promise.resolve([]))
                }))
            }))
        }))
    }
}));

// Mock the schema
vi.mock('@/lib/db/schema', () => ({
    siteSettings: {}
}));

// Import after mocks are set up
import { getSetting, getSubscriptionPrice, getSubscriptionPriceCents, clearSettingsCache } from '@/lib/settings';

describe('Settings Utility', () => {
    beforeEach(() => {
        // Clear cache before each test
        clearSettingsCache();
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe('getSubscriptionPrice', () => {
        it('should return default price when no setting exists', async () => {
            const price = await getSubscriptionPrice();
            expect(price).toBe(29.9);
        });

        it('should return a number', async () => {
            const price = await getSubscriptionPrice();
            expect(typeof price).toBe('number');
        });
    });

    describe('getSubscriptionPriceCents', () => {
        it('should return price in cents (multiplied by 100)', async () => {
            const priceInCents = await getSubscriptionPriceCents();
            expect(priceInCents).toBe(2990);
        });

        it('should return an integer', async () => {
            const priceInCents = await getSubscriptionPriceCents();
            expect(Number.isInteger(priceInCents)).toBe(true);
        });
    });

    describe('getSetting', () => {
        it('should return default general settings when DB returns empty', async () => {
            const general = await getSetting('general');
            expect(general).toHaveProperty('siteName', 'Orphelia');
            expect(general).toHaveProperty('siteUrl');
            expect(general).toHaveProperty('maintenanceMode', false);
        });

        it('should return default payment settings', async () => {
            const payment = await getSetting('payment');
            expect(payment).toHaveProperty('subscriptionPrice', 29.9);
            expect(payment).toHaveProperty('currency', 'EUR');
            expect(payment).toHaveProperty('autoRenewal', true);
        });

        it('should return default appearance settings', async () => {
            const appearance = await getSetting('appearance');
            expect(appearance).toHaveProperty('darkMode', false);
            expect(appearance).toHaveProperty('primaryColor');
        });
    });

    describe('clearSettingsCache', () => {
        it('should not throw when called', () => {
            expect(() => clearSettingsCache()).not.toThrow();
        });
    });
});
