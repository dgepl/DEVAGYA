"use client";

import { useState } from "react";
import { FileText, Sparkles, Plus, Copy, RefreshCw } from "lucide-react";
import { handleNoteAIAction } from "@/lib/api";

export function AINotebook() {
  const [content, setContent] = useState(
    "# Science Chapter 10: Light Reflection & Refraction\n\n## Core Concepts\n1. Reflection obeys the fundamental law: Angle of Incidence i = Angle of Reflection r.\n2. Spherical mirrors: Concave mirrors converge light; Convex mirrors diverge light.\n3. Mirror Formula: 1/f = 1/v + 1/u\n\n## Important Exam Questions\n- Q: Why does a ray passing through C retrace its path?\n- A: Because it strikes the mirror along the normal (angle of incidence = 0°)."
  );
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<string | null>(null);

  const handleAction = async (action: string) => {
    setAiLoading(true);
    setAiResult(null);
    try {
      const res = await handleNoteAIAction({ note_id: "notebook-1", content, action });
      setAiResult(res.result);
    } catch (e) {
      console.error(e);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* HEADER BAR */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-200">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900">AI Interactive Notebook</h1>
            <p className="text-xs text-slate-500">Notion AI style rich notes workspace with inline assist</p>
          </div>
        </div>

        {/* AI ACTION BUTTONS */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleAction("summarize")}
            disabled={aiLoading}
            className="px-3.5 py-2 bg-slate-100 hover:bg-blue-50 text-slate-800 font-bold text-xs rounded-xl border border-slate-200"
          >
            Summarize
          </button>
          <button
            onClick={() => handleAction("rewrite")}
            disabled={aiLoading}
            className="px-3.5 py-2 bg-slate-100 hover:bg-blue-50 text-slate-800 font-bold text-xs rounded-xl border border-slate-200"
          >
            Rewrite
          </button>
          <button
            onClick={() => handleAction("generate_quiz")}
            disabled={aiLoading}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md"
          >
            Create Quiz
          </button>
        </div>
      </div>

      {aiLoading && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl text-xs font-bold text-blue-700 flex items-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin" />
          <span>Notebook AI Assistant is executing command...</span>
        </div>
      )}

      {aiResult && (
        <div className="bg-indigo-50/70 border border-indigo-200 p-5 rounded-3xl space-y-2 animate-in fade-in">
          <div className="text-xs font-extrabold text-indigo-700 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Notion AI Output:</span>
          </div>
          <div className="text-xs text-slate-900 whitespace-pre-line leading-relaxed font-medium bg-white p-4 rounded-2xl border border-indigo-100">
            {aiResult}
          </div>
        </div>
      )}

      {/* NOTEBOOK EDITOR TEXTAREA */}
      <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-4">
        <textarea
          rows={16}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full text-xs font-mono text-slate-900 leading-relaxed border-0 focus:outline-none resize-none"
        />
      </div>

    </div>
  );
}
