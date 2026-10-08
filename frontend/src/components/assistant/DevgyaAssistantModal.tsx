"use client";

import React, { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Sparkles,
  Bot,
  X,
  Maximize2,
  Minimize2,
  Send,
  Calendar,
  Compass,
  HelpCircle,
  ChevronRight,
  ChevronDown,
  Check,
  Copy,
  RotateCcw,
  GraduationCap,
  Search,
  ArrowUpRight,
  BookOpen,
  FileText,
  Layers,
  Zap,
  Globe,
  Loader2,
  Bookmark
} from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import Markdown from "@/components/chat/Markdown";
import {
  streamCopilotChat,
  sendCopilotChat,
  fetchCopilotContextInfo,
  CopilotContextInfo,
  CopilotCategory,
  CopilotQuestionItem
} from "@/lib/api";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  isPlan?: boolean;
}

// Built-in fallback questions if backend is offline or loading
const FALLBACK_QUESTIONS: Record<string, CopilotCategory[]> = {
  teacher: [
    {
      name: "📝 Assessment & Question Papers",
      questions: [
        {
          id: "t-1",
          label: "Generate CBSE Board Paper with Blueprint",
          prompt: "How do I create a standard CBSE Class 10 Board exam paper with blueprint, section marks, and answer key in DEVGYA?",
          is_plan: false
        },
        {
          id: "t-2",
          label: "Bloom's Taxonomy Marks Allocation",
          prompt: "How does DEVGYA allocate Bloom's Taxonomy marks (Remembering, Understanding, Application, HOTS) in question papers?",
          is_plan: false
        },
        {
          id: "t-3",
          label: "Add School Watermark & Export PDF",
          prompt: "How do I add my school logo, watermark, and print or export question papers as PDF/Word?",
          is_plan: false
        },
        {
          id: "t-4",
          label: "Generate Case Study & Assertion-Reason",
          prompt: "Can DEVGYA generate CBSE Assertion-Reason questions and Competency-Based Case Study passages?",
          is_plan: false
        }
      ]
    },
    {
      name: "📖 5E Lesson Planning & Classroom",
      questions: [
        {
          id: "t-5",
          label: "Create 5E Lesson Plan for Science",
          prompt: "How do I create a 5E Lesson Plan (Engage, Explore, Explain, Elaborate, Evaluate) for Class 9 Science using DEVGYA?",
          is_plan: false
        },
        {
          id: "t-6",
          label: "Create Custom Worksheets in Content Studio",
          prompt: "How do I create custom printable student worksheets with answer keys in the Teaching Assistant & Content Studio?",
          is_plan: false
        }
      ]
    },
    {
      name: "📊 OCR Grading & Class Analytics",
      questions: [
        {
          id: "t-7",
          label: "Grade Student Answer Sheets via OCR",
          prompt: "How do I use the OCR Exam Grading tool to automatically score handwritten student answer sheets?",
          is_plan: false
        },
        {
          id: "t-8",
          label: "View Weak Topic Analytics & Marks Radar",
          prompt: "Where do I view student performance analytics, chapter-wise weak topics, and class average radar?",
          is_plan: false
        }
      ]
    },
    {
      name: "📅 Action Plans & Curriculum Timetables",
      questions: [
        {
          id: "t-p1",
          label: "15-Day Board Exam Preparation Plan",
          prompt: "Create a professional 15-day CBSE Board Exam preparation & mock assessment plan for Class 10 Math.",
          is_plan: true
        },
        {
          id: "t-p2",
          label: "4-Week Remedial Teaching Strategy",
          prompt: "Design a professional 4-week remedial teaching and practice plan for struggling students in Science.",
          is_plan: true
        },
        {
          id: "t-p3",
          label: "Unit Syllabus Completion Roadmap",
          prompt: "Help me build a structured 3-week unit syllabus completion and testing roadmap for CBSE Class 12.",
          is_plan: true
        }
      ]
    }
  ],
  student: [
    {
      name: "🧠 Socratic AI Tutor & Concepts",
      questions: [
        {
          id: "s-1",
          label: "How to Use Socratic AI Tutor",
          prompt: "How does the Socratic AI Tutor work and how does it guide me step-by-step without spoiling answers?",
          is_plan: false
        },
        {
          id: "s-2",
          label: "XP Points, Streaks & Leaderboard",
          prompt: "How do I earn XP points, maintain daily study streaks, and rank on the school leaderboard?",
          is_plan: false
        }
      ]
    },
    {
      name: "📅 Study Plans & Timetables",
      questions: [
        {
          id: "s-p1",
          label: "30-Day Board Exam Timetable",
          prompt: "Make a professional 30-day CBSE Board Exam revision timetable for Class 10 with 3-hour daily slots.",
          is_plan: true
        }
      ]
    }
  ],
  parent: [
    {
      name: "👨‍👩‍👧 Monitoring & Guidance",
      questions: [
        {
          id: "p-1",
          label: "View Study Hours & Weak Subjects",
          prompt: "How do I track my child's daily learning hours, test scores, and weak subject areas on DEVGYA?",
          is_plan: false
        },
        {
          id: "p-2",
          label: "Healthy Home Study Schedule",
          prompt: "Create a balanced home study and rest schedule for a CBSE board exam student.",
          is_plan: true
        }
      ]
    }
  ],
  landing: [
    {
      name: "🌟 Platform Overview & AI Tools",
      questions: [
        {
          id: "l-1",
          label: "What is DEVGYA Edutech?",
          prompt: "What is DEVGYA GLOBAL EDUTECH and what solutions does it provide for schools, teachers, and students?",
          is_plan: false
        },
        {
          id: "l-2",
          label: "How Does Question Paper Generator Work?",
          prompt: "How does the AI Question Paper Generator create CBSE/NCERT papers with blueprints in 60 seconds?",
          is_plan: false
        },
        {
          id: "l-3",
          label: "Certified Science Labs Setup",
          prompt: "How do schools partner with DEVGYA for certified Physics, Chemistry, Biology, and Composite labs?",
          is_plan: false
        }
      ]
    },
    {
      name: "📅 Onboarding & Implementation Plans",
      questions: [
        {
          id: "l-p1",
          label: "30-Day School AI Adoption Plan",
          prompt: "Create a professional 30-day school rollout plan to introduce DEVGYA AI tools to teachers and students.",
          is_plan: true
        }
      ]
    }
  ]
};

export default function DevgyaAssistantModal() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAppStore();

  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<"chat" | "questions" | "planner" | "tools">("chat");
  const [language, setLanguage] = useState<"english" | "hindi" | "hinglish">("english");
  const [inputMessage, setInputMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [searchQuestionQuery, setSearchQuestionQuery] = useState("");
  const [contextInfo, setContextInfo] = useState<CopilotContextInfo | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [hasPromptNotification, setHasPromptNotification] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // 1. Determine Context strictly according to user location & role
  const isStudentRoute = pathname?.startsWith("/dashboard/student") || (pathname?.startsWith("/dashboard") && user?.role === "student");
  const isParentRoute = pathname?.startsWith("/dashboard/parent") || (pathname?.startsWith("/dashboard") && user?.role === "parent");
  const isTeacherRoute = (pathname?.startsWith("/dashboard") && !isStudentRoute && !isParentRoute) || user?.role === "teacher";

  const currentContext: "teacher" | "student" | "parent" | "landing" =
    isTeacherRoute ? "teacher" :
    isStudentRoute ? "student" :
    isParentRoute ? "parent" : "landing";

  // 2. Fetch context configuration & pre-existing questions
  useEffect(() => {
    let isMounted = true;
    async function loadContext() {
      try {
        const info = await fetchCopilotContextInfo(currentContext, pathname || "/");
        if (isMounted) setContextInfo(info);
      } catch {
        // Handled silently by fallback
      }
    }
    loadContext();
    return () => {
      isMounted = false;
    };
  }, [currentContext, pathname]);

  // 3. Initial welcome message on first load or context switch
  useEffect(() => {
    if (messages.length === 0) {
      let welcomeContent = "";
      if (currentContext === "teacher") {
        welcomeContent =
          "👋 **Namaste Educator! I am your DEVGYA Teacher Copilot.**\n\n" +
          "I am strictly dedicated to assisting you across the **Teacher Dashboard**:\n" +
          "- 📝 **CBSE / NCERT Question Papers**: Generate board mocks with blueprints, Bloom's tags, and marking keys.\n" +
          "- 📖 **5E Lesson Plans**: Structured pedagogical plans (Engage, Explore, Explain, Elaborate, Evaluate).\n" +
          "- 📊 **OCR Grading & Marks Radar**: Evaluate handwritten answer sheets & track weak topic diagnostics.\n" +
          "- 📅 **Make a Plan**: Ask me to build an actionable syllabus timeline, revision schedule, or remedial strategy.\n\n" +
          "*Click any suggested question below or type your instruction to get started!*";
      } else if (currentContext === "student") {
        welcomeContent =
          "👋 **Hey Champion! I'm your DEVGYA Student Study Guide.**\n\n" +
          "I'm here to help you conquer NCERT concepts, practice MCQs, review flashcards, maintain your daily study streak, and build customized exam timetables.\n\n" +
          "What topic or chapter are we mastering today?";
      } else if (currentContext === "parent") {
        welcomeContent =
          "👋 **Hello! I am your DEVGYA Parent Guidance Advisor.**\n\n" +
          "I help you review your child's daily learning hours, understand subject radar charts, and share practical strategies to support their CBSE studies with confidence.";
      } else {
        welcomeContent =
          "👋 **Welcome to DEVGYA GLOBAL EDUTECH! I am your Site AI Guide.**\n\n" +
          "I can guide you through our AI Question Paper Generator, 5E Lesson Planner, Socratic Student Tutor, and Certified Science Lab setups for CBSE/NCERT schools.\n\n" +
          "How can I help you explore or get started today?";
      }

      setMessages([
        {
          id: "welcome",
          role: "assistant",
          content: welcomeContent,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        }
      ]);
    }
  }, [currentContext, messages.length]);

  // Scroll to bottom on new message
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
      setHasPromptNotification(false);
    }
  }, [isOpen]);

  // Get active pre-existing questions list (remote or fallback)
  const categories: CopilotCategory[] =
    contextInfo?.categories || FALLBACK_QUESTIONS[currentContext] || FALLBACK_QUESTIONS.landing;

  // Filtered questions based on search query
  const allQuestions: CopilotQuestionItem[] = categories.flatMap((c) => c.questions);
  const displayedQuestions = searchQuestionQuery.trim()
    ? allQuestions.filter(
        (q) =>
          q.label.toLowerCase().includes(searchQuestionQuery.toLowerCase()) ||
          q.prompt.toLowerCase().includes(searchQuestionQuery.toLowerCase())
      )
    : allQuestions;

  // Send a message
  const handleSendMessage = async (msgText?: string, isPlanRequest: boolean = false) => {
    const textToSend = (msgText ?? inputMessage).trim();
    if (!textToSend || isStreaming) return;

    setInputMessage("");
    setActiveTab("chat");

    const userMessageId = `usr-${Date.now()}`;
    const assistantMessageId = `ast-${Date.now()}`;

    const newMessages: ChatMessage[] = [
      ...messages,
      {
        id: userMessageId,
        role: "user",
        content: textToSend,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        isPlan: isPlanRequest
      },
      {
        id: assistantMessageId,
        role: "assistant",
        content: "",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        isPlan: isPlanRequest
      }
    ];

    setMessages(newMessages);
    setIsStreaming(true);

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    const recentHistory = messages.slice(-4).map((m) => ({
      role: m.role,
      content: m.content
    }));

    try {
      let accumulated = "";
      await streamCopilotChat(
        {
          message: textToSend,
          context: currentContext,
          current_path: pathname || "/",
          language,
          is_plan: isPlanRequest,
          user_id: user?.email || "usr-guest",
          user_role: user?.role || "guest",
          history: recentHistory
        },
        (chunk) => {
          accumulated += chunk;
          setMessages((prev) =>
            prev.map((m) => (m.id === assistantMessageId ? { ...m, content: accumulated } : m))
          );
        },
        abortController.signal
      );
    } catch {
      // In case streaming had an error, try regular completion fallback
      try {
        const res = await sendCopilotChat({
          message: textToSend,
          context: currentContext,
          current_path: pathname || "/",
          language,
          is_plan: isPlanRequest,
          user_id: user?.email || "usr-guest",
          user_role: user?.role || "guest",
          history: recentHistory
        });
        setMessages((prev) =>
          prev.map((m) => (m.id === assistantMessageId ? { ...m, content: res.reply } : m))
        );
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : "Something went wrong";
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMessageId
              ? {
                  ...m,
                  content: `⚠️ **Apologies**: I encountered a temporary connection glitch (${errorMsg}). Please check your connection or try again.`
                }
              : m
          )
        );
      }
    } finally {
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  };

  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleResetChat = () => {
    setMessages([]);
    setActiveTab("chat");
  };

  return (
    <>
      {/* ========================================================= */}
      {/* FLOATING TRIGGER BUTTON (Always visible across all pages) */}
      {/* ========================================================= */}
      <div className="fixed bottom-6 right-6 z-40 flex items-center gap-2 group print:hidden">
        {/* Helper Hint Pill */}
        {!isOpen && (
          <div
            onClick={() => setIsOpen(true)}
            className="hidden sm:flex items-center gap-2 py-2 px-3.5 bg-white/95 backdrop-blur-md rounded-full border border-indigo-200/80 shadow-lg shadow-indigo-500/10 text-xs font-semibold text-slate-800 cursor-pointer hover:border-indigo-400 hover:shadow-indigo-500/20 transition-all transform hover:-translate-y-0.5"
          >
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-extrabold text-indigo-700">DEVGYA AI:</span>
            <span>
              {isTeacherRoute
                ? "Teacher Copilot"
                : isStudentRoute
                ? "Student Guide"
                : isParentRoute
                ? "Parent Coach"
                : "Ask Anything or Plan"}
            </span>
            <span className="text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-200 px-1.5 py-0.5 rounded-full font-bold">
              {isTeacherRoute ? "Teacher Mode" : "AI"}
            </span>
          </div>
        )}

        {/* Main Floating Trigger Button */}
        <button
          id="devgya-copilot-trigger"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Open DEVGYA AI Assistant"
          className="relative flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-purple-600 text-white shadow-xl shadow-indigo-600/35 hover:shadow-2xl hover:shadow-indigo-600/50 hover:scale-105 active:scale-95 transition-all duration-200 border-2 border-white/20"
        >
          {isOpen ? (
            <X className="w-6 h-6 text-white" />
          ) : (
            <>
              <Bot className="w-7 h-7 text-white" />
              <Sparkles className="w-3.5 h-3.5 text-amber-300 absolute -top-1 -right-1 animate-bounce" />
              {hasPromptNotification && (
                <span className="absolute -top-1 -left-1 flex h-3.5 w-3.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500" />
                </span>
              )}
            </>
          )}
        </button>
      </div>

      {/* ========================================================= */}
      {/* COPILOT CHAT MODAL / DOCKED WINDOW                        */}
      {/* ========================================================= */}
      {isOpen && (
        <div
          className={`fixed z-50 bg-white/95 backdrop-blur-xl border border-slate-200/90 shadow-2xl rounded-3xl flex flex-col overflow-hidden transition-all duration-300 print:hidden ${
            isExpanded
              ? "inset-4 sm:inset-8 md:inset-12 w-auto h-auto max-w-5xl mx-auto"
              : "bottom-24 right-4 sm:right-6 w-[calc(100vw-2rem)] sm:w-[480px] h-[640px] max-h-[85vh]"
          }`}
          style={{ boxShadow: "0 25px 60px -15px rgba(79, 70, 229, 0.25)" }}
        >
          {/* HEADER BAR */}
          <div className="relative px-5 py-4 bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 text-white flex items-center justify-between border-b border-indigo-700/50 select-none">
            {/* Left: Avatar + Title + Active Context Badge */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white shrink-0 shadow-inner">
                {isTeacherRoute ? (
                  <GraduationCap className="w-5 h-5 text-amber-300" />
                ) : isStudentRoute ? (
                  <BookOpen className="w-5 h-5 text-cyan-300" />
                ) : (
                  <Bot className="w-5 h-5 text-indigo-200" />
                )}
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-indigo-900" />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-black text-sm text-white tracking-tight truncate">
                    {isTeacherRoute ? "DEVGYA Teacher Copilot" : "DEVGYA AI Assistant"}
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold tracking-wide uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                    {isTeacherRoute ? "Teacher Mode" : "Online"}
                  </span>
                </div>
                <p className="text-[11px] text-indigo-200/90 truncate font-medium">
                  {isTeacherRoute
                    ? "Strictly Teacher Dashboard & Assessment Specialist"
                    : isStudentRoute
                    ? "Socratic AI Tutor & Exam Timetables"
                    : isParentRoute
                    ? "Progress Monitor & Parenting Coach"
                    : "Site Guide & Academic Solutions"}
                </p>
              </div>
            </div>

            {/* Right: Controls (Language, Maximize, Close) */}
            <div className="flex items-center gap-1.5 shrink-0">
              {/* Language Selector */}
              <div className="relative flex items-center bg-white/10 rounded-lg p-0.5 border border-white/15 text-[11px] font-semibold text-white">
                <button
                  onClick={() => setLanguage("english")}
                  title="English Mode"
                  className={`px-1.5 py-0.5 rounded transition ${
                    language === "english" ? "bg-white text-indigo-950 font-bold shadow-sm" : "text-white/80 hover:text-white"
                  }`}
                >
                  EN
                </button>
                <button
                  onClick={() => setLanguage("hinglish")}
                  title="Hinglish Mode"
                  className={`px-1.5 py-0.5 rounded transition ${
                    language === "hinglish" ? "bg-white text-indigo-950 font-bold shadow-sm" : "text-white/80 hover:text-white"
                  }`}
                >
                  HI-EN
                </button>
                <button
                  onClick={() => setLanguage("hindi")}
                  title="हिंदी Mode"
                  className={`px-1.5 py-0.5 rounded transition ${
                    language === "hindi" ? "bg-white text-indigo-950 font-bold shadow-sm" : "text-white/80 hover:text-white"
                  }`}
                >
                  हिंदी
                </button>
              </div>

              {/* Reset Session */}
              <button
                onClick={handleResetChat}
                title="New Chat Session"
                className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              {/* Expand / Minimize */}
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                title={isExpanded ? "Collapse Window" : "Expand Window"}
                className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition hidden sm:block"
              >
                {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>

              {/* Close Button */}
              <button
                onClick={() => setIsOpen(false)}
                title="Close"
                className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* SUB-NAV TABS */}
          <div className="flex items-center px-4 py-2 bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 gap-1.5 overflow-x-auto select-none">
            <button
              onClick={() => setActiveTab("chat")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition shrink-0 ${
                activeTab === "chat"
                  ? "bg-indigo-600 text-white font-bold shadow-sm"
                  : "bg-white border border-slate-200 hover:bg-slate-100 text-slate-700"
              }`}
            >
              <Bot className="w-3.5 h-3.5" />
              <span>Chat & Assist</span>
            </button>

            <button
              onClick={() => setActiveTab("questions")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition shrink-0 ${
                activeTab === "questions"
                  ? "bg-indigo-600 text-white font-bold shadow-sm"
                  : "bg-white border border-slate-200 hover:bg-slate-100 text-slate-700"
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5 text-amber-500" />
              <span>Pre-Existing Questions</span>
              <span className="text-[10px] bg-amber-100 text-amber-800 font-extrabold px-1.5 rounded-full">
                {allQuestions.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("planner")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition shrink-0 ${
                activeTab === "planner"
                  ? "bg-indigo-600 text-white font-bold shadow-sm"
                  : "bg-white border border-slate-200 hover:bg-slate-100 text-slate-700"
              }`}
            >
              <Calendar className="w-3.5 h-3.5 text-emerald-500" />
              <span>Make a Plan 📅</span>
            </button>

            <button
              onClick={() => setActiveTab("tools")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition shrink-0 ${
                activeTab === "tools"
                  ? "bg-indigo-600 text-white font-bold shadow-sm"
                  : "bg-white border border-slate-200 hover:bg-slate-100 text-slate-700"
              }`}
            >
              <Compass className="w-3.5 h-3.5 text-indigo-500" />
              <span>Site Jump</span>
            </button>
          </div>

          {/* MAIN BODY AREA (Tab Dependent) */}
          <div className="flex-1 overflow-hidden flex flex-col bg-slate-50/50">
            {/* TAB 1: CHAT FEED */}
            {activeTab === "chat" && (
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Context notification chip inside chat */}
                {isTeacherRoute && (
                  <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-900 text-xs flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-amber-600 shrink-0" />
                      <span className="font-semibold">
                        Teacher Dashboard Active: Questions & answers are focused exclusively on teacher workflows.
                      </span>
                    </div>
                  </div>
                )}

                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}
                  >
                    <div
                      className={`relative max-w-[92%] rounded-2xl p-4 text-sm leading-relaxed shadow-sm ${
                        m.role === "user"
                          ? "bg-indigo-600 text-white rounded-br-none"
                          : "bg-white border border-slate-200 text-slate-800 rounded-bl-none shadow-slate-200/50"
                      }`}
                    >
                      {/* Assistant Badge Header */}
                      {m.role === "assistant" && (
                        <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-100 text-[11px] font-bold text-indigo-700">
                          <div className="flex items-center gap-1.5">
                            <Bot className="w-3.5 h-3.5 text-indigo-600" />
                            <span>{isTeacherRoute ? "DEVGYA Teacher Copilot" : "DEVGYA AI"}</span>
                            {m.isPlan && (
                              <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded-full font-extrabold">
                                📅 Action Plan
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1 text-slate-400 font-normal">
                            <span>{m.timestamp}</span>
                            <button
                              onClick={() => handleCopyMessage(m.id, m.content)}
                              title="Copy Answer"
                              className="p-1 hover:text-slate-700 hover:bg-slate-100 rounded transition"
                            >
                              {copiedId === m.id ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Content */}
                      {m.role === "user" ? (
                        <p className="whitespace-pre-wrap font-medium">{m.content}</p>
                      ) : (
                        <div className="prose prose-sm max-w-none prose-indigo prose-headings:font-bold prose-headings:text-slate-900 prose-p:my-1 prose-ul:my-1 prose-table:my-2">
                          {m.content ? (
                            <Markdown content={m.content} />
                          ) : (
                            <div className="flex items-center gap-2 py-2 text-indigo-600 text-xs font-semibold animate-pulse">
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span>Thinking & structuring guidance...</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}

            {/* TAB 2: PRE-EXISTING QUESTIONS & FAQS */}
            {activeTab === "questions" && (
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Search questions bar */}
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuestionQuery}
                    onChange={(e) => setSearchQuestionQuery(e.target.value)}
                    placeholder="Search pre-existing questions & tutorials..."
                    className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
                  />
                  {searchQuestionQuery && (
                    <button
                      onClick={() => setSearchQuestionQuery("")}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="space-y-4">
                  {categories.map((cat, idx) => {
                    const filteredCatQuestions = cat.questions.filter((q) =>
                      displayedQuestions.some((dq) => dq.id === q.id)
                    );
                    if (filteredCatQuestions.length === 0) return null;

                    return (
                      <div key={idx} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
                        <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-2.5 flex items-center gap-2">
                          <span>{cat.name}</span>
                          <span className="text-[10px] text-slate-400 font-semibold">
                            ({filteredCatQuestions.length})
                          </span>
                        </h4>

                        <div className="space-y-2">
                          {filteredCatQuestions.map((q) => (
                            <button
                              key={q.id}
                              onClick={() => handleSendMessage(q.prompt, q.is_plan)}
                              className="w-full text-left p-2.5 rounded-xl bg-slate-50 hover:bg-indigo-50/80 border border-slate-200/70 hover:border-indigo-200 text-xs text-slate-700 hover:text-indigo-900 transition flex items-center justify-between group"
                            >
                              <div className="flex items-center gap-2.5 pr-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 group-hover:scale-125 transition" />
                                <span className="font-semibold">{q.label}</span>
                              </div>
                              <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 shrink-0 transition" />
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 3: MAKE A PLAN MODE */}
            {activeTab === "planner" && (
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 border border-indigo-100">
                  <div className="flex items-center gap-2 text-indigo-900 font-black text-sm mb-1">
                    <Calendar className="w-4 h-4 text-indigo-600" />
                    <span>DEVGYA Action Planner & Execution Engine</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Tell DEVGYA what you need to achieve. The AI Assistant will formulate a professional,
                    step-by-step roadmap with direct links to DEVGYA tools so you can make it happen right away.
                  </p>
                </div>

                <div className="space-y-2.5">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    {isTeacherRoute ? "Teacher Plan Templates" : "Popular Execution Plans"}
                  </h4>

                  {isTeacherRoute ? (
                    <>
                      <button
                        onClick={() =>
                          handleSendMessage(
                            "Create a professional 15-day CBSE Board Exam preparation & mock assessment plan for Class 10 Math.",
                            true
                          )
                        }
                        className="w-full p-3 text-left rounded-xl bg-white border border-slate-200 hover:border-indigo-400 hover:shadow-md transition group"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-slate-900 group-hover:text-indigo-600">
                            🎯 15-Day Class 10 Math Board Exam Mock Plan
                          </span>
                          <span className="text-[10px] font-extrabold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                            Execute
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">
                          Includes blueprint allocation, periodic tests, review milestones, and answer keys.
                        </p>
                      </button>

                      <button
                        onClick={() =>
                          handleSendMessage(
                            "Design a professional 4-week remedial teaching and practice plan for struggling students in Science.",
                            true
                          )
                        }
                        className="w-full p-3 text-left rounded-xl bg-white border border-slate-200 hover:border-indigo-400 hover:shadow-md transition group"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-slate-900 group-hover:text-indigo-600">
                            🔬 4-Week Science Remedial Teaching Strategy
                          </span>
                          <span className="text-[10px] font-extrabold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                            Execute
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">
                          Uses student marks radar insights to target weak chapters with bite-sized worksheets.
                        </p>
                      </button>

                      <button
                        onClick={() =>
                          handleSendMessage(
                            "Create an active 5E Lesson Plan unit strategy for Class 9 Motion with hands-on lab experiments.",
                            true
                          )
                        }
                        className="w-full p-3 text-left rounded-xl bg-white border border-slate-200 hover:border-indigo-400 hover:shadow-md transition group"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-slate-900 group-hover:text-indigo-600">
                            📖 5E Unit Plan with Science Lab Experiments
                          </span>
                          <span className="text-[10px] font-extrabold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                            Execute
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">
                          Engage, Explore, Explain, Elaborate, Evaluate sequence with printable rubrics.
                        </p>
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() =>
                          handleSendMessage(
                            "Make a 30-day CBSE Board Exam revision timetable for Class 10 with 3-hour daily slots.",
                            true
                          )
                        }
                        className="w-full p-3 text-left rounded-xl bg-white border border-slate-200 hover:border-indigo-400 hover:shadow-md transition group"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-slate-900 group-hover:text-indigo-600">
                            🗓️ 30-Day CBSE Board Exam Timetable
                          </span>
                          <span className="text-[10px] font-extrabold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                            Execute
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">
                          Balanced morning and evening slots with active recall quizzes.
                        </p>
                      </button>

                      <button
                        onClick={() =>
                          handleSendMessage(
                            "Create a 30-day school rollout plan to introduce DEVGYA AI tools to teachers and students.",
                            true
                          )
                        }
                        className="w-full p-3 text-left rounded-xl bg-white border border-slate-200 hover:border-indigo-400 hover:shadow-md transition group"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-slate-900 group-hover:text-indigo-600">
                            🏫 30-Day School AI Adoption & Training Roadmap
                          </span>
                          <span className="text-[10px] font-extrabold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                            Execute
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">
                          Staff workshops, pilot test papers, student onboarding, and lab integrations.
                        </p>
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* TAB 4: DIRECT SITE JUMP (Make It Happen) */}
            {activeTab === "tools" && (
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs text-slate-600">
                  Click any tool to navigate immediately. The AI Assistant stays with you.
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {(contextInfo?.quick_links || []).map((link, i) => (
                    <Link
                      key={i}
                      href={link.path}
                      onClick={() => {
                        if (!isExpanded) {
                          // Keep chat open or minimize if user wants
                        }
                      }}
                      className="p-3 rounded-xl bg-white border border-slate-200 hover:border-indigo-400 hover:shadow-md transition group flex flex-col justify-between"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-xs text-slate-900 group-hover:text-indigo-600">
                          {link.label}
                        </span>
                        <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 transition" />
                      </div>
                      <span className="text-[10px] font-extrabold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full w-fit">
                        {link.badge}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* SUGGESTION CHIPS (Above Input Bar in Chat Mode) */}
          {activeTab === "chat" && (
            <div className="px-4 py-2 bg-slate-50/80 border-t border-slate-200/80 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider shrink-0 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-indigo-600" /> Quick Ask:
              </span>
              {displayedQuestions.slice(0, 4).map((q) => (
                <button
                  key={q.id}
                  onClick={() => handleSendMessage(q.prompt, q.is_plan)}
                  className="px-2.5 py-1 rounded-full bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 text-[11px] font-semibold text-slate-700 hover:text-indigo-900 transition whitespace-nowrap shadow-2xs shrink-0"
                >
                  {q.label}
                </button>
              ))}
            </div>
          )}

          {/* INPUT BAR */}
          <div className="p-3 bg-white border-t border-slate-200">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-end gap-2"
            >
              <div className="flex-1 relative">
                <textarea
                  ref={inputRef}
                  rows={2}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder={
                    isTeacherRoute
                      ? "Ask about Teacher Dashboard, create CBSE papers, 5E plans, or say 'Make a plan'..."
                      : isStudentRoute
                      ? "Ask any NCERT concept, solve step-by-step, or ask for a study timetable..."
                      : "Ask anything about DEVGYA, school lab setup, or ask to create a plan..."
                  }
                  className="w-full resize-none px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                />
              </div>

              <button
                type="submit"
                disabled={!inputMessage.trim() || isStreaming}
                className={`flex items-center justify-center h-10 w-10 rounded-2xl bg-indigo-600 text-white shadow-md transition shrink-0 ${
                  inputMessage.trim() && !isStreaming
                    ? "hover:bg-indigo-700 hover:shadow-indigo-500/25 active:scale-95"
                    : "opacity-40 cursor-not-allowed"
                }`}
              >
                {isStreaming ? (
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </form>

            <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-500 px-1">
              <span>
                {isTeacherRoute
                  ? "🎓 Restricted strictly to Teacher Dashboard & tools"
                  : "💡 Aligned with CBSE & NCERT curriculum"}
              </span>
              <span className="text-slate-500 font-medium">Press Enter to send</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
