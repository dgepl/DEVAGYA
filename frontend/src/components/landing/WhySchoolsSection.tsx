"use client";

import { ShieldCheck, BookOpen, Users, Sparkles, CheckCircle2 } from "lucide-react";

export function WhySchoolsSection() {
  const pillars = [
    {
      title: "360° All-in-One School Partner",
      description: "From printed textbooks and lab equipment to smart boards and digital learning tools—everything under one roof.",
      icon: BookOpen,
      color: "bg-indigo-50 text-indigo-600 border-indigo-200"
    },
    {
      title: "Teacher Empowerment",
      description: "Practical digital tools that save preparation time, reduce administrative load, and boost English communication skills.",
      icon: Sparkles,
      color: "bg-emerald-50 text-emerald-600 border-emerald-200"
    },
    {
      title: "Student & Parent Engagement",
      description: "Specialized modules to manage screen time, guide study habits at home, and make learning attractive for students.",
      icon: Users,
      color: "bg-purple-50 text-purple-600 border-purple-200"
    },
    {
      title: "Uncompromised Quality & Transparency",
      description: "Highest standards in book publications, laboratory safety, and software security.",
      icon: ShieldCheck,
      color: "bg-amber-50 text-amber-600 border-amber-200"
    }
  ];

  return (
    <section id="why-devgya" className="py-24 bg-slate-50 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="text-xs font-bold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
            End-to-End Educational Partner
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            WHY CHOOSE DEVGYA GLOBAL?
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Rather than acting merely as an equipment vendor, we serve as an end-to-end strategic educational partner for schools and study centers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {pillars.map((item, i) => (
            <div key={i} className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-3 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-2xl ${item.color} border flex items-center justify-center shrink-0`}>
                  <item.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-extrabold text-slate-900">{item.title}</h3>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed font-medium pl-1">
                {item.description}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
