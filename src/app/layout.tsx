import type { Metadata } from 'next';
import { Inter, Poppins } from 'next/font/google';
import './globals.css';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
});

const poppins = Poppins({ 
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-poppins',
});

export const metadata: Metadata = {
  title: 'Orphelia - Premium Barbershop Booking',
  description: 'Book appointments at the best barbershops specializing in afro and black hair care. Find expert barbers, browse services, and schedule your perfect cut.',
  keywords: 'barbershop, afro hair, black hair, booking, appointments, natural hair, braids, locs',
  icons: {
    icon: '/favicon.svg',
    apple: '/logo.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
