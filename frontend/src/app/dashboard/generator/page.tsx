"use client";

import { useState, useEffect } from "react";
import { Sparkles, Download, CheckCircle, RefreshCw, FileText, Edit3, Trash2, BookOpen, AlertCircle } from "lucide-react";
import { generateQuestionPaper, GeneratedPaperResponse, downloadPDF } from "@/lib/api";
import { useAppStore } from "@/store/useAppStore";

export default function GeneratorPage() {
  const { ocrDraftText, activePaper, setActivePaper, savePaper } = useAppStore();

  // Clean empty default values (No hardcoded auto-fill)
  const [title, setTitle] = useState("");
  const [className, setClassName] = useState("");
  const [subject, setSubject] = useState("");
  const [chapter, setChapter] = useState("");
  const [difficulty, setDifficulty] = useState("medium");
  const [totalMarks, setTotalMarks] = useState<string>("");
  const [timeMins, setTimeMins] = useState<string>("");
  const [numMcqs, setNumMcqs] = useState<string>("");
  const [numShort, setNumShort] = useState<string>("");
  const [numLong, setNumLong] = useState<string>("");
  const [numCase, setNumCase] = useState<string>("");
  const [customPrompt, setCustomPrompt] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paper, setPaper] = useState<GeneratedPaperResponse | null>(activePaper);
  const [editingQuestionId, setEditingQuestionId] = useState<number | null>(null);

  useEffect(() => {
    if (ocrDraftText) {
      setCustomPrompt(`Based on OCR scanned textbook extract:\n${ocrDraftText}`);
    }
  }, [ocrDraftText]);

  const handleGenerate = async () => {
    if (!title.trim() && !subject.trim() && !className.trim()) {
      setError("Please enter an Assessment Title, Grade/Class, and Subject.");
      return;
    }
    setError(null);
    setLoading(true);

    try {
      const parsedTotal = parseInt(totalMarks) || 40;
      const parsedTime = parseInt(timeMins) || 60;
      const parsedMcqs = parseInt(numMcqs) || 4;
      const parsedShort = parseInt(numShort) || 2;
      const parsedLong = parseInt(numLong) || 1;
      const parsedCase = parseInt(numCase) || 1;

      const res = await generateQuestionPaper({
        title: title.trim() || `${subject.trim() || "Subject"} Exam`,
        class_name: className.trim() || "Class 10",
        subject: subject.trim() || "General Science",
        chapter: chapter.trim() || "Comprehensive NCERT Syllabus",
        difficulty,
        total_marks: parsedTotal,
        time_allowed_mins: parsedTime,
        num_mcqs: parsedMcqs,
        num_short: parsedShort,
        num_long: parsedLong,
        num_case_studies: parsedCase,
        school_name: "DEVAGYA GLOBAL ACADEMY",
        custom_instructions: customPrompt
      });
      setPaper(res);
      setActivePaper(res);
      savePaper(res);
    } catch (err: any) {
      console.error("Generation error:", err);
      setError("Failed to generate AI paper. Please check backend connection.");
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

  // Class & Subject suggestion chips
  const classSuggestions = ["Class 1", "Class 5", "Class 8", "Class 9", "Class 10", "Class 11", "Class 12", "JEE / NEET"];
  const subjectSuggestions = ["Science", "Mathematics", "Physics", "Chemistry", "Biology", "English", "Computer Science", "History", "Geography", "Economics", "Accountancy"];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-indigo-600" />
            AI Question Paper Studio
          </h1>
          <p className="text-xs text-slate-500 font-semibold">Generate NCERT & CBSE Question Papers for ANY Class & ANY Subject using Groq AI</p>
        </div>

        {paper && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => downloadPDF(paper, false)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Question Paper PDF
            </button>
            <button
              onClick={() => downloadPDF(paper, true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              Answer Key PDF
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT FORM CONTROLS */}
        <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-slate-200 space-y-5 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Paper Parameters</h2>
            <button
              type="button"
              onClick={() => {
                setTitle("");
                setClassName("");
                setSubject("");
                setChapter("");
                setTotalMarks("");
                setTimeMins("");
                setNumMcqs("");
                setNumShort("");
                setNumLong("");
                setNumCase("");
                setCustomPrompt("");
                setError(null);
              }}
              className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800"
            >
              Clear All Fields
            </button>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-700 font-bold">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Assessment Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Unit Test - Term 1"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-semibold focus:outline-none focus:border-indigo-600"
            />
          </div>

          {/* GRADE / CLASS (FREE FORM INPUT + CHIPS) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Grade / Class (Enter Any Class) *</label>
            <input
              type="text"
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              placeholder="e.g. Class 10, Class 7, B.Tech, etc."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-semibold focus:outline-none focus:border-indigo-600 mb-2"
            />
            <div className="flex flex-wrap gap-1.5">
              {classSuggestions.map((cls) => (
                <button
                  key={cls}
                  type="button"
                  onClick={() => setClassName(cls)}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border transition-colors ${
                    className === cls ? "bg-indigo-600 text-white border-indigo-600" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {cls}
                </button>
              ))}
            </div>
          </div>

          {/* SUBJECT (FREE FORM INPUT + CHIPS) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Subject (Enter Any Subject) *</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Science, Physics, French, History, etc."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-semibold focus:outline-none focus:border-indigo-600 mb-2"
            />
            <div className="flex flex-wrap gap-1.5">
              {subjectSuggestions.slice(0, 6).map((sub) => (
                <button
                  key={sub}
                  type="button"
                  onClick={() => setSubject(sub)}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border transition-colors ${
                    subject === sub ? "bg-indigo-600 text-white border-indigo-600" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {sub}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">NCERT Chapter / Topic</label>
            <input
              type="text"
              value={chapter}
              onChange={(e) => setChapter(e.target.value)}
              placeholder="e.g. Chemical Reactions and Equations"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-semibold focus:outline-none focus:border-indigo-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Total Marks</label>
              <input
                type="number"
                value={totalMarks}
                onChange={(e) => setTotalMarks(e.target.value)}
                placeholder="40"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:border-indigo-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Time (Minutes)</label>
              <input
                type="number"
                value={timeMins}
                onChange={(e) => setTimeMins(e.target.value)}
                placeholder="90"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:border-indigo-600"
              />
            </div>
          </div>

          {/* QUESTION SPLIT */}
          <div className="space-y-3 pt-2 border-t border-slate-200">
            <label className="block text-xs font-bold text-indigo-700 uppercase">Question Breakdown</label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-slate-600 font-bold">MCQs (1m):</span>
                <input
                  type="number"
                  value={numMcqs}
                  onChange={(e) => setNumMcqs(e.target.value)}
                  placeholder="4"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-1.5 mt-1 text-slate-900 font-semibold focus:outline-none focus:border-indigo-600"
                />
              </div>
              <div>
                <span className="text-slate-600 font-bold">Short (3m):</span>
                <input
                  type="number"
                  value={numShort}
                  onChange={(e) => setNumShort(e.target.value)}
                  placeholder="2"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-1.5 mt-1 text-slate-900 font-semibold focus:outline-none focus:border-indigo-600"
                />
              </div>
              <div>
                <span className="text-slate-600 font-bold">Long (5m):</span>
                <input
                  type="number"
                  value={numLong}
                  onChange={(e) => setNumLong(e.target.value)}
                  placeholder="1"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-1.5 mt-1 text-slate-900 font-semibold focus:outline-none focus:border-indigo-600"
                />
              </div>
              <div>
                <span className="text-slate-600 font-bold">Case Study (4m):</span>
                <input
                  type="number"
                  value={numCase}
                  onChange={(e) => setNumCase(e.target.value)}
                  placeholder="1"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-1.5 mt-1 text-slate-900 font-semibold focus:outline-none focus:border-indigo-600"
                />
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
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none font-medium"
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin text-cyan-200" /> : <Sparkles className="w-4 h-4 text-cyan-200" />}
            {loading ? "Generating Groq AI Paper..." : "Generate AI Paper"}
          </button>
        </div>

        {/* RIGHT EDITOR & PREVIEW */}
        <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-slate-200 space-y-6 shadow-sm min-h-[500px]">
          
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

              {/* EDITABLE QUESTION CARDS */}
              <div className="space-y-4">
                {paper.questions.map((q) => (
                  <div key={q.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-indigo-700 uppercase">
                        Q{q.question_number} ({q.question_type.toUpperCase()} - {q.marks} Mark{q.marks > 1 ? 's' : ''})
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setEditingQuestionId(editingQuestionId === q.id ? null : q.id)}
                          className="p-1 hover:bg-slate-200 rounded text-slate-600"
                          title="Edit Question"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteQuestion(q.id)}
                          className="p-1 hover:bg-red-100 rounded text-red-600"
                          title="Delete Question"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {editingQuestionId === q.id ? (
                      <textarea
                        rows={2}
                        value={q.question_text}
                        onChange={(e) => handleUpdateQuestionText(q.id, e.target.value)}
                        className="w-full bg-white border border-indigo-300 rounded-xl p-2 text-xs font-medium text-slate-900 focus:outline-none"
                      />
                    ) : (
                      <p className="text-xs font-semibold text-slate-900 whitespace-pre-line">{q.question_text}</p>
                    )}

                    {q.options && q.options.length > 0 && (
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        {q.options.map((opt, oIdx) => (
                          <div key={oIdx} className="text-[11px] p-2 bg-white rounded-lg border border-slate-200 text-slate-700 font-medium">
                            {opt}
                          </div>
                        ))}
                      </div>
                    )}

                    {q.answer && (
                      <div className="pt-2 border-t border-slate-200 text-[11px] text-emerald-700 font-medium">
                        <span className="font-bold">Answer key:</span> {q.answer}
                      </div>
                    )}
                  </div>
                ))}
              </div>

            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full py-20 text-center space-y-4 text-slate-400">
              <div className="w-16 h-16 rounded-3xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                <BookOpen className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800">No Question Paper Generated Yet</h3>
                <p className="text-xs text-slate-500 max-w-sm mt-1">
                  Fill in your custom Assessment Title, Grade/Class, and Subject on the left, then click <strong>Generate AI Paper</strong>.
                </p>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
