"use client";

import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AboutSection } from "@/components/landing/AboutSection";
import { PageTransition } from "@/components/ui/PageTransition";
import { 
  Building2, 
  GraduationCap, 
  BookOpen, 
  ShieldCheck, 
  Sparkles, 
  Award, 
  Users, 
  CheckCircle2, 
  ArrowRight, 
  Globe2, 
  Cpu, 
  TrendingUp, 
  Layers 
} from "lucide-react";

export default function AboutPage() {
  const companyPillars = [
    {
      title: "Physical School Infrastructure",
      desc: "Supplying certified science laboratory equipment, smart classroom hardware, and NCERT-aligned printed textbooks directly to schools.",
      icon: Building2,
      badge: "Infrastructure",
      color: "from-blue-600 to-indigo-600"
    },
    {
      title: "Digital AI Operating System",
      desc: "Proprietary AI engine enabling 5-second NCERT question paper generation, 5E lesson planning, OCR vision scanning, and 15 AI Assistants.",
      icon: Cpu,
      badge: "AI Software",
      color: "from-purple-600 to-pink-600"
    },
    {
      title: "End-to-End Educational Partner",
      desc: "Strategic partner serving Teachers, Students, Parents, and School Management with unified analytics, screen-time balance, and study tools.",
      icon: Users,
      badge: "Stakeholders",
      color: "from-emerald-600 to-teal-600"
    }
  ];

  const milestones = [
    { number: "5,000+", label: "Partner Schools & Institutions" },
    { number: "100,000+", label: "Question Papers Generated" },
    { number: "15", label: "Specialized AI Teaching Agents" },
    { number: "98%", label: "Prep Time Saved for Teachers" }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col pt-24 md:pt-28 selection:bg-indigo-500 selection:text-white">
      <Navbar />
      
      <PageTransition>
        <main className="flex-1 space-y-20 pb-20">
          
          {/* DEDICATED ABOUT HERO BANNER */}
          <section className="relative py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-indigo-50/80 via-white to-slate-50 border-b border-indigo-100 overflow-hidden">
            <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-200/40 blur-[130px] rounded-full pointer-events-none" />
            
            <div className="max-w-5xl mx-auto text-center space-y-6 relative z-10">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-100 border border-indigo-200 text-indigo-800 text-xs font-extrabold shadow-xs">
                <Globe2 className="w-4 h-4 text-indigo-600" />
                <span className="uppercase tracking-widest">DEVGYA GLOBAL EDUTECH PRIVATE LIMITED</span>
              </div>

              <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight text-slate-900">
                Transforming K-12 Schooling with <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
                  Integrated Physical & AI Solutions
                </span>
              </h1>

              <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-3xl mx-auto font-medium">
                At DEVGYA GLOBAL, we believe great education requires harmonizing physical school infrastructure, science laboratories, and curriculum textbooks with state-of-the-art AI technology.
              </p>

              {/* MILESTONES COUNTER ROW */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-8">
                {milestones.map((m, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
                    <span className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 block">
                      {m.number}
                    </span>
                    <span className="text-xs text-slate-600 font-bold block">{m.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* 3 CORE COMPANY PILLARS */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900">Our 3 Core Pillars</h2>
              <p className="text-xs sm:text-sm text-slate-600 font-medium">How DEVGYA GLOBAL serves the entire K-12 educational ecosystem.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {companyPillars.map((p, idx) => {
                const Icon = p.icon;
                return (
                  <div key={idx} className="p-8 rounded-3xl bg-white border border-indigo-200 hover:border-indigo-400 transition-all space-y-4 shadow-md hover:shadow-xl flex flex-col justify-between group">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${p.color} text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <span className="text-[10px] font-extrabold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200 px-2.5 py-1 rounded-full">
                          {p.badge}
                        </span>
                      </div>

                      <h3 className="text-lg font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors">
                        {p.title}
                      </h3>
                      <p className="text-xs text-slate-600 leading-relaxed font-medium">
                        {p.desc}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5 text-xs font-bold text-indigo-600">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Certified School Partner</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* STAKEHOLDER SHOWCASE */}
          <AboutSection />

        </main>
      </PageTransition>

      <Footer />
    </div>
  );
}
