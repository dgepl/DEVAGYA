"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { 
  BookOpen, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  Trophy, 
  RefreshCw, 
  ChevronLeft,
  HelpCircle,
  Award,
  Layers,
  GraduationCap,
  Bookmark,
  Check,
  Zap,
  Filter
} from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import Markdown from "@/components/chat/Markdown";

export default function OlympiadPracticePage() {
  const { user } = useAppStore();
  const userSubject = user?.subject || "Science";

  const [selectedSubject, setSelectedSubject] = useState<string>(userSubject);
  const [selectedModule, setSelectedModule] = useState<string>("all");
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [evaluations, setEvaluations] = useState<Record<string, any>>({});
  const [streak, setStreak] = useState(0);

  const cleanQuestionText = (text: string) => {
    if (!text) return "";
    return text.replace(/^\s*\[.*?\]\s*/, "").trim();
  };

  const fetchPracticeQuestions = async () => {
    setLoading(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api/v1";
      const res = await fetch(`${baseUrl}/olympiad/practice?subject=${encodeURIComponent(selectedSubject)}`);
      const data = await res.json();
      if (data.questions) {
        setQuestions(data.questions);
      }
    } catch (e) {
      console.error("Error fetching practice questions", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPracticeQuestions();
  }, [selectedSubject]);

  const handleSelectOption = async (qId: string, optionIdx: number) => {
    setSelectedAnswers(prev => ({ ...prev, [qId]: optionIdx }));

    // Evaluate answer instantly
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api/v1";
      const res = await fetch(`${baseUrl}/olympiad/practice/evaluate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          question_id: qId, 
          selected_option: optionIdx,
          subject: selectedSubject
        })
      });
      const data = await res.json();
      if (data.status === "success") {
        setEvaluations(prev => ({ ...prev, [qId]: data }));
        if (data.is_correct) {
          setStreak(prev => prev + 1);
        } else {
          setStreak(0);
        }
      }
    } catch (e) {
      console.error("Evaluation error", e);
    }
  };

  const filteredQuestions = useMemo(() => {
    if (selectedModule === "all") return questions;
    if (selectedModule === "Part-A") return questions.filter(q => q.section === "Part-A");
    if (selectedModule === "Part-B") return questions.filter(q => q.section === "Part-B");
    return questions.filter(q => q.module === selectedModule);
  }, [questions, selectedModule]);

  const totalAnswered = Object.keys(selectedAnswers).length;
  const totalCorrect = Object.values(evaluations).filter((e: any) => e.is_correct).length;

  return (
    <div className="space-y-4 sm:space-y-6 max-w-4xl mx-auto pb-20 font-sans animate-in fade-in duration-300 px-3 sm:px-4">
      
      {/* TOP NAVIGATION & SCORE BAR */}
      <div className="flex items-center justify-between gap-2 pt-2">
        <Link
          href="/dashboard/teacher-olympiad"
          className="inline-flex items-center gap-1 text-xs font-black text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-xl border border-indigo-100 transition-colors shrink-0"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Back to Hall</span>
          <span className="sm:hidden">Back</span>
        </Link>

        {/* Score & Streak Badges */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          <div className="flex items-center gap-1.5 bg-emerald-50 px-2.5 sm:px-3.5 py-1.5 rounded-xl border border-emerald-200 text-emerald-800 text-[11px] sm:text-xs font-black">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Score: {totalCorrect}/{totalAnswered}</span>
          </div>

          <div className="flex items-center gap-1.5 bg-amber-50 px-2.5 sm:px-3.5 py-1.5 rounded-xl border border-amber-200 text-amber-800 text-[11px] sm:text-xs font-black">
            <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-400 shrink-0" />
            <span>{streak} 🔥</span>
          </div>
        </div>
      </div>

      {/* HEADER CARD */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-4 sm:p-6 rounded-3xl shadow-md space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[10px] font-black border border-amber-400/30 mb-1">
              <Trophy className="w-3 h-3" /> Practice Drills (Untimed)
            </div>
            <h1 className="text-base sm:text-2xl font-black">
              Skill Enhance Practice Arena
            </h1>
            <p className="text-[11px] sm:text-xs text-slate-300 font-medium">
              100 authentic questions across CBSE NEP Pedagogy & Core Subject modules with instant explanations.
            </p>
          </div>

          {/* Subject Dropdown */}
          <div className="shrink-0">
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full sm:w-auto bg-slate-800 border border-slate-700 text-white font-bold text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-400 cursor-pointer"
            >
              <option value="Science">Science Track</option>
              <option value="Mathematics">Mathematics Track</option>
              <option value="English">English Track</option>
              <option value="Hindi">Hindi Track</option>
              <option value="Social Science">Social Science Track</option>
              <option value="Physics">Physics Track</option>
              <option value="Chemistry">Chemistry Track</option>
              <option value="Biology">Biology Track</option>
              <option value="Computer Science">Computer Science Track</option>
            </select>
          </div>
        </div>

        {/* MODULE FILTER PILLS (HORIZONTAL SCROLL ON MOBILE) */}
        <div className="pt-2 border-t border-slate-800/80">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs font-black">
            <button
              onClick={() => setSelectedModule("all")}
              className={`px-3 py-1 rounded-xl whitespace-nowrap transition cursor-pointer text-xs ${
                selectedModule === "all" ? "bg-white text-slate-900 shadow-xs" : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
            >
              All ({questions.length})
            </button>

            <button
              onClick={() => setSelectedModule("Part-A")}
              className={`px-3 py-1 rounded-xl whitespace-nowrap transition cursor-pointer text-xs ${
                selectedModule === "Part-A" ? "bg-purple-500 text-white shadow-xs" : "bg-slate-800 text-purple-200 hover:bg-slate-700"
              }`}
            >
              Part A: Pedagogy (60 Qs)
            </button>

            <button
              onClick={() => setSelectedModule("Part-B")}
              className={`px-3 py-1 rounded-xl whitespace-nowrap transition cursor-pointer text-xs ${
                selectedModule === "Part-B" ? "bg-indigo-500 text-white shadow-xs" : "bg-slate-800 text-indigo-200 hover:bg-slate-700"
              }`}
            >
              Part B: Subject (40 Qs)
            </button>

            <button
              onClick={() => setSelectedModule("CBSE CPD Modules & NEP Guidelines")}
              className={`px-3 py-1 rounded-xl whitespace-nowrap transition cursor-pointer text-xs ${
                selectedModule === "CBSE CPD Modules & NEP Guidelines" ? "bg-purple-500 text-white shadow-xs" : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
            >
              CPD & NEP (20 Qs)
            </button>

            <button
              onClick={() => setSelectedModule("Personal Classroom Experience & Scenarios")}
              className={`px-3 py-1 rounded-xl whitespace-nowrap transition cursor-pointer text-xs ${
                selectedModule === "Personal Classroom Experience & Scenarios" ? "bg-purple-500 text-white shadow-xs" : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
            >
              Classroom Scenarios (20 Qs)
            </button>

            <button
              onClick={() => setSelectedModule("Modern Pedagogy & Critical Thinking")}
              className={`px-3 py-1 rounded-xl whitespace-nowrap transition cursor-pointer text-xs ${
                selectedModule === "Modern Pedagogy & Critical Thinking" ? "bg-purple-500 text-white shadow-xs" : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
            >
              Modern Pedagogy (20 Qs)
            </button>

            <button
              onClick={() => setSelectedModule("Core Subject Knowledge")}
              className={`px-3 py-1 rounded-xl whitespace-nowrap transition cursor-pointer text-xs ${
                selectedModule === "Core Subject Knowledge" ? "bg-indigo-500 text-white shadow-xs" : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
            >
              Core Subject (20 Qs)
            </button>

            <button
              onClick={() => setSelectedModule("Misconceptions & HOTS")}
              className={`px-3 py-1 rounded-xl whitespace-nowrap transition cursor-pointer text-xs ${
                selectedModule === "Misconceptions & HOTS" ? "bg-indigo-500 text-white shadow-xs" : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
            >
              Misconceptions & HOTS (10 Qs)
            </button>
          </div>
        </div>
      </div>

      {/* PRACTICE QUESTIONS LIST */}
      {loading ? (
        <div className="p-12 text-center space-y-3 bg-white rounded-3xl border border-slate-200">
          <RefreshCw className="w-7 h-7 text-indigo-600 animate-spin mx-auto" />
          <p className="text-xs font-bold text-slate-600">Loading practice questions...</p>
        </div>
      ) : filteredQuestions.length === 0 ? (
        <div className="p-10 text-center bg-white rounded-3xl border border-slate-200 space-y-2">
          <BookOpen className="w-8 h-8 text-slate-300 mx-auto" />
          <p className="text-xs font-bold text-slate-600">No practice questions found for this filter.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredQuestions.map((q, qIdx) => {
            const selectedOpt = selectedAnswers[q.id];
            const evalResult = evaluations[q.id];
            const isAnswered = selectedOpt !== undefined;

            return (
              <div key={q.id} className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-200 shadow-xs space-y-3">
                
                {/* Question Header */}
                <div className="flex flex-wrap items-center justify-between gap-1.5 border-b border-slate-100 pb-2.5">
                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-black text-[10px] border border-indigo-100 uppercase">
                      Q{qIdx + 1}
                    </span>
                    <span className="text-[11px] font-bold text-slate-500 truncate max-w-[200px] sm:max-w-xs">
                      {q.module || q.section}
                    </span>
                  </div>

                  {evalResult && (
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black flex items-center gap-1 ${
                      evalResult.is_correct ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-rose-50 text-rose-700 border border-rose-200"
                    }`}>
                      {evalResult.is_correct ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <XCircle className="w-3 h-3 text-rose-600" />}
                      <span>{evalResult.is_correct ? "Correct! 🎯" : "Incorrect"}</span>
                    </span>
                  )}
                </div>

                {/* Question Stem */}
                <div className="text-xs sm:text-sm font-bold text-slate-900 leading-relaxed">
                  <Markdown content={cleanQuestionText(q.question_text)} />
                </div>

                {/* 4 Options */}
                <div className="space-y-2">
                  {q.options?.map((opt: string, optIdx: number) => {
                    const isSelected = selectedOpt === optIdx;
                    let style = "bg-white border-slate-200 hover:border-indigo-300 hover:bg-slate-50/50";
                    
                    if (isAnswered) {
                      if (optIdx === evalResult?.correct_answer) {
                        style = "bg-emerald-50 border-emerald-500 text-emerald-950 font-bold";
                      } else if (isSelected && !evalResult?.is_correct) {
                        style = "bg-rose-50 border-rose-400 text-rose-950";
                      } else {
                        style = "bg-slate-50 border-slate-200 opacity-60";
                      }
                    }

                    return (
                      <div
                        key={optIdx}
                        onClick={() => !isAnswered && handleSelectOption(q.id, optIdx)}
                        className={`p-3 rounded-2xl border transition-all flex items-center gap-2.5 ${
                          !isAnswered ? "cursor-pointer active:scale-98" : ""
                        } ${style}`}
                      >
                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black shrink-0 ${
                          isSelected ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600"
                        }`}>
                          {String.fromCharCode(65 + optIdx)}
                        </div>
                        <div className="text-xs font-medium leading-relaxed flex-1">
                          <Markdown content={opt} />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Pedagogical Explanation Accordion */}
                {evalResult && (
                  <div className="p-3.5 bg-indigo-50/80 rounded-2xl border border-indigo-100 space-y-1 animate-in fade-in duration-200">
                    <div className="flex items-center gap-1.5 text-xs font-black text-indigo-900">
                      <HelpCircle className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                      <span>Pedagogical Analysis & Explanation:</span>
                    </div>
                    <div className="text-xs text-slate-800 leading-relaxed font-medium">
                      <Markdown content={evalResult.explanation || q.explanation} />
                    </div>
                  </div>
                )}

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
