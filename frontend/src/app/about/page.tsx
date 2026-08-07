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
      color: "from-blue-500 to-indigo-600"
    },
    {
      title: "Digital AI Operating System",
      desc: "Proprietary AI engine enabling 5-second NCERT question paper generation, 5E lesson planning, OCR vision scanning, and 15 AI Assistants.",
      icon: Cpu,
      badge: "AI Software",
      color: "from-purple-500 to-pink-600"
    },
    {
      title: "End-to-End Educational Partner",
      desc: "Strategic partner serving Teachers, Students, Parents, and School Management with unified analytics, screen-time balance, and study tools.",
      icon: Users,
      badge: "Stakeholders",
      color: "from-emerald-500 to-teal-600"
    }
  ];

  const milestones = [
    { number: "5,000+", label: "Partner Schools & Institutions" },
    { number: "100,000+", label: "Question Papers Generated" },
    { number: "15", label: "Specialized AI Teaching Agents" },
    { number: "98%", label: "Prep Time Saved for Teachers" }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col pt-24 md:pt-28 selection:bg-indigo-500 selection:text-white">
      <Navbar />
      
      <PageTransition>
        <main className="flex-1 space-y-20 pb-20">
          
          {/* DEDICATED ABOUT HERO BANNER */}
          <section className="relative py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#09071B] via-slate-900 to-[#09071B] border-b border-purple-900/30 overflow-hidden">
            <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-600/20 blur-[140px] rounded-full pointer-events-none" />
            
            <div className="max-w-5xl mx-auto text-center space-y-6 relative z-10">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-extrabold backdrop-blur-md">
                <Globe2 className="w-4 h-4 text-cyan-300 animate-spin" />
                <span className="uppercase tracking-widest">DEVGYA GLOBAL EDUTECH PRIVATE LIMITED</span>
              </div>

              <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight text-white">
                Transforming K-12 Schooling with <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-indigo-200 to-pink-400">
                  Integrated Physical & AI Solutions
                </span>
              </h1>

              <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-3xl mx-auto font-medium">
                At DEVGYA GLOBAL, we believe great education requires harmonizing physical school infrastructure, science laboratories, and curriculum textbooks with state-of-the-art AI technology.
              </p>

              {/* MILESTONES COUNTER ROW */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-8">
                {milestones.map((m, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                    <span className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-indigo-300 block">
                      {m.number}
                    </span>
                    <span className="text-xs text-slate-400 font-semibold block">{m.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* 3 CORE COMPANY PILLARS */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white">Our 3 Core Pillars</h2>
              <p className="text-xs sm:text-sm text-slate-400 font-medium">How DEVGYA GLOBAL serves the entire K-12 educational ecosystem.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {companyPillars.map((p, idx) => {
                const Icon = p.icon;
                return (
                  <div key={idx} className="p-8 rounded-3xl bg-slate-900/90 border border-indigo-500/20 hover:border-indigo-500/50 transition-all space-y-4 shadow-2xl flex flex-col justify-between group">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${p.color} text-white flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <span className="text-[10px] font-extrabold uppercase tracking-wider bg-white/10 text-indigo-300 border border-white/10 px-2.5 py-1 rounded-full">
                          {p.badge}
                        </span>
                      </div>

                      <h3 className="text-lg font-extrabold text-white group-hover:text-cyan-300 transition-colors">
                        {p.title}
                      </h3>
                      <p className="text-xs text-slate-300 leading-relaxed font-medium">
                        {p.desc}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-white/10 flex items-center gap-1.5 text-xs font-bold text-indigo-400">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
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
