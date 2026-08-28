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
import { useAppStore } from "@/store/useAppStore";
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
  Hash,
  Archive,
  Calendar
} from "lucide-react";

import { CBSE_NCERT_CURRICULUM } from "@/lib/cbseNcertCurriculum";

export default function AssignmentMakerPage() {
  const {
    user,
    savedAssignments,
    saveAssignment,
    deleteSavedAssignment,
    fetchSavedAssignments,
    activeAssignment,
    setActiveAssignment
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<"studio" | "archive">("studio");

  useEffect(() => {
    if (user?.email) {
      fetchSavedAssignments(user.email);
    }
  }, [user?.email, fetchSavedAssignments]);

  // --- Form & Generator State ---
  const [className, setClassName] = useState("Class 10");
  const [subject, setSubject] = useState("Science");
  const [chapterTopic, setChapterTopic] = useState("Chapter 1: Chemical Reactions and Equations");
  const [customSubTopic, setCustomSubTopic] = useState("");
  const [title, setTitle] = useState("");
  const [difficulty, setDifficulty] = useState("medium");
  const [mcqCount, setMcqCount] = useState(4);
  const [shortCount, setShortCount] = useState(2);
  const [longCount, setLongCount] = useState(1);
  const [fillBlanksCount, setFillBlanksCount] = useState(0);
  const [dueDate, setDueDate] = useState("");
  const [schoolName, setSchoolName] = useState("DEVGYA GLOBAL ACADEMY");

  // Dynamic NCERT Curriculum Lookups
  const availableClasses = Object.keys(CBSE_NCERT_CURRICULUM);
  const availableSubjects = Object.keys(CBSE_NCERT_CURRICULUM[className]?.subjects || {});
  const availableChapters = CBSE_NCERT_CURRICULUM[className]?.subjects?.[subject] || [];

  // Handle Class Change -> Auto-select first valid Subject & Chapter
  const handleClassChange = (newClass: string) => {
    setClassName(newClass);
    const subjs = Object.keys(CBSE_NCERT_CURRICULUM[newClass]?.subjects || {});
    const nextSubj = subjs.includes(subject) ? subject : subjs[0] || "Mathematics";
    setSubject(nextSubj);
    const chaps = CBSE_NCERT_CURRICULUM[newClass]?.subjects?.[nextSubj] || [];
    setChapterTopic(chaps[0] || "Chapter 1: Core Fundamentals");
  };

  // Handle Subject Change -> Auto-select first valid Chapter
  const handleSubjectChange = (newSubj: string) => {
    setSubject(newSubj);
    const chaps = CBSE_NCERT_CURRICULUM[className]?.subjects?.[newSubj] || [];
    setChapterTopic(chaps[0] || "Chapter 1: Core Fundamentals");
  };

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

  // Calculate dynamic total marks (1M MCQ, 3M Short, 5M Long)
  const estimatedMarks = mcqCount * 1 + shortCount * 3 + longCount * 5;

  // Initialize due date to 7 days from now
  useEffect(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    setDueDate(d.toISOString().split("T")[0]);
  }, []);

  // Fetch saved assignments from server on mount
  useEffect(() => {
    if (user?.email) {
      fetchSavedAssignments(user.email);
    }
  }, [user?.email, fetchSavedAssignments]);

  // Sync active assignment from store if present
  useEffect(() => {
    if (activeAssignment && !assignment) {
      setAssignment(activeAssignment);
    }
  }, [activeAssignment]);

  // --- Handle AI Assignment Generation ---
  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const totalCount = mcqCount + shortCount + longCount;
    if (totalCount <= 0) {
      setError("Please select at least 1 question to generate.");
      return;
    }

    const finalTopic = customSubTopic.trim()
      ? `${chapterTopic.trim()} (Focus Area: ${customSubTopic.trim()})`
      : chapterTopic.trim();

    setLoading(true);
    try {
      const payload: GenerateAssignmentPayload = {
        class_name: className,
        subject,
        chapter_topic: finalTopic,
        title: title.trim() || `${subject} Assignment: ${chapterTopic.trim()}`,
        difficulty,
        mcq_count: mcqCount,
        short_count: shortCount,
        long_count: longCount,
        fill_blanks_count: 0,
        due_date: dueDate,
        school_name: schoolName.trim() || "DEVGYA GLOBAL ACADEMY",
        user_email: user?.email || undefined
      };

      const res = await generateAIAssignment(payload);
      if (res && res.assignment && res.assignment.questions?.length > 0) {
        setAssignment(res.assignment);
        setActiveAssignment(res.assignment);
        saveAssignment(res.assignment);
        setSuccessMsg(`✨ Successfully generated and archived all ${res.assignment.questions.length} questions!`);
      } else {
        throw new Error("No assignment questions returned by AI. Please try again.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to generate AI assignment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCurrentAssignment = () => {
    if (!assignment) return;
    saveAssignment(assignment);
    setActiveAssignment(assignment);
    setSuccessMsg("💾 Assignment saved to your archive!");
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const handleDownloadSavedAssignmentPDF = async (targetAssignment: AssignmentData, isTeacherKey: boolean) => {
    try {
      const blob = await downloadAssignmentPDF(targetAssignment, pdfConfig, isTeacherKey);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const typeStr = isTeacherKey ? "Teacher_Key" : "Worksheet";
      a.download = `${targetAssignment.subject}_${targetAssignment.class_name}_${typeStr}.pdf`.replace(/\s+/g, "_");
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      setSuccessMsg(`📄 PDF Downloaded successfully (${typeStr})!`);
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to download PDF.");
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
    <div className="w-full max-w-full overflow-x-hidden min-h-screen bg-slate-50 text-slate-900 pb-28">
      
      {/* 1. TOP HEADER WITH STUDIO & ARCHIVE TABS */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs w-full max-w-full overflow-x-hidden">
        <div className="max-w-5xl mx-auto px-3 sm:px-4 py-2.5 sm:py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Edit3 className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm sm:text-base font-black text-slate-900 truncate">
                {activeTab === "archive" ? "Saved Assignments Archive" : assignment ? assignment.title : "AI Assignment Maker"}
              </h1>
              <p className="text-[11px] text-slate-500 font-medium truncate">
                {activeTab === "archive" ? "View, manage & re-download previously generated assignments" : assignment ? `${assignment.class_name} • ${assignment.subject} • ${assignment.total_marks} Marks` : "CBSE / NCERT Worksheet & Ruled Lines Generator"}
              </p>
            </div>
          </div>

          {/* Top Tabs & Action Buttons (Wrap gracefully on mobile) */}
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
            <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 border border-slate-200 shrink-0">
              <button
                type="button"
                onClick={() => setActiveTab("studio")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === "studio"
                    ? "bg-white text-indigo-700 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Studio</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("archive")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === "archive"
                    ? "bg-white text-indigo-700 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Archive className="w-3.5 h-3.5" />
                <span>Archive</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                  activeTab === "archive" ? "bg-indigo-50 text-indigo-700" : "bg-slate-200 text-slate-700"
                }`}>
                  {savedAssignments.length}
                </span>
              </button>
            </div>

            {activeTab === "studio" && assignment && (
              <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={handleSaveCurrentAssignment}
                  className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                  title="Save changes to archive"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Save</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowPreviewModal(true)}
                  className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Preview</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsPdfModalOpen(true)}
                  className="px-3 sm:px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-xs font-black transition flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setAssignment(null);
                    setActiveAssignment(null);
                  }}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                  title="Create New Assignment"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
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
      {activeTab === "archive" ? (
        <main className="max-w-4xl mx-auto px-4 py-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Archive className="w-5 h-5 text-indigo-600" />
                Assignment Archive
              </h2>
              <p className="text-xs text-slate-500 font-medium">View, manage, and re-download generated worksheets and Teacher Answer Keys</p>
            </div>

            <button
              type="button"
              onClick={() => {
                setAssignment(null);
                setActiveAssignment(null);
                setActiveTab("studio");
              }}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/30 flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Generate New Assignment</span>
            </button>
          </div>

          {savedAssignments.length > 0 ? (
            <div className="space-y-3.5">
              {savedAssignments.map((asg, idx) => (
                <div 
                  key={asg.id || idx} 
                  className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition hover:shadow-sm"
                >
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200 px-2.5 py-0.5 rounded-lg">
                        {asg.class_name} • {asg.subject}
                      </span>
                      {asg.difficulty && (
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded-lg">
                          {asg.difficulty}
                        </span>
                      )}
                      {asg.due_date && (
                        <span className="text-[10px] text-slate-500 font-bold flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          Due: {asg.due_date}
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-extrabold text-slate-900 truncate">
                      {asg.title}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      {asg.chapter_topic} • {asg.questions?.length || 0} Questions • Total {asg.total_marks} Marks
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleDownloadSavedAssignmentPDF(asg, false)}
                      className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                      title="Download Student Worksheet PDF (with Ruled Lines)"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Worksheet PDF
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDownloadSavedAssignmentPDF(asg, true)}
                      className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                      title="Download Teacher Answer Key PDF"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Answer Key
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAssignment(asg);
                        setActiveAssignment(asg);
                        setActiveTab("studio");
                      }}
                      className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                      title="Open in Studio Workspace"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteSavedAssignment(idx)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 rounded-xl transition cursor-pointer"
                      title="Delete from archive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white p-12 sm:p-16 rounded-3xl border border-slate-200 text-center space-y-4 shadow-sm">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                <FileText className="w-7 h-7" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900">No Saved Assignments Found</h3>
              <p className="text-xs text-slate-500 font-medium max-w-md mx-auto">
                Once you generate assignments in the AI Maker Studio, they will be archived here permanently for instant downloading, sharing, and re-editing.
              </p>
              <button
                type="button"
                onClick={() => setActiveTab("studio")}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md inline-flex items-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Create Your First Assignment</span>
              </button>
            </div>
          )}
        </main>
      ) : (
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
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Select Class (CBSE/NCERT)
                  </label>
                  <select
                    value={className}
                    onChange={(e) => handleClassChange(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs sm:text-sm font-semibold focus:bg-white focus:ring-2 focus:ring-indigo-500 transition"
                  >
                    {availableClasses.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Select Subject (for {className})
                  </label>
                  <select
                    value={subject}
                    onChange={(e) => handleSubjectChange(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs sm:text-sm font-semibold focus:bg-white focus:ring-2 focus:ring-indigo-500 transition"
                  >
                    {availableSubjects.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Quick Subject Badge Pills for 1-Click Selection */}
              <div>
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  {availableSubjects.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => handleSubjectChange(s)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        subject === s
                          ? "bg-indigo-600 text-white shadow-xs"
                          : "bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* NCERT Official Chapter Selector */}
              <div className="space-y-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Select Chapter (According to CBSE / NCERT) <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={chapterTopic}
                    onChange={(e) => setChapterTopic(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs sm:text-sm font-medium focus:bg-white focus:ring-2 focus:ring-indigo-500 transition"
                  >
                    {availableChapters.map((ch) => (
                      <option key={ch} value={ch}>{ch}</option>
                    ))}
                  </select>
                </div>

                {/* Optional Custom Subtopic / Specific Focus */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">
                    Optional: Specific Subtopic / Custom Focus Area
                  </label>
                  <input
                    type="text"
                    value={customSubTopic}
                    onChange={(e) => setCustomSubTopic(e.target.value)}
                    placeholder="e.g. Focus on balancing chemical equations & precipitation reactions"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:bg-white focus:ring-2 focus:ring-indigo-500 transition"
                  />
                </div>
              </div>

              {/* Question Count Steppers (MCQ, Short, Long) */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1">
                    <Hash className="w-3.5 h-3.5 text-indigo-600" /> Question Breakdown
                  </label>
                  <span className="text-[11px] font-black text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-full">
                    Total: {mcqCount + shortCount + longCount} Questions ({estimatedMarks} Marks)
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* MCQs */}
                  <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-2xl text-center shadow-2xs">
                    <span className="text-[11px] font-black text-blue-900 block mb-2">Multiple Choice (1 Mark)</span>
                    <div className="flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => setMcqCount(Math.max(0, mcqCount - 1))}
                        className="w-8 h-8 rounded-xl bg-white border border-blue-200 font-black text-sm text-blue-900 cursor-pointer hover:bg-blue-100 active:scale-95 transition-all shadow-xs"
                      >
                        -
                      </button>
                      <span className="w-8 font-black text-sm text-blue-950">{mcqCount}</span>
                      <button
                        type="button"
                        onClick={() => setMcqCount(mcqCount + 1)}
                        className="w-8 h-8 rounded-xl bg-white border border-blue-200 font-black text-sm text-blue-900 cursor-pointer hover:bg-blue-100 active:scale-95 transition-all shadow-xs"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Short */}
                  <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-2xl text-center shadow-2xs">
                    <span className="text-[11px] font-black text-emerald-900 block mb-2">Short Answer (3 Marks)</span>
                    <div className="flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => setShortCount(Math.max(0, shortCount - 1))}
                        className="w-8 h-8 rounded-xl bg-white border border-emerald-200 font-black text-sm text-emerald-900 cursor-pointer hover:bg-emerald-100 active:scale-95 transition-all shadow-xs"
                      >
                        -
                      </button>
                      <span className="w-8 font-black text-sm text-emerald-950">{shortCount}</span>
                      <button
                        type="button"
                        onClick={() => setShortCount(shortCount + 1)}
                        className="w-8 h-8 rounded-xl bg-white border border-emerald-200 font-black text-sm text-emerald-900 cursor-pointer hover:bg-emerald-100 active:scale-95 transition-all shadow-xs"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Long */}
                  <div className="p-3.5 bg-purple-50/70 border border-purple-200 rounded-2xl text-center shadow-2xs">
                    <span className="text-[11px] font-black text-purple-900 block mb-2">Long Answer / HOTS (5 Marks)</span>
                    <div className="flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => setLongCount(Math.max(0, longCount - 1))}
                        className="w-8 h-8 rounded-xl bg-white border border-purple-200 font-black text-sm text-purple-900 cursor-pointer hover:bg-purple-100 active:scale-95 transition-all shadow-xs"
                      >
                        -
                      </button>
                      <span className="w-8 font-black text-sm text-purple-950">{longCount}</span>
                      <button
                        type="button"
                        onClick={() => setLongCount(longCount + 1)}
                        className="w-8 h-8 rounded-xl bg-white border border-purple-200 font-black text-sm text-purple-900 cursor-pointer hover:bg-purple-100 active:scale-95 transition-all shadow-xs"
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 px-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-700">
                  {assignment.questions.length} Questions
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-xs font-black text-indigo-700">
                  {assignment.total_marks} Marks
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
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
                <div className="flex flex-wrap items-center gap-1">
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
            <div className="space-y-3.5 w-full max-w-full overflow-hidden">
              {assignment.questions.map((q) => {
                const isEditing = editingQNum === q.question_number;

                return (
                  <div
                    key={q.question_number}
                    className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-5 shadow-xs space-y-3 transition w-full max-w-full overflow-hidden break-words"
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
      )}

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
