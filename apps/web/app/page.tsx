// app/page.tsx
import { Navbar } from "@/features/landing-page/components/navbar";
import { HeroSection } from "@/features/landing-page/components/hero-section";
import { Footer } from "@/features/landing-page/components/footer";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <HeroSection />
      <Footer />
    </div>
  );
}
