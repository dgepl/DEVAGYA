"use client";

import { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { WhySchoolsSection } from "@/components/landing/WhySchoolsSection";
import { PageTransition } from "@/components/ui/PageTransition";
import { 
  ShieldCheck, 
  Sparkles, 
  Clock, 
  Zap, 
  CheckCircle2, 
  ArrowRight, 
  Award, 
  BookOpen, 
  Users, 
  TrendingUp, 
  Calculator, 
  GraduationCap 
} from "lucide-react";

export default function WhyChooseUsPage() {
  const [papersPerWeek, setPapersPerWeek] = useState<number>(10);

  // Time calculations: 2.5 hours per traditional paper vs 30 seconds with Devgya
  const hoursSavedPerWeek = Math.round(papersPerWeek * 2.45);
  const hoursSavedPerYear = Math.round(hoursSavedPerWeek * 40);

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
                <span className="uppercase tracking-widest">Why 5,000+ Schools Partner with DEVGYA</span>
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

          {/* INTERACTIVE TIME SAVINGS & ROI CALCULATOR WIDGET */}
          <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="p-8 sm:p-10 rounded-3xl bg-white border border-indigo-200 shadow-xl space-y-8 backdrop-blur-xl">
              
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
                    <Calculator className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900">Interactive Educator Time-Savings Calculator</h3>
                    <p className="text-xs text-slate-500 font-medium">Adjust the slider below to see how many hours your school saves.</p>
                  </div>
                </div>

                <span className="text-[10px] font-extrabold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200 px-3 py-1 rounded-full">
                  Live Calculator
                </span>
              </div>

              {/* SLIDER INPUT */}
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs font-extrabold text-slate-800">
                  <span>Question Papers Prepared Per Week:</span>
                  <span className="text-base font-black text-indigo-600 bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-xl">
                    {papersPerWeek} Papers / Week
                  </span>
                </div>

                <input
                  type="range"
                  min="2"
                  max="50"
                  value={papersPerWeek}
                  onChange={(e) => setPapersPerWeek(Number(e.target.value))}
                  className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>

              {/* RESULTS GRID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-1 text-center">
                  <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Hours Saved Per Week</span>
                  <span className="text-3xl sm:text-4xl font-black text-emerald-600 block">{hoursSavedPerWeek} Hours</span>
                  <span className="text-[11px] text-emerald-700 font-semibold">Reclaimed for classroom teaching</span>
                </div>

                <div className="p-5 rounded-2xl bg-indigo-50/60 border border-indigo-200 space-y-1 text-center">
                  <span className="text-xs font-bold text-indigo-800 uppercase tracking-wider">Hours Saved Per Academic Year</span>
                  <span className="text-3xl sm:text-4xl font-black text-indigo-600 block">{hoursSavedPerYear} Hours</span>
                  <span className="text-[11px] text-indigo-700 font-semibold">Annual productivity boost</span>
                </div>
              </div>

              <div className="text-center pt-2">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-extrabold text-xs rounded-xl shadow-md uppercase tracking-wider transition-all active:scale-95"
                >
                  <span>Start Saving Time Now</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

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
