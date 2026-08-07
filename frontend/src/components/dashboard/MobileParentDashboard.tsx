"use client";

import Link from "next/link";
import { 
  HeartHandshake, 
  Sparkles, 
  Video, 
  BarChart3, 
  ShieldCheck, 
  Smartphone, 
  ArrowRight 
} from "lucide-react";
import { useAppStore } from "@/store/useAppStore";

export function MobileParentDashboard() {
  const { user } = useAppStore();

  return (
    <div className="space-y-6 pb-6 animate-in fade-in duration-300 md:hidden">
      
      {/* MOBILE APP BANNER */}
      <div className="bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-800 text-white p-6 rounded-3xl shadow-xl space-y-4 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black uppercase tracking-widest bg-white/20 px-3 py-1 rounded-full text-pink-100 backdrop-blur-md">
            Parenting OS
          </span>
          <span className="text-[10px] font-bold text-emerald-300">● Live Monitoring</span>
        </div>

        <div>
          <h1 className="text-xl font-black tracking-tight">
            Welcome, {user?.name || "Parent"}! 🤝
          </h1>
          <p className="text-xs text-pink-100 font-medium mt-1">
            Child Academic Growth & Home Routine Management
          </p>
        </div>

        <Link
          href="/dashboard/agents?agent=parent_coach"
          className="w-full py-3.5 bg-white text-pink-900 font-black text-xs rounded-2xl text-center shadow-lg flex items-center justify-center gap-2 uppercase tracking-wider active:scale-95 transition-transform"
        >
          <Sparkles className="w-4 h-4 text-pink-600" />
          <span>Ask Parenting AI Coach</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* QUICK LAUNCH MATRIX */}
      <div className="space-y-2">
        <h2 className="text-xs font-black uppercase tracking-wider text-slate-500 px-1">
          Parenting Controls & Analytics
        </h2>

        <div className="grid grid-cols-2 gap-3">
          <Link
            href="/dashboard/agents?agent=parent_coach"
            className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all space-y-2"
          >
            <div className="w-10 h-10 rounded-xl bg-pink-50 border border-pink-100 flex items-center justify-center text-pink-600">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-extrabold text-slate-900">AI Parenting Coach</h3>
              <p className="text-[10px] text-slate-400 font-bold mt-0.5">Behavior & Screen Time</p>
            </div>
          </Link>

          <Link
            href="/dashboard/agents?agent=analytics_assistant"
            className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all space-y-2"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-extrabold text-slate-900">Marks Radar</h3>
              <p className="text-[10px] text-slate-400 font-bold mt-0.5">Subject Weak Spot Tracker</p>
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
              <h3 className="text-xs font-extrabold text-slate-900">Consultation Call</h3>
              <p className="text-[10px] text-slate-400 font-bold mt-0.5">Speak live with AI Mentor</p>
            </div>
          </Link>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-extrabold text-slate-800">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> Safe Environment
            </div>
            <p className="text-[10px] font-semibold text-slate-500">
              Filtered & Ad-Free Education SaaS
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
