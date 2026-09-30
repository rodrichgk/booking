'use client';

/**
 * Shared layout and form pieces for the auth pages (sign in, sign up,
 * forgot / reset password, email verification). Uses the same tokens as the
 * rest of the site: brand orange accent, gray neutrals, Montserrat titles.
 */
import { useId, useState, type InputHTMLAttributes, type ReactNode } from 'react';
import { ArrowLeft, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import { Link } from '@/routing';
import { cn } from '@/lib/utils';
import { btn, inputClass, Spinner } from '@/components/dashboard/ui';
import { Logo } from '@/components/brand/logo';

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1560066984-138dadb4c035?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80';

/** Brand logo, same lockup as the site header. */
export function Wordmark({ className }: { className?: string }) {
  return (
    <Link href="/" aria-label="Orphelia, accueil" className={cn('inline-flex', className)}>
      <Logo />
    </Link>
  );
}

export function AuthShell({
  title,
  description,
  children,
  footer,
}: {
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  /** Line under the card, e.g. "No account yet? Sign up". */
  footer?: ReactNode;
}) {
  return (
    <div className="grid min-h-[100dvh] bg-white lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
      <div className="flex flex-col px-4 py-6 sm:px-8 lg:px-12">
        <header className="flex items-center justify-between">
          <Wordmark />
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 transition-colors hover:text-gray-900">
            <ArrowLeft className="h-4 w-4" />
            Accueil
          </Link>
        </header>

        <main className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-sm animate-fade-in-up">
            <h1 className="font-display text-3xl font-semibold tracking-tight text-gray-900">{title}</h1>
            {description && <p className="mt-2 text-gray-600">{description}</p>}
            <div className="mt-8">{children}</div>
            {footer && <div className="mt-8 text-center text-sm text-gray-600">{footer}</div>}
          </div>
        </main>

        <p className="text-center text-xs text-gray-400 lg:text-left">&copy; {new Date().getFullYear()} Orphelia</p>
      </div>

      <aside className="relative hidden overflow-hidden bg-gray-900 lg:sticky lg:top-0 lg:block lg:h-[100dvh] lg:self-start" aria-hidden="true">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={HERO_IMAGE} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950/85 via-gray-950/30 to-gray-950/10" />
        <div className="absolute inset-x-0 bottom-0 p-12">
          <p className="max-w-md font-display text-3xl font-semibold leading-tight tracking-tight text-white">
            Les spécialistes des cheveux afro, bouclés et texturés, réservés en quelques clics.
          </p>
          <p className="mt-4 max-w-md text-white/75">Des salons partenaires de Marseille à New York.</p>
        </div>
      </aside>
    </div>
  );
}

/** Centered status screen (email sent, link invalid, verified...). */
export function AuthStatus({
  icon: Icon,
  tone = 'brand',
  title,
  children,
  action,
}: {
  icon: React.ComponentType<{ className?: string }>;
  tone?: 'brand' | 'success' | 'danger';
  title: ReactNode;
  children?: ReactNode;
  action?: ReactNode;
}) {
  const tones = {
    brand: 'bg-primary-50 text-primary-600',
    success: 'bg-green-50 text-green-600',
    danger: 'bg-red-50 text-red-600',
  };
  return (
    <div>
      <span className={cn('inline-flex h-12 w-12 items-center justify-center rounded-full', tones[tone])}>
        <Icon className="h-6 w-6" />
      </span>
      <h2 className="mt-5 font-display text-xl font-semibold text-gray-900">{title}</h2>
      {children && <div className="mt-2 text-gray-600">{children}</div>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export function FormAlert({ tone = 'danger', children }: { tone?: 'danger' | 'success'; children: ReactNode }) {
  const Icon = tone === 'danger' ? AlertCircle : CheckCircle;
  return (
    <div
      role={tone === 'danger' ? 'alert' : 'status'}
      className={cn(
        'mb-6 flex gap-2.5 rounded-lg border px-3.5 py-3 text-sm',
        tone === 'danger' ? 'border-red-200 bg-red-50 text-red-800' : 'border-green-200 bg-green-50 text-green-800'
      )}
    >
      <Icon className="mt-0.5 h-4 w-4 flex-shrink-0" />
      <div>{children}</div>
    </div>
  );
}

type FieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  help?: ReactNode;
  /** Right side of the label row, e.g. a "forgot password" link. */
  labelAside?: ReactNode;
};

export function AuthField({ label, error, help, labelAside, className, type, ...props }: FieldProps) {
  const id = useId();
  const [visible, setVisible] = useState(false);
  const isPassword = type === 'password';
  const describedBy = [error && `${id}-error`, help && `${id}-help`].filter(Boolean).join(' ') || undefined;

  return (
    <div className={className}>
      <div className="mb-1.5 flex items-baseline justify-between gap-2">
        <label htmlFor={id} className="text-sm font-medium text-gray-800">{label}</label>
        {labelAside}
      </div>
      <div className="relative">
        <input
          id={id}
          type={isPassword && visible ? 'text' : type}
          aria-invalid={!!error || undefined}
          aria-describedby={describedBy}
          className={cn(
            inputClass,
            'py-2.5',
            isPassword && 'pr-10',
            error && 'border-red-400 focus:border-red-500 focus:ring-red-500/20'
          )}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-gray-400 hover:text-gray-700"
            aria-label={visible ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
          >
            {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
      </div>
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 text-xs text-red-600">{error}</p>
      ) : help ? (
        <p id={`${id}-help`} className="mt-1.5 text-xs text-gray-500">{help}</p>
      ) : null}
    </div>
  );
}

export function SubmitButton({ loading, children }: { loading?: boolean; children: ReactNode }) {
  return (
    <button type="submit" disabled={loading} className={cn(btn.primary, 'w-full py-2.5')}>
      {loading && <Spinner className="h-4 w-4" />}
      {children}
    </button>
  );
}

export function Divider({ children }: { children: ReactNode }) {
  return (
    <div className="my-6 flex items-center gap-3 text-xs text-gray-500">
      <span className="h-px flex-1 bg-gray-200" />
      {children}
      <span className="h-px flex-1 bg-gray-200" />
    </div>
  );
}

/** Google's multicolour "G", as required by Google's sign-in branding guidelines. */
export function GoogleButton({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return (
    <button type="button" onClick={onClick} className={cn(btn.secondary, 'w-full py-2.5')}>
      <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
      </svg>
      {children}
    </button>
  );
}

export const authLinkClass = 'font-medium text-primary-700 underline-offset-2 hover:text-primary-800 hover:underline';
