"use client";

import { useState } from "react";
import { ShieldCheck, BookOpen, Users, Sparkles, CheckCircle2, XCircle, Zap, TrendingUp, Clock, Check } from "lucide-react";

export function WhySchoolsSection() {
  const [activeTab, setActiveTab] = useState<"pillars" | "comparison">("comparison");

  const comparisonData = [
    { feature: "Question Paper Preparation", traditional: "2 to 3 Hours per Paper", devgya: "30 Seconds AI Generation with Solutions" },
    { feature: "NCERT Curriculum Alignment", traditional: "Manual Blueprinting & Errors", devgya: "100% CBSE & NCERT Alignment Guaranteed" },
    { feature: "Lesson Planning Framework", traditional: "Generic Bullet Notes", devgya: "NCERT 5E Pedagogical Model Built-in" },
    { feature: "Textbook & Worksheet Scanning", traditional: "Manual Typing & Formatting", devgya: "OCR Vision AI Camera Scanner" },
    { feature: "Specialized AI Teaching Agents", traditional: "None", devgya: "15 Role-filtered AI Assistants" },
    { feature: "Physical & Digital Synergy", traditional: "Isolated Vendors", devgya: "Integrated Labs, Textbooks & AI Software" }
  ];

  const pillars = [
    {
      title: "360° All-in-One School Partner",
      description: "From printed textbooks and lab equipment to smart boards and digital learning tools—everything under one roof.",
      icon: BookOpen,
      color: "from-blue-500 to-indigo-600"
    },
    {
      title: "Teacher Empowerment",
      description: "Practical digital tools that save 98% preparation time, reduce administrative load, and boost English communication skills.",
      icon: Sparkles,
      color: "from-purple-500 to-pink-600"
    },
    {
      title: "Student & Parent Engagement",
      description: "Specialized modules to manage screen time, guide study habits at home, and make learning intuitive for students.",
      icon: Users,
      color: "from-amber-500 to-orange-600"
    },
    {
      title: "Uncompromised Quality & Security",
      description: "Highest standards in book publications, laboratory safety, and Supabase multi-tenant database isolation.",
      icon: ShieldCheck,
      color: "from-emerald-500 to-teal-600"
    }
  ];

  return (
    <section id="why-devgya" className="py-24 bg-slate-900 text-white relative overflow-hidden selection:bg-indigo-500 selection:text-white">
      
      {/* GLOWING BACKGROUND ORBS */}
      <div className="absolute top-0 right-1/3 w-96 h-96 bg-indigo-600/15 blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-purple-600/15 blur-[130px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 relative z-10">
        
        {/* HEADER */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="text-xs font-extrabold uppercase tracking-widest text-cyan-300 bg-cyan-500/10 border border-cyan-400/30 px-3.5 py-1.5 rounded-full">
            Strategic Educational Partner
          </span>
          
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            WHY 5,000+ SCHOOLS CHOOSE <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-indigo-200 to-pink-300">
              DEVGYA GLOBAL
            </span>
          </h2>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed font-medium">
            Rather than acting merely as an equipment vendor, we serve as an end-to-end strategic educational partner for schools and study centers.
          </p>

          {/* TAB SWITCHER */}
          <div className="flex items-center justify-center gap-3 pt-4">
            <button
              onClick={() => setActiveTab("comparison")}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all border ${
                activeTab === "comparison"
                  ? "bg-indigo-600 text-white border-indigo-400 shadow-lg shadow-indigo-600/30"
                  : "bg-white/5 text-slate-400 border-white/10 hover:text-white"
              }`}
            >
              Traditional vs DEVGYA Comparison
            </button>
            <button
              onClick={() => setActiveTab("pillars")}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all border ${
                activeTab === "pillars"
                  ? "bg-indigo-600 text-white border-indigo-400 shadow-lg shadow-indigo-600/30"
                  : "bg-white/5 text-slate-400 border-white/10 hover:text-white"
              }`}
            >
              4 Core Strategic Pillars
            </button>
          </div>
        </div>

        {/* TAB 1: COMPARISON TABLE */}
        {activeTab === "comparison" && (
          <div className="bg-slate-950/90 border border-indigo-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4 animate-in fade-in duration-300">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-400" />
                Head-to-Head Capability Comparison
              </h3>
              <span className="text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-3 py-1 rounded-full">
                98% Time Saved
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-xs font-black uppercase text-slate-400">
                    <th className="py-3.5 px-4">School Capability</th>
                    <th className="py-3.5 px-4 text-slate-500">Traditional Approach</th>
                    <th className="py-3.5 px-4 text-cyan-300">DEVGYA AI Platform</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-xs font-semibold">
                  {comparisonData.map((row, idx) => (
                    <tr key={idx} className="hover:bg-white/5 transition-colors">
                      <td className="py-4 px-4 font-extrabold text-white">{row.feature}</td>
                      <td className="py-4 px-4 text-slate-400 flex items-center gap-2">
                        <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                        <span>{row.traditional}</span>
                      </td>
                      <td className="py-4 px-4 text-emerald-300 font-bold">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span>{row.devgya}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: 4 STRATEGIC PILLARS */}
        {activeTab === "pillars" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-300">
            {pillars.map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className="p-8 rounded-3xl bg-slate-950/90 border border-indigo-500/30 shadow-2xl space-y-4 hover:border-indigo-400/60 transition-all group">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${item.color} text-white flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-extrabold text-white group-hover:text-cyan-300 transition-colors">{item.title}</h3>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed font-medium">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </section>
  );
}
