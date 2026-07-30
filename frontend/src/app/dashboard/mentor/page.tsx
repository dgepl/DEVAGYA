"use client";

import { useState } from "react";
import { GraduationCap, Sparkles, RefreshCw, Lightbulb, CheckCircle2 } from "lucide-react";
import { askTeacherMentor } from "@/lib/api_phase2";

export default function MentorPage() {
  const [query, setQuery] = useState("How should I teach Chemical Reactions to Class 10?");
  const [className, setClassName] = useState("Class 10");
  const [subject, setSubject] = useState("Science");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);

  const presets = [
    "How to teach Newton's Laws with simple experiments?",
    "Suggest Bloom's Taxonomy questions for Quadratic Equations",
    "Give classroom activities for Photosynthesis",
    "Create a 15-minute revision strategy for Board Exams"
  ];

  const handleAsk = async (promptQuery?: string) => {
    const q = promptQuery || query;
    setLoading(true);
    try {
      const res = await askTeacherMentor(q, className, subject);
      setResponse(res.response);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
          <GraduationCap className="w-6 h-6 text-indigo-600" />
          AI Teacher Mentor
        </h1>
        <p className="text-xs text-slate-500 font-semibold">Pedagogical strategies, classroom experiments, and structured lesson advice</p>
      </div>

      {/* Preset Chips */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-bold text-slate-600 mr-2 flex items-center gap-1">
          <Lightbulb className="w-3.5 h-3.5 text-amber-500" /> Quick Presets:
        </span>
        {presets.map((p, idx) => (
          <button
            key={idx}
            onClick={() => { setQuery(p); handleAsk(p); }}
            className="px-3.5 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold rounded-full shadow-sm transition-all"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Controls Form */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-200 space-y-4 shadow-sm">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Target Grade / Class</label>
            <input
              type="text"
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Subject</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 font-semibold"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Ask Pedagogical Question / Teaching Strategy</label>
          <textarea
            rows={3}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl p-4 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 font-medium"
          />
        </div>

        <button
          onClick={() => handleAsk()}
          disabled={loading}
          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-glow transition-all flex items-center gap-2"
        >
          {loading ? <RefreshCw className="w-4 h-4 animate-spin text-cyan-200" /> : <Sparkles className="w-4 h-4 text-cyan-200" />}
          Get Mentor Advice
        </button>
      </div>

      {/* Output Response */}
      {response && (
        <div className="glass-panel p-8 rounded-3xl border border-slate-200 space-y-4 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 pb-3 border-b border-slate-200">
            <CheckCircle2 className="w-4 h-4" />
            Structured Pedagogical Guidance
          </div>
          <div className="prose max-w-none text-xs text-slate-800 leading-relaxed whitespace-pre-wrap font-sans">
            {response}
          </div>
        </div>
      )}

    </div>
  );
}
