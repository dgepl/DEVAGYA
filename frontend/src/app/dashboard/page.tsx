"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  ScanText,
  FileText,
  ArrowRight,
  Zap,
  BookOpen,
  Download,
  Trash2,
  Eye,
  Bot,
  Layers,
  GraduationCap,
  CheckCircle2,
  PlusCircle,
  MessageSquare,
  Bookmark,
  FileCheck,
  TrendingUp,
  Activity,
  Search,
  Video,
  Trophy,
  Sliders
} from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { downloadPDF, GeneratedPaperResponse } from "@/lib/api";
import { MobileTeacherDashboard } from "@/components/dashboard/MobileTeacherDashboard";

interface ChatConvSummary {
  id: string;
  title: string;
  agent_code: string;
  updated_at: string;
}

export default function TeacherDashboardOverviewPage() {
  const router = useRouter();
  const { user, savedPapers, setActivePaper, deleteSavedPaper } = useAppStore();
  const [conversations, setConversations] = useState<ChatConvSummary[]>([]);
  const [loadingConvs, setLoadingConvs] = useState<boolean>(true);
  const [downloadingIdx, setDownloadingIdx] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [desktopFilter, setDesktopFilter] = useState<string>("all");

  // Fetch recent AI conversations from backend
  useEffect(() => {
    async function fetchConversations() {
      try {
        const userId = user.id || "usr-guest";
        const res = await fetch(`/api/v1/agents/conversations?user_id=${encodeURIComponent(userId)}`);
        if (res.ok) {
          const data = await res.json();
          setConversations(data.conversations?.slice(0, 5) || []);
        }
      } catch (e) {
        console.error("Error fetching conversations:", e);
      } finally {
        setLoadingConvs(false);
      }
    }
    fetchConversations();
  }, [user.id]);

  // Handle PDF Export directly from Dashboard
  const handleExportPDF = async (paper: GeneratedPaperResponse, index: number, includeAnswers: boolean) => {
    try {
      setDownloadingIdx(index);
      await downloadPDF(paper, includeAnswers);
    } catch (err) {
      alert("Failed to export PDF. Please ensure backend server is running.");
    } finally {
      setDownloadingIdx(null);
    }
  };

  // Open paper in Generator
  const handleOpenPaper = (paper: GeneratedPaperResponse) => {
    setActivePaper(paper);
    router.push("/dashboard/generator");
  };

  // Total questions count across saved papers
  const totalQuestionsCreated = savedPapers.reduce(
    (acc, p) => acc + (p.questions?.length || 0),
    0
  );

  const teacherTools = [
    {
      code: "ppt_generator",
      href: "/dashboard/ppt-generator",
      name: "AI PPT Generator",
      desc: "Generate highly editable, image-rich slide decks on any study topic with live presentation & PDF preview.",
      icon: Sliders,
      color: "from-purple-600 to-indigo-700",
      badge: "New Studio"
    },
    {
      code: "teacher_mentor",
      href: "/dashboard/agents?agent=teacher_mentor",
      name: "Teacher Mentor AI",
      desc: "Pedagogy, class analytics, English polish, document AI & NCERT curriculum research.",
      icon: GraduationCap,
      color: "from-indigo-500 to-purple-600",
      badge: "Super Agent"
    },
    {
      code: "assignments",
      href: "/dashboard/assignments",
      name: "AI Assignment Maker",
      desc: "Generate 100% original homework worksheets with ruled writing lines & PDF customizer.",
      icon: FileText,
      color: "from-blue-600 to-indigo-700",
      badge: "New Studio"
    },
    {
      code: "generator",
      href: "/dashboard/generator",
      name: "Question Generator",
      desc: "Create 1M, 3M, 5M NCERT exam papers with model answer keys & school branding.",
      icon: Sparkles,
      color: "from-amber-500 to-yellow-600",
      badge: "Core Studio"
    },
    {
      code: "teacher_olympiad",
      href: "/dashboard/teacher-olympiad",
      name: "Skill Enhance Program",
      desc: "Test and certify pedagogical, leadership, and subject teaching proficiencies.",
      icon: Trophy,
      color: "from-amber-500 to-orange-600",
      badge: "Official Certification"
    },
    {
      code: "olympiad_practice",
      href: "/dashboard/teacher-olympiad/practice",
      name: "Skill Enhance Practice",
      desc: "Unlimited timed practice quizzes and mock papers for teacher skill enhancement.",
      icon: BookOpen,
      color: "from-emerald-500 to-teal-600",
      badge: "Practice Zone"
    },
    {
      code: "video-consultation",
      href: "/dashboard/video-consultation",
      name: "Video Consultation",
      desc: "Schedule 1-on-1 virtual mentoring, video consultations & AI voice sessions.",
      icon: Video,
      color: "from-rose-500 to-red-600",
      badge: "Live Video"
    }
  ];

  // Dynamic filter for desktop
  const qClean = searchQuery.toLowerCase().trim();
  
  const filteredPapers = savedPapers.filter(p => {
    if (!qClean) return true;
    return (
      (p.title || "").toLowerCase().includes(qClean) ||
      (p.subject || "").toLowerCase().includes(qClean) ||
      (p.class_name || "").toLowerCase().includes(qClean) ||
      (p.chapter || "").toLowerCase().includes(qClean)
    );
  });

  const filteredTools = teacherTools.filter(t => {
    if (desktopFilter === "generator" && t.code !== "generator") return false;
    if (desktopFilter === "olympiad" && !t.code.includes("olympiad")) return false;
    if (desktopFilter === "ai" && !["teacher_mentor", "video-consultation"].includes(t.code)) return false;
    if (desktopFilter === "ocr" && t.code !== "ocr") return false;

    if (!qClean) return true;
    return (
      t.name.toLowerCase().includes(qClean) ||
      t.desc.toLowerCase().includes(qClean) ||
      t.badge.toLowerCase().includes(qClean)
    );
  });

  return (
    <>
      <MobileTeacherDashboard />

      <div className="hidden md:block space-y-8 pb-12">
        
        {/* Welcome Banner */}
      <div className="p-8 rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white relative overflow-hidden flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 shadow-2xl">
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="space-y-3 max-w-2xl relative z-10">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-extrabold uppercase tracking-widest bg-indigo-500/30 border border-indigo-400/40 text-indigo-200 px-3 py-1 rounded-full">
              Teacher Workspace • {user.board || "CBSE / NCERT"}
            </span>
            <span className="text-[11px] font-bold bg-emerald-500/30 border border-emerald-400/40 text-emerald-200 px-3 py-1 rounded-full flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Active Session
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-indigo-200 to-white">{user.name || "Educator"}</span>! 👋
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
            {user.schoolName || "DEVGYA GLOBAL EDUTECH"} • Generate custom NCERT periodic assessments, manage saved question papers, or consult specialized AI Teaching Assistants.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 relative z-10 shrink-0">
          <Link
            href="/dashboard/generator"
            className="px-6 py-3.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold text-xs rounded-2xl shadow-lg hover:shadow-indigo-500/25 transition-all flex items-center gap-2.5 active:scale-95 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-yellow-300 animate-pulse" />
            Create Question Paper
          </Link>
          <Link
            href="/dashboard/agents?agent=teacher_mentor"
            className="px-5 py-3.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-2xl border border-white/20 backdrop-blur-md transition-all flex items-center gap-2 active:scale-95 cursor-pointer"
          >
            <Bot className="w-4 h-4 text-cyan-300" />
            Ask AI Mentor
          </Link>
        </div>
      </div>

      {/* INTERACTIVE WORKSPACE SEARCH & FILTER BAR */}
      <div className="glass-panel p-4 rounded-3xl border border-slate-200 bg-white shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full md:w-96 bg-slate-50 border border-slate-200/90 rounded-2xl px-4 py-2.5 focus-within:ring-2 focus-within:ring-indigo-100 focus-within:border-indigo-400 focus-within:bg-white transition-all">
          <Search className="w-4 h-4 text-indigo-600 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search question papers, tools, syllabus (e.g. Science, Class 10)..."
            className="w-full bg-transparent outline-none text-xs font-semibold text-slate-800 placeholder-slate-400"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="text-slate-400 hover:text-slate-700 cursor-pointer text-xs"
            >
              ✕
            </button>
          )}
        </div>

        {/* Quick Filter Capsule Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto scrollbar-none">
          {[
            { id: "all", label: "All Tools & Papers" },
            { id: "generator", label: "Question Generator" },
            { id: "olympiad", label: "Teacher Olympiad" },
            { id: "ocr", label: "Vision OCR" },
            { id: "ai", label: "AI Mentorship" },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setDesktopFilter(f.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                desktopFilter === f.id
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        <div className="glass-card p-6 rounded-2xl border border-slate-200/80 bg-white/80 backdrop-blur-md space-y-3 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Saved Papers</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <FileCheck className="w-5 h-5" />
            </div>
          </div>
          <div>
            <p className="text-3xl font-extrabold text-slate-900">{savedPapers.length}</p>
            <p className="text-[11px] font-bold text-indigo-600 mt-1">Available in Session & Storage</p>
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-slate-200/80 bg-white/80 backdrop-blur-md space-y-3 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Questions</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
          </div>
          <div>
            <p className="text-3xl font-extrabold text-slate-900">{totalQuestionsCreated}</p>
            <p className="text-[11px] font-bold text-purple-600 mt-1">MCQs, Short & Long Questions</p>
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-slate-200/80 bg-white/80 backdrop-blur-md space-y-3 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">AI Teaching Tools</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Bot className="w-5 h-5" />
            </div>
          </div>
          <div>
            <p className="text-3xl font-extrabold text-slate-900">15</p>
            <p className="text-[11px] font-bold text-emerald-600 mt-1">Specialized AI Assistants</p>
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-slate-200/80 bg-white/80 backdrop-blur-md space-y-3 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Curriculum</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <GraduationCap className="w-5 h-5" />
            </div>
          </div>
          <div>
            <p className="text-3xl font-extrabold text-slate-900">{user.board || "CBSE"}</p>
            <p className="text-[11px] font-bold text-amber-600 mt-1">NCERT Class 6 to 12</p>
          </div>
        </div>

      </div>

      {/* Main 2-Column Section: Saved Papers & AI Chat History */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column (2 Cols): Real Saved Question Papers */}
        <div className="lg:col-span-2 space-y-5">
          <div className="glass-panel p-6 rounded-3xl border border-slate-200 bg-white shadow-sm space-y-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Bookmark className="w-5 h-5 text-indigo-600" />
                  Your Saved Question Papers
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  {filteredPapers.length > 0
                    ? `Showing ${filteredPapers.length} question paper(s) generated in your workspace.`
                    : searchQuery ? "No papers matched your search query." : "No papers saved yet. Generate a paper to view and download here."}
                </p>
              </div>

              <Link
                href="/dashboard/generator"
                className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                New Paper
              </Link>
            </div>

            {filteredPapers.length > 0 ? (
              <div className="space-y-3">
                {filteredPapers.map((paper, idx) => (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl border border-slate-200 hover:border-indigo-300 bg-slate-50/50 hover:bg-white transition-all space-y-4 group shadow-sm"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-700 border border-indigo-200">
                            {paper.class_name || "Class 10"}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-700 border border-purple-200">
                            {paper.subject || "General"}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                            {paper.total_marks || 40} Marks • {paper.time_allowed_mins || 90} Mins
                          </span>
                        </div>
                        <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors">
                          {paper.title}
                        </h3>
                        <p className="text-xs text-slate-500 font-medium line-clamp-1">
                          Chapter: {paper.chapter || "Syllabus"} • {paper.questions?.length || 0} Questions Total
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200">
                        <button
                          onClick={() => handleOpenPaper(paper)}
                          title="Preview / Edit Paper"
                          className="px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 transition-all flex items-center gap-1.5 shadow-xs"
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-600" />
                          View
                        </button>
                        
                        <button
                          onClick={() => handleExportPDF(paper, idx, false)}
                          disabled={downloadingIdx === idx}
                          title="Export Question Paper PDF"
                          className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                        >
                          <Download className="w-3.5 h-3.5" />
                          {downloadingIdx === idx ? "Exporting..." : "PDF"}
                        </button>

                        <button
                          onClick={() => handleExportPDF(paper, idx, true)}
                          disabled={downloadingIdx === idx}
                          title="Export Answer Key PDF"
                          className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                        >
                          <FileCheck className="w-3.5 h-3.5" />
                          Key
                        </button>

                        <button
                          onClick={() => deleteSavedPaper(idx)}
                          title="Delete Paper"
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 text-center space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                  <FileText className="w-6 h-6" />
                </div>
                <div className="space-y-1 max-w-sm mx-auto">
                  <h3 className="text-sm font-bold text-slate-900">No Question Papers Created Yet</h3>
                  <p className="text-xs text-slate-500">
                    Use our AI Question Generator to create high-quality CBSE & NCERT exam papers in seconds.
                  </p>
                </div>
                <Link
                  href="/dashboard/generator"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
                >
                  <Sparkles className="w-4 h-4 text-yellow-300" />
                  Generate First Paper Now
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Right Column (1 Col): Recent AI Agent Chat History */}
        <div className="space-y-5">
          <div className="glass-panel p-6 rounded-3xl border border-slate-200 bg-white shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-indigo-600" />
                Recent AI Chats
              </h2>
              <Link
                href="/dashboard/agents?agent=teacher_mentor"
                className="text-xs font-bold text-indigo-600 hover:underline"
              >
                Open Studio
              </Link>
            </div>

            {loadingConvs ? (
              <div className="space-y-3 py-4">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="h-14 rounded-2xl bg-slate-100 animate-pulse" />
                ))}
              </div>
            ) : conversations.length > 0 ? (
              <div className="space-y-3">
                {conversations.map((c) => (
                  <Link
                    key={c.id}
                    href={`/dashboard/agents?agent=${c.agent_code || "teacher_mentor"}`}
                    className="p-3.5 rounded-2xl border border-slate-100 hover:border-indigo-200 bg-slate-50/60 hover:bg-indigo-50/40 transition-all flex items-center justify-between gap-3 group"
                  >
                    <div className="space-y-0.5 min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate group-hover:text-indigo-600">
                        {c.title}
                      </p>
                      <p className="text-[10px] text-slate-500 font-medium">
                        Agent: {c.agent_code?.replace("_", " ") || "Teacher Mentor"}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 shrink-0 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                ))}
              </div>
            ) : (
              <div className="p-6 rounded-2xl border border-slate-100 bg-slate-50/50 text-center space-y-3">
                <Bot className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="text-xs text-slate-500 font-medium">No recent AI chats found.</p>
                <Link
                  href="/dashboard/agents?agent=teacher_mentor"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:underline"
                >
                  Start New AI Chat <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Teacher Tools & AI Assistants Hub Grid (Matching Sidebar) */}
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
              <Bot className="w-6 h-6 text-indigo-600" />
              Teacher Workspace Tools & AI Assistants
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Quick access to all 9 specialized teacher tools and AI assistants in your workspace.
            </p>
          </div>
        </div>

        {filteredTools.length === 0 ? (
          <div className="p-8 rounded-2xl border border-slate-200 bg-white text-center space-y-2">
            <Search className="w-8 h-8 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-slate-800">No matching tools found</h3>
            <p className="text-xs text-slate-400">Try clearing your search term or adjusting filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredTools.map((tool) => {
              const IconComp = tool.icon;
              return (
                <div
                  key={tool.code}
                  className="glass-panel p-6 rounded-3xl border border-slate-200/80 bg-white hover:border-indigo-300 transition-all space-y-4 group shadow-sm hover:shadow-md flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className={`w-11 h-11 rounded-2xl bg-gradient-to-tr ${tool.color} text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform`}>
                        <IconComp className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200 px-2.5 py-1 rounded-full">
                        {tool.badge}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors">
                        {tool.name}
                      </h3>
                      <p className="text-xs text-slate-500 font-medium leading-relaxed mt-1">
                        {tool.desc}
                      </p>
                    </div>
                  </div>

                  <Link
                    href={tool.href}
                    className="w-full py-2.5 px-4 bg-slate-50 group-hover:bg-indigo-600 text-slate-700 group-hover:text-white font-bold text-xs rounded-xl border border-slate-200 group-hover:border-indigo-600 transition-all flex items-center justify-center gap-2 mt-2 cursor-pointer"
                  >
                    Open Tool
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  </>
);
}
