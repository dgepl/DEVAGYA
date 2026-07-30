import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { PageTransition } from "@/components/ui/PageTransition";

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col pt-24 md:pt-28">
      <Navbar />
      <PageTransition>
        <main className="flex-1">
          <FeaturesSection />
        </main>
      </PageTransition>
      <Footer />
    </div>
  );
}
