"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { 
  LayoutDashboard, 
  Sparkles, 
  ScanText, 
  BookOpen, 
  FileText, 
  User, 
  ShieldCheck, 
  LogOut, 
  Cpu, 
  Plus,
  MessageSquare,
  GraduationCap,
  Zap,
  Gamepad2,
  Mic,
  Activity,
  Brain,
  Target,
  Layers,
  Trophy,
  Clock,
  HeartHandshake,
  Users,
  Bell,
  CheckCircle2,
  UsersRound,
  Bot,
  GitFork,
  Code,
  Settings,
  DollarSign,
  Compass,
  Flame,
  Search,
  Video
} from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { useEffect, useState, Suspense } from "react";
import { SmartSearchBar } from "@/components/search/SmartSearchBar";
import { PageTransition } from "@/components/ui/PageTransition";
import { MobileTopHeader } from "@/components/layout/MobileTopHeader";
import { MobileBottomDock } from "@/components/layout/MobileBottomDock";

function DashboardLayoutInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, logout } = useAppStore();
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isAgentsPage = pathname?.startsWith("/dashboard/agents");

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSignOut = () => {
    logout();
    if (typeof window !== "undefined") {
      window.location.href = "/";
    }
  };

  // Strict Role-Based Access Control (RBAC) Route Guard
  useEffect(() => {
    if (!mounted || !user || !user.role) return;

    if (user.role === "student") {
      const isStudentAllowed = 
        pathname.startsWith("/dashboard/student") ||
        pathname.startsWith("/dashboard/agents") ||
        pathname === "/dashboard/knowledge" ||
        pathname === "/dashboard/chat" ||
        pathname === "/dashboard/video-consultation" ||
        pathname === "/dashboard/profile";

      if (!isStudentAllowed) {
        router.replace("/dashboard/student");
      }
    } else if (user.role === "parent") {
      const isParentAllowed = 
        pathname.startsWith("/dashboard/parent") ||
        pathname.startsWith("/dashboard/agents") ||
        pathname === "/dashboard/video-consultation" ||
        pathname === "/dashboard/profile";

      if (!isParentAllowed) {
        router.replace("/dashboard/parent");
      }
    } else if (user.role === "teacher") {
      if (pathname.startsWith("/dashboard/student") || pathname.startsWith("/dashboard/parent")) {
        router.replace("/dashboard");
      }
    }
  }, [user, pathname, router, mounted]);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Role-based Nav Specifications — each agent is a direct sidebar link
  let navItems = [
    { label: "Teacher Dashboard", href: "/dashboard", icon: LayoutDashboard },
    // Teacher Core Studios
    { label: "Question Generator", href: "/dashboard/generator", icon: Sparkles },
    { label: "AI Lesson Planner", href: "/dashboard/lesson-planner", icon: BookOpen },
    { label: "OCR Scanner", href: "/dashboard/ocr", icon: ScanText },
    // Teacher AI Agents
    { label: "Teacher Mentor AI", href: "/dashboard/agents?agent=teacher_mentor", icon: GraduationCap },
    { label: "Analytics AI", href: "/dashboard/agents?agent=analytics_assistant", icon: Activity },
    // General AI Agents & Tools
    { label: "English Coach", href: "/dashboard/agents?agent=english_coach", icon: MessageSquare },
    { label: "Research Assistant", href: "/dashboard/agents?agent=research_assistant", icon: Search },
    { label: "Document AI", href: "/dashboard/agents?agent=document_assistant", icon: Layers },
    { label: "Video Consultation", href: "/dashboard/video-consultation", icon: Video },
  ];

  if (user.role === "student") {
    navItems = [
      { label: "Student Home", href: "/dashboard/student", icon: LayoutDashboard },
      // Student AI Agents
      { label: "AI Tutor", href: "/dashboard/agents?agent=student_tutor", icon: Brain },
      { label: "AI Flashcards", href: "/dashboard/student/flashcards", icon: Layers },
      { label: "Exam Strategist", href: "/dashboard/agents?agent=exam_strategist", icon: Trophy },
      { label: "Revision Assistant", href: "/dashboard/agents?agent=revision_assistant", icon: GitFork },
      { label: "Study Planner", href: "/dashboard/agents?agent=study_planner", icon: Clock },
      { label: "Career Counselor", href: "/dashboard/agents?agent=career_counselor", icon: Compass },
      { label: "Motivation Coach", href: "/dashboard/agents?agent=motivation_coach", icon: Flame },
      // General AI Agents
      { label: "English Coach", href: "/dashboard/agents?agent=english_coach", icon: MessageSquare },
      { label: "Research Assistant", href: "/dashboard/agents?agent=research_assistant", icon: Search },
      { label: "Document AI", href: "/dashboard/agents?agent=document_assistant", icon: Layers },
      // Other tools
      { label: "Video Consultation", href: "/dashboard/video-consultation", icon: Video },
      { label: "AI Exam Prep", href: "/dashboard/student/exam-prep", icon: Trophy },
      { label: "AI Chat Studio", href: "/dashboard/chat", icon: MessageSquare },
      { label: "Practice & Quizzes", href: "/dashboard/student/practice", icon: Target },
      { label: "Notion Smart Notes", href: "/dashboard/student/notes", icon: FileText },
      { label: "Pomodoro Timer", href: "/dashboard/student/timer", icon: Clock },
      { label: "Leaderboard", href: "/dashboard/student/leaderboard", icon: Trophy },
    ];
  } else if (user.role === "parent") {
    navItems = [
      { label: "Parent Dashboard", href: "/dashboard/parent", icon: LayoutDashboard },
      // Parent AI Agents
      { label: "Parenting Coach", href: "/dashboard/agents?agent=parent_coach", icon: HeartHandshake },
      // General AI Agents
      { label: "English Coach", href: "/dashboard/agents?agent=english_coach", icon: MessageSquare },
      { label: "Research Assistant", href: "/dashboard/agents?agent=research_assistant", icon: Search },
      // Other tools
      { label: "Video Consultation", href: "/dashboard/video-consultation", icon: Video },
    ];
  }

  if (user.role === "super_admin") {
    navItems.push({ label: "Super Admin", href: "/admin", icon: ShieldCheck });
  }



  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col md:flex-row">
      
      {/* DESKTOP & TABLET SIDEBAR */}
      <aside className="hidden md:flex flex-col w-64 glass-panel border-r border-slate-200 p-4 space-y-6 fixed inset-y-0 z-40 bg-white/95 backdrop-blur-xl">
        
        {/* Brand Header - Prominent Logo */}
        <Link href="/" className="flex items-center justify-start px-2 py-1 group">
          <img
            src="/logo.png"
            alt="DEVGYA GLOBAL EDUTECH PRIVATE LIMITED"
            className="h-16 w-auto max-h-20 max-w-[210px] object-contain mix-blend-multiply group-hover:scale-105 transition-transform"
          />
        </Link>

        {/* Primary Nav */}
        <nav className="flex-1 space-y-1 overflow-y-auto pr-1">
          {navItems.map((item) => {
            // Match active state: for agent links compare full path+query, for others just pathname
            const itemUrl = new URL(item.href, "http://x");
            const isActive = item.href.includes("?") 
              ? pathname === itemUrl.pathname && itemUrl.search === `?${searchParams.toString()}`
              : pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? "bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-sm"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <item.icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-500'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Card & Logout */}
        <div className="pt-3 border-t border-slate-200 space-y-2">
          <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-3">
            <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-white text-xs">
              {user.name.charAt(0)}
            </div>
            <div className="flex-1 truncate">
              <p className="text-xs font-bold text-slate-900 truncate">{user.name}</p>
              <p className="text-[10px] text-indigo-600 font-bold capitalize">{user.role.replace('_', ' ')}</p>
            </div>
          </div>

          <button
            onClick={handleSignOut}
            className="w-full px-3 py-1.5 text-xs text-slate-600 hover:text-red-600 font-bold flex items-center gap-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>

      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 md:pl-64 flex flex-col min-h-screen pb-20 md:pb-8">
        
        {/* NATIVE MOBILE HEADER */}
        <MobileTopHeader />
        
        {/* TOP BAR WITH ROLE SWITCHER & AI OS SHORTCUTS (DESKTOP ONLY) */}
        <header className="hidden md:flex h-16 border-b border-slate-200 bg-white/85 backdrop-blur-md px-4 sm:px-6 items-center justify-between sticky top-0 z-30 gap-4">
          
          <SmartSearchBar />

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            
            {/* FIXED USER ROLE BADGE (ROLE SWITCHING DISABLED IN PRODUCTION) */}
            <div className="flex items-center gap-1.5 bg-indigo-50 px-3 py-1.5 rounded-2xl border border-indigo-200 text-xs font-extrabold text-indigo-700">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
              <span className="capitalize">{user.role || "User"} Portal</span>
            </div>

          </div>
        </header>

        {/* PAGE CONTENT WITH SMOOTH ANIMATIONS */}
        <main className={`${isAgentsPage ? 'p-2 sm:p-3' : 'p-4 sm:p-6 lg:p-8'} flex-1`}>
          <PageTransition>
            {children}
          </PageTransition>
        </main>

      </div>

      {/* MOBILE BOTTOM NAV BAR */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-t border-slate-200/80 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] px-2 py-1.5 flex items-center justify-around md:hidden pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        {(() => {
          const homeHref = user.role === "student" ? "/dashboard/student" : user.role === "parent" ? "/dashboard/parent" : "/dashboard";
          const mobileNavItems = [
            { label: "Home", href: homeHref, icon: LayoutDashboard },
            { label: "AI Agents", href: "/dashboard/agents", icon: Bot },
            { label: "Chat", href: "/dashboard/chat", icon: MessageSquare },
          ];
          return mobileNavItems.map((item) => {
            const isActive = pathname === item.href || (item.href === "/dashboard/agents" && pathname?.startsWith("/dashboard/agents"));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center gap-0.5 px-3 py-1 rounded-2xl transition-all duration-200 relative active:scale-95 ${
                  isActive
                    ? "text-indigo-600 font-extrabold"
                    : "text-slate-400 hover:text-slate-600 font-medium"
                }`}
              >
                {isActive && (
                  <span className="absolute -top-1.5 w-6 h-0.5 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-full" />
                )}
                <div className={`p-1 rounded-xl transition-all ${isActive ? "bg-indigo-50/80 scale-110" : ""}`}>
                  <item.icon className={`w-5 h-5 ${isActive ? "text-indigo-600" : "text-slate-400"}`} />
                </div>
                <span className="text-[10px] tracking-tight">{item.label}</span>
              </Link>
            );
          });
        })()}
        {/* More button */}
        <button
          onClick={() => setMobileMenuOpen(true)}
          className={`flex flex-col items-center justify-center gap-0.5 px-3 py-1 rounded-2xl transition-all duration-200 active:scale-95 ${
            mobileMenuOpen ? "text-indigo-600 font-extrabold" : "text-slate-400 hover:text-slate-600 font-medium"
          }`}
        >
          <div className={`p-1 rounded-xl transition-all ${mobileMenuOpen ? "bg-indigo-50/80 scale-110" : ""}`}>
            <User className={`w-5 h-5 ${mobileMenuOpen ? "text-indigo-600" : "text-slate-400"}`} />
          </div>
          <span className="text-[10px] tracking-tight">More</span>
        </button>
      </nav>

      {/* MOBILE MORE MENU OVERLAY */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[60] md:hidden">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/30 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setMobileMenuOpen(false)}
          />
          {/* Slide-up panel */}
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl animate-in slide-in-from-bottom duration-300 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
            {/* Handle bar */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 bg-slate-300 rounded-full" />
            </div>

            <div className="px-5 pb-4 space-y-3">
              {/* User Profile Card */}
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center font-bold text-white text-sm shadow-md">
                  {user.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-900 truncate">{user.name}</p>
                  <p className="text-xs text-indigo-600 font-bold capitalize">{user.role.replace('_', ' ')}</p>
                </div>
                <div className="px-2 py-1 bg-indigo-50 rounded-lg border border-indigo-200">
                  <ShieldCheck className="w-4 h-4 text-indigo-600" />
                </div>
              </div>

              {/* Menu Items */}
              <div className="space-y-1">
                <Link
                  href="/dashboard/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors active:scale-[0.98]"
                >
                  <User className="w-4.5 h-4.5 text-slate-500" />
                  <span>My Profile</span>
                </Link>
                <Link
                  href="/dashboard/voice"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors active:scale-[0.98]"
                >
                  <Mic className="w-4.5 h-4.5 text-slate-500" />
                  <span>Voice AI Coach</span>
                </Link>
                <Link
                  href="/dashboard/video-consultation"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors active:scale-[0.98]"
                >
                  <Video className="w-4.5 h-4.5 text-slate-500" />
                  <span>Video Consultation</span>
                </Link>
              </div>

              {/* Divider */}
              <div className="border-t border-slate-200" />

              {/* Sign Out */}
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleSignOut();
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red-600 hover:bg-red-50 transition-colors active:scale-[0.98]"
              >
                <LogOut className="w-4.5 h-4.5 text-red-500" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NATIVE MOBILE BOTTOM NAVIGATION DOCK */}
      <MobileBottomDock />

    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <DashboardLayoutInner>{children}</DashboardLayoutInner>
    </Suspense>
  );
}

