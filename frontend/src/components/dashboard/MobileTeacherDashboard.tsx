"use client";

import Link from "next/link";
import { 
  Zap, 
  ScanText, 
  Sparkles, 
  Video, 
  FileText, 
  ArrowRight, 
  Download, 
  Plus, 
  GraduationCap,
  Activity,
  Layers,
  Trophy,
  BookOpen
} from "lucide-react";
import { useAppStore } from "@/store/useAppStore";

export function MobileTeacherDashboard() {
  const { user, savedPapers } = useAppStore();

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-300 md:hidden">
      
      {/* MOBILE APP HERO BANNER */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-950 text-white p-6 rounded-3xl shadow-xl border border-indigo-700/50 relative overflow-hidden space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black uppercase tracking-widest bg-white/15 px-3 py-1 rounded-full text-indigo-100 border border-white/10 backdrop-blur-md">
            Teacher OS Hub
          </span>
          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-400/10 px-2.5 py-0.5 rounded-full border border-emerald-400/20">
            ● AI Ready
          </span>
        </div>

        <div>
          <h1 className="text-xl font-black tracking-tight leading-snug">
            Welcome, {user?.name || "Teacher"}! 👋
          </h1>
          <p className="text-xs text-indigo-200 font-medium mt-1">
            CBSE & NCERT AI Automation Hub for Educators
          </p>
        </div>

        <div className="flex items-center gap-2 pt-2 border-t border-white/10">
          <Link
            href="/dashboard/generator"
            className="flex-1 py-3 bg-white text-indigo-950 font-black text-xs rounded-2xl text-center shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-transform uppercase tracking-wider"
          >
            <Sparkles className="w-4 h-4 text-amber-500 fill-amber-400" />
            <span>Generate Paper</span>
          </Link>
          
          <Link
            href="/dashboard/agents?agent=teacher_mentor"
            className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-2xl border border-white/20 transition-colors flex items-center justify-center"
            title="Teacher Mentor AI"
          >
            <GraduationCap className="w-5 h-5 text-amber-300" />
          </Link>
        </div>
      </div>

      {/* QUICK LAUNCH SPEED-DIAL GRID - 6 MATCHING SIDEBAR TOOLS */}
      <div className="space-y-3">
        <h2 className="text-xs font-black uppercase tracking-wider text-slate-500 px-1">
          Teacher Core Tools
        </h2>

        <div className="grid grid-cols-2 gap-3">
          <Link
            href="/dashboard/agents?agent=teacher_mentor"
            className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-indigo-300 hover:shadow-md transition-all space-y-2 group"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 group-hover:scale-105 transition-transform">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-extrabold text-slate-900">Teacher Mentor AI</h3>
              <p className="text-[10px] text-slate-400 font-bold mt-0.5">Pedagogy & Lesson AI</p>
            </div>
          </Link>

          <Link
            href="/dashboard/generator"
            className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-amber-300 hover:shadow-md transition-all space-y-2 group"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 text-amber-500 fill-amber-400" />
            </div>
            <div>
              <h3 className="text-xs font-extrabold text-slate-900">Question Generator</h3>
              <p className="text-[10px] text-slate-400 font-bold mt-0.5">NCERT Exam Papers</p>
            </div>
          </Link>

          <Link
            href="/dashboard/ocr"
            className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-cyan-300 hover:shadow-md transition-all space-y-2 group"
          >
            <div className="w-10 h-10 rounded-xl bg-cyan-50 border border-cyan-100 flex items-center justify-center text-cyan-600 group-hover:scale-105 transition-transform">
              <ScanText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-extrabold text-slate-900">OCR Scanner</h3>
              <p className="text-[10px] text-slate-400 font-bold mt-0.5">Book Page to Test</p>
            </div>
          </Link>

          <Link
            href="/dashboard/teacher-olympiad"
            className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-orange-300 hover:shadow-md transition-all space-y-2 group"
          >
            <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-600 group-hover:scale-105 transition-transform">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-extrabold text-slate-900">Teacher Skill Olympiad</h3>
              <p className="text-[10px] text-slate-400 font-bold mt-0.5">Official Certification</p>
            </div>
          </Link>

          <Link
            href="/dashboard/teacher-olympiad/practice"
            className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-300 hover:shadow-md transition-all space-y-2 group"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 group-hover:scale-105 transition-transform">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-extrabold text-slate-900">Olympiad Practice</h3>
              <p className="text-[10px] text-slate-400 font-bold mt-0.5">Practice Mock Tests</p>
            </div>
          </Link>

          <Link
            href="/dashboard/video-consultation"
            className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-rose-300 hover:shadow-md transition-all space-y-2 group"
          >
            <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 group-hover:scale-105 transition-transform">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-extrabold text-slate-900">Video Consultation</h3>
              <p className="text-[10px] text-slate-400 font-bold mt-0.5">Live 1-on-1 Mentoring</p>
            </div>
          </Link>
        </div>
      </div>

      {/* RECENT GENERATED PAPERS TOUCH CARDS */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-500">
            Recent Question Papers ({savedPapers.length})
          </h2>
          <Link href="/dashboard/generator" className="text-xs font-bold text-indigo-600 flex items-center gap-1">
            Generate New <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {savedPapers.length === 0 ? (
          <div className="p-6 bg-white rounded-2xl border border-slate-200 text-center space-y-3">
            <FileText className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-xs font-bold text-slate-600">No question papers created yet.</p>
            <Link
              href="/dashboard/generator"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white font-extrabold text-xs rounded-xl shadow-md"
            >
              <Plus className="w-3.5 h-3.5" /> Generate First Paper
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {savedPapers.slice(0, 4).map((paper: any) => (
              <div
                key={paper.id}
                className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between"
              >
                <div className="space-y-1 min-w-0 pr-3">
                  <h3 className="text-xs font-black text-slate-900 truncate">
                    {paper.subject} • Class {paper.grade}
                  </h3>
                  <p className="text-[10px] text-slate-400 font-bold">
                    {paper.chapter} • Marks: {paper.total_marks || 20}
                  </p>
                </div>

                <Link
                  href={`/dashboard/generator?paper=${paper.id}`}
                  className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 font-bold text-xs shrink-0 flex items-center gap-1"
                >
                  <Download className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
