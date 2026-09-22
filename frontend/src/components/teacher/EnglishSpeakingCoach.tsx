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
  Video,
  VideoOff,
  SwitchCamera,
  Eye,
  Smile,
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
  category: "hindi" | "indian-english" | "global-english";
}

const COACH_VOICES: VoiceOption[] = [
  // 1. Authentic Hindi Voices (Native Indian Hindi Accent)
  {
    code: "hi-IN-SwaraNeural",
    name: "Swara (स्वर - हिंदी)",
    gender: "Female",
    lang: "hi-IN",
    accent: "Authentic Hindi Accent 🇮🇳",
    avatar: "👩",
    category: "hindi"
  },
  {
    code: "hi-IN-MadhurNeural",
    name: "Madhur (मधुर - हिंदी)",
    gender: "Male",
    lang: "hi-IN",
    accent: "Natural Hindi Accent 🇮🇳",
    avatar: "👨",
    category: "hindi"
  },
  // 2. Realistic Indian English Voices (Educator Accent)
  {
    code: "en-IN-NeerjaNeural",
    name: "Neerja (Indian English)",
    gender: "Female",
    lang: "en-IN",
    accent: "Warm Indian Educator 🇮🇳",
    avatar: "👩",
    category: "indian-english"
  },
  {
    code: "en-IN-PrabhatNeural",
    name: "Prabhat (Indian English)",
    gender: "Male",
    lang: "en-IN",
    accent: "Crisp Indian Educator 🇮🇳",
    avatar: "👨",
    category: "indian-english"
  },
  // 3. Realistic Global Fluent English Voices
  {
    code: "en-US-JennyNeural",
    name: "Jenny (US English)",
    gender: "Female",
    lang: "en-US",
    accent: "Natural Fluent Accent 🇺🇸",
    avatar: "👩",
    category: "global-english"
  },
  {
    code: "en-US-GuyNeural",
    name: "Guy (US English)",
    gender: "Male",
    lang: "en-US",
    accent: "Conversational Fluent 🇺🇸",
    avatar: "👨",
    category: "global-english"
  },
  {
    code: "en-GB-SoniaNeural",
    name: "Sonia (British English)",
    gender: "Female",
    lang: "en-GB",
    accent: "Articulate Academic 🇬🇧",
    avatar: "👩",
    category: "global-english"
  }
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
    starterDisplay: "Hello! I am Devgya English Coach. What classroom instruction would you like to practice giving your students?",
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
    starterDisplay: "Hello! I am Devgya English Coach. In PTMs, always balance positive reinforcement with constructive guidance. What would you like to say first?",
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
    starterDisplay: "Hello! I am Devgya English Coach. Speaking with school leadership requires confidence and structured points. How would you introduce your proposal?",
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
    starterDisplay: "Hello! I am Devgya English Coach. Continuous conversation is the fastest way to build spoken fluency. How was your day in class?",
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
    starterDisplay: "Hello! I am Devgya English Coach. Let us polish your phonetics and lip movement! Repeat after me when ready.",
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

interface LiveFaceState {
  hasFace: boolean;
  expression: string;
  emoji: string;
  label: string;
}

// Global dynamic face-api loader singleton
let faceapi: any = null;
let faceModelsLoaded = false;
let modelLoadingPromise: Promise<boolean> | null = null;

async function loadFaceExpressionModels(): Promise<boolean> {
  if (typeof window === "undefined") return false;
  if (faceModelsLoaded) return true;
  if (modelLoadingPromise) return modelLoadingPromise;

  modelLoadingPromise = (async () => {
    try {
      if (!faceapi) {
        faceapi = await import("@vladmandic/face-api");
      }
      if (!faceapi.nets.tinyFaceDetector.isLoaded) {
        await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
      }
      if (!faceapi.nets.faceExpressionNet.isLoaded) {
        await faceapi.nets.faceExpressionNet.loadFromUri("/models");
      }
      faceModelsLoaded = true;
      return true;
    } catch (err) {
      console.warn("Face expression models loading notice:", err);
      return false;
    }
  })();

  return modelLoadingPromise;
}

export function EnglishSpeakingCoach() {
  const { user } = useAppStore();

  // Settings
  const [selectedVoice, setSelectedVoice] = useState<string>("en-IN-NeerjaNeural");
  const [languageMode, setLanguageMode] = useState<"english" | "hindi" | "hinglish">("english");
  const [activeScenario, setActiveScenario] = useState<ScenarioTopic>(PRACTICE_SCENARIOS[0]);

  // Switch language mode and automatically adapt voice + greeting
  const handleLanguageChange = (newMode: "english" | "hindi" | "hinglish") => {
    setLanguageMode(newMode);

    if (newMode === "hindi") {
      // Auto-assign authentic Hindi neural voice
      setSelectedVoice(prev => {
        if (prev.startsWith("hi-")) return prev;
        const isMale = prev.includes("Guy") || prev.includes("Prabhat") || prev.includes("Madhur");
        return isMale ? "hi-IN-MadhurNeural" : "hi-IN-SwaraNeural";
      });

      // Update greeting if user hasn't started talking yet
      if (conversationHistory.length === 0) {
        setLiveAiSpeech(`नमस्ते! मैं आपका देवज्ञ इंग्लिश स्पीकिंग कोच हूँ। आज हम ${activeScenario.title} का अभ्यास करेंगे। जब भी आप तैयार हों, बोलना शुरू करें!`);
      }
    } else if (newMode === "hinglish") {
      setSelectedVoice(prev => {
        if (prev.startsWith("en-IN-")) return prev;
        return "en-IN-NeerjaNeural";
      });
      if (conversationHistory.length === 0) {
        setLiveAiSpeech(`Hello! Main aapka Devgya English Coach hoon. Aaj hum ${activeScenario.title} practice karenge. Jab aap ready hon, boliye!`);
      }
    } else {
      // Pure English
      setSelectedVoice(prev => {
        if (!prev.startsWith("hi-")) return prev;
        return "en-IN-NeerjaNeural";
      });
      if (conversationHistory.length === 0) {
        setLiveAiSpeech(`Hello! I am your Devgya English Coach. We are practicing ${activeScenario.title}. Speak whenever you are ready!`);
      }
    }
  };

  // Conversational Session State (Like Gemini Live)
  const [isLiveActive, setIsLiveActive] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState<boolean>(false);
  const [isAiThinking, setIsAiThinking] = useState<boolean>(false);
  const [soundMuted, setSoundMuted] = useState<boolean>(false);
  const [showTextKeyboard, setShowTextKeyboard] = useState<boolean>(false);
  const [showHistoryModal, setShowHistoryModal] = useState<boolean>(false);
  const [showScenarioModal, setShowScenarioModal] = useState<boolean>(false);
  const [micPermissionError, setMicPermissionError] = useState<string | null>(null);

  // Live Camera Vision States
  const [cameraActive, setCameraActive] = useState<boolean>(true);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);

  // Real-time Facial Perception State
  const [liveFace, setLiveFace] = useState<LiveFaceState>({
    hasFace: true,
    expression: "neutral",
    emoji: "🎯",
    label: "Focused & Attentive"
  });
  const liveFaceRef = useRef<LiveFaceState>({
    hasFace: true,
    expression: "neutral",
    emoji: "🎯",
    label: "Focused & Attentive"
  });

  // Multi-Turn Conversation History Context
  const [conversationId, setConversationId] = useState<string>("");
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
  const turnBaseSpeechRef = useRef<string>("");
  const silenceTimerRef = useRef<any>(null);
  const autoRestartTimerRef = useRef<any>(null);
  const audioQueueRef = useRef<string[]>([]);
  const isPlayingQueueRef = useRef<boolean>(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const activeUtteranceRef = useRef<any>(null);
  const cachedVoicesRef = useRef<SpeechSynthesisVoice[]>([]);

  // Pre-warm browser voices for instant 0-delay playback
  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      const loadVoices = () => {
        try {
          const v = window.speechSynthesis.getVoices();
          if (v && v.length > 0) cachedVoicesRef.current = v;
        } catch {}
      };
      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  // Keep refs synced
  useEffect(() => { isLiveActiveRef.current = isLiveActive; }, [isLiveActive]);
  useEffect(() => { isListeningRef.current = isListening; }, [isListening]);
  useEffect(() => { isAiSpeakingRef.current = isAiSpeaking; }, [isAiSpeaking]);
  useEffect(() => { isAiThinkingRef.current = isAiThinking; }, [isAiThinking]);
  useEffect(() => { soundMutedRef.current = soundMuted; }, [soundMuted]);

  // Clean & Deduplicate Speech Recognition Transcript to prevent stutter / repeats ("hlo hlo hlo" -> "hlo")
  const cleanSpeechTranscript = (rawText: string): string => {
    if (!rawText) return "";
    const words = rawText.trim().split(/\s+/).filter(Boolean);
    if (words.length === 0) return "";

    const dedupedWords: string[] = [];
    for (let i = 0; i < words.length; i++) {
      const w = words[i];
      const prev1 = dedupedWords[dedupedWords.length - 1];
      const prev2 = dedupedWords[dedupedWords.length - 2];
      const cleanW = w.toLowerCase().replace(/[^\p{L}\p{N}]/gu, "");
      const clean1 = prev1 ? prev1.toLowerCase().replace(/[^\p{L}\p{N}]/gu, "") : "";
      const clean2 = prev2 ? prev2.toLowerCase().replace(/[^\p{L}\p{N}]/gu, "") : "";

      const isValidDouble = ["had", "that", "it"].includes(cleanW);
      if (cleanW && cleanW === clean1) {
        if (!isValidDouble || cleanW === clean2) {
          continue;
        }
      }
      dedupedWords.push(w);
    }

    let text = dedupedWords.join(" ");

    for (let n = 2; n <= 4; n++) {
      const arr = text.split(/\s+/);
      if (arr.length >= n * 2) {
        const tail = arr.slice(-n).join(" ").toLowerCase();
        const prior = arr.slice(-2 * n, -n).join(" ").toLowerCase();
        if (tail === prior) {
          text = arr.slice(0, -n).join(" ");
        }
      }
    }

    return text.trim();
  };

  // Clean Text Helper for TTS: strips markdown, better phrasing lines, tips, quotes and emojis
  const cleanForSpeech = (raw: string): string => {
    if (!raw) return "";
    let clean = raw;
    clean = clean.replace(/✨?\s*\*?Better(?:\s+Phrasing)?\*?:\s*["“]?([^"”\n\r]+)["”]?/gi, "");
    clean = clean.replace(/💡?\s*\*?Tip\*?:\s*([^\n\r]+)/gi, "");
    clean = clean.replace(/\*\*([^*]+)\*\*/g, "$1");
    clean = clean.replace(/\*([^*]+)\*/g, "$1");
    clean = clean.replace(/`([^`]+)`/g, "$1");
    clean = clean.replace(/#+\s+/g, "");
    clean = clean.replace(/^[-*•]\s+/gm, "");
    clean = clean.replace(/["“]([^"”]+)["”]/g, "$1");
    clean = clean.replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}]/gu, "");
    return clean.replace(/\s+/g, " ").trim();
  };

  // Camera Management
  const startCamera = useCallback(async (mode: "user" | "environment" = facingMode) => {
    try {
      if (cameraStreamRef.current) {
        cameraStreamRef.current.getTracks().forEach(t => t.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: mode, width: { ideal: 480 }, height: { ideal: 480 } },
        audio: false
      });
      cameraStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }
      setCameraActive(true);
      setFacingMode(mode);
    } catch (err) {
      console.warn("Camera access failed:", err);
      setCameraActive(false);
    }
  }, [facingMode]);

  const stopCamera = useCallback(() => {
    if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach(t => t.stop());
      cameraStreamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
    const offState = { hasFace: false, expression: "off", emoji: "📷", label: "Camera Off" };
    liveFaceRef.current = offState;
    setLiveFace(offState);
  }, []);

  const switchCamera = () => {
    const next = facingMode === "user" ? "environment" : "user";
    startCamera(next);
  };

  // Instant Snapshot Grabber for Vision (ultra-light 240x240, ~4KB for instant transmission)
  const captureLiveFrameBlob = (): Promise<Blob | null> => {
    return new Promise((resolve) => {
      if (!videoRef.current || !cameraActive) {
        resolve(null);
        return;
      }
      const video = videoRef.current;
      if (video.videoWidth === 0 || video.videoHeight === 0) {
        resolve(null);
        return;
      }
      try {
        const canvas = document.createElement("canvas");
        const dim = 240;
        canvas.width = dim;
        canvas.height = dim;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(null);
          return;
        }
        ctx.drawImage(video, 0, 0, dim, dim);
        canvas.toBlob((blob) => {
          resolve(blob);
        }, "image/jpeg", 0.45);
      } catch {
        resolve(null);
      }
    });
  };

  // Continuous real-time facial expression perception loop (every 450ms)
  useEffect(() => {
    if (!cameraActive) {
      const offState = { hasFace: false, expression: "off", emoji: "📷", label: "Camera Off" };
      liveFaceRef.current = offState;
      setLiveFace(offState);
      return;
    }

    let isSubscribed = true;
    loadFaceExpressionModels();

    const intervalId = setInterval(async () => {
      if (!isSubscribed || !videoRef.current || !cameraActive) return;
      const video = videoRef.current;
      if (video.readyState < 2 || video.videoWidth === 0 || video.videoHeight === 0) return;

      try {
        if (!faceModelsLoaded) {
          const ok = await loadFaceExpressionModels();
          if (!ok) return;
        }

        if (faceapi && faceModelsLoaded && isSubscribed) {
          const detection = await faceapi
            .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions({ inputSize: 160, scoreThreshold: 0.35 }))
            .withFaceExpressions();

          if (!isSubscribed) return;

          if (detection && detection.expressions) {
            const exp = detection.expressions;
            let dominant = "neutral";
            let emoji = "🎯";
            let label = "Focused & Attentive";

            if (exp.happy > 0.28) {
              dominant = "happy";
              emoji = "😊";
              label = "Warm Smile";
            } else if (exp.surprised > 0.35) {
              dominant = "surprised";
              emoji = "😲";
              label = "Expressive & Engaging";
            } else if ((exp.sad || 0) + (exp.fearful || 0) > 0.32) {
              dominant = "thoughtful";
              emoji = "🤔";
              label = "Thoughtful & Intent";
            } else if (exp.neutral > 0.35) {
              dominant = "neutral";
              emoji = "🎯";
              label = "Focused & Attentive";
            }

            const state: LiveFaceState = {
              hasFace: true,
              expression: dominant,
              emoji,
              label
            };
            liveFaceRef.current = state;
            setLiveFace(state);
          } else {
            const state: LiveFaceState = {
              hasFace: false,
              expression: "searching",
              emoji: "👀",
              label: "Position Face in Frame"
            };
            liveFaceRef.current = state;
            setLiveFace(state);
          }
        }
      } catch {
        // Fallback gracefully on individual frame glitch
      }
    }, 450);

    return () => {
      isSubscribed = false;
      clearInterval(intervalId);
    };
  }, [cameraActive]);

  // Parse feedback from coach response
  const parseFeedback = (text: string, originalText: string) => {
    const phrasingMatch = text.match(/✨?\s*\*?Better(?:\s+Phrasing)?\*?:\s*["“]?([^"”\n\r]+)["”]?/i);
    const tipMatch = text.match(/💡?\s*\*?Tip\*?:\s*([^\n\r]+)/i);

    if (phrasingMatch || tipMatch) {
      const polished = (phrasingMatch?.[1] || "").replace(/^["“]|["”]$/g, "").trim();
      const tip = (tipMatch?.[1] || "").trim();
      if (polished || tip) {
        setLatestFeedback({
          originalText,
          polishedPhrasing: polished || undefined,
          pedagogicalTip: tip || undefined
        });
      }
    }
  };

  // Ultra-Fast TTS Audio Player for Single Sentence with Race-Condition Guard
  const playCoachAudio = useCallback((textToSpeak: string, onFinish?: () => void) => {
    // If call is ended, immediately halt any audio playback
    if (!isLiveActiveRef.current && !showTextKeyboard) {
      setIsAiSpeaking(false);
      isAiSpeakingRef.current = false;
      return;
    }

    if (soundMutedRef.current) {
      setIsAiSpeaking(false);
      isAiSpeakingRef.current = false;
      onFinish?.();
      return;
    }

    if (currentAudioRef.current) {
      currentAudioRef.current.onplay = null;
      currentAudioRef.current.onended = null;
      currentAudioRef.current.onerror = null;
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }

    const cleanText = cleanForSpeech(textToSpeak);
    if (!cleanText || cleanText.length < 2) {
      setIsAiSpeaking(false);
      isAiSpeakingRef.current = false;
      onFinish?.();
      return;
    }

    setIsAiSpeaking(true);
    isAiSpeakingRef.current = true;
    stopListening(); // Pause mic while coach speaks

    let hasHandledFinish = false;
    const handleFinished = () => {
      if (hasHandledFinish) return;
      hasHandledFinish = true;

      if (currentAudioRef.current) {
        currentAudioRef.current.onplay = null;
        currentAudioRef.current.onended = null;
        currentAudioRef.current.onerror = null;
        currentAudioRef.current = null;
      }

      if (!isLiveActiveRef.current && !showTextKeyboard) {
        setIsAiSpeaking(false);
        isAiSpeakingRef.current = false;
        return;
      }

      if (onFinish) {
        onFinish();
      } else {
        setIsAiSpeaking(false);
        isAiSpeakingRef.current = false;
        // Automatic hands-free listening resume once AI finishes speaking
        if (isLiveActiveRef.current && !isAiThinkingRef.current) {
          setTimeout(() => {
            if (isLiveActiveRef.current && !isAiSpeakingRef.current && !isAiThinkingRef.current) {
              startListening();
            }
          }, 300);
        }
      }
    };

    try {
      // Instant Gemini Live Speech: use native device Web Speech API for immediate zero-latency playback
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        fallbackSpeechSynthesis(cleanText, handleFinished);
        return;
      }

      const isDevanagari = /[\u0900-\u097F]/.test(cleanText);
      const isHindiTarget = languageMode === "hindi" || isDevanagari;

      // Smart Accent Routing: ensure native Hindi Neural voice is always used for Hindi/Devanagari
      let voiceToUse = selectedVoice;
      if (isHindiTarget && !voiceToUse.startsWith("hi-")) {
        const isMale = voiceToUse.includes("Guy") || voiceToUse.includes("Prabhat") || voiceToUse.includes("Madhur");
        voiceToUse = isMale ? "hi-IN-MadhurNeural" : "hi-IN-SwaraNeural";
      }

      const rateParam = isHindiTarget ? "%2B5%25" : "%2B8%25";
      const streamUrl = `${getApiBase()}/tts/speak?voice=${encodeURIComponent(voiceToUse)}&text=${encodeURIComponent(cleanText)}&rate=${rateParam}`;
      const audio = new Audio(streamUrl);
      currentAudioRef.current = audio;

      audio.onplay = () => {
        setIsAiSpeaking(true);
        isAiSpeakingRef.current = true;
      };

      audio.onended = () => {
        handleFinished();
      };

      audio.onerror = () => {
        if (!hasHandledFinish) {
          fallbackSpeechSynthesis(cleanText, handleFinished);
        }
      };

      audio.play().catch(() => {
        if (!hasHandledFinish) {
          fallbackSpeechSynthesis(cleanText, handleFinished);
        }
      });
    } catch {
      fallbackSpeechSynthesis(cleanText, handleFinished);
    }
  }, [selectedVoice, languageMode]);

  const fallbackSpeechSynthesis = (text: string, onFinish?: () => void) => {
    if (!isLiveActiveRef.current && !showTextKeyboard) {
      setIsAiSpeaking(false);
      isAiSpeakingRef.current = false;
      return;
    }

    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      const isDevanagari = /[\u0900-\u097F]/.test(text);
      const isHindi = languageMode === "hindi" || isDevanagari;

      const utt = new SpeechSynthesisUtterance(text);
      utt.lang = isHindi ? "hi-IN" : selectedVoice.startsWith("en-GB") ? "en-GB" : selectedVoice.startsWith("en-US") ? "en-US" : "en-IN";
      utt.rate = isHindi ? 0.95 : 1.0;
      utt.pitch = isHindi ? 1.02 : 1.0;

      const voices = cachedVoicesRef.current.length > 0 ? cachedVoicesRef.current : window.speechSynthesis.getVoices();
      if (isHindi) {
        // High quality authentic Indian Hindi voices
        const hindiVoice = voices.find(v => 
          (v.lang.startsWith("hi") || v.lang === "hi_IN" || v.lang === "hi-IN") && 
          (v.name.includes("Swara") || v.name.includes("Madhur") || v.name.includes("Google") || v.name.includes("Natural") || v.name.includes("Kalpana"))
        ) || voices.find(v => v.lang.startsWith("hi"));
        if (hindiVoice) utt.voice = hindiVoice;
      } else {
        // High quality realistic English voices
        const englishVoice = voices.find(v => 
          (v.lang.startsWith("en") || v.lang.includes("IN") || v.lang.includes("US") || v.lang.includes("GB")) && 
          (v.name.includes("Neerja") || v.name.includes("Prabhat") || v.name.includes("Natural") || v.name.includes("Google") || v.name.includes("Jenny") || v.name.includes("Guy") || v.name.includes("Online"))
        ) || voices.find(v => v.lang.startsWith("en"));
        if (englishVoice) utt.voice = englishVoice;
      }

      let called = false;
      const done = () => {
        if (called) return;
        called = true;
        activeUtteranceRef.current = null;
        setIsAiSpeaking(false);
        isAiSpeakingRef.current = false;
        if (isLiveActiveRef.current || showTextKeyboard) {
          onFinish?.();
        }
      };

      utt.onend = done;
      utt.onerror = done;
      activeUtteranceRef.current = utt;
      if (isLiveActiveRef.current || showTextKeyboard) {
        try { window.speechSynthesis.resume(); } catch {}
        window.speechSynthesis.speak(utt);
      }
    } else {
      setIsAiSpeaking(false);
      isAiSpeakingRef.current = false;
      if (isLiveActiveRef.current || showTextKeyboard) {
        onFinish?.();
      }
    }
  };

  // 0-DELAY SEAMLESS AUDIO QUEUE ENGINE (Plays sentence-by-sentence without mic thrashing)
  const playNextInQueue = useCallback(() => {
    // If call is ended or page switched, drop entire queue immediately
    if (!isLiveActiveRef.current && !showTextKeyboard) {
      audioQueueRef.current = [];
      isPlayingQueueRef.current = false;
      setIsAiSpeaking(false);
      isAiSpeakingRef.current = false;
      return;
    }

    if (audioQueueRef.current.length === 0) {
      isPlayingQueueRef.current = false;
      setIsAiSpeaking(false);
      isAiSpeakingRef.current = false;
      // Automatic hands-free listening resume ONLY after entire queue finishes
      if (isLiveActiveRef.current && !isAiThinkingRef.current) {
        setTimeout(() => {
          if (isLiveActiveRef.current && !isAiSpeakingRef.current && !isAiThinkingRef.current) {
            startListening();
          }
        }, 300);
      }
      return;
    }

    const nextSentence = audioQueueRef.current.shift();
    if (!nextSentence) {
      playNextInQueue();
      return;
    }

    isPlayingQueueRef.current = true;
    playCoachAudio(nextSentence, () => {
      playNextInQueue();
    });
  }, [playCoachAudio, showTextKeyboard]);

  const enqueueSentence = useCallback((sentence: string) => {
    if (!isLiveActiveRef.current && !showTextKeyboard) return;
    const clean = cleanForSpeech(sentence);
    if (!clean || clean.length < 2) return;
    audioQueueRef.current.push(clean);
    if (!isPlayingQueueRef.current) {
      playNextInQueue();
    }
  }, [playNextInQueue, showTextKeyboard]);

  // Interrupt AI Speaking (Like Gemini Live: tap to interrupt)
  const handleInterruptAi = () => {
    if (abortControllerRef.current) {
      try { abortControllerRef.current.abort(); } catch {}
      abortControllerRef.current = null;
    }
    if (currentAudioRef.current) {
      currentAudioRef.current.onplay = null;
      currentAudioRef.current.onended = null;
      currentAudioRef.current.onerror = null;
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    audioQueueRef.current = [];
    isPlayingQueueRef.current = false;
    setIsAiSpeaking(false);
    isAiSpeakingRef.current = false;
    setIsAiThinking(false);
    isAiThinkingRef.current = false;
    if (isLiveActiveRef.current) {
      startListening();
    }
  };

  // Send message to Backend AI Coach with Camera Snapshot & Rapid Sentence Streaming
  const handleSendMessage = useCallback(async (text: string) => {
    const input = text.trim();
    if (!input || isAiThinkingRef.current) return;

    // Immediately stop listening and set thinking state
    stopListening();
    clearTimeout(silenceTimerRef.current);
    accumulatedSpeechRef.current = "";
    turnBaseSpeechRef.current = "";
    setCurrentSpeechText("");
    setIsAiThinking(true);
    isAiThinkingRef.current = true;
    setMicPermissionError(null);

    // Reset audio queue for fresh response
    audioQueueRef.current = [];
    isPlayingQueueRef.current = false;

    // Save clean teacher speech to conversation history
    const userMsgItem = {
      id: `usr-${Date.now()}`,
      sender: "user" as const,
      text: input,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };
    setConversationHistory(prev => [...prev, userMsgItem]);

    // Clear any previous turn's speech cleanly before initiating fresh turn
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      try { window.speechSynthesis.cancel(); } catch {}
    }

    try {
      const promptDirective = languageMode === "hindi"
        ? `Scenario: ${activeScenario.title}. Teacher said: "${input}". शुद्ध हिंदी (देवनागरी) में 1 संक्षिप्त वाक्य में उत्तर दें। शुरुआत "शानदार!" या "बहुत बढ़िया!" से करें। ✨ Better: [English line] 💡 Tip: [Hindi tip]`
        : cameraActive
        ? `Scenario: ${activeScenario.title}. Face: ${liveFaceRef.current.label}. Teacher said: "${input}". Reply warmly in 1 short spoken sentence (max 15 words) starting with 1 energetic reaction word (e.g. "Awesome!", "Spot on!"). ✨ Better: [English phrase] 💡 Tip: [short tip]`
        : `Scenario: ${activeScenario.title}. Teacher said: "${input}". Reply warmly in 1 short spoken sentence (max 15 words) starting with 1 energetic reaction word (e.g. "Awesome!", "Spot on!"). ✨ Better: [English phrase] 💡 Tip: [short tip]`;

      const fd = new FormData();
      fd.append("message", promptDirective);
      fd.append("agent_code", "english_coach");
      if (conversationId && conversationId.trim()) {
        fd.append("conversation_id", conversationId.trim());
      }
      fd.append("user_id", user?.id || user?.email || "teacher-guest");
      if (user?.email) fd.append("user_email", user.email);
      fd.append("language", languageMode);

      if (abortControllerRef.current) {
        try { abortControllerRef.current.abort(); } catch {}
      }
      const controller = new AbortController();
      abortControllerRef.current = controller;

      const res = await fetch(`${getApiBase()}/agents/chat`, {
        method: "POST",
        body: fd,
        signal: controller.signal
      });

      if (!res.ok) {
        setConversationId("");
        const errText = await res.text().catch(() => "");
        console.warn("Agents chat error status:", res.status, errText);
        throw new Error(`Server returned status ${res.status}`);
      }

      const newConvId = res.headers.get("X-Conversation-Id");
      if (newConvId && newConvId !== conversationId) {
        setConversationId(newConvId);
      }

      if (res.body) {
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let fullAiText = "";
        let sentenceBuffer = "";

        while (true) {
          // If user clicked End Call or navigated away, kill streaming immediately
          if (!isLiveActiveRef.current && !showTextKeyboard) {
            try { reader.cancel(); } catch {}
            break;
          }

          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          fullAiText += chunk;
          sentenceBuffer += chunk;
          setLiveAiSpeech(fullAiText);

          // As soon as first streaming tokens arrive, immediately turn off thinking spinner
          if (isAiThinkingRef.current) {
            setIsAiThinking(false);
            isAiThinkingRef.current = false;
          }

          // Progressive sentence & initial clause streaming: play clause 1 as soon as punctuation arrives!
          const match = sentenceBuffer.match(/^([\s\S]*?[\.\!\?\n]|[\s\S]{16,}?[\,\;\:\–\—])(\s+[\s\S]*|$)/);
          if (match) {
            const finishedSentence = match[1].trim();
            sentenceBuffer = match[2] || "";
            // Don't vocalize technical Better/Tip labels or speak if call ended
            if (isLiveActiveRef.current && !finishedSentence.includes("✨") && !finishedSentence.includes("💡") && !/^(Better|Tip):/i.test(finishedSentence)) {
              const cleanPart = cleanForSpeech(finishedSentence);
              if (cleanPart && cleanPart.length >= 2) {
                enqueueSentence(cleanPart);
              }
            }
          }
        }

        // Check again if call ended while streaming
        if (!isLiveActiveRef.current && !showTextKeyboard) {
          return;
        }

        // Flush any remaining conversational text in sentenceBuffer
        if (sentenceBuffer.trim()) {
          const cleanTrailing = cleanForSpeech(sentenceBuffer.trim());
          if (cleanTrailing && cleanTrailing.length >= 2) {
            enqueueSentence(cleanTrailing);
          }
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
        isAiThinkingRef.current = false;

        // If nothing was enqueued yet, enqueue clean full text
        if (audioQueueRef.current.length === 0 && !isPlayingQueueRef.current && (isLiveActiveRef.current || showTextKeyboard)) {
          const speechToPlay = cleanForSpeech(fullAiText);
          if (speechToPlay) {
            enqueueSentence(speechToPlay);
          } else {
            setIsAiSpeaking(false);
            if (isLiveActiveRef.current) {
              startListening();
            }
          }
        }
      } else {
        const data = await res.json();
        const fullAiText = data.response || "Well said! I notice your enthusiasm. Let us practice the next line.";
        setLiveAiSpeech(fullAiText);
        parseFeedback(fullAiText, input);
        setIsAiThinking(false);
        isAiThinkingRef.current = false;
        if (isLiveActiveRef.current || showTextKeyboard) {
          playCoachAudio(cleanForSpeech(fullAiText));
        }
      }
    } catch (err: any) {
      if (err?.name === "AbortError" || (!isLiveActiveRef.current && !showTextKeyboard)) {
        // Cleanly handle call termination/unmount without noisy errors or speech
        setIsAiThinking(false);
        isAiThinkingRef.current = false;
        return;
      }
      console.error("Conversation error:", err);
      setIsAiThinking(false);
      isAiThinkingRef.current = false;
      if (isLiveActiveRef.current || showTextKeyboard) {
        const fallbackMsg = cameraActive
          ? "Your facial expression looks very confident! Take a gentle breath, your pronunciation is coming along nicely. Shall we practice the next line?"
          : "Your pronunciation is coming along nicely! Take a relaxed breath. Shall we practice the next line?";
        setLiveAiSpeech(fallbackMsg);
        playCoachAudio(fallbackMsg);
      }
    }
  }, [languageMode, activeScenario, conversationId, user?.id, cameraActive, playCoachAudio]);

  // Explicit Manual Send
  const triggerManualSend = () => {
    const candidate = accumulatedSpeechRef.current.trim() || currentSpeechText.trim();
    if (candidate && candidate.length >= 2 && !isAiThinkingRef.current) {
      handleSendMessage(candidate);
    }
  };

  // Continuous Speech Recognition (Gemini Live Mode)
  const startListening = useCallback(() => {
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
      recognition.lang = languageMode === "hindi" ? "hi-IN" : languageMode === "hinglish" ? "hi-IN" : "en-IN";
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        isListeningRef.current = true;
      };

      recognition.onresult = (event: any) => {
        if (isAiSpeakingRef.current || isAiThinkingRef.current) return;

        let isFinalDetected = false;
        let sessionTranscript = "";
        for (let i = 0; i < event.results.length; i++) {
          sessionTranscript += event.results[i][0].transcript + " ";
          if (event.results[i].isFinal) {
            isFinalDetected = true;
          }
        }

        const candidateText = cleanSpeechTranscript(sessionTranscript);

        if (candidateText) {
          accumulatedSpeechRef.current = candidateText;
          setCurrentSpeechText(candidateText);

          clearTimeout(silenceTimerRef.current);

          // If browser speech recognition marked phrase as final, dispatch immediately (0ms delay)!
          if (isFinalDetected && candidateText.length >= 2 && !isAiSpeakingRef.current && !isAiThinkingRef.current) {
            handleSendMessage(candidateText);
            return;
          }

          const isConnectorWord = /\b(and|because|so|but|or|that|to|if|when|in|with|um|uh|the|a|my|is|are|then|which|who|as|for)\s*$/i.test(candidateText);
          const words = candidateText.split(/\s+/).filter(Boolean);
          let silenceDelay = 180; // Ultra-fast interim pause: 0.18s
          if (isConnectorWord) {
            silenceDelay = 380; // Brief pause when trailing on connector words
          } else if (words.length <= 2) {
            silenceDelay = 220; // Brief pause for 1-2 words
          }

          silenceTimerRef.current = setTimeout(() => {
            const readyToSend = cleanSpeechTranscript(accumulatedSpeechRef.current.trim());
            if (readyToSend.length >= 2 && !isAiSpeakingRef.current && !isAiThinkingRef.current) {
              handleSendMessage(readyToSend);
            }
          }, silenceDelay);
        }
      };

      recognition.onerror = (e: any) => {
        if (e.error !== "no-speech") {
          console.warn("Speech recognition notice:", e.error);
        }
        setIsListening(false);
        isListeningRef.current = false;
        if (e.error === "not-allowed" || e.error === "permission-denied") {
          setMicPermissionError("Microphone permission was denied. Please allow microphone access in your browser to practice speaking.");
        }
      };

      recognition.onend = () => {
        if (!isLiveActiveRef.current || isAiSpeakingRef.current || isAiThinkingRef.current) {
          setIsListening(false);
          isListeningRef.current = false;
          return;
        }

        // Auto-restart recognition cleanly by calling startListening() to instantiate a fresh object
        clearTimeout(autoRestartTimerRef.current);
        autoRestartTimerRef.current = setTimeout(() => {
          if (isLiveActiveRef.current && !isAiSpeakingRef.current && !isAiThinkingRef.current) {
            startListening();
          } else {
            setIsListening(false);
            isListeningRef.current = false;
          }
        }, 250);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.warn("Could not start recognition:", err);
      setIsListening(false);
      isListeningRef.current = false;
    }
  }, [languageMode, handleSendMessage]);

  const stopListening = useCallback(() => {
    clearTimeout(silenceTimerRef.current);
    clearTimeout(autoRestartTimerRef.current);
    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch {}
      recognitionRef.current = null;
    }
    setIsListening(false);
    isListeningRef.current = false;
  }, []);

  // Universal Kill-Switch: Immediately halts all voice synthesis, HTML5 audio, background streams, and mic
  const stopAllSpeechAndAudio = useCallback(() => {
    // 1. Immediately deactivate session flags synchronously
    isLiveActiveRef.current = false;

    // 2. Abort in-flight network streaming request so no more chunks or sentences arrive
    if (abortControllerRef.current) {
      try { abortControllerRef.current.abort(); } catch {}
      abortControllerRef.current = null;
    }

    // 3. Immediately silence native browser speech synthesis
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      try { window.speechSynthesis.cancel(); } catch {}
    }

    // 4. Immediately halt & destroy any active HTML5 audio element
    if (currentAudioRef.current) {
      try {
        currentAudioRef.current.onplay = null;
        currentAudioRef.current.onended = null;
        currentAudioRef.current.onerror = null;
        currentAudioRef.current.pause();
        currentAudioRef.current.src = "";
      } catch {}
      currentAudioRef.current = null;
    }

    // 5. Purge queued sentences so no upcoming speech can play
    audioQueueRef.current = [];
    isPlayingQueueRef.current = false;

    // 6. Stop speech recognition and clear timers
    clearTimeout(silenceTimerRef.current);
    clearTimeout(autoRestartTimerRef.current);
    stopListening();

    // 7. Reset all AI speaking and thinking states
    isAiSpeakingRef.current = false;
    setIsAiSpeaking(false);
    isAiThinkingRef.current = false;
    setIsAiThinking(false);
    accumulatedSpeechRef.current = "";
    turnBaseSpeechRef.current = "";
    setCurrentSpeechText("");
  }, [stopListening]);

  // Start Live Session with a Selected Scenario (Modal callback)
  const startCallWithScenario = (scenario: ScenarioTopic) => {
    setActiveScenario(scenario);
    setShowScenarioModal(false);
    setIsLiveActive(true);
    isLiveActiveRef.current = true;
    startCamera();
    const greeting = languageMode === "hindi"
      ? `नमस्ते! मैं आपका देवज्ञ इंग्लिश स्पीकिंग कोच हूँ। आइए ${scenario.title} का अभ्यास करते हैं। जब भी आप तैयार हों, बोलना शुरू करें!`
      : `Hello! I am Devgya English Coach. Let us practice ${scenario.title}. Speak whenever you are ready!`;
    setLiveAiSpeech(greeting);
    playCoachAudio(greeting, () => {
      setIsAiSpeaking(false);
      isAiSpeakingRef.current = false;
      if (isLiveActiveRef.current && !isAiThinkingRef.current) {
        setTimeout(() => {
          if (isLiveActiveRef.current && !isAiSpeakingRef.current && !isAiThinkingRef.current) {
            startListening();
          }
        }, 220);
      }
    });
  };

  // Toggle Live Mode (Start / End Conversation)
  const toggleLiveConversation = () => {
    if (isLiveActive) {
      // End conversation immediately: kill speech synthesis, stop stream, purge audio, and turn off camera
      setIsLiveActive(false);
      stopAllSpeechAndAudio();
      stopCamera();
    } else {
      // Prompt user to select scenario before starting to talk with AI
      setShowScenarioModal(true);
    }
  };

  // Reset conversation context
  const handleResetConversation = () => {
    setConversationId("");
    setConversationHistory([]);
    setLatestFeedback(null);
    setCurrentSpeechText("");
    accumulatedSpeechRef.current = "";
    const resetGreeting = languageMode === "hindi"
      ? `नमस्ते! मैं आपका देवज्ञ इंग्लिश स्पीकिंग कोच हूँ। हम ${activeScenario.title} का अभ्यास कर रहे हैं। जब भी तैयार हों, बोलिए!`
      : `Hello! I am Devgya English Coach. We are practicing ${activeScenario.title}. Speak whenever you are ready!`;
    setLiveAiSpeech(resetGreeting);
    if (isLiveActive) {
      playCoachAudio(resetGreeting, () => {
        setIsAiSpeaking(false);
        isAiSpeakingRef.current = false;
        if (isLiveActiveRef.current && !isAiThinkingRef.current) {
          setTimeout(() => {
            if (isLiveActiveRef.current && !isAiSpeakingRef.current && !isAiThinkingRef.current) {
              startListening();
            }
          }, 220);
        }
      });
    }
  };

  // Lifecycle management: Auto-start camera on mount, and ensure immediate silence on unmount or page change
  useEffect(() => {
    startCamera("user");

    const handleLeave = () => {
      stopAllSpeechAndAudio();
      stopCamera();
    };

    window.addEventListener("pagehide", handleLeave);
    window.addEventListener("beforeunload", handleLeave);

    return () => {
      window.removeEventListener("pagehide", handleLeave);
      window.removeEventListener("beforeunload", handleLeave);
      stopAllSpeechAndAudio();
      stopCamera();
    };
  }, [startCamera, stopCamera, stopAllSpeechAndAudio]);

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col space-y-4 p-3 sm:p-5 pb-28 md:pb-8">
      
      {/* 1. TOP CONTROL BAR */}
      <div className="glass-panel p-3.5 md:p-4 rounded-3xl border border-slate-200/80 bg-white shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          
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
                    {cameraActive ? `${liveFace.emoji} Live Vision: ${liveFace.label}` : "Audio Session"}
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-slate-100 text-slate-600">
                    {cameraActive ? `${liveFace.emoji} ${liveFace.label}` : "Ready"}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-indigo-50/90 border border-indigo-200/80 text-[11px] font-bold text-indigo-900 shadow-2xs">
                  <activeScenario.icon className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span className="truncate max-w-[130px] sm:max-w-[200px]">{activeScenario.title}</span>
                  <button
                    type="button"
                    onClick={() => setShowScenarioModal(true)}
                    className="ml-1 text-[9.5px] uppercase font-black text-indigo-600 hover:text-indigo-800 bg-white px-1.5 py-0.5 rounded border border-indigo-200 cursor-pointer shadow-2xs transition-all hover:scale-105"
                    title="Change practice scenario"
                  >
                    Change
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center flex-wrap gap-2">
            {/* Camera Switcher Toggle */}
            <button
              onClick={() => cameraActive ? stopCamera() : startCamera()}
              className={`p-1.5 rounded-xl border transition-colors cursor-pointer ${
                cameraActive ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-100 text-slate-600 border-slate-200"
              }`}
              title={cameraActive ? "Turn Off Camera" : "Turn On Camera"}
            >
              {cameraActive ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
            </button>

            {cameraActive && (
              <button
                onClick={switchCamera}
                className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200 cursor-pointer"
                title="Switch Camera"
              >
                <SwitchCamera className="w-4 h-4" />
              </button>
            )}

            {/* Language Mode Selector (English / हिंदी / Hinglish) */}
            <div className="flex items-center p-0.5 bg-slate-100 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => handleLanguageChange("english")}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                  languageMode === "english"
                    ? "bg-white text-indigo-600 shadow-xs font-black"
                    : "text-slate-600 hover:text-slate-900"
                }`}
                title="Practice in Pure English (Natural UK/US/Indian Accent)"
              >
                🇬🇧 English
              </button>
              <button
                type="button"
                onClick={() => handleLanguageChange("hindi")}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                  languageMode === "hindi"
                    ? "bg-white text-rose-600 shadow-xs font-black"
                    : "text-slate-600 hover:text-slate-900"
                }`}
                title="हिंदी में अभ्यास करें (Authentic Hindi Accent & Devanagari Script)"
              >
                🇮🇳 हिंदी
              </button>
              <button
                type="button"
                onClick={() => handleLanguageChange("hinglish")}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                  languageMode === "hinglish"
                    ? "bg-white text-amber-700 shadow-xs font-black"
                    : "text-slate-600 hover:text-slate-900"
                }`}
                title="Bilingual Hinglish Mode"
              >
                Hinglish
              </button>
            </div>

            {/* Categorized Human & Indian Accent Voice Selector */}
            <div className="relative">
              <select
                value={selectedVoice}
                onChange={(e) => setSelectedVoice(e.target.value)}
                className="appearance-none pl-7 pr-7 py-1.5 bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-800 rounded-xl border border-slate-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/20 max-w-[170px] sm:max-w-[210px] truncate"
              >
                <optgroup label="🇮🇳 Authentic Hindi Voices (हिंदी उच्चारण)">
                  {COACH_VOICES.filter(v => v.category === "hindi").map(v => (
                    <option key={v.code} value={v.code}>
                      {v.avatar} {v.name}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="🇮🇳 Realistic Indian English (Educator Accent)">
                  {COACH_VOICES.filter(v => v.category === "indian-english").map(v => (
                    <option key={v.code} value={v.code}>
                      {v.avatar} {v.name}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="🌍 Global Fluent English Accents">
                  {COACH_VOICES.filter(v => v.category === "global-english").map(v => (
                    <option key={v.code} value={v.code}>
                      {v.avatar} {v.name}
                    </option>
                  ))}
                </optgroup>
              </select>
              <Sparkles className="w-3 h-3 text-indigo-600 absolute left-2.5 top-2.5 pointer-events-none" />
              <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2 top-2.5 pointer-events-none" />
            </div>

            {/* History Drawer Toggle */}
            <button
              onClick={() => setShowHistoryModal(prev => !prev)}
              className="p-1.5 rounded-xl text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors cursor-pointer"
              title="View Conversation Log"
            >
              <History className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. GEMINI LIVE STAGE WITH LIVE CAMERA HUD & PULSING ORB */}
      <div className="glass-panel p-4 sm:p-6 md:p-8 rounded-3xl border border-slate-200/80 bg-gradient-to-b from-white via-slate-50/50 to-white shadow-sm flex flex-col items-center justify-between text-center space-y-4 relative overflow-hidden flex-1 min-h-[420px]">
        
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

        {/* LIVE CAMERA VIEWFINDER (CENTERED, CLEAN BORDERS WITH REAL-TIME EMOTION HUD) */}
        {cameraActive ? (
          <div className="flex flex-col items-center z-10 w-full">
            <div className="relative w-44 h-44 sm:w-60 sm:h-60 md:w-72 md:h-72 mx-auto rounded-3xl overflow-hidden border-4 border-white shadow-xl bg-slate-950 ring-1 ring-slate-200/80">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover scale-x-[-1]"
              />

              {/* Real-time Facial Perception HUD Pill */}
              <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/65 backdrop-blur-md border border-white/20 text-white shadow-md pointer-events-none z-20">
                <span className={`w-2 h-2 rounded-full ${liveFace.hasFace ? "bg-emerald-400 animate-ping" : "bg-amber-400"}`} />
                <span className="text-[10.5px] font-black tracking-wide flex items-center gap-1">
                  <span>{liveFace.emoji}</span>
                  <span className="truncate max-w-[120px]">{liveFace.label}</span>
                </span>
              </div>

              {/* Minimal translucent Camera Switch Button */}
              <button
                onClick={switchCamera}
                className="absolute top-3 right-3 p-2 rounded-full bg-black/40 hover:bg-black/70 text-white/90 backdrop-blur-md transition-colors cursor-pointer z-20"
                title="Switch Camera"
              >
                <SwitchCamera className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="w-44 h-40 sm:w-60 sm:h-52 md:w-72 md:h-60 mx-auto rounded-3xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center p-4 text-center bg-slate-50/60 z-10">
            <VideoOff className="w-8 h-8 text-slate-400 mb-2" />
            <p className="text-xs font-bold text-slate-600">Camera is Off</p>
            <button
              onClick={() => startCamera()}
              className="mt-2 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black cursor-pointer shadow-xs"
            >
              Turn Camera On
            </button>
          </div>
        )}

        {/* MIC PERMISSION ERROR NOTICE */}
        {micPermissionError && (
          <div className="w-full max-w-md mx-auto p-3 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 font-medium text-left flex items-start gap-2 z-10">
            <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Microphone Access</p>
              <p className="mt-0.5">{micPermissionError}</p>
            </div>
          </div>
        )}

        {/* COACH SUBTITLES CARD (PERFECTLY CENTERED) */}
        <div className="w-full max-w-xl mx-auto z-10">
          <div className="p-3.5 sm:p-5 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-sm relative text-left">
            <div className="flex items-center justify-between mb-2 text-[10px] font-black uppercase tracking-wider">
              <span className="flex items-center gap-1.5 text-indigo-600">
                <Sparkles className="w-3.5 h-3.5" />
                Devgya English Coach • {COACH_VOICES.find(v => v.code === selectedVoice)?.name || "Female Voice (Girl)"}
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

            <p className="text-xs sm:text-sm md:text-base font-semibold text-slate-800 leading-relaxed">
              {liveAiSpeech}
            </p>
          </div>
        </div>

        {/* 3. GEMINI LIVE CENTRAL PULSING ORB */}
        <div className="relative flex flex-col items-center justify-center my-2 z-10 mx-auto">
          
          {/* Animated Wave Rings */}
          {isAiSpeaking && (
            <>
              <div className="absolute w-40 h-40 rounded-full border-2 border-rose-400/50 animate-ping pointer-events-none" />
              <div className="absolute w-48 h-48 rounded-full border border-indigo-400/40 animate-pulse pointer-events-none" />
            </>
          )}
          {isListening && (
            <>
              <div className="absolute w-40 h-40 rounded-full border-2 border-emerald-400/60 animate-ping pointer-events-none" />
              <div className="absolute w-48 h-48 rounded-full border border-teal-400/40 animate-pulse pointer-events-none" />
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
            className={`w-24 h-24 md:w-28 md:h-28 rounded-full flex flex-col items-center justify-center transition-all duration-500 shadow-2xl cursor-pointer select-none active:scale-95 ${
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
                <Volume2 className="w-8 h-8 md:w-10 md:h-10 text-white animate-bounce" />
                <span className="text-[9px] font-black uppercase tracking-wider text-rose-100 mt-0.5">Interrupt</span>
              </>
            ) : isListening ? (
              <>
                <Mic className="w-8 h-8 md:w-10 md:h-10 text-white animate-pulse" />
                <span className="text-[9px] font-black uppercase tracking-wider text-emerald-100 mt-0.5">Send Now</span>
              </>
            ) : isAiThinking ? (
              <>
                <RotateCcw className="w-8 h-8 md:w-10 md:h-10 text-white" />
                <span className="text-[9px] font-black uppercase tracking-wider text-amber-100 mt-0.5">Thinking</span>
              </>
            ) : isLiveActive ? (
              <>
                <Mic className="w-8 h-8 md:w-10 md:h-10 text-white" />
                <span className="text-[9px] font-black uppercase tracking-wider text-indigo-100 mt-0.5">Speak</span>
              </>
            ) : (
              <>
                <Phone className="w-8 h-8 md:w-10 md:h-10 text-white animate-pulse" />
                <span className="text-[9px] font-black uppercase tracking-wider text-slate-100 mt-0.5">Start Live</span>
              </>
            )}
          </button>

          {/* Status Indicator */}
          <div className="mt-2.5 text-xs font-bold">
            {isAiSpeaking ? (
              <span className="text-rose-600 flex items-center justify-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping" />
                Speaking... (tap orb to interrupt)
              </span>
            ) : isListening ? (
              <span className="text-emerald-600 flex items-center justify-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping" />
                Listening to you...
              </span>
            ) : isAiThinking ? (
              <span className="text-amber-600 flex items-center justify-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-600 animate-pulse" />
                Coach thinking...
              </span>
            ) : isLiveActive ? (
              <span className="text-indigo-600">
                Connected. Speak whenever you are ready.
              </span>
            ) : (
              <span className="text-slate-500">
                Tap the orb to start conversation
              </span>
            )}
          </div>
        </div>

        {/* LIVE USER TRANSCRIPT BUBBLE WITH INSTANT SEND */}
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
                <span>Send</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>
        )}

        {/* 4. POLISHED TEACHER ENGLISH FEEDBACK */}
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

      {/* 6. EXPANDABLE TEXT INPUT */}
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
                        {item.sender === "user" ? "You (Teacher)" : `Devgya English Coach (${COACH_VOICES.find(v => v.code === selectedVoice)?.name || "Female Voice"})`}
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

      {/* SCENARIO SELECTION MODAL (User selects topic BEFORE talking with AI) */}
      {showScenarioModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-xl w-full p-5 sm:p-6 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold shrink-0">
                  <Sparkles className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h2 className="text-base font-black text-slate-900">Choose Practice Scenario</h2>
                  <p className="text-xs text-slate-500 font-semibold">Select what you want to practice before starting conversation</p>
                </div>
              </div>
              <button
                onClick={() => setShowScenarioModal(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[60vh] overflow-y-auto p-0.5">
              {PRACTICE_SCENARIOS.map((sc) => {
                const Icon = sc.icon;
                const isSelected = activeScenario.id === sc.id;
                return (
                  <button
                    key={sc.id}
                    onClick={() => startCallWithScenario(sc)}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer group flex flex-col justify-between gap-2 ${
                      isSelected
                        ? "bg-indigo-50/80 border-indigo-300 ring-2 ring-indigo-500/20 shadow-sm"
                        : "bg-slate-50/70 hover:bg-white border-slate-200 hover:border-indigo-200 hover:shadow-sm"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                        isSelected ? "bg-indigo-600 text-white" : "bg-white text-slate-600 border border-slate-200 group-hover:text-indigo-600"
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-xs font-black text-slate-900 truncate">{sc.title}</h3>
                        <span className="text-[10px] font-bold text-indigo-600 block">{sc.shortTitle}</span>
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-500 font-medium line-clamp-2 leading-relaxed">
                      {sc.quickStarters[0]}
                    </p>
                  </button>
                );
              })}
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-bold">
              <span>Selected: {activeScenario.title}</span>
              <button
                onClick={() => startCallWithScenario(activeScenario)}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 cursor-pointer transition-all active:scale-95 flex items-center gap-1.5"
              >
                <span>Start Speaking Now</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
