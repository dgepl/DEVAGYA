"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/landing/Hero";
import { AboutSection } from "@/components/landing/AboutSection";
import { InteractiveDemoWidget } from "@/components/landing/InteractiveDemoWidget";
import { OCRDemoWidget } from "@/components/landing/OCRDemoWidget";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { WhySchoolsSection } from "@/components/landing/WhySchoolsSection";
import { PricingSection } from "@/components/landing/PricingSection";
import { FAQSection } from "@/components/landing/FAQSection";
import { PageTransition } from "@/components/ui/PageTransition";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-indigo-500 selection:text-white">
      <Navbar />
      <PageTransition>
        <main className="flex-1">
          <Hero />
          <AboutSection />
          <InteractiveDemoWidget />
          <OCRDemoWidget />
          <FeaturesSection />
          <HowItWorks />
          <WhySchoolsSection />
          <PricingSection />
          <FAQSection />
        </main>
      </PageTransition>
      <Footer />
    </div>
  );
}
