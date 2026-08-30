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
  Video,
  Rocket
} from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { useToolConfigStore } from "@/store/useToolConfigStore";
import { ComingSoonView } from "@/components/common/ComingSoonView";
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
  const { user, logout, initSession, syncProfileFromServer, switchRole } = useAppStore();
  const { tools, getToolByPath, fetchFromServer } = useToolConfigStore();
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleRoleSwitch = (newRole: "teacher" | "student" | "parent") => {
    switchRole(newRole);
    if (newRole === "student") router.push("/dashboard/student");
    else if (newRole === "parent") router.push("/dashboard/parent");
    else router.push("/dashboard");
  };

  useEffect(() => {
    fetchFromServer();
  }, []);

  const isAgentsPage = pathname?.startsWith("/dashboard/agents");
  const isAIChatPage = 
    pathname?.startsWith("/dashboard/agents") ||
    pathname?.startsWith("/dashboard/chat") ||
    pathname?.startsWith("/dashboard/video-consultation") ||
    pathname?.startsWith("/dashboard/student/tutor") ||
    pathname?.startsWith("/dashboard/parent/coach") ||
    pathname?.startsWith("/dashboard/teacher-olympiad");

  const agentParam = searchParams.get("agent");

  // Check if current active page is marked as Coming Soon by Admin
  const currentComingSoonTool = (() => {
    if (
      pathname === "/dashboard" || 
      pathname === "/dashboard/student" || 
      pathname === "/dashboard/parent" ||
      pathname === "/dashboard/profile"
    ) {
      return null;
    }
    const matched = getToolByPath(pathname, agentParam || undefined);
    if (matched && matched.is_coming_soon) {
      return matched;
    }
    return null;
  })();

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
    { label: "AI Assignment Maker", href: "/dashboard/assignments", icon: FileText },
    { label: "Question Generator", href: "/dashboard/generator", icon: Sparkles },
    { label: "Teacher Mentor AI", href: "/dashboard/agents?agent=teacher_mentor", icon: GraduationCap },
    { label: "Skill Enhance Program", href: "/dashboard/teacher-olympiad", icon: Trophy },
    { label: "Skill Enhance Practice", href: "/dashboard/teacher-olympiad/practice", icon: BookOpen },
    { label: "Video Consultation", href: "/dashboard/video-consultation", icon: Video },
  ];

  if (user.role === "student") {
    navItems = [
      { label: "Student Home", href: "/dashboard/student", icon: LayoutDashboard },
      { label: "AI Tutor", href: "/dashboard/agents?agent=student_tutor", icon: Brain },
      { label: "AI Exam Prep", href: "/dashboard/student/exam-prep", icon: Trophy },
      { label: "Practice & Quizzes", href: "/dashboard/student/practice", icon: Target },
      { label: "Notion Smart Notes", href: "/dashboard/student/notes", icon: FileText },
      { label: "Pomodoro Timer", href: "/dashboard/student/timer", icon: Clock },
      { label: "Video Consultation", href: "/dashboard/video-consultation", icon: Video },
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
        
        <Link href="/" className="flex items-center justify-start px-2 py-1 group transition-transform active:scale-98">
          <DevgyaLogo size="md" showText={true} />
        </Link>
        <nav className="flex-1 space-y-1 overflow-y-auto pr-1">
          {navItems.map((item) => {
            const itemUrl = new URL(item.href, "http://x");
            const isActive = item.href.includes("?") 
              ? pathname === itemUrl.pathname && itemUrl.search === `?${searchParams.toString()}`
              : pathname === item.href;
            
            const itemAgent = item.href.includes("agent=") ? item.href.split("agent=")[1] : undefined;
            const matchedNavTool = getToolByPath(itemUrl.pathname, itemAgent);
            const isItemComingSoon = matchedNavTool?.is_coming_soon;

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
                  <span className="truncate">{matchedNavTool?.name || item.label}</span>
                </div>

                {isItemComingSoon && (
                  <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-800 border border-amber-300 shrink-0">
                    SOON
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="pt-3 border-t border-slate-200 space-y-1.5">
          <button
            onClick={handleSignOut}
            className="w-full px-3 py-1.5 text-xs text-slate-600 hover:text-red-600 font-bold flex items-center gap-2.5 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-slate-400" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      <div className="flex-1 md:pl-64 flex flex-col min-h-screen pb-20 md:pb-8">
        
        <MobileTopHeader />
        
        <header className="hidden md:flex h-16 border-b border-slate-200 px-6 sm:px-8 items-center justify-between bg-white/95 backdrop-blur-md sticky top-0 z-30 shadow-xs">
          
          <div className="flex-1 max-w-lg">
            <SmartSearchBar />
          </div>

          <div className="flex items-center gap-3 sm:gap-4 ml-4">
            
            <div className="flex items-center p-1 bg-slate-100 border border-slate-200/80 rounded-2xl shadow-inner">
              <button
                onClick={() => handleRoleSwitch('teacher')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  user.role === 'teacher' 
                    ? 'bg-white text-indigo-700 shadow-xs border border-indigo-100' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
                <span>Teacher</span>
              </button>

              <button
                onClick={() => handleRoleSwitch('student')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  user.role === 'student' 
                    ? 'bg-white text-purple-700 shadow-xs border border-purple-100' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                }`}
              >
                <Users className="w-3.5 h-3.5 text-purple-600" />
                <span>Student</span>
              </button>

              <button
                onClick={() => handleRoleSwitch('parent')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  user.role === 'parent' 
                    ? 'bg-white text-rose-700 shadow-xs border border-rose-100' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                }`}
              >
                <HeartHandshake className="w-3.5 h-3.5 text-rose-600" />
                <span>Parent</span>
              </button>
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

        <main className={`${isAgentsPage ? 'p-2 sm:p-3' : 'p-3 sm:p-6 lg:p-8'} flex-1 w-full max-w-full overflow-x-hidden`}>
          {currentComingSoonTool ? (
            <ComingSoonView
              tool={currentComingSoonTool}
              backUrl={user?.role === "student" ? "/dashboard/student" : user?.role === "parent" ? "/dashboard/parent" : "/dashboard"}
            />
          ) : (
            <PageTransition>
              {children}
            </PageTransition>
          )}
        </main>

        {!isAIChatPage && (
          <footer className="mt-auto px-4 sm:px-8 py-2.5 bg-transparent flex flex-col sm:flex-row items-center justify-between gap-1.5 text-[11px] text-slate-500 font-medium">
            <p>&copy; 2026 DEVGYA Global Edutech Private Limited. All Rights Reserved.</p>
            <p className="text-slate-500 font-medium">
              Designed &amp; Developed by <span className="text-indigo-600 font-bold">Pratikk Yadav and Team (+91 8307224756)</span>
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

