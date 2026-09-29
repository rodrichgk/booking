/**
 * Loading placeholders shaped like the back-office layout (PageHeader,
 * StatGrid, list panels), so the page doesn't jump when data arrives.
 */
import { cn } from '@/lib/utils';

function Bar({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-md bg-gray-200/80', className)} />;
}

export function PageHeaderSkeleton({ withTabs = false }: { withTabs?: boolean }) {
  return (
    <div className="border-b border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
        <div className={cn('flex items-start justify-between gap-4', !withTabs && 'pb-6')}>
          <div className="space-y-2">
            <Bar className="h-8 w-56" />
            <Bar className="h-4 w-72" />
          </div>
          <Bar className="h-9 w-32 rounded-lg" />
        </div>
        {withTabs && (
          <div className="mt-6 flex gap-6 pb-3">
            {['w-24', 'w-16', 'w-20', 'w-14', 'w-16'].map((w, i) => (
              <Bar key={i} className={cn('h-4', w)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function StatGridSkeleton({ columns = 4 }: { columns?: 3 | 4 }) {
  return (
    <div
      className={cn(
        'grid gap-px overflow-hidden rounded-xl border border-gray-200 bg-gray-200',
        columns === 3 ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-2 lg:grid-cols-4'
      )}
    >
      {Array.from({ length: columns }).map((_, i) => (
        <div key={i} className="space-y-3 bg-white px-5 py-4">
          <Bar className="h-4 w-24" />
          <Bar className="h-8 w-16" />
          <Bar className="h-3 w-20" />
        </div>
      ))}
    </div>
  );
}

export function ListPanelSkeleton({ rows = 5, withHeader = true }: { rows?: number; withHeader?: boolean }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white">
      {withHeader && (
        <div className="border-b border-gray-100 px-5 py-4 sm:px-6">
          <Bar className="h-5 w-40" />
        </div>
      )}
      <div className="divide-y divide-gray-100">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-5 py-4 sm:px-6">
            <Bar className="h-10 w-10 flex-shrink-0 rounded-full" />
            <div className="flex-1 space-y-2">
              <Bar className="h-4 w-1/3" />
              <Bar className="h-3 w-1/2" />
            </div>
            <Bar className="hidden h-8 w-20 rounded-lg sm:block" />
          </div>
        ))}
      </div>
    </div>
  );
}

/** Full back-office page: header, optional stat strip, list panel. */
export function DashboardPageSkeleton({ withTabs = false, withStats = true, rows = 6 }: { withTabs?: boolean; withStats?: boolean; rows?: number }) {
  return (
    <div className="min-h-screen bg-gray-50" aria-busy="true" aria-label="Chargement">
      <div className="h-16 border-b border-gray-200 bg-white" />
      <PageHeaderSkeleton withTabs={withTabs} />
      <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        {withStats && <StatGridSkeleton />}
        <ListPanelSkeleton rows={rows} />
      </div>
    </div>
  );
}
