'use client';

import { SessionProvider } from 'next-auth/react';
import { ReactNode } from 'react';
import { Toaster } from '@/components/ui/toaster';
import { SettingsProvider } from '@/contexts/settings-context';
import { ConfirmProvider } from '@/components/dashboard/confirm-dialog';
import { MaintenanceGate } from '@/components/maintenance-gate';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <SettingsProvider>
        <ConfirmProvider>
          <MaintenanceGate>{children}</MaintenanceGate>
          <Toaster />
        </ConfirmProvider>
      </SettingsProvider>
    </SessionProvider>
  );
}
