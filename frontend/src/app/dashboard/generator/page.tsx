"use client";

import { useState, useEffect } from "react";
import { 
  Sparkles, 
  Download, 
  CheckCircle, 
  RefreshCw, 
  FileText, 
  Edit3, 
  Trash2, 
  BookOpen, 
  AlertCircle,
  Calculator,
  Check,
  Eye,
  Sliders,
  Layers
} from "lucide-react";
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
  const [showAnswerKey, setShowAnswerKey] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paper, setPaper] = useState<GeneratedPaperResponse | null>(activePaper);
  const [editingQuestionId, setEditingQuestionId] = useState<number | null>(null);

  // Real-time Mark Breakdown Tally Calculator
  const parsedMcqs = parseInt(numMcqs) || 0;
  const parsedShort = parseInt(numShort) || 0;
  const parsedLong = parseInt(numLong) || 0;
  const parsedCase = parseInt(numCase) || 0;
  const calculatedTotal = (parsedMcqs * 1) + (parsedShort * 3) + (parsedLong * 5) + (parsedCase * 4);
  const requestedTotal = parseInt(totalMarks) || 0;

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
      const res = await generateQuestionPaper({
        title: title.trim() || `${subject.trim() || "Subject"} Exam`,
        class_name: className.trim() || "Class 10",
        subject: subject.trim() || "General Science",
        chapter: chapter.trim() || "NCERT Comprehensive Syllabus",
        difficulty,
        total_marks: requestedTotal || calculatedTotal || 40,
        time_allowed_mins: parseInt(timeMins) || 90,
        num_mcqs: parsedMcqs || 4,
        num_short: parsedShort || 2,
        num_long: parsedLong || 1,
        num_case_studies: parsedCase || 1,
        school_name: "DEVGYA GLOBAL ACADEMY",
        custom_instructions: customPrompt
      });
      setPaper(res);
      setActivePaper(res);
      savePaper(res);
    } catch (err: any) {
      console.error("Generation error:", err);
      setError("Failed to generate AI paper. Please verify connection.");
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
  const subjectSuggestions = ["Science", "Mathematics", "Physics", "Chemistry", "Biology", "English", "Computer Science", "History", "Economics", "French"];

  // Group questions into Section A, B, C, D
  const sectionA = paper?.questions.filter(q => q.question_type === "mcq") || [];
  const sectionB = paper?.questions.filter(q => q.question_type === "short") || [];
  const sectionC = paper?.questions.filter(q => q.question_type === "long") || [];
  const sectionD = paper?.questions.filter(q => q.question_type === "case_study") || [];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto">
      
      {/* HEADER */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Enterprise AI Question Paper Studio</h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-indigo-50 text-indigo-700 border border-indigo-200">
              Groq AI Powered
            </span>
          </div>
          <p className="text-xs text-slate-500 font-semibold">Generate NCERT & CBSE Exam Papers for Any Class & Subject with Real-time Mark Validation</p>
        </div>

        {paper && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAnswerKey(!showAnswerKey)}
              className={`px-3.5 py-2 rounded-xl font-bold text-xs border transition-all flex items-center gap-1.5 ${
                showAnswerKey ? "bg-indigo-50 border-indigo-200 text-indigo-700" : "bg-slate-50 border-slate-200 text-slate-600"
              }`}
            >
              <Eye className="w-4 h-4" />
              {showAnswerKey ? "Hide Answer Key" : "Show Answer Key"}
            </button>

            <button
              onClick={() => downloadPDF(paper, false)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Paper PDF
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
              Clear All
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
              placeholder="e.g. Periodic Assessment 1 - 2026"
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
              placeholder="e.g. Class 10, Class 12, B.Tech, etc."
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
              placeholder="e.g. Light Reflection and Refraction"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-semibold focus:outline-none focus:border-indigo-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Total Marks Target</label>
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

          {/* QUESTION BREAKDOWN & REAL-TIME MARK CALCULATOR */}
          <div className="space-y-3 pt-3 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-indigo-700 uppercase tracking-wider flex items-center gap-1">
                <Calculator className="w-3.5 h-3.5" />
                Question Breakdown
              </label>

              {/* TALLY BADGE */}
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
                requestedTotal > 0 && calculatedTotal === requestedTotal
                  ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                  : "bg-indigo-50 text-indigo-700 border-indigo-200"
              }`}>
                Sum: {calculatedTotal} Marks
              </span>
            </div>

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

        {/* RIGHT OFFICIAL EXAM PAPER PREVIEW */}
        <div className="lg:col-span-8 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 space-y-6 shadow-sm min-h-[500px]">
          
          {paper ? (
            <div className="space-y-6">
              
              {/* OFFICIAL EXAM HEADER */}
              <div className="text-center border-b-2 border-slate-900 pb-4 space-y-1.5">
                <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">{paper.school_name}</h2>
                <h3 className="text-base font-bold text-slate-800 uppercase">{paper.title}</h3>
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 pt-2 px-2 border-t border-slate-200">
                  <span>CLASS: {paper.class_name.toUpperCase()} ({paper.subject.toUpperCase()})</span>
                  <span>TIME ALLOWED: {paper.time_allowed_mins} MINS</span>
                  <span>MAX MARKS: {paper.total_marks}</span>
                </div>
              </div>

              {/* GENERAL INSTRUCTIONS */}
              {paper.instructions && paper.instructions.length > 0 && (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1.5">
                  <span className="font-bold text-slate-900 block uppercase tracking-wider text-[10px]">General Instructions:</span>
                  <ul className="list-disc list-inside text-slate-700 space-y-1 font-medium">
                    {paper.instructions.map((inst, i) => (
                      <li key={i}>{inst}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* SECTION A: MCQS */}
              {sectionA.length > 0 && (
                <div className="space-y-4">
                  <div className="bg-slate-100 p-2.5 rounded-xl border border-slate-200 flex justify-between items-center">
                    <span className="text-xs font-black uppercase text-slate-900">SECTION A: Multiple Choice Questions (1 Mark Each)</span>
                    <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
                      {sectionA.length} Questions
                    </span>
                  </div>
                  {sectionA.map((q) => renderQuestionCard(q))}
                </div>
              )}

              {/* SECTION B: SHORT ANSWER */}
              {sectionB.length > 0 && (
                <div className="space-y-4">
                  <div className="bg-slate-100 p-2.5 rounded-xl border border-slate-200 flex justify-between items-center">
                    <span className="text-xs font-black uppercase text-slate-900">SECTION B: Short Answer Questions (3 Marks Each)</span>
                    <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
                      {sectionB.length} Questions
                    </span>
                  </div>
                  {sectionB.map((q) => renderQuestionCard(q))}
                </div>
              )}

              {/* SECTION C: LONG ANSWER */}
              {sectionC.length > 0 && (
                <div className="space-y-4">
                  <div className="bg-slate-100 p-2.5 rounded-xl border border-slate-200 flex justify-between items-center">
                    <span className="text-xs font-black uppercase text-slate-900">SECTION C: Long Answer Questions (5 Marks Each)</span>
                    <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
                      {sectionC.length} Questions
                    </span>
                  </div>
                  {sectionC.map((q) => renderQuestionCard(q))}
                </div>
              )}

              {/* SECTION D: CASE STUDY */}
              {sectionD.length > 0 && (
                <div className="space-y-4">
                  <div className="bg-slate-100 p-2.5 rounded-xl border border-slate-200 flex justify-between items-center">
                    <span className="text-xs font-black uppercase text-slate-900">SECTION D: Case Study / Passage Questions (4 Marks Each)</span>
                    <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
                      {sectionD.length} Questions
                    </span>
                  </div>
                  {sectionD.map((q) => renderQuestionCard(q))}
                </div>
              )}

            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full py-24 text-center space-y-4 text-slate-400">
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

  function renderQuestionCard(q: any) {
    return (
      <div key={q.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-extrabold text-indigo-700 uppercase">
            Q{q.question_number} ({q.marks} Mark{q.marks > 1 ? 's' : ''})
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

        {q.passage && (
          <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100 text-xs text-slate-800 font-medium italic">
            {q.passage}
          </div>
        )}

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
            {q.options.map((opt: string, oIdx: number) => (
              <div key={oIdx} className="text-[11px] p-2 bg-white rounded-lg border border-slate-200 text-slate-700 font-medium">
                {opt}
              </div>
            ))}
          </div>
        )}

        {showAnswerKey && q.answer && (
          <div className="pt-2 border-t border-slate-200 text-[11px] text-emerald-700 font-medium space-y-0.5">
            <div><span className="font-bold">Answer Key:</span> {q.answer}</div>
            {q.explanation && <div className="text-slate-500 text-[10px]"><span className="font-bold">Scoring Notes:</span> {q.explanation}</div>}
          </div>
        )}
      </div>
    );
  }
}
