"use client";

import React from "react";
import Link from "next/link";
import { 
  ShieldAlert, 
  Clock, 
  ShieldCheck, 
  Building2, 
  RefreshCw, 
  CheckCircle2,
  HelpCircle,
  ArrowRight
} from "lucide-react";

interface SchoolLockedBannerProps {
  school: {
    id: string;
    school_name: string;
    email: string;
    phone?: string;
    affiliation_board?: string;
    city?: string;
    state?: string;
    contact_person?: string;
    verification_status: "pending_verification" | "verified" | "rejected";
    verification_notes?: string;
  } | null;
  onRefresh?: () => void;
  refreshing?: boolean;
  inlineOnly?: boolean;
}

export function SchoolLockedBanner({ 
  school, 
  onRefresh, 
  refreshing = false,
  inlineOnly = false 
}: SchoolLockedBannerProps) {
  if (!school) return null;

  const isPending = school.verification_status === "pending_verification";
  const isRejected = school.verification_status === "rejected";

  if (school.verification_status === "verified") {
    return null;
  }

  // Inline top alert banner (for pages where partial view is allowed or header warning)
  if (inlineOnly) {
    return (
      <div className={`p-4 rounded-2xl border mb-5 ${
        isRejected 
          ? "bg-rose-50/90 border-rose-200 text-rose-900" 
          : "bg-amber-50/90 border-amber-200 text-amber-900"
      }`}>
        <div className="flex items-start gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
            isRejected ? "bg-rose-100 text-rose-600" : "bg-amber-100 text-amber-600"
          }`}>
            {isRejected ? <ShieldAlert className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-black uppercase tracking-wider">
              {isRejected ? "Verification Suspended / Rejected" : "Dashboard Locked • Verification Pending"}
            </h4>
            <p className="text-xs mt-0.5 opacity-90 leading-relaxed">
              {isRejected 
                ? (school.verification_notes || "Your institution profile was not approved. Please contact DEVGYA support.") 
                : "DEVGYA administrator is currently reviewing your CBSE/institutional credentials. Job posting and applicant access will unlock upon verification."}
            </p>
          </div>
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={refreshing}
              className="p-2 rounded-xl bg-white/80 border border-amber-200 hover:bg-white text-amber-800 text-xs font-bold shrink-0 flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
              title="Check Status"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  // Full-page Mobile & Desktop Locked State UI
  return (
    <div className="py-6 px-3 sm:px-6 max-w-xl mx-auto space-y-5 pb-28">
      {/* LOCK BADGE CARD */}
      <div className="bg-white rounded-3xl border border-amber-200/90 p-6 sm:p-8 shadow-xl shadow-amber-500/5 text-center relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-amber-100/60 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-indigo-100/40 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-400 text-white flex items-center justify-center mx-auto shadow-lg shadow-amber-500/30 mb-4 animate-pulse">
            {isRejected ? <ShieldAlert className="w-8 h-8" /> : <Clock className="w-8 h-8" />}
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-[11px] font-black uppercase tracking-wider mb-2">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
            {isRejected ? "Verification Rejected" : "Institutional Verification In Progress"}
          </span>

          <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1 mb-2">
            {school.school_name || "Institution Dashboard"}
          </h2>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
            {isRejected 
              ? (school.verification_notes || "Your institution profile is currently suspended or not approved by DEVGYA Administrator.")
              : "To maintain top hiring trust for teachers, DEVGYA reviews every school profile before unlocking recruitment, vacancy publishing, and teacher candidate contact info."}
          </p>

          {/* VERIFICATION STEPS PROGRESS */}
          <div className="mt-6 pt-5 border-t border-slate-100 text-left space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold text-slate-800">1. School Account Registered</p>
                <p className="text-[11px] text-slate-500">Official email and credentials submitted</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                <Clock className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold text-amber-900">2. Admin Document & Credential Review</p>
                <p className="text-[11px] text-slate-500">Usually approved within 2-4 business hours</p>
              </div>
            </div>

            <div className="flex items-center gap-3 opacity-60">
              <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold text-slate-700">3. Full Recruitment Portal Unlocked</p>
                <p className="text-[11px] text-slate-400">Post unlimited vacancies & receive verified teacher CVs</p>
              </div>
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className="mt-6 pt-4 flex flex-col sm:flex-row items-center justify-center gap-2.5">
            {onRefresh && (
              <button
                onClick={onRefresh}
                disabled={refreshing}
                className="w-full sm:w-auto px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-extrabold text-xs rounded-xl shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
                <span>{refreshing ? "Checking..." : "Check Approval Status"}</span>
              </button>
            )}

            <Link
              href="/dashboard/school/profile"
              className="w-full sm:w-auto px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all"
            >
              <span>Edit School Details</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* INSTITUTION DETAILS SUMMARY */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
        <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
          <Building2 className="w-4 h-4 text-indigo-600" />
          Submitted Institution Details
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Board Affiliation</span>
            <span className="font-extrabold text-slate-800">{school.affiliation_board || "CBSE"}</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Contact Person</span>
            <span className="font-extrabold text-slate-800">{school.contact_person || "Principal / Admin"}</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Official Email</span>
            <span className="font-extrabold text-slate-800 truncate block">{school.email}</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Contact Phone</span>
            <span className="font-extrabold text-slate-800">{school.phone || "Not provided"}</span>
          </div>
          {(school.city || school.state) && (
            <div className="p-3 bg-slate-50 rounded-xl sm:col-span-2">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Location</span>
              <span className="font-extrabold text-slate-800">{[school.city, school.state].filter(Boolean).join(", ")}</span>
            </div>
          )}
        </div>
      </div>

      {/* HELP FOOTER */}
      <div className="text-center p-4 bg-indigo-50/50 border border-indigo-100 rounded-2xl text-xs text-indigo-950 flex items-center justify-center gap-2">
        <HelpCircle className="w-4 h-4 text-indigo-600 shrink-0" />
        <span>Need expedited approval? Email support at <strong>contact@devgya.in</strong></span>
      </div>
    </div>
  );
}
