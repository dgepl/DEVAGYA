"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  CoachLevel,
  CoachActivity,
  speakCoachText,
  stopCoachSpeaking,
  cleanRepeatedPhrases,
  parseSpeechResults,
  unlockAudio,
  COACH_DEFAULT_VOICE
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
  Play,
  Flame
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
    if (activity.type === "connectors" && Array.isArray(data.drills)) {
      return data.drills;
    }
    if (activity.type === "sentence_expansion" && Array.isArray(data.drills)) {
      return data.drills;
    }
    if (activity.type === "spontaneous_speaking" && Array.isArray(data.topics)) {
      return data.topics.map((t: string) => ({ topic: t, target_seconds: 60 }));
    }
    if (activity.type === "mini_lesson" && Array.isArray(data.examples)) {
      return data.examples;
    }
    if (activity.type === "fill_in_blanks" && Array.isArray(data.questions)) {
      return data.questions;
    }
    if (activity.type === "daily_expressions" && Array.isArray(data.expressions)) {
      return data.expressions;
    }
    if (activity.type === "level_capstone_test" && Array.isArray(data.questions)) {
      return data.questions;
    }
    if (data.questions && Array.isArray(data.questions)) {
      return data.questions;
    }
    if (data.drills && Array.isArray(data.drills)) {
      return data.drills;
    }
    if (data.topics && Array.isArray(data.topics)) {
      return data.topics.map((t: string) => ({ topic: t, target_seconds: 60 }));
    }
    // Single item fallback
    return [data];
  }, [activity]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [spokenText, setSpokenText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isCoachSpeaking, setIsCoachSpeaking] = useState(false);
  const isCoachSpeakingRef = useRef(false);

  const updateCoachSpeaking = (val: boolean) => {
    isCoachSpeakingRef.current = val;
    setIsCoachSpeaking(val);
  };

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
  const isManualStopRef = useRef<boolean>(false);
  const lastSpeechTimeRef = useRef<number>(0);

  // Exact 100% synchronization between screen text and coach speech
  const { targetPhrase, coachSpokenInstruction, displayPrompt } = React.useMemo(() => {
    const type = activity.type;
    const data = currentItem;

    if (type === "repeat_after_coach") {
      const text = data.text || "";
      return {
        targetPhrase: text,
        coachSpokenInstruction: text,
        displayPrompt: text
      };
    }

    if (type === "vocabulary") {
      const word = data.word || "";
      const example = data.example || "";
      const meaning = data.meaning || "";
      const spokenText = example ? `Practice using ${word}. For example: ${example}` : `Practice pronouncing: ${word}`;
      return {
        targetPhrase: example || word,
        coachSpokenInstruction: spokenText,
        displayPrompt: `${word} — ${meaning}`
      };
    }

    if (type === "sentence_doctor") {
      const flawed = data.flawed || "";
      const corrected = data.corrected || "";
      return {
        targetPhrase: corrected,
        coachSpokenInstruction: "There is a speaking trap in this sentence. Find the mistake and speak the correct sentence aloud.",
        displayPrompt: `Doctor this flawed sentence: "${flawed}"`
      };
    }

    if (type === "sentence_builder") {
      const target = data.target || "";
      const jumbledList = (data.jumbled || []).join(", ");
      return {
        targetPhrase: target,
        coachSpokenInstruction: "Rearrange these jumbled words into a complete, correct sentence and speak it aloud.",
        displayPrompt: `Unscramble these words: ${jumbledList}`
      };
    }

    if (type === "mini_lesson") {
      const correct = data.correct || "";
      const incorrect = data.incorrect || "";
      return {
        targetPhrase: correct,
        coachSpokenInstruction: "Find the grammar mistake in this sentence and speak the correct form aloud.",
        displayPrompt: `Fix the grammar mistake in: "${incorrect}"`
      };
    }

    if (type === "fill_in_blanks") {
      const sentence = data.sentence || "";
      const correct = data.correct || "";
      const completedSentence = sentence.replace("_______", correct).replace(/\s+/g, " ");
      return {
        targetPhrase: completedSentence,
        coachSpokenInstruction: "Choose the correct option to fill the blank, and speak the complete sentence aloud.",
        displayPrompt: `Fill in the blank: "${sentence}"`
      };
    }

    if (type === "daily_expressions") {
      const trigger = data.trigger || "";
      const replies = data.replies || [];
      return {
        targetPhrase: replies[0] || trigger,
        coachSpokenInstruction: trigger,
        displayPrompt: trigger
      };
    }

    if (type === "level_capstone_test") {
      const prompt = data.prompt || "";
      return {
        targetPhrase: "",
        coachSpokenInstruction: prompt,
        displayPrompt: prompt
      };
    }

    if (type === "spontaneous_speaking") {
      const topic = data.topic || (Array.isArray(data.topics) ? data.topics[0] : "") || data.prompt || "";
      return {
        targetPhrase: "",
        coachSpokenInstruction: `Here is your spontaneous speaking topic: ${topic}. Take a deep breath and speak for 60 seconds.`,
        displayPrompt: topic
      };
    }

    if (type === "connectors") {
      const ideaA = data.idea_a || "";
      const ideaB = data.idea_b || "";
      const connector = data.connector || "a connector word";
      const model = data.model || "";
      const spokenInst = ideaA && ideaB
        ? `Connect these two thoughts into one fluent sentence using ${connector}: ${ideaA}, and ${ideaB}. Speak your connected sentence aloud.`
        : (data.prompt || "Speak a connected sentence aloud.");
      return {
        targetPhrase: model,
        coachSpokenInstruction: spokenInst,
        displayPrompt: data.prompt || `Connect: "${ideaA}" + "${ideaB}" using ${connector}`
      };
    }

    if (type === "sentence_expansion") {
      const base = data.base || "";
      const model = data.expanded || "";
      return {
        targetPhrase: model,
        coachSpokenInstruction: `Expand this short sentence into a rich, detailed statement: ${base}. Speak your expanded sentence aloud.`,
        displayPrompt: `Expand this sentence: "${base}"`
      };
    }

    if (type === "storytelling") {
      const starter = data.starter || "";
      return {
        targetPhrase: "",
        coachSpokenInstruction: `Continue this story and speak for 45 to 60 seconds: ${starter}`,
        displayPrompt: starter
      };
    }

    if (type === "interview_simulation") {
      const role = data.role ? `For the role of ${data.role}: ` : "";
      const coachPrompt = data.coach_prompt || data.prompt || "";
      return {
        targetPhrase: "",
        coachSpokenInstruction: `${role}${coachPrompt}`,
        displayPrompt: coachPrompt
      };
    }

    if (type === "presentation_pitch") {
      const prompt = data.prompt || "";
      return {
        targetPhrase: "",
        coachSpokenInstruction: `Here is your pitch challenge: ${prompt}. Speak with energy and clarity.`,
        displayPrompt: prompt
      };
    }

    if (type === "debate_sparring") {
      const coachStarter = data.coach_starter || data.prompt || "";
      return {
        targetPhrase: "",
        coachSpokenInstruction: coachStarter,
        displayPrompt: coachStarter
      };
    }

    // Default open-ended prompts
    const prompt = data.question || data.prompt || data.coach_starter || data.coach_prompt || data.scenario || activity.instructions;
    return {
      targetPhrase: "",
      coachSpokenInstruction: prompt,
      displayPrompt: prompt
    };
  }, [activity.type, currentItem, activity.instructions]);

  // Clean up on unmount or item transition + AUTO-SPEAK on new task/level
  useEffect(() => {
    stopRecording();
    stopCoachSpeaking();
    setSpokenText("");
    latestSpokenRef.current = "";
    setFeedback(null);
    setIsAnalyzing(false);

    // AUTO-SPEAK & AUTO-LISTEN: Automatically start coach speaking on every new task or level,
    // and as soon as the coach finishes, automatically begin listening so user never has to click!
    const autoPlayTimer = setTimeout(() => {
      if (coachSpokenInstruction) {
        updateCoachSpeaking(true);
        speakCoachText(
          coachSpokenInstruction,
          () => {
            updateCoachSpeaking(false);
            // Allow 350ms for Windows/Chrome audio output session to release cleanly to microphone
            setTimeout(() => {
              startRecording();
            }, 350);
          },
          COACH_DEFAULT_VOICE
        );
      } else {
        setTimeout(() => {
          startRecording();
        }, 350);
      }
    }, 350);

    return () => {
      clearTimeout(autoPlayTimer);
      stopRecording();
      stopCoachSpeaking();
    };
  }, [currentIndex, activity.id, coachSpokenInstruction]);

  // Trigger coach speech cleanly on replay
  const handlePlayCoachSpeech = () => {
    if (!coachSpokenInstruction) return;
    setHasStarted(true);
    stopRecording();
    updateCoachSpeaking(true);

    speakCoachText(
      coachSpokenInstruction,
      () => {
        updateCoachSpeaking(false);
        setTimeout(() => {
          startRecording();
        }, 350);
      },
      COACH_DEFAULT_VOICE
    );
  };

  const hasEvaluatedRef = useRef(false);
  const isLongForm = activity.type === "presentation_pitch" || activity.type === "speech_cadence" || activity.type === "speaking_challenge";

  // Start recording with clean non-duplicating transcript and automatic silence detector
  const startRecording = () => {
    if (typeof window === "undefined") return;

    // Hardware isolation: Ensure AI coach is completely silent before listening
    stopCoachSpeaking();
    updateCoachSpeaking(false);

    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRec) {
      alert("Microphone speech recognition not supported in this browser. Please use Chrome or Edge.");
      return;
    }

    // Abort and detach any existing recognition instance to avoid already-started collision
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onstart = null;
        recognitionRef.current.onresult = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.abort();
      } catch (e) {}
      recognitionRef.current = null;
    }

    try {
      setFeedback(null);
      setSpokenText("");
      latestSpokenRef.current = "";
      hasEvaluatedRef.current = false;
      isManualStopRef.current = false;
      lastSpeechTimeRef.current = Date.now();

      const rec = new SpeechRec();
      const isMobile = typeof navigator !== "undefined" && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      rec.continuous = !isMobile;
      rec.interimResults = true;
      rec.maxAlternatives = 5; // Multi-hypothesis acoustic decoding for high accuracy
      rec.lang = "en-IN";

      rec.onstart = () => {
        setIsRecording(true);
      };

      rec.onresult = (event: any) => {
        if (isCoachSpeakingRef.current) return; // Prevent mic from capturing speaker audio

        let text = parseSpeechResults(event);
        if (!text) return;

        // In grammar exercises, NEVER pick alternative based on targetPhrase overlap,
        // because that can mask actual user speech errors (e.g. replacing 'on' with 'at')!
        const isGrammarOrAccuracyDrill = [
          "fill_in_blanks",
          "sentence_doctor",
          "sentence_builder",
          "mini_lesson"
        ].includes(activity.type);

        const lastIdx = event.results.length - 1;
        if (lastIdx >= 0 && targetPhrase && !isGrammarOrAccuracyDrill) {
          const resultList = event.results[lastIdx];
          if (resultList && resultList.length > 1) {
            const targetNorm = targetPhrase.toLowerCase().replace(/[^\w\s]/g, "");
            const targetWords = targetNorm.split(/\s+/);
            let highestOverlap = -1;
            let bestTranscript = "";

            for (let a = 0; a < resultList.length; a++) {
              const altText = (resultList[a]?.transcript || "").trim();
              const altNorm = altText.toLowerCase().replace(/[^\w\s]/g, "").replace(/\bcivil\b/g, "she will");
              const altWords = altNorm.split(/\s+/);
              const overlap = altWords.filter((w: string) => targetWords.includes(w)).length;
              if (overlap > highestOverlap) {
                highestOverlap = overlap;
                bestTranscript = altText;
              }
            }
            if (bestTranscript) {
              text = bestTranscript;
            }
          }
        }

        // Acoustic near-homophone correction (e.g. speech recognizer hearing 'civil' for 'she will')
        if (targetPhrase && targetPhrase.toLowerCase().includes("she will")) {
          text = text.replace(/\bcivil\b/gi, "she will");
        }

        const clean = cleanRepeatedPhrases(text);
        if (clean && clean.trim().length > 0) {
          setSpokenText(clean);
          latestSpokenRef.current = clean;
          lastSpeechTimeRef.current = Date.now();

          // Automatic Silence Detection: Wait a comfortable 4000ms (4 seconds) of pause
          // so student can breathe, think, and complete their sentence across all 4 levels!
          if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
          silenceTimerRef.current = setTimeout(() => {
            handleAutoFinishSpeaking(clean);
          }, 4000);
        }
      };

      rec.onerror = (e: any) => {
        console.warn("Speech recognition notice:", e.error);
        // Do NOT abort on normal silence or no-speech! Keep microphone open!
        if (e.error === "no-speech" || e.error === "aborted") {
          return;
        }
        setIsRecording(false);
      };

      rec.onend = () => {
        if (hasEvaluatedRef.current || isCoachSpeakingRef.current || isManualStopRef.current) {
          setIsRecording(false);
          if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current);
            silenceTimerRef.current = null;
          }
          return;
        }

        // If user has spoken and the 4-second pause timer is still active,
        // keep listening so breathing/pausing doesn't prematurely cut the mic off!
        const elapsedSinceSpeech = Date.now() - lastSpeechTimeRef.current;
        if (silenceTimerRef.current && elapsedSinceSpeech < 3800) {
          try {
            rec.start();
            setIsRecording(true);
            return;
          } catch (e) {
            // If already starting or restart fails, allow timer to finish
          }
        } else if (!latestSpokenRef.current && !isManualStopRef.current) {
          // User hasn't started speaking yet; keep listening
          try {
            rec.start();
            setIsRecording(true);
            return;
          } catch (e) {}
        }

        // Only finish if 4 seconds have elapsed
        setIsRecording(false);
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
          silenceTimerRef.current = null;
        }
        const finalClean = cleanRepeatedPhrases(latestSpokenRef.current);
        if (finalClean && finalClean.trim().length > 0 && !hasEvaluatedRef.current && !isCoachSpeakingRef.current) {
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
    isManualStopRef.current = true;
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
        recognitionRef.current.abort();
      } catch (e) {}
      recognitionRef.current = null;
    }
    setIsRecording(false);
  };

  const toggleRecording = () => {
    unlockAudio();
    if (isCoachSpeaking) {
      stopCoachSpeaking();
      updateCoachSpeaking(false);
      setTimeout(() => {
        startRecording();
      }, 150);
      return;
    }
    if (isRecording) {
      stopRecording();
      // If user manually stopped and text exists, evaluate
      const clean = cleanRepeatedPhrases(spokenText || latestSpokenRef.current);
      if (clean && clean.trim().length > 0 && !hasEvaluatedRef.current) {
        executeEvaluation(clean);
      }
    } else {
      startRecording();
    }
  };

  // Called automatically when user pauses speaking for 4 seconds
  const handleAutoFinishSpeaking = (textToEvaluate: string) => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    stopRecording();
    if (isCoachSpeakingRef.current || hasEvaluatedRef.current) return;
    const clean = cleanRepeatedPhrases(textToEvaluate || latestSpokenRef.current);
    if (clean && clean.trim().length > 0) {
      executeEvaluation(clean);
    }
  };

  // Execute real AI evaluation and speak feedback out loud ONCE (no auto-advancing loop)
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

      // Track authentic item score
      const itemFluency = typeof res.scores?.fluency === "number" ? res.scores.fluency : 50;
      const itemGrammar = typeof res.scores?.grammar === "number" ? res.scores.grammar : 50;
      const itemVocab = typeof res.scores?.vocabulary === "number" ? res.scores.vocabulary : 50;
      const avg = Math.round((itemFluency + itemGrammar + itemVocab) / 3);
      setItemScores((prev) => [...prev, avg]);

      // CRITICAL: The AI Coach SPEAKS the critique and correction OUT LOUD to the user ONCE
      const scriptToSpeak =
        res.spoken_coach_speech ||
        (res.has_mistakes && res.corrected_sentence
          ? `Good try! You should say: ${res.corrected_sentence}.`
          : "Spot on! That was clear and natural.");

      updateCoachSpeaking(true);
      speakCoachText(
        scriptToSpeak,
        () => {
          updateCoachSpeaking(false);
          // STOP! Do NOT auto advance into an endless loop.
          // The user has full control to view feedback, repeat, or tap "Next Challenge" when ready.
        },
        COACH_DEFAULT_VOICE
      );
    } catch (err: any) {
      console.error("Evaluation error:", err);
      alert(err.message || "Failed to analyze speech.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Advance to next phrase / item or complete the activity cleanly without auto-playing loop
  const handleAdvanceNext = () => {
    stopRecording();
    stopCoachSpeaking();

    if (currentIndex < items.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSpokenText("");
      latestSpokenRef.current = "";
      setFeedback(null);
      hasEvaluatedRef.current = false;
      // Do NOT auto-play speech or microphone. Gives user a calm, premium experience!
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
      const fbFluency = typeof feedback.scores.fluency === "number" ? feedback.scores.fluency : 50;
      const fbGrammar = typeof feedback.scores.grammar === "number" ? feedback.scores.grammar : 50;
      const fbVocab = typeof feedback.scores.vocabulary === "number" ? feedback.scores.vocabulary : 50;
      finalScore = Math.round((fbFluency + fbGrammar + fbVocab) / 3);
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
      setCompleted(true);
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
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-indigo-50/80 to-purple-50/80 dark:from-indigo-950/40 dark:to-purple-950/40 border border-indigo-100 dark:border-indigo-900/50 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center flex-shrink-0 shadow-md shadow-indigo-600/20">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 block">
                AI Coach Studio Voice
              </span>
              <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                Listen to the coach pronounce it, or tap the microphone below to speak.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 self-start sm:self-center">
            {/* Speaking State Indicator & Replay Control */}
            {isCoachSpeaking ? (
              <div className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md animate-pulse">
                <Volume2 className="w-4 h-4 animate-bounce" />
                <span>Coach Speaking...</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={handlePlayCoachSpeech}
                title="Replay Spoken Instruction"
                className="px-3.5 py-2 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-white dark:bg-slate-800 hover:bg-slate-50 text-indigo-700 dark:text-indigo-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Replay Coach</span>
              </button>
            )}
          </div>
        </div>

        {/* 1. Repeat After Coach */}
        {activity.type === "repeat_after_coach" && (
          <div className="text-center py-6 mb-4 bg-slate-50/60 dark:bg-slate-800/40 rounded-3xl border border-slate-100 dark:border-slate-800 p-6">
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-2 block">
              Phrase to Repeat ({currentIndex + 1} of {items.length})
            </span>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white leading-relaxed mb-3">
              &ldquo;{currentItem.text}&rdquo;
            </div>
            {currentItem.phonetic_tip && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-xs text-indigo-700 dark:text-indigo-300 font-semibold border border-indigo-100 dark:border-indigo-900/60">
                <span>💡 {currentItem.phonetic_tip}</span>
              </div>
            )}
          </div>
        )}

        {/* 2. Vocabulary */}
        {activity.type === "vocabulary" && (
          <div className="p-6 rounded-3xl bg-indigo-50/40 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30 text-center mb-6">
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 block mb-1">
              Vocabulary Word ({currentIndex + 1} of {items.length})
            </span>
            <div className="text-3xl font-black text-slate-900 dark:text-white mb-1">
              {currentItem.word}
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 mb-4 font-medium">{currentItem.meaning}</p>
            <div className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800 p-3.5 rounded-2xl border border-indigo-100 dark:border-slate-700 max-w-md mx-auto mb-3 shadow-xs">
              <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">Example in a Sentence:</span>
              <strong className="text-indigo-700 dark:text-indigo-300">&ldquo;{currentItem.example}&rdquo;</strong>
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              👉 Pronounce the word <strong className="text-indigo-600 dark:text-indigo-400">&ldquo;{currentItem.word}&rdquo;</strong> or the full sentence aloud.
            </span>
          </div>
        )}

        {/* 3. Sentence Doctor */}
        {activity.type === "sentence_doctor" && (
          <div className="p-6 rounded-3xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 mb-6">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-800 dark:text-amber-300 mb-3">
              <AlertTriangle className="w-4 h-4" />
              <span>Common Speaking Trap ({currentIndex + 1} of {items.length})</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              <div className="p-3.5 rounded-2xl bg-rose-50/70 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900">
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 block mb-1">
                  ❌ Flawed Sentence:
                </span>
                <div className="text-sm font-bold text-rose-900 dark:text-rose-200">
                  &ldquo;{currentItem.flawed}&rdquo;
                </div>
              </div>
              {feedback ? (
                <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 animate-fade-in">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block mb-1">
                    ✅ Correct Spoken Form:
                  </span>
                  <div className="text-sm font-bold text-emerald-900 dark:text-emerald-200">
                    &ldquo;{currentItem.corrected}&rdquo;
                  </div>
                </div>
              ) : (
                <div className="p-3.5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900 flex flex-col justify-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 block mb-1">
                    🩺 Doctor Challenge:
                  </span>
                  <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Spot the mistake and speak the corrected sentence aloud.
                  </div>
                </div>
              )}
            </div>
            {feedback && currentItem.reason ? (
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-700 animate-fade-in">
                💡 <strong className="text-slate-800 dark:text-slate-200">Rule:</strong> {currentItem.reason}
              </p>
            ) : (
              <p className="text-xs text-slate-500 dark:text-slate-400 italic bg-white/60 dark:bg-slate-800/60 p-2.5 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 text-center">
                🎙️ Speak your corrected sentence into the microphone to diagnose and get instant feedback.
              </p>
            )}
          </div>
        )}

        {/* 4. Sentence Builder */}
        {activity.type === "sentence_builder" && (
          <div className="p-6 rounded-3xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 mb-6 text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 block mb-2">
              Unscramble Words & Speak Aloud ({currentIndex + 1} of {items.length})
            </span>
            <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
              {(currentItem.jumbled || []).map((word: string, i: number) => (
                <span
                  key={i}
                  className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-purple-200 dark:border-slate-700 font-bold text-xs shadow-sm"
                >
                  {word}
                </span>
              ))}
            </div>
            {feedback ? (
              <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-purple-200 dark:border-slate-700 inline-block text-xs text-slate-600 dark:text-slate-400 animate-fade-in">
                ✅ Target sentence: <strong className="text-purple-700 dark:text-purple-300">&ldquo;{currentItem.target}&rdquo;</strong>
              </div>
            ) : (
              <div className="p-3 bg-white/70 dark:bg-slate-800/70 rounded-xl border border-purple-100 dark:border-slate-700 inline-block text-xs text-slate-600 dark:text-slate-400">
                🗣️ <strong className="text-purple-700 dark:text-purple-300">Your Turn:</strong> Arrange the words above into a proper sentence and speak it aloud.
              </div>
            )}
          </div>
        )}

        {/* 5. Mini Lesson */}
        {activity.type === "mini_lesson" && (
          <div className="p-6 rounded-3xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800 mb-6 text-left">
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 block mb-2">
              Grammar Practice ({currentIndex + 1} of {items.length})
            </span>
            {activity.data?.rule && (
              <p className="text-xs text-slate-700 dark:text-slate-300 font-medium mb-4 bg-white dark:bg-slate-800 p-3 rounded-xl border border-indigo-100 dark:border-indigo-900/50">
                💡 <strong className="text-slate-800 dark:text-slate-200">Concept:</strong> {activity.data.rule}
              </p>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              <div className="p-3.5 rounded-2xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900">
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 block mb-1">
                  ❌ Incorrect Form
                </span>
                <div className="text-xs sm:text-sm font-semibold text-rose-900 dark:text-rose-200 line-through">
                  &ldquo;{currentItem.incorrect}&rdquo;
                </div>
              </div>
              {feedback ? (
                <div className="p-3.5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 animate-fade-in">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block mb-1">
                    ✅ Correct Spoken Form
                  </span>
                  <div className="text-xs sm:text-sm font-bold text-emerald-900 dark:text-emerald-200">
                    &ldquo;{currentItem.correct}&rdquo;
                  </div>
                </div>
              ) : (
                <div className="p-3.5 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900 flex flex-col justify-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 block mb-1">
                    ❓ Your Challenge
                  </span>
                  <div className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 italic">
                    Find the grammar mistake and speak the correct form aloud.
                  </div>
                </div>
              )}
            </div>
            {feedback && currentItem.explanation ? (
              <p className="text-xs text-slate-600 dark:text-slate-400 italic bg-white dark:bg-slate-800 p-2.5 rounded-xl border border-slate-100 dark:border-slate-700 animate-fade-in">
                Why: {currentItem.explanation}
              </p>
            ) : (
              <p className="text-xs text-slate-500 dark:text-slate-400 italic text-center">
                🎙️ Speak your corrected sentence into the mic to test your grammar skills.
              </p>
            )}
          </div>
        )}

        {/* 6. Fill In The Blanks */}
        {activity.type === "fill_in_blanks" && (
          <div className="p-6 rounded-3xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800 mb-6 text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 block mb-2">
              Fill the Blank & Speak Aloud ({currentIndex + 1} of {items.length})
            </span>
            <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-relaxed mb-4">
              &ldquo;{currentItem.sentence}&rdquo;
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
              {(currentItem.options || []).map((opt: string, i: number) => {
                const isCorrect = opt === currentItem.correct;
                const showSuccess = feedback && isCorrect;
                return (
                  <span
                    key={i}
                    className={`px-4 py-2 rounded-xl font-bold text-xs shadow-sm border transition-all ${
                      showSuccess
                        ? "bg-emerald-600 text-white border-emerald-600 ring-2 ring-emerald-400/40"
                        : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                    }`}
                  >
                    {opt}
                  </span>
                );
              })}
            </div>
            {feedback ? (
              <p className="text-xs text-slate-600 dark:text-slate-400 animate-fade-in">
                Completed sentence: <strong className="text-emerald-600 dark:text-emerald-400">&ldquo;{(currentItem.sentence || "").replace("_______", currentItem.correct || "")}&rdquo;</strong>
              </p>
            ) : (
              <p className="text-xs text-slate-600 dark:text-slate-400">
                👉 Choose the correct word from the options above and speak the full sentence aloud.
              </p>
            )}
          </div>
        )}

        {/* 7. Daily Expressions */}
        {activity.type === "daily_expressions" && (
          <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-50/70 to-purple-50/70 dark:from-indigo-950/30 dark:to-purple-950/30 border border-indigo-200 dark:border-indigo-800 mb-6">
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 block mb-2">
              Everyday Social Dialogue ({currentIndex + 1} of {items.length})
            </span>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 mb-4 text-left">
              <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">When someone asks:</span>
              <div className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                &ldquo;{currentItem.trigger}&rdquo;
              </div>
            </div>
            <div className="text-left space-y-2">
              <span className="text-[10px] font-bold uppercase text-indigo-600 dark:text-indigo-400 block">
                Natural Spoken Replies (Speak either one aloud):
              </span>
              {(currentItem.replies || []).map((rep: string, idx: number) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-white dark:bg-slate-800/80 border border-indigo-100 dark:border-indigo-900/50 text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2"
                >
                  <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 font-bold text-[10px] flex items-center justify-center flex-shrink-0">
                    {idx + 1}
                  </span>
                  <span>&ldquo;{rep}&rdquo;</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 8. Spoken Prompt */}
        {activity.type === "spoken_prompt" && (
          <div className="p-6 rounded-3xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 mb-6 text-left">
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 block mb-1">
              Spoken Response Challenge
            </span>
            <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mb-4">
              {currentItem.question || activity.instructions}
            </h3>
            {Array.isArray(currentItem.hints) && currentItem.hints.length > 0 && (
              <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5">
                <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Speaking Hints:</span>
                {currentItem.hints.map((h: string, i: number) => (
                  <div key={i} className="text-xs text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <span className="text-indigo-600">•</span>
                    <span>{h}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 9. Speaking Challenge */}
        {activity.type === "speaking_challenge" && (
          <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-indigo-500/10 border border-amber-300 dark:border-amber-800 mb-6 text-center">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 text-[10px] font-extrabold uppercase tracking-wider mb-3">
              <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              <span>{currentItem.target_seconds || 30}-Second Speaking Sprint</span>
            </div>
            <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mb-2 max-w-lg mx-auto leading-snug">
              {currentItem.prompt || activity.instructions}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Tap the microphone below and speak smoothly without stopping!
            </p>
          </div>
        )}

        {/* 10. Level Capstone Test */}
        {activity.type === "level_capstone_test" && (
          <div className="p-6 rounded-3xl bg-gradient-to-br from-purple-50 via-indigo-50 to-pink-50 dark:from-purple-950/30 dark:via-indigo-950/30 dark:to-pink-950/30 border border-purple-200 dark:border-purple-800 mb-6 text-left">
            <div className="flex items-center justify-between mb-3">
              <span className="px-3 py-1 rounded-full bg-purple-600 text-white text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                <Award className="w-3 h-3" />
                <span>Capstone Graduation Exam</span>
              </span>
              <span className="text-xs font-bold text-purple-700 dark:text-purple-300">
                Question {currentIndex + 1} of {items.length}
              </span>
            </div>
            <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-purple-100 dark:border-purple-900 shadow-sm mb-3">
              <div className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-relaxed">
                &ldquo;{currentItem.prompt}&rdquo;
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-purple-800 dark:text-purple-300 font-semibold">
              <Clock className="w-4 h-4" />
              <span>Target speaking time: {currentItem.min_seconds || 20} seconds</span>
            </div>
          </div>
        )}

        {/* 11. Roleplay (Level 2+) */}
        {activity.type === "roleplay" && (
          <div className="p-6 rounded-3xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 mb-6 text-left">
            <div className="flex items-center gap-2 mb-2 text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
              <span>Roleplay Scenario</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mb-4 font-medium">
              {currentItem.scenario || activity.instructions}
            </p>
            {currentItem.starter && (
              <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-emerald-200 dark:border-emerald-700/80 mb-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Coach / Partner Speaks:
                </span>
                <div className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                  &ldquo;{currentItem.starter}&rdquo;
                </div>
              </div>
            )}
            {Array.isArray(currentItem.suggested_phrases) && currentItem.suggested_phrases.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 block">
                  Suggested Responses (Speak one aloud):
                </span>
                {currentItem.suggested_phrases.map((phrase: string, idx: number) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-emerald-100 dark:border-emerald-900/60 text-xs font-semibold text-slate-700 dark:text-slate-300"
                  >
                    &ldquo;{phrase}&rdquo;
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 12. Spontaneous Speaking (Level 3) */}
        {activity.type === "spontaneous_speaking" && (
          <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-50/70 via-purple-50/70 to-pink-50/70 dark:from-indigo-950/30 dark:via-purple-950/30 dark:to-pink-950/30 border border-indigo-200 dark:border-indigo-800 mb-6 text-center">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 text-[10px] font-extrabold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              <span>60-Second Spontaneous Topic ({currentIndex + 1} of {items.length})</span>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Your Speaking Topic:
            </span>
            <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-relaxed mb-4 max-w-xl mx-auto">
              &ldquo;{currentItem.topic || currentItem.prompt || activity.instructions}&rdquo;
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-3 bg-white/80 dark:bg-slate-800/80 rounded-2xl border border-purple-100 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 text-left">
              <div>🎯 <strong>1. Opinion:</strong> State your core thought.</div>
              <div>📖 <strong>2. Example:</strong> Share a personal reason.</div>
              <div>💡 <strong>3. Conclusion:</strong> Wrap up with a takeaway.</div>
            </div>
          </div>
        )}

        {/* 13. Thought Connectors (Level 3) */}
        {activity.type === "connectors" && (
          <div className="p-6 rounded-3xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 mb-6 text-left">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                Thought Connector Drill ({currentIndex + 1} of {items.length})
              </span>
              {currentItem.connector && (
                <span className="px-3 py-1 rounded-xl bg-purple-600 text-white font-extrabold text-xs shadow-xs">
                  Use: {currentItem.connector}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-4 font-semibold">
              {currentItem.prompt || "Connect the two contrasting or related ideas below into one fluent sentence aloud."}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-purple-100 dark:border-slate-700">
                <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Thought A:</span>
                <div className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  &ldquo;{currentItem.idea_a || currentItem.prompt}&rdquo;
                </div>
              </div>
              <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-purple-100 dark:border-slate-700">
                <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Thought B:</span>
                <div className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  &ldquo;{currentItem.idea_b || "Complementary idea"}&rdquo;
                </div>
              </div>
            </div>
            {feedback ? (
              <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 animate-fade-in text-xs text-emerald-900 dark:text-emerald-200">
                <span className="font-bold block mb-0.5">✅ Native Model Sentence:</span>
                &ldquo;{currentItem.model}&rdquo;
              </div>
            ) : (
              <p className="text-xs text-slate-500 dark:text-slate-400 italic text-center">
                🎙️ Speak your connected sentence aloud using <strong className="text-purple-600 dark:text-purple-400">{currentItem.connector || "a connector"}</strong>.
              </p>
            )}
          </div>
        )}

        {/* 14. Sentence Expansion (Level 3) */}
        {activity.type === "sentence_expansion" && (
          <div className="p-6 rounded-3xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800 mb-6 text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 block mb-2">
              Sentence Expansion Lab ({currentIndex + 1} of {items.length})
            </span>
            <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
              Short Base Sentence (Expand this aloud):
            </span>
            <div className="text-2xl font-black text-slate-900 dark:text-white leading-relaxed mb-3">
              &ldquo;{currentItem.base || "Short sentence"}&rdquo;
            </div>
            {currentItem.hint && (
              <div className="p-3 bg-white dark:bg-slate-800 rounded-2xl border border-indigo-100 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 max-w-lg mx-auto mb-3 text-left">
                💡 <strong className="text-indigo-600 dark:text-indigo-400">Expansion Hint:</strong> {currentItem.hint}
              </div>
            )}
            {feedback ? (
              <div className="p-3.5 bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 rounded-2xl text-xs text-emerald-900 dark:text-emerald-200 text-left animate-fade-in">
                <span className="font-bold block mb-0.5">✅ Native Expanded Example:</span>
                &ldquo;{currentItem.expanded}&rdquo;
              </div>
            ) : (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                🎙️ Add who, why, how, or when to turn this 4-word sentence into a rich 12–16 word statement!
              </p>
            )}
          </div>
        )}

        {/* 15. Storytelling (Level 3) */}
        {activity.type === "storytelling" && (
          <div className="p-6 rounded-3xl bg-gradient-to-br from-amber-50/60 via-indigo-50/60 to-purple-50/60 dark:from-amber-950/20 dark:via-indigo-950/20 dark:to-purple-950/20 border border-amber-200 dark:border-amber-800 mb-6 text-left">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 block mb-2">
              Narrative Arc Storytelling Challenge
            </span>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-amber-200 dark:border-slate-700 mb-4">
              <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Story Opener:</span>
              <div className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-relaxed">
                &ldquo;{currentItem.starter}&rdquo;
              </div>
            </div>
            {Array.isArray(currentItem.guidelines) && (
              <div className="space-y-1.5 bg-white/70 dark:bg-slate-800/70 p-3 rounded-2xl border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Story Arc Checklist:</span>
                {currentItem.guidelines.map((g: string, i: number) => (
                  <div key={i} className="text-xs text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    <span>{g}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 16. Interview Simulation (Level 4) */}
        {activity.type === "interview_simulation" && (
          <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 to-indigo-950 text-white shadow-xl mb-6 text-left">
            <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-white/10">
              <span className="px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-[10px] font-extrabold uppercase tracking-wider">
                💼 Executive Interview Round
              </span>
              {currentItem.role && (
                <span className="text-xs text-indigo-200 font-semibold">
                  Role: {currentItem.role}
                </span>
              )}
            </div>
            <div className="mb-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300 block mb-1">
                Interviewer Question:
              </span>
              <div className="text-lg sm:text-xl font-black text-white leading-relaxed">
                &ldquo;{currentItem.coach_prompt || currentItem.prompt}&rdquo;
              </div>
            </div>
            {Array.isArray(currentItem.tips) && currentItem.tips.length > 0 && (
              <div className="bg-white/10 rounded-2xl p-3.5 backdrop-blur-xs space-y-1">
                <span className="text-[10px] font-bold uppercase text-indigo-200 block mb-1">Response Strategy Tips:</span>
                {currentItem.tips.map((tip: string, i: number) => (
                  <div key={i} className="text-xs text-indigo-100 flex items-center gap-2">
                    <span className="text-indigo-400 font-bold">•</span>
                    <span>{tip}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 17. Presentation Pitch (Level 4) */}
        {activity.type === "presentation_pitch" && (
          <div className="p-6 rounded-3xl bg-gradient-to-br from-amber-500/10 via-orange-500/10 to-indigo-500/10 border border-amber-300 dark:border-amber-800 mb-6 text-left">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-800 dark:text-amber-300 mb-3">
              <Award className="w-4 h-4" />
              <span>Executive Project Pitch Challenge</span>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-amber-200 dark:border-slate-700 mb-4">
              <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Your Pitch Challenge:</span>
              <div className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-relaxed">
                &ldquo;{currentItem.prompt}&rdquo;
              </div>
            </div>
            {Array.isArray(currentItem.guidelines) && (
              <div className="bg-white/70 dark:bg-slate-800/70 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Delivery Guidelines:</span>
                {currentItem.guidelines.map((g: string, i: number) => (
                  <div key={i} className="text-xs text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <span className="text-amber-600 font-bold">✓</span>
                    <span>{g}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 18. Debate Sparring (Level 4) */}
        {activity.type === "debate_sparring" && (
          <div className="p-6 rounded-3xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900 mb-6 text-left">
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 block mb-2">
              Debate Sparring Arena
            </span>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-rose-200 dark:border-rose-800 mb-4">
              <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                Opponent / Counter-Argument:
              </span>
              <div className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-relaxed">
                &ldquo;{currentItem.coach_starter || currentItem.prompt}&rdquo;
              </div>
            </div>
            {Array.isArray(currentItem.guidelines) && (
              <div className="bg-white/70 dark:bg-slate-800/70 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Debate Strategy:</span>
                {currentItem.guidelines.map((g: string, i: number) => (
                  <div key={i} className="text-xs text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <span className="text-rose-500 font-bold">•</span>
                    <span>{g}</span>
                  </div>
                ))}
              </div>
            )}
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
              disabled={isAnalyzing}
              title={isCoachSpeaking ? "Tap to interrupt and speak" : isRecording ? "Listening to you" : "Tap to speak"}
              className={`relative z-10 w-20 h-20 rounded-full flex flex-col items-center justify-center transition-all duration-300 shadow-xl disabled:opacity-40 cursor-pointer ${
                isRecording
                  ? "bg-rose-600 text-white shadow-rose-500/40 scale-105"
                  : isCoachSpeaking
                  ? "bg-gradient-to-tr from-purple-600 to-indigo-600 text-white hover:scale-105 shadow-indigo-500/30"
                  : "bg-gradient-to-tr from-indigo-600 to-purple-600 text-white hover:scale-105 shadow-indigo-500/30"
              }`}
            >
              {isRecording ? <MicOff className="w-7 h-7" /> : <Mic className="w-7 h-7" />}
              <span className="text-[9px] font-bold mt-1 uppercase tracking-wider text-center px-1">
                {isRecording ? "Listening" : isCoachSpeaking ? "Tap to Talk" : "Speak"}
              </span>
            </button>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
            {isRecording ? (
              <span className="text-rose-600 dark:text-rose-400 font-semibold animate-pulse">
                🎙️ Listening to you... (Stops automatically when you finish speaking)
              </span>
            ) : isAnalyzing ? (
              <span className="text-indigo-600 dark:text-indigo-400 font-semibold animate-pulse">
                AI Coach is evaluating your pronunciation...
              </span>
            ) : isCoachSpeaking ? (
              <span className="text-indigo-600 dark:text-indigo-400 font-medium animate-pulse">
                Coach speaking... mic will start automatically!
              </span>
            ) : (
              <span>Hands-free active. Tap mic anytime to pause or speak again.</span>
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

            {/* Relevance or Incomplete Warning (Only if truly failed with low score) */}
            {(() => {
              const currentAvg = Math.round(
                ((feedback.scores?.fluency ?? 0) + (feedback.scores?.grammar ?? 0) + (feedback.scores?.vocabulary ?? 0)) / 3
              );
              const isTrulyPassed = (feedback.passed !== false || currentAvg >= 70) && currentAvg >= 50;

              return (
                <>
                  {!isTrulyPassed && (
                    <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-200 text-xs">
                      <AlertTriangle className="w-4 h-4 flex-shrink-0 text-amber-600 dark:text-amber-400" />
                      <div>
                        <span className="font-bold">Coach Status: </span>
                        <span>{feedback.relevance_verdict || "This answer needs more practice. Please listen to the coach and try again to pass!"}</span>
                      </div>
                    </div>
                  )}

                  {/* Praise or Mistake Correction */}
                  {isTrulyPassed && !feedback.has_mistakes ? (
                    <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-left flex items-start gap-2.5">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-emerald-800 dark:text-emerald-200 text-xs block mb-0.5">
                          Clear & Accurate Delivery ✅
                        </span>
                        <p className="text-xs text-emerald-900 dark:text-emerald-300">
                          {feedback.affirmation || "Spot on! Your response was clear, natural, and directly answered the prompt."}
                        </p>
                      </div>
                    </div>
                  ) : isTrulyPassed ? (
                    <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-left flex items-start gap-2.5">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-emerald-800 dark:text-emerald-200 text-xs block mb-0.5">
                          Passing Performance ({currentAvg}%) ✅
                        </span>
                        <p className="text-xs text-emerald-900 dark:text-emerald-300">
                          {feedback.affirmation || "Good work! You spoke the core sentence accurately."}
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
                        <span className="font-bold flex-shrink-0">✅ Target Form:</span>
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
                          {feedback.scores.fluency ?? 0}%
                        </div>
                        <div className="text-[10px] font-bold uppercase text-slate-400">Fluency</div>
                      </div>
                      <div>
                        <div className="text-lg font-black text-purple-600 dark:text-purple-400">
                          {feedback.scores.grammar ?? 0}%
                        </div>
                        <div className="text-[10px] font-bold uppercase text-slate-400">Grammar</div>
                      </div>
                      <div>
                        <div className="text-lg font-black text-pink-600 dark:text-pink-400">
                          {feedback.scores.vocabulary ?? 0}%
                        </div>
                        <div className="text-[10px] font-bold uppercase text-slate-400">Vocabulary</div>
                      </div>
                    </div>
                  )}

                  {/* Bottom Actions: Prioritize repeating only if not passed */}
                  {!isTrulyPassed ? (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                      <button
                        onClick={() => {
                          setFeedback(null);
                          setSpokenText("");
                          startRecording();
                        }}
                        className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2"
                      >
                        <Mic className="w-4 h-4" />
                        <span>Practice & Try Again to Pass</span>
                      </button>

                      <button
                        onClick={handleAdvanceNext}
                        className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 font-medium underline flex items-center gap-1"
                      >
                        <span>Skip challenge for now</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
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
                        <span>Repeat & Polish</span>
                      </button>

                      <button
                        onClick={handleAdvanceNext}
                        className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-1.5"
                      >
                        <span>
                          {isMultiItem && currentIndex < items.length - 1
                            ? `Next (${currentIndex + 2} of ${items.length})`
                            : "Finish Activity & Save Progress"}
                        </span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
}
