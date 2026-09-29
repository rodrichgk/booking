import { NextResponse } from 'next/server';
import { getSetting, getPasswordMinLength } from '@/lib/settings';

// Public API to get settings needed by the frontend
// This endpoint is cached and returns only public-safe settings
export async function GET() {
    try {
        const payment = await getSetting('payment');
        const general = await getSetting('general');

        return NextResponse.json({
            subscriptionPrice: payment.subscriptionPrice,
            currency: payment.currency,
            siteName: general.siteName,
            maintenanceMode: general.maintenanceMode,
            passwordMinLength: await getPasswordMinLength(),
        }, {
            headers: {
                // Cache for 1 minute
                'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30',
            },
        });
    } catch (error) {
        console.error('Error fetching public settings:', error);

        // Return defaults on error
        return NextResponse.json({
            subscriptionPrice: 29.9,
            currency: 'EUR',
            siteName: 'Orphelia',
            maintenanceMode: false,
            passwordMinLength: 8,
        });
    }
}
