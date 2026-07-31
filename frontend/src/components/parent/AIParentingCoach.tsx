"use client";

import { useState } from "react";
import { 
  HeartHandshake, 
  Sparkles, 
  Send, 
  Lightbulb, 
  MessageSquare, 
  RefreshCw, 
  HelpCircle, 
  CheckCircle2
} from "lucide-react";
import { askParentingCoach } from "@/lib/api";

export function AIParentingCoach() {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversation, setConversation] = useState<Array<{
    sender: "parent" | "coach";
    advice?: string;
    tips?: string[];
    discussionStarter?: string;
    rawText?: string;
  }>>([
    {
      sender: "coach",
      advice: "Welcome! I am your **AI Educational Parenting Coach**. \n\nI offer evidence-based strategies to help you support your child's learning, focus, motivation, and exam preparation. How can I assist you today?",
      tips: [
        "Create a fixed quiet study window together",
        "Praise effort and curiosity over marks",
        "Encourage 5-minute break intervals"
      ],
      discussionStarter: "What was the most interesting idea you explored in class today?"
    }
  ]);

  const quickPrompts = [
    "How can I help my child study for exams without stress?",
    "My child easily gets distracted by phones during study hours.",
    "How much daily study time is healthy for Class 10?",
    "How do I deal with exam anxiety before term tests?"
  ];

  const handleAsk = async (textToAsk?: string) => {
    const queryText = textToAsk || question;
    if (!queryText.trim() || loading) return;

    setConversation(prev => [...prev, { sender: "parent", rawText: queryText }]);
    if (!textToAsk) setQuestion("");
    setLoading(true);

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api/v1";
      const res = await fetch(`${baseUrl}/parent/coach`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: queryText, category: "general" })
      });
      const data = await res.json();
      setConversation(prev => [
        ...prev,
        {
          sender: "coach",
          advice: data.advice || "Focus on establishing a regular daily routine and positive reinforcement.",
          tips: data.practical_steps || ["Set clear study hours", "Provide a quiet workspace", "Encourage short breaks"],
          discussionStarter: data.communication_script || "Let's review today's study plan together!"
        }
      ]);
    } catch (err) {
      setConversation(prev => [
        ...prev,
        {
          sender: "coach",
          advice: "Establish a quiet, distraction-free environment and encourage short 25-minute study intervals with breaks.",
          tips: ["Set daily study goals", "Praise effort over marks", "Encourage 5-minute stretch breaks"],
          discussionStarter: "How can I support your study plan today?"
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* HEADER BAR */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-200">
            <HeartHandshake className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900">AI Parenting & Study Coach</h1>
            <p className="text-xs text-slate-500">Evidence-based advice for parents to support home study & student wellness</p>
          </div>
        </div>
      </div>

      {/* QUICK PROMPT CHIPS */}
      <div className="space-y-2">
        <span className="text-xs font-bold text-slate-500 block">Frequently Asked Parenting Questions:</span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {quickPrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleAsk(prompt)}
              className="text-left text-xs font-bold bg-white hover:bg-indigo-50 text-slate-800 hover:text-indigo-900 p-3 rounded-2xl border border-slate-200 transition-colors shadow-xs"
            >
              💡 {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* CHAT CONVERSATION AREA */}
      <div className="bg-slate-50 border border-slate-200 rounded-3xl p-4 sm:p-6 min-h-[380px] max-h-[500px] overflow-y-auto space-y-4">
        {conversation.map((msg, idx) => (
          <div key={idx} className={`flex flex-col ${msg.sender === "parent" ? "items-end" : "items-start"}`}>
            <div className={`max-w-2xl rounded-3xl p-5 space-y-3 ${
              msg.sender === "parent"
                ? "bg-indigo-600 text-white rounded-br-none shadow-md"
                : "bg-white text-slate-900 border border-slate-200 rounded-bl-none shadow-sm"
            }`}>
              
              <div className="text-[10px] font-bold opacity-80 pb-1 border-b border-current/10">
                {msg.sender === "parent" ? "You (Parent)" : "AI Educational Parenting Coach"}
              </div>

              {msg.rawText && <p className="text-xs font-medium">{msg.rawText}</p>}

              {msg.advice && (
                <div className="text-xs leading-relaxed whitespace-pre-line font-medium">
                  {msg.advice}
                </div>
              )}

              {/* ACTIONABLE TIPS */}
              {msg.tips && msg.tips.length > 0 && (
                <div className="pt-2 border-t border-slate-100 space-y-2">
                  <span className="text-[10px] font-extrabold uppercase text-indigo-600 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Actionable Tips to Try Today:</span>
                  </span>
                  <ul className="space-y-1 text-xs text-slate-700 font-medium pl-4 list-disc">
                    {msg.tips.map((t, tIdx) => (
                      <li key={tIdx}>{t}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* RECOMMENDED DISCUSSION STARTER */}
              {msg.discussionStarter && (
                <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-950 font-medium mt-2">
                  🗣️ <span className="font-extrabold">Discussion Starter with Child:</span> &quot;{msg.discussionStarter}&quot;
                </div>
              )}

            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 p-4 bg-white rounded-2xl border border-slate-200 max-w-xs text-xs font-bold text-slate-600">
            <RefreshCw className="w-4 h-4 text-indigo-600 animate-spin" />
            <span>Formulating structured evidence-based guidance...</span>
          </div>
        )}
      </div>

      {/* INPUT FORM */}
      <form 
        onSubmit={(e) => {
          e.preventDefault();
          handleAsk();
        }}
        className="bg-white p-3 rounded-3xl border border-slate-200 shadow-lg flex items-center gap-3"
      >
        <input 
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask any question about supporting your child's studies, focus, or exam prep..."
          className="flex-1 text-xs font-medium text-slate-900 border-0 focus:outline-none px-2"
        />
        <button
          type="submit"
          disabled={loading || !question.trim()}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs rounded-2xl transition-all shadow-md flex items-center gap-1.5 shrink-0"
        >
          <span>Ask Coach</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>

    </div>
  );
}
