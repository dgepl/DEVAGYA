"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Sparkles, 
  Building2, 
  GraduationCap, 
  Users, 
  ShieldCheck, 
  ArrowRight, 
  MapPin, 
  CheckCircle2, 
  Award,
  BookOpen,
  Lock
} from "lucide-react";

export function MobileLandingView() {
  const [activeRole, setActiveRole] = useState<"schools" | "teachers" | "parents">("schools");

  const roleDetails = {
    schools: {
      title: "For Schools & Institutions",
      badge: "Institutional Support",
      icon: Building2,
      color: "from-blue-600 to-indigo-600",
      desc: "Seamless book supply, academic publishing, professional CBSE teacher training workshops, and reliable job placement support.",
      perks: ["Academic Publishing", "CBSE Workshops", "Placement Support"]
    },
    teachers: {
      title: "For Teachers & Educators",
      badge: "Educator Growth",
      icon: GraduationCap,
      color: "from-purple-600 to-pink-600",
      desc: "Cutting-edge digital tools like OCR worksheet & assignment generators, Teachers Skill Olympiad, and modern pedagogy books.",
      perks: ["OCR Worksheet Generator", "Teachers Skill Olympiad", "Modern Pedagogy"]
    },
    parents: {
      title: "For Parents & Students",
      badge: "Holistic Development",
      icon: Users,
      color: "from-emerald-600 to-teal-600",
      desc: "Engaging learning through interactive homework, AI query assistance, fun educational quizzes, and specialized parenting guides.",
      perks: ["AI Homework Helper", "Interactive Quizzes", "Parenting Guides"]
    }
  };

  const current = roleDetails[activeRole];
  const Icon = current.icon;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20 pt-20 px-4 flex flex-col justify-between relative overflow-hidden font-sans md:hidden selection:bg-indigo-500 selection:text-white">
      
      {/* AMBIENT BACKGROUND GLOW */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-80 bg-indigo-200/50 blur-[90px] rounded-full pointer-events-none" />

      <div className="space-y-5 relative z-10">
        
        {/* 1. TOP BRAND BADGE */}
        <div className="text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-indigo-100 shadow-xs text-[11px] font-extrabold text-slate-800">
            <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
            <span>Devgya Global • Jhajjar, Haryana</span>
          </div>
        </div>

        {/* 2. HERO HEADLINE & INTRO */}
        <div className="text-center space-y-2.5">
          <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-[11px] font-black">
            <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
            <span>K-12 Educational Ecosystem</span>
          </div>

          <h1 className="text-2xl font-black tracking-tight leading-tight text-slate-900">
            Devgya Global Edutech <br />
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Private Limited
            </span>
          </h1>

          <p className="text-xs text-slate-600 font-medium leading-relaxed max-w-xs mx-auto">
            Bridging the gap between schools, teachers, and parents with quality resources and innovative digital solutions.
          </p>
        </div>

        {/* 3. COMPACT ROLE SWITCHER TABS */}
        <div className="bg-slate-200/70 p-1 rounded-2xl grid grid-cols-3 gap-1">
          {[
            { id: "schools", label: "Schools", icon: Building2 },
            { id: "teachers", label: "Teachers", icon: GraduationCap },
            { id: "parents", label: "Parents", icon: Users }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveRole(tab.id as any)}
              className={`py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1 ${
                activeRole === tab.id
                  ? "bg-white text-indigo-600 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* 4. DYNAMIC MINIMAL ROLE CARD */}
        <div className="p-5 rounded-3xl bg-white border border-indigo-100 shadow-lg space-y-3 transition-all animate-in fade-in duration-300">
          <div className="flex items-center justify-between">
            <div className={`w-10 h-10 rounded-2xl bg-gradient-to-tr ${current.color} text-white flex items-center justify-center shadow-md`}>
              <Icon className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
              {current.badge}
            </span>
          </div>

          <div>
            <h3 className="text-base font-extrabold text-slate-900">{current.title}</h3>
            <p className="text-xs text-slate-600 font-medium leading-relaxed mt-1">
              {current.desc}
            </p>
          </div>

          <div className="flex flex-wrap gap-1.5 pt-1">
            {current.perks.map((perk, idx) => (
              <span key={idx} className="text-[10px] font-bold text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                {perk}
              </span>
            ))}
          </div>
        </div>

        {/* 5. MINIMAL KEY STATS STRIP */}
        <div className="grid grid-cols-2 gap-2 text-center text-[11px] font-extrabold">
          <div className="p-2.5 rounded-2xl bg-white border border-slate-200 text-slate-800 shadow-2xs">
            <div className="text-indigo-600 font-black text-sm">5,000+</div>
            <div className="text-[10px] text-slate-500 font-medium">Partner Schools</div>
          </div>
          <div className="p-2.5 rounded-2xl bg-white border border-slate-200 text-slate-800 shadow-2xs">
            <div className="text-purple-600 font-black text-sm">100%</div>
            <div className="text-[10px] text-slate-500 font-medium">CBSE & NCERT</div>
          </div>
        </div>

        {/* 6. PRIMARY CALL-TO-ACTION BUTTONS */}
        <div className="space-y-2 pt-1">
          <Link
            href="/login"
            className="w-full py-3.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white font-black text-xs rounded-2xl shadow-md flex items-center justify-center gap-2 uppercase tracking-wider active:scale-95 transition-transform"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Sign In to Platform</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <div className="grid grid-cols-2 gap-2">
            <Link
              href="/register"
              className="py-2.5 bg-white text-slate-800 font-bold text-[11px] rounded-xl border border-slate-200 shadow-2xs flex items-center justify-center gap-1 active:scale-95 transition-transform"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Create Account</span>
            </Link>

            <Link
              href="/about"
              className="py-2.5 bg-indigo-50 text-indigo-700 font-bold text-[11px] rounded-xl border border-indigo-200 shadow-2xs flex items-center justify-center gap-1 active:scale-95 transition-transform"
            >
              <Award className="w-3.5 h-3.5 text-indigo-600" />
              <span>About Us</span>
            </Link>
          </div>
        </div>

      </div>

    </div>
  );
}



