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

/**
 * Directory page intro, same language as the homepage hero: split layout,
 * one accent word, pill search and filters on the left, a photo collage built
 * from the page's own data on the right (desktop only).
 */
export function DirectoryHero({
  title,
  accent,
  description,
  search,
  filters,
  visual,
}: {
  title: ReactNode;
  accent?: ReactNode;
  description?: ReactNode;
  search?: ReactNode;
  filters?: ReactNode;
  visual?: ReactNode;
}) {
  return (
    <section className="overflow-hidden border-b border-gray-200 bg-white">
      <PublicShell>
        <div className={cn('grid items-center gap-12 py-10 sm:py-14', visual && 'lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]')}>
          <div className="min-w-0">
            <h1 className="animate-fade-in-up font-display text-4xl font-semibold leading-[1.05] tracking-tight text-gray-900 md:text-5xl">
              {title}
              {accent && <> <span className="text-primary-600">{accent}</span></>}
            </h1>
            {description && <p className="anim-delay-100 mt-4 max-w-[52ch] animate-fade-in-up text-lg leading-relaxed text-gray-600">{description}</p>}
            {search && <div className="anim-delay-200 mt-8 animate-fade-in-up">{search}</div>}
            {filters && <div className="anim-delay-300 mt-5 animate-fade-in-up">{filters}</div>}
          </div>
          {visual && <div className="hidden lg:block">{visual}</div>}
        </div>
      </PublicShell>
    </section>
  );
}

type PillField = { label: string; value: string; onChange: (value: string) => void; placeholder: string };

/** The homepage's two-part search bar, filtering live (no submit button). */
export function PillSearch({ what, where }: { what: PillField; where: PillField }) {
  const field = (f: PillField, Icon: IconType, extra: string) => (
    <label className={cn('flex min-w-0 flex-col rounded-xl px-4 py-2.5 transition-colors focus-within:bg-gray-50 sm:rounded-full', extra)}>
      <span className="text-xs font-semibold text-gray-900">{f.label}</span>
      <span className="flex items-center gap-2">
        <Icon className="h-4 w-4 flex-shrink-0 text-gray-400" aria-hidden="true" />
        <input
          type="search"
          value={f.value}
          onChange={(e) => f.onChange(e.target.value)}
          placeholder={f.placeholder}
          className="w-full min-w-0 bg-transparent py-0.5 text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none [&::-webkit-search-cancel-button]:hidden"
        />
      </span>
    </label>
  );
  return (
    <div
      role="search"
      className="grid gap-1 rounded-2xl border border-gray-200 bg-white p-1.5 shadow-[0_12px_40px_-16px_rgba(222,90,22,0.25)] sm:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] sm:rounded-full"
    >
      {field(what, Search, 'sm:pl-6')}
      {field(where, MapPin, 'sm:border-l sm:border-gray-200')}
    </div>
  );
}

/**
 * One large photo with two smaller ones overlapping it, from real images
 * (salon photos, portraits, service photos). Falls back to `fallback` when
 * the page has fewer than one image of its own.
 */
export function PhotoCollage({ images, fallback }: { images: string[]; fallback: string[] }) {
  const pics = Array.from(new Set(images.filter(Boolean)));
  const list = (pics.length ? pics : fallback).slice(0, 3);
  const [main, second, third] = list;
  return (
    <div className="relative mx-auto aspect-[5/4] w-full max-w-xl">
      <div className="hero-image-in absolute inset-y-0 right-0 w-[78%] overflow-hidden rounded-2xl bg-gray-100">
        <Image src={main} alt="" fill priority sizes="40vw" className="object-cover" />
      </div>
      {second && (
        <div className="hero-image-in anim-delay-200 absolute bottom-[8%] left-0 aspect-square w-[36%] overflow-hidden rounded-2xl border-4 border-white bg-gray-100 shadow-xl shadow-gray-900/10">
          <Image src={second} alt="" fill sizes="220px" className="object-cover" />
        </div>
      )}
      {third && (
        <div className="hero-image-in anim-delay-300 absolute left-[10%] top-[6%] aspect-[4/5] w-[24%] overflow-hidden rounded-2xl border-4 border-white bg-gray-100 shadow-xl shadow-gray-900/10">
          <Image src={third} alt="" fill sizes="160px" className="object-cover" />
        </div>
      )}
    </div>
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
              'press inline-flex flex-shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium',
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
        <span key={count} className="inline-block animate-fade-in font-medium tabular-nums text-gray-900">{count}</span> {count > 1 ? noun[1] : noun[0]}
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
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary-100 via-primary-50 to-white">
          <span className="font-display text-5xl font-semibold tracking-tight text-primary-500/80">{initials}</span>
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
