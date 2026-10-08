"use client";

import React, { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import {
  Sparkles,
  Bot,
  X,
  Maximize2,
  Minimize2,
  Send,
  RotateCcw,
  ArrowRight,
  Loader2
} from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import Markdown from "@/components/chat/Markdown";
import {
  streamCopilotChat,
  sendCopilotChat,
  fetchCopilotContextInfo,
  CopilotContextInfo,
  CopilotQuestionItem
} from "@/lib/api";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

// Fallback pre-existing questions by role context
const PRE_EXISTING_QUESTIONS_BY_ROLE: Record<string, CopilotQuestionItem[]> = {
  teacher: [
    {
      id: "t-1",
      label: "How do I create a CBSE Question Paper with Blueprint?",
      prompt: "How do I create a standard CBSE Question Paper with Blueprint, section marks, and answer key in DEVGYA?"
    },
    {
      id: "t-2",
      label: "How do I create a 5E Lesson Plan for my class?",
      prompt: "How do I create a 5E Lesson Plan (Engage, Explore, Explain, Elaborate, Evaluate) using DEVGYA?"
    },
    {
      id: "t-3",
      label: "How do I scan & grade student answer sheets with OCR?",
      prompt: "How do I use the OCR Exam Grading tool to automatically score handwritten student answer sheets?"
    },
    {
      id: "t-4",
      label: "Where do I track student weak topics and marks radar?",
      prompt: "Where do I view student performance analytics, chapter-wise weak topics, and class average radar?"
    },
    {
      id: "t-5",
      label: "How do I export papers with school watermark as PDF?",
      prompt: "How do I add my school logo, watermark, and print or export question papers as PDF/Word?"
    }
  ],
  student: [
    {
      id: "s-1",
      label: "How do I start studying with Socratic AI Tutor?",
      prompt: "How does the Socratic AI Tutor work and how do I use it to learn concepts step-by-step?"
    },
    {
      id: "s-2",
      label: "Where can I take NCERT practice quizzes and test speed?",
      prompt: "Where can I take chapter-wise NCERT practice quizzes and review my results?"
    },
    {
      id: "s-3",
      label: "How do I earn XP, study streaks, and rank on leaderboard?",
      prompt: "How do I earn XP points, maintain daily study streaks, and rank on the school leaderboard?"
    },
    {
      id: "s-4",
      label: "How do digital flashcards and 2-min revision work?",
      prompt: "How do I access digital flashcards and quick revision summaries on DEVGYA?"
    }
  ],
  parent: [
    {
      id: "p-1",
      label: "How do I track my child's daily study hours and weak subjects?",
      prompt: "How do I track my child's daily learning hours, test scores, and weak subject areas on DEVGYA?"
    },
    {
      id: "p-2",
      label: "Where can I view my child's exam scores and marks radar?",
      prompt: "Where can I view my child's diagnostic test reports and performance radar in the Parent Portal?"
    },
    {
      id: "p-3",
      label: "What tools and guidance are available for parents on DEVGYA?",
      prompt: "What tools and parenting guidance features does DEVGYA provide in the parent dashboard?"
    }
  ],
  landing: [
    {
      id: "l-1",
      label: "What is DEVGYA GLOBAL EDUTECH and what solutions does it provide?",
      prompt: "What is DEVGYA GLOBAL EDUTECH and what solutions does it provide for schools, teachers, and students?"
    },
    {
      id: "l-2",
      label: "How does the AI Question Paper Generator work?",
      prompt: "How does the AI Question Paper Generator create CBSE/NCERT papers with blueprints in 60 seconds?"
    },
    {
      id: "l-3",
      label: "What is the 5E Lesson Planner for teachers?",
      prompt: "Explain the 5E Lesson Planner tool and how it helps teachers save 10+ hours per week."
    },
    {
      id: "l-4",
      label: "How can schools partner for Certified Science Labs?",
      prompt: "How do schools partner with DEVGYA for certified Physics, Chemistry, Biology, and Composite labs?"
    },
    {
      id: "l-5",
      label: "How do I register an account on DEVGYA?",
      prompt: "How do I register an account on DEVGYA as a Teacher, Student, or School Administrator?"
    }
  ]
};

const WELCOME_MESSAGE_TEXT = "Welcome to DEVGYA AI Assistant! Tell me, how can I help you?";

export default function DevgyaAssistantModal() {
  const pathname = usePathname();
  const { user } = useAppStore();

  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [inputMessage, setInputMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [contextInfo, setContextInfo] = useState<CopilotContextInfo | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // 1. Determine active user context
  const isStudentRoute = pathname?.startsWith("/dashboard/student") || (pathname?.startsWith("/dashboard") && user?.role === "student");
  const isParentRoute = pathname?.startsWith("/dashboard/parent") || (pathname?.startsWith("/dashboard") && user?.role === "parent");
  const isTeacherRoute = (pathname?.startsWith("/dashboard") && !isStudentRoute && !isParentRoute) || user?.role === "teacher";

  const currentContext: "teacher" | "student" | "parent" | "landing" =
    isTeacherRoute ? "teacher" :
    isStudentRoute ? "student" :
    isParentRoute ? "parent" : "landing";

  // 2. Fetch context questions if available
  useEffect(() => {
    let isMounted = true;
    async function loadContext() {
      try {
        const info = await fetchCopilotContextInfo(currentContext, pathname || "/");
        if (isMounted) setContextInfo(info);
      } catch {
        // Silently handled by fallback
      }
    }
    loadContext();
    return () => {
      isMounted = false;
    };
  }, [currentContext, pathname]);

  // 3. Initialize chat with the single clean welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: "welcome",
          role: "assistant",
          content: WELCOME_MESSAGE_TEXT,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        }
      ]);
    }
  }, [messages.length]);

  // Auto-scroll on new message
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  // Get suggested pre-existing questions list
  const suggestedQuestions: CopilotQuestionItem[] =
    (contextInfo?.questions && contextInfo.questions.length > 0)
      ? contextInfo.questions
      : PRE_EXISTING_QUESTIONS_BY_ROLE[currentContext] || PRE_EXISTING_QUESTIONS_BY_ROLE.landing;

  // Handle message sending (user typing or pre-existing question click)
  const handleSendMessage = async (customPrompt?: string) => {
    const textToSend = (customPrompt ?? inputMessage).trim();
    if (!textToSend || isStreaming) return;

    setInputMessage("");

    const userMessageId = `usr-${Date.now()}`;
    const assistantMessageId = `ast-${Date.now()}`;

    const newMessages: ChatMessage[] = [
      ...messages,
      {
        id: userMessageId,
        role: "user",
        content: textToSend,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      },
      {
        id: assistantMessageId,
        role: "assistant",
        content: "",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
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
      // Streaming fallback to standard completion
      try {
        const res = await sendCopilotChat({
          message: textToSend,
          context: currentContext,
          current_path: pathname || "/",
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
                  content: `⚠️ **Connection Issue**: Unable to contact AI assistance right now (${errorMsg}). Please try again.`
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

  const handleResetChat = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsStreaming(false);
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content: WELCOME_MESSAGE_TEXT,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      }
    ]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Do not show AI assistant on the landing page or outside the dashboard
  if (!pathname || pathname === "/" || !pathname.startsWith("/dashboard")) {
    return null;
  }

  const roleBadgeText =
    currentContext === "teacher"
      ? "Teacher Guide"
      : currentContext === "student"
      ? "Student Guide"
      : currentContext === "parent"
      ? "Parent Guide"
      : "Site Guide";

  return (
    <>
      {/* ========================================================= */}
      {/* FLOATING TRIGGER BUTTON (Elevated on mobile with prominent size) */}
      {/* ========================================================= */}
      <div className="fixed bottom-28 sm:bottom-6 right-4 sm:right-6 z-40 flex items-center gap-2 group print:hidden">
        {/* Desktop Helper Pill */}
        {!isOpen && (
          <div
            onClick={() => setIsOpen(true)}
            className="hidden sm:flex items-center gap-2 py-2 px-3.5 bg-white/95 backdrop-blur-md rounded-full border border-indigo-200/80 shadow-lg shadow-indigo-500/10 text-xs font-semibold text-slate-800 cursor-pointer hover:border-indigo-400 hover:shadow-indigo-500/20 transition-all transform hover:-translate-y-0.5"
          >
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-extrabold text-indigo-700">DEVGYA AI Assistant</span>
            <span className="text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-200 px-1.5 py-0.5 rounded-full font-bold">
              {roleBadgeText}
            </span>
          </div>
        )}

        {/* Main Floating Trigger Button */}
        <button
          id="devgya-copilot-trigger"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Open DEVGYA AI Assistant"
          className="relative flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-purple-600 text-white shadow-xl shadow-indigo-600/40 hover:shadow-2xl hover:shadow-indigo-600/50 hover:scale-105 active:scale-95 transition-all duration-200 border-2 border-white/20 cursor-pointer"
        >
          {isOpen ? (
            <X className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
          ) : (
            <>
              <Bot className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
              <Sparkles className="w-4 h-4 text-amber-300 absolute -top-1 -right-1 animate-bounce" />
            </>
          )}
        </button>
      </div>

      {/* ========================================================= */}
      {/* CHAT MODAL WINDOW */}
      {/* ========================================================= */}
      {isOpen && (
        <div
          className={`fixed z-50 flex flex-col bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden transition-all duration-300 print:hidden ${
            isExpanded
              ? "inset-3 sm:inset-6"
              : "inset-x-2 bottom-24 top-14 sm:inset-auto sm:bottom-6 sm:right-6 sm:w-[460px] sm:h-[620px]"
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-indigo-700 via-indigo-600 to-purple-700 text-white shadow-sm shrink-0">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-white/15 backdrop-blur-md border border-white/20 shrink-0">
                <Bot className="w-5 h-5 text-white" />
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-indigo-700" />
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-sm tracking-tight truncate flex items-center gap-1.5">
                  <span>DEVGYA AI Assistant</span>
                  <span className="text-[10px] bg-white/20 text-white font-semibold px-2 py-0.5 rounded-full">
                    {roleBadgeText}
                  </span>
                </h3>
                <p className="text-[11px] text-indigo-100/90 truncate">
                  Platform & Navigation Guide
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 text-white/90">
              <button
                onClick={handleResetChat}
                title="Reset Chat"
                className="p-1.5 hover:bg-white/15 rounded-lg transition-colors cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                title={isExpanded ? "Minimize" : "Maximize"}
                className="hidden sm:block p-1.5 hover:bg-white/15 rounded-lg transition-colors cursor-pointer"
              >
                {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Close"
                className="p-1.5 hover:bg-white/15 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/70">
            {messages.map((msg) => {
              const isAssistant = msg.role === "assistant";
              const isWelcomeMessage = msg.id === "welcome";

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isAssistant ? "items-start" : "items-end"}`}
                >
                  <div
                    className={`max-w-[88%] rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed shadow-2xs ${
                      isAssistant
                        ? "bg-white text-slate-800 border border-slate-200/90"
                        : "bg-gradient-to-r from-indigo-600 to-indigo-700 text-white"
                    }`}
                  >
                    {isAssistant ? (
                      <div>
                        {msg.content ? (
                          <Markdown content={msg.content} />
                        ) : isStreaming ? (
                          <div className="flex items-center gap-2 text-indigo-600 py-1">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span className="text-xs font-medium">Generating guidance...</span>
                          </div>
                        ) : null}

                        {/* Pre-existing questions shown in bottom of welcome message */}
                        {isWelcomeMessage && (
                          <div className="mt-3.5 pt-3 border-t border-slate-200/80">
                            <p className="text-[11px] font-semibold text-slate-500 mb-2 flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                              <span>Frequently Asked Questions:</span>
                            </p>
                            <div className="flex flex-col gap-1.5">
                              {suggestedQuestions.map((q) => (
                                <button
                                  key={q.id}
                                  onClick={() => handleSendMessage(q.prompt)}
                                  disabled={isStreaming}
                                  className="text-left text-xs font-medium text-slate-700 hover:text-indigo-700 bg-slate-50 hover:bg-indigo-50/80 border border-slate-200/80 hover:border-indigo-300 rounded-xl px-3 py-2 transition-all flex items-center justify-between group cursor-pointer active:scale-[0.99] disabled:opacity-50"
                                >
                                  <span className="pr-2 leading-snug">{q.label}</span>
                                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 shrink-0 transition-transform" />
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 px-1">
                    {msg.timestamp}
                  </span>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Footer & Chat Input */}
          <div className="p-3 bg-white border-t border-slate-200 shrink-0">
            <div className="relative flex items-center bg-slate-100 rounded-xl border border-slate-200 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
              <textarea
                ref={inputRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about DEVGYA tools, navigation, or features..."
                rows={1}
                disabled={isStreaming}
                className="w-full bg-transparent px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 resize-none focus:outline-hidden max-h-24 disabled:opacity-50"
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={!inputMessage.trim() || isStreaming}
                aria-label="Send Message"
                className="m-1.5 p-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-40 disabled:hover:bg-indigo-600 transition-all shrink-0 cursor-pointer"
              >
                {isStreaming ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </div>
            <p className="text-[10.5px] text-center text-slate-400 mt-2 font-medium">
              Site & navigation guide only. For subject questions, please use{" "}
              {currentContext === "teacher"
                ? "Teacher Mentor AI"
                : currentContext === "student"
                ? "Socratic AI Tutor"
                : "Mentor AI"}
              .
            </p>
          </div>
        </div>
      )}
    </>
  );
}
