import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AboutSection } from "@/components/landing/AboutSection";
import { PageTransition } from "@/components/ui/PageTransition";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col pt-24 md:pt-28">
      <Navbar />
      <PageTransition>
        <main className="flex-1">
          <AboutSection />
        </main>
      </PageTransition>
      <Footer />
    </div>
  );
}
