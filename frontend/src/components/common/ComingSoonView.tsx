"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Clock, Sparkles } from "lucide-react";
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
  const title = customTitle || tool?.coming_soon_title || `${tool?.name || "Feature"} Coming Soon`;
  const message = customMessage || tool?.coming_soon_message || "This tool is currently being prepared and will be available shortly.";
  const eta = customEta || tool?.coming_soon_eta || "Coming Soon";
  const badge = customBadge || tool?.coming_soon_badge || "In Development";

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-lg bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-sm text-center">
        
        {/* Minimal Icon / Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold mb-5">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          <span>{badge}</span>
        </div>

        {/* Title */}
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mb-2.5">
          {title}
        </h1>

        {/* Short Clean Message */}
        <p className="text-sm text-slate-600 leading-relaxed max-w-md mx-auto mb-6">
          {message}
        </p>

        {/* Minimal ETA & Details */}
        {eta && (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200/60 text-slate-600 text-xs font-medium mb-6">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Estimated Availability: <strong className="text-slate-900 font-semibold">{eta}</strong></span>
          </div>
        )}

        {/* Clean Back Action */}
        <div className="pt-5 border-t border-slate-100 flex items-center justify-center">
          <Link
            href={backUrl}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium transition-colors shadow-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Dashboard</span>
          </Link>
        </div>

      </div>
    </div>
  );
}

