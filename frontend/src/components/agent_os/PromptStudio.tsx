"use client";

import { useState } from "react";
import { 
  FileText, 
  Sparkles, 
  Plus, 
  Tag, 
  Play, 
  Copy, 
  RefreshCw, 
  CheckCircle2,
  Code
} from "lucide-react";
import { getPromptTemplates, testPromptTemplate } from "@/lib/api";

export function PromptStudio() {
  const [prompts, setPrompts] = useState([
    {
      id: "pr-1",
      title: "Socratic Physics Problem Solver",
      category: "teaching",
      variables: ["subject", "chapter", "problem_statement"],
      prompt_text: "You are a Socratic tutor teaching {{subject}} ({{chapter}}). The student presents the problem: {{problem_statement}}. Ask 2 probing questions to guide their reasoning without giving the direct answer.",
      tags: ["socratic", "physics"]
    },
    {
      id: "pr-2",
      title: "CBSE Board Paper Marking Rubric",
      category: "assessment",
      variables: ["question", "max_marks"],
      prompt_text: "Generate a strict CBSE marking scheme for the question: '{{question}}' (Max Marks: {{max_marks}}). Include step-wise mark distribution and key technical keywords.",
      tags: ["cbse", "rubric"]
    }
  ]);

  const [activePromptId, setActivePromptId] = useState("pr-1");
  const [variableValues, setVariableValues] = useState<Record<string, string>>({
    subject: "Physics",
    chapter: "Optics",
    problem_statement: "A concave mirror has a focal length of 15cm. Where will an object placed 30cm away form an image?"
  });
  const [testLoading, setTestLoading] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);

  const activePrompt = prompts.find(p => p.id === activePromptId) || prompts[0];

  const handleTest = async () => {
    setTestLoading(true);
    try {
      const res = await testPromptTemplate({
        prompt_text: activePrompt.prompt_text,
        variable_values: variableValues
      });
      setTestResult(res);
    } catch (e) {
      console.error(e);
    } finally {
      setTestLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      
      {/* HEADER BAR */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center shadow-lg shadow-amber-200 font-black">
            <Code className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900">Prompt Studio & Template Engine</h1>
            <p className="text-xs text-slate-500">Design, version, test, and export prompt templates with dynamic variables</p>
          </div>
        </div>

        <button className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-2xl shadow-md transition-all flex items-center gap-1.5 shrink-0">
          <Plus className="w-4 h-4" />
          <span>New Prompt Template</span>
        </button>
      </div>

      {/* TWO COLUMN WORKSPACE GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* TEMPLATES LIST */}
        <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-sm space-y-3">
          <h2 className="text-xs font-extrabold uppercase text-slate-400">Prompt Templates ({prompts.length})</h2>
          <div className="space-y-2">
            {prompts.map((pr) => (
              <div
                key={pr.id}
                onClick={() => {
                  setActivePromptId(pr.id);
                  setTestResult(null);
                }}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                  activePromptId === pr.id
                    ? "bg-amber-50 border-amber-300 shadow-xs"
                    : "bg-white border-slate-100 hover:bg-slate-50"
                }`}
              >
                <h3 className="text-xs font-black text-slate-900">{pr.title}</h3>
                <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md mt-1 inline-block">
                  {pr.category}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* PROMPT EDITOR & LIVE VARIABLE TESTING */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-sm font-extrabold text-slate-900">{activePrompt.title}</h2>
            
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Prompt Template Text</label>
              <textarea 
                rows={4}
                value={activePrompt.prompt_text}
                onChange={(e) => {
                  const val = e.target.value;
                  setPrompts(prompts.map(p => p.id === activePromptId ? { ...p, prompt_text: val } : p));
                }}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs font-mono text-slate-900 focus:outline-none"
              />
            </div>

            {/* VARIABLE INPUT FIELDS */}
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-extrabold text-slate-700 uppercase">Interpolate Variables:</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {activePrompt.variables.map((v) => (
                  <div key={v}>
                    <label className="text-[11px] font-bold text-indigo-600 block mb-1">{"{{" + v + "}}"}</label>
                    <input 
                      type="text"
                      value={variableValues[v] || ""}
                      onChange={(e) => setVariableValues({ ...variableValues, [v]: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
                    />
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={handleTest}
              disabled={testLoading}
              className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-2xl shadow-md transition-all flex items-center justify-center gap-2"
            >
              {testLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-slate-950" />}
              <span>Test Prompt Template</span>
            </button>
          </div>

          {/* TEST RESULTS */}
          {testResult && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3 animate-in fade-in">
              <h3 className="text-xs font-extrabold text-emerald-600 uppercase flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Test Execution Output:</span>
              </h3>
              <div className="text-xs text-slate-900 bg-slate-50 p-4 rounded-2xl border border-slate-200 whitespace-pre-line leading-relaxed font-medium">
                {testResult.result}
              </div>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
