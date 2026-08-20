"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { 
  Menu, 
  X, 
  User, 
  LogOut, 
  ChevronRight, 
  LayoutDashboard, 
  Sparkles, 
  BookOpen, 
  ScanText, 
  GraduationCap, 
  Activity, 
  MessageSquare, 
  Search, 
  Layers, 
  Video, 
  Brain, 
  Trophy, 
  GitFork, 
  Clock, 
  Compass, 
  Flame, 
  Target, 
  FileText, 
  HeartHandshake, 
  ShieldCheck 
} from "lucide-react";
import { useAppStore } from "@/store/useAppStore";

export function MobileTopHeader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user, logout } = useAppStore();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleSignOut = () => {
    logout();
    if (typeof window !== "undefined") {
      window.location.href = "/";
    }
  };

  const role = user?.role || "teacher";

  // Build full role-spec nav items matching desktop sidebar exactly
  let navItems = [
    { label: "Teacher Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Question Generator", href: "/dashboard/generator", icon: Sparkles },
    { label: "OCR Scanner", href: "/dashboard/ocr", icon: ScanText },
    { label: "Teacher Mentor AI", href: "/dashboard/agents?agent=teacher_mentor", icon: GraduationCap },
    { label: "Analytics AI", href: "/dashboard/agents?agent=analytics_assistant", icon: Activity },
    { label: "English Coach", href: "/dashboard/agents?agent=english_coach", icon: MessageSquare },
    { label: "Research Assistant", href: "/dashboard/agents?agent=research_assistant", icon: Search },
    { label: "Document AI", href: "/dashboard/agents?agent=document_assistant", icon: Layers },
    { label: "Video Consultation", href: "/dashboard/video-consultation", icon: Video },
  ];

  if (role === "student") {
    navItems = [
      { label: "Student Home", href: "/dashboard/student", icon: LayoutDashboard },
      { label: "AI Tutor", href: "/dashboard/agents?agent=student_tutor", icon: Brain },
      { label: "AI Flashcards", href: "/dashboard/student/flashcards", icon: Layers },
      { label: "Exam Strategist", href: "/dashboard/agents?agent=exam_strategist", icon: Trophy },
      { label: "Revision Assistant", href: "/dashboard/agents?agent=revision_assistant", icon: GitFork },
      { label: "Study Planner", href: "/dashboard/agents?agent=study_planner", icon: Clock },
      { label: "Career Counselor", href: "/dashboard/agents?agent=career_counselor", icon: Compass },
      { label: "Motivation Coach", href: "/dashboard/agents?agent=motivation_coach", icon: Flame },
      { label: "English Coach", href: "/dashboard/agents?agent=english_coach", icon: MessageSquare },
      { label: "Research Assistant", href: "/dashboard/agents?agent=research_assistant", icon: Search },
      { label: "Document AI", href: "/dashboard/agents?agent=document_assistant", icon: Layers },
      { label: "Video Consultation", href: "/dashboard/video-consultation", icon: Video },
      { label: "AI Exam Prep", href: "/dashboard/student/exam-prep", icon: Trophy },
      { label: "Practice & Quizzes", href: "/dashboard/student/practice", icon: Target },
      { label: "Notion Smart Notes", href: "/dashboard/student/notes", icon: FileText },
      { label: "Pomodoro Timer", href: "/dashboard/student/timer", icon: Clock },
      { label: "Leaderboard", href: "/dashboard/student/leaderboard", icon: Trophy },
    ];
  } else if (role === "parent") {
    navItems = [
      { label: "Parent Dashboard", href: "/dashboard/parent", icon: LayoutDashboard },
      { label: "Parenting Coach", href: "/dashboard/agents?agent=parent_coach", icon: HeartHandshake },
      { label: "English Coach", href: "/dashboard/agents?agent=english_coach", icon: MessageSquare },
      { label: "Research Assistant", href: "/dashboard/agents?agent=research_assistant", icon: Search },
      { label: "Video Consultation", href: "/dashboard/video-consultation", icon: Video },
    ];
  }

  if (role === "super_admin") {
    navItems.push({ label: "Super Admin", href: "/admin", icon: ShieldCheck });
  }

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-slate-200 px-4 py-3 flex items-center justify-between shadow-xs md:hidden">
        {/* LOGO BRANDING */}
        <Link href="/dashboard" className="flex items-center gap-2">
          <img 
            src="/logo.png" 
            alt="DEVGYA GLOBAL" 
            className="h-10 w-auto object-contain mix-blend-multiply" 
          />
        </Link>

        {/* RIGHT CONTROLS */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black uppercase tracking-wider bg-indigo-50 border border-indigo-200 text-indigo-700 px-2.5 py-1 rounded-full">
            {role.replace('_', ' ')}
          </span>

          <button
            onClick={() => setDrawerOpen(true)}
            className="p-2.5 rounded-xl bg-slate-100 text-slate-800 hover:bg-slate-200 transition-colors relative"
            aria-label="Open Navigation Menu"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* SLIDE-OVER PROFILE & ALL SIDEBAR OPTIONS DRAWER */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex justify-end md:hidden">
          <div className="w-5/6 max-w-sm bg-white h-full p-6 space-y-6 shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-300">
            
            <div className="space-y-5">
              {/* DRAWER HEADER WITH USER INFO & CLOSE BUTTON */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-md">
                    {user?.name?.charAt(0) || "U"}
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-slate-900 truncate max-w-[150px]">
                      {user?.name || "User Account"}
                    </h3>
                    <p className="text-[10px] text-indigo-600 font-bold capitalize">{role.replace('_', ' ')} Account</p>
                  </div>
                </div>

                <button
                  onClick={() => setDrawerOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* ROLE-BASED SIDEBAR MENU ITEMS */}
              <div className="space-y-1">
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-2 mb-2">
                  Navigation & Tools ({navItems.length})
                </p>

                {navItems.map((item) => {
                  const IconComp = item.icon;
                  const itemUrl = new URL(item.href, "http://x");
                  const isActive = item.href.includes("?") 
                    ? pathname === itemUrl.pathname && itemUrl.search === `?${searchParams.toString()}`
                    : pathname === item.href;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setDrawerOpen(false)}
                      className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                        isActive
                          ? "bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-xs"
                          : "text-slate-700 hover:bg-slate-50 hover:text-indigo-600"
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <IconComp className={`w-4 h-4 ${isActive ? "text-indigo-600" : "text-slate-500"}`} />
                        <span>{item.label}</span>
                      </span>
                      <ChevronRight className={`w-4 h-4 ${isActive ? "text-indigo-600" : "text-slate-300"}`} />
                    </Link>
                  );
                })}

                {/* PROFILE SETTINGS */}
                <Link
                  href="/dashboard/profile"
                  onClick={() => setDrawerOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    pathname === "/dashboard/profile"
                      ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <User className="w-4 h-4 text-slate-500" />
                    <span>My Profile</span>
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-300" />
                </Link>
              </div>
            </div>

            {/* SIGN OUT */}
            <div className="pt-4 border-t border-slate-100 space-y-2">
              <button
                onClick={handleSignOut}
                className="w-full py-3 bg-red-50 hover:bg-red-100 text-red-600 font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors active:scale-95"
              >
                <LogOut className="w-4 h-4 text-red-500" />
                <span>Sign Out Account</span>
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
