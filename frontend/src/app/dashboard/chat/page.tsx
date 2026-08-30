"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  MessageSquare,
  Send,
  Bot,
  User,
  Copy,
  Check,
  RefreshCw,
  Plus,
  Clock,
  Trash2,
  Paperclip,
  X,
  ChevronLeft,
  Loader2,
  ImageIcon,
  Sparkles,
  StopCircle,
  Globe,
  Volume2,
  VolumeX,
  FileText
} from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import Markdown from "@/components/chat/Markdown";
import { speakChatMessage, stopSpeech } from "@/lib/speechSynthesis";

const LANGUAGES = [
  { code: "english", label: "English", flag: "🇬🇧" },
  { code: "hindi", label: "हिंदी", flag: "🇮🇳" },
  { code: "hinglish", label: "Hinglish", flag: "🔀" },
];

interface ChatMessage {
  id: string;
  sender: "user" | "assistant";
  content: string;
  image_urls?: string[];
}

interface Conversation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  message_count: number;
}

interface AttachedImage {
  id: string;
  name: string;
  dataUrl: string;
  isPdf?: boolean;
}

const getApiBase = () => {
  if (typeof window !== "undefined") {
    return process.env.NEXT_PUBLIC_API_URL || "/api/v1";
  }
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
};

const API_BASE = getApiBase();
const MAX_IMAGES = 4;

const WELCOME_MSG: ChatMessage = {
  id: "welcome",
  sender: "assistant",
  content:
    "Hello! 👋 I am your **Devgya Global AI Assistant**.\n\nI can help you draft quizzes, explain NCERT concepts, structure classroom activities, plan lessons, and even read images from your device (handwritten notes, textbook pages, worksheets).\n\n- Ask me anything or **attach an image** 📎 to get started.\n- All your conversations are **saved automatically** — use the **clock icon** to revisit any past chat and continue right where you left off."
};

const dataUrlToBlob = (dataUrl: string): Blob => {
  const [meta, b64] = dataUrl.split(",");
  const mime = meta.match(/data:(.*?);/)?.[1] || "image/jpeg";
  const bin = atob(b64);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return new Blob([arr], { type: mime });
};

const formatRelative = (iso: string): string => {
  const d = new Date(iso);
  const now = Date.now();
  const diff = now - d.getTime();
  if (diff < 60000) return "Just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  if (diff < 7 * 86400000) return `${Math.floor(diff / 86400000)}d ago`;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
};

export default function ChatStudioPage() {
  const user = useAppStore((s) => s.user);

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MSG]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [attached, setAttached] = useState<AttachedImage[]>([]);
  const [language, setLanguage] = useState("english");
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const didAutoLoad = useRef(false);
  const langDropdownRef = useRef<HTMLDivElement>(null);

  // Stop speech on unmount
  useEffect(() => {
    return () => {
      stopSpeech();
    };
  }, []);

  // Handle Toggle Speak Audio for an AI message
  const handleToggleSpeak = useCallback((msgId: string, content: string) => {
    if (speakingMsgId === msgId) {
      stopSpeech();
      setSpeakingMsgId(null);
      return;
    }

    setSpeakingMsgId(msgId);
    speakChatMessage(
      content,
      language,
      () => setSpeakingMsgId(msgId),
      () => setSpeakingMsgId(null),
      () => setSpeakingMsgId(null)
    );
  }, [speakingMsgId, language]);

  // Close language dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (langDropdownRef.current && !langDropdownRef.current.contains(e.target as Node)) {
        setLangDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const refreshConversations = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/chat/conversations?user_id=${encodeURIComponent(user.id)}`);
      const data = await res.json();
      setConversations(data.conversations || []);
    } catch (e) {
      console.error("Failed to load chat history", e);
    }
  }, [user.id]);

  const loadConversation = useCallback(
    async (id: string) => {
      stopSpeech();
      setSpeakingMsgId(null);
      abortRef.current?.abort();
      setActiveId(id);
      setHistoryOpen(false);
      setStreaming(false);
      try {
        const res = await fetch(`${API_BASE}/chat/conversations/${id}?user_id=${encodeURIComponent(user.id)}`);
        const data = await res.json();
        setMessages(
          (data.messages || []).map((m: { id: string; sender: string; content: string; image_urls?: string[] | string }) => {
            let urls: string[] = [];
            if (Array.isArray(m.image_urls)) urls = m.image_urls;
            else if (typeof m.image_urls === "string") try { urls = JSON.parse(m.image_urls); } catch { urls = []; }
            return {
              id: m.id,
              sender: m.sender === "assistant" ? "assistant" as const : "user" as const,
              content: m.content,
              image_urls: urls,
            };
          })
        );
        // Restore language from conversation
        if (data.language) {
          setLanguage(data.language);
        }
      } catch (e) {
        console.error("Failed to load conversation", e);
      }
    },
    [user.id]
  );

  const newChat = () => {
    stopSpeech();
    setSpeakingMsgId(null);
    abortRef.current?.abort();
    setActiveId(null);
    setMessages([WELCOME_MSG]);
    setAttached([]);
    setInput("");
    setStreaming(false);
    inputRef.current?.focus();
  };

  useEffect(() => {
    (async () => {
      setLoadingHistory(true);
      await refreshConversations();
      setLoadingHistory(false);
    })();
  }, [refreshConversations]);

  useEffect(() => {
    if (!loadingHistory && !didAutoLoad.current) {
      didAutoLoad.current = true;
      if (conversations.length > 0) {
        loadConversation(conversations[0].id);
      }
    }
  }, [loadingHistory, conversations, loadConversation]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, streaming]);

  const handleFiles = (files: FileList | null) => {
    if (!files || streaming) return;
    const remaining = MAX_IMAGES - attached.length;
    Array.from(files)
      .slice(0, remaining)
      .forEach((file) => {
        const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
        const isImage = file.type.startsWith("image/");
        
        const reader = new FileReader();
        reader.onload = () => {
          setAttached((prev) => [
            ...prev,
            { 
              id: `file-${Date.now()}-${Math.random()}`, 
              name: file.name, 
              dataUrl: reader.result as string,
              isPdf: isPdf || !isImage
            }
          ]);
        };
        reader.readAsDataURL(file);
      });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const text = input.trim();
    if ((!text && attached.length === 0) || streaming) return;

    const fd = new FormData();
    fd.append("message", text);
    fd.append("user_id", user.id);
    fd.append("stream", "true");
    fd.append("language", language);
    if (activeId) fd.append("conversation_id", activeId);
    attached.forEach((img) => {
      fd.append("images", dataUrlToBlob(img.dataUrl), img.name || "image.jpg");
    });

    const imageUrls = attached.map((a) => a.dataUrl);
    const optimisticUser: ChatMessage = {
      id: `local-user-${Date.now()}`,
      sender: "user",
      content: text || "*(Image attached)*",
      image_urls: imageUrls
    };
    setMessages((prev) => [...prev, optimisticUser]);
    setAttached([]);
    setInput("");
    setStreaming(true);

    const assistantId = `local-assist-${Date.now()}`;
    setMessages((prev) => [...prev, { id: assistantId, sender: "assistant", content: "", image_urls: [] }]);

    abortRef.current = new AbortController();
    try {
      const res = await fetch(`${API_BASE}/chat/message`, {
        method: "POST",
        body: fd,
        signal: abortRef.current.signal
      });

      const newConvId = res.headers.get("X-Conversation-Id");
      if (newConvId && newConvId !== activeId) {
        setActiveId(newConvId);
        setConversations((prev) =>
          prev.some((c) => c.id === newConvId)
            ? prev
            : [
                {
                  id: newConvId,
                  title: text || "New Chat",
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                  message_count: 1
                },
                ...prev
              ]
        );
      }

      if (!res.body) return;
      const reader = res.body.getReader();
      const decoder = new TextDecoder("utf-8");
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        setMessages((prev) =>
          prev.map((m) => (m.id === assistantId ? { ...m, content: m.content + chunk } : m))
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setStreaming(false);
      abortRef.current = null;
      refreshConversations();
    }
  };

  const stopGenerating = () => abortRef.current?.abort();

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("Delete this conversation permanently?")) return;
    try {
      await fetch(`${API_BASE}/chat/conversations/${id}?user_id=${encodeURIComponent(user.id)}`, {
        method: "DELETE"
      });
      if (activeId === id) newChat();
      refreshConversations();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCopy = (id: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const autoGrow = (el: HTMLTextAreaElement) => {
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  };

  return (
    <div className="h-[calc(100vh-9rem)] flex glass-panel rounded-3xl border border-slate-200 overflow-hidden shadow-sm relative">
      {/* ============ HISTORY SIDEBAR (Clock / Reverse) ============ */}
      <aside
        className={`absolute md:relative z-30 inset-y-0 left-0 w-72 shrink-0 border-r border-slate-200 bg-white/95 backdrop-blur-xl flex flex-col transition-transform duration-300 ${
          historyOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center">
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <h3 className="text-xs font-extrabold text-slate-900">Chat History</h3>
              <p className="text-[10px] text-slate-500 font-semibold">{conversations.length} saved conversation{conversations.length === 1 ? "" : "s"}</p>
            </div>
          </div>
          <button
            onClick={newChat}
            className="p-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors"
            title="Start a new chat"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {loadingHistory ? (
            <div className="flex items-center justify-center gap-2 py-8 text-slate-400">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-[11px] font-semibold">Loading history...</span>
            </div>
          ) : conversations.length === 0 ? (
            <div className="text-center py-10 px-4">
              <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-[11px] text-slate-400 font-semibold leading-relaxed">
                No past chats yet.
                <br />
                Your conversations will appear here automatically.
              </p>
            </div>
          ) : (
            conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => loadConversation(conv.id)}
                className={`w-full text-left px-3 py-2.5 rounded-xl border transition-all group ${
                  activeId === conv.id
                    ? "bg-indigo-50 border-indigo-200"
                    : "border-transparent hover:bg-slate-50 hover:border-slate-200"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2 min-w-0">
                    <MessageSquare className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${activeId === conv.id ? "text-indigo-600" : "text-slate-400"}`} />
                    <span className="text-[11px] font-bold text-slate-800 leading-snug line-clamp-2">
                      {conv.title}
                    </span>
                  </div>
                  <span
                    onClick={(e) => handleDelete(conv.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all shrink-0"
                    title="Delete conversation"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </span>
                </div>
                <p className="mt-1 pl-5 text-[10px] text-slate-400 font-semibold">
                  {formatRelative(conv.updated_at)}
                </p>
              </button>
            ))
          )}
        </div>

        <div className="p-3 border-t border-slate-200 bg-slate-50/60">
          <p className="text-[10px] text-slate-400 font-semibold flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-indigo-500" />
            History is saved securely and auto-synced for {user.name || "this account"}.
          </p>
        </div>
      </aside>

      {/* Mobile overlay backdrop */}
      {historyOpen && (
        <div className="absolute inset-0 z-20 bg-slate-900/30 backdrop-blur-sm md:hidden" onClick={() => setHistoryOpen(false)} />
      )}

      {/* ============ MAIN CHAT AREA ============ */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setHistoryOpen((v) => !v)}
              className="p-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 hover:bg-amber-100 transition-colors shrink-0 md:hidden"
              title="Chat history"
            >
              <Clock className="w-4 h-4" />
            </button>
            <button
              onClick={() => setHistoryOpen((v) => !v)}
              className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors hidden md:flex"
              title="Toggle history"
            >
              <ChevronLeft className={`w-4 h-4 transition-transform ${historyOpen ? "md:rotate-180" : ""}`} />
            </button>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold shrink-0">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-bold text-slate-900 truncate">
                {conversations.find((c) => c.id === activeId)?.title || "AI Chat Studio"}
              </h2>
              <p className="text-[10px] text-slate-500 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                {streaming ? "Devgya AI is replying..." : "Devgya Global AI · Context & history saved"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* LANGUAGE SELECTOR */}
            <div className="relative" ref={langDropdownRef}>
              <button
                onClick={() => setLangDropdownOpen((v) => !v)}
                className="px-3 py-1.5 bg-violet-50 hover:bg-violet-100 border border-violet-200 text-violet-700 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5"
                title="Select AI reply language"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>{(LANGUAGES.find(l => l.code === language) || LANGUAGES[0]).flag} {(LANGUAGES.find(l => l.code === language) || LANGUAGES[0]).label}</span>
              </button>

              {langDropdownOpen && (
                <div className="absolute right-0 top-full mt-1 z-50 bg-white border border-slate-200 rounded-xl shadow-lg py-1 min-w-[160px]">
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setLanguage(lang.code);
                        setLangDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs font-bold transition-colors flex items-center gap-2 ${
                        language === lang.code
                          ? "bg-violet-50 text-violet-700"
                          : "text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <span className="text-sm">{lang.flag}</span>
                      <span>{lang.label}</span>
                      {language === lang.code && (
                        <Check className="w-3.5 h-3.5 text-violet-600 ml-auto" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => setHistoryOpen(true)}
              className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-700 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5"
              title="Open chat history"
            >
              <Clock className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">History</span>
            </button>
            <button
              onClick={newChat}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              New Chat
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto bg-slate-50/50">
          <div className="max-w-3xl mx-auto p-4 sm:p-6 space-y-4">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`w-full flex items-start gap-3 my-2 ${
                  m.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {m.sender === "assistant" && (
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-rose-500 text-white flex items-center justify-center font-bold shrink-0 shadow-md shadow-indigo-500/20 border border-white/20">
                    <Bot className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                  </div>
                )}

                <div
                  className={`relative min-w-[60px] max-w-[85%] sm:max-w-[78%] px-4.5 py-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-sm transition-all ${
                    m.sender === "user"
                      ? "bg-indigo-600 text-white font-medium rounded-tr-xs shadow-indigo-600/10 text-left whitespace-pre-wrap break-words"
                      : "bg-white border border-slate-200/90 text-slate-800 rounded-tl-xs shadow-xs"
                  }`}
                >
                  {/* Attached images */}
                  {Array.isArray(m.image_urls) && m.image_urls.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-2">
                      {m.image_urls.map((url, i) => (
                        <img
                          key={`${m.id}-img-${i}`}
                          src={url}
                          alt={`Attached ${i + 1}`}
                          className="w-24 h-24 object-cover rounded-xl border border-slate-200 shadow-sm"
                        />
                      ))}
                    </div>
                  )}

                  {m.sender === "assistant" ? (
                    <div className="whitespace-pre-wrap">
                      <Markdown text={m.content} />
                    </div>
                  ) : (
                    <div className="whitespace-pre-wrap font-sans text-white text-left break-words">
                      {m.content}
                    </div>
                  )}

                  {m.sender === "assistant" && m.id === messages[messages.length - 1].id && streaming && !m.content && (
                    <div className="flex items-center gap-1.5 py-1">
                      <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" />
                      <span className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce" style={{ animationDelay: "0.15s" }} />
                      <span className="w-2 h-2 rounded-full bg-purple-600 animate-bounce" style={{ animationDelay: "0.3s" }} />
                    </div>
                  )}

                  {m.sender === "assistant" && m.content && (
                    <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => handleToggleSpeak(m.id, m.content)}
                        className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition-all flex items-center gap-1.5 cursor-pointer ${
                          speakingMsgId === m.id
                            ? "bg-indigo-100 text-indigo-700 border-indigo-300 shadow-xs animate-pulse"
                            : "bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200"
                        }`}
                        title={speakingMsgId === m.id ? "Stop voice (आवाज़ रोकें)" : "Speak message (आवाज़ में सुनें)"}
                      >
                        {speakingMsgId === m.id ? (
                          <>
                            <VolumeX className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
                            <span className="text-[11px] font-black">Stop</span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-3.5 h-3.5 text-indigo-600" />
                            <span className="text-[11px] font-bold">Speak</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => handleCopy(m.id, m.content)}
                        className="p-1 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                        title="Copy message"
                      >
                        {copiedId === m.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  )}
                </div>

                {m.sender === "user" && (
                  <div className="w-8 h-8 rounded-xl bg-indigo-700 text-white flex items-center justify-center shrink-0 shadow-sm border border-indigo-500/30">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSend} className="p-4 border-t border-slate-200 bg-white">
          {/* Attached image & PDF previews */}
          {attached.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2.5">
              {attached.map((img) => (
                <div key={img.id} className="relative group">
                  {img.isPdf ? (
                    <div className="w-16 h-16 rounded-xl border border-indigo-200 bg-indigo-50 flex flex-col items-center justify-center p-1 text-center shadow-xs">
                      <FileText className="w-6 h-6 text-indigo-600 mb-0.5" />
                      <span className="text-[9px] font-bold text-indigo-900 truncate max-w-[50px]">{img.name}</span>
                    </div>
                  ) : (
                    <img src={img.dataUrl} alt={img.name} className="w-16 h-16 object-cover rounded-xl border border-slate-200 shadow-sm" />
                  )}
                  <button
                    type="button"
                    onClick={() => setAttached((prev) => prev.filter((a) => a.id !== img.id))}
                    className="absolute -top-1.5 -right-1.5 p-0.5 rounded-full bg-red-500 text-white shadow-md hover:bg-red-600 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {attached.length < MAX_IMAGES && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-16 h-16 rounded-xl border-2 border-dashed border-indigo-200 text-indigo-500 hover:text-indigo-700 hover:border-indigo-400 hover:bg-indigo-50/50 flex flex-col items-center justify-center transition-colors cursor-pointer"
                  title="Add another photo or PDF (one by one or multi-select)"
                >
                  <Plus className="w-5 h-5 mb-0.5" />
                  <span className="text-[8px] font-bold">Add file</span>
                </button>
              )}
            </div>
          )}

          <div className="flex items-end gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,application/pdf,.pdf,.doc,.docx,.txt"
              multiple
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={streaming || attached.length >= MAX_IMAGES}
              className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-600 disabled:opacity-40 transition-colors shrink-0 cursor-pointer"
              title="Attach photos or PDF documents (select multiple at once or add one-by-one)"
            >
              <Paperclip className="w-4 h-4" />
            </button>

            <textarea
              ref={inputRef}
              value={input}
              rows={1}
              onChange={(e) => {
                setInput(e.target.value);
                autoGrow(e.target);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Ask anything — or attach an image to analyze it..."
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-900 placeholder-slate-400 font-semibold focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 resize-none max-h-40"
            />

            {streaming ? (
              <button
                type="button"
                onClick={stopGenerating}
                className="px-4 py-3 bg-red-500 hover:bg-red-600 text-white font-bold text-xs rounded-xl shadow-glow transition-all flex items-center gap-2 shrink-0"
              >
                <StopCircle className="w-4 h-4" />
                Stop
              </button>
            ) : (
              <button
                type="submit"
                disabled={(!input.trim() && attached.length === 0) || streaming}
                className="px-4 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-glow transition-all flex items-center gap-2 shrink-0"
              >
                <Send className="w-4 h-4" />
                Send
              </button>
            )}
          </div>
          <p className="mt-2 text-[10px] text-slate-400 font-semibold flex items-center gap-1.5">
            <RefreshCw className="w-3 h-3" />
            Conversations are saved automatically. Press the clock icon to revisit any past chat.
          </p>
        </form>
      </div>
    </div>
  );
}
