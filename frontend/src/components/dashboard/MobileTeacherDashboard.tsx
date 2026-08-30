"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { 
  Zap, 
  Scan,
  Sparkles, 
  Video, 
  FileText, 
  ArrowRight, 
  Download, 
  Plus, 
  GraduationCap,
  TrendingUp,
  Bot,
  Trophy,
  BookOpen,
  Search,
  SlidersHorizontal,
  ChevronRight,
  FolderOpen,
  X,
  FileCheck
} from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { downloadPDF } from "@/lib/api";

export function MobileTeacherDashboard() {
  const { user, savedPapers, setActivePaper, setMobileDrawerOpen } = useAppStore();
  const [searchQuery, setSearchQuery] = useState("");

  const allTools = [
    { name: "AI Assignment Maker", sub: "Homework & Ruled Lines PDF", href: "/dashboard/assignments", icon: FileText, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100", type: "Studio" },
    { name: "Teacher Mentor AI", sub: "Pedagogy & Lesson AI", href: "/dashboard/agents?agent=teacher_mentor", icon: GraduationCap, color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-100", type: "AI Tool" },
    { name: "Question Generator", sub: "NCERT Exam Papers", href: "/dashboard/generator", icon: Sparkles, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100", type: "Generator" },
    { name: "Skill Enhance Practice", sub: "Practice Mock Tests", href: "/dashboard/teacher-olympiad/practice", icon: BookOpen, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100", type: "Practice" },
    { name: "Skill Enhance Program", sub: "Official Certification", href: "/dashboard/teacher-olympiad", icon: Trophy, color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-100", type: "Certification" },
    { name: "Video Consultation", sub: "Live 1-on-1 Mentoring", href: "/dashboard/video-consultation", icon: Video, color: "text-rose-600", bg: "bg-rose-50", border: "border-rose-100", type: "Consultation" },
    { name: "Analytics AI", sub: "Class Score Radar", href: "/dashboard/agents?agent=analytics_assistant", icon: TrendingUp, color: "text-indigo-600", bg: "bg-indigo-50", border: "border-indigo-100", type: "Analytics" },
    { name: "English Coach", sub: "Academic Polish", href: "/dashboard/agents?agent=english_coach", icon: Bot, color: "text-violet-600", bg: "bg-violet-50", border: "border-violet-100", type: "AI Coach" },
  ];

  // Dynamic search matching
  const matchingTools = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    return allTools.filter(t => 
      t.name.toLowerCase().includes(q) || 
      t.sub.toLowerCase().includes(q) || 
      t.type.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const matchingPapers = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    return savedPapers.filter(p => 
      (p.title || "").toLowerCase().includes(q) ||
      (p.subject || "").toLowerCase().includes(q) ||
      (p.class_name || "").toLowerCase().includes(q) ||
      (p.chapter || "").toLowerCase().includes(q)
    );
  }, [searchQuery, savedPapers]);

  const hasSearch = searchQuery.trim().length > 0;
  const totalResults = matchingTools.length + matchingPapers.length;

  return (
    <div className="space-y-5 pb-24 animate-in fade-in duration-300 md:hidden px-1">
      
      {/* 1. HERO BANNER WITH GRADUATION 3D ART & ACTION BUTTONS */}
      <div className="bg-gradient-to-br from-[#1b1c54] via-[#2a1b6d] to-[#12163b] text-white p-5 rounded-[28px] shadow-xl border border-indigo-700/40 relative overflow-hidden space-y-3">
        {/* Decorative background glow */}
        <div className="absolute -top-10 -right-10 w-44 h-44 bg-purple-500/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-44 h-44 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />

        {/* Top Badges */}
        <div className="flex items-center justify-between relative z-10">
          <span className="text-[10px] font-extrabold uppercase tracking-wider bg-white/15 px-3 py-1 rounded-full text-indigo-100 border border-white/10 backdrop-blur-md">
            TEACHER OS HUB
          </span>
          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/20 border border-emerald-400/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            AI Ready
          </span>
        </div>

        {/* Headline & 3D Illustration Row */}
        <div className="flex items-center justify-between gap-2 relative z-10 pt-1">
          <div className="space-y-1 max-w-[62%]">
            <h1 className="text-xl font-black tracking-tight leading-tight">
              Welcome back,<br />
              <span className="text-white font-extrabold">{user?.name || "Educator"}! 👋</span>
            </h1>
            <p className="text-[11px] text-slate-300 font-medium leading-tight">
              CBSE & NCERT AI Automation Hub for Educators
            </p>
          </div>

          {/* 3D Stack Books & Graduation Cap Art */}
          <div className="relative shrink-0 w-24 h-24 flex items-center justify-center">
            <div className="w-20 h-20 bg-gradient-to-tr from-purple-600 to-indigo-500 rounded-3xl rotate-6 shadow-lg flex flex-col items-center justify-center p-2 border border-white/20">
              <GraduationCap className="w-8 h-8 text-amber-300 drop-shadow" />
              <div className="w-10 h-1.5 bg-amber-400 rounded-full mt-1" />
              <div className="w-12 h-1 bg-white/60 rounded-full mt-1" />
            </div>
            {/* Small plant badge */}
            <div className="absolute bottom-0 left-0 bg-emerald-500/90 text-white text-[10px] p-1 rounded-full shadow-md border border-white/40">
              🌱
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 pt-1 relative z-10">
          <Link
            href="/dashboard/generator"
            className="px-4 py-2.5 bg-white text-indigo-900 font-extrabold text-xs rounded-2xl shadow-lg flex items-center gap-2 active:scale-95 transition-all hover:bg-slate-50 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-purple-600 fill-purple-500" />
            <span>Generate Paper</span>
          </Link>
          
          <Link
            href="/dashboard/agents?agent=teacher_mentor"
            className="p-2.5 bg-white/15 hover:bg-white/25 text-white rounded-2xl border border-white/20 transition-all flex items-center justify-center active:scale-95 cursor-pointer"
            title="Teacher Mentor AI"
          >
            <GraduationCap className="w-5 h-5 text-indigo-200" />
          </Link>
        </div>
      </div>

      {/* 2. REAL-TIME SEARCH BAR WITH CLEAR & FILTER BUTTON */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm px-4 py-3 flex items-center justify-between gap-2.5 transition-all focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100">
        <div className="flex items-center gap-2.5 flex-1 text-slate-400 text-xs">
          <Search className="w-4 h-4 text-indigo-600 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tools, papers, syllabus (e.g. Science, Olympiad)..."
            className="w-full bg-transparent outline-none text-slate-900 placeholder:text-slate-400 text-xs font-semibold"
          />
        </div>
        {hasSearch ? (
          <button
            type="button"
            onClick={() => setSearchQuery("")}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        ) : (
          <button 
            type="button" 
            className="p-1.5 text-slate-400 hover:text-slate-700 transition-colors"
            aria-label="Filter"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* 3. DYNAMIC SEARCH RESULTS (WHEN SEARCH QUERY IS ACTIVE) */}
      {hasSearch && (
        <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-black uppercase tracking-wider text-indigo-700">
              Search Results ({totalResults})
            </h2>
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="text-[11px] font-bold text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              Clear
            </button>
          </div>

          {totalResults === 0 ? (
            <div className="p-8 bg-white rounded-3xl border border-slate-200/80 text-center space-y-2">
              <Search className="w-8 h-8 text-slate-300 mx-auto" />
              <h3 className="text-xs font-bold text-slate-700">No matching tools or papers found</h3>
              <p className="text-[11px] text-slate-400">Try searching for "Science", "Olympiad", "Generator", or "Class 10"</p>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Matching Tools */}
              {matchingTools.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider px-1">
                    Matching AI Tools ({matchingTools.length})
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {matchingTools.map((tool, idx) => {
                      const IconComp = tool.icon;
                      return (
                        <Link
                          key={idx}
                          href={tool.href}
                          className="p-3 bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:border-indigo-300 hover:shadow-md transition-all space-y-2"
                        >
                          <div className={`w-9 h-9 rounded-xl ${tool.bg} ${tool.border} border flex items-center justify-center ${tool.color}`}>
                            <IconComp className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="text-xs font-black text-slate-900 leading-tight">{tool.name}</h3>
                            <p className="text-[10px] text-slate-400 font-bold mt-0.5 leading-tight">{tool.sub}</p>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Matching Papers */}
              {matchingPapers.length > 0 && (
                <div className="space-y-2 pt-2">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider px-1">
                    Matching Question Papers ({matchingPapers.length})
                  </span>
                  <div className="space-y-2">
                    {matchingPapers.map((paper: any, idx: number) => (
                      <div
                        key={idx}
                        className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between gap-2"
                      >
                        <div className="space-y-0.5 min-w-0 pr-2">
                          <h3 className="text-xs font-black text-slate-900 truncate">
                            {paper.title || `${paper.subject} Exam`}
                          </h3>
                          <p className="text-[10px] text-slate-400 font-bold">
                            {paper.class_name} • {paper.subject} • {paper.total_marks || 40} Marks
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => downloadPDF(paper, false)}
                          className="p-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors shrink-0"
                          title="Download PDF"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* DEFAULT SECTIONS (WHEN NOT SEARCHING) */}
      {!hasSearch && (
        <>
          {/* TEACHER CORE TOOLS (3-COLUMN EXACT GRID) */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                TEACHER CORE TOOLS
              </h2>
              <button 
                type="button"
                onClick={() => setMobileDrawerOpen(true)} 
                className="text-xs font-extrabold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer active:scale-95 transition-transform"
              >
                <span>View All Tools</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {/* Card 1: Teacher Mentor AI */}
              <Link
                href="/dashboard/agents?agent=teacher_mentor"
                className="p-3 bg-white rounded-2xl border border-slate-100 shadow-xs hover:border-purple-200 hover:shadow-md transition-all flex flex-col justify-between space-y-2 active:scale-95 cursor-pointer"
              >
                <div className="w-9 h-9 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-[11px] font-extrabold text-slate-900 leading-tight">Teacher Mentor AI</h3>
                  <p className="text-[9px] text-slate-400 font-bold mt-0.5 leading-tight">Pedagogy & Lesson AI</p>
                </div>
                <div className="flex justify-end pt-1">
                  <div className="w-5 h-5 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center">
                    <ArrowRight className="w-3 h-3" />
                  </div>
                </div>
              </Link>

              {/* Card 2: Question Generator */}
              <Link
                href="/dashboard/generator"
                className="p-3 bg-white rounded-2xl border border-slate-100 shadow-xs hover:border-amber-200 hover:shadow-md transition-all flex flex-col justify-between space-y-2 active:scale-95 cursor-pointer"
              >
                <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
                  <Sparkles className="w-5 h-5 text-amber-500 fill-amber-400" />
                </div>
                <div>
                  <h3 className="text-[11px] font-extrabold text-slate-900 leading-tight">Question Generator</h3>
                  <p className="text-[9px] text-slate-400 font-bold mt-0.5 leading-tight">NCERT Exam Papers</p>
                </div>
                <div className="flex justify-end pt-1">
                  <div className="w-5 h-5 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center">
                    <ArrowRight className="w-3 h-3" />
                  </div>
                </div>
              </Link>

              {/* Card 3: Skill Enhance Practice */}
              <Link
                href="/dashboard/teacher-olympiad/practice"
                className="p-3 bg-white rounded-2xl border border-slate-100 shadow-xs hover:border-emerald-200 hover:shadow-md transition-all flex flex-col justify-between space-y-2 active:scale-95 cursor-pointer"
              >
                <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-[11px] font-extrabold text-slate-900 leading-tight">Skill Practice</h3>
                  <p className="text-[9px] text-slate-400 font-bold mt-0.5 leading-tight">Mock Quizzes</p>
                </div>
                <div className="flex justify-end pt-1">
                  <div className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <ArrowRight className="w-3 h-3" />
                  </div>
                </div>
              </Link>

              {/* Card 4: Skill Enhance Practice */}
              <Link
                href="/dashboard/teacher-olympiad/practice"
                className="p-3 bg-white rounded-2xl border border-slate-100 shadow-xs hover:border-emerald-200 hover:shadow-md transition-all flex flex-col justify-between space-y-2 active:scale-95 cursor-pointer"
              >
                <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-[11px] font-extrabold text-slate-900 leading-tight">Skill Enhance Practice</h3>
                  <p className="text-[9px] text-slate-400 font-bold mt-0.5 leading-tight">Practice Mock Tests</p>
                </div>
                <div className="flex justify-end pt-1">
                  <div className="w-5 h-5 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center">
                    <ArrowRight className="w-3 h-3" />
                  </div>
                </div>
              </Link>

              {/* Card 5: Skill Enhance Program */}
              <Link
                href="/dashboard/teacher-olympiad"
                className="p-3 bg-white rounded-2xl border border-slate-100 shadow-xs hover:border-orange-200 hover:shadow-md transition-all flex flex-col justify-between space-y-2 active:scale-95 cursor-pointer"
              >
                <div className="w-9 h-9 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-600">
                  <Trophy className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-[11px] font-extrabold text-slate-900 leading-tight">Skill Enhance Program</h3>
                  <p className="text-[9px] text-slate-400 font-bold mt-0.5 leading-tight">Official Certification</p>
                </div>
                <div className="flex justify-end pt-1">
                  <div className="w-5 h-5 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center">
                    <ArrowRight className="w-3 h-3" />
                  </div>
                </div>
              </Link>

              {/* Card 6: Video Consultation */}
              <Link
                href="/dashboard/video-consultation"
                className="p-3 bg-white rounded-2xl border border-slate-100 shadow-xs hover:border-rose-200 hover:shadow-md transition-all flex flex-col justify-between space-y-2 active:scale-95 cursor-pointer"
              >
                <div className="w-9 h-9 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
                  <Video className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-[11px] font-extrabold text-slate-900 leading-tight">Video Consultation</h3>
                  <p className="text-[9px] text-slate-400 font-bold mt-0.5 leading-tight">Live 1-on-1 Mentoring</p>
                </div>
                <div className="flex justify-end pt-1">
                  <div className="w-5 h-5 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center">
                    <ArrowRight className="w-3 h-3" />
                  </div>
                </div>
              </Link>
            </div>
          </div>

          {/* 6. RECENT QUESTION PAPERS SECTION */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                RECENT QUESTION PAPERS ({savedPapers.length})
              </h2>
              <Link 
                href="/dashboard/generator" 
                className="text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-0.5 rounded-full flex items-center gap-1 transition-colors cursor-pointer"
              >
                Generate New +
              </Link>
            </div>

            {savedPapers.length === 0 ? (
              <div className="p-5 bg-white rounded-3xl border border-slate-100 shadow-xs flex items-center gap-4">
                {/* 3D Purple Folder Illustration */}
                <div className="w-16 h-16 rounded-2xl bg-indigo-100/80 border border-indigo-200/80 flex items-center justify-center text-indigo-600 shrink-0 shadow-inner">
                  <FolderOpen className="w-8 h-8 text-indigo-500" />
                </div>
                <div className="space-y-0.5">
                  <h3 className="text-xs font-black text-slate-900">No question papers created yet.</h3>
                  <p className="text-[11px] text-slate-400 font-medium">Generate your first paper to get started.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {savedPapers.slice(0, 4).map((paper: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-3.5 bg-white rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between gap-2 hover:border-indigo-200 transition-all"
                  >
                    <div className="space-y-0.5 min-w-0 pr-2">
                      <h3 className="text-xs font-black text-slate-900 truncate">
                        {paper.title || `${paper.subject} Exam`}
                      </h3>
                      <p className="text-[10px] text-slate-400 font-bold">
                        {paper.class_name} • {paper.subject} • {paper.total_marks || 40} Marks
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => downloadPDF(paper, false)}
                        className="p-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors"
                        title="Download PDF"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

    </div>
  );
}
