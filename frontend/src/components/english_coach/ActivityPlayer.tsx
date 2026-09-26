"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  CoachLevel,
  CoachActivity,
  speakCoachText,
  stopCoachSpeaking,
  cleanRepeatedPhrases
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
  Brain,
  VolumeX,
  Play
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
  // Determine drill items based on activity type
  const items: any[] = React.useMemo(() => {
    const data = activity.data || {};
    if (activity.type === "repeat_after_coach" && Array.isArray(data.phrases)) {
      return data.phrases;
    }
    if (activity.type === "vocabulary" && Array.isArray(data.words)) {
      return data.words;
    }
    if (activity.type === "sentence_doctor" && Array.isArray(data.traps)) {
      return data.traps;
    }
    if (activity.type === "sentence_builder" && Array.isArray(data.drills)) {
      return data.drills;
    }
    if (activity.type === "mini_lesson" && Array.isArray(data.examples)) {
      return data.examples;
    }
    if (activity.type === "level_capstone_test" && Array.isArray(data.questions)) {
      return data.questions;
    }
    if (data.questions && Array.isArray(data.questions)) {
      return data.questions;
    }
    // Single item fallback
    return [data];
  }, [activity]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [spokenText, setSpokenText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isCoachSpeaking, setIsCoachSpeaking] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [feedback, setFeedback] = useState<any>(null);
  const [completed, setCompleted] = useState(false);
  const [completionResult, setCompletionResult] = useState<any>(null);
  const [itemScores, setItemScores] = useState<number[]>([]);
  const [hasStarted, setHasStarted] = useState(false);

  const currentItem = items[currentIndex] || items[0] || {};
  const isMultiItem = items.length > 1;

  const recognitionRef = useRef<any>(null);
  const silenceTimerRef = useRef<any>(null);
  const latestSpokenRef = useRef<string>("");

  // Target phrase and spoken prompt calculation
  const { targetPhrase, coachSpokenInstruction, displayPrompt } = React.useMemo(() => {
    const type = activity.type;
    const data = currentItem;

    if (type === "repeat_after_coach") {
      const text = data.text || "";
      const tip = data.phonetic_tip ? ` Tip: ${data.phonetic_tip}` : "";
      return {
        targetPhrase: text,
        coachSpokenInstruction: `Listen closely: "${text}". Now your turn, speak!`,
        displayPrompt: text
      };
    }

    if (type === "vocabulary") {
      const word = data.word || "";
      const meaning = data.meaning || "";
      const example = data.example || "";
      return {
        targetPhrase: word,
        coachSpokenInstruction: `Our word is "${word}". For example: "${example}". Now speak the word "${word}"!`,
        displayPrompt: `${word} — ${meaning}`
      };
    }

    if (type === "sentence_doctor") {
      const flawed = data.flawed || "";
      const corrected = data.corrected || "";
      const reason = data.reason || "";
      return {
        targetPhrase: corrected,
        coachSpokenInstruction: `Look at this trap: "${flawed}". Speak the corrected sentence aloud!`,
        displayPrompt: `Trap: "${flawed}"`
      };
    }

    if (type === "sentence_builder") {
      const target = data.target || "";
      const jumbled = Array.isArray(data.jumbled) ? data.jumbled.join(" / ") : "";
      return {
        targetPhrase: target,
        coachSpokenInstruction: `Assemble these words into a fluent spoken sentence. Speak aloud when ready!`,
        displayPrompt: jumbled || target
      };
    }

    if (type === "mini_lesson") {
      const correct = data.correct || "";
      return {
        targetPhrase: correct,
        coachSpokenInstruction: `Listen to the correct English form: "${correct}". Now repeat after me!`,
        displayPrompt: correct
      };
    }

    if (type === "level_capstone_test") {
      const prompt = data.prompt || "";
      return {
        targetPhrase: "",
        coachSpokenInstruction: `Here is your capstone challenge: "${prompt}". Speak your response naturally!`,
        displayPrompt: prompt
      };
    }

    // Default open-ended prompts
    const prompt = data.question || data.prompt || data.coach_starter || data.scenario || activity.instructions;
    return {
      targetPhrase: "",
      coachSpokenInstruction: prompt,
      displayPrompt: prompt
    };
  }, [activity.type, currentItem, activity.instructions]);

  // Clean up on unmount or item transition
  useEffect(() => {
    stopRecording();
    stopCoachSpeaking();
    setSpokenText("");
    latestSpokenRef.current = "";
    setFeedback(null);
    setIsAnalyzing(false);

    return () => {
      stopRecording();
      stopCoachSpeaking();
    };
  }, [currentIndex, activity.id]);

  // Trigger coach speech on step load
  const handlePlayCoachSpeech = () => {
    if (!coachSpokenInstruction) return;
    setHasStarted(true);
    stopRecording();
    setIsCoachSpeaking(true);

    speakCoachText(coachSpokenInstruction, () => {
      setIsCoachSpeaking(false);
      // Automatically open mic after coach finishes speaking
      setTimeout(() => {
        startRecording();
      }, 300);
    });
  };

  const hasEvaluatedRef = useRef(false);
  const isLongForm = activity.type === "presentation_pitch" || activity.type === "speech_cadence";

  // Start recording with clean non-duplicating transcript and automatic silence detector
  const startRecording = () => {
    if (typeof window === "undefined") return;
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRec) {
      alert("Microphone speech recognition not supported in this browser. Please type below.");
      return;
    }

    try {
      stopCoachSpeaking();
      setIsCoachSpeaking(false);
      setFeedback(null);
      setSpokenText("");
      latestSpokenRef.current = "";
      hasEvaluatedRef.current = false;

      const rec = new SpeechRec();
      // For short sentence drills (sentence builder, vocabulary, repeat, traps), continuous MUST be false.
      // This prevents Chrome from emitting multi-phrase prefix loops and word stuttering!
      rec.continuous = isLongForm;
      rec.interimResults = true;
      rec.lang = "en-IN";

      rec.onstart = () => {
        setIsRecording(true);
      };

      rec.onresult = (event: any) => {
        let text = "";
        if (isLongForm) {
          let finals = "";
          let interim = "";
          for (let i = 0; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finals += event.results[i][0].transcript + " ";
            } else {
              interim = event.results[i][0].transcript;
            }
          }
          text = (finals + " " + interim).trim();
        } else {
          // For single sentence mode: Take the current active result cleanly
          const lastIdx = event.results.length - 1;
          if (lastIdx >= 0) {
            text = event.results[lastIdx][0].transcript;
          }
        }

        const clean = cleanRepeatedPhrases(text);
        if (clean) {
          setSpokenText(clean);
          latestSpokenRef.current = clean;

          // Automatic Silence / VAD: If user has spoken at least 1 word and pauses for 1.6 seconds
          if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
          silenceTimerRef.current = setTimeout(() => {
            handleAutoFinishSpeaking(clean);
          }, 1600);
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
        if (finalClean && finalClean.length > 0 && !hasEvaluatedRef.current) {
          handleAutoFinishSpeaking(finalClean);
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
      // If user manually stopped and text exists, evaluate
      const clean = cleanRepeatedPhrases(spokenText);
      if (clean && !hasEvaluatedRef.current) {
        executeEvaluation(clean);
      }
    } else {
      startRecording();
    }
  };

  // Called automatically when user pauses speaking for 1.6s
  const handleAutoFinishSpeaking = (textToEvaluate: string) => {
    stopRecording();
    const clean = cleanRepeatedPhrases(textToEvaluate);
    if (clean && clean.length > 0 && !hasEvaluatedRef.current) {
      executeEvaluation(clean);
    }
  };

  // Execute real AI evaluation and speak feedback out loud
  const executeEvaluation = async (text: string) => {
    if (isAnalyzing || hasEvaluatedRef.current) return;
    hasEvaluatedRef.current = true;
    setIsAnalyzing(true);
    stopCoachSpeaking();

    try {
      const res = await critiqueSpokenResponse({
        prompt: displayPrompt,
        user_speech: text,
        target_phrase: targetPhrase || undefined,
        context: activity.instructions,
        drill_type: activity.type,
        user_level: `Level ${level.level_number}`
      });

      setFeedback(res);

      // Track item score
      const avg = Math.round(
        ((res.scores?.fluency || 70) + (res.scores?.grammar || 70) + (res.scores?.vocabulary || 70)) / 3
      );
      setItemScores((prev) => [...prev, avg]);

      // CRITICAL: The AI Coach SPEAKS the critique and correction OUT LOUD to the user!
      const scriptToSpeak =
        res.spoken_coach_speech ||
        (res.has_mistakes && res.corrected_sentence
          ? `Good try! You should say: ${res.corrected_sentence}.`
          : "Spot on! That was clear and natural.");

      setIsCoachSpeaking(true);
      speakCoachText(scriptToSpeak, () => {
        setIsCoachSpeaking(false);
        // If passed with score >= 75% and more items remain, auto advance after 1.5 seconds!
        if (!res.has_mistakes && isMultiItem && currentIndex < items.length - 1) {
          setTimeout(() => {
            handleAdvanceNext();
          }, 1500);
        }
      });
    } catch (err: any) {
      console.error("Evaluation error:", err);
      alert(err.message || "Failed to analyze speech.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Advance to next phrase / item or complete the activity
  const handleAdvanceNext = () => {
    stopRecording();
    stopCoachSpeaking();

    if (currentIndex < items.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSpokenText("");
      setFeedback(null);
      // Auto-speak the next item prompt
      setTimeout(() => {
        handlePlayCoachSpeech();
      }, 300);
    } else {
      finalizeActivity();
    }
  };

  // Finalize full activity completion on backend
  const finalizeActivity = async () => {
    stopRecording();
    stopCoachSpeaking();

    let finalScore = 90;
    if (itemScores.length > 0) {
      finalScore = Math.round(itemScores.reduce((a, b) => a + b, 0) / itemScores.length);
    } else if (feedback?.scores) {
      finalScore = Math.round(
        ((feedback.scores.fluency || 75) + (feedback.scores.grammar || 75) + (feedback.scores.vocabulary || 75)) / 3
      );
    }

    try {
      const mistakes = feedback?.has_mistakes
        ? [
            {
              original: feedback.original_snippet || spokenText,
              corrected: feedback.corrected_sentence || targetPhrase || "",
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

      // Speak congratulatory note
      speakCoachText("Activity completed! Fantastic speaking practice today. Let's keep this momentum going!");
    } catch (err: any) {
      console.error("Failed to complete activity:", err);
      alert(err.message || "Failed to record completion.");
    }
  };

  // Completed State View
  if (completed) {
    const isLevelUnlocked = completionResult?.next_level_unlocked;
    const unlockedLevelNum = completionResult?.unlocked_level;

    return (
      <div className="max-w-xl mx-auto py-12 px-4 text-center animate-fade-in">
        <div className="w-20 h-20 rounded-3xl bg-emerald-500 text-white flex items-center justify-center mx-auto mb-6 shadow-xl shadow-emerald-500/30">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 mb-3">
          Activity Mastered!
        </span>

        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mb-2">
          {activity.title}
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
          Your personal AI Coach observed all your spoken answers and updated your fluency profile.
        </p>

        {/* XP Card */}
        <div className="flex items-center justify-center gap-6 p-4 rounded-2xl bg-indigo-50 dark:bg-slate-800/80 border border-indigo-100 dark:border-slate-700 mb-8 max-w-sm mx-auto">
          <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400 font-bold text-sm">
            <Star className="w-5 h-5 fill-indigo-600 text-indigo-600" />
            <span>+{completionResult?.earned_xp || activity.xp} XP Earned</span>
          </div>
          <div className="w-px h-6 bg-slate-200 dark:bg-slate-700" />
          <div className="text-xs font-semibold text-slate-600 dark:text-slate-300">
            Level {level.level_number} Progress Updated
          </div>
        </div>

        {/* Level Unlock Celebration Banner */}
        {isLevelUnlocked && (
          <div className="p-6 rounded-3xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-xl shadow-indigo-600/30 mb-8 animate-bounce-subtle">
            <Award className="w-10 h-10 mx-auto mb-2 text-amber-300" />
            <h3 className="text-xl font-black mb-1">🎉 Level {unlockedLevelNum} Unlocked!</h3>
            <p className="text-xs sm:text-sm text-indigo-100 max-w-md mx-auto">
              You met the 80% passing criteria and proved your spoken mastery!
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
            Level {level.level_number} • {activity.title}
          </span>
          {isMultiItem && (
            <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              {currentIndex + 1} of {items.length}
            </span>
          )}
          <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 flex items-center gap-1">
            <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
            +{activity.xp} XP
          </span>
        </div>
      </div>

      {/* Main Interactive Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 dark:shadow-none mb-6">
        {/* Step Progress Bar (For multi-item activities like repeat after coach or vocabulary) */}
        {isMultiItem && (
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 mb-6 overflow-hidden flex gap-1">
            {items.map((_, i) => (
              <div
                key={i}
                className={`h-full flex-1 rounded-full transition-all duration-300 ${
                  i < currentIndex
                    ? "bg-emerald-500"
                    : i === currentIndex
                    ? "bg-indigo-600"
                    : "bg-slate-200 dark:bg-slate-700"
                }`}
              />
            ))}
          </div>
        )}

        {/* Coach Voice Banner: Start or Listen */}
        <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 border border-indigo-100 dark:border-indigo-900/40 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center flex-shrink-0 shadow-md shadow-indigo-600/20">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 block mb-0.5">
                AI Coach Audio Guide
              </span>
              <div className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                {coachSpokenInstruction}
              </div>
            </div>
          </div>

          <button
            onClick={handlePlayCoachSpeech}
            disabled={isCoachSpeaking}
            className={`px-4 py-2.5 rounded-xl border transition flex items-center justify-center gap-2 text-xs font-bold flex-shrink-0 ${
              isCoachSpeaking
                ? "bg-indigo-600 text-white border-indigo-600 animate-pulse shadow-md"
                : "bg-white dark:bg-slate-800 hover:bg-slate-50 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800 shadow-sm"
            }`}
          >
            <Volume2 className="w-4 h-4" />
            <span>{isCoachSpeaking ? "Coach is Speaking..." : "Listen to Coach 🔊"}</span>
          </button>
        </div>

        {/* Specific Visual Presentation based on activity type */}
        {activity.type === "repeat_after_coach" && (
          <div className="text-center py-4 mb-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 block">
              Repeat Phrase {currentIndex + 1} of {items.length}
            </span>
            <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-relaxed">
              &ldquo;{currentItem.text}&rdquo;
            </div>
            {currentItem.phonetic_tip && (
              <div className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold mt-2">
                💡 {currentItem.phonetic_tip}
              </div>
            )}
          </div>
        )}

        {activity.type === "vocabulary" && (
          <div className="p-5 rounded-2xl bg-indigo-50/40 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30 text-center mb-6">
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 block mb-1">
              Vocabulary Word {currentIndex + 1} of {items.length}
            </span>
            <div className="text-2xl font-black text-slate-900 dark:text-white mb-1">
              {currentItem.word}
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 mb-3">{currentItem.meaning}</p>
            <div className="text-xs text-slate-700 dark:text-slate-200 italic bg-white dark:bg-slate-800 p-2.5 rounded-xl border border-slate-100 dark:border-slate-700">
              &ldquo;{currentItem.example}&rdquo;
            </div>
          </div>
        )}

        {activity.type === "sentence_doctor" && (
          <div className="p-5 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 mb-6">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-800 dark:text-amber-300 mb-2">
              <AlertTriangle className="w-4 h-4" />
              <span>Common Speaking Trap {currentIndex + 1} of {items.length}</span>
            </div>
            <div className="text-base font-bold text-rose-700 dark:text-rose-400 mb-2 line-through">
              ❌ &ldquo;{currentItem.flawed}&rdquo;
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              💡 {currentItem.reason}
            </p>
          </div>
        )}

        {activity.type === "sentence_builder" && (
          <div className="p-5 rounded-2xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 mb-6 text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 block mb-2">
              Unscramble & Speak Aloud
            </span>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {(currentItem.jumbled || []).map((word: string, i: number) => (
                <span
                  key={i}
                  className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-bold text-xs shadow-sm"
                >
                  {word}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Automatic Speech / Microphone Interaction Area */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center text-center">
          <div className="relative mb-3">
            {isRecording && (
              <>
                <div className="absolute inset-0 rounded-full bg-rose-500/20 animate-ping" />
                <div className="absolute -inset-3 rounded-full bg-rose-500/10 animate-pulse" />
              </>
            )}
            <button
              onClick={toggleRecording}
              disabled={isCoachSpeaking || isAnalyzing}
              className={`relative z-10 w-20 h-20 rounded-full flex flex-col items-center justify-center transition-all duration-300 shadow-xl disabled:opacity-40 ${
                isRecording
                  ? "bg-rose-600 text-white shadow-rose-500/40 scale-105"
                  : "bg-gradient-to-tr from-indigo-600 to-purple-600 text-white hover:scale-105 shadow-indigo-500/30"
              }`}
            >
              {isRecording ? <MicOff className="w-7 h-7" /> : <Mic className="w-7 h-7" />}
              <span className="text-[9px] font-bold mt-1 uppercase tracking-wider">
                {isRecording ? "Listening" : "Tap to Speak"}
              </span>
            </button>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
            {isRecording ? (
              <span className="text-rose-600 dark:text-rose-400 font-semibold animate-pulse">
                🎙️ Listening... (Stops automatically when you pause)
              </span>
            ) : isAnalyzing ? (
              <span className="text-indigo-600 dark:text-indigo-400 font-semibold animate-pulse">
                AI Coach is evaluating your pronunciation...
              </span>
            ) : (
              <span>Tap the microphone to speak, or listen to the coach first.</span>
            )}
          </p>

          {/* Clean Spoken Transcript */}
          {spokenText && (
            <div className="w-full text-left bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700/80 mb-4 animate-fade-in">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                <span>You Spoke:</span>
                <span className="text-indigo-600 dark:text-indigo-400">
                  {spokenText.split(" ").filter(Boolean).length} words
                </span>
              </div>
              <div className="text-sm font-semibold text-slate-800 dark:text-slate-100 leading-relaxed">
                &ldquo;{spokenText}&rdquo;
              </div>
            </div>
          )}

          {/* Analyzing Spinner */}
          {isAnalyzing && (
            <div className="flex items-center gap-2 p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 text-xs font-semibold">
              <div className="w-4 h-4 border-2 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin" />
              <span>Analyzing phonetics, grammar & fluency...</span>
            </div>
          )}
        </div>

        {/* Immediate Real AI Mistake Doctor & Spoken Feedback */}
        {feedback && (
          <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 space-y-4 animate-fade-in">
            {/* Spoken Coach Voice Bubble */}
            {feedback.spoken_coach_speech && (
              <div className="p-4 rounded-2xl bg-indigo-500 text-white shadow-md flex items-start gap-3">
                <Volume2 className="w-5 h-5 flex-shrink-0 mt-0.5 animate-pulse" />
                <div className="text-left">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-200 block mb-0.5">
                    Coach Spoke Aloud:
                  </span>
                  <div className="text-xs sm:text-sm font-medium leading-relaxed">
                    &ldquo;{feedback.spoken_coach_speech}&rdquo;
                  </div>
                </div>
              </div>
            )}

            {/* Praise or Mistake Correction */}
            {!feedback.has_mistakes ? (
              <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-left flex items-start gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-emerald-800 dark:text-emerald-200 text-xs block mb-0.5">
                    Pronunciation Verified ✅
                  </span>
                  <p className="text-xs text-emerald-900 dark:text-emerald-300">
                    {feedback.affirmation || "Spot on! Your pronunciation was accurate and natural."}
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-left space-y-2.5">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-800 dark:text-amber-300">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Coach Correction:</span>
                </div>

                {feedback.original_snippet && (
                  <div className="text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2 bg-rose-50/60 dark:bg-rose-950/40 p-2.5 rounded-xl border border-rose-200 dark:border-rose-900">
                    <span className="font-bold flex-shrink-0">❌ You Said:</span>
                    <span>&ldquo;{feedback.original_snippet}&rdquo;</span>
                  </div>
                )}

                <div className="text-xs text-emerald-700 dark:text-emerald-300 flex items-start gap-2 bg-emerald-50/60 dark:bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-200 dark:border-emerald-900">
                  <span className="font-bold flex-shrink-0">✅ Correct Form:</span>
                  <span className="font-semibold">&ldquo;{feedback.corrected_sentence}&rdquo;</span>
                </div>

                {feedback.explanation && (
                  <p className="text-xs text-slate-600 dark:text-slate-400 italic">
                    💡 <span className="font-semibold">Rule:</span> {feedback.explanation}
                  </p>
                )}
              </div>
            )}

            {/* True Accurate Scores Display */}
            {feedback.scores && (
              <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-center">
                <div>
                  <div className="text-lg font-black text-indigo-600 dark:text-indigo-400">
                    {feedback.scores.fluency || 80}%
                  </div>
                  <div className="text-[10px] font-bold uppercase text-slate-400">Fluency</div>
                </div>
                <div>
                  <div className="text-lg font-black text-purple-600 dark:text-purple-400">
                    {feedback.scores.grammar || 80}%
                  </div>
                  <div className="text-[10px] font-bold uppercase text-slate-400">Grammar</div>
                </div>
                <div>
                  <div className="text-lg font-black text-pink-600 dark:text-pink-400">
                    {feedback.scores.vocabulary || 80}%
                  </div>
                  <div className="text-[10px] font-bold uppercase text-slate-400">Accuracy</div>
                </div>
              </div>
            )}

            {/* Bottom Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <button
                onClick={() => {
                  setFeedback(null);
                  setSpokenText("");
                  startRecording();
                }}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Repeat & Try Again</span>
              </button>

              <button
                onClick={handleAdvanceNext}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-1.5"
              >
                <span>
                  {isMultiItem && currentIndex < items.length - 1
                    ? `Next (${currentIndex + 2} of ${items.length})`
                    : "Finish Activity & Save Progress"}
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
