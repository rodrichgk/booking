'use client';

import { useState } from 'react';
import { Link } from '@/routing';
import { useSession, signOut } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { Menu, X, User, Calendar, Search, Heart } from 'lucide-react';
import { LanguageSwitcher } from './language-switcher';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const sessionResult = useSession();
  const session = sessionResult?.data;
  const status = sessionResult?.status || 'loading';
  const t = useTranslations('navigation');
  const tAuth = useTranslations('auth');
  const tProfile = useTranslations('profile');

  const userRole = session?.user?.role;
  const isAdmin = userRole === 'admin' || userRole === 'dev';
  const isBarber = userRole === 'barber';
  const isCustomer = userRole === 'customer';

  const getNavItems = () => {
    const baseItems = [
      { href: '/barbershops', label: t('barbershops') },
      { href: '/barbers', label: t('barbers') },
      { href: '/services', label: t('services') },
    ];

    // Admin/Dev users: Keep nav clean, access admin features via My Space
    if (isAdmin) {
      return baseItems;
    }

    if (isBarber) {
      return baseItems;
    }

    return [
      ...baseItems,
      { href: '/about', label: 'À propos' },
    ];
  };

  const getAccountMenuItems = () => {
    const baseItems = [
      { href: '/my-space', label: t('mySpace') },
    ];

    // Admin/Dev users access admin features from My Space dashboard
    if (isAdmin) {
      return baseItems;
    }

    if (isBarber) {
      return baseItems;
    }

    return baseItems;
  };

  const navItems = getNavItems();
  const accountMenuItems = getAccountMenuItems();

  return (
    <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="font-display font-bold text-3xl text-gray-900 tracking-[0.15em] uppercase">
              ORPHELIA
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-gray-700 hover:text-primary-600 font-semibold transition-colors font-display uppercase text-sm tracking-wide"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Desktop Auth & Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {status === 'loading' ? (
              <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
            ) : session ? (
              <div className="flex items-center space-x-4">
                <LanguageSwitcher />
                <Link href="/bookings" className="p-2 text-gray-600 hover:text-primary-600 transition-colors">
                  <Calendar className="w-5 h-5" />
                </Link>
                <Link href="/favorites" className="p-2 text-gray-600 hover:text-primary-600 transition-colors">
                  <Heart className="w-5 h-5" />
                </Link>
                <div className="relative group">
                  <button className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors">
                    {session.user.image ? (
                      <img src={session.user.image} alt={session.user.name} className="w-8 h-8 rounded-full" />
                    ) : (
                      <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-white" />
                      </div>
                    )}
                    <span className="text-xs font-semibold text-gray-700 font-display uppercase tracking-wide">{session.user.name}</span>
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    {accountMenuItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="block px-4 py-2 text-xs text-gray-700 hover:bg-gray-50 font-display uppercase tracking-wide"
                      >
                        {item.label}
                      </Link>
                    ))}
                    <button
                      onClick={() => signOut()}
                      className="block w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-gray-50 font-display uppercase tracking-wide"
                    >
                      {tAuth('signOut')}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <LanguageSwitcher />
                <Link href="/auth/signin" className="text-gray-700 hover:text-primary-600 font-semibold transition-colors font-display uppercase text-xs tracking-wide">
                  {tAuth('signIn')}
                </Link>
                <Link href="/auth/signup" className="btn-primary font-display uppercase text-xs tracking-wide">
                  {tAuth('signUp')}
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100">
            <nav className="flex flex-col space-y-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-gray-700 hover:text-primary-600 font-semibold font-display uppercase text-sm tracking-wide"
                >
                  {item.label}
                </Link>
              ))}
              {session ? (
                <>
                  <div className="py-2">
                    <LanguageSwitcher />
                  </div>
                  {accountMenuItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="text-gray-700 hover:text-primary-600 font-semibold font-display uppercase text-xs tracking-wide"
                    >
                      {item.label}
                    </Link>
                  ))}
                  <button
                    onClick={() => signOut()}
                    className="text-left text-gray-700 hover:text-primary-600 font-semibold font-display uppercase text-xs tracking-wide"
                  >
                    {tAuth('signOut')}
                  </button>
                </>
              ) : (
                <>
                  <Link href="/auth/signin" className="text-gray-700 hover:text-primary-600 font-semibold font-display uppercase text-xs tracking-wide">
                    {tAuth('signIn')}
                  </Link>
                  <Link href="/auth/signup" className="btn-primary inline-block text-center font-display uppercase text-xs tracking-wide">
                    {tAuth('signUp')}
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
