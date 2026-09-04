"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  Headphones,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Video,
  VideoOff,
  Sparkles,
  RefreshCw,
  Play,
  RotateCcw,
  Languages,
  BookOpen,
  Users,
  GraduationCap,
  CheckCircle2,
  MessageSquare,
  Send,
  Lightbulb,
  Zap,
  Info,
  ChevronDown,
  Globe,
  Sliders,
  Award
} from "lucide-react";
import { useAppStore } from "@/store/useAppStore";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "/api/v1";

interface VoiceOption {
  code: string;
  name: string;
  gender: "Female" | "Male";
  lang: string;
  accent: string;
  desc: string;
}

const INDIAN_VOICES: VoiceOption[] = [
  {
    code: "en-IN-NeerjaNeural",
    name: "Neerja",
    gender: "Female",
    lang: "en-IN",
    accent: "Indian English (Educator)",
    desc: "Warm, articulate, and encouraging teacher mentor."
  },
  {
    code: "en-IN-PrabhatNeural",
    name: "Prabhat",
    gender: "Male",
    lang: "en-IN",
    accent: "Indian English (Teacher)",
    desc: "Confident, professional, and clear pedagogical guide."
  },
  {
    code: "hi-IN-SwaraNeural",
    name: "Swara",
    gender: "Female",
    lang: "hi-IN",
    accent: "Hindi / Hinglish (Mentor)",
    desc: "Expressive, polite, and bilingual friendly."
  },
  {
    code: "hi-IN-MadhurNeural",
    name: "Madhur",
    gender: "Male",
    lang: "hi-IN",
    accent: "Hindi / Hinglish (Coach)",
    desc: "Supportive, calm, and conversational."
  }
];

interface ScenarioTopic {
  id: string;
  title: string;
  icon: any;
  category: string;
  starterPrompt: string;
  tips: string[];
}

const PRACTICE_SCENARIOS: ScenarioTopic[] = [
  {
    id: "classroom_instructions",
    title: "Classroom Instructions & Control",
    icon: GraduationCap,
    category: "Teaching",
    starterPrompt: "Hello coach, I want to practice giving clear, polite instructions to my class for opening their textbook to chapter 4 and starting group work.",
    tips: ["Use polite imperatives ('Please settle down', 'Kindly open page...')", "Keep instructions in sequential chunks", "Use positive reinforcement"]
  },
  {
    id: "ptm_dialogue",
    title: "Parent-Teacher Meeting (PTM)",
    icon: Users,
    category: "Communication",
    starterPrompt: "Hello coach, let us roleplay a parent-teacher meeting where a parent is worried about their child's declining marks in Science.",
    tips: ["Start with a positive observation first", "Be empathetic but evidence-based", "Propose a collaborative action plan"]
  },
  {
    id: "staff_principal",
    title: "Staff Room & Principal Briefing",
    icon: BookOpen,
    category: "Professional",
    starterPrompt: "Hello coach, I need to present a brief proposal to our School Principal for organizing an Inter-House Science Exhibition next month.",
    tips: ["State the objective clearly up front", "Highlight student learning outcomes", "Mention tentative dates and resources needed"]
  },
  {
    id: "free_fluency",
    title: "Daily Free Spoken Fluency",
    icon: MessageSquare,
    category: "Conversation",
    starterPrompt: "Hello! Let us have a spontaneous spoken conversation about effective modern teaching methods and student engagement.",
    tips: ["Focus on continuous flow without pausing", "Expand answers with 'For example...' or 'In my experience...'", "Do not worry about minor errors"]
  },
  {
    id: "pronunciation_polish",
    title: "Pronunciation & Tongue Twisters",
    icon: Zap,
    category: "Phonetics",
    starterPrompt: "Hello coach, please give me a quick pronunciation exercise and practice words with commonly mispronounced sounds like /w/ vs /v/ and silent letters.",
    tips: ["Observe mouth and lip shape for /v/ (teeth on lip) vs /w/ (rounded lips)", "Emphasize clear syllable stress", "Practice tongue twisters slowly first"]
  }
];

interface FeedbackItem {
  timestamp: string;
  originalText: string;
  polishedPhrasing?: string;
  pedagogicalTip?: string;
}

export function EnglishSpeakingCoach() {
  const { user } = useAppStore();

  // Voice & Mode Config
  const [selectedVoice, setSelectedVoice] = useState<string>("en-IN-NeerjaNeural");
  const [immersionMode, setImmersionMode] = useState<"immersion" | "bilingual">("immersion");
  const [activeScenario, setActiveScenario] = useState<ScenarioTopic>(PRACTICE_SCENARIOS[0]);

  // Live Session States
  const [isSessionActive, setIsSessionActive] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState<boolean>(false);
  const [isAiThinking, setIsAiThinking] = useState<boolean>(false);
  const [soundMuted, setSoundMuted] = useState<boolean>(false);
  const [cameraMirrorOn, setCameraMirrorOn] = useState<boolean>(false);

  // Transcripts & Real-time Text
  const [userSpeechText, setUserSpeechText] = useState<string>("");
  const [aiResponseText, setAiResponseText] = useState<string>("");
  const [latestFeedback, setLatestFeedback] = useState<FeedbackItem | null>(null);
  const [conversationHistory, setConversationHistory] = useState<
    Array<{ id: string; sender: "user" | "ai"; text: string; timestamp: string }>
  >([]);

  // Refs for Audio & Streams
  const recognitionRef = useRef<any>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const videoStreamRef = useRef<MediaStream | null>(null);
  const isListeningRef = useRef(isListening);
  const isAiSpeakingRef = useRef(isAiSpeaking);
  const isAiThinkingRef = useRef(isAiThinking);
  const soundMutedRef = useRef(soundMuted);
  const pendingSpeechBufferRef = useRef<string>("");
  const silenceTimerRef = useRef<any>(null);

  // Sync refs with state
  useEffect(() => {
    isListeningRef.current = isListening;
    isAiSpeakingRef.current = isAiSpeaking;
    isAiThinkingRef.current = isAiThinking;
    soundMutedRef.current = soundMuted;
  }, [isListening, isAiSpeaking, isAiThinking, soundMuted]);

  // Clean Text Helper for TTS
  const cleanForSpeech = (raw: string): string => {
    if (!raw) return "";
    let clean = raw;
    // Remove markdown symbols
    clean = clean.replace(/\*\*([^*]+)\*\*/g, "$1");
    clean = clean.replace(/\*([^*]+)\*/g, "$1");
    clean = clean.replace(/`([^`]+)`/g, "$1");
    clean = clean.replace(/#+\s+/g, "");
    clean = clean.replace(/^[-*•]\s+/gm, "");
    // Remove emoji
    clean = clean.replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}]/gu, "");
    return clean.trim();
  };

  // Extract Phrasing & Tip from AI response
  const parseFeedback = (text: string, originalText: string) => {
    const phrasingMatch = text.match(/✨\s*\*?Better Phrasing\*?:\s*["“]([^"”\n]+)["”]|Better Phrasing:\s*([^\n]+)/i);
    const tipMatch = text.match(/💡\s*\*?Tip\*?:\s*([^\n]+)|Tip:\s*([^\n]+)/i);

    if (phrasingMatch || tipMatch) {
      setLatestFeedback({
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        originalText,
        polishedPhrasing: (phrasingMatch?.[1] || phrasingMatch?.[2] || "").trim(),
        pedagogicalTip: (tipMatch?.[1] || tipMatch?.[2] || "").trim()
      });
    }
  };

  // Play Neural TTS with fallback
  const playSpeech = useCallback((textToSpeak: string, customVoice?: string) => {
    if (soundMutedRef.current) return;
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }

    const voice = customVoice || selectedVoice;
    const cleanText = cleanForSpeech(textToSpeak);
    if (!cleanText) return;

    setIsAiSpeaking(true);

    const streamUrl = `${API_BASE}/tts/speak?voice=${encodeURIComponent(voice)}&text=${encodeURIComponent(cleanText)}`;
    const audio = new Audio(streamUrl);
    currentAudioRef.current = audio;

    audio.onplay = () => {
      setIsAiSpeaking(true);
    };

    audio.onended = () => {
      setIsAiSpeaking(false);
      currentAudioRef.current = null;
      // Re-enable listening after speech if session is active
      if (isSessionActive && !isAiThinkingRef.current) {
        startSpeechRecognition();
      }
    };

    audio.onerror = () => {
      // Graceful fallback to browser Web Speech API
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
        const utt = new SpeechSynthesisUtterance(cleanText);
        utt.lang = voice.startsWith("hi") ? "hi-IN" : "en-IN";
        utt.onend = () => {
          setIsAiSpeaking(false);
          if (isSessionActive && !isAiThinkingRef.current) {
            startSpeechRecognition();
          }
        };
        utt.onerror = () => {
          setIsAiSpeaking(false);
        };
        window.speechSynthesis.speak(utt);
      } else {
        setIsAiSpeaking(false);
      }
    };

    audio.play().catch(() => {
      // Browser blocked autoplay without user gesture or stream error
      setIsAiSpeaking(false);
    });
  }, [selectedVoice, isSessionActive]);

  // Send Teacher Spoken / Typed Message to Backend AI
  const handleSendMessage = useCallback(async (spokenInput: string) => {
    const input = spokenInput.trim();
    if (!input || isAiThinkingRef.current) return;

    // Stop listening during processing
    stopSpeechRecognition();
    setIsAiThinking(true);
    setUserSpeechText(input);

    const userMessageItem = {
      id: `usr-${Date.now()}`,
      sender: "user" as const,
      text: input,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };
    setConversationHistory(prev => [...prev, userMessageItem]);

    try {
      const modeInstruction = immersionMode === "immersion"
        ? "Respond in natural, elegant, encouraging Indian/Global English. Help the educator refine their spoken fluency."
        : "The educator is using bilingual / Hinglish mode. Feel free to explain concepts with simple Hindi hints while keeping primary phrasing in polished English.";

      const promptDirective = `[TEACHER ENGLISH SPEAKING COACH SESSION]
Active Scenario: ${activeScenario.title}
Mode: ${immersionMode} (${modeInstruction})
Educator's Spoken Input: "${input}"

Instructions:
1. Provide a warm, conversational 2-sentence response as their peer mentor/coach.
2. If their English can be elevated or has a minor error, provide:
✨ Better Phrasing: "[Polished teacher phrasing]"
💡 Tip: [Brief 1-sentence tip on vocabulary or tone]
3. Ask a natural follow-up question to keep the conversation going.`;

      const fd = new FormData();
      fd.append("message", promptDirective);
      fd.append("agent_code", "english_coach");
      fd.append("user_id", user?.id || "teacher-guest");
      fd.append("language", immersionMode === "immersion" ? "english" : "hinglish");

      const res = await fetch(`${API_BASE}/agents/chat`, {
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
          setAiResponseText(fullAiText);
        }

        try {
          const parsed = JSON.parse(fullAiText);
          fullAiText = parsed.response || fullAiText;
        } catch {}

        setAiResponseText(fullAiText);
        parseFeedback(fullAiText, input);

        const aiMessageItem = {
          id: `ai-${Date.now()}`,
          sender: "ai" as const,
          text: fullAiText,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        };
        setConversationHistory(prev => [...prev, aiMessageItem]);

        setIsAiThinking(false);
        // Play AI speech through Neural TTS
        playSpeech(fullAiText);
      } else {
        const data = await res.json();
        const fullAiText = data.response || "Excellent! Let us practice the next line together.";
        setAiResponseText(fullAiText);
        parseFeedback(fullAiText, input);
        setIsAiThinking(false);
        playSpeech(fullAiText);
      }
    } catch (err) {
      console.error("Coach response error:", err);
      setIsAiThinking(false);
      const fallbackMsg = "I hear you! Could you please repeat that line with slightly more clarity?";
      setAiResponseText(fallbackMsg);
      playSpeech(fallbackMsg);
    }
  }, [immersionMode, activeScenario, user?.id, playSpeech]);

  // Web Speech API: Speech Recognition Engine
  const startSpeechRecognition = useCallback(() => {
    if (typeof window === "undefined") return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

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
        pendingSpeechBufferRef.current = "";
      };

      recognition.onresult = (event: any) => {
        if (isAiSpeakingRef.current || isAiThinkingRef.current) return;

        let interim = "";
        let final = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const item = event.results[i];
          if (item.isFinal) {
            final += item[0].transcript + " ";
          } else {
            interim += item[0].transcript;
          }
        }

        const currentText = (final || interim).trim();
        if (currentText) {
          setUserSpeechText(currentText);
          pendingSpeechBufferRef.current = (pendingSpeechBufferRef.current + " " + final).trim() || currentText;

          // Silence timeout: auto-send after 1.4s of quiet
          clearTimeout(silenceTimerRef.current);
          silenceTimerRef.current = setTimeout(() => {
            const readyToSend = pendingSpeechBufferRef.current.trim();
            if (readyToSend.length >= 3 && !isAiSpeakingRef.current && !isAiThinkingRef.current) {
              pendingSpeechBufferRef.current = "";
              handleSendMessage(readyToSend);
            }
          }, 1400);
        }
      };

      recognition.onerror = (e: any) => {
        if (e.error !== "no-speech") {
          console.warn("Speech recognition error:", e.error);
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
        // Automatically restart if session remains active and coach is not speaking
        if (isSessionActive && !isAiSpeakingRef.current && !isAiThinkingRef.current) {
          setTimeout(() => {
            if (isSessionActive && !isAiSpeakingRef.current && !isAiThinkingRef.current) {
              try { recognition.start(); } catch {}
            }
          }, 300);
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.warn("Could not start speech recognition:", err);
      setIsListening(false);
    }
  }, [immersionMode, isSessionActive, handleSendMessage]);

  const stopSpeechRecognition = useCallback(() => {
    clearTimeout(silenceTimerRef.current);
    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch {}
      recognitionRef.current = null;
    }
    setIsListening(false);
  }, []);

  // Webcam Mirror Management
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 480 }, height: { ideal: 480 } },
        audio: false
      });
      videoStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }
      setCameraMirrorOn(true);
    } catch (err) {
      console.warn("Camera mirror access failed:", err);
      setCameraMirrorOn(false);
    }
  };

  const stopCamera = () => {
    if (videoStreamRef.current) {
      videoStreamRef.current.getTracks().forEach(t => t.stop());
      videoStreamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraMirrorOn(false);
  };

  const toggleCameraMirror = () => {
    if (cameraMirrorOn) {
      stopCamera();
    } else {
      startCamera();
    }
  };

  // Start Live Session
  const handleStartSession = () => {
    setIsSessionActive(true);
    const welcomeText = `Welcome to the English Speaking Coach Studio! I am your AI educator partner. Let us practice ${activeScenario.title}. Please speak into your microphone whenever you are ready.`;
    setAiResponseText(welcomeText);
    setConversationHistory([
      {
        id: `ai-init-${Date.now()}`,
        sender: "ai",
        text: welcomeText,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      }
    ]);
    playSpeech(welcomeText);
  };

  // End Session
  const handleEndSession = () => {
    setIsSessionActive(false);
    stopSpeechRecognition();
    stopCamera();
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }
    setIsAiSpeaking(false);
    setIsAiThinking(false);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopSpeechRecognition();
      stopCamera();
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
      }
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [stopSpeechRecognition]);

  return (
    <div className="min-h-[calc(100vh-4rem)] p-4 md:p-6 max-w-7xl mx-auto flex flex-col space-y-5">
      {/* HEADER BAR */}
      <div className="glass-panel p-5 rounded-3xl border border-slate-200/80 bg-white/80 backdrop-blur-xl shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-rose-500/20">
            <Headphones className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-slate-900 tracking-tight">
                English Speaking Coach
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-100 text-rose-700 border border-rose-200">
                Teacher Live Studio
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Spoken fluency, classroom instructions & PTM communication with authentic Indian accent
            </p>
          </div>
        </div>

        {/* VOICE & MODE SELECTOR CONTROLS */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Neural Voice Picker */}
          <div className="relative flex items-center">
            <select
              value={selectedVoice}
              onChange={(e) => setSelectedVoice(e.target.value)}
              className="appearance-none pl-8 pr-8 py-2 bg-slate-100/90 hover:bg-slate-200/80 text-xs font-bold text-slate-800 rounded-xl border border-slate-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
            >
              {INDIAN_VOICES.map((v) => (
                <option key={v.code} value={v.code}>
                  {v.gender === "Female" ? "👩" : "👨"} {v.name} ({v.accent})
                </option>
              ))}
            </select>
            <Sparkles className="w-3.5 h-3.5 text-indigo-600 absolute left-2.5 pointer-events-none" />
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 pointer-events-none" />
          </div>

          {/* Immersion Mode Toggle */}
          <button
            onClick={() => setImmersionMode(prev => prev === "immersion" ? "bilingual" : "immersion")}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all ${
              immersionMode === "immersion"
                ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                : "bg-amber-50 text-amber-700 border-amber-200"
            }`}
            title="Toggle between English Immersion and Hindi Assisted modes"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>{immersionMode === "immersion" ? "Pure English" : "Hinglish / Hindi-Assisted"}</span>
          </button>

          {/* Confidence Mirror Toggle */}
          <button
            onClick={toggleCameraMirror}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all ${
              cameraMirrorOn
                ? "bg-emerald-50 text-emerald-700 border-emerald-200 shadow-xs"
                : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200/80"
            }`}
          >
            {cameraMirrorOn ? <Video className="w-3.5 h-3.5" /> : <VideoOff className="w-3.5 h-3.5" />}
            <span>{cameraMirrorOn ? "Mirror On" : "Posture Mirror"}</span>
          </button>

          {/* Master Start / End Session Button */}
          {!isSessionActive ? (
            <button
              onClick={handleStartSession}
              className="px-4 py-2 bg-gradient-to-r from-rose-600 to-indigo-600 text-white rounded-xl text-xs font-black tracking-wide shadow-md shadow-indigo-600/20 hover:opacity-95 active:scale-95 transition-all flex items-center gap-2"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Start Live Practice</span>
            </button>
          ) : (
            <button
              onClick={handleEndSession}
              className="px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-black tracking-wide shadow-md shadow-rose-600/20 hover:bg-rose-700 active:scale-95 transition-all flex items-center gap-2"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>End Session</span>
            </button>
          )}
        </div>
      </div>

      {/* SCENARIO SELECTOR STRIP */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {PRACTICE_SCENARIOS.map((sc) => {
          const IconComponent = sc.icon;
          const isSelected = activeScenario.id === sc.id;
          return (
            <button
              key={sc.id}
              onClick={() => {
                setActiveScenario(sc);
                if (isSessionActive) {
                  const switchPrompt = `Let us practice: ${sc.title}. ${sc.starterPrompt}`;
                  handleSendMessage(switchPrompt);
                }
              }}
              className={`px-3.5 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap flex items-center gap-2.5 transition-all cursor-pointer ${
                isSelected
                  ? "bg-slate-900 text-white shadow-md shadow-slate-900/10 scale-100"
                  : "bg-white text-slate-600 border border-slate-200/80 hover:border-slate-300 hover:text-slate-900"
              }`}
            >
              <IconComponent className={`w-4 h-4 ${isSelected ? "text-rose-400" : "text-slate-400"}`} />
              <span>{sc.title}</span>
            </button>
          );
        })}
      </div>

      {/* MAIN TWO-COLUMN WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1 items-start">
        
        {/* LEFT COLUMN: LIVE AUDIO INTERACTION STAGE (8 cols) */}
        <div className="lg:col-span-8 flex flex-col space-y-4">
          <div className="relative overflow-hidden glass-panel rounded-3xl border border-slate-200/80 bg-white/90 p-6 md:p-8 flex flex-col items-center justify-center min-h-[420px] shadow-sm">
            
            {/* BACKGROUND AMBIENT GLOW */}
            <div className={`absolute -top-24 -left-24 w-72 h-72 rounded-full blur-3xl pointer-events-none transition-all duration-700 ${
              isAiSpeaking ? "bg-rose-400/20 scale-125" : isListening ? "bg-indigo-400/20 scale-110" : "bg-slate-200/40"
            }`} />
            <div className={`absolute -bottom-24 -right-24 w-72 h-72 rounded-full blur-3xl pointer-events-none transition-all duration-700 ${
              isAiSpeaking ? "bg-indigo-400/20 scale-125" : isListening ? "bg-emerald-400/20 scale-110" : "bg-slate-200/40"
            }`} />

            {/* FLOATING WEBCAM MIRROR (CONFIDENCE MONITOR) */}
            {cameraMirrorOn && (
              <div className="absolute top-4 right-4 z-20 w-36 h-36 md:w-44 md:h-44 rounded-2xl overflow-hidden border-2 border-white shadow-xl bg-slate-900 group">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover scale-x-[-1]"
                />
                <div className="absolute bottom-1.5 left-2 bg-black/60 backdrop-blur-md px-1.5 py-0.5 rounded text-[9px] font-bold text-white flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Posture & Expression
                </div>
              </div>
            )}

            {/* CENTRAL INTERACTIVE AI ORB */}
            <div className="relative my-4 flex items-center justify-center">
              {/* Outer Pulsing Rings */}
              {isAiSpeaking && (
                <>
                  <div className="absolute w-44 h-44 rounded-full border-2 border-rose-400/40 animate-ping pointer-events-none" />
                  <div className="absolute w-52 h-52 rounded-full border border-indigo-400/30 animate-pulse pointer-events-none" />
                </>
              )}
              {isListening && (
                <div className="absolute w-44 h-44 rounded-full border-2 border-emerald-400/50 animate-ping pointer-events-none" />
              )}

              {/* Core Glowing Ball */}
              <div
                className={`w-32 h-32 rounded-full flex flex-col items-center justify-center transition-all duration-500 shadow-2xl relative z-10 ${
                  isAiSpeaking
                    ? "bg-gradient-to-tr from-rose-500 via-pink-500 to-indigo-600 scale-105 shadow-rose-500/40"
                    : isAiThinking
                    ? "bg-gradient-to-tr from-amber-500 to-orange-500 animate-pulse shadow-amber-500/40"
                    : isListening
                    ? "bg-gradient-to-tr from-emerald-500 to-teal-600 scale-105 shadow-emerald-500/40"
                    : "bg-gradient-to-tr from-slate-700 to-slate-900 shadow-slate-900/20"
                }`}
              >
                {isAiSpeaking ? (
                  <>
                    <Volume2 className="w-10 h-10 text-white animate-bounce" />
                    <span className="text-[10px] font-black uppercase tracking-wider text-rose-100 mt-1">Speaking</span>
                  </>
                ) : isAiThinking ? (
                  <>
                    <RefreshCw className="w-10 h-10 text-white animate-spin" />
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-100 mt-1">Refining</span>
                  </>
                ) : isListening ? (
                  <>
                    <Mic className="w-10 h-10 text-white animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-100 mt-1">Listening</span>
                  </>
                ) : (
                  <>
                    <Headphones className="w-10 h-10 text-white/90" />
                    <span className="text-[10px] font-bold tracking-wider text-slate-300 mt-1">Ready</span>
                  </>
                )}
              </div>
            </div>

            {/* LIVE SUBTITLES DISPLAY */}
            <div className="w-full max-w-xl text-center mt-3 z-10 space-y-2">
              {/* User What You Said Box */}
              {userSpeechText && (
                <div className="p-3 bg-slate-100/90 rounded-2xl border border-slate-200 text-xs text-slate-700 font-medium inline-block max-w-lg shadow-xs">
                  <span className="text-slate-400 font-bold mr-1.5">You said:</span>
                  &ldquo;{userSpeechText}&rdquo;
                </div>
              )}

              {/* AI Coach Subtitle */}
              <div className="min-h-[48px] flex items-center justify-center">
                <p className="text-sm md:text-base font-semibold text-slate-900 leading-relaxed max-w-xl">
                  {aiResponseText || "Click 'Start Live Practice' or tap the microphone to begin speaking."}
                </p>
              </div>
            </div>

            {/* BOTTOM AUDIO CONTROL DECK */}
            <div className="flex items-center gap-4 mt-6 z-10">
              {/* Toggle Mic / Push-to-talk button */}
              <button
                onClick={() => {
                  if (isListening) {
                    stopSpeechRecognition();
                  } else {
                    startSpeechRecognition();
                  }
                }}
                disabled={!isSessionActive || isAiSpeaking || isAiThinking}
                className={`w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-lg active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed ${
                  isListening
                    ? "bg-rose-500 text-white ring-4 ring-rose-300 animate-pulse shadow-rose-500/30"
                    : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-600/30"
                }`}
                title={isListening ? "Mute Microphone" : "Unmute / Speak"}
              >
                {isListening ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
              </button>

              {/* Replay Last AI Speech */}
              <button
                onClick={() => aiResponseText && playSpeech(aiResponseText)}
                disabled={!aiResponseText || isAiSpeaking}
                className="w-11 h-11 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-all border border-slate-200 disabled:opacity-40"
                title="Replay with Indian Neural Voice"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              {/* Mute/Unmute Audio */}
              <button
                onClick={() => {
                  setSoundMuted(prev => !prev);
                  if (currentAudioRef.current) currentAudioRef.current.muted = !soundMuted;
                }}
                className={`w-11 h-11 rounded-full flex items-center justify-center transition-all border ${
                  soundMuted
                    ? "bg-amber-100 text-amber-800 border-amber-300"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200"
                }`}
                title={soundMuted ? "Unmute Coach Voice" : "Mute Coach Voice"}
              >
                {soundMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
            </div>

            {/* QUICK PROMPT INSPIRATION CHIPS */}
            <div className="w-full max-w-xl mt-6 pt-4 border-t border-slate-200/60 flex items-center gap-2 overflow-x-auto scrollbar-none">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
                <Lightbulb className="w-3 h-3 text-amber-500" /> Quick Starters:
              </span>
              {activeScenario.tips.map((tip, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(tip)}
                  disabled={!isSessionActive || isAiSpeaking || isAiThinking}
                  className="px-2.5 py-1 rounded-xl bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 text-[11px] font-medium border border-slate-200 whitespace-nowrap transition-colors disabled:opacity-40"
                >
                  {tip}
                </button>
              ))}
            </div>
          </div>

          {/* LIVE BETTER PHRASING & GRAMMAR FEEDBACK CARD */}
          {latestFeedback && (
            <div className="glass-panel p-5 rounded-3xl border border-indigo-100 bg-gradient-to-r from-indigo-50/70 via-purple-50/50 to-white shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <h3 className="text-xs font-extrabold text-slate-900 tracking-tight">
                    Live Educator Phrasing Polish
                  </h3>
                </div>
                <span className="text-[10px] text-slate-400 font-medium">
                  {latestFeedback.timestamp}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* What You Said */}
                <div className="p-3 bg-white/90 rounded-2xl border border-slate-200/70">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Your Spoken Phrasing
                  </p>
                  <p className="text-xs text-slate-700 italic">
                    &ldquo;{latestFeedback.originalText}&rdquo;
                  </p>
                </div>

                {/* Better Phrasing */}
                {latestFeedback.polishedPhrasing && (
                  <div className="p-3 bg-white/90 rounded-2xl border border-indigo-200">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-[10px] font-black text-indigo-700 uppercase tracking-wider">
                        ✨ Polished Teacher English
                      </p>
                      <button
                        onClick={() => playSpeech(latestFeedback.polishedPhrasing!)}
                        className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                        title="Listen to pronunciation"
                      >
                        <Volume2 className="w-3 h-3" /> Listen
                      </button>
                    </div>
                    <p className="text-xs font-bold text-slate-900">
                      &ldquo;{latestFeedback.polishedPhrasing}&rdquo;
                    </p>
                  </div>
                )}
              </div>

              {/* Pedagogical Tip */}
              {latestFeedback.pedagogicalTip && (
                <div className="mt-2.5 p-2.5 rounded-xl bg-indigo-100/50 border border-indigo-200/50 flex items-start gap-2">
                  <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-indigo-950 font-medium leading-relaxed">
                    <strong className="font-bold">Pedagogical Insight:</strong> {latestFeedback.pedagogicalTip}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: COACHING SCENARIO GUIDES & TRANSCRIPT (4 cols) */}
        <div className="lg:col-span-4 flex flex-col space-y-4">
          
          {/* Active Scenario Card */}
          <div className="glass-panel p-5 rounded-3xl border border-slate-200/80 bg-white/90 shadow-xs">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                <activeScenario.icon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 leading-tight">
                  {activeScenario.title}
                </h3>
                <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider mt-0.5">
                  Focus: {activeScenario.category}
                </p>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Key Spoken Goals for Teachers:
              </p>
              <ul className="space-y-1.5">
                {activeScenario.tips.map((t, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-slate-700 text-xs font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Session Transcript Drawer */}
          <div className="glass-panel p-5 rounded-3xl border border-slate-200/80 bg-white/90 shadow-xs flex flex-col max-h-[360px]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <h4 className="text-xs font-extrabold text-slate-900 tracking-tight flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
                Live Conversation Log
              </h4>
              <span className="text-[10px] text-slate-400 font-medium">
                {conversationHistory.length} turns
              </span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs">
              {conversationHistory.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <p className="text-xs font-medium">No spoken messages yet.</p>
                  <p className="text-[10px] mt-1">Start your session to see the live transcript.</p>
                </div>
              ) : (
                conversationHistory.map((item) => (
                  <div
                    key={item.id}
                    className={`p-3 rounded-2xl ${
                      item.sender === "user"
                        ? "bg-indigo-50/80 border border-indigo-100 text-indigo-950 ml-4"
                        : "bg-slate-50 border border-slate-200/70 text-slate-800 mr-4"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">
                        {item.sender === "user" ? "You (Teacher)" : "AI Speech Coach"}
                      </span>
                      <span className="text-[9px] text-slate-400">{item.timestamp}</span>
                    </div>
                    <p className="text-xs font-medium leading-relaxed">{item.text}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* INDIAN NEURAL AUDIO ENGINE CREDENTIALS */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950 text-white shadow-md">
            <div className="flex items-center gap-2 mb-1.5">
              <Award className="w-4 h-4 text-amber-400" />
              <span className="text-[11px] font-black tracking-wide text-amber-300 uppercase">
                Natural Indian Accent Engine
              </span>
            </div>
            <p className="text-[11px] text-slate-300 font-normal leading-relaxed">
              Powered by Microsoft Neural Voices (`en-IN-Neerja`, `en-IN-Prabhat`, `hi-IN-Swara`). Zero robotic browser synthesis — genuine Indian educator pronunciation.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
