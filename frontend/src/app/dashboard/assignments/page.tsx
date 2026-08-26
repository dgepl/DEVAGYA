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
  Copy,
  RotateCcw,
  CheckCircle2,
  Layers,
  Settings,
  BookOpen,
  Calendar,
  Award,
  ChevronRight,
  Eye,
  Edit3,
  Sliders,
  Check,
  AlertCircle,
  HelpCircle,
  Hash,
  ListOrdered,
  AlignLeft,
  Columns,
  Type,
  X,
  Printer,
  FileSpreadsheet
} from "lucide-react";

export default function AssignmentMakerPage() {
  // --- Form & Generator State ---
  const [className, setClassName] = useState("Class 10");
  const [subject, setSubject] = useState("Mathematics");
  const [chapterTopic, setChapterTopic] = useState("Quadratic Equations & Polynomials");
  const [title, setTitle] = useState("Classroom Assignment 1");
  const [difficulty, setDifficulty] = useState("medium");
  const [mcqCount, setMcqCount] = useState(4);
  const [shortCount, setShortCount] = useState(2);
  const [longCount, setLongCount] = useState(1);
  const [fillBlanksCount, setFillBlanksCount] = useState(0);
  const [dueDate, setDueDate] = useState("");
  const [schoolName, setSchoolName] = useState("DEVGYA GLOBAL ACADEMY");
  const [customNotes, setCustomNotes] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // --- Active Assignment Workspace State ---
  const [assignment, setAssignment] = useState<AssignmentData | null>(null);
  const [previewMath, setPreviewMath] = useState<Record<number, boolean>>({});
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewTab, setPreviewTab] = useState<"worksheet" | "answers">("worksheet");

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
        custom_notes: customNotes.trim() || undefined,
        due_date: dueDate,
        school_name: schoolName.trim() || "DEVGYA GLOBAL ACADEMY"
      };

      const res = await generateAIAssignment(payload);
      if (res && res.assignment && res.assignment.questions?.length > 0) {
        setAssignment(res.assignment);
        setSuccessMsg(`✨ Successfully generated all ${res.assignment.questions.length} original AI questions!`);
      } else {
        throw new Error("No assignment questions returned by AI. Please try again.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to generate AI assignment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // --- Question Management Handlers ---
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

  const handleAddQuestion = (type: "mcq" | "short" | "long" = "short") => {
    if (!assignment) return;
    const nextNum = assignment.questions.length + 1;
    const marks = type === "mcq" ? 1 : type === "long" ? 5 : 3;
    const lines = type === "mcq" ? 1 : type === "long" ? 8 : 4;
    const sec =
      type === "mcq"
        ? "Section A: Multiple Choice Questions"
        : type === "long"
        ? "Section C: Long Answer Questions"
        : "Section B: Short Answer Questions";

    const newQ: AssignmentQuestion = {
      id: nextNum,
      question_number: nextNum,
      question_type: type,
      section: sec,
      question_text: "New customized question prompt...",
      options: type === "mcq" ? ["(A) Option 1", "(B) Option 2", "(C) Option 3", "(D) Option 4"] : null,
      answer: type === "mcq" ? "(A) Option 1" : "Model solution here...",
      explanation: "Evaluation rubric and step-by-step marking scheme.",
      marks,
      lines_allocated: lines
    };

    const updated = [...assignment.questions, newQ];
    const newTotal = updated.reduce((acc, q) => acc + (Number(q.marks) || 0), 0);
    setAssignment({ ...assignment, questions: updated, total_marks: newTotal });
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
    } catch (err: any) {
      setError(err.message || "Failed to download PDF.");
    } finally {
      setPdfDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20 sm:pb-16">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white border-b border-indigo-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  <Sparkles className="w-3 h-3" /> 100% Original AI
                </span>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-500/20 text-blue-200 border border-blue-400/30">
                  CBSE / NCERT
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight mt-1.5 flex items-center gap-2">
                <Edit3 className="w-6 h-6 sm:w-7 sm:h-7 text-amber-400" />
                AI Assignment & Worksheet Maker
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
                Create homework worksheets with custom answer lines, response boxes, and printable layout options.
              </p>
            </div>

            {assignment && (
              <div className="flex items-center gap-2.5 flex-wrap">
                <button
                  onClick={() => setShowPreviewModal(true)}
                  className="px-3.5 py-2 text-xs font-bold rounded-xl bg-indigo-600/80 hover:bg-indigo-600 text-white border border-indigo-500 transition flex items-center gap-1.5 shadow-sm"
                >
                  <Eye className="w-3.5 h-3.5" /> Preview Paper
                </button>
                <button
                  onClick={() => setAssignment(null)}
                  className="px-3 py-2 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition flex items-center gap-1 shadow-sm"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> New
                </button>
                <button
                  onClick={() => setIsPdfModalOpen(true)}
                  className="px-4 py-2 text-xs font-black rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 transition flex items-center gap-1.5 shadow-lg shadow-amber-500/20"
                >
                  <Download className="w-3.5 h-3.5" /> Download PDF
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
        {error && (
          <div className="mb-4 p-3.5 sm:p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 flex items-start gap-3 shadow-sm">
            <AlertCircle className="w-5 h-5 text-rose-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="font-bold text-xs sm:text-sm">Action Notice</h4>
              <p className="text-xs text-rose-700 mt-0.5">{error}</p>
            </div>
            <button onClick={() => setError(null)} className="text-rose-400 hover:text-rose-600">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        {successMsg && (
          <div className="mb-4 p-3.5 sm:p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <p className="text-xs sm:text-sm font-semibold">{successMsg}</p>
            </div>
            <button onClick={() => setSuccessMsg(null)} className="text-emerald-500 hover:text-emerald-700">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* MAIN CONTAINER */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-4">
        {!assignment ? (
          /* ====================================================================
             1. CLEAN, STREAMLINED PRE-GENERATION FORM
             ==================================================================== */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-8 shadow-sm">
                <div className="flex items-center gap-2 mb-5 pb-3 border-b border-slate-100">
                  <Sliders className="w-5 h-5 text-indigo-600" />
                  <h2 className="text-base sm:text-lg font-black text-slate-900">Assignment Topic & Question Setup</h2>
                </div>

                <form onSubmit={handleGenerate} className="space-y-5">
                  {/* Class & Subject */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                        Class
                      </label>
                      <select
                        value={className}
                        onChange={(e) => setClassName(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
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
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                        Subject
                      </label>
                      <select
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
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
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                      Chapter, Topic or Learning Unit <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={chapterTopic}
                      onChange={(e) => setChapterTopic(e.target.value)}
                      placeholder="e.g. Electricity, Ohm's Law & Resistor Numericals"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                      required
                    />
                  </div>

                  {/* QUESTION DISTRIBUTION COUNTERS */}
                  <div className="pt-1">
                    <div className="flex items-center justify-between mb-2.5 flex-wrap gap-1">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1">
                        <Hash className="w-3.5 h-3.5 text-indigo-600" />
                        Question Breakdown Required
                      </label>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                        Total: {mcqCount + shortCount + longCount + fillBlanksCount} Qs ({estimatedMarks} Marks)
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {/* MCQs */}
                      <div className="p-3 sm:p-4 bg-blue-50/50 border border-blue-200 rounded-2xl">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-bold text-blue-900">MCQs (1 Mark)</span>
                          <span className="text-[10px] font-semibold text-blue-600">4 options</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setMcqCount(Math.max(0, mcqCount - 1))}
                            className="w-8 h-8 rounded-lg bg-white border border-blue-200 hover:bg-blue-100 font-black text-blue-900 transition flex items-center justify-center text-sm"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            min="0"
                            max="30"
                            value={mcqCount}
                            onChange={(e) => setMcqCount(Math.max(0, parseInt(e.target.value) || 0))}
                            className="w-full text-center bg-white border border-blue-200 rounded-lg py-1 font-black text-blue-950 text-xs sm:text-sm"
                          />
                          <button
                            type="button"
                            onClick={() => setMcqCount(mcqCount + 1)}
                            className="w-8 h-8 rounded-lg bg-white border border-blue-200 hover:bg-blue-100 font-black text-blue-900 transition flex items-center justify-center text-sm"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Short Answer */}
                      <div className="p-3 sm:p-4 bg-emerald-50/50 border border-emerald-200 rounded-2xl">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-bold text-emerald-900">Short (3 Marks)</span>
                          <span className="text-[10px] font-semibold text-emerald-600">3–4 lines</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setShortCount(Math.max(0, shortCount - 1))}
                            className="w-8 h-8 rounded-lg bg-white border border-emerald-200 hover:bg-emerald-100 font-black text-emerald-900 transition flex items-center justify-center text-sm"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            min="0"
                            max="20"
                            value={shortCount}
                            onChange={(e) => setShortCount(Math.max(0, parseInt(e.target.value) || 0))}
                            className="w-full text-center bg-white border border-emerald-200 rounded-lg py-1 font-black text-emerald-950 text-xs sm:text-sm"
                          />
                          <button
                            type="button"
                            onClick={() => setShortCount(shortCount + 1)}
                            className="w-8 h-8 rounded-lg bg-white border border-emerald-200 hover:bg-emerald-100 font-black text-emerald-900 transition flex items-center justify-center text-sm"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Long Answer */}
                      <div className="p-3 sm:p-4 bg-purple-50/50 border border-purple-200 rounded-2xl">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-bold text-purple-900">Long / HOTS (5M)</span>
                          <span className="text-[10px] font-semibold text-purple-600">7–8 lines</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setLongCount(Math.max(0, longCount - 1))}
                            className="w-8 h-8 rounded-lg bg-white border border-purple-200 hover:bg-purple-100 font-black text-purple-900 transition flex items-center justify-center text-sm"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            min="0"
                            max="10"
                            value={longCount}
                            onChange={(e) => setLongCount(Math.max(0, parseInt(e.target.value) || 0))}
                            className="w-full text-center bg-white border border-purple-200 rounded-lg py-1 font-black text-purple-950 text-xs sm:text-sm"
                          />
                          <button
                            type="button"
                            onClick={() => setLongCount(longCount + 1)}
                            className="w-8 h-8 rounded-lg bg-white border border-purple-200 hover:bg-purple-100 font-black text-purple-900 transition flex items-center justify-center text-sm"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Difficulty & Due Date */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                        Difficulty
                      </label>
                      <select
                        value={difficulty}
                        onChange={(e) => setDifficulty(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                      >
                        <option value="easy">Foundational (Direct Recall)</option>
                        <option value="medium">Standard (Application & Numericals)</option>
                        <option value="hard">Advanced (Complex Multi-step)</option>
                        <option value="hots">HOTS (Critical Thinking & Case Study)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                        Due Date
                      </label>
                      <input
                        type="date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                      />
                    </div>
                  </div>

                  {/* SUBMIT BUTTON */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3.5 sm:py-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-black text-sm sm:text-base shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-2.5 disabled:opacity-50 active:scale-98"
                    >
                      {loading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Generating 100% Original AI Questions...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-amber-300" />
                          <span>Generate 100% Original AI Assignment</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Sidebar Guide — Hidden on Mobile for clean, user-friendly mobile experience */}
            <div className="hidden lg:block space-y-6">
              <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-3xl p-6 border border-indigo-800 shadow-md">
                <h3 className="text-sm font-black text-amber-400 flex items-center gap-2 mb-3">
                  <Award className="w-4 h-4" />
                  What Makes DEVGYA Assignments Special?
                </h3>
                <ul className="space-y-3 text-xs text-slate-300 leading-relaxed">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <span><b>Zero Mock / Zero Templates:</b> Real-time curriculum generation strictly tailored to your topic.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <span><b>LaTeX Math:</b> High-resolution formula typography for calculus, polynomials & physics.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <span><b>Ruled Lines & Boxes:</b> Customizable student writing lines on the final PDF.</span>
                  </li>
                </ul>
              </div>

              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Assignment Summary</h4>
                <div className="space-y-2 text-xs text-slate-700">
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Subject:</span>
                    <span className="font-bold text-slate-900">{subject}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Class:</span>
                    <span className="font-bold text-slate-900">{className}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Total Questions:</span>
                    <span className="font-bold text-slate-900">{mcqCount + shortCount + longCount + fillBlanksCount} Qs</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Total Marks:</span>
                    <span className="font-black text-indigo-700">{estimatedMarks} Marks</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* ====================================================================
             2. INTERACTIVE ASSIGNMENT WORKSPACE & QUESTION EDITOR
             ==================================================================== */
          <div className="space-y-5">
            {/* Top Workspace Header Bar */}
            <div className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-5 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                    {assignment.class_name}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
                    {assignment.subject}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
                    {assignment.questions.length} Questions
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
                    {assignment.total_marks} Marks
                  </span>
                </div>
                <input
                  type="text"
                  value={assignment.title}
                  onChange={(e) => setAssignment({ ...assignment, title: e.target.value })}
                  className="text-base sm:text-xl font-black text-slate-900 bg-transparent border-b border-dashed border-slate-300 hover:border-indigo-500 focus:border-indigo-600 focus:outline-none w-full max-w-xl transition"
                />
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => setShowPreviewModal(true)}
                  className="px-3.5 py-2 text-xs font-bold rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition flex items-center gap-1.5 shadow-sm"
                >
                  <Eye className="w-3.5 h-3.5" /> Preview Paper
                </button>
                <button
                  onClick={() => handleAddQuestion("short")}
                  className="px-3 py-2 text-xs font-bold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 transition flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5 text-indigo-600" /> Add Q
                </button>
                <button
                  onClick={() => setIsPdfModalOpen(true)}
                  className="px-4 py-2 text-xs font-black rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white transition flex items-center gap-1.5 shadow-md shadow-indigo-600/20"
                >
                  <Download className="w-3.5 h-3.5" /> Download PDF
                </button>
              </div>
            </div>

            {/* Questions List */}
            <div className="space-y-4">
              {assignment.questions.map((q) => {
                const isMathPreview = previewMath[q.question_number] ?? true;
                return (
                  <div
                    key={q.question_number}
                    className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-6 shadow-sm hover:shadow-md transition"
                  >
                    {/* Question Card Header */}
                    <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-indigo-600 text-white font-black text-xs flex items-center justify-center">
                          Q{q.question_number}
                        </span>
                        <input
                          type="text"
                          value={q.section}
                          onChange={(e) => handleUpdateQuestion(q.question_number, "section", e.target.value)}
                          className="text-xs font-bold text-indigo-800 bg-indigo-50/50 px-2 py-0.5 rounded-md border border-indigo-100 max-w-[200px]"
                        />
                        <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                          {q.question_type}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="flex items-center gap-1 text-xs">
                          <label className="font-bold text-slate-600">Marks:</label>
                          <input
                            type="number"
                            min="1"
                            max="20"
                            value={q.marks}
                            onChange={(e) => handleUpdateQuestion(q.question_number, "marks", parseInt(e.target.value) || 1)}
                            className="w-12 text-center font-bold bg-slate-50 border border-slate-300 rounded-lg py-0.5 text-xs text-slate-900"
                          />
                        </div>

                        {q.question_type !== "mcq" && (
                          <div className="flex items-center gap-1 text-xs">
                            <label className="font-bold text-slate-600">Lines:</label>
                            <input
                              type="number"
                              min="1"
                              max="25"
                              value={q.lines_allocated || 4}
                              onChange={(e) =>
                                handleUpdateQuestion(q.question_number, "lines_allocated", parseInt(e.target.value) || 4)
                              }
                              className="w-12 text-center font-bold bg-slate-50 border border-slate-300 rounded-lg py-0.5 text-xs text-slate-900"
                            />
                          </div>
                        )}

                        <button
                          onClick={() => setPreviewMath({ ...previewMath, [q.question_number]: !isMathPreview })}
                          className={`p-1.5 rounded-lg text-xs font-semibold border transition ${
                            isMathPreview
                              ? "bg-indigo-50 border-indigo-200 text-indigo-700"
                              : "bg-slate-100 border-slate-200 text-slate-600"
                          }`}
                          title="Toggle KaTeX Math Preview"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleDeleteQuestion(q.question_number)}
                          className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition"
                          title="Delete Question"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Question Stem Edit & Preview */}
                    <div className="space-y-2">
                      <textarea
                        rows={2}
                        value={q.question_text}
                        onChange={(e) => handleUpdateQuestion(q.question_number, "question_text", e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs sm:text-sm font-medium text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                      />

                      {/* Live Math Preview Box */}
                      {isMathPreview && q.question_text && (
                        <div className="p-3 bg-slate-900 text-white rounded-2xl text-xs border border-slate-800">
                          <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block mb-1">
                            Formula & Math Rendering:
                          </span>
                          <Markdown content={q.question_text} />
                        </div>
                      )}
                    </div>

                    {/* MCQ Options (If MCQ) */}
                    {q.question_type === "mcq" && q.options && (
                      <div className="mt-3.5 pt-3 border-t border-slate-100">
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                          Options & Correct Answer Selection
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {q.options.map((opt, oIdx) => {
                            const isCorrect = q.answer === opt;
                            return (
                              <div
                                key={oIdx}
                                className={`flex items-center gap-2 p-2.5 rounded-xl border transition ${
                                  isCorrect ? "bg-emerald-50 border-emerald-300" : "bg-slate-50 border-slate-200"
                                }`}
                              >
                                <input
                                  type="radio"
                                  name={`correct-ans-${q.question_number}`}
                                  checked={isCorrect}
                                  onChange={() => handleUpdateQuestion(q.question_number, "answer", opt)}
                                  className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                                />
                                <input
                                  type="text"
                                  value={opt}
                                  onChange={(e) => handleUpdateOption(q.question_number, oIdx, e.target.value)}
                                  className="w-full bg-transparent text-xs font-semibold text-slate-800 focus:outline-none"
                                />
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Model Answer & Explanation */}
                    <div className="mt-3.5 pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-emerald-700 mb-1">
                          Model Solution
                        </label>
                        <textarea
                          rows={2}
                          value={q.answer || ""}
                          onChange={(e) => handleUpdateQuestion(q.question_number, "answer", e.target.value)}
                          placeholder="Standard complete solution..."
                          className="w-full bg-emerald-50/40 border border-emerald-200 rounded-xl p-2.5 text-xs text-slate-900 focus:bg-white transition"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                          Marking Scheme / Rubric
                        </label>
                        <textarea
                          rows={2}
                          value={q.explanation || ""}
                          onChange={(e) => handleUpdateQuestion(q.question_number, "explanation", e.target.value)}
                          placeholder="Mark breakdown (e.g. 1 mark for formula + 2 marks for answer)..."
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:bg-white transition"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Add Controls */}
            <div className="flex items-center justify-center gap-2 pt-3 flex-wrap">
              <button
                onClick={() => handleAddQuestion("mcq")}
                className="px-3.5 py-2 rounded-xl bg-blue-50 border border-blue-200 hover:bg-blue-100 text-blue-900 text-xs font-bold transition flex items-center gap-1 shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" /> Add MCQ
              </button>
              <button
                onClick={() => handleAddQuestion("short")}
                className="px-3.5 py-2 rounded-xl bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 text-emerald-900 text-xs font-bold transition flex items-center gap-1 shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" /> Add Short Answer
              </button>
              <button
                onClick={() => handleAddQuestion("long")}
                className="px-3.5 py-2 rounded-xl bg-purple-50 border border-purple-200 hover:bg-purple-100 text-purple-900 text-xs font-bold transition flex items-center gap-1 shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" /> Add Long Answer
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ====================================================================
         3. FULL PAPER POP-UP PREVIEW MODAL (LIKE QUESTION GENERATOR)
         ==================================================================== */}
      {showPreviewModal && assignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-sm p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-4xl w-full h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-150">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
                  <Eye className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black truncate max-w-xs sm:max-w-md">{assignment.title}</h3>
                  <p className="text-[11px] text-slate-300">
                    {assignment.class_name} • {assignment.subject} • {assignment.questions.length} Questions ({assignment.total_marks} Marks)
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setShowPreviewModal(false);
                    setIsPdfModalOpen(true);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition flex items-center gap-1"
                >
                  <Download className="w-3.5 h-3.5" /> Download
                </button>
                <button
                  onClick={() => setShowPreviewModal(false)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* View Mode Switcher */}
            <div className="px-4 py-2.5 bg-slate-100 border-b border-slate-200 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setPreviewTab("worksheet")}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                    previewTab === "worksheet"
                      ? "bg-white text-indigo-700 shadow-xs border border-slate-200"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Student Worksheet View
                </button>
                <button
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

              <span className="text-[11px] font-semibold text-slate-500 hidden sm:inline">
                Due: {assignment.due_date || "Open"}
              </span>
            </div>

            {/* Scrollable Printable Paper Body */}
            <div className="flex-1 p-4 sm:p-8 overflow-y-auto space-y-6 bg-slate-50 font-sans">
              {/* Paper Top Branding */}
              <div className="text-center pb-4 border-b-2 border-slate-800 space-y-1">
                <h2 className="text-lg sm:text-xl font-black text-slate-900 uppercase tracking-wide">
                  {assignment.school_name || "DEVGYA GLOBAL ACADEMY"}
                </h2>
                <p className="text-xs sm:text-sm font-bold text-indigo-800 uppercase">
                  {assignment.title}
                </p>
                <div className="flex justify-center gap-4 text-xs font-semibold text-slate-600 pt-1">
                  <span>Class: <b>{assignment.class_name}</b></span>
                  <span>Subject: <b>{assignment.subject}</b></span>
                  <span>Max Marks: <b>{assignment.total_marks}</b></span>
                </div>
              </div>

              {/* Student Header Bar */}
              {previewTab === "worksheet" && (
                <div className="p-3.5 bg-white border border-slate-300 rounded-2xl text-xs text-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div><b>Student Name:</b> ______________________________</div>
                  <div><b>Roll No:</b> __________________</div>
                  <div><b>Section / Group:</b> ___________________________</div>
                  <div><b>Marks Obtained:</b> _______ / {assignment.total_marks}</div>
                </div>
              )}

              {/* Questions List */}
              <div className="space-y-6">
                {assignment.questions.map((q) => (
                  <div key={q.question_number} className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="text-xs sm:text-sm font-bold text-slate-900 flex-1 leading-relaxed">
                        <span className="text-indigo-600 font-black mr-1.5">Q{q.question_number}.</span>
                        <Markdown content={q.question_text} />
                      </div>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 shrink-0">
                        [{q.marks} {q.marks === 1 ? "Mark" : "Marks"}]
                      </span>
                    </div>

                    {/* MCQ Options */}
                    {q.options && q.options.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                        {q.options.map((opt, oIdx) => (
                          <div key={oIdx} className="text-xs font-semibold text-slate-700 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                            <Markdown content={opt} />
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Student Worksheet View: Ruled Lines / Box Simulation */}
                    {previewTab === "worksheet" ? (
                      q.question_type !== "mcq" ? (
                        <div className="pt-2 space-y-2">
                          {Array.from({ length: Math.min(6, q.lines_allocated || 4) }).map((_, lIdx) => (
                            <div key={lIdx} className="h-4 border-b border-dashed border-blue-300 w-full" />
                          ))}
                        </div>
                      ) : (
                        <div className="text-[11px] font-bold text-slate-500 pt-1">
                          Selected Option: [ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ]
                        </div>
                      )
                    ) : (
                      /* Teacher Solution Key View */
                      <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs space-y-1">
                        <div className="font-bold text-emerald-900">
                          <b>Correct Answer:</b> <Markdown content={q.answer || "N/A"} />
                        </div>
                        {q.explanation && (
                          <div className="text-[11px] text-emerald-800 italic pt-0.5">
                            <b>Rubric & Explanation:</b> <Markdown content={q.explanation} />
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
         4. INTERACTIVE PDF CUSTOMIZER MODAL ("DOWNLOAD CONFIGURATOR")
         ==================================================================== */}
      {isPdfModalOpen && assignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full p-5 sm:p-8 shadow-2xl space-y-5 my-6 animate-in fade-in zoom-in duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900">Customize PDF Layout</h3>
                  <p className="text-[11px] text-slate-500">Configure student writing spaces and page styling.</p>
                </div>
              </div>
              <button
                onClick={() => setIsPdfModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Customization Options */}
            <div className="space-y-4 text-xs text-slate-800">
              {/* Option 1: Student Answer Area Mode */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Student Response Space Style
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setPdfConfig({ ...pdfConfig, answer_space_mode: "ruled_lines" })}
                    className={`p-3 rounded-2xl border text-left transition ${
                      pdfConfig.answer_space_mode === "ruled_lines"
                        ? "bg-indigo-50 border-indigo-600 ring-2 ring-indigo-500/20 text-indigo-950 font-bold"
                        : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="font-black text-xs">✍️ Ruled Lines</span>
                      {pdfConfig.answer_space_mode === "ruled_lines" && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                    </div>
                    <p className="text-[10px] text-slate-500 font-normal">Ruled writing lines for students to answer directly.</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPdfConfig({ ...pdfConfig, answer_space_mode: "response_box" })}
                    className={`p-3 rounded-2xl border text-left transition ${
                      pdfConfig.answer_space_mode === "response_box"
                        ? "bg-indigo-50 border-indigo-600 ring-2 ring-indigo-500/20 text-indigo-950 font-bold"
                        : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="font-black text-xs">📦 Response Box</span>
                      {pdfConfig.answer_space_mode === "response_box" && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                    </div>
                    <p className="text-[10px] text-slate-500 font-normal">Framed boxes for written solutions & diagrams.</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPdfConfig({ ...pdfConfig, answer_space_mode: "none" })}
                    className={`p-3 rounded-2xl border text-left transition ${
                      pdfConfig.answer_space_mode === "none"
                        ? "bg-indigo-50 border-indigo-600 ring-2 ring-indigo-500/20 text-indigo-950 font-bold"
                        : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="font-black text-xs">📄 Question Sheet</span>
                      {pdfConfig.answer_space_mode === "none" && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                    </div>
                    <p className="text-[10px] text-slate-500 font-normal">Compact question paper without blank spaces.</p>
                  </button>
                </div>
              </div>

              {/* Option 2: Fine-Tuning Answer Lines & Box Size */}
              {pdfConfig.answer_space_mode === "ruled_lines" && (
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                      Line Stroke Style
                    </label>
                    <select
                      value={pdfConfig.line_style}
                      onChange={(e) => setPdfConfig({ ...pdfConfig, line_style: e.target.value as any })}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-semibold"
                    >
                      <option value="solid">Solid Crisp Lines</option>
                      <option value="dotted">Dotted Writing Lines</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                      Default Lines for Short Qs
                    </label>
                    <input
                      type="number"
                      min="2"
                      max="10"
                      value={pdfConfig.default_short_lines}
                      onChange={(e) =>
                        setPdfConfig({ ...pdfConfig, default_short_lines: parseInt(e.target.value) || 4 })
                      }
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-semibold"
                    />
                  </div>
                </div>
              )}

              {/* Option 3: Student Details Header */}
              <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
                <div>
                  <h4 className="font-bold text-xs text-slate-900">Include Student Details Header Box</h4>
                  <p className="text-[10px] text-slate-500">Name, Roll No, Section, and Marks blanks at top.</p>
                </div>
                <input
                  type="checkbox"
                  checked={pdfConfig.include_student_header}
                  onChange={(e) => setPdfConfig({ ...pdfConfig, include_student_header: e.target.checked })}
                  className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500 cursor-pointer"
                />
              </div>

              {/* Option 4: Color Theme & Font Sizing */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Theme
                  </label>
                  <select
                    value={pdfConfig.theme_name}
                    onChange={(e) => setPdfConfig({ ...pdfConfig, theme_name: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold"
                  >
                    <option value="cbse">CBSE Classic Navy & Blue</option>
                    <option value="modern">Modern Indigo & Cyan</option>
                    <option value="minimalist">Minimalist Slate</option>
                    <option value="emerald">Forest Emerald</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Font Sizing
                  </label>
                  <select
                    value={pdfConfig.font_size_mode}
                    onChange={(e) => setPdfConfig({ ...pdfConfig, font_size_mode: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold"
                  >
                    <option value="standard">Standard</option>
                    <option value="compact">Compact (Paper Saver)</option>
                    <option value="large">Large (Dyslexia Friendly)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => handleDownloadPDF(true)}
                disabled={pdfDownloading}
                className="w-full sm:w-auto px-3.5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold transition flex items-center justify-center gap-1.5"
              >
                <Award className="w-3.5 h-3.5 text-amber-600" />
                <span>Teacher Key PDF</span>
              </button>

              <button
                type="button"
                onClick={() => handleDownloadPDF(false)}
                disabled={pdfDownloading}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white text-xs font-black shadow-lg shadow-indigo-600/20 transition flex items-center justify-center gap-2"
              >
                {pdfDownloading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Rendering PDF...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Download Worksheet PDF</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
