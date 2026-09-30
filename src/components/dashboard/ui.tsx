/**
 * Shared building blocks for the back office (shop owner space + admin).
 *
 * Design rules these components encode, so pages stay consistent:
 * - Neutrals are gray; the only accent is the brand `primary` (orange).
 *   Green / amber / red appear only to convey a real status, never as decoration.
 * - Shapes: panels `rounded-xl`, controls `rounded-lg`, badges and avatars `rounded-full`.
 * - Panels are separated by a 1px border, not heavy shadows.
 * - Titles use the display face (Montserrat); numbers use tabular figures.
 * - Icons come from lucide-react only; no emoji in the UI.
 */
import type { ComponentType, ReactNode } from 'react';
import { cn } from '@/lib/utils';

type IconType = ComponentType<{ className?: string }>;

const euroFormatter = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' });
const euroFormatterEn = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'EUR' });

/** "25" / 25 / "25.5" -> "25,00 €" / "25,50 €" ("€25.00" with locale "en"). */
export function formatEuro(value: string | number | null | undefined, locale?: string): string {
  const n = typeof value === 'number' ? value : parseFloat(value ?? '');
  if (!Number.isFinite(n)) return '-';
  return (locale === 'en' ? euroFormatterEn : euroFormatter).format(n);
}

/* ------------------------------------------------------------------ */
/* Layout                                                              */
/* ------------------------------------------------------------------ */

export function PageShell({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8', className)}>{children}</div>;
}

export function PageHeader({
  title,
  description,
  back,
  actions,
  meta,
  children,
}: {
  title: ReactNode;
  description?: ReactNode;
  /** A back link element (e.g. <Link>), rendered before the title. */
  back?: ReactNode;
  actions?: ReactNode;
  /** Small inline facts under the title (city, rating, ...). */
  meta?: ReactNode;
  /** Rendered under the header row, typically <Tabs>. */
  children?: ReactNode;
}) {
  return (
    <div className="border-b border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
        <div className={cn('flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between', !children && 'pb-6')}>
          <div className="flex min-w-0 items-start gap-3">
            {back}
            <div className="min-w-0">
              <h1 className="truncate font-display text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">
                {title}
              </h1>
              {description && <p className="mt-1 max-w-[65ch] text-sm text-gray-600">{description}</p>}
              {meta && <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600">{meta}</div>}
            </div>
          </div>
          {actions && <div className="flex flex-shrink-0 flex-wrap items-center gap-2">{actions}</div>}
        </div>
        {children}
      </div>
    </div>
  );
}

/** Class for the back arrow link passed to <PageHeader back={...}>. */
export const backLinkClass =
  'mt-1 inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900';

export function Tabs<T extends string>({
  tabs,
  active,
  onChange,
}: {
  tabs: { id: T; label: string; icon?: IconType; count?: number }[];
  active: T;
  onChange: (id: T) => void;
}) {
  return (
    <nav className="-mx-4 mt-6 flex overflow-x-auto px-4 sm:mx-0 sm:px-0" aria-label="Sections">
      {tabs.map((tab) => {
        const isActive = tab.id === active;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            aria-current={isActive ? 'page' : undefined}
            className={cn(
              'flex flex-shrink-0 items-center gap-2 whitespace-nowrap border-b-2 px-3 py-3 text-sm font-medium transition-colors sm:px-4',
              isActive
                ? 'border-primary-600 text-gray-900'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-900'
            )}
          >
            {tab.icon && <tab.icon className={cn('h-4 w-4', isActive ? 'text-primary-600' : 'text-gray-400')} />}
            {tab.label}
            {typeof tab.count === 'number' && (
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs tabular-nums text-gray-600">{tab.count}</span>
            )}
          </button>
        );
      })}
    </nav>
  );
}

/* ------------------------------------------------------------------ */
/* Surfaces                                                            */
/* ------------------------------------------------------------------ */

export function Panel({ children, className }: { children: ReactNode; className?: string }) {
  return <section className={cn('rounded-xl border border-gray-200 bg-white', className)}>{children}</section>;
}

export function PanelHeader({
  title,
  description,
  actions,
  icon: Icon,
}: {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  icon?: IconType;
}) {
  return (
    <div className="flex flex-col gap-3 border-b border-gray-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
      <div className="flex min-w-0 items-start gap-3">
        {Icon && <Icon className="mt-0.5 h-5 w-5 flex-shrink-0 text-gray-400" />}
        <div className="min-w-0">
          <h2 className="font-display text-base font-semibold text-gray-900">{title}</h2>
          {description && <p className="mt-0.5 text-sm text-gray-500">{description}</p>}
        </div>
      </div>
      {actions && <div className="flex flex-shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function PanelBody({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('px-5 py-5 sm:px-6', className)}>{children}</div>;
}

/** Section title used between panels (no card around it). */
export function SectionHeading({
  title,
  description,
  actions,
}: {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h2 className="font-display text-xl font-semibold tracking-tight text-gray-900">{title}</h2>
        {description && <p className="mt-1 text-sm text-gray-600">{description}</p>}
      </div>
      {actions && <div className="flex flex-shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Data display                                                        */
/* ------------------------------------------------------------------ */

/**
 * A row of key figures. Rendered as one bordered strip with hairline
 * dividers instead of a row of identical coloured cards.
 */
export function StatGrid({
  children,
  columns = 4,
  className,
}: {
  children: ReactNode;
  /** Must match the number of <Stat> children so no empty cell shows. */
  columns?: 2 | 3 | 4;
  className?: string;
}) {
  const cols = {
    2: 'grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-3',
    4: 'grid-cols-2 lg:grid-cols-4',
  };
  return (
    <div
      className={cn(
        'grid gap-px overflow-hidden rounded-xl border border-gray-200 bg-gray-200',
        cols[columns],
        className
      )}
    >
      {children}
    </div>
  );
}

export function Stat({
  label,
  value,
  hint,
  icon: Icon,
  tone = 'default',
}: {
  label: ReactNode;
  value: ReactNode;
  hint?: ReactNode;
  icon?: IconType;
  /** `attention` highlights a figure that needs action (e.g. pending items). */
  tone?: 'default' | 'attention';
}) {
  return (
    <div className="bg-white px-5 py-4">
      <div className="flex items-center gap-2 text-sm text-gray-500">
        {Icon && <Icon className="h-4 w-4 text-gray-400" />}
        <span className="truncate">{label}</span>
      </div>
      <p
        className={cn(
          'mt-2 font-display text-2xl font-semibold tabular-nums tracking-tight sm:text-3xl',
          tone === 'attention' ? 'text-primary-700' : 'text-gray-900'
        )}
      >
        {typeof value === 'number' ? value.toLocaleString('fr-FR') : value}
      </p>
      {hint && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
    </div>
  );
}

export type BadgeTone = 'neutral' | 'success' | 'warning' | 'danger' | 'brand' | 'info';

const badgeTones: Record<BadgeTone, string> = {
  neutral: 'bg-gray-100 text-gray-700 ring-gray-200',
  success: 'bg-green-50 text-green-700 ring-green-200',
  warning: 'bg-amber-50 text-amber-800 ring-amber-200',
  danger: 'bg-red-50 text-red-700 ring-red-200',
  brand: 'bg-primary-50 text-primary-700 ring-primary-200',
  // "info" is kept neutral on purpose: blue would be a second accent.
  info: 'bg-gray-50 text-gray-700 ring-gray-200',
};

export function Badge({
  tone = 'neutral',
  icon: Icon,
  children,
  className,
}: {
  tone?: BadgeTone;
  icon?: IconType;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset',
        badgeTones[tone],
        className
      )}
    >
      {Icon && <Icon className="h-3.5 w-3.5" />}
      {children}
    </span>
  );
}

/** Label/value pair for detail views. */
export function Field({ label, children, icon: Icon }: { label: ReactNode; children: ReactNode; icon?: IconType }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</dt>
      <dd className="mt-1 flex items-start gap-2 text-sm text-gray-900">
        {Icon && <Icon className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-400" />}
        <span className="min-w-0 break-words">{children}</span>
      </dd>
    </div>
  );
}

export function Avatar({
  name,
  src,
  size = 'md',
}: {
  name?: string | null;
  src?: string | null;
  size?: 'sm' | 'md' | 'lg';
}) {
  const sizes = { sm: 'h-8 w-8 text-xs', md: 'h-10 w-10 text-sm', lg: 'h-12 w-12 text-base' };
  const initials =
    (name || '?')
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('') || '?';

  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={name || ''} className={cn('flex-shrink-0 rounded-full object-cover ring-1 ring-gray-200', sizes[size])} />;
  }
  return (
    <span
      aria-hidden="true"
      className={cn(
        'inline-flex flex-shrink-0 items-center justify-center rounded-full bg-primary-50 font-semibold text-primary-700 ring-1 ring-primary-100',
        sizes[size]
      )}
    >
      {initials}
    </span>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon?: IconType;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col items-center px-6 py-12 text-center', className)}>
      {Icon && (
        <span className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
          <Icon className="h-6 w-6 text-gray-400" />
        </span>
      )}
      <h3 className="font-display text-base font-semibold text-gray-900">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm text-gray-500">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function Notice({
  tone = 'neutral',
  icon: Icon,
  title,
  children,
  action,
}: {
  tone?: 'neutral' | 'warning' | 'danger' | 'success' | 'brand';
  icon?: IconType;
  title?: ReactNode;
  children?: ReactNode;
  action?: ReactNode;
}) {
  const tones = {
    neutral: 'border-gray-200 bg-gray-50 text-gray-700',
    warning: 'border-amber-200 bg-amber-50 text-amber-900',
    danger: 'border-red-200 bg-red-50 text-red-800',
    success: 'border-green-200 bg-green-50 text-green-800',
    brand: 'border-primary-200 bg-primary-50 text-primary-900',
  };
  return (
    <div className={cn('flex flex-col gap-3 rounded-xl border px-4 py-3 sm:flex-row sm:items-center', tones[tone])}>
      <div className="flex flex-1 items-start gap-3">
        {Icon && <Icon className="mt-0.5 h-5 w-5 flex-shrink-0" />}
        <div className="text-sm">
          {title && <p className="font-semibold">{title}</p>}
          {children && <div className={cn(title && 'mt-0.5', 'opacity-90')}>{children}</div>}
        </div>
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Controls (class recipes, so they work on <button>, <Link> and <a>)  */
/* ------------------------------------------------------------------ */

const btnBase =
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-[background-color,color,border-color,transform] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';

export const btn = {
  primary: cn(btnBase, 'bg-primary-600 px-4 py-2 text-white hover:bg-primary-700'),
  secondary: cn(btnBase, 'border border-gray-300 bg-white px-4 py-2 text-gray-800 hover:bg-gray-50'),
  ghost: cn(btnBase, 'px-3 py-2 text-gray-700 hover:bg-gray-100 hover:text-gray-900'),
  danger: cn(btnBase, 'bg-red-600 px-4 py-2 text-white hover:bg-red-700 focus-visible:ring-red-500'),
  dangerGhost: cn(btnBase, 'px-3 py-2 text-red-600 hover:bg-red-50 focus-visible:ring-red-500'),
  icon: cn(btnBase, 'h-9 w-9 text-gray-500 hover:bg-gray-100 hover:text-gray-900'),
  iconDanger: cn(btnBase, 'h-9 w-9 text-gray-500 hover:bg-red-50 hover:text-red-600 focus-visible:ring-red-500'),
  sm: 'px-3 py-1.5 text-xs',
};

export const inputClass =
  'block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 disabled:bg-gray-50 disabled:text-gray-500';

export const labelClass = 'mb-1.5 block text-sm font-medium text-gray-800';

export function Switch({
  checked,
  onChange,
  disabled,
  label,
  tone = 'brand',
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  /** Accessible name; the visible label usually sits next to the switch. */
  label: string;
  /** `danger` for switches whose "on" state is risky (e.g. maintenance mode). */
  tone?: 'brand' | 'danger';
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        checked ? (tone === 'danger' ? 'bg-red-600' : 'bg-primary-600') : 'bg-gray-200'
      )}
    >
      <span
        className={cn(
          'inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform',
          checked ? 'translate-x-6' : 'translate-x-1'
        )}
      />
    </button>
  );
}

export function Spinner({ className }: { className?: string }) {
  return (
    <span
      role="status"
      aria-label="Chargement"
      className={cn('inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent', className)}
    />
  );
}
