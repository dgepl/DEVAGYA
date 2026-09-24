"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { 
  Sparkles, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Play, 
  Pause, 
  CheckCircle2, 
  AlertCircle, 
  Lock, 
  Unlock, 
  Clock, 
  Award, 
  Trophy, 
  BookOpen, 
  MessageSquare, 
  ArrowRight, 
  RefreshCw, 
  Zap, 
  Flame, 
  Target, 
  HelpCircle, 
  Smile, 
  ChevronRight, 
  ShieldCheck, 
  Layers, 
  Headphones,
  FileText,
  RotateCcw,
  HeartHandshake,
  GraduationCap
} from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { getApiBase } from "@/lib/api";

interface QuestionItem {
  id: number;
  category: string;
  question: string;
  options: string[];
  weakness_tag: string;
}

interface MasterclassLecture {
  topic: string;
  duration?: string;
  summary: string;
  vocal_mechanics: string;
  key_formulas: string[];
  common_traps: string[];
  model_audio_text?: string;
}

interface PracticeItem {
  id: number;
  title: string;
  prompt?: string;
  model_audio_text?: string;
  target_phrase?: string;
  sample_answer?: string;
  coach_starter?: string;
  flawed_sentence?: string;
  corrected_sentence?: string;
  explanation?: string;
  vocal_warmup_phrase?: string;
  focus?: string;
}

interface StepItem {
  step_id: string;
  type: "coach_masterclass" | "vocal_mimicry" | "sentence_doctor" | "conversational_sparring" | "spoken_capstone" | "listen" | "repeat" | "speak" | "interact" | "present" | "capstone" | "game" | "error_fix" | "hook_delivery" | "star_method" | "daily_chitchat" | "polite_request" | "live_lounge" | "mastery_graduation";
  title: string;
  prompt: string;
  model_audio_text?: string;
  target_phrase?: string;
  sample_answer?: string;
  coach_starter?: string;
  topic?: string;
  game_type?: "word_sprint" | "sentence_fixer" | "tongue_twister";
  target_keywords?: string[];
  flawed_sentence?: string;
  corrected_sentence?: string;
  explanation?: string;
  vocal_warmup_phrase?: string;
  masterclass_lecture?: MasterclassLecture;
  practice_items?: PracticeItem[];
}

interface GameItem {
  id: string;
  title: string;
  instructions?: string;
  flawed_sentence?: string;
  corrected_sentence?: string;
  target_keywords?: string[];
}

interface ModuleItem {
  id: string;
  title: string;
  methodology: string;
  description: string;
  focus_areas: string[];
  steps: StepItem[];
  game?: GameItem;
}

interface UserTrack {
  user_id: string;
  user_role: string;
  diagnostic_completed: boolean;
  diagnostic_score: number;
  diagnostic_total: number;
  weak_points: string[];
  fluency_level: string;
  current_module_index: number;
  unlocked_module_index: number;
  completed_steps: string[];
  public_speaking_feedback?: any;
  mastery_report?: any;
  expires_at?: string;
  is_expired?: boolean;
}

// =====================================================================
// LUXURY AUDIO & SPEECH PERFORMANCE HUD COMPONENTS
// =====================================================================
const AudioWaveVisualizer = ({ isActive, color = "indigo" }: { isActive: boolean; color?: "indigo" | "rose" | "emerald" | "amber" }) => {
  const colorMap = {
    indigo: "bg-indigo-400 shadow-indigo-500/50",
    rose: "bg-rose-400 shadow-rose-500/50",
    emerald: "bg-emerald-400 shadow-emerald-500/50",
    amber: "bg-amber-400 shadow-amber-500/50"
  };
  return (
    <div className="flex items-center gap-1 h-7 px-3 py-1 bg-slate-950/70 rounded-full border border-slate-800 backdrop-blur-md">
      {[14, 22, 10, 26, 18, 28, 12, 24, 16, 26, 14, 20].map((h, i) => (
        <span
          key={i}
          className={`w-1 rounded-full transition-all duration-200 ${colorMap[color]}`}
          style={{
            height: isActive ? `${Math.max(5, (h * ((i % 3) + 1) * 0.38))}px` : "4px",
            animation: isActive ? `pulse 0.7s ease-in-out infinite ${(i * 0.07).toFixed(2)}s` : "none"
          }}
        />
      ))}
    </div>
  );
};

const AccuracyRingGauge = ({ score }: { score: number }) => {
  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(100, Math.max(0, score)) / 100) * circumference;
  const strokeColor = score >= 80 ? "#10b981" : score >= 60 ? "#6366f1" : "#f59e0b";

  return (
    <div className="relative flex items-center justify-center w-20 h-20 shrink-0">
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 76 76">
        <circle cx="38" cy="38" r={radius} stroke="#1e293b" strokeWidth="6" fill="transparent" />
        <circle
          cx="38"
          cy="38"
          r={radius}
          stroke={strokeColor}
          strokeWidth="6"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center text-center">
        <span className="text-lg font-black text-white leading-none">{score}%</span>
        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Match</span>
      </div>
    </div>
  );
};

const PacingWpmGauge = ({ wpm }: { wpm: number }) => {
  const isOptimal = wpm >= 115 && wpm <= 155;
  return (
    <div className="flex items-center gap-3 px-3.5 py-2 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-inner">
      <div className="flex flex-col">
        <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Pacing</span>
        <div className="flex items-baseline gap-1">
          <span className="text-base font-black text-white">{wpm}</span>
          <span className="text-[10px] font-bold text-slate-400">WPM</span>
        </div>
      </div>
      <div className="h-6 w-px bg-slate-800" />
      <div className="flex flex-col">
        <span className={`text-[11px] font-bold ${isOptimal ? "text-emerald-400" : "text-amber-400"}`}>
          {isOptimal ? "Sweetspot" : wpm < 115 ? "Deliberate" : "Rapid"}
        </span>
        <span className="text-[9px] text-slate-400 font-medium">120-150 target</span>
      </div>
    </div>
  );
};

const FillerWordBadge = ({ count, fillers }: { count: number; fillers?: Array<{ filler: string; count: number }> }) => {
  if (count === 0) {
    return (
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-[11px] font-extrabold">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
        <span>0 Fillers • Razor Sharp</span>
      </div>
    );
  }
  const fillerNames = fillers?.map(f => `"${f.filler}" (${f.count})`).join(", ") || `${count} detected`;
  return (
    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-950/60 border border-amber-500/30 text-amber-300 text-[11px] font-extrabold">
      <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
      <span>{count} Filler Pauses: {fillerNames}</span>
    </div>
  );
};

const WordAlignmentDisplay = ({
  wordMatches,
  rawTarget
}: {
  wordMatches?: Array<{ word: string; status: "correct" | "hesitant" | "missed" }>;
  rawTarget?: string;
}) => {
  if (!wordMatches || wordMatches.length === 0) {
    if (rawTarget) {
      return (
        <p className="text-base sm:text-lg font-medium text-slate-200 leading-relaxed tracking-wide italic font-serif">
          "{rawTarget}"
        </p>
      );
    }
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-2 p-4 rounded-2xl bg-slate-950/90 border border-slate-800 shadow-inner">
      {wordMatches.map((m, idx) => {
        const isCorrect = m.status === "correct";
        const isHesitant = m.status === "hesitant";
        return (
          <span
            key={idx}
            className={`px-2.5 py-1 rounded-xl text-xs sm:text-sm font-bold tracking-wide transition-all shadow-xs ${
              isCorrect
                ? "bg-emerald-950/90 text-emerald-300 border border-emerald-500/40"
                : isHesitant
                ? "bg-amber-950/90 text-amber-300 border border-amber-500/40"
                : "bg-rose-950/90 text-rose-300 border border-rose-500/40"
            }`}
          >
            {m.word}
            <span className="ml-1 text-[10px] opacity-70">
              {isCorrect ? "✓" : isHesitant ? "~" : "✗"}
            </span>
          </span>
        );
      })}
    </div>
  );
};

export function EnglishSpeakingCoach() {
  const { user } = useAppStore();

  // Primary State
  const [loading, setLoading] = useState<boolean>(true);
  const [track, setTrack] = useState<UserTrack | null>(null);
  const [modules, setModules] = useState<ModuleItem[]>([]);
  const [activeTab, setActiveTab] = useState<"diagnostic" | "roadmap" | "player" | "report">("roadmap");
  const [isRegeneratingCurriculum, setIsRegeneratingCurriculum] = useState<boolean>(false);

  // Diagnostic Test State
  const [diagnosticQuestions, setDiagnosticQuestions] = useState<QuestionItem[]>([]);
  const [currentQIndex, setCurrentQIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [submittingTest, setSubmittingTest] = useState<boolean>(false);
  const [diagnosticResult, setDiagnosticResult] = useState<any>(null);

  // Module Player State
  const [activeModuleIdx, setActiveModuleIdx] = useState<number>(0);
  const [activeStepIdx, setActiveStepIdx] = useState<number>(0);
  const [isAiSpeaking, setIsAiSpeaking] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [userSpokenText, setUserSpokenText] = useState<string>("");
  const [stepCompleteNotice, setStepCompleteNotice] = useState<string | null>(null);

  // Pronunciation Evaluation State (Repeat Step)
  const [repeatMatchScore, setRepeatMatchScore] = useState<number | null>(null);
  const [repeatWordMatches, setRepeatWordMatches] = useState<Array<{ word: string; matched: boolean }>>([]);
  const [hasListened, setHasListened] = useState<boolean>(false);

  // Vocal Warmup & Multi-Dimensional Alignment State (Masterclass & Mimicry)
  const [warmupAccuracyScore, setWarmupAccuracyScore] = useState<number | null>(null);
  const [warmupWordMatches, setWarmupWordMatches] = useState<Array<{ word: string; status: "correct" | "hesitant" | "missed" }>>([]);
  const [warmupPacing, setWarmupPacing] = useState<{ wpm: number; pace_status: string } | null>(null);
  const [warmupFillers, setWarmupFillers] = useState<Array<{ filler: string; count: number }>>([]);
  const [isWarmupEvaluating, setIsWarmupEvaluating] = useState<boolean>(false);
  const [speechAlignmentResult, setSpeechAlignmentResult] = useState<any>(null);
  const speechStartTimeRef = useRef<number | null>(null);

  // Interactive Games State
  const [gameTimer, setGameTimer] = useState<number>(30);
  const [isGameActive, setIsGameActive] = useState<boolean>(false);
  const [collectedKeywords, setCollectedKeywords] = useState<string[]>([]);
  const [sentenceFixResult, setSentenceFixResult] = useState<{ success: boolean; message: string } | null>(null);
  const [gameCompleted, setGameCompleted] = useState<boolean>(false);

  // Public Speaking Stage (LRSP)
  const [speakingTimer, setSpeakingTimer] = useState<number>(60);
  const [isTimerActive, setIsTimerActive] = useState<boolean>(false);
  const [critiqueLoading, setCritiqueLoading] = useState<boolean>(false);
  const [speakingCritique, setSpeakingCritique] = useState<any>(null);

  // Speak Stage Feedback State (AI Positives, Negatives, Improvements)
  const [speakCritique, setSpeakCritique] = useState<{
    positive_points: string[];
    negative_points: string[];
    how_to_improve: string;
    polished_version: string;
    spoken_feedback: string;
  } | null>(null);
  const [speakCritiqueLoading, setSpeakCritiqueLoading] = useState<boolean>(false);

  // Live Step AI Feedback (How it's going, what went well, what to enhance)
  const [coachStepFeedback, setCoachStepFeedback] = useState<{
    status: "great" | "good" | "enhance";
    title: string;
    whatWentWell: string;
    whatToEnhance: string;
    spokenAudio: string;
  } | null>(null);

  // Interactive Live Chat (LRSI) & Hands-Free Conversational Voice Loop
  const [dialogueMessages, setDialogueMessages] = useState<Array<{ sender: "coach" | "user"; text: string; correction?: string | null }>>([]);
  const [isCoachThinking, setIsCoachThinking] = useState<boolean>(false);
  const [isHandsFreeMode, setIsHandsFreeMode] = useState<boolean>(false);
  const [liveLoungeTopic, setLiveLoungeTopic] = useState<string>("🚀 My Career & Aspirations");
  const [isRepeatEvaluating, setIsRepeatEvaluating] = useState<boolean>(false);
  const [isDoctorEvaluating, setIsDoctorEvaluating] = useState<boolean>(false);

  // Studio Neural Coach Voice Settings (Edge-TTS)
  const [coachVoice, setCoachVoice] = useState<string>("en-IN-NeerjaNeural");
  const [coachSpeed, setCoachSpeed] = useState<string>("+0%");
  const activeAudioRef = useRef<HTMLAudioElement | null>(null);

  // Audio / Speech Recognition & Hands-Free Loop Refs
  const recognitionRef = useRef<any>(null);
  const isUserActivelyRecordingRef = useRef<boolean>(false);
  const accumulatedFinalTextRef = useRef<string>("");
  const timerIntervalRef = useRef<any>(null);
  const gameIntervalRef = useRef<any>(null);
  const cachedVoiceRef = useRef<any>(null);
  const isHandsFreeRef = useRef<boolean>(true);
  const activeStepTypeRef = useRef<string>("");
  const silenceTimerRef = useRef<any>(null);
  const isCoachThinkingRef = useRef<boolean>(false);

  // Speech stream stutter & cumulative prefix deduplication
  const deduplicateSpeechStream = (text: string): string => {
    if (!text) return "";
    const words = text.replace(/\s+/g, " ").trim().split(" ").filter(Boolean);
    if (words.length <= 2) return words.join(" ");

    // 1. Clean consecutive single word stutters ('it it it' -> 'it')
    const cleanWords: string[] = [];
    for (const w of words) {
      if (cleanWords.length === 0 || cleanWords[cleanWords.length - 1].toLowerCase() !== w.toLowerCase()) {
        cleanWords.push(w);
      }
    }

    if (cleanWords.length <= 3) return cleanWords.join(" ");

    // 2. Check for cumulative prefix restart from browser speech recognition (e.g. "it is a it is a genuine..."):
    const prefixLen = cleanWords.length >= 4 ? 2 : 1;
    const prefix = cleanWords.slice(0, prefixLen).map(w => w.toLowerCase());

    const matchIndices: number[] = [0];
    for (let idx = 1; idx <= cleanWords.length - prefixLen; idx++) {
      const slice = cleanWords.slice(idx, idx + prefixLen).map(w => w.toLowerCase());
      if (slice.every((w, i) => w === prefix[i])) {
        matchIndices.push(idx);
      }
    }

    if (matchIndices.length >= 2) {
      const lastIdx = matchIndices[matchIndices.length - 1];
      if (cleanWords.length - lastIdx >= 3) {
        return cleanWords.slice(lastIdx).join(" ");
      }
    }

    return cleanWords.join(" ");
  };

  // Clean transcript utility
  const cleanTranscript = (t: string) => {
    return t.replace(/\s+/g, " ").trim();
  };

  // Stop any active audio or browser speech
  const stopSpeaking = useCallback(() => {
    if (activeAudioRef.current) {
      try {
        activeAudioRef.current.pause();
        activeAudioRef.current.currentTime = 0;
      } catch {}
      activeAudioRef.current = null;
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {}
    }
    setIsAiSpeaking(false);
  }, []);

  // Filter and prioritize high quality browser voices as fallback
  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const updateVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        // Exclude robotic SAPI5 desktop voices (Microsoft David, Zira, Mark)
        const filtered = voices.filter(v => 
          !v.name.includes("David") && 
          !v.name.includes("Desktop") && 
          !v.name.includes("Zira") && 
          !v.name.includes("Mark")
        );
        const pool = filtered.length > 0 ? filtered : voices;
        const naturalVoice = pool.find(v => 
          (v.name.includes("Natural") || v.name.includes("Neural") || v.name.includes("Google") || v.name.includes("Online")) &&
          (v.lang.startsWith("en") || v.lang.includes("IN"))
        ) || pool.find(v => v.lang.includes("en-IN")) || pool.find(v => v.lang.startsWith("en")) || pool[0];

        cachedVoiceRef.current = naturalVoice;
      }
    };
    updateVoices();
    window.speechSynthesis.onvoiceschanged = updateVoices;
  }, []);

  // Clean raw speech text before synthesis
  const cleanSpeechText = (raw: string): string => {
    if (!raw) return "";
    return raw
      .replace(/<think>[\s\S]*?<\/think>/gi, "")
      .replace(/```[\s\S]*?```/g, "")
      .replace(/`([^`]+)`/g, "$1")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .replace(/\[(?:Coach|AI|Assistant|Friendly|Teacher)[^\]]*\]/gi, "")
      .replace(/(\*\*|__)(.*?)\1/g, "$2")
      .replace(/(\*|_)(.*?)\1/g, "$2")
      .replace(/~~(.*?)~~/g, "$1")
      .replace(/^#+\s+/gm, "")
      .replace(/^[-*•]\s+/gm, "")
      .replace(/^[0-9]+[\.\)]\s+/gm, "")
      .replace(/^>\s+/gm, "")
      .replace(/[#_~*`]/g, "")
      .replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{1FA70}-\u{1FAFF}]/gu, "")
      .replace(/\s+/g, " ")
      .trim();
  };

  // Speak aloud using Edge-TTS Studio Neural Stream (Primary) with intelligent fallback
  const speakText = useCallback((text: string, onDone?: () => void) => {
    stopSpeaking();
    const cleaned = cleanSpeechText(text);
    if (!cleaned) {
      onDone?.();
      return;
    }

    // 1. Browser Speech Fallback (Modern Natural Voice selection)
    const runBrowserFallback = () => {
      if (typeof window === "undefined" || !("speechSynthesis" in window)) {
        setIsAiSpeaking(false);
        onDone?.();
        return;
      }
      try {
        window.speechSynthesis.cancel();
        const utt = new SpeechSynthesisUtterance(cleaned);
        utt.rate = 0.94;
        utt.pitch = 1.02;

        if (cachedVoiceRef.current) {
          utt.voice = cachedVoiceRef.current;
        }

        utt.onstart = () => setIsAiSpeaking(true);
        utt.onend = () => {
          setIsAiSpeaking(false);
          onDone?.();
        };
        utt.onerror = () => {
          setIsAiSpeaking(false);
          onDone?.();
        };
        window.speechSynthesis.speak(utt);
      } catch {
        setIsAiSpeaking(false);
        onDone?.();
      }
    };

    // 2. Primary: Studio-Quality Edge-TTS Streaming via Backend
    try {
      const baseUrl = getApiBase();
      const streamUrl = `${baseUrl}/tts/speak?voice=${encodeURIComponent(coachVoice)}&rate=${encodeURIComponent(coachSpeed)}&text=${encodeURIComponent(cleaned)}`;
      const audio = new Audio(streamUrl);
      activeAudioRef.current = audio;

      audio.onplay = () => {
        setIsAiSpeaking(true);
      };

      audio.onended = () => {
        setIsAiSpeaking(false);
        activeAudioRef.current = null;
        onDone?.();
      };

      audio.onerror = () => {
        runBrowserFallback();
      };

      audio.play().catch(() => {
        runBrowserFallback();
      });
    } catch {
      runBrowserFallback();
    }
  }, [coachVoice, coachSpeed, stopSpeaking]);

  // 1. Initial State Fetch from Supabase
  const loadState = useCallback(async () => {
    setLoading(true);
    try {
      const uId = user?.id || user?.email || "guest_user";
      const uRole = user?.role || "student";
      const res = await fetch(`${getApiBase()}/english-coach/state?user_id=${encodeURIComponent(uId)}&user_role=${encodeURIComponent(uRole)}`);
      if (res.ok) {
        const data = await res.json();
        setTrack(data.track);
        setModules(data.modules || []);

        if (!data.track.diagnostic_completed || data.track.is_expired) {
          setActiveTab("diagnostic");
          fetchDiagnosticQuestions();
        } else if (data.track.mastery_report) {
          setActiveTab("report");
        } else {
          setActiveTab("roadmap");
          setActiveModuleIdx(data.track.unlocked_module_index || 0);
        }
      }
    } catch (err) {
      console.warn("Could not load coach state:", err);
    } finally {
      setLoading(false);
    }
  }, [user?.id, user?.email, user?.role]);

  const fetchDiagnosticQuestions = async () => {
    try {
      const res = await fetch(`${getApiBase()}/english-coach/diagnostic-questions`);
      if (res.ok) {
        const data = await res.json();
        setDiagnosticQuestions(data.questions || []);
      }
    } catch (err) {
      console.warn("Error fetching diagnostic questions:", err);
    }
  };

  // Sync refs with reactive state
  useEffect(() => {
    isHandsFreeRef.current = isHandsFreeMode;
  }, [isHandsFreeMode]);

  useEffect(() => {
    isCoachThinkingRef.current = isCoachThinking;
  }, [isCoachThinking]);

  // Reset per-step states whenever step, module, or tab changes
  useEffect(() => {
    setUserSpokenText("");
    setRepeatMatchScore(null);
    setRepeatWordMatches([]);
    setWarmupAccuracyScore(null);
    setWarmupWordMatches([]);
    setWarmupPacing(null);
    setWarmupFillers([]);
    setIsWarmupEvaluating(false);
    setSpeechAlignmentResult(null);
    speechStartTimeRef.current = null;
    setHasListened(false);
    setIsListening(false);
    setIsTimerActive(false);
    setSpeakingTimer(60);
    setSpeakingCritique(null);
    setSpeakCritique(null);
    setSpeakCritiqueLoading(false);
    setIsGameActive(false);
    setGameTimer(30);
    setCollectedKeywords([]);
    setSentenceFixResult(null);
    setCoachStepFeedback(null);
    accumulatedFinalTextRef.current = "";
    setGameCompleted(false);
    stopSpeaking();
    clearInterval(timerIntervalRef.current);
    clearInterval(gameIntervalRef.current);
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
    }
    stopRecordingSpeech();

    const currentMod = modules[activeModuleIdx];
    const currentStep = currentMod?.steps[activeStepIdx];
    activeStepTypeRef.current = currentStep?.type || "";

    // If entering conversational sparring step with hands-free mode, start with coach greeting spoken aloud
    const isDialogueStep = currentStep?.type === "conversational_sparring" || currentStep?.type === "interact";
    if (activeTab === "player" && isDialogueStep && currentStep?.coach_starter && dialogueMessages.length === 0) {
      const timer = setTimeout(() => {
        speakText(currentStep.coach_starter!, () => {
          if (isHandsFreeRef.current && (activeStepTypeRef.current === "conversational_sparring" || activeStepTypeRef.current === "interact")) {
            startRecordingSpeech({ continuous: true });
          }
        });
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [activeStepIdx, activeModuleIdx, activeTab, modules]);

  useEffect(() => {
    loadState();
    return () => {
      stopSpeaking();
      clearInterval(timerIntervalRef.current);
      clearInterval(gameIntervalRef.current);
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch {}
      }
    };
  }, [loadState]);

  // 2. Submit Diagnostic Test
  const handleSelectOption = (qId: number, optIdx: number) => {
    setSelectedAnswers(prev => ({ ...prev, [String(qId)]: optIdx }));
  };

  const handleSubmitDiagnostic = async () => {
    if (Object.keys(selectedAnswers).length < diagnosticQuestions.length) {
      alert("Please answer all 10 diagnostic questions to generate your personalized speaking path.");
      return;
    }

    setSubmittingTest(true);
    try {
      const uId = user?.id || user?.email || "guest_user";
      const uRole = user?.role || "student";
      const res = await fetch(`${getApiBase()}/english-coach/diagnostic-submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: uId,
          user_role: uRole,
          answers: selectedAnswers
        })
      });

      if (res.ok) {
        const result = await res.json();
        setDiagnosticResult(result);
        setTrack(result.track);
        setModules(result.modules);
      } else {
        alert("Failed to submit test. Please check connection.");
      }
    } catch (err) {
      console.error("Test submission error:", err);
    } finally {
      setSubmittingTest(false);
    }
  };

  // 3. Complete Step & Strict Progression (No Skipping)
  const handleCompleteStep = async (stepId: string) => {
    if (!canAdvanceStep()) {
      alert("Please complete the required speaking exercise for this step before advancing.");
      return;
    }

    const uId = user?.id || user?.email || "guest_user";
    const uRole = user?.role || "student";
    try {
      const res = await fetch(`${getApiBase()}/english-coach/lecture-complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: uId,
          user_role: uRole,
          module_index: activeModuleIdx,
          step_id: stepId
        })
      });

      if (res.ok) {
        const data = await res.json();
        setTrack(data.track);
        setStepCompleteNotice("Step Completed! Unlocked next stage.");
        setTimeout(() => setStepCompleteNotice(null), 3000);

        const currentMod = modules[activeModuleIdx];
        if (currentMod && activeStepIdx < currentMod.steps.length - 1) {
          setActiveStepIdx(prev => prev + 1);
        } else if (activeModuleIdx < modules.length - 1) {
          setActiveModuleIdx(prev => prev + 1);
          setActiveStepIdx(0);
        }
      } else {
        const err = await res.json();
        alert(err.detail || "Cannot skip steps!");
      }
    } catch (err) {
      console.warn("Step progression error:", err);
    }
  };

  // Calculate word-level phonetic accuracy for the Repeat step
  const calculateWordMatch = (target: string, captured: string) => {
    const cleanTargetWords = target.toLowerCase().replace(/[^a-z0-9\s]/g, "").split(/\s+/).filter(Boolean);
    const cleanCapturedWords = captured.toLowerCase().replace(/[^a-z0-9\s]/g, "").split(/\s+/).filter(Boolean);
    if (cleanTargetWords.length === 0) return { score: 0, matches: [] };

    let matchedCount = 0;
    const matches = cleanTargetWords.map(tw => {
      const isMatched = cleanCapturedWords.some(cw => 
        cw === tw || (tw.length > 4 && (cw.startsWith(tw.slice(0, -1)) || tw.startsWith(cw.slice(0, -1))))
      );
      if (isMatched) matchedCount++;
      return { word: tw, matched: isMatched };
    });

    const score = Math.round((matchedCount / cleanTargetWords.length) * 100);
    return { score, matches };
  };

  // AI Curriculum Regeneration
  const handleRegenerateCurriculum = async () => {
    setIsRegeneratingCurriculum(true);
    try {
      const uId = user?.id || user?.email || "guest_user";
      const uRole = user?.role || "student";
      const res = await fetch(`${getApiBase()}/english-coach/regenerate-curriculum`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: uId, user_role: uRole })
      });
      if (res.ok) {
        const data = await res.json();
        setModules(data.modules || []);
        setTrack(data.track);
        alert("AI has generated a brand new personalized spoken curriculum based on your test results!");
      } else {
        alert("Failed to regenerate curriculum. Please check your connection.");
      }
    } catch (err) {
      console.warn("Error regenerating curriculum:", err);
    } finally {
      setIsRegeneratingCurriculum(false);
    }
  };

  // Backend Multi-Dimensional Speech Evaluator
  const evaluateSpeechBackend = async (targetPhrase: string, spokenText: string, durationSec: number = 4) => {
    try {
      const res = await fetch(`${getApiBase()}/english-coach/evaluate-speech`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          target_phrase: targetPhrase,
          spoken_text: spokenText,
          duration_seconds: durationSec
        })
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn("Speech eval backend error:", e);
    }
    const local = calculateWordMatch(targetPhrase, spokenText);
    return {
      accuracy_score: local.score,
      word_matches: local.matches.map(m => ({ word: m.word, status: m.matched ? "correct" : "missed" })),
      wpm: 128,
      pace_status: "Masterclass Cadence (Optimal)",
      filler_words: [],
      total_fillers: 0,
      spoken_coach_critique: local.score >= 70 ? "Outstanding execution! Diction was clear and confident." : "Good attempt! Let's practice once more."
    };
  };

  // 3-STEP MANUAL TACTILE MIC CONTROLS (ZERO EARLY CUT-OFFS)
  const handleToggleWarmupMic = () => {
    if (isListening) {
      stopRecordingSpeech();
      return;
    }
    speechStartTimeRef.current = Date.now();
    setUserSpokenText("");
    setWarmupAccuracyScore(null);
    setWarmupWordMatches([]);
    setWarmupPacing(null);
    setWarmupFillers([]);
    startRecordingSpeech({ continuous: true });
  };

  const handleEvaluateWarmup = async () => {
    stopRecordingSpeech();
    const currentMod = modules[activeModuleIdx];
    const currentStep = currentMod?.steps[activeStepIdx];
    const warmupPhrase = currentStep?.vocal_warmup_phrase ||
      currentStep?.target_phrase ||
      currentStep?.masterclass_lecture?.model_audio_text ||
      "Good morning everyone! It is a genuine pleasure to connect with all of you today.";

    const textToEval = userSpokenText.trim();
    if (!textToEval) {
      alert("Please record your speech into the microphone before requesting AI Review.");
      return;
    }

    const durationSec = speechStartTimeRef.current ? Math.max(1, (Date.now() - speechStartTimeRef.current) / 1000) : 4;
    speechStartTimeRef.current = null;
    setIsWarmupEvaluating(true);

    try {
      const evalResult = await evaluateSpeechBackend(warmupPhrase, textToEval, durationSec);
      setWarmupAccuracyScore(evalResult.accuracy_score);
      setWarmupWordMatches(evalResult.word_matches);
      setWarmupPacing({ wpm: evalResult.wpm, pace_status: evalResult.pace_status });
      setWarmupFillers(evalResult.filler_words || []);

      setCoachStepFeedback({
        status: evalResult.accuracy_score >= 70 ? "great" : evalResult.accuracy_score >= 45 ? "good" : "enhance",
        title: `Vocal Warmup Complete • Score: ${evalResult.accuracy_score}%`,
        whatWentWell: `Delivered speech at ${evalResult.wpm} WPM (${evalResult.pace_status}) with clear vocal intent.`,
        whatToEnhance: evalResult.total_fillers > 0 ? `Detected ${evalResult.total_fillers} filler word(s). Maintain silent breathing pauses.` : "Maintain grounded terminal inflection.",
        spokenAudio: evalResult.spoken_coach_critique
      });

      if (evalResult.spoken_coach_critique) {
        speakText(evalResult.spoken_coach_critique);
      }
    } finally {
      setIsWarmupEvaluating(false);
    }
  };

  // Repeat Stage Manual Controls
  const handleToggleRepeatMic = () => {
    if (isListening) {
      stopRecordingSpeech();
      return;
    }
    speechStartTimeRef.current = Date.now();
    setUserSpokenText("");
    setRepeatMatchScore(null);
    setRepeatWordMatches([]);
    setSpeechAlignmentResult(null);
    startRecordingSpeech({ continuous: true });
  };

  const handleEvaluateRepeat = async () => {
    stopRecordingSpeech();
    const currentMod = modules[activeModuleIdx];
    const currentStep = currentMod?.steps[activeStepIdx];
    const target = currentStep?.target_phrase || currentStep?.prompt || "";
    const textToEval = userSpokenText.trim();

    if (!textToEval) {
      alert("Please speak into the microphone before requesting AI Review.");
      return;
    }

    const durationSec = speechStartTimeRef.current ? Math.max(1, (Date.now() - speechStartTimeRef.current) / 1000) : 4;
    speechStartTimeRef.current = null;
    setIsRepeatEvaluating(true);

    try {
      const evalResult = await evaluateSpeechBackend(target, textToEval, durationSec);
      setRepeatMatchScore(evalResult.accuracy_score);
      setRepeatWordMatches(evalResult.word_matches.map((m: any) => ({ word: m.word, matched: m.status === "correct" })));
      setSpeechAlignmentResult(evalResult);

      const missed = evalResult.word_matches.filter((m: any) => m.status === "missed").map((m: any) => m.word);
      let status: "great" | "good" | "enhance" = evalResult.accuracy_score >= 70 ? "great" : evalResult.accuracy_score >= 45 ? "good" : "enhance";
      let whatWentWell = `You scored ${evalResult.accuracy_score}% at ${evalResult.wpm} WPM (${evalResult.pace_status}). Crisp diction and steady volume.`;
      let whatToEnhance = missed.length > 0
        ? `To enhance even further, polish enunciation on: "${missed.slice(0, 4).join(", ")}".`
        : "You are doing great! Keep this exact natural cadence and steady pacing.";

      setCoachStepFeedback({
        status,
        title: status === "great" ? `Pronunciation Mastery: ${evalResult.accuracy_score}%` : `Pronunciation Progress: ${evalResult.accuracy_score}%`,
        whatWentWell,
        whatToEnhance,
        spokenAudio: evalResult.spoken_coach_critique
      });

      if (evalResult.spoken_coach_critique) {
        speakText(evalResult.spoken_coach_critique);
      }
    } finally {
      setIsRepeatEvaluating(false);
    }
  };

  // Model audio player with spoken coaching advice
  const handleListenToModel = (modelText: string) => {
    setHasListened(true);
    speakText(modelText, () => {
      setTimeout(() => {
        const spokenGuidance = "Great job tuning your ear! Notice the rhythm and clear pauses. To enhance your speech, echo this exact rhythm in the repeat step.";
        setCoachStepFeedback({
          status: "great",
          title: "Native Model Audio (Listening Stage)",
          whatWentWell: "Engaged with native intonation, accent, and cadence.",
          whatToEnhance: "Focus on syllable stress and where the breath naturally pauses before you speak.",
          spokenAudio: spokenGuidance
        });
        speakText(spokenGuidance);
      }, 400);
    });
  };

  // 5. Speech Recognition Engine (Desktop & Mobile Optimized, Deduplicated)
  const startRecordingSpeech = (options?: { continuous?: boolean; onResult?: (text: string) => void; preserveText?: boolean }) => {
    if (typeof window === "undefined") return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is supported in Chrome, Edge, or Safari.");
      return;
    }

    // Cancel any ongoing browser speech synthesis so desktop Chrome doesn't abort speech recognition
    if (window.speechSynthesis) {
      try {
        window.speechSynthesis.cancel();
      } catch {}
      setIsAiSpeaking(false);
    }

    // Explicitly unbind all event handlers from previous recognition instance to prevent phantom onend triggers
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onstart = null;
        recognitionRef.current.onresult = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.abort();
      } catch {}
      recognitionRef.current = null;
    }

    isUserActivelyRecordingRef.current = true;
    if (!options?.preserveText) {
      accumulatedFinalTextRef.current = "";
    }

    try {
      const rec = new SpeechRecognition();
      rec.lang = "en-IN";
      rec.continuous = true;
      rec.interimResults = true;

      rec.onstart = () => {
        setIsListening(true);
      };

      rec.onresult = (event: any) => {
        let interim = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const item = event.results[i];
          if (item && item[0]) {
            if (item.isFinal) {
              accumulatedFinalTextRef.current += " " + item[0].transcript;
            } else {
              interim += " " + item[0].transcript;
            }
          }
        }

        const fullRaw = (accumulatedFinalTextRef.current + " " + interim).trim();
        const cleaned = deduplicateSpeechStream(cleanTranscript(fullRaw));
        setUserSpokenText(cleaned);
        options?.onResult?.(cleaned);

        // Hands-Free Auto-Send on Sentence Pause Detection in 'interact' stage
        if (activeStepTypeRef.current === "interact" && isHandsFreeRef.current && !isCoachThinkingRef.current) {
          if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current);
          }
          const words = cleaned.trim().split(/\s+/).filter(Boolean);
          if (words.length >= 2) {
            silenceTimerRef.current = setTimeout(() => {
              if (!isCoachThinkingRef.current && isUserActivelyRecordingRef.current) {
                stopRecordingSpeech();
                handleSendDialogueTurn(cleaned);
              }
            }, 1200);
          }
        }
      };

      rec.onerror = (event: any) => {
        if (event?.error === "no-speech" || event?.error === "aborted") {
          return;
        }
        if (event?.error === "audio-capture" || event?.error === "not-allowed") {
          console.warn("Speech recognition access error:", event?.error);
          isUserActivelyRecordingRef.current = false;
          setIsListening(false);
        }
      };

      rec.onend = () => {
        // In Chrome Desktop, when recognition stops after a pause, spin up a clean instance with preserved final text
        if (isUserActivelyRecordingRef.current && !isCoachThinkingRef.current) {
          setTimeout(() => {
            if (isUserActivelyRecordingRef.current && !isCoachThinkingRef.current) {
              startRecordingSpeech({ ...options, preserveText: true });
            }
          }, 150);
          return;
        }
        setIsListening(false);
      };

      recognitionRef.current = rec;
      rec.start();
    } catch (err) {
      console.warn("Speech start error:", err);
      isUserActivelyRecordingRef.current = false;
      setIsListening(false);
    }
  };

  const stopRecordingSpeech = () => {
    isUserActivelyRecordingRef.current = false;
    accumulatedFinalTextRef.current = "";
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onstart = null;
        recognitionRef.current.onresult = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.stop();
      } catch {}
      recognitionRef.current = null;
    }
    setIsListening(false);
  };

  // Speak Stage Manual Mic Toggle
  const handleToggleSpeakMic = () => {
    if (isListening) {
      stopRecordingSpeech();
      return;
    }
    setUserSpokenText("");
    setSpeakCritique(null);
    startRecordingSpeech({ continuous: true });
  };

  // 6. Speak Stage AI Critique (Positives, Negatives, Improvements & Spoken Reply)
  const handleEvaluateSpeakStage = async (explicitText?: string) => {
    const textToEvaluate = (explicitText || userSpokenText).trim();
    if (!textToEvaluate) {
      alert("Please speak your answer into the microphone first!");
      return;
    }

    stopRecordingSpeech();
    setSpeakCritiqueLoading(true);

    try {
      const uId = user?.id || user?.email || "guest_user";
      const currentMod = modules[activeModuleIdx];
      const currentStep = currentMod?.steps[activeStepIdx];
      const promptToSend = currentStep?.prompt || currentStep?.topic || "Speaking Challenge";
      const sampleToSend = currentStep?.sample_answer || null;

      const res = await fetch(`${getApiBase()}/english-coach/speak-critique`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: uId,
          prompt: promptToSend,
          sample_answer: sampleToSend,
          user_speech: textToEvaluate,
          user_level: track?.fluency_level || "Intermediate"
        })
      });

      if (res.ok) {
        const data = await res.json();
        setSpeakCritique(data);

        const isDoingGreat = (data.positive_points?.length || 0) >= (data.negative_points?.length || 0);
        const status = isDoingGreat ? "great" : "enhance";
        const whatWentWell = (data.positive_points || []).join(". ") || "Clear intent and spontaneous expression.";
        const whatToEnhance = `${(data.negative_points || []).join(". ")} — ${data.how_to_improve || "Refine syntax and vocabulary."}`;

        setCoachStepFeedback({
          status,
          title: isDoingGreat ? "AI Spoken Critique: You're Doing Great!" : "AI Spoken Critique: Key Areas to Enhance",
          whatWentWell,
          whatToEnhance,
          spokenAudio: data.spoken_feedback
        });

        if (data.spoken_feedback) {
          speakText(data.spoken_feedback);
        }
      } else {
        alert("Could not evaluate speech. Please try again.");
      }
    } catch (err) {
      console.warn("Speak critique error:", err);
    } finally {
      setSpeakCritiqueLoading(false);
    }
  };

  // 7. Public Speaking Stage (LRSP 60s Timer & Spoken Evaluation)
  const handleStartPublicSpeaking = () => {
    setSpeakingTimer(60);
    setIsTimerActive(true);
    setUserSpokenText("");
    setSpeakingCritique(null);

    startRecordingSpeech({ continuous: true });

    clearInterval(timerIntervalRef.current);
    timerIntervalRef.current = setInterval(() => {
      setSpeakingTimer(prev => {
        if (prev <= 1) {
          clearInterval(timerIntervalRef.current);
          setIsTimerActive(false);
          stopRecordingSpeech();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleFinishPublicSpeaking = async () => {
    clearInterval(timerIntervalRef.current);
    setIsTimerActive(false);
    stopRecordingSpeech();

    if (!userSpokenText.trim()) {
      alert("No speech was captured. Please speak into your microphone and try again.");
      return;
    }

    setCritiqueLoading(true);
    try {
      const uId = user?.id || user?.email || "guest_user";
      const currentMod = modules[activeModuleIdx];
      const step = currentMod?.steps[activeStepIdx];
      const topic = step?.topic || "Public Speaking Stage";

      const res = await fetch(`${getApiBase()}/english-coach/public-speaking-critique`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: uId,
          speech_text: userSpokenText,
          topic: topic,
          user_level: track?.fluency_level || "Intermediate"
        })
      });

      if (res.ok) {
        const critique = await res.json();
        setSpeakingCritique(critique);

        const isGreat = (critique.overall_score || 70) >= 70;
        const spokenFeedback = critique.spoken_feedback || (
          isGreat
            ? `You are doing great! Your overall score is ${critique.overall_score || 75} out of 100. What you did well: you maintained continuous speech with strong confidence. To enhance your delivery: ${critique.what_was_wrong || critique.live_correction || "reduce filler words and pause strategically between key ideas"}.`
            : `Good effort! Your score is ${critique.overall_score || 55} out of 100. Here is what you should enhance: ${critique.what_was_wrong || critique.live_correction}. Practice this polished version to boost your poise.`
        );

        setCoachStepFeedback({
          status: isGreat ? "great" : "enhance",
          title: `Public Speaking Adjudication (${critique.overall_score || 70}/100)`,
          whatWentWell: critique.praise || "Spoke continuously under timed pressure with clear voice volume.",
          whatToEnhance: critique.what_was_wrong || critique.live_correction || "Eliminate filler hesitations and refine pacing.",
          spokenAudio: spokenFeedback
        });

        speakText(spokenFeedback);
      }
    } catch (err) {
      console.warn("Error getting critique:", err);
    } finally {
      setCritiqueLoading(false);
    }
  };

  // 8. Interactive Spoken Dialogue (Dedicated Sub-Second LRSI Endpoint + Hands-Free Loop)
  const handleSendDialogueTurn = async (overrideText?: string) => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
    }

    const userText = (overrideText !== undefined ? overrideText : userSpokenText).trim();
    if (!userText || isCoachThinkingRef.current) return;

    setUserSpokenText("");
    setDialogueMessages(prev => [...prev, { sender: "user", text: userText }]);
    setIsCoachThinking(true);
    isCoachThinkingRef.current = true;

    try {
      const currentMod = modules[activeModuleIdx];
      const currentStep = currentMod?.steps[activeStepIdx];
      const starter = currentStep?.coach_starter || "";

      const res = await fetch(`${getApiBase()}/english-coach/dialogue-turn`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_message: userText,
          history: dialogueMessages,
          coach_starter: starter,
          user_level: track?.fluency_level || "Intermediate",
          target_focus: currentMod?.focus_areas?.[0] || "Spoken English Fluency"
        })
      });

      if (res.ok) {
        const data = await res.json();
        const replyText = data.reply;
        setDialogueMessages(prev => [...prev, { 
          sender: "coach", 
          text: replyText,
          correction: data.correction
        }]);

        const spokenFull = data.correction 
          ? `${replyText}. You are doing great! Here is a tip to enhance your English: ${data.correction}`
          : `${replyText}. You are doing great! Keep replying naturally.`;

        setCoachStepFeedback({
          status: data.correction ? "good" : "great",
          title: "Live Dialogue Spoken Coaching",
          whatWentWell: "Engaged actively in back-and-forth conversation with prompt response time.",
          whatToEnhance: data.correction || "Continue speaking in complete descriptive sentences.",
          spokenAudio: spokenFull
        });

        // Speak coach response aloud; upon completion, auto-resume listening if hands-free is active!
        speakText(spokenFull, () => {
          if (isHandsFreeRef.current && (activeStepTypeRef.current === "conversational_sparring" || activeStepTypeRef.current === "interact")) {
            setTimeout(() => {
              startRecordingSpeech({ continuous: true });
            }, 300);
          }
        });
      }
    } catch (err) {
      console.warn("Dialogue turn error:", err);
    } finally {
      setIsCoachThinking(false);
      isCoachThinkingRef.current = false;
    }
  };

  // Mini-Games Engine (Word Sprint, Sentence Fixer, Tongue Twister)
  const handleStartWordSprint = () => {
    setGameTimer(30);
    setIsGameActive(true);
    setCollectedKeywords([]);
    setGameCompleted(false);
    setUserSpokenText("");

    const currentMod = modules[activeModuleIdx];
    const currentStep = currentMod?.steps[activeStepIdx];
    const keywords = (currentStep?.target_keywords || []).map(k => k.toLowerCase());

    startRecordingSpeech({
      continuous: true,
      onResult: (text: string) => {
        const lower = text.toLowerCase();
        const found = keywords.filter(k => lower.includes(k));
        setCollectedKeywords(found);
        if (found.length >= 2) {
          setGameCompleted(true);
          const spokenReply = "You are doing great! You hit the target vocabulary keywords with swift recall. To enhance further, use each of these words in a complete compound sentence!";
          setCoachStepFeedback({
            status: "great",
            title: "Word Sprint High Score!",
            whatWentWell: "Rapid vocabulary retrieval and confident articulation under time pressure.",
            whatToEnhance: "Form full complex sentences with these newly retrieved adjectives.",
            spokenAudio: spokenReply
          });
          speakText(spokenReply);
        }
      }
    });

    clearInterval(gameIntervalRef.current);
    gameIntervalRef.current = setInterval(() => {
      setGameTimer(prev => {
        if (prev <= 1) {
          clearInterval(gameIntervalRef.current);
          setIsGameActive(false);
          stopRecordingSpeech();
          setGameCompleted(true);
          const spokenReply = "You did great on this speed drill! Your word recall and vocal agility were fast and crisp. To enhance your fluency further, keep your vowels open and maintain a relaxed jaw.";
          setCoachStepFeedback({
            status: "great",
            title: "Sprint Drill Completed",
            whatWentWell: "Vocal agility and stamina under timed challenge.",
            whatToEnhance: "Maintain relaxed jaw and open vowel shapes at high velocity.",
            spokenAudio: spokenReply
          });
          speakText(spokenReply);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Sentence Doctor Manual Tactile Controls
  const handleToggleDoctorMic = () => {
    if (isListening) {
      stopRecordingSpeech();
      return;
    }
    setUserSpokenText("");
    setSentenceFixResult(null);
    startRecordingSpeech({ continuous: true });
  };

  const handleEvaluateDoctor = () => {
    stopRecordingSpeech();
    const currentMod = modules[activeModuleIdx];
    const currentStep = currentMod?.steps[activeStepIdx];
    const targetCorrect = currentStep?.corrected_sentence || "";
    const textToEval = userSpokenText.trim();

    if (!textToEval) {
      alert("Please speak your corrected sentence into the microphone first.");
      return;
    }

    setIsDoctorEvaluating(true);
    try {
      const { score } = calculateWordMatch(targetCorrect, textToEval);
      if (score >= 40) {
        setSentenceFixResult({
          success: true,
          message: `Spot on! "${targetCorrect}" is grammatically pristine! 🌟`
        });
        setGameCompleted(true);

        const spokenReply = "You are doing great! Spot on! That was grammatically accurate and well articulated. Keep this exact natural structure in your spontaneous speech.";
        setCoachStepFeedback({
          status: "great",
          title: "Grammar Doctor: Pristine Execution!",
          whatWentWell: "Identified the Indian English slip and delivered the corrected sentence cleanly.",
          whatToEnhance: "Integrate this accurate structure into your spontaneous daily speech.",
          spokenAudio: spokenReply
        });
        speakText(spokenReply);
      } else {
        const spokenReply = `Good attempt! Here is what you should enhance: the target structure is "${targetCorrect}". Notice the verb tense and word order.`;
        setSentenceFixResult({
          success: false,
          message: `Notice the target structure: "${targetCorrect}". Give it another attempt!`
        });
        setCoachStepFeedback({
          status: "enhance",
          title: "Grammar Doctor: Needs Polish",
          whatWentWell: "Attempted spoken sentence reconstruction with vocal confidence.",
          whatToEnhance: `Target phrase: "${targetCorrect}". Watch the verb agreement.`,
          spokenAudio: spokenReply
        });
        speakText(spokenReply);
      }
    } finally {
      setIsDoctorEvaluating(false);
    }
  };

  // Anti-skip prerequisite check: Speech-gated progression (Zero skipping, zero passive listening)
  const canAdvanceStep = () => {
    const currentMod = modules[activeModuleIdx];
    const currentStep = currentMod?.steps[activeStepIdx];
    if (!currentStep) return false;

    if (currentStep.type === "coach_masterclass" || currentStep.type === "listen") {
      return (warmupAccuracyScore !== null && warmupAccuracyScore >= 35) || userSpokenText.trim().split(/\s+/).length >= 3;
    } else if (currentStep.type === "vocal_mimicry" || currentStep.type === "repeat" || currentStep.type === "star_method") {
      return (repeatMatchScore !== null && repeatMatchScore >= 35) || (warmupAccuracyScore !== null && warmupAccuracyScore >= 35) || userSpokenText.trim().split(/\s+/).length >= 3;
    } else if (currentStep.type === "sentence_doctor" || currentStep.type === "error_fix") {
      return Boolean(sentenceFixResult?.success) || userSpokenText.trim().split(/\s+/).length >= 3;
    } else if (currentStep.type === "daily_chitchat" || currentStep.type === "polite_request" || currentStep.type === "speak") {
      return speakCritique !== null || userSpokenText.trim().split(/\s+/).length >= 3;
    } else if (currentStep.type === "live_lounge" || currentStep.type === "conversational_sparring" || currentStep.type === "interact") {
      const userTurns = dialogueMessages.filter(m => m.sender === "user").length;
      return userTurns >= 1;
    } else if (currentStep.type === "spoken_capstone" || currentStep.type === "present" || currentStep.type === "capstone" || currentStep.type === "mastery_graduation") {
      return speakingCritique !== null || userSpokenText.trim().split(/\s+/).length >= 5;
    } else if (currentStep.type === "hook_delivery") {
      return (repeatMatchScore !== null && repeatMatchScore >= 35) || userSpokenText.trim().split(/\s+/).length >= 3;
    } else if (currentStep.type === "game") {
      return gameCompleted;
    }
    return userSpokenText.trim().length > 0;
  };

  // 7. Final Capstone & Report Generation
  const handleFinalizeCapstone = async () => {
    if (!userSpokenText.trim()) {
      alert("Please deliver your capstone presentation before generating the final report.");
      return;
    }

    setLoading(true);
    try {
      const uId = user?.id || user?.email || "guest_user";
      const uRole = user?.role || "student";
      const uName = user?.name || "Devgya Learner";

      const res = await fetch(`${getApiBase()}/english-coach/finalize-report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: uId,
          user_role: uRole,
          student_name: uName,
          capstone_transcript: userSpokenText
        })
      });

      if (res.ok) {
        const report = await res.json();
        setTrack(prev => prev ? { ...prev, mastery_report: report } : null);
        setActiveTab("report");
      }
    } catch (err) {
      console.error("Error finalizing report:", err);
    } finally {
      setLoading(false);
    }
  };

  // 8. Reset Cycle (Retake diagnostic & restart 30-day program)
  const handleResetCycle = async () => {
    if (!confirm("Are you sure you want to reset your English speaking track and retake the 10-mark diagnostic test?")) return;
    try {
      const uId = user?.id || user?.email || "guest_user";
      const uRole = user?.role || "student";
      const res = await fetch(`${getApiBase()}/english-coach/reset-cycle`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: uId, user_role: uRole })
      });
      if (res.ok) {
        setSelectedAnswers({});
        setDiagnosticResult(null);
        setActiveTab("diagnostic");
        fetchDiagnosticQuestions();
        loadState();
      }
    } catch (err) {
      console.warn("Reset error:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-bold text-slate-600">Connecting to Devgya Spoken English Mastery Engine...</p>
      </div>
    );
  }

  // ===================================================================
  // VIEW 1: 10-MARK DIAGNOSTIC ASSESSMENT
  // ===================================================================
  if (activeTab === "diagnostic") {
    const q = diagnosticQuestions[currentQIndex];
    const isAnswered = selectedAnswers[String(q?.id)] !== undefined;
    const progressPercent = diagnosticQuestions.length > 0 
      ? ((Object.keys(selectedAnswers).length) / diagnosticQuestions.length) * 100 
      : 0;

    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300 py-6 px-4">
        {/* HEADER */}
        <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-indigo-800/40 relative overflow-hidden">
          <div className="relative z-10 space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-500/30">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Diagnostic English Proficiency Benchmark</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              10-Mark Baseline Spoken English Assessment
            </h1>
            <p className="text-xs sm:text-sm text-indigo-200 max-w-2xl leading-relaxed">
              Complete these 10 curated questions. We pinpoint your specific weak points in grammar, tenses, prepositions, pronunciation awareness, and public speaking structure to build your step-by-step lecture roadmap.
            </p>
          </div>
        </div>

        {/* RESULT MODAL / SCREEN */}
        {diagnosticResult ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xl space-y-6 text-center animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
              <Award className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h2 className="text-2xl font-black text-slate-900">Assessment Completed!</h2>
              <p className="text-sm font-semibold text-slate-500">Your Baseline Proficiency Result</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-xl mx-auto text-left">
              <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100">
                <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Score</span>
                <p className="text-2xl font-black text-indigo-900 mt-1">{diagnosticResult.score} / 10</p>
              </div>
              <div className="p-4 rounded-2xl bg-purple-50 border border-purple-100 sm:col-span-2">
                <span className="text-xs font-bold text-purple-600 uppercase tracking-wider">Assigned Level</span>
                <p className="text-sm font-extrabold text-purple-900 mt-1">{diagnosticResult.fluency_level}</p>
              </div>
            </div>

            {diagnosticResult.weak_points && diagnosticResult.weak_points.length > 0 && (
              <div className="max-w-xl mx-auto text-left p-4 rounded-2xl bg-amber-50 border border-amber-200">
                <span className="text-xs font-extrabold text-amber-800 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  Identified Weak Points To Focus On:
                </span>
                <div className="flex flex-wrap gap-2">
                  {diagnosticResult.weak_points.map((w: string, i: number) => (
                    <span key={i} className="px-2.5 py-1 rounded-lg bg-white text-amber-900 text-xs font-bold border border-amber-200 shadow-sm">
                      {w}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={() => {
                setActiveTab("roadmap");
                setDiagnosticResult(null);
              }}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm shadow-lg hover:shadow-indigo-500/25 transition-all active:scale-95"
            >
              <span>Begin Your Sequential Lecture Roadmap</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : q ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
            {/* PROGRESS BAR */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-extrabold text-slate-500">
                <span>Question {currentQIndex + 1} of {diagnosticQuestions.length}</span>
                <span>{Object.keys(selectedAnswers).length} / {diagnosticQuestions.length} Answered</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* QUESTION CARD */}
            <div className="space-y-3 pt-2">
              <div className="inline-block px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-100">
                {q.category}
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
                {q.question}
              </h3>
            </div>

            {/* OPTIONS */}
            <div className="space-y-2.5">
              {q.options.map((opt, idx) => {
                const isSelected = selectedAnswers[String(q.id)] === idx;
                return (
                  <button
                    key={idx}
                    onClick={() => handleSelectOption(q.id, idx)}
                    className={`w-full text-left p-4 rounded-2xl border text-sm font-semibold transition-all flex items-center justify-between group ${
                      isSelected
                        ? "bg-indigo-50 border-indigo-600 text-indigo-900 shadow-sm ring-1 ring-indigo-600"
                        : "bg-white border-slate-200 text-slate-700 hover:border-indigo-300 hover:bg-slate-50/80"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-extrabold border transition-all ${
                        isSelected 
                          ? "bg-indigo-600 text-white border-indigo-600" 
                          : "bg-slate-100 text-slate-600 border-slate-200 group-hover:border-indigo-300"
                      }`}>
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span>{opt}</span>
                    </div>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-indigo-600" />}
                  </button>
                );
              })}
            </div>

            {/* NAVIGATION FOOTER */}
            <div className="pt-4 flex items-center justify-between border-t border-slate-100">
              <button
                disabled={currentQIndex === 0}
                onClick={() => setCurrentQIndex(prev => Math.max(0, prev - 1))}
                className="px-4 py-2 rounded-xl text-xs font-extrabold text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none transition-all"
              >
                Previous
              </button>

              {currentQIndex < diagnosticQuestions.length - 1 ? (
                <button
                  onClick={() => setCurrentQIndex(prev => prev + 1)}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold shadow-sm transition-all active:scale-95"
                >
                  Next Question
                </button>
              ) : (
                <button
                  disabled={submittingTest || Object.keys(selectedAnswers).length < diagnosticQuestions.length}
                  onClick={handleSubmitDiagnostic}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold shadow-md transition-all active:scale-95 disabled:opacity-40"
                >
                  {submittingTest ? "Evaluating Weak Points..." : "Submit Diagnostic Test"}
                </button>
              )}
            </div>
          </div>
        ) : null}
      </div>
    );
  }

  // ===================================================================
  // VIEW 2: SEQUENTIAL LECTURE ROADMAP (NO SKIPPING)
  // ===================================================================
  if (activeTab === "roadmap") {
    const unlockedIndex = track?.unlocked_module_index || 0;

    return (
      <div className="max-w-5xl mx-auto space-y-6 py-6 px-4 animate-in fade-in duration-300">
        {/* TOP STATUS BANNER */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-indigo-800/40 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Diagnostic Completed: {track?.diagnostic_score} / 10
              </span>
              <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-500/30">
                {track?.fluency_level}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Sequential Spoken Mastery Track
            </h1>
            <p className="text-xs sm:text-sm text-indigo-200 max-w-2xl leading-relaxed">
              Master English through the certified <strong>LRSI</strong> (Listen, Repeat, Speak, Interact) and <strong>LRSP</strong> (Listen, Repeat, Speak, Present) frameworks. Step skipping is disabled to ensure genuine spoken fluency.
            </p>
          </div>

          <div className="flex flex-col items-end gap-2 shrink-0">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-300 bg-amber-500/10 px-3 py-1.5 rounded-xl border border-amber-500/20">
              <Clock className="w-3.5 h-3.5" />
              <span>30-Day Cycle Active</span>
            </div>
            <button
              onClick={handleRegenerateCurriculum}
              disabled={isRegeneratingCurriculum}
              className="text-xs font-semibold text-indigo-300 hover:text-white flex items-center gap-1.5 transition-colors bg-indigo-900/60 hover:bg-indigo-900 px-3 py-1.5 rounded-xl border border-indigo-700/50 disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>{isRegeneratingCurriculum ? "Synthesizing AI Plan..." : "Regenerate AI Plan"}</span>
            </button>
            <button
              onClick={handleResetCycle}
              className="text-xs font-semibold text-slate-400 hover:text-rose-300 flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Restart Cycle & Retake Test</span>
            </button>
          </div>
        </div>

        {/* WEAK POINTS SUMMARY */}
        {track?.weak_points && track.weak_points.length > 0 && (
          <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
              <Target className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Your Diagnostic Focus Areas:</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {track.weak_points.map((w, idx) => (
                <span key={idx} className="px-2.5 py-0.5 rounded-md bg-white text-amber-800 text-xs font-bold border border-amber-200 shadow-xs">
                  {w}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* MODULE CARDS */}
        <div className="space-y-4">
          {modules.map((mod, mIdx) => {
            const isUnlocked = mIdx <= unlockedIndex;
            const isCompleted = mIdx < unlockedIndex;
            const isCurrent = mIdx === unlockedIndex;

            return (
              <div 
                key={mod.id}
                className={`p-6 rounded-3xl border transition-all ${
                  isCurrent
                    ? "bg-white border-indigo-400 shadow-md ring-1 ring-indigo-400"
                    : isCompleted
                    ? "bg-emerald-50/40 border-emerald-200"
                    : "bg-slate-50/60 border-slate-200 opacity-60 pointer-events-none"
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-lg text-xs font-extrabold uppercase tracking-wider ${
                        isCompleted
                          ? "bg-emerald-100 text-emerald-800"
                          : isCurrent
                          ? "bg-indigo-100 text-indigo-800"
                          : "bg-slate-200 text-slate-600"
                      }`}>
                        {mod.methodology}
                      </span>
                      {isCompleted && (
                        <span className="flex items-center gap-1 text-xs font-bold text-emerald-600">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Completed</span>
                        </span>
                      )}
                    </div>
                    <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
                      {mod.title}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed max-w-2xl font-medium">
                      {mod.description}
                    </p>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {mod.focus_areas.map((f, i) => (
                        <span key={i} className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                          • {f}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-3">
                    {isUnlocked ? (
                      <button
                        onClick={() => {
                          setActiveModuleIdx(mIdx);
                          setActiveStepIdx(0);
                          setActiveTab("player");
                        }}
                        className={`inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-extrabold text-xs transition-all active:scale-95 ${
                          isCurrent
                            ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md hover:shadow-indigo-500/20"
                            : "bg-white border border-slate-300 text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>{isCompleted ? "Practice Again" : "Launch Lecture"}</span>
                      </button>
                    ) : (
                      <div className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 text-slate-400 text-xs font-bold border border-slate-200">
                        <Lock className="w-3.5 h-3.5" />
                        <span>Locked</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ===================================================================
  // VIEW 3: LECTURE PLAYER (LRSI / LRSP STEPS & INTERACTIVE GAMES)
  // ===================================================================
  if (activeTab === "player") {
    const currentMod = modules[activeModuleIdx];
    const currentStep = currentMod?.steps[activeStepIdx];
    const isLastStep = currentMod && activeStepIdx === currentMod.steps.length - 1;

    const currentPrompt = currentStep?.prompt || "";
    const currentModelAudio = currentStep?.model_audio_text || currentStep?.masterclass_lecture?.model_audio_text;
    const currentTargetPhrase = currentStep?.target_phrase;
    const currentSampleAnswer = currentStep?.sample_answer;
    const currentCoachStarter = currentStep?.coach_starter;
    const currentFlawedSentence = currentStep?.flawed_sentence;
    const currentCorrectedSentence = currentStep?.corrected_sentence;
    const currentExplanation = currentStep?.explanation;

    return (
      <div className="max-w-4xl mx-auto space-y-6 py-6 px-4 animate-in fade-in duration-300">
        {/* NAVIGATION TOP BAR & STUDIO VOICE SELECTOR */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
          <button
            onClick={() => setActiveTab("roadmap")}
            className="text-xs font-extrabold text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5 transition-colors shrink-0"
          >
            <ArrowRight className="w-4 h-4 rotate-180" />
            <span>Back to Module Roadmap</span>
          </button>

          {/* STUDIO NEURAL VOICE CONTROLS */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 shadow-xs">
              <Volume2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
              <span className="text-[11px] text-slate-400 font-semibold">Coach Voice:</span>
              <select
                value={coachVoice}
                onChange={(e) => setCoachVoice(e.target.value)}
                className="bg-transparent font-extrabold text-xs text-indigo-600 focus:outline-none cursor-pointer"
              >
                <option value="en-IN-NeerjaNeural">Neerja (Indian English 👩)</option>
                <option value="en-IN-PrabhatNeural">Prabhat (Indian English 👨)</option>
                <option value="en-US-JennyNeural">Jenny (US English 👩)</option>
                <option value="en-US-GuyNeural">Guy (US English 👨)</option>
                <option value="en-GB-SoniaNeural">Sonia (British English 👩)</option>
              </select>
            </div>

            <div className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 shadow-xs">
              <span className="text-[11px] text-slate-400 font-semibold">Speed:</span>
              <select
                value={coachSpeed}
                onChange={(e) => setCoachSpeed(e.target.value)}
                className="bg-transparent font-extrabold text-xs text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="-10%">0.9x Slow</option>
                <option value="+0%">1.0x Normal</option>
                <option value="+10%">1.1x Fast</option>
              </select>
            </div>

            <span className="text-xs font-bold text-slate-500 hidden lg:inline-block">
              Stage {activeStepIdx + 1} of {currentMod?.steps.length || 5}
            </span>
          </div>
        </div>

        {stepCompleteNotice && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{stepCompleteNotice}</span>
          </div>
        )}

        {/* DYNAMIC PROGRESS TABS (TAILORED TO EACH MODULE ARCHETYPE) */}
        {currentMod && (
          <div className="bg-slate-900/90 p-3 rounded-2xl border border-slate-800 backdrop-blur-md shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between px-2 pb-2.5 border-b border-slate-800/80 mb-2.5 gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                {currentMod.title}
              </span>
              <span className="text-[10px] font-extrabold text-indigo-300 bg-indigo-950/80 px-2.5 py-0.5 rounded-full border border-indigo-500/30 w-fit">
                {currentMod.methodology}
              </span>
            </div>

            <div className={`grid gap-2 ${
              currentMod.steps.length === 2 
                ? "grid-cols-2" 
                : currentMod.steps.length === 3 
                ? "grid-cols-1 sm:grid-cols-3" 
                : "grid-cols-2 sm:grid-cols-4"
            }`}>
              {currentMod.steps.map((st, idx) => {
                const isCurrent = activeStepIdx === idx;
                const isDone = track?.completed_steps?.includes(st.step_id) || activeStepIdx > idx;

                const getShortStageTitle = (step: StepItem, index: number) => {
                  if (step.type === "coach_masterclass") return `${index + 1}. Cadence Warmup`;
                  if (step.type === "vocal_mimicry") return `${index + 1}. Mimicry Echo`;
                  if (step.type === "daily_chitchat") return `${index + 1}. Daily Chitchat`;
                  if (step.type === "sentence_doctor") return `${index + 1}. Flaw Detective`;
                  if (step.type === "polite_request") return `${index + 1}. Polite Request`;
                  if (step.type === "star_method") return `${index + 1}. STAR Method`;
                  if (step.type === "spoken_capstone") return `${index + 1}. Keynote Scorecard`;
                  if (step.type === "live_lounge") return `${index + 1}. Live AI Lounge`;
                  if (step.type === "mastery_graduation") return `${index + 1}. Official Graduation`;
                  return `${index + 1}. ${step.title.split(":")[1]?.trim() || step.title}`;
                };

                return (
                  <button
                    key={st.step_id || idx}
                    onClick={() => {
                      if (isDone || idx <= activeStepIdx) {
                        setActiveStepIdx(idx);
                      }
                    }}
                    className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between text-left shrink-0 ${
                      isCurrent
                        ? "bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg shadow-indigo-600/30 ring-1 ring-indigo-400 font-black"
                        : isDone
                        ? "bg-emerald-950/40 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-950/70"
                        : "bg-slate-950/40 text-slate-500 border border-slate-800/60 cursor-not-allowed opacity-70"
                    }`}
                  >
                    <span className="truncate">{getShortStageTitle(st, idx)}</span>
                    {isDone ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 ml-1.5" />
                    ) : isCurrent ? (
                      <span className="w-2 h-2 rounded-full bg-white animate-pulse shrink-0 ml-1.5" />
                    ) : (
                      <Lock className="w-3 h-3 text-slate-600 shrink-0 ml-1.5" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP CARD */}
        {currentStep && (
          <div className="space-y-6">
            {/* DEVGYA AI SPOKEN COACH STEP FEEDBACK CARD */}
            {coachStepFeedback && (
              <div className={`p-4 sm:p-5 rounded-3xl border transition-all animate-in fade-in slide-in-from-top-2 shadow-xl ${
                coachStepFeedback.status === "great"
                  ? "bg-gradient-to-r from-emerald-950/90 via-slate-950 to-slate-900 border-emerald-500/40 text-emerald-100"
                  : coachStepFeedback.status === "good"
                  ? "bg-gradient-to-r from-indigo-950/90 via-slate-950 to-slate-900 border-indigo-500/40 text-indigo-100"
                  : "bg-gradient-to-r from-amber-950/90 via-slate-950 to-slate-900 border-amber-500/40 text-amber-100"
              }`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className={`p-2 rounded-xl text-white shadow-xs ${
                      coachStepFeedback.status === "great"
                        ? "bg-emerald-600 shadow-emerald-500/30"
                        : coachStepFeedback.status === "good"
                        ? "bg-indigo-600 shadow-indigo-500/30"
                        : "bg-amber-600 shadow-amber-500/30"
                    }`}>
                      <Sparkles className="w-4 h-4" />
                    </span>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                        DEVGYA AI Spoken Coach • Real-Time Speech Verdict
                      </span>
                      <h4 className="text-sm sm:text-base font-black text-white">
                        {coachStepFeedback.title}
                      </h4>
                    </div>
                  </div>

                  <button
                    onClick={() => coachStepFeedback.spokenAudio && speakText(coachStepFeedback.spokenAudio)}
                    disabled={isAiSpeaking}
                    className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white font-extrabold text-xs shadow-xs flex items-center gap-1.5 shrink-0 transition-all active:scale-95 disabled:opacity-50"
                  >
                    <Volume2 className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{isAiSpeaking ? "Coach Speaking..." : "Hear AI Coach Voice"}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 text-xs">
                  <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-emerald-500/20 space-y-1">
                    <span className="font-black text-emerald-400 uppercase tracking-wide flex items-center gap-1 text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      What Went Well (Spoken Fluency):
                    </span>
                    <p className="font-semibold text-slate-200 leading-relaxed">
                      {coachStepFeedback.whatWentWell}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-amber-500/20 space-y-1">
                    <span className="font-black text-amber-400 uppercase tracking-wide flex items-center gap-1 text-[11px]">
                      <Flame className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      What To Polish & Enhance:
                    </span>
                    <p className="font-semibold text-slate-200 leading-relaxed">
                      {coachStepFeedback.whatToEnhance}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* STAGE: MASTERCLASS & MANDATORY VOCAL WARMUP (MODULE 1 & 2 & 3 STAGE 1) */}
            {(currentStep.type === "coach_masterclass" || currentStep.type === "listen") && (
              <div className="bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 border border-indigo-500/30 text-white rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

                {/* MASTERCLASS HEADER */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-5">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-black uppercase tracking-widest border border-indigo-500/30 flex items-center gap-1.5">
                        <Sparkles className="w-3 h-3 text-indigo-400" />
                        Executive Masterclass & Warmup
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[10px] font-extrabold border border-slate-700">
                        {currentStep.masterclass_lecture?.duration || "10-Min Focus"}
                      </span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1">
                      {currentStep.masterclass_lecture?.topic || currentStep.title}
                    </h3>
                  </div>

                  {/* MASTERCLASS MODEL AUDIO PLAYER */}
                  <div className="flex items-center gap-3 shrink-0">
                    <AudioWaveVisualizer isActive={isAiSpeaking} color="indigo" />
                    <button
                      onClick={() => {
                        const textToPlay = currentStep.masterclass_lecture?.model_audio_text || currentModelAudio || currentStep.vocal_warmup_phrase;
                        if (textToPlay) speakText(textToPlay);
                      }}
                      disabled={isAiSpeaking}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-extrabold text-xs shadow-lg shadow-indigo-600/30 transition-all active:scale-95 disabled:opacity-50"
                    >
                      {isAiSpeaking ? (
                        <>
                          <Pause className="w-3.5 h-3.5 fill-current" />
                          <span>Coach Speaking...</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>Hear Masterclass Cadence</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* 2-CARD MASTERCLASS SYNOPSIS (CLEAN, NO CLUTTER) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
                    <span className="text-[11px] font-black text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Flame className="w-3.5 h-3.5 text-indigo-400" />
                      Vocal Mechanics & Cadence
                    </span>
                    <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line font-medium">
                      {currentStep.masterclass_lecture?.vocal_mechanics || "1. Diaphragmatic Breath: Inhale from the abdomen before your opening clause.\n2. Terminal Downward Inflection: Ground statements authoritatively.\n3. Syllable Bridges: Link vowels smoothly without abrupt stops."}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
                    <span className="text-[11px] font-black text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Target className="w-3.5 h-3.5 text-emerald-400" />
                      Executive Spoken Formula
                    </span>
                    <div className="space-y-1.5">
                      {(currentStep.masterclass_lecture?.key_formulas || [
                        "The Warmth Opener: [Warm Greeting] + [Sincere Emotion] + [Purpose]",
                        "The Momentum Transition: [Context Bridge] + [Conjunctive Pause] + [Action Step]"
                      ]).map((f, idx) => (
                        <div key={idx} className="text-xs font-semibold text-emerald-200/90 bg-emerald-950/40 px-2.5 py-1.5 rounded-lg border border-emerald-500/20">
                          • {f}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* MANDATORY VOCAL WARMUP STUDIO (MANUAL TACTILE MIC CONTROLS) */}
                <div className="pt-4 border-t border-slate-800 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="text-[11px] font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                        <Mic className="w-3.5 h-3.5 text-emerald-400" />
                        Mandatory Spoken Vocal Warmup (Speech-Gated)
                      </span>
                      <p className="text-xs text-slate-400 font-medium">
                        Speak the phrase aloud, stop the mic when done, then click AI Review to evaluate your speech.
                      </p>
                    </div>

                    {warmupAccuracyScore !== null && (
                      <span className={`px-3 py-1 rounded-full text-xs font-black border flex items-center gap-1.5 shrink-0 ${
                        warmupAccuracyScore >= 70
                          ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                          : "bg-amber-500/20 text-amber-300 border-amber-500/30"
                      }`}>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Warmup Score: {warmupAccuracyScore}%
                      </span>
                    )}
                  </div>

                  {/* TARGET WARMUP PHRASE OR LIVE WORD ALIGNMENT */}
                  <WordAlignmentDisplay
                    wordMatches={warmupWordMatches}
                    rawTarget={
                      currentStep.vocal_warmup_phrase ||
                      currentStep.target_phrase ||
                      currentModelAudio ||
                      "Good morning everyone! It is a genuine pleasure to connect with all of you today."
                    }
                  />

                  {/* PERFORMANCE HUD (ACCURACY RING, WPM, FILLERS) */}
                  {warmupAccuracyScore !== null && (
                    <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
                      <div className="flex items-center gap-4">
                        <AccuracyRingGauge score={warmupAccuracyScore} />
                        <PacingWpmGauge wpm={warmupPacing?.wpm || 128} />
                      </div>
                      <FillerWordBadge count={warmupFillers.length} fillers={warmupFillers} />
                    </div>
                  )}

                  {/* 3-STEP MANUAL TACTILE CONTROLS */}
                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    {!isListening ? (
                      <button
                        onClick={handleToggleWarmupMic}
                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/25 flex items-center gap-2 active:scale-95 transition-all"
                      >
                        <Mic className="w-4 h-4" />
                        <span>{userSpokenText ? "Record Warmup Again" : "Click to Start Speaking"}</span>
                      </button>
                    ) : (
                      <button
                        onClick={handleToggleWarmupMic}
                        className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs shadow-lg shadow-rose-600/30 flex items-center gap-2 animate-pulse active:scale-95 transition-all"
                      >
                        <MicOff className="w-4 h-4" />
                        <span>Done Speaking (Stop Mic)</span>
                      </button>
                    )}

                    {isListening && <AudioWaveVisualizer isActive={true} color="rose" />}

                    {userSpokenText && !isListening && (
                      <button
                        onClick={handleEvaluateWarmup}
                        disabled={isWarmupEvaluating}
                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black text-xs shadow-lg shadow-indigo-600/30 flex items-center gap-2 active:scale-95 transition-all disabled:opacity-50"
                      >
                        <Sparkles className="w-4 h-4 text-amber-300" />
                        <span>{isWarmupEvaluating ? "Analyzing Warmup..." : "⚡ AI Review & Coaching"}</span>
                      </button>
                    )}

                    {isWarmupEvaluating && (
                      <span className="text-xs text-indigo-300 font-bold flex items-center gap-2">
                        <div className="w-3.5 h-3.5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                        AI evaluating cadence and diction...
                      </span>
                    )}
                  </div>

                  {userSpokenText && (
                    <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-xs text-slate-300 font-mono">
                      <span className="text-slate-500 font-sans block text-[10px] uppercase font-bold">Your Spoken Input:</span>
                      "{userSpokenText}"
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* STAGE: VOCAL MIMICRY ECHO & STAR METHOD DELIVERY */}
            {(currentStep.type === "vocal_mimicry" || currentStep.type === "repeat" || currentStep.type === "star_method") && (
              <div className="bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 border border-purple-500/30 text-white rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                  <div className="space-y-1">
                    <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-black uppercase tracking-widest border border-purple-500/30 flex items-center gap-1.5 w-fit">
                      <Mic className="w-3 h-3 text-purple-400" />
                      {currentStep.type === "star_method" ? "Executive STAR Method Delivery" : "Vocal Mimicry Gym"}
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black text-white mt-1">
                      {currentStep.title}
                    </h3>
                    <p className="text-xs text-slate-400 font-medium">
                      Listen to the coach's cadence, click to speak and echo the phrase, then click AI Review to get your score.
                    </p>
                  </div>

                  {repeatMatchScore !== null && (
                    <span className={`px-3 py-1 rounded-full text-xs font-black border flex items-center gap-1.5 ${
                      repeatMatchScore >= 70
                        ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                        : "bg-amber-500/20 text-amber-300 border-amber-500/30"
                    }`}>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Accuracy: {repeatMatchScore}%
                    </span>
                  )}
                </div>

                {/* TARGET PHRASE DISPLAY & WORD ALIGNMENT */}
                <WordAlignmentDisplay
                  wordMatches={speechAlignmentResult?.word_matches || repeatWordMatches.map(m => ({ word: m.word, status: m.matched ? "correct" : "missed" }))}
                  rawTarget={currentTargetPhrase || currentStep.prompt}
                />

                {/* HUD SCORES */}
                {repeatMatchScore !== null && (
                  <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
                    <div className="flex items-center gap-4">
                      <AccuracyRingGauge score={repeatMatchScore} />
                      <PacingWpmGauge wpm={speechAlignmentResult?.wpm || 128} />
                    </div>
                    <FillerWordBadge count={speechAlignmentResult?.total_fillers || 0} fillers={speechAlignmentResult?.filler_words} />
                  </div>
                )}

                {/* 3-STEP MANUAL TACTILE CONTROLS */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    onClick={() => speakText(currentTargetPhrase || currentStep.prompt)}
                    disabled={isAiSpeaking}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-2 transition-all active:scale-95 border border-slate-700"
                  >
                    <Volume2 className="w-3.5 h-3.5 text-purple-400" />
                    <span>Listen to Native Coach</span>
                  </button>

                  {!isListening ? (
                    <button
                      onClick={handleToggleRepeatMic}
                      className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs shadow-md shadow-purple-600/30 flex items-center gap-2 transition-all active:scale-95"
                    >
                      <Mic className="w-4 h-4" />
                      <span>{userSpokenText ? "Echo Again" : "Click to Start Speaking"}</span>
                    </button>
                  ) : (
                    <button
                      onClick={handleToggleRepeatMic}
                      className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs shadow-md shadow-rose-600/30 flex items-center gap-2 animate-pulse active:scale-95 transition-all"
                    >
                      <MicOff className="w-4 h-4" />
                      <span>Done Speaking (Stop Mic)</span>
                    </button>
                  )}

                  {isListening && <AudioWaveVisualizer isActive={true} color="rose" />}

                  {userSpokenText && !isListening && (
                    <button
                      onClick={handleEvaluateRepeat}
                      disabled={isRepeatEvaluating}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black text-xs shadow-md shadow-indigo-600/30 flex items-center gap-2 active:scale-95 transition-all disabled:opacity-50"
                    >
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      <span>{isRepeatEvaluating ? "Analyzing..." : "⚡ AI Review & Coaching"}</span>
                    </button>
                  )}
                </div>

                {userSpokenText && (
                  <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-xs text-slate-300 font-mono">
                    <span className="text-slate-500 font-sans block text-[10px] uppercase font-bold">Captured Audio Transcript:</span>
                    "{userSpokenText}"
                  </div>
                )}
              </div>
            )}

            {/* STAGE: FLAW DETECTIVE (SENTENCE DOCTOR / INDIANISM FIX) */}
            {(currentStep.type === "sentence_doctor" || currentStep.type === "error_fix") && (
              <div className="bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 border border-rose-500/30 text-white rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                  <div className="space-y-1">
                    <span className="px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-[10px] font-black uppercase tracking-widest border border-rose-500/30 flex items-center gap-1.5 w-fit">
                      <RotateCcw className="w-3 h-3 text-rose-400" />
                      Flaw Detective: Spot & Speak The Fix
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black text-white mt-1">
                      Indian English Clinic: Spot & Speak The Correction
                    </h3>
                  </div>

                  {sentenceFixResult && (
                    <span className={`px-3 py-1 rounded-full text-xs font-black border flex items-center gap-1.5 ${
                      sentenceFixResult.success
                        ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                        : "bg-rose-500/20 text-rose-300 border-rose-500/30"
                    }`}>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {sentenceFixResult.success ? "Correction Verified!" : "Needs Adjustment"}
                    </span>
                  )}
                </div>

                {/* FLAWED SENTENCE DISPLAY */}
                <div className="p-4 bg-rose-950/40 border border-rose-500/30 rounded-2xl space-y-1.5">
                  <span className="text-[11px] font-black uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                    Flawed Indian English Phrasing:
                  </span>
                  <p className="text-base sm:text-lg font-bold text-rose-200">
                    "{currentFlawedSentence || "I am working here since five years and I will revert back tomorrow."}"
                  </p>
                </div>

                {/* GRAMMAR RULE & EXPLANATION */}
                {currentExplanation && (
                  <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-1">
                    <span className="text-[11px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      Grammar Mechanics & Solution:
                    </span>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
                      {currentExplanation}
                    </p>
                  </div>
                )}

                {/* 3-STEP MANUAL TACTILE CONTROLS */}
                <div className="space-y-3 pt-2">
                  <span className="text-xs text-slate-300 font-bold block">
                    Speak the grammatically accurate sentence aloud into your microphone:
                  </span>
                  <div className="flex flex-wrap items-center gap-3">
                    {!isListening ? (
                      <button
                        onClick={handleToggleDoctorMic}
                        className="px-6 py-3 rounded-2xl font-black text-xs flex items-center gap-2.5 transition-all active:scale-95 shadow-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30"
                      >
                        <Mic className="w-4 h-4" />
                        <span>{userSpokenText ? "Speak Correction Again" : "Click to Speak Correction"}</span>
                      </button>
                    ) : (
                      <button
                        onClick={handleToggleDoctorMic}
                        className="px-6 py-3 rounded-2xl font-black text-xs flex items-center gap-2.5 transition-all active:scale-95 shadow-lg bg-rose-600 hover:bg-rose-500 text-white animate-pulse shadow-rose-600/30"
                      >
                        <MicOff className="w-4 h-4" />
                        <span>Done Speaking (Stop Mic)</span>
                      </button>
                    )}

                    {isListening && <AudioWaveVisualizer isActive={true} color="rose" />}

                    {userSpokenText && !isListening && (
                      <button
                        onClick={handleEvaluateDoctor}
                        disabled={isDoctorEvaluating}
                        className="px-5 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black text-xs shadow-lg shadow-indigo-600/30 flex items-center gap-2 active:scale-95 transition-all disabled:opacity-50"
                      >
                        <Sparkles className="w-4 h-4 text-amber-300" />
                        <span>{isDoctorEvaluating ? "Verifying..." : "⚡ Check Correction With AI"}</span>
                      </button>
                    )}
                  </div>
                </div>

                {sentenceFixResult && (
                  <div className={`p-4 rounded-2xl border text-xs font-bold leading-relaxed ${
                    sentenceFixResult.success
                      ? "bg-emerald-950/60 text-emerald-200 border-emerald-500/40"
                      : "bg-rose-950/60 text-rose-200 border-rose-500/40"
                  }`}>
                    {sentenceFixResult.message}
                  </div>
                )}

                {userSpokenText && (
                  <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-xs text-slate-300 font-mono">
                    <span className="text-slate-500 font-sans block text-[10px] uppercase font-bold">Captured Audio:</span>
                    "{userSpokenText}"
                  </div>
                )}
              </div>
            )}

            {/* STAGE: DAILY CHITCHAT & POLITE REQUEST & SPEAK */}
            {(currentStep.type === "daily_chitchat" || currentStep.type === "polite_request" || currentStep.type === "speak") && (
              <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white border border-indigo-500/30 space-y-6 shadow-2xl relative overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
                  <div className="space-y-1">
                    <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-black uppercase tracking-widest border border-indigo-500/30 flex items-center gap-1.5 w-fit">
                      <MessageSquare className="w-3 h-3 text-indigo-400" />
                      {currentStep.type === "daily_chitchat" ? "Daily Chitchat Spontaneous Response" : "Diplomatic Workplace Request"}
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black text-white mt-1">
                      {currentStep.title}
                    </h3>
                  </div>

                  {currentSampleAnswer && (
                    <button
                      onClick={() => speakText(currentSampleAnswer)}
                      disabled={isAiSpeaking}
                      className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1.5 transition-all border border-slate-700 shrink-0"
                    >
                      <Volume2 className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Hear Sample Answer</span>
                    </button>
                  )}
                </div>

                <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-1">
                  <span className="text-[11px] font-black uppercase tracking-wider text-indigo-400">Speaking Prompt:</span>
                  <p className="text-sm sm:text-base font-semibold text-white leading-relaxed">
                    {currentPrompt || currentStep.topic}
                  </p>
                </div>

                {/* 3-STEP MANUAL TACTILE CONTROLS */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  {!isListening ? (
                    <button
                      onClick={handleToggleSpeakMic}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/25 flex items-center gap-2 active:scale-95 transition-all"
                    >
                      <Mic className="w-4 h-4" />
                      <span>{userSpokenText ? "Record Again" : "Click to Start Speaking"}</span>
                    </button>
                  ) : (
                    <button
                      onClick={handleToggleSpeakMic}
                      className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs shadow-lg shadow-rose-600/30 flex items-center gap-2 animate-pulse active:scale-95 transition-all"
                    >
                      <MicOff className="w-4 h-4" />
                      <span>Done Speaking (Stop Mic)</span>
                    </button>
                  )}

                  {isListening && <AudioWaveVisualizer isActive={true} color="rose" />}

                  {userSpokenText && !isListening && (
                    <button
                      onClick={() => handleEvaluateSpeakStage()}
                      disabled={speakCritiqueLoading}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black text-xs shadow-lg shadow-indigo-600/30 flex items-center gap-2 active:scale-95 transition-all disabled:opacity-50"
                    >
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      <span>{speakCritiqueLoading ? "Analyzing Speech..." : "⚡ AI Review & Coaching"}</span>
                    </button>
                  )}
                </div>

                {userSpokenText && (
                  <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-xs text-slate-300 font-mono">
                    <span className="text-slate-500 font-sans block text-[10px] uppercase font-bold">Your Spoken Answer:</span>
                    "{userSpokenText}"
                  </div>
                )}

                {/* DETAILED SPEAK CRITIQUE */}
                {speakCritique && (
                  <div className="p-5 rounded-2xl bg-slate-950 border border-indigo-500/30 space-y-3 text-xs animate-in zoom-in-95">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/20 space-y-1">
                        <span className="font-black text-emerald-400 uppercase tracking-wide">Demonstrated Strengths:</span>
                        <ul className="space-y-1 text-slate-300">
                          {speakCritique.positive_points.map((p, i) => (
                            <li key={i}>• {p}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/20 space-y-1">
                        <span className="font-black text-amber-400 uppercase tracking-wide">Areas to Enhance:</span>
                        <ul className="space-y-1 text-slate-300">
                          {speakCritique.negative_points.map((n, i) => (
                            <li key={i}>• {n}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-indigo-950/60 border border-indigo-500/30 space-y-1">
                      <span className="font-black text-indigo-300 uppercase">Polished Native Version:</span>
                      <p className="text-white italic leading-relaxed">"{speakCritique.polished_version}"</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* STAGE: 60-SECOND KEYNOTE ADJUDICATION SCORECARD (MODULE 3 STAGE 3) */}
            {(currentStep.type === "spoken_capstone" || currentStep.type === "present" || currentStep.type === "capstone") && (
              <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 text-white border border-emerald-500/30 space-y-6 shadow-2xl relative overflow-hidden">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div className="space-y-1">
                    <span className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Trophy className="w-4 h-4 text-amber-400" />
                      Keynote Public Speaking Adjudication
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black text-white mt-1">
                      {currentStep.title}
                    </h3>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-mono font-bold bg-white/10 px-3.5 py-1.5 rounded-full border border-white/10">
                    <Clock className="w-3.5 h-3.5 text-amber-300" />
                    <span>{speakingTimer}s Remaining</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
                  <span className="text-[11px] font-black uppercase tracking-wider text-indigo-400">Your Assigned Keynote Topic:</span>
                  <p className="text-base sm:text-lg font-black text-white">
                    "{currentStep.topic || "Why Failure is the Best Stepping Stone to Mastery"}"
                  </p>
                </div>

                {isTimerActive && (
                  <div className="flex items-center justify-center gap-1.5 py-4 bg-slate-950/60 rounded-2xl border border-slate-800">
                    <div className="w-1.5 h-6 bg-emerald-400 rounded-full animate-bounce" />
                    <div className="w-1.5 h-10 bg-emerald-300 rounded-full animate-pulse" />
                    <div className="w-1.5 h-14 bg-emerald-400 rounded-full animate-bounce" />
                    <div className="w-1.5 h-8 bg-emerald-300 rounded-full animate-pulse" />
                    <div className="w-1.5 h-5 bg-emerald-400 rounded-full animate-bounce" />
                    <span className="text-xs font-bold text-emerald-300 ml-3">Live On Stage — Speak Continuous Speech into Mic</span>
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-3">
                  {!isTimerActive ? (
                    <button
                      onClick={handleStartPublicSpeaking}
                      className="px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs shadow-lg transition-all active:scale-95 flex items-center gap-2"
                    >
                      <Play className="w-4 h-4 fill-current" />
                      <span>Start 60s Keynote Stage</span>
                    </button>
                  ) : (
                    <button
                      onClick={handleFinishPublicSpeaking}
                      className="px-6 py-3 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-extrabold text-xs shadow-lg transition-all active:scale-95 flex items-center gap-2 animate-pulse"
                    >
                      <MicOff className="w-4 h-4" />
                      <span>Finish & Request AI Adjudication</span>
                    </button>
                  )}
                </div>

                {userSpokenText && (
                  <div className="p-4 rounded-xl bg-white/10 border border-white/10 text-xs space-y-1">
                    <span className="text-indigo-200 font-bold">Captured Speech Transcript:</span>
                    <p className="text-white font-medium leading-relaxed">"{userSpokenText}"</p>
                  </div>
                )}

                {critiqueLoading && (
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center gap-3 text-xs text-indigo-200 font-bold">
                    <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                    <span>AI adjudicator is evaluating filler words, pacing, and grammatical poise...</span>
                  </div>
                )}

                {speakingCritique && (
                  <div className="p-6 rounded-2xl bg-slate-950 text-white border border-emerald-500/30 shadow-xl space-y-4 animate-in zoom-in-95">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <span className="text-xs font-black uppercase text-emerald-400 tracking-wider">
                        Adjudicator Scorecard
                      </span>
                      <div className="flex items-center gap-3 text-xs font-bold">
                        <span className="text-rose-400">Fillers: {speakingCritique.filler_count}</span>
                        <span className="text-indigo-400">Grammar: {speakingCritique.grammar_score}%</span>
                        <span className="text-emerald-400 font-black">Overall: {speakingCritique.overall_score}/100</span>
                      </div>
                    </div>

                    <div className="space-y-3 text-xs">
                      <div>
                        <span className="font-bold text-rose-400">What To Improve:</span>
                        <p className="text-slate-300 mt-0.5 leading-relaxed">{speakingCritique.what_was_wrong}</p>
                      </div>
                      <div className="p-3.5 rounded-xl bg-indigo-950/60 border border-indigo-500/30">
                        <span className="font-extrabold text-indigo-300">Live Spoken Correction:</span>
                        <p className="text-indigo-100 font-semibold mt-0.5 italic">"{speakingCritique.live_correction}"</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* STAGE: THE LIVE AI LOUNGE (MODULE 4 STAGE 1 - UNRESTRICTED RAPID VOICE SPARRING) */}
            {(currentStep.type === "live_lounge" || currentStep.type === "conversational_sparring" || currentStep.type === "interact") && (
              <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white border border-indigo-500/30 space-y-6 shadow-2xl relative overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
                  <div className="flex items-center gap-2.5">
                    <span className="p-2.5 rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/30">
                      <Sparkles className="w-5 h-5 text-amber-300" />
                    </span>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-indigo-300 block">
                        Module 4 • Live Voice Lounge
                      </span>
                      <h4 className="text-base sm:text-xl font-black text-white">Unrestricted Rapid Voice Sparring</h4>
                    </div>
                  </div>

                  {/* HANDS-FREE TOGGLE */}
                  <button
                    onClick={() => {
                      const next = !isHandsFreeMode;
                      setIsHandsFreeMode(next);
                      if (!next) {
                        stopRecordingSpeech();
                      }
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black border flex items-center gap-1.5 transition-all ${
                      isHandsFreeMode
                        ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-xs"
                        : "bg-white/10 text-slate-300 border-white/10 hover:bg-white/15"
                    }`}
                  >
                    <Zap className="w-3.5 h-3.5 text-amber-400 fill-current" />
                    <span>Hands-Free Auto-Voice: {isHandsFreeMode ? "ACTIVE" : "OFF"}</span>
                  </button>
                </div>

                {/* TOPIC SELECTOR PILLS */}
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide block">
                    Choose A Discussion Topic Or Talk About Anything:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { title: "🚀 Career & Ambition", starter: "Welcome to the Live AI Lounge! What are your biggest career or educational aspirations for the next three years?" },
                      { title: "🎓 AI in Classrooms", starter: "How do you think artificial intelligence will transform Indian schools and students in the near future?" },
                      { title: "🎬 Books & Stories", starter: "Tell me about an inspiring book, character, or movie that left a deep impression on you." },
                      { title: "⚖️ Hard Work vs Talent", starter: "In your experience, do you believe consistent daily practice matters more than raw talent?" },
                      { title: "💬 Open Conversation", starter: "Welcome! You can speak with me about absolutely anything on your mind today. What would you like to share?" }
                    ].map((top, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setLiveLoungeTopic(top.title);
                          setDialogueMessages([]);
                          setUserSpokenText("");
                          speakText(top.starter, () => {
                            if (isHandsFreeRef.current) {
                              startRecordingSpeech({ continuous: true });
                            }
                          });
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                          liveLoungeTopic === top.title
                            ? "bg-indigo-600 text-white border-indigo-400 shadow-sm"
                            : "bg-slate-900 text-slate-300 border-slate-800 hover:border-indigo-500/50 hover:bg-slate-800"
                        }`}
                      >
                        {top.title}
                      </button>
                    ))}
                  </div>
                </div>

                {/* STATUS BAR */}
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between text-xs font-bold">
                  <div className="flex items-center gap-2.5">
                    {isAiSpeaking ? (
                      <>
                        <div className="w-2.5 h-2.5 rounded-full bg-indigo-400 animate-ping" />
                        <span className="text-indigo-300">🔊 Coach is speaking aloud...</span>
                      </>
                    ) : isCoachThinking ? (
                      <>
                        <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
                        <span className="text-amber-300">⚡ Coach is replying in sub-second...</span>
                      </>
                    ) : isListening ? (
                      <>
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-emerald-300">🎙️ Listening to you... Speak comfortably</span>
                      </>
                    ) : (
                      <>
                        <div className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                        <span className="text-slate-300">Microphone standby. Speak freely or click mic below!</span>
                      </>
                    )}
                  </div>

                  <span className="text-[11px] text-indigo-300/80 font-normal hidden sm:inline">
                    Unlimited Sparring • No Restrictions
                  </span>
                </div>

                {/* DIALOGUE BUBBLES */}
                <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                  {dialogueMessages.length === 0 && currentCoachStarter && (
                    <div className="p-3.5 rounded-2xl bg-white/10 border border-white/15 text-xs text-white flex items-center justify-between gap-3">
                      <span>"{currentCoachStarter}"</span>
                      <button
                        onClick={() => speakText(currentCoachStarter)}
                        disabled={isAiSpeaking}
                        className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {dialogueMessages.map((msg, i) => (
                    <div key={i} className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}>
                      {msg.correction && (
                        <div className="mb-1 text-[11px] font-bold text-amber-300 bg-amber-500/20 border border-amber-400/40 px-3 py-1 rounded-xl shadow-xs">
                          💡 Coach Tip: {msg.correction}
                        </div>
                      )}
                      <div className={`p-3.5 rounded-2xl max-w-md text-xs font-semibold leading-relaxed flex items-start gap-2 ${
                        msg.sender === "user"
                          ? "bg-indigo-600 text-white rounded-tr-none shadow-md"
                          : "bg-white/10 border border-white/15 text-white rounded-tl-none shadow-xs"
                      }`}>
                        <span className="flex-1">{msg.text}</span>
                        {msg.sender === "coach" && (
                          <button
                            onClick={() => speakText(msg.text)}
                            disabled={isAiSpeaking}
                            className="p-1 rounded text-slate-300 hover:text-white"
                          >
                            <Volume2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}

                  {isCoachThinking && (
                    <div className="flex items-center gap-2 text-xs font-bold text-indigo-300">
                      <div className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
                      <span>Coach is replying...</span>
                    </div>
                  )}
                </div>

                {/* USER SPEECH PREVIEW */}
                {userSpokenText && (
                  <div className="p-3 bg-white/10 rounded-xl border border-white/15 text-xs flex items-center justify-between gap-2">
                    <span className="text-slate-300 truncate">
                      <strong className="text-emerald-300">You: </strong>"{userSpokenText}"
                    </span>
                    <button
                      onClick={() => handleSendDialogueTurn()}
                      className="px-3 py-1 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-bold shrink-0"
                    >
                      Send Spoken Turn
                    </button>
                  </div>
                )}

                {/* CONTROLS (MANUAL MIC TOGGLE + INPUT FALLBACK) */}
                <div className="flex items-center gap-2 pt-1">
                  {!isListening ? (
                    <button
                      onClick={() => startRecordingSpeech({ continuous: true })}
                      className="px-4 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-md shrink-0"
                    >
                      <Mic className="w-4 h-4" />
                      <span>Click to Speak</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        stopRecordingSpeech();
                        if (userSpokenText.trim()) {
                          handleSendDialogueTurn(userSpokenText.trim());
                        }
                      }}
                      className="px-4 py-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-md shrink-0 animate-pulse"
                    >
                      <MicOff className="w-4 h-4" />
                      <span>Done & Send Turn</span>
                    </button>
                  )}

                  <input
                    type="text"
                    value={userSpokenText}
                    onChange={(e) => setUserSpokenText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && userSpokenText.trim()) {
                        handleSendDialogueTurn();
                      }
                    }}
                    placeholder="Speak freely via microphone or type your message here..."
                    className="flex-1 px-4 py-3 rounded-2xl bg-white/10 border border-white/15 text-xs text-white placeholder-slate-400 font-semibold focus:outline-hidden focus:border-indigo-400"
                  />

                  <button
                    onClick={() => handleSendDialogueTurn()}
                    disabled={!userSpokenText.trim() || isCoachThinking}
                    className="px-5 py-3 rounded-2xl bg-indigo-500 hover:bg-indigo-600 text-white font-extrabold text-xs shadow-sm transition-all disabled:opacity-30 shrink-0"
                  >
                    Send
                  </button>
                </div>
              </div>
            )}

            {/* STAGE: OFFICIAL SPOKEN MASTERY CERTIFICATION (MODULE 4 STAGE 2) */}
            {currentStep.type === "mastery_graduation" && (
              <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-950 to-indigo-950 text-white border border-amber-500/40 space-y-6 shadow-2xl relative overflow-hidden">
                <div className="space-y-2 text-center max-w-xl mx-auto">
                  <div className="w-16 h-16 rounded-3xl bg-amber-500/20 text-amber-300 border border-amber-400/40 flex items-center justify-center mx-auto shadow-lg shadow-amber-500/20">
                    <Trophy className="w-8 h-8 text-amber-400" />
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black text-white">
                    Official Spoken English Mastery Certification
                  </h3>
                  <p className="text-xs sm:text-sm text-indigo-200 leading-relaxed font-medium">
                    You have successfully progressed through the foundational cadence, grammar reconstruction, keynote delivery, and unrestricted live sparring stages.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
                  <span className="text-[11px] font-black uppercase tracking-wider text-amber-400">Final Graduation Speech Reflection:</span>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-semibold">
                    Speak a 1-2 sentence final reflection into your microphone summarizing your transformation and future goals, then click Generate Certificate.
                  </p>

                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    {!isListening ? (
                      <button
                        onClick={handleToggleSpeakMic}
                        className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs shadow-md flex items-center gap-2"
                      >
                        <Mic className="w-4 h-4" />
                        <span>{userSpokenText ? "Record Reflection Again" : "Speak Graduation Reflection"}</span>
                      </button>
                    ) : (
                      <button
                        onClick={handleToggleSpeakMic}
                        className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs shadow-md flex items-center gap-2 animate-pulse"
                      >
                        <MicOff className="w-4 h-4" />
                        <span>Done Speaking</span>
                      </button>
                    )}

                    {isListening && <AudioWaveVisualizer isActive={true} color="rose" />}
                  </div>

                  {userSpokenText && (
                    <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-xs text-slate-300 font-mono mt-2">
                      <span className="text-slate-500 font-sans block text-[10px] uppercase font-bold">Your Graduation Reflection:</span>
                      "{userSpokenText}"
                    </div>
                  )}
                </div>

                {/* CERTIFICATE CALL TO ACTION */}
                <button
                  onClick={handleFinalizeCapstone}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-indigo-600 to-purple-600 hover:from-amber-400 hover:to-purple-500 text-white font-black text-sm shadow-xl shadow-indigo-600/30 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <Award className="w-5 h-5 text-amber-200" />
                  <span>Finalize & Issue Official Spoken Mastery Certificate</span>
                </button>
              </div>
            )}

            {/* FOOTER BUTTONS WITH ANTI-SKIP PROGRESSION */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-between border-t border-slate-200 gap-3">
              <button
                disabled={activeStepIdx === 0}
                onClick={() => setActiveStepIdx(prev => Math.max(0, prev - 1))}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none"
              >
                Previous Stage
              </button>

              <div className="flex flex-wrap items-center gap-3">
                {!canAdvanceStep() && (
                  <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200">
                    {(currentStep.type === "coach_masterclass" || currentStep.type === "listen") && "🎙️ Record the vocal warmup into mic to unlock"}
                    {(currentStep.type === "vocal_mimicry" || currentStep.type === "repeat" || currentStep.type === "star_method") && "🎙️ Echo the phrase into mic to unlock"}
                    {(currentStep.type === "sentence_doctor" || currentStep.type === "error_fix") && "🛠️ Speak the corrected sentence into mic to unlock"}
                    {(currentStep.type === "daily_chitchat" || currentStep.type === "polite_request" || currentStep.type === "speak") && "💬 Speak your response into mic to unlock"}
                    {(currentStep.type === "live_lounge" || currentStep.type === "conversational_sparring" || currentStep.type === "interact") && "🤝 Complete at least 1 turn with the AI coach"}
                    {(currentStep.type === "spoken_capstone" || currentStep.type === "present" || currentStep.type === "capstone") && "🎤 Deliver your speech and request AI critique"}
                  </span>
                )}

                <button
                  disabled={!canAdvanceStep()}
                  onClick={() => handleCompleteStep(currentStep.step_id)}
                  className={`px-6 py-2.5 rounded-xl text-xs font-extrabold shadow-sm transition-all active:scale-95 flex items-center gap-1.5 ${
                    canAdvanceStep()
                      ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/20"
                      : "bg-slate-200 text-slate-400 cursor-not-allowed"
                  }`}
                >
                  <span>{isLastStep ? "Complete Module" : "Mark Stage Complete & Advance"}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ===================================================================
  // VIEW 4: OFFICIAL SPOKEN MASTERY REPORT CARD
  // ===================================================================
  if (activeTab === "report" && track?.mastery_report) {
    const rep = track.mastery_report;

    return (
      <div className="max-w-4xl mx-auto space-y-6 py-6 px-4 animate-in fade-in duration-300">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <button
            onClick={() => setActiveTab("roadmap")}
            className="text-xs font-extrabold text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5"
          >
            <ArrowRight className="w-4 h-4 rotate-180" />
            <span>Back to Module Roadmap</span>
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 flex items-center gap-1.5 shadow-xs"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Print Official Report</span>
            </button>
            <button
              onClick={handleResetCycle}
              className="px-4 py-2 rounded-xl bg-rose-50 text-rose-700 font-bold text-xs hover:bg-rose-100 flex items-center gap-1.5 border border-rose-200"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restart Cycle</span>
            </button>
          </div>
        </div>

        {/* CERTIFICATE / REPORT CARD */}
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xl space-y-8 relative overflow-hidden">
          {/* TOP EMBLEM */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white flex items-center justify-center font-black text-xl shadow-md">
                D
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900">Devgya Global Education</h2>
                <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Spoken English Mastery Evaluation Report</p>
              </div>
            </div>
            <div className="text-left sm:text-right">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Certificate ID</span>
              <p className="font-mono font-extrabold text-xs text-slate-800">{rep.certificate_id || "DEVGYA-ENG-2026"}</p>
            </div>
          </div>

          {/* STUDENT HERO */}
          <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-indigo-50 p-6 rounded-2xl border border-indigo-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs font-bold text-indigo-600 uppercase">Learner Profile</span>
              <h3 className="text-2xl font-black text-slate-900">{rep.student_name}</h3>
              <p className="text-xs text-slate-500 font-semibold">Assessed Role: {rep.user_role?.toUpperCase()}</p>
            </div>
            <div className="px-4 py-2.5 rounded-xl bg-white text-indigo-900 font-extrabold text-sm border border-indigo-200 shadow-sm text-center">
              <span className="text-[10px] uppercase text-indigo-500 block font-bold">Fluency Band</span>
              {rep.fluency_band}
            </div>
          </div>

          {/* METRIC GRIDS */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center">
              <span className="text-xs font-bold text-slate-500 uppercase">Diagnostic Score</span>
              <p className="text-2xl font-black text-slate-900 mt-1">{rep.diagnostic_score} / 10</p>
            </div>
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 text-center">
              <span className="text-xs font-bold text-emerald-600 uppercase">Pronunciation</span>
              <p className="text-2xl font-black text-emerald-900 mt-1">{rep.pronunciation_rating}%</p>
            </div>
            <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100 text-center">
              <span className="text-xs font-bold text-indigo-600 uppercase">Grammar Accuracy</span>
              <p className="text-2xl font-black text-indigo-900 mt-1">{rep.grammar_accuracy}%</p>
            </div>
            <div className="p-4 rounded-2xl bg-purple-50 border border-purple-100 text-center">
              <span className="text-xs font-bold text-purple-600 uppercase">Public Speaking</span>
              <p className="text-2xl font-black text-purple-900 mt-1">{rep.public_speaking_confidence}%</p>
            </div>
          </div>

          {/* STRENGTHS & WEAKNESSES RESOLVED */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <span className="text-xs font-extrabold uppercase text-emerald-700 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Demonstrated Strengths
              </span>
              <ul className="space-y-1.5">
                {(rep.strengths || []).map((s: string, i: number) => (
                  <li key={i} className="text-xs text-slate-700 font-medium bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-100/60">
                    • {s}
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-extrabold uppercase text-indigo-700 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                Weaknesses Resolved Through Lectures
              </span>
              <ul className="space-y-1.5">
                {(rep.weaknesses_resolved || []).map((w: string, i: number) => (
                  <li key={i} className="text-xs text-slate-700 font-medium bg-indigo-50/50 p-2.5 rounded-xl border border-indigo-100/60">
                    • {w}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* PARENT & TEACHER RECOMMENDATIONS */}
          <div className="space-y-3 pt-2">
            <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-100">
              <span className="text-xs font-extrabold text-rose-800 uppercase flex items-center gap-1.5 mb-1">
                <HeartHandshake className="w-4 h-4 text-rose-600" />
                Coach Recommendation For Parents:
              </span>
              <p className="text-xs text-rose-950 font-medium leading-relaxed">
                {rep.coach_recommendation_for_parents}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100">
              <span className="text-xs font-extrabold text-indigo-800 uppercase flex items-center gap-1.5 mb-1">
                <GraduationCap className="w-4 h-4 text-indigo-600" />
                Coach Recommendation For Teachers:
              </span>
              <p className="text-xs text-indigo-950 font-medium leading-relaxed">
                {rep.coach_recommendation_for_teachers}
              </p>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-4 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 font-semibold gap-2">
            <span>Generated on {new Date(rep.generated_at).toLocaleDateString()}</span>
            <span>Course Cycle Valid Until: {new Date(rep.cycle_valid_until).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
