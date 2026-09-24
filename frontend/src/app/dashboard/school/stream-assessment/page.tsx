"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Building2, 
  Sparkles, 
  Download, 
  Printer, 
  CheckCircle2, 
  RefreshCw, 
  FileText, 
  Clock, 
  ChevronRight, 
  Sliders, 
  Compass, 
  BookOpen, 
  DollarSign,
  Atom,
  History,
  Trash2,
  Calendar,
  AlertTriangle,
  Search,
  Check,
  X
} from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { 
  generateStreamAssessment, 
  downloadStreamAssessmentPDF, 
  fetchPaperHistory,
  deletePaperFromHistory,
  StreamAssessmentResponse, 
  StreamAssessmentPayload
} from "@/lib/api";

export default function SchoolStreamAssessmentPage() {
  const { user } = useAppStore();

  // Form State — Class is fixed internally as Class 11-12 without asking the user
  const [schoolName, setSchoolName] = useState(user.schoolName || "Apex International School");
  const className = "Class 11-12";
  const [title, setTitle] = useState("Class 11-12 Stream Selection & Aptitude Diagnostic Assessment");
  const [timeAllowedMins, setTimeAllowedMins] = useState<number>(90);
  const [difficulty, setDifficulty] = useState<"foundation" | "balanced" | "advanced">("balanced");
  const [numMcqsPerStream, setNumMcqsPerStream] = useState<number>(4);
  const [numShortPerStream, setNumShortPerStream] = useState<number>(2);
  const [numLongPerStream, setNumLongPerStream] = useState<number>(1);
  const [customInstructions, setCustomInstructions] = useState("");

  // Generation & View State
  const [isGenerating, setIsGenerating] = useState(false);
  const [assessmentPaper, setAssessmentPaper] = useState<StreamAssessmentResponse | null>(null);
  const [activeTab, setActiveTab] = useState<"paper" | "key" | "counseling">("paper");
  const [viewMode, setViewMode] = useState<"generator" | "history">("generator");
  const [downloadingStudentPdf, setDownloadingStudentPdf] = useState(false);
  const [downloadingTeacherPdf, setDownloadingTeacherPdf] = useState(false);
  
  // Supabase Cloud History State
  const [cloudHistory, setCloudHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [historySearch, setHistorySearch] = useState("");
  const [paperToDelete, setPaperToDelete] = useState<{ id?: string; title: string; class_name?: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteSuccessNotice, setDeleteSuccessNotice] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Sync school name from profile
  useEffect(() => {
    if (user?.schoolName && (!schoolName || schoolName === "Apex International School")) {
      setSchoolName(user.schoolName);
    }
  }, [user?.schoolName]);

  // Load history from Supabase Cloud on mount & email change
  const loadCloudHistory = async () => {
    if (!user?.email) return;
    setLoadingHistory(true);
    try {
      const papers = await fetchPaperHistory(user.email);
      setCloudHistory(papers);
    } catch (e) {
      console.warn("Failed to load paper history from Supabase:", e);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    loadCloudHistory();
  }, [user?.email]);

  // Live calculations
  const totalMcqs = numMcqsPerStream * 3;
  const totalShort = numShortPerStream * 3;
  const totalLong = numLongPerStream * 3;
  const totalQuestions = totalMcqs + totalShort + totalLong;
  const marksPerStream = (numMcqsPerStream * 1) + (numShortPerStream * 3) + (numLongPerStream * 5);
  const totalCalculatedMarks = marksPerStream * 3;

  const handleGenerate = async () => {
    setIsGenerating(true);
    setErrorMsg(null);

    try {
      const payload: StreamAssessmentPayload = {
        title,
        class_name: className,
        school_name: schoolName,
        school_logo: user.schoolLogo,
        time_allowed_mins: Number(timeAllowedMins),
        difficulty,
        num_mcqs_per_stream: Number(numMcqsPerStream),
        num_short_per_stream: Number(numShortPerStream),
        num_long_per_stream: Number(numLongPerStream),
        custom_instructions: customInstructions,
        user_email: user.email
      };

      const result = await generateStreamAssessment(payload);
      setAssessmentPaper(result);
      setViewMode("generator");
      setActiveTab("paper");
      // Refresh cloud history after saving to Supabase
      loadCloudHistory();
    } catch (err: any) {
      console.error("Stream Assessment Generation failed:", err);
      setErrorMsg(err.message || "Failed to generate assessment. Please verify backend service and retry.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadPDF = async (paperObj: any, includeAnswers: boolean) => {
    if (!paperObj) return;
    if (includeAnswers) setDownloadingTeacherPdf(true);
    else setDownloadingStudentPdf(true);

    try {
      await downloadStreamAssessmentPDF(paperObj, includeAnswers);
    } catch (e: any) {
      alert(`Download failed: ${e.message}`);
    } finally {
      if (includeAnswers) setDownloadingTeacherPdf(false);
      else setDownloadingStudentPdf(false);
    }
  };

  const confirmDeletePaper = async () => {
    if (!paperToDelete || !user?.email) return;
    setIsDeleting(true);
    try {
      const ok = await deletePaperFromHistory(user.email, paperToDelete);
      if (ok) {
        setCloudHistory(prev => prev.filter(p => !(
          (paperToDelete.id && p.id === paperToDelete.id) ||
          (p.title === paperToDelete.title && p.class_name === paperToDelete.class_name)
        )));
        if (assessmentPaper && assessmentPaper.title === paperToDelete.title) {
          setAssessmentPaper(null);
        }
        setDeleteSuccessNotice(`Paper "${paperToDelete.title}" permanently deleted from Supabase database.`);
        setTimeout(() => setDeleteSuccessNotice(null), 4000);
      } else {
        alert("Failed to delete paper from database. Please try again.");
      }
    } catch (e: any) {
      alert(`Delete error: ${e.message}`);
    } finally {
      setIsDeleting(false);
      setPaperToDelete(null);
    }
  };

  // Filter history
  const filteredHistory = cloudHistory.filter(p => {
    if (!historySearch.trim()) return true;
    const term = historySearch.toLowerCase();
    return (
      (p.title && p.title.toLowerCase().includes(term)) ||
      (p.subject && p.subject.toLowerCase().includes(term)) ||
      (p.class_name && p.class_name.toLowerCase().includes(term))
    );
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      
      {/* 1. TOP BREADCRUMB & HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
            <Link href="/dashboard/school" className="hover:text-indigo-600 transition-colors flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5" />
              <span>School Portal</span>
            </Link>
            <ChevronRight className="w-3 h-3 text-slate-400" />
            <span className="text-indigo-600 font-extrabold">Stream Selection Assessment AI</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <span>Class 11 - 12 Stream Suitability Assessment</span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wide uppercase bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xs">
              AI Powered
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-normal">
            Generate authentic diagnostic papers across <span className="font-semibold text-blue-600">Science</span>, <span className="font-semibold text-emerald-600">Commerce</span>, and <span className="font-semibold text-purple-600">Humanities</span>. Download ready-to-print student question papers and school evaluation rubrics.
          </p>
        </div>

        {/* View Switcher: Generator vs Cloud History */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => { setViewMode("generator"); }}
            className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer ${
              viewMode === "generator" 
                ? "bg-indigo-600 text-white shadow-sm" 
                : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Paper Studio</span>
          </button>

          <button
            onClick={() => { setViewMode("history"); loadCloudHistory(); }}
            className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer ${
              viewMode === "history" 
                ? "bg-indigo-600 text-white shadow-sm" 
                : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200"
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Paper History</span>
            {cloudHistory.length > 0 && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                viewMode === "history" ? "bg-white text-indigo-700" : "bg-indigo-100 text-indigo-700"
              }`}>
                {cloudHistory.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {deleteSuccessNotice && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 shadow-2xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{deleteSuccessNotice}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* VIEW MODE 1: FULL SUPABASE CLOUD PAPER HISTORY */}
      {viewMode === "history" ? (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 bg-white rounded-3xl border border-slate-200/90 shadow-xs">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-slate-900">Saved Assessments in Supabase Database</h2>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Supabase Cloud Connected
                </span>
              </div>
              <p className="text-xs text-slate-500">
                All generated papers are permanently saved in cloud PostgreSQL. You can load, download PDFs, or delete anytime.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search saved papers..."
                  value={historySearch}
                  onChange={(e) => setHistorySearch(e.target.value)}
                  className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 w-48 sm:w-56"
                />
              </div>
              <button
                onClick={loadCloudHistory}
                disabled={loadingHistory}
                className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
                title="Refresh Cloud Database"
              >
                <RefreshCw className={`w-4 h-4 ${loadingHistory ? 'animate-spin text-indigo-600' : ''}`} />
              </button>
            </div>
          </div>

          {loadingHistory ? (
            <div className="py-16 text-center space-y-2">
              <RefreshCw className="w-6 h-6 animate-spin text-indigo-600 mx-auto" />
              <p className="text-xs font-bold text-slate-500">Loading assessments from Supabase Cloud...</p>
            </div>
          ) : filteredHistory.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto font-bold">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">No Assessment Papers Found</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                {historySearch ? "No papers match your search term." : "Generate your first Class 11-12 stream assessment paper to see it securely stored here in Supabase."}
              </p>
              <button
                onClick={() => setViewMode("generator")}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors cursor-pointer"
              >
                Create New Assessment Paper
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredHistory.map((paper, idx) => (
                <div 
                  key={paper.id || idx}
                  className="bg-white rounded-3xl border border-slate-200 p-5 space-y-3 hover:border-indigo-200 hover:shadow-sm transition-all"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-indigo-50 text-indigo-700 border border-indigo-200">
                          {paper.class_name || "Class 11-12"}
                        </span>
                        <span className="text-[10.5px] font-semibold text-slate-400 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {paper.created_at ? new Date(paper.created_at).toLocaleDateString() : "Saved"}
                        </span>
                      </div>
                      <h3 className="text-sm font-black text-slate-900 line-clamp-1">{paper.title}</h3>
                    </div>

                    {/* Delete from Supabase Database button */}
                    <button
                      onClick={() => setPaperToDelete({ id: paper.id, title: paper.title, class_name: paper.class_name })}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Permanently Delete from Database"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-bold text-slate-600 py-1 border-y border-slate-100">
                    <span>{paper.total_marks || 45} Marks</span>
                    <span>&bull;</span>
                    <span>{paper.time_allowed_mins || 90} Mins</span>
                    <span>&bull;</span>
                    <span>{Array.isArray(paper.questions) ? paper.questions.length : 0} Questions</span>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => {
                        setAssessmentPaper(paper);
                        setViewMode("generator");
                        setActiveTab("paper");
                      }}
                      className="flex-1 py-2 px-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs transition-colors text-center cursor-pointer"
                    >
                      Open in Studio
                    </button>

                    <button
                      onClick={() => handleDownloadPDF(paper, false)}
                      className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors flex items-center gap-1 cursor-pointer"
                      title="Download Student Paper PDF"
                    >
                      <Download className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Student PDF</span>
                    </button>

                    <button
                      onClick={() => handleDownloadPDF(paper, true)}
                      className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors flex items-center gap-1 cursor-pointer"
                      title="Download Teacher Key & Rubric PDF"
                    >
                      <FileText className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Key PDF</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (

        /* VIEW MODE 2: GENERATOR & ACTIVE PAPER PREVIEW */
        !assessmentPaper ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* LEFT 2 COLUMNS: CONFIGURATION FORM (NO CLASS SELECTOR ASKED) */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 space-y-6">
                
                <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                    <Sliders className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-extrabold text-slate-900">Paper Configuration</h2>
                    <p className="text-xs text-slate-500">Configure institutional details, duration, difficulty, and question distribution.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* School Name */}
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs font-bold text-slate-700">School / Institution Name</label>
                    <input
                      type="text"
                      value={schoolName}
                      onChange={(e) => setSchoolName(e.target.value)}
                      placeholder="Enter official school name"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                    />
                  </div>

                  {/* Assessment Title (Full width) */}
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs font-bold text-slate-700">Paper Title</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Class 11-12 Stream Selection & Aptitude Diagnostic Assessment"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                    />
                  </div>

                  {/* Duration */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Max Time Allowed (Minutes)</label>
                    <select
                      value={timeAllowedMins}
                      onChange={(e) => setTimeAllowedMins(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-white"
                    >
                      <option value={60}>60 Minutes (1 Hour)</option>
                      <option value={90}>90 Minutes (1.5 Hours - Recommended)</option>
                      <option value={120}>120 Minutes (2 Hours)</option>
                      <option value={180}>180 Minutes (3 Hours Full Mock)</option>
                    </select>
                  </div>

                  {/* Difficulty */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Difficulty Standard</label>
                    <select
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-white"
                    >
                      <option value="foundation">Foundation (Core Concept Identification)</option>
                      <option value="balanced">Balanced (CBSE & NEP 2020 Standard - Recommended)</option>
                      <option value="advanced">Advanced (High-Order Thinking & Problem Solving)</option>
                    </select>
                  </div>
                </div>

                {/* QUESTION MIX & STRUCTURE MATRIX */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-extrabold text-slate-800">
                      Question Mix per Stream (Science, Commerce, Humanities)
                    </label>
                    <span className="text-[11px] font-bold text-indigo-600">
                      Equal 3-Way Distribution
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* MCQs per stream */}
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700">Section A: MCQs</span>
                        <span className="text-[10px] font-extrabold text-slate-500">1 Mark each</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min={2}
                          max={8}
                          value={numMcqsPerStream}
                          onChange={(e) => setNumMcqsPerStream(Math.max(2, Math.min(8, Number(e.target.value))))}
                          className="w-16 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-black text-center"
                        />
                        <span className="text-[11px] text-slate-500 font-semibold">per stream</span>
                      </div>
                      <p className="text-[10px] text-slate-400">Total: {totalMcqs} MCQs ({totalMcqs} Marks)</p>
                    </div>

                    {/* Short per stream */}
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700">Section B: Short</span>
                        <span className="text-[10px] font-extrabold text-slate-500">3 Marks each</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min={1}
                          max={4}
                          value={numShortPerStream}
                          onChange={(e) => setNumShortPerStream(Math.max(1, Math.min(4, Number(e.target.value))))}
                          className="w-16 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-black text-center"
                        />
                        <span className="text-[11px] text-slate-500 font-semibold">per stream</span>
                      </div>
                      <p className="text-[10px] text-slate-400">Total: {totalShort} Qs ({totalShort * 3} Marks)</p>
                    </div>

                    {/* Long per stream */}
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700">Section C: Long</span>
                        <span className="text-[10px] font-extrabold text-slate-500">5 Marks each</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min={1}
                          max={2}
                          value={numLongPerStream}
                          onChange={(e) => setNumLongPerStream(Math.max(1, Math.min(2, Number(e.target.value))))}
                          className="w-16 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-black text-center"
                        />
                        <span className="text-[11px] text-slate-500 font-semibold">per stream</span>
                      </div>
                      <p className="text-[10px] text-slate-400">Total: {totalLong} Case Qs ({totalLong * 5} Marks)</p>
                    </div>
                  </div>
                </div>

                {/* Custom Guidance */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    Custom School Instructions / Focus Notes (Optional)
                  </label>
                  <textarea
                    value={customInstructions}
                    onChange={(e) => setCustomInstructions(e.target.value)}
                    placeholder="e.g. Focus on practical real-world applications, NEP 2020 competency-based reasoning, and financial literacy."
                    rows={2}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 resize-none"
                  />
                </div>

                {/* SUBMIT BUTTON */}
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="w-full py-3.5 px-6 rounded-2xl font-black text-xs sm:text-sm text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 active:scale-98 transition-all shadow-md hover:shadow-indigo-500/20 flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Synthesizing Authentic Assessment Paper with AI...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Generate Stream Aptitude Assessment Paper</span>
                    </>
                  )}
                </button>

              </div>
            </div>

            {/* RIGHT 1 COLUMN: LIVE SUMMARY & CLOUD SYNCED PAPERS */}
            <div className="space-y-6">
              
              {/* Real-time Paper Summary Card */}
              <div className="bg-gradient-to-br from-indigo-50/80 via-white to-purple-50/60 rounded-3xl border border-indigo-100 p-5 space-y-4 shadow-xs">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Live Paper Metrics</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-white border border-slate-100 shadow-2xs">
                    <span className="text-xs font-bold text-slate-600">Total Questions</span>
                    <span className="text-sm font-black text-slate-900">{totalQuestions} Questions</span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-2xl bg-white border border-slate-100 shadow-2xs">
                    <span className="text-xs font-bold text-slate-600">Total Marks</span>
                    <span className="text-sm font-black text-indigo-600">{totalCalculatedMarks} Marks</span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-2xl bg-white border border-slate-100 shadow-2xs">
                    <span className="text-xs font-bold text-slate-600">Weight Per Stream</span>
                    <span className="text-xs font-black text-slate-900">{marksPerStream} Marks each (33.3%)</span>
                  </div>
                </div>

                {/* Stream Breakdown Bars */}
                <div className="space-y-2 pt-2 border-t border-slate-200/60">
                  <div className="flex items-center justify-between text-[11px] font-bold">
                    <span className="text-blue-700 flex items-center gap-1.5">
                      <Atom className="w-3.5 h-3.5" /> Science (STEM)
                    </span>
                    <span>{marksPerStream} M</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-blue-600 h-full w-full rounded-full" />
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-bold pt-1">
                    <span className="text-emerald-700 flex items-center gap-1.5">
                      <DollarSign className="w-3.5 h-3.5" /> Commerce & Finance
                    </span>
                    <span>{marksPerStream} M</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-600 h-full w-full rounded-full" />
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-bold pt-1">
                    <span className="text-purple-700 flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5" /> Humanities & Social
                    </span>
                    <span>{marksPerStream} M</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-purple-600 h-full w-full rounded-full" />
                  </div>
                </div>
              </div>

              {/* Supabase Cloud Synced Papers Widget */}
              <div className="bg-white rounded-3xl border border-slate-200/90 p-5 space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <History className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Supabase Cloud History</span>
                  </h3>
                  <button 
                    onClick={() => setViewMode("history")}
                    className="text-[11px] font-bold text-indigo-600 hover:underline"
                  >
                    View All ({cloudHistory.length})
                  </button>
                </div>

                {cloudHistory.length === 0 ? (
                  <p className="text-xs text-slate-400 py-3 text-center">
                    No papers saved yet. Generated papers persist in Supabase automatically.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {cloudHistory.slice(0, 3).map((item, idx) => (
                      <div 
                        key={item.id || idx}
                        className="p-3 rounded-2xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all flex items-center justify-between gap-2 group"
                      >
                        <div 
                          onClick={() => {
                            setAssessmentPaper(item);
                            setActiveTab("paper");
                          }}
                          className="min-w-0 flex-1 cursor-pointer"
                        >
                          <div className="text-xs font-bold text-slate-800 group-hover:text-indigo-600 line-clamp-1">
                            {item.title}
                          </div>
                          <div className="text-[10px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                            <span>{item.total_marks || 45} Marks</span>
                            <span>&bull;</span>
                            <span>{item.time_allowed_mins || 90} Mins</span>
                          </div>
                        </div>

                        <button
                          onClick={() => setPaperToDelete({ id: item.id, title: item.title, class_name: item.class_name })}
                          className="text-slate-300 hover:text-rose-600 p-1 rounded-lg transition-colors cursor-pointer"
                          title="Delete from Database"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

          </div>
        ) : (
          
          /* 3. GENERATED PAPER WORKSPACE & PDF DOWNLOADS */
          <div className="space-y-6">
            
            {/* ACTION & DOWNLOAD BAR */}
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-5 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg">
              <div className="space-y-1">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Saved to Supabase Database &bull; Ready for Print
                </span>
                <h2 className="text-lg sm:text-xl font-black text-white">{assessmentPaper.title}</h2>
                <p className="text-xs text-slate-300">
                  {assessmentPaper.total_marks} Marks &bull; {assessmentPaper.time_allowed_mins} Mins &bull; {assessmentPaper.questions?.length || 0} Questions
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                {/* Download Student Paper PDF */}
                <button
                  onClick={() => handleDownloadPDF(assessmentPaper, false)}
                  disabled={downloadingStudentPdf}
                  className="px-4 py-2.5 rounded-xl font-bold text-xs bg-white text-slate-900 hover:bg-slate-100 active:scale-98 transition-all flex items-center gap-2 shadow-sm cursor-pointer disabled:opacity-60"
                >
                  {downloadingStudentPdf ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                  ) : (
                    <Download className="w-3.5 h-3.5 text-indigo-600" />
                  )}
                  <span>Download Student Paper (PDF)</span>
                </button>

                {/* Download Teacher Key & Counseling Matrix PDF */}
                <button
                  onClick={() => handleDownloadPDF(assessmentPaper, true)}
                  disabled={downloadingTeacherPdf}
                  className="px-4 py-2.5 rounded-xl font-bold text-xs bg-indigo-600 text-white hover:bg-indigo-500 active:scale-98 transition-all flex items-center gap-2 shadow-sm cursor-pointer disabled:opacity-60"
                >
                  {downloadingTeacherPdf ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <FileText className="w-3.5 h-3.5" />
                  )}
                  <span>Download Teacher Key & Rubric (PDF)</span>
                </button>

                {/* Quick Print */}
                <button
                  onClick={() => window.print()}
                  className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white transition-colors"
                  title="Print Paper"
                >
                  <Printer className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setAssessmentPaper(null)}
                  className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  + New Paper
                </button>
              </div>
            </div>

            {/* 3 STREAM SUMMARY TILES */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Science Tile */}
              <div className="p-4 rounded-3xl bg-blue-50/70 border border-blue-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-blue-900 flex items-center gap-1.5 uppercase tracking-wide">
                    <Atom className="w-4 h-4 text-blue-600" /> Science (STEM)
                  </span>
                  <span className="text-xs font-black px-2 py-0.5 rounded-full bg-blue-600 text-white">
                    {assessmentPaper.stream_breakdown?.find(s => s.stream === "science")?.total_marks || marksPerStream} Marks
                  </span>
                </div>
                <p className="text-[11px] text-blue-800 leading-relaxed">
                  Physics mechanics, chemical kinetics, biology systems & mathematical logic.
                </p>
              </div>

              {/* Commerce Tile */}
              <div className="p-4 rounded-3xl bg-emerald-50/70 border border-emerald-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-emerald-900 flex items-center gap-1.5 uppercase tracking-wide">
                    <DollarSign className="w-4 h-4 text-emerald-600" /> Commerce & Finance
                  </span>
                  <span className="text-xs font-black px-2 py-0.5 rounded-full bg-emerald-600 text-white">
                    {assessmentPaper.stream_breakdown?.find(s => s.stream === "commerce")?.total_marks || marksPerStream} Marks
                  </span>
                </div>
                <p className="text-[11px] text-emerald-800 leading-relaxed">
                  Market dynamics, price elasticity, balance sheet logic & managerial trade-offs.
                </p>
              </div>

              {/* Humanities Tile */}
              <div className="p-4 rounded-3xl bg-purple-50/70 border border-purple-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-purple-900 flex items-center gap-1.5 uppercase tracking-wide">
                    <BookOpen className="w-4 h-4 text-purple-600" /> Humanities & Social
                  </span>
                  <span className="text-xs font-black px-2 py-0.5 rounded-full bg-purple-600 text-white">
                    {assessmentPaper.stream_breakdown?.find(s => s.stream === "humanities")?.total_marks || marksPerStream} Marks
                  </span>
                </div>
                <p className="text-[11px] text-purple-800 leading-relaxed">
                  Constitutional rights, ethical evaluation, historical perspective & critical rhetoric.
                </p>
              </div>
            </div>

            {/* VIEW SWITCHER TABS */}
            <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
              <button
                onClick={() => setActiveTab("paper")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "paper" 
                    ? "bg-indigo-600 text-white shadow-xs" 
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                Student Question Paper
              </button>
              <button
                onClick={() => setActiveTab("key")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "key" 
                    ? "bg-indigo-600 text-white shadow-xs" 
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                Teacher Answer Key & Scoring Guide
              </button>
              <button
                onClick={() => setActiveTab("counseling")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "counseling" 
                    ? "bg-indigo-600 text-white shadow-xs" 
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                School Counseling Matrix
              </button>
            </div>

            {/* TAB CONTENT 1: STUDENT QUESTION PAPER */}
            {activeTab === "paper" && (
              <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 sm:p-8 space-y-6">
                
                {/* Paper Top Branding */}
                <div className="text-center space-y-1.5 border-b border-slate-200 pb-5">
                  <div className="text-xs font-bold uppercase tracking-widest text-slate-500">
                    {assessmentPaper.school_name}
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    {assessmentPaper.title}
                  </h3>
                  <p className="text-xs font-bold text-indigo-700">
                    Science (STEM) &bull; Commerce & Finance &bull; Humanities & Social Sciences
                  </p>
                </div>

                {/* STUDENT INFO BOX: ONLY NAME OF STUDENT, MAX TIME, MAX MARKS */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-bold">
                  <div className="flex-1">
                    Name of Student: ____________________________________________________
                  </div>
                  <div className="shrink-0 bg-white px-3 py-1.5 rounded-xl border border-slate-200">
                    Max Marks: {assessmentPaper.total_marks}
                  </div>
                  <div className="shrink-0 bg-white px-3 py-1.5 rounded-xl border border-slate-200">
                    Max Time: {assessmentPaper.time_allowed_mins} Minutes
                  </div>
                </div>

                {/* Instructions */}
                <div className="space-y-1.5 text-xs text-slate-600">
                  <div className="font-bold text-slate-800">General Instructions:</div>
                  {(assessmentPaper.instructions || [
                    "All questions are compulsory across Science, Commerce, and Humanities sections.",
                    "Section A consists of Objective MCQs (1 Mark each). Select the single most appropriate option.",
                    "Section B consists of Short Analytical Questions (3 Marks each). Write concise, structured explanations.",
                    "Section C consists of Long Scenario & Case-Based Questions (5 Marks each). Demonstrate analytical depth."
                  ]).map((inst, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className="text-indigo-600 font-bold">&bull;</span>
                      <span>{inst}</span>
                    </div>
                  ))}
                </div>

                <hr className="border-slate-200" />

                {/* Questions List */}
                <div className="space-y-6">
                  {(assessmentPaper.questions || []).map((q: any) => {
                    const isScience = q.stream === "science";
                    const isCommerce = q.stream === "commerce";

                    const badgeClass = isScience 
                      ? "bg-blue-100 text-blue-800 border-blue-200" 
                      : isCommerce 
                        ? "bg-emerald-100 text-emerald-800 border-emerald-200" 
                        : "bg-purple-100 text-purple-800 border-purple-200";

                    return (
                      <div key={q.id || q.question_number} className="space-y-2 p-4 rounded-2xl bg-slate-50/60 border border-slate-200/80">
                        
                        {/* Question Header & Badges */}
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-slate-900">Q{q.question_number}.</span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase border ${badgeClass}`}>
                              {q.stream} Stream
                            </span>
                            {q.competency && (
                              <span className="text-[10.5px] font-semibold text-slate-500 italic">
                                &bull; {q.competency}
                              </span>
                            )}
                          </div>
                          <span className="text-xs font-bold text-slate-700 bg-white px-2.5 py-0.5 rounded-md border border-slate-200 shadow-2xs">
                            {q.marks} Mark{q.marks > 1 ? "s" : ""}
                          </span>
                        </div>

                        {/* Case Passage if present */}
                        {q.case_passage && (
                          <div className="p-3.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-700 leading-relaxed font-normal">
                            <div className="font-bold text-slate-900 mb-1">CASE SCENARIO / CONTEXT:</div>
                            {q.case_passage}
                          </div>
                        )}

                        {/* Question Text */}
                        <p className="text-xs sm:text-sm font-semibold text-slate-900 leading-relaxed">
                          {q.question_text}
                        </p>

                        {/* MCQ Options */}
                        {q.question_type === "mcq" && q.options && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                            {q.options.map((opt: string, oIdx: number) => (
                              <div key={oIdx} className="p-2.5 rounded-xl bg-white border border-slate-200 text-xs font-medium text-slate-800 flex items-center gap-2">
                                <span>{opt}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Blank writing guide */}
                        {q.question_type === "short" && (
                          <div className="pt-1 text-[11px] text-slate-400 font-mono select-none">
                            Answer: ...........................................................................................................................................................
                          </div>
                        )}

                        {q.question_type === "long" && (
                          <div className="pt-1 text-[11px] text-slate-400 font-mono select-none space-y-1">
                            <div>Solution / Rationale: ............................................................................................................................................</div>
                            <div>..................................................................................................................................................................</div>
                          </div>
                        )}

                      </div>
                    );
                  })}
                </div>

              </div>
            )}

            {/* TAB CONTENT 2: TEACHER ANSWER KEY */}
            {activeTab === "key" && (
              <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 sm:p-8 space-y-6">
                
                <div className="border-b border-slate-200 pb-4">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 border border-emerald-200">
                    Teacher Evaluation Key
                  </span>
                  <h3 className="text-xl font-black text-slate-900 mt-1">Complete Model Answers & Marking Rubrics</h3>
                  <p className="text-xs text-slate-500">Step-by-step scoring guidance and diagnostic competence notes for school evaluators.</p>
                </div>

                <div className="space-y-6">
                  {(assessmentPaper.questions || []).map((q: any) => (
                    <div key={q.id || q.question_number} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-slate-900">Q{q.question_number}.</span>
                          <span className="text-xs font-bold capitalize text-slate-700">[{q.stream} Stream]</span>
                        </div>
                        <span className="text-xs font-bold text-slate-600">{q.marks} Marks</span>
                      </div>

                      <p className="text-xs font-semibold text-slate-900">{q.question_text}</p>

                      <div className="p-3.5 rounded-xl bg-emerald-50/80 border border-emerald-200 space-y-1.5 text-xs">
                        <div className="font-extrabold text-emerald-900 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Model Solution / Marking Key:</span>
                        </div>
                        <p className="text-emerald-950 font-medium whitespace-pre-line">{q.answer}</p>

                        {q.explanation && (
                          <div className="pt-1.5 text-[11px] text-emerald-800 border-t border-emerald-200/60">
                            <span className="font-bold">Aptitude Insight: </span>{q.explanation}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            )}

            {/* TAB CONTENT 3: COUNSELING MATRIX */}
            {activeTab === "counseling" && (
              <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 sm:p-8 space-y-6">
                
                <div className="border-b border-slate-200 pb-4">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-100 text-amber-800 border border-amber-200">
                    Career Counseling Decision Guide
                  </span>
                  <h3 className="text-xl font-black text-slate-900 mt-1">School Stream Allocation Matrix</h3>
                  <p className="text-xs text-slate-500">Framework for academic advisors and school principals to recommend streams based on student scores.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Science Scorecard */}
                  <div className="p-5 rounded-3xl bg-blue-50/80 border border-blue-200 space-y-3">
                    <div className="flex items-center gap-2 text-blue-900 font-black text-sm">
                      <Atom className="w-5 h-5 text-blue-600" />
                      <span>Science (STEM) Criteria</span>
                    </div>
                    <div className="text-xs text-blue-950 leading-relaxed">
                      {assessmentPaper.diagnostic_matrix?.science_indicators || "Score >= 75%: High suitability for PCM/PCB, Engineering, Medicine, Pure Sciences, and AI."}
                    </div>
                    <div className="pt-2 border-t border-blue-200 text-[11px] font-bold text-blue-800">
                      Target Careers: IIT-JEE, NEET, Robotics, Pure Research, Data Science.
                    </div>
                  </div>

                  {/* Commerce Scorecard */}
                  <div className="p-5 rounded-3xl bg-emerald-50/80 border border-emerald-200 space-y-3">
                    <div className="flex items-center gap-2 text-emerald-900 font-black text-sm">
                      <DollarSign className="w-5 h-5 text-emerald-600" />
                      <span>Commerce & Finance Criteria</span>
                    </div>
                    <div className="text-xs text-emerald-950 leading-relaxed">
                      {assessmentPaper.diagnostic_matrix?.commerce_indicators || "Score >= 75%: Strong acumen for Chartered Accountancy (CA), Corporate Finance, Economics, CFA, and Management."}
                    </div>
                    <div className="pt-2 border-t border-emerald-200 text-[11px] font-bold text-emerald-800">
                      Target Careers: CA, CFA, Investment Banking, BBA/MBA, Economics (Hons).
                    </div>
                  </div>

                  {/* Humanities Scorecard */}
                  <div className="p-5 rounded-3xl bg-purple-50/80 border border-purple-200 space-y-3">
                    <div className="flex items-center gap-2 text-purple-900 font-black text-sm">
                      <BookOpen className="w-5 h-5 text-purple-600" />
                      <span>Humanities & Social Criteria</span>
                    </div>
                    <div className="text-xs text-purple-950 leading-relaxed">
                      {assessmentPaper.diagnostic_matrix?.humanities_indicators || "Score >= 75%: Outstanding suitability for Law (CLAT), Civil Services (UPSC), Public Policy, and Journalism."}
                    </div>
                    <div className="pt-2 border-t border-purple-200 text-[11px] font-bold text-purple-800">
                      Target Careers: Law (CLAT/Judiciary), Civil Services (UPSC), Public Policy, Journalism.
                    </div>
                  </div>
                </div>

                {/* Balanced & Cross-Stream Advice */}
                <div className="p-5 rounded-3xl bg-slate-50 border border-slate-200 space-y-2">
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-wide">
                    Cross-Disciplinary & Balanced Scores
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {assessmentPaper.diagnostic_matrix?.balanced_recommendation || "Candidates demonstrating balanced performance across multiple streams should consider interdisciplinary combinations such as Economics with Mathematics, Legal Studies, or Cognitive Computing."}
                  </p>
                </div>

              </div>
            )}

          </div>

        )
      )}

      {/* PERMANENT DATABASE DELETE CONFIRMATION MODAL */}
      {paperToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-black text-slate-900">Delete Paper from Database?</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Are you sure you want to permanently delete <span className="font-bold text-slate-800">&quot;{paperToDelete.title}&quot;</span>? This will remove the paper permanently from the Supabase database.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setPaperToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeletePaper}
                disabled={isDeleting}
                className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-xs font-black text-white shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting from Cloud...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Yes, Delete from Database</span>
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
