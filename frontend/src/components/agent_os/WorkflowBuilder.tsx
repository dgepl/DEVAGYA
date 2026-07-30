"use client";

import { useState } from "react";
import { 
  GitFork, 
  Sparkles, 
  Play, 
  CheckCircle2, 
  RefreshCw, 
  ArrowRight,
  Layers,
  FileText,
  Copy
} from "lucide-react";
import { runWorkflow } from "@/lib/api";

export function WorkflowBuilder() {
  const [selectedWfId, setSelectedWfId] = useState("wf-1");
  const [inputText, setInputText] = useState("NCERT Class 10 Science - Chapter 10 Light Reflection and Refraction");
  const [loading, setLoading] = useState(false);
  const [runResult, setRunResult] = useState<any>(null);

  const workflows = [
    {
      id: "wf-1",
      title: "Book Chapter -> Full Learning Suite",
      description: "Upload Book Chapter -> Summarize -> Generate Quiz -> Generate Flashcards -> Mind Map -> Export PDF",
      category: "Learning Automation",
      steps: ["Summarize Chapter", "Generate 5 Adaptive Quizzes", "Generate 6 Active Recall Flashcards", "Create Mind Map Tree"]
    },
    {
      id: "wf-2",
      title: "Syllabus -> Exam Prep & Countdown Roadmap",
      description: "Input Syllabus -> Identify Weak Topics -> Build Day-by-Day Study Schedule -> Generate Expected Questions",
      category: "Exam Strategy",
      steps: ["Extract High Yield Topics", "Build Countdown Schedule", "Generate 5 Expected Board Questions"]
    },
    {
      id: "wf-3",
      title: "Teacher Lesson Plan & Worksheet Package",
      description: "Input Chapter -> Generate 45-min Lesson Plan -> Generate Differentiated Worksheet -> Rubric Matrix",
      category: "Teacher Productivity",
      steps: ["Draft 45-min Plan", "Generate Class Worksheet", "Create Grading Rubric"]
    }
  ];

  const handleRunWorkflow = async () => {
    if (loading) return;
    setLoading(true);
    setRunResult(null);
    try {
      const res = await runWorkflow({ workflow_id: selectedWfId, input_text: inputText });
      setRunResult(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const activeWf = workflows.find(w => w.id === selectedWfId) || workflows[0];

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      
      {/* HEADER BAR */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-lg shadow-purple-200">
            <GitFork className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900">Visual AI Workflow Engine</h1>
            <p className="text-xs text-slate-500">Automate multi-step educational workflows with reusable AI pipelines</p>
          </div>
        </div>

        <button
          onClick={handleRunWorkflow}
          disabled={loading}
          className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-2xl shadow-md transition-all flex items-center gap-1.5 shrink-0"
        >
          {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-white" />}
          <span>Run AI Workflow</span>
        </button>
      </div>

      {/* WORKFLOW TEMPLATE SELECTOR TILES */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {workflows.map((wf) => {
          const isSelected = selectedWfId === wf.id;
          return (
            <div
              key={wf.id}
              onClick={() => {
                setSelectedWfId(wf.id);
                setRunResult(null);
              }}
              className={`p-5 rounded-3xl border transition-all cursor-pointer space-y-3 ${
                isSelected
                  ? "bg-purple-50 border-purple-400 shadow-md ring-2 ring-purple-400/20"
                  : "bg-white border-slate-200 hover:border-purple-200"
              }`}
            >
              <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-700">
                {wf.category}
              </span>
              <h3 className="text-xs font-black text-slate-900">{wf.title}</h3>
              <p className="text-[11px] text-slate-500 font-medium leading-relaxed">{wf.description}</p>
            </div>
          );
        })}
      </div>

      {/* INPUT MATERIAL & VISUAL STEP PIPELINE */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 block">Workflow Source Input Material</label>
          <textarea
            rows={3}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs font-bold text-slate-900 focus:outline-none"
            placeholder="Paste text, chapter title, or syllabus details..."
          />
        </div>

        {/* VISUAL PIPELINE STEPS */}
        <div className="space-y-3">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Automated Pipeline Steps:</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {activeWf.steps.map((step, sIdx) => (
              <div key={sIdx} className="p-3.5 rounded-2xl bg-purple-50/50 border border-purple-100 flex items-center gap-3">
                <span className="w-7 h-7 rounded-xl bg-purple-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                  {sIdx + 1}
                </span>
                <span className="text-xs font-bold text-purple-950">{step}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* EXECUTION RESULTS */}
      {loading && (
        <div className="p-6 bg-purple-50 border border-purple-200 rounded-3xl text-center space-y-2">
          <RefreshCw className="w-6 h-6 text-purple-600 animate-spin mx-auto" />
          <h3 className="text-xs font-extrabold text-purple-900">Executing Visual AI Workflow...</h3>
          <p className="text-[11px] text-purple-700">Running step-by-step pipeline transformations.</p>
        </div>
      )}

      {runResult && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6 animate-in zoom-in-95">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>Workflow Execution Results ({runResult.title})</span>
            </h3>
            <span className="text-xs text-slate-400 font-bold">{runResult.execution_time_ms} ms</span>
          </div>

          <div className="space-y-4">
            {runResult.step_results?.map((res: any, idx: number) => (
              <div key={idx} className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-2">
                <div className="text-xs font-extrabold text-indigo-700 uppercase">
                  Step {idx + 1}: {res.step_name}
                </div>
                <div className="text-xs text-slate-800 whitespace-pre-line leading-relaxed font-medium bg-white p-3 rounded-xl border border-slate-200">
                  {res.output}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
