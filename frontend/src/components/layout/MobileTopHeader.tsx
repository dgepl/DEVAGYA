"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Bell, 
  Menu, 
  X, 
  User, 
  LogOut, 
  ShieldCheck, 
  ChevronRight, 
  Sparkles, 
  BookOpen, 
  ScanText, 
  Video, 
  HeartHandshake, 
  Brain,
  Zap
} from "lucide-react";
import { useAppStore } from "@/store/useAppStore";

export function MobileTopHeader() {
  const router = useRouter();
  const { user, logout } = useAppStore();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleSignOut = () => {
    logout();
    if (typeof window !== "undefined") {
      window.location.href = "/";
    }
  };

  const role = user?.role || "teacher";

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-slate-200 px-4 py-3 flex items-center justify-between shadow-xs md:hidden">
        {/* LOGO BRANDING */}
        <Link href="/dashboard" className="flex items-center gap-2">
          <img 
            src="/logo.png" 
            alt="DEVGYA GLOBAL" 
            className="h-9 w-auto object-contain mix-blend-multiply" 
          />
        </Link>

        {/* RIGHT CONTROLS */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black uppercase tracking-wider bg-indigo-50 border border-indigo-200 text-indigo-700 px-2.5 py-1 rounded-full">
            {role}
          </span>

          <button
            onClick={() => setDrawerOpen(true)}
            className="p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors relative"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* SLIDE-OVER PROFILE & QUICK NAV DRAWER */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex justify-end md:hidden">
          <div className="w-4/5 max-w-xs bg-white h-full p-6 space-y-6 shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-300">
            
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-md">
                    {user?.name?.charAt(0) || "U"}
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-slate-900 truncate max-w-[130px]">
                      {user?.name || "User Account"}
                    </h3>
                    <p className="text-[10px] text-slate-500 font-bold capitalize">{role} Account</p>
                  </div>
                </div>

                <button
                  onClick={() => setDrawerOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* DRAWER NAVIGATION */}
              <div className="space-y-1">
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-2 mb-2">
                  Navigation Menu
                </p>

                {role === "teacher" && (
                  <>
                    <Link href="/dashboard" onClick={() => setDrawerOpen(false)} className="flex items-center justify-between p-2.5 rounded-xl hover:bg-indigo-50 text-xs font-bold text-slate-700 hover:text-indigo-600">
                      <span className="flex items-center gap-2.5"><Sparkles className="w-4 h-4 text-indigo-600" /> Teacher Dashboard</span>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </Link>
                    <Link href="/dashboard/generator" onClick={() => setDrawerOpen(false)} className="flex items-center justify-between p-2.5 rounded-xl hover:bg-indigo-50 text-xs font-bold text-slate-700 hover:text-indigo-600">
                      <span className="flex items-center gap-2.5"><Zap className="w-4 h-4 text-amber-500" /> Question Generator</span>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </Link>
                    <Link href="/dashboard/lesson-planner" onClick={() => setDrawerOpen(false)} className="flex items-center justify-between p-2.5 rounded-xl hover:bg-indigo-50 text-xs font-bold text-slate-700 hover:text-indigo-600">
                      <span className="flex items-center gap-2.5"><BookOpen className="w-4 h-4 text-emerald-600" /> 5E Lesson Planner</span>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </Link>
                    <Link href="/dashboard/ocr" onClick={() => setDrawerOpen(false)} className="flex items-center justify-between p-2.5 rounded-xl hover:bg-indigo-50 text-xs font-bold text-slate-700 hover:text-indigo-600">
                      <span className="flex items-center gap-2.5"><ScanText className="w-4 h-4 text-cyan-600" /> OCR Vision Scanner</span>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </Link>
                  </>
                )}

                {role === "student" && (
                  <>
                    <Link href="/dashboard/student" onClick={() => setDrawerOpen(false)} className="flex items-center justify-between p-2.5 rounded-xl hover:bg-indigo-50 text-xs font-bold text-slate-700 hover:text-indigo-600">
                      <span className="flex items-center gap-2.5"><Brain className="w-4 h-4 text-indigo-600" /> Student Home</span>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </Link>
                    <Link href="/dashboard/agents?agent=student_tutor" onClick={() => setDrawerOpen(false)} className="flex items-center justify-between p-2.5 rounded-xl hover:bg-indigo-50 text-xs font-bold text-slate-700 hover:text-indigo-600">
                      <span className="flex items-center gap-2.5"><Sparkles className="w-4 h-4 text-purple-600" /> Socratic AI Tutor</span>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </Link>
                    <Link href="/dashboard/student/flashcards" onClick={() => setDrawerOpen(false)} className="flex items-center justify-between p-2.5 rounded-xl hover:bg-indigo-50 text-xs font-bold text-slate-700 hover:text-indigo-600">
                      <span className="flex items-center gap-2.5"><BookOpen className="w-4 h-4 text-emerald-600" /> Active Recall Flashcards</span>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </Link>
                  </>
                )}

                {role === "parent" && (
                  <>
                    <Link href="/dashboard/parent" onClick={() => setDrawerOpen(false)} className="flex items-center justify-between p-2.5 rounded-xl hover:bg-indigo-50 text-xs font-bold text-slate-700 hover:text-indigo-600">
                      <span className="flex items-center gap-2.5"><HeartHandshake className="w-4 h-4 text-pink-600" /> Parent Dashboard</span>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </Link>
                    <Link href="/dashboard/agents?agent=parent_coach" onClick={() => setDrawerOpen(false)} className="flex items-center justify-between p-2.5 rounded-xl hover:bg-indigo-50 text-xs font-bold text-slate-700 hover:text-indigo-600">
                      <span className="flex items-center gap-2.5"><Sparkles className="w-4 h-4 text-indigo-600" /> AI Parenting Coach</span>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </Link>
                  </>
                )}

                <Link href="/dashboard/video-consultation" onClick={() => setDrawerOpen(false)} className="flex items-center justify-between p-2.5 rounded-xl hover:bg-indigo-50 text-xs font-bold text-slate-700 hover:text-indigo-600">
                  <span className="flex items-center gap-2.5"><Video className="w-4 h-4 text-rose-500" /> Video Mentoring Studio</span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </Link>
                <Link href="/dashboard/profile" onClick={() => setDrawerOpen(false)} className="flex items-center justify-between p-2.5 rounded-xl hover:bg-indigo-50 text-xs font-bold text-slate-700 hover:text-indigo-600">
                  <span className="flex items-center gap-2.5"><User className="w-4 h-4 text-slate-500" /> Account Settings</span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </Link>
              </div>
            </div>

            {/* SIGN OUT */}
            <div className="pt-4 border-t border-slate-100">
              <button
                onClick={handleSignOut}
                className="w-full py-3 bg-red-50 hover:bg-red-100 text-red-600 font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign Out Account
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
