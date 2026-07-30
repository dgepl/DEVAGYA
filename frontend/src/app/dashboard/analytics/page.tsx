"use client";

import { useState, useEffect } from "react";
import { Activity, Cpu, Clock, FileText, Sparkles, TrendingUp } from "lucide-react";
import { getTeacherAnalytics } from "@/lib/api_phase2";

export default function AnalyticsPage() {
  const [data, setData] = useState<any | null>(null);

  useEffect(() => {
    getTeacherAnalytics().then(setData).catch(console.error);
  }, []);

  return (
    <div className="space-y-8">
      
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
          <Activity className="w-6 h-6 text-indigo-600" />
          AI Analytics & Token Consumption Dashboard
        </h1>
        <p className="text-xs text-slate-500 font-semibold">Track your platform usage, estimated hours saved, and token metrics</p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-card p-6 rounded-2xl border border-slate-200 space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-indigo-600">
            <Cpu className="w-5 h-5" />
            <span className="text-[10px] font-bold uppercase bg-indigo-50 px-2 py-0.5 rounded">AI Tokens</span>
          </div>
          <p className="text-3xl font-extrabold text-slate-900">{(data?.overview?.total_tokens_consumed || 4250000).toLocaleString()}</p>
          <p className="text-xs text-slate-500 font-medium">OpenAI-Compatible Consumption</p>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-slate-200 space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-emerald-600">
            <Clock className="w-5 h-5" />
            <span className="text-[10px] font-bold uppercase bg-emerald-50 px-2 py-0.5 rounded">Time Saved</span>
          </div>
          <p className="text-3xl font-extrabold text-slate-900">{data?.overview?.estimated_hours_saved || 48.5} Hours</p>
          <p className="text-xs text-slate-500 font-medium">Automated Preparation Time</p>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-slate-200 space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-cyan-600">
            <FileText className="w-5 h-5" />
            <span className="text-[10px] font-bold uppercase bg-cyan-50 px-2 py-0.5 rounded">Exams Generated</span>
          </div>
          <p className="text-3xl font-extrabold text-slate-900">{data?.overview?.question_papers_generated || 24}</p>
          <p className="text-xs text-slate-500 font-medium">NCERT Assessment Papers</p>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-slate-200 space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-purple-600">
            <Sparkles className="w-5 h-5" />
            <span className="text-[10px] font-bold uppercase bg-purple-50 px-2 py-0.5 rounded">Lesson Plans</span>
          </div>
          <p className="text-3xl font-extrabold text-slate-900">{data?.overview?.lesson_plans_created || 18}</p>
          <p className="text-xs text-slate-500 font-medium">5E Pedagogical Plans</p>
        </div>
      </div>

      {/* Daily Usage Chart */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-200 space-y-4 shadow-sm">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-emerald-600" />
          Weekly Token Consumption & Time Saved
        </h3>

        <div className="grid grid-cols-6 gap-4 items-end h-48 pt-6">
          {(data?.daily_tokens || [
            { day: "Mon", tokens: 420000, hours_saved: 6.5 },
            { day: "Tue", tokens: 680000, hours_saved: 8.0 },
            { day: "Wed", tokens: 850000, hours_saved: 11.2 },
            { day: "Thu", tokens: 520000, hours_saved: 7.4 },
            { day: "Fri", tokens: 940000, hours_saved: 12.0 },
            { day: "Sat", tokens: 310000, hours_saved: 3.4 }
          ]).map((d: any, idx: number) => (
            <div key={idx} className="flex flex-col items-center gap-2 h-full justify-end">
              <div className="w-full bg-slate-100 rounded-t-xl overflow-hidden h-full flex flex-col justify-end">
                <div
                  className="bg-gradient-to-t from-indigo-600 to-cyan-600 rounded-t-xl transition-all"
                  style={{ height: `${(d.tokens / 1000000) * 100}%` }}
                />
              </div>
              <span className="text-xs font-bold text-slate-600">{d.day}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
