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
}

interface StepItem {
  step_id: string;
  type: "listen" | "repeat" | "speak" | "interact" | "present" | "capstone" | "game" | "error_fix" | "hook_delivery" | "star_method";
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
  const [activeDrillIdx, setActiveDrillIdx] = useState<number>(0);
  const [completedDrills, setCompletedDrills] = useState<Record<string, number[]>>({});
  const [isAiSpeaking, setIsAiSpeaking] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [userSpokenText, setUserSpokenText] = useState<string>("");
  const [stepCompleteNotice, setStepCompleteNotice] = useState<string | null>(null);

  // Pronunciation Evaluation State (Repeat Step)
  const [repeatMatchScore, setRepeatMatchScore] = useState<number | null>(null);
  const [repeatWordMatches, setRepeatWordMatches] = useState<Array<{ word: string; matched: boolean }>>([]);
  const [hasListened, setHasListened] = useState<boolean>(false);

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
  const [isHandsFreeMode, setIsHandsFreeMode] = useState<boolean>(true);

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
    setActiveDrillIdx(0);
    setUserSpokenText("");
    setRepeatMatchScore(null);
    setRepeatWordMatches([]);
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

    // If entering the interact step with hands-free mode, start with coach greeting spoken aloud
    if (activeTab === "player" && currentStep?.type === "interact" && currentStep.coach_starter && dialogueMessages.length === 0) {
      const timer = setTimeout(() => {
        speakText(currentStep.coach_starter!, () => {
          if (isHandsFreeRef.current && activeStepTypeRef.current === "interact") {
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

  // Drill completion tracker
  const markCurrentDrillDone = useCallback(() => {
    const currentMod = modules[activeModuleIdx];
    const currentStep = currentMod?.steps[activeStepIdx];
    if (!currentStep) return;
    setCompletedDrills(prev => {
      const existing = prev[currentStep.step_id] || [];
      if (!existing.includes(activeDrillIdx)) {
        return { ...prev, [currentStep.step_id]: [...existing, activeDrillIdx] };
      }
      return prev;
    });
  }, [modules, activeModuleIdx, activeStepIdx, activeDrillIdx]);

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

  // 4. Spoken Coaching Engine for Repeat Stage
  const evaluateRepeatPerformance = (target: string, captured: string) => {
    const { score, matches } = calculateWordMatch(target, captured);
    setRepeatMatchScore(score);
    setRepeatWordMatches(matches);

    const missed = matches.filter(m => !m.matched).map(m => m.word);
    let spokenReply = "";
    let status: "great" | "good" | "enhance" = "good";
    let whatWentWell = "";
    let whatToEnhance = "";

    if (score >= 75) {
      status = "great";
      whatWentWell = `You scored ${score}%! Crisp diction, accurate syllable stress, and confident volume.`;
      whatToEnhance = missed.length > 0
        ? `To enhance even further, polish enunciation on: "${missed.join(", ")}".`
        : "You are doing great! Keep this exact natural cadence and steady pacing.";
      spokenReply = `You are doing great! That was an excellent echo with a ${score} percent score. ${whatToEnhance}`;
      markCurrentDrillDone();
    } else if (score >= 45) {
      status = "good";
      whatWentWell = `Solid attempt with a ${score}% score. Good speech tempo and courage to speak without hesitation.`;
      whatToEnhance = `To enhance your delivery, make sure to clearly enunciate: "${missed.slice(0, 4).join(", ")}". Repeat once more to master it!`;
      spokenReply = `Good effort! You scored ${score} percent. To enhance your speech, make sure to clearly enunciate ${missed.slice(0, 4).join(", ")}.`;
      markCurrentDrillDone();
    } else {
      status = "enhance";
      whatWentWell = "Good vocal effort and participation.";
      whatToEnhance = `Slow down and pronounce each word clearly, especially: "${missed.slice(0, 4).join(", ")}". Give it another try!`;
      spokenReply = `Good try! You scored ${score} percent. Here is what you should enhance: speak a little slower and pronounce each word clearly, especially ${missed.slice(0, 4).join(", ")}.`;
    }

    setCoachStepFeedback({
      status,
      title: status === "great" ? `Pronunciation Mastery: ${score}% (Doing Great!)` : status === "good" ? `Good Progress: ${score}%` : `Pronunciation Focus: ${score}%`,
      whatWentWell,
      whatToEnhance,
      spokenAudio: spokenReply
    });

    speakText(spokenReply);
  };

  // Model audio player with spoken coaching advice
  const handleListenToModel = (modelText: string) => {
    setHasListened(true);
    markCurrentDrillDone();
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

  // Repeat step voice recorder & validator
  const handleRepeatVoiceCapture = () => {
    const currentMod = modules[activeModuleIdx];
    const currentStep = currentMod?.steps[activeStepIdx];
    const target = (currentStep?.practice_items && currentStep.practice_items[activeDrillIdx]?.target_phrase) || currentStep?.target_phrase || "";

    if (isListening) {
      stopRecordingSpeech();
      if (userSpokenText.trim() && target) {
        evaluateRepeatPerformance(target, userSpokenText);
      }
      return;
    }

    startRecordingSpeech({
      continuous: true,
      onResult: (text: string) => {
        if (!target) return;
        const { score, matches } = calculateWordMatch(target, text);
        setRepeatMatchScore(score);
        setRepeatWordMatches(matches);

        // Auto-evaluate when user achieves high match or after adequate speech length
        const targetWords = target.trim().split(/\s+/).filter(Boolean);
        const spokenWords = text.trim().split(/\s+/).filter(Boolean);
        if (score >= 65 || (spokenWords.length >= targetWords.length && spokenWords.length >= 3)) {
          if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
          silenceTimerRef.current = setTimeout(() => {
            stopRecordingSpeech();
            evaluateRepeatPerformance(target, text);
          }, 900);
        }
      }
    });
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
      const activeItem = (currentStep?.practice_items && currentStep.practice_items[activeDrillIdx]) || null;
      const promptToSend = activeItem?.prompt || currentStep?.prompt || "Speaking Challenge";
      const sampleToSend = activeItem?.sample_answer || currentStep?.sample_answer || null;

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
        markCurrentDrillDone();

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
        markCurrentDrillDone();

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
      const activeItem = (currentStep?.practice_items && currentStep.practice_items[activeDrillIdx]) || null;
      const starter = activeItem?.coach_starter || currentStep?.coach_starter || "";

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
        markCurrentDrillDone();

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
          if (isHandsFreeRef.current && activeStepTypeRef.current === "interact") {
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
          markCurrentDrillDone();
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
          markCurrentDrillDone();
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

  const handleSentenceFixVoiceCheck = () => {
    if (isListening) {
      stopRecordingSpeech();
      return;
    }
    const currentMod = modules[activeModuleIdx];
    const currentStep = currentMod?.steps[activeStepIdx];
    const targetCorrect = (currentStep?.practice_items && currentStep.practice_items[activeDrillIdx]?.corrected_sentence) || currentStep?.corrected_sentence || "";

    startRecordingSpeech({
      continuous: true,
      onResult: (text: string) => {
        if (!targetCorrect) return;
        const { score } = calculateWordMatch(targetCorrect, text);
        if (score >= 45) {
          stopRecordingSpeech();
          setSentenceFixResult({
            success: true,
            message: `Spot on! "${targetCorrect}" is grammatically accurate! 🌟`
          });
          setGameCompleted(true);
          markCurrentDrillDone();

          const spokenReply = "You are doing great! Spot on! That was grammatically accurate and well articulated. To enhance further, practice using this correct structure naturally in conversation.";
          setCoachStepFeedback({
            status: "great",
            title: "Grammar Clinic: Doing Great!",
            whatWentWell: "Identified the grammatical flaw and delivered the corrected sentence cleanly.",
            whatToEnhance: "Integrate this accurate structure into your spontaneous daily speech.",
            spokenAudio: spokenReply
          });
          speakText(spokenReply);
        } else if (text.trim().split(/\s+/).length >= 4) {
          if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
          silenceTimerRef.current = setTimeout(() => {
            stopRecordingSpeech();
            const spokenReply = `Good attempt! You are close, but here is what you should enhance: the target correct sentence is "${targetCorrect}". Notice the verb agreement and try saying it once more!`;
            setSentenceFixResult({
              success: false,
              message: `Notice the target structure: "${targetCorrect}". Keep practicing!`
            });
            setCoachStepFeedback({
              status: "enhance",
              title: "Grammar Clinic: Needs Adjustment",
              whatWentWell: "Recognized the need for modification and attempted correction.",
              whatToEnhance: `Target phrase: "${targetCorrect}". Watch the verb tense and word order.`,
              spokenAudio: spokenReply
            });
            speakText(spokenReply);
          }, 1000);
        }
      }
    });
  };

  // Anti-skip prerequisite check: Has user actually performed the step?
  const canAdvanceStep = () => {
    const currentMod = modules[activeModuleIdx];
    const currentStep = currentMod?.steps[activeStepIdx];
    if (!currentStep) return false;

    let drillPassed = false;
    if (currentStep.type === "listen") {
      drillPassed = hasListened;
    } else if (currentStep.type === "repeat") {
      drillPassed = repeatMatchScore !== null && repeatMatchScore >= 45;
    } else if (currentStep.type === "speak") {
      drillPassed = speakCritique !== null || userSpokenText.trim().split(/\s+/).length >= 4;
    } else if (currentStep.type === "error_fix") {
      drillPassed = Boolean(sentenceFixResult?.success || gameCompleted);
    } else if (currentStep.type === "hook_delivery") {
      drillPassed = repeatMatchScore !== null && repeatMatchScore >= 45;
    } else if (currentStep.type === "star_method") {
      drillPassed = userSpokenText.trim().split(/\s+/).length >= 4;
    } else if (currentStep.type === "interact") {
      const userTurns = dialogueMessages.filter(m => m.sender === "user").length;
      drillPassed = userTurns >= 1;
    } else if (currentStep.type === "present") {
      drillPassed = speakingCritique !== null || userSpokenText.trim().split(/\s+/).length >= 8;
    } else if (currentStep.type === "game") {
      drillPassed = gameCompleted;
    } else if (currentStep.type === "capstone") {
      drillPassed = userSpokenText.trim().length > 0;
    } else {
      drillPassed = true;
    }

    if (currentStep.practice_items && currentStep.practice_items.length > 0) {
      const completed = completedDrills[currentStep.step_id] || [];
      return completed.length >= 1 || drillPassed;
    }

    return drillPassed;
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

    // Multi-drill progressive practice resolution
    const practiceItems = currentStep?.practice_items || [];
    const hasMultipleDrills = practiceItems.length > 0;
    const safeDrillIdx = hasMultipleDrills ? Math.min(activeDrillIdx, practiceItems.length - 1) : 0;
    const currentDrill = hasMultipleDrills ? practiceItems[safeDrillIdx] : null;

    const currentPrompt = currentDrill?.prompt || currentStep?.prompt || "";
    const currentModelAudio = currentDrill?.model_audio_text || currentStep?.model_audio_text;
    const currentTargetPhrase = currentDrill?.target_phrase || currentStep?.target_phrase;
    const currentSampleAnswer = currentDrill?.sample_answer || currentStep?.sample_answer;
    const currentCoachStarter = currentDrill?.coach_starter || currentStep?.coach_starter;
    const currentFlawedSentence = currentDrill?.flawed_sentence || currentStep?.flawed_sentence;
    const currentCorrectedSentence = currentDrill?.corrected_sentence || currentStep?.corrected_sentence;
    const currentExplanation = currentDrill?.explanation || currentStep?.explanation;

    const switchDrill = (idx: number) => {
      setActiveDrillIdx(idx);
      setUserSpokenText("");
      accumulatedFinalTextRef.current = "";
      setRepeatMatchScore(null);
      setRepeatWordMatches([]);
      setSpeakCritique(null);
      setSentenceFixResult(null);
      setCoachStepFeedback(null);
      stopRecordingSpeech();
      if (currentStep?.type === "interact") {
        const starter = practiceItems[idx]?.coach_starter || currentStep?.coach_starter;
        if (starter) {
          setDialogueMessages([]);
          speakText(starter, () => {
            if (isHandsFreeRef.current) {
              startRecordingSpeech({ continuous: true });
            }
          });
        }
      }
    };

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
              Step {activeStepIdx + 1}/{currentMod?.steps.length}
            </span>
          </div>
        </div>

        {stepCompleteNotice && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{stepCompleteNotice}</span>
          </div>
        )}

        {/* STEP CARD */}
        {currentStep && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="space-y-1">
              <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-extrabold uppercase tracking-wider">
                {currentStep.type.toUpperCase()} STAGE
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-2">
                {currentStep.title}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                {currentStep.prompt}
              </p>
            </div>

            {/* MULTI-PRACTICE PROGRESSIVE DRILLS SELECTOR */}
            {hasMultipleDrills && (
              <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/80 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    Multi-Level Progressive Practice ({practiceItems.length} Drills)
                  </span>
                  <span className="text-[11px] font-extrabold text-indigo-700 bg-indigo-100/70 px-2.5 py-0.5 rounded-full border border-indigo-200">
                    Drill {safeDrillIdx + 1} of {practiceItems.length}
                  </span>
                </div>
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {practiceItems.map((drill, idx) => {
                    const isDone = (completedDrills[currentStep.step_id] || []).includes(idx);
                    const isCurrent = safeDrillIdx === idx;
                    return (
                      <button
                        key={drill.id || idx}
                        onClick={() => switchDrill(idx)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 shrink-0 ${
                          isCurrent
                            ? "bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-400"
                            : isDone
                            ? "bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100"
                            : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        {isDone ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-700 text-[10px] flex items-center justify-center font-black">
                            {idx + 1}
                          </span>
                        )}
                        <span>{drill.title || `Drill ${idx + 1}`}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* DEVGYA AI SPOKEN COACH STEP FEEDBACK CARD */}
            {coachStepFeedback && (
              <div className={`p-4 sm:p-5 rounded-2xl border transition-all animate-in fade-in slide-in-from-top-2 ${
                coachStepFeedback.status === "great"
                  ? "bg-gradient-to-r from-emerald-50/90 via-teal-50/50 to-white border-emerald-300 text-emerald-950 shadow-xs"
                  : coachStepFeedback.status === "good"
                  ? "bg-gradient-to-r from-indigo-50/90 via-blue-50/50 to-white border-indigo-300 text-indigo-950 shadow-xs"
                  : "bg-gradient-to-r from-amber-50/90 via-orange-50/50 to-white border-amber-300 text-amber-950 shadow-xs"
              }`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-black/5 pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className={`p-2 rounded-xl text-white shadow-xs ${
                      coachStepFeedback.status === "great"
                        ? "bg-emerald-600"
                        : coachStepFeedback.status === "good"
                        ? "bg-indigo-600"
                        : "bg-amber-600"
                    }`}>
                      <Sparkles className="w-4 h-4" />
                    </span>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">
                        Devgya AI Spoken Coach • Step Verdict
                      </span>
                      <h4 className="text-sm sm:text-base font-black text-slate-900">
                        {coachStepFeedback.title}
                      </h4>
                    </div>
                  </div>

                  <button
                    onClick={() => coachStepFeedback.spokenAudio && speakText(coachStepFeedback.spokenAudio)}
                    disabled={isAiSpeaking}
                    className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-800 font-extrabold text-xs shadow-xs hover:bg-slate-50 flex items-center gap-1.5 shrink-0 transition-all active:scale-95 disabled:opacity-50"
                  >
                    <Volume2 className="w-3.5 h-3.5 text-indigo-600" />
                    <span>{isAiSpeaking ? "Coach Speaking..." : "Hear AI Coach Voice"}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-white/90 border border-emerald-100/80 space-y-1 shadow-2xs">
                    <span className="font-black text-emerald-800 uppercase tracking-wide flex items-center gap-1 text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      How You're Doing / What Went Well:
                    </span>
                    <p className="font-semibold text-slate-700 leading-relaxed">
                      {coachStepFeedback.whatWentWell}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white/90 border border-amber-100/80 space-y-1 shadow-2xs">
                    <span className="font-black text-amber-800 uppercase tracking-wide flex items-center gap-1 text-[11px]">
                      <Flame className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      What You Should Enhance:
                    </span>
                    <p className="font-semibold text-slate-700 leading-relaxed">
                      {coachStepFeedback.whatToEnhance}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 1: LISTEN */}
            {currentStep.type === "listen" && currentModelAudio && (
              <div className="p-6 rounded-2xl bg-indigo-50/50 border border-indigo-100 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Volume2 className="w-4 h-4 text-indigo-600" />
                    Model Spoken Pronunciation {hasMultipleDrills && `(Drill ${safeDrillIdx + 1})`}
                  </span>
                  <button
                    onClick={() => {
                      if (currentModelAudio) handleListenToModel(currentModelAudio);
                    }}
                    disabled={isAiSpeaking}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white font-extrabold text-xs shadow-sm hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>{isAiSpeaking ? "Coach Speaking..." : "Play Native Audio"}</span>
                  </button>
                </div>
                <p className="text-base sm:text-lg font-bold text-slate-800 leading-relaxed italic bg-white p-4 rounded-xl border border-indigo-100/60 shadow-xs">
                  "{currentModelAudio}"
                </p>
                {hasListened && (
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Audio heard! Step unlocked for advancement.</span>
                  </div>
                )}
              </div>
            )}

            {/* STEP 2: REPEAT (WITH PRONUNCIATION WORD-BY-WORD DIFF) */}
            {currentStep.type === "repeat" && currentTargetPhrase && (
              <div className="p-6 rounded-2xl bg-purple-50/50 border border-purple-100 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-purple-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Mic className="w-4 h-4 text-purple-600" />
                    Target Phrase To Echo {hasMultipleDrills && `(Drill ${safeDrillIdx + 1})`}
                  </span>
                  {repeatMatchScore !== null && (
                    <span className={`px-3 py-1 rounded-full text-xs font-black border ${
                      repeatMatchScore >= 65 
                        ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                        : "bg-amber-100 text-amber-800 border-amber-300"
                    }`}>
                      {repeatMatchScore >= 65 ? "🌟 Match Score: " : "⚠️ Match Score: "}{repeatMatchScore}%
                    </span>
                  )}
                </div>

                <p className="text-base sm:text-lg font-bold text-purple-950 bg-white p-4 rounded-xl border border-purple-100 shadow-xs">
                  "{currentTargetPhrase}"
                </p>

                {/* WORD-LEVEL PHONETIC MATCH BREAKDOWN */}
                {repeatWordMatches.length > 0 && (
                  <div className="p-3 bg-white rounded-xl border border-purple-200 space-y-2">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                      Word Pronunciation Accuracy:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {repeatWordMatches.map((m, idx) => (
                        <span 
                          key={idx} 
                          className={`px-2.5 py-1 rounded-lg text-xs font-extrabold border flex items-center gap-1 ${
                            m.matched
                              ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                              : "bg-rose-50 text-rose-700 border-rose-300"
                          }`}
                        >
                          {m.word} {m.matched ? "✓" : "✗"}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                  <button
                    onClick={() => speakText(currentTargetPhrase)}
                    className="px-4 py-2 rounded-xl bg-white border border-purple-200 text-purple-700 font-bold text-xs hover:bg-purple-50 flex items-center gap-1.5 transition-colors"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Listen Again</span>
                  </button>
                  <button
                    onClick={handleRepeatVoiceCapture}
                    className={`px-6 py-2.5 rounded-xl font-extrabold text-xs flex items-center gap-2 transition-all active:scale-95 ${
                      isListening
                        ? "bg-rose-600 text-white animate-pulse"
                        : "bg-purple-600 text-white hover:bg-purple-700 shadow-sm"
                    }`}
                  >
                    <Mic className="w-4 h-4" />
                    <span>{isListening ? "Listening... Speak Now" : "Press & Repeat Aloud"}</span>
                  </button>
                </div>
                {userSpokenText && (
                  <div className="p-3 bg-white rounded-xl border border-purple-200 text-xs space-y-1">
                    <span className="font-bold text-slate-400">Captured Voice:</span>
                    <p className="font-semibold text-slate-800 font-mono">"{userSpokenText}"</p>
                  </div>
                )}
              </div>
            )}

            {/* STEP: SPEAK (WITH FULL AI FEEDBACK: POSITIVES, NEGATIVES, IMPROVEMENTS & MODEL AUDIO) */}
            {currentStep.type === "speak" && (
              <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-50/70 via-orange-50/40 to-white border border-amber-200/80 space-y-5 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
                    <MessageSquare className="w-4 h-4 text-amber-600" />
                    Spoken Challenge & Live Evaluation {hasMultipleDrills && `(Drill ${safeDrillIdx + 1})`}
                  </span>
                  {speakCritique && (
                    <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      Feedback Evaluated
                    </span>
                  )}
                </div>

                <div className="p-4 rounded-xl bg-white border border-amber-200 shadow-2xs space-y-2">
                  <span className="text-[11px] font-extrabold text-amber-700 uppercase tracking-wide">Speaking Prompt:</span>
                  <p className="text-sm sm:text-base font-bold text-slate-800 leading-snug">
                    {currentPrompt}
                  </p>
                </div>

                {currentSampleAnswer && (
                  <div className="text-xs font-medium text-amber-950 bg-amber-100/40 p-3.5 rounded-xl border border-amber-200/60 flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-extrabold text-amber-900 block">Suggested Reference:</span>
                      <p className="italic text-slate-700 mt-0.5">"{currentSampleAnswer}"</p>
                    </div>
                  </div>
                )}

                {/* RECORDING / EVALUATION CONTROLS */}
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <button
                    onClick={() => isListening ? stopRecordingSpeech() : startRecordingSpeech()}
                    className={`px-6 py-3 rounded-xl font-extrabold text-xs flex items-center gap-2 transition-all active:scale-95 shadow-sm ${
                      isListening
                        ? "bg-rose-600 text-white animate-pulse"
                        : "bg-amber-600 text-white hover:bg-amber-700"
                    }`}
                  >
                    <Mic className="w-4 h-4" />
                    <span>{isListening ? "Listening... Speak your answer" : "1. Click Mic & Speak Answer"}</span>
                  </button>

                  {userSpokenText.trim().length > 0 && (
                    <button
                      onClick={() => handleEvaluateSpeakStage()}
                      disabled={speakCritiqueLoading || isListening}
                      className="px-6 py-3 rounded-xl font-black text-xs bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2 shadow-sm transition-all active:scale-95"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>{speakCritiqueLoading ? "AI Coach Evaluating..." : "2. Get AI Feedback & Analysis"}</span>
                    </button>
                  )}
                </div>

                {userSpokenText && (
                  <div className="p-3.5 bg-white rounded-xl border border-amber-200 text-xs space-y-1">
                    <span className="font-bold text-slate-400">Captured Speech Transcript:</span>
                    <p className="font-semibold text-slate-800 text-sm leading-relaxed">"{userSpokenText}"</p>
                  </div>
                )}

                {/* AI EVALUATION LOADING INDICATOR */}
                {speakCritiqueLoading && (
                  <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center gap-3 text-xs text-indigo-700 font-bold">
                    <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                    <span>Devgya AI Coach is reviewing your pronunciation, grammar, vocabulary, and confidence...</span>
                  </div>
                )}

                {/* STRUCTURED AI FEEDBACK CARDS */}
                {speakCritique && (
                  <div className="space-y-3 pt-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {/* POSITIVE POINTS */}
                      <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-2">
                        <span className="text-xs font-black text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          What You Did Well (Positive Points)
                        </span>
                        <ul className="space-y-1.5">
                          {speakCritique.positive_points.map((pt, i) => (
                            <li key={i} className="text-xs font-semibold text-emerald-950 flex items-start gap-1.5">
                              <span className="text-emerald-600 font-bold">•</span>
                              <span>{pt}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* NEGATIVE POINTS / SLIP-UPS */}
                      <div className="p-4 rounded-xl bg-rose-50/70 border border-rose-200 space-y-2">
                        <span className="text-xs font-black text-rose-800 uppercase tracking-wider flex items-center gap-1.5">
                          <AlertCircle className="w-4 h-4 text-rose-600" />
                          Points to Fix (Slip-ups & Gaps)
                        </span>
                        <ul className="space-y-1.5">
                          {speakCritique.negative_points.map((pt, i) => (
                            <li key={i} className="text-xs font-semibold text-rose-950 flex items-start gap-1.5">
                              <span className="text-rose-600 font-bold">•</span>
                              <span>{pt}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* ACTIONABLE IMPROVEMENT & POLISHED MODEL ANSWER */}
                    <div className="p-4 rounded-xl bg-indigo-50/80 border border-indigo-200 space-y-3">
                      <div>
                        <span className="text-xs font-black text-indigo-900 uppercase tracking-wider block">
                          🚀 How to Improve Your Spoken Delivery:
                        </span>
                        <p className="text-xs font-semibold text-indigo-950 mt-1 leading-relaxed">
                          {speakCritique.how_to_improve}
                        </p>
                      </div>

                      {speakCritique.polished_version && (
                        <div className="p-3.5 rounded-lg bg-white border border-indigo-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                          <div className="space-y-0.5">
                            <span className="text-[11px] font-bold text-slate-400 uppercase">Native Polished Model:</span>
                            <p className="text-xs font-bold text-slate-900 italic">
                              "{speakCritique.polished_version}"
                            </p>
                          </div>
                          <button
                            onClick={() => speakText(speakCritique.polished_version)}
                            disabled={isAiSpeaking}
                            className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-[11px] flex items-center gap-1 shrink-0 transition-colors"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                            <span>{isAiSpeaking ? "Playing..." : "Hear Audio"}</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* STEP: ERROR FIX (LIVE SPOKEN SENTENCE CLINIC) */}
            {currentStep.type === "error_fix" && (
              <div className="p-6 rounded-2xl bg-rose-50/60 border border-rose-200 space-y-4">
                <span className="text-xs font-black text-rose-800 uppercase tracking-wider flex items-center gap-1.5">
                  <RotateCcw className="w-4 h-4 text-rose-600" />
                  Live Spoken Sentence Clinic {hasMultipleDrills && `(Drill ${safeDrillIdx + 1})`}
                </span>

                <div className="p-4 bg-white rounded-xl border border-rose-200 space-y-1">
                  <span className="text-[11px] font-bold text-rose-600 uppercase">Flawed Indian English Phrasing:</span>
                  <p className="text-base font-extrabold text-slate-800">"{currentFlawedSentence}"</p>
                </div>

                {currentExplanation && (
                  <p className="text-xs text-slate-600 leading-relaxed">
                    💡 <strong className="text-slate-800">Grammar Rule:</strong> {currentExplanation}
                  </p>
                )}

                <div className="space-y-2 pt-1">
                  <span className="text-xs text-slate-700 font-bold block">Your Spoken Challenge:</span>
                  <p className="text-xs text-slate-600">Speak the grammatically accurate sentence into your microphone.</p>
                  <button
                    onClick={handleSentenceFixVoiceCheck}
                    className={`px-6 py-2.5 rounded-xl font-extrabold text-xs flex items-center gap-2 transition-all active:scale-95 ${
                      isListening ? "bg-rose-500 text-white animate-pulse" : "bg-emerald-600 text-white hover:bg-emerald-700 font-black shadow-sm"
                    }`}
                  >
                    <Mic className="w-4 h-4" />
                    <span>{isListening ? "Listening... Speak the fix" : "Speak The Corrected Sentence"}</span>
                  </button>
                </div>

                {sentenceFixResult && (
                  <div className={`p-4 rounded-xl border text-xs font-bold ${
                    sentenceFixResult.success ? "bg-emerald-100 text-emerald-800 border-emerald-300" : "bg-rose-100 text-rose-800 border-rose-300"
                  }`}>
                    {sentenceFixResult.message}
                  </div>
                )}
              </div>
            )}

            {/* STEP: HOOK DELIVERY (30-SECOND ATTENTION GRABBER HOOK) */}
            {currentStep.type === "hook_delivery" && (
              <div className="p-6 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-4">
                <span className="text-xs font-black text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-amber-600" />
                  The 30-Second Attention Grabber Hook {hasMultipleDrills && `(Drill ${safeDrillIdx + 1})`}
                </span>

                <div className="p-4 bg-white rounded-xl border border-amber-200 space-y-1">
                  <span className="text-[11px] font-bold text-amber-700 uppercase">Target Opening Hook:</span>
                  <p className="text-sm sm:text-base font-extrabold text-slate-800">"{currentTargetPhrase}"</p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                  <button
                    onClick={() => speakText(currentTargetPhrase || "")}
                    className="px-4 py-2 rounded-xl bg-white border border-amber-200 text-amber-800 font-bold text-xs hover:bg-amber-50 flex items-center gap-1.5 transition-colors"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Listen To Native Hook Delivery</span>
                  </button>
                  <button
                    onClick={handleRepeatVoiceCapture}
                    className={`px-6 py-2.5 rounded-xl font-extrabold text-xs flex items-center gap-2 transition-all active:scale-95 ${
                      isListening
                        ? "bg-rose-600 text-white animate-pulse"
                        : "bg-amber-600 text-white hover:bg-amber-700 shadow-sm"
                    }`}
                  >
                    <Mic className="w-4 h-4" />
                    <span>{isListening ? "Listening... Deliver Hook!" : "Deliver Hook Into Mic"}</span>
                  </button>
                </div>

                {repeatMatchScore !== null && (
                  <div className="p-3 bg-white rounded-xl border border-amber-200 text-xs font-bold text-amber-900">
                    Hook Delivery Accuracy: <strong>{repeatMatchScore}%</strong>
                    {repeatMatchScore >= 45 ? " — Excellent projection and energy! 🌟" : " — Keep your volume high and articulate clearly!"}
                  </div>
                )}
              </div>
            )}

            {/* STEP: STAR METHOD (EXECUTIVE BEHAVIORAL FRAMEWORK) */}
            {currentStep.type === "star_method" && (
              <div className="p-6 rounded-2xl bg-indigo-50/70 border border-indigo-200 space-y-4">
                <span className="text-xs font-black text-indigo-900 uppercase tracking-wider flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-indigo-600" />
                  STAR Behavioral Framework Practice {hasMultipleDrills && `(Drill ${safeDrillIdx + 1})`}
                </span>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs font-bold">
                  <div className="p-2.5 bg-white rounded-xl border border-indigo-100">
                    <span className="text-indigo-600 block">S</span>
                    <span className="text-slate-700 text-[11px]">Situation</span>
                  </div>
                  <div className="p-2.5 bg-white rounded-xl border border-indigo-100">
                    <span className="text-indigo-600 block">T</span>
                    <span className="text-slate-700 text-[11px]">Task</span>
                  </div>
                  <div className="p-2.5 bg-white rounded-xl border border-indigo-100">
                    <span className="text-indigo-600 block">A</span>
                    <span className="text-slate-700 text-[11px]">Action</span>
                  </div>
                  <div className="p-2.5 bg-white rounded-xl border border-indigo-100">
                    <span className="text-indigo-600 block">R</span>
                    <span className="text-slate-700 text-[11px]">Result</span>
                  </div>
                </div>

                <div className="p-4 bg-white rounded-xl border border-indigo-200 space-y-1">
                  <span className="text-[11px] font-bold text-indigo-600 uppercase">Framework Prompt:</span>
                  <p className="text-xs sm:text-sm font-semibold text-slate-800">{currentPrompt}</p>
                </div>

                {currentSampleAnswer && (
                  <div className="p-3 bg-white/80 rounded-xl border border-indigo-100 text-xs text-slate-700">
                    <strong className="text-indigo-900">Reference Model: </strong>"{currentSampleAnswer}"
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <button
                    onClick={() => isListening ? stopRecordingSpeech() : startRecordingSpeech()}
                    className={`px-6 py-2.5 rounded-xl font-extrabold text-xs flex items-center gap-2 transition-all active:scale-95 ${
                      isListening ? "bg-rose-600 text-white animate-pulse" : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm"
                    }`}
                  >
                    <Mic className="w-4 h-4" />
                    <span>{isListening ? "Listening to your STAR answer..." : "Deliver STAR Response"}</span>
                  </button>

                  {userSpokenText.trim().length > 0 && (
                    <button
                      onClick={() => handleEvaluateSpeakStage()}
                      disabled={speakCritiqueLoading || isListening}
                      className="px-6 py-2.5 rounded-xl font-black text-xs bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2 shadow-sm transition-all active:scale-95"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>{speakCritiqueLoading ? "Evaluating STAR Response..." : "Get AI Feedback on STAR"}</span>
                    </button>
                  )}
                </div>

                {userSpokenText && (
                  <div className="p-3 bg-white rounded-xl border border-indigo-200 text-xs space-y-1">
                    <span className="font-bold text-slate-400">Captured Response:</span>
                    <p className="font-semibold text-slate-800">"{userSpokenText}"</p>
                  </div>
                )}
              </div>
            )}

            {/* STEP 4: INTERACT (HANDS-FREE LIVE VOICE LOOP & SPOKEN DIALOGUE) */}
            {currentStep.type === "interact" && (
              <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white border border-indigo-800/40 space-y-5 shadow-xl">
                {/* HEADER & HANDS-FREE TOGGLE */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
                  <div className="flex items-center gap-2">
                    <span className="p-2 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      <Sparkles className="w-4 h-4 text-indigo-400" />
                    </span>
                    <div>
                      <h4 className="text-sm font-extrabold text-white">Live Spoken English Conversation</h4>
                      <p className="text-xs text-indigo-200">Focused on natural English speaking, idioms, and cadence</p>
                    </div>
                  </div>

                  {/* HANDS-FREE STATUS & TOGGLE */}
                  <div className="flex items-center gap-2">
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
                      <span>Hands-Free Auto-Voice: {isHandsFreeMode ? "ACTIVE" : "PAUSED"}</span>
                    </button>
                  </div>
                </div>

                {/* DYNAMIC HANDS-FREE STATUS BAR */}
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-xs font-bold">
                  <div className="flex items-center gap-2.5">
                    {isAiSpeaking ? (
                      <>
                        <div className="w-2.5 h-2.5 rounded-full bg-indigo-400 animate-ping" />
                        <span className="text-indigo-300">🔊 Coach is speaking aloud...</span>
                      </>
                    ) : isCoachThinking ? (
                      <>
                        <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
                        <span className="text-amber-300">⚡ Coach is formulating response...</span>
                      </>
                    ) : isListening ? (
                      <>
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-emerald-300">🎙️ Listening to you... Speak freely (auto-sends on pause)</span>
                      </>
                    ) : (
                      <>
                        <div className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                        <span className="text-slate-300">Microphone standby. Click mic below or say hello!</span>
                      </>
                    )}
                  </div>

                  {isHandsFreeMode && (
                    <span className="text-[11px] text-indigo-300/80 font-normal hidden sm:inline">
                      Auto-detects sentence pauses (1.1s)
                    </span>
                  )}
                </div>

                {currentCoachStarter && dialogueMessages.length === 0 && (
                  <div className="p-4 rounded-xl bg-white/10 border border-white/10 flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <span className="text-[11px] font-extrabold text-amber-300 uppercase">Coach Opening Question {hasMultipleDrills && `(Drill ${safeDrillIdx + 1})`}:</span>
                      <p className="text-sm font-semibold text-white">"{currentCoachStarter}"</p>
                    </div>
                    <button
                      onClick={() => speakText(currentCoachStarter)}
                      disabled={isAiSpeaking}
                      className="p-2 rounded-lg bg-white/15 text-white hover:bg-white/25 border border-white/10"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* DIALOGUE BUBBLES */}
                <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                  {dialogueMessages.map((msg, i) => (
                    <div key={i} className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}>
                      {msg.correction && (
                        <div className="mb-1 text-[11px] font-bold text-amber-300 bg-amber-500/20 border border-amber-400/40 px-3 py-1 rounded-xl shadow-xs">
                          💡 Spoken Tip: {msg.correction}
                        </div>
                      )}
                      <div className={`p-3.5 rounded-2xl max-w-md text-xs font-semibold leading-relaxed ${
                        msg.sender === "user"
                          ? "bg-indigo-600 text-white rounded-tr-none shadow-md"
                          : "bg-white/10 border border-white/15 text-white rounded-tl-none shadow-xs"
                      }`}>
                        {msg.text}
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

                {/* LIVE SPEECH TRANSCRIPTION PREVIEW */}
                {userSpokenText && (
                  <div className="p-3 bg-white/10 rounded-xl border border-white/15 text-xs flex items-center justify-between gap-2">
                    <span className="text-slate-300 truncate">
                      <strong className="text-emerald-300">You: </strong>"{userSpokenText}"
                    </span>
                    {isHandsFreeMode && (
                      <span className="text-[10px] text-amber-300 shrink-0 font-bold animate-pulse">
                        Auto-sending on pause...
                      </span>
                    )}
                  </div>
                )}

                {/* CONTROLS (VOICE + TEXT FALLBACK) */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => isListening ? stopRecordingSpeech() : startRecordingSpeech({ continuous: true })}
                    className={`p-3 rounded-2xl font-bold text-xs flex items-center justify-center transition-all ${
                      isListening
                        ? "bg-rose-500 text-white animate-pulse"
                        : "bg-indigo-600 text-white hover:bg-indigo-500"
                    }`}
                    title={isListening ? "Pause Listening" : "Start Speaking"}
                  >
                    <Mic className="w-5 h-5" />
                  </button>
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
                    className="px-5 py-3 rounded-2xl bg-indigo-500 hover:bg-indigo-600 text-white font-extrabold text-xs shadow-sm transition-all disabled:opacity-30"
                  >
                    Send
                  </button>
                </div>
              </div>
            )}

            {/* STEP 5: PRESENT (LRSP 1-MINUTE PUBLIC SPEAKING STAGE) */}
            {currentStep.type === "present" && (
              <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950 text-white border border-indigo-800/40 space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Trophy className="w-4 h-4 text-amber-400" />
                    1-Minute Live Public Speaking Stage
                  </span>
                  <div className="flex items-center gap-1.5 text-xs font-mono font-bold bg-white/10 px-3 py-1.5 rounded-full border border-white/10">
                    <Clock className="w-3.5 h-3.5 text-amber-300" />
                    <span>{speakingTimer}s Remaining</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-xs text-indigo-200">Your Assigned Topic:</span>
                  <h3 className="text-xl font-extrabold text-white">
                    "{currentStep.topic || "Why Curiosity is the Greatest Teacher"}"
                  </h3>
                </div>

                {/* ANIMATED PODIUM WAVE VISUALIZER */}
                {isTimerActive && (
                  <div className="flex items-center justify-center gap-1.5 py-3">
                    <div className="w-1.5 h-6 bg-emerald-400 rounded-full animate-bounce" />
                    <div className="w-1.5 h-10 bg-emerald-300 rounded-full animate-pulse" />
                    <div className="w-1.5 h-14 bg-emerald-400 rounded-full animate-bounce" />
                    <div className="w-1.5 h-8 bg-emerald-300 rounded-full animate-pulse" />
                    <div className="w-1.5 h-5 bg-emerald-400 rounded-full animate-bounce" />
                    <span className="text-xs font-bold text-emerald-300 ml-2">Live On Stage — Continuous Speech Recording</span>
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-3">
                  {!isTimerActive ? (
                    <button
                      onClick={handleStartPublicSpeaking}
                      className="px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs shadow-lg transition-all active:scale-95 flex items-center gap-2"
                    >
                      <Play className="w-4 h-4 fill-current" />
                      <span>Start 60s Speech Stage</span>
                    </button>
                  ) : (
                    <button
                      onClick={handleFinishPublicSpeaking}
                      className="px-6 py-3 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-extrabold text-xs shadow-lg transition-all active:scale-95 flex items-center gap-2 animate-pulse"
                    >
                      <MicOff className="w-4 h-4" />
                      <span>Finish & Request AI Critique</span>
                    </button>
                  )}
                </div>

                {userSpokenText && (
                  <div className="p-4 rounded-xl bg-white/10 border border-white/10 text-xs space-y-1">
                    <span className="text-indigo-200 font-bold">Captured Speech Transcript:</span>
                    <p className="text-white font-medium leading-relaxed">"{userSpokenText}"</p>
                  </div>
                )}

                {/* AI CRITIQUE REPORT */}
                {critiqueLoading && (
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center gap-3 text-xs text-indigo-200 font-bold">
                    <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                    <span>AI adjudicator is evaluating filler words, pacing, and grammatical poise...</span>
                  </div>
                )}

                {speakingCritique && (
                  <div className="p-6 rounded-2xl bg-white text-slate-900 border border-indigo-100 shadow-xl space-y-4 animate-in zoom-in-95">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <span className="text-xs font-black uppercase text-indigo-600 tracking-wider">
                        Adjudicator Scorecard
                      </span>
                      <div className="flex items-center gap-3 text-xs font-bold">
                        <span className="text-rose-600">Fillers: {speakingCritique.filler_count}</span>
                        <span className="text-indigo-600">Grammar: {speakingCritique.grammar_score}%</span>
                        <span className="text-emerald-600 font-black">Overall: {speakingCritique.overall_score}/100</span>
                      </div>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div>
                        <span className="font-bold text-rose-700">What To Improve:</span>
                        <p className="text-slate-600 mt-0.5">{speakingCritique.what_was_wrong}</p>
                      </div>
                      <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-100">
                        <span className="font-extrabold text-indigo-900">Live Spoken Correction:</span>
                        <p className="text-indigo-950 font-semibold mt-0.5 italic">"{speakingCritique.live_correction}"</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* NEW STEP: INTERACTIVE MINI-GAME STAGE */}
            {currentStep.type === "game" && (
              <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-900 to-purple-950 text-white border border-indigo-700/50 space-y-5 shadow-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black uppercase tracking-wider bg-amber-400 text-slate-950 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5 fill-current" />
                      Gamified Spoken Drill
                    </span>
                    <span className="text-xs font-bold text-indigo-200">
                      {currentStep.game_type === "word_sprint" ? "Word Sprint" : currentStep.game_type === "sentence_fixer" ? "Sentence Fixer" : "Articulation Sprint"}
                    </span>
                  </div>
                  {gameCompleted && (
                    <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-extrabold border border-emerald-500/30 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      Activity Cleared!
                    </span>
                  )}
                </div>

                {/* GAME TYPE 1: WORD SPRINT */}
                {currentStep.game_type === "word_sprint" && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-xs sm:text-sm text-indigo-100 font-medium">
                        Speak aloud as many adjectives related to education as possible! Target: at least 2 keywords.
                      </p>
                      <span className="font-mono text-xs font-black bg-white/10 px-3 py-1 rounded-full">
                        ⏱️ {gameTimer}s
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {(currentStep.target_keywords || []).map((kw, i) => {
                        const isFound = collectedKeywords.includes(kw.toLowerCase());
                        return (
                          <span 
                            key={i} 
                            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold border transition-all ${
                              isFound 
                                ? "bg-emerald-500 text-slate-950 border-emerald-400 scale-105 shadow-md"
                                : "bg-white/10 text-indigo-200 border-white/10"
                            }`}
                          >
                            {kw} {isFound ? "⭐" : ""}
                          </span>
                        );
                      })}
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                      {!isGameActive ? (
                        <button
                          onClick={handleStartWordSprint}
                          className="px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs shadow-md transition-all active:scale-95"
                        >
                          Start 30s Word Sprint
                        </button>
                      ) : (
                        <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                          <Mic className="w-4 h-4 animate-bounce" />
                          <span>Listening for words... speak quickly!</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* GAME TYPE 2: SENTENCE FIXER */}
                {currentStep.game_type === "sentence_fixer" && (
                  <div className="space-y-4">
                    <div className="p-4 bg-white/10 rounded-xl border border-white/15 space-y-1">
                      <span className="text-[11px] font-bold text-rose-300 uppercase">Flawed Sentence:</span>
                      <p className="text-base font-extrabold text-rose-100">"{currentStep.flawed_sentence}"</p>
                    </div>

                    <div className="space-y-2">
                      <span className="text-xs text-indigo-200 font-bold">Your Task:</span>
                      <p className="text-xs text-slate-300">Speak the grammatically corrected sentence into your microphone.</p>
                      <button
                        onClick={handleSentenceFixVoiceCheck}
                        className={`px-6 py-2.5 rounded-xl font-extrabold text-xs flex items-center gap-2 transition-all active:scale-95 ${
                          isListening ? "bg-rose-500 text-white animate-pulse" : "bg-emerald-500 text-slate-950 hover:bg-emerald-400 font-black"
                        }`}
                      >
                        <Mic className="w-4 h-4" />
                        <span>{isListening ? "Listening... Speak the fix" : "Speak The Corrected Sentence"}</span>
                      </button>
                    </div>

                    {sentenceFixResult && (
                      <div className={`p-4 rounded-xl border text-xs font-bold ${
                        sentenceFixResult.success ? "bg-emerald-500/20 text-emerald-200 border-emerald-500/40" : "bg-rose-500/20 text-rose-200 border-rose-500/40"
                      }`}>
                        {sentenceFixResult.message}
                      </div>
                    )}
                  </div>
                )}

                {/* GAME TYPE 3: TONGUE TWISTER SPRINT */}
                {currentStep.game_type === "tongue_twister" && (
                  <div className="space-y-4">
                    <div className="p-4 bg-white/10 rounded-xl border border-white/15 space-y-1">
                      <span className="text-[11px] font-bold text-amber-300 uppercase">Tongue Twister:</span>
                      <p className="text-base font-extrabold text-white">"{currentStep.target_phrase}"</p>
                    </div>
                    <button
                      onClick={handleRepeatVoiceCapture}
                      className={`px-6 py-2.5 rounded-xl font-extrabold text-xs flex items-center gap-2 transition-all active:scale-95 ${
                        isListening ? "bg-rose-500 text-white animate-pulse" : "bg-amber-400 text-slate-950 font-black"
                      }`}
                    >
                      <Mic className="w-4 h-4" />
                      <span>{isListening ? "Listening... Speak fast!" : "Attempt Speed Challenge"}</span>
                    </button>
                    {repeatMatchScore !== null && (
                      <div className="text-xs font-bold text-indigo-200">
                        Accuracy: <strong className="text-white">{repeatMatchScore}%</strong>
                        {repeatMatchScore >= 50 ? " — Challenge Passed! 🌟" : " — Try speaking a little clearer!"}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* STEP 6: CAPSTONE FINAL INTERACTION */}
            {currentStep.type === "capstone" && (
              <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-4">
                <span className="text-xs font-extrabold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-emerald-600" />
                  Final Spoken Capstone Interaction
                </span>
                <p className="text-sm font-bold text-emerald-950 leading-relaxed">
                  "{currentStep.coach_starter}"
                </p>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={() => isListening ? stopRecordingSpeech() : startRecordingSpeech()}
                    className={`px-6 py-2.5 rounded-xl font-extrabold text-xs flex items-center gap-2 transition-all active:scale-95 ${
                      isListening ? "bg-rose-600 text-white animate-pulse" : "bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm"
                    }`}
                  >
                    <Mic className="w-4 h-4" />
                    <span>{isListening ? "Listening to your Capstone..." : "Deliver Capstone Speech"}</span>
                  </button>
                </div>

                {userSpokenText && (
                  <div className="p-4 bg-white rounded-xl border border-emerald-200 text-xs space-y-2">
                    <span className="font-bold text-slate-500">Your Capstone Transcript:</span>
                    <p className="font-semibold text-slate-900">"{userSpokenText}"</p>
                    <button
                      onClick={handleFinalizeCapstone}
                      className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-md transition-all active:scale-95"
                    >
                      Generate Official Spoken Mastery Report Card
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* FOOTER BUTTONS WITH ANTI-SKIP PREREQUISITE ENFORCEMENT */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-between border-t border-slate-100 gap-3">
              <button
                disabled={activeStepIdx === 0}
                onClick={() => setActiveStepIdx(prev => Math.max(0, prev - 1))}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none"
              >
                Previous Step
              </button>

              <div className="flex flex-wrap items-center gap-3">
                {hasMultipleDrills && safeDrillIdx < practiceItems.length - 1 && (
                  <button
                    onClick={() => switchDrill(safeDrillIdx + 1)}
                    className="px-5 py-2.5 rounded-xl text-xs font-black bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 shadow-xs flex items-center gap-1.5 transition-all active:scale-95"
                  >
                    <span>Next Practice Drill ({safeDrillIdx + 2}/{practiceItems.length})</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}

                {!canAdvanceStep() && (
                  <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-3 py-1 rounded-xl border border-amber-200">
                    {currentStep.type === "listen" && "🎧 Listen to the model audio first"}
                    {currentStep.type === "repeat" && "🎙️ Repeat the phrase with >= 45% accuracy"}
                    {currentStep.type === "speak" && "💬 Speak your answer & get AI feedback"}
                    {currentStep.type === "error_fix" && "🛠️ Speak the corrected sentence aloud"}
                    {currentStep.type === "hook_delivery" && "🔥 Deliver the 30s grabber hook"}
                    {currentStep.type === "star_method" && "⭐ Deliver your STAR response"}
                    {currentStep.type === "interact" && "🤝 Complete at least 1 spoken exchange"}
                    {currentStep.type === "present" && "🎤 Deliver your speech & request critique"}
                    {currentStep.type === "game" && "🎮 Clear the activity to unlock next stage"}
                    {currentStep.type === "capstone" && "🎓 Speak your capstone speech"}
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
                  <span>{isLastStep ? "Complete Module" : "Mark Step Complete & Advance"}</span>
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
