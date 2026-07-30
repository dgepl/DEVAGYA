"use client";

import { motion } from "framer-motion";
import { Sparkles, ScanText, FileSpreadsheet, ShieldCheck, BookOpen, Layers } from "lucide-react";

export function FeaturesSection() {
  const features = [
    {
      icon: Sparkles,
      title: "OpenAI Compatible Paper AI",
      description: "Generate complete NCERT question papers in under 5 seconds with precise mark distributions and difficulty levels.",
      tag: "OpenAI / Groq AI",
      cols: "md:col-span-2"
    },
    {
      icon: ScanText,
      title: "Mistral/Vision OCR Scanner",
      description: "Convert textbook photos, PDF worksheets, or printed notes directly into structured text prompts.",
      tag: "OCR Vision",
      cols: "md:col-span-1"
    },
    {
      icon: FileSpreadsheet,
      title: "ReportLab PDF Engine",
      description: "Compile official school headers, dates, time limits, candidate instructions, watermarks, and separate Answer Keys.",
      tag: "Vector PDF",
      cols: "md:col-span-1"
    },
    {
      icon: BookOpen,
      title: "Searchable NCERT Catalog",
      description: "Built-in catalog for Classes 6 to 12 across CBSE & ICSE boards for Physics, Chemistry, Biology, and Math.",
      tag: "CBSE & ICSE",
      cols: "md:col-span-2"
    },
    {
      icon: ShieldCheck,
      title: "Multi-Tenant Supabase RLS",
      description: "Bank-grade database partition isolating school records, teacher content, and audit logs.",
      tag: "Supabase RLS",
      cols: "md:col-span-2"
    },
    {
      icon: Layers,
      title: "Future Portal Ready",
      description: "Phase 1 & 2 architecture constructed to cleanly extend to Student, Parent, and School Management portals.",
      tag: "Modular SaaS",
      cols: "md:col-span-1"
    }
  ];

  return (
    <section id="features" className="py-24 bg-slate-50 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-600 mb-3">Enterprise Core Features</h2>
          <p className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">Everything Schools Need to Scale Assessment</p>
          <p className="text-slate-600 mt-4 text-base">Designed from scratch to deliver hyper-accurate exam generation and textbook digitalization.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((f, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className={`glass-card p-8 rounded-3xl ${f.cols} flex flex-col justify-between group hover:border-indigo-300`}
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                    <f.icon className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-bold tracking-wider uppercase bg-slate-100 border border-slate-200 text-indigo-700 px-3 py-1 rounded-full">
                    {f.tag}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{f.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{f.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
