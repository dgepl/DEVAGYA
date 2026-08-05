"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import {
  Bot,
  Sparkles,
  Send,
  Search,
  Cpu,
  Filter,
  RefreshCw,
  MessageSquare,
  GraduationCap,
  BookOpen,
  FileText,
  Brain,
  Search as SearchIcon,
  Layers,
  Activity,
  HeartHandshake,
  Compass,
  GitFork,
  Trophy,
  Flame,
  Clock,
  Plus,
  Trash2,
  Paperclip,
  X,
  ImageIcon,
  StopCircle,
  Loader2,
  Copy,
  Check,
  Globe,
  User,
  ChevronLeft,
  History,
  Zap
} from "lucide-react";
import { getAIAgents } from "@/lib/api";
import { useAppStore } from "@/store/useAppStore";
import Markdown from "@/components/chat/Markdown";

const iconMap: Record<string, any> = {
  GraduationCap,
  Sparkles,
  BookOpen,
  FileText,
  Brain,
  MessageSquare,
  Search: SearchIcon,
  Layers,
  Activity,
  HeartHandshake,
  Compass,
  GitFork,
  Trophy,
  Flame,
  Clock,
};

interface ChatMessage {
  id: string;
  sender: "user" | "assistant";
  content: string;
  image_urls?: string[];
}

interface Conversation {
  id: string;
  title: string;
  agent_code: string | null;
  language: string;
  created_at: string;
  updated_at: string;
  message_count: number;
}

interface AttachedImage {
  id: string;
  name: string;
  dataUrl: string;
}

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
const MAX_IMAGES = 4;

const LANGUAGES = [
  { code: "english", label: "English", flag: "🇬🇧" },
  { code: "hindi", label: "हिंदी", flag: "🇮🇳" },
  { code: "hinglish", label: "Hinglish", flag: "🔀" },
];

const WELCOME_MSG: ChatMessage = {
  id: "welcome",
  sender: "assistant",
  content:
    "Hello! 👋 I'm your **AI Employee**, ready to assist.\n\n- Ask me anything related to my specialization.\n- **Attach images** 📎 (handwritten notes, textbook pages, worksheets) for analysis.\n- Select your preferred **language** (English, Hindi, Hinglish) above.\n- Your conversations are **saved automatically** — use the **🕘 History** button to revisit any past chat.",
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

export function AgentMarketplace() {
  const user = useAppStore((s) => s.user);

  const [agents, setAgents] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedAgentCode, setSelectedAgentCode] = useState("teacher_mentor");

  // Read agent from URL query param
  const searchParams = useSearchParams();
  useEffect(() => {
    const agentParam = searchParams.get("agent");
    if (agentParam) {
      setSelectedAgentCode(agentParam);
      // Reset chat when switching agents via sidebar
      setMessages([WELCOME_MSG]);
      setActiveConvId(null);
    }
  }, [searchParams]);

  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MSG]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [language, setLanguage] = useState("english");
  const [attached, setAttached] = useState<AttachedImage[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [xpToast, setXpToast] = useState<number | null>(null);

  // History state
  const [historyOpen, setHistoryOpen] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Language dropdown
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const langDropdownRef = useRef<HTMLDivElement>(null);

  // Load agents
  useEffect(() => {
    (async () => {
      try {
        const data = await getAIAgents();
        setAgents(data);
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  const selectedAgent =
    agents.find((a) => a.agent_code === selectedAgentCode) || agents[0];

  // Close language dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        langDropdownRef.current &&
        !langDropdownRef.current.contains(e.target as Node)
      ) {
        setLangDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Auto-scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, streaming]);

  // Refresh conversations for the selected agent
  const refreshConversations = useCallback(async () => {
    try {
      const res = await fetch(
        `${API_BASE}/agents/conversations?user_id=${encodeURIComponent(user.id)}&agent_code=${encodeURIComponent(selectedAgentCode)}`
      );
      const data = await res.json();
      setConversations(data.conversations || []);
    } catch (e) {
      console.error("Failed to load agent chat history", e);
    }
  }, [user.id, selectedAgentCode]);

  // Load conversations when history opens or agent changes
  useEffect(() => {
    if (historyOpen) {
      setLoadingHistory(true);
      refreshConversations().finally(() => setLoadingHistory(false));
    }
  }, [historyOpen, refreshConversations]);

  // Load a past conversation
  const loadConversation = useCallback(
    async (id: string) => {
      abortRef.current?.abort();
      setActiveConvId(id);
      setHistoryOpen(false);
      setStreaming(false);
      try {
        const res = await fetch(
          `${API_BASE}/agents/conversations/${id}?user_id=${encodeURIComponent(user.id)}`
        );
        const data = await res.json();
        setMessages(
          (data.messages || []).map(
            (m: {
              id: string;
              sender: string;
              content: string;
              image_urls?: string[] | string;
            }) => {
              let urls: string[] = [];
              if (Array.isArray(m.image_urls)) urls = m.image_urls;
              else if (typeof m.image_urls === "string") try { urls = JSON.parse(m.image_urls); } catch { urls = []; }
              return {
                id: m.id,
                sender: m.sender === "assistant" ? "assistant" as const : "user" as const,
                content: m.content,
                image_urls: urls,
              };
            }
          )
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

  // New chat
  const newChat = () => {
    abortRef.current?.abort();
    setActiveConvId(null);
    setMessages([WELCOME_MSG]);
    setAttached([]);
    setInput("");
    setStreaming(false);
    inputRef.current?.focus();
  };

  // Switch agent → reset chat
  const switchAgent = (agentCode: string) => {
    if (agentCode === selectedAgentCode) return;
    abortRef.current?.abort();
    setSelectedAgentCode(agentCode);
    setActiveConvId(null);
    setMessages([WELCOME_MSG]);
    setAttached([]);
    setInput("");
    setStreaming(false);
    setHistoryOpen(false);
  };

  // Handle image files
  const handleFiles = (files: FileList | null) => {
    if (!files || streaming) return;
    const accepted = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
      "image/bmp",
    ];
    const remaining = MAX_IMAGES - attached.length;
    Array.from(files)
      .slice(0, remaining)
      .forEach((file) => {
        if (!accepted.includes(file.type)) return;
        const reader = new FileReader();
        reader.onload = () =>
          setAttached((prev) => [
            ...prev,
            {
              id: `img-${Date.now()}-${Math.random()}`,
              name: file.name,
              dataUrl: reader.result as string,
            },
          ]);
        reader.readAsDataURL(file);
      });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Send message
  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const text = input.trim();
    if ((!text && attached.length === 0) || streaming) return;

    const fd = new FormData();
    fd.append("message", text);
    fd.append("agent_code", selectedAgentCode);
    fd.append("user_id", user.id);
    fd.append("language", language);
    fd.append("stream", "true");
    if (activeConvId) fd.append("conversation_id", activeConvId);
    attached.forEach((img) => {
      fd.append("images", dataUrlToBlob(img.dataUrl), img.name || "image.jpg");
    });

    const imageUrls = attached.map((a) => a.dataUrl);
    const optimisticUser: ChatMessage = {
      id: `local-user-${Date.now()}`,
      sender: "user",
      content: text || "*(Image attached)*",
      image_urls: imageUrls,
    };
    setMessages((prev) => [...prev, optimisticUser]);
    setAttached([]);
    setInput("");
    setStreaming(true);

    const assistantId = `local-assist-${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      { id: assistantId, sender: "assistant", content: "", image_urls: [] },
    ]);

    abortRef.current = new AbortController();
    try {
      const res = await fetch(`${API_BASE}/agents/chat`, {
        method: "POST",
        body: fd,
        signal: abortRef.current.signal,
      });

      const newConvId = res.headers.get("X-Conversation-Id");
      if (newConvId && newConvId !== activeConvId) {
        setActiveConvId(newConvId);
      }

      // Read XP earned from response header
      const xpEarned = res.headers.get("X-XP-Earned");
      if (xpEarned) {
        const xpNum = parseInt(xpEarned, 10);
        if (xpNum > 0) {
          setXpToast(xpNum);
          setTimeout(() => setXpToast(null), 3500);
        }
      }

      if (!res.body) return;
      const reader = res.body.getReader();
      const decoder = new TextDecoder("utf-8");
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId ? { ...m, content: m.content + chunk } : m
          )
        );
      }
    } catch (err: any) {
      if (err.name !== "AbortError") console.error(err);
    } finally {
      setStreaming(false);
      abortRef.current = null;
    }
  };

  const stopGenerating = () => abortRef.current?.abort();

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("Delete this conversation permanently?")) return;
    try {
      await fetch(
        `${API_BASE}/agents/conversations/${id}?user_id=${encodeURIComponent(user.id)}`,
        { method: "DELETE" }
      );
      if (activeConvId === id) newChat();
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

  const filteredAgents =
    activeCategory === "all"
      ? agents
      : agents.filter(
          (a) =>
            a.role_scope === activeCategory || a.role_scope === "general"
        );

  const currentLang = LANGUAGES.find((l) => l.code === language) || LANGUAGES[0];

  return (
    <div className="max-w-full mx-auto animate-in fade-in duration-500 relative">
      {/* XP TOAST NOTIFICATION */}
      {xpToast !== null && (
        <div className="fixed top-6 right-6 z-[9999] animate-in slide-in-from-top-4 fade-in duration-500">
          <div className="bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-700 text-white px-6 py-3 rounded-2xl shadow-2xl shadow-violet-500/30 flex items-center gap-3 border border-white/20">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Zap className="w-5 h-5 text-amber-300 fill-amber-300" />
            </div>
            <div>
              <div className="text-lg font-black text-amber-300">+{xpToast} XP</div>
              <div className="text-[10px] text-violet-200 font-bold">Question Answered!</div>
            </div>
          </div>
        </div>
      )}

      {/* FULL-WIDTH AGENT WORKSPACE */}
      <div className="flex flex-col h-[calc(100vh-8rem)] min-h-[500px]">
          {/* AGENT DETAIL BANNER + LANGUAGE + HISTORY */}
          {selectedAgent && (
            <div className="bg-white p-4 rounded-t-3xl border border-slate-200 border-b-0 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shrink-0">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h2 className="text-sm font-extrabold text-slate-900 truncate">
                        {activeConvId
                          ? conversations.find((c) => c.id === activeConvId)
                              ?.title || selectedAgent.name
                          : selectedAgent.name}
                      </h2>
                      <span className="text-[9px] font-black uppercase text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 shrink-0">
                        Active
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 font-semibold flex items-center gap-1 truncate">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block shrink-0" />
                      {streaming
                        ? `${selectedAgent.name} is replying...`
                        : selectedAgent.description}
                    </p>
                  </div>
                </div>

                {/* ACTION BUTTONS: Language + History + New Chat */}
                <div className="flex items-center gap-2 shrink-0 flex-wrap">
                  {/* LANGUAGE SELECTOR */}
                  <div className="relative" ref={langDropdownRef}>
                    <button
                      onClick={() => setLangDropdownOpen((v) => !v)}
                      className="px-3 py-1.5 bg-violet-50 hover:bg-violet-100 border border-violet-200 text-violet-700 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5"
                      title="Select AI reply language"
                    >
                      <Globe className="w-3.5 h-3.5" />
                      <span>{currentLang.flag} {currentLang.label}</span>
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

                  {/* HISTORY BUTTON (Reverse Clock) */}
                  <button
                    onClick={() => setHistoryOpen((v) => !v)}
                    className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-700 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5"
                    title="Chat history"
                  >
                    <History className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">History</span>
                  </button>

                  {/* NEW CHAT BUTTON */}
                  <button
                    onClick={newChat}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">New Chat</span>
                  </button>
                </div>
              </div>

              {/* Capabilities tags */}
              <div className="flex items-center gap-1.5 flex-wrap mt-3 pt-3 border-t border-slate-100">
                {selectedAgent.capabilities?.map(
                  (cap: string, i: number) => (
                    <span
                      key={i}
                      className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-xl"
                    >
                      {cap}
                    </span>
                  )
                )}
              </div>
            </div>
          )}

          {/* MAIN CHAT AREA WITH HISTORY OVERLAY */}
          <div className="flex-1 relative border border-slate-200 border-t-0 overflow-hidden bg-slate-50">
            {/* HISTORY SLIDE-OUT PANEL */}
            {historyOpen && (
              <>
                <div
                  className="absolute inset-0 z-20 bg-slate-900/20 backdrop-blur-[2px]"
                  onClick={() => setHistoryOpen(false)}
                />
                <aside className="absolute z-30 inset-y-0 right-0 w-72 bg-white/98 backdrop-blur-xl border-l border-slate-200 flex flex-col shadow-2xl animate-in slide-in-from-right-5 duration-200">
                  <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center">
                        <History className="w-4 h-4 text-amber-600" />
                      </div>
                      <div>
                        <h3 className="text-xs font-extrabold text-slate-900">
                          Chat History
                        </h3>
                        <p className="text-[10px] text-slate-500 font-semibold">
                          {conversations.length} saved conversation
                          {conversations.length === 1 ? "" : "s"}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setHistoryOpen(false)}
                      className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {loadingHistory ? (
                      <div className="flex items-center justify-center gap-2 py-8 text-slate-400">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-[11px] font-semibold">
                          Loading history...
                        </span>
                      </div>
                    ) : conversations.length === 0 ? (
                      <div className="text-center py-10 px-4">
                        <History className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        <p className="text-[11px] text-slate-400 font-semibold leading-relaxed">
                          No past chats with this agent yet.
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
                            activeConvId === conv.id
                              ? "bg-indigo-50 border-indigo-200"
                              : "border-transparent hover:bg-slate-50 hover:border-slate-200"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-start gap-2 min-w-0">
                              <MessageSquare
                                className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${
                                  activeConvId === conv.id
                                    ? "text-indigo-600"
                                    : "text-slate-400"
                                }`}
                              />
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
                    <button
                      onClick={() => {
                        newChat();
                        setHistoryOpen(false);
                      }}
                      className="w-full px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Start New Chat
                    </button>
                  </div>
                </aside>
              </>
            )}

            {/* MESSAGES AREA */}
            <div className="h-full overflow-y-auto">
              <div className="max-w-3xl mx-auto p-4 sm:p-6 space-y-5">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex items-start gap-3 ${
                      m.sender === "user" ? "flex-row-reverse" : ""
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${
                        m.sender === "user"
                          ? "bg-indigo-600 text-white shadow-sm"
                          : "bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-sm"
                      }`}
                    >
                      {m.sender === "user" ? (
                        <User className="w-4 h-4" />
                      ) : (
                        <Bot className="w-4 h-4" />
                      )}
                    </div>

                    <div
                      className={`max-w-[85%] px-4 py-3 rounded-2xl text-xs leading-relaxed shadow-sm ${
                        m.sender === "user"
                          ? "bg-indigo-600 text-white font-medium rounded-tr-sm"
                          : "bg-white border border-slate-200 text-slate-800 rounded-tl-sm"
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
                        <div className="whitespace-pre-wrap font-sans">
                          {m.content}
                        </div>
                      )}

                      {/* Typing indicator */}
                      {m.sender === "assistant" &&
                        m.id === messages[messages.length - 1].id &&
                        streaming &&
                        !m.content && (
                          <div className="flex items-center gap-1.5 py-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" />
                            <span
                              className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce"
                              style={{ animationDelay: "0.15s" }}
                            />
                            <span
                              className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-bounce"
                              style={{ animationDelay: "0.3s" }}
                            />
                          </div>
                        )}

                      {/* Copy button */}
                      {m.sender === "assistant" && m.content && (
                        <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleCopy(m.id, m.content)}
                            className="p-1 text-slate-400 hover:text-slate-700 transition-colors"
                            title="Copy message"
                          >
                            {copiedId === m.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
            </div>
          </div>

          {/* INPUT BAR */}
          <form
            onSubmit={handleSend}
            className="p-4 border border-slate-200 border-t-0 bg-white rounded-b-3xl"
          >
            {/* Attached image previews */}
            {attached.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2.5">
                {attached.map((img) => (
                  <div key={img.id} className="relative group">
                    <img
                      src={img.dataUrl}
                      alt={img.name}
                      className="w-16 h-16 object-cover rounded-xl border border-slate-200 shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setAttached((prev) =>
                          prev.filter((a) => a.id !== img.id)
                        )
                      }
                      className="absolute -top-1.5 -right-1.5 p-0.5 rounded-full bg-red-500 text-white shadow-md hover:bg-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                {attached.length < MAX_IMAGES && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-16 h-16 rounded-xl border-2 border-dashed border-slate-200 text-slate-400 hover:text-indigo-600 hover:border-indigo-300 flex items-center justify-center transition-colors"
                  >
                    <ImageIcon className="w-5 h-5" />
                  </button>
                )}
              </div>
            )}

            <div className="flex items-end gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => handleFiles(e.target.files)}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={streaming || attached.length >= MAX_IMAGES}
                className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-600 disabled:opacity-40 transition-colors shrink-0"
                title="Attach an image (up to 4)"
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
                placeholder={`Ask ${selectedAgent?.name || "AI Agent"} anything — or attach an image...`}
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
                  disabled={
                    (!input.trim() && attached.length === 0) || streaming
                  }
                  className="px-4 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-glow transition-all flex items-center gap-2 shrink-0"
                >
                  <Send className="w-4 h-4" />
                  Send
                </button>
              )}
            </div>
            <p className="mt-2 text-[10px] text-slate-400 font-semibold flex items-center gap-1.5">
              <RefreshCw className="w-3 h-3" />
              Conversations saved automatically. Click 🕘 History to revisit past chats. Language: {currentLang.flag} {currentLang.label}
            </p>
          </form>
      </div>
    </div>
  );
}
