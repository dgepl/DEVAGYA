"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Phone,
  PhoneOff,
  Volume2,
  VolumeX,
  Bot,
  User,
  Smile,
  Globe,
  Send,
  MessageSquare,
  X,
  Sparkles,
  Calendar,
  Clock,
  ShieldCheck,
  Award,
  FileText,
  CheckCircle2,
  Share2,
  Maximize2
} from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import * as faceapi from "@vladmandic/face-api";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "/api/v1";

const LANGUAGES = [
  { code: "english", label: "English", flag: "🇬🇧", speechLang: "en-IN", ttsLang: "en-IN" },
  { code: "hindi", label: "हिंदी", flag: "🇮🇳", speechLang: "hi-IN", ttsLang: "hi-IN" },
  { code: "hinglish", label: "Hinglish", flag: "🔀", speechLang: "hi-IN", ttsLang: "hi-IN" },
];

const EXPR_EMOJI: Record<string, string> = {
  happy: "😊", sad: "😢", confused: "😕", surprised: "😮",
  neutral: "😐", angry: "😠", fearful: "😨",
};

// Helper: Clean markdown, bullets, code, and emojis so speech sounds 100% natural without reciting symbols
function cleanTextForSpeech(rawText: string): string {
  if (!rawText) return "";
  let clean = rawText;

  // Remove code blocks and inline code
  clean = clean.replace(/```[\s\S]*?```/g, "");
  clean = clean.replace(/`([^`]+)`/g, "$1");
  // Remove markdown links [text](url) -> text
  clean = clean.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
  // Remove bold/italic markdown asterisks & underscores
  clean = clean.replace(/(\*\*|__)(.*?)\1/g, "$2");
  clean = clean.replace(/(\*|_)(.*?)\1/g, "$2");
  // Remove markdown headers (# Title -> Title)
  clean = clean.replace(/^#+\s+/gm, "");
  // Remove list bullets (- item, * item, 1. item -> item)
  clean = clean.replace(/^[-*•]\s+/gm, "");
  clean = clean.replace(/^[0-9]+\.\s+/gm, "");
  clean = clean.replace(/>\s+/gm, "");
  clean = clean.replace(/[#_~*`]/g, "");

  // Remove emojis & decorative icons
  clean = clean.replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}]/gu, "");

  // Normalize whitespace & linebreaks into natural sentence pauses
  clean = clean.replace(/\n+/g, ". ").replace(/\s{2,}/g, " ").trim();
  return clean;
}

// Helper: Pick high-quality Natural/Neural AI voices from browser speechSynthesis
function getBestNaturalVoice(ttsLang: string, langCode: string): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices || voices.length === 0) return null;

  const isHindiOrHinglish = langCode === "hindi" || langCode === "hinglish" || ttsLang.startsWith("hi");

  if (isHindiOrHinglish) {
    // Top priority: Indian Hindi natural/neural voices (Microsoft Swara/Madhur/Kalpana, Google हिन्दी)
    const hindiNeural = voices.find(v => v.lang.startsWith("hi") && (v.name.includes("Natural") || v.name.includes("Online")));
    if (hindiNeural) return hindiNeural;
    const googleHindi = voices.find(v => v.lang.startsWith("hi") && v.name.includes("Google"));
    if (googleHindi) return googleHindi;
    const namedHindi = voices.find(v => v.name.includes("Swara") || v.name.includes("Madhur") || v.name.includes("Kalpana") || v.name.includes("Hemant"));
    if (namedHindi) return namedHindi;
    const anyHindi = voices.find(v => v.lang.startsWith("hi"));
    if (anyHindi) return anyHindi;
    const indianEngNeural = voices.find(v => (v.lang.includes("en-IN") || v.lang.includes("en_IN")) && (v.name.includes("Natural") || v.name.includes("Online")));
    if (indianEngNeural) return indianEngNeural;
  } else {
    // English priority: Indian English / Natural neural voices
    const inEngNeural = voices.find(v => (v.lang.includes("en-IN") || v.lang.includes("en_IN")) && (v.name.includes("Natural") || v.name.includes("Online")));
    if (inEngNeural) return inEngNeural;
    const inEngGoogle = voices.find(v => (v.lang.includes("en-IN") || v.lang.includes("en_IN")) && v.name.includes("Google"));
    if (inEngGoogle) return inEngGoogle;
    const inEngNamed = voices.find(v => v.name.includes("Neerja") || v.name.includes("Prabhat") || v.name.includes("Swara"));
    if (inEngNamed) return inEngNamed;
    const anyInEng = voices.find(v => v.lang.includes("en-IN") || v.lang.includes("en_IN"));
    if (anyInEng) return anyInEng;
    const gbNatural = voices.find(v => v.lang.startsWith("en-GB") && (v.name.includes("Natural") || v.name.includes("Online") || v.name.includes("Google")));
    if (gbNatural) return gbNatural;
    const anyEngNatural = voices.find(v => v.lang.startsWith("en") && (v.name.includes("Natural") || v.name.includes("Online") || v.name.includes("Google")));
    if (anyEngNatural) return anyEngNatural;
  }

  return voices.find(v => v.lang.startsWith(ttsLang.slice(0, 2))) || voices[0] || null;
}

export function VideoConsultation() {
  const user = useAppStore((s) => s.user);

  // Consultation Session Setup
  const [inCall, setInCall] = useState(false);
  const [cameraOn, setCameraOn] = useState(true);
  const [micOn, setMicOn] = useState(true);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [language, setLanguage] = useState("english");
  const [aiSpeaking, setAiSpeaking] = useState(false);
  const [aiThinking, setAiThinking] = useState(false);
  const [expression, setExpression] = useState("neutral");
  const [faceReady, setFaceReady] = useState(false);
  const [callTime, setCallTime] = useState(0);
  const [selectedTopic, setSelectedTopic] = useState("CBSE Exam Strategy & Problem Solving");

  // Subtitles & Captions
  const [userSub, setUserSub] = useState("");
  const [aiSub, setAiSub] = useState("");

  // Live Transcript + Text Input
  const [textInput, setTextInput] = useState("");
  const [showTranscript, setShowTranscript] = useState(false);
  const [transcript, setTranscript] = useState<{ who: "you" | "ai"; text: string }[]>([]);
  const [notesGenerated, setNotesGenerated] = useState<string | null>(null);

  // Speech API status
  const [speechOk, setSpeechOk] = useState(true);

  // Media & Anti-Echo Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<any>(null);
  const faceTimerRef = useRef<any>(null);
  const inCallRef = useRef(false);
  const micOnRef = useRef(true);
  const isAiSpeakingRef = useRef(false);
  const isAiThinkingRef = useRef(false);
  const aiSpeakingCooldownRef = useRef(0);
  const lastAiSpokenCleanRef = useRef("");
  const transcriptRef = useRef<HTMLDivElement>(null);
  const pendingSpeechRef = useRef<string>("");
  const silenceTimerRef = useRef<any>(null);

  const lang = LANGUAGES.find((l) => l.code === language) || LANGUAGES[0];

  useEffect(() => { inCallRef.current = inCall; }, [inCall]);
  useEffect(() => { micOnRef.current = micOn; }, [micOn]);
  useEffect(() => { transcriptRef.current?.scrollTo(0, 99999); }, [transcript]);

  // Pre-load available synthesis voices on component mount
  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
      };
    }
  }, []);

  // Call duration counter
  useEffect(() => {
    if (inCall) {
      timerRef.current = setInterval(() => setCallTime((p) => p + 1), 1000);
    } else {
      clearInterval(timerRef.current);
      setCallTime(0);
    }
    return () => clearInterval(timerRef.current);
  }, [inCall]);

  const fmt = (s: number) => `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  // Media Stream Setup - Video preview only, keeping microphone available for Web Speech API
  const startCamera = useCallback(async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false // Crucial: Do NOT lock mic in getUserMedia so SpeechRecognition gets full audio access on iOS/Android
      });
      streamRef.current = s;
      if (videoRef.current) { videoRef.current.srcObject = s; videoRef.current.play().catch(() => {}); }
    } catch {
      setCameraOn(false);
    }
  }, []);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
  }, []);

  useEffect(() => {
    if (inCall && streamRef.current && videoRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch(() => {});
    }
  }, [inCall]);

  const toggleCamera = () => {
    const vt = streamRef.current?.getVideoTracks()[0];
    if (vt) { vt.enabled = !vt.enabled; setCameraOn(vt.enabled); }
  };

  const toggleMic = () => {
    setMicOn((prev) => {
      const next = !prev;
      if (!next) {
        stopListening();
      } else {
        if (!isAiSpeakingRef.current && !isAiThinkingRef.current) {
          startListening();
        }
      }
      return next;
    });
  };

  // Cross-calling functional refs for full decoupling
  const startListeningRef = useRef<() => void>(() => {});
  const speakRef = useRef<(text: string) => void>(() => {});
  const sendMessageRef = useRef<(text: string) => Promise<void>>(async () => {});

  // Anti-Echo Protected Speech Recognition with Mobile Finalization
  const stopListening = useCallback(() => {
    clearTimeout(silenceTimerRef.current);
    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch {}
      recognitionRef.current = null;
    }
  }, []);

  const startListening: () => void = useCallback(() => {
    if (recognitionRef.current) return;
    // Never start listening if AI is currently speaking or thinking
    if (isAiSpeakingRef.current || isAiThinkingRef.current) return;

    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { setSpeechOk(false); return; }

    const isMobileDevice = typeof navigator !== "undefined" && (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || navigator.maxTouchPoints > 1);

    const rec = new SR();
    rec.continuous = !isMobileDevice; // On mobile, single utterance mode is required for speech capture
    rec.interimResults = true;
    rec.lang = lang.speechLang;

    const finalizeAndSendSpeech = () => {
      const textToSend = pendingSpeechRef.current.trim();
      if (textToSend && textToSend.length > 1) {
        pendingSpeechRef.current = "";
        clearTimeout(silenceTimerRef.current);
        setUserSub("");
        sendMessageRef.current(textToSend);
      }
    };

    rec.onresult = (e: any) => {
      // Echo gate: Discard if AI is speaking or in cooldown
      if (isAiSpeakingRef.current || isAiThinkingRef.current || Date.now() < aiSpeakingCooldownRef.current) {
        return;
      }

      let interim = "";
      let final = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) { final += t; } else { interim += t; }
      }

      const candidate = (final || interim).trim().toLowerCase();
      if (!candidate) return;

      // Echo filter against recent AI output
      const recentAiText = lastAiSpokenCleanRef.current;
      if (recentAiText && candidate.length > 4) {
        if (recentAiText.includes(candidate) || (candidate.length > 15 && recentAiText.slice(0, 40).includes(candidate.slice(0, 20)))) {
          return;
        }
      }

      const currentText = (final || interim).trim();
      pendingSpeechRef.current = currentText;
      setUserSub(currentText);

      clearTimeout(silenceTimerRef.current);
      if (final && final.trim()) {
        silenceTimerRef.current = setTimeout(finalizeAndSendSpeech, 500);
      } else {
        silenceTimerRef.current = setTimeout(finalizeAndSendSpeech, 900);
      }
    };

    rec.onerror = (e: any) => {
      console.warn("Consultation speech notice:", e.error);
      if (["not-allowed", "service-not-allowed"].includes(e.error)) {
        setSpeechOk(false);
        recognitionRef.current = null;
      }
    };

    rec.onend = () => {
      recognitionRef.current = null;
      if (pendingSpeechRef.current.trim() && !isAiSpeakingRef.current && !isAiThinkingRef.current) {
        finalizeAndSendSpeech();
      }

      // Auto-restart listening if in call and AI is quiet
      if (inCallRef.current && micOnRef.current && !isAiSpeakingRef.current && !isAiThinkingRef.current) {
        setTimeout(() => {
          if (inCallRef.current && micOnRef.current && !isAiSpeakingRef.current && !isAiThinkingRef.current) {
            startListeningRef.current();
          }
        }, 200);
      }
    };

    recognitionRef.current = rec;
    try { 
      rec.start(); 
      setSpeechOk(true);
    } catch { 
      // Handled silently
    }
  }, [lang.speechLang]);

  useEffect(() => {
    startListeningRef.current = startListening;
  }, [startListening]);

  // High-Quality Natural Text-To-Speech Synthesis with Clean Preprocessing
  const speak: (text: string) => void = useCallback((text: string) => {
    if (!ttsEnabled || typeof window === "undefined" || !("speechSynthesis" in window)) return;

    // 1. Immediately pause/abort mic input to prevent AI from hearing itself
    stopListening();
    isAiSpeakingRef.current = true;
    setAiSpeaking(true);

    window.speechSynthesis.cancel();

    const cleanText = cleanTextForSpeech(text);
    if (!cleanText) {
      isAiSpeakingRef.current = false;
      setAiSpeaking(false);
      if (inCallRef.current && micOnRef.current) startListeningRef.current();
      return;
    }

    lastAiSpokenCleanRef.current = cleanText.toLowerCase();

    const utt = new SpeechSynthesisUtterance(cleanText);
    utt.rate = 0.98; // Natural, human conversational pace
    utt.pitch = 1.0;
    utt.lang = lang.ttsLang;

    // Select the most natural / neural voice available
    const bestVoice = getBestNaturalVoice(lang.ttsLang, language);
    if (bestVoice) {
      utt.voice = bestVoice;
    }

    utt.onstart = () => {
      isAiSpeakingRef.current = true;
      setAiSpeaking(true);
    };

    utt.onend = () => {
      isAiSpeakingRef.current = false;
      setAiSpeaking(false);
      // Echo suppression cooldown (800ms) to allow speaker sound to decay
      aiSpeakingCooldownRef.current = Date.now() + 800;
      setTimeout(() => {
        if (inCallRef.current && micOnRef.current && !isAiSpeakingRef.current && !isAiThinkingRef.current) {
          startListeningRef.current();
        }
      }, 800);
      setTimeout(() => setAiSub(""), 3500);
    };

    utt.onerror = () => {
      isAiSpeakingRef.current = false;
      setAiSpeaking(false);
      aiSpeakingCooldownRef.current = Date.now() + 500;
      setTimeout(() => {
        if (inCallRef.current && micOnRef.current && !isAiSpeakingRef.current && !isAiThinkingRef.current) {
          startListeningRef.current();
        }
      }, 500);
    };

    window.speechSynthesis.speak(utt);
  }, [ttsEnabled, lang.ttsLang, language, stopListening]);

  useEffect(() => {
    speakRef.current = speak;
  }, [speak]);

  // AI Response Stream & Conversational Video Mentor Dialogue
  const sendMessage: (text: string) => Promise<void> = useCallback(async (text: string) => {
    if (!text.trim() || isAiThinkingRef.current) return;
    
    // Stop listening while AI thinks and prepares response
    stopListening();
    isAiThinkingRef.current = true;
    setAiThinking(true);
    setUserSub("");
    setTranscript((p) => [...p, { who: "you", text }]);

    try {
      const fd = new FormData();
      const ctx = `[LIVE VIDEO CONSULTATION MODE - DIRECT SPOKEN DIALOGUE]: You are in a face-to-face video consultation call with the student on topic "${selectedTopic}". Student expression: ${expression}. Respond directly in 2 to 3 friendly, natural, conversational spoken sentences in ${language} (NO markdown asterisks/bullets/emojis/headers). Speak warmly and concisely like a live human tutor. Student said: "${text}"`;
      fd.append("message", ctx);
      fd.append("agent_code", "student_tutor");
      fd.append("user_id", user?.id || "anonymous");
      fd.append("language", language);

      const res = await fetch(`${API_BASE}/agents/chat`, { method: "POST", body: fd });

      if (res.body) {
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let full = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          full += decoder.decode(value, { stream: true });
          setAiSub(full.length > 250 ? "..." + full.slice(-250) : full);
        }
        try { const j = JSON.parse(full); full = j.response || full; } catch {}
        setAiSub(full.length > 250 ? full.slice(0, 250) + "..." : full);
        setTranscript((p) => [...p, { who: "ai", text: full }]);
        isAiThinkingRef.current = false;
        setAiThinking(false);
        speakRef.current(full);
      } else {
        const d = await res.json();
        const t = d.response || "I am here to guide you through your studies!";
        setAiSub(t.length > 250 ? t.slice(0, 250) + "..." : t);
        setTranscript((p) => [...p, { who: "ai", text: t }]);
        isAiThinkingRef.current = false;
        setAiThinking(false);
        speakRef.current(t);
      }
    } catch {
      setAiSub("Connection issue. Please check network.");
      isAiThinkingRef.current = false;
      setAiThinking(false);
      if (inCallRef.current && micOnRef.current) startListeningRef.current();
    }
  }, [user?.id, expression, language, selectedTopic, stopListening]);

  useEffect(() => {
    sendMessageRef.current = sendMessage;
  }, [sendMessage]);

  // Face Expression API Detector
  useEffect(() => {
    (async () => {
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
          faceapi.nets.faceExpressionNet.loadFromUri("/models"),
        ]);
        setFaceReady(true);
      } catch (e) { console.warn("Face models loading skipped:", e); }
    })();
  }, []);

  useEffect(() => {
    if (!inCall || !cameraOn || !faceReady) return;
    const detect = async () => {
      if (!videoRef.current) return;
      try {
        const d = await faceapi
          .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.5 }))
          .withFaceExpressions();
        if (d?.expressions) {
          let best = "neutral", bestVal = 0;
          for (const [k, v] of Object.entries(d.expressions as any)) {
            if (typeof v === "number" && v > bestVal) { bestVal = v; best = k; }
          }
          if (bestVal > 0.4) setExpression(best);
        }
      } catch {}
    };
    faceTimerRef.current = setInterval(detect, 500);
    return () => clearInterval(faceTimerRef.current);
  }, [inCall, cameraOn, faceReady]);

  // Start / End Video Session
  const startCall = async () => {
    await startCamera();
    setInCall(true);
    setTranscript([]);
    const msg = language === "hindi"
      ? `नमस्ते! मैं आपका DEVGYA AI परामर्शदाता हूँ। विषय है ${selectedTopic}। बोलिए, मैं सुन रहा हूँ!`
      : `Hello! I'm your DEVGYA AI Mentor for ${selectedTopic}. Please speak naturally, I'm listening!`;
    setAiSub(msg);
    setTranscript([{ who: "ai", text: msg }]);
    speak(msg);
  };

  const endCall = () => {
    stopListening();
    stopCamera();
    window.speechSynthesis?.cancel();

    // Generate AI Session Summary Notes
    if (transcript.length > 1) {
      const summaryText = `Session Summary (${new Date().toLocaleDateString()}) - Topic: ${selectedTopic}\n` +
        `Total Duration: ${fmt(callTime)}\n` +
        `Key Insights Discussed: ${transcript.filter(t => t.who === 'ai').map(t => t.text).slice(0, 3).join(" | ")}`;
      setNotesGenerated(summaryText);
    }

    setInCall(false);
    setCameraOn(true);
    setMicOn(true);
    setAiSpeaking(false);
    setExpression("neutral");
    setUserSub("");
    setAiSub("");
  };

  // PRE-CALL TELEHEALTH HUB UI
  if (!inCall) {
    return (
      <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
        
        {/* HERO CONSULTATION CARD */}
        <div className="bg-gradient-to-br from-indigo-600 via-purple-700 to-slate-900 text-white p-8 sm:p-12 rounded-3xl shadow-2xl space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-400/10 blur-[100px] rounded-full pointer-events-none" />

          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left relative z-10">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-cyan-300 text-xs font-bold backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                <span>DEVGYA Tele-Mentoring Hub</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
                AI Video Consultation Studio
              </h1>
              <p className="text-slate-200 text-xs sm:text-sm font-medium leading-relaxed max-w-md">
                Real-time voice & video consultation with Socratic AI Mentor. Instant speech recognition, emotion detection, and automated session notes.
              </p>
            </div>

            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-white/10 border-2 border-white/20 flex flex-col items-center justify-center backdrop-blur-md shadow-2xl shrink-0">
              <Video className="w-10 h-10 text-cyan-300 mb-1 animate-pulse" />
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-300">
                ● Live 24/7
              </span>
            </div>
          </div>

          {/* TOPIC SELECTOR */}
          <div className="space-y-2 pt-2 border-t border-white/10 relative z-10">
            <label className="text-xs font-extrabold uppercase tracking-wider text-slate-300 block">
              Select Consultation Agenda
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {[
                "CBSE Exam Strategy & Problem Solving",
                "NCERT 5E Lesson Plan Guidance",
                "Parenting & Screen-Time Advice"
              ].map((tp) => (
                <button
                  key={tp}
                  onClick={() => setSelectedTopic(tp)}
                  className={`p-3 rounded-2xl text-xs font-bold text-left transition-all border ${
                    selectedTopic === tp
                      ? "bg-white text-indigo-900 border-white shadow-lg font-black"
                      : "bg-white/10 text-white border-white/10 hover:bg-white/20"
                  }`}
                >
                  {tp}
                </button>
              ))}
            </div>
          </div>

          {/* LANGUAGE PICKER */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-white/10 relative z-10">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-cyan-300" />
              <span className="text-xs font-bold text-slate-300">Spoken Language:</span>
              {LANGUAGES.map((l) => (
                <button
                  key={l.code}
                  onClick={() => setLanguage(l.code)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all border ${
                    language === l.code
                      ? "bg-white text-indigo-900 border-white shadow-md"
                      : "bg-white/10 text-slate-200 border-white/10 hover:bg-white/20"
                  }`}
                >
                  {l.flag} {l.label}
                </button>
              ))}
            </div>

            <button
              onClick={startCall}
              className="w-full sm:w-auto px-8 py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs rounded-2xl shadow-xl shadow-emerald-500/30 transition-all flex items-center justify-center gap-2 uppercase tracking-wider active:scale-95"
            >
              <Phone className="w-4 h-4" />
              <span>Launch Video Call Room</span>
            </button>
          </div>

        </div>

        {/* SESSION NOTES CARD */}
        {notesGenerated && (
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-lg space-y-3 animate-in fade-in duration-300">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-extrabold text-indigo-600 uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-600" />
                AI Generated Session Summary Notes
              </span>
              <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full font-bold">
                Saved to Profile
              </span>
            </div>
            <p className="text-xs text-slate-700 font-mono bg-slate-50 p-4 rounded-2xl border border-slate-200 leading-relaxed whitespace-pre-wrap">
              {notesGenerated}
            </p>
          </div>
        )}

      </div>
    );
  }

  // IN-CALL DEDICATED MOBILE & DESKTOP TELE-HEALTH VIDEO ROOM
  return (
    <div className="h-[calc(100vh-6.5rem)] flex flex-col relative overflow-hidden rounded-3xl border border-slate-200 bg-slate-950 text-white shadow-2xl">
      
      {/* MAIN VIDEO ROOM CONTAINER */}
      <div className="flex-1 relative bg-slate-900 rounded-2xl overflow-hidden">
        
        {/* USER VIDEO FEED */}
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          style={{
            display: cameraOn ? "block" : "none",
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transform: "scaleX(-1)"
          }}
        />

        {!cameraOn && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
            <div className="w-24 h-24 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center">
              <User className="w-12 h-12 text-slate-500" />
            </div>
          </div>
        )}

        {/* TOP STATUS BAR OVERLAY */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-20">
          <div className="flex items-center gap-2">
            <div className="px-3 py-1.5 bg-slate-950/80 backdrop-blur-md rounded-xl border border-white/10 flex items-center gap-2 shadow-lg">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
              <span className="text-white text-xs font-black">{fmt(callTime)}</span>
            </div>
            
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-indigo-600/80 backdrop-blur-md rounded-xl border border-indigo-400/30">
              <span className="text-white text-xs font-bold">{lang.flag} {lang.label}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* FACE EXPRESSION DETECTOR BADGE */}
            <div className="px-3 py-1.5 bg-slate-950/80 backdrop-blur-md rounded-xl border border-white/10 flex items-center gap-2 shadow-lg">
              <span className="text-base">{EXPR_EMOJI[expression] || "😐"}</span>
              <span className="text-white text-xs font-bold capitalize">{expression}</span>
            </div>

            <button
              onClick={() => setShowTranscript(!showTranscript)}
              className="p-2 bg-slate-950/80 hover:bg-slate-800 text-white backdrop-blur-md rounded-xl border border-white/10 shadow-lg transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* AI SUBTITLE / CAPTION BUBBLE */}
        {aiSub && (
          <div className="absolute bottom-24 left-4 right-4 z-20 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="bg-indigo-600/95 backdrop-blur-xl border border-indigo-400/40 rounded-2xl px-5 py-4 shadow-2xl max-w-xl mx-auto space-y-1.5">
              {aiSpeaking && (
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="w-1 bg-cyan-300 rounded-full animate-pulse" style={{ height: `${8 + Math.random() * 10}px`, animationDelay: `${i * 0.1}s` }} />
                    ))}
                  </div>
                  <span className="text-cyan-300 text-[10px] font-black uppercase tracking-wider">DEVGYA AI Mentor Speaking</span>
                </div>
              )}
              <p className="text-white text-xs sm:text-sm font-bold leading-relaxed">{aiSub}</p>
            </div>
          </div>
        )}

        {/* USER LIVE SPEECH CAPTION */}
        {userSub && !aiSub && (
          <div className="absolute bottom-24 left-4 right-4 z-20 animate-in fade-in duration-200">
            <div className="bg-slate-900/90 backdrop-blur-xl border border-white/20 rounded-2xl px-5 py-3 shadow-xl max-w-xl mx-auto">
              <div className="flex items-center gap-2 mb-1">
                <Mic className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                <span className="text-slate-300 text-[10px] font-bold uppercase tracking-wider">Listening to You</span>
              </div>
              <p className="text-white text-xs sm:text-sm font-semibold">{userSub}</p>
            </div>
          </div>
        )}

        {/* AI THINKING ANIMATION */}
        {aiThinking && !aiSub && (
          <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-20 px-5 py-3 bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl flex items-center gap-3 shadow-2xl">
            {[0, 1, 2].map((i) => (
              <div key={i} className="w-2.5 h-2.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
            ))}
            <span className="text-white text-xs font-bold">DEVGYA AI Processing Answer...</span>
          </div>
        )}

        {/* SLIDE-OUT TRANSCRIPT DRAWER */}
        {showTranscript && (
          <div className="absolute top-0 right-0 bottom-0 w-80 bg-slate-900/95 backdrop-blur-xl z-30 flex flex-col border-l border-white/10 shadow-2xl animate-in slide-in-from-right duration-300">
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-black text-white">
                <Bot className="w-4 h-4 text-indigo-400" />
                <span>Live Call Transcript</span>
              </div>
              <button onClick={() => setShowTranscript(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div ref={transcriptRef} className="flex-1 overflow-y-auto p-4 space-y-2.5">
              {transcript.map((m, i) => (
                <div key={i} className={`flex ${m.who === "you" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-xs font-medium ${
                    m.who === "you"
                      ? "bg-indigo-600 text-white rounded-br-xs"
                      : "bg-slate-800 text-slate-200 border border-white/10 rounded-bl-xs"
                  }`}>
                    {m.text}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* MOBILE-OPTIMIZED CONTROL DOCK */}
      <div className="p-4 bg-slate-900 border-t border-white/10 flex flex-wrap items-center justify-center gap-3 shadow-2xl z-20">
        
        <button
          onClick={toggleCamera}
          className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all cursor-pointer ${
            cameraOn ? "bg-white/10 hover:bg-white/20 text-white" : "bg-red-500/20 text-red-400 border border-red-500/40"
          }`}
          title={cameraOn ? "Turn Camera Off" : "Turn Camera On"}
        >
          {cameraOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
        </button>

        <button
          onClick={toggleMic}
          className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all cursor-pointer ${
            micOn ? "bg-white/10 hover:bg-white/20 text-white" : "bg-red-500/20 text-red-400 border border-red-500/40"
          }`}
          title={micOn ? "Mute Microphone" : "Unmute Microphone"}
        >
          {micOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
        </button>

        {/* TAP TO SPEAK / PUSH-TO-TALK MOBILE ACTION BUTTON */}
        <button
          onClick={() => {
            if (!micOn) toggleMic();
            stopListening();
            setTimeout(startListening, 100);
          }}
          disabled={aiSpeaking || aiThinking}
          className={`px-4 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
            aiSpeaking || aiThinking
              ? "bg-slate-800 text-slate-500 opacity-60 cursor-not-allowed"
              : "bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white shadow-lg shadow-indigo-600/30 active:scale-95"
          }`}
        >
          <Mic className="w-4 h-4 animate-pulse text-cyan-300" />
          <span>{aiSpeaking ? "AI Speaking..." : aiThinking ? "AI Thinking..." : "Speak Now"}</span>
        </button>

        {/* END CALL RED BUTTON */}
        <button
          onClick={endCall}
          className="w-12 h-12 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-lg shadow-red-600/40 active:scale-95 transition-transform cursor-pointer"
          title="End Consultation Call"
        >
          <PhoneOff className="w-5 h-5" />
        </button>

        <button
          onClick={() => setTtsEnabled(!ttsEnabled)}
          className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all cursor-pointer ${
            ttsEnabled ? "bg-white/10 hover:bg-white/20 text-white" : "bg-amber-500/20 text-amber-400 border border-amber-500/40"
          }`}
          title={ttsEnabled ? "Mute AI Voice" : "Enable AI Voice"}
        >
          {ttsEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
        </button>

        {/* MOBILE CHAT INPUT INLINE */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (textInput.trim()) {
              sendMessage(textInput.trim());
              setTextInput("");
            }
          }}
          className="flex items-center gap-2 shrink-0"
        >
          <input
            type="text"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder="Type query..."
            className="w-28 sm:w-48 px-3.5 py-2.5 text-xs rounded-xl border border-white/20 bg-white/10 text-white placeholder-slate-400 focus:outline-none focus:border-indigo-400 font-semibold"
          />
          <button
            type="submit"
            disabled={!textInput.trim() || aiThinking}
            className="p-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-xl transition-all cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

      </div>

    </div>
  );
}
