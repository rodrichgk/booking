'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface PublicSettings {
    subscriptionPrice: number;
    currency: string;
    siteName: string;
    siteUrl: string;
    maintenanceMode: boolean;
    darkMode: boolean;
    primaryColor: string;
}

const defaultSettings: PublicSettings = {
    subscriptionPrice: 29.9,
    currency: 'EUR',
    siteName: 'Orphelia',
    siteUrl: 'https://www.orphelia.net',
    maintenanceMode: false,
    darkMode: false,
    primaryColor: '#6366f1',
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

    // Apply dark mode to document
    useEffect(() => {
        if (settings.darkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [settings.darkMode]);

    // Apply primary color as CSS variable
    useEffect(() => {
        document.documentElement.style.setProperty('--primary-color', settings.primaryColor);
    }, [settings.primaryColor]);

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
