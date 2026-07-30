import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { InteractiveDemoWidget } from "@/components/landing/InteractiveDemoWidget";
import { OCRDemoWidget } from "@/components/landing/OCRDemoWidget";
import { PageTransition } from "@/components/ui/PageTransition";

export default function AIPlatformPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col pt-24 md:pt-28">
      <Navbar />
      <PageTransition>
        <main className="flex-1 space-y-12">
          <InteractiveDemoWidget />
          <OCRDemoWidget />
        </main>
      </PageTransition>
      <Footer />
    </div>
  );
}
