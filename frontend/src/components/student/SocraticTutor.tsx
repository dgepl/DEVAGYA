"use client";

import { useState } from "react";
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
  BookOpen
} from "lucide-react";
import { askSocraticTutor } from "@/lib/api";

export function SocraticTutor() {
  const [subject, setSubject] = useState("Science");
  const [topic, setTopic] = useState("Light Reflection and Refraction");
  const [message, setMessage] = useState("");
  const [socraticMode, setSocraticMode] = useState(true);
  const [loading, setLoading] = useState(false);
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
      content: "Hello Aarav! 👋 I'm your **Socratic AI Tutor**. \n\nI won't spoil the answers immediately. Instead, I'll help you break down complex problems step-by-step! What homework problem or concept would you like to explore today?",
      isSocratic: true,
      hints: ["How do I calculate focal length?", "What is Snell's Law?", "Explain concave mirror ray diagrams"],
      questions: ["What is given in the problem?", "Which formula connects distance & focal length?"]
    }
  ]);

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

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-200">
            <Brain className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-slate-900">Socratic AI Homework Tutor</h1>
              <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                Active Recall Mode
              </span>
            </div>
            <p className="text-xs text-slate-500">Guides your thinking with hints & questions instead of giving plain answers.</p>
          </div>
        </div>

        {/* SOCRATIC TOGGLE SWITCH */}
        <div className="flex items-center gap-3 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
          <button
            onClick={() => setSocraticMode(true)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              socraticMode ? "bg-indigo-600 text-white shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Lightbulb className="w-3.5 h-3.5" />
            <span>Socratic Guide</span>
          </button>
          <button
            onClick={() => setSocraticMode(false)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              !socraticMode ? "bg-amber-600 text-white shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Direct Answer</span>
          </button>
        </div>
      </div>

      {/* TOPIC & SUBJECT SELECTOR BAR */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">Select Subject</label>
          <select 
            value={subject} 
            onChange={(e) => setSubject(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="Science">Science (Physics / Chemistry / Biology)</option>
            <option value="Mathematics">Mathematics</option>
            <option value="English">English Literature & Grammar</option>
            <option value="Social Studies">Social Studies (History / Civics / Geo)</option>
          </select>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">Target Topic</label>
          <input 
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g. Light Reflection and Refraction"
            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* CHAT MESSAGES CONTAINER */}
      <div className="bg-slate-50 border border-slate-200 rounded-3xl p-4 sm:p-6 min-h-[420px] max-h-[550px] overflow-y-auto space-y-4">
        {conversation.map((msg, idx) => (
          <div 
            key={idx} 
            className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
          >
            <div className={`max-w-2xl rounded-3xl p-4 sm:p-5 space-y-3 ${
              msg.sender === "user"
                ? "bg-indigo-600 text-white rounded-br-none shadow-md"
                : "bg-white text-slate-900 border border-slate-200 rounded-bl-none shadow-sm"
            }`}>
              
              {/* SENDER BADGE */}
              <div className="flex items-center justify-between gap-4 text-[10px] font-bold pb-1 border-b border-current/10">
                <span className="opacity-80">
                  {msg.sender === "user" ? "Aarav Sharma" : "Socratic AI Master Tutor"}
                </span>
                {msg.xp && (
                  <span className="bg-amber-400 text-amber-950 px-2 py-0.5 rounded-full font-black">
                    +{msg.xp} XP Earned!
                  </span>
                )}
              </div>

              {/* MESSAGE CONTENT */}
              <div className="text-xs leading-relaxed whitespace-pre-line font-medium">
                {msg.content}
              </div>

              {/* HINT CHIPS IF TUTOR RESPONSE */}
              {msg.sender === "tutor" && msg.hints && msg.hints.length > 0 && (
                <div className="pt-2 border-t border-slate-100 space-y-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-600 flex items-center gap-1">
                    <Lightbulb className="w-3 h-3 text-amber-500" />
                    <span>Suggested Thinking Prompts:</span>
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {msg.hints.map((hint, hIdx) => (
                      <button
                        key={hIdx}
                        onClick={() => handleSubmit(undefined, hint)}
                        className="text-[11px] font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-xl border border-indigo-200 transition-colors text-left"
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
          <div className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-slate-200 max-w-sm">
            <RefreshCw className="w-4 h-4 text-indigo-600 animate-spin" />
            <span className="text-xs font-bold text-slate-600">Socratic AI is formulating guiding hints...</span>
          </div>
        )}
      </div>

      {/* CHAT INPUT AREA */}
      <form onSubmit={handleSubmit} className="bg-white p-3 rounded-3xl border border-slate-200 shadow-lg space-y-2">
        <textarea
          rows={2}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={
            socraticMode
              ? "Ask a homework question or paste a problem... (Socratic AI will guide you step-by-step)"
              : "Ask for a direct step-by-step solution..."
          }
          className="w-full text-xs font-medium text-slate-900 border-0 focus:outline-none resize-none px-2"
        />

        <div className="flex items-center justify-between border-t border-slate-100 pt-2 px-1">
          <div className="flex items-center gap-2 text-slate-400">
            <button type="button" className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-600" title="Upload Photo or PDF">
              <Paperclip className="w-4 h-4" />
            </button>
            <button type="button" className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-600" title="Camera Capture Homework">
              <Camera className="w-4 h-4" />
            </button>
            <span className="text-[11px] font-medium text-slate-400 hidden sm:inline">Supports Images, Textbooks & PDFs</span>
          </div>

          <div className="flex items-center gap-2">
            {!socraticMode && (
              <span className="text-[10px] text-amber-600 font-bold bg-amber-50 px-2 py-1 rounded-md">Direct Solution Mode</span>
            )}
            <button
              type="submit"
              disabled={loading || !message.trim()}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs rounded-2xl transition-all shadow-md flex items-center gap-1.5"
            >
              <span>Ask Tutor</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </form>

    </div>
  );
}
