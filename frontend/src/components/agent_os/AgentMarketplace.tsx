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
  Zap,
  Mic,
  MicOff,
  Volume2,
  ThumbsUp,
  ThumbsDown,
  ArrowRight
} from "lucide-react";
import { getAIAgents } from "@/lib/api";
import { useAppStore } from "@/store/useAppStore";
import Markdown from "@/components/chat/Markdown";
import { WorksheetPdfModal } from "@/components/pdf/WorksheetPdfModal";

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
  timestamp?: string;
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
    welcomeText: "Hello Educator! 👋\n\nI'm your **Teacher Mentor AI** — your All-in-One AI Teaching Companion.\n\nI combine **Pedagogy & Classroom Strategies**, **Class Performance Analytics**, **English Language & Pedagogy Coaching**, **Document & Worksheet AI (PDF/DOCX/Photos)**, and **NCERT/CBSE Curriculum Research** all in one place!\n\nHow can I empower your teaching today? 🚀",
    chips: [
      { label: "Pedagogy & Classroom Advice", icon: "🎓", prompt: "Suggest effective pedagogy strategies, active recall techniques, and Bloom's taxonomy ideas for my classroom." },
      { label: "Document & Worksheet Extraction", icon: "📄", prompt: "Summarize the attached chapter/worksheet and generate 5 differentiated practice questions." },
      { label: "Class Analytics & Marks Radar", icon: "📊", prompt: "Analyze class score distributions and suggest targeted interventions for weak topics." },
      { label: "Academic & Curriculum Research", icon: "📖", prompt: "Research CBSE & NCERT curriculum guidelines for experiential concept learning." },
      { label: "English Communication Coach", icon: "💬", prompt: "Help me polish and refine this parent-teacher communication note in professional academic English." },
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

  // Read agent & prompt from URL query params or sessionStorage (from OCR Scanner)
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
    
    // Check sessionStorage first for full untruncated OCR text
    const sessionPrompt = typeof window !== "undefined" ? sessionStorage.getItem("devgya_mentor_initial_prompt") : null;
    if (sessionPrompt) {
      setInput(sessionPrompt);
      sessionStorage.removeItem("devgya_mentor_initial_prompt");
      setTimeout(() => {
        if (inputRef.current) {
          autoGrow(inputRef.current);
          inputRef.current.focus();
        }
      }, 150);
    } else if (promptParam) {
      setInput(promptParam);
      setTimeout(() => {
        if (inputRef.current) {
          autoGrow(inputRef.current);
          inputRef.current.focus();
        }
      }, 150);
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

  // Speech-to-Text state (Voice Question Input)
  const [isListening, setIsListening] = useState(false);
  const speechRecognitionRef = useRef<any>(null);

  // PDF & Worksheet Studio modal state
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [selectedPdfContent, setSelectedPdfContent] = useState("");
  const [pdfModalTitle, setPdfModalTitle] = useState("Classroom Practice Worksheet");

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

  // Toggle Speech-to-Text voice recognition (Mobile & Desktop)
  const toggleSpeechRecognition = () => {
    if (typeof window === "undefined") return;
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      alert("Voice input is not supported in this browser. Please use Google Chrome, Safari, or Microsoft Edge.");
      return;
    }

    if (isListening) {
      if (speechRecognitionRef.current) {
        try { speechRecognitionRef.current.stop(); } catch (e) {}
        speechRecognitionRef.current = null;
      }
      setIsListening(false);
      return;
    }

    try {
      const rec = new SR();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = language === "hindi" ? "hi-IN" : language === "hinglish" ? "hi-IN" : "en-IN";

      let initialBaseText = input.trim();
      let prefix = initialBaseText ? initialBaseText + " " : "";

      rec.onresult = (e: any) => {
        let interim = "";
        let final = "";
        for (let i = e.resultIndex; i < e.results.length; i++) {
          const t = e.results[i][0].transcript;
          if (e.results[i].isFinal) {
            final += t;
          } else {
            interim += t;
          }
        }
        const spoken = (final || interim).trim();
        if (spoken) {
          setInput(prefix + spoken);
          if (inputRef.current) {
            autoGrow(inputRef.current);
          }
        }
      };

      rec.onerror = (e: any) => {
        console.warn("Speech recognition notice:", e.error);
        if (e.error === "not-allowed" || e.error === "service-not-allowed") {
          alert("Microphone permission was denied. Please allow microphone access in your browser settings.");
          setIsListening(false);
          speechRecognitionRef.current = null;
        } else if (e.error !== "no-speech") {
          setIsListening(false);
          speechRecognitionRef.current = null;
        }
      };

      rec.onend = () => {
        setIsListening(false);
        speechRecognitionRef.current = null;
      };

      speechRecognitionRef.current = rec;
      rec.start();
      setIsListening(true);
    } catch (err) {
      console.error("Speech recognition start failed:", err);
      setIsListening(false);
    }
  };

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
      <div className="flex flex-col h-[calc(100vh-8.5rem)] min-h-[520px]">
          {/* 2. AGENT DETAIL BANNER + 3D ROBOT + 5 QUICK TOOLS (LIGHT THEME HERO CARD) */}
          {selectedAgent && (
            <div className="bg-gradient-to-br from-[#F6F4FE] via-[#EDE9FE]/60 to-[#F0F4FF] p-4 sm:p-5 rounded-3xl border border-indigo-200/80 shadow-xs mb-3 relative overflow-hidden shrink-0">
              <div className="flex items-start justify-between gap-3">
                {/* Left: Avatar, Title, Active Badge, Subtitle & Controls */}
                <div className="space-y-2.5 flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/25 shrink-0 border border-white/40">
                      <Bot className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-sm sm:text-base font-black text-slate-900 truncate">
                          {selectedAgent.name}
                        </h2>
                        <span className="text-[9px] font-black uppercase text-emerald-700 bg-emerald-100/90 px-2 py-0.5 rounded-full border border-emerald-300 shrink-0">
                          ACTIVE
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 font-semibold flex items-center gap-1.5 mt-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block shrink-0 animate-pulse" />
                        <span className="truncate">Your all-in-one AI teaching companion that understands your classroom.</span>
                      </p>
                    </div>
                  </div>

                  {/* CONTROLS ROW: Language + History + New Chat */}
                  <div className="flex items-center gap-2 pt-0.5">
                    {/* LANGUAGE SELECTOR */}
                    <div className="relative" ref={langDropdownRef}>
                      <button
                        onClick={() => setLangDropdownOpen((v) => !v)}
                        className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
                        title="Select AI reply language"
                      >
                        <Globe className="w-3.5 h-3.5 text-indigo-600" />
                        <span>{currentLang.label} ({currentLang.code === "english" ? "GB" : currentLang.code.toUpperCase()})</span>
                      </button>

                      {langDropdownOpen && (
                        <div className="absolute left-0 top-full mt-1 z-50 bg-white border border-slate-200 rounded-xl shadow-xl py-1 min-w-[160px]">
                          {LANGUAGES.map((lang) => (
                            <button
                              key={lang.code}
                              onClick={() => {
                                setLanguage(lang.code);
                                setLangDropdownOpen(false);
                              }}
                              className={`w-full text-left px-3 py-2 text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer ${
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
                      className="p-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl shadow-2xs transition-all cursor-pointer"
                      title="Chat history"
                    >
                      <History className="w-4 h-4 text-slate-600" />
                    </button>

                    {/* NEW CHAT BUTTON */}
                    <button
                      onClick={newChat}
                      className="p-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl shadow-2xs transition-all cursor-pointer"
                      title="New chat"
                    >
                      <Plus className="w-4 h-4 text-slate-600" />
                    </button>
                  </div>
                </div>

                {/* Right: 3D Cute AI Robot Avatar Illustration */}
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-tr from-indigo-500/20 via-purple-500/20 to-rose-500/10 rounded-3xl border border-indigo-200/70 p-1 flex items-center justify-center shrink-0 shadow-inner">
                  <div className="w-full h-full bg-white/95 rounded-2xl flex flex-col items-center justify-center shadow-md border border-white">
                    <Bot className="w-8 h-8 text-indigo-600" />
                    <span className="text-[8px] font-black text-indigo-700 uppercase tracking-tighter mt-0.5">DEVGYA AI</span>
                  </div>
                </div>
              </div>

              {/* 5 QUICK ACTIONS TOOL CHIPS (2-COLUMN GRID MATCHING SCREENSHOT) */}
              <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-indigo-200/60">
                {(AGENT_CUSTOM_WELCOME[selectedAgentCode] || AGENT_CUSTOM_WELCOME["teacher_mentor"]).chips.slice(0, 5).map((chip, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setInput(chip.prompt);
                      setTimeout(() => inputRef.current?.focus(), 100);
                    }}
                    className={`p-2.5 bg-white/90 hover:bg-white border border-indigo-100/90 hover:border-indigo-300 rounded-2xl text-left transition-all shadow-xs flex items-center gap-2 group active:scale-95 cursor-pointer ${
                      idx === 4 ? "col-span-1" : ""
                    }`}
                  >
                    <span className="text-sm shrink-0">{chip.icon}</span>
                    <span className="text-[11px] font-bold text-slate-800 group-hover:text-indigo-700 truncate leading-tight">{chip.label}</span>
                  </button>
                ))}

                {/* View all tools link */}
                <div className="flex items-center justify-end pr-2">
                  <button
                    type="button"
                    onClick={() => {
                      setInput("List all pedagogical tools, CBSE exam strategies, and document extraction actions for " + selectedAgent.name);
                      setTimeout(() => inputRef.current?.focus(), 100);
                    }}
                    className="text-xs font-extrabold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    View all tools <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 3. MAIN CHAT AREA WITH HISTORY OVERLAY & MESSAGE BUBBLES */}
          <div className="flex-1 relative rounded-3xl border border-slate-200/90 overflow-hidden bg-slate-50 shadow-inner flex flex-col justify-between">
            {/* HISTORY SLIDE-OUT PANEL */}
            {historyOpen && (
              <>
                <div
                  className="absolute inset-0 z-20 bg-slate-900/20 backdrop-blur-[2px]"
                  onClick={() => setHistoryOpen(false)}
                />
                <aside className="absolute z-30 inset-y-0 right-0 w-72 sm:w-80 bg-white/98 backdrop-blur-xl border-l border-slate-200 flex flex-col shadow-2xl animate-in slide-in-from-right-5 duration-200">
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
                      className="w-full px-3 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Start New Chat
                    </button>
                  </div>
                </aside>
              </>
            )}

            {/* MESSAGES AREA */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div className="max-w-3xl mx-auto space-y-4">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`w-full flex items-start gap-2.5 my-2 ${
                      m.sender === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    {/* Bot Avatar Icon */}
                    {m.sender === "assistant" && (
                      <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold shrink-0 shadow-md shadow-purple-600/20">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                    )}

                    <div
                      className={`relative min-w-[60px] max-w-[88%] sm:max-w-[80%] px-4 py-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-xs transition-all ${
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
                              className="w-24 h-24 object-cover rounded-xl border border-slate-200 shadow-xs"
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

                      {/* User message timestamp */}
                      {m.sender === "user" && (
                        <div className="flex items-center justify-end gap-1 mt-1 text-[9.5px] text-indigo-200 font-semibold">
                          <span>{m.timestamp || "Just now"}</span>
                          <span>✓✓</span>
                        </div>
                      )}

                      {/* Typing indicator */}
                      {m.sender === "assistant" &&
                        m.id === messages[messages.length - 1].id &&
                        streaming &&
                        !m.content && (
                          <div className="flex items-center gap-1.5 py-1">
                            <span className="w-2 h-2 rounded-full bg-purple-500 animate-bounce" />
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

                      {/* Action Bar: Export as PDF Document, 👍, 👎, 📋 */}
                      {m.sender === "assistant" && m.content && (
                        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedPdfContent(m.content);
                              setPdfModalTitle("Academic Overview & Study Notes");
                              setPdfModalOpen(true);
                            }}
                            className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs rounded-xl border border-purple-200/80 flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs active:scale-95"
                            title="Export as Printable A4 PDF Document with Custom Themes"
                          >
                            <FileText className="w-3.5 h-3.5 text-purple-600" />
                            <span>Export as PDF Document</span>
                          </button>

                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              className="p-1.5 rounded-xl border border-slate-200 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                              title="Helpful response"
                            >
                              <ThumbsUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              className="p-1.5 rounded-xl border border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                              title="Report issue"
                            >
                              <ThumbsDown className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleCopy(m.id, m.content)}
                              className="p-1.5 rounded-xl border border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                              title="Copy message"
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
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
            </div>

            {/* 4. FLOATING ROUNDED PILL INPUT BAR */}
            <form
              onSubmit={handleSend}
              className="p-3 bg-white/95 backdrop-blur-md border-t border-slate-200/90 rounded-b-3xl"
            >
              {/* Attached file & document previews */}
              {attached.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2 max-w-3xl mx-auto">
                  {attached.map((item) => (
                    <div key={item.id} className="relative group">
                      {item.type === "image" && item.dataUrl ? (
                        <img
                          src={item.dataUrl}
                          alt={item.name}
                          className="w-14 h-14 object-cover rounded-xl border border-slate-200 shadow-xs"
                        />
                      ) : (
                        <div className="h-14 px-3 py-1.5 bg-gradient-to-br from-slate-50 to-indigo-50/50 border border-slate-200 rounded-xl flex items-center gap-2 shadow-xs min-w-[130px] max-w-[190px]">
                          <div className="w-7 h-7 rounded-lg bg-red-100 border border-red-200 flex items-center justify-center shrink-0">
                            <FileText className="w-3.5 h-3.5 text-red-600" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-[11px] font-bold text-slate-800 truncate leading-tight">{item.name}</p>
                            <p className="text-[9px] font-semibold text-slate-400 mt-0.5">{item.type.toUpperCase()} • {item.sizeStr}</p>
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
                      className="w-14 h-14 rounded-xl border-2 border-dashed border-slate-200 text-slate-400 hover:text-indigo-600 hover:border-indigo-300 flex flex-col items-center justify-center gap-0.5 transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span className="text-[8.5px] font-bold">Add file</span>
                    </button>
                  )}
                </div>
              )}

              {/* LIVE VOICE RECORDING LISTENING BANNER */}
              {isListening && (
                <div className="mb-2 max-w-3xl mx-auto px-3.5 py-2 bg-gradient-to-r from-red-500/10 via-amber-500/10 to-indigo-500/10 border border-red-300/80 rounded-2xl flex items-center justify-between gap-2 shadow-xs animate-in fade-in duration-200">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                    </span>
                    <span className="text-[11px] font-black text-red-700 tracking-wide">
                      🎙️ Listening to your voice... Speak your question in {language === "hindi" ? "Hindi" : language === "hinglish" ? "Hinglish" : "English"}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={toggleSpeechRecognition}
                    className="text-[10px] font-black text-red-600 hover:text-red-800 uppercase px-2 py-0.5 bg-red-100/80 rounded-md cursor-pointer"
                  >
                    Stop
                  </button>
                </div>
              )}

              {/* FLOATING PILL CONTAINER */}
              <div className="max-w-3xl mx-auto bg-slate-100/80 hover:bg-slate-100 border border-slate-200/90 rounded-full px-2 py-1.5 flex items-center gap-1.5 shadow-sm transition-all focus-within:ring-2 focus-within:ring-indigo-200 focus-within:border-indigo-400 focus-within:bg-white">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,.pdf,.docx,.doc,.txt,.md,.csv"
                  multiple
                  className="hidden"
                  onChange={(e) => handleFiles(e.target.files)}
                />
                
                {/* Paperclip Button */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={streaming || attached.length >= MAX_IMAGES}
                  className="w-8 h-8 rounded-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 disabled:opacity-40 transition-colors shrink-0 flex items-center justify-center cursor-pointer shadow-2xs"
                  title="Attach PDF, worksheet, document, or image"
                >
                  <Paperclip className="w-4 h-4 text-slate-600" />
                </button>

                {/* Microphone Button */}
                <button
                  type="button"
                  onClick={toggleSpeechRecognition}
                  disabled={streaming}
                  className={`w-8 h-8 rounded-full border transition-all shrink-0 flex items-center justify-center cursor-pointer shadow-2xs ${
                    isListening
                      ? "bg-red-500 text-white border-red-600 shadow-md shadow-red-500/30 animate-pulse ring-2 ring-red-400/40"
                      : "bg-white hover:bg-slate-50 border-slate-200 text-slate-600"
                  }`}
                  title={isListening ? "Stop Voice Input" : "Speak to Type"}
                >
                  {isListening ? (
                    <MicOff className="w-4 h-4 text-white" />
                  ) : (
                    <Mic className="w-4 h-4 text-slate-600" />
                  )}
                </button>

                {/* Textarea Input */}
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
                  placeholder={`Ask anything to ${selectedAgent?.name || "Teacher Mentor AI"}...`}
                  className="flex-1 bg-transparent px-2 py-1 text-xs text-slate-900 placeholder-slate-400 font-semibold focus:outline-none resize-none max-h-32"
                />

                {/* Circular Send Button */}
                {streaming ? (
                  <button
                    type="button"
                    onClick={stopGenerating}
                    className="w-9 h-9 rounded-full bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-rose-500/30 cursor-pointer active:scale-95 transition-all"
                  >
                    <StopCircle className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={
                      (!input.trim() && attached.length === 0) || streaming
                    }
                    className="w-9 h-9 rounded-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white flex items-center justify-center shrink-0 shadow-md shadow-indigo-600/30 cursor-pointer active:scale-95 transition-all"
                  >
                    <Send className="w-4 h-4 text-white -translate-x-0.5" />
                  </button>
                )}
              </div>

              {/* Sub-bar footer */}
              <div className="flex items-center justify-center gap-3 text-[10px] text-slate-400 font-bold mt-1.5">
                <span className="flex items-center gap-1">
                  <MessageSquare className="w-3 h-3 text-slate-400" />
                  Conversations are saved automatically
                </span>
                <span>|</span>
                <button
                  type="button"
                  onClick={() => setHistoryOpen(true)}
                  className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 cursor-pointer"
                >
                  <History className="w-3 h-3" />
                  History
                </button>
              </div>
            </form>
          </div>
      </div>

      {/* INTERACTIVE WORKSHEET PDF CUSTOMIZER & EXPORT MODAL */}
      <WorksheetPdfModal
        isOpen={pdfModalOpen}
        onClose={() => setPdfModalOpen(false)}
        initialContent={selectedPdfContent}
        defaultTitle={pdfModalTitle}
        defaultSubject={user.subject || "Science"}
        defaultClass={user.classes || "Class 10"}
      />
    </div>
  );
}
