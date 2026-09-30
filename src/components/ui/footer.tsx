import { Link } from '@/routing';
import { Mail } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Logo } from '@/components/brand/logo';

const columns = [
  {
    title: 'discover',
    links: [
      { href: '/barbershops', label: 'salons' },
      { href: '/barbers', label: 'stylists' },
      { href: '/services', label: 'services' },
      { href: '/about', label: 'about' },
    ],
  },
  {
    title: 'pros',
    links: [
      { href: '/auth/signup', label: 'listSalon' },
      { href: '/my-space', label: 'proSpace' },
    ],
  },
] as const;

const legal = [
  { href: '/about#mentions-legales', label: 'legalNotice' },
  { href: '/privacy', label: 'privacy' },
  { href: '/terms', label: 'terms' },
  { href: '/cookies', label: 'cookies' },
] as const;

export function Footer() {
  const t = useTranslations('site.footer');
  return (
    <footer className="bg-gray-950 text-gray-400">
      <div className="mx-auto max-w-7xl px-4 pb-10 pt-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 md:grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(0,1fr))]">
          <div className="max-w-xs">
            <Link href="/" aria-label={t('homeLabel')} className="inline-flex">
              <Logo tone="light" />
            </Link>
            <p className="mt-4 text-sm leading-relaxed">
              {t('tagline')}
            </p>
          </div>

          {columns.map((column) => (
            <nav key={column.title} aria-label={t(column.title)}>
              <h2 className="text-sm font-semibold text-white">{t(column.title)}</h2>
              <ul className="mt-4 space-y-2.5 text-sm">
                {column.links.map((link) => (
                  <li key={link.href + link.label}>
                    <Link href={link.href} className="transition-colors hover:text-white">
                      {t(link.label)}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          <div>
            <h2 className="text-sm font-semibold text-white">{t('contact')}</h2>
            <a
              href="mailto:contact@orphelia.net"
              className="mt-4 inline-flex items-center gap-2 text-sm transition-colors hover:text-white"
            >
              <Mail className="h-4 w-4 text-primary-400" aria-hidden="true" />
              contact@orphelia.net
            </a>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-white/10 pt-6 text-sm sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Orphelia</p>
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            {legal.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="transition-colors hover:text-white">
                  {t(link.label)}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
