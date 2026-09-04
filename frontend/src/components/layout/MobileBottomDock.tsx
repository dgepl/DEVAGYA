"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { 
  Home, 
  Sparkles, 
  Video, 
  User, 
  Zap, 
  HeartHandshake, 
  Brain,
  Layers,
  GraduationCap,
  FileText,
  Bot,
  Target,
  Trophy
} from "lucide-react";
import { useAppStore } from "@/store/useAppStore";

export function MobileBottomDock() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user } = useAppStore();
  const role = user?.role || "teacher";
  const agentParam = searchParams.get("agent");

  // Custom role-tailored bottom navbar tabs (always 5 tabs with AI Agent in the exact center)
  const getTabs = () => {
    if (role === "student") {
      return [
        { label: "Home", href: "/dashboard/student", icon: Home },
        { label: "AI Exam Prep", href: "/dashboard/student/exam-prep", icon: Trophy },
        { label: "AI Tutor", href: "/dashboard/agents?agent=student_tutor", icon: Sparkles, central: true, agentCode: "student_tutor" },
        { label: "Quiz", href: "/dashboard/student/practice", icon: Target },
        { label: "Profile", href: "/dashboard/profile", icon: User },
      ];
    }

    if (role === "parent") {
      return [
        { label: "Home", href: "/dashboard/parent", icon: Home },
        { label: "Consult", href: "/dashboard/video-consultation", icon: Video },
        { label: "Coach AI", href: "/dashboard/agents?agent=parent_coach", icon: HeartHandshake, central: true, agentCode: "parent_coach" },
        { label: "Progress", href: "/dashboard/parent", icon: Target },
        { label: "Profile", href: "/dashboard/profile", icon: User }
      ];
    }

    // Default Teacher tabs (5 tabs)
    return [
      { label: "Dashboard", href: "/dashboard", icon: Home },
      { label: "Generator", href: "/dashboard/generator", icon: Zap },
      { label: "Teacher AI", href: "/dashboard/agents?agent=teacher_mentor", icon: Sparkles, central: true, agentCode: "teacher_mentor" },
      { label: "Assignments", href: "/dashboard/assignments", icon: FileText },
      { label: "Profile", href: "/dashboard/profile", icon: User }
    ];
  };

  const tabs = getTabs();

  return (
    <nav className="fixed bottom-3 left-3 right-3 z-50 bg-white/95 backdrop-blur-2xl border border-slate-200/90 py-1.5 px-1 shadow-[0_12px_36px_rgba(0,0,0,0.14)] rounded-2xl md:hidden">
      <div className="grid grid-cols-5 items-center w-full max-w-md mx-auto">
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
                className="flex flex-col items-center justify-center group w-full min-w-0 text-center relative"
              >
                {/* Elevated Centered Icon */}
                <div className="relative -mt-6 flex flex-col items-center">
                  <div
                    className={`w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-600 via-indigo-700 to-purple-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/35 border-[2.5px] border-white ring-1 ring-slate-200/60 group-active:scale-95 transition-all ${
                      isActive ? "ring-2 ring-indigo-500 ring-offset-2 scale-105" : ""
                    }`}
                  >
                    <Icon className="w-5 h-5 text-amber-300 group-hover:scale-110 transition-transform drop-shadow-sm" />
                  </div>
                  <span
                    className={`text-[9.5px] sm:text-[10px] tracking-tight mt-1 font-extrabold truncate max-w-full text-center block ${
                      isActive ? "text-indigo-600" : "text-slate-800"
                    }`}
                  >
                    {tab.label}
                  </span>
                </div>
              </Link>
            );
          }

          return (
            <Link
              key={`${tab.href}-${idx}`}
              href={tab.href}
              className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all relative active:scale-95 min-w-0 w-full text-center group ${
                isActive 
                  ? "text-indigo-600 font-extrabold" 
                  : "text-slate-500 font-medium hover:text-slate-800"
              }`}
            >
              <div className={`p-1 rounded-lg transition-colors ${isActive ? "bg-indigo-50 text-indigo-600" : "group-hover:bg-slate-50"}`}>
                <Icon className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform ${isActive ? "scale-105" : ""}`} />
              </div>
              <span className="text-[9px] sm:text-[9.5px] leading-tight tracking-tight mt-0.5 font-bold truncate max-w-full block text-center px-0.5">
                {tab.label}
              </span>
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 mt-0.5 shadow-xs" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
