"use client";

import Link from "next/link";
import { Sparkles, ScanText, FileText, ArrowRight, Zap, BookOpen } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";

export default function DashboardOverviewPage() {
  const { user, savedPapers } = useAppStore();

  const metrics = [
    { label: "Question Papers Saved", value: `${savedPapers.length}`, change: "Saved in Session" },
    { label: "OCR Textbook Scans", value: "0", change: "Ready for Scan" },
    { label: "Active School Board", value: `${user.board || "CBSE"}`, change: `${user.schoolName || "DEVAGYA GLOBAL"}` },
    { label: "PDF Export Status", value: "Active", change: "With School Header" },
  ];

  const recentActivity = [
    { title: "Periodic Assessment - Class 10 Science (Ch 1)", date: "Today, 10:45 AM", type: "Question Paper", status: "Generated" },
    { title: "Mid-Term Physics Exam - Class 12 Electricity", date: "Yesterday, 4:15 PM", type: "Answer Key", status: "PDF Compiled" },
    { title: "OCR Scan - Chemistry Textbook Page 42", date: "28 Jul 2026", type: "OCR Extraction", status: "Processed" },
  ];

  return (
    <div className="space-y-8">
      
      {/* Welcome Banner */}
      <div className="glass-panel p-8 rounded-3xl border border-slate-200 bg-gradient-to-r from-indigo-50 via-white to-brand-50 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm">
        <div className="space-y-2 max-w-xl">
          <span className="text-xs font-bold uppercase tracking-widest text-indigo-600">Teacher Workspace</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Welcome back, {user.name}!</h1>
          <p className="text-xs text-slate-600 font-medium leading-relaxed">
            Ready to generate your next NCERT exam paper or scan textbook chapters with AI Intelligence?
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/generator"
            className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-glow transition-all flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-cyan-200" />
            Launch AI Generator
          </Link>
          <Link
            href="/dashboard/ocr"
            className="px-5 py-3 glass-card text-slate-800 font-bold text-xs rounded-xl border border-slate-200 hover:border-indigo-500 transition-all flex items-center gap-2 shadow-sm"
          >
            <ScanText className="w-4 h-4 text-indigo-600" />
            Scan Book Page
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((m, idx) => (
          <div key={idx} className="glass-card p-6 rounded-2xl border border-slate-200 space-y-2">
            <p className="text-xs font-bold text-slate-500 uppercase">{m.label}</p>
            <p className="text-3xl font-extrabold text-slate-900">{m.value}</p>
            <p className="text-[11px] font-bold text-indigo-600">{m.change}</p>
          </div>
        ))}
      </div>

      {/* Quick Launch Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <div className="glass-panel p-6 rounded-3xl border border-slate-200 space-y-4 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
            <Zap className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900">AI Question Generator</h3>
          <p className="text-xs text-slate-600 leading-relaxed font-medium">Select grade, subject, and chapter constraints to build custom assessments.</p>
          <Link href="/dashboard/generator" className="inline-flex items-center gap-2 text-xs font-bold text-indigo-600 hover:underline">
            Generate Now <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="glass-panel p-6 rounded-3xl border border-slate-200 space-y-4 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-cyan-100 text-cyan-700 flex items-center justify-center font-bold">
            <ScanText className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900">OCR Textbook Scanner</h3>
          <p className="text-xs text-slate-600 leading-relaxed font-medium">Upload book photos or PDF worksheets to extract clean markdown text.</p>
          <Link href="/dashboard/ocr" className="inline-flex items-center gap-2 text-xs font-bold text-cyan-700 hover:underline">
            Scan Textbook <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="glass-panel p-6 rounded-3xl border border-slate-200 space-y-4 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
            <BookOpen className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900">NCERT Directory Catalog</h3>
          <p className="text-xs text-slate-600 leading-relaxed font-medium">Browse CBSE & ICSE syllabus units for Class 6 to 12.</p>
          <Link href="/dashboard/ncert" className="inline-flex items-center gap-2 text-xs font-bold text-emerald-700 hover:underline">
            Explore Catalog <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

      </div>

      {/* Recent Activity Table */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-200 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900">Recent Generated Papers & Scans</h3>
          <Link href="/dashboard/papers" className="text-xs font-bold text-indigo-600 hover:underline">View All</Link>
        </div>

        <div className="divide-y divide-slate-200">
          {recentActivity.map((act, i) => (
            <div key={i} className="py-3 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <FileText className="w-4 h-4 text-indigo-600 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-slate-900">{act.title}</p>
                  <p className="text-[10px] text-slate-500 font-medium">{act.date} • {act.type}</p>
                </div>
              </div>
              <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                {act.status}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
