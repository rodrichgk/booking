'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface PublicSettings {
    subscriptionPrice: number;
    currency: string;
    siteName: string;
    maintenanceMode: boolean;
    passwordMinLength: number;
}

const defaultSettings: PublicSettings = {
    subscriptionPrice: 29.9,
    currency: 'EUR',
    siteName: 'Orphelia',
    maintenanceMode: false,
    passwordMinLength: 8,
};

const SettingsContext = createContext<PublicSettings>(defaultSettings);

export const useSettings = () => useContext(SettingsContext);

interface SettingsProviderProps {
    children: ReactNode;
    initialSettings?: Partial<PublicSettings>;
}

export function SettingsProvider({ children, initialSettings }: SettingsProviderProps) {
    const [settings, setSettings] = useState<PublicSettings>({
        ...defaultSettings,
        ...initialSettings,
    });

    // Fetch settings on mount
    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await fetch('/api/settings/public');
                if (res.ok) {
                    const data = await res.json();
                    setSettings(prev => ({ ...prev, ...data }));
                }
            } catch (error) {
                console.error('Failed to fetch settings:', error);
            }
        };

        fetchSettings();
    }, []);

    return (
        <SettingsContext.Provider value={settings}>
            {children}
        </SettingsContext.Provider>
    );
}

// Hook to format price with currency
export function useFormattedPrice(price?: number): string {
    const settings = useSettings();
    const actualPrice = price ?? settings.subscriptionPrice;

    const formatter = new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: settings.currency,
    });

    return formatter.format(actualPrice);
}

// Hook to get subscription price
export function useSubscriptionPrice(): number {
    const settings = useSettings();
    return settings.subscriptionPrice;
}
