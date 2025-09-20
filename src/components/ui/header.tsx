'use client';

import { useState } from 'react';
import { Link } from '@/routing';
import { useSession, signOut } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { Menu, X, User, Calendar, Search, Heart } from 'lucide-react';
import { LanguageSwitcher } from './language-switcher';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { data: session, status } = useSession();
  const t = useTranslations('navigation');
  const tAuth = useTranslations('auth');
  const tProfile = useTranslations('profile');

  return (
    <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="font-sans font-bold text-2xl text-gray-900 tracking-[0.3em] uppercase">
              ORPHELIA
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/barbershops" className="text-gray-700 hover:text-primary-600 font-medium transition-colors font-body">
              {t('barbershops')}
            </Link>
            <Link href="/services" className="text-gray-700 hover:text-primary-600 font-medium transition-colors font-body">
              {t('services')}
            </Link>
            <Link href="/about" className="text-gray-700 hover:text-primary-600 font-medium transition-colors font-body">
              À propos
            </Link>
          </nav>

          {/* Desktop Auth & Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {status === 'loading' ? (
              <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
            ) : session ? (
              <div className="flex items-center space-x-4">
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
                    <span className="text-sm font-medium text-gray-700 font-body">{session.user.name}</span>
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <Link href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      {tProfile('myProfile')}
                    </Link>
                    <Link href="/bookings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      {tProfile('myBookings')}
                    </Link>
                    <button
                      onClick={() => signOut()}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      {tAuth('signOut')}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <LanguageSwitcher />
                <Link href="/auth/signin" className="text-gray-700 hover:text-primary-600 font-medium transition-colors font-body">
                  {tAuth('signIn')}
                </Link>
                <Link href="/auth/signup" className="btn-primary">
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
              <Link href="/barbershops" className="text-gray-700 hover:text-primary-600 font-medium">
                {t('barbershops')}
              </Link>
              <Link href="/services" className="text-gray-700 hover:text-primary-600 font-medium">
                {t('services')}
              </Link>
              <Link href="/about" className="text-gray-700 hover:text-primary-600 font-medium">
                À propos
              </Link>
              {session ? (
                <>
                  <Link href="/profile" className="text-gray-700 hover:text-primary-600 font-medium">
                    {tProfile('myProfile')}
                  </Link>
                  <Link href="/bookings" className="text-gray-700 hover:text-primary-600 font-medium">
                    {tProfile('myBookings')}
                  </Link>
                  <button
                    onClick={() => signOut()}
                    className="text-left text-gray-700 hover:text-primary-600 font-medium"
                  >
                    {tAuth('signOut')}
                  </button>
                </>
              ) : (
                <>
                  <Link href="/auth/signin" className="text-gray-700 hover:text-primary-600 font-medium">
                    {tAuth('signIn')}
                  </Link>
                  <Link href="/auth/signup" className="btn-primary inline-block text-center">
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
