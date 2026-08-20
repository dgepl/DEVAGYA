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

interface AttachedItem {
  id: string;
  name: string;
  type: "image" | "pdf" | "document";
  dataUrl?: string;
  file: File;
  sizeStr: string;
}

const getApiBase = () => {
  if (typeof window !== "undefined") {
    return process.env.NEXT_PUBLIC_API_URL || "/api/v1";
  }
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
};

const API_BASE = getApiBase();
const MAX_IMAGES = 4;

const LANGUAGES = [
  { code: "english", label: "English", flag: "🇬🇧" },
  { code: "hindi", label: "हिंदी", flag: "🇮🇳" },
  { code: "hinglish", label: "Hinglish", flag: "🔀" },
];

interface AgentConfig {
  welcomeText: string;
  chips: Array<{ label: string; icon: string; prompt: string }>;
}

const AGENT_CUSTOM_WELCOME: Record<string, AgentConfig> = {
  teacher_mentor: {
    welcomeText: "Hello Educator! 👋 I'm your **Teacher Mentor AI**. I'm here to assist you with lesson strategies, classroom engagement ideas, grading rubrics, and pedagogical guidance.\n\nHow can I support your classroom teaching today?",
    chips: [
      { label: "Class Activity Ideas", icon: "💡", prompt: "Suggest 3 engaging classroom activities to introduce Photosynthesis to Class 10 students." },
      { label: "Grading Rubric", icon: "📊", prompt: "Create a 4-level rubric for evaluating an oral presentation on Climate Change." },
      { label: "Student Engagement", icon: "🤝", prompt: "How do I handle indifferent or low-engagement students during group discussions?" },
      { label: "Differentiated Teaching", icon: "🎯", prompt: "Provide 3 differentiated learning strategies for a mixed-ability mathematics class." },
    ]
  },
  question_generator: {
    welcomeText: "Welcome! 📝 I'm **Question Generator AI**. I specialize in creating CBSE, ICSE & NCERT aligned exam papers, chapter tests, Bloom's taxonomy indexed questions, and answer keys.\n\nTell me the Subject, Class, and Chapter to generate a custom paper!",
    chips: [
      { label: "Class 10 Science Test", icon: "🧪", prompt: "Generate a 20-mark chapter test for Class 10 Science: Chemical Reactions with Answer Key." },
      { label: "Class 12 Physics MCQs", icon: "⚡", prompt: "Create 5 assertion-reasoning questions for Class 12 Physics: Electrostatics." },
      { label: "Bloom's HOTS Questions", icon: "🔥", prompt: "Generate 3 High-Order Thinking (HOTS) questions for Class 9 Polynomials." },
      { label: "NCERT Worksheet", icon: "📋", prompt: "Create a 10-question practice worksheet for Class 8 Coal and Petroleum." },
    ]
  },
  lesson_planner: {
    welcomeText: "Hello! 📖 I'm **Lesson Planner AI**. I craft structured 45-minute daily lesson plans, weekly unit blueprints, and learning outcomes mapped to NCERT and CBSE standards.\n\nWhich chapter or topic are you planning today?",
    chips: [
      { label: "45-Min Lesson Plan", icon: "⏰", prompt: "Design a 45-minute lesson plan for Class 10 Quadratic Equations including warm-up and assessment." },
      { label: "Weekly Unit Plan", icon: "📅", prompt: "Create a 5-day unit plan for Class 9 English: The Sound of Music." },
      { label: "Hands-on Lab Activity", icon: "🔬", prompt: "Suggest 2 interactive lab activities for Class 7 Acids, Bases, and Salts." },
      { label: "SMART Learning Outcomes", icon: "🎯", prompt: "List SMART learning outcomes for Class 11 Microeconomics: Consumer Equilibrium." },
    ]
  },
  homework_assistant: {
    welcomeText: "Hi there! 📝 I'm **Homework Assistant AI**. Attach your worksheet, PDF, or type your question, and I'll guide you through each step with clear examples!\n\nWhat assignment are we tackling today?",
    chips: [
      { label: "Math Problem Step", icon: "📐", prompt: "Solve 2x^2 + 5x - 3 = 0 step-by-step with explanation." },
      { label: "Physics Numerical", icon: "⚡", prompt: "Calculate equivalent resistance of three 6-ohm resistors in parallel." },
      { label: "Grammar Correction", icon: "✍️", prompt: "Check and correct the grammar of this paragraph: 'She don't know where is the book.'" },
      { label: "Explain Worksheet Q", icon: "📄", prompt: "Explain how to balance chemical equations with 2 simple examples." },
    ]
  },
  student_tutor: {
    welcomeText: "Greetings Explorer! 🧠 I'm your **Socratic AI Student Tutor**. I won't just give away final answers—instead, I'll guide you step-by-step with probing questions so you truly master the concept!\n\nWhat topic would you like to explore today?",
    chips: [
      { label: "Why Sky is Blue", icon: "🌌", prompt: "Why is the sky blue during the day but red during sunset? Guide me!" },
      { label: "Pythagoras Theorem", icon: "📐", prompt: "I don't understand how Pythagoras theorem works. Help me discover it!" },
      { label: "Ohm's Law Analogy", icon: "⚡", prompt: "Explain Ohm's Law V = IR using a simple water pipe analogy." },
      { label: "Photosynthesis Steps", icon: "🌿", prompt: "Guide me step-by-step through the light and dark reactions of photosynthesis." },
    ]
  },
  english_coach: {
    welcomeText: "Welcome! 🗣️ I'm your **English & Communication Coach**. I help you refine spoken English fluency, master grammar rules, polish vocabulary, and grade essays.\n\nHow can we elevate your English skills today?",
    chips: [
      { label: "Grade Essay Intro", icon: "📝", prompt: "Grade and polish this essay intro: 'Technology has changed our world in many good ways.'" },
      { label: "Spoken English Practice", icon: "🎙️", prompt: "Let's practice a conversational dialogue for a job interview or school debate." },
      { label: "Vocabulary Booster", icon: "✨", prompt: "Give me 5 advanced vocabulary words to replace common words like 'good', 'bad', and 'big'." },
      { label: "Grammar Rules Explained", icon: "📚", prompt: "Explain the difference between Present Perfect and Past Simple tenses with examples." },
    ]
  },
  research_assistant: {
    welcomeText: "Hello Scholar! 🔬 I'm your **Academic Research Assistant**. I analyze research papers, extract citations, summarize complex scientific literature, and structure academic essays.\n\nWhat research topic or document shall we investigate?",
    chips: [
      { label: "Literature Review", icon: "📚", prompt: "Summarize recent advances in Renewable Solar Energy Technology for a school paper." },
      { label: "Format APA Citations", icon: "📌", prompt: "Format citations in APA 7th edition for 3 sources on Artificial Intelligence in Education." },
      { label: "Formulate Hypothesis", icon: "🧪", prompt: "Help me formulate a testable scientific hypothesis for a Class 11 Biology project." },
      { label: "Quantum Physics Summary", icon: "⚛️", prompt: "Explain the key concepts of quantum entanglement in simple, accessible terms." },
    ]
  },
  document_assistant: {
    welcomeText: "Welcome! 📄 I'm **Document AI Assistant**. Upload any PDF, textbook chapter, or worksheet (or paste text), and I'll extract key summaries, formulas, flashcards, and quizzes for you!\n\nAttach a document or paste text to begin.",
    chips: [
      { label: "Extract All Formulas", icon: "📐", prompt: "Extract all mathematical formulas and definitions from my attached PDF chapter." },
      { label: "Create 10 Flashcards", icon: "🎴", prompt: "Generate 10 active recall flashcards from the attached study material." },
      { label: "Executive Summary", icon: "📝", prompt: "Summarize the main arguments and conclusions from this document." },
      { label: "Generate 5-Q Quiz", icon: "🎯", prompt: "Build a 5-question quiz with answer key based on the uploaded document." },
    ]
  },
  analytics_assistant: {
    welcomeText: "Hello! 📊 I'm **Analytics & Performance AI**. I analyze student marks, identify class weak spots, track attendance trends, and generate actionable academic performance reports.\n\nShare your class marks data to begin!",
    chips: [
      { label: "Class Weak Spot Radar", icon: "🎯", prompt: "Analyze these test scores: Math (55%), Science (78%), English (88%). Where should we focus?" },
      { label: "Progress Report Summary", icon: "📄", prompt: "Draft an encouraging progress report card summary for a student improving in Mathematics." },
      { label: "Attendance Impact", icon: "📈", prompt: "How does student attendance correlate with quarterly exam results?" },
      { label: "Grade Trend Evaluation", icon: "📊", prompt: "Evaluate a 3-month performance trend showing a dip in mid-term physics scores." },
    ]
  },
  parent_coach: {
    welcomeText: "Welcome Parents! 🤝 I'm **AI Parenting & Study Coach**. I provide evidence-based strategies for managing screen time, building home study routines, and fostering positive child motivation.\n\nHow can I support your parenting journey today?",
    chips: [
      { label: "Manage Screen Time", icon: "📱", prompt: "How do I set healthy screen time limits for a 14-year-old without causing arguments?" },
      { label: "Home Study Routine", icon: "🏠", prompt: "Design a balanced 2-hour evening home study schedule for a Class 10 board exam student." },
      { label: "Overcome Exam Stress", icon: "💙", prompt: "How can I help my child manage exam anxiety and build confidence?" },
      { label: "Focus & Distractions", icon: "🎯", prompt: "What are proven techniques to keep teenagers focused away from mobile phones while studying?" },
    ]
  },
  career_counselor: {
    welcomeText: "Hello Future Leader! 🧭 I'm your **Career & Stream Counselor**. I help high school students choose academic streams (PCM / PCB / Commerce / Humanities), explore college degrees, and map out career paths.\n\nWhat stream or career options are on your mind?",
    chips: [
      { label: "Class 10 Stream Choice", icon: "🎓", prompt: "I like Mathematics and Physics but dislike Biology. Should I choose PCM or Commerce?" },
      { label: "AI & Robotics Career", icon: "🤖", prompt: "What degree and entrance exams (JEE, etc.) should I prepare for a career in AI & Robotics?" },
      { label: "Commerce vs Humanities", icon: "⚖️", prompt: "Compare career opportunities in Commerce with Economics vs Humanities with Law." },
      { label: "Top Entrance Exams India", icon: "🏆", prompt: "List top national entrance exams in India after Class 12 for Engineering, Management, and Law." },
    ]
  },
  revision_assistant: {
    welcomeText: "Welcome! ⚡ I'm **Revision & Mindmap Assistant**. I create 1-Day & 7-Day high-yield revision cheat sheets, formula mindmaps, and exam survival summaries.\n\nWhich subject or chapter are we revising today?",
    chips: [
      { label: "1-Day Exam Cheat Sheet", icon: "📋", prompt: "Create a 1-page high-yield revision cheat sheet for Class 10 Light Reflection & Refraction." },
      { label: "Formula Mindmap", icon: "🧮", prompt: "List all essential formulas for Class 12 Mathematics: Integration & Differentiation." },
      { label: "7-Day Revision Plan", icon: "📅", prompt: "Design a 7-day revision timetable for CBSE Class 10 Social Science." },
      { label: "Important Diagram List", icon: "🎨", prompt: "List all must-draw labeled diagrams for Class 10 Biology board exam." },
    ]
  },
  exam_strategist: {
    welcomeText: "Welcome Champion! 🏆 I'm **Exam Preparation Strategist**. I create board exam time-allocation strategies, mock exam plans, paper solving hacks, and expected question blueprints.\n\nWhich exam are you preparing for?",
    chips: [
      { label: "3-Hour Time Allocation", icon: "⏱️", prompt: "How should I allocate my 3 hours during CBSE Class 10 Math board exam?" },
      { label: "Avoid Silly Mistakes", icon: "❌", prompt: "Give me 5 proven tips to avoid silly calculation mistakes during Science exams." },
      { label: "Mock Test Frequency", icon: "📝", prompt: "How many mock tests should I attempt 1 month before CBSE Class 12 Board Exams?" },
      { label: "High-Weightage Topics", icon: "🎯", prompt: "List the highest weightage chapters in Class 10 CBSE Science exam." },
    ]
  },
  motivation_coach: {
    welcomeText: "Hey Champion! 🔥 I'm your **Growth Mindset & Motivation Coach**. Feeling overwhelmed or burnt out? I'm here to boost your confidence, reignite your focus, and keep your study streak alive!\n\nHow are you feeling about your studies today?",
    chips: [
      { label: "Overcome Study Burnout", icon: "💆‍♂️", prompt: "I feel exhausted and demotivated after studying for 4 hours. How do I reset?" },
      { label: "Beat Procrastination", icon: "🚀", prompt: "I keep delaying studying for my upcoming history test. Help me start now!" },
      { label: "Build Daily Consistency", icon: "🔥", prompt: "How do I build a 30-day consistent study habit without giving up?" },
      { label: "Exam Confidence Boost", icon: "⭐", prompt: "Give me 3 powerful affirmations for staying calm and confident during exam week." },
    ]
  },
  study_planner: {
    welcomeText: "Hello! ⏰ I'm **AI Study Schedule Planner**. I calculate realistic daily and weekly study timetables based on your weak subjects, school hours, and target exam dates.\n\nLet's build your perfect study timetable!",
    chips: [
      { label: "Daily 3-Hour Timetable", icon: "📅", prompt: "Create a realistic 3-hour evening study timetable for a Class 10 student." },
      { label: "Weekly Board Exam Plan", icon: "🗓️", prompt: "Design a weekly timetable balancing Math, Science, English, and Social Studies." },
      { label: "Pomodoro Study Method", icon: "⏱️", prompt: "Explain how to use 25-minute Pomodoro cycles effectively for tough subjects." },
      { label: "Weak Subject Priority", icon: "📈", prompt: "How do I structure my timetable when Math is my weakest subject?" },
    ]
  }
};

const getWelcomeMsg = (agentCode: string): ChatMessage => {
  const config = AGENT_CUSTOM_WELCOME[agentCode] || AGENT_CUSTOM_WELCOME["teacher_mentor"];
  return {
    id: "welcome",
    sender: "assistant",
    content: config.welcomeText,
  };
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

  // Read agent & prompt from URL query params
  const searchParams = useSearchParams();
  useEffect(() => {
    const agentParam = searchParams.get("agent");
    const promptParam = searchParams.get("prompt");
    if (agentParam) {
      setSelectedAgentCode(agentParam);
      // Reset chat when switching agents via sidebar
      setMessages([getWelcomeMsg(agentParam)]);
      setActiveConvId(null);
    }
    if (promptParam) {
      setInput(promptParam);
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [searchParams]);

  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([getWelcomeMsg("teacher_mentor")]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [language, setLanguage] = useState("english");
  const [attached, setAttached] = useState<AttachedItem[]>([]);
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

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

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
    setMessages([getWelcomeMsg(selectedAgentCode)]);
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
    setMessages([getWelcomeMsg(agentCode)]);
    setAttached([]);
    setInput("");
    setStreaming(false);
    setHistoryOpen(false);
  };

  // Handle images, PDFs, and document files
  const handleFiles = (files: FileList | null) => {
    if (!files || streaming) return;
    const remaining = MAX_IMAGES - attached.length;
    Array.from(files)
      .slice(0, remaining)
      .forEach((file) => {
        const ext = file.name.split(".").pop()?.toLowerCase() || "";
        const isImage = file.type.startsWith("image/") || ["jpg", "jpeg", "png", "webp", "gif", "bmp"].includes(ext);
        const isPdf = file.type === "application/pdf" || ext === "pdf";
        
        const fileId = `file-${Date.now()}-${Math.random()}`;
        const itemType: "image" | "pdf" | "document" = isImage ? "image" : isPdf ? "pdf" : "document";

        if (isImage) {
          const reader = new FileReader();
          reader.onload = () => {
            setAttached((prev) => [
              ...prev,
              {
                id: fileId,
                name: file.name,
                type: itemType,
                dataUrl: reader.result as string,
                file: file,
                sizeStr: formatFileSize(file.size),
              },
            ]);
          };
          reader.readAsDataURL(file);
        } else {
          setAttached((prev) => [
            ...prev,
            {
              id: fileId,
              name: file.name,
              type: itemType,
              file: file,
              sizeStr: formatFileSize(file.size),
            },
          ]);
        }
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
    fd.append("user_id", user?.id || "usr-guest");
    fd.append("language", language);
    fd.append("stream", "true");
    if (activeConvId) fd.append("conversation_id", activeConvId);

    // Append images and documents
    const imageUrls: string[] = [];
    attached.forEach((item) => {
      if (item.type === "image" && item.dataUrl) {
        fd.append("images", dataUrlToBlob(item.dataUrl), item.name || "image.jpg");
        imageUrls.push(item.dataUrl);
      } else {
        fd.append("documents", item.file, item.name);
      }
    });

    const docNames = attached.filter(a => a.type !== "image").map(a => a.name).join(", ");
    let userDisplayContent = text;
    if (!text && docNames) {
      userDisplayContent = `📄 *(Attached Worksheet/Document: ${docNames})*`;
    } else if (!text && imageUrls.length > 0) {
      userDisplayContent = "📷 *(Image attached)*";
    }

    const optimisticUser: ChatMessage = {
      id: `local-user-${Date.now()}`,
      sender: "user",
      content: userDisplayContent,
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

      // Read XP earned from response header (Students only)
      if (user?.role === "student") {
        const xpEarned = res.headers.get("X-XP-Earned");
        if (xpEarned) {
          const xpNum = parseInt(xpEarned, 10);
          if (xpNum > 0) {
            setXpToast(xpNum);
            setTimeout(() => setXpToast(null), 3500);
          }
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
          {/* MOBILE HORIZONTAL AGENT SWITCHER PILLS */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-2 scrollbar-none md:hidden shrink-0">
            {agents.map((a) => {
              const IconComp = iconMap[a.icon] || Bot;
              const isSel = a.agent_code === selectedAgentCode;
              return (
                <button
                  key={a.agent_code}
                  onClick={() => switchAgent(a.agent_code)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap shrink-0 flex items-center gap-1.5 transition-all active:scale-95 ${
                    isSel
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20 border border-indigo-600"
                      : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <IconComp className="w-3.5 h-3.5" />
                  <span>{a.name}</span>
                </button>
              );
            })}
          </div>

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
            <div className="h-full overflow-y-auto bg-slate-50/50">
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

                      {/* Typing indicator */}
                      {m.sender === "assistant" &&
                        m.id === messages[messages.length - 1].id &&
                        streaming &&
                        !m.content && (
                          <div className="flex items-center gap-1.5 py-1">
                            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" />
                            <span
                              className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce"
                              style={{ animationDelay: "0.15s" }}
                            />
                            <span
                              className="w-2 h-2 rounded-full bg-purple-600 animate-bounce"
                              style={{ animationDelay: "0.3s" }}
                            />
                          </div>
                        )}

                      {/* Copy button */}
                      {m.sender === "assistant" && m.content && (
                        <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleCopy(m.id, m.content)}
                            className="p-1 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
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

                      {/* QUICK STARTER SUGGESTION CHIPS FOR MOBILE & DESKTOP */}
                      {m.id === "welcome" && messages.length <= 1 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100">
                          {(AGENT_CUSTOM_WELCOME[selectedAgentCode] || AGENT_CUSTOM_WELCOME["teacher_mentor"]).chips.map((chip, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => {
                                setInput(chip.prompt);
                                setTimeout(() => inputRef.current?.focus(), 100);
                              }}
                              className="p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-left hover:border-indigo-300 hover:bg-indigo-50/60 transition-all shadow-xs group active:scale-95 flex items-center gap-2.5"
                            >
                              <span className="text-base shrink-0">{chip.icon}</span>
                              <div className="min-w-0 flex-1">
                                <span className="text-xs font-bold text-slate-800 group-hover:text-indigo-700 block leading-tight truncate">{chip.label}</span>
                                <span className="text-[9px] text-slate-400 font-medium block truncate mt-0.5">{chip.prompt}</span>
                              </div>
                            </button>
                          ))}
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
            {/* Attached file & document previews */}
            {attached.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2.5">
                {attached.map((item) => (
                  <div key={item.id} className="relative group">
                    {item.type === "image" && item.dataUrl ? (
                      <img
                        src={item.dataUrl}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-xl border border-slate-200 shadow-xs"
                      />
                    ) : (
                      <div className="h-16 px-3 py-2 bg-gradient-to-br from-slate-50 to-indigo-50/50 border border-slate-200 rounded-xl flex items-center gap-2 shadow-xs min-w-[140px] max-w-[200px]">
                        <div className="w-8 h-8 rounded-lg bg-red-100 border border-red-200 flex items-center justify-center shrink-0">
                          <FileText className="w-4 h-4 text-red-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-slate-800 truncate leading-tight">{item.name}</p>
                          <p className="text-[10px] font-semibold text-slate-400 mt-0.5">{item.type.toUpperCase()} • {item.sizeStr}</p>
                        </div>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() =>
                        setAttached((prev) =>
                          prev.filter((a) => a.id !== item.id)
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
                    className="w-16 h-16 rounded-xl border-2 border-dashed border-slate-200 text-slate-400 hover:text-indigo-600 hover:border-indigo-300 flex flex-col items-center justify-center gap-0.5 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="text-[9px] font-bold">Add file</span>
                  </button>
                )}
              </div>
            )}

            <div className="flex items-end gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.pdf,.docx,.doc,.txt,.md,.csv"
                multiple
                className="hidden"
                onChange={(e) => handleFiles(e.target.files)}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={streaming || attached.length >= MAX_IMAGES}
                className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-600 disabled:opacity-40 transition-colors shrink-0 flex items-center gap-1"
                title="Attach PDF, worksheet, document, or image (up to 4)"
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
                placeholder={`Ask ${selectedAgent?.name || "AI Agent"} anything — or attach a PDF, worksheet 📄, or image...`}
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
