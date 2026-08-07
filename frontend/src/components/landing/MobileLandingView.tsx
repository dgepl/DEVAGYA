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
  Check
} from "lucide-react";

export function MobileLandingView() {
  const [activeTab, setActiveTab] = useState<"generator" | "planner" | "ocr" | "agents">("generator");
  const [selectedAgent, setSelectedAgent] = useState<string>("teacher_mentor");
  const [sheetOpen, setSheetOpen] = useState(false);

  const mobileTools = [
    {
      id: "generator",
      title: "AI Paper Studio",
      badge: "CBSE / NCERT",
      desc: "Generate 1M, 3M, 5M periodic assessment papers with step-by-step marking schemes.",
      icon: Sparkles,
      color: "from-indigo-600 to-purple-600",
      img: "/showcase-generator.png",
      href: "/login"
    },
    {
      id: "planner",
      title: "5E Lesson Planner",
      badge: "NCERT 5E",
      desc: "Build 5E pedagogical Framework unit plans, learning outcomes & activity timelines.",
      icon: BookOpen,
      color: "from-emerald-600 to-teal-600",
      img: "/showcase-planner.png",
      href: "/login"
    },
    {
      id: "ocr",
      title: "OCR Vision Scanner",
      badge: "AI Vision",
      desc: "Snap textbook photos to instantly extract clean formatted text and question items.",
      icon: ScanText,
      color: "from-cyan-600 to-blue-600",
      img: "/showcase-ocr.png",
      href: "/login"
    },
    {
      id: "agents",
      title: "15 AI Teaching Agents",
      badge: "Specialized AI",
      desc: "Role-filtered AI assistants for Teachers, Students & Parents.",
      icon: Bot,
      color: "from-violet-600 to-pink-600",
      img: "/logo.png",
      href: "/login"
    }
  ];

  const agentList = [
    { code: "teacher_mentor", name: "Teacher Mentor AI", role: "Teacher", desc: "Pedagogical guidance & CBSE syllabus strategy" },
    { code: "question_generator", name: "Question Generator AI", role: "Teacher", desc: "HOTS questions & blueprints" },
    { code: "lesson_planner", name: "Lesson Planner AI", role: "Teacher", desc: "5E framework & unit plans" },
    { code: "student_tutor", name: "AI Student Tutor", role: "Student", desc: "Step-by-step math & science problem solver" },
    { code: "exam_strategist", name: "Exam Strategist AI", role: "Student", desc: "Board mark weightage analysis" },
    { code: "parent_coach", name: "Parenting Coach AI", role: "Parent", desc: "Screen-time & study habits balance" }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-28 pt-20 relative overflow-hidden selection:bg-indigo-500 selection:text-white">
      
      {/* MOBILE GLOW BACKGROUND */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-80 h-80 bg-indigo-600/25 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute top-96 right-0 w-64 h-64 bg-cyan-600/20 blur-[90px] rounded-full pointer-events-none" />

      {/* MOBILE HERO HEADER */}
      <div className="px-5 space-y-5 text-center relative z-10 pt-4">
        
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 backdrop-blur-md">
          <Smartphone className="w-3.5 h-3.5 text-cyan-300 animate-pulse" />
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-cyan-200">
            Dedicated Mobile Experience
          </span>
        </div>

        <h1 className="text-3xl font-black tracking-tight leading-tight text-white">
          AI School OS for <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-indigo-300 to-pink-300">
            CBSE & NCERT K-12
          </span>
        </h1>

        <p className="text-xs text-slate-300 font-medium leading-relaxed max-w-xs mx-auto">
          Generate custom question papers in 30 seconds, build 5E lesson plans, scan textbook photos, and consult 15 specialized AI Agents.
        </p>

        {/* PRIMARY CTA BUTTONS */}
        <div className="flex flex-col gap-3 pt-2">
          <Link
            href="/login"
            className="w-full py-4 bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 hover:from-indigo-600 hover:to-pink-600 text-white font-extrabold text-xs rounded-2xl shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 active:scale-95 transition-transform uppercase tracking-wider"
          >
            <Sparkles className="w-4 h-4 text-amber-300 animate-bounce" />
            <span>Launch School Platform</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/register"
            className="w-full py-3.5 bg-white/10 hover:bg-white/15 text-white font-bold text-xs rounded-2xl border border-white/20 backdrop-blur-md flex items-center justify-center gap-2 active:scale-95 transition-transform"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Create Free Educator Account</span>
          </Link>
        </div>

      </div>

      {/* MOBILE INTERACTIVE TOOL CAROUSEL */}
      <div className="mt-10 px-5 space-y-4 relative z-10">
        
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            Interactive Tools Preview
          </h2>
          <span className="text-[10px] font-extrabold text-indigo-300 bg-indigo-500/20 border border-indigo-400/30 px-2 py-0.5 rounded-full">
            Tap to Inspect
          </span>
        </div>

        {/* SWIPEABLE TAB PILLS */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {mobileTools.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs shrink-0 transition-all flex items-center gap-2 border ${
                activeTab === t.id
                  ? "bg-indigo-600 text-white border-indigo-400 shadow-lg shadow-indigo-600/30"
                  : "bg-white/5 text-slate-400 border-white/10 hover:text-white"
              }`}
            >
              <t.icon className="w-3.5 h-3.5" />
              {t.title}
            </button>
          ))}
        </div>

        {/* ACTIVE TOOL CARD PREVIEW */}
        {mobileTools.map((t) => {
          if (t.id !== activeTab) return null;
          return (
            <div
              key={t.id}
              className="p-5 rounded-3xl bg-slate-900/90 border border-indigo-500/30 space-y-4 shadow-2xl backdrop-blur-xl animate-in fade-in duration-300"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-widest bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 px-3 py-1 rounded-full">
                  {t.badge}
                </span>
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Ready for Class
                </span>
              </div>

              <div className="space-y-1">
                <h3 className="text-lg font-black text-white">{t.title}</h3>
                <p className="text-xs text-slate-300 font-medium leading-relaxed">{t.desc}</p>
              </div>

              {/* IMAGE SHOWCASE PREVIEW */}
              <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-slate-950 aspect-video shadow-inner">
                <img
                  src={t.img}
                  alt={t.title}
                  className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-3">
                  <span className="text-[10px] font-extrabold text-cyan-300 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10">
                    Live UI Preview • Real NCERT Engine
                  </span>
                </div>
              </div>

              <Link
                href={t.href}
                className="w-full py-3 bg-white/10 hover:bg-indigo-600 text-white font-extrabold text-xs rounded-xl border border-white/20 transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                <span>Try {t.title} Now</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          );
        })}

      </div>

      {/* MOBILE AI AGENTS MATRIX */}
      <div className="mt-10 px-5 space-y-4 relative z-10">
        
        <div>
          <h2 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
            <Bot className="w-4 h-4 text-purple-400" />
            15 Specialized AI Assistants
          </h2>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            Role-filtered AI helpers for Teachers, Students & Parents.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-2.5">
          {agentList.map((ag) => (
            <Link
              key={ag.code}
              href="/login"
              className="p-3.5 rounded-2xl bg-white/5 hover:bg-indigo-600/20 border border-white/10 hover:border-indigo-500/40 transition-all flex items-center justify-between gap-3 group"
            >
              <div className="space-y-0.5 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-extrabold uppercase tracking-wider bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 px-2 py-0.5 rounded-full">
                    {ag.role}
                  </span>
                  <h4 className="text-xs font-bold text-white group-hover:text-cyan-300 truncate">
                    {ag.name}
                  </h4>
                </div>
                <p className="text-[11px] text-slate-400 font-medium truncate">{ag.desc}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-300 shrink-0 transition-transform group-hover:translate-x-0.5" />
            </Link>
          ))}
        </div>

      </div>

    </div>
  );
}
