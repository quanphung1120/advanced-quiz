// app/page.tsx
import { Navbar } from "@/features/landing-page/components/navbar";
import { HeroSection } from "@/features/landing-page/components/hero-section";
import { FeaturesSection } from "@/features/landing-page/components/features-section";
import { HowItWorksSection } from "@/features/landing-page/components/how-it-works-section";
import { CTASection } from "@/features/landing-page/components/cta-section";
import { Footer } from "@/features/landing-page/components/footer";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <CTASection />
      <Footer />
    </div>
  );
}
