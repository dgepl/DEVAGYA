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
  X
} from "lucide-react";

export default function AssignmentMakerPage() {
  // --- Form & Generator State ---
  const [className, setClassName] = useState("Class 10");
  const [subject, setSubject] = useState("Mathematics");
  const [chapterTopic, setChapterTopic] = useState("Quadratic Equations & Polynomials");
  const [title, setTitle] = useState("Classroom Assignment 1");
  const [difficulty, setDifficulty] = useState("medium");
  const [mcqCount, setMcqCount] = useState(5);
  const [shortCount, setShortCount] = useState(3);
  const [longCount, setLongCount] = useState(2);
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

    if (mcqCount + shortCount + longCount + fillBlanksCount <= 0) {
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
      if (res && res.assignment) {
        setAssignment(res.assignment);
        setSuccessMsg("✨ 100% Original AI Assignment generated successfully!");
      } else {
        throw new Error("No assignment data returned by AI.");
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
    // Recalculate total marks
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
    // Renumber questions
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
      question_text: "New customized question stem...",
      options: type === "mcq" ? ["(A) Option 1", "(B) Option 2", "(C) Option 3", "(D) Option 4"] : null,
      answer: type === "mcq" ? "(A) Option 1" : "Model solution here...",
      explanation: "Evaluation rubric and marking scheme.",
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
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white border-b border-indigo-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  <Sparkles className="w-3.5 h-3.5" /> 100% Original AI Synthesizer
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-200 border border-blue-400/30">
                  CBSE / NCERT Mapped
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight mt-2 flex items-center gap-2">
                <Edit3 className="w-7 h-7 text-amber-400" />
                AI Assignment & Worksheet Studio
              </h1>
              <p className="text-sm text-slate-300 mt-1 max-w-2xl">
                Generate authentic, syllabus-accurate homework, assignments, and test worksheets with exact question breakdowns, custom answer lines, and printable layout styling.
              </p>
            </div>

            {assignment && (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setAssignment(null)}
                  className="px-4 py-2 text-sm font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition flex items-center gap-1.5 shadow-sm"
                >
                  <RotateCcw className="w-4 h-4" /> Create New
                </button>
                <button
                  onClick={() => setIsPdfModalOpen(true)}
                  className="px-5 py-2.5 text-sm font-bold rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 transition flex items-center gap-2 shadow-lg shadow-amber-500/20"
                >
                  <Download className="w-4 h-4" /> Download Assignment PDF
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
        {error && (
          <div className="mb-4 p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 flex items-start gap-3 shadow-sm">
            <AlertCircle className="w-5 h-5 text-rose-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="font-bold text-sm">Action Notice</h4>
              <p className="text-xs text-rose-700 mt-0.5">{error}</p>
            </div>
            <button onClick={() => setError(null)} className="text-rose-400 hover:text-rose-600">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        {successMsg && (
          <div className="mb-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <p className="text-sm font-semibold">{successMsg}</p>
            </div>
            <button onClick={() => setSuccessMsg(null)} className="text-emerald-500 hover:text-emerald-700">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* MAIN CONTAINER */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {!assignment ? (
          /* ====================================================================
             1. PRE-GENERATION CONFIGURATION FORM
             ==================================================================== */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
                <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-100">
                  <Sliders className="w-5 h-5 text-indigo-600" />
                  <h2 className="text-lg font-black text-slate-900">Assignment Parameters & Topic Details</h2>
                </div>

                <form onSubmit={handleGenerate} className="space-y-6">
                  {/* Class & Subject */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                        Target Class
                      </label>
                      <select
                        value={className}
                        onChange={(e) => setClassName(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
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
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                        Subject
                      </label>
                      <select
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
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
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                      Chapter, Topic or Learning Objectives <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={chapterTopic}
                      onChange={(e) => setChapterTopic(e.target.value)}
                      placeholder="e.g. Electricity, Ohm's Law & Circuit Numericals"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                      required
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      Our AI will ground all generated questions strictly into this topic's official CBSE/NCERT curriculum.
                    </p>
                  </div>

                  {/* Assignment Title & Due Date */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                        Assignment Title
                      </label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g. Unit 3 Homework Assignment"
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                        Submission Due Date
                      </label>
                      <input
                        type="date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                      />
                    </div>
                  </div>

                  {/* QUESTION DISTRIBUTION COUNTERS */}
                  <div className="pt-2">
                    <div className="flex items-center justify-between mb-3">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                        <Hash className="w-4 h-4 text-indigo-600" />
                        Exact Question Breakdown Required
                      </label>
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                        Total Qs: {mcqCount + shortCount + longCount + fillBlanksCount} | Total Marks: {estimatedMarks}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {/* MCQs */}
                      <div className="p-4 bg-blue-50/50 border border-blue-200 rounded-xl">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-blue-900">MCQs (1 Mark)</span>
                          <span className="text-[11px] font-semibold text-blue-600">Section A</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setMcqCount(Math.max(0, mcqCount - 1))}
                            className="w-8 h-8 rounded-lg bg-white border border-blue-200 hover:bg-blue-100 font-bold text-blue-900 transition flex items-center justify-center"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            min="0"
                            max="30"
                            value={mcqCount}
                            onChange={(e) => setMcqCount(Math.max(0, parseInt(e.target.value) || 0))}
                            className="w-full text-center bg-white border border-blue-200 rounded-lg py-1 font-bold text-blue-950"
                          />
                          <button
                            type="button"
                            onClick={() => setMcqCount(mcqCount + 1)}
                            className="w-8 h-8 rounded-lg bg-white border border-blue-200 hover:bg-blue-100 font-bold text-blue-900 transition flex items-center justify-center"
                          >
                            +
                          </button>
                        </div>
                        <p className="text-[11px] text-blue-700 mt-2">4 options per question</p>
                      </div>

                      {/* Short Answer */}
                      <div className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-xl">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-emerald-900">Short Answer (3 Marks)</span>
                          <span className="text-[11px] font-semibold text-emerald-600">Section B</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setShortCount(Math.max(0, shortCount - 1))}
                            className="w-8 h-8 rounded-lg bg-white border border-emerald-200 hover:bg-emerald-100 font-bold text-emerald-900 transition flex items-center justify-center"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            min="0"
                            max="20"
                            value={shortCount}
                            onChange={(e) => setShortCount(Math.max(0, parseInt(e.target.value) || 0))}
                            className="w-full text-center bg-white border border-emerald-200 rounded-lg py-1 font-bold text-emerald-950"
                          />
                          <button
                            type="button"
                            onClick={() => setShortCount(shortCount + 1)}
                            className="w-8 h-8 rounded-lg bg-white border border-emerald-200 hover:bg-emerald-100 font-bold text-emerald-900 transition flex items-center justify-center"
                          >
                            +
                          </button>
                        </div>
                        <p className="text-[11px] text-emerald-700 mt-2">3–4 writing lines</p>
                      </div>

                      {/* Long Answer */}
                      <div className="p-4 bg-purple-50/50 border border-purple-200 rounded-xl">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-purple-900">Long / HOTS (5 Marks)</span>
                          <span className="text-[11px] font-semibold text-purple-600">Section C</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setLongCount(Math.max(0, longCount - 1))}
                            className="w-8 h-8 rounded-lg bg-white border border-purple-200 hover:bg-purple-100 font-bold text-purple-900 transition flex items-center justify-center"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            min="0"
                            max="10"
                            value={longCount}
                            onChange={(e) => setLongCount(Math.max(0, parseInt(e.target.value) || 0))}
                            className="w-full text-center bg-white border border-purple-200 rounded-lg py-1 font-bold text-purple-950"
                          />
                          <button
                            type="button"
                            onClick={() => setLongCount(longCount + 1)}
                            className="w-8 h-8 rounded-lg bg-white border border-purple-200 hover:bg-purple-100 font-bold text-purple-900 transition flex items-center justify-center"
                          >
                            +
                          </button>
                        </div>
                        <p className="text-[11px] text-purple-700 mt-2">7–8 writing lines</p>
                      </div>
                    </div>
                  </div>

                  {/* Difficulty & School Branding */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                        Difficulty & Cognitive Level
                      </label>
                      <select
                        value={difficulty}
                        onChange={(e) => setDifficulty(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                      >
                        <option value="easy">Foundational (Direct Recall & Definitions)</option>
                        <option value="medium">Standard (Application & Numericals)</option>
                        <option value="hard">Advanced (Multi-step Problem Solving)</option>
                        <option value="hots">HOTS (Critical Thinking & Case Study)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                        School / Institute Name
                      </label>
                      <input
                        type="text"
                        value={schoolName}
                        onChange={(e) => setSchoolName(e.target.value)}
                        placeholder="e.g. DEVGYA GLOBAL ACADEMY"
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                      />
                    </div>
                  </div>

                  {/* Optional Custom Notes / Teacher Focus */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                      Optional Teacher Notes or Focus Areas (Paste excerpt / formulas)
                    </label>
                    <textarea
                      rows={3}
                      value={customNotes}
                      onChange={(e) => setCustomNotes(e.target.value)}
                      placeholder="e.g. Focus on word problems involving speed/distance and discriminant tests."
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                    />
                  </div>

                  {/* SUBMIT BUTTON */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-black text-base shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                      {loading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Synthesizing 100% Original AI Questions...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5 text-amber-300" />
                          <span>Generate 100% Original AI Assignment</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Sidebar Guide & Live Blueprint */}
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-2xl p-6 border border-indigo-800 shadow-md">
                <h3 className="text-base font-black text-amber-400 flex items-center gap-2 mb-3">
                  <Award className="w-5 h-5" />
                  What Makes DEVGYA Assignments Special?
                </h3>
                <ul className="space-y-3 text-xs text-slate-300 leading-relaxed">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <span><b>Zero Mock / Zero Templates:</b> Every single question is generated in real time directly from CBSE/NCERT curriculum benchmarks.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <span><b>Calculus & Math Notation:</b> Native LaTeX formatting for fractions, powers, roots, vectors, and chemical equations.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <span><b>Configurable Answer Lines:</b> Choose ruled lines or response boxes so students can fill answers directly on the printed sheet.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <span><b>Teacher Key & Rubrics:</b> Export a companion PDF with complete step-by-step marking schemes.</span>
                  </li>
                </ul>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Assignment Summary</h4>
                <div className="space-y-2.5 text-xs text-slate-700">
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">Selected Subject:</span>
                    <span className="font-bold text-slate-900">{subject}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">Class & Grade:</span>
                    <span className="font-bold text-slate-900">{className}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">Total Questions:</span>
                    <span className="font-bold text-slate-900">{mcqCount + shortCount + longCount + fillBlanksCount} Qs</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">Total Marks:</span>
                    <span className="font-black text-indigo-700 text-sm">{estimatedMarks} Marks</span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-slate-500">Estimated Pages:</span>
                    <span className="font-bold text-slate-900">
                      {Math.max(1, Math.ceil((mcqCount * 0.2 + shortCount * 0.4 + longCount * 0.7)))} Pages
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* ====================================================================
             2. INTERACTIVE ASSIGNMENT WORKSPACE & QUESTION EDITOR
             ==================================================================== */
          <div className="space-y-6">
            {/* Top Workspace Header Bar */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
                    {assignment.class_name}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
                    {assignment.subject}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200">
                    {assignment.questions.length} Questions
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
                    Max Marks: {assignment.total_marks}
                  </span>
                </div>
                <input
                  type="text"
                  value={assignment.title}
                  onChange={(e) => setAssignment({ ...assignment, title: e.target.value })}
                  className="text-lg sm:text-xl font-black text-slate-900 bg-transparent border-b border-dashed border-slate-300 hover:border-indigo-500 focus:border-indigo-600 focus:outline-none w-full max-w-xl transition"
                />
              </div>

              <div className="flex items-center gap-2.5 flex-wrap">
                <button
                  onClick={() => handleAddQuestion("short")}
                  className="px-3.5 py-2 text-xs font-bold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 transition flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5 text-indigo-600" /> Add Question
                </button>
                <button
                  onClick={() => setIsPdfModalOpen(true)}
                  className="px-5 py-2 text-xs font-black rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white transition flex items-center gap-2 shadow-md shadow-indigo-600/20"
                >
                  <Download className="w-4 h-4" /> Download PDF Configurator
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
                    className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm hover:shadow-md transition"
                  >
                    {/* Question Card Header */}
                    <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-7 h-7 rounded-lg bg-indigo-600 text-white font-black text-xs flex items-center justify-center">
                          Q{q.question_number}
                        </span>
                        <input
                          type="text"
                          value={q.section}
                          onChange={(e) => handleUpdateQuestion(q.question_number, "section", e.target.value)}
                          className="text-xs font-bold text-indigo-800 bg-indigo-50/50 px-2 py-1 rounded-md border border-indigo-100"
                        />
                        <span className="text-[11px] font-bold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                          {q.question_type}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 text-xs">
                          <label className="font-bold text-slate-600">Marks:</label>
                          <input
                            type="number"
                            min="1"
                            max="20"
                            value={q.marks}
                            onChange={(e) => handleUpdateQuestion(q.question_number, "marks", parseInt(e.target.value) || 1)}
                            className="w-14 text-center font-bold bg-slate-50 border border-slate-300 rounded-lg py-0.5 text-xs text-slate-900"
                          />
                        </div>

                        {q.question_type !== "mcq" && (
                          <div className="flex items-center gap-1.5 text-xs">
                            <label className="font-bold text-slate-600">Answer Lines:</label>
                            <input
                              type="number"
                              min="1"
                              max="25"
                              value={q.lines_allocated || 4}
                              onChange={(e) =>
                                handleUpdateQuestion(q.question_number, "lines_allocated", parseInt(e.target.value) || 4)
                              }
                              className="w-14 text-center font-bold bg-slate-50 border border-slate-300 rounded-lg py-0.5 text-xs text-slate-900"
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
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                        Question Stem (Supports LaTeX $...$ & $$...$$)
                      </label>
                      <textarea
                        rows={2}
                        value={q.question_text}
                        onChange={(e) => handleUpdateQuestion(q.question_number, "question_text", e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                      />

                      {/* Live Math Preview Box */}
                      {isMathPreview && q.question_text && (
                        <div className="p-3 bg-slate-900 text-white rounded-xl text-xs border border-slate-800">
                          <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block mb-1">
                            Live Formula & Math Preview:
                          </span>
                          <Markdown content={q.question_text} />
                        </div>
                      )}
                    </div>

                    {/* MCQ Options (If MCQ) */}
                    {q.question_type === "mcq" && q.options && (
                      <div className="mt-4 pt-3 border-t border-slate-100">
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                          Options & Correct Answer Selection
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
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

                    {/* Model Answer & Explanation (For Teacher Key) */}
                    <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-emerald-700 mb-1">
                          Model Solution / Correct Answer
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
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                          Marking Scheme & Rubric
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

            {/* Bottom Floating Add Controls */}
            <div className="flex items-center justify-center gap-3 pt-4">
              <button
                onClick={() => handleAddQuestion("mcq")}
                className="px-4 py-2.5 rounded-xl bg-blue-50 border border-blue-200 hover:bg-blue-100 text-blue-900 text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" /> Add MCQ
              </button>
              <button
                onClick={() => handleAddQuestion("short")}
                className="px-4 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 text-emerald-900 text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" /> Add Short Answer
              </button>
              <button
                onClick={() => handleAddQuestion("long")}
                className="px-4 py-2.5 rounded-xl bg-purple-50 border border-purple-200 hover:bg-purple-100 text-purple-900 text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" /> Add Long Answer / Case Study
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ====================================================================
         3. INTERACTIVE PDF CUSTOMIZER MODAL ("ASK EACH AND EVERYTHING")
         ==================================================================== */}
      {isPdfModalOpen && assignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 my-8 animate-in fade-in zoom-in duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">Customize PDF Layout & Appearance</h3>
                  <p className="text-xs text-slate-500">Configure how student writing spaces and page styling appear in the downloaded PDF.</p>
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
            <div className="space-y-5 text-xs text-slate-800">
              {/* Option 1: Student Answer Area Mode */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Student Response Space Style
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setPdfConfig({ ...pdfConfig, answer_space_mode: "ruled_lines" })}
                    className={`p-3.5 rounded-2xl border text-left transition ${
                      pdfConfig.answer_space_mode === "ruled_lines"
                        ? "bg-indigo-50 border-indigo-600 ring-2 ring-indigo-500/20 text-indigo-950 font-bold"
                        : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-black text-xs">✍️ Ruled Lines</span>
                      {pdfConfig.answer_space_mode === "ruled_lines" && <Check className="w-4 h-4 text-indigo-600" />}
                    </div>
                    <p className="text-[11px] text-slate-500 font-normal">Draws ruled handwriting lines after each question for direct answering.</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPdfConfig({ ...pdfConfig, answer_space_mode: "response_box" })}
                    className={`p-3.5 rounded-2xl border text-left transition ${
                      pdfConfig.answer_space_mode === "response_box"
                        ? "bg-indigo-50 border-indigo-600 ring-2 ring-indigo-500/20 text-indigo-950 font-bold"
                        : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-black text-xs">📦 Response Box</span>
                      {pdfConfig.answer_space_mode === "response_box" && <Check className="w-4 h-4 text-indigo-600" />}
                    </div>
                    <p className="text-[11px] text-slate-500 font-normal">Renders framed response boxes for student writing & diagrams.</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPdfConfig({ ...pdfConfig, answer_space_mode: "none" })}
                    className={`p-3.5 rounded-2xl border text-left transition ${
                      pdfConfig.answer_space_mode === "none"
                        ? "bg-indigo-50 border-indigo-600 ring-2 ring-indigo-500/20 text-indigo-950 font-bold"
                        : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-black text-xs">📄 Question Sheet</span>
                      {pdfConfig.answer_space_mode === "none" && <Check className="w-4 h-4 text-indigo-600" />}
                    </div>
                    <p className="text-[11px] text-slate-500 font-normal">Compact question paper with zero blank answer spaces (saves paper).</p>
                  </button>
                </div>
              </div>

              {/* Option 2: Fine-Tuning Answer Lines & Box Size */}
              {pdfConfig.answer_space_mode === "ruled_lines" && (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                      Line Stroke Style
                    </label>
                    <select
                      value={pdfConfig.line_style}
                      onChange={(e) => setPdfConfig({ ...pdfConfig, line_style: e.target.value as any })}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold"
                    >
                      <option value="solid">Solid Crisp Lines</option>
                      <option value="dotted">Dotted Writing Lines</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                      Default Lines for Short Questions
                    </label>
                    <input
                      type="number"
                      min="2"
                      max="10"
                      value={pdfConfig.default_short_lines}
                      onChange={(e) =>
                        setPdfConfig({ ...pdfConfig, default_short_lines: parseInt(e.target.value) || 4 })
                      }
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold"
                    />
                  </div>
                </div>
              )}

              {pdfConfig.answer_space_mode === "response_box" && (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                      Response Box Height
                    </label>
                    <span className="font-bold text-indigo-600">{pdfConfig.box_height_mm} mm</span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="60"
                    step="5"
                    value={pdfConfig.box_height_mm}
                    onChange={(e) => setPdfConfig({ ...pdfConfig, box_height_mm: parseInt(e.target.value) || 35 })}
                    className="w-full accent-indigo-600"
                  />
                </div>
              )}

              {/* Option 3: Student Details Header */}
              <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                <div>
                  <h4 className="font-bold text-xs text-slate-900">Include Student Submission Details Box</h4>
                  <p className="text-[11px] text-slate-500">Adds Student Name, Roll No, Section, and Marks blanks at top.</p>
                </div>
                <input
                  type="checkbox"
                  checked={pdfConfig.include_student_header}
                  onChange={(e) => setPdfConfig({ ...pdfConfig, include_student_header: e.target.checked })}
                  className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500 cursor-pointer"
                />
              </div>

              {/* Option 4: Color Theme & Font Sizing */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Academic Color Theme
                  </label>
                  <select
                    value={pdfConfig.theme_name}
                    onChange={(e) => setPdfConfig({ ...pdfConfig, theme_name: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold"
                  >
                    <option value="cbse">CBSE Classic Navy & Blue</option>
                    <option value="modern">Modern Indigo & Cyan</option>
                    <option value="minimalist">Minimalist Charcoal & Slate</option>
                    <option value="emerald">Forest Emerald</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Font Sizing & Spacing
                  </label>
                  <select
                    value={pdfConfig.font_size_mode}
                    onChange={(e) => setPdfConfig({ ...pdfConfig, font_size_mode: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold"
                  >
                    <option value="standard">Standard (Recommended)</option>
                    <option value="compact">Compact (Saves Paper & Lines)</option>
                    <option value="large">Large (Dyslexia & Primary Friendly)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => handleDownloadPDF(true)}
                disabled={pdfDownloading}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold transition flex items-center justify-center gap-1.5"
              >
                <Award className="w-3.5 h-3.5 text-amber-600" />
                <span>Download Teacher Key & Rubric PDF</span>
              </button>

              <button
                type="button"
                onClick={() => handleDownloadPDF(false)}
                disabled={pdfDownloading}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white text-xs font-black shadow-lg shadow-indigo-600/20 transition flex items-center justify-center gap-2"
              >
                {pdfDownloading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Rendering PDF...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Download Student Worksheet PDF</span>
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
