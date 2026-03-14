import { FeatureGrid } from "../components/landing/FeatureGrid";
import { FooterCTA } from "../components/landing/FooterCTA";
import { HeroSection } from "../components/landing/HeroSection";
import { ProductPreviewSection } from "../components/landing/ProductPreviewSection";

type Props = {
  onStart: () => void;
  onDemo: () => void;
};

export function LandingPage({ onStart, onDemo }: Props) {
  return (
    <main className="landing-shell">
      <HeroSection onStart={onStart} onDemo={onDemo} />
      <ProductPreviewSection />
      <FeatureGrid />
      <FooterCTA onStart={onStart} />
    </main>
  );
}
