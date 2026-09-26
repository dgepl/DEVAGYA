"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  CoachLevel,
  CoachActivity,
  speakCoachText,
  stopCoachSpeaking
} from "./types";
import { critiqueSpokenResponse, completeCoachActivity } from "@/lib/api";
import {
  ArrowLeft,
  Volume2,
  Mic,
  MicOff,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Award,
  RotateCcw,
  Star,
  Clock,
  ArrowRight,
  HelpCircle,
  TrendingUp,
  Brain
} from "lucide-react";

interface Props {
  level: CoachLevel;
  activity: CoachActivity;
  userId: string;
  userRole: string;
  onActivityFinished: (result: any) => void;
  onBack: () => void;
}

export function ActivityPlayer({
  level,
  activity,
  userId,
  userRole,
  onActivityFinished,
  onBack
}: Props) {
  const [spokenText, setSpokenText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isCoachSpeaking, setIsCoachSpeaking] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [feedback, setFeedback] = useState<any>(null);
  const [completed, setCompleted] = useState(false);
  const [completionResult, setCompletionResult] = useState<any>(null);

  // For multi-question capstones
  const isCapstone = activity.type === "level_capstone_test";
  const capstoneQuestions = activity.data?.questions || [];
  const [capstoneIndex, setCapstoneIndex] = useState(0);
  const [capstoneScores, setCapstoneScores] = useState<number[]>([]);

  const currentCapstoneQ = isCapstone ? capstoneQuestions[capstoneIndex] : null;

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Speak prompt on initial activity load
    const promptToRead = getPromptText();
    if (promptToRead) {
      const timer = setTimeout(() => {
        handleSpeakPrompt(promptToRead);
      }, 350);
      return () => clearTimeout(timer);
    }

    return () => {
      stopCoachSpeaking();
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
    };
  }, [activity.id, capstoneIndex]);

  const getPromptText = (): string => {
    if (isCapstone && currentCapstoneQ) {
      return currentCapstoneQ.prompt;
    }
    if (activity.data?.prompt) return activity.data.prompt;
    if (activity.data?.coach_starter) return activity.data.coach_starter;
    if (activity.data?.coach_prompt) return activity.data.coach_prompt;
    if (activity.data?.scenario) return activity.data.scenario;
    if (activity.data?.pattern) return `Practice using this pattern: ${activity.data.pattern}`;
    return activity.instructions;
  };

  const handleSpeakPrompt = (textToSpeak?: string) => {
    const text = textToSpeak || getPromptText();
    if (!text) return;
    setIsCoachSpeaking(true);
    speakCoachText(text, () => setIsCoachSpeaking(false));
  };

  const startRecording = () => {
    if (typeof window === "undefined") return;
    const SpeechRec =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRec) {
      alert("Speech recognition not supported in this browser. Please type your response below.");
      return;
    }

    try {
      stopCoachSpeaking();
      setIsCoachSpeaking(false);
      const rec = new SpeechRec();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = "en-IN";

      rec.onstart = () => setIsRecording(true);

      rec.onresult = (event: any) => {
        let finalTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript + " ";
          }
        }
        if (finalTranscript) {
          setSpokenText((prev) => (prev + " " + finalTranscript).trim());
        }
      };

      rec.onerror = (e: any) => {
        console.warn("Speech recognition error:", e);
        setIsRecording(false);
      };

      rec.onend = () => setIsRecording(false);

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

  // Submit speech for critique & feedback
  const handleEvaluate = async () => {
    stopRecording();
    stopCoachSpeaking();

    const textToEvaluate = spokenText.trim();
    if (!textToEvaluate) {
      alert("Please speak or type a response first!");
      return;
    }

    setIsEvaluating(true);
    try {
      const prompt = getPromptText();
      const res = await critiqueSpokenResponse({
        prompt: prompt,
        user_speech: textToEvaluate,
        context: activity.instructions,
        user_level: `Level ${level.level_number}`
      });

      setFeedback(res);

      // If capstone, track scores
      if (isCapstone) {
        const avgScore = Math.round(
          ((res.scores?.fluency || 70) +
            (res.scores?.grammar || 70) +
            (res.scores?.vocabulary || 70) +
            (res.scores?.confidence || 75)) /
            4
        );
        setCapstoneScores((prev) => [...prev, avgScore]);
      }
    } catch (err: any) {
      console.error("Critique error:", err);
      alert(err.message || "Failed to analyze speech. Please try again.");
    } finally {
      setIsEvaluating(false);
    }
  };

  // Move to next capstone question or complete activity
  const handleNextStepOrComplete = async () => {
    if (isCapstone && capstoneIndex < capstoneQuestions.length - 1) {
      setCapstoneIndex((prev) => prev + 1);
      setSpokenText("");
      setFeedback(null);
      return;
    }

    // Mark activity complete on backend
    try {
      let finalScore = 100;
      if (feedback?.scores) {
        finalScore = Math.round(
          ((feedback.scores.fluency || 75) +
            (feedback.scores.grammar || 75) +
            (feedback.scores.vocabulary || 75)) /
            3
        );
      }

      if (isCapstone && capstoneScores.length > 0) {
        const sum = capstoneScores.reduce((a, b) => a + b, 0);
        finalScore = Math.round(sum / capstoneScores.length);
      }

      const mistakes = feedback?.has_mistakes
        ? [
            {
              original: feedback.original_snippet || spokenText,
              corrected: feedback.corrected_sentence || "",
              rule: feedback.explanation || ""
            }
          ]
        : [];

      const result = await completeCoachActivity({
        user_id: userId,
        user_role: userRole,
        level_number: level.level_number,
        activity_id: activity.id,
        score: finalScore,
        mistakes: mistakes
      });

      setCompletionResult(result);
      setCompleted(true);
    } catch (err: any) {
      console.error("Failed to complete activity:", err);
      alert(err.message || "Failed to save completion.");
    }
  };

  // Completed State View
  if (completed) {
    const isLevelUnlocked = completionResult?.next_level_unlocked;
    const unlockedLevelNum = completionResult?.unlocked_level;

    return (
      <div className="max-w-xl mx-auto py-12 px-4 text-center">
        <div className="w-20 h-20 rounded-3xl bg-emerald-500 text-white flex items-center justify-center mx-auto mb-6 shadow-xl shadow-emerald-500/30">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 mb-3">
          Activity Completed!
        </span>

        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mb-2">
          {activity.title}
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
          Great job practicing with your AI coach today!
        </p>

        {/* XP Card */}
        <div className="flex items-center justify-center gap-6 p-4 rounded-2xl bg-indigo-50 dark:bg-slate-800/80 border border-indigo-100 dark:border-slate-700 mb-8 max-w-sm mx-auto">
          <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400 font-bold text-sm">
            <Star className="w-5 h-5 fill-indigo-600 text-indigo-600" />
            <span>+{completionResult?.earned_xp || activity.xp} XP Earned</span>
          </div>
          <div className="w-px h-6 bg-slate-200 dark:bg-slate-700" />
          <div className="text-xs font-semibold text-slate-600 dark:text-slate-300">
            Stage {level.level_number} Progress Updated
          </div>
        </div>

        {/* Level Unlock Announcement Banner */}
        {isLevelUnlocked && (
          <div className="p-6 rounded-3xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-xl shadow-indigo-600/30 mb-8 animate-bounce-subtle">
            <Award className="w-10 h-10 mx-auto mb-2 text-amber-300" />
            <h3 className="text-xl font-black mb-1">
              🎉 Level {unlockedLevelNum} Unlocked!
            </h3>
            <p className="text-xs sm:text-sm text-indigo-100 max-w-md mx-auto">
              You met the 80% completion criteria and passed the capstone exam.
              Welcome to the next progressive level!
            </p>
          </div>
        )}

        <button
          onClick={() => onActivityFinished(completionResult)}
          className="px-8 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-lg shadow-indigo-600/20 transition flex items-center justify-center gap-2 mx-auto"
        >
          <span>Continue to Dashboard</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 sm:py-8">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Levels</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-xl text-xs font-bold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
            Level {level.level_number} • {level.title}
          </span>
          <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 flex items-center gap-1">
            <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
            +{activity.xp} XP
          </span>
        </div>
      </div>

      {/* Main Activity Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 dark:shadow-none mb-6">
        {/* Activity Title & Instructions */}
        <div className="mb-6">
          <div className="flex items-center justify-between gap-2 mb-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {activity.title}
            </h1>
            <button
              onClick={() => handleSpeakPrompt()}
              disabled={isCoachSpeaking}
              className={`p-2.5 rounded-xl border transition flex items-center gap-1.5 text-xs font-semibold ${
                isCoachSpeaking
                  ? "bg-indigo-600 text-white border-indigo-600 animate-pulse"
                  : "bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
              }`}
              title="Listen to coach read this prompt"
            >
              <Volume2 className="w-4 h-4" />
              <span className="hidden sm:inline">
                {isCoachSpeaking ? "Speaking..." : "Read Aloud"}
              </span>
            </button>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            {activity.instructions}
          </p>
        </div>

        {/* Specialized Data Visuals for Activity Type */}
        {/* Vocabulary Sparks Visual */}
        {activity.type === "vocabulary_sparks" && activity.data?.words && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
            {activity.data.words.map((item: any, idx: number) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40"
              >
                <div className="font-black text-indigo-700 dark:text-indigo-400 text-base mb-0.5">
                  {item.word}
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-300 mb-2">
                  {item.meaning}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 italic">
                  &ldquo;{item.example}&rdquo;
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Sentence Builder Visual */}
        {activity.type === "sentence_builder" && activity.data && (
          <div className="p-4 rounded-2xl bg-purple-50/60 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/40 mb-6">
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 block mb-1">
              Target Sentence Pattern
            </span>
            <div className="font-extrabold text-slate-900 dark:text-white text-sm mb-2">
              {activity.data.pattern}
            </div>
            {activity.data.examples && (
              <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1">
                {activity.data.examples.map((ex: string, i: number) => (
                  <li key={i} className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                    <span>&ldquo;{ex}&rdquo;</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Capstone Question Header if applicable */}
        {isCapstone && currentCapstoneQ && (
          <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 mb-6">
            <div className="flex items-center justify-between text-xs font-bold text-amber-800 dark:text-amber-300 mb-1">
              <span>Capstone Question {capstoneIndex + 1} of {capstoneQuestions.length}</span>
              <span>Pass Score: {level.pass_percentage}%</span>
            </div>
            <div className="text-sm font-black text-slate-900 dark:text-white">
              &ldquo;{currentCapstoneQ.prompt}&rdquo;
            </div>
          </div>
        )}

        {/* Normal prompt banner */}
        {!isCapstone && activity.data?.prompt && (
          <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-slate-800/80 border border-indigo-100 dark:border-slate-700 mb-6">
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 block mb-1">
              Speaking Challenge
            </span>
            <div className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
              &ldquo;{activity.data.prompt}&rdquo;
            </div>
          </div>
        )}

        {/* Coach Starter (Debate / Roleplay) */}
        {(activity.data?.coach_starter || activity.data?.coach_prompt) && (
          <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-slate-800/80 border border-indigo-100 dark:border-slate-700 mb-6">
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 mb-1">
              <Brain className="w-4 h-4" />
              <span>Coach Prompt:</span>
            </div>
            <div className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
              &ldquo;{activity.data.coach_starter || activity.data.coach_prompt}&rdquo;
            </div>
          </div>
        )}

        {/* Microphone Speaking Section */}
        <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center text-center">
          <div className="relative mb-4">
            {isRecording && (
              <>
                <div className="absolute inset-0 rounded-full bg-rose-500/20 animate-ping" />
                <div className="absolute -inset-3 rounded-full bg-rose-500/10 animate-pulse" />
              </>
            )}
            <button
              onClick={toggleRecording}
              className={`relative z-10 w-20 h-20 rounded-full flex flex-col items-center justify-center transition-all duration-300 shadow-xl ${
                isRecording
                  ? "bg-rose-600 text-white shadow-rose-500/40 scale-105"
                  : "bg-gradient-to-tr from-indigo-600 to-purple-600 text-white hover:scale-105 shadow-indigo-500/30"
              }`}
            >
              {isRecording ? <MicOff className="w-7 h-7" /> : <Mic className="w-7 h-7" />}
              <span className="text-[9px] font-bold mt-1 uppercase tracking-wider">
                {isRecording ? "Listening" : "Speak"}
              </span>
            </button>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            {isRecording
              ? "Coach is listening... Tap the microphone button when you finish speaking."
              : "Tap the microphone to speak your response aloud."}
          </p>

          {/* Transcript / Input text area */}
          <div className="w-full text-left">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
              <span>Your Spoken Answer:</span>
              {spokenText && (
                <button
                  onClick={() => setSpokenText("")}
                  className="text-slate-400 hover:text-rose-500 text-[11px]"
                >
                  Clear
                </button>
              )}
            </div>
            <textarea
              value={spokenText}
              onChange={(e) => setSpokenText(e.target.value)}
              placeholder="Speak using the microphone, or type your answer here..."
              rows={3}
              className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-slate-800 dark:text-slate-100 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
          </div>

          {/* Evaluate Button */}
          {!feedback && (
            <button
              onClick={handleEvaluate}
              disabled={isEvaluating || !spokenText.trim()}
              className="mt-5 w-full sm:w-auto px-8 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md transition disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center gap-2"
            >
              {isEvaluating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Coach is Evaluating...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Get Coach Feedback & Score</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Immediate Constructive Mistake Doctor Feedback Card */}
        {feedback && (
          <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 space-y-4 animate-fade-in">
            {/* Praise & Affirmation */}
            <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-300 text-xs sm:text-sm font-medium flex items-start gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block text-emerald-800 dark:text-emerald-200 mb-0.5">
                  Coach Affirmation:
                </span>
                {feedback.affirmation}
              </div>
            </div>

            {/* Error Doctor: ❌ Original vs ✅ Corrected */}
            {feedback.has_mistakes && feedback.corrected_sentence && (
              <div className="p-5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-left space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-800 dark:text-amber-300">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Gentle Mistake Doctor (Learn & Improve):</span>
                </div>

                {feedback.original_snippet && (
                  <div className="text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2 bg-rose-50/60 dark:bg-rose-950/40 p-2.5 rounded-xl border border-rose-200 dark:border-rose-900">
                    <span className="font-bold flex-shrink-0">❌ Original:</span>
                    <span>&ldquo;{feedback.original_snippet}&rdquo;</span>
                  </div>
                )}

                <div className="text-xs text-emerald-700 dark:text-emerald-300 flex items-start gap-2 bg-emerald-50/60 dark:bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-200 dark:border-emerald-900">
                  <span className="font-bold flex-shrink-0">✅ Natural English:</span>
                  <span className="font-semibold">&ldquo;{feedback.corrected_sentence}&rdquo;</span>
                </div>

                {feedback.explanation && (
                  <p className="text-xs text-slate-600 dark:text-slate-400 italic">
                    💡 <span className="font-semibold">Why:</span> {feedback.explanation}
                  </p>
                )}
              </div>
            )}

            {/* Spoken Scores Dial */}
            {feedback.scores && (
              <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-center">
                <div>
                  <div className="text-lg font-black text-indigo-600 dark:text-indigo-400">
                    {feedback.scores.fluency || 75}%
                  </div>
                  <div className="text-[10px] font-bold uppercase text-slate-400">Fluency</div>
                </div>
                <div>
                  <div className="text-lg font-black text-purple-600 dark:text-purple-400">
                    {feedback.scores.grammar || 75}%
                  </div>
                  <div className="text-[10px] font-bold uppercase text-slate-400">Grammar</div>
                </div>
                <div>
                  <div className="text-lg font-black text-pink-600 dark:text-pink-400">
                    {feedback.scores.vocabulary || 75}%
                  </div>
                  <div className="text-[10px] font-bold uppercase text-slate-400">Vocabulary</div>
                </div>
              </div>
            )}

            {/* Proceed to Next Step Button */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <button
                onClick={() => {
                  setFeedback(null);
                  setSpokenText("");
                }}
                className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Try Saying Again</span>
              </button>

              <button
                onClick={handleNextStepOrComplete}
                className="w-full sm:w-auto px-8 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2"
              >
                <span>
                  {isCapstone && capstoneIndex < capstoneQuestions.length - 1
                    ? "Next Capstone Question"
                    : "Complete Activity & Save Progress"}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
