"use client";

import { useState } from "react";
import { 
  Zap, 
  Sparkles, 
  FileText, 
  Layers, 
  Layout, 
  ListOrdered, 
  Copy, 
  RefreshCw 
} from "lucide-react";
import { generateRevisionMaterial } from "@/lib/api";

export function AIContentStudio() {
  const [contentType, setContentType] = useState("worksheet");
  const [subject, setSubject] = useState("Science");
  const [topic, setTopic] = useState("Chemical Reactions and Equations");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await generateRevisionMaterial({ subject, topic, revision_type: contentType });
      setResult(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      
      {/* HEADER BAR */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center shadow-lg shadow-amber-200 font-black">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900">Multi-Format AI Content Studio</h1>
            <p className="text-xs text-slate-500">Generate Presentations, Worksheets, Posters, Timelines, Flashcards & Slides</p>
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-2xl shadow-md transition-all flex items-center gap-1.5 shrink-0"
        >
          {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          <span>Generate Content</span>
        </button>
      </div>

      {/* CONTENT FORMAT TABS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { type: "worksheet", label: "Worksheet", icon: FileText },
          { type: "presentation", label: "Presentation Slides", icon: Layout },
          { type: "timeline", label: "Infographic Timeline", icon: ListOrdered },
          { type: "flashcard", label: "Flashcard Deck", icon: Layers }
        ].map((item) => (
          <button
            key={item.type}
            onClick={() => setContentType(item.type)}
            className={`p-4 rounded-2xl border text-xs font-bold transition-all flex items-center gap-2 ${
              contentType === item.type
                ? "bg-amber-500 text-slate-950 border-amber-500 shadow-sm"
                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
            }`}
          >
            <item.icon className="w-4 h-4" />
            <span>{item.label}</span>
          </button>
        ))}
      </div>

      {/* INPUT CONTROLS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <input 
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Subject"
          className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
        />
        <input 
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Topic"
          className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
        />
      </div>

      {/* GENERATED CONTENT OUTPUT DISPLAY */}
      {result && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-base font-extrabold text-slate-900">{result.title}</h2>
            <span className="text-xs text-amber-700 font-bold bg-amber-50 px-2.5 py-0.5 rounded-md uppercase">
              Format: {contentType}
            </span>
          </div>

          <div className="text-xs text-slate-800 bg-slate-50 p-4 rounded-2xl border border-slate-200 whitespace-pre-line leading-relaxed font-medium">
            {result.summary || JSON.stringify(result, null, 2)}
          </div>
        </div>
      )}

    </div>
  );
}
