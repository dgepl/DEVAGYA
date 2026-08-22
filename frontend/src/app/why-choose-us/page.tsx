"use client";

import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PageTransition } from "@/components/ui/PageTransition";
import { 
  Award, 
  Layers, 
  Cpu, 
  GraduationCap, 
  Building2, 
  HeartHandshake, 
  CheckCircle2, 
  Sparkles, 
  ArrowRight, 
  Zap, 
  ShieldCheck, 
  Bot, 
  Video 
} from "lucide-react";

export default function WhyChooseUsPage() {
  const whyUsPillars = [
    {
      title: "360-Degree Educational Ecosystem",
      description: "We bridge the gap between schools, teachers, and parents with comprehensive tools, books, and training programs under one roof.",
      icon: Layers,
      color: "from-blue-600 to-indigo-600",
      badge: "Unified Ecosystem"
    },
    {
      title: "Smart Technology",
      description: "We provide advanced digital solutions like OCR worksheet generators and AI-powered homework support to make learning and teaching effortless.",
      icon: Cpu,
      color: "from-purple-600 to-pink-600",
      badge: "Digital Solutions"
    },
    {
      title: "Empowering Educators",
      description: "Through skill olympiads and pedagogy resources, we actively help teachers upgrade their classroom efficiency.",
      icon: GraduationCap,
      color: "from-emerald-600 to-teal-600",
      badge: "Teacher Growth"
    },
    {
      title: "Reliable School Support",
      description: "We ensure smooth academic book supplies, CBSE teacher training workshops, and trusted placement support.",
      icon: Building2,
      color: "from-amber-500 to-orange-600",
      badge: "Institutional Reliability"
    },
    {
      title: "Holistic Development",
      description: "We support children and families with interactive quizzes and specialized parenting guides.",
      icon: HeartHandshake,
      color: "from-rose-500 to-pink-600",
      badge: "Family & Child Growth"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col pt-24 md:pt-28 selection:bg-indigo-500 selection:text-white">
      <Navbar />
      
      <PageTransition>
        <main className="flex-1 space-y-16 pb-20">
          
          {/* PROFESSIONALLY ENGAGING HERO BANNER */}
          <section className="relative py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-indigo-50/80 via-white to-slate-50 border-b border-indigo-100/80 overflow-hidden">
            {/* AMBIENT GLOW ORBS */}
            <div className="absolute top-0 left-1/3 w-96 h-96 bg-indigo-200/30 blur-[130px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-purple-200/30 blur-[120px] rounded-full pointer-events-none" />

            <div className="max-w-4xl mx-auto text-center space-y-6 relative z-10">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-100/90 border border-indigo-200 text-indigo-800 text-xs font-extrabold shadow-xs">
                <Award className="w-3.5 h-3.5 text-indigo-600" />
                <span className="uppercase tracking-wider">Why Choose DEVGYA GLOBAL</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight text-slate-900">
                Partner with a Trusted Team <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
                  Modernizing K-12 Education
                </span>
              </h1>

              <p className="text-slate-700 text-base sm:text-lg leading-relaxed max-w-3xl mx-auto font-medium">
                Choosing Devgya Global Edutech Private Limited means partnering with a dedicated team committed to upgrading educational quality, empowering educators, and supporting student development under one unified platform. Here is why schools, teachers, and parents choose us:
              </p>

              {/* AUTHENTIC CORE ADVANTAGE PILLS */}
              <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                {[
                  { text: "360° Educational Ecosystem", icon: Layers },
                  { text: "Smart OCR & AI Tools", icon: Cpu },
                  { text: "Educator Empowerment", icon: GraduationCap },
                  { text: "Reliable School Support", icon: Building2 },
                  { text: "Holistic Student Growth", icon: HeartHandshake },
                ].map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <div key={idx} className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white border border-slate-200/80 shadow-xs text-xs font-bold text-slate-700">
                      <Icon className="w-3.5 h-3.5 text-indigo-600" />
                      <span>{item.text}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* 5 CORE REASONS CARDS */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {whyUsPillars.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div 
                    key={idx} 
                    className="p-8 rounded-3xl bg-white border border-indigo-100 hover:border-indigo-300 transition-all space-y-4 shadow-md hover:shadow-xl flex flex-col justify-between group"
                  >
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${item.color} text-white flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform`}>
                          <Icon className="w-7 h-7" />
                        </div>
                        <span className="text-[10px] font-extrabold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200 px-3 py-1 rounded-full">
                          {item.badge}
                        </span>
                      </div>

                      <h3 className="text-xl font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors">
                        {item.title}
                      </h3>

                      <p className="text-sm text-slate-600 leading-relaxed font-medium">
                        {item.description}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex items-center gap-2 text-xs font-bold text-indigo-600">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Proven Key Advantage</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

        </main>
      </PageTransition>

      <Footer />
    </div>
  );
}

