"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { 
  Menu, 
  X, 
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
  ShieldCheck,
  Bell
} from "lucide-react";
import { useAppStore } from "@/store/useAppStore";

export function MobileTopHeader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, logout } = useAppStore();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string>("all");

  const [notifications, setNotifications] = useState([
    {
      id: "notif-1",
      type: "paper",
      title: "Question Paper Ready for Print",
      message: "Periodic Assessment Exam (Class 10 Science - Chemical Reactions) generated with model answers & marking rubric.",
      tag: "EXAM PAPER",
      tagColor: "bg-purple-100 text-purple-700 border-purple-200",
      time: "10m ago",
      read: false,
      actionUrl: "/dashboard/papers",
      actionText: "View Paper Archive",
      icon: Sparkles
    },
    {
      id: "notif-2",
      type: "olympiad",
      title: "National Teacher Skill Olympiad 2026 Live!",
      message: "Official registrations open for CBSE/NCERT educator proficiency test. Access unlimited timed practice tests.",
      tag: "OLYMPIAD ALERT",
      tagColor: "bg-amber-100 text-amber-700 border-amber-200",
      time: "1h ago",
      read: false,
      actionUrl: "/dashboard/teacher-olympiad/practice",
      actionText: "Start Olympiad Practice",
      icon: Trophy
    },
    {
      id: "notif-3",
      type: "ai",
      title: "Teacher Mentor AI Upgraded",
      message: "Bloom's Taxonomy HOTS analysis & NEP 2020 experiential activity generator now active in your classroom studio.",
      tag: "PEDAGOGY AI",
      tagColor: "bg-emerald-100 text-emerald-700 border-emerald-200",
      time: "5h ago",
      read: false,
      actionUrl: "/dashboard/agents?agent=teacher_mentor",
      actionText: "Launch Teacher Mentor",
      icon: GraduationCap
    },
    {
      id: "notif-4",
      type: "ocr",
      title: "Vision OCR Scanner Batch Mode Active",
      message: "Scan textbook pages or student worksheets directly to Question Paper Generator without re-typing.",
      tag: "VISION OCR",
      tagColor: "bg-cyan-100 text-cyan-700 border-cyan-200",
      time: "1d ago",
      read: true,
      actionUrl: "/dashboard/ocr",
      actionText: "Open OCR Scanner",
      icon: ScanText
    }
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? ({ ...n, read: true }) : n));
  };

  const handleSignOut = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setDrawerOpen(false);
    logout();
    if (typeof window !== "undefined") {
      window.location.replace("/");
    }
  };

  const role = user?.role || "teacher";

  // Build full role-spec nav items matching desktop sidebar exactly
  let navItems = [
    { label: "Teacher Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Teachers Skill Olympiad", href: "/dashboard/teacher-olympiad", icon: Trophy },
    { label: "Olympiad Practice", href: "/dashboard/teacher-olympiad/practice", icon: BookOpen },
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

  const filteredNotifs = activeFilter === "all" 
    ? notifications 
    : notifications.filter(n => n.type === activeFilter);

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-slate-100 px-4 py-2.5 flex items-center justify-between shadow-xs md:hidden">
        {/* LEFT: HAMBURGER MENU BUTTON */}
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200/80 text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer active:scale-95"
          aria-label="Open Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* CENTER: DEVGYA GLOBAL LOGO & TEXT BRANDING */}
        <Link href="/dashboard" className="flex items-center gap-2">
          <img 
            src="/logo.png" 
            alt="DEVGYA GLOBAL" 
            className="h-8 w-auto object-contain mix-blend-multiply" 
          />
          <div className="flex flex-col text-left">
            <span className="text-[11px] font-black text-slate-900 tracking-wider uppercase leading-tight">DEVGYA GLOBAL</span>
            <span className="text-[8.5px] font-bold text-slate-500 tracking-widest uppercase leading-none">EDUCATION</span>
          </div>
        </Link>

        {/* RIGHT: NOTIFICATIONS BELL + PROFILE AVATAR */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setNotifOpen(true)}
            className="relative w-9 h-9 rounded-xl flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer active:scale-95"
            title="Notifications"
          >
            <Bell className="w-5 h-5 text-slate-700" />
            {unreadCount > 0 && (
              <span className="absolute top-0.5 right-0.5 bg-rose-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-white shadow-xs animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          <Link
            href="/dashboard/profile"
            className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 border-2 border-white shadow-sm flex items-center justify-center text-white font-extrabold text-xs overflow-hidden active:scale-95 transition-transform"
          >
            {(user?.avatarUrl || user?.schoolLogo) ? (
              <img src={user.avatarUrl || user.schoolLogo} alt={user?.name || "User"} className="w-full h-full object-cover" />
            ) : (
              <span>{user?.name?.charAt(0)?.toUpperCase() || "U"}</span>
            )}
          </Link>
        </div>
      </header>

      {/* PROFESSIONAL TEACHER NOTIFICATIONS CENTER DRAWER */}
      {notifOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex justify-end md:hidden">
          <div className="w-full max-w-sm bg-white h-full p-5 space-y-4 shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-300">
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
                    <Bell className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900">Notifications</h3>
                    <p className="text-[10px] text-slate-500 font-bold">
                      {unreadCount > 0 ? `${unreadCount} unread update${unreadCount > 1 ? "s" : ""}` : "All caught up"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={markAllAsRead}
                      className="text-[10px] font-black text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-2 py-1 rounded-lg cursor-pointer transition-colors"
                    >
                      Mark all read
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setNotifOpen(false)}
                    className="p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {[
                  { id: "all", label: `All (${notifications.length})` },
                  { id: "paper", label: "Papers" },
                  { id: "olympiad", label: "Olympiad" },
                  { id: "ai", label: "AI Updates" },
                ].map(tab => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveFilter(tab.id)}
                    className={`px-3 py-1 rounded-full text-[11px] font-extrabold whitespace-nowrap transition-all cursor-pointer ${
                      activeFilter === tab.id
                        ? "bg-indigo-600 text-white shadow-xs"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Notifications List */}
              <div className="space-y-3">
                {filteredNotifs.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 space-y-2">
                    <Bell className="w-8 h-8 text-slate-300 mx-auto" />
                    <p className="text-xs font-bold text-slate-500">No notifications in this category</p>
                  </div>
                ) : (
                  filteredNotifs.map(item => {
                    const IconComp = item.icon;
                    return (
                      <div
                        key={item.id}
                        onClick={() => markAsRead(item.id)}
                        className={`p-3.5 rounded-2xl border transition-all space-y-2 relative cursor-pointer ${
                          item.read 
                            ? "bg-slate-50/70 border-slate-200/80 text-slate-600" 
                            : "bg-white border-indigo-200 shadow-xs ring-1 ring-indigo-500/10"
                        }`}
                      >
                        {!item.read && (
                          <span className="absolute top-3.5 right-3.5 w-2 h-2 rounded-full bg-indigo-600" />
                        )}

                        <div className="flex items-center gap-2">
                          <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md border ${item.tagColor}`}>
                            {item.tag}
                          </span>
                          <span className="text-[10px] text-slate-400 font-bold ml-auto pr-3">
                            {item.time}
                          </span>
                        </div>

                        <div className="space-y-1">
                          <h4 className="text-xs font-black text-slate-900 leading-snug">
                            {item.title}
                          </h4>
                          <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                            {item.message}
                          </p>
                        </div>

                        {item.actionUrl && (
                          <div className="pt-1">
                            <Link
                              href={item.actionUrl}
                              onClick={() => setNotifOpen(false)}
                              className="inline-flex items-center gap-1 text-[11px] font-extrabold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-xl transition-colors"
                            >
                              <span>{item.actionText}</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </Link>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="pt-3 border-t border-slate-100">
              <p className="text-[10px] text-center text-slate-400 font-bold">
                DEVGYA AI Notification Engine • Real-time Alerts
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SLIDE-OVER NAVIGATION DRAWER */}
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
                  type="button"
                  onClick={() => setDrawerOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
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
              </div>
            </div>

            {/* DIRECT HIGH-TOUCH SIGN OUT BUTTON */}
            <div className="pt-4 border-t border-slate-100 space-y-2">
              <button
                type="button"
                onClick={(e) => handleSignOut(e)}
                className="w-full py-3.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-2xl shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer uppercase tracking-wider"
              >
                <LogOut className="w-4 h-4 text-white" />
                <span>Sign Out Account</span>
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}

