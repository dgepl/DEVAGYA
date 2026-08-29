"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Trophy, 
  Award, 
  ChevronLeft, 
  RefreshCw, 
  Medal, 
  Sparkles, 
  CheckCircle2, 
  Building2, 
  ShieldCheck, 
  UserCheck, 
  Search 
} from "lucide-react";

export default function OlympiadLeaderboardPage() {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api/v1";
      const res = await fetch(`${baseUrl}/olympiad/results/published`);
      const data = await res.json();
      if (data.results) {
        // Sort descending by score_percentage, then by tab_switch_count
        const sorted = data.results.sort((a: any, b: any) => {
          if (b.score_percentage !== a.score_percentage) {
            return b.score_percentage - a.score_percentage;
          }
          return (a.tab_switch_count || 0) - (b.tab_switch_count || 0);
        });
        setResults(sorted);
      }
    } catch (e) {
      console.error("Error fetching leaderboard", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const filteredResults = results.filter((r) => 
    (r.teacher_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (r.teacher_email || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const top1 = filteredResults[0];
  const top2 = filteredResults[1];
  const top3 = filteredResults[2];

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 font-sans">
      
      {/* NAVIGATION HEADER */}
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard/teacher-olympiad"
          className="inline-flex items-center gap-1.5 text-xs font-extrabold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-xl border border-indigo-100 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Exam Hall</span>
        </Link>

        <button
          onClick={fetchLeaderboard}
          disabled={loading}
          className="px-3.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-extrabold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-2xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-indigo-600" : ""}`} />
          <span>Refresh Live Ranks</span>
        </button>
      </div>

      {/* HERO BANNER */}
      <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-indigo-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 border border-white/30 text-white text-xs font-black">
            <Sparkles className="w-3.5 h-3.5 text-amber-200 animate-pulse" />
            <span>National Verified Educator Standings</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Skill Enhance Program Official Leaderboard
          </h1>

          <p className="text-xs sm:text-sm text-amber-100 font-medium leading-relaxed">
            Honoring educators demonstrated in pedagogical excellence, NEP 2020 mastery, and proctored assessment integrity.
          </p>
        </div>

        <div className="shrink-0 relative z-10 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 text-center space-y-1">
          <div className="text-2xl font-black text-amber-200">{results.length}</div>
          <div className="text-[10px] uppercase font-bold text-white tracking-wider">Certified Educators</div>
        </div>
      </div>

      {/* TOP 3 PODIUM DISPLAY */}
      {results.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          
          {/* SILVER - RANK #2 */}
          <div className="order-2 md:order-1 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm text-center space-y-3 relative overflow-hidden">
            <div className="w-12 h-12 bg-slate-100 text-slate-500 border border-slate-300 rounded-2xl flex items-center justify-center mx-auto shadow-inner font-black text-base">
              🥈 #2
            </div>

            <div>
              <h3 className="text-base font-black text-slate-900">{top2 ? top2.teacher_name : "Educator Rank #2"}</h3>
              <p className="text-xs text-slate-500 font-mono">{top2 ? top2.teacher_email : "Awaiting Board Verification"}</p>
            </div>

            {top2 && (
              <div className="pt-2 space-y-1">
                <span className="px-3 py-1 bg-slate-100 text-slate-800 font-black text-sm rounded-xl inline-block border border-slate-200">
                  {top2.score_percentage}% Score
                </span>
                <p className="text-[10px] font-bold text-emerald-600">Verified Distinction Certificate</p>
              </div>
            )}
          </div>

          {/* GOLD - RANK #1 */}
          <div className="order-1 md:order-2 bg-gradient-to-b from-amber-50 to-white p-7 rounded-3xl border-2 border-amber-400 shadow-lg text-center space-y-3 relative scale-105">
            <div className="w-14 h-14 bg-gradient-to-tr from-amber-400 to-amber-200 text-amber-900 rounded-2xl flex items-center justify-center mx-auto shadow-md font-black text-xl border border-amber-300">
              🥇 #1
            </div>

            <div>
              <span className="text-[10px] font-black uppercase tracking-wider bg-amber-200 text-amber-900 px-2.5 py-0.5 rounded-full">
                National Champion
              </span>
              <h3 className="text-lg font-black text-slate-900 mt-1">{top1 ? top1.teacher_name : "Educator Rank #1"}</h3>
              <p className="text-xs text-slate-500 font-mono">{top1 ? top1.teacher_email : "Awaiting Board Verification"}</p>
            </div>

            {top1 && (
              <div className="pt-2 space-y-1">
                <span className="px-4 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-black text-base rounded-xl inline-block shadow-md">
                  {top1.score_percentage}% Score
                </span>
                <p className="text-xs font-black text-emerald-600 flex items-center justify-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Gold Medalist & Master Pedagogue
                </p>
              </div>
            )}
          </div>

          {/* BRONZE - RANK #3 */}
          <div className="order-3 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm text-center space-y-3 relative overflow-hidden">
            <div className="w-12 h-12 bg-amber-100/70 text-amber-800 border border-amber-200 rounded-2xl flex items-center justify-center mx-auto shadow-inner font-black text-base">
              🥉 #3
            </div>

            <div>
              <h3 className="text-base font-black text-slate-900">{top3 ? top3.teacher_name : "Educator Rank #3"}</h3>
              <p className="text-xs text-slate-500 font-mono">{top3 ? top3.teacher_email : "Awaiting Board Verification"}</p>
            </div>

            {top3 && (
              <div className="pt-2 space-y-1">
                <span className="px-3 py-1 bg-amber-50 text-amber-900 font-black text-sm rounded-xl inline-block border border-amber-200">
                  {top3.score_percentage}% Score
                </span>
                <p className="text-[10px] font-bold text-emerald-600">Bronze Medalist Certificate</p>
              </div>
            )}
          </div>

        </div>
      )}

      {/* LEADERBOARD TABLE */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-5">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" />
              Published Educator Rankings
            </h3>
            <p className="text-xs text-slate-500 font-medium">Official verified scores and distinction awards</p>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search candidate teacher..."
              className="bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs font-semibold text-slate-900 w-48 sm:w-64"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-800">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider font-extrabold border-b border-slate-200">
              <tr>
                <th className="p-3.5">Rank</th>
                <th className="p-3.5">Educator Candidate</th>
                <th className="p-3.5">Email Address</th>
                <th className="p-3.5">Final Score</th>
                <th className="p-3.5">Board Distinction</th>
                <th className="p-3.5 text-right">Verification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredResults.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400 font-semibold">
                    No published results available on the leaderboard yet.
                  </td>
                </tr>
              ) : (
                filteredResults.map((r, idx) => (
                  <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5 font-black text-slate-900">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-black ${
                        idx === 0 ? "bg-amber-100 text-amber-900 border border-amber-300" :
                        idx === 1 ? "bg-slate-200 text-slate-800" :
                        idx === 2 ? "bg-amber-50 text-amber-800 border border-amber-200" :
                        "bg-slate-100 text-slate-700"
                      }`}>
                        #{idx + 1}
                      </span>
                    </td>
                    <td className="p-3.5 font-bold text-slate-900">
                      {r.teacher_name}
                    </td>
                    <td className="p-3.5 font-mono text-slate-600 text-[11px]">{r.teacher_email}</td>
                    <td className="p-3.5 font-black text-slate-900 text-sm">{r.score_percentage}%</td>
                    <td className="p-3.5">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200">
                        {r.score_percentage >= 90 ? "High Distinction" : r.score_percentage >= 75 ? "Merit Certificate" : "Pass Certificate"}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Verified
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
}
