"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
  DollarSign
} from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { useEffect } from "react";
import { SmartSearchBar } from "@/components/search/SmartSearchBar";
import { PageTransition } from "@/components/ui/PageTransition";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAppStore();

  const handleSignOut = () => {
    logout();
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  };

  // Strict Role-Based Access Control (RBAC) Route Guard
  useEffect(() => {
    if (!user || !user.role) return;

    if (user.role === "student") {
      const isStudentAllowed = 
        pathname.startsWith("/dashboard/student") ||
        pathname === "/dashboard/agents" ||
        pathname === "/dashboard/knowledge" ||
        pathname === "/dashboard/chat" ||
        pathname === "/dashboard/voice" ||
        pathname === "/dashboard/profile";

      if (!isStudentAllowed) {
        router.replace("/dashboard/student");
      }
    } else if (user.role === "parent") {
      const isParentAllowed = 
        pathname.startsWith("/dashboard/parent") ||
        pathname === "/dashboard/profile";

      if (!isParentAllowed) {
        router.replace("/dashboard/parent");
      }
    } else if (user.role === "teacher") {
      if (pathname.startsWith("/dashboard/student") || pathname.startsWith("/dashboard/parent")) {
        router.replace("/dashboard");
      }
    }
  }, [user, pathname, router]);

  // Role-based Nav Specifications including AI OS Extensions
  let navItems = [
    { label: "Teacher Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "AI Agent OS", href: "/dashboard/agents", icon: Bot },
    { label: "RAG Knowledge Base", href: "/dashboard/knowledge", icon: Layers },
    { label: "AI Workflows", href: "/dashboard/workflows", icon: GitFork },
    { label: "Prompt Studio", href: "/dashboard/prompts-studio", icon: Code },
    { label: "Memory 2.0", href: "/dashboard/memory-studio", icon: Brain },
    { label: "AI Generator", href: "/dashboard/generator", icon: Sparkles },
    { label: "AI Chat Studio", href: "/dashboard/chat", icon: MessageSquare },
    { label: "AI Lesson Planner", href: "/dashboard/lesson-planner", icon: BookOpen },
    { label: "OCR Scanner", href: "/dashboard/ocr", icon: ScanText },
    { label: "Voice AI Coach", href: "/dashboard/voice", icon: Mic },
    { label: "AI Model Settings", href: "/dashboard/settings/ai-models", icon: Settings },
    { label: "AI Cost Analytics", href: "/dashboard/analytics/ai-costs", icon: Activity },
  ];

  if (user.role === "student") {
    navItems = [
      { label: "Student Home", href: "/dashboard/student", icon: LayoutDashboard },
      { label: "AI Agents OS", href: "/dashboard/agents", icon: Bot },
      { label: "Socratic AI Tutor", href: "/dashboard/student/tutor", icon: Brain },
      { label: "Practice & Quizzes", href: "/dashboard/student/practice", icon: Target },
      { label: "AI Flashcards", href: "/dashboard/student/flashcards", icon: Layers },
      { label: "Knowledge Base", href: "/dashboard/knowledge", icon: Layers },
      { label: "AI Study Planner", href: "/dashboard/student/planner", icon: Clock },
      { label: "Revision Studio", href: "/dashboard/student/revision", icon: BookOpen },
      { label: "AI Exam Prep", href: "/dashboard/student/exam-prep", icon: Trophy },
      { label: "Notion Smart Notes", href: "/dashboard/student/notes", icon: FileText },
      { label: "Leaderboard", href: "/dashboard/student/leaderboard", icon: Trophy },
      { label: "Pomodoro Timer", href: "/dashboard/student/timer", icon: Clock },
    ];
  } else if (user.role === "parent") {
    navItems = [
      { label: "Parent Dashboard", href: "/dashboard/parent", icon: LayoutDashboard },
      { label: "AI Parenting Coach", href: "/dashboard/parent/coach", icon: HeartHandshake },
      { label: "Child Analytics", href: "/dashboard/parent/analytics", icon: Activity },
      { label: "Notifications & Alerts", href: "/dashboard/parent/notifications", icon: Bell },
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
            alt="DEVAGYA GLOBAL PRIVATE LIMITED" 
            className="h-10 w-auto max-h-12 object-contain mix-blend-multiply" 
          />
        </Link>

        {/* Primary Nav */}
        <nav className="flex-1 space-y-1 overflow-y-auto pr-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
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
        <main className="p-4 sm:p-6 lg:p-8 flex-1">
          <PageTransition>
            {children}
          </PageTransition>
        </main>

      </div>

      {/* MOBILE ADAPTIVE BOTTOM NAVIGATION BAR */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass-panel border-t border-slate-200 bg-white/95 backdrop-blur-2xl px-2 py-2 flex items-center justify-around">
        {[
          { label: "Agents", href: "/dashboard/agents", icon: Bot },
          { label: "RAG", href: "/dashboard/knowledge", icon: Layers },
          { label: "Workflows", href: "/dashboard/workflows", icon: GitFork },
          { label: "Notes", href: "/dashboard/notebook", icon: FileText },
          { label: "Models", href: "/dashboard/settings/ai-models", icon: Settings }
        ].map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 p-2 rounded-xl text-[10px] font-bold transition-all ${
                isActive ? "text-indigo-600 font-black" : "text-slate-500"
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

    </div>
  );
}
