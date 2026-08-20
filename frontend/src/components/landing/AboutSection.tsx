"use client";

import { useState } from "react";
import { 
  Building2, 
  GraduationCap, 
  BookOpen, 
  Users, 
  HeartHandshake, 
  CheckCircle2, 
  Sparkles, 
  ShieldCheck, 
  ArrowRight, 
  Award, 
  Cpu, 
  Layers 
} from "lucide-react";

export function AboutSection() {
  const [activeStakeholder, setActiveStakeholder] = useState<number>(0);

  const stakeholders = [
    {
      title: "For Schools",
      subtitle: "Comprehensive Institutional Support",
      icon: Building2,
      color: "from-indigo-600 to-purple-600",
      accent: "border-indigo-200 bg-indigo-50/60 text-indigo-900",
      desc: "We facilitate seamless book supply, academic publishing, professional CBSE teacher training workshops, and reliable job placement support.",
      highlights: ["Seamless Book Supply", "Academic Publishing", "CBSE Teacher Training Workshops", "Reliable Job Placement Support"]
    },
    {
      title: "For Teachers",
      subtitle: "Empowering Educators Nationwide",
      icon: GraduationCap,
      color: "from-purple-600 to-pink-600",
      accent: "border-purple-200 bg-purple-50/60 text-purple-900",
      desc: "We equip educators with cutting-edge digital tools like OCR worksheet and assignment generators, the Teachers Skill Olympiad, and modern pedagogy books to enhance classroom efficiency.",
      highlights: ["OCR Worksheet & Assignment Generators", "Teachers Skill Olympiad", "Modern Pedagogy Books", "Enhanced Classroom Efficiency"]
    },
    {
      title: "For Parents & Students",
      subtitle: "Interactive & Holistic Learning",
      icon: Users,
      color: "from-emerald-600 to-teal-600",
      accent: "border-emerald-200 bg-emerald-50/60 text-emerald-900",
      desc: "We foster engaging learning through interactive homework and AI-powered query assistance, fun educational quizzes, and specialised parenting guides to ensure holistic child development.",
      highlights: ["Interactive Homework Support", "AI-Powered Query Assistance", "Fun Educational Quizzes", "Specialised Parenting Guides"]
    }
  ];

  return (
    <section id="about" className="py-24 bg-white text-slate-900 relative overflow-hidden selection:bg-indigo-500 selection:text-white">
      
      {/* GLOWING AMBIENT BACKGROUND */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-indigo-100/50 blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-100/50 blur-[140px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 relative z-10">
        
        {/* HEADER */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-extrabold shadow-xs">
            <Award className="w-3.5 h-3.5 text-amber-500" />
            <span className="uppercase tracking-widest">Bridging Education Gaps</span>
          </div>
          
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            Empowering the Entire <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
              Academic Ecosystem
            </span>
          </h2>

          <p className="text-slate-600 text-sm sm:text-base leading-relaxed font-medium">
            At Devgya Global Edutech, we are dedicated to transforming the educational landscape by bridging the gap between schools, teachers, and parents. Headquartered in Jhajjar, Haryana, our mission is to empower the entire academic ecosystem through innovative digital solutions and quality academic resources.
          </p>
        </div>

        {/* 3D INTERACTIVE STAKEHOLDER SHOWCASE */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* LEFT SELECTOR LIST */}
          <div className="lg:col-span-5 space-y-3">
            <p className="text-xs font-extrabold uppercase tracking-wider text-slate-500 px-1">
              Stakeholder Solutions
            </p>
            {stakeholders.map((sh, idx) => {
              const Icon = sh.icon;
              const isSelected = activeStakeholder === idx;
              return (
                <button
                  key={idx}
                  onClick={() => setActiveStakeholder(idx)}
                  className={`w-full p-4 rounded-2xl border text-left transition-all flex items-center justify-between gap-4 group ${
                    isSelected
                      ? "bg-indigo-50/70 border-indigo-400 shadow-md scale-[1.02]"
                      : "bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-700"
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${sh.color} text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors">
                        {sh.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 font-semibold truncate max-w-[200px]">
                        {sh.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    isSelected ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-500"
                  }`}>
                    {idx + 1}
                  </div>
                </button>
              );
            })}
          </div>

          {/* RIGHT DETAILED STAKEHOLDER CARD */}
          <div className="lg:col-span-7">
            {stakeholders.map((sh, idx) => {
              if (idx !== activeStakeholder) return null;
              const Icon = sh.icon;
              return (
                <div
                  key={idx}
                  className="p-8 sm:p-10 rounded-3xl bg-white border border-indigo-200 space-y-6 shadow-xl backdrop-blur-xl animate-in fade-in duration-300"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${sh.color} text-white flex items-center justify-center shadow-md`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-xl font-black text-slate-900">{sh.title}</h3>
                        <p className="text-xs text-indigo-600 font-extrabold">{sh.subtitle}</p>
                      </div>
                    </div>

                    <span className="text-[10px] font-extrabold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200 px-3 py-1 rounded-full">
                      Dedicated Solutions
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed">
                    {sh.desc}
                  </p>

                  <div className="space-y-3 pt-2">
                    <h5 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Key Offerings</h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {sh.highlights.map((h, hIdx) => (
                        <div key={hIdx} className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>{h}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              );
            })}
          </div>

        </div>

      </div>
    </section>
  );
}

