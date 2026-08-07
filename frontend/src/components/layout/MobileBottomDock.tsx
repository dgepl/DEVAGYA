"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { 
  Home, 
  Sparkles, 
  BookOpen, 
  Video, 
  User, 
  Zap, 
  HeartHandshake, 
  Brain,
  Layers
} from "lucide-react";
import { useAppStore } from "@/store/useAppStore";

export function MobileBottomDock() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user } = useAppStore();
  const role = user?.role || "teacher";
  const agentParam = searchParams.get("agent");

  const getTabs = () => {
    if (role === "student") {
      return [
        { label: "Home", href: "/dashboard/student", icon: Home },
        { label: "Socratic AI", href: "/dashboard/agents?agent=student_tutor", icon: Brain, agentCode: "student_tutor" },
        { label: "Ask Tutor", href: "/dashboard/agents?agent=student_tutor", icon: Sparkles, central: true, agentCode: "student_tutor" },
        { label: "Flashcards", href: "/dashboard/student/flashcards", icon: Layers },
        { label: "Consult", href: "/dashboard/video-consultation", icon: Video },
      ];
    }

    if (role === "parent") {
      return [
        { label: "Home", href: "/dashboard/parent", icon: Home },
        { label: "Parent Coach", href: "/dashboard/agents?agent=parent_coach", icon: HeartHandshake, agentCode: "parent_coach" },
        { label: "Consult", href: "/dashboard/video-consultation", icon: Video, central: true },
        { label: "Marks Radar", href: "/dashboard/agents?agent=analytics_assistant", icon: Sparkles, agentCode: "analytics_assistant" },
        { label: "Profile", href: "/dashboard/profile", icon: User },
      ];
    }

    // Default Teacher tabs
    return [
      { label: "Home", href: "/dashboard", icon: Home },
      { label: "Paper Gen", href: "/dashboard/generator", icon: Zap },
      { label: "Teacher AI", href: "/dashboard/agents?agent=teacher_mentor", icon: Sparkles, central: true, agentCode: "teacher_mentor" },
      { label: "Lessons", href: "/dashboard/lesson-planner", icon: BookOpen },
      { label: "Profile", href: "/dashboard/profile", icon: User },
    ];
  };

  const tabs = getTabs();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-slate-200 px-2 py-1.5 shadow-2xl md:hidden">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {tabs.map((tab, idx) => {
          const Icon = tab.icon;
          let isActive = false;
          if (tab.agentCode) {
            isActive = pathname.startsWith("/dashboard/agents") && agentParam === tab.agentCode;
          } else {
            isActive = pathname === tab.href;
          }

          if (tab.central) {
            return (
              <Link
                key={`central-${tab.href}-${idx}`}
                href={tab.href}
                className="relative -top-4 flex flex-col items-center group"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 text-white flex items-center justify-center shadow-lg shadow-indigo-600/30 group-active:scale-90 transition-transform border-2 border-white">
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[9px] font-black text-indigo-700 tracking-tight mt-0.5 uppercase">
                  {tab.label}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={`${tab.href}-${idx}`}
              href={tab.href}
              className={`flex flex-col items-center py-1 px-2.5 rounded-2xl transition-all ${
                isActive ? "text-indigo-600 font-extrabold" : "text-slate-500 font-medium hover:text-slate-900"
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? "text-indigo-600 scale-110" : ""}`} />
              <span className="text-[10px] tracking-tight mt-0.5">
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
