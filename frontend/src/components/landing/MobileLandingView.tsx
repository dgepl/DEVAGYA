"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Sparkles, 
  BookOpen, 
  ScanText, 
  Bot, 
  ArrowRight, 
  ShieldCheck, 
  CheckCircle2, 
  ChevronRight, 
  Zap, 
  Activity, 
  FileText, 
  Video, 
  Search, 
  Layers, 
  Brain, 
  Trophy, 
  Flame, 
  Star,
  Smartphone,
  Check,
  Building2,
  Clock,
  Calculator,
  Award,
  Users
} from "lucide-react";

export function MobileLandingView() {
  const [activePreview, setActivePreview] = useState<"ocr" | "generator" | "planner">("ocr");

  const coreFeatures = [
    {
      id: "ocr",
      title: "Vision Book Scanner",
      badge: "AI Vision • OCR",
      desc: "Snap textbook photos or handwritten answer sheets to extract clean text & questions in 3 seconds.",
      icon: ScanText,
      color: "bg-cyan-500",
      accent: "text-cyan-600 bg-cyan-50 border-cyan-200",
      img: "/showcase-ocr.png",
      href: "/login"
    },
    {
      id: "generator",
      title: "AI Question Generator",
      badge: "CBSE / NCERT",
      desc: "Generate 1M, 3M, 5M NCERT periodic assessment papers with step-by-step model answer keys.",
      icon: Zap,
      color: "bg-indigo-600",
      accent: "text-indigo-600 bg-indigo-50 border-indigo-200",
      img: "/showcase-generator.png",
      href: "/login"
    },
    {
      id: "planner",
      title: "5E Lesson Planner",
      badge: "NCERT 5E",
      desc: "Build 5E Framework daily lesson blueprints, learning outcomes & activity timelines.",
      icon: BookOpen,
      color: "bg-purple-600",
      accent: "text-purple-600 bg-purple-50 border-purple-200",
      img: "/showcase-planner.png",
      href: "/login"
    }
  ];

  const aiAgents = [
    { code: "teacher_mentor", name: "Teacher Mentor AI", role: "Teacher", desc: "Pedagogical guidance & CBSE strategy", icon: GraduationCap },
    { code: "question_generator", name: "Question Generator AI", role: "Teacher", desc: "HOTS questions & NCERT blueprints", icon: Sparkles },
    { code: "student_tutor", name: "Socratic AI Tutor", role: "Student", desc: "Step-by-step math & science master", icon: Brain },
    { code: "parent_coach", name: "Parenting Coach AI", role: "Parent", desc: "Screen-time & home routine balance", icon: HeartHandshake }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16 pt-24 relative overflow-hidden font-sans md:hidden">
      
      {/* BACKGROUND DECORATIVE GLOW */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[300px] bg-indigo-100/70 blur-[90px] rounded-full pointer-events-none" />

      {/* 1. HERO HERO BANNER */}
      <div className="px-5 pt-4 text-center space-y-4 relative z-10">
        
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-indigo-100 shadow-xs text-indigo-700 text-[11px] font-extrabold">
          <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
          <span>DEVGYA AI School OS • K-12</span>
        </div>

        <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-tight">
          Smart AI Platform for <br />
          <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            CBSE & NCERT Schools
          </span>
        </h1>

        <p className="text-xs text-slate-600 font-medium leading-relaxed max-w-xs mx-auto">
          Physical school infrastructure, certified science labs, and textbook provider powered by 15 AI Agents.
        </p>

        {/* HERO CTA BUTTONS */}
        <div className="space-y-2.5 pt-2">
          <Link
            href="/login"
            className="w-full py-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white font-extrabold text-xs rounded-2xl shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 uppercase tracking-wider active:scale-95 transition-transform"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Sign In to School Platform</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/register"
            className="w-full py-3.5 bg-white hover:bg-slate-50 text-slate-800 font-extrabold text-xs rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-center gap-2 active:scale-95 transition-transform"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Create Free Account</span>
          </Link>
        </div>

      </div>

      {/* 2. CORE FEATURES CAROUSEL SHOWCASE */}
      <div className="mt-10 px-5 space-y-4 relative z-10">
        
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-500">
            Core AI Suite
          </h2>
          <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
            Tap to preview
          </span>
        </div>

        {/* TAB SELECTOR PILLS */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {coreFeatures.map((f) => (
            <button
              key={f.id}
              onClick={() => setActivePreview(f.id as any)}
              className={`px-3.5 py-2.5 rounded-xl font-extrabold text-xs shrink-0 transition-all border flex items-center gap-1.5 ${
                activePreview === f.id
                  ? "bg-white text-indigo-600 border-indigo-200 shadow-md font-black"
                  : "bg-slate-100 text-slate-600 border-slate-200"
              }`}
            >
              <f.icon className="w-3.5 h-3.5" />
              {f.title}
            </button>
          ))}
        </div>

        {/* ACTIVE FEATURE SHOWCASE CARD (ALL REDIRECT TO /LOGIN) */}
        {coreFeatures.map((f) => {
          if (f.id !== activePreview) return null;
          return (
            <div
              key={f.id}
              className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xl space-y-3.5 animate-in fade-in duration-300"
            >
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${f.accent}`}>
                  {f.badge}
                </span>
                <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Ready
                </span>
              </div>

              <div>
                <h3 className="text-base font-black text-slate-900">{f.title}</h3>
                <p className="text-xs text-slate-600 font-medium leading-relaxed mt-0.5">{f.desc}</p>
              </div>

              <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 aspect-video shadow-inner">
                <img
                  src={f.img}
                  alt={f.title}
                  className="w-full h-full object-cover object-top"
                />
              </div>

              {/* REDIRECT TO LOGIN ON CLICK */}
              <Link
                href="/login"
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-2xl shadow-md flex items-center justify-center gap-2 uppercase tracking-wider active:scale-95 transition-transform"
              >
                <span>Launch {f.title} (Sign In)</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          );
        })}

      </div>

      {/* 3. PHYSICAL SCHOOL INFRASTRUCTURE + AI PILLAR */}
      <div className="mt-8 px-5 relative z-10">
        <div className="p-5 rounded-3xl bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 text-white shadow-xl space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center text-cyan-300 border border-white/20">
            <Building2 className="w-5 h-5" />
          </div>
          <h3 className="text-base font-black">Physical Labs + Digital AI Platform</h3>
          <p className="text-xs text-slate-200 font-medium leading-relaxed">
            DEVGYA GLOBAL supplies physical lab hardware, composite science kits, and NCERT textbooks while automating teacher prep with AI.
          </p>
          <div className="pt-2">
            <Link
              href="/about"
              className="inline-flex items-center gap-1.5 text-xs font-black text-cyan-300 hover:underline"
            >
              <span>Learn About Our Infrastructure</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* 4. 15 SPECIALIZED AI ASSISTANTS GRID */}
      <div className="mt-8 px-5 space-y-3 relative z-10">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-500">
            Specialized AI Agents
          </h2>
          <Link href="/login" className="text-xs font-bold text-indigo-600">
            View All 15 →
          </Link>
        </div>

        <div className="space-y-2">
          {aiAgents.map((ag) => (
            <Link
              key={ag.code}
              href="/login"
              className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center justify-between gap-3 active:scale-95 transition-transform"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-extrabold uppercase tracking-wider bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-100">
                    {ag.role}
                  </span>
                  <h4 className="text-xs font-bold text-slate-900 truncate">{ag.name}</h4>
                </div>
                <p className="text-[10px] text-slate-500 font-medium truncate mt-0.5">{ag.desc}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
            </Link>
          ))}
        </div>
      </div>

      {/* FOOTER CALLOUT */}
      <div className="mt-10 px-5 text-center space-y-3 relative z-10">
        <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-3">
          <h3 className="text-sm font-black text-slate-900">Ready to Upgrade Your School?</h3>
          <p className="text-xs text-slate-500 font-medium">Join schools across India using DEVGYA AI School OS.</p>
          <Link
            href="/register"
            className="w-full py-3.5 bg-indigo-600 text-white font-extrabold text-xs rounded-2xl shadow-md flex items-center justify-center gap-2 uppercase tracking-wider active:scale-95 transition-transform"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Get Started Free</span>
          </Link>
        </div>
      </div>

    </div>
  );
}

// Icon helper imports for agents
import { GraduationCap, HeartHandshake } from "lucide-react";
