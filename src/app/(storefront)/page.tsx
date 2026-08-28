import { Hero } from "@/components/marketplace/home/Hero";
import { FeaturedProducts } from "@/components/marketplace/home/FeaturedProducts";
import { GameSection } from "@/components/marketplace/home/GameSection";
import { HowItWorks } from "@/components/marketplace/home/HowItWorks";
import { TrustSection } from "@/components/marketplace/home/TrustSection";
import { getFeaturedProducts, getGames } from "@/lib/queries";

export default async function HomePage() {
  const [products, games] = await Promise.all([getFeaturedProducts(), getGames()]);

  return (
    <>
      <Hero />
      <FeaturedProducts products={products} />
      <GameSection games={games} />
      <HowItWorks />
      <TrustSection />
    </>
  );
}
