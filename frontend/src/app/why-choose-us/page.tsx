"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { WhySchoolsSection } from "@/components/landing/WhySchoolsSection";
import { PageTransition } from "@/components/ui/PageTransition";
import { Award } from "lucide-react";

export default function WhyChooseUsPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col pt-24 md:pt-28 selection:bg-indigo-500 selection:text-white">
      <Navbar />
      
      <PageTransition>
        <main className="flex-1 space-y-20 pb-20">
          
          {/* DEDICATED HERO BANNER FOR WHY CHOOSE US */}
          <section className="relative py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-indigo-50/80 via-white to-slate-50 border-b border-indigo-100 overflow-hidden">
            <div className="absolute top-0 left-1/3 w-96 h-96 bg-indigo-200/40 blur-[130px] rounded-full pointer-events-none" />
            
            <div className="max-w-5xl mx-auto text-center space-y-6 relative z-10">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-100 border border-indigo-200 text-indigo-800 text-xs font-extrabold shadow-xs">
                <Award className="w-4 h-4 text-amber-500" />
                <span className="uppercase tracking-widest">Why Schools Partner with DEVGYA</span>
              </div>

              <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight text-slate-900">
                Unmatched Accuracy, Speed & <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
                  CBSE / NCERT Compliance
                </span>
              </h1>

              <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-3xl mx-auto font-medium">
                Traditional exam preparation takes hours of manual blueprinting. DEVGYA GLOBAL automates question generation, lesson planning, and book scanning while maintaining bank-grade database security.
              </p>
            </div>
          </section>

          {/* HEAD-TO-HEAD COMPARISON & PILLARS */}
          <WhySchoolsSection />

        </main>
      </PageTransition>

      <Footer />
    </div>
  );
}
