"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { 
  Brain, 
  Sparkles, 
  BookOpen, 
  Target, 
  Layers, 
  Video, 
  Clock, 
  Trophy, 
  Flame, 
  Search, 
  ChevronRight, 
  Zap, 
  Compass, 
  MessageSquare, 
  Star, 
  X, 
  ArrowRight,
  GraduationCap,
  ShieldCheck,
  CheckCircle2
} from "lucide-react";
import { useAppStore } from "@/store/useAppStore";

export function MobileStudentDashboard() {
  const { user } = useAppStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const studentTools = [
    { name: "Socratic AI Tutor", sub: "Step-by-Step Concept Master", href: "/dashboard/agents?agent=student_tutor", icon: Brain, color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-100", category: "ai", badge: "Super Agent" },
    { name: "Active Flashcards", sub: "Spaced Repetition & Recall", href: "/dashboard/student/flashcards", icon: Layers, color: "text-indigo-600", bg: "bg-indigo-50", border: "border-indigo-100", category: "practice", badge: "Smart Study" },
    { name: "Board Exam Prep", sub: "CBSE Questions & Strategy", href: "/dashboard/student/exam-prep", icon: Trophy, color: "text-rose-600", bg: "bg-rose-50", border: "border-rose-100", category: "exam", badge: "High Yield" },
    { name: "Quiz & Practice", sub: "Untimed Chapter Mocks", href: "/dashboard/student/practice", icon: Target, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100", category: "practice", badge: "Chapter Tests" },
    { name: "Live Room Call", sub: "Speak 1-on-1 with AI Tutor", href: "/dashboard/video-consultation", icon: Video, color: "text-cyan-600", bg: "bg-cyan-50", border: "border-cyan-100", category: "ai", badge: "Face & Voice" },
    { name: "Pomodoro Timer", sub: "Focus Sessions & Streaks", href: "/dashboard/student/timer", icon: Clock, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100", category: "tools", badge: "Focus" },
    { name: "Study Planner AI", sub: "Personalized Daily Routine", href: "/dashboard/student/planner", icon: Sparkles, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100", category: "tools", badge: "AI Routine" },
    { name: "Notion Smart Notes", sub: "AI Organized Class Notes", href: "/dashboard/student/notes", icon: BookOpen, color: "text-violet-600", bg: "bg-violet-50", border: "border-violet-100", category: "tools", badge: "Smart Notes" },
    { name: "English Coach", sub: "Grammar & Speaking Polish", href: "/dashboard/agents?agent=english_coach", icon: MessageSquare, color: "text-pink-600", bg: "bg-pink-50", border: "border-pink-100", category: "ai", badge: "Language AI" },
    { name: "Career Counselor AI", sub: "Stream & College Pathways", href: "/dashboard/agents?agent=career_counselor", icon: Compass, color: "text-teal-600", bg: "bg-teal-50", border: "border-teal-100", category: "tools", badge: "Guidance" },
  ];

  // Dynamic search matching
  const matchingTools = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    return studentTools.filter(t => 
      t.name.toLowerCase().includes(q) || 
      t.sub.toLowerCase().includes(q) || 
      t.category.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const filteredTools = useMemo(() => {
    if (activeCategory === "all") return studentTools;
    return studentTools.filter(t => t.category === activeCategory);
  }, [activeCategory]);

  const hasSearch = searchQuery.trim().length > 0;

  return (
    <div className="space-y-4 pb-24 animate-in fade-in duration-300 md:hidden px-1">
      
      {/* 1. HERO BANNER WITH GAMIFIED STATS & 3D ART */}
      <div className="bg-gradient-to-br from-[#1d1b54] via-[#2d1b6d] to-[#12163b] text-white p-5 rounded-[28px] shadow-xl border border-indigo-700/40 relative overflow-hidden space-y-3">
        {/* Decorative glow */}
        <div className="absolute -top-10 -right-10 w-44 h-44 bg-purple-500/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-44 h-44 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />

        {/* Top Badges */}
        <div className="flex items-center justify-between relative z-10">
          <span className="text-[10px] font-black uppercase tracking-wider bg-white/15 px-3 py-1 rounded-full text-indigo-100 border border-white/10 backdrop-blur-md">
            STUDENT OS HUB
          </span>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-amber-300 bg-amber-500/20 border border-amber-400/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400 animate-pulse" />
              5 Day Streak 🔥
            </span>
            <span className="text-[10px] font-bold text-cyan-300 bg-cyan-500/20 border border-cyan-400/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <Trophy className="w-3 h-3 text-cyan-300" />
              450 XP
            </span>
          </div>
        </div>

        {/* Headline & 3D Brain Art */}
        <div className="flex items-center justify-between gap-2 relative z-10 pt-1">
          <div className="space-y-1 max-w-[62%]">
            <h1 className="text-xl font-black tracking-tight leading-tight">
              Hey {user?.name?.split(" ")[0] || "Explorer"}! 🚀
            </h1>
            <p className="text-[11px] text-indigo-200 font-medium leading-tight">
              Socratic AI Learning Partner • NCERT CBSE Master
            </p>
          </div>

          {/* 3D Student Brain Badge */}
          <div className="relative shrink-0 w-24 h-24 flex items-center justify-center">
            <div className="w-20 h-20 bg-gradient-to-tr from-purple-600 via-indigo-600 to-pink-500 rounded-3xl rotate-6 shadow-lg flex flex-col items-center justify-center p-2 border border-white/20">
              <Brain className="w-8 h-8 text-amber-300 drop-shadow animate-pulse" />
              <div className="w-10 h-1.5 bg-amber-400 rounded-full mt-1" />
              <div className="w-12 h-1 bg-white/60 rounded-full mt-1" />
            </div>
            <div className="absolute bottom-0 left-0 bg-amber-500 text-white text-[10px] p-1 rounded-full shadow-md border border-white/40">
              ⚡
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 pt-1 relative z-10">
          <Link
            href="/dashboard/agents?agent=student_tutor"
            className="flex-1 py-2.5 bg-white text-indigo-950 font-black text-xs rounded-2xl shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all hover:bg-slate-50 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-purple-600 fill-purple-500" />
            <span>Ask Socratic Tutor AI</span>
          </Link>
          
          <Link
            href="/dashboard/video-consultation"
            className="p-2.5 bg-white/15 hover:bg-white/25 text-white rounded-2xl border border-white/20 transition-all flex items-center justify-center active:scale-95 cursor-pointer"
            title="Live Video Consultation Room"
          >
            <Video className="w-5 h-5 text-indigo-200" />
          </Link>
        </div>
      </div>

      {/* 2. REAL-TIME SEARCH BAR */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs px-4 py-3 flex items-center justify-between gap-2.5 transition-all focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100">
        <div className="flex items-center gap-2.5 flex-1 text-slate-400 text-xs">
          <Search className="w-4 h-4 text-indigo-600 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search study tools, flashcards, exams, math formulas..."
            className="w-full bg-transparent outline-none text-slate-900 placeholder:text-slate-400 text-xs font-semibold"
          />
        </div>
        {hasSearch && (
          <button
            type="button"
            onClick={() => setSearchQuery("")}
            className="w-5 h-5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* 3. SEARCH RESULTS DRAWER (IF SEARCHING) */}
      {hasSearch ? (
        <div className="space-y-3 bg-white rounded-3xl p-4 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-black text-slate-800">
              Search Results ({matchingTools.length})
            </span>
            <button
              onClick={() => setSearchQuery("")}
              className="text-[11px] font-bold text-indigo-600 hover:underline"
            >
              Clear
            </button>
          </div>

          {matchingTools.length === 0 ? (
            <div className="py-8 text-center space-y-1">
              <p className="text-xs font-bold text-slate-700">No matching study tools found.</p>
              <p className="text-[11px] text-slate-400">Try searching "Tutor", "Flashcards", "Exam" or "Math"</p>
            </div>
          ) : (
            <div className="space-y-2">
              {matchingTools.map((t, idx) => (
                <Link
                  key={idx}
                  href={t.href}
                  className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-indigo-50/50 border border-slate-200/80 transition active:scale-98"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl ${t.bg} ${t.color} flex items-center justify-center shrink-0 border ${t.border}`}>
                      <t.icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-900">{t.name}</h4>
                      <p className="text-[10px] text-slate-500 font-medium">{t.sub}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </Link>
              ))}
            </div>
          )}
        </div>
      ) : (
        <>
          {/* 4. CATEGORY PILL FILTER */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs font-bold px-0.5">
            {[
              { id: "all", label: "All Hub (9)" },
              { id: "ai", label: "🧠 AI Tutors (3)" },
              { id: "practice", label: "📚 Flashcards & Quiz (2)" },
              { id: "exam", label: "🏆 Board Exam (1)" },
              { id: "tools", label: "⏱️ Productivity (3)" },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl whitespace-nowrap text-xs font-black transition cursor-pointer ${
                  activeCategory === cat.id
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* 5. PRIMARY STUDY TOOLS GRID */}
          <div className="grid grid-cols-2 gap-2.5">
            {filteredTools.map((t, idx) => (
              <Link
                key={idx}
                href={t.href}
                className="p-3.5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-sm transition-all flex flex-col justify-between space-y-2 group active:scale-98"
              >
                <div className="flex items-start justify-between">
                  <div className={`w-10 h-10 rounded-2xl ${t.bg} ${t.color} flex items-center justify-center shrink-0 border ${t.border} shadow-xs`}>
                    <t.icon className="w-5 h-5" />
                  </div>
                  <span className="text-[9px] font-extrabold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-md">
                    {t.badge}
                  </span>
                </div>

                <div>
                  <h3 className="text-xs font-black text-slate-900 group-hover:text-indigo-600 transition truncate">
                    {t.name}
                  </h3>
                  <p className="text-[10px] text-slate-500 font-medium leading-tight line-clamp-2 mt-0.5">
                    {t.sub}
                  </p>
                </div>
              </Link>
            ))}
          </div>

          {/* 6. QUICK SOCRATIC PROMPT STARTERS */}
          <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-2xs space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <h3 className="text-xs font-black text-slate-900">Instant AI Tutor Queries</h3>
              </div>
              <span className="text-[10px] font-bold text-slate-400">1-Tap Prompts</span>
            </div>

            <div className="flex flex-col gap-1.5 text-xs">
              {[
                "Explain the Quadratic Formula derivation step-by-step",
                "How does Photosynthesis work in C3 and C4 plants?",
                "Give me 3 HOTS questions on Chemical Reactions",
                "Explain Newton's Third Law with everyday examples"
              ].map((query, qIdx) => (
                <Link
                  key={qIdx}
                  href={`/dashboard/agents?agent=student_tutor&prompt=${encodeURIComponent(query)}`}
                  className="p-2.5 rounded-xl bg-indigo-50/60 hover:bg-indigo-100/70 border border-indigo-100/80 text-indigo-950 font-bold flex items-center justify-between transition active:scale-98"
                >
                  <span className="truncate pr-2">{query}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                </Link>
              ))}
            </div>
          </div>
        </>
      )}

    </div>
  );
}
