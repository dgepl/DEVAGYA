"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home, 
  Sparkles, 
  BookOpen, 
  Video, 
  User, 
  Zap, 
  ScanText, 
  HeartHandshake, 
  GraduationCap 
} from "lucide-react";
import { useAppStore } from "@/store/useAppStore";

export function MobileBottomDock() {
  const pathname = usePathname();
  const { user } = useAppStore();
  const role = user?.role || "teacher";

  const getTabs = () => {
    if (role === "student") {
      return [
        { label: "Home", href: "/dashboard/student", icon: Home },
        { label: "Tutor AI", href: "/dashboard/agents?agent=student_tutor", icon: Sparkles },
        { label: "Practice", href: "/dashboard/student/quizzes", icon: Zap, central: true },
        { label: "Consult", href: "/dashboard/video-consultation", icon: Video },
        { label: "Profile", href: "/dashboard/profile", icon: User },
      ];
    }

    if (role === "parent") {
      return [
        { label: "Home", href: "/dashboard/parent", icon: Home },
        { label: "Coach AI", href: "/dashboard/agents?agent=parent_coach", icon: HeartHandshake },
        { label: "Consult", href: "/dashboard/video-consultation", icon: Video, central: true },
        { label: "Analytics", href: "/dashboard/agents?agent=analytics_assistant", icon: Sparkles },
        { label: "Profile", href: "/dashboard/profile", icon: User },
      ];
    }

    // Default Teacher tabs
    return [
      { label: "Home", href: "/dashboard", icon: Home },
      { label: "Papers", href: "/dashboard/generator", icon: Zap },
      { label: "15 AI OS", href: "/dashboard/agents?agent=teacher_mentor", icon: Sparkles, central: true },
      { label: "Lessons", href: "/dashboard/lesson-planner", icon: BookOpen },
      { label: "Profile", href: "/dashboard/profile", icon: User },
    ];
  };

  const tabs = getTabs();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-slate-200/90 px-3 py-2 shadow-2xl md:hidden">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = pathname === tab.href;

          if (tab.central) {
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className="relative -top-5 flex flex-col items-center group"
              >
                <div className="w-13 h-13 rounded-full bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 text-white flex items-center justify-center shadow-lg shadow-indigo-600/30 group-active:scale-90 transition-transform">
                  <Icon className="w-6 h-6 animate-pulse" />
                </div>
                <span className="text-[10px] font-black text-indigo-700 tracking-tight mt-1 uppercase">
                  {tab.label}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center py-1 px-3 rounded-2xl transition-all ${
                isActive ? "text-indigo-600 font-extrabold" : "text-slate-500 font-medium hover:text-slate-900"
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? "text-indigo-600 scale-110" : ""}`} />
              <span className="text-[10px] tracking-tight mt-1">
                {tab.label}
              </span>
              {isActive && (
                <span className="w-1 h-1 rounded-full bg-indigo-600 mt-0.5" />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
