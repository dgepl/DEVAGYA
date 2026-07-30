"use client";

import { useState } from "react";
import { 
  BookOpen, 
  Sparkles, 
  FileText, 
  GitFork, 
  Calculator, 
  Zap, 
  Calendar, 
  RefreshCw, 
  CheckCircle2,
  Copy,
  Download
} from "lucide-react";
import { generateRevisionMaterial } from "@/lib/api";

export function RevisionStudio() {
  const [subject, setSubject] = useState("Chemistry");
  const [topic, setTopic] = useState("Chemical Reactions and Equations");
  const [revisionType, setRevisionType] = useState("quick_notes");
  const [loading, setLoading] = useState(false);
  const [revisionData, setRevisionData] = useState<any>({
    title: "Revision Guide: Chemical Reactions & Equations",
    summary: "Complete high-yield breakdown of balancing chemical equations, types of reactions (combination, decomposition, displacement, double displacement), and oxidation-reduction concepts.",
    key_formulas: [
      { name: "Balanced Mass Equation", formula: "Mass of Reactants = Mass of Products", description: "Law of Conservation of Mass" },
      { name: "Rusting of Iron Formula", formula: "4Fe + 3O2 + 2xH2O -> 2Fe2O3.xH2O", description: "Hydrated Ferric Oxide formation" }
    ],
    important_points: [
      "Always check physical states: (s), (l), (g), (aq).",
      "Exothermic reactions release heat (e.g. respiration), Endothermic reactions absorb heat (e.g. photosynthesis).",
      "Corrosion and Rancidity are oxidation reactions in daily life."
    ],
    cheat_sheet: {
      must_remember: ["Decomposition requires energy (Heat/Light/Electricity)", "Redox involves simultaneous loss and gain of electrons"],
      quick_tricks: ["OIL RIG: Oxidation Is Loss of e-, Reduction Is Gain of e-"]
    }
  });

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await generateRevisionMaterial({ subject, topic, revision_type: revisionType });
      setRevisionData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      
      {/* HEADER BAR */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-lg shadow-purple-200">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900">AI Revision Studio</h1>
            <p className="text-xs text-slate-500">Quick Notes, Mind Maps, Formula Sheets & Exam Countdown Plans</p>
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-2xl shadow-md transition-all flex items-center gap-1.5 shrink-0"
        >
          {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-amber-300" />}
          <span>Generate Revision Kit</span>
        </button>
      </div>

      {/* REVISION TYPE SELECTOR TABS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
        {[
          { type: "quick_notes", label: "Quick Notes", icon: FileText },
          { type: "mind_map", label: "Mind Map", icon: GitFork },
          { type: "formula_sheet", label: "Formulas", icon: Calculator },
          { type: "cheat_sheet", label: "Cheat Sheet", icon: Zap },
          { type: "one_day", label: "1-Day Plan", icon: Calendar },
          { type: "seven_day", label: "7-Day Plan", icon: Calendar }
        ].map((item) => (
          <button
            key={item.type}
            onClick={() => setRevisionType(item.type)}
            className={`p-3 rounded-2xl border text-xs font-bold transition-all flex flex-col items-center gap-1.5 ${
              revisionType === item.type
                ? "bg-purple-600 text-white border-purple-600 shadow-md"
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

      {/* REVISION DISPLAY CONTENT CARD */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900">{revisionData.title}</h2>
            <span className="text-xs text-purple-600 font-bold capitalize bg-purple-50 px-2 py-0.5 rounded-md mt-1 inline-block">
              Type: {revisionType.replace('_', ' ')}
            </span>
          </div>
          <button className="p-2 text-slate-400 hover:text-purple-600 border border-slate-200 rounded-xl">
            <Copy className="w-4 h-4" />
          </button>
        </div>

        {/* SUMMARY */}
        <div className="space-y-2">
          <h3 className="text-xs font-extrabold uppercase text-slate-400 tracking-wider">Executive Summary</h3>
          <p className="text-xs leading-relaxed text-slate-700 bg-slate-50 p-4 rounded-2xl border border-slate-100 font-medium">
            {revisionData.summary}
          </p>
        </div>

        {/* FORMULA & CHEAT SHEET CARDS */}
        {revisionData.key_formulas && revisionData.key_formulas.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-xs font-extrabold uppercase text-slate-400 tracking-wider">High-Yield Equations & Formulas</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {revisionData.key_formulas.map((item: any, idx: number) => (
                <div key={idx} className="p-4 rounded-2xl bg-purple-50/50 border border-purple-100 space-y-1">
                  <div className="text-xs font-extrabold text-purple-900">{item.name}</div>
                  <div className="text-xs font-black font-mono text-purple-700 bg-white p-2 rounded-xl border border-purple-200">{item.formula}</div>
                  <div className="text-[11px] text-slate-500">{item.description}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CHEAT SHEET TRICKS */}
        {revisionData.cheat_sheet && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-2">
            <h3 className="text-xs font-extrabold text-amber-900 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-600" />
              <span>Exam Memory Tricks & Pitfalls</span>
            </h3>
            <ul className="text-xs text-amber-900 space-y-1 pl-4 list-disc font-medium">
              {revisionData.cheat_sheet.quick_tricks?.map((trick: string, i: number) => (
                <li key={i}>{trick}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

    </div>
  );
}
