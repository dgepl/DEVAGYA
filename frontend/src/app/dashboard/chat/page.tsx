"use client";

import { useState, useRef, useEffect } from "react";
import { MessageSquare, Send, Bot, User, Copy, Check, RefreshCw, Plus } from "lucide-react";

interface Message {
  id: string;
  sender: "user" | "assistant";
  text: string;
}

export default function ChatStudioPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "msg-1",
      sender: "assistant",
      text: "Hello Prof. Ananya! I am your Devagya Global AI Assistant. Ask me to draft a quiz, explain an NCERT concept, or structure a classroom activity."
    }
  ]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streaming]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || streaming) return;

    const userMsg: Message = { id: `user-${Date.now()}`, sender: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setStreaming(true);

    const assistantMsgId = `assistant-${Date.now()}`;
    setMessages((prev) => [...prev, { id: assistantMsgId, sender: "assistant", text: "" }]);

    try {
      const res = await fetch("http://localhost:8000/api/v1/chat/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg.text, stream: true })
      });

      if (!res.body) return;
      const reader = res.body.getReader();
      const decoder = new TextDecoder("utf-8");

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        setMessages((prev) =>
          prev.map((m) => (m.id === assistantMsgId ? { ...m, text: m.text + chunk } : m))
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setStreaming(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col glass-panel rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
      
      {/* Top Header */}
      <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-white">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">AI Chat Studio</h2>
            <p className="text-[10px] text-slate-500 font-semibold">Powered by OpenAI-Compatible API Layer</p>
          </div>
        </div>

        <button
          onClick={() => setMessages([{ id: `msg-${Date.now()}`, sender: "assistant", text: "New conversation started. How can I assist your teaching today?" }])}
          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          New Chat
        </button>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 p-6 overflow-y-auto space-y-6 bg-slate-50">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex items-start gap-3 ${m.sender === "user" ? "flex-row-reverse" : ""}`}
          >
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${
              m.sender === "user" ? "bg-indigo-600 text-white" : "bg-indigo-100 text-indigo-700 border border-indigo-200"
            }`}>
              {m.sender === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div className={`max-w-2xl p-4 rounded-2xl text-xs leading-relaxed ${
              m.sender === "user" ? "bg-indigo-600 text-white shadow-sm font-medium" : "bg-white border border-slate-200 text-slate-800 shadow-sm"
            }`}>
              <div className="whitespace-pre-wrap font-sans">{m.text}</div>
              
              {m.sender === "assistant" && m.text && (
                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button
                    onClick={() => handleCopy(m.id, m.text)}
                    className="p-1 text-slate-400 hover:text-slate-700 transition-colors"
                    title="Copy message"
                  >
                    {copiedId === m.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* Input Bar */}
      <form onSubmit={handleSend} className="p-4 border-t border-slate-200 bg-white flex items-center gap-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask anything (e.g. 'Draft 5 MCQ questions for Class 10 Light chapter')..."
          className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-900 placeholder-slate-400 font-semibold focus:outline-none focus:border-indigo-500"
        />
        <button
          type="submit"
          disabled={streaming || !input.trim()}
          className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-glow transition-all flex items-center gap-2"
        >
          {streaming ? <RefreshCw className="w-4 h-4 animate-spin text-cyan-200" /> : <Send className="w-4 h-4" />}
          Send
        </button>
      </form>

    </div>
  );
}
