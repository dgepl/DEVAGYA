"use client";

import Link from "next/link";
import { 
  Trophy, 
  Flame, 
  Sparkles, 
  Zap, 
  BookOpen, 
  Brain, 
  Video, 
  ArrowRight, 
  CheckCircle2, 
  Target 
} from "lucide-react";
import { useAppStore } from "@/store/useAppStore";

export function MobileStudentDashboard() {
  const { user } = useAppStore();

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-300 md:hidden">
      
      {/* GAMIFIED APP HEADER CARD */}
      <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-800 text-white p-6 rounded-3xl shadow-xl space-y-4 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-amber-300 border border-white/20">
            <Flame className="w-4 h-4 fill-amber-400 text-amber-400 animate-bounce" />
            <span className="text-xs font-black">5 Day Streak</span>
          </div>

          <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-cyan-300 border border-white/20">
            <Trophy className="w-4 h-4" />
            <span className="text-xs font-black">450 XP</span>
          </div>
        </div>

        <div>
          <h1 className="text-xl font-black tracking-tight">
            Hey {user?.name?.split(" ")[0] || "Explorer"}! 🚀
          </h1>
          <p className="text-xs text-purple-100 font-semibold mt-1">
            Socratic AI Study Partner • NCERT Class 10
          </p>
        </div>

        <Link
          href="/dashboard/agents?agent=student_tutor"
          className="w-full py-3.5 bg-white text-purple-900 font-black text-xs rounded-2xl text-center shadow-lg flex items-center justify-center gap-2 uppercase tracking-wider active:scale-95 transition-transform"
        >
          <Sparkles className="w-4 h-4 text-purple-600" />
          <span>Ask Socratic Tutor AI</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* QUICK LAUNCH GRID */}
      <div className="space-y-2">
        <h2 className="text-xs font-black uppercase tracking-wider text-slate-500 px-1">
          Daily Study Missions
        </h2>

        <div className="grid grid-cols-2 gap-3">
          <Link
            href="/dashboard/agents?agent=student_tutor"
            className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all space-y-2"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-extrabold text-slate-900">Socratic AI Tutor</h3>
              <p className="text-[10px] text-slate-400 font-bold mt-0.5">Step-by-step guidance</p>
            </div>
          </Link>

          <Link
            href="/dashboard/student/flashcards"
            className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all space-y-2"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-extrabold text-slate-900">Active Flashcards</h3>
              <p className="text-[10px] text-slate-400 font-bold mt-0.5">Spaced repetition</p>
            </div>
          </Link>

          <Link
            href="/dashboard/agents?agent=homework_assistant"
            className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all space-y-2"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-extrabold text-slate-900">Homework Helper</h3>
              <p className="text-[10px] text-slate-400 font-bold mt-0.5">Math & Physics Solver</p>
            </div>
          </Link>

          <Link
            href="/dashboard/video-consultation"
            className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all space-y-2"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-extrabold text-slate-900">Video Call Room</h3>
              <p className="text-[10px] text-slate-400 font-bold mt-0.5">Speak live with AI</p>
            </div>
          </Link>
        </div>
      </div>

    </div>
  );
}
