"use client";

import React from "react";
import Link from "next/link";
import { 
  Building2, 
  ShieldCheck, 
  Clock, 
  Plus, 
  RefreshCw, 
  Briefcase,
  Users
} from "lucide-react";

interface MobileSchoolHeaderProps {
  school: {
    id: string;
    school_name: string;
    affiliation_board?: string;
    city?: string;
    state?: string;
    verification_status: "pending_verification" | "verified" | "rejected";
    logo_url?: string;
  } | null;
  onRefresh?: () => void;
  refreshing?: boolean;
}

export function MobileSchoolHeader({ school, onRefresh, refreshing = false }: MobileSchoolHeaderProps) {
  if (!school) return null;

  const isVerified = school.verification_status === "verified";

  return (
    <div className="bg-white border-b border-slate-200/80 -mx-4 -mt-4 px-4 py-3 mb-5 sticky top-0 z-20 backdrop-blur-md bg-white/95">
      <div className="flex items-center justify-between gap-3">
        {/* LEFT: SCHOOL LOGO & DETAILS */}
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-700 text-white flex items-center justify-center shrink-0 shadow-md shadow-indigo-600/20 overflow-hidden">
            {school.logo_url ? (
              <img src={school.logo_url} alt={school.school_name} className="w-full h-full object-cover" />
            ) : (
              <Building2 className="w-5 h-5 text-white" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-sm font-black text-slate-900 truncate leading-tight">
              {school.school_name}
            </h1>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[10px] font-extrabold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded-md border border-indigo-100">
                {school.affiliation_board || "CBSE"}
              </span>
              {school.city && (
                <span className="text-[10px] font-semibold text-slate-500 truncate">
                  {school.city}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT: BADGE & FAST ACTION BUTTONS */}
        <div className="flex items-center gap-1.5 shrink-0">
          {isVerified ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-black uppercase tracking-wider">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              Verified
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-black uppercase tracking-wider">
              <Clock className="w-3 h-3 text-amber-600" />
              Pending
            </span>
          )}

          {isVerified && (
            <Link
              href="/dashboard/school/vacancies?action=new"
              className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-600/25 active:scale-95 transition-transform flex items-center justify-center"
              title="Post New Vacancy"
            >
              <Plus className="w-4 h-4" />
            </Link>
          )}

          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={refreshing}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 active:scale-95 transition-transform flex items-center justify-center cursor-pointer"
              title="Refresh"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-indigo-600" : ""}`} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
