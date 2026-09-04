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
  CheckCircle2,
  ChevronDown,
  Globe,
  Award,
  BookOpen,
  Users,
  GraduationCap,
  MessageSquare,
  Zap,
  Play,
  Pause
} from "lucide-react";
import { useAppStore } from "@/store/useAppStore";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "/api/v1";

interface VoiceOption {
  code: string;
  name: string;
  gender: "Female" | "Male";
  lang: string;
  accent: string;
}

const INDIAN_VOICES: VoiceOption[] = [
  { code: "en-IN-NeerjaNeural", name: "Neerja", gender: "Female", lang: "en-IN", accent: "Indian English (Educator)" },
  { code: "en-IN-PrabhatNeural", name: "Prabhat", gender: "Male", lang: "en-IN", accent: "Indian English (Teacher)" },
  { code: "hi-IN-SwaraNeural", name: "Swara", gender: "Female", lang: "hi-IN", accent: "Hindi / Hinglish (Mentor)" },
  { code: "hi-IN-MadhurNeural", name: "Madhur", gender: "Male", lang: "hi-IN", accent: "Hindi / Hinglish (Coach)" }
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
    starterPrompt: "Hello! I am ready to practice classroom instructions in English. How should I politely instruct students to settle down and open chapter 4?",
    starterDisplay: "Welcome teacher! Let us practice classroom commands. How would you ask your students to open their books and start reading?",
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
    starterPrompt: "Hello coach! Let us roleplay a parent-teacher meeting. A parent is anxious about their child's marks.",
    starterDisplay: "Hello! In PTMs, always start with a student strength before addressing concerns. What would you like to say to the parent first?",
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
    starterPrompt: "Hello coach! I want to practice requesting resources for our school science exhibition from the Principal.",
    starterDisplay: "Good day! Presenting to school leadership requires clarity and purpose. What is the main objective of your proposal?",
    quickStarters: [
      "I would like to propose an inter-house science exhibition.",
      "We require permission to use the school auditorium next Friday.",
      "Here is the tentative schedule and budget for the event."
    ]
  },
  {
    id: "free_fluency",
    title: "Daily Free Spoken Fluency",
    shortTitle: "Daily Fluency",
    icon: MessageSquare,
    starterPrompt: "Hello coach! Let us have a spontaneous English conversation about modern teaching methods.",
    starterDisplay: "Hello! Daily spontaneous conversation builds confidence rapidly. What was the most interesting moment in your classroom this week?",
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
    starterPrompt: "Hello coach! Give me a pronunciation exercise for commonly mispronounced words.",
    starterDisplay: "Let us polish your phonetics! Try practicing the difference between /v/ (Very) and /w/ (Water).",
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

  // Real-time voice states
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState<boolean>(false);
  const [isAiThinking, setIsAiThinking] = useState<boolean>(false);
  const [soundMuted, setSoundMuted] = useState<boolean>(false);
  const [micPermissionError, setMicPermissionError] = useState<string | null>(null);

  // Spoken text & subtitles
  const [liveTranscript, setLiveTranscript] = useState<string>("");
  const [lastUserSpeech, setLastUserSpeech] = useState<string>("");
  const [coachResponse, setCoachResponse] = useState<string>(PRACTICE_SCENARIOS[0].starterDisplay);
  const [latestFeedback, setLatestFeedback] = useState<FeedbackItem | null>(null);
  const [textInput, setTextInput] = useState<string>("");

  // Refs
  const recognitionRef = useRef<any>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const isListeningRef = useRef(false);
  const isAiSpeakingRef = useRef(false);
  const isAiThinkingRef = useRef(false);
  const soundMutedRef = useRef(false);
  const speechBufferRef = useRef<string>("");
  const silenceTimerRef = useRef<any>(null);

  // Keep refs synced
  useEffect(() => { isListeningRef.current = isListening; }, [isListening]);
  useEffect(() => { isAiSpeakingRef.current = isAiSpeaking; }, [isAiSpeaking]);
  useEffect(() => { isAiThinkingRef.current = isAiThinking; }, [isAiThinking]);
  useEffect(() => { soundMutedRef.current = soundMuted; }, [soundMuted]);

  // Clean text helper for speech
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

  // Play Neural TTS with fallback
  const playCoachAudio = useCallback((textToSpeak: string, customVoice?: string) => {
    if (soundMutedRef.current) return;

    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }

    const cleanText = cleanForSpeech(textToSpeak);
    if (!cleanText) return;

    const voice = customVoice || selectedVoice;
    setIsAiSpeaking(true);

    try {
      const streamUrl = `${API_BASE}/tts/speak?voice=${encodeURIComponent(voice)}&text=${encodeURIComponent(cleanText)}`;
      const audio = new Audio(streamUrl);
      currentAudioRef.current = audio;

      audio.onplay = () => {
        setIsAiSpeaking(true);
      };

      audio.onended = () => {
        setIsAiSpeaking(false);
        currentAudioRef.current = null;
      };

      audio.onerror = () => {
        // Fallback to browser Web Speech API
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
      utt.onend = () => setIsAiSpeaking(false);
      utt.onerror = () => setIsAiSpeaking(false);
      window.speechSynthesis.speak(utt);
    } else {
      setIsAiSpeaking(false);
    }
  };

  // Send message to Backend AI Coach
  const handleSendMessage = useCallback(async (text: string) => {
    const input = text.trim();
    if (!input || isAiThinkingRef.current) return;

    // Stop listening while thinking
    stopListening();
    setIsAiThinking(true);
    setLastUserSpeech(input);
    setLiveTranscript("");
    setMicPermissionError(null);

    try {
      const modeInstruction = immersionMode === "immersion"
        ? "Respond in natural, elegant, encouraging Indian/Global English. Help the educator speak with confidence."
        : "The educator is in bilingual mode. Provide English coaching with simple Hindi hints where helpful.";

      const promptDirective = `[TEACHER ENGLISH SPEAKING COACH]
Topic: ${activeScenario.title}
Mode: ${immersionMode} (${modeInstruction})
Teacher Spoke: "${input}"

Instructions:
1. Provide a warm, concise spoken peer response (2 sentences max).
2. If there is a grammatical slip or phrasing improvement, provide:
✨ Better Phrasing: "[Polished teacher phrasing]"
💡 Tip: [Brief 1-sentence tip on vocabulary or tone]
3. Ask a brief question to keep the conversation flowing naturally.`;

      const fd = new FormData();
      fd.append("message", promptDirective);
      fd.append("agent_code", "english_coach");
      fd.append("user_id", user?.id || "teacher");
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
          setCoachResponse(fullAiText);
        }

        try {
          const parsed = JSON.parse(fullAiText);
          fullAiText = parsed.response || fullAiText;
        } catch {}

        setCoachResponse(fullAiText);
        parseFeedback(fullAiText, input);
        setIsAiThinking(false);
        playCoachAudio(fullAiText);
      } else {
        const data = await res.json();
        const fullAiText = data.response || "Well said! Let us continue practicing.";
        setCoachResponse(fullAiText);
        parseFeedback(fullAiText, input);
        setIsAiThinking(false);
        playCoachAudio(fullAiText);
      }
    } catch (err) {
      console.error("Coach error:", err);
      setIsAiThinking(false);
      const fallbackMsg = "I caught that! Could you please try repeating that line once more?";
      setCoachResponse(fallbackMsg);
      playCoachAudio(fallbackMsg);
    }
  }, [immersionMode, activeScenario, user?.id, playCoachAudio]);

  // Robust Direct Speech Recognition Trigger
  const startListening = () => {
    setMicPermissionError(null);
    if (typeof window === "undefined") return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setMicPermissionError("Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari, or use text typing below.");
      return;
    }

    // Abort existing audio or recognition
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
      setIsAiSpeaking(false);
    }
    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch {}
      recognitionRef.current = null;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = immersionMode === "immersion" ? "en-IN" : "hi-IN";
      recognition.continuous = false; // single-turn mode is far more reliable across mobile & desktop!
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        speechBufferRef.current = "";
        setLiveTranscript("Listening... speak now");
      };

      recognition.onresult = (event: any) => {
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
          setLiveTranscript(currentText);
          speechBufferRef.current = (speechBufferRef.current + " " + final).trim() || currentText;

          // Auto-send on silence after final speech
          clearTimeout(silenceTimerRef.current);
          silenceTimerRef.current = setTimeout(() => {
            const toSend = speechBufferRef.current.trim();
            if (toSend.length >= 2 && !isAiThinkingRef.current) {
              speechBufferRef.current = "";
              stopListening();
              handleSendMessage(toSend);
            }
          }, 1500);
        }
      };

      recognition.onerror = (e: any) => {
        console.warn("Speech recognition notice:", e.error);
        setIsListening(false);
        if (e.error === "not-allowed" || e.error === "permission-denied") {
          setMicPermissionError("Microphone permission was denied. Please allow microphone access in your browser settings to speak.");
        } else if (e.error === "no-speech") {
          setLiveTranscript("No speech detected. Tap microphone to speak again.");
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        const finalCandidate = speechBufferRef.current.trim();
        if (finalCandidate.length >= 2 && !isAiThinkingRef.current) {
          speechBufferRef.current = "";
          handleSendMessage(finalCandidate);
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      console.warn("Could not start recognition:", err);
      setIsListening(false);
      setMicPermissionError("Could not access microphone. Tap the mic button to grant permission or type below.");
    }
  };

  const stopListening = () => {
    clearTimeout(silenceTimerRef.current);
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch {}
      recognitionRef.current = null;
    }
    setIsListening(false);
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
      const candidate = speechBufferRef.current.trim() || liveTranscript.trim();
      if (candidate && candidate !== "Listening... speak now") {
        speechBufferRef.current = "";
        handleSendMessage(candidate);
      }
    } else {
      startListening();
    }
  };

  // Cleanup
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
    <div className="min-h-[calc(100vh-4rem)] p-3 md:p-6 max-w-4xl mx-auto flex flex-col justify-between space-y-4">
      
      {/* 1. TOP HEADER & CONTROLS (COMPACT & CLEAN ON MOBILE) */}
      <div className="glass-panel p-4 rounded-3xl border border-slate-200/80 bg-white shadow-xs">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500 to-indigo-600 flex items-center justify-center text-white shadow-sm shrink-0">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base md:text-lg font-black text-slate-900 leading-tight">
                English Speaking Coach
              </h1>
              <p className="text-[11px] text-slate-500 font-medium">
                Live educator speech training
              </p>
            </div>
          </div>

          {/* QUICK MODE TOGGLES */}
          <div className="flex items-center gap-2">
            {/* Voice Dropdown */}
            <div className="relative">
              <select
                value={selectedVoice}
                onChange={(e) => setSelectedVoice(e.target.value)}
                className="appearance-none pl-7 pr-7 py-1.5 bg-slate-100 text-xs font-bold text-slate-800 rounded-xl border border-slate-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                {INDIAN_VOICES.map((v) => (
                  <option key={v.code} value={v.code}>
                    {v.gender === "Female" ? "👩" : "👨"} {v.name}
                  </option>
                ))}
              </select>
              <Sparkles className="w-3 h-3 text-indigo-600 absolute left-2.5 top-2.5 pointer-events-none" />
              <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2 top-2.5 pointer-events-none" />
            </div>

            {/* Immersion Mode */}
            <button
              onClick={() => setImmersionMode(prev => prev === "immersion" ? "bilingual" : "immersion")}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 border transition-all ${
                immersionMode === "immersion"
                  ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                  : "bg-amber-50 text-amber-800 border-amber-200"
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{immersionMode === "immersion" ? "Pure English" : "Hinglish Mode"}</span>
              <span className="sm:hidden">{immersionMode === "immersion" ? "ENG" : "HIN"}</span>
            </button>
          </div>
        </div>

        {/* COMPACT SCENARIO PILLS */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-3 pb-1 scrollbar-none border-t border-slate-100 mt-3">
          {PRACTICE_SCENARIOS.map((sc) => {
            const Icon = sc.icon;
            const isSelected = activeScenario.id === sc.id;
            return (
              <button
                key={sc.id}
                onClick={() => {
                  setActiveScenario(sc);
                  setCoachResponse(sc.starterDisplay);
                  setLatestFeedback(null);
                  playCoachAudio(sc.starterDisplay);
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

      {/* 2. MAIN INTERACTIVE VOICE STAGE (RESPONSIVE & TOUCH-OPTIMIZED) */}
      <div className="glass-panel p-5 md:p-8 rounded-3xl border border-slate-200/80 bg-white shadow-sm flex flex-col items-center justify-center text-center space-y-5 relative overflow-hidden flex-1 min-h-[360px]">
        
        {/* BACKGROUND AMBIENT GLOW */}
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full blur-3xl pointer-events-none transition-all duration-700 ${
          isListening ? "bg-emerald-400/20 scale-125" : isAiSpeaking ? "bg-rose-400/20 scale-125" : "bg-indigo-400/10"
        }`} />

        {/* MIC PERMISSION ALERT */}
        {micPermissionError && (
          <div className="w-full max-w-md p-3 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 font-medium text-left flex items-start gap-2">
            <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Microphone Notice</p>
              <p className="mt-0.5">{micPermissionError}</p>
            </div>
          </div>
        )}

        {/* AI COACH SPEECH SUBTITLE BUBBLE */}
        <div className="w-full max-w-lg z-10">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 shadow-xs relative">
            <div className="flex items-center justify-between mb-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              <span className="flex items-center gap-1 text-indigo-600">
                <Sparkles className="w-3 h-3" /> Coach ({INDIAN_VOICES.find(v => v.code === selectedVoice)?.name})
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => playCoachAudio(coachResponse)}
                  disabled={isAiSpeaking}
                  className="text-slate-600 hover:text-indigo-600 flex items-center gap-1 cursor-pointer disabled:opacity-40"
                  title="Replay Voice"
                >
                  <RotateCcw className="w-3 h-3" /> Replay
                </button>
                <button
                  onClick={() => {
                    setSoundMuted(prev => !prev);
                    if (currentAudioRef.current) currentAudioRef.current.muted = !soundMuted;
                  }}
                  className="text-slate-600 hover:text-indigo-600 cursor-pointer"
                  title={soundMuted ? "Unmute" : "Mute"}
                >
                  {soundMuted ? <VolumeX className="w-3.5 h-3.5 text-amber-600" /> : <Volume2 className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
            <p className="text-sm md:text-base font-semibold text-slate-800 leading-relaxed text-left">
              {coachResponse}
            </p>
          </div>
        </div>

        {/* CENTRAL TACTILE PUSH-TO-TALK BUTTON */}
        <div className="flex flex-col items-center justify-center space-y-3 z-10 my-2">
          <button
            onClick={toggleListening}
            disabled={isAiThinking}
            className={`w-20 h-20 md:w-24 md:h-24 rounded-full flex flex-col items-center justify-center transition-all duration-300 shadow-xl active:scale-95 cursor-pointer disabled:opacity-50 ${
              isListening
                ? "bg-rose-500 text-white ring-8 ring-rose-200 animate-pulse shadow-rose-500/40"
                : isAiSpeaking
                ? "bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-indigo-600/30"
                : isAiThinking
                ? "bg-amber-500 text-white animate-spin shadow-amber-500/30"
                : "bg-gradient-to-tr from-rose-600 to-indigo-600 text-white hover:opacity-95 shadow-indigo-600/30"
            }`}
            title={isListening ? "Tap to Finish Speaking" : "Tap to Speak"}
          >
            {isListening ? (
              <Mic className="w-8 h-8 md:w-10 md:h-10 animate-pulse" />
            ) : isAiSpeaking ? (
              <Volume2 className="w-8 h-8 md:w-10 md:h-10 animate-bounce" />
            ) : isAiThinking ? (
              <RotateCcw className="w-8 h-8 md:w-10 md:h-10" />
            ) : (
              <Mic className="w-8 h-8 md:w-10 md:h-10" />
            )}
          </button>

          {/* STATUS LABEL UNDER BUTTON */}
          <div className="text-xs font-bold tracking-wide">
            {isListening ? (
              <span className="text-rose-600 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping" />
                Listening... (Tap to finish)
              </span>
            ) : isAiSpeaking ? (
              <span className="text-indigo-600 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
                Coach Speaking with Indian Accent...
              </span>
            ) : isAiThinking ? (
              <span className="text-amber-600">Refining teacher phrasing...</span>
            ) : (
              <span className="text-slate-600">Tap to Speak</span>
            )}
          </div>
        </div>

        {/* LIVE SPOKEN TRANSCRIPT BUBBLE */}
        {(liveTranscript || lastUserSpeech) && (
          <div className="w-full max-w-lg p-3 rounded-2xl bg-indigo-50/70 border border-indigo-100 text-xs text-indigo-950 text-left z-10 shadow-xs">
            <span className="font-extrabold uppercase text-[10px] text-indigo-600 block mb-0.5">
              {isListening ? "Transcribing Your Speech:" : "You Spoke:"}
            </span>
            <p className="font-medium">
              &ldquo;{liveTranscript || lastUserSpeech}&rdquo;
            </p>
          </div>
        )}

        {/* 3. POLISHED TEACHER PHRASING & GRAMMAR CARD (COLLAPSED/SHOWN DYNAMICALLY) */}
        {latestFeedback && (
          <div className="w-full max-w-lg p-4 rounded-2xl bg-gradient-to-r from-purple-50 to-indigo-50 border border-indigo-200 text-left shadow-xs z-10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-extrabold text-indigo-900 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                ✨ Better Teacher English
              </span>
              {latestFeedback.polishedPhrasing && (
                <button
                  onClick={() => playCoachAudio(latestFeedback.polishedPhrasing!)}
                  className="text-[11px] font-bold text-indigo-700 hover:text-indigo-900 flex items-center gap-1 cursor-pointer bg-white px-2 py-0.5 rounded-lg border border-indigo-200 shadow-2xs"
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

      {/* 4. QUICK SUGGESTION CHIPS (HORIZONTALLY SCROLLABLE ON MOBILE) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
          <Lightbulb className="w-3 h-3 text-amber-500" /> Try saying:
        </span>
        {activeScenario.quickStarters.map((starter, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(starter)}
            disabled={isAiThinking}
            className="px-3 py-1.5 rounded-xl bg-white hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 text-xs font-medium border border-slate-200 whitespace-nowrap shadow-2xs active:scale-95 transition-all cursor-pointer disabled:opacity-50"
          >
            {starter}
          </button>
        ))}
      </div>

      {/* 5. HYBRID TEXT/VOICE INPUT BAR (ALLOWS INSTANT TYPING IF MIC IS INCONVENIENT) */}
      <div className="glass-panel p-2 rounded-2xl border border-slate-200 bg-white shadow-xs flex items-center gap-2">
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
          placeholder="Speak above or type your practice sentence here..."
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
          title="Send"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
}
