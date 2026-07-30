"use client";

import { useState } from "react";
import { Zap, Sparkles, RefreshCw } from "lucide-react";
import { generateContent } from "@/lib/api_phase2";

export default function ContentStudioPage() {
  const [contentType, setContentType] = useState("worksheet");
  const [topic, setTopic] = useState("Electricity & Ohm's Law");
  const [className, setClassName] = useState("Class 10");
  const [subject, setSubject] = useState("Science");
  
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState<any | null>(null);

  const handleGenerateContent = async () => {
    setLoading(true);
    try {
      const res = await generateContent({
        content_type: contentType,
        topic,
        class_name: className,
        subject
      });
      setOutput(res.data);
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
          <Zap className="w-6 h-6 text-indigo-600" />
          AI Educational Content Studio
        </h1>
        <p className="text-xs text-slate-500 font-semibold">Generate Worksheets, Flashcards, Mind Map Outlines, and Assessment Rubrics</p>
      </div>

      {/* Content Type Selector Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { type: "worksheet", label: "Worksheets" },
          { type: "flashcard", label: "Revision Flashcards" },
          { type: "mindmap", label: "Mind Map Outlines" },
          { type: "rubric", label: "Assessment Rubrics" }
        ].map((tab) => (
          <button
            key={tab.type}
            onClick={() => setContentType(tab.type)}
            className={`py-3 px-4 rounded-2xl text-xs font-bold border transition-all ${
              contentType === tab.type
                ? "bg-indigo-600 border-indigo-600 text-white shadow-glow"
                : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Inputs Form */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-200 space-y-4 shadow-sm">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Topic / Chapter</label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Grade / Class</label>
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

        <button
          onClick={handleGenerateContent}
          disabled={loading}
          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-glow transition-all flex items-center gap-2"
        >
          {loading ? <RefreshCw className="w-4 h-4 animate-spin text-cyan-200" /> : <Sparkles className="w-4 h-4 text-cyan-200" />}
          Generate {contentType.toUpperCase()}
        </button>
      </div>

      {/* Output Render */}
      {output && (
        <div className="glass-panel p-8 rounded-3xl border border-slate-200 space-y-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">Generated Asset</span>
              <h3 className="text-lg font-bold text-slate-900">{output.title}</h3>
            </div>
            <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full font-bold uppercase">
              {contentType}
            </span>
          </div>

          {/* Render based on content type */}
          {contentType === "worksheet" && output.sections && (
            <div className="space-y-6">
              {output.sections.map((sec: any, i: number) => (
                <div key={i} className="space-y-3">
                  <h4 className="text-xs font-bold text-indigo-700 uppercase tracking-wide">{sec.heading}</h4>
                  <ul className="space-y-2">
                    {sec.questions.map((q: string, qi: number) => (
                      <li key={qi} className="p-3 bg-white rounded-xl border border-slate-200 text-xs text-slate-800 font-semibold shadow-sm">
                        {qi + 1}. {q}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}

          {contentType === "flashcard" && output.cards && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {output.cards.map((c: any, i: number) => (
                <div key={i} className="p-5 bg-white rounded-2xl border border-slate-200 space-y-3 shadow-sm">
                  <p className="text-xs font-bold text-indigo-600">Card {i + 1}</p>
                  <p className="text-xs font-bold text-slate-900">Q: {c.front}</p>
                  <div className="pt-2 border-t border-slate-100 text-xs text-emerald-700 font-semibold">
                    A: {c.back}
                  </div>
                </div>
              ))}
            </div>
          )}

          {contentType === "mindmap" && output.branches && (
            <div className="space-y-4">
              <p className="text-sm font-bold text-indigo-600">Central Topic: {output.central_node}</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {output.branches.map((b: any, i: number) => (
                  <div key={i} className="p-4 bg-white rounded-2xl border border-slate-200 space-y-2 shadow-sm">
                    <h5 className="text-xs font-bold text-slate-900">{b.name}</h5>
                    <ul className="space-y-1">
                      {b.subnodes.map((sn: string, sni: number) => (
                        <li key={sni} className="text-xs text-slate-600 font-medium">• {sn}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {contentType === "rubric" && output.criteria && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-800">
                <thead className="bg-slate-100 text-indigo-700 uppercase text-[10px] font-bold">
                  <tr>
                    <th className="p-3">Aspect</th>
                    <th className="p-3">Excellent</th>
                    <th className="p-3">Good</th>
                    <th className="p-3">Needs Improvement</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {output.criteria.map((cr: any, i: number) => (
                    <tr key={i}>
                      <td className="p-3 font-bold text-slate-900">{cr.aspect}</td>
                      <td className="p-3 text-emerald-700 font-semibold">{cr.excellent}</td>
                      <td className="p-3 text-slate-700">{cr.good}</td>
                      <td className="p-3 text-amber-700 font-semibold">{cr.needs_improvement}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
