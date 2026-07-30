"use client";

import { useState, useEffect } from "react";
import { BookOpen, Search, Star, Copy, Check, Sparkles } from "lucide-react";
import { getPromptLibrary } from "@/lib/api_phase2";
import { useRouter } from "next/navigation";

export default function PromptLibraryPage() {
  const [prompts, setPrompts] = useState<any[]>([]);
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const router = useRouter();

  useEffect(() => {
    getPromptLibrary(category).then(setPrompts).catch(console.error);
  }, [category]);

  const filtered = prompts.filter(p => p.title.toLowerCase().includes(search.toLowerCase()) || p.description.toLowerCase().includes(search.toLowerCase()));

  const handleCopy = (id: string, template: string) => {
    navigator.clipboard.writeText(template);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-8">
      
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-indigo-600" />
          AI Prompt Library
        </h1>
        <p className="text-xs text-slate-500 font-semibold">Curated pedagogical prompt templates for teaching, lesson planning, and assessment</p>
      </div>

      {/* Filter Bar */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
        
        <div className="flex flex-wrap items-center gap-2">
          {["all", "teaching", "assessment", "lesson_planning", "homework", "english", "productivity"].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl border capitalize transition-all ${
                category === cat ? "bg-indigo-600 border-indigo-600 text-white shadow-sm" : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100"
              }`}
            >
              {cat.replace("_", " ")}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search prompt library..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:border-indigo-500"
          />
        </div>

      </div>

      {/* Prompts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((p) => (
          <div key={p.id} className="glass-panel p-6 rounded-3xl border border-slate-200 flex flex-col justify-between space-y-4 shadow-sm">
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200 px-2.5 py-0.5 rounded-full">
                  {p.category.replace("_", " ")}
                </span>
                <Star className="w-4 h-4 text-amber-500 cursor-pointer" />
              </div>

              <h3 className="text-base font-bold text-slate-900">{p.title}</h3>
              <p className="text-xs text-slate-600 font-medium">{p.description}</p>
              
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs font-mono text-slate-800 font-semibold">
                {p.prompt_template}
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => handleCopy(p.id, p.prompt_template)}
                className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5"
              >
                {copiedId === p.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedId === p.id ? "Copied" : "Copy Template"}
              </button>

              <button
                onClick={() => router.push("/dashboard/chat")}
                className="py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-glow transition-all flex items-center gap-1"
              >
                <Sparkles className="w-3.5 h-3.5 text-cyan-200" />
                Run in AI Studio
              </button>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}
