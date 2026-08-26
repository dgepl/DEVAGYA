"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { 
  HeartHandshake, 
  Sparkles, 
  Video, 
  BarChart3, 
  ShieldCheck, 
  Search, 
  X, 
  ArrowRight,
  TrendingUp
} from "lucide-react";
import { useAppStore } from "@/store/useAppStore";

export function MobileParentDashboard() {
  const { user } = useAppStore();
  const [searchQuery, setSearchQuery] = useState("");

  const parentTools = [
    { name: "Parenting Coach", sub: "Behavior & Home Routine", href: "/dashboard/agents?agent=parent_coach", icon: HeartHandshake, color: "text-rose-600", bg: "bg-rose-50", border: "border-rose-100", type: "AI Coach" },
    { name: "Marks Radar", sub: "Progress & Weak Spots", href: "/dashboard/agents?agent=analytics_assistant", icon: BarChart3, color: "text-indigo-600", bg: "bg-indigo-50", border: "border-indigo-100", type: "Analytics" },
    { name: "Consultation Call", sub: "Live 1-on-1 AI Mentor", href: "/dashboard/video-consultation", icon: Video, color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-100", type: "Live Call" },
    { name: "Safety Standards", sub: "Screen-Time & Ad-Free", href: "/safety-standards", icon: ShieldCheck, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100", type: "Protection" },
  ];

  // Dynamic search matching
  const matchingTools = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    return parentTools.filter(t => 
      t.name.toLowerCase().includes(q) || 
      t.sub.toLowerCase().includes(q) || 
      t.type.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const hasSearch = searchQuery.trim().length > 0;

  return (
    <div className="space-y-4 pb-24 animate-in fade-in duration-300 md:hidden px-1">
      
      {/* 1. HERO BANNER WITH 3D ART & ACTION BUTTONS */}
      <div className="bg-gradient-to-br from-[#2a133d] via-[#3d1a52] to-[#12163b] text-white p-5 rounded-[28px] shadow-xl border border-pink-700/40 relative overflow-hidden space-y-3">
        {/* Decorative background glow */}
        <div className="absolute -top-10 -right-10 w-44 h-44 bg-rose-500/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-44 h-44 bg-purple-500/20 rounded-full blur-2xl pointer-events-none" />

        {/* Top Badges */}
        <div className="flex items-center justify-between relative z-10">
          <span className="text-[10px] font-extrabold uppercase tracking-wider bg-white/15 px-3 py-1 rounded-full text-rose-100 border border-white/10 backdrop-blur-md">
            PARENT OS HUB
          </span>
          <span className="text-[10px] font-bold text-emerald-300 bg-emerald-500/20 border border-emerald-400/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Home Study Active
          </span>
        </div>

        {/* Headline & 3D Heart Art */}
        <div className="flex items-center justify-between gap-2 relative z-10 pt-1">
          <div className="space-y-1 max-w-[62%]">
            <h1 className="text-xl font-black tracking-tight leading-tight">
              Welcome, <br />
              <span className="text-white font-extrabold">{user?.name || "Parent"}! 👋</span>
            </h1>
            <p className="text-[11px] text-slate-300 font-medium leading-tight">
              Child Academic Health & Home Routine Guide
            </p>
          </div>

          {/* 3D Parent Handshake Badge */}
          <div className="relative shrink-0 w-24 h-24 flex items-center justify-center">
            <div className="w-20 h-20 bg-gradient-to-tr from-rose-500 via-pink-600 to-indigo-600 rounded-3xl rotate-6 shadow-lg flex flex-col items-center justify-center p-2 border border-white/20">
              <HeartHandshake className="w-8 h-8 text-amber-300 drop-shadow" />
              <div className="w-10 h-1.5 bg-amber-400 rounded-full mt-1" />
              <div className="w-12 h-1 bg-white/60 rounded-full mt-1" />
            </div>
            <div className="absolute bottom-0 left-0 bg-pink-500 text-white text-[10px] p-1 rounded-full shadow-md border border-white/40">
              ❤️
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 pt-1 relative z-10">
          <Link
            href="/dashboard/agents?agent=parent_coach"
            className="flex-1 py-2.5 bg-white text-rose-950 font-extrabold text-xs rounded-2xl shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all hover:bg-slate-50 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-rose-600 fill-rose-500" />
            <span>Ask Parenting Coach</span>
          </Link>
          
          <Link
            href="/dashboard/video-consultation"
            className="p-2.5 bg-white/15 hover:bg-white/25 text-white rounded-2xl border border-white/20 transition-all flex items-center justify-center active:scale-95 cursor-pointer"
            title="Book Consultation Call"
          >
            <Video className="w-5 h-5 text-rose-200" />
          </Link>
        </div>
      </div>

      {/* 2. REAL-TIME SEARCH BAR */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm px-4 py-3 flex items-center justify-between gap-2.5 transition-all focus-within:border-rose-500 focus-within:ring-2 focus-within:ring-rose-100">
        <div className="flex items-center gap-2.5 flex-1 text-slate-400 text-xs">
          <Search className="w-4 h-4 text-rose-600 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search parenting advice, marks radar, routines..."
            className="w-full bg-transparent outline-none text-slate-900 placeholder:text-slate-400 text-xs font-semibold"
          />
        </div>
        {hasSearch && (
          <button
            type="button"
            onClick={() => setSearchQuery("")}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-4 h-4" />
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
              className="text-[11px] font-bold text-rose-600 hover:underline"
            >
              Clear
            </button>
          </div>

          {matchingTools.length === 0 ? (
            <div className="py-8 text-center space-y-1">
              <p className="text-xs font-bold text-slate-700">No matching parenting tools found.</p>
              <p className="text-[11px] text-slate-400">Try searching "Coach", "Marks" or "Call"</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {matchingTools.map((t, idx) => (
                <Link
                  key={idx}
                  href={t.href}
                  className="p-3 bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:border-rose-300 hover:shadow-md transition-all space-y-2"
                >
                  <div className={`w-9 h-9 rounded-xl ${t.bg} ${t.border} border flex items-center justify-center ${t.color}`}>
                    <t.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-slate-900 leading-tight">{t.name}</h3>
                    <p className="text-[10px] text-slate-400 font-bold mt-0.5 leading-tight">{t.sub}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      ) : (
        <>
          {/* 4. PARENT CORE TOOLS GRID (MATCHING TEACHER DASHBOARD EXACT CARDS) */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                PARENT CORE TOOLS
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {parentTools.map((tool, idx) => {
                const IconComp = tool.icon;
                return (
                  <Link
                    key={idx}
                    href={tool.href}
                    className="p-3.5 bg-white rounded-2xl border border-slate-100 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-2 active:scale-95 cursor-pointer"
                  >
                    <div className={`w-10 h-10 rounded-xl ${tool.bg} border ${tool.border} flex items-center justify-center ${tool.color}`}>
                      <IconComp className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-xs font-extrabold text-slate-900 leading-tight">{tool.name}</h3>
                      <p className="text-[10px] text-slate-400 font-bold mt-0.5 leading-tight">{tool.sub}</p>
                    </div>
                    <div className="flex justify-end pt-1">
                      <div className="w-5 h-5 rounded-full bg-slate-50 text-slate-500 flex items-center justify-center">
                        <ArrowRight className="w-3 h-3" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* 5. QUICK PARENTING ADVICE STARTERS */}
          <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-xs space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-rose-600" />
                <h3 className="text-xs font-black text-slate-900">Expert Parenting Guidance</h3>
              </div>
              <span className="text-[10px] font-bold text-slate-400">1-Tap Query</span>
            </div>

            <div className="flex flex-col gap-1.5 text-xs">
              {[
                "How to design an effective 2-hour daily study routine?",
                "How to manage child's exam anxiety before board tests?",
                "Constructive screen-time rules without family conflicts",
                "Ways to encourage a child struggling in Mathematics"
              ].map((query, qIdx) => (
                <Link
                  key={qIdx}
                  href={`/dashboard/agents?agent=parent_coach&prompt=${encodeURIComponent(query)}`}
                  className="p-2.5 rounded-xl bg-rose-50/60 hover:bg-rose-100/70 border border-rose-100/80 text-rose-950 font-bold flex items-center justify-between transition active:scale-98"
                >
                  <span className="truncate pr-2">{query}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                </Link>
              ))}
            </div>
          </div>
        </>
      )}

    </div>
  );
}
