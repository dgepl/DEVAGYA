"use client";

import { useState } from "react";
import { 
  Brain, 
  Plus, 
  Search, 
  Trash2, 
  CheckCircle2, 
  Star, 
  Tag, 
  Sparkles 
} from "lucide-react";
import { getUserMemories, addUserMemory } from "@/lib/api";

export function MemoryStudio() {
  const [memories, setMemories] = useState([
    {
      id: "mem-1",
      memory_type: "learning_style",
      memory_key: "preferred_explanation_style",
      memory_value: "Prefers step-by-step visual analogies and real-world physics examples before numerical derivations.",
      importance_score: 5,
      is_active: true,
      tags: ["visual", "physics"]
    },
    {
      id: "mem-2",
      memory_type: "weakness",
      memory_key: "weak_topics_math",
      memory_value: "Struggles with Quadratic Equations word problems involving speed/distance and pipe filling.",
      importance_score: 4,
      is_active: true,
      tags: ["math", "quadratic"]
    },
    {
      id: "mem-3",
      memory_type: "goal",
      memory_key: "target_board_score",
      memory_value: "Aiming for 95%+ distinction in CBSE Class 10 Science & Mathematics Board Exams.",
      importance_score: 5,
      is_active: true,
      tags: ["exam", "cbse"]
    }
  ]);

  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");
  const [newType, setNewType] = useState("preference");

  const handleAddMemory = () => {
    if (!newKey.trim() || !newValue.trim()) return;
    const item = {
      id: `mem-${memories.length + 1}`,
      memory_type: newType,
      memory_key: newKey,
      memory_value: newValue,
      importance_score: 4,
      is_active: true,
      tags: ["user_added"]
    };
    setMemories([item, ...memories]);
    setNewKey("");
    setNewValue("");
  };

  const toggleActive = (id: string) => {
    setMemories(memories.map(m => m.id === id ? { ...m, is_active: !m.is_active } : m));
  };

  const deleteMem = (id: string) => {
    setMemories(memories.filter(m => m.id !== id));
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* HEADER BAR */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-200">
            <Brain className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900">Memory 2.0 Management Studio</h1>
            <p className="text-xs text-slate-500">Persistent AI Memory: Preferences, learning style, weak topics & goals</p>
          </div>
        </div>
      </div>

      {/* ADD NEW MEMORY CARD */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
          <Plus className="w-4 h-4 text-indigo-600" />
          <span>Add Custom AI Memory Item</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <select
            value={newType}
            onChange={(e) => setNewType(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
          >
            <option value="preference">Preference</option>
            <option value="learning_style">Learning Style</option>
            <option value="weakness">Weakness</option>
            <option value="goal">Goal</option>
            <option value="pinned_fact">Pinned Fact</option>
          </select>

          <input 
            type="text"
            value={newKey}
            onChange={(e) => setNewKey(e.target.value)}
            placeholder="Memory Key (e.g. favorite_subject)"
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
          />

          <button
            onClick={handleAddMemory}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all"
          >
            Save to AI Memory
          </button>
        </div>

        <textarea 
          rows={2}
          value={newValue}
          onChange={(e) => setNewValue(e.target.value)}
          placeholder="Memory Value Description (e.g. Aarav learns best through Socratic physics hints)..."
          className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs font-medium text-slate-900 focus:outline-none"
        />
      </div>

      {/* MEMORY ITEMS LIST */}
      <div className="space-y-3">
        <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Stored AI Memories ({memories.length})</h2>
        <div className="space-y-3">
          {memories.map((mem) => (
            <div 
              key={mem.id} 
              className={`p-5 rounded-3xl border transition-all flex items-start justify-between gap-4 ${
                mem.is_active
                  ? "bg-white border-slate-200 shadow-sm"
                  : "bg-slate-50 border-slate-200 opacity-50"
              }`}
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold uppercase text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                    {mem.memory_type.replace('_', ' ')}
                  </span>
                  <h3 className="text-xs font-black text-slate-900">{mem.memory_key}</h3>
                  <div className="flex items-center text-amber-500 text-xs">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span className="font-bold text-[10px] ml-0.5">{mem.importance_score}/5</span>
                  </div>
                </div>
                <p className="text-xs text-slate-700 font-medium leading-relaxed">{mem.memory_value}</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleActive(mem.id)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold border ${
                    mem.is_active ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-200 text-slate-600"
                  }`}
                >
                  {mem.is_active ? "Active" : "Disabled"}
                </button>
                <button
                  onClick={() => deleteMem(mem.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
