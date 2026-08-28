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
import { DevgyaLogo } from "@/components/common/DevgyaLogo";

function DashboardLayoutInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, logout, initSession, syncProfileFromServer } = useAppStore();
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isAgentsPage = pathname?.startsWith("/dashboard/agents");
  const isAIChatPage = 
    pathname?.startsWith("/dashboard/agents") ||
    pathname?.startsWith("/dashboard/chat") ||
    pathname?.startsWith("/dashboard/video-consultation") ||
    pathname?.startsWith("/dashboard/student/tutor") ||
    pathname?.startsWith("/dashboard/parent/coach") ||
    pathname?.startsWith("/dashboard/teacher-olympiad");

  useEffect(() => {
    setMounted(true);
    initSession();

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
    { label: "OCR Scanner", href: "/dashboard/ocr", icon: ScanText },
    { label: "Teacher Skill Olympiad", href: "/dashboard/teacher-olympiad", icon: Trophy },
    { label: "Olympiad Practice", href: "/dashboard/teacher-olympiad/practice", icon: BookOpen },
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
        
        {/* Brand Header - Prominent Logo */}
        <Link href="/" className="flex items-center justify-start px-2 py-1 group transition-transform active:scale-98">
          <DevgyaLogo size="md" showText={true} />
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

        {/* User Card, Profile & Logout */}
        <div className="pt-3 border-t border-slate-200 space-y-1.5">
          <Link
            href="/dashboard/profile"
            className="p-2.5 bg-slate-50 hover:bg-indigo-50/80 hover:border-indigo-200 rounded-xl border border-slate-200 flex items-center gap-3 transition-all group cursor-pointer"
            title="Edit Profile & Branding"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 group-hover:from-indigo-500 group-hover:to-purple-500 flex items-center justify-center font-black text-white text-xs shadow-xs overflow-hidden border border-white shrink-0">
              {user.avatarUrl && user.avatarUrl.trim().length > 0 ? (
                <img src={user.avatarUrl} alt={user.name || "User"} className="w-full h-full object-cover" />
              ) : (
                <span>{user.name?.trim() ? user.name.trim().charAt(0).toUpperCase() : (user.email ? user.email.charAt(0).toUpperCase() : "U")}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-900 group-hover:text-indigo-700 truncate">{user.name || "Educator"}</p>
              <p className="text-[10px] text-indigo-600 font-bold capitalize truncate">
                {user.role ? user.role.replace('_', ' ') : "Teacher"}
              </p>
            </div>
          </Link>

          <Link
            href="/dashboard/profile"
            className={`w-full px-3 py-2 text-xs font-bold flex items-center gap-2.5 rounded-xl transition-all cursor-pointer ${
              pathname === "/dashboard/profile"
                ? "bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-xs"
                : "text-slate-600 hover:text-indigo-600 hover:bg-slate-100"
            }`}
          >
            <Settings className="w-4 h-4 text-slate-500" />
            <span>Profile & Settings</span>
          </Link>

          <button
            onClick={handleSignOut}
            className="w-full px-3 py-1.5 text-xs text-slate-600 hover:text-red-600 font-bold flex items-center gap-2.5 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-slate-400" />
            <span>Sign Out</span>
          </button>
        </div>

      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 md:pl-64 flex flex-col min-h-screen pb-20 md:pb-8">
        
        {/* NATIVE MOBILE HEADER */}
        <MobileTopHeader />
        
        {/* TOP BAR WITH ROLE SWITCHER & PROFILE CHIP (DESKTOP ONLY) */}
        <header className="hidden md:flex h-16 border-b border-slate-200 bg-white/85 backdrop-blur-md px-4 sm:px-6 items-center justify-between sticky top-0 z-30 gap-4">
          
          <SmartSearchBar />

          <div className="flex items-center gap-3 shrink-0">
            
            {/* FIXED USER ROLE BADGE */}
            <div className="flex items-center gap-1.5 bg-indigo-50 px-3 py-1.5 rounded-2xl border border-indigo-200 text-xs font-extrabold text-indigo-700">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
              <span className="capitalize">{user.role || "User"} Portal</span>
            </div>

            {/* DESKTOP PROFILE AVATAR SHORTCUT */}
            <Link
              href="/dashboard/profile"
              className="flex items-center gap-2.5 bg-slate-50 hover:bg-indigo-50/80 px-2.5 py-1 rounded-2xl border border-slate-200 hover:border-indigo-200 transition-all cursor-pointer shadow-xs active:scale-95"
              title="View Profile"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center text-xs font-black shadow-xs overflow-hidden border border-white shrink-0">
                {user.avatarUrl && user.avatarUrl.trim().length > 0 ? (
                  <img src={user.avatarUrl} alt={user.name || "User"} className="w-full h-full object-cover" />
                ) : (
                  <span>{user.name?.trim() ? user.name.trim().charAt(0).toUpperCase() : (user.email ? user.email.charAt(0).toUpperCase() : "U")}</span>
                )}
              </div>
              <div className="hidden lg:block text-left pr-1">
                <p className="text-xs font-bold text-slate-800 leading-tight truncate max-w-[120px]">{user.name || "User"}</p>
                <p className="text-[10px] text-slate-400 capitalize leading-none">{user.role || "teacher"}</p>
              </div>
            </Link>

          </div>
        </header>

        {/* PAGE CONTENT WITH SMOOTH ANIMATIONS */}
        <main className={`${isAgentsPage ? 'p-2 sm:p-3' : 'p-3 sm:p-6 lg:p-8'} flex-1 w-full max-w-full overflow-x-hidden`}>
          <PageTransition>
            {children}
          </PageTransition>
        </main>

        {/* DASHBOARD BOTTOM DEVELOPER FOOTER - Hidden on AI Chat & Exam screens for immersive full-height experience */}
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

