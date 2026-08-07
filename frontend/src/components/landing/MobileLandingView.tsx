"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  const router = useRouter();

  // Low-Scroll Segmented Tab State
  const [sectionTab, setSectionTab] = useState<"overview" | "about" | "features">("overview");

  // Tool preview tab state
  const [activeTool, setActiveTool] = useState<"generator" | "planner" | "ocr" | "agents">("ocr");

  // Interactive ROI Calculator State
  const [teachersCount, setTeachersCount] = useState(25);
  const hoursSavedPerTeacher = 4.5;
  const totalWeeklyHoursSaved = teachersCount * hoursSavedPerTeacher;
  const annualSavingsINR = teachersCount * 85000;

  const mobileTools = [
    {
      id: "ocr",
      title: "Vision Book Scanner",
      badge: "AI Vision • OCR",
      desc: "Snap textbook photos or handwritten answer sheets to extract clean text & questions instantly.",
      icon: ScanText,
      color: "from-cyan-600 to-blue-600",
      img: "/showcase-ocr.png",
    },
    {
      id: "generator",
      title: "AI Paper Studio",
      badge: "CBSE / NCERT",
      desc: "Generate 1M, 3M, 5M periodic assessment papers with step-by-step NCERT marking schemes.",
      icon: Sparkles,
      color: "from-indigo-600 to-purple-600",
      img: "/showcase-generator.png",
    },
    {
      id: "planner",
      title: "5E Lesson Planner",
      badge: "NCERT 5E",
      desc: "Build 5E pedagogical Framework unit plans, learning outcomes & activity timelines.",
      icon: BookOpen,
      color: "from-emerald-600 to-teal-600",
      img: "/showcase-planner.png",
    },
    {
      id: "agents",
      title: "15 AI Teaching Agents",
      badge: "Specialized AI",
      desc: "Role-filtered AI assistants for Teachers, Students & Parents.",
      icon: Bot,
      color: "from-violet-600 to-pink-600",
      img: "/logo.png",
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
    <div className="min-h-screen bg-slate-950 text-white pb-12 pt-20 relative overflow-hidden selection:bg-indigo-500 selection:text-white md:hidden">
      
      {/* GLOW BACKGROUND */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-80 h-80 bg-indigo-600/25 blur-[100px] rounded-full pointer-events-none" />

      {/* COMPACT APP HEADER BANNER */}
      <div className="px-4 text-center space-y-3 pt-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/15 backdrop-blur-md">
          <Smartphone className="w-3.5 h-3.5 text-cyan-300 animate-pulse" />
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-cyan-200">
            Dedicated Mobile App UI
          </span>
        </div>

        <h1 className="text-2xl font-black tracking-tight text-white leading-tight">
          DEVGYA GLOBAL <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-indigo-300 to-pink-300">
            AI School OS • K-12
          </span>
        </h1>

        {/* TOP SEGMENTED TAB SWITCHER FOR LOW-SCROLL NAVIGATION */}
        <div className="grid grid-cols-3 gap-1 p-1 bg-slate-900/90 rounded-2xl border border-slate-800 backdrop-blur-xl shadow-lg mt-2">
          <button
            onClick={() => setSectionTab("overview")}
            className={`py-2 text-[11px] font-extrabold rounded-xl transition-all ${
              sectionTab === "overview"
                ? "bg-indigo-600 text-white shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            ⚡ AI Tools
          </button>
          <button
            onClick={() => setSectionTab("about")}
            className={`py-2 text-[11px] font-extrabold rounded-xl transition-all ${
              sectionTab === "about"
                ? "bg-indigo-600 text-white shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            🏫 About Us
          </button>
          <button
            onClick={() => setSectionTab("features")}
            className={`py-2 text-[11px] font-extrabold rounded-xl transition-all ${
              sectionTab === "features"
                ? "bg-indigo-600 text-white shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            🚀 Features & ROI
          </button>
        </div>
      </div>

      {/* SECTION 1: OVERVIEW & AI TOOLS TAB */}
      {sectionTab === "overview" && (
        <div className="px-4 mt-6 space-y-6 animate-in fade-in duration-300">
          
          {/* PRIMARY CALL TO ACTION */}
          <div className="p-4 rounded-3xl bg-gradient-to-r from-indigo-900 via-purple-900 to-slate-900 border border-indigo-500/30 space-y-3 shadow-xl">
            <p className="text-xs text-indigo-100 font-medium leading-relaxed">
              Combine physical school infrastructure with automated NCERT Question Paper Generation, Vision Book Scanning, and 15 AI Teaching Agents.
            </p>
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="flex-1 py-3 bg-gradient-to-r from-indigo-500 to-pink-500 text-white font-extrabold text-xs rounded-xl text-center shadow-md flex items-center justify-center gap-1.5 uppercase tracking-wider active:scale-95"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Launch App</span>
              </Link>
              <Link
                href="/login"
                className="px-4 py-3 bg-white/10 text-white font-bold text-xs rounded-xl border border-white/20 active:scale-95"
              >
                Sign In
              </Link>
            </div>
          </div>

          {/* INTERACTIVE TOOL PREVIEW SELECTOR */}
          <div className="space-y-3">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-400">
              Interactive Tools Preview
            </h2>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {mobileTools.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActiveTool(t.id as any)}
                  className={`px-3 py-2 rounded-xl font-extrabold text-[11px] shrink-0 transition-all border flex items-center gap-1.5 ${
                    activeTool === t.id
                      ? "bg-indigo-600 text-white border-indigo-400 shadow-md"
                      : "bg-white/5 text-slate-400 border-white/10"
                  }`}
                >
                  <t.icon className="w-3.5 h-3.5" />
                  {t.title}
                </button>
              ))}
            </div>

            {/* ACTIVE TOOL CARD PREVIEW WITH VISION BOOK SCANNER LOGIN REDIRECT */}
            {mobileTools.map((t) => {
              if (t.id !== activeTool) return null;
              return (
                <div
                  key={t.id}
                  className="p-5 rounded-3xl bg-slate-900 border border-indigo-500/30 space-y-3 shadow-xl"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-widest bg-indigo-500/20 text-indigo-200 border border-indigo-400/30 px-2.5 py-0.5 rounded-full">
                      {t.badge}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Ready
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-black text-white">{t.title}</h3>
                    <p className="text-xs text-slate-300 font-medium leading-relaxed mt-0.5">{t.desc}</p>
                  </div>

                  <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-slate-950 aspect-video">
                    <img
                      src={t.img}
                      alt={t.title}
                      className="w-full h-full object-cover object-top"
                    />
                  </div>

                  {/* ALL CLICK ACTION BUTTONS REDIRECT DIRECTLY TO LOGIN PAGE */}
                  <Link
                    href="/login"
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-transform uppercase tracking-wider"
                  >
                    <span>Use {t.title} (Sign In)</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              );
            })}
          </div>

          {/* 15 AI AGENTS LIST */}
          <div className="space-y-2">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-400">
              15 AI Assistants
            </h2>

            <div className="space-y-2">
              {agentList.map((ag) => (
                <Link
                  key={ag.code}
                  href="/login"
                  className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between gap-2 active:scale-95 transition-transform"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-black uppercase tracking-wider bg-indigo-500/20 text-indigo-200 px-2 py-0.5 rounded-full">
                        {ag.role}
                      </span>
                      <h4 className="text-xs font-bold text-white truncate">{ag.name}</h4>
                    </div>
                    <p className="text-[10px] text-slate-400 truncate mt-0.5">{ag.desc}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500 shrink-0" />
                </Link>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* SECTION 2: ABOUT US & INFRASTRUCTURE TAB */}
      {sectionTab === "about" && (
        <div className="px-4 mt-6 space-y-5 animate-in fade-in duration-300">
          
          <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/30 border border-indigo-400/40 text-indigo-300 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <h2 className="text-base font-black text-white">Physical School Infrastructure + Digital AI</h2>
            <p className="text-xs text-slate-300 font-medium leading-relaxed">
              At DEVGYA GLOBAL EDUTECH PRIVATE LIMITED, we don't just sell software. We manufacture certified composite science lab hardware, deliver NCERT aligned textbooks, and equip K-12 schools with full digital AI classrooms.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
              <span className="text-lg font-black text-cyan-300">100%</span>
              <h3 className="text-xs font-bold text-white">CBSE & ICSE Mapped</h3>
              <p className="text-[10px] text-slate-400">Strictly mapped to NCERT guidelines</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
              <span className="text-lg font-black text-pink-300">4.5 Hrs</span>
              <h3 className="text-xs font-bold text-white">Weekly Time Saved</h3>
              <p className="text-[10px] text-slate-400">Automated paper creation & grading</p>
            </div>
          </div>

          <Link
            href="/about"
            className="w-full py-3.5 bg-indigo-600 text-white font-extrabold text-xs rounded-2xl text-center flex items-center justify-center gap-2 uppercase tracking-wider shadow-lg active:scale-95"
          >
            <span>Read Full About Us Page</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

        </div>
      )}

      {/* SECTION 3: FEATURES & ROI CALCULATOR TAB */}
      {sectionTab === "features" && (
        <div className="px-4 mt-6 space-y-5 animate-in fade-in duration-300">
          
          {/* INTERACTIVE TIME SAVINGS WIDGET */}
          <div className="p-5 rounded-3xl bg-gradient-to-br from-slate-900 to-indigo-950 border border-indigo-500/30 space-y-4 shadow-xl">
            <div className="flex items-center gap-2 text-xs font-black uppercase text-amber-300">
              <Calculator className="w-4 h-4" />
              <span>School Time & Cost Savings Widget</span>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-200 flex justify-between">
                <span>Number of School Teachers:</span>
                <span className="text-indigo-300 font-extrabold">{teachersCount} Teachers</span>
              </label>
              <input
                type="range"
                min={5}
                max={150}
                step={5}
                value={teachersCount}
                onChange={(e) => setTeachersCount(Number(e.target.value))}
                className="w-full accent-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10 text-center">
              <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
                <span className="text-sm font-black text-emerald-400">{totalWeeklyHoursSaved} Hrs/wk</span>
                <p className="text-[9px] text-slate-300 font-semibold mt-0.5">Faculty Hours Saved</p>
              </div>
              <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
                <span className="text-sm font-black text-amber-300">₹{(annualSavingsINR / 100000).toFixed(1)} Lakhs</span>
                <p className="text-[9px] text-slate-300 font-semibold mt-0.5">Annual Time Savings Value</p>
              </div>
            </div>
          </div>

          <Link
            href="/why-choose-us"
            className="w-full py-3.5 bg-indigo-600 text-white font-extrabold text-xs rounded-2xl text-center flex items-center justify-center gap-2 uppercase tracking-wider shadow-lg active:scale-95"
          >
            <span>View Full Why Choose Us Page</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

        </div>
      )}

    </div>
  );
}
