"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Flame, Trophy, Sparkles, Target, Brain, Zap, ArrowRight,
  Video, MessageSquare, Clock, FileText, Play, Award, Crown,
  BookOpen, Compass, Shield, ChevronRight, Star, Home, Users,
  Bot, Mic
} from "lucide-react";
import { useAppStore } from "@/store/useAppStore";

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
    { label: "AI Tutor", href: "/dashboard/agents?agent=student_tutor", icon: Brain, color: "from-indigo-500 to-violet-600", desc: "Ask anything" },
    { label: "Quiz", href: "/dashboard/student/practice", icon: Target, color: "from-emerald-500 to-teal-600", desc: "Test yourself" },
    { label: "Exam Prep", href: "/dashboard/student/exam-prep", icon: Trophy, color: "from-rose-500 to-pink-600", desc: "Board strategy" },
    { label: "Video Call", href: "/dashboard/video-consultation", icon: Video, color: "from-purple-500 to-fuchsia-600", desc: "Live AI tutor" },
    { label: "Chat", href: "/dashboard/chat", icon: MessageSquare, color: "from-blue-500 to-cyan-600", desc: "Chat studio" },
    { label: "Timer", href: "/dashboard/student/timer", icon: Clock, color: "from-amber-500 to-orange-600", desc: "Pomodoro" },
  ];

  const AI_AGENTS = [
    { label: "Homework Helper", href: "/dashboard/agents?agent=homework_assistant", icon: FileText, color: "text-blue-600 bg-blue-50", gradient: "from-blue-500 to-blue-600" },
    { label: "Exam Strategist", href: "/dashboard/agents?agent=exam_strategist", icon: Trophy, color: "text-rose-600 bg-rose-50", gradient: "from-rose-500 to-rose-600" },
    { label: "Revision AI", href: "/dashboard/agents?agent=revision_assistant", icon: BookOpen, color: "text-purple-600 bg-purple-50", gradient: "from-purple-500 to-purple-600" },
    { label: "Study Planner", href: "/dashboard/agents?agent=study_planner", icon: Clock, color: "text-emerald-600 bg-emerald-50", gradient: "from-emerald-500 to-emerald-600" },
    { label: "Career Guide", href: "/dashboard/agents?agent=career_counselor", icon: Compass, color: "text-amber-600 bg-amber-50", gradient: "from-amber-500 to-amber-600" },
    { label: "English Coach", href: "/dashboard/agents?agent=english_coach", icon: MessageSquare, color: "text-indigo-600 bg-indigo-50", gradient: "from-indigo-500 to-indigo-600" },
    { label: "Motivation", href: "/dashboard/agents?agent=motivation_coach", icon: Flame, color: "text-orange-600 bg-orange-50", gradient: "from-orange-500 to-orange-600" },
    { label: "Research AI", href: "/dashboard/agents?agent=research_assistant", icon: Brain, color: "text-cyan-600 bg-cyan-50", gradient: "from-cyan-500 to-cyan-600" },
  ];

  const RANK_COLORS = ["from-amber-400 to-yellow-500", "from-slate-300 to-slate-400", "from-amber-600 to-orange-700"];

  // ══════════════════════════════════════
  // MOBILE VIEW (completely different layout)
  // ══════════════════════════════════════
  const MobileView = () => (
    <div className="pb-24 -mx-4 -mt-4 sm:mx-0 sm:mt-0">
      {/* ── COMPACT XP HEADER ── */}
      <div className="bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-700 text-white px-4 py-4 rounded-b-3xl shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20">
              <span className="text-base font-black">{user.name?.charAt(0) || "S"}</span>
            </div>
            <div>
              <h1 className="text-sm font-extrabold leading-tight">Hi, {user.name?.split(" ")[0]}! 👋</h1>
              <p className="text-[10px] text-violet-200 font-medium">Keep learning to level up</p>
            </div>
          </div>
          <Link href="/dashboard/student/leaderboard" className="flex items-center gap-1.5 px-3 py-1.5 bg-white/15 backdrop-blur-md rounded-xl border border-white/15 active:scale-95 transition-transform">
            <Trophy className="w-4 h-4 text-amber-300" />
            <span className="text-xs font-bold text-amber-200">#{myRank || "—"}</span>
          </Link>
        </div>

        {/* XP Stats Row */}
        <div className="flex items-center gap-3 mt-3.5">
          <div className="flex-1 flex items-center gap-2 bg-black/20 backdrop-blur-md rounded-2xl px-3 py-2 border border-white/10">
            <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
            <div>
              <div className="text-xs font-black text-white">{loading ? "..." : xp.total_xp}</div>
              <div className="text-[9px] text-violet-200 font-medium">XP</div>
            </div>
          </div>
          <div className="flex-1 flex items-center gap-2 bg-black/20 backdrop-blur-md rounded-2xl px-3 py-2 border border-white/10">
            <Flame className="w-4 h-4 text-orange-300 fill-orange-300" />
            <div>
              <div className="text-xs font-black text-white">{loading ? "..." : xp.streak}</div>
              <div className="text-[9px] text-violet-200 font-medium">Streak</div>
            </div>
          </div>
          <div className="flex-1 flex items-center gap-2 bg-black/20 backdrop-blur-md rounded-2xl px-3 py-2 border border-white/10">
            <Star className="w-4 h-4 text-emerald-300" />
            <div>
              <div className="text-xs font-black text-white">Lv.{loading ? "..." : xp.level}</div>
              <div className="text-[9px] text-violet-200 font-medium">Level</div>
            </div>
          </div>
        </div>

        {/* XP Bar */}
        <div className="mt-3 flex items-center gap-2">
          <div className="flex-1 h-2 bg-white/20 rounded-full overflow-hidden p-0.5">
            <div className="bg-gradient-to-r from-amber-400 to-yellow-300 h-full rounded-full transition-all duration-700" style={{ width: `${xpProgress}%` }} />
          </div>
          <span className="text-[9px] font-extrabold text-amber-200">{xpToNext} to next</span>
        </div>
      </div>

      {/* ── MOBILE TAB CONTENT ── */}
      <div className="px-4 pt-4">
        {mobileTab === "home" && (
          <div className="space-y-4">
            {/* Quick Tools - Horizontal Scroll */}
            <div>
              <h2 className="text-xs font-extrabold text-slate-700 mb-2 px-1">Quick Actions</h2>
              <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide" style={{ scrollbarWidth: "none" }}>
                {QUICK_TOOLS.map((t, i) => (
                  <Link key={i} href={t.href}
                    className="flex flex-col items-center shrink-0 w-[72px] active:scale-95 transition-transform">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${t.color} text-white flex items-center justify-center shadow-lg mb-1.5`}>
                      <t.icon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-700 text-center leading-tight">{t.label}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Primary CTA */}
            <Link href="/dashboard/agents?agent=student_tutor"
              className="flex items-center gap-3 p-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-2xl shadow-lg active:scale-[0.98] transition-transform">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                <Brain className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-extrabold">Ask AI Tutor</h3>
                <p className="text-[10px] text-indigo-200">Get answers & earn XP</p>
              </div>
              <ChevronRight className="w-5 h-5 text-white/60" />
            </Link>

            {/* Mini Leaderboard */}
            {leaders.length > 0 && (
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                    <Crown className="w-4 h-4 text-amber-500" /> Top Students
                  </h3>
                  <Link href="/dashboard/student/leaderboard" className="text-[10px] font-bold text-indigo-600">View All</Link>
                </div>
                <div className="space-y-2">
                  {leaders.slice(0, 3).map((e, i) => (
                    <div key={i} className={`flex items-center gap-2.5 p-2 rounded-xl ${e.user_id === user.id ? "bg-indigo-50" : "bg-slate-50"}`}>
                      <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${RANK_COLORS[i] || "from-slate-200 to-slate-300"} text-white flex items-center justify-center text-[10px] font-black shrink-0`}>
                        {i + 1}
                      </div>
                      <span className="text-xs font-bold text-slate-800 flex-1 truncate">
                        {e.user_name || "Student"} {e.user_id === user.id && <span className="text-indigo-500">(You)</span>}
                      </span>
                      <span className="text-xs font-extrabold text-indigo-600">{e.total_xp} XP</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* XP Guide - Compact */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
              <h3 className="text-xs font-extrabold text-slate-800 mb-2 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-indigo-600" /> Earn XP
              </h3>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { xp: "5", label: "Short Q", color: "bg-slate-50 text-slate-600" },
                  { xp: "10", label: "Medium", color: "bg-blue-50 text-blue-600" },
                  { xp: "20", label: "Detailed", color: "bg-indigo-50 text-indigo-600" },
                  { xp: "30+", label: "Complex", color: "bg-violet-50 text-violet-600" },
                ].map((r, i) => (
                  <div key={i} className={`p-2 rounded-xl ${r.color} text-center`}>
                    <div className="text-sm font-black">{r.xp}</div>
                    <div className="text-[8px] font-bold">{r.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {mobileTab === "agents" && (
          <div className="space-y-3">
            <h2 className="text-xs font-extrabold text-slate-700 px-1">AI Agents — Tap to chat & earn XP</h2>
            {AI_AGENTS.map((a, i) => (
              <Link key={i} href={a.href}
                className="flex items-center gap-3 p-3.5 bg-white rounded-2xl border border-slate-100 shadow-sm active:scale-[0.98] transition-transform">
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${a.gradient} text-white flex items-center justify-center shadow-md shrink-0`}>
                  <a.icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-slate-800">{a.label}</h3>
                  <p className="text-[10px] text-slate-400 font-medium">Ask & earn 5-30 XP per question</p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />
              </Link>
            ))}

            {/* Extra tools */}
            <div className="pt-2">
              <h2 className="text-xs font-extrabold text-slate-700 px-1 mb-2">More Tools</h2>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: "Video Call", href: "/dashboard/video-consultation", icon: Video, color: "from-purple-500 to-fuchsia-600" },
                  { label: "Notes", href: "/dashboard/student/notes", icon: FileText, color: "from-blue-500 to-cyan-600" },
                  { label: "Timer", href: "/dashboard/student/timer", icon: Clock, color: "from-amber-500 to-orange-600" },
                ].map((t, i) => (
                  <Link key={i} href={t.href} className="flex flex-col items-center p-3 bg-white rounded-2xl border border-slate-100 shadow-sm active:scale-95 transition-transform">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${t.color} text-white flex items-center justify-center shadow-md mb-1.5`}>
                      <t.icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-700">{t.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        {mobileTab === "rank" && (
          <div className="space-y-3">
            {/* My Stats Card */}
            <div className="bg-gradient-to-br from-indigo-600 to-violet-700 text-white p-4 rounded-2xl shadow-lg">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-xl font-black">
                  {myRank > 0 ? `#${myRank}` : "—"}
                </div>
                <div>
                  <h3 className="text-sm font-extrabold">{user.name}</h3>
                  <p className="text-[10px] text-violet-200">Your ranking</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-black/20 rounded-xl p-2 text-center">
                  <div className="text-base font-black text-amber-300">{xp.total_xp}</div>
                  <div className="text-[9px] text-violet-200">XP</div>
                </div>
                <div className="bg-black/20 rounded-xl p-2 text-center">
                  <div className="text-base font-black text-emerald-300">Lv.{xp.level}</div>
                  <div className="text-[9px] text-violet-200">Level</div>
                </div>
                <div className="bg-black/20 rounded-xl p-2 text-center">
                  <div className="text-base font-black text-orange-300">{xp.streak}</div>
                  <div className="text-[9px] text-violet-200">Streak</div>
                </div>
              </div>
            </div>

            {/* Full Leaderboard */}
            <h2 className="text-xs font-extrabold text-slate-700 px-1">All Rankings</h2>
            {leaders.length === 0 && !loading && (
              <div className="text-center py-8">
                <Sparkles className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-slate-400 font-bold">No rankings yet. Start earning XP!</p>
              </div>
            )}
            {leaders.map((entry, i) => {
              const isMe = entry.user_id === user.id;
              return (
                <div key={i} className={`flex items-center gap-3 p-3 rounded-2xl ${
                  isMe ? "bg-indigo-50 border border-indigo-200" : "bg-white border border-slate-100"
                } shadow-sm`}>
                  {i < 3 ? (
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${RANK_COLORS[i]} text-white flex items-center justify-center text-xs font-black shadow-md shrink-0`}>
                      {i + 1}
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center text-xs font-black shrink-0">
                      {i + 1}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-bold truncate ${isMe ? "text-indigo-700" : "text-slate-800"}`}>
                      {entry.user_name || "Student"} {isMe && <span className="text-indigo-500">(You)</span>}
                    </p>
                    <p className="text-[10px] text-slate-400">Lv.{entry.level} • {entry.streak} day streak</p>
                  </div>
                  <span className="text-xs font-extrabold text-indigo-600 shrink-0">{entry.total_xp} XP</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── STICKY/FIXED PROFESSIONAL MOBILE BOTTOM NAVBAR ── */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-t border-slate-200/80 shadow-[0_-8px_30px_rgba(0,0,0,0.12)] px-4 py-2 flex items-center justify-around md:hidden pb-[max(0.6rem,env(safe-area-inset-bottom))]">
        {[
          { key: "home" as const, icon: Home, label: "Home" },
          { key: "agents" as const, icon: Bot, label: "AI Agents" },
          { key: "rank" as const, icon: Trophy, label: "Rankings" },
        ].map((tab) => {
          const isActive = mobileTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setMobileTab(tab.key)}
              className={`flex flex-col items-center justify-center gap-1 px-5 py-1 rounded-2xl transition-all duration-200 relative active:scale-95 ${
                isActive
                  ? "text-indigo-600 font-extrabold"
                  : "text-slate-400 hover:text-slate-600 font-medium"
              }`}
            >
              {isActive && (
                <span className="absolute -top-2 w-8 h-1 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-full shadow-sm animate-in fade-in zoom-in duration-200" />
              )}
              <div className={`p-1.5 rounded-xl transition-all ${isActive ? "bg-indigo-50/80 scale-110 shadow-sm" : ""}`}>
                <tab.icon className={`w-5 h-5 ${isActive ? "text-indigo-600" : "text-slate-400"}`} />
              </div>
              <span className="text-[10px] tracking-tight">{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );

  // ══════════════════════════════════════
  // DESKTOP VIEW (existing layout)
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
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-violet-600 text-white flex items-center justify-center shadow-md">
                  <Brain className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-slate-900">AI Agents</h2>
                  <p className="text-[11px] text-slate-500">Ask any agent to earn XP</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {AI_AGENTS.map((a, i) => (
                <Link key={i} href={a.href}
                  className="p-3 rounded-2xl border border-slate-100 hover:border-violet-200 hover:bg-violet-50/50 transition-all flex items-center gap-3 group">
                  <div className={`w-9 h-9 rounded-xl ${a.color} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                    <a.icon className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-slate-700 leading-tight">{a.label}</span>
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
                        {entry.user_name || "Student"} {isMe && <span className="text-indigo-500">(You)</span>}
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
        <MobileView />
      </div>
      {/* Desktop: visible on screens >= 768px */}
      <div className="hidden md:block">
        <DesktopView />
      </div>
    </>
  );
}
