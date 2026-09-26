"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  speakCoachText,
  stopCoachSpeaking,
  cleanRepeatedPhrases
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
  Send
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

  const recognitionRef = useRef<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Speak initial starter
    const starter = conversation[0].text;
    const timer = setTimeout(() => {
      setIsCoachSpeaking(true);
      speakCoachText(starter, () => setIsCoachSpeaking(false));
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
  const silenceTimerRef = useRef<any>(null);
  const latestSpokenRef = useRef<string>("");

  const startRecording = () => {
    if (typeof window === "undefined") return;
    const SpeechRec =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRec) {
      alert("Microphone speech recognition is not supported in this browser. Please type below.");
      return;
    }

    try {
      stopCoachSpeaking();
      setIsCoachSpeaking(false);
      const rec = new SpeechRec();
      rec.continuous = false;
      rec.interimResults = true;
      rec.lang = "en-IN";

      rec.onstart = () => setIsRecording(true);

      rec.onresult = (event: any) => {
        const lastIdx = event.results.length - 1;
        const raw = lastIdx >= 0 ? event.results[lastIdx][0].transcript : "";
        const clean = cleanRepeatedPhrases(raw);
        if (clean) {
          setUserInput(clean);
          latestSpokenRef.current = clean;

          if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
          silenceTimerRef.current = setTimeout(() => {
            handleSendMessage(clean);
          }, 1800);
        }
      };

      rec.onerror = (e: any) => {
        console.warn("Speech recognition error:", e);
        setIsRecording(false);
      };

      rec.onend = () => {
        setIsRecording(false);
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
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
        recognitionRef.current.stop();
      } catch (e) {}
    }
    setIsRecording(false);
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
      const clean = cleanRepeatedPhrases(userInput);
      if (clean) {
        handleSendMessage(clean);
      }
    } else {
      startRecording();
    }
  };

  const handleSendMessage = async (textOverride?: string) => {
    stopRecording();
    const textToSend = cleanRepeatedPhrases(textOverride || userInput).trim();
    if (!textToSend || isCoachThinking) return;

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

      // Speak AI reply aloud naturally
      setIsCoachSpeaking(true);
      speakCoachText(coachTurn.text, () => setIsCoachSpeaking(false));
    } catch (err: any) {
      console.error("Conversation turn error:", err);
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
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
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
                {item.score}%
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
            className="px-8 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md transition"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 flex flex-col h-[calc(100vh-140px)] min-h-[580px]">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit Lounge</span>
        </button>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl">
          {(["Casual", "Intermediate", "Advanced"] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                category === cat
                  ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <button
          onClick={handleEndSession}
          disabled={isGeneratingReport || conversation.length < 2}
          className="px-4 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400 font-bold text-xs hover:bg-rose-100 transition disabled:opacity-30 disabled:pointer-events-none flex items-center gap-1.5"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>{isGeneratingReport ? "Grading..." : "Finish & Get Report"}</span>
        </button>
      </div>

      {/* Conversation Transcript Feed */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto py-6 space-y-4 px-2 scroll-smooth"
      >
        {conversation.map((turn, idx) => {
          const isCoach = turn.sender === "coach";
          return (
            <div
              key={idx}
              className={`flex flex-col ${isCoach ? "items-start" : "items-end"}`}
            >
              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-3xl px-5 py-3.5 shadow-sm text-sm ${
                  isCoach
                    ? "bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 text-slate-800 dark:text-slate-100"
                    : "bg-indigo-600 text-white rounded-br-md"
                }`}
              >
                <div className="flex items-center justify-between gap-3 mb-1 text-[11px] opacity-70 font-semibold uppercase tracking-wider">
                  <span>{isCoach ? "AI Coach" : "You"}</span>
                  {isCoach && (
                    <button
                      onClick={() => {
                        setIsCoachSpeaking(true);
                        speakCoachText(turn.text, () => setIsCoachSpeaking(false));
                      }}
                      className="hover:opacity-100 transition"
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
                <div className="mt-1.5 ml-2 max-w-[80%] text-[11px] text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 px-3 py-1.5 rounded-xl border border-amber-200 dark:border-amber-900 flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-amber-500 flex-shrink-0" />
                  <span>{turn.gentle_correction}</span>
                </div>
              )}
            </div>
          );
        })}

        {isCoachThinking && (
          <div className="flex items-center gap-2 p-3 bg-white dark:bg-slate-800 rounded-2xl max-w-[120px] shadow-sm border border-slate-100 dark:border-slate-700">
            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" />
            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce delay-100" />
            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce delay-200" />
          </div>
        )}
      </div>

      {/* Bottom Voice & Text Input Bar */}
      <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-3">
        {/* Big Mic Toggle */}
        <button
          onClick={toggleRecording}
          className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-md flex-shrink-0 ${
            isRecording
              ? "bg-rose-600 text-white animate-pulse shadow-rose-500/40"
              : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/20"
          }`}
          title={isRecording ? "Stop recording" : "Speak to AI coach"}
        >
          {isRecording ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
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
                : "Speak into the microphone or type here..."
            }
            className="w-full px-4 py-3.5 pr-12 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={!userInput.trim() || isCoachThinking}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-indigo-600 text-white disabled:opacity-30 disabled:pointer-events-none hover:bg-indigo-700 transition"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
