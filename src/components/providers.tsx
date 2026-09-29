'use client';

import { SessionProvider } from 'next-auth/react';
import { ReactNode } from 'react';
import { Toaster } from '@/components/ui/toaster';
import { SettingsProvider } from '@/contexts/settings-context';
import { ConfirmProvider } from '@/components/dashboard/confirm-dialog';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <SettingsProvider>
        <ConfirmProvider>
          {children}
          <Toaster />
        </ConfirmProvider>
      </SettingsProvider>
    </SessionProvider>
  );
}
