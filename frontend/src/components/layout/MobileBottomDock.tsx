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
  ScanText,
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
      { label: "TEACHER AI", href: "/dashboard/agents?agent=teacher_mentor", icon: Bot, central: true, agentCode: "teacher_mentor" },
      { label: "OCR Scan", href: "/dashboard/ocr", icon: ScanText },
      { label: "Profile", href: "/dashboard/profile", icon: User }
    ];
  };

  const tabs = getTabs();

  return (
    <nav className="fixed bottom-2 left-2 right-2 z-50 bg-white/90 backdrop-blur-2xl border border-slate-200/90 px-3 py-1.5 shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-full md:hidden">
      <div className="flex items-center justify-around max-w-md mx-auto relative">
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
                className="relative -top-5 flex flex-col items-center group shrink-0"
              >
                <div className="w-13 h-13 rounded-full bg-gradient-to-tr from-indigo-600 via-purple-600 to-rose-500 text-white flex items-center justify-center shadow-lg shadow-indigo-600/35 border-2 border-white group-active:scale-90 transition-transform">
                  <Icon className="w-6 h-6 animate-pulse" />
                </div>
                <span className="text-[10px] font-black text-indigo-700 tracking-tight mt-0.5 uppercase">
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
