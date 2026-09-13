"use client";

import { useState, useRef, useEffect } from "react";
import { 
  Brain, 
  Sparkles, 
  Send, 
  Paperclip, 
  Camera, 
  HelpCircle, 
  Lightbulb, 
  CheckCircle2, 
  RefreshCw, 
  Zap, 
  ShieldAlert, 
  MessageSquare,
  BookOpen,
  ChevronDown
} from "lucide-react";
import { askSocraticTutor } from "@/lib/api";
import Markdown from "@/components/chat/Markdown";

export function SocraticTutor() {
  const [subject, setSubject] = useState("Science");
  const [topic, setTopic] = useState("Light Reflection and Refraction");
  const [message, setMessage] = useState("");
  const [socraticMode, setSocraticMode] = useState(true);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [conversation, setConversation] = useState<Array<{
    sender: "user" | "tutor";
    content: string;
    isSocratic?: boolean;
    hints?: string[];
    questions?: string[];
    xp?: number;
  }>>([
    {
      sender: "tutor",
      content: "Hello Aarav! 👋 I'm your **Socratic AI Tutor**.\n\nI won't spoil the answers immediately. Instead, I'll help you break down complex problems step-by-step! What homework problem or concept would you like to explore today?",
      isSocratic: true,
      hints: ["How do I calculate focal length?", "What is Snell's Law?", "Explain concave mirror ray diagrams"],
      questions: ["What is given in the problem?", "Which formula connects distance & focal length?"]
    }
  ]);

  // Auto-scroll chat messages container when conversation updates
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation, loading]);

  const handleSubmit = async (e?: React.FormEvent, customMsg?: string) => {
    if (e) e.preventDefault();
    const textToSend = customMsg || message;
    if (!textToSend.trim() || loading) return;

    const userMsg = { sender: "user" as const, content: textToSend };
    setConversation(prev => [...prev, userMsg]);
    if (!customMsg) setMessage("");
    setLoading(true);

    try {
      const res = await askSocraticTutor({
        subject,
        topic,
        message: textToSend,
        socratic_mode: socraticMode
      });

      setConversation(prev => [
        ...prev,
        {
          sender: "tutor",
          content: res.reply,
          isSocratic: res.is_socratic,
          hints: res.suggested_hints,
          questions: res.suggested_questions,
          xp: res.xp_gained
        }
      ]);
    } catch (err) {
      setConversation(prev => [
        ...prev,
        {
          sender: "tutor",
          content: "I'm having trouble connecting right now, but let's consider: **What are the key variables given in your problem statement?** Try listing them out first!",
          isSocratic: true,
          hints: ["List known parameters", "Identify the formula"],
          xp: 10
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="w-full max-w-5xl h-full flex-1 flex flex-col min-h-0 mx-auto relative overflow-hidden animate-in fade-in duration-300">
      
      {/* ============================================================ */}
      {/* 1. COMPACT PINNED TOP BAR (HEADER + SUBJECT + MODE TOGGLE)   */}
      {/* ============================================================ */}
      <header className="shrink-0 bg-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-2xl border border-slate-200/90 shadow-2xs mb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center shadow-xs shrink-0">
            <Brain className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h1 className="text-xs sm:text-sm font-extrabold text-slate-900 truncate">
                Socratic AI Tutor
              </h1>
              <span className="text-[8px] font-black uppercase text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded-full border border-indigo-200 shrink-0">
                ACTIVE RECALL
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-semibold truncate hidden sm:block">
              Guides with questions & hints • No answer spoilers
            </p>
          </div>
        </div>

        {/* CONTROLS: SUBJECT SELECTOR + MODE SWITCH */}
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
          {/* SUBJECT SELECTOR */}
          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl px-2.5 py-1 text-[11px] font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer transition"
          >
            <option value="Science">Science (Physics/Chem/Bio)</option>
            <option value="Mathematics">Mathematics</option>
            <option value="English">English Literature & Grammar</option>
            <option value="Social Studies">Social Studies</option>
          </select>

          {/* SOCRATIC TOGGLE */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => setSocraticMode(true)}
              className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer ${
                socraticMode ? "bg-indigo-600 text-white shadow-2xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Lightbulb className="w-3 h-3" />
              <span>Socratic</span>
            </button>
            <button
              type="button"
              onClick={() => setSocraticMode(false)}
              className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer ${
                !socraticMode ? "bg-amber-600 text-white shadow-2xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Zap className="w-3 h-3" />
              <span>Direct</span>
            </button>
          </div>
        </div>
      </header>

      {/* ============================================================ */}
      {/* 2. CHAT MESSAGES SCROLL CONTAINER (ONLY THIS SCROLLS)        */}
      {/* ============================================================ */}
      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-2 sm:px-4 py-3 space-y-3.5 bg-slate-50/50 rounded-2xl border border-slate-200/60 shadow-inner">
        {conversation.map((msg, idx) => (
          <div 
            key={idx} 
            className={`w-full flex items-start gap-2.5 ${
              msg.sender === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {/* TUTOR AVATAR */}
            {msg.sender === "tutor" && (
              <div className="w-7 h-7 rounded-xl bg-violet-600 text-white flex items-center justify-center font-bold shrink-0 shadow-sm mt-1">
                <Brain className="w-3.5 h-3.5" />
              </div>
            )}

            <div className={`relative max-w-[88%] sm:max-w-[80%] rounded-2xl p-3.5 sm:p-4 text-xs sm:text-sm leading-relaxed shadow-2xs space-y-2 ${
              msg.sender === "user"
                ? "bg-indigo-600 text-white font-medium rounded-tr-xs"
                : "bg-white text-slate-900 border border-slate-200/90 rounded-tl-xs"
            }`}>
              
              {/* SENDER LABEL & XP */}
              <div className="flex items-center justify-between gap-3 text-[10px] font-bold pb-1 border-b border-current/10">
                <span className="opacity-80">
                  {msg.sender === "user" ? "You" : "Socratic AI Tutor"}
                </span>
                {msg.xp && (
                  <span className="bg-amber-300 text-amber-950 px-2 py-0.5 rounded-full font-black text-[9px] shadow-2xs">
                    +{msg.xp} XP Earned!
                  </span>
                )}
              </div>

              {/* MESSAGE CONTENT WITH KATEX FORMULAS */}
              <div className={`leading-relaxed break-words ${
                msg.sender === "user" ? "[&_*]:text-white text-left font-sans" : "text-slate-800"
              }`}>
                <Markdown content={msg.content} />
              </div>

              {/* HINT CHIPS IF TUTOR RESPONSE */}
              {msg.sender === "tutor" && msg.hints && msg.hints.length > 0 && (
                <div className="pt-2 border-t border-slate-100 space-y-1.5">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-600 flex items-center gap-1">
                    <Lightbulb className="w-3 h-3 text-amber-500" />
                    <span>Suggested Thinking Prompts:</span>
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {msg.hints.map((hint, hIdx) => (
                      <button
                        key={hIdx}
                        type="button"
                        onClick={() => handleSubmit(undefined, hint)}
                        className="text-[11px] font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-2.5 py-1 rounded-xl border border-indigo-200/80 transition-colors text-left cursor-pointer active:scale-95"
                      >
                        💡 {hint}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2.5 p-3 bg-white rounded-2xl border border-slate-200 shadow-2xs max-w-xs text-slate-600">
            <RefreshCw className="w-3.5 h-3.5 text-indigo-600 animate-spin shrink-0" />
            <span className="text-[11px] font-bold">Socratic AI is formulating guided hints...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ============================================================ */}
      {/* 3. PINNED BOTTOM INPUT DOCK (ALWAYS VISIBLE, NEVER SCROLLED) */}
      {/* ============================================================ */}
      <footer className="shrink-0 pt-2 space-y-2 bg-slate-50">
        
        {/* QUICK ACTION PROMPT CHIPS */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none px-1">
          {[
            { label: "Explain Differently", action: "explain_differently", icon: "💡" },
            { label: "Give Me an Example", action: "give_example", icon: "📝" },
            { label: "Check My Answer", action: "check_answer", icon: "✅" },
            { label: "Give a Clue", action: "give_clue", icon: "🔍" }
          ].map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSubmit(undefined, `[Action: ${item.action}] Can you please ${item.label.toLowerCase()} for this problem?`)}
              className="px-2.5 py-1 bg-white hover:bg-indigo-50 text-indigo-700 font-bold text-[11px] rounded-xl border border-indigo-200/80 shadow-2xs transition-all shrink-0 flex items-center gap-1 cursor-pointer active:scale-95"
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        {/* CHAT INPUT BOX */}
        <form onSubmit={handleSubmit} className="bg-white p-2.5 sm:p-3 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <textarea
            ref={textareaRef}
            rows={2}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              socraticMode
                ? "Ask a homework question or paste a problem... (Socratic AI guides you step-by-step)"
                : "Ask for a direct step-by-step solution..."
            }
            className="w-full text-xs font-medium text-slate-900 border-0 focus:outline-none resize-none px-1"
          />

          <div className="flex items-center justify-between border-t border-slate-100 pt-2 px-1">
            <div className="flex items-center gap-1.5 text-slate-400">
              <button 
                type="button" 
                className="p-1.5 hover:bg-slate-100 rounded-xl transition-colors text-slate-500 cursor-pointer" 
                title="Attach Document or Image"
              >
                <Paperclip className="w-3.5 h-3.5" />
              </button>
              <button 
                type="button" 
                className="p-1.5 hover:bg-slate-100 rounded-xl transition-colors text-slate-500 cursor-pointer" 
                title="Camera Capture Homework"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
              <span className="text-[10px] font-medium text-slate-400 hidden sm:inline">
                Press Enter to send • Shift+Enter for new line
              </span>
            </div>

            <div className="flex items-center gap-2">
              {!socraticMode && (
                <span className="text-[9px] text-amber-700 font-bold bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md hidden sm:inline">
                  Direct Solution Mode
                </span>
              )}
              <button
                type="submit"
                disabled={loading || !message.trim()}
                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 disabled:opacity-40 text-white font-bold text-xs rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                <span>Ask</span>
                <Send className="w-3 h-3" />
              </button>
            </div>
          </div>
        </form>
      </footer>

    </div>
  );
}
