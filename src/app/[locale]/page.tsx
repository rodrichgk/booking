import { Header } from '@/components/ui/header';
import { Hero } from '@/components/sections/hero';
import { FeaturedBarbershops } from '@/components/sections/featured-barbershops';
import { PopularServices } from '@/components/sections/popular-services';
import { HowItWorks } from '@/components/sections/how-it-works';
import { Footer } from '@/components/ui/footer';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        <Hero />
        <FeaturedBarbershops />
        <PopularServices />
        <HowItWorks />
      </main>
      <Footer />
    </div>
  );
}
