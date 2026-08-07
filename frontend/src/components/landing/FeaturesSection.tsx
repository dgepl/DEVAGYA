"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, ScanText, FileSpreadsheet, ShieldCheck, BookOpen, Layers, ArrowRight, CheckCircle2 } from "lucide-react";

export function FeaturesSection() {
  const [activeShowcase, setActiveShowcase] = useState<"generator" | "planner" | "ocr">("generator");

  const showcases = [
    {
      id: "generator",
      title: "AI Question Generator",
      tag: "CBSE & NCERT",
      desc: "Generate 1M, 3M, and 5M NCERT periodic assessment papers in under 5 seconds with precise mark weightage, HOTS badges, and model answer keys.",
      image: "/showcase-generator.png",
      features: [
        "Class 6 to 12 CBSE / NCERT Curriculum Alignment",
        "HOTS (Higher Order Thinking Skills) & Competency-based items",
        "Export custom school watermarked PDFs with ReportLab engine",
        "Step-by-step model answer keys and marking schemes"
      ]
    },
    {
      id: "planner",
      title: "5E Framework Lesson Planner",
      tag: "Pedagogical AI",
      desc: "Build structured unit plans and 45-minute lesson plans adhering strictly to NCERT's 5E Pedagogical Model (Engage, Explore, Explain, Elaborate, Evaluate).",
      image: "/showcase-planner.png",
      features: [
        "NCERT 5E Pedagogical Framework compliance",
        "Learning outcomes & Bloom's taxonomy objectives",
        "Classroom activity timelines & lab experiment setups",
        "Printable & shareable lesson plan documentation"
      ]
    },
    {
      id: "ocr",
      title: "OCR Vision Textbook Scanner",
      tag: "Vision AI",
      desc: "Scan textbook photos, printed worksheets, or handwritten notes to instantly digitize text into clean editable prompts and question items.",
      image: "/showcase-ocr.png",
      features: [
        "Instant camera photo & PDF image scanning",
        "OCR text extraction with bounding box visualization",
        "Auto-converts scanned diagrams into structured questions",
        "Direct export into Question Generator studio"
      ]
    }
  ];

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
      title: "15 Specialized AI Agents",
      description: "Dedicated AI assistants for Teachers, Students, and Parents constructed to scale school digital learning.",
      tag: "Modular AI OS",
      cols: "md:col-span-1"
    }
  ];

  return (
    <section id="features" className="py-24 bg-slate-50 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* SECTION HEADER */}
        <div className="text-center max-w-3xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-widest text-indigo-600 bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-full">
            Enterprise Core Features
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight mt-3">
            Everything Schools Need to Scale Assessment
          </h2>
          <p className="text-slate-600 mt-4 text-base font-medium">
            Designed from scratch to deliver hyper-accurate exam generation, 5E lesson planning, and textbook digitalization.
          </p>
        </div>

        {/* INTERACTIVE 3D FEATURE SHOWCASE SWITCHER */}
        <div className="bg-slate-900 rounded-3xl p-6 sm:p-10 text-white shadow-2xl space-y-8 border border-slate-800">
          
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6">
            <div>
              <h3 className="text-xl font-extrabold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                Live Interactive Platform Showcase
              </h3>
              <p className="text-xs text-slate-400 font-medium">
                Click a tool tab below to inspect real platform UI mockups and capabilities.
              </p>
            </div>

            <div className="flex items-center gap-2">
              {showcases.map((sc) => (
                <button
                  key={sc.id}
                  onClick={() => setActiveShowcase(sc.id as any)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                    activeShowcase === sc.id
                      ? "bg-indigo-600 text-white border-indigo-400 shadow-lg shadow-indigo-600/30"
                      : "bg-white/5 text-slate-400 border-white/10 hover:text-white"
                  }`}
                >
                  {sc.title}
                </button>
              ))}
            </div>
          </div>

          {/* ACTIVE SHOWCASE CARD */}
          {showcases.map((sc) => {
            if (sc.id !== activeShowcase) return null;
            return (
              <div key={sc.id} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center animate-in fade-in duration-300">
                <div className="lg:col-span-5 space-y-4">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 px-3 py-1 rounded-full">
                    {sc.tag}
                  </span>
                  <h4 className="text-2xl font-black text-white">{sc.title}</h4>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
                    {sc.desc}
                  </p>

                  <ul className="space-y-2 pt-2">
                    {sc.features.map((feat, i) => (
                      <li key={i} className="flex items-center gap-2.5 text-xs text-slate-200 font-semibold">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="lg:col-span-7 relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-slate-950">
                  <img
                    src={sc.image}
                    alt={sc.title}
                    className="w-full h-auto object-cover rounded-2xl hover:scale-105 transition-transform duration-500"
                  />
                </div>
              </div>
            );
          })}

        </div>

        {/* 6 GRID FEATURE CARDS */}
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
                <p className="text-sm text-slate-600 leading-relaxed font-medium">{f.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
