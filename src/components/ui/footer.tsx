'use client';

import { Link } from '@/routing';
import { useTranslations } from 'next-intl';
import { Facebook, Twitter, Instagram, Mail, MapPin } from 'lucide-react';

export function Footer() {
  const t = useTranslations('footer');
  
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center">
              <span className="font-sans font-bold text-2xl text-white tracking-[0.3em] uppercase">
                ORPHELIA
              </span>
            </Link>
            <p className="text-gray-400 leading-relaxed">
              Vous connecter avec les meilleurs salons spécialisés dans les soins capillaires afro et naturels. 
              Réservez en toute confiance, coiffez-vous avec fierté.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Liens Rapides</h3>
            <ul className="space-y-2">
              <li><Link href="/barbershops" className="text-gray-400 hover:text-white transition-colors">Trouver des Salons</Link></li>
              <li><Link href="/" className="text-gray-400 hover:text-white transition-colors">Accueil</Link></li>
              <li><Link href="/auth/signup" className="text-gray-400 hover:text-white transition-colors">S'inscrire</Link></li>
              <li><Link href="/auth/signin" className="text-gray-400 hover:text-white transition-colors">Se Connecter</Link></li>
            </ul>
          </div>

          {/* For Businesses */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Pour les Entreprises</h3>
            <ul className="space-y-2">
              <li><Link href="/auth/signup" className="text-gray-400 hover:text-white transition-colors">Inscrire Votre Salon</Link></li>
              <li><Link href="/my-space" className="text-gray-400 hover:text-white transition-colors">Tableau de Bord</Link></li>
              <li><Link href="/auth/signin" className="text-gray-400 hover:text-white transition-colors">Se Connecter</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Nous Contacter</h3>
            <div className="space-y-3">
              <a href="mailto:contact@orphelia.net" className="flex items-center space-x-3 hover:text-white transition-colors">
                <Mail className="w-5 h-5 text-primary-400" />
                <span className="text-gray-400 hover:text-white">contact@orphelia.net</span>
              </a>
              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-primary-400" />
                <span className="text-gray-400">Marseille, France</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2025 ORPHELIA. Tous droits réservés.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link href="/privacy" className="text-gray-400 hover:text-white text-sm transition-colors">
                Politique de Confidentialité
              </Link>
              <Link href="/terms" className="text-gray-400 hover:text-white text-sm transition-colors">
                Conditions d'Utilisation
              </Link>
              <Link href="/cookies" className="text-gray-400 hover:text-white text-sm transition-colors">
                Politique des Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
