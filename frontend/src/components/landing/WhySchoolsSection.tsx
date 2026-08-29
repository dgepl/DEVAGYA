"use client";

import { useState } from "react";
import { ShieldCheck, BookOpen, Users, Sparkles, CheckCircle2, XCircle, Zap, Layers, Cpu, GraduationCap, Building2, HeartHandshake } from "lucide-react";

export function WhySchoolsSection() {
  const [activeTab, setActiveTab] = useState<"pillars" | "comparison">("pillars");

  const comparisonData = [
    { feature: "Worksheet & Assignment Creation", traditional: "Hours of Manual Typing", devgya: "OCR Worksheet & Assignment Generator" },
    { feature: "Teacher Skill Upgradation", traditional: "Occasional Seminars", devgya: "Skill Enhance Program & Modern Pedagogy Books" },
    { feature: "School Services & Supplies", traditional: "Multiple Fragmented Vendors", devgya: "Seamless Book Supply, Publishing & Placement Support" },
    { feature: "Parent & Student Support", traditional: "Static Homework Sheets", devgya: "AI Query Assistance, Quizzes & Parenting Guides" },
    { feature: "CBSE Teacher Training", traditional: "Infrequent Workshops", devgya: "Professional CBSE Teacher Training Workshops" }
  ];

  const pillars = [
    {
      title: "360-Degree Educational Ecosystem",
      description: "We bridge the gap between schools, teachers, and parents with comprehensive tools, books, and training programs under one roof.",
      icon: Layers,
      color: "from-blue-600 to-indigo-600"
    },
    {
      title: "Smart Technology",
      description: "We provide advanced digital solutions like OCR worksheet generators and AI-powered homework support to make learning and teaching effortless.",
      icon: Cpu,
      color: "from-purple-600 to-pink-600"
    },
    {
      title: "Empowering Educators",
      description: "Through skill enhancement programs and pedagogy resources, we actively help teachers upgrade their classroom efficiency.",
      icon: GraduationCap,
      color: "from-emerald-600 to-teal-600"
    },
    {
      title: "Reliable School Support",
      description: "We ensure smooth academic book supplies, CBSE teacher training workshops, and trusted placement support.",
      icon: Building2,
      color: "from-amber-500 to-orange-600"
    },
    {
      title: "Holistic Development",
      description: "We support children and families with interactive quizzes and specialized parenting guides.",
      icon: HeartHandshake,
      color: "from-rose-500 to-pink-600"
    }
  ];

  return (
    <section id="why-devgya" className="py-24 bg-slate-50 text-slate-900 relative overflow-hidden selection:bg-indigo-500 selection:text-white">
      
      {/* GLOWING BACKGROUND ORBS */}
      <div className="absolute top-0 right-1/3 w-96 h-96 bg-indigo-100/60 blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-purple-100/60 blur-[130px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 relative z-10">
        
        {/* HEADER */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="text-xs font-extrabold uppercase tracking-widest text-indigo-700 bg-indigo-50 border border-indigo-200 px-3.5 py-1.5 rounded-full">
            Modernizing Education Experience
          </span>
          
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            WHY SCHOOLS, TEACHERS & PARENTS CHOOSE <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
              DEVGYA GLOBAL
            </span>
          </h2>

          <p className="text-slate-600 text-sm sm:text-base leading-relaxed font-medium">
            Choosing Devgya Global Edutech Private Limited means partnering with a trusted team dedicated to modernizing the educational experience.
          </p>

          {/* TAB SWITCHER */}
          <div className="flex items-center justify-center gap-3 pt-4">
            <button
              onClick={() => setActiveTab("pillars")}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all border ${
                activeTab === "pillars"
                  ? "bg-indigo-600 text-white border-indigo-400 shadow-md"
                  : "bg-white text-slate-600 border-slate-200 hover:text-slate-900"
              }`}
            >
              5 Core Strategic Reasons
            </button>
            <button
              onClick={() => setActiveTab("comparison")}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all border ${
                activeTab === "comparison"
                  ? "bg-indigo-600 text-white border-indigo-400 shadow-md"
                  : "bg-white text-slate-600 border-slate-200 hover:text-slate-900"
              }`}
            >
              Educational Capabilities
            </button>
          </div>
        </div>

        {/* TAB 1: 5 STRATEGIC PILLARS */}
        {activeTab === "pillars" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
            {pillars.map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className="p-8 rounded-3xl bg-white border border-indigo-200 shadow-md space-y-4 hover:shadow-xl transition-all group flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${item.color} text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors">{item.title}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium">
                      {item.description}
                    </p>
                  </div>
                  <div className="pt-3 border-t border-slate-100 flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Trusted Advantage</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* TAB 2: COMPARISON TABLE */}
        {activeTab === "comparison" && (
          <div className="bg-white border border-indigo-200 rounded-3xl p-6 sm:p-8 shadow-xl space-y-4 animate-in fade-in duration-300">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-500" />
                Devgya Global Ecosystem Advantages
              </h3>
              <span className="text-[10px] font-extrabold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full">
                End-to-End Excellence
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-xs font-black uppercase text-slate-400">
                    <th className="py-3.5 px-4">Feature / Need</th>
                    <th className="py-3.5 px-4 text-slate-400">Traditional Method</th>
                    <th className="py-3.5 px-4 text-indigo-600">Devgya Global Solution</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-semibold">
                  {comparisonData.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                      <td className="py-4 px-4 font-extrabold text-slate-900">{row.feature}</td>
                      <td className="py-4 px-4 text-slate-500 flex items-center gap-2">
                        <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                        <span>{row.traditional}</span>
                      </td>
                      <td className="py-4 px-4 text-emerald-700 font-extrabold">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>{row.devgya}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </section>
  );
}

