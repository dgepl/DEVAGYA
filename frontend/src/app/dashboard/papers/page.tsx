"use client";

import { FileText, Download, CheckCircle, Trash2, Plus, Sparkles } from "lucide-react";
import Link from "next/link";
import { useAppStore } from "@/store/useAppStore";
import { downloadPDF } from "@/lib/api";

export default function PapersPage() {
  const { savedPapers, activePaper, deleteSavedPaper } = useAppStore();

  const allPapers = savedPapers.length > 0 ? savedPapers : (activePaper ? [activePaper] : []);

  return (
    <div className="space-y-8">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <FileText className="w-6 h-6 text-indigo-600" />
            Question Paper Archive
          </h1>
          <p className="text-xs text-slate-500 font-semibold mt-1">View, manage, and re-download generated NCERT exam papers and Answer Keys</p>
        </div>

        <Link
          href="/dashboard/generator"
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/30 flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <Sparkles className="w-4 h-4" />
          <span>Generate New Paper</span>
        </Link>
      </div>

      {allPapers.length > 0 ? (
        <div className="space-y-4">
          {allPapers.map((paper, idx) => (
            <div key={idx} className="glass-panel p-6 rounded-3xl border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded">
                    {paper.class_name} • {paper.subject}
                  </span>
                  <span className="text-xs text-slate-600 font-medium">{paper.chapter}</span>
                </div>
                <h3 className="text-base font-bold text-slate-900">{paper.title}</h3>
                <p className="text-xs text-slate-500 font-medium">{paper.questions?.length || 0} Questions • Total {paper.total_marks} Marks • Time: {paper.time_allowed_mins} Mins</p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => downloadPDF(paper, false)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-glow transition-all flex items-center gap-1.5 cursor-pointer"
                  title="Download Question Paper PDF (No Watermark)"
                >
                  <Download className="w-3.5 h-3.5" />
                  Paper PDF
                </button>
                <button
                  onClick={() => downloadPDF(paper, true)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-glow transition-all flex items-center gap-1.5 cursor-pointer"
                  title="Download Teacher Answer Key PDF (No Watermark)"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  Answer Key
                </button>
                <button
                  onClick={() => deleteSavedPaper(idx)}
                  className="p-2 bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-400 border border-slate-200 rounded-xl transition-colors cursor-pointer"
                  title="Delete from archive"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-panel p-16 rounded-3xl border border-slate-200 text-center space-y-4 shadow-sm">
          <FileText className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-900">No Saved Papers Found</h3>
          <p className="text-xs text-slate-500 font-medium max-w-sm mx-auto">
            Once you generate Question Papers in the AI Studio, they will be archived here permanently for instant downloading.
          </p>
        </div>
      )}

    </div>
  );
}
