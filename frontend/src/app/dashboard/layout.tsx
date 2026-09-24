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
  TrendingUp,
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
  Video,
  Rocket,
  Sliders,
  Headphones,
  Briefcase,
  Building2,
  MessageSquarePlus
} from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { useToolConfigStore } from "@/store/useToolConfigStore";
import { getApiBase } from "@/lib/api";
import { useEffect, useState, Suspense } from "react";
import { SmartSearchBar } from "@/components/search/SmartSearchBar";
import { PageTransition } from "@/components/ui/PageTransition";
import { MobileTopHeader } from "@/components/layout/MobileTopHeader";
import { MobileBottomDock } from "@/components/layout/MobileBottomDock";
import { DevgyaLogo } from "@/components/common/DevgyaLogo";

function DashboardLayoutInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, logout, initSession, syncProfileFromServer } = useAppStore();
  const { isFeatureAllowed, fetchFromServer } = useToolConfigStore();
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetchFromServer();
  }, []);

  const isAgentsPage = pathname?.startsWith("/dashboard/agents");
  const isAIChatPage = 
    pathname?.startsWith("/dashboard/agents") ||
    pathname?.startsWith("/dashboard/chat") ||
    pathname?.startsWith("/dashboard/student/tutor");

  const agentParam = searchParams.get("agent");

  // Track user activity & feature usage for Admin Analytics
  useEffect(() => {
    if (!user?.email || !pathname) return;
    try {
      const activeFeatureName = 
        agentParam ? `Agent: ${agentParam.replace(/_/g, " ").toUpperCase()}` :
        pathname === "/dashboard" ? "Teacher Dashboard" :
        pathname === "/dashboard/student" ? "Student Dashboard" :
        pathname === "/dashboard/parent" ? "Parent Dashboard" :
        pathname === "/dashboard/generator" ? "Question Paper Generator" :
        pathname === "/dashboard/papers" ? "Paper Repository" :
        pathname === "/dashboard/classroom" ? "Lesson Planner" :
        pathname === "/dashboard/content" ? "Content Studio" :
        pathname === "/dashboard/english-coach" ? "English Speaking Coach" :
        pathname === "/dashboard/student/exam-prep" ? "AI Exam Prep Studio" :
        pathname === "/dashboard/student/tutor" ? "Socratic AI Tutor" :
        pathname === "/dashboard/student/practice" ? "Practice Quiz Runner" :
        pathname === "/dashboard/student/flashcards" ? "Flashcard Deck" :
        pathname === "/dashboard/student/revision" ? "Revision Studio" :
        pathname === "/dashboard/video-consultation" ? "Live Video AI Consultation" :
        pathname === "/dashboard/teacher-olympiad" ? "Teacher Skills Olympiad" :
        pathname.replace("/dashboard/", "").replace(/[-_/]/g, " ").toUpperCase();

      const featureId = agentParam ? `agent-${agentParam}` : pathname.replace("/dashboard/", "").replace(/[/]/g, "-") || "dashboard";
      // Page route navigation is strictly a presence/navigation event, NOT a feature usage.
      // Real feature usage is tracked only when user actually generates a paper, creates an assignment, takes a quiz, etc.
      const actionType = "navigate";

      const payload = {
        email: user.email,
        user_email: user.email,
        name: user.name || "",
        user_name: user.name || "",
        role: user.role || "teacher",
        user_role: user.role || "teacher",
        action: actionType,
        feature_id: featureId,
        feature_name: activeFeatureName,
        path: agentParam ? `${pathname}?agent=${agentParam}` : pathname
      };

      const baseUrl = getApiBase();
      fetch(`${baseUrl}/analytics/track`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      }).catch(() => {
        // Fallback relative rewrite
        fetch("/api/v1/analytics/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        }).catch(() => {});
      });
    } catch {
      // Non-blocking telemetry
    }
  }, [pathname, agentParam, user?.email]);

  useEffect(() => {
    setMounted(true);
    initSession();
    if (user?.email) {
      syncProfileFromServer(user.email);
    }

    // Auto-sync profile on window focus or tab visibility change across multiple devices
    const handleFocus = () => {
      if (user?.email) {
        syncProfileFromServer(user.email);
      }
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleFocus);
    return () => {
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleFocus);
    };
  }, [user?.email]);

  const handleSignOut = () => {
    logout();
    if (typeof window !== "undefined") {
      window.location.replace("/login");
    }
  };

  // Strict Authentication & Role-Based Access Control (RBAC) Route Guard
  useEffect(() => {
    if (!mounted) return;

    // Guest users or unauthenticated visitors cannot access the dashboard
    if (!user || !user.email || user.email.trim() === "" || user.id === "usr-guest") {
      router.replace("/login");
      return;
    }

    // Admin Feature Permission Route Guard
    if (user.role !== "super_admin") {
      const isAllowedByAdmin = isFeatureAllowed(pathname, agentParam || undefined);
      if (!isAllowedByAdmin) {
        if (user.role === "student") router.replace("/dashboard/student");
        else if (user.role === "parent") router.replace("/dashboard/parent");
        else if (user.role === "school") router.replace("/dashboard/school");
        else router.replace("/dashboard");
        return;
      }
    }

    if (user.role === "student") {
      const isStudentAllowed = 
        pathname.startsWith("/dashboard/student") ||
        pathname.startsWith("/dashboard/agents") ||
        pathname.startsWith("/dashboard/english-coach") ||
        pathname === "/dashboard/knowledge" ||
        pathname === "/dashboard/chat" ||
        pathname === "/dashboard/suggestions" ||
        pathname === "/dashboard/profile";

      if (!isStudentAllowed) {
        router.replace("/dashboard/student");
      }
    } else if (user.role === "parent") {
      const isParentAllowed = 
        pathname.startsWith("/dashboard/parent") ||
        pathname.startsWith("/dashboard/agents") ||
        pathname === "/dashboard/suggestions" ||
        pathname === "/dashboard/profile";

      if (!isParentAllowed) {
        router.replace("/dashboard/parent");
      }
    } else if (user.role === "school") {
      const isSchoolAllowed = 
        pathname.startsWith("/dashboard/school") ||
        pathname === "/dashboard/suggestions" ||
        pathname === "/dashboard/profile";

      if (!isSchoolAllowed) {
        router.replace("/dashboard/school");
      }
    } else if (user.role === "teacher") {
      const isTeacherAllowed = 
        pathname === "/dashboard" ||
        pathname.startsWith("/dashboard/generator") ||
        pathname.startsWith("/dashboard/ppt-generator") ||
        pathname.startsWith("/dashboard/assignments") ||
        pathname.startsWith("/dashboard/teacher-olympiad") ||
        pathname.startsWith("/dashboard/agents") ||
        pathname === "/dashboard/chat" ||
        pathname === "/dashboard/video-consultation" ||
        pathname.startsWith("/dashboard/english-coach") ||
        pathname.startsWith("/dashboard/recruitment") ||
        pathname === "/dashboard/suggestions" ||
        pathname === "/dashboard/profile";

      if (!isTeacherAllowed) {
        router.replace("/dashboard");
      }
    }
  }, [user, pathname, router, mounted, agentParam, isFeatureAllowed]);

  if (!mounted || !user || !user.email || user.id === "usr-guest") {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Role-based Nav Specifications — each agent is a direct sidebar link
  let navItems = [
    { label: "Teacher Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "AI PPT Generator", href: "/dashboard/ppt-generator", icon: Sliders },
    { label: "Question Generator", href: "/dashboard/generator", icon: Sparkles },
    { label: "AI Assignment Maker", href: "/dashboard/assignments", icon: FileText },
    { label: "Teacher Mentor AI", href: "/dashboard/agents?agent=teacher_mentor", icon: GraduationCap },
    { label: "Skill Enhance Program", href: "/dashboard/teacher-olympiad", icon: Trophy },
    { label: "Skill Enhance Practice", href: "/dashboard/teacher-olympiad/practice", icon: BookOpen },
    { label: "English Speaking Coach", href: "/dashboard/english-coach", icon: Headphones },
    { label: "Recruitment", href: "/dashboard/recruitment", icon: Briefcase },
    { label: "Suggestions", href: "/dashboard/suggestions", icon: MessageSquarePlus },
  ];

  if (user.role === "school") {
    navItems = [
      { label: "School Overview", href: "/dashboard/school", icon: Building2 },
      { label: "Stream Assessment AI", href: "/dashboard/school/stream-assessment", icon: Compass },
      { label: "Job Vacancies", href: "/dashboard/school/vacancies", icon: Briefcase },
      { label: "Applicants & Resumes", href: "/dashboard/school/applicants", icon: Users },
      { label: "Suggestions", href: "/dashboard/suggestions", icon: MessageSquarePlus },
      { label: "School Profile", href: "/dashboard/school/profile", icon: User },
    ];
  } else if (user.role === "student") {
    navItems = [
      { label: "Student Home", href: "/dashboard/student", icon: LayoutDashboard },
      { label: "English Speaking Coach", href: "/dashboard/english-coach", icon: Headphones },
      { label: "AI Tutor", href: "/dashboard/agents?agent=student_tutor", icon: Brain },
      { label: "AI Exam Prep", href: "/dashboard/student/exam-prep", icon: Trophy },
      { label: "Practice & Quizzes", href: "/dashboard/student/practice", icon: Target },
      { label: "Notion Smart Notes", href: "/dashboard/student/notes", icon: FileText },
      { label: "Pomodoro Timer", href: "/dashboard/student/timer", icon: Clock },
      { label: "Leaderboard", href: "/dashboard/student/leaderboard", icon: Trophy },
      { label: "Suggestions", href: "/dashboard/suggestions", icon: MessageSquarePlus },
    ];
  } else if (user.role === "parent") {
    navItems = [
      { label: "Parent Dashboard", href: "/dashboard/parent", icon: LayoutDashboard },
      { label: "Student Performance Report", href: "/dashboard/parent/analytics", icon: TrendingUp },
      { label: "My Children & Accounts", href: "/dashboard/parent/children", icon: Users },
      // Parent AI Agents
      { label: "Parenting Coach", href: "/dashboard/agents?agent=parent_coach", icon: HeartHandshake },
      // General AI Agents
      { label: "Research Assistant", href: "/dashboard/agents?agent=research_assistant", icon: Search },
      { label: "Suggestions", href: "/dashboard/suggestions", icon: MessageSquarePlus },
    ];
  }

  if (user.role === "super_admin") {
    navItems.push({ label: "Super Admin", href: "/admin", icon: ShieldCheck });
  }

  // Filter out any features disabled by the Admin from the Desktop Sidebar
  const visibleNavItems = navItems.filter((item) => {
    if (user.role === "super_admin") return true;
    const itemUrl = new URL(item.href, "http://x");
    const itemAgent = item.href.includes("agent=") ? item.href.split("agent=")[1] : undefined;
    return isFeatureAllowed(itemUrl.pathname, itemAgent);
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col md:flex-row">
      
      {/* DESKTOP & TABLET SIDEBAR */}
      <aside className="hidden md:flex flex-col w-64 glass-panel border-r border-slate-200 p-4 space-y-6 fixed inset-y-0 z-40 bg-white/95 backdrop-blur-xl">
        
        <Link href="/" className="flex items-center justify-start px-2 py-1 group transition-transform active:scale-98">
          <DevgyaLogo size="lg" className="scale-105 origin-left" showText={true} />
        </Link>
        <nav className="flex-1 space-y-1 overflow-y-auto pr-1">
          {visibleNavItems.map((item) => {
            const itemUrl = new URL(item.href, "http://x");
            const isActive = item.href.includes("?") 
              ? pathname === itemUrl.pathname && itemUrl.search === `?${searchParams.toString()}`
              : pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? "bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-sm"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center gap-3 truncate">
                  <item.icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-indigo-600' : 'text-slate-500'}`} />
                  <span className="truncate">{item.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="pt-3 border-t border-slate-200 space-y-1">
          <a
            href="mailto:dgepl.info@gmail.com"
            className="w-full px-3 py-2 text-[11px] text-slate-600 hover:text-indigo-600 font-bold flex items-center gap-2 hover:bg-indigo-50 rounded-xl transition-colors cursor-pointer group"
            title="Email Support"
          >
            <Headphones className="w-4 h-4 text-indigo-500 shrink-0" />
            <span className="truncate">Support: dgepl.info@gmail.com</span>
          </a>
          <button
            onClick={handleSignOut}
            className="w-full px-3 py-1.5 text-xs text-slate-600 hover:text-red-600 font-bold flex items-center gap-2.5 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-slate-400" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      <div className={`flex-1 md:pl-64 flex flex-col ${
        isAIChatPage 
          ? "h-[100dvh] max-h-[100dvh] overflow-hidden pb-[5.25rem] md:h-screen md:max-h-screen md:overflow-hidden md:pb-0" 
          : "min-h-screen pb-36 md:pb-8"
      }`}>
        
        <MobileTopHeader />
        
        <header className="hidden md:flex h-16 border-b border-slate-200 px-6 sm:px-8 items-center justify-between bg-white/95 backdrop-blur-md sticky top-0 z-30 shadow-xs">
          
          <div className="flex-1 max-w-lg">
            <SmartSearchBar />
          </div>

          <div className="flex items-center gap-3 sm:gap-4 ml-4">
            
            {/* VERIFIED LOCKED USER ROLE BADGE */}
            <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-2xl border text-xs font-black shadow-xs ${
              user.role === 'teacher' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
              user.role === 'student' ? 'bg-purple-50 text-purple-700 border-purple-200' :
              user.role === 'parent' ? 'bg-rose-50 text-rose-700 border-rose-200' :
              'bg-slate-900 text-white border-slate-800'
            }`}>
              {user.role === 'teacher' && <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />}
              {user.role === 'student' && <Users className="w-3.5 h-3.5 text-purple-600" />}
              {user.role === 'parent' && <HeartHandshake className="w-3.5 h-3.5 text-rose-600" />}
              {user.role === 'super_admin' && <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />}
              <span className="capitalize">{user.role ? user.role.replace('_', ' ') : 'Teacher'} Portal</span>
            </div>

            <Link
              href="/dashboard/profile"
              className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 transition-all cursor-pointer group"
              title="View Profile"
            >
              <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center font-black text-white text-xs shadow-xs overflow-hidden">
                {user.avatarUrl && user.avatarUrl.trim().length > 0 ? (
                  <img src={user.avatarUrl} alt={user.name || "User"} className="w-full h-full object-cover" />
                ) : (
                  <span>{user.name?.trim() ? user.name.trim().charAt(0).toUpperCase() : (user.email ? user.email.charAt(0).toUpperCase() : "U")}</span>
                )}
              </div>
            </Link>

          </div>
        </header>

        <main className={`${
          isAIChatPage 
            ? "p-1.5 sm:p-3 md:p-6 lg:p-8 flex-1 w-full max-w-full flex flex-col min-h-0 overflow-hidden" 
            : isAgentsPage 
              ? "p-2 sm:p-3 flex-1 w-full max-w-full overflow-x-hidden" 
              : "p-3 sm:p-6 lg:p-8 flex-1 w-full max-w-full overflow-x-hidden"
        }`}>
          <PageTransition className={isAIChatPage ? "h-full flex-1 flex flex-col min-h-0 w-full" : "w-full"}>
            {children}
          </PageTransition>
        </main>

        {!isAIChatPage && (
          <footer className="mt-auto px-4 sm:px-8 py-3.5 mb-14 md:mb-0 bg-transparent flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
            <p className="text-[11px] sm:text-xs text-slate-500 font-semibold w-full text-center">
              &copy; 2026 DEVGYA GLOBAL EDUTECH PRIVATE LIMITED. All rights reserved.
            </p>
          </footer>
        )}

      </div>

      {/* ROLE-SPECIFIC NATIVE MOBILE BOTTOM NAVBAR DOCK */}
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

