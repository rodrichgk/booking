import { Header } from '@/components/ui/header';
import { Footer } from '@/components/ui/footer';
import { BarbershopSearch } from '@/components/sections/barbershop-search';
import { BarbershopGrid } from '@/components/sections/barbershop-grid';

export default function BarbershopsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main>
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">
              Find Your Perfect Barbershop
            </h1>
            <p className="text-gray-600">
              Discover expert barbershops specializing in afro and natural hair care
            </p>
          </div>
        </div>
        <BarbershopSearch />
        <BarbershopGrid />
      </main>
      <Footer />
    </div>
  );
}
