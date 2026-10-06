"use client";

import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import {
  speakCoachText,
  stopCoachSpeaking,
  cleanRepeatedPhrases,
  parseSpeechResults,
  unlockAudio,
  COACH_DEFAULT_VOICE
} from "./types";
import { sendCoachConversationTurn, fetchCoachSessionReport } from "@/lib/api";
import {
  Mic,
  MicOff,
  Volume2,
  ArrowLeft,
  Sparkles,
  Award,
  CheckCircle2,
  TrendingUp,
  Brain,
  MessageSquare,
  RefreshCw,
  LogOut,
  Send,
  Bot,
  User
} from "lucide-react";

interface Props {
  userId: string;
  userRole: string;
  onBack: () => void;
}

interface Turn {
  sender: "coach" | "user";
  text: string;
  gentle_correction?: string;
}

export function LiveVoiceConversation({ userId, userRole, onBack }: Props) {
  const [category, setCategory] = useState<"Casual" | "Intermediate" | "Advanced">("Casual");
  const [conversation, setConversation] = useState<Turn[]>([
    {
      sender: "coach",
      text: "Hello! Welcome to our Live Voice Conversation Lounge. I'm excited to practice speaking with you today! How has your day been so far?"
    }
  ]);
  const [userInput, setUserInput] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isCoachThinking, setIsCoachThinking] = useState(false);
  const [isCoachSpeaking, setIsCoachSpeaking] = useState(false);
  const [sessionReport, setSessionReport] = useState<any>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const recognitionRef = useRef<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const silenceTimerRef = useRef<any>(null);
  const latestSpokenRef = useRef<string>("");
  const isSendingTurnRef = useRef<boolean>(false);
  const isCoachSpeakingRef = useRef<boolean>(false);

  const updateCoachSpeaking = (val: boolean) => {
    setIsCoachSpeaking(val);
    isCoachSpeakingRef.current = val;
  };

  const [isHandsFree, setIsHandsFree] = useState(true);
  const isHandsFreeRef = useRef(true);

  // Keep ref synchronized with state
  useEffect(() => {
    isHandsFreeRef.current = isHandsFree;
  }, [isHandsFree]);

  // Lock body scroll while Live Voice Lounge is active to prevent any outer page scrolling
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  useEffect(() => {
    // Speak initial starter with natural voice and then auto-listen
    const starter = conversation[0].text;
    const timer = setTimeout(() => {
      updateCoachSpeaking(true);
      speakCoachText(starter, () => {
        updateCoachSpeaking(false);
        if (isHandsFreeRef.current) {
          startRecording();
        }
      }, COACH_DEFAULT_VOICE);
    }, 400);

    return () => {
      clearTimeout(timer);
      stopCoachSpeaking();
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
    };
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [conversation, isCoachThinking]);

  const startRecording = () => {
    if (typeof window === "undefined") return;
    unlockAudio();
    const SpeechRec =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRec) {
      alert("Microphone speech recognition is not supported in this browser. Please type below.");
      return;
    }

    try {
      stopCoachSpeaking();
      updateCoachSpeaking(false);
      const rec = new SpeechRec();
      const isMobile = typeof navigator !== "undefined" && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      rec.continuous = !isMobile;
      rec.interimResults = true;
      rec.maxAlternatives = 5;
      rec.lang = "en-IN";

      rec.onstart = () => setIsRecording(true);

      rec.onresult = (event: any) => {
        if (isCoachSpeakingRef.current) return;
        const raw = parseSpeechResults(event);
        const clean = cleanRepeatedPhrases(raw);
        if (clean) {
          setUserInput(clean);
          latestSpokenRef.current = clean;

          // Comfortable 1400ms silence detection so natural speech pauses aren't cut off
          if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
          silenceTimerRef.current = setTimeout(() => {
            handleSendMessage(clean);
          }, 1400);
        }
      };

      rec.onerror = (e: any) => {
        console.warn("Speech recognition error:", e);
        if (e.error === "no-speech" || e.error === "aborted") return;
        setIsRecording(false);
      };

      rec.onend = () => {
        setIsRecording(false);
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        if (isSendingTurnRef.current) return;
        const finalClean = cleanRepeatedPhrases(latestSpokenRef.current);
        if (finalClean && finalClean.trim().length > 0) {
          handleSendMessage(finalClean);
        }
      };

      recognitionRef.current = rec;
      rec.start();
    } catch (err) {
      console.error("Speech rec init error:", err);
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onstart = null;
        recognitionRef.current.onresult = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.stop();
      } catch (e) {}
    }
    setIsRecording(false);
  };

  const toggleRecording = () => {
    unlockAudio();
    if (isCoachSpeaking) {
      stopCoachSpeaking();
      updateCoachSpeaking(false);
      isSendingTurnRef.current = false;
      setTimeout(() => {
        startRecording();
      }, 150);
      return;
    }
    if (isRecording) {
      stopRecording();
      const clean = cleanRepeatedPhrases(userInput || latestSpokenRef.current);
      if (clean) {
        handleSendMessage(clean);
      }
    } else {
      startRecording();
    }
  };

  const handleSendMessage = async (textOverride?: string) => {
    if (isSendingTurnRef.current) return;
    const textToSend = cleanRepeatedPhrases(textOverride || userInput).trim();
    if (!textToSend || isCoachThinking) return;

    isSendingTurnRef.current = true;
    stopRecording();
    setUserInput("");
    latestSpokenRef.current = "";

    const newTurns: Turn[] = [...conversation, { sender: "user", text: textToSend }];
    setConversation(newTurns);
    setIsCoachThinking(true);

    try {
      const historyFormatted = newTurns.map((t) => ({
        sender: t.sender,
        text: t.text
      }));

      const res = await sendCoachConversationTurn({
        user_message: textToSend,
        conversation_history: historyFormatted,
        category: category,
        user_level: "B1"
      });

      const coachTurn: Turn = {
        sender: "coach",
        text: res.reply || "That's wonderful! Tell me more about that.",
        gentle_correction: res.gentle_correction || undefined
      };

      setConversation((prev) => [...prev, coachTurn]);

      // Speak AI reply aloud naturally with Gemini-quality voice and then auto-listen
      updateCoachSpeaking(true);
      speakCoachText(coachTurn.text, () => {
        updateCoachSpeaking(false);
        isSendingTurnRef.current = false;
        // Hands-free conversational loop: Coach finishes speaking, automatically listens to user!
        if (isHandsFreeRef.current) {
          setTimeout(() => {
            startRecording();
          }, 250);
        }
      }, COACH_DEFAULT_VOICE);
    } catch (err: any) {
      console.error("Conversation turn error:", err);
      isSendingTurnRef.current = false;
    } finally {
      setIsCoachThinking(false);
    }
  };

  const handleEndSession = async () => {
    stopRecording();
    stopCoachSpeaking();
    setIsGeneratingReport(true);

    try {
      const turns = conversation.map((t) => ({
        sender: t.sender,
        text: t.text
      }));

      const report = await fetchCoachSessionReport({
        conversation_turns: turns,
        category: category
      });

      setSessionReport(report);
    } catch (err: any) {
      console.error("Report generation error:", err);
      alert(err.message || "Failed to generate report.");
    } finally {
      setIsGeneratingReport(false);
    }
  };

  // End of Session Report Card View
  if (sessionReport) {
    if (!isMounted || typeof document === "undefined") return null;
    return createPortal(
      <div className="fixed inset-0 z-[100] overflow-y-auto bg-slate-50 dark:bg-slate-950 px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-rose-500 to-purple-600 text-white flex items-center justify-center mx-auto mb-4 shadow-xl shadow-rose-500/20">
              <Award className="w-8 h-8" />
            </div>
            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800 mb-2">
              Session Performance Report
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              Spoken Conversation Debrief
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-1 max-w-md mx-auto">
              Detailed breakdown of your spoken fluency, grammar poise, and vocabulary range from today&apos;s live dialogue.
            </p>
          </div>

          {/* 5 Core Scores */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-8">
            {[
              { label: "Fluency", score: sessionReport.fluency },
              { label: "Grammar", score: sessionReport.grammar },
              { label: "Vocabulary", score: sessionReport.vocabulary },
              { label: "Pronunciation", score: sessionReport.pronunciation },
              { label: "Confidence", score: sessionReport.confidence }
            ].map((item, i) => (
              <div
                key={i}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center shadow-sm"
              >
                <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                  {item.score ?? 0}%
                </div>
                <div className="text-[11px] font-bold uppercase text-slate-400 mt-1">
                  {item.label}
                </div>
              </div>
            ))}
          </div>

          {/* Coach Closing Message */}
          <div className="p-6 rounded-3xl bg-indigo-50/70 dark:bg-slate-800/80 border border-indigo-100 dark:border-slate-700 mb-8">
            <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400 font-bold text-sm mb-2">
              <Brain className="w-5 h-5" />
              <span>Personal Coach Closing Note</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed italic">
              &ldquo;{sessionReport.coach_closing_message}&rdquo;
            </p>
          </div>

          {/* Strengths & Next Drills */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
            <div className="p-6 rounded-3xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-800/50">
              <h4 className="font-bold text-emerald-800 dark:text-emerald-300 text-sm mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>What You Did Well</span>
              </h4>
              <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                {sessionReport.you_did_well?.map((item: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-6 rounded-3xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-800/50">
              <h4 className="font-bold text-amber-800 dark:text-amber-300 text-sm mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                <span>Focus For Next Session</span>
              </h4>
              <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                {sessionReport.improve_next?.map((item: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="flex justify-center">
            <button
              onClick={onBack}
              className="px-8 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md transition cursor-pointer"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>,
      document.body
    );
  }

  if (!isMounted || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] bg-white dark:bg-slate-900 flex flex-col overflow-hidden">
      {/* Top Header - Responsive: 2 rows on mobile, 1 row on sm+ */}
      <div className="flex-shrink-0 px-3 sm:px-6 pt-[max(0.75rem,env(safe-area-inset-top))] pb-2.5 sm:pb-3 border-b border-slate-100 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md z-10 shadow-xs">
        <div className="max-w-3xl mx-auto w-full flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          {/* Top row: Exit on left, Controls on right on mobile */}
          <div className="flex items-center justify-between gap-2 w-full sm:w-auto">
            <button
              onClick={onBack}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 transition cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Exit Lounge</span>
            </button>

            {/* Mobile Controls (shown on right of row 1 on mobile) */}
            <div className="flex sm:hidden items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  const next = !isHandsFree;
                  setIsHandsFree(next);
                  if (next && !isCoachSpeaking && !isRecording) {
                    startRecording();
                  } else if (!next && isRecording) {
                    stopRecording();
                  }
                }}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer ${
                  isHandsFree
                    ? "bg-emerald-600 text-white shadow-emerald-500/20"
                    : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                }`}
                title="Toggle hands-free live conversation mode"
              >
                <span className={`w-2 h-2 rounded-full ${isHandsFree ? "bg-white animate-ping" : "bg-slate-400"}`} />
                <span>{isHandsFree ? "Live Call: ON" : "Push to Talk"}</span>
              </button>

              <button
                onClick={handleEndSession}
                disabled={isGeneratingReport || conversation.length < 2}
                className="px-2.5 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400 font-bold text-xs hover:bg-rose-100 transition disabled:opacity-30 disabled:pointer-events-none flex items-center gap-1 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{isGeneratingReport ? "..." : "Finish"}</span>
              </button>
            </div>
          </div>

          {/* Category Pills (centered on mobile, in-line on desktop) */}
          <div className="flex items-center justify-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl self-center sm:self-auto">
            {(["Casual", "Intermediate", "Advanced"] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  category === cat
                    ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs"
                    : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Desktop Controls (hidden on mobile) */}
          <div className="hidden sm:flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                const next = !isHandsFree;
                setIsHandsFree(next);
                if (next && !isCoachSpeaking && !isRecording) {
                  startRecording();
                } else if (!next && isRecording) {
                  stopRecording();
                }
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer ${
                isHandsFree
                  ? "bg-emerald-600 text-white shadow-emerald-500/20"
                  : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
              }`}
              title="Toggle hands-free live conversation mode"
            >
              <span className={`w-2 h-2 rounded-full ${isHandsFree ? "bg-white animate-ping" : "bg-slate-400"}`} />
              <span>{isHandsFree ? "Live Call: ON" : "Push to Talk"}</span>
            </button>

            <button
              onClick={handleEndSession}
              disabled={isGeneratingReport || conversation.length < 2}
              className="px-3.5 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400 font-bold text-xs hover:bg-rose-100 transition disabled:opacity-30 disabled:pointer-events-none flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{isGeneratingReport ? "Grading..." : "Finish"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Realtime Live Conversation Status Banner */}
      <div className="flex-shrink-0 px-3 sm:px-6 pt-2 pb-1 max-w-3xl mx-auto w-full">
        {isCoachSpeaking ? (
          <div className="p-2.5 sm:p-3 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white flex items-center justify-between text-xs font-bold shadow-md">
            <div className="flex items-center gap-2 sm:gap-2.5">
              {/* Animated Soundwave Equalizer */}
              <div className="flex items-center gap-1 h-5 px-1">
                <span className="w-1 bg-white rounded-full animate-pulse h-3" />
                <span className="w-1 bg-white rounded-full animate-bounce h-5" />
                <span className="w-1 bg-white rounded-full animate-pulse h-4" />
                <span className="w-1 bg-white rounded-full animate-bounce h-6" />
                <span className="w-1 bg-white rounded-full animate-pulse h-3" />
              </div>
              <span className="truncate">Coach Speaking... Tap mic or speak to interrupt</span>
            </div>
            <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider shrink-0 ml-2">
              Live Voice
            </span>
          </div>
        ) : isRecording ? (
          <div className="p-2.5 sm:p-3 rounded-2xl bg-gradient-to-r from-rose-500 to-amber-500 text-white flex items-center justify-between text-xs font-bold shadow-md animate-pulse">
            <div className="flex items-center gap-2">
              <Mic className="w-4 h-4 animate-ping" />
              <span className="truncate">Coach is Listening... Speak Freely</span>
            </div>
            <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider shrink-0 ml-2">
              Mic Active
            </span>
          </div>
        ) : isCoachThinking ? (
          <div className="p-2.5 sm:p-3 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 flex items-center gap-2 text-xs font-bold">
            <Sparkles className="w-4 h-4 text-indigo-500 animate-spin" />
            <span>Coach is responding live...</span>
          </div>
        ) : null}
      </div>

      {/* Chat Messages List - ONLY SCROLLABLE AREA */}
      <div
        ref={scrollRef}
        className="flex-1 min-h-0 overflow-y-auto px-3 sm:px-6 py-4 space-y-4 scroll-smooth max-w-3xl mx-auto w-full"
      >
        {conversation.map((turn, idx) => {
          const isCoach = turn.sender === "coach";
          return (
            <div
              key={idx}
              className={`flex items-start gap-2.5 sm:gap-3 ${isCoach ? "justify-start" : "justify-end"}`}
            >
              {/* Coach Avatar */}
              {isCoach && (
                <div className="w-8 h-8 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm shadow-indigo-500/20 mt-1">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`flex flex-col max-w-[85%] sm:max-w-[75%] ${
                  isCoach ? "items-start" : "items-end"
                }`}
              >
                <div
                  className={`rounded-3xl px-4 sm:px-5 py-3 sm:py-3.5 shadow-sm text-sm ${
                    isCoach
                      ? "bg-slate-50 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 text-slate-800 dark:text-slate-100 rounded-tl-sm"
                      : "bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-tr-sm"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3 mb-1 text-[11px] opacity-75 font-semibold uppercase tracking-wider">
                    <span>{isCoach ? "AI Coach" : "You"}</span>
                    {isCoach && (
                      <button
                        onClick={() => {
                          setIsCoachSpeaking(true);
                          speakCoachText(turn.text, () => setIsCoachSpeaking(false));
                        }}
                        className="hover:opacity-100 transition p-0.5 rounded cursor-pointer"
                        title="Listen again"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <p className="leading-relaxed">{turn.text}</p>
                </div>

                {/* Gentle speech correction pill under coach reply */}
                {isCoach && turn.gentle_correction && (
                  <div className="mt-1.5 ml-2 max-w-full text-[11px] text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 px-3 py-1.5 rounded-xl border border-amber-200 dark:border-amber-900 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                    <span>{turn.gentle_correction}</span>
                  </div>
                )}
              </div>

              {/* User Avatar */}
              {!isCoach && (
                <div className="w-8 h-8 rounded-2xl bg-gradient-to-tr from-slate-700 to-slate-900 dark:from-indigo-600 dark:to-indigo-800 text-white flex items-center justify-center flex-shrink-0 shadow-sm mt-1">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {/* Quick Conversation Starter Chips (shown when starting a session) */}
        {conversation.length <= 2 && !isCoachSpeaking && !isCoachThinking && (
          <div className="pt-3 pb-2 px-1">
            <div className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              <span>Suggested Conversation Starters:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                "☕ Tell me about how your day has been so far!",
                "🎬 I love watching movies and TV shows.",
                "✈️ I'd love to talk about my dream travel destination.",
                "🎯 Let's talk about building good daily habits."
              ].map((starter, sIdx) => (
                <button
                  key={sIdx}
                  onClick={() => {
                    setUserInput(starter);
                    handleSendMessage(starter);
                  }}
                  className="text-xs px-3.5 py-2 rounded-2xl bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-300 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition font-medium text-left shadow-2xs cursor-pointer"
                >
                  {starter}
                </button>
              ))}
            </div>
          </div>
        )}

        {isCoachThinking && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm shadow-indigo-500/20">
              <Bot className="w-4 h-4" />
            </div>
            <div className="flex items-center gap-2 p-3.5 bg-slate-50 dark:bg-slate-800/90 rounded-2xl max-w-[120px] shadow-sm border border-slate-200/80 dark:border-slate-700/80">
              <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" />
              <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce delay-100" />
              <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce delay-200" />
            </div>
          </div>
        )}
      </div>

      {/* Bottom Voice & Text Input Bar */}
      <div className="flex-shrink-0 px-3 sm:px-6 pt-2.5 pb-[max(1rem,env(safe-area-inset-bottom))] border-t border-slate-100 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-900/90 backdrop-blur-md">
        <div className="max-w-3xl mx-auto w-full">
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Big Mic Toggle */}
            <button
              onClick={toggleRecording}
              className={`w-12 h-12 sm:w-13 sm:h-13 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-md flex-shrink-0 cursor-pointer ${
                isRecording
                  ? "bg-rose-600 text-white animate-pulse shadow-rose-500/40"
                  : isCoachSpeaking
                  ? "bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-indigo-500/30 hover:scale-105"
                  : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/20"
              }`}
              title={isRecording ? "Stop recording" : isCoachSpeaking ? "Tap to interrupt & speak" : "Speak to AI coach"}
            >
              {isRecording ? <MicOff className="w-5 h-5 sm:w-6 sm:h-6" /> : <Mic className="w-5 h-5 sm:w-6 sm:h-6" />}
            </button>

            {/* Input box */}
            <div className="flex-1 relative">
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder={
                  isRecording
                    ? "Listening to your voice..."
                    : isCoachSpeaking
                    ? "Coach speaking... Tap mic or type to interrupt..."
                    : "Speak into microphone or type here..."
                }
                className="w-full px-4 py-3 sm:py-3.5 pr-12 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs"
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={!userInput.trim() || isCoachThinking}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-indigo-600 text-white disabled:opacity-30 disabled:pointer-events-none hover:bg-indigo-700 transition cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
          <p className="text-[11px] text-center text-slate-400 dark:text-slate-500 mt-2">
            💡 Coach responds live with voice • Speak naturally in English, Hindi, or Hinglish
          </p>
        </div>
      </div>
    </div>,
    document.body
  );
}
