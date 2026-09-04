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
  Sparkles,
  Send,
  MessageSquare,
  X,
  Eye,
  SwitchCamera,
  CheckCircle2,
  HelpCircle,
  Camera
} from "lucide-react";
import { useAppStore } from "@/store/useAppStore";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "/api/v1";

// Helper: Clean markdown, LaTeX, and symbols so Hindi speech is natural
function cleanHindiTextForSpeech(rawText: string): string {
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
  // Remove markdown headers
  clean = clean.replace(/^#+\s+/gm, "");
  // Remove list bullets
  clean = clean.replace(/^[-*•]\s+/gm, "");
  clean = clean.replace(/^[0-9]+\.\s+/gm, "");
  clean = clean.replace(/>\s+/gm, "");
  clean = clean.replace(/[#_~*`]/g, "");

  // Remove emojis & decorative icons
  clean = clean.replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}]/gu, "");

  // Clean LaTeX notation $x^2$ -> x squared
  clean = clean.replace(/\$([^\$]+)\$/g, "$1");

  // Normalize whitespace & linebreaks
  clean = clean.replace(/\n+/g, "। ").replace(/\s{2,}/g, " ").trim();
  return clean;
}

// Helper: Pick Indian Hindi natural/neural voice from browser speechSynthesis
function getHindiVoice(): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices || voices.length === 0) return null;

  // 1. High-priority: Microsoft Swara / Madhur / Kalpana / Online Hindi Natural
  const hindiNeural = voices.find(v => v.lang.startsWith("hi") && (v.name.includes("Natural") || v.name.includes("Online")));
  if (hindiNeural) return hindiNeural;

  // 2. Google हिन्दी voice
  const googleHindi = voices.find(v => v.lang.startsWith("hi") && v.name.includes("Google"));
  if (googleHindi) return googleHindi;

  // 3. Named Hindi voices
  const namedHindi = voices.find(v => v.name.includes("Swara") || v.name.includes("Madhur") || v.name.includes("Kalpana") || v.name.includes("Hemant"));
  if (namedHindi) return namedHindi;

  // 4. Any Hindi language voice
  const anyHindi = voices.find(v => v.lang.startsWith("hi") || v.lang === "hi-IN" || v.lang === "hi_IN");
  if (anyHindi) return anyHindi;

  // Fallback to Indian accent voice if Hindi missing
  return voices.find(v => v.lang.includes("IN")) || voices[0] || null;
}

export function VideoConsultation() {
  const user = useAppStore((s) => s.user);

  // Call States
  const [inCall, setInCall] = useState(false);
  const [cameraOn, setCameraOn] = useState(true);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const [micOn, setMicOn] = useState(true);
  const [speakerOn, setSpeakerOn] = useState(true);
  const [aiSpeaking, setAiSpeaking] = useState(false);
  const [aiThinking, setAiThinking] = useState(false);
  const [callTime, setCallTime] = useState(0);

  // Subtitles & Captions (Hindi)
  const [userSub, setUserSub] = useState("");
  const [aiSub, setAiSub] = useState("");

  // Live Transcript & Text Typing Drawer
  const [textInput, setTextInput] = useState("");
  const [showChatModal, setShowChatModal] = useState(false);
  const [transcript, setTranscript] = useState<{ who: "you" | "ai"; text: string }[]>([]);

  // Media & Recognition Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<any>(null);
  const inCallRef = useRef(false);
  const micOnRef = useRef(true);
  const isAiSpeakingRef = useRef(false);
  const isAiThinkingRef = useRef(false);
  const aiSpeakingCooldownRef = useRef(0);
  const lastAiSpokenCleanRef = useRef("");
  const pendingSpeechRef = useRef<string>("");
  const silenceTimerRef = useRef<any>(null);
  const transcriptRef = useRef<HTMLDivElement>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => { inCallRef.current = inCall; }, [inCall]);
  useEffect(() => { micOnRef.current = micOn; }, [micOn]);
  useEffect(() => { transcriptRef.current?.scrollTo(0, 99999); }, [transcript]);

  // Load voices on mount
  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
      };
    }
  }, []);

  // Complete teardown when user exits the page, switches routes, or closes the tab
  useEffect(() => {
    const handleExit = () => {
      // 1. Immediately cut AI speech synthesis & neural audio
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current = null;
      }
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      // 2. Abort Speech Recognition
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch {}
        recognitionRef.current = null;
      }
      // 3. Stop Webcam and Microphone hardware streams
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      // 4. Clear all timers
      clearInterval(timerRef.current);
      clearTimeout(silenceTimerRef.current);
      // 5. Reset control flags
      inCallRef.current = false;
      isAiSpeakingRef.current = false;
      isAiThinkingRef.current = false;
    };

    window.addEventListener("beforeunload", handleExit);
    window.addEventListener("pagehide", handleExit);
    window.addEventListener("popstate", handleExit);

    return () => {
      handleExit();
      window.removeEventListener("beforeunload", handleExit);
      window.removeEventListener("pagehide", handleExit);
      window.removeEventListener("popstate", handleExit);
    };
  }, []);

  // Call timer
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

  // Camera Management & Switch Front/Back Camera
  const startCamera = useCallback(async (mode: "user" | "environment" = facingMode) => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      let s: MediaStream;
      try {
        s = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { exact: mode }, width: { ideal: 640 }, height: { ideal: 480 } },
          audio: false
        });
      } catch {
        s = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: mode, width: { ideal: 640 }, height: { ideal: 480 } },
          audio: false
        });
      }
      streamRef.current = s;
      if (videoRef.current) {
        videoRef.current.srcObject = s;
        videoRef.current.play().catch(() => {});
      }
      setCameraOn(true);
      setFacingMode(mode);
    } catch (err) {
      console.warn("Could not start camera:", err);
      setCameraOn(false);
    }
  }, [facingMode]);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
  }, []);

  const switchCamera = useCallback(async () => {
    const nextMode = facingMode === "user" ? "environment" : "user";
    await startCamera(nextMode);
  }, [facingMode, startCamera]);

  useEffect(() => {
    if (streamRef.current && videoRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch(() => {});
    }
  }, [inCall]);

  const toggleCamera = () => {
    const vt = streamRef.current?.getVideoTracks()[0];
    if (vt) {
      vt.enabled = !vt.enabled;
      setCameraOn(vt.enabled);
    } else {
      if (!cameraOn) {
        startCamera(facingMode);
      } else {
        setCameraOn(false);
      }
    }
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

  // CONTINUOUS LIVE STREAM SAMPLER: Continually tracks real-time video frames in memory
  const liveFrameRef = useRef<Blob | null>(null);

  useEffect(() => {
    if (!inCall || !cameraOn) return;
    const interval = setInterval(() => {
      if (!videoRef.current || !streamRef.current) return;
      const video = videoRef.current;
      if (video.videoWidth === 0 || video.videoHeight === 0 || video.readyState < 2) return;
      try {
        const canvas = document.createElement("canvas");
        let width = video.videoWidth;
        let height = video.videoHeight;
        const maxDim = 800;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(video, 0, 0, width, height);
          canvas.toBlob((blob) => {
            if (blob) liveFrameRef.current = blob;
          }, "image/jpeg", 0.85);
        }
      } catch {}
    }, 300);

    return () => clearInterval(interval);
  }, [inCall, cameraOn]);

  const captureCurrentFrame = useCallback((): Blob | null => {
    if (liveFrameRef.current) return liveFrameRef.current;
    if (!videoRef.current || !streamRef.current) return null;
    const video = videoRef.current;
    if (video.videoWidth === 0 || video.videoHeight === 0 || video.readyState < 2) return null;

    try {
      const canvas = document.createElement("canvas");
      let width = video.videoWidth;
      let height = video.videoHeight;
      const maxDim = 800;
      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return null;

      ctx.drawImage(video, 0, 0, width, height);

      const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
      const byteString = atob(dataUrl.split(",")[1]);
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      return new Blob([ab], { type: "image/jpeg" });
    } catch {
      return null;
    }
  }, []);

  // Cross-calling functional refs
  const startListeningRef = useRef<() => void>(() => {});
  const speakRef = useRef<(text: string) => void>(() => {});
  const sendMessageRef = useRef<(text: string) => Promise<void>>(async () => {});

  // Hindi Speech Recognition Engine (hi-IN)
  const stopListening = useCallback(() => {
    clearTimeout(silenceTimerRef.current);
    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch {}
      recognitionRef.current = null;
    }
  }, []);

  const startListening: () => void = useCallback(() => {
    if (recognitionRef.current) return;
    if (isAiSpeakingRef.current || isAiThinkingRef.current) return;

    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;

    try {
      const rec = new SR();
      rec.lang = "hi-IN";
      rec.continuous = true;
      rec.interimResults = true;
      rec.maxAlternatives = 1;

      rec.onstart = () => {
        pendingSpeechRef.current = "";
      };

      rec.onresult = (e: any) => {
        if (!inCallRef.current || !micOnRef.current) return;
        if (isAiSpeakingRef.current || isAiThinkingRef.current) return;
        if (Date.now() < aiSpeakingCooldownRef.current) return;

        let interim = "";
        let final = "";

        for (let i = e.resultIndex; i < e.results.length; i++) {
          const trans = e.results[i][0].transcript;
          if (e.results[i].isFinal) {
            final += trans + " ";
          } else {
            interim += trans;
          }
        }

        const candidateText = (final || interim).trim();
        if (!candidateText) return;

        // Filter out echo if AI just spoke similar words
        if (lastAiSpokenCleanRef.current && candidateText.length > 5) {
          if (lastAiSpokenCleanRef.current.includes(candidateText) || candidateText.includes(lastAiSpokenCleanRef.current.slice(0, 15))) {
            return;
          }
        }

        setUserSub(candidateText);
        pendingSpeechRef.current = (pendingSpeechRef.current + " " + final).trim() || candidateText;

        // Debounced silence trigger: sends spoken message automatically after 1.2s of silence
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = setTimeout(() => {
          const toSend = pendingSpeechRef.current.trim();
          if (toSend && toSend.length >= 2 && !isAiSpeakingRef.current && !isAiThinkingRef.current) {
            pendingSpeechRef.current = "";
            sendMessageRef.current(toSend);
          }
        }, 1200);
      };

      rec.onerror = (e: any) => {
        if (e.error === "not-allowed" || e.error === "service-not-allowed") {
          rec.abort();
          recognitionRef.current = null;
        }
      };

      rec.onend = () => {
        recognitionRef.current = null;
        if (inCallRef.current && micOnRef.current && !isAiSpeakingRef.current && !isAiThinkingRef.current) {
          setTimeout(() => {
            if (inCallRef.current && micOnRef.current && !isAiSpeakingRef.current && !isAiThinkingRef.current) {
              startListeningRef.current();
            }
          }, 300);
        }
      };

      recognitionRef.current = rec;
      rec.start();
    } catch {
      recognitionRef.current = null;
    }
  }, []);

  useEffect(() => {
    startListeningRef.current = startListening;
  }, [startListening]);

  // Hindi Natural Speech Output (TTS) with Indian Neural Engine & Web Speech Fallback
  const speak = useCallback((text: string) => {
    if (!speakerOn) {
      if (inCallRef.current && micOnRef.current) startListeningRef.current();
      return;
    }

    stopListening();
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }

    const spokenText = cleanHindiTextForSpeech(text);
    if (!spokenText) {
      if (inCallRef.current && micOnRef.current) startListeningRef.current();
      return;
    }

    lastAiSpokenCleanRef.current = spokenText.slice(0, 40);

    // Helper: Browser speech synthesis fallback
    const fallbackBrowserSpeech = () => {
      if (typeof window === "undefined" || !("speechSynthesis" in window)) {
        isAiSpeakingRef.current = false;
        setAiSpeaking(false);
        return;
      }
      const utt = new SpeechSynthesisUtterance(spokenText);
      utt.lang = "hi-IN";
      utt.rate = 1.0;
      utt.pitch = 1.05;
      const voice = getHindiVoice();
      if (voice) utt.voice = voice;

      utt.onstart = () => {
        isAiSpeakingRef.current = true;
        setAiSpeaking(true);
        stopListening();
      };
      utt.onend = () => {
        isAiSpeakingRef.current = false;
        setAiSpeaking(false);
        aiSpeakingCooldownRef.current = Date.now() + 800;
        setTimeout(() => {
          if (inCallRef.current && micOnRef.current) startListeningRef.current();
        }, 400);
      };
      utt.onerror = () => {
        isAiSpeakingRef.current = false;
        setAiSpeaking(false);
        setTimeout(() => {
          if (inCallRef.current && micOnRef.current) startListeningRef.current();
        }, 400);
      };
      window.speechSynthesis.speak(utt);
    };

    // Primary: Microsoft hi-IN-SwaraNeural via backend streaming
    try {
      const streamUrl = `${API_BASE}/tts/speak?voice=hi-IN-SwaraNeural&text=${encodeURIComponent(spokenText)}`;
      const audio = new Audio(streamUrl);
      currentAudioRef.current = audio;

      audio.onplay = () => {
        isAiSpeakingRef.current = true;
        setAiSpeaking(true);
        stopListening();
      };

      audio.onended = () => {
        isAiSpeakingRef.current = false;
        setAiSpeaking(false);
        currentAudioRef.current = null;
        aiSpeakingCooldownRef.current = Date.now() + 800;
        setTimeout(() => {
          if (inCallRef.current && micOnRef.current) startListeningRef.current();
        }, 400);
      };

      audio.onerror = () => {
        fallbackBrowserSpeech();
      };

      audio.play().catch(() => {
        fallbackBrowserSpeech();
      });
    } catch {
      fallbackBrowserSpeech();
    }
  }, [speakerOn, stopListening]);

  useEffect(() => {
    speakRef.current = speak;
  }, [speak]);

  // AI Response Stream in Hindi with LIVE REAL-TIME CAMERA VISION
  const sendMessage: (text: string) => Promise<void> = useCallback(async (text: string) => {
    if (!text.trim() || isAiThinkingRef.current) return;

    stopListening();
    isAiThinkingRef.current = true;
    setAiThinking(true);
    setUserSub("");
    setTranscript((p) => [...p, { who: "you", text }]);

    try {
      const fd = new FormData();
      const promptDirective = `[लाइव 1-ON-1 वीडियो एवं विज़न परामर्श सत्र]: आप DEVGYA के वरिष्ठ AI लाइव वीडियो एवं विज़न शिक्षक (Senior Live Video AI Mentor) हैं। आप उपयोगकर्ता के साथ लाइव वीडियो कॉल पर हैं और आपके सामने उपयोगकर्ता का लाइव कैमरा विज़न फ्रेम (Live Camera Vision) संलग्न है। 
आपको उपयोगकर्ता की हर गतिविधि, चेहरे के भाव (खुश/मुस्कुराना, उदास, गुस्सा, विचारशील, हैरान), उँगलियों के इशारे (1, 2, 3, 4, 5 उँगलियाँ दिखाना, थम्ब्स अप, विक्ट्री साइन), कपड़े, हाथ में पकड़ी किताब/कॉपी/नोट्स या आस-पास की वस्तुएं स्पष्ट रूप से दिखाई दे रही हैं। 
जब भी उपयोगकर्ता पूछे कि 'मैं कितनी उंगलियां दिखा रहा हूँ?', 'मेरे चेहरे के क्या भाव हैं / मैं खुश हूँ या उदास?', 'क्या आप मेरी कॉपी देख सकते हैं?' या कोई भी सवाल पूछे, तो संलग्न लाइव कैमरा चित्र को ध्यान से देखकर तुरंत सटीक, प्राकृतिक, और अत्यंत स्पष्ट हिंदी (Hindi Devanagari) में 2 से 3 संक्षिप्त वाक्यों में उत्तर दें। कभी यह न कहें कि आप देख नहीं सकते — आप लाइव कैमरे से सब कुछ देख रहे हैं। 
उपयोगकर्ता का प्रश्न: "${text}"`;
      
      fd.append("message", promptDirective);
      fd.append("agent_code", "video_consultant");
      fd.append("user_id", user?.id || "anonymous");
      fd.append("language", "hindi"); // Strictly Hindi

      // ATTACH LIVE REAL-TIME CAMERA SNAPSHOT FOR VISION
      const frameBlob = captureCurrentFrame();
      if (frameBlob) {
        fd.append("images", frameBlob, "live_camera_snapshot.jpg");
      }

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
        setAiSub(full);
        setTranscript((p) => [...p, { who: "ai", text: full }]);
        isAiThinkingRef.current = false;
        setAiThinking(false);
        speakRef.current(full);
      } else {
        const d = await res.json();
        const t = d.response || "नमस्ते! मैं आपकी पूरी सहायता और मार्गदर्शन के लिए यहाँ प्रस्तुत हूँ।";
        setAiSub(t);
        setTranscript((p) => [...p, { who: "ai", text: t }]);
        isAiThinkingRef.current = false;
        setAiThinking(false);
        speakRef.current(t);
      }
    } catch {
      setAiSub("नेटवर्क समस्या। कृपया पुनः प्रयास करें।");
      isAiThinkingRef.current = false;
      setAiThinking(false);
      if (inCallRef.current && micOnRef.current) startListeningRef.current();
    }
  }, [user?.id, stopListening, captureCurrentFrame]);

  useEffect(() => {
    sendMessageRef.current = sendMessage;
  }, [sendMessage]);

  // Start / End Consultation
  const startCall = async () => {
    await startCamera(facingMode);
    setInCall(true);
    setTranscript([]);
    const welcomeMsg = "नमस्ते! मैं आपका DEVGYA AI लाइव वीडियो एवं विज़न शिक्षक हूँ। मेरा कैमरा और विज़न सक्रिय है — आप मुझे कुछ भी दिखा सकते हैं (जैसे उँगलियाँ, चेहरे के भाव, या अपनी कॉपी) और कोई भी सवाल पूछ सकते हैं!";
    setAiSub(welcomeMsg);
    setTranscript([{ who: "ai", text: welcomeMsg }]);
    speak(welcomeMsg);
  };

  const endCall = () => {
    isAiSpeakingRef.current = false;
    isAiThinkingRef.current = false;
    stopListening();
    stopCamera();
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }

    setInCall(false);
    setCameraOn(true);
    setMicOn(true);
    setAiSpeaking(false);
    setAiThinking(false);
    setUserSub("");
    setAiSub("");
  };

  // ========================================================
  // PRE-CALL SETUP SCREEN (CLEAN, DIRECT & VISION READY)
  // ========================================================
  if (!inCall) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 pb-12 px-2 sm:px-4 animate-in fade-in duration-300">
        
        {/* HERO BANNER */}
        <div className="bg-gradient-to-br from-indigo-700 via-purple-800 to-slate-900 text-white p-6 sm:p-10 rounded-3xl shadow-xl space-y-6 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-emerald-300 text-xs font-black backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                <span>100% लाइव AI विज़न एवं हिंदी वीडियो परामर्श (Live Vision Tutor)</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
                AI लाइव वीडियो परामर्श केंद्र
              </h1>
              <p className="text-slate-200 text-xs sm:text-sm font-medium leading-relaxed max-w-lg">
                अपने व्यक्तिगत AI शिक्षक के साथ सीधे 1-on-1 लाइव वीडियो में बातचीत करें। AI आपके चेहरे के भाव, उँगलियों के इशारे और नोट्स देखकर तुरंत उत्तर देगा।
              </p>
            </div>

            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-white/10 border border-white/20 flex flex-col items-center justify-center backdrop-blur-md shadow-lg shrink-0">
              <Video className="w-8 h-8 sm:w-10 sm:h-10 text-cyan-300 mb-1 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-300">
                ● विज़न सक्रिय
              </span>
            </div>
          </div>

          {/* LIVE CAPABILITIES RADAR */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-white/10">
            <div className="p-3.5 rounded-2xl bg-white/10 border border-white/10 flex items-start gap-3">
              <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300 shrink-0">
                <Eye className="w-4 h-4" />
              </div>
              <div className="space-y-0.5 min-w-0">
                <p className="text-xs font-black text-white">लाइव AI विज़न (Vision)</p>
                <p className="text-[11px] text-slate-300 font-medium leading-tight">
                  उँगलियाँ गिनना, चेहरे के भाव (खुश/उदास/गुस्सा), कॉपी व किताबें देखना
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/10 border border-white/10 flex items-start gap-3">
              <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300 shrink-0">
                <Mic className="w-4 h-4" />
              </div>
              <div className="space-y-0.5 min-w-0">
                <p className="text-xs font-black text-white">शुद्ध हिंदी संवाद (Neural Voice)</p>
                <p className="text-[11px] text-slate-300 font-medium leading-tight">
                  प्राकृतिक बोले जाने वाली हिंदी आवाज़ और लाइव स्पीच रिकॉग्निशन
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/10 border border-white/10 flex items-start gap-3">
              <div className="p-2 rounded-xl bg-purple-500/20 text-purple-300 shrink-0">
                <SwitchCamera className="w-4 h-4" />
              </div>
              <div className="space-y-0.5 min-w-0">
                <p className="text-xs font-black text-white">फ्रंट व बैक कैमरा (Flip Camera)</p>
                <p className="text-[11px] text-slate-300 font-medium leading-tight">
                  रियर कैमरे से कॉपी/किताब दिखाएं और फ्रंट से चेहरा दिखाएं
                </p>
              </div>
            </div>
          </div>

          {/* LAUNCH BUTTON */}
          <div className="pt-2 flex justify-end">
            <button
              onClick={startCall}
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-black text-sm rounded-2xl shadow-xl shadow-emerald-500/30 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 uppercase tracking-wider"
            >
              <Phone className="w-4 h-4" />
              <span>लाइव वीडियो कॉल शुरू करें (Start Live Call)</span>
            </button>
          </div>

        </div>

      </div>
    );
  }

  // ========================================================
  // IN-CALL SCREEN (STREAMLINED MOBILE & DESKTOP VIDEO ROOM)
  // ========================================================
  return (
    <div className="h-[calc(100dvh-5.5rem)] flex flex-col relative overflow-hidden rounded-3xl bg-slate-950 text-white shadow-2xl border border-slate-800">
      
      {/* 1. TOP BAR */}
      <header className="px-4 py-3 bg-slate-900/90 backdrop-blur-md border-b border-white/10 flex items-center justify-between z-20 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-red-500/20 border border-red-500/30 rounded-full">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            <span className="text-xs font-black text-red-300">{fmt(callTime)}</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-cyan-500/10 border border-cyan-500/30 rounded-full text-cyan-300 text-[11px] font-black">
            <Eye className="w-3 h-3" />
            <span>AI विज़न कनेक्टेड</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowChatModal(true)}
            className="p-2 bg-white/10 hover:bg-white/20 text-slate-200 rounded-xl transition cursor-pointer flex items-center gap-1 text-xs font-bold"
            title="चैट संदेश देखें"
          >
            <MessageSquare className="w-4 h-4 text-cyan-300" />
            <span className="hidden sm:inline">चैट</span>
          </button>

          <button
            onClick={endCall}
            className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-black rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-sm"
          >
            <PhoneOff className="w-3.5 h-3.5" />
            <span>समाप्त</span>
          </button>
        </div>
      </header>

      {/* 2. MAIN CALL STAGE */}
      <main className="flex-1 relative flex flex-col items-center justify-center p-4 overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950">
        
        {/* CANDIDATE COMPACT PiP CAMERA THUMBNAIL */}
        <div className="absolute top-3 right-3 z-30 w-28 h-36 sm:w-36 sm:h-48 rounded-2xl overflow-hidden bg-slate-900 border-2 border-white/20 shadow-2xl">
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            style={{
              display: cameraOn ? "block" : "none",
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transform: facingMode === "user" ? "scaleX(-1)" : "none"
            }}
          />
          {!cameraOn && (
            <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 bg-slate-800">
              <User className="w-8 h-8 mb-1" />
              <span className="text-[9px] font-bold text-slate-400">कैमरा बंद</span>
            </div>
          )}
          
          {/* FLIP CAMERA BUTTON (TOP RIGHT OF PiP) */}
          <button
            onClick={switchCamera}
            className="absolute top-1.5 right-1.5 p-1.5 bg-black/60 hover:bg-black/80 rounded-xl text-white backdrop-blur-md cursor-pointer transition active:scale-90 border border-white/20"
            title={facingMode === "user" ? "बैक कैमरा चालू करें (Switch to Rear Camera)" : "फ्रंट कैमरा चालू करें (Switch to Selfie Camera)"}
          >
            <SwitchCamera className="w-3.5 h-3.5 text-cyan-300" />
          </button>

          {/* TOGGLE CAMERA ON/OFF (BOTTOM RIGHT OF PiP) */}
          <button
            onClick={toggleCamera}
            className="absolute bottom-1.5 right-1.5 p-1.5 bg-black/60 hover:bg-black/80 rounded-xl text-white backdrop-blur-md cursor-pointer transition active:scale-90 border border-white/20"
            title={cameraOn ? "कैमरा बंद करें" : "कैमरा चालू करें"}
          >
            {cameraOn ? <Video className="w-3.5 h-3.5 text-emerald-400" /> : <VideoOff className="w-3.5 h-3.5 text-red-400" />}
          </button>
        </div>

        {/* AI AVATAR & SOUND WAVE VISUALIZER */}
        <div className="flex flex-col items-center justify-center space-y-4 my-auto relative z-10">
          <div className="relative">
            {/* Pulsing Aura */}
            {aiSpeaking && (
              <div className="absolute -inset-4 rounded-full bg-gradient-to-r from-cyan-500 to-indigo-500 opacity-60 blur-xl animate-pulse" />
            )}
            {aiThinking && (
              <div className="absolute -inset-4 rounded-full bg-gradient-to-r from-amber-500 to-purple-500 opacity-50 blur-xl animate-spin" />
            )}

            <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-gradient-to-tr from-indigo-600 to-cyan-500 border-4 border-white/30 flex items-center justify-center shadow-2xl relative">
              <Bot className={`w-14 h-14 sm:w-18 sm:h-18 text-white transition-transform ${aiSpeaking ? "scale-110" : "scale-100"}`} />
            </div>
          </div>

          {/* AI STATUS BADGE */}
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-md">
            {aiSpeaking ? (
              <div className="flex items-center gap-1.5 text-cyan-300 text-xs font-black">
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-1 bg-cyan-300 rounded-full animate-pulse" style={{ height: `${10 + (i % 2) * 6}px` }} />
                  ))}
                </div>
                <span>शिक्षक बोल रहे हैं...</span>
              </div>
            ) : aiThinking ? (
              <div className="flex items-center gap-2 text-amber-300 text-xs font-black">
                <div className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                <span>विज़न व उत्तर तैयार किया जा रहा है...</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-black">
                <Mic className="w-3.5 h-3.5 animate-pulse" />
                <span>आपकी आवाज़ व कैमरा देखा जा रहा है...</span>
              </div>
            )}
          </div>
        </div>

        {/* LIVE HINDI SUBTITLES / CAPTION CARD */}
        {(aiSub || userSub) && (
          <div className="w-full max-w-lg mb-3 z-20 animate-in fade-in duration-200">
            <div className={`p-4 rounded-2xl shadow-xl border backdrop-blur-xl ${
              aiSub 
                ? "bg-indigo-900/90 border-indigo-400/40 text-white" 
                : "bg-slate-900/90 border-white/20 text-slate-100"
            }`}>
              <div className="flex items-center gap-2 mb-1">
                {aiSub ? (
                  <>
                    <Bot className="w-3.5 h-3.5 text-cyan-300" />
                    <span className="text-[11px] font-black uppercase text-cyan-300">DEVGYA AI शिक्षक:</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-[11px] font-black uppercase text-emerald-300">आप पूछ रहे हैं:</span>
                  </>
                )}
              </div>
              <p className="text-xs sm:text-sm font-semibold leading-relaxed">
                {aiSub || userSub}
              </p>
            </div>
          </div>
        )}

      </main>

      {/* 3. ERGONOMIC MOBILE & DESKTOP BOTTOM CONTROLS */}
      <footer className="p-3.5 sm:p-4 bg-slate-900 border-t border-white/10 flex flex-wrap items-center justify-center gap-2.5 sm:gap-4 z-20 shrink-0">
        
        {/* CAMERA ON/OFF TOGGLE */}
        <button
          onClick={toggleCamera}
          className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center transition-all cursor-pointer shadow-md ${
            cameraOn ? "bg-white/10 hover:bg-white/20 text-white" : "bg-red-500/20 text-red-400 border border-red-500/40"
          }`}
          title={cameraOn ? "कैमरा बंद करें" : "कैमरा चालू करें"}
        >
          {cameraOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
        </button>

        {/* SWITCH TO BACK / FRONT CAMERA */}
        <button
          onClick={switchCamera}
          disabled={!cameraOn}
          className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center transition-all cursor-pointer shadow-md ${
            facingMode === "environment"
              ? "bg-cyan-600 hover:bg-cyan-500 text-white border border-cyan-400/50"
              : "bg-white/10 hover:bg-white/20 text-white"
          } ${!cameraOn ? "opacity-40 cursor-not-allowed" : ""}`}
          title={facingMode === "user" ? "बैक कैमरे पर बदलें (Switch to Rear Camera)" : "फ्रंट कैमरे पर बदलें (Switch to Front Camera)"}
        >
          <SwitchCamera className="w-5 h-5 text-cyan-300" />
        </button>

        {/* MIC TOGGLE */}
        <button
          onClick={toggleMic}
          className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center transition-all cursor-pointer shadow-md ${
            micOn ? "bg-emerald-600 hover:bg-emerald-500 text-white" : "bg-red-500/20 text-red-400 border border-red-500/40"
          }`}
          title={micOn ? "माइक म्यूट करें" : "माइक चालू करें"}
        >
          {micOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
        </button>

        {/* TAP TO SPEAK / PUSH TO TALK */}
        <button
          onClick={() => {
            if (!micOn) toggleMic();
            stopListening();
            setTimeout(startListening, 100);
          }}
          disabled={aiSpeaking || aiThinking}
          className={`px-4 sm:px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
            aiSpeaking || aiThinking
              ? "bg-slate-800 text-slate-500 opacity-60 cursor-not-allowed"
              : "bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white shadow-lg shadow-indigo-600/30 active:scale-95"
          }`}
        >
          <Mic className="w-4 h-4 animate-pulse text-cyan-300" />
          <span>{aiSpeaking ? "शिक्षक बोल रहे हैं" : aiThinking ? "सोच रहे हैं..." : "बोलें (Speak)"}</span>
        </button>

        {/* SPEAKER AI VOICE TOGGLE */}
        <button
          onClick={() => setSpeakerOn(!speakerOn)}
          className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center transition-all cursor-pointer shadow-md ${
            speakerOn ? "bg-white/10 hover:bg-white/20 text-white" : "bg-amber-500/20 text-amber-400 border border-amber-500/40"
          }`}
          title={speakerOn ? "आवाज़ म्यूट करें" : "आवाज़ चालू करें"}
        >
          {speakerOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
        </button>

        {/* END CALL DISCONNECT BUTTON */}
        <button
          onClick={endCall}
          className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-lg shadow-red-600/40 active:scale-95 transition-transform cursor-pointer"
          title="कॉल समाप्त करें"
        >
          <PhoneOff className="w-5 h-5" />
        </button>

      </footer>

      {/* 4. OPTIONAL TEXT CHAT MODAL (FOR TYPING WITHOUT CLUTTER) */}
      {showChatModal && (
        <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-xl z-50 flex flex-col animate-in fade-in duration-200">
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-black text-white">
              <MessageSquare className="w-4 h-4 text-cyan-300" />
              <span>सत्र संदेश एवं बातचीत (Live Chat)</span>
            </div>
            <button
              onClick={() => setShowChatModal(false)}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div ref={transcriptRef} className="flex-1 overflow-y-auto p-4 space-y-3">
            {transcript.map((m, i) => (
              <div key={i} className={`flex ${m.who === "you" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-xs font-semibold leading-relaxed ${
                  m.who === "you"
                    ? "bg-indigo-600 text-white rounded-br-xs"
                    : "bg-slate-800 text-slate-200 border border-white/10 rounded-bl-xs"
                }`}>
                  <p className="text-[10px] font-black uppercase text-slate-300 mb-0.5">
                    {m.who === "you" ? "आप" : "DEVGYA AI शिक्षक"}
                  </p>
                  <p>{m.text}</p>
                </div>
              </div>
            ))}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (textInput.trim()) {
                sendMessage(textInput.trim());
                setTextInput("");
              }
            }}
            className="p-3 border-t border-white/10 flex gap-2"
          >
            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="यहाँ टाइप करें (Type message)..."
              className="flex-1 bg-slate-900 border border-white/20 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
            <button
              type="submit"
              disabled={!textInput.trim() || aiThinking || aiSpeaking}
              className="p-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-xl cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

    </div>
  );
}
