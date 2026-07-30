"use client";

import { useState } from "react";
import { 
  Trophy, 
  Flame, 
  Zap, 
  ShieldCheck, 
  UserCheck, 
  EyeOff, 
  Award,
  Crown
} from "lucide-react";

export function LeaderboardWidget() {
  const [scope, setScope] = useState<"school" | "class" | "subject">("class");
  const [period, setPeriod] = useState<"weekly" | "monthly" | "all_time">("weekly");
  const [optOut, setOptOut] = useState(false);

  const leaderboardData = [
    { rank: 1, name: "Rohan Verma", xp: 720, level: 7, streak: 14, is_user: false },
    { rank: 2, name: "Priya Nair", xp: 590, level: 6, streak: 10, is_user: false },
    { rank: 3, name: optOut ? "Anonymous Student" : "Aarav Sharma (You)", xp: 480, level: 5, streak: 7, is_user: true },
    { rank: 4, name: "Ananya Patel", xp: 450, level: 5, streak: 5, is_user: false },
    { rank: 5, name: "Karan Gupta", xp: 410, level: 4, streak: 4, is_user: false }
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* HEADER BAR */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center shadow-lg shadow-amber-200 font-extrabold">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900">Leaderboard Rankings</h1>
            <p className="text-xs text-slate-500">Compete with classmates and earn XP through daily study goals</p>
          </div>
        </div>

        {/* PRIVACY OPT-OUT TOGGLE */}
        <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-2xl border border-slate-200">
          <EyeOff className="w-4 h-4 text-slate-500" />
          <span className="text-xs font-bold text-slate-700">Privacy Opt-out</span>
          <input 
            type="checkbox"
            checked={optOut}
            onChange={(e) => setOptOut(e.target.checked)}
            className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* FILTER CONTROLS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-2xl border border-slate-200">
          {(["class", "school", "subject"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setScope(s)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                scope === s ? "bg-indigo-600 text-white shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-2xl border border-slate-200">
          {(["weekly", "monthly", "all_time"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                period === p ? "bg-amber-500 text-slate-950 shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {p.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* LEADERBOARD LIST TABLE */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3">
        {leaderboardData.map((row) => (
          <div 
            key={row.rank}
            className={`p-4 rounded-2xl border flex items-center justify-between transition-all ${
              row.is_user
                ? "bg-amber-50 border-amber-300 shadow-sm"
                : "bg-slate-50/50 border-slate-100 hover:bg-slate-100"
            }`}
          >
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs">
                {row.rank === 1 && <Crown className="w-6 h-6 text-amber-500 fill-amber-400" />}
                {row.rank === 2 && <Crown className="w-5 h-5 text-slate-400 fill-slate-300" />}
                {row.rank === 3 && <Crown className="w-5 h-5 text-amber-700 fill-amber-600" />}
                {row.rank > 3 && <span className="text-slate-400 font-bold">#{row.rank}</span>}
              </div>

              <div>
                <h3 className={`text-xs font-extrabold ${row.is_user ? "text-amber-950" : "text-slate-900"}`}>
                  {row.name}
                </h3>
                <span className="text-[10px] text-slate-500 font-medium">
                  Level {row.level} • {row.streak} Day Streak
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-amber-600 bg-white border border-amber-200 px-3 py-1.5 rounded-xl shadow-xs">
                {row.xp} XP
              </span>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
