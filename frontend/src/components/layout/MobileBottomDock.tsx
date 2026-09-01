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
  Target
} from "lucide-react";
import { useAppStore } from "@/store/useAppStore";

export function MobileBottomDock() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user } = useAppStore();
  const role = user?.role || "teacher";
  const agentParam = searchParams.get("agent");

  // Custom role-tailored bottom navbar tabs
  const getTabs = () => {
    if (role === "student") {
      return [
        { label: "Home", href: "/dashboard/student", icon: Home },
        { label: "AI Tutor", href: "/dashboard/agents?agent=student_tutor", icon: Brain, agentCode: "student_tutor" },
        { label: "Ask AI", href: "/dashboard/agents?agent=student_tutor", icon: Sparkles, central: true, agentCode: "student_tutor" },
        { label: "Quiz", href: "/dashboard/student/practice", icon: Target },
        { label: "Profile", href: "/dashboard/profile", icon: User },
      ];
    }

    if (role === "parent") {
      return [
        { label: "Home", href: "/dashboard/parent", icon: Home },
        { label: "Coach AI", href: "/dashboard/agents?agent=parent_coach", icon: HeartHandshake, agentCode: "parent_coach" },
        { label: "Ask Coach", href: "/dashboard/agents?agent=parent_coach", icon: HeartHandshake, central: true, agentCode: "parent_coach" },
        { label: "Consult", href: "/dashboard/video-consultation", icon: Video },
        { label: "Profile", href: "/dashboard/profile", icon: User }
      ];
    }

    // Default Teacher tabs (5 tabs matching reference)
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
    <nav className="fixed bottom-2.5 left-3 right-3 z-50 bg-white/95 backdrop-blur-xl border border-slate-200/90 px-3 py-1.5 shadow-[0_10px_35px_rgba(0,0,0,0.12)] rounded-full md:hidden">
      <div className="flex items-center justify-between max-w-md mx-auto relative">
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
                className="relative -top-3.5 flex flex-col items-center group shrink-0"
              >
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-blue-700 text-white flex items-center justify-center shadow-lg shadow-indigo-600/30 ring-4 ring-white/90 group-active:scale-95 transition-all ${
                  isActive ? "ring-indigo-200" : ""
                }`}>
                  <Icon className="w-5 h-5 text-indigo-100 group-hover:scale-110 transition-transform" />
                </div>
                <span className={`text-[10px] tracking-tight mt-1 font-bold ${
                  isActive ? "text-indigo-700 font-extrabold" : "text-slate-700"
                }`}>
                  {tab.label}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={`${tab.href}-${idx}`}
              href={tab.href}
              className={`flex flex-col items-center py-1 px-3 rounded-2xl transition-all relative active:scale-95 ${
                isActive ? "text-indigo-600 font-extrabold" : "text-slate-500 font-medium hover:text-slate-900"
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? "text-indigo-600 scale-110" : ""}`} />
              <span className="text-[10px] tracking-tight mt-0.5 font-bold">
                {tab.label}
              </span>
              {isActive && (
                <span className="w-1 h-1 rounded-full bg-indigo-600 mt-0.5" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
