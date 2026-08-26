"use client";

import React, { useState, useEffect } from "react";
import {
  generateAIAssignment,
  downloadAssignmentPDF,
  AssignmentData,
  AssignmentQuestion,
  AssignmentPDFConfig,
  GenerateAssignmentPayload
} from "@/lib/api";
import Markdown from "@/components/chat/Markdown";
import {
  Sparkles,
  FileText,
  Download,
  Plus,
  Trash2,
  RotateCcw,
  CheckCircle2,
  Sliders,
  Check,
  AlertCircle,
  Eye,
  Edit3,
  X,
  Award,
  ChevronDown,
  ChevronUp,
  Save,
  BookOpen,
  Hash
} from "lucide-react";

export default function AssignmentMakerPage() {
  // --- Form & Generator State ---
  const [className, setClassName] = useState("Class 10");
  const [subject, setSubject] = useState("Mathematics");
  const [chapterTopic, setChapterTopic] = useState("Quadratic Equations & Polynomials");
  const [title, setTitle] = useState("");
  const [difficulty, setDifficulty] = useState("medium");
  const [mcqCount, setMcqCount] = useState(4);
  const [shortCount, setShortCount] = useState(2);
  const [longCount, setLongCount] = useState(1);
  const [fillBlanksCount, setFillBlanksCount] = useState(0);
  const [dueDate, setDueDate] = useState("");
  const [schoolName, setSchoolName] = useState("DEVGYA GLOBAL ACADEMY");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // --- Active Assignment Workspace State ---
  const [assignment, setAssignment] = useState<AssignmentData | null>(null);
  const [editingQNum, setEditingQNum] = useState<number | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewTab, setPreviewTab] = useState<"worksheet" | "answers">("worksheet");
  const [showSolutions, setShowSolutions] = useState(false);

  // --- PDF Customizer Modal State ---
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [pdfDownloading, setPdfDownloading] = useState(false);
  const [pdfConfig, setPdfConfig] = useState<AssignmentPDFConfig>({
    answer_space_mode: "ruled_lines",
    line_style: "solid",
    default_short_lines: 4,
    default_long_lines: 8,
    box_height_mm: 35,
    include_student_header: true,
    columns: 1,
    font_size_mode: "standard",
    theme_name: "cbse"
  });

  // Calculate dynamic total marks
  const estimatedMarks = mcqCount * 1 + fillBlanksCount * 1 + shortCount * 3 + longCount * 5;

  // Initialize due date to 7 days from now
  useEffect(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    setDueDate(d.toISOString().split("T")[0]);
  }, []);

  // --- Handle AI Assignment Generation ---
  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const totalCount = mcqCount + shortCount + longCount + fillBlanksCount;
    if (totalCount <= 0) {
      setError("Please select at least 1 question to generate.");
      return;
    }

    if (!chapterTopic.trim()) {
      setError("Please specify the Chapter / Topic.");
      return;
    }

    setLoading(true);
    try {
      const payload: GenerateAssignmentPayload = {
        class_name: className,
        subject,
        chapter_topic: chapterTopic.trim(),
        title: title.trim() || `${subject} Assignment: ${chapterTopic.trim()}`,
        difficulty,
        mcq_count: mcqCount,
        short_count: shortCount,
        long_count: longCount,
        fill_blanks_count: fillBlanksCount,
        due_date: dueDate,
        school_name: schoolName.trim() || "DEVGYA GLOBAL ACADEMY"
      };

      const res = await generateAIAssignment(payload);
      if (res && res.assignment && res.assignment.questions?.length > 0) {
        setAssignment(res.assignment);
        setSuccessMsg(`✨ Successfully generated all ${res.assignment.questions.length} questions!`);
      } else {
        throw new Error("No assignment questions returned by AI. Please try again.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to generate AI assignment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // --- Question Update Handlers ---
  const handleUpdateQuestion = (qNum: number, field: keyof AssignmentQuestion, value: any) => {
    if (!assignment) return;
    const updatedQs = assignment.questions.map((q) => {
      if (q.question_number === qNum) {
        return { ...q, [field]: value };
      }
      return q;
    });
    const newTotal = updatedQs.reduce((acc, q) => acc + (Number(q.marks) || 0), 0);
    setAssignment({ ...assignment, questions: updatedQs, total_marks: newTotal });
  };

  const handleUpdateOption = (qNum: number, optIdx: number, newText: string) => {
    if (!assignment) return;
    const updatedQs = assignment.questions.map((q) => {
      if (q.question_number === qNum && q.options) {
        const newOpts = [...q.options];
        newOpts[optIdx] = newText;
        return { ...q, options: newOpts };
      }
      return q;
    });
    setAssignment({ ...assignment, questions: updatedQs });
  };

  const handleDeleteQuestion = (qNum: number) => {
    if (!assignment) return;
    const filtered = assignment.questions.filter((q) => q.question_number !== qNum);
    const renumbered = filtered.map((q, idx) => ({ ...q, question_number: idx + 1 }));
    const newTotal = renumbered.reduce((acc, q) => acc + (Number(q.marks) || 0), 0);
    setAssignment({ ...assignment, questions: renumbered, total_marks: newTotal });
  };

  const handleAddQuestion = (type: "mcq" | "short" | "long" | "fill_in_the_blank" = "short") => {
    if (!assignment) return;
    const nextNum = assignment.questions.length + 1;
    const marks = type === "mcq" || type === "fill_in_the_blank" ? 1 : type === "long" ? 5 : 3;
    const lines = type === "mcq" ? 0 : type === "long" ? 8 : type === "fill_in_the_blank" ? 1 : 4;
    const sec =
      type === "mcq"
        ? "Section A: Multiple Choice Questions"
        : type === "long"
        ? "Section C: Long Answer Questions"
        : type === "fill_in_the_blank"
        ? "Section A: Fill in the Blanks"
        : "Section B: Short Answer Questions";

    const newQ: AssignmentQuestion = {
      id: nextNum,
      question_number: nextNum,
      question_type: type,
      section: sec,
      question_text: type === "mcq" 
        ? "Enter your multiple choice question prompt (LaTeX supported: $x^2 + 5x = 0$)..."
        : type === "fill_in_the_blank"
        ? "The process of ______ is responsible for converting glucose into energy in cells."
        : "Enter your custom question prompt (LaTeX supported: $x^2 - 5x + 6 = 0$)...",
      options: type === "mcq" ? ["(A) Option 1", "(B) Option 2", "(C) Option 3", "(D) Option 4"] : null,
      answer: type === "mcq" ? "(A) Option 1" : "Model solution and answer key here...",
      explanation: "Marking breakdown, step-by-step scoring rubric, and explanation.",
      marks,
      lines_allocated: lines
    };

    const updated = [...assignment.questions, newQ];
    const newTotal = updated.reduce((acc, q) => acc + (Number(q.marks) || 0), 0);
    setAssignment({ ...assignment, questions: updated, total_marks: newTotal });
    setEditingQNum(nextNum);
  };

  const handleUpdateQuestionType = (qNum: number, newType: "mcq" | "short" | "long" | "fill_in_the_blank") => {
    if (!assignment) return;
    const marks = newType === "mcq" || newType === "fill_in_the_blank" ? 1 : newType === "long" ? 5 : 3;
    const lines = newType === "mcq" ? 0 : newType === "long" ? 8 : newType === "fill_in_the_blank" ? 1 : 4;
    const sec =
      newType === "mcq"
        ? "Section A: Multiple Choice Questions"
        : newType === "long"
        ? "Section C: Long Answer Questions"
        : newType === "fill_in_the_blank"
        ? "Section A: Fill in the Blanks"
        : "Section B: Short Answer Questions";

    const updatedQs = assignment.questions.map((q) => {
      if (q.question_number === qNum) {
        return {
          ...q,
          question_type: newType,
          section: sec,
          marks,
          lines_allocated: lines,
          options: newType === "mcq" ? (q.options && q.options.length === 4 ? q.options : ["(A) Option 1", "(B) Option 2", "(C) Option 3", "(D) Option 4"]) : null,
          answer: newType === "mcq" ? (q.options?.[0] || "(A) Option 1") : q.answer
        };
      }
      return q;
    });

    const newTotal = updatedQs.reduce((acc, q) => acc + (Number(q.marks) || 0), 0);
    setAssignment({ ...assignment, questions: updatedQs, total_marks: newTotal });
  };

  // --- PDF Export Handler ---
  const handleDownloadPDF = async (isTeacherKey: boolean = false) => {
    if (!assignment) return;
    setPdfDownloading(true);
    setError(null);
    try {
      const blob = await downloadAssignmentPDF(assignment, pdfConfig, isTeacherKey);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const typeStr = isTeacherKey ? "Teacher_Key" : "Worksheet";
      a.download = `${assignment.subject}_${assignment.class_name}_${typeStr}.pdf`.replace(/\s+/g, "_");
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      setSuccessMsg(`📄 PDF Downloaded successfully (${typeStr})!`);
      setIsPdfModalOpen(false);
    } catch (err: any) {
      setError(err.message || "Failed to download PDF.");
    } finally {
      setPdfDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-28">
      
      {/* 1. CLEAN TOP HEADER (ONLY ONE UNIFIED HEADER, NO DUPLICATION) */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
              <Edit3 className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm sm:text-base font-black text-slate-900 truncate">
                {assignment ? assignment.title : "AI Assignment Maker"}
              </h1>
              <p className="text-[11px] text-slate-500 font-medium truncate">
                {assignment ? `${assignment.class_name} • ${assignment.subject} • ${assignment.total_marks} Marks` : "CBSE / NCERT Worksheet Generator"}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          {assignment ? (
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setShowPreviewModal(true)}
                className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Preview Paper</span>
              </button>

              <button
                type="button"
                onClick={() => setIsPdfModalOpen(true)}
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-xs font-black transition flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download PDF</span>
              </button>

              <button
                type="button"
                onClick={() => setAssignment(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                title="Create New Assignment"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              100% Original AI
            </span>
          )}
        </div>
      </header>

      {/* Notifications */}
      <div className="max-w-5xl mx-auto px-4 mt-3">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 flex items-center justify-between text-xs font-semibold shadow-xs">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
            <button onClick={() => setError(null)} className="text-rose-400 hover:text-rose-700">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        {successMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 flex items-center justify-between text-xs font-semibold shadow-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
            <button onClick={() => setSuccessMsg(null)} className="text-emerald-500 hover:text-emerald-700">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* MAIN BODY CONTAINER */}
      <main className="max-w-3xl mx-auto px-4 py-4">
        {!assignment ? (
          /* ====================================================================
             MODE A: SIMPLE, INTUITIVE ASSIGNMENT CREATOR FORM
             ==================================================================== */
          <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-7 shadow-sm space-y-5">
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900">Create New Assignment Worksheet</h2>
              <p className="text-xs text-slate-500 mt-0.5">Configure your topic and question breakdown. AI will synthesize original questions.</p>
            </div>

            <form onSubmit={handleGenerate} className="space-y-4">
              {/* Class & Subject */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Class</label>
                  <select
                    value={className}
                    onChange={(e) => setClassName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs sm:text-sm font-semibold focus:bg-white focus:ring-2 focus:ring-indigo-500 transition"
                  >
                    {[
                      "Class 6", "Class 7", "Class 8", "Class 9", "Class 10",
                      "Class 11 Science", "Class 11 Commerce", "Class 11 Humanities",
                      "Class 12 Science", "Class 12 Commerce", "Class 12 Humanities"
                    ].map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Subject</label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs sm:text-sm font-semibold focus:bg-white focus:ring-2 focus:ring-indigo-500 transition"
                  >
                    {[
                      "Mathematics", "Science", "Physics", "Chemistry", "Biology",
                      "Social Science", "History", "Civics / Political Science", "Geography", "Economics",
                      "English", "Hindi (हिंदी)", "Computer Science / IT", "Accountancy", "Business Studies"
                    ].map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Chapter / Topic */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Chapter / Topic <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={chapterTopic}
                  onChange={(e) => setChapterTopic(e.target.value)}
                  placeholder="e.g. Quadratic Equations, Nature of Roots & Word Problems"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-medium focus:bg-white focus:ring-2 focus:ring-indigo-500 transition"
                  required
                />
              </div>

              {/* Question Count Steppers */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1">
                    <Hash className="w-3.5 h-3.5 text-indigo-600" /> Question Breakdown
                  </label>
                  <span className="text-[11px] font-bold text-indigo-700">
                    Total: {mcqCount + shortCount + longCount} Questions ({estimatedMarks} Marks)
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2.5">
                  {/* MCQs */}
                  <div className="p-3 bg-blue-50/60 border border-blue-200 rounded-2xl text-center">
                    <span className="text-[11px] font-black text-blue-900 block mb-1.5">MCQs (1M)</span>
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setMcqCount(Math.max(0, mcqCount - 1))}
                        className="w-7 h-7 rounded-lg bg-white border border-blue-200 font-black text-xs text-blue-900"
                      >
                        -
                      </button>
                      <span className="w-6 font-black text-xs text-blue-950">{mcqCount}</span>
                      <button
                        type="button"
                        onClick={() => setMcqCount(mcqCount + 1)}
                        className="w-7 h-7 rounded-lg bg-white border border-blue-200 font-black text-xs text-blue-900"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Short */}
                  <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-2xl text-center">
                    <span className="text-[11px] font-black text-emerald-900 block mb-1.5">Short (3M)</span>
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setShortCount(Math.max(0, shortCount - 1))}
                        className="w-7 h-7 rounded-lg bg-white border border-emerald-200 font-black text-xs text-emerald-900"
                      >
                        -
                      </button>
                      <span className="w-6 font-black text-xs text-emerald-950">{shortCount}</span>
                      <button
                        type="button"
                        onClick={() => setShortCount(shortCount + 1)}
                        className="w-7 h-7 rounded-lg bg-white border border-emerald-200 font-black text-xs text-emerald-900"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Long */}
                  <div className="p-3 bg-purple-50/60 border border-purple-200 rounded-2xl text-center">
                    <span className="text-[11px] font-black text-purple-900 block mb-1.5">Long (5M)</span>
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setLongCount(Math.max(0, longCount - 1))}
                        className="w-7 h-7 rounded-lg bg-white border border-purple-200 font-black text-xs text-purple-900"
                      >
                        -
                      </button>
                      <span className="w-6 font-black text-xs text-purple-950">{longCount}</span>
                      <button
                        type="button"
                        onClick={() => setLongCount(longCount + 1)}
                        className="w-7 h-7 rounded-lg bg-white border border-purple-200 font-black text-xs text-purple-900"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Difficulty */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Difficulty</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold focus:bg-white"
                  >
                    <option value="easy">Foundational (Recall)</option>
                    <option value="medium">Standard (Application)</option>
                    <option value="hard">Advanced (Multi-step)</option>
                    <option value="hots">HOTS (Case Study)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-medium focus:bg-white"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:to-pink-700 text-white font-black text-sm shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 transition active:scale-98 disabled:opacity-50 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Generating Assignment Questions...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      <span>Generate 100% Original Assignment</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* ====================================================================
             MODE B: CLEAN, TEXTBOOK-STYLE QUESTION WORKSPACE
             ==================================================================== */
          <div className="space-y-4">
            {/* Minimal Toolbar */}
            <div className="flex items-center justify-between flex-wrap gap-2 px-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-700">
                  {assignment.questions.length} Questions
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-xs font-black text-indigo-700">
                  {assignment.total_marks} Marks
                </span>
              </div>

              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => setShowSolutions(!showSolutions)}
                  className={`text-xs font-bold px-2.5 py-1 rounded-lg border transition cursor-pointer ${
                    showSolutions
                      ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                      : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {showSolutions ? "Hide Answers" : "Show Answers"}
                </button>

                {/* Quick Add Buttons */}
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleAddQuestion("mcq")}
                    className="text-xs font-bold px-2 py-1 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 transition flex items-center gap-1 cursor-pointer"
                    title="Add Multiple Choice Question (1 Mark)"
                  >
                    <Plus className="w-3 h-3" /> MCQ
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAddQuestion("short")}
                    className="text-xs font-bold px-2 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 transition flex items-center gap-1 cursor-pointer"
                    title="Add Short Answer Question (3 Marks)"
                  >
                    <Plus className="w-3 h-3" /> Short (3M)
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAddQuestion("long")}
                    className="text-xs font-bold px-2 py-1 rounded-lg bg-purple-50 border border-purple-200 text-purple-700 hover:bg-purple-100 transition flex items-center gap-1 cursor-pointer"
                    title="Add Long Answer Question (5 Marks)"
                  >
                    <Plus className="w-3 h-3" /> Long (5M)
                  </button>
                </div>
              </div>
            </div>

            {/* Questions List */}
            <div className="space-y-3.5">
              {assignment.questions.map((q) => {
                const isEditing = editingQNum === q.question_number;

                return (
                  <div
                    key={q.question_number}
                    className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-5 shadow-xs space-y-3 transition"
                  >
                    {/* Top Row: Q Number, Type, Marks & Edit/Delete Action Icons */}
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white font-black text-xs flex items-center justify-center">
                          Q{q.question_number}
                        </span>
                        <span className="text-[11px] font-bold text-slate-500 uppercase">
                          {q.question_type}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                          {q.marks} {q.marks === 1 ? "Mark" : "Marks"}
                        </span>

                        {isEditing ? (
                          <button
                            type="button"
                            onClick={() => setEditingQNum(null)}
                            className="p-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 flex items-center gap-1"
                          >
                            <Save className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setEditingQNum(q.question_number)}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                            title="Edit Question"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleDeleteQuestion(q.question_number)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="Delete Question"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Question Content (Clean Textbook View when not editing) */}
                    {isEditing ? (
                      /* Inline Edit Mode */
                      <div className="space-y-3 pt-1">
                        {/* Question Type & Marks Configuration Row */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                          <div>
                            <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                              Question Type:
                            </label>
                            <select
                              value={q.question_type}
                              onChange={(e) => handleUpdateQuestionType(q.question_number, e.target.value as any)}
                              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-800"
                            >
                              <option value="mcq">Multiple Choice (MCQ - 1M)</option>
                              <option value="short">Short Answer (3 Marks)</option>
                              <option value="long">Long Answer (5 Marks)</option>
                              <option value="fill_in_the_blank">Fill in the Blank (1M)</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Marks:</label>
                            <input
                              type="number"
                              min="1"
                              max="20"
                              value={q.marks}
                              onChange={(e) =>
                                handleUpdateQuestion(q.question_number, "marks", parseInt(e.target.value) || 1)
                              }
                              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-800"
                            />
                          </div>

                          {q.question_type !== "mcq" && (
                            <div>
                              <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Answer Lines:</label>
                              <input
                                type="number"
                                min="0"
                                max="20"
                                value={q.lines_allocated ?? 4}
                                onChange={(e) =>
                                  handleUpdateQuestion(
                                    q.question_number,
                                    "lines_allocated",
                                    parseInt(e.target.value) || 0
                                  )
                                }
                                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-800"
                              />
                            </div>
                          )}
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                            Question Stem (LaTeX supported: $x^2 + 5x = 0$)
                          </label>
                          <textarea
                            rows={2}
                            value={q.question_text}
                            onChange={(e) => handleUpdateQuestion(q.question_number, "question_text", e.target.value)}
                            className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 font-medium"
                          />
                        </div>

                        {/* Marks & Lines Stepper */}
                        <div className="flex gap-4 text-xs">
                          <div>
                            <label className="font-bold text-slate-600 mr-2">Marks:</label>
                            <input
                              type="number"
                              min="1"
                              max="20"
                              value={q.marks}
                              onChange={(e) =>
                                handleUpdateQuestion(q.question_number, "marks", parseInt(e.target.value) || 1)
                              }
                              className="w-12 text-center font-bold bg-slate-50 border border-slate-300 rounded py-0.5"
                            />
                          </div>
                          {q.question_type !== "mcq" && (
                            <div>
                              <label className="font-bold text-slate-600 mr-2">Answer Lines:</label>
                              <input
                                type="number"
                                min="1"
                                max="20"
                                value={q.lines_allocated || 4}
                                onChange={(e) =>
                                  handleUpdateQuestion(
                                    q.question_number,
                                    "lines_allocated",
                                    parseInt(e.target.value) || 4
                                  )
                                }
                                className="w-12 text-center font-bold bg-slate-50 border border-slate-300 rounded py-0.5"
                              />
                            </div>
                          )}
                        </div>

                        {/* MCQ Options Edit */}
                        {q.question_type === "mcq" && q.options && (
                          <div className="space-y-1.5 pt-1">
                            <label className="block text-[10px] font-bold uppercase text-slate-500">
                              Options (Click radio to set correct answer):
                            </label>
                            {q.options.map((opt, oIdx) => (
                              <div key={oIdx} className="flex items-center gap-2">
                                <input
                                  type="radio"
                                  name={`correct-${q.question_number}`}
                                  checked={q.answer === opt}
                                  onChange={() => handleUpdateQuestion(q.question_number, "answer", opt)}
                                  className="w-4 h-4 text-indigo-600"
                                />
                                <input
                                  type="text"
                                  value={opt}
                                  onChange={(e) => handleUpdateOption(q.question_number, oIdx, e.target.value)}
                                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs"
                                />
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="text-right pt-1">
                          <button
                            type="button"
                            onClick={() => setEditingQNum(null)}
                            className="px-3 py-1 rounded-xl bg-indigo-600 text-white text-xs font-bold"
                          >
                            Done Editing
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Clean Read View */
                      <div className="space-y-2.5">
                        <div className="text-xs sm:text-sm font-bold text-slate-900 leading-relaxed">
                          <Markdown content={q.question_text} />
                        </div>

                        {/* MCQ Options Display */}
                        {q.options && q.options.length > 0 && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
                            {q.options.map((opt, oIdx) => {
                              const isCorrect = showSolutions && q.answer === opt;
                              return (
                                <div
                                  key={oIdx}
                                  className={`px-3 py-1.5 rounded-xl border text-xs font-medium transition ${
                                    isCorrect
                                      ? "bg-emerald-50 border-emerald-300 text-emerald-950 font-bold"
                                      : "bg-slate-50 border-slate-200 text-slate-800"
                                  }`}
                                >
                                  <Markdown content={opt} />
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* Teacher Solution (Toggleable) */}
                        {showSolutions && (
                          <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-2xl text-xs space-y-1 mt-2">
                            <div className="font-bold text-emerald-900">
                              <b>Answer:</b> <Markdown content={q.answer || "N/A"} />
                            </div>
                            {q.explanation && (
                              <div className="text-[11px] text-emerald-800 italic pt-0.5">
                                <b>Marking Rubric:</b> <Markdown content={q.explanation} />
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* ====================================================================
         3. CLEAN FULL PAPER PREVIEW POP-UP MODAL
         ==================================================================== */}
      {showPreviewModal && assignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-sm p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-4xl w-full h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in duration-150">
            {/* Modal Header */}
            <div className="p-4 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm sm:text-base font-black truncate max-w-xs sm:max-w-md">{assignment.title}</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowPreviewModal(false);
                    setIsPdfModalOpen(true);
                  }}
                  className="px-3 py-1 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition flex items-center gap-1"
                >
                  <Download className="w-3.5 h-3.5" /> Download PDF
                </button>
                <button
                  type="button"
                  onClick={() => setShowPreviewModal(false)}
                  className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* View Mode Tabs */}
            <div className="px-4 py-2 bg-slate-100 border-b border-slate-200 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setPreviewTab("worksheet")}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                    previewTab === "worksheet"
                      ? "bg-white text-indigo-700 shadow-xs border border-slate-200"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Student Worksheet
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewTab("answers")}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                    previewTab === "answers"
                      ? "bg-white text-indigo-700 shadow-xs border border-slate-200"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Teacher Solution Key
                </button>
              </div>
              <span className="text-[11px] font-bold text-slate-500">
                {assignment.class_name} • {assignment.subject}
              </span>
            </div>

            {/* Paper Preview Content */}
            <div className="flex-1 p-4 sm:p-8 overflow-y-auto space-y-5 bg-slate-50">
              <div className="text-center pb-3 border-b-2 border-slate-800 space-y-1">
                <h2 className="text-base sm:text-lg font-black text-slate-900 uppercase">
                  {assignment.school_name || "DEVGYA GLOBAL ACADEMY"}
                </h2>
                <p className="text-xs sm:text-sm font-bold text-indigo-800">{assignment.title}</p>
                <div className="flex justify-center gap-4 text-xs text-slate-600">
                  <span>Class: <b>{assignment.class_name}</b></span>
                  <span>Subject: <b>{assignment.subject}</b></span>
                  <span>Marks: <b>{assignment.total_marks}</b></span>
                </div>
              </div>

              {/* Student Header */}
              {previewTab === "worksheet" && (
                <div className="p-3 bg-white border border-slate-300 rounded-2xl text-xs text-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div><b>Student Name:</b> ______________________________</div>
                  <div><b>Roll No:</b> __________________</div>
                </div>
              )}

              {/* Questions */}
              <div className="space-y-4">
                {assignment.questions.map((q) => (
                  <div key={q.question_number} className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <div className="text-xs sm:text-sm font-bold text-slate-900 flex-1 leading-relaxed">
                        <span className="text-indigo-600 font-black mr-1">Q{q.question_number}.</span>
                        <Markdown content={q.question_text} />
                      </div>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 shrink-0">
                        [{q.marks} {q.marks === 1 ? "Mark" : "Marks"}]
                      </span>
                    </div>

                    {q.options && q.options.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
                        {q.options.map((opt, oIdx) => (
                          <div key={oIdx} className="text-xs text-slate-700 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                            <Markdown content={opt} />
                          </div>
                        ))}
                      </div>
                    )}

                    {previewTab === "worksheet" ? (
                      q.question_type !== "mcq" ? (
                        <div className="pt-2 space-y-2">
                          {Array.from({ length: Math.min(5, q.lines_allocated || 4) }).map((_, lIdx) => (
                            <div key={lIdx} className="h-3.5 border-b border-dashed border-blue-300 w-full" />
                          ))}
                        </div>
                      ) : null
                    ) : (
                      <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs space-y-0.5">
                        <div className="font-bold text-emerald-900">
                          <b>Correct Answer:</b> <Markdown content={q.answer || "N/A"} />
                        </div>
                        {q.explanation && (
                          <div className="text-[11px] text-emerald-800 italic">
                            <b>Rubric:</b> <Markdown content={q.explanation} />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
         4. CLEAN PDF DOWNLOAD CONFIGURATOR MODAL
         ==================================================================== */}
      {isPdfModalOpen && assignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-black text-slate-900">Download PDF Layout</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsPdfModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-800">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Answer Space Style</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "ruled_lines", label: "✍️ Ruled Lines" },
                    { id: "response_box", label: "📦 Box Space" },
                    { id: "none", label: "📄 Question Sheet" }
                  ].map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setPdfConfig({ ...pdfConfig, answer_space_mode: s.id as any })}
                      className={`p-2.5 rounded-2xl border text-center font-bold text-xs transition cursor-pointer ${
                        pdfConfig.answer_space_mode === s.id
                          ? "bg-indigo-50 border-indigo-600 text-indigo-900 ring-2 ring-indigo-500/20"
                          : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Student Header Toggle */}
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl">
                <span className="font-bold text-xs text-slate-800">Include Student Name & Roll No Header</span>
                <input
                  type="checkbox"
                  checked={pdfConfig.include_student_header}
                  onChange={(e) => setPdfConfig({ ...pdfConfig, include_student_header: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 rounded"
                />
              </div>

              {/* Theme */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Color Theme</label>
                <select
                  value={pdfConfig.theme_name}
                  onChange={(e) => setPdfConfig({ ...pdfConfig, theme_name: e.target.value as any })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold"
                >
                  <option value="cbse">CBSE Classic Navy & Blue</option>
                  <option value="modern">Modern Indigo</option>
                  <option value="minimalist">Minimalist Slate</option>
                  <option value="emerald">Forest Emerald</option>
                </select>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => handleDownloadPDF(true)}
                disabled={pdfDownloading}
                className="px-3 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100"
              >
                Teacher Key PDF
              </button>

              <button
                type="button"
                onClick={() => handleDownloadPDF(false)}
                disabled={pdfDownloading}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black shadow-md flex items-center gap-1.5"
              >
                {pdfDownloading ? "Generating PDF..." : "Download Worksheet PDF"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
