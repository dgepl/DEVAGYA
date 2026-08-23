"use client";

import { useState, useMemo } from "react";
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
  Bell,
  CheckCircle2
} from "lucide-react";
import { useAppStore } from "@/store/useAppStore";

export function MobileTopHeader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { 
    user, 
    logout, 
    savedPapers, 
    ocrDraftText, 
    dismissedNotificationIds, 
    dismissNotification, 
    clearAllNotifications 
  } = useAppStore();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string>("all");

  const role = user?.role || "teacher";

  // Build real dynamic practical notifications based on user activity
  const rawNotifications = useMemo(() => {
    const list: any[] = [];

    // 1. Real notifications from generated question papers
    if (savedPapers && savedPapers.length > 0) {
      savedPapers.forEach((paper, idx) => {
        const id = `paper-${(paper.title || "exam").toLowerCase().replace(/[^a-z0-9]/g, "-")}-${(paper.class_name || "c10").toLowerCase().replace(/[^a-z0-9]/g, "-")}`;
        list.push({
          id,
          type: "paper",
          title: `Paper Generated: ${paper.title || `${paper.subject || "Exam"} Paper`}`,
          message: `${paper.class_name || "Class 10"} • ${paper.subject || "General"} (${paper.total_marks || 40} Marks) is ready for download & classroom print.`,
          tag: "EXAM PAPER",
          tagColor: "bg-purple-100 text-purple-700 border-purple-200",
          time: idx === 0 ? "Latest" : "Saved",
          actionUrl: "/dashboard/papers",
          actionText: "View Paper Archive",
          icon: Sparkles
        });
      });
    }

    // 2. Real Olympiad notification (Teacher or Student)
    if (role === "teacher") {
      list.push({
        id: "olympiad-official-teacher-2026",
        type: "olympiad",
        title: "National Teacher Skill Olympiad 2026",
        message: "Official CBSE/NCERT educator proficiency test registrations are live. Start unlimited timed practice mock tests.",
        tag: "OLYMPIAD ALERT",
        tagColor: "bg-amber-100 text-amber-700 border-amber-200",
        time: "Active",
        actionUrl: "/dashboard/teacher-olympiad/practice",
        actionText: "Start Olympiad Practice",
        icon: Trophy
      });
    } else if (role === "student") {
      list.push({
        id: "student-practice-olympiad-2026",
        type: "olympiad",
        title: "Student Olympiad & Board Exam Prep",
        message: "Timed practice quizzes, flashcards & NCERT tests are ready for your target exam.",
        tag: "EXAM PREP",
        tagColor: "bg-blue-100 text-blue-700 border-blue-200",
        time: "Active",
        actionUrl: "/dashboard/student/practice",
        actionText: "Start Practice Quiz",
        icon: Trophy
      });
    }

    // 3. Real OCR draft notification if text is scanned
    if (ocrDraftText && ocrDraftText.trim().length > 0) {
      list.push({
        id: "ocr-active-draft-text",
        type: "ocr",
        title: "OCR Document Text Extracted",
        message: "Scanned document text is loaded and ready to generate questions or review.",
        tag: "VISION OCR",
        tagColor: "bg-cyan-100 text-cyan-700 border-cyan-200",
        time: "Ready",
        actionUrl: "/dashboard/ocr",
        actionText: "Open OCR Scanner",
        icon: ScanText
      });
    }

    return list;
  }, [savedPapers, role, ocrDraftText]);

  // Remove any notification that has been seen/dismissed by the user!
  const notifications = useMemo(() => {
    return rawNotifications.filter(n => !dismissedNotificationIds.includes(n.id));
  }, [rawNotifications, dismissedNotificationIds]);

  const unreadCount = notifications.length;

  const handleClearAll = () => {
    clearAllNotifications(rawNotifications.map(n => n.id));
  };

  const handleDismissOne = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    dismissNotification(id);
  };

  const handleActionClick = (id: string) => {
    dismissNotification(id);
    setNotifOpen(false);
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
            className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 border-2 border-white shadow-sm flex items-center justify-center text-white font-black text-xs overflow-hidden active:scale-95 transition-transform shrink-0"
            title={user?.name || "Profile"}
          >
            {user?.avatarUrl && user.avatarUrl.trim().length > 0 ? (
              <img src={user.avatarUrl} alt={user?.name || "User"} className="w-full h-full object-cover" />
            ) : (
              <span>{user?.name?.trim() ? user.name.trim().charAt(0).toUpperCase() : (user?.email ? user.email.charAt(0).toUpperCase() : "U")}</span>
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
                      {unreadCount > 0 ? `${unreadCount} active notification${unreadCount > 1 ? "s" : ""}` : "All caught up"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={handleClearAll}
                      className="text-[10px] font-black text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-2 py-1 rounded-lg cursor-pointer transition-colors"
                    >
                      Clear all
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
                  { id: "ocr", label: "OCR" },
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

              {/* Real Notifications List */}
              <div className="space-y-3">
                {filteredNotifs.length === 0 ? (
                  <div className="text-center py-12 px-3 bg-slate-50/60 rounded-3xl border border-dashed border-slate-200 text-slate-400 space-y-2">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mx-auto shadow-xs">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    </div>
                    <h4 className="text-xs font-black text-slate-800">You're all caught up! 🎉</h4>
                    <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                      No active notifications. When you generate a new question paper or receive an Olympiad update, it will show up here.
                    </p>
                  </div>
                ) : (
                  filteredNotifs.map(item => {
                    const IconComp = item.icon || Sparkles;
                    return (
                      <div
                        key={item.id}
                        className="p-3.5 rounded-2xl border border-slate-200/90 bg-white shadow-xs transition-all space-y-2 relative"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md border ${item.tagColor}`}>
                            {item.tag}
                          </span>
                          
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-slate-400 font-bold">
                              {item.time}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => handleDismissOne(e, item.id)}
                              className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                              title="Dismiss and remove"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
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
                              onClick={() => handleActionClick(item.id)}
                              className="inline-flex items-center gap-1 text-[11px] font-extrabold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
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
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center font-black text-sm shadow-md overflow-hidden shrink-0 border border-white/20">
                    {user?.avatarUrl && user.avatarUrl.trim().length > 0 ? (
                      <img src={user.avatarUrl} alt={user?.name || "User"} className="w-full h-full object-cover" />
                    ) : (
                      <span>{user?.name?.trim() ? user.name.trim().charAt(0).toUpperCase() : (user?.email ? user.email.charAt(0).toUpperCase() : "U")}</span>
                    )}
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

