"use client";

import { useState } from "react";
import { 
  Layers, 
  Sparkles, 
  Upload, 
  Search, 
  FileText, 
  BookOpen, 
  CheckCircle2, 
  RefreshCw, 
  GitFork, 
  HelpCircle,
  Zap,
  Bookmark
} from "lucide-react";
import { getKnowledgeDocuments, searchKnowledgeRAG, runDocumentAI } from "@/lib/api";

export function KnowledgeBaseStudio() {
  const [documents] = useState([
    { id: "doc-1", title: "NCERT Class 10 Science - Chapter 10 Light", doc_type: "ncert", file_size: "4.2 MB", page_count: 28, chunk_count: 56 },
    { id: "doc-2", title: "Mathematics Board Question Bank 2025-2026", doc_type: "pdf", file_size: "8.5 MB", page_count: 42, chunk_count: 84 },
    { id: "doc-3", title: "CBSE English Grammar & Writing Skills Guide", doc_type: "notes", file_size: "1.8 MB", page_count: 15, chunk_count: 30 }
  ]);

  const [ragQuery, setRagQuery] = useState("");
  const [ragLoading, setRagLoading] = useState(false);
  const [ragResult, setRagResult] = useState<any>(null);

  const [selectedDocId, setSelectedDocId] = useState("doc-1");
  const [docAiLoading, setDocAiLoading] = useState(false);
  const [docAiResult, setDocAiResult] = useState<string | null>(null);

  const handleRAGSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ragQuery.trim() || ragLoading) return;
    setRagLoading(true);
    try {
      const res = await searchKnowledgeRAG(ragQuery);
      setRagResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setRagLoading(false);
    }
  };

  const handleDocAIAction = async (action: string) => {
    setDocAiLoading(true);
    setDocAiResult(null);
    try {
      const selectedDoc = documents.find(d => d.id === selectedDocId) || documents[0];
      const res = await runDocumentAI({
        doc_id: selectedDoc.id,
        text_content: selectedDoc.title,
        action
      });
      setDocAiResult(res.result);
    } catch (e) {
      console.error(e);
    } finally {
      setDocAiLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      
      {/* HEADER BAR */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-200">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900">RAG Knowledge Base & Document AI</h1>
            <p className="text-xs text-slate-500">Indexed NCERT books, PDFs, worksheets & research papers with citation RAG</p>
          </div>
        </div>

        <button className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-2xl shadow-md transition-all flex items-center gap-1.5 shrink-0">
          <Upload className="w-4 h-4" />
          <span>Upload New Book / PDF</span>
        </button>
      </div>

      {/* RAG SEARCH BAR */}
      <form onSubmit={handleRAGSearch} className="bg-gradient-to-r from-indigo-900 to-slate-900 text-white p-6 rounded-3xl border border-indigo-700/50 shadow-xl space-y-3">
        <label className="text-xs font-bold text-amber-300 flex items-center gap-1.5 uppercase tracking-wider">
          <Sparkles className="w-4 h-4" />
          <span>Semantic RAG Search across Indexed Knowledge Base</span>
        </label>
        <div className="flex items-center gap-3 bg-white p-2 rounded-2xl shadow-inner">
          <Search className="w-5 h-5 text-slate-400 ml-2" />
          <input 
            type="text"
            value={ragQuery}
            onChange={(e) => setRagQuery(e.target.value)}
            placeholder="Ask anything from uploaded books (e.g. What are the laws of reflection in Chapter 10?)"
            className="flex-1 text-xs font-bold text-slate-900 focus:outline-none px-2"
          />
          <button
            type="submit"
            disabled={ragLoading || !ragQuery.trim()}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition-all shadow-md flex items-center gap-1.5 shrink-0"
          >
            {ragLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            <span>Search Knowledge</span>
          </button>
        </div>
      </form>

      {/* RAG SEARCH RESULTS WITH CITATIONS */}
      {ragResult && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4 animate-in fade-in">
          <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>AI Answer with Document Citations:</span>
          </h2>
          <div className="text-xs text-slate-800 leading-relaxed font-medium bg-slate-50 p-4 rounded-2xl border border-slate-100 whitespace-pre-line">
            {ragResult.answer}
          </div>

          <div className="space-y-2">
            <h3 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Citations & Source Chunks:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {ragResult.citations?.map((c: any, idx: number) => (
                <div key={idx} className="p-3.5 rounded-2xl border border-indigo-100 bg-indigo-50/40 text-xs space-y-1">
                  <span className="font-bold text-indigo-900">{c.doc_title} (Page {c.page})</span>
                  <p className="text-slate-600 font-medium italic">&quot;{c.snippet}&quot;</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* INDEXED DOCUMENTS & DOCUMENT AI TOOLKIT */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* DOCUMENT LIST */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-sm font-extrabold text-slate-900">Indexed Knowledge Documents</h2>
          <div className="space-y-3">
            {documents.map((doc) => (
              <div 
                key={doc.id}
                onClick={() => setSelectedDocId(doc.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  selectedDocId === doc.id
                    ? "bg-indigo-50 border-indigo-300 shadow-xs"
                    : "bg-slate-50 border-slate-100 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-600 shrink-0" />
                  <h3 className="text-xs font-bold text-slate-900 truncate">{doc.title}</h3>
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium mt-2">
                  <span>{doc.file_size} • {doc.page_count} Pages</span>
                  <span className="font-bold text-indigo-600">{doc.chunk_count} Chunks</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* DOCUMENT AI TOOLKIT & OUTPUT */}
        <div className="md:col-span-2 space-y-4">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              <span>Document AI Transformation Toolkit</span>
            </h2>

            <div className="flex flex-wrap gap-2">
              {[
                { action: "summarize", label: "Summarize" },
                { action: "generate_quiz", label: "Generate Quiz" },
                { action: "generate_flashcards", label: "Flashcards" },
                { action: "generate_mindmap", label: "Mind Map" },
                { action: "extract_formulas", label: "Extract Formulas" }
              ].map((act) => (
                <button
                  key={act.action}
                  onClick={() => handleDocAIAction(act.action)}
                  disabled={docAiLoading}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 transition-colors"
                >
                  {act.label}
                </button>
              ))}
            </div>

            {docAiLoading && (
              <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-2xl text-xs font-bold text-indigo-700 flex items-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Document AI is parsing and indexing content...</span>
              </div>
            )}

            {docAiResult && (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900 whitespace-pre-line leading-relaxed font-medium">
                {docAiResult}
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
