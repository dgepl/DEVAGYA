"use client";

import { useState, useEffect } from "react";
import { Sparkles, Download, CheckCircle, RefreshCw, FileText, Edit3, Trash2 } from "lucide-react";
import { generateQuestionPaper, GeneratedPaperResponse, downloadPDF } from "@/lib/api";
import { useAppStore } from "@/store/useAppStore";

export default function GeneratorPage() {
  const { ocrDraftText, activePaper, setActivePaper, savePaper } = useAppStore();

  const [title, setTitle] = useState("Periodic Assessment - 2025");
  const [className, setClassName] = useState("Class 10");
  const [subject, setSubject] = useState("Science");
  const [chapter, setChapter] = useState("Chemical Reactions and Equations");
  const [difficulty, setDifficulty] = useState("medium");
  const [totalMarks, setTotalMarks] = useState(40);
  const [timeMins, setTimeMins] = useState(90);
  const [numMcqs, setNumMcqs] = useState(4);
  const [numShort, setNumShort] = useState(2);
  const [numLong, setNumLong] = useState(1);
  const [numCase, setNumCase] = useState(1);
  const [customPrompt, setCustomPrompt] = useState("");

  const [loading, setLoading] = useState(false);
  const [paper, setPaper] = useState<GeneratedPaperResponse | null>(activePaper);
  const [editingQuestionId, setEditingQuestionId] = useState<number | null>(null);

  useEffect(() => {
    if (ocrDraftText) {
      setCustomPrompt(`Based on OCR scanned textbook extract:\n${ocrDraftText}`);
    }
  }, [ocrDraftText]);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await generateQuestionPaper({
        title,
        class_name: className,
        subject,
        chapter,
        difficulty,
        total_marks: totalMarks,
        time_allowed_mins: timeMins,
        num_mcqs: numMcqs,
        num_short: numShort,
        num_long: numLong,
        num_case_studies: numCase,
        school_name: "Apex International Academy",
        custom_instructions: customPrompt
      });
      setPaper(res);
      setActivePaper(res);
      savePaper(res);
    } catch (err) {
      console.error("Generation error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuestionText = (id: number, text: string) => {
    if (!paper) return;
    const updated = {
      ...paper,
      questions: paper.questions.map(q => q.id === id ? { ...q, question_text: text } : q)
    };
    setPaper(updated);
  };

  const handleDeleteQuestion = (id: number) => {
    if (!paper) return;
    const updated = {
      ...paper,
      questions: paper.questions.filter(q => q.id !== id)
    };
    setPaper(updated);
  };

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-indigo-600" />
            AI Question Paper Studio
          </h1>
          <p className="text-xs text-slate-500 font-semibold">Synthesize NCERT-aligned exam papers with OpenAI-compatible AI</p>
        </div>

        {paper && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => downloadPDF(paper, false)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-glow transition-all flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Question Paper PDF
            </button>
            <button
              onClick={() => downloadPDF(paper, true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-glow transition-all flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              Answer Key PDF
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Form Controls */}
        <div className="lg:col-span-4 glass-panel p-6 rounded-3xl border border-slate-200 space-y-5 shadow-sm">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-3">Paper Parameters</h2>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Assessment Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-semibold"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Grade / Class</label>
              <select
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-semibold"
              >
                <option value="Class 9">Class 9</option>
                <option value="Class 10">Class 10</option>
                <option value="Class 12">Class 12</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Subject</label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-semibold"
              >
                <option value="Science">Science</option>
                <option value="Mathematics">Mathematics</option>
                <option value="Physics">Physics</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">NCERT Chapter</label>
            <input
              type="text"
              value={chapter}
              onChange={(e) => setChapter(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-semibold"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Total Marks</label>
              <input
                type="number"
                value={totalMarks}
                onChange={(e) => setTotalMarks(Number(e.target.value))}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Time (Minutes)</label>
              <input
                type="number"
                value={timeMins}
                onChange={(e) => setTimeMins(Number(e.target.value))}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-semibold"
              />
            </div>
          </div>

          {/* Question Split */}
          <div className="space-y-3 pt-2 border-t border-slate-200">
            <label className="block text-xs font-bold text-indigo-700 uppercase">Question Breakdown</label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-slate-600 font-bold">MCQs (1m):</span>
                <input type="number" value={numMcqs} onChange={(e) => setNumMcqs(Number(e.target.value))} className="w-full bg-white border border-slate-200 rounded-lg p-1.5 mt-1 text-slate-900 font-semibold" />
              </div>
              <div>
                <span className="text-slate-600 font-bold">Short (3m):</span>
                <input type="number" value={numShort} onChange={(e) => setNumShort(Number(e.target.value))} className="w-full bg-white border border-slate-200 rounded-lg p-1.5 mt-1 text-slate-900 font-semibold" />
              </div>
              <div>
                <span className="text-slate-600 font-bold">Long (5m):</span>
                <input type="number" value={numLong} onChange={(e) => setNumLong(Number(e.target.value))} className="w-full bg-white border border-slate-200 rounded-lg p-1.5 mt-1 text-slate-900 font-semibold" />
              </div>
              <div>
                <span className="text-slate-600 font-bold">Case Study (4m):</span>
                <input type="number" value={numCase} onChange={(e) => setNumCase(Number(e.target.value))} className="w-full bg-white border border-slate-200 rounded-lg p-1.5 mt-1 text-slate-900 font-semibold" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Custom Instructions / OCR Context</label>
            <textarea
              rows={3}
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="e.g. Focus heavily on NCERT numerical problems and HOTS..."
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none font-medium"
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-glow transition-all flex items-center justify-center gap-2"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin text-cyan-200" /> : <Sparkles className="w-4 h-4 text-cyan-200" />}
            {loading ? "Generating NCERT Paper..." : "Generate AI Paper"}
          </button>
        </div>

        {/* Right Editor & Preview */}
        <div className="lg:col-span-8 glass-panel p-6 rounded-3xl border border-slate-200 space-y-6 shadow-sm">
          
          {paper ? (
            <div className="space-y-6">
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-200 pb-4 gap-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{paper.title}</h3>
                  <p className="text-xs text-slate-600">{paper.school_name} • {paper.class_name} ({paper.subject}) • {paper.chapter}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-indigo-600 block">{paper.questions.length} Questions</span>
                  <span className="text-[10px] text-slate-500 font-semibold">Total {paper.total_marks} Marks</span>
                </div>
              </div>

              {/* Editable Question Cards */}
              <div className="space-y-4">
                {paper.questions.map((q) => (
                  <div key={q.id} className="p-4 bg-white rounded-2xl border border-slate-200 space-y-3 shadow-sm">
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-indigo-600 uppercase">
                        Q{q.question_number} • <span className="text-slate-700">{q.question_type}</span>
                      </span>
                      
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          {q.marks} Mark{q.marks > 1 ? 's' : ''}
                        </span>
                        <button
                          onClick={() => setEditingQuestionId(editingQuestionId === q.id ? null : q.id)}
                          className="p-1 text-slate-500 hover:text-slate-900"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteQuestion(q.id)}
                          className="p-1 text-slate-500 hover:text-red-600"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {editingQuestionId === q.id ? (
                      <textarea
                        value={q.question_text}
                        onChange={(e) => handleUpdateQuestionText(q.id, e.target.value)}
                        className="w-full bg-slate-50 border border-indigo-500 rounded-xl p-3 text-xs text-slate-900 font-semibold"
                        rows={3}
                      />
                    ) : (
                      <p className="text-xs font-bold text-slate-800 leading-relaxed">{q.question_text}</p>
                    )}

                    {q.options && (
                      <div className="grid grid-cols-2 gap-2 text-xs text-slate-700 pt-1">
                        {q.options.map((opt, i) => (
                          <div key={i} className="bg-slate-50 p-2 rounded-lg border border-slate-200 font-medium">{opt}</div>
                        ))}
                      </div>
                    )}

                    {q.answer && (
                      <div className="text-[11px] text-emerald-800 bg-emerald-50 p-2.5 rounded-lg border border-emerald-200 font-medium">
                        <strong>Answer:</strong> {q.answer}
                      </div>
                    )}

                  </div>
                ))}
              </div>

            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
              <FileText className="w-12 h-12 text-slate-400 animate-pulse" />
              <h3 className="text-base font-bold text-slate-900">No Question Paper Generated Yet</h3>
              <p className="text-xs text-slate-500 font-medium max-w-sm">
                Configure your grade, subject, and chapter constraints on the left and click &quot;Generate AI Paper&quot;.
              </p>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
