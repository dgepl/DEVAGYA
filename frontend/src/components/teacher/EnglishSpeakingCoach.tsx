"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { 
  Sparkles, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Play, 
  Pause, 
  CheckCircle2, 
  AlertCircle, 
  Lock, 
  Unlock, 
  Clock, 
  Award, 
  Trophy, 
  BookOpen, 
  MessageSquare, 
  ArrowRight, 
  RefreshCw, 
  Zap, 
  Flame, 
  Target, 
  HelpCircle, 
  Smile, 
  ChevronRight, 
  ShieldCheck, 
  Layers, 
  Headphones,
  FileText,
  RotateCcw,
  HeartHandshake,
  GraduationCap
} from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { getApiBase } from "@/lib/api";

interface QuestionItem {
  id: number;
  category: string;
  question: string;
  options: string[];
  weakness_tag: string;
}

interface StepItem {
  step_id: string;
  type: "listen" | "repeat" | "speak" | "interact" | "present" | "capstone";
  title: string;
  prompt: string;
  model_audio_text?: string;
  target_phrase?: string;
  sample_answer?: string;
  coach_starter?: string;
  topic?: string;
}

interface GameItem {
  id: string;
  title: string;
  instructions?: string;
  flawed_sentence?: string;
  corrected_sentence?: string;
  target_keywords?: string[];
}

interface ModuleItem {
  id: string;
  title: string;
  methodology: string;
  description: string;
  focus_areas: string[];
  steps: StepItem[];
  game?: GameItem;
}

interface UserTrack {
  user_id: string;
  user_role: string;
  diagnostic_completed: boolean;
  diagnostic_score: number;
  diagnostic_total: number;
  weak_points: string[];
  fluency_level: string;
  current_module_index: number;
  unlocked_module_index: number;
  completed_steps: string[];
  public_speaking_feedback?: any;
  mastery_report?: any;
  expires_at?: string;
  is_expired?: boolean;
}

export function EnglishSpeakingCoach() {
  const { user } = useAppStore();

  // Primary State
  const [loading, setLoading] = useState<boolean>(true);
  const [track, setTrack] = useState<UserTrack | null>(null);
  const [modules, setModules] = useState<ModuleItem[]>([]);
  const [activeTab, setActiveTab] = useState<"diagnostic" | "roadmap" | "player" | "report">("roadmap");

  // Diagnostic Test State
  const [diagnosticQuestions, setDiagnosticQuestions] = useState<QuestionItem[]>([]);
  const [currentQIndex, setCurrentQIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [submittingTest, setSubmittingTest] = useState<boolean>(false);
  const [diagnosticResult, setDiagnosticResult] = useState<any>(null);

  // Module Player State
  const [activeModuleIdx, setActiveModuleIdx] = useState<number>(0);
  const [activeStepIdx, setActiveStepIdx] = useState<number>(0);
  const [isAiSpeaking, setIsAiSpeaking] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [userSpokenText, setUserSpokenText] = useState<string>("");
  const [stepCompleteNotice, setStepCompleteNotice] = useState<string | null>(null);

  // Public Speaking Stage (LRSP)
  const [speakingTimer, setSpeakingTimer] = useState<number>(60);
  const [isTimerActive, setIsTimerActive] = useState<boolean>(false);
  const [critiqueLoading, setCritiqueLoading] = useState<boolean>(false);
  const [speakingCritique, setSpeakingCritique] = useState<any>(null);

  // Interactive Live Chat (LRSI)
  const [dialogueMessages, setDialogueMessages] = useState<Array<{ sender: "coach" | "user"; text: string }>>([]);
  const [isCoachThinking, setIsCoachThinking] = useState<boolean>(false);

  // Audio / Speech Recognition Refs
  const recognitionRef = useRef<any>(null);
  const timerIntervalRef = useRef<any>(null);

  // Clean transcript utility
  const cleanTranscript = (t: string) => {
    return t.replace(/\s+/g, " ").trim();
  };

  // Speak aloud using browser Web Speech API
  const speakText = (text: string, onDone?: () => void) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utt = new SpeechSynthesisUtterance(text);
      utt.rate = 0.95;
      utt.pitch = 1.0;
      utt.lang = "en-IN";
      const voices = window.speechSynthesis.getVoices();
      const femaleVoice = voices.find(v => 
        (v.lang.includes("en-IN") || v.lang.includes("en-GB") || v.lang.includes("en-US")) && 
        (v.name.includes("Neerja") || v.name.includes("Natural") || v.name.includes("Google") || v.name.includes("Female"))
      ) || voices.find(v => v.lang.startsWith("en"));
      if (femaleVoice) utt.voice = femaleVoice;

      utt.onstart = () => setIsAiSpeaking(true);
      utt.onend = () => {
        setIsAiSpeaking(false);
        onDone?.();
      };
      utt.onerror = () => {
        setIsAiSpeaking(false);
        onDone?.();
      };
      window.speechSynthesis.speak(utt);
    } catch {
      setIsAiSpeaking(false);
      onDone?.();
    }
  };

  const stopSpeaking = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsAiSpeaking(false);
  };

  // 1. Initial State Fetch from Supabase
  const loadState = useCallback(async () => {
    setLoading(true);
    try {
      const uId = user?.id || user?.email || "guest_user";
      const uRole = user?.role || "student";
      const res = await fetch(`${getApiBase()}/english-coach/state?user_id=${encodeURIComponent(uId)}&user_role=${encodeURIComponent(uRole)}`);
      if (res.ok) {
        const data = await res.json();
        setTrack(data.track);
        setModules(data.modules || []);

        if (!data.track.diagnostic_completed || data.track.is_expired) {
          // User must take the diagnostic test first
          setActiveTab("diagnostic");
          fetchDiagnosticQuestions();
        } else if (data.track.mastery_report) {
          setActiveTab("report");
        } else {
          setActiveTab("roadmap");
          setActiveModuleIdx(data.track.unlocked_module_index || 0);
        }
      }
    } catch (err) {
      console.warn("Could not load coach state:", err);
    } finally {
      setLoading(false);
    }
  }, [user?.id, user?.email, user?.role]);

  const fetchDiagnosticQuestions = async () => {
    try {
      const res = await fetch(`${getApiBase()}/english-coach/diagnostic-questions`);
      if (res.ok) {
        const data = await res.json();
        setDiagnosticQuestions(data.questions || []);
      }
    } catch (err) {
      console.warn("Error fetching diagnostic questions:", err);
    }
  };

  useEffect(() => {
    loadState();
    return () => {
      stopSpeaking();
      clearInterval(timerIntervalRef.current);
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch {}
      }
    };
  }, [loadState]);

  // 2. Submit Diagnostic Test
  const handleSelectOption = (qId: number, optIdx: number) => {
    setSelectedAnswers(prev => ({ ...prev, [String(qId)]: optIdx }));
  };

  const handleSubmitDiagnostic = async () => {
    if (Object.keys(selectedAnswers).length < diagnosticQuestions.length) {
      alert("Please answer all 10 diagnostic questions to generate your personalized speaking path.");
      return;
    }

    setSubmittingTest(true);
    try {
      const uId = user?.id || user?.email || "guest_user";
      const uRole = user?.role || "student";
      const res = await fetch(`${getApiBase()}/english-coach/diagnostic-submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: uId,
          user_role: uRole,
          answers: selectedAnswers
        })
      });

      if (res.ok) {
        const result = await res.json();
        setDiagnosticResult(result);
        setTrack(result.track);
        setModules(result.modules);
      } else {
        alert("Failed to submit test. Please check connection.");
      }
    } catch (err) {
      console.error("Test submission error:", err);
    } finally {
      setSubmittingTest(false);
    }
  };

  // 3. Complete Step & Strict Progression (No Skipping)
  const handleCompleteStep = async (stepId: string) => {
    const uId = user?.id || user?.email || "guest_user";
    const uRole = user?.role || "student";
    try {
      const res = await fetch(`${getApiBase()}/english-coach/lecture-complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: uId,
          user_role: uRole,
          module_index: activeModuleIdx,
          step_id: stepId
        })
      });

      if (res.ok) {
        const data = await res.json();
        setTrack(data.track);
        setStepCompleteNotice("Step Completed! Unlocked next step.");
        setTimeout(() => setStepCompleteNotice(null), 3000);

        // Advance to next step or next module
        const currentMod = modules[activeModuleIdx];
        if (currentMod && activeStepIdx < currentMod.steps.length - 1) {
          setActiveStepIdx(prev => prev + 1);
        } else if (activeModuleIdx < modules.length - 1) {
          setActiveModuleIdx(prev => prev + 1);
          setActiveStepIdx(0);
        }
      } else {
        const err = await res.json();
        alert(err.detail || "Cannot skip steps!");
      }
    } catch (err) {
      console.warn("Step progression error:", err);
    }
  };

  // 4. Speech Recognition Engine for Repeating & Speaking
  const startRecordingSpeech = (onResultCallback?: (text: string) => void) => {
    if (typeof window === "undefined") return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is supported in Chrome, Edge, or Safari.");
      return;
    }

    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch {}
    }

    try {
      const rec = new SpeechRecognition();
      rec.lang = "en-IN";
      rec.continuous = false;
      rec.interimResults = true;

      rec.onstart = () => {
        setIsListening(true);
        setUserSpokenText("");
      };

      rec.onresult = (event: any) => {
        let transcript = "";
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript + " ";
        }
        const cleaned = cleanTranscript(transcript);
        setUserSpokenText(cleaned);
        onResultCallback?.(cleaned);
      };

      rec.onerror = (e: any) => {
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
      rec.start();
    } catch (err) {
      console.warn("Speech start error:", err);
      setIsListening(false);
    }
  };

  const stopRecordingSpeech = () => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch {}
    }
    setIsListening(false);
  };

  // 5. Public Speaking Timer & Critique
  const handleStartPublicSpeaking = () => {
    setSpeakingTimer(60);
    setIsTimerActive(true);
    setUserSpokenText("");
    setSpeakingCritique(null);

    startRecordingSpeech();

    clearInterval(timerIntervalRef.current);
    timerIntervalRef.current = setInterval(() => {
      setSpeakingTimer(prev => {
        if (prev <= 1) {
          clearInterval(timerIntervalRef.current);
          setIsTimerActive(false);
          stopRecordingSpeech();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleFinishPublicSpeaking = async () => {
    clearInterval(timerIntervalRef.current);
    setIsTimerActive(false);
    stopRecordingSpeech();

    if (!userSpokenText.trim()) {
      alert("No speech was captured. Please speak into your microphone and try again.");
      return;
    }

    setCritiqueLoading(true);
    try {
      const uId = user?.id || user?.email || "guest_user";
      const currentMod = modules[activeModuleIdx];
      const step = currentMod?.steps[activeStepIdx];
      const topic = step?.topic || "Public Speaking Stage";

      const res = await fetch(`${getApiBase()}/english-coach/public-speaking-critique`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: uId,
          speech_text: userSpokenText,
          topic: topic,
          user_level: track?.fluency_level || "Intermediate"
        })
      });

      if (res.ok) {
        const critique = await res.json();
        setSpeakingCritique(critique);
        // Play AI live spoken correction
        if (critique.live_correction) {
          speakText(`Here is your polished delivery: ${critique.live_correction}`);
        }
      }
    } catch (err) {
      console.warn("Error getting critique:", err);
    } finally {
      setCritiqueLoading(false);
    }
  };

  // 6. Interactive Spoken Dialogue (LRSI)
  const handleSendDialogueTurn = async () => {
    if (!userSpokenText.trim() || isCoachThinking) return;

    const userText = userSpokenText.trim();
    setUserSpokenText("");
    setDialogueMessages(prev => [...prev, { sender: "user", text: userText }]);
    setIsCoachThinking(true);

    try {
      const fd = new FormData();
      fd.append("message", `Spoken English practice dialogue turn. User said: "${userText}". Reply warmly in 1 short spoken sentence (max 15 words) starting with 1 energetic feedback word.`);
      fd.append("agent_code", "english_coach");
      fd.append("user_id", user?.id || user?.email || "guest");
      fd.append("language", "english");

      const res = await fetch(`${getApiBase()}/agents/chat`, {
        method: "POST",
        body: fd
      });

      if (res.ok && res.body) {
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let coachReply = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          coachReply += decoder.decode(value, { stream: true });
        }
        const cleanReply = coachReply.replace(/<think>[\s\S]*?<\/think>/g, "").trim();
        setDialogueMessages(prev => [...prev, { sender: "coach", text: cleanReply }]);
        speakText(cleanReply);
      }
    } catch (err) {
      console.warn("Dialogue turn error:", err);
    } finally {
      setIsCoachThinking(false);
    }
  };

  // 7. Final Capstone & Report Generation
  const handleFinalizeCapstone = async () => {
    if (!userSpokenText.trim()) {
      alert("Please deliver your capstone presentation before generating the final report.");
      return;
    }

    setLoading(true);
    try {
      const uId = user?.id || user?.email || "guest_user";
      const uRole = user?.role || "student";
      const uName = user?.name || "Devgya Learner";

      const res = await fetch(`${getApiBase()}/english-coach/finalize-report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: uId,
          user_role: uRole,
          student_name: uName,
          capstone_transcript: userSpokenText
        })
      });

      if (res.ok) {
        const report = await res.json();
        setTrack(prev => prev ? { ...prev, mastery_report: report } : null);
        setActiveTab("report");
      }
    } catch (err) {
      console.error("Error finalizing report:", err);
    } finally {
      setLoading(false);
    }
  };

  // 8. Reset Cycle (Retake diagnostic & restart 30-day program)
  const handleResetCycle = async () => {
    if (!confirm("Are you sure you want to reset your English speaking track and retake the 10-mark diagnostic test?")) return;
    try {
      const uId = user?.id || user?.email || "guest_user";
      const uRole = user?.role || "student";
      const res = await fetch(`${getApiBase()}/english-coach/reset-cycle`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: uId, user_role: uRole })
      });
      if (res.ok) {
        setSelectedAnswers({});
        setDiagnosticResult(null);
        setActiveTab("diagnostic");
        fetchDiagnosticQuestions();
        loadState();
      }
    } catch (err) {
      console.warn("Reset error:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-bold text-slate-600">Connecting to Devgya Spoken English Mastery Engine...</p>
      </div>
    );
  }

  // ===================================================================
  // VIEW 1: 10-MARK DIAGNOSTIC ASSESSMENT
  // ===================================================================
  if (activeTab === "diagnostic") {
    const q = diagnosticQuestions[currentQIndex];
    const isAnswered = selectedAnswers[String(q?.id)] !== undefined;
    const progressPercent = diagnosticQuestions.length > 0 
      ? ((Object.keys(selectedAnswers).length) / diagnosticQuestions.length) * 100 
      : 0;

    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300 py-6 px-4">
        {/* HEADER */}
        <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-indigo-800/40 relative overflow-hidden">
          <div className="relative z-10 space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-500/30">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Diagnostic English Proficiency Benchmark</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              10-Mark Baseline Spoken English Assessment
            </h1>
            <p className="text-xs sm:text-sm text-indigo-200 max-w-2xl leading-relaxed">
              Complete these 10 curated questions. We pinpoint your specific weak points in grammar, tenses, prepositions, pronunciation awareness, and public speaking structure to build your step-by-step lecture roadmap.
            </p>
          </div>
        </div>

        {/* RESULT MODAL / SCREEN */}
        {diagnosticResult ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xl space-y-6 text-center animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
              <Award className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h2 className="text-2xl font-black text-slate-900">Assessment Completed!</h2>
              <p className="text-sm font-semibold text-slate-500">Your Baseline Proficiency Result</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-xl mx-auto text-left">
              <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100">
                <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Score</span>
                <p className="text-2xl font-black text-indigo-900 mt-1">{diagnosticResult.score} / 10</p>
              </div>
              <div className="p-4 rounded-2xl bg-purple-50 border border-purple-100 sm:col-span-2">
                <span className="text-xs font-bold text-purple-600 uppercase tracking-wider">Assigned Level</span>
                <p className="text-sm font-extrabold text-purple-900 mt-1">{diagnosticResult.fluency_level}</p>
              </div>
            </div>

            {diagnosticResult.weak_points && diagnosticResult.weak_points.length > 0 && (
              <div className="max-w-xl mx-auto text-left p-4 rounded-2xl bg-amber-50 border border-amber-200">
                <span className="text-xs font-extrabold text-amber-800 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  Identified Weak Points To Focus On:
                </span>
                <div className="flex flex-wrap gap-2">
                  {diagnosticResult.weak_points.map((w: string, i: number) => (
                    <span key={i} className="px-2.5 py-1 rounded-lg bg-white text-amber-900 text-xs font-bold border border-amber-200 shadow-sm">
                      {w}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={() => {
                setActiveTab("roadmap");
                setDiagnosticResult(null);
              }}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm shadow-lg hover:shadow-indigo-500/25 transition-all active:scale-95"
            >
              <span>Begin Your Sequential Lecture Roadmap</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : q ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
            {/* PROGRESS BAR */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-extrabold text-slate-500">
                <span>Question {currentQIndex + 1} of {diagnosticQuestions.length}</span>
                <span>{Object.keys(selectedAnswers).length} / {diagnosticQuestions.length} Answered</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* QUESTION CARD */}
            <div className="space-y-3 pt-2">
              <div className="inline-block px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-100">
                {q.category}
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
                {q.question}
              </h3>
            </div>

            {/* OPTIONS */}
            <div className="space-y-2.5">
              {q.options.map((opt, idx) => {
                const isSelected = selectedAnswers[String(q.id)] === idx;
                return (
                  <button
                    key={idx}
                    onClick={() => handleSelectOption(q.id, idx)}
                    className={`w-full text-left p-4 rounded-2xl border text-sm font-semibold transition-all flex items-center justify-between group ${
                      isSelected
                        ? "bg-indigo-50 border-indigo-600 text-indigo-900 shadow-sm ring-1 ring-indigo-600"
                        : "bg-white border-slate-200 text-slate-700 hover:border-indigo-300 hover:bg-slate-50/80"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-extrabold border transition-all ${
                        isSelected 
                          ? "bg-indigo-600 text-white border-indigo-600" 
                          : "bg-slate-100 text-slate-600 border-slate-200 group-hover:border-indigo-300"
                      }`}>
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span>{opt}</span>
                    </div>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-indigo-600" />}
                  </button>
                );
              })}
            </div>

            {/* NAVIGATION FOOTER */}
            <div className="pt-4 flex items-center justify-between border-t border-slate-100">
              <button
                disabled={currentQIndex === 0}
                onClick={() => setCurrentQIndex(prev => Math.max(0, prev - 1))}
                className="px-4 py-2 rounded-xl text-xs font-extrabold text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none transition-all"
              >
                Previous
              </button>

              {currentQIndex < diagnosticQuestions.length - 1 ? (
                <button
                  onClick={() => setCurrentQIndex(prev => prev + 1)}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold shadow-sm transition-all active:scale-95"
                >
                  Next Question
                </button>
              ) : (
                <button
                  disabled={submittingTest || Object.keys(selectedAnswers).length < diagnosticQuestions.length}
                  onClick={handleSubmitDiagnostic}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold shadow-md transition-all active:scale-95 disabled:opacity-40"
                >
                  {submittingTest ? "Evaluating Weak Points..." : "Submit Diagnostic Test"}
                </button>
              )}
            </div>
          </div>
        ) : null}
      </div>
    );
  }

  // ===================================================================
  // VIEW 2: SEQUENTIAL LECTURE ROADMAP (NO SKIPPING)
  // ===================================================================
  if (activeTab === "roadmap") {
    const unlockedIndex = track?.unlocked_module_index || 0;

    return (
      <div className="max-w-5xl mx-auto space-y-6 py-6 px-4 animate-in fade-in duration-300">
        {/* TOP STATUS BANNER */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-indigo-800/40 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Diagnostic Completed: {track?.diagnostic_score} / 10
              </span>
              <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-500/30">
                {track?.fluency_level}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Sequential Spoken Mastery Track
            </h1>
            <p className="text-xs sm:text-sm text-indigo-200 max-w-2xl leading-relaxed">
              Master English through the certified <strong>LRSI</strong> (Listen, Repeat, Speak, Interact) and <strong>LRSP</strong> (Listen, Repeat, Speak, Present) frameworks. Step skipping is disabled to ensure genuine spoken fluency.
            </p>
          </div>

          <div className="flex flex-col items-end gap-2 shrink-0">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-300 bg-amber-500/10 px-3 py-1.5 rounded-xl border border-amber-500/20">
              <Clock className="w-3.5 h-3.5" />
              <span>30-Day Cycle Active</span>
            </div>
            <button
              onClick={handleResetCycle}
              className="text-xs font-semibold text-slate-400 hover:text-rose-300 flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Restart Cycle & Retake Test</span>
            </button>
          </div>
        </div>

        {/* WEAK POINTS SUMMARY */}
        {track?.weak_points && track.weak_points.length > 0 && (
          <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
              <Target className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Your Diagnostic Focus Areas:</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {track.weak_points.map((w, idx) => (
                <span key={idx} className="px-2.5 py-0.5 rounded-md bg-white text-amber-800 text-xs font-bold border border-amber-200 shadow-xs">
                  {w}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* MODULE CARDS */}
        <div className="space-y-4">
          {modules.map((mod, mIdx) => {
            const isUnlocked = mIdx <= unlockedIndex;
            const isCompleted = mIdx < unlockedIndex;
            const isCurrent = mIdx === unlockedIndex;

            return (
              <div 
                key={mod.id}
                className={`p-6 rounded-3xl border transition-all ${
                  isCurrent
                    ? "bg-white border-indigo-400 shadow-md ring-1 ring-indigo-400"
                    : isCompleted
                    ? "bg-emerald-50/40 border-emerald-200"
                    : "bg-slate-50/60 border-slate-200 opacity-60 pointer-events-none"
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-lg text-xs font-extrabold uppercase tracking-wider ${
                        isCompleted
                          ? "bg-emerald-100 text-emerald-800"
                          : isCurrent
                          ? "bg-indigo-100 text-indigo-800"
                          : "bg-slate-200 text-slate-600"
                      }`}>
                        {mod.methodology}
                      </span>
                      {isCompleted && (
                        <span className="flex items-center gap-1 text-xs font-bold text-emerald-600">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Completed</span>
                        </span>
                      )}
                    </div>
                    <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
                      {mod.title}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed max-w-2xl font-medium">
                      {mod.description}
                    </p>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {mod.focus_areas.map((f, i) => (
                        <span key={i} className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                          • {f}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-3">
                    {isUnlocked ? (
                      <button
                        onClick={() => {
                          setActiveModuleIdx(mIdx);
                          setActiveStepIdx(0);
                          setActiveTab("player");
                        }}
                        className={`inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-extrabold text-xs transition-all active:scale-95 ${
                          isCurrent
                            ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md hover:shadow-indigo-500/20"
                            : "bg-white border border-slate-300 text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>{isCompleted ? "Practice Again" : "Launch Lecture"}</span>
                      </button>
                    ) : (
                      <div className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 text-slate-400 text-xs font-bold border border-slate-200">
                        <Lock className="w-3.5 h-3.5" />
                        <span>Locked</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ===================================================================
  // VIEW 3: LECTURE PLAYER (LRSI / LRSP STEPS & INTERACTIVE GAMES)
  // ===================================================================
  if (activeTab === "player") {
    const currentMod = modules[activeModuleIdx];
    const currentStep = currentMod?.steps[activeStepIdx];
    const isLastStep = currentMod && activeStepIdx === currentMod.steps.length - 1;

    return (
      <div className="max-w-4xl mx-auto space-y-6 py-6 px-4 animate-in fade-in duration-300">
        {/* NAVIGATION TOP BAR */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <button
            onClick={() => setActiveTab("roadmap")}
            className="text-xs font-extrabold text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5 transition-colors"
          >
            <ArrowRight className="w-4 h-4 rotate-180" />
            <span>Back to Module Roadmap</span>
          </button>

          <span className="text-xs font-bold text-slate-500">
            {currentMod?.title} • Step {activeStepIdx + 1} of {currentMod?.steps.length}
          </span>
        </div>

        {stepCompleteNotice && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{stepCompleteNotice}</span>
          </div>
        )}

        {/* STEP CARD */}
        {currentStep && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="space-y-1">
              <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-extrabold uppercase tracking-wider">
                {currentStep.type.toUpperCase()} STAGE
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-2">
                {currentStep.title}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                {currentStep.prompt}
              </p>
            </div>

            {/* STEP 1: LISTEN */}
            {currentStep.type === "listen" && currentStep.model_audio_text && (
              <div className="p-6 rounded-2xl bg-indigo-50/50 border border-indigo-100 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Volume2 className="w-4 h-4 text-indigo-600" />
                    Model Spoken Pronunciation
                  </span>
                  <button
                    onClick={() => speakText(currentStep.model_audio_text!)}
                    disabled={isAiSpeaking}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white font-extrabold text-xs shadow-sm hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>{isAiSpeaking ? "Coach Speaking..." : "Play Native Audio"}</span>
                  </button>
                </div>
                <p className="text-base sm:text-lg font-bold text-slate-800 leading-relaxed italic bg-white p-4 rounded-xl border border-indigo-100/60 shadow-xs">
                  "{currentStep.model_audio_text}"
                </p>
              </div>
            )}

            {/* STEP 2: REPEAT */}
            {currentStep.type === "repeat" && currentStep.target_phrase && (
              <div className="p-6 rounded-2xl bg-purple-50/50 border border-purple-100 space-y-4">
                <span className="text-xs font-bold text-purple-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Mic className="w-4 h-4 text-purple-600" />
                  Target Phrase To Echo
                </span>
                <p className="text-base sm:text-lg font-bold text-purple-950 bg-white p-4 rounded-xl border border-purple-100 shadow-xs">
                  "{currentStep.target_phrase}"
                </p>
                <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                  <button
                    onClick={() => speakText(currentStep.target_phrase!)}
                    className="px-4 py-2 rounded-xl bg-white border border-purple-200 text-purple-700 font-bold text-xs hover:bg-purple-50 flex items-center gap-1.5 transition-colors"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Listen Again</span>
                  </button>
                  <button
                    onClick={() => isListening ? stopRecordingSpeech() : startRecordingSpeech()}
                    className={`px-6 py-2.5 rounded-xl font-extrabold text-xs flex items-center gap-2 transition-all active:scale-95 ${
                      isListening
                        ? "bg-rose-600 text-white animate-pulse"
                        : "bg-purple-600 text-white hover:bg-purple-700 shadow-sm"
                    }`}
                  >
                    <Mic className="w-4 h-4" />
                    <span>{isListening ? "Listening... Tap to Stop" : "Press & Repeat Aloud"}</span>
                  </button>
                </div>
                {userSpokenText && (
                  <div className="p-3 bg-white rounded-xl border border-purple-200 text-xs space-y-1">
                    <span className="font-bold text-slate-400">Captured Voice:</span>
                    <p className="font-semibold text-slate-800 font-mono">"{userSpokenText}"</p>
                  </div>
                )}
              </div>
            )}

            {/* STEP 3: SPEAK */}
            {currentStep.type === "speak" && (
              <div className="p-6 rounded-2xl bg-amber-50/50 border border-amber-100 space-y-4">
                <span className="text-xs font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-amber-600" />
                  Your Speaking Challenge
                </span>
                {currentStep.sample_answer && (
                  <div className="text-xs font-medium text-amber-900 bg-white p-3 rounded-xl border border-amber-200/60">
                    <span className="font-bold">Suggested Reference:</span> "{currentStep.sample_answer}"
                  </div>
                )}
                <div className="pt-2">
                  <button
                    onClick={() => isListening ? stopRecordingSpeech() : startRecordingSpeech()}
                    className={`px-6 py-2.5 rounded-xl font-extrabold text-xs flex items-center gap-2 transition-all active:scale-95 ${
                      isListening
                        ? "bg-rose-600 text-white animate-pulse"
                        : "bg-amber-600 text-white hover:bg-amber-700 shadow-sm"
                    }`}
                  >
                    <Mic className="w-4 h-4" />
                    <span>{isListening ? "Listening to your answer..." : "Speak Your Answer Aloud"}</span>
                  </button>
                </div>
                {userSpokenText && (
                  <div className="p-3 bg-white rounded-xl border border-amber-200 text-xs space-y-1">
                    <span className="font-bold text-slate-400">Your Answer:</span>
                    <p className="font-semibold text-slate-800">"{userSpokenText}"</p>
                  </div>
                )}
              </div>
            )}

            {/* STEP 4: INTERACT (LRSI LIVE CHAT) */}
            {currentStep.type === "interact" && (
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  Live Conversational Exchange with AI Coach
                </span>

                {currentStep.coach_starter && dialogueMessages.length === 0 && (
                  <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-100 flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <span className="text-[11px] font-extrabold text-indigo-700 uppercase">Coach Question:</span>
                      <p className="text-sm font-semibold text-indigo-950">"{currentStep.coach_starter}"</p>
                    </div>
                    <button
                      onClick={() => speakText(currentStep.coach_starter!)}
                      className="p-2 rounded-lg bg-white text-indigo-600 border border-indigo-200 hover:bg-indigo-50"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* DIALOGUE BUBBLES */}
                <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                  {dialogueMessages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                      <div className={`p-3 rounded-2xl max-w-md text-xs font-semibold leading-relaxed ${
                        msg.sender === "user"
                          ? "bg-indigo-600 text-white rounded-tr-none shadow-sm"
                          : "bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-xs"
                      }`}>
                        {msg.text}
                      </div>
                    </div>
                  ))}
                  {isCoachThinking && (
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                      <div className="w-2 h-2 rounded-full bg-indigo-600 animate-ping" />
                      <span>Coach is replying...</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={() => isListening ? stopRecordingSpeech() : startRecordingSpeech()}
                    className={`p-3 rounded-2xl font-bold text-xs flex items-center justify-center transition-all ${
                      isListening ? "bg-rose-600 text-white animate-pulse" : "bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
                    }`}
                  >
                    <Mic className="w-5 h-5" />
                  </button>
                  <input
                    type="text"
                    value={userSpokenText}
                    onChange={(e) => setUserSpokenText(e.target.value)}
                    placeholder="Speak via mic or type your conversational reply..."
                    className="flex-1 px-4 py-3 rounded-2xl bg-white border border-slate-200 text-xs font-semibold focus:outline-hidden focus:border-indigo-500"
                  />
                  <button
                    onClick={handleSendDialogueTurn}
                    disabled={!userSpokenText.trim() || isCoachThinking}
                    className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-sm transition-all disabled:opacity-40"
                  >
                    Send
                  </button>
                </div>
              </div>
            )}

            {/* STEP 5: PRESENT (LRSP 1-MINUTE PUBLIC SPEAKING STAGE) */}
            {currentStep.type === "present" && (
              <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950 text-white border border-indigo-800/40 space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Trophy className="w-4 h-4 text-amber-400" />
                    1-Minute Live Public Speaking Stage
                  </span>
                  <div className="flex items-center gap-1.5 text-xs font-mono font-bold bg-white/10 px-3 py-1.5 rounded-full border border-white/10">
                    <Clock className="w-3.5 h-3.5 text-amber-300" />
                    <span>{speakingTimer}s Remaining</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-xs text-indigo-200">Your Assigned Topic:</span>
                  <h3 className="text-xl font-extrabold text-white">
                    "{currentStep.topic || "Why Curiosity is the Greatest Teacher"}"
                  </h3>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {!isTimerActive ? (
                    <button
                      onClick={handleStartPublicSpeaking}
                      className="px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs shadow-lg transition-all active:scale-95 flex items-center gap-2"
                    >
                      <Play className="w-4 h-4 fill-current" />
                      <span>Start 60s Speech Stage</span>
                    </button>
                  ) : (
                    <button
                      onClick={handleFinishPublicSpeaking}
                      className="px-6 py-3 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-extrabold text-xs shadow-lg transition-all active:scale-95 flex items-center gap-2 animate-pulse"
                    >
                      <MicOff className="w-4 h-4" />
                      <span>Finish & Request AI Critique</span>
                    </button>
                  )}
                </div>

                {userSpokenText && (
                  <div className="p-4 rounded-xl bg-white/10 border border-white/10 text-xs space-y-1">
                    <span className="text-indigo-200 font-bold">Captured Speech Transcript:</span>
                    <p className="text-white font-medium leading-relaxed">"{userSpokenText}"</p>
                  </div>
                )}

                {/* AI CRITIQUE REPORT */}
                {critiqueLoading && (
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center gap-3 text-xs text-indigo-200 font-bold">
                    <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                    <span>AI adjudicator is evaluating filler words, pacing, and grammatical poise...</span>
                  </div>
                )}

                {speakingCritique && (
                  <div className="p-6 rounded-2xl bg-white text-slate-900 border border-indigo-100 shadow-xl space-y-4 animate-in zoom-in-95">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <span className="text-xs font-black uppercase text-indigo-600 tracking-wider">
                        Adjudicator Scorecard
                      </span>
                      <div className="flex items-center gap-3 text-xs font-bold">
                        <span className="text-rose-600">Fillers: {speakingCritique.filler_count}</span>
                        <span className="text-indigo-600">Grammar: {speakingCritique.grammar_score}%</span>
                        <span className="text-emerald-600 font-black">Overall: {speakingCritique.overall_score}/100</span>
                      </div>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div>
                        <span className="font-bold text-rose-700">What To Improve:</span>
                        <p className="text-slate-600 mt-0.5">{speakingCritique.what_was_wrong}</p>
                      </div>
                      <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-100">
                        <span className="font-extrabold text-indigo-900">Live Spoken Correction:</span>
                        <p className="text-indigo-950 font-semibold mt-0.5 italic">"{speakingCritique.live_correction}"</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* STEP 6: CAPSTONE FINAL INTERACTION */}
            {currentStep.type === "capstone" && (
              <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-4">
                <span className="text-xs font-extrabold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-emerald-600" />
                  Final Spoken Capstone Interaction
                </span>
                <p className="text-sm font-bold text-emerald-950 leading-relaxed">
                  "{currentStep.coach_starter}"
                </p>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={() => isListening ? stopRecordingSpeech() : startRecordingSpeech()}
                    className={`px-6 py-2.5 rounded-xl font-extrabold text-xs flex items-center gap-2 transition-all active:scale-95 ${
                      isListening ? "bg-rose-600 text-white animate-pulse" : "bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm"
                    }`}
                  >
                    <Mic className="w-4 h-4" />
                    <span>{isListening ? "Listening to your Capstone..." : "Deliver Capstone Speech"}</span>
                  </button>
                </div>

                {userSpokenText && (
                  <div className="p-4 bg-white rounded-xl border border-emerald-200 text-xs space-y-2">
                    <span className="font-bold text-slate-500">Your Capstone Transcript:</span>
                    <p className="font-semibold text-slate-900">"{userSpokenText}"</p>
                    <button
                      onClick={handleFinalizeCapstone}
                      className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-md transition-all active:scale-95"
                    >
                      Generate Official Spoken Mastery Report Card
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* FOOTER BUTTONS */}
            <div className="pt-4 flex items-center justify-between border-t border-slate-100">
              <button
                disabled={activeStepIdx === 0}
                onClick={() => setActiveStepIdx(prev => Math.max(0, prev - 1))}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none"
              >
                Previous Step
              </button>

              <button
                onClick={() => handleCompleteStep(currentStep.step_id)}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold shadow-sm transition-all active:scale-95 flex items-center gap-1.5"
              >
                <span>{isLastStep ? "Complete Module" : "Mark Step Complete & Advance"}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ===================================================================
  // VIEW 4: OFFICIAL SPOKEN MASTERY REPORT CARD
  // ===================================================================
  if (activeTab === "report" && track?.mastery_report) {
    const rep = track.mastery_report;

    return (
      <div className="max-w-4xl mx-auto space-y-6 py-6 px-4 animate-in fade-in duration-300">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <button
            onClick={() => setActiveTab("roadmap")}
            className="text-xs font-extrabold text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5"
          >
            <ArrowRight className="w-4 h-4 rotate-180" />
            <span>Back to Module Roadmap</span>
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 flex items-center gap-1.5 shadow-xs"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Print Official Report</span>
            </button>
            <button
              onClick={handleResetCycle}
              className="px-4 py-2 rounded-xl bg-rose-50 text-rose-700 font-bold text-xs hover:bg-rose-100 flex items-center gap-1.5 border border-rose-200"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restart Cycle</span>
            </button>
          </div>
        </div>

        {/* CERTIFICATE / REPORT CARD */}
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xl space-y-8 relative overflow-hidden">
          {/* TOP EMBLEM */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white flex items-center justify-center font-black text-xl shadow-md">
                D
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900">Devgya Global Education</h2>
                <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Spoken English Mastery Evaluation Report</p>
              </div>
            </div>
            <div className="text-left sm:text-right">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Certificate ID</span>
              <p className="font-mono font-extrabold text-xs text-slate-800">{rep.certificate_id || "DEVGYA-ENG-2026"}</p>
            </div>
          </div>

          {/* STUDENT HERO */}
          <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-indigo-50 p-6 rounded-2xl border border-indigo-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs font-bold text-indigo-600 uppercase">Learner Profile</span>
              <h3 className="text-2xl font-black text-slate-900">{rep.student_name}</h3>
              <p className="text-xs text-slate-500 font-semibold">Assessed Role: {rep.user_role?.toUpperCase()}</p>
            </div>
            <div className="px-4 py-2.5 rounded-xl bg-white text-indigo-900 font-extrabold text-sm border border-indigo-200 shadow-sm text-center">
              <span className="text-[10px] uppercase text-indigo-500 block font-bold">Fluency Band</span>
              {rep.fluency_band}
            </div>
          </div>

          {/* METRIC GRIDS */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center">
              <span className="text-xs font-bold text-slate-500 uppercase">Diagnostic Score</span>
              <p className="text-2xl font-black text-slate-900 mt-1">{rep.diagnostic_score} / 10</p>
            </div>
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 text-center">
              <span className="text-xs font-bold text-emerald-600 uppercase">Pronunciation</span>
              <p className="text-2xl font-black text-emerald-900 mt-1">{rep.pronunciation_rating}%</p>
            </div>
            <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100 text-center">
              <span className="text-xs font-bold text-indigo-600 uppercase">Grammar Accuracy</span>
              <p className="text-2xl font-black text-indigo-900 mt-1">{rep.grammar_accuracy}%</p>
            </div>
            <div className="p-4 rounded-2xl bg-purple-50 border border-purple-100 text-center">
              <span className="text-xs font-bold text-purple-600 uppercase">Public Speaking</span>
              <p className="text-2xl font-black text-purple-900 mt-1">{rep.public_speaking_confidence}%</p>
            </div>
          </div>

          {/* STRENGTHS & WEAKNESSES RESOLVED */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <span className="text-xs font-extrabold uppercase text-emerald-700 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Demonstrated Strengths
              </span>
              <ul className="space-y-1.5">
                {(rep.strengths || []).map((s: string, i: number) => (
                  <li key={i} className="text-xs text-slate-700 font-medium bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-100/60">
                    • {s}
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-extrabold uppercase text-indigo-700 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                Weaknesses Resolved Through Lectures
              </span>
              <ul className="space-y-1.5">
                {(rep.weaknesses_resolved || []).map((w: string, i: number) => (
                  <li key={i} className="text-xs text-slate-700 font-medium bg-indigo-50/50 p-2.5 rounded-xl border border-indigo-100/60">
                    • {w}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* PARENT & TEACHER RECOMMENDATIONS */}
          <div className="space-y-3 pt-2">
            <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-100">
              <span className="text-xs font-extrabold text-rose-800 uppercase flex items-center gap-1.5 mb-1">
                <HeartHandshake className="w-4 h-4 text-rose-600" />
                Coach Recommendation For Parents:
              </span>
              <p className="text-xs text-rose-950 font-medium leading-relaxed">
                {rep.coach_recommendation_for_parents}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100">
              <span className="text-xs font-extrabold text-indigo-800 uppercase flex items-center gap-1.5 mb-1">
                <GraduationCap className="w-4 h-4 text-indigo-600" />
                Coach Recommendation For Teachers:
              </span>
              <p className="text-xs text-indigo-950 font-medium leading-relaxed">
                {rep.coach_recommendation_for_teachers}
              </p>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-4 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 font-semibold gap-2">
            <span>Generated on {new Date(rep.generated_at).toLocaleDateString()}</span>
            <span>Course Cycle Valid Until: {new Date(rep.cycle_valid_until).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
