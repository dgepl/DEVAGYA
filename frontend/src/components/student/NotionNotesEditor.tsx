"use client";

import { useState } from "react";
import { 
  FileText, 
  Sparkles, 
  Plus, 
  Bookmark, 
  Tag, 
  Search, 
  HelpCircle, 
  RefreshCw,
  CheckCircle2
} from "lucide-react";
import { handleNoteAIAction } from "@/lib/api";

export function NotionNotesEditor() {
  const [notes, setNotes] = useState([
    {
      id: "n1",
      title: "Light Reflection & Ray Diagram Formulae",
      subject: "Science",
      tags: ["Physics", "NCERT"],
      content: "1. Mirror Formula: 1/f = 1/v + 1/u\n2. Magnification m = -v/u = h'/h\n3. Focal length f = R/2\n4. Real images are inverted and formed in front of concave mirrors.",
      updated_at: "Today"
    },
    {
      id: "n2",
      title: "Quadratic Formula & Discriminant Derivation",
      subject: "Mathematics",
      tags: ["Math", "Algebra"],
      content: "General Quadratic Equation: ax^2 + bx + c = 0\nQuadratic Formula: x = (-b ± √(b^2 - 4ac)) / (2a)\nDiscriminant D = b^2 - 4ac determines root nature:\n- D > 0: Two distinct real roots\n- D = 0: Two equal real roots\n- D < 0: No real roots (Imaginary)",
      updated_at: "Yesterday"
    }
  ]);

  const [activeNoteId, setActiveNoteId] = useState("n1");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<string | null>(null);

  const activeNote = notes.find(n => n.id === activeNoteId) || notes[0];

  const handleUpdateContent = (newContent: string) => {
    setNotes(notes.map(n => n.id === activeNoteId ? { ...n, content: newContent } : n));
  };

  const handleRunAIAction = async (action: string) => {
    setAiLoading(true);
    setAiResult(null);
    try {
      const res = await handleNoteAIAction({
        note_id: activeNote.id,
        content: activeNote.content,
        action
      });
      setAiResult(res.result);
    } catch (e) {
      console.error(e);
    } finally {
      setAiLoading(false);
    }
  };

  const handleNewNote = () => {
    const newId = `n${notes.length + 1}`;
    const newNote = {
      id: newId,
      title: `Untitled Note ${notes.length + 1}`,
      subject: "General",
      tags: ["Draft"],
      content: "Start typing your smart study note here...",
      updated_at: "Just now"
    };
    setNotes([newNote, ...notes]);
    setActiveNoteId(newId);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      
      {/* HEADER BAR */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-200">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900">Notion-Style AI Smart Notes</h1>
            <p className="text-xs text-slate-500">Organize, summarize, rewrite, and generate quizzes directly from your notes</p>
          </div>
        </div>

        <button
          onClick={handleNewNote}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-2xl shadow-md transition-all flex items-center gap-1.5 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Smart Note</span>
        </button>
      </div>

      {/* TWO COLUMN WORKSPACE GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* LEFT PANEL: NOTES LIST & SEARCH */}
        <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-sm space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input 
              type="text" 
              placeholder="Search notes or tags..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs font-bold text-slate-800"
            />
          </div>

          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {notes.map((note) => (
              <div
                key={note.id}
                onClick={() => {
                  setActiveNoteId(note.id);
                  setAiResult(null);
                }}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                  activeNoteId === note.id
                    ? "bg-blue-50 border-blue-300 shadow-sm"
                    : "bg-white border-slate-100 hover:bg-slate-50"
                }`}
              >
                <h3 className="text-xs font-extrabold text-slate-900 truncate">{note.title}</h3>
                <span className="text-[10px] text-blue-600 font-bold bg-blue-100/60 px-2 py-0.5 rounded-md mt-1 inline-block">
                  {note.subject}
                </span>
                <p className="text-[11px] text-slate-400 truncate mt-1">{note.content}</p>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT 2-COLUMNS: NOTE EDITOR & AI ACTIONS */}
        <div className="md:col-span-2 space-y-4">
          
          {/* AI ACTION TRIGGER BAR */}
          <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white p-4 rounded-3xl border border-blue-700/50 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
              <Sparkles className="w-4 h-4" />
              <span>AI Smart Assist:</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleRunAIAction("summarize")}
                disabled={aiLoading}
                className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-colors border border-white/10"
              >
                Summarize Note
              </button>
              <button
                onClick={() => handleRunAIAction("rewrite")}
                disabled={aiLoading}
                className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-colors border border-white/10"
              >
                Rewrite Cleanly
              </button>
              <button
                onClick={() => handleRunAIAction("generate_quiz")}
                disabled={aiLoading}
                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-black transition-colors"
              >
                Create AI Quiz
              </button>
            </div>
          </div>

          {/* AI OUTPUT BANNER IF RUN */}
          {aiLoading && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl text-xs font-bold text-blue-700 flex items-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>AI is processing note content...</span>
            </div>
          )}

          {aiResult && (
            <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-2xl text-xs text-indigo-950 space-y-2 animate-in fade-in">
              <div className="font-extrabold flex items-center gap-1.5 text-indigo-700">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>AI Result:</span>
              </div>
              <div className="whitespace-pre-line leading-relaxed">{aiResult}</div>
            </div>
          )}

          {/* MAIN NOTE CONTENT TEXTAREA */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <input 
              type="text"
              value={activeNote.title}
              onChange={(e) => {
                const title = e.target.value;
                setNotes(notes.map(n => n.id === activeNoteId ? { ...n, title } : n));
              }}
              className="text-lg font-black text-slate-900 border-b border-slate-100 pb-2 w-full focus:outline-none"
            />

            <textarea 
              rows={12}
              value={activeNote.content}
              onChange={(e) => handleUpdateContent(e.target.value)}
              className="w-full text-xs font-mono text-slate-800 leading-relaxed border-0 focus:outline-none resize-none"
              placeholder="Write markdown study notes..."
            />
          </div>

        </div>

      </div>

    </div>
  );
}
