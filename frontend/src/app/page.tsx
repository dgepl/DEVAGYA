"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/landing/Hero";
import { AboutSection } from "@/components/landing/AboutSection";
import { InteractiveDemoWidget } from "@/components/landing/InteractiveDemoWidget";
import { OCRDemoWidget } from "@/components/landing/OCRDemoWidget";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { WhySchoolsSection } from "@/components/landing/WhySchoolsSection";
import { FAQSection } from "@/components/landing/FAQSection";
import { MobileLandingView } from "@/components/landing/MobileLandingView";
import { PageTransition } from "@/components/ui/PageTransition";

export default function LandingPage() {
  const { user } = useAppStore();
  const router = useRouter();

  // Seamless Persistent Session Auto-Redirect for Returning Users
  useEffect(() => {
    if (user && user.email) {
      if (user.role === "student") router.replace("/dashboard/student");
      else if (user.role === "parent") router.replace("/dashboard/parent");
      else router.replace("/dashboard");
    }
  }, [user, router]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* DEDICATED MOBILE HOMEPAGE ARCHITECTURE */}
      <div className="block md:hidden">
        <MobileLandingView />
      </div>

      {/* DEDICATED DESKTOP HOMEPAGE ARCHITECTURE */}
      <div className="hidden md:block">
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
            <FAQSection />
          </main>
        </PageTransition>
        <Footer />
      </div>
    </div>
  );
}
