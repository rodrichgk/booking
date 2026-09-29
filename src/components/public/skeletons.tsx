/** Loading placeholders shaped like the public directory pages. */
function Bar({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-gray-200/70 ${className}`} />;
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50" aria-busy="true" aria-label="Chargement">
      <div className="h-16 border-b border-gray-200 bg-white" />
      {children}
    </div>
  );
}

export function DirectorySkeleton({ portrait = false }: { portrait?: boolean }) {
  return (
    <Shell>
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl space-y-4 px-4 py-12 sm:px-6 lg:px-8">
          <Bar className="h-9 w-72" />
          <Bar className="h-4 w-96 max-w-full" />
          <div className="flex gap-3 pt-4">
            <Bar className="h-11 flex-1 rounded-lg" />
            <Bar className="h-11 flex-1 rounded-lg" />
          </div>
        </div>
      </div>
      <div className={`mx-auto grid max-w-7xl gap-x-6 gap-y-10 px-4 py-10 sm:px-6 lg:px-8 ${portrait ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4' : 'sm:grid-cols-2 lg:grid-cols-3'}`}>
        {Array.from({ length: portrait ? 8 : 6 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <Bar className={`${portrait ? 'aspect-[4/5]' : 'aspect-[4/3]'} w-full rounded-xl`} />
            <Bar className="h-5 w-2/3" />
            <Bar className="h-4 w-1/2" />
          </div>
        ))}
      </div>
    </Shell>
  );
}

export function DetailSkeleton() {
  return (
    <Shell>
      <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        <Bar className="h-4 w-40" />
        <Bar className="h-10 w-80 max-w-full" />
        <Bar className="aspect-[21/9] w-full rounded-xl" />
        <div className="grid gap-12 pt-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="space-y-4">
            <Bar className="h-6 w-40" />
            {Array.from({ length: 5 }).map((_, i) => <Bar key={i} className="h-14 w-full" />)}
          </div>
          <Bar className="h-64 w-full rounded-xl" />
        </div>
      </div>
    </Shell>
  );
}

export function BookingSkeleton() {
  return (
    <Shell>
      <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        <Bar className="h-4 w-56" />
        <Bar className="h-9 w-80 max-w-full" />
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => <Bar key={i} className={`${i === 0 ? 'h-64' : 'h-16'} w-full rounded-xl`} />)}
          </div>
          <Bar className="h-72 w-full rounded-xl" />
        </div>
      </div>
    </Shell>
  );
}
