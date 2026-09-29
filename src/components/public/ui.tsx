'use client';

/**
 * Building blocks for the public directory pages (salons, coiffeurs,
 * services). Same tokens as the rest of the site: brand orange as the only
 * accent, gray neutrals, Montserrat titles, rounded-xl surfaces.
 */
import { useEffect, useState, type ComponentType, type ReactNode } from 'react';
import Image from 'next/image';
import { Star, MapPin, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { openStatus, type OpeningHours } from '@/lib/opening-hours';

type IconType = ComponentType<{ className?: string }>;

export function PublicShell({ children }: { children: ReactNode }) {
  return <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">{children}</div>;
}

/** Left-aligned page intro with an optional search/filter row underneath. */
export function DirectoryHeader({ title, description, children }: { title: ReactNode; description?: ReactNode; children?: ReactNode }) {
  return (
    <section className="border-b border-gray-200 bg-white">
      <PublicShell>
        <div className="py-10 sm:py-12">
          <h1 className="max-w-3xl font-display text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl">{title}</h1>
          {description && <p className="mt-3 max-w-2xl text-gray-600">{description}</p>}
          {children && <div className="mt-8">{children}</div>}
        </div>
      </PublicShell>
    </section>
  );
}

export function SearchField({
  icon: Icon = Search,
  label,
  value,
  onChange,
  placeholder,
}: {
  icon?: IconType;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="relative block flex-1">
      <span className="sr-only">{label}</span>
      <Icon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="block w-full rounded-lg border border-gray-300 bg-white py-3 pl-10 pr-3 text-sm text-gray-900 placeholder:text-gray-500 transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
      />
    </label>
  );
}

/** Horizontal, scrollable single-choice chips (categories, cities...). */
export function ChipGroup<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { id: T; label: string; count?: number }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div role="radiogroup" aria-label={label} className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
      {options.map((option) => {
        const active = option.id === value;
        return (
          <button
            key={option.id}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(option.id)}
            className={cn(
              'inline-flex flex-shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors',
              active ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
            )}
          >
            {option.label}
            {typeof option.count === 'number' && (
              <span className={cn('tabular-nums', active ? 'text-white/70' : 'text-gray-400')}>{option.count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export function ResultsBar({ count, noun, children }: { count: number; noun: [string, string]; children?: ReactNode }) {
  return (
    <div className="flex flex-col gap-3 py-6 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-gray-600" aria-live="polite">
        <span className="font-medium tabular-nums text-gray-900">{count}</span> {count > 1 ? noun[1] : noun[0]}
      </p>
      {children}
    </div>
  );
}

export function Rating({ value, count, className }: { value: string | number | null | undefined; count?: number | null; className?: string }) {
  const n = typeof value === 'number' ? value : parseFloat(value ?? '');
  if (!Number.isFinite(n) || n <= 0) {
    return <span className={cn('text-sm text-gray-500', className)}>Nouveau</span>;
  }
  return (
    <span className={cn('inline-flex items-center gap-1 text-sm tabular-nums text-gray-900', className)}>
      <Star className="h-3.5 w-3.5 fill-primary-500 text-primary-500" aria-hidden="true" />
      <span className="font-medium">{n.toFixed(1).replace('.', ',')}</span>
      {typeof count === 'number' && count > 0 && <span className="text-gray-500">({count} avis)</span>}
    </span>
  );
}

/**
 * "Ouvert jusqu'à 19h" / "Ouvre demain à 9h". Rendered after mount only:
 * it depends on the current time, which differs between server and browser.
 */
export function OpenStatus({ hours, className }: { hours: OpeningHours | null | undefined; className?: string }) {
  const [status, setStatus] = useState<ReturnType<typeof openStatus>>(null);
  useEffect(() => setStatus(openStatus(hours)), [hours]);
  if (!status) return null;
  return (
    <span className={cn('inline-flex items-center gap-1.5 text-sm', status.open ? 'text-green-700' : 'text-gray-500', className)}>
      <span aria-hidden="true" className={cn('h-1.5 w-1.5 rounded-full', status.open ? 'bg-green-600' : 'bg-gray-400')} />
      {status.label}
    </span>
  );
}

/** Photo, or a calm monogram panel when the salon/barber has no photo yet. */
export function Media({
  src,
  name,
  className,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  priority,
  rounded = 'rounded-xl',
}: {
  src?: string | null;
  name: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  rounded?: string;
}) {
  const initials =
    name
      .split(/\s+/)
      .filter((w) => /^\p{L}/u.test(w)) // skip "&", "-", digits...
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase())
      .join('') || '?';
  return (
    <div className={cn('relative overflow-hidden bg-gray-100', rounded, className)}>
      {src ? (
        <Image
          src={src}
          alt=""
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary-50 to-gray-100">
          <span className="font-display text-4xl font-semibold tracking-tight text-primary-300">{initials}</span>
        </div>
      )}
    </div>
  );
}

export function Place({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span className={cn('inline-flex min-w-0 max-w-full items-center gap-1.5 text-sm text-gray-600', className)}>
      <MapPin className="h-3.5 w-3.5 flex-shrink-0 text-gray-400" aria-hidden="true" />
      <span className="truncate">{children}</span>
    </span>
  );
}

export function EmptyResults({ title, children, action }: { title: string; children?: ReactNode; action?: ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
      <Search className="mx-auto h-6 w-6 text-gray-400" aria-hidden="true" />
      <h2 className="mt-4 font-display text-lg font-semibold text-gray-900">{title}</h2>
      {children && <p className="mx-auto mt-1 max-w-sm text-sm text-gray-600">{children}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

/** Section title inside a detail page (no card around it). */
export function SectionTitle({ children, aside, id }: { children: ReactNode; aside?: ReactNode; id?: string }) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4">
      <h2 id={id} className="font-display text-xl font-semibold tracking-tight text-gray-900">{children}</h2>
      {aside}
    </div>
  );
}
