import { cn } from '@/lib/utils';

/**
 * Orphelia mark: the "o" of the name drawn as an afro pick. A thick ring with
 * three teeth hanging from its top, the middle one longer. Same construction
 * as the Bina mark (simple primitives, one colour), in the site orange.
 * Keep public/favicon.svg and public/logo.svg in sync with this geometry.
 */
export function LogoMark({ className, title }: { className?: string; title?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={cn('h-8 w-8 text-primary-500', className)}
      fill="currentColor"
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      <circle cx="32" cy="32" r="23" fill="none" stroke="currentColor" strokeWidth="14" />
      <rect x="21.5" y="14" width="4.6" height="26" rx="2.3" />
      <rect x="29.7" y="14" width="4.6" height="30" rx="2.3" />
      <rect x="37.9" y="14" width="4.6" height="26" rx="2.3" />
    </svg>
  );
}

/** Mark + wordmark lockup. `tone="light"` for dark backgrounds. */
export function Logo({
  className,
  tone = 'dark',
  size = 'md',
}: {
  className?: string;
  tone?: 'dark' | 'light';
  size?: 'sm' | 'md' | 'lg';
}) {
  const s = {
    sm: { mark: 'h-6 w-6', word: 'text-lg', gap: 'gap-2' },
    md: { mark: 'h-7 w-7', word: 'text-xl', gap: 'gap-2.5' },
    lg: { mark: 'h-9 w-9', word: 'text-2xl', gap: 'gap-3' },
  }[size];
  return (
    <span className={cn('inline-flex items-center', s.gap, className)}>
      <LogoMark className={s.mark} />
      <span
        className={cn(
          'font-display font-bold uppercase leading-none tracking-[0.15em]',
          s.word,
          tone === 'light' ? 'text-white' : 'text-gray-900'
        )}
      >
        Orphelia
      </span>
    </span>
  );
}
