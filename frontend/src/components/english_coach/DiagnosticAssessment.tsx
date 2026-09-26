"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  DiagnosticQuestion,
  SpokenAnswerItem,
  speakCoachText,
  stopCoachSpeaking
} from "./types";
import { fetchDiagnosticQuestions, submitDiagnosticAssessment } from "@/lib/api";
import {
  Mic,
  MicOff,
  Volume2,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Clock,
  RotateCcw,
  AlertCircle,
  HelpCircle,
  Brain,
  ShieldCheck
} from "lucide-react";

interface Props {
  userId: string;
  userRole: string;
  userName: string;
  onComplete: (profile: any, report: any) => void;
  onCancel?: () => void;
}

export function DiagnosticAssessment({
  userId,
  userRole,
  userName,
  onComplete,
  onCancel
}: Props) {
  const [questions, setQuestions] = useState<DiagnosticQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitStep, setSubmitStep] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [isCoachSpeaking, setIsCoachSpeaking] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(60);
  const [showSample, setShowSample] = useState(false);

  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<any>(null);

  // Load questions on mount
  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = await fetchDiagnosticQuestions();
        if (res.questions && res.questions.length > 0) {
          setQuestions(res.questions);
        }
      } catch (err) {
        console.error("Failed to load questions:", err);
      } finally {
        setLoading(false);
      }
    }
    load();

    // Check speech recognition support
    if (
      typeof window !== "undefined" &&
      !("webkitSpeechRecognition" in window) &&
      !("SpeechRecognition" in window)
    ) {
      setSpeechSupported(false);
    }

    return () => {
      stopCoachSpeaking();
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const currentQ = questions[currentIndex];

  // Handle countdown timer & question transition
  useEffect(() => {
    if (!currentQ) return;
    setTimeRemaining(currentQ.time_limit_seconds || 60);
    setShowSample(false);
    stopCoachSpeaking();
    setIsCoachSpeaking(false);

    // Speak prompt automatically to guide user warmly
    const timer = setTimeout(() => {
      handleListenPrompt();
    }, 400);

    return () => clearTimeout(timer);
  }, [currentIndex, currentQ?.id]);

  // Timer countdown when recording
  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            stopRecording();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);

  const handleListenPrompt = () => {
    if (!currentQ) return;
    setIsCoachSpeaking(true);
    speakCoachText(
      `${currentQ.category}. ${currentQ.prompt}`,
      () => setIsCoachSpeaking(false)
    );
  };

  const startRecording = () => {
    if (typeof window === "undefined") return;
    const SpeechRec =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRec) {
      setSpeechSupported(false);
      return;
    }

    try {
      stopCoachSpeaking();
      setIsCoachSpeaking(false);
      const rec = new SpeechRec();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = "en-IN";

      rec.onstart = () => {
        setIsRecording(true);
      };

      rec.onresult = (event: any) => {
        let finalTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript + " ";
          }
        }
        if (finalTranscript) {
          setAnswers((prev) => {
            const existing = prev[currentQ.id] || "";
            return {
              ...prev,
              [currentQ.id]: (existing + " " + finalTranscript).trim()
            };
          });
        }
      };

      rec.onerror = (e: any) => {
        console.warn("Speech recognition error:", e);
        setIsRecording(false);
      };

      rec.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = rec;
      rec.start();
    } catch (err) {
      console.error("Speech rec init error:", err);
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
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
    } else {
      startRecording();
    }
  };

  const handleNext = () => {
    stopRecording();
    stopCoachSpeaking();
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    stopRecording();
    stopCoachSpeaking();
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleSubmitAll = async () => {
    stopRecording();
    stopCoachSpeaking();
    setSubmitting(true);

    // Fun progress messages during AI evaluation
    const stepTimer = setInterval(() => {
      setSubmitStep((s) => (s < 3 ? s + 1 : s));
    }, 1400);

    try {
      const formattedAnswers: SpokenAnswerItem[] = questions.map((q) => ({
        question_id: q.id,
        category: q.category,
        prompt: q.prompt,
        transcript: (answers[q.id] || "").trim()
      }));

      const res = await submitDiagnosticAssessment({
        user_id: userId,
        user_role: userRole,
        answers: formattedAnswers
      });

      clearInterval(stepTimer);
      if (res.status === "success" && res.profile) {
        onComplete(res.profile, res.report);
      }
    } catch (err: any) {
      console.error("Failed to submit diagnostic:", err);
      alert(err.message || "Failed to analyze your assessment. Please try again.");
      setSubmitting(false);
      clearInterval(stepTimer);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] text-center p-6">
        <div className="w-16 h-16 border-4 border-indigo-500/30 border-t-indigo-600 rounded-full animate-spin mb-4" />
        <h3 className="text-xl font-bold text-slate-800 dark:text-white">
          Preparing Your Spoken Diagnostic...
        </h3>
        <p className="text-slate-500 text-sm mt-1 max-w-sm">
          Setting up your 10 speaking questions with CEFR benchmark standards.
        </p>
      </div>
    );
  }

  if (submitting) {
    const steps = [
      "Transcribing and parsing your spoken responses...",
      "Analyzing grammar consistency, vocabulary & pauses...",
      "Benchmarking against Cambridge CEFR levels (A1–C1)...",
      "Building your personalized 5-Level roadmap & daily drills..."
    ];
    return (
      <div className="max-w-2xl mx-auto py-16 px-6 text-center">
        <div className="relative w-28 h-28 mx-auto mb-8">
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 animate-pulse opacity-40 blur-xl" />
          <div className="relative w-full h-full rounded-full border-4 border-indigo-500/20 border-t-indigo-600 flex items-center justify-center bg-white dark:bg-slate-900 shadow-2xl animate-spin">
            <Brain className="w-12 h-12 text-indigo-600 dark:text-indigo-400" />
          </div>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          AI Speaking Coach is Evaluating You
        </h2>
        <p className="text-indigo-600 dark:text-indigo-400 font-semibold text-base mt-3 animate-fade-in">
          {steps[submitStep]}
        </p>
        <p className="text-slate-500 text-xs mt-3">
          This takes about 5–10 seconds as our AI conducts deep linguistic analysis.
        </p>
      </div>
    );
  }

  if (!currentQ) return null;

  const currentAnswer = answers[currentQ.id] || "";
  const isLastQuestion = currentIndex === questions.length - 1;
  const answeredCount = Object.values(answers).filter((a) => a.trim().length > 0).length;

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 sm:py-10">
      {/* Top Progress & Navigation Bar */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-sm shadow-md shadow-indigo-500/20">
            {currentIndex + 1}
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
              <span>Question {currentIndex + 1} of {questions.length}</span>
              <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
              <span>{currentQ.category}</span>
            </div>
            <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Spoken Diagnostic Assessment
            </div>
          </div>
        </div>

        {onCancel && (
          <button
            onClick={onCancel}
            className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800"
          >
            Exit Test
          </button>
        )}
      </div>

      {/* Progress Bars */}
      <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 mb-8 overflow-hidden flex gap-0.5">
        {questions.map((q, idx) => {
          const isDone = (answers[q.id] || "").trim().length > 0;
          const isCurrent = idx === currentIndex;
          return (
            <div
              key={q.id}
              className={`h-full flex-1 transition-all duration-300 ${
                isCurrent
                  ? "bg-indigo-600"
                  : isDone
                  ? "bg-emerald-500"
                  : "bg-slate-200 dark:bg-slate-700"
              }`}
            />
          );
        })}
      </div>

      {/* Main Question Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 dark:shadow-none mb-6 relative overflow-hidden">
        {/* Glow Accent */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
          <div className="flex-1">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800/50 mb-3">
              🎯 Focus: {currentQ.skill_focus}
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-snug">
              &ldquo;{currentQ.prompt}&rdquo;
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 leading-relaxed">
              {currentQ.instruction}
            </p>
          </div>

          <div className="flex items-center gap-2 self-start">
            <button
              onClick={handleListenPrompt}
              disabled={isCoachSpeaking}
              className={`p-3 rounded-2xl border transition flex items-center gap-2 text-xs font-semibold ${
                isCoachSpeaking
                  ? "bg-indigo-600 text-white border-indigo-600 animate-pulse"
                  : "bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700"
              }`}
              title="Listen to coach ask this question"
            >
              <Volume2 className="w-4 h-4" />
              <span className="hidden sm:inline">
                {isCoachSpeaking ? "Speaking..." : "Read Aloud"}
              </span>
            </button>
          </div>
        </div>

        {/* Big Interactive Microphone Speaking Section */}
        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800/80 flex flex-col items-center justify-center text-center">
          <div className="relative mb-5">
            {isRecording && (
              <>
                <div className="absolute inset-0 rounded-full bg-rose-500/20 animate-ping" />
                <div className="absolute -inset-3 rounded-full bg-rose-500/10 animate-pulse" />
              </>
            )}
            <button
              onClick={toggleRecording}
              className={`relative z-10 w-24 h-24 rounded-full flex flex-col items-center justify-center transition-all duration-300 shadow-xl ${
                isRecording
                  ? "bg-rose-600 text-white shadow-rose-500/40 scale-105"
                  : "bg-gradient-to-tr from-indigo-600 to-purple-600 text-white hover:scale-105 shadow-indigo-500/30"
              }`}
            >
              {isRecording ? (
                <MicOff className="w-8 h-8 animate-bounce" />
              ) : (
                <Mic className="w-8 h-8" />
              )}
              <span className="text-[10px] font-bold mt-1 uppercase tracking-wider">
                {isRecording ? "Listening" : "Speak Now"}
              </span>
            </button>
          </div>

          {/* Time Remaining or Guidance */}
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400 mb-4">
            <Clock className="w-3.5 h-3.5 text-indigo-500" />
            {isRecording ? (
              <span className="text-rose-600 dark:text-rose-400 font-semibold animate-pulse">
                Recording ({timeRemaining}s remaining) — Tap again when done
              </span>
            ) : (
              <span>
                Recommended speaking time: up to {currentQ.time_limit_seconds}s
              </span>
            )}
          </div>

          {/* Live Audio Waves when recording */}
          {isRecording && (
            <div className="flex items-center justify-center gap-1.5 h-8 mb-4">
              {[40, 70, 30, 90, 50, 80, 60, 100, 45, 85, 35].map((h, i) => (
                <div
                  key={i}
                  className="w-1.5 bg-rose-500 rounded-full animate-pulse"
                  style={{
                    height: `${Math.max(12, Math.round(h * Math.random()))}px`,
                    animationDelay: `${i * 120}ms`
                  }}
                />
              ))}
            </div>
          )}

          {/* Speech fallback note */}
          {!speechSupported && (
            <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl text-amber-800 dark:text-amber-300 text-xs text-left mb-4">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>
                Microphone speech recognition is not supported in this browser. You can type your response below!
              </span>
            </div>
          )}

          {/* Spoken Response Text Area */}
          <div className="w-full text-left">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
              <span>Your Spoken Answer:</span>
              {currentAnswer && (
                <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {currentAnswer.split(" ").filter(Boolean).length} words
                </span>
              )}
            </div>
            <textarea
              value={currentAnswer}
              onChange={(e) =>
                setAnswers((prev) => ({ ...prev, [currentQ.id]: e.target.value }))
              }
              placeholder="Speak using the microphone above, or type your answer here..."
              rows={3}
              className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-slate-800 dark:text-slate-100 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
          </div>

          {/* Sample Answer Dropdown */}
          <div className="w-full mt-3 flex justify-between items-center text-xs">
            <button
              onClick={() => setShowSample(!showSample)}
              className="text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1 transition"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>{showSample ? "Hide sample answer" : "Show sample answer"}</span>
            </button>
            {currentAnswer && (
              <button
                onClick={() =>
                  setAnswers((prev) => ({ ...prev, [currentQ.id]: "" }))
                }
                className="text-slate-400 hover:text-rose-500 flex items-center gap-1 transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Clear answer</span>
              </button>
            )}
          </div>

          {showSample && (
            <div className="w-full mt-3 p-3.5 bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 rounded-2xl text-left text-xs text-indigo-900 dark:text-indigo-300 animate-fade-in">
              <span className="font-bold text-indigo-700 dark:text-indigo-400 block mb-1">
                Sample natural response:
              </span>
              &ldquo;{currentQ.sample_answer}&rdquo;
            </div>
          )}
        </div>
      </div>

      {/* Bottom Action Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Previous</span>
        </button>

        <div className="text-xs text-slate-400 text-center font-medium">
          {answeredCount} of {questions.length} questions answered
        </div>

        {isLastQuestion ? (
          <button
            onClick={handleSubmitAll}
            disabled={answeredCount === 0}
            className="w-full sm:w-auto px-8 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:to-pink-700 text-white font-bold text-sm shadow-lg shadow-indigo-500/30 transition transform hover:-translate-y-0.5 flex items-center justify-center gap-2 disabled:opacity-40 disabled:pointer-events-none"
          >
            <Sparkles className="w-4 h-4" />
            <span>Analyze My Spoken English 🚀</span>
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md shadow-indigo-600/20 transition flex items-center justify-center gap-2"
          >
            <span>Next Question</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
