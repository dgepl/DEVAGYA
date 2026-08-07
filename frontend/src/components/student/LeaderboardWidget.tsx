"use client";

import { useState, useEffect } from "react";
import {
  Crown, Award, Shield, Trophy, Flame, Zap, ArrowLeft,
  Medal, Star, TrendingUp, Sparkles
} from "lucide-react";
import Link from "next/link";
import { useAppStore } from "@/store/useAppStore";

const API = process.env.NEXT_PUBLIC_API_URL || "/api/v1";

interface LeaderEntry {
  user_id: string;
  user_name: string;
  total_xp: number;
  level: number;
  streak: number;
}

export function LeaderboardWidget() {
  const { user } = useAppStore();
  const [leaders, setLeaders] = useState<LeaderEntry[]>([]);
  const [myXp, setMyXp] = useState({ total_xp: 0, level: 1, streak: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [lbRes, xpRes] = await Promise.all([
          fetch(`${API}/xp/leaderboard?limit=50`),
          fetch(`${API}/xp/me?user_id=${user.id}`),
        ]);
        if (lbRes.ok) { const d = await lbRes.json(); setLeaders(d.leaderboard || []); }
        if (xpRes.ok) setMyXp(await xpRes.json());
      } catch (e) { console.warn("Leaderboard fetch:", e); }
      setLoading(false);
    };
    load();
  }, [user.id]);

  const myRank = leaders.findIndex((e) => e.user_id === user.id) + 1;
  const top3 = leaders.slice(0, 3);
  const rest = leaders.slice(3);

  const getStudentDisplayName = (entry: LeaderEntry, index: number) => {
    if (entry.user_id === user.id) return user.name || "You";
    if (entry.user_name && entry.user_name !== "Student" && entry.user_name !== "Guest User") return entry.user_name;
    return entry.user_name || "Learner";
  };

  const PODIUM_STYLES = [
    { bg: "from-amber-400 via-yellow-400 to-amber-500", shadow: "shadow-amber-300/50", ring: "ring-amber-300", h: "h-32", icon: Crown, label: "🥇", order: "order-2" },
    { bg: "from-slate-300 via-gray-300 to-slate-400", shadow: "shadow-slate-300/50", ring: "ring-slate-300", h: "h-24", icon: Award, label: "🥈", order: "order-1" },
    { bg: "from-amber-600 via-orange-600 to-amber-700", shadow: "shadow-amber-600/30", ring: "ring-amber-600", h: "h-20", icon: Shield, label: "🥉", order: "order-3" },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">

      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/student" className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-all">
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <Trophy className="w-7 h-7 text-amber-500" /> Leaderboard
          </h1>
          <p className="text-xs text-slate-500">Real-time rankings — earn XP by asking AI questions</p>
        </div>
      </div>

      {/* My Stats Bar */}
      <div className="bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-700 text-white p-5 rounded-3xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/20">
            <span className="text-2xl font-black">
              {myRank > 0 ? `#${myRank}` : "—"}
            </span>
          </div>
          <div>
            <h2 className="text-lg font-extrabold">{user.name}</h2>
            <p className="text-xs text-violet-200">Your current ranking</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-center px-4">
            <Zap className="w-5 h-5 text-amber-300 mx-auto mb-1" />
            <div className="text-xl font-black">{myXp.total_xp}</div>
            <div className="text-[10px] text-violet-200 font-bold">XP</div>
          </div>
          <div className="w-px h-10 bg-white/20" />
          <div className="text-center px-4">
            <Star className="w-5 h-5 text-emerald-300 mx-auto mb-1" />
            <div className="text-xl font-black">Lv.{myXp.level}</div>
            <div className="text-[10px] text-violet-200 font-bold">Level</div>
          </div>
          <div className="w-px h-10 bg-white/20" />
          <div className="text-center px-4">
            <Flame className="w-5 h-5 text-orange-300 mx-auto mb-1" />
            <div className="text-xl font-black">{myXp.streak}</div>
            <div className="text-[10px] text-violet-200 font-bold">Streak</div>
          </div>
        </div>
      </div>

      {/* Top 3 Podium */}
      {top3.length > 0 && (
        <div className="flex items-end justify-center gap-4 py-4">
          {top3.map((entry, i) => {
            const style = PODIUM_STYLES[i];
            const PodIcon = style.icon;
            return (
              <div key={i} className={`flex flex-col items-center ${style.order}`}>
                {/* Avatar */}
                <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${style.bg} ${style.shadow} shadow-lg ring-4 ${style.ring} flex items-center justify-center mb-2`}>
                  <PodIcon className="w-7 h-7 text-white" />
                </div>
                <p className="text-xs font-extrabold text-slate-900 text-center max-w-[100px] truncate">
                  {getStudentDisplayName(entry, i)}
                </p>
                <p className="text-[10px] text-slate-500 font-bold">{entry.total_xp} XP</p>
                {/* Podium block */}
                <div className={`w-24 ${style.h} mt-2 rounded-t-2xl bg-gradient-to-b ${style.bg} flex items-center justify-center shadow-lg`}>
                  <span className="text-3xl">{style.label}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {loading && (
        <div className="text-center py-10">
          <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-400 mt-3 font-bold">Loading leaderboard...</p>
        </div>
      )}

      {!loading && leaders.length === 0 && (
        <div className="text-center py-16 space-y-3">
          <Sparkles className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-lg font-bold text-slate-400">No rankings yet</h3>
          <p className="text-sm text-slate-400">Be the first to earn XP by asking AI questions!</p>
          <Link href="/dashboard/agents?agent=student_tutor"
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-2xl mt-4 transition-all">
            Start Earning XP
          </Link>
        </div>
      )}

      {/* Rankings Table (4th place onwards) */}
      {rest.length > 0 && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
            <h3 className="text-sm font-extrabold text-slate-700 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-600" /> Full Rankings
            </h3>
          </div>

          <div className="divide-y divide-slate-100">
            {rest.map((entry, i) => {
              const rank = i + 4;
              const isMe = entry.user_id === user.id;
              return (
                <div key={i} className={`flex items-center gap-4 px-6 py-4 transition-all ${
                  isMe ? "bg-indigo-50 border-l-4 border-l-indigo-500" : "hover:bg-slate-50"
                }`}>
                  {/* Rank */}
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-black text-sm text-slate-600 shrink-0">
                    {rank}
                  </div>

                  {/* Name */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-bold truncate ${isMe ? "text-indigo-700" : "text-slate-800"}`}>
                      {getStudentDisplayName(entry, rank - 1)}
                      {isMe && <span className="text-indigo-500 ml-1">(You)</span>}
                    </p>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                        <Star className="w-3 h-3" /> Level {entry.level}
                      </span>
                      <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                        <Flame className="w-3 h-3" /> {entry.streak} day streak
                      </span>
                    </div>
                  </div>

                  {/* XP */}
                  <div className="text-right shrink-0">
                    <span className="text-sm font-extrabold text-indigo-600">{entry.total_xp}</span>
                    <span className="text-[10px] text-slate-400 font-bold ml-1">XP</span>
                  </div>

                  {/* XP Bar */}
                  <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden shrink-0 hidden sm:block">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full"
                      style={{ width: `${Math.min(100, (entry.total_xp / (leaders[0]?.total_xp || 1)) * 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
