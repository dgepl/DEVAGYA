"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Users, Plus, ArrowRight, User, RefreshCw, GraduationCap, ChevronRight } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { getApiBase } from "@/lib/api";

interface ChildAccount {
  id: string;
  username: string;
  name: string;
  class_name: string;
  school_name?: string;
}

export function ParentChildOverviewCard() {
  const { user } = useAppStore();
  const parentEmail = user?.email || "";

  const [children, setChildren] = useState<ChildAccount[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!parentEmail) return;
    let isMounted = true;
    const apiBase = getApiBase();
    fetch(`${apiBase}/parent/children?parent_email=${encodeURIComponent(parentEmail)}`)
      .then(res => res.json())
      .then(data => {
        if (isMounted && data && data.status === "success" && Array.isArray(data.children)) {
          setChildren(data.children);
        }
      })
      .catch(err => console.warn("Failed to load children overview:", err))
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [parentEmail]);

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-4 sm:p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-black text-slate-900">
                My Children &amp; Student Accounts
              </h2>
              {!loading && (
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                  {children.length} {children.length === 1 ? "Child" : "Children"}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Dedicated space to manage student logins, review quiz scores, and view study notes.
            </p>
          </div>
        </div>

        <Link
          href="/dashboard/parent/children"
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition active:scale-95 shrink-0"
        >
          <span>Open Child Manager</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {loading ? (
        <div className="py-4 text-center text-xs text-slate-400 font-bold flex items-center justify-center gap-2">
          <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-600" />
          <span>Loading student profiles...</span>
        </div>
      ) : children.length === 0 ? (
        <div className="p-4 rounded-2xl bg-indigo-50/50 border border-dashed border-indigo-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
              <User className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-black text-slate-900">No Child Accounts Enrolled</p>
              <p className="text-[11px] text-slate-500">
                Students do not need an email! Create their username &amp; password in 1 minute.
              </p>
            </div>
          </div>
          <Link
            href="/dashboard/parent/children"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition shrink-0"
          >
            + Add Child Account
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
          {children.map((child) => (
            <Link
              key={child.username}
              href="/dashboard/parent/children"
              className="p-3 rounded-2xl bg-slate-50 hover:bg-indigo-50/50 border border-slate-200/80 hover:border-indigo-300 transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 text-indigo-600 flex items-center justify-center text-xs font-black shrink-0 shadow-2xs group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  {child.name?.slice(0, 1).toUpperCase()}
                </div>
                <div className="overflow-hidden">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black text-slate-900 truncate">{child.name}</span>
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-200 text-slate-700 shrink-0">
                      {child.class_name}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-mono truncate">
                    @{child.username}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all shrink-0" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
