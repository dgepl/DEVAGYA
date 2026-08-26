"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Flame, Trophy, Sparkles, Target, Brain, Zap, ArrowRight,
  Video, MessageSquare, Clock, FileText, Play, Award, Crown,
  BookOpen, Compass, Shield, ChevronRight, Star, Home, Users,
  Bot, Mic, Layers
} from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { MobileStudentDashboard } from "@/components/dashboard/MobileStudentDashboard";

const API = process.env.NEXT_PUBLIC_API_URL || "/api/v1";

interface XPData { total_xp: number; level: number; streak: number; }
interface LeaderEntry { user_id: string; user_name: string; total_xp: number; level: number; streak: number; }

export function StudentDashboard() {
  const { user } = useAppStore();
  const [xp, setXp] = useState<XPData>({ total_xp: 0, level: 1, streak: 0 });
  const [leaders, setLeaders] = useState<LeaderEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [mobileTab, setMobileTab] = useState<"home" | "agents" | "rank">("home");

  useEffect(() => {
    const load = async () => {
      try {
        const [xpRes, lbRes] = await Promise.all([
          fetch(`${API}/xp/me?user_id=${user.id}`),
          fetch(`${API}/xp/leaderboard?limit=10`),
        ]);
        if (xpRes.ok) setXp(await xpRes.json());
        if (lbRes.ok) { const d = await lbRes.json(); setLeaders(d.leaderboard || []); }
      } catch (e) { console.warn("XP fetch failed:", e); }
      setLoading(false);
    };
    load();
  }, [user.id]);

  const xpProgress = ((xp.total_xp % 500) / 500) * 100;
  const xpToNext = 500 - (xp.total_xp % 500);
  const myRank = leaders.findIndex((e) => e.user_id === user.id) + 1;

  const QUICK_TOOLS = [
    { label: "AI Socratic Tutor", href: "/dashboard/agents?agent=student_tutor", icon: Brain, color: "from-indigo-500 to-violet-600", desc: "Step-by-step guidance" },
    { label: "AI Exam Prep", href: "/dashboard/student/exam-prep", icon: Trophy, color: "from-rose-500 to-pink-600", desc: "CBSE Roadmaps & Qs" },
    { label: "Practice Quizzes", href: "/dashboard/student/practice", icon: Target, color: "from-emerald-500 to-teal-600", desc: "Untimed Chapter Mocks" },
    { label: "Notion Smart Notes", href: "/dashboard/student/notes", icon: FileText, color: "from-blue-500 to-cyan-600", desc: "AI Class Notebook" },
    { label: "Pomodoro Timer", href: "/dashboard/student/timer", icon: Clock, color: "from-amber-500 to-orange-600", desc: "Focus & Retain" },
    { label: "Video Call Room", href: "/dashboard/video-consultation", icon: Video, color: "from-purple-500 to-fuchsia-600", desc: "Live Voice & Face AI" },
  ];

  const RANK_COLORS = ["from-amber-400 to-yellow-500", "from-slate-300 to-slate-400", "from-amber-600 to-orange-700"];

  const getStudentDisplayName = (entry: { user_id: string; user_name: string }, index: number) => {
    if (entry.user_id === user.id) return user.name || "You";
    if (entry.user_name && entry.user_name !== "Student" && entry.user_name !== "Guest User") return entry.user_name;
    return entry.user_name || "Learner";
  };

  // ══════════════════════════════════════
  // DESKTOP VIEW
  // ══════════════════════════════════════
  const DesktopView = () => (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto">

      {/* ── HERO HEADER ── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 via-violet-900 to-purple-900 text-white p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-16 -mr-16 w-80 h-80 bg-violet-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-60 h-60 bg-indigo-400/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-bold backdrop-blur-md border border-white/10">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              DEVGYA Student Portal
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Welcome, <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-yellow-200">{user.name}</span>! 👋
            </h1>
            <p className="text-violet-200 text-sm">
              Ask AI questions to earn XP. Level up and climb the leaderboard!
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 bg-black/30 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-amber-500/30">
              <Flame className="w-6 h-6 text-amber-400 fill-amber-400 animate-bounce" />
              <div>
                <div className="text-[10px] text-amber-200 font-bold uppercase tracking-wider">Streak</div>
                <div className="text-lg font-black text-amber-300">{loading ? "..." : `${xp.streak} Days`}</div>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-black/30 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-indigo-400/30">
              <Zap className="w-6 h-6 text-indigo-400 fill-indigo-400" />
              <div>
                <div className="text-[10px] text-indigo-200 font-bold uppercase tracking-wider">Total XP</div>
                <div className="text-lg font-black text-white">{loading ? "..." : `${xp.total_xp} XP`}</div>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-black/30 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-emerald-400/30">
              <Trophy className="w-6 h-6 text-emerald-400" />
              <div>
                <div className="text-[10px] text-emerald-200 font-bold uppercase tracking-wider">Level</div>
                <div className="text-lg font-black text-emerald-300">{loading ? "..." : `Level ${xp.level}`}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs relative z-10">
          <div className="flex items-center gap-2 flex-1">
            <span className="font-bold text-violet-200">Level {xp.level}</span>
            <div className="flex-1 max-w-sm h-3 bg-white/10 rounded-full overflow-hidden">
              <div className="bg-gradient-to-r from-amber-400 to-yellow-300 h-full rounded-full transition-all duration-700" style={{ width: `${xpProgress}%` }} />
            </div>
            <span className="font-bold text-amber-300">{xpToNext} XP to Level {xp.level + 1}</span>
          </div>
          <Link href="/dashboard/student/leaderboard" className="inline-flex items-center gap-1.5 font-bold text-amber-300 hover:text-white transition-colors">
            <Trophy className="w-4 h-4" /> View Leaderboard <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* ── QUICK LAUNCH TILES ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {QUICK_TOOLS.map((t, i) => (
          <Link key={i} href={t.href}
            className="group relative p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-lg transition-all overflow-hidden">
            <div className={`absolute inset-0 bg-gradient-to-br ${t.color} opacity-0 group-hover:opacity-5 transition-opacity`} />
            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${t.color} text-white flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-lg`}>
              <t.icon className="w-6 h-6" />
            </div>
            <span className="text-sm font-bold text-slate-800 block">{t.label}</span>
            <span className="text-[11px] text-slate-400 font-medium">{t.desc}</span>
          </Link>
        ))}
      </div>

      {/* ── TWO-COLUMN LAYOUT ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-violet-600 text-white flex items-center justify-center shadow-md">
                  <Brain className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-slate-900">Socratic AI Study Assistant</h2>
                  <p className="text-[11px] text-slate-500">Ask conceptual doubts, solve equations, and get step-by-step guidance</p>
                </div>
              </div>
              <Link
                href="/dashboard/agents?agent=student_tutor"
                className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold rounded-xl transition shadow-xs flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Launch Socratic AI</span>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {[
                { title: "Solve Math & Science Problems", desc: "Get guided hints without immediate spoilers", query: "Can you help me solve this step-by-step?" },
                { title: "Explain Complex Concepts", desc: "NCERT & CBSE syllabus aligned explanations", query: "Explain the main principles clearly with examples" },
              ].map((item, idx) => (
                <Link
                  key={idx}
                  href={`/dashboard/agents?agent=student_tutor&prompt=${encodeURIComponent(item.query)}`}
                  className="p-3.5 rounded-2xl bg-slate-50 hover:bg-violet-50/50 border border-slate-100 hover:border-violet-200 transition-all flex items-center justify-between group"
                >
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 group-hover:text-violet-700">{item.title}</h4>
                    <p className="text-[10px] text-slate-400 font-medium">{item.desc}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-violet-600 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-50 via-violet-50 to-white rounded-3xl p-6 border border-indigo-100 shadow-sm">
            <h3 className="text-sm font-extrabold text-slate-900 mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-indigo-600" /> How to Earn XP
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { xp: "5 XP", label: "Short question", color: "text-slate-600 bg-slate-100" },
                { xp: "10 XP", label: "Medium question", color: "text-blue-600 bg-blue-50" },
                { xp: "20 XP", label: "Detailed question", color: "text-indigo-600 bg-indigo-50" },
                { xp: "30 XP", label: "Complex + Image", color: "text-violet-600 bg-violet-50" },
              ].map((r, i) => (
                <div key={i} className={`p-3 rounded-2xl ${r.color} text-center`}>
                  <div className="text-lg font-black">{r.xp}</div>
                  <div className="text-[10px] font-bold mt-0.5">{r.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-amber-500" />
                <h2 className="text-sm font-extrabold text-slate-900">Leaderboard</h2>
              </div>
              <Link href="/dashboard/student/leaderboard" className="text-xs font-bold text-indigo-600 hover:underline">
                View All
              </Link>
            </div>

            {leaders.length === 0 && !loading && (
              <p className="text-xs text-slate-400 text-center py-4">No users yet. Be the first to earn XP!</p>
            )}

            <div className="space-y-2">
              {leaders.slice(0, 5).map((entry, i) => {
                const isMe = entry.user_id === user.id;
                return (
                  <div key={i} className={`flex items-center gap-3 p-3 rounded-2xl border transition-all ${
                    isMe ? "border-indigo-200 bg-indigo-50" : "border-slate-100 bg-slate-50/50"
                  }`}>
                    {i < 3 ? (
                      <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${RANK_COLORS[i]} text-white flex items-center justify-center shadow-md shrink-0 text-xs font-black`}>
                        {i + 1}
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-xl bg-slate-200 text-slate-600 flex items-center justify-center font-black text-xs shrink-0">
                        {i + 1}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-bold truncate ${isMe ? "text-indigo-700" : "text-slate-800"}`}>
                        {getStudentDisplayName(entry, i)} {isMe && <span className="text-indigo-500">(You)</span>}
                      </p>
                      <p className="text-[10px] text-slate-400">Level {entry.level}</p>
                    </div>
                    <span className="text-xs font-extrabold text-indigo-600">{entry.total_xp} XP</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <Play className="w-4 h-4 text-emerald-600" /> Quick Start
            </h3>
            <Link href="/dashboard/agents?agent=student_tutor"
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2">
              <Brain className="w-4 h-4" /> Ask AI Tutor (+XP)
            </Link>
            <Link href="/dashboard/student/practice"
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2">
              <Target className="w-4 h-4" /> Start Practice Quiz
            </Link>
            <Link href="/dashboard/video-consultation"
              className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2">
              <Video className="w-4 h-4" /> Live Video Call
            </Link>
          </div>
        </div>
      </div>
    </div>
  );

  // ══════════════════════════════════════
  // RESPONSIVE RENDER
  // ══════════════════════════════════════
  return (
    <>
      {/* Mobile: visible on screens < 768px */}
      <div className="block md:hidden">
        <MobileStudentDashboard />
      </div>
      {/* Desktop: visible on screens >= 768px */}
      <div className="hidden md:block">
        <DesktopView />
      </div>
    </>
  );
}
