import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { WhySchoolsSection } from "@/components/landing/WhySchoolsSection";
import { PageTransition } from "@/components/ui/PageTransition";

export default function WhyChooseUsPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col pt-24 md:pt-28">
      <Navbar />
      <PageTransition>
        <main className="flex-1">
          <WhySchoolsSection />
        </main>
      </PageTransition>
      <Footer />
    </div>
  );
}
