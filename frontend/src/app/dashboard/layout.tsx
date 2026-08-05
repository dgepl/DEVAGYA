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
import { useEffect, useState } from "react";
import { SmartSearchBar } from "@/components/search/SmartSearchBar";
import { PageTransition } from "@/components/ui/PageTransition";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, logout } = useAppStore();
  const [mounted, setMounted] = useState(false);
  const isAgentsPage = pathname?.startsWith("/dashboard/agents");

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSignOut = () => {
    logout();
    if (typeof window !== "undefined") {
      window.location.href = "/login";
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
        pathname === "/dashboard/voice" ||
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
    // Teacher AI Agents
    { label: "Teacher Mentor AI", href: "/dashboard/agents?agent=teacher_mentor", icon: GraduationCap },
    { label: "Question Generator", href: "/dashboard/agents?agent=question_generator", icon: Sparkles },
    { label: "Lesson Planner AI", href: "/dashboard/agents?agent=lesson_planner", icon: BookOpen },
    { label: "Analytics AI", href: "/dashboard/agents?agent=analytics_assistant", icon: Activity },
    // General AI Agents
    { label: "English Coach", href: "/dashboard/agents?agent=english_coach", icon: MessageSquare },
    { label: "Research Assistant", href: "/dashboard/agents?agent=research_assistant", icon: Search },
    { label: "Document AI", href: "/dashboard/agents?agent=document_assistant", icon: Layers },
    // Other tools
    { label: "AI Chat Studio", href: "/dashboard/chat", icon: MessageSquare },
    { label: "AI Generator", href: "/dashboard/generator", icon: Sparkles },
    { label: "AI Lesson Planner", href: "/dashboard/lesson-planner", icon: BookOpen },
    { label: "Video Consultation", href: "/dashboard/video-consultation", icon: Video },
    { label: "OCR Scanner", href: "/dashboard/ocr", icon: ScanText },
    { label: "Voice AI Coach", href: "/dashboard/voice", icon: Mic },
    { label: "AI Model Settings", href: "/dashboard/settings/ai-models", icon: Settings },
  ];

  if (user.role === "student") {
    navItems = [
      { label: "Student Home", href: "/dashboard/student", icon: LayoutDashboard },
      // Student AI Agents
      { label: "Homework Helper", href: "/dashboard/agents?agent=homework_assistant", icon: FileText },
      { label: "AI Tutor", href: "/dashboard/agents?agent=student_tutor", icon: Brain },
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
      { label: "Document AI", href: "/dashboard/agents?agent=document_assistant", icon: Layers },
      // Other tools
      { label: "Video Consultation", href: "/dashboard/video-consultation", icon: Video },
      { label: "Child Analytics", href: "/dashboard/parent/analytics", icon: Activity },
      { label: "Notifications", href: "/dashboard/parent/notifications", icon: Bell },
    ];
  }

  if (user.role === "super_admin") {
    navItems.push({ label: "Super Admin", href: "/admin", icon: ShieldCheck });
  }



  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col md:flex-row">
      
      {/* DESKTOP & TABLET SIDEBAR */}
      <aside className="hidden md:flex flex-col w-64 glass-panel border-r border-slate-200 p-4 space-y-6 fixed inset-y-0 z-40 bg-white/95 backdrop-blur-xl">
        
        {/* Brand Header - Logo Only */}
        <Link href="/" className="flex items-center px-2">
          <img
            src="/logo.png"
            alt="DEVGYA GLOBAL PRIVATE LIMITED"
            className="h-10 w-auto max-h-12 object-contain mix-blend-multiply"
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
        
        {/* TOP BAR WITH ROLE SWITCHER & AI OS SHORTCUTS */}
        <header className="h-16 border-b border-slate-200 bg-white/85 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 gap-4">
          
          <SmartSearchBar />

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            
            {/* FIXED USER ROLE BADGE (ROLE SWITCHING DISABLED IN PRODUCTION) */}
            <div className="flex items-center gap-1.5 bg-indigo-50 px-3 py-1.5 rounded-2xl border border-indigo-200 text-xs font-extrabold text-indigo-700">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
              <span className="capitalize">{user.role || "User"} Portal</span>
            </div>

            <Link
              href="/dashboard/agents"
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-glow transition-all flex items-center gap-1.5"
            >
              <Bot className="w-3.5 h-3.5 text-amber-300" />
              <span className="hidden sm:inline">AI Agents OS</span>
            </Link>

          </div>
        </header>

        {/* PAGE CONTENT WITH SMOOTH ANIMATIONS */}
        <main className={`${isAgentsPage ? 'p-2 sm:p-3' : 'p-4 sm:p-6 lg:p-8'} flex-1`}>
          <PageTransition>
            {children}
          </PageTransition>
        </main>

      </div>



    </div>
  );
}

