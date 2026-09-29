'use client';

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Wrench } from 'lucide-react';
import { useSettings } from '@/contexts/settings-context';

/**
 * Shows a maintenance screen to visitors while "Mode maintenance" is on
 * (admin Settings > Général). Admins/devs keep full access, and the auth
 * pages stay reachable so they can sign in. New bookings are also refused
 * server-side by the booking API.
 */
export function MaintenanceGate({ children }: { children: ReactNode }) {
  const { maintenanceMode, siteName } = useSettings();
  const { data: session, status } = useSession();
  const pathname = usePathname() || '';

  const role = (session?.user as { role?: string } | undefined)?.role;
  const isStaff = role === 'admin' || role === 'dev';
  const isAuthPage = /^\/(fr|en)\/auth(\/|$)/.test(pathname);

  if (!maintenanceMode || isStaff || isAuthPage || status === 'loading') {
    return <>{children}</>;
  }

  return (
    <main className="flex min-h-[100dvh] items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md text-center">
        <span className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary-50 text-primary-600">
          <Wrench className="h-6 w-6" />
        </span>
        <h1 className="mt-5 font-display text-2xl font-semibold tracking-tight text-gray-900">{siteName} est en maintenance</h1>
        <p className="mt-2 text-gray-600">
          Nous améliorons le site. Il sera de nouveau disponible très bientôt, merci de votre patience.
        </p>
      </div>
    </main>
  );
}
