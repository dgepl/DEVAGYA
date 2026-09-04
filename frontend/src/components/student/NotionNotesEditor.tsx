"use client";

import { useState, useEffect, useMemo } from "react";
import { 
  FileText, 
  Sparkles, 
  Plus, 
  Search, 
  RefreshCw, 
  Trash2, 
  X, 
  Copy, 
  Check,
  Eye,
  Edit3
} from "lucide-react";
import { handleNoteAIAction } from "@/lib/api";
import Markdown from "@/components/chat/Markdown";

interface SmartNote {
  id: string;
  title: string;
  subject: string;
  tags: string[];
  content: string;
  updated_at: string;
}

function cleanAiOutput(text: string): string {
  if (!text) return "";
  return text.trim();
}

const STORAGE_KEY = "devgya_smart_notes_v2";

export function NotionNotesEditor() {
  const [notes, setNotes] = useState<SmartNote[]>([]);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setNotes(parsed);
          if (parsed.length > 0) {
            setActiveNoteId(parsed[0].id);
          }
        }
      }
    } catch (e) {
      console.error("Failed to load notes from localStorage", e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
      } catch (e) {
        console.error("Failed to save notes to localStorage", e);
      }
    }
  }, [notes, isLoaded]);

  const activeNote = useMemo(() => {
    return notes.find(n => n.id === activeNoteId) || null;
  }, [notes, activeNoteId]);

  const filteredNotes = useMemo(() => {
    if (!searchQuery.trim()) return notes;
    const q = searchQuery.toLowerCase().trim();
    return notes.filter(n => 
      n.title.toLowerCase().includes(q) || 
      n.content.toLowerCase().includes(q) ||
      n.subject.toLowerCase().includes(q) ||
      n.tags.some(t => t.toLowerCase().includes(q))
    );
  }, [notes, searchQuery]);

  const handleNewNote = () => {
    const newId = `note-${Date.now()}`;
    const newNote: SmartNote = {
      id: newId,
      title: "Untitled Note",
      subject: "General",
      tags: [],
      content: "",
      updated_at: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })
    };
    setNotes(prev => [newNote, ...prev]);
    setActiveNoteId(newId);
    setAiResult(null);
  };

  const handleDeleteNote = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const remaining = notes.filter(n => n.id !== id);
    setNotes(remaining);
    if (activeNoteId === id) {
      setActiveNoteId(remaining.length > 0 ? remaining[0].id : null);
      setAiResult(null);
    }
  };

  const handleUpdateContent = (newContent: string) => {
    if (!activeNoteId) return;
    setNotes(prev => prev.map(n => n.id === activeNoteId ? { 
      ...n, 
      content: newContent,
      updated_at: "Just now"
    } : n));
  };

  const handleUpdateTitle = (newTitle: string) => {
    if (!activeNoteId) return;
    setNotes(prev => prev.map(n => n.id === activeNoteId ? { 
      ...n, 
      title: newTitle,
      updated_at: "Just now"
    } : n));
  };

  const handleRunAIAction = async (action: string) => {
    if (!activeNote || !activeNote.content.trim()) return;
    setAiLoading(true);
    setAiResult(null);
    try {
      const res = await handleNoteAIAction({
        note_id: activeNote.id,
        content: activeNote.content,
        action
      });
      const cleaned = cleanAiOutput(res.result);
      setAiResult(cleaned);
    } catch (e) {
      console.error("AI action failed", e);
    } finally {
      setAiLoading(false);
    }
  };

  const handleCopyAiResult = () => {
    if (!aiResult) return;
    navigator.clipboard.writeText(aiResult);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApplyToNote = () => {
    if (!aiResult || !activeNote) return;
    handleUpdateContent(aiResult);
    setAiResult(null);
  };

  const handleAppendToNote = () => {
    if (!aiResult || !activeNote) return;
    const separator = activeNote.content.trim() ? "\n\n---\n\n" : "";
    handleUpdateContent(activeNote.content + separator + aiResult);
    setAiResult(null);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      
      {/* HEADER BAR */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-200 shrink-0">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-extrabold text-slate-900">Notion-Style Smart Notes</h1>
            <p className="text-xs text-slate-500">Create class notes, summarize, and generate instant revision quizzes</p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleNewNote}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>New Note</span>
        </button>
      </div>

      {/* WORKSPACE GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* LEFT PANEL: NOTES LIST & SEARCH */}
        <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-sm space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search your notes..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-8 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {searchQuery && (
              <button 
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {filteredNotes.length === 0 ? (
              <div className="py-12 text-center space-y-2">
                <FileText className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-xs font-bold text-slate-600">No notes found</p>
                <button
                  type="button"
                  onClick={handleNewNote}
                  className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
                >
                  + Create your first note
                </button>
              </div>
            ) : (
              filteredNotes.map((note) => (
                <div
                  key={note.id}
                  onClick={() => {
                    setActiveNoteId(note.id);
                    setAiResult(null);
                  }}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer group flex items-start justify-between gap-2 ${
                    activeNoteId === note.id
                      ? "bg-blue-50/80 border-blue-300 shadow-xs"
                      : "bg-white border-slate-100 hover:bg-slate-50"
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <h3 className="text-xs font-extrabold text-slate-900 truncate">
                      {note.title || "Untitled Note"}
                    </h3>
                    <p className="text-[11px] text-slate-400 truncate mt-1">
                      {note.content || "Empty note..."}
                    </p>
                    <span className="text-[10px] text-slate-400 font-medium mt-1 block">
                      {note.updated_at}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => handleDeleteNote(note.id, e)}
                    className="p-1 text-slate-300 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shrink-0"
                    title="Delete Note"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* RIGHT 2-COLUMNS: NOTE EDITOR & AI ACTIONS */}
        <div className="md:col-span-2 space-y-4">
          {activeNote ? (
            <>
              {/* AI ACTION TRIGGER BAR */}
              <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white p-3.5 sm:p-4 rounded-3xl border border-blue-700/50 flex flex-wrap items-center justify-between gap-2.5">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                  <Sparkles className="w-4 h-4" />
                  <span>AI Smart Assist:</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleRunAIAction("summarize")}
                    disabled={aiLoading || !activeNote.content.trim()}
                    className="px-3 py-1.5 bg-white/10 hover:bg-white/20 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-colors border border-white/10 cursor-pointer"
                  >
                    Summarize Note
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRunAIAction("rewrite")}
                    disabled={aiLoading || !activeNote.content.trim()}
                    className="px-3 py-1.5 bg-white/10 hover:bg-white/20 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-colors border border-white/10 cursor-pointer"
                  >
                    Rewrite Cleanly
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRunAIAction("generate_quiz")}
                    disabled={aiLoading || !activeNote.content.trim()}
                    className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 rounded-xl text-xs font-black transition-colors cursor-pointer"
                  >
                    Create AI Quiz
                  </button>
                </div>
              </div>

              {/* AI OUTPUT BANNER */}
              {aiLoading && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl text-xs font-bold text-blue-700 flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>AI is processing your note...</span>
                </div>
              )}

              {aiResult && (
                <div className="p-4.5 bg-indigo-50/90 border border-indigo-200 rounded-3xl text-xs text-indigo-950 space-y-3 animate-in fade-in shadow-xs">
                  <div className="font-extrabold flex items-center justify-between text-indigo-800">
                    <span className="flex items-center gap-1.5 text-xs">
                      <Sparkles className="w-4 h-4 text-amber-500 fill-amber-400" />
                      AI Generated Result:
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleCopyAiResult}
                        className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer text-[11px]"
                      >
                        {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        <span>{copied ? "Copied!" : "Copy"}</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleApplyToNote}
                        className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors cursor-pointer text-[11px]"
                        title="Replace current note content with AI result"
                      >
                        Replace Note
                      </button>
                      <button
                        type="button"
                        onClick={handleAppendToNote}
                        className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-colors cursor-pointer text-[11px]"
                        title="Add this AI result to the bottom of the current note"
                      >
                        Append
                      </button>
                      <button
                        type="button"
                        onClick={() => setAiResult(null)}
                        className="p-1 text-slate-400 hover:text-slate-700 transition-colors"
                        title="Dismiss"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="bg-white/80 p-4 rounded-2xl border border-indigo-100/80 text-slate-800 text-xs shadow-xs">
                    <Markdown content={aiResult} />
                  </div>
                </div>
              )}

              {/* MAIN NOTE CONTENT WORKSPACE WITH EDIT / PREVIEW TOGGLE */}
              <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <input 
                    type="text"
                    value={activeNote.title}
                    onChange={(e) => handleUpdateTitle(e.target.value)}
                    placeholder="Note Title..."
                    className="text-lg font-black text-slate-900 w-full focus:outline-none placeholder:text-slate-300"
                  />

                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl shrink-0 border border-slate-200">
                    <button
                      type="button"
                      onClick={() => setPreviewMode(false)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                        !previewMode 
                          ? "bg-white text-blue-700 shadow-xs" 
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewMode(true)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                        previewMode 
                          ? "bg-white text-blue-700 shadow-xs" 
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Preview</span>
                    </button>
                  </div>
                </div>

                {!previewMode ? (
                  <textarea 
                    rows={14}
                    value={activeNote.content}
                    onChange={(e) => handleUpdateContent(e.target.value)}
                    className="w-full text-xs font-mono text-slate-800 leading-relaxed border-0 focus:outline-none resize-none placeholder:text-slate-300"
                    placeholder="Start typing your study notes, formulas (e.g. $E = mc^2$), or Hindi notes here..."
                  />
                ) : (
                  <div className="min-h-[320px] p-4 bg-slate-50/70 rounded-2xl border border-slate-200/80 text-xs overflow-y-auto">
                    {activeNote.content.trim() ? (
                      <Markdown content={activeNote.content} />
                    ) : (
                      <p className="text-slate-400 italic">No content written yet. Switch to Edit mode to write notes.</p>
                    )}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="bg-white rounded-3xl p-12 border border-slate-200 shadow-sm text-center space-y-3">
              <FileText className="w-12 h-12 text-slate-300 mx-auto" />
              <h2 className="text-base font-bold text-slate-800">No Note Selected</h2>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Select an existing note from the list on the left or create a new note to start writing.
              </p>
              <button
                type="button"
                onClick={handleNewNote}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Create New Note</span>
              </button>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
