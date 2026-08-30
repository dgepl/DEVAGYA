"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Sparkles, 
  Clock, 
  Bell, 
  ArrowLeft, 
  CheckCircle2, 
  Rocket, 
  ShieldCheck, 
  Zap, 
  Compass, 
  Layers, 
  Star,
  Lock
} from "lucide-react";
import { ToolItem } from "@/store/useToolConfigStore";

interface ComingSoonViewProps {
  tool?: Partial<ToolItem>;
  customTitle?: string;
  customMessage?: string;
  customEta?: string;
  customBadge?: string;
  backUrl?: string;
}

export function ComingSoonView({
  tool,
  customTitle,
  customMessage,
  customEta,
  customBadge,
  backUrl = "/dashboard"
}: ComingSoonViewProps) {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  const title = customTitle || tool?.coming_soon_title || `${tool?.name || "Feature"} Upgrade in Progress`;
  const message = customMessage || tool?.coming_soon_message || "Our engineering and curriculum AI teams are actively polishing this feature with advanced CBSE 2026 intelligence and lightning-fast capabilities.";
  const eta = customEta || tool?.coming_soon_eta || "Releasing Very Soon";
  const badge = customBadge || tool?.coming_soon_badge || "Under Active Development";
  const toolName = tool?.name || "This Tool";
  const role = tool?.role || "teacher";

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes("@")) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubscribed(true);
    }, 600);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 sm:p-6 lg:p-8 animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/30 rounded-3xl p-6 sm:p-10 shadow-2xl overflow-hidden text-white backdrop-blur-xl">
        
        {/* Glow ambient backgrounds */}
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Badges */}
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 mb-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-black uppercase tracking-wider shadow-inner">
            <Rocket className="w-3.5 h-3.5 text-indigo-400 animate-bounce" />
            {badge}
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-400/30 text-amber-300 text-xs font-bold">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>ETA: <strong className="text-white font-extrabold">{eta}</strong></span>
          </div>
        </div>

        {/* Central Icon Header */}
        <div className="relative z-10 flex flex-col items-center text-center space-y-4 mb-8">
          <div className="relative">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-amber-500 p-0.5 shadow-xl shadow-indigo-500/25">
              <div className="w-full h-full bg-slate-900 rounded-[22px] flex items-center justify-center">
                <Sparkles className="w-10 h-10 text-amber-400 animate-pulse" />
              </div>
            </div>
            <span className="absolute -bottom-2 -right-2 px-2 py-0.5 rounded-md bg-amber-500 text-slate-950 font-black text-[10px] uppercase tracking-wider shadow-md">
              PRO
            </span>
          </div>

          <div className="space-y-2 max-w-lg">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-100 to-amber-200">
              {title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        {/* Highlight Feature Preview Pills */}
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
              <Zap className="w-4 h-4" />
            </div>
            <div className="text-left">
              <p className="text-[11px] font-extrabold text-white">Ultra-Fast</p>
              <p className="text-[9px] text-slate-400">Groq LLM Acceleration</p>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="text-left">
              <p className="text-[11px] font-extrabold text-white">CBSE 2026 Guard</p>
              <p className="text-[9px] text-slate-400">Curriculum Verified</p>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
              <Star className="w-4 h-4" />
            </div>
            <div className="text-left">
              <p className="text-[11px] font-extrabold text-white">Zero Extra Cost</p>
              <p className="text-[9px] text-slate-400">Included in Tier</p>
            </div>
          </div>
        </div>

        {/* Interactive "Notify Me" Box */}
        <div className="relative z-10 bg-white/10 border border-white/15 rounded-2xl p-5 sm:p-6 mb-8 text-center backdrop-blur-md">
          {subscribed ? (
            <div className="flex flex-col items-center justify-center py-2 space-y-2 animate-scaleUp">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="text-base font-extrabold text-white">You're on the VIP Launch List!</h3>
              <p className="text-xs text-slate-300">
                We'll email you the instant <strong className="text-indigo-300">{toolName}</strong> goes live.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-center gap-2 text-indigo-300 text-xs font-bold">
                <Bell className="w-4 h-4 text-amber-400 animate-bounce" />
                <span>Get VIP early access notification when this unlocks</span>
              </div>

              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your school/personal email..."
                  required
                  className="flex-1 bg-slate-950/70 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-xs font-black shadow-lg shadow-indigo-600/30 transition-transform active:scale-95 disabled:opacity-50 cursor-pointer shrink-0"
                >
                  {loading ? "Registering..." : "Notify Me"}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Action Footer */}
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-white/10 text-xs">
          <Link
            href={backUrl}
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors font-bold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Dashboard</span>
          </Link>

          <Link
            href={role === "student" ? "/dashboard/student" : role === "parent" ? "/dashboard/parent" : "/dashboard"}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold transition-all border border-white/10"
          >
            Explore Active Tools
          </Link>
        </div>

      </div>
    </div>
  );
}
