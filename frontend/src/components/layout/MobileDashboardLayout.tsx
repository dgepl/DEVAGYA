"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, 
  Sparkles, 
  BookOpen, 
  ScanText, 
  Bot, 
  Zap, 
  User, 
  LogOut, 
  Menu, 
  X, 
  GraduationCap, 
  Activity, 
  Brain, 
  Trophy, 
  HeartHandshake, 
  Video, 
  MessageSquare, 
  ChevronRight,
  ShieldCheck
} from "lucide-react";
import { useAppStore } from "@/store/useAppStore";

export function MobileDashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
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

  // Role-based bottom tabs
  const teacherBottomTabs = [
    { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { label: "Generator", href: "/dashboard/generator", icon: Sparkles },
    { label: "Speed Dial", href: "/dashboard/generator", isSpeedDial: true, icon: Zap },
    { label: "Lesson Plan", href: "/dashboard/lesson-planner", icon: BookOpen },
    { label: "AI Mentor", href: "/dashboard/agents?agent=teacher_mentor", icon: Bot },
  ];

  const studentBottomTabs = [
    { label: "Home", href: "/dashboard/student", icon: LayoutDashboard },
    { label: "AI Tutor", href: "/dashboard/agents?agent=student_tutor", icon: Brain },
    { label: "Speed Dial", href: "/dashboard/student/practice", isSpeedDial: true, icon: Zap },
    { label: "Flashcards", href: "/dashboard/student/flashcards", icon: BookOpen },
    { label: "Exam Prep", href: "/dashboard/student/exam-prep", icon: Trophy },
  ];

  const parentBottomTabs = [
    { label: "Home", href: "/dashboard/parent", icon: LayoutDashboard },
    { label: "Coach", href: "/dashboard/agents?agent=parent_coach", icon: HeartHandshake },
    { label: "Speed Dial", href: "/dashboard/video-consultation", isSpeedDial: true, icon: Zap },
    { label: "Consultation", href: "/dashboard/video-consultation", icon: Video },
    { label: "Profile", href: "/dashboard/profile", icon: User },
  ];

  const bottomTabs = role === "student" ? studentBottomTabs : role === "parent" ? parentBottomTabs : teacherBottomTabs;

  return (
    <div className="min-h-screen bg-slate-50 md:hidden flex flex-col pb-20 relative">
      
      {/* MOBILE TOP HEADER BAR */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-3 flex items-center justify-between shadow-xs">
        <Link href="/dashboard" className="flex items-center gap-2">
          <img 
            src="/logo.png" 
            alt="DEVGYA GLOBAL" 
            className="h-10 w-auto max-h-10 object-contain mix-blend-multiply" 
          />
        </Link>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-extrabold uppercase tracking-wider bg-indigo-50 border border-indigo-200 text-indigo-700 px-2.5 py-1 rounded-full">
            {role.toUpperCase()}
          </span>

          <button
            onClick={() => setDrawerOpen(true)}
            className="p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 p-4">
        {children}
      </main>

      {/* MOBILE BOTTOM NAVIGATION TABS */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-t border-slate-200 px-2 py-2 flex items-center justify-around shadow-xl">
        {bottomTabs.map((tab, idx) => {
          if (tab.isSpeedDial) {
            return (
              <Link
                key={idx}
                href={tab.href}
                className="w-12 h-12 -mt-7 rounded-full bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/40 active:scale-95 transition-transform"
              >
                <Zap className="w-6 h-6 text-amber-300 animate-pulse" />
              </Link>
            );
          }

          const isActive = pathname === tab.href;
          const Icon = tab.icon;

          return (
            <Link
              key={idx}
              href={tab.href}
              className={`flex flex-col items-center gap-1 text-[10px] font-extrabold transition-colors ${
                isActive ? "text-indigo-600" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? "text-indigo-600 scale-110" : ""}`} />
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* SLIDE-OUT MOBILE NAVIGATION DRAWER */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex justify-end">
          <div className="w-4/5 max-w-xs bg-white h-full p-6 space-y-6 shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-300">
            
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                    {user?.name?.charAt(0) || "U"}
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 truncate max-w-[120px]">
                      {user?.name || "User Account"}
                    </h3>
                    <p className="text-[10px] text-slate-500 font-semibold capitalize">{role} Account</p>
                  </div>
                </div>

                <button
                  onClick={() => setDrawerOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* DRAWER LINKS */}
              <div className="space-y-1">
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-2 mb-2">
                  Quick Navigation
                </p>

                {role === "teacher" && (
                  <>
                    <Link href="/dashboard" onClick={() => setDrawerOpen(false)} className="flex items-center justify-between p-2.5 rounded-xl hover:bg-indigo-50 text-xs font-bold text-slate-700 hover:text-indigo-600">
                      <span className="flex items-center gap-2.5"><LayoutDashboard className="w-4 h-4 text-indigo-600" /> Teacher Dashboard</span>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </Link>
                    <Link href="/dashboard/generator" onClick={() => setDrawerOpen(false)} className="flex items-center justify-between p-2.5 rounded-xl hover:bg-indigo-50 text-xs font-bold text-slate-700 hover:text-indigo-600">
                      <span className="flex items-center gap-2.5"><Sparkles className="w-4 h-4 text-amber-500" /> Question Generator</span>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </Link>
                    <Link href="/dashboard/lesson-planner" onClick={() => setDrawerOpen(false)} className="flex items-center justify-between p-2.5 rounded-xl hover:bg-indigo-50 text-xs font-bold text-slate-700 hover:text-indigo-600">
                      <span className="flex items-center gap-2.5"><BookOpen className="w-4 h-4 text-emerald-600" /> AI Lesson Planner</span>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </Link>
                    <Link href="/dashboard/ocr" onClick={() => setDrawerOpen(false)} className="flex items-center justify-between p-2.5 rounded-xl hover:bg-indigo-50 text-xs font-bold text-slate-700 hover:text-indigo-600">
                      <span className="flex items-center gap-2.5"><ScanText className="w-4 h-4 text-cyan-600" /> OCR Textbook Scanner</span>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </Link>
                  </>
                )}

                {role === "student" && (
                  <>
                    <Link href="/dashboard/student" onClick={() => setDrawerOpen(false)} className="flex items-center justify-between p-2.5 rounded-xl hover:bg-indigo-50 text-xs font-bold text-slate-700 hover:text-indigo-600">
                      <span className="flex items-center gap-2.5"><LayoutDashboard className="w-4 h-4 text-indigo-600" /> Student Home</span>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </Link>
                    <Link href="/dashboard/agents?agent=student_tutor" onClick={() => setDrawerOpen(false)} className="flex items-center justify-between p-2.5 rounded-xl hover:bg-indigo-50 text-xs font-bold text-slate-700 hover:text-indigo-600">
                      <span className="flex items-center gap-2.5"><Brain className="w-4 h-4 text-purple-600" /> AI Student Tutor</span>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </Link>
                    <Link href="/dashboard/student/flashcards" onClick={() => setDrawerOpen(false)} className="flex items-center justify-between p-2.5 rounded-xl hover:bg-indigo-50 text-xs font-bold text-slate-700 hover:text-indigo-600">
                      <span className="flex items-center gap-2.5"><BookOpen className="w-4 h-4 text-emerald-600" /> AI Flashcards</span>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </Link>
                  </>
                )}

                {role === "parent" && (
                  <>
                    <Link href="/dashboard/parent" onClick={() => setDrawerOpen(false)} className="flex items-center justify-between p-2.5 rounded-xl hover:bg-indigo-50 text-xs font-bold text-slate-700 hover:text-indigo-600">
                      <span className="flex items-center gap-2.5"><LayoutDashboard className="w-4 h-4 text-indigo-600" /> Parent Dashboard</span>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </Link>
                    <Link href="/dashboard/agents?agent=parent_coach" onClick={() => setDrawerOpen(false)} className="flex items-center justify-between p-2.5 rounded-xl hover:bg-indigo-50 text-xs font-bold text-slate-700 hover:text-indigo-600">
                      <span className="flex items-center gap-2.5"><HeartHandshake className="w-4 h-4 text-pink-600" /> Parenting Coach</span>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </Link>
                  </>
                )}

                <Link href="/dashboard/video-consultation" onClick={() => setDrawerOpen(false)} className="flex items-center justify-between p-2.5 rounded-xl hover:bg-indigo-50 text-xs font-bold text-slate-700 hover:text-indigo-600">
                  <span className="flex items-center gap-2.5"><Video className="w-4 h-4 text-red-500" /> Video Mentoring</span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </Link>
              </div>
            </div>

            {/* SIGN OUT BUTTON */}
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

    </div>
  );
}
