"use client";

import { useState } from "react";
import { 
  Building2, 
  GraduationCap, 
  BookOpen, 
  Users, 
  HeartHandshake, 
  CheckCircle2, 
  Sparkles, 
  ShieldCheck, 
  ArrowRight, 
  Award, 
  Cpu, 
  Layers 
} from "lucide-react";

export function AboutSection() {
  const [activeStakeholder, setActiveStakeholder] = useState<number>(0);

  const stakeholders = [
    {
      title: "Teachers & Educators",
      subtitle: "Save 98% Prep Time with AI Studios",
      icon: GraduationCap,
      color: "from-indigo-500 to-purple-600",
      accent: "border-indigo-200 bg-indigo-50/60 text-indigo-900",
      desc: "Instantly create 1M, 3M, 5M NCERT periodic assessment papers, 5E framework lesson plans, and scan textbook photos with OCR Vision AI.",
      highlights: ["5-Second Question Paper Generator", "NCERT 5E Lesson Planner", "OCR Book Scanner", "Step-by-Step Answer Keys"]
    },
    {
      title: "School Management & Study Centers",
      subtitle: "Academic Quality & Infrastructure Partner",
      icon: Building2,
      color: "from-purple-500 to-pink-600",
      accent: "border-purple-200 bg-purple-50/60 text-purple-900",
      desc: "Comprehensive school solutions combining physical science laboratories, smart hardware, curriculum textbooks, and digital AI tracking.",
      highlights: ["Certified Science Lab Hardware", "Academic Progress Analytics", "Multi-Tenant Supabase Isolation", "CBSE / ICSE Compliance"]
    },
    {
      title: "Students & Self-Study Corner",
      subtitle: "Socratic AI Tutor & Gamified XP",
      icon: Sparkles,
      color: "from-amber-500 to-orange-600",
      accent: "border-amber-200 bg-amber-50/60 text-amber-900",
      desc: "Duolingo-style XP streaks, active recall flashcards, practice quizzes, and Socratic AI hints that guide without spoiling answers.",
      highlights: ["Socratic AI Problem Solver", "Duolingo-style XP Streaks", "Active Recall Flashcards", "Board Mark Weightage Strategy"]
    },
    {
      title: "Parents & Families",
      subtitle: "Parenting Guidance & Balanced Screen Time",
      icon: HeartHandshake,
      color: "from-rose-500 to-pink-600",
      accent: "border-rose-200 bg-rose-50/60 text-rose-900",
      desc: "Practical parenting coach guidance, real-time subject progress alerts, and screen-time management connecting home learning with school.",
      highlights: ["AI Parenting Coach Assistant", "Real-Time Subject Mastery Charts", "Balanced Screen-Time Controls", "Holistic Child Development"]
    }
  ];

  return (
    <section id="about" className="py-24 bg-gradient-to-b from-[#09071B] via-slate-900 to-slate-950 text-white relative overflow-hidden selection:bg-indigo-500 selection:text-white">
      
      {/* GLOWING AMBIENT BACKGROUND */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-purple-600/15 blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-600/15 blur-[140px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 relative z-10">
        
        {/* HEADER */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-400/30 text-indigo-300 text-xs font-extrabold backdrop-blur-md">
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <span className="uppercase tracking-widest">About DEVGYA GLOBAL</span>
          </div>
          
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Bridging Physical Schooling with <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-indigo-200 to-pink-300">
              Cutting-Edge AI Technology
            </span>
          </h2>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed font-medium">
            DEVGYA GLOBAL EDUTECH PRIVATE LIMITED is an all-in-one education partner for K-12 CBSE & NCERT schools. We combine physical textbooks, lab hardware, and digital AI Operating Systems.
          </p>
        </div>

        {/* 3D INTERACTIVE STAKEHOLDER SHOWCASE */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* LEFT SELECTOR LIST */}
          <div className="lg:col-span-5 space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
              Select Stakeholder Role
            </p>
            {stakeholders.map((sh, idx) => {
              const Icon = sh.icon;
              const isSelected = activeStakeholder === idx;
              return (
                <button
                  key={idx}
                  onClick={() => setActiveStakeholder(idx)}
                  className={`w-full p-4 rounded-2xl border text-left transition-all flex items-center justify-between gap-4 group ${
                    isSelected
                      ? "bg-white/10 border-indigo-400 shadow-xl shadow-indigo-600/20 scale-[1.02]"
                      : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 text-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${sh.color} text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-white group-hover:text-cyan-300 transition-colors">
                        {sh.title}
                      </h4>
                      <p className="text-[11px] text-slate-400 font-medium truncate max-w-[200px]">
                        {sh.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    isSelected ? "bg-indigo-500 text-white" : "bg-white/10 text-slate-400"
                  }`}>
                    {idx + 1}
                  </div>
                </button>
              );
            })}
          </div>

          {/* RIGHT DETAILED STAKEHOLDER CARD */}
          <div className="lg:col-span-7">
            {stakeholders.map((sh, idx) => {
              if (idx !== activeStakeholder) return null;
              const Icon = sh.icon;
              return (
                <div
                  key={idx}
                  className="p-8 sm:p-10 rounded-3xl bg-slate-900/90 border border-indigo-500/30 space-y-6 shadow-2xl backdrop-blur-xl animate-in fade-in duration-300"
                >
                  <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${sh.color} text-white flex items-center justify-center shadow-lg`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-xl font-black text-white">{sh.title}</h3>
                        <p className="text-xs text-indigo-300 font-bold">{sh.subtitle}</p>
                      </div>
                    </div>

                    <span className="text-[10px] font-extrabold uppercase tracking-wider bg-indigo-500/20 text-indigo-200 border border-indigo-400/30 px-3 py-1 rounded-full">
                      Role Solutions
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-200 font-medium leading-relaxed">
                    {sh.desc}
                  </p>

                  <div className="space-y-3 pt-2">
                    <h5 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Key Platform Highlights</h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {sh.highlights.map((h, hIdx) => (
                        <div key={hIdx} className="flex items-center gap-2 p-2.5 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold text-slate-200">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span>{h}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              );
            })}
          </div>

        </div>

      </div>
    </section>
  );
}
