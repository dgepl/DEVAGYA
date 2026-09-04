"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Headphones,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  RotateCcw,
  Send,
  Lightbulb,
  ChevronDown,
  Globe,
  Award,
  BookOpen,
  Users,
  GraduationCap,
  MessageSquare,
  Zap,
  Phone,
  PhoneOff,
  Keyboard,
  X,
  History,
  CheckCircle2,
  ArrowRight
} from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { getApiBase } from "@/lib/api";

interface VoiceOption {
  code: string;
  name: string;
  gender: "Female" | "Male";
  lang: string;
  accent: string;
  avatar: string;
}

const INDIAN_VOICES: VoiceOption[] = [
  { code: "en-IN-NeerjaNeural", name: "Neerja", gender: "Female", lang: "en-IN", accent: "Indian English (Educator)", avatar: "👩‍🏫" },
  { code: "en-IN-PrabhatNeural", name: "Prabhat", gender: "Male", lang: "en-IN", accent: "Indian English (Teacher)", avatar: "👨‍🏫" },
  { code: "hi-IN-SwaraNeural", name: "Swara", gender: "Female", lang: "hi-IN", accent: "Hindi / Hinglish (Mentor)", avatar: "👩" },
  { code: "hi-IN-MadhurNeural", name: "Madhur", gender: "Male", lang: "hi-IN", accent: "Hindi / Hinglish (Coach)", avatar: "👨" }
];

interface ScenarioTopic {
  id: string;
  title: string;
  shortTitle: string;
  icon: any;
  starterPrompt: string;
  starterDisplay: string;
  quickStarters: string[];
}

const PRACTICE_SCENARIOS: ScenarioTopic[] = [
  {
    id: "classroom_instructions",
    title: "Classroom Instructions & Control",
    shortTitle: "Classroom",
    icon: GraduationCap,
    starterPrompt: "Hello coach! I want to practice giving smooth, clear classroom instructions to my students in English.",
    starterDisplay: "Hello teacher! I am ready. What classroom instructions would you like to practice giving your students?",
    quickStarters: [
      "Please settle down and open page 42.",
      "Work in pairs and discuss this problem.",
      "Kindly raise your hand if you have a doubt."
    ]
  },
  {
    id: "ptm_dialogue",
    title: "Parent-Teacher Meeting (PTM)",
    shortTitle: "Parent PTM",
    icon: Users,
    starterPrompt: "Hello coach! Let us roleplay a parent-teacher meeting where a parent is worried about their child's marks.",
    starterDisplay: "Welcome! In PTMs, always balance positive reinforcement with constructive guidance. What would you like to say to the parent first?",
    quickStarters: [
      "Aarav is very creative, but needs more focus in homework.",
      "We can work together to help improve their test scores.",
      "I have noticed great progress in their class participation."
    ]
  },
  {
    id: "staff_principal",
    title: "Principal & Staff Room Discussions",
    shortTitle: "Staff & Principal",
    icon: BookOpen,
    starterPrompt: "Hello coach! I want to practice proposing an inter-house science exhibition to our School Principal.",
    starterDisplay: "Good day! Speaking with school leadership requires confidence and structured points. How would you introduce your proposal?",
    quickStarters: [
      "I would like to propose an inter-house science exhibition.",
      "We require permission to use the school auditorium next Friday.",
      "Here is the tentative schedule and budget for the event."
    ]
  },
  {
    id: "free_fluency",
    title: "Daily Spoken Fluency (Free Talk)",
    shortTitle: "Free Fluency",
    icon: MessageSquare,
    starterPrompt: "Hello coach! Let us have a spontaneous, flowing spoken conversation about interactive teaching techniques.",
    starterDisplay: "Hello! Continuous conversation is the fastest way to build spoken fluency. How was your day in the classroom today?",
    quickStarters: [
      "Today my students were really engaged in our interactive quiz.",
      "I tried a new active learning method in class.",
      "How can I encourage quiet students to speak up?"
    ]
  },
  {
    id: "pronunciation_polish",
    title: "Pronunciation & Tongue Twisters",
    shortTitle: "Pronunciation",
    icon: Zap,
    starterPrompt: "Hello coach! Please give me a pronunciation challenge for tricky sounds like /w/ vs /v/.",
    starterDisplay: "Let us polish your phonetics! Try practicing the difference between /v/ (teeth on lip) and /w/ (rounded lips). Repeat after me when you are ready!",
    quickStarters: [
      "Which wristwatches are Swiss wristwatches?",
      "Vincent vowed vengeance very vehemently.",
      "She sells sea shells on the seashore."
    ]
  }
];

interface FeedbackItem {
  originalText: string;
  polishedPhrasing?: string;
  pedagogicalTip?: string;
}

export function EnglishSpeakingCoach() {
  const { user } = useAppStore();

  // Settings
  const [selectedVoice, setSelectedVoice] = useState<string>("en-IN-NeerjaNeural");
  const [immersionMode, setImmersionMode] = useState<"immersion" | "bilingual">("immersion");
  const [activeScenario, setActiveScenario] = useState<ScenarioTopic>(PRACTICE_SCENARIOS[0]);

  // Conversational Session State (Like Gemini Live)
  const [isLiveActive, setIsLiveActive] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState<boolean>(false);
  const [isAiThinking, setIsAiThinking] = useState<boolean>(false);
  const [soundMuted, setSoundMuted] = useState<boolean>(false);
  const [showTextKeyboard, setShowTextKeyboard] = useState<boolean>(false);
  const [showHistoryModal, setShowHistoryModal] = useState<boolean>(false);
  const [micPermissionError, setMicPermissionError] = useState<string | null>(null);

  // Multi-Turn Conversation History Context
  const [conversationId, setConversationId] = useState<string>(() => `conv-live-${Date.now()}`);
  const [conversationHistory, setConversationHistory] = useState<
    Array<{ id: string; sender: "user" | "ai"; text: string; timestamp: string }>
  >([]);

  // Real-time Subtitles & Transcripts
  const [currentSpeechText, setCurrentSpeechText] = useState<string>("");
  const [liveAiSpeech, setLiveAiSpeech] = useState<string>(PRACTICE_SCENARIOS[0].starterDisplay);
  const [latestFeedback, setLatestFeedback] = useState<FeedbackItem | null>(null);
  const [textInput, setTextInput] = useState<string>("");

  // Refs for Continuous Audio Engine
  const recognitionRef = useRef<any>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const isLiveActiveRef = useRef(false);
  const isListeningRef = useRef(false);
  const isAiSpeakingRef = useRef(false);
  const isAiThinkingRef = useRef(false);
  const soundMutedRef = useRef(false);
  const accumulatedSpeechRef = useRef<string>("");
  const silenceTimerRef = useRef<any>(null);
  const autoRestartTimerRef = useRef<any>(null);

  // Keep refs synced
  useEffect(() => { isLiveActiveRef.current = isLiveActive; }, [isLiveActive]);
  useEffect(() => { isListeningRef.current = isListening; }, [isListening]);
  useEffect(() => { isAiSpeakingRef.current = isAiSpeaking; }, [isAiSpeaking]);
  useEffect(() => { isAiThinkingRef.current = isAiThinking; }, [isAiThinking]);
  useEffect(() => { soundMutedRef.current = soundMuted; }, [soundMuted]);

  // Clean Text Helper for TTS
  const cleanForSpeech = (raw: string): string => {
    if (!raw) return "";
    let clean = raw;
    clean = clean.replace(/\*\*([^*]+)\*\*/g, "$1");
    clean = clean.replace(/\*([^*]+)\*/g, "$1");
    clean = clean.replace(/`([^`]+)`/g, "$1");
    clean = clean.replace(/#+\s+/g, "");
    clean = clean.replace(/^[-*•]\s+/gm, "");
    clean = clean.replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}]/gu, "");
    return clean.trim();
  };

  // Parse feedback from coach response
  const parseFeedback = (text: string, originalText: string) => {
    const phrasingMatch = text.match(/✨\s*\*?Better Phrasing\*?:\s*["“]([^"”\n]+)["”]|Better Phrasing:\s*([^\n]+)/i);
    const tipMatch = text.match(/💡\s*\*?Tip\*?:\s*([^\n]+)|Tip:\s*([^\n]+)/i);

    if (phrasingMatch || tipMatch) {
      setLatestFeedback({
        originalText,
        polishedPhrasing: (phrasingMatch?.[1] || phrasingMatch?.[2] || "").trim(),
        pedagogicalTip: (tipMatch?.[1] || tipMatch?.[2] || "").trim()
      });
    }
  };

  // Play Neural TTS with automatic loop back to Listening (Gemini Live flow)
  const playCoachAudio = useCallback((textToSpeak: string, customVoice?: string) => {
    if (soundMutedRef.current) {
      if (isLiveActiveRef.current && !isAiThinkingRef.current) {
        setTimeout(() => startListening(), 400);
      }
      return;
    }

    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }

    const cleanText = cleanForSpeech(textToSpeak);
    if (!cleanText) {
      if (isLiveActiveRef.current && !isAiThinkingRef.current) startListening();
      return;
    }

    const voice = customVoice || selectedVoice;
    setIsAiSpeaking(true);
    stopListening(); // Pause mic so it doesn't hear the speaker

    try {
      const streamUrl = `${getApiBase()}/tts/speak?voice=${encodeURIComponent(voice)}&text=${encodeURIComponent(cleanText)}`;
      const audio = new Audio(streamUrl);
      currentAudioRef.current = audio;

      audio.onplay = () => {
        setIsAiSpeaking(true);
      };

      audio.onended = () => {
        setIsAiSpeaking(false);
        currentAudioRef.current = null;
        // GEMINI LIVE: As soon as AI finishes speaking, automatically resume listening!
        if (isLiveActiveRef.current && !isAiThinkingRef.current) {
          setTimeout(() => {
            if (isLiveActiveRef.current && !isAiSpeakingRef.current && !isAiThinkingRef.current) {
              startListening();
            }
          }, 400);
        }
      };

      audio.onerror = () => {
        fallbackSpeechSynthesis(cleanText, voice);
      };

      audio.play().catch(() => {
        fallbackSpeechSynthesis(cleanText, voice);
      });
    } catch {
      fallbackSpeechSynthesis(cleanText, voice);
    }
  }, [selectedVoice]);

  const fallbackSpeechSynthesis = (text: string, voice: string) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      const utt = new SpeechSynthesisUtterance(text);
      utt.lang = voice.startsWith("hi") ? "hi-IN" : "en-IN";
      utt.onend = () => {
        setIsAiSpeaking(false);
        if (isLiveActiveRef.current && !isAiThinkingRef.current) {
          setTimeout(() => startListening(), 400);
        }
      };
      utt.onerror = () => {
        setIsAiSpeaking(false);
        if (isLiveActiveRef.current && !isAiThinkingRef.current) {
          setTimeout(() => startListening(), 400);
        }
      };
      window.speechSynthesis.speak(utt);
    } else {
      setIsAiSpeaking(false);
      if (isLiveActiveRef.current && !isAiThinkingRef.current) {
        setTimeout(() => startListening(), 400);
      }
    }
  };

  // Interrupt AI Speaking (Like Gemini Live: tap to interrupt)
  const handleInterruptAi = () => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsAiSpeaking(false);
    if (isLiveActive) {
      startListening();
    }
  };

  // Send message to Backend AI Coach with Multi-Turn Context
  const handleSendMessage = useCallback(async (text: string) => {
    const input = text.trim();
    if (!input || isAiThinkingRef.current) return;

    // Immediately stop listening and set thinking state
    stopListening();
    clearTimeout(silenceTimerRef.current);
    accumulatedSpeechRef.current = "";
    setCurrentSpeechText("");
    setIsAiThinking(true);
    setMicPermissionError(null);

    // Save to conversation history
    const userMsgItem = {
      id: `usr-${Date.now()}`,
      sender: "user" as const,
      text: input,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };
    setConversationHistory(prev => [...prev, userMsgItem]);

    try {
      const modeInstruction = immersionMode === "immersion"
        ? "Respond in conversational, natural, supportive Indian/Global English. Speak naturally like a colleague/mentor."
        : "The educator is using bilingual / Hinglish mode. Feel free to explain concepts with simple Hindi hints while keeping primary phrasing in polished English.";

      const promptDirective = `[LIVE CONVERSATIONAL ENGLISH COACH]
Current Scenario: ${activeScenario.title}
Mode: ${immersionMode} (${modeInstruction})
Teacher: "${input}"

Guidelines:
1. Provide a warm, concise conversational spoken response (1 to 2 sentences max) as this is spoken out loud.
2. If there is a noticeable grammatical error or a much more natural educator phrasing, provide:
✨ Better Phrasing: "[Polished line]"
💡 Tip: [1 short sentence on tone or vocabulary]
3. Always ask a brief, natural follow-up question to keep our live spoken dialogue flowing!`;

      const fd = new FormData();
      fd.append("message", promptDirective);
      fd.append("agent_code", "english_coach");
      fd.append("conversation_id", conversationId);
      fd.append("user_id", user?.id || "teacher-guest");
      fd.append("language", immersionMode === "immersion" ? "english" : "hinglish");

      const res = await fetch(`${getApiBase()}/agents/chat`, {
        method: "POST",
        body: fd
      });

      if (res.body) {
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let fullAiText = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          fullAiText += decoder.decode(value, { stream: true });
          setLiveAiSpeech(fullAiText);
        }

        try {
          const parsed = JSON.parse(fullAiText);
          fullAiText = parsed.response || fullAiText;
        } catch {}

        setLiveAiSpeech(fullAiText);
        parseFeedback(fullAiText, input);

        const aiMsgItem = {
          id: `ai-${Date.now()}`,
          sender: "ai" as const,
          text: fullAiText,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        };
        setConversationHistory(prev => [...prev, aiMsgItem]);

        setIsAiThinking(false);
        // Play AI Voice and then automatically loop back to listening
        playCoachAudio(fullAiText);
      } else {
        const data = await res.json();
        const fullAiText = data.response || "Well said! Let us continue practicing together.";
        setLiveAiSpeech(fullAiText);
        parseFeedback(fullAiText, input);
        setIsAiThinking(false);
        playCoachAudio(fullAiText);
      }
    } catch (err) {
      console.error("Conversation error:", err);
      setIsAiThinking(false);
      const fallbackMsg = "I caught that! Could you please repeat that line with slightly more clarity?";
      setLiveAiSpeech(fallbackMsg);
      playCoachAudio(fallbackMsg);
    }
  }, [immersionMode, activeScenario, conversationId, user?.id, playCoachAudio]);

  // Explicit Manual Send (when teacher taps "Send" or taps the orb while speaking)
  const triggerManualSend = () => {
    const candidate = accumulatedSpeechRef.current.trim() || currentSpeechText.trim();
    if (candidate && candidate.length >= 2 && !isAiThinkingRef.current) {
      handleSendMessage(candidate);
    }
  };

  // Continuous Speech Recognition (Gemini Live Mode)
  const startListening = () => {
    setMicPermissionError(null);
    if (typeof window === "undefined") return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setMicPermissionError("Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari, or use text typing.");
      return;
    }

    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch {}
      recognitionRef.current = null;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = immersionMode === "immersion" ? "en-IN" : "hi-IN";
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        accumulatedSpeechRef.current = "";
      };

      recognition.onresult = (event: any) => {
        if (isAiSpeakingRef.current || isAiThinkingRef.current) return;

        // Build the complete transcript from all event results
        let fullTranscript = "";
        for (let i = 0; i < event.results.length; i++) {
          fullTranscript += event.results[i][0].transcript + " ";
        }

        const candidateText = fullTranscript.trim();
        if (candidateText) {
          accumulatedSpeechRef.current = candidateText;
          setCurrentSpeechText(candidateText);

          // GEMINI LIVE CONVERSATIONAL SILENCE DETECTION:
          // When the teacher pauses for 1.2 seconds, automatically transmit and respond!
          clearTimeout(silenceTimerRef.current);
          silenceTimerRef.current = setTimeout(() => {
            const readyToSend = accumulatedSpeechRef.current.trim();
            if (readyToSend.length >= 2 && !isAiSpeakingRef.current && !isAiThinkingRef.current) {
              handleSendMessage(readyToSend);
            }
          }, 1200);
        }
      };

      recognition.onerror = (e: any) => {
        if (e.error !== "no-speech") {
          console.warn("Speech recognition notice:", e.error);
        }
        setIsListening(false);
        if (e.error === "not-allowed" || e.error === "permission-denied") {
          setMicPermissionError("Microphone permission was denied. Please allow microphone access in your browser to practice speaking.");
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        // If there is unsent speech in the buffer, send it immediately!
        const readyToSend = accumulatedSpeechRef.current.trim();
        if (readyToSend.length >= 2 && !isAiSpeakingRef.current && !isAiThinkingRef.current) {
          handleSendMessage(readyToSend);
          return;
        }

        // If live session is active and AI is not speaking/thinking, keep the conversational ear open!
        if (isLiveActiveRef.current && !isAiSpeakingRef.current && !isAiThinkingRef.current) {
          clearTimeout(autoRestartTimerRef.current);
          autoRestartTimerRef.current = setTimeout(() => {
            if (isLiveActiveRef.current && !isAiSpeakingRef.current && !isAiThinkingRef.current) {
              try { recognition.start(); } catch {}
            }
          }, 300);
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.warn("Could not start recognition:", err);
      setIsListening(false);
    }
  };

  const stopListening = () => {
    clearTimeout(silenceTimerRef.current);
    clearTimeout(autoRestartTimerRef.current);
    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch {}
      recognitionRef.current = null;
    }
    setIsListening(false);
  };

  // Toggle Live Mode (Start / End Conversation)
  const toggleLiveConversation = () => {
    if (isLiveActive) {
      // End conversation
      setIsLiveActive(false);
      stopListening();
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current = null;
      }
      setIsAiSpeaking(false);
      setIsAiThinking(false);
      setCurrentSpeechText("");
    } else {
      // Start Gemini Live Conversation
      setIsLiveActive(true);
      const greeting = `Hello! I am ${INDIAN_VOICES.find(v => v.code === selectedVoice)?.name}, your live spoken English coach. Let us practice ${activeScenario.title}. What would you like to speak about?`;
      setLiveAiSpeech(greeting);
      playCoachAudio(greeting);
    }
  };

  // Reset conversation context
  const handleResetConversation = () => {
    setConversationId(`conv-live-${Date.now()}`);
    setConversationHistory([]);
    setLatestFeedback(null);
    setCurrentSpeechText("");
    accumulatedSpeechRef.current = "";
    const resetGreeting = `New conversation started! We are practicing ${activeScenario.title}. Speak whenever you are ready.`;
    setLiveAiSpeech(resetGreeting);
    if (isLiveActive) {
      playCoachAudio(resetGreeting);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopListening();
      if (currentAudioRef.current) currentAudioRef.current.pause();
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  return (
    <div className="min-h-[calc(100vh-4rem)] p-3 md:p-6 max-w-5xl mx-auto flex flex-col justify-between space-y-4">
      
      {/* 1. TOP CONTROL BAR */}
      <div className="glass-panel p-3.5 md:p-4 rounded-3xl border border-slate-200/80 bg-white shadow-xs">
        <div className="flex items-center justify-between gap-3">
          
          {/* Header & Status Indicator */}
          <div className="flex items-center gap-2.5">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-sm shrink-0 transition-colors ${
              isLiveActive ? "bg-gradient-to-tr from-emerald-500 to-teal-600" : "bg-gradient-to-tr from-rose-500 to-indigo-600"
            }`}>
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-sm md:text-base font-black text-slate-900 leading-tight">
                  English Speaking Coach
                </h1>
                {isLiveActive ? (
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                    Live Active
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-slate-100 text-slate-600">
                    Ready
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
                Continuous spoken English dialogue with Indian neural accent
              </p>
            </div>
          </div>

          {/* Voice, Language & Actions */}
          <div className="flex items-center gap-2">
            {/* Indian Voice Selector */}
            <div className="relative">
              <select
                value={selectedVoice}
                onChange={(e) => setSelectedVoice(e.target.value)}
                className="appearance-none pl-7 pr-7 py-1.5 bg-slate-100 text-xs font-bold text-slate-800 rounded-xl border border-slate-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                {INDIAN_VOICES.map((v) => (
                  <option key={v.code} value={v.code}>
                    {v.avatar} {v.name}
                  </option>
                ))}
              </select>
              <Sparkles className="w-3 h-3 text-indigo-600 absolute left-2.5 top-2.5 pointer-events-none" />
              <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2 top-2.5 pointer-events-none" />
            </div>

            {/* Immersion Mode Toggle */}
            <button
              onClick={() => setImmersionMode(prev => prev === "immersion" ? "bilingual" : "immersion")}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 border transition-all ${
                immersionMode === "immersion"
                  ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                  : "bg-amber-50 text-amber-800 border-amber-200"
              }`}
              title="Toggle English Immersion vs Bilingual Hinglish Mode"
            >
              <Globe className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{immersionMode === "immersion" ? "Pure English" : "Hinglish Mode"}</span>
              <span className="sm:hidden">{immersionMode === "immersion" ? "EN" : "HI"}</span>
            </button>

            {/* History Drawer Toggle */}
            <button
              onClick={() => setShowHistoryModal(prev => !prev)}
              className="p-1.5 rounded-xl text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors"
              title="View Conversation Log"
            >
              <History className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* SCENARIO SELECTOR STRIP */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-2.5 pb-0.5 scrollbar-none border-t border-slate-100 mt-2.5">
          {PRACTICE_SCENARIOS.map((sc) => {
            const Icon = sc.icon;
            const isSelected = activeScenario.id === sc.id;
            return (
              <button
                key={sc.id}
                onClick={() => {
                  setActiveScenario(sc);
                  setLatestFeedback(null);
                  setCurrentSpeechText("");
                  const switchNotice = `Let us practice ${sc.title}. ${sc.starterPrompt}`;
                  handleSendMessage(switchNotice);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all cursor-pointer ${
                  isSelected
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? "text-rose-400" : "text-slate-400"}`} />
                <span>{sc.shortTitle}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. GEMINI LIVE CONVERSATIONAL STAGE */}
      <div className="glass-panel p-6 md:p-10 rounded-3xl border border-slate-200/80 bg-gradient-to-b from-white via-slate-50/50 to-white shadow-sm flex flex-col items-center justify-between text-center space-y-6 relative overflow-hidden flex-1 min-h-[440px]">
        
        {/* AMBIENT GLOW EFFECT */}
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full blur-3xl pointer-events-none transition-all duration-700 ${
          isListening
            ? "bg-emerald-400/25 scale-125"
            : isAiSpeaking
            ? "bg-rose-500/25 scale-125"
            : isAiThinking
            ? "bg-amber-400/25 scale-110"
            : isLiveActive
            ? "bg-indigo-400/20 scale-100"
            : "bg-slate-200/40"
        }`} />

        {/* MIC PERMISSION ERROR NOTICE */}
        {micPermissionError && (
          <div className="w-full max-w-md p-3 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 font-medium text-left flex items-start gap-2 z-10">
            <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Microphone Access</p>
              <p className="mt-0.5">{micPermissionError}</p>
            </div>
          </div>
        )}

        {/* COACH SUBTITLES CARD (LIKE GEMINI LIVE ON-SCREEN CAPTION) */}
        <div className="w-full max-w-xl z-10">
          <div className="p-4 md:p-5 rounded-2xl bg-white/90 backdrop-blur-md border border-slate-200/90 shadow-sm relative text-left">
            <div className="flex items-center justify-between mb-2 text-[10px] font-black uppercase tracking-wider">
              <span className="flex items-center gap-1.5 text-indigo-600">
                <Sparkles className="w-3.5 h-3.5" />
                Coach {INDIAN_VOICES.find(v => v.code === selectedVoice)?.name} ({INDIAN_VOICES.find(v => v.code === selectedVoice)?.accent})
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => playCoachAudio(liveAiSpeech)}
                  disabled={isAiSpeaking}
                  className="text-slate-500 hover:text-indigo-600 flex items-center gap-1 text-[11px] font-bold cursor-pointer disabled:opacity-40"
                  title="Replay Audio"
                >
                  <RotateCcw className="w-3 h-3" /> Replay
                </button>
                <button
                  onClick={() => {
                    setSoundMuted(prev => !prev);
                    if (currentAudioRef.current) currentAudioRef.current.muted = !soundMuted;
                  }}
                  className="text-slate-500 hover:text-indigo-600 cursor-pointer"
                  title={soundMuted ? "Unmute" : "Mute"}
                >
                  {soundMuted ? <VolumeX className="w-3.5 h-3.5 text-amber-600" /> : <Volume2 className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <p className="text-sm md:text-base font-semibold text-slate-800 leading-relaxed">
              {liveAiSpeech}
            </p>
          </div>
        </div>

        {/* 3. GEMINI LIVE CENTRAL PULSING ORB (INTERACTIVE VOICE SPHERE) */}
        <div className="relative flex flex-col items-center justify-center my-2 z-10">
          
          {/* Animated Wave Rings */}
          {isAiSpeaking && (
            <>
              <div className="absolute w-48 h-48 rounded-full border-2 border-rose-400/50 animate-ping pointer-events-none" />
              <div className="absolute w-56 h-56 rounded-full border border-indigo-400/40 animate-pulse pointer-events-none" />
            </>
          )}
          {isListening && (
            <>
              <div className="absolute w-48 h-48 rounded-full border-2 border-emerald-400/60 animate-ping pointer-events-none" />
              <div className="absolute w-56 h-56 rounded-full border border-teal-400/40 animate-pulse pointer-events-none" />
            </>
          )}

          {/* Central Touch Orb (Tap to Interrupt / Send / Start) */}
          <button
            onClick={() => {
              if (isAiSpeaking) {
                handleInterruptAi();
              } else if (!isLiveActive) {
                toggleLiveConversation();
              } else if (isListening) {
                // If user speaks and taps orb, immediately send their speech!
                const candidate = accumulatedSpeechRef.current.trim() || currentSpeechText.trim();
                if (candidate && candidate.length >= 2) {
                  handleSendMessage(candidate);
                } else {
                  stopListening();
                }
              } else {
                startListening();
              }
            }}
            className={`w-28 h-28 md:w-36 md:h-36 rounded-full flex flex-col items-center justify-center transition-all duration-500 shadow-2xl cursor-pointer select-none active:scale-95 ${
              isAiSpeaking
                ? "bg-gradient-to-tr from-rose-500 via-pink-500 to-indigo-600 scale-105 shadow-rose-500/40 ring-4 ring-rose-200"
                : isListening
                ? "bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-600 scale-105 shadow-emerald-500/40 ring-4 ring-emerald-200 animate-pulse"
                : isAiThinking
                ? "bg-gradient-to-tr from-amber-500 to-orange-500 shadow-amber-500/40 animate-spin"
                : isLiveActive
                ? "bg-gradient-to-tr from-indigo-600 to-purple-700 shadow-indigo-600/30"
                : "bg-gradient-to-tr from-slate-800 to-slate-950 shadow-slate-900/30 hover:scale-102"
            }`}
          >
            {isAiSpeaking ? (
              <>
                <Volume2 className="w-10 h-10 md:w-12 md:h-12 text-white animate-bounce" />
                <span className="text-[10px] font-black uppercase tracking-wider text-rose-100 mt-1">Tap to Interrupt</span>
              </>
            ) : isListening ? (
              <>
                <Mic className="w-10 h-10 md:w-12 md:h-12 text-white animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-100 mt-1">Tap when Done</span>
              </>
            ) : isAiThinking ? (
              <>
                <RotateCcw className="w-10 h-10 md:w-12 md:h-12 text-white" />
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-100 mt-1">Thinking...</span>
              </>
            ) : isLiveActive ? (
              <>
                <Mic className="w-10 h-10 md:w-12 md:h-12 text-white" />
                <span className="text-[10px] font-black uppercase tracking-wider text-indigo-100 mt-1">Tap to Speak</span>
              </>
            ) : (
              <>
                <Phone className="w-10 h-10 md:w-12 md:h-12 text-white animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-100 mt-1">Start Live</span>
              </>
            )}
          </button>

          {/* Real-time Status Indicator */}
          <div className="mt-4 text-xs font-bold">
            {isAiSpeaking ? (
              <span className="text-rose-600 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping" />
                Coach speaking with authentic Indian accent (tap orb to interrupt)
              </span>
            ) : isListening ? (
              <span className="text-emerald-600 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping" />
                Listening to you... (Pause 1s or tap orb when done)
              </span>
            ) : isAiThinking ? (
              <span className="text-amber-600 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-600 animate-pulse" />
                Refining teacher phrasing & generating voice...
              </span>
            ) : isLiveActive ? (
              <span className="text-indigo-600">
                Live conversation active. Speak anytime!
              </span>
            ) : (
              <span className="text-slate-500">
                Tap &ldquo;Start Live&rdquo; to begin interactive voice conversation
              </span>
            )}
          </div>
        </div>

        {/* LIVE USER TRANSCRIPT BUBBLE (WITH INSTANT SEND BUTTON) */}
        {currentSpeechText && (
          <div className="w-full max-w-xl p-3.5 rounded-2xl bg-indigo-50 border border-indigo-200 text-xs text-indigo-950 text-left z-10 shadow-xs flex items-center justify-between gap-3">
            <div className="flex-1">
              <span className="font-extrabold uppercase text-[10px] text-indigo-600 block mb-0.5">
                {isListening ? "Listening to you:" : "You said:"}
              </span>
              <p className="font-medium text-slate-800">
                &ldquo;{currentSpeechText}&rdquo;
              </p>
            </div>
            {isListening && (
              <button
                onClick={triggerManualSend}
                className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1 shadow-xs cursor-pointer active:scale-95 shrink-0"
              >
                <span>Send Now</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>
        )}

        {/* 4. POLISHED TEACHER ENGLISH FEEDBACK (COLLAPSIBLE GLOWING CARD) */}
        {latestFeedback && (
          <div className="w-full max-w-xl p-4 rounded-2xl bg-gradient-to-r from-purple-50 via-indigo-50 to-white border border-indigo-200 text-left shadow-xs z-10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-black text-indigo-900 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                ✨ Better Teacher English Phrasing
              </span>
              {latestFeedback.polishedPhrasing && (
                <button
                  onClick={() => playCoachAudio(latestFeedback.polishedPhrasing!)}
                  className="text-[11px] font-bold text-indigo-700 hover:text-indigo-900 flex items-center gap-1 cursor-pointer bg-white px-2.5 py-1 rounded-lg border border-indigo-200 shadow-2xs"
                >
                  <Volume2 className="w-3 h-3" /> Listen
                </button>
              )}
            </div>

            {latestFeedback.polishedPhrasing && (
              <p className="text-xs md:text-sm font-bold text-slate-900 mb-1.5">
                &ldquo;{latestFeedback.polishedPhrasing}&rdquo;
              </p>
            )}

            {latestFeedback.pedagogicalTip && (
              <p className="text-[11px] text-slate-600 font-medium">
                💡 <strong className="font-bold text-slate-700">Tip:</strong> {latestFeedback.pedagogicalTip}
              </p>
            )}
          </div>
        )}

      </div>

      {/* 5. LIVE CALL BOTTOM CONTROLS */}
      <div className="glass-panel p-3 rounded-2xl border border-slate-200 bg-white shadow-xs flex items-center justify-between gap-3">
        
        {/* Toggle Live Conversation Call */}
        <button
          onClick={toggleLiveConversation}
          className={`px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 transition-all shadow-sm active:scale-95 cursor-pointer ${
            isLiveActive
              ? "bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/20"
              : "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-emerald-600/20 hover:opacity-95"
          }`}
        >
          {isLiveActive ? (
            <>
              <PhoneOff className="w-4 h-4" />
              <span>End Call</span>
            </>
          ) : (
            <>
              <Phone className="w-4 h-4" />
              <span>Start Live Conversation</span>
            </>
          )}
        </button>

        {/* Quick Starters Inspiration */}
        <div className="hidden md:flex items-center gap-2 overflow-x-auto scrollbar-none flex-1 max-w-md">
          {activeScenario.quickStarters.slice(0, 2).map((st, i) => (
            <button
              key={i}
              onClick={() => handleSendMessage(st)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-indigo-50 text-slate-600 hover:text-indigo-700 text-[11px] font-medium border border-slate-200 truncate cursor-pointer"
            >
              {st}
            </button>
          ))}
        </div>

        {/* Right Tools (Keyboard & Reset) */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowTextKeyboard(prev => !prev)}
            className={`p-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
              showTextKeyboard
                ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200"
            }`}
            title="Toggle Text Input"
          >
            <Keyboard className="w-4 h-4" />
          </button>

          <button
            onClick={handleResetConversation}
            className="p-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200 transition-colors cursor-pointer"
            title="Start Fresh Context"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 6. EXPANDABLE TEXT INPUT (FOR NOISY ENVIRONMENTS) */}
      {showTextKeyboard && (
        <div className="glass-panel p-2.5 rounded-2xl border border-slate-200 bg-white shadow-xs flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <input
            type="text"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && textInput.trim()) {
                handleSendMessage(textInput);
                setTextInput("");
              }
            }}
            placeholder="Type your sentence or question to the coach..."
            className="flex-1 bg-transparent px-3 py-2 text-xs md:text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none"
          />
          <button
            onClick={() => {
              if (textInput.trim()) {
                handleSendMessage(textInput);
                setTextInput("");
              }
            }}
            disabled={!textInput.trim() || isAiThinking}
            className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700 active:scale-95 disabled:opacity-40 transition-all cursor-pointer shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 7. CONVERSATION HISTORY MODAL */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl p-5 shadow-2xl flex flex-col max-h-[80vh]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900">Conversation Transcript</h3>
              </div>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 py-4 pr-1 text-xs">
              {conversationHistory.length === 0 ? (
                <p className="text-center text-slate-400 py-8">No conversation turns yet.</p>
              ) : (
                conversationHistory.map((item) => (
                  <div
                    key={item.id}
                    className={`p-3 rounded-2xl ${
                      item.sender === "user"
                        ? "bg-indigo-50/80 border border-indigo-100 text-indigo-950 ml-6"
                        : "bg-slate-50 border border-slate-200/70 text-slate-800 mr-6"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">
                        {item.sender === "user" ? "You (Teacher)" : `AI Coach (${INDIAN_VOICES.find(v => v.code === selectedVoice)?.name})`}
                      </span>
                      <span className="text-[9px] text-slate-400">{item.timestamp}</span>
                    </div>
                    <p className="text-xs font-medium leading-relaxed">{item.text}</p>
                  </div>
                ))
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setShowHistoryModal(false)}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
