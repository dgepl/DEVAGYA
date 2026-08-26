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
    <div className="space-y-6 max-w-5xl mx-auto pb-16 font-sans animate-in fade-in duration-300">
      
      {/* TOP BAR */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/dashboard/teacher-olympiad"
          className="inline-flex items-center gap-1.5 text-xs font-extrabold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-3.5 py-2 rounded-xl border border-indigo-100 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to National Olympiad Hall</span>
        </Link>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-emerald-50 px-3.5 py-1.5 rounded-xl border border-emerald-200 text-emerald-800 text-xs font-black">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Score: {totalCorrect} / {totalAnswered}</span>
          </div>

          <div className="flex items-center gap-2 bg-amber-50 px-3.5 py-1.5 rounded-xl border border-amber-200 text-amber-800 text-xs font-black">
            <Zap className="w-4 h-4 text-amber-500 fill-amber-400" />
            <span>Mastery Streak: {streak} 🔥</span>
          </div>
        </div>
      </div>

      {/* HERO BANNER */}
      <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl space-y-5 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-400/30 text-amber-300 text-xs font-black">
              <Trophy className="w-3.5 h-3.5" />
              <span>100-MCQ 60/40 Master Practice Arena</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Teacher Skills Olympiad Practice Drills
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
              100 authentic questions across all 6 blueprint modules. Practice untimed with instant step-by-step pedagogical explanations.
            </p>
          </div>

          <div className="shrink-0 space-y-1">
            <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Subject Track</label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-white font-bold text-xs rounded-xl px-3.5 py-2 focus:outline-none focus:border-indigo-500 cursor-pointer"
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

        {/* 6 MODULE FILTER CHIPS */}
        <div className="pt-2 border-t border-slate-800/80 space-y-2">
          <div className="flex items-center gap-1.5 text-[11px] font-black text-slate-400 uppercase">
            <Filter className="w-3.5 h-3.5 text-indigo-400" />
            <span>Filter by 60/40 Assessment Modules:</span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setSelectedModule("all")}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                selectedModule === "all" ? "bg-white text-slate-900 shadow-md" : "bg-slate-800/80 text-slate-300 hover:bg-slate-700"
              }`}
            >
              All 100 Questions
            </button>

            {/* PART-A CHIPS */}
            <button
              onClick={() => setSelectedModule("CBSE CPD Modules & NEP Guidelines")}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                selectedModule === "CBSE CPD Modules & NEP Guidelines" ? "bg-purple-500 text-white shadow-md" : "bg-purple-950/60 text-purple-200 border border-purple-800/50 hover:bg-purple-900/60"
              }`}
            >
              Part A1: CBSE CPD & NEP (20 Qs)
            </button>

            <button
              onClick={() => setSelectedModule("Personal Classroom Experience & Scenarios")}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                selectedModule === "Personal Classroom Experience & Scenarios" ? "bg-purple-500 text-white shadow-md" : "bg-purple-950/60 text-purple-200 border border-purple-800/50 hover:bg-purple-900/60"
              }`}
            >
              Part A2: Classroom Scenarios (20 Qs)
            </button>

            <button
              onClick={() => setSelectedModule("Modern Pedagogy & Critical Thinking")}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                selectedModule === "Modern Pedagogy & Critical Thinking" ? "bg-purple-500 text-white shadow-md" : "bg-purple-950/60 text-purple-200 border border-purple-800/50 hover:bg-purple-900/60"
              }`}
            >
              Part A3: Modern Pedagogy (20 Qs)
            </button>

            {/* PART-B CHIPS */}
            <button
              onClick={() => setSelectedModule("Core Subject Knowledge")}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                selectedModule === "Core Subject Knowledge" ? "bg-indigo-500 text-white shadow-md" : "bg-indigo-950/60 text-indigo-200 border border-indigo-800/50 hover:bg-indigo-900/60"
              }`}
            >
              Part B1: Core Subject (20 Qs)
            </button>

            <button
              onClick={() => setSelectedModule("Subject Pedagogical Knowledge & TLM")}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                selectedModule === "Subject Pedagogical Knowledge & TLM" ? "bg-indigo-500 text-white shadow-md" : "bg-indigo-950/60 text-indigo-200 border border-indigo-800/50 hover:bg-indigo-900/60"
              }`}
            >
              Part B2: Subject TLM (10 Qs)
            </button>

            <button
              onClick={() => setSelectedModule("Misconceptions & HOTS")}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                selectedModule === "Misconceptions & HOTS" ? "bg-indigo-500 text-white shadow-md" : "bg-indigo-950/60 text-indigo-200 border border-indigo-800/50 hover:bg-indigo-900/60"
              }`}
            >
              Part B3: Misconceptions & HOTS (10 Qs)
            </button>
          </div>
        </div>
      </div>

      {/* PRACTICE QUESTIONS LIST */}
      {loading ? (
        <div className="p-16 text-center space-y-3 bg-white rounded-3xl border border-slate-200">
          <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
          <p className="text-xs font-bold text-slate-600">Loading 100 practice questions...</p>
        </div>
      ) : filteredQuestions.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-2">
          <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
          <p className="text-xs font-bold text-slate-600">No practice questions found.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredQuestions.map((q, qIdx) => {
            const selectedOpt = selectedAnswers[q.id];
            const evalResult = evaluations[q.id];
            const isAnswered = selectedOpt !== undefined;

            return (
              <div key={q.id} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-5">
                
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-extrabold text-[10px] border border-indigo-100 uppercase">
                      Q{qIdx + 1} • {q.section}
                    </span>
                    <span className="text-[11px] font-bold text-slate-400">
                      {q.module}
                    </span>
                  </div>

                  {evalResult && (
                    <span className={`px-3 py-1 rounded-full text-[11px] font-black flex items-center gap-1 ${
                      evalResult.is_correct ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-rose-50 text-rose-700 border border-rose-200"
                    }`}>
                      {evalResult.is_correct ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <XCircle className="w-3.5 h-3.5 text-rose-600" />}
                      <span>{evalResult.is_correct ? "Correct Answer! 🎯" : "Incorrect Option"}</span>
                    </span>
                  )}
                </div>

                <div className="text-sm sm:text-base font-extrabold text-slate-900 leading-relaxed">
                  <Markdown content={cleanQuestionText(q.question_text)} />
                </div>

                {/* 4 OPTIONS */}
                <div className="space-y-2.5">
                  {q.options?.map((opt: string, optIdx: number) => {
                    const isSelected = selectedOpt === optIdx;
                    let style = "bg-white border-slate-200 hover:border-indigo-300 hover:bg-slate-50/50";
                    
                    if (isAnswered) {
                      if (optIdx === evalResult?.correct_answer) {
                        style = "bg-emerald-50 border-emerald-500 text-emerald-900 font-bold";
                      } else if (isSelected && !evalResult?.is_correct) {
                        style = "bg-rose-50 border-rose-400 text-rose-900";
                      } else {
                        style = "bg-slate-50 border-slate-200 opacity-60";
                      }
                    }

                    return (
                      <div
                        key={optIdx}
                        onClick={() => !isAnswered && handleSelectOption(q.id, optIdx)}
                        className={`p-3.5 rounded-2xl border-2 transition-all flex items-center gap-3 ${
                          !isAnswered ? "cursor-pointer active:scale-98" : ""
                        } ${style}`}
                      >
                        <div className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ${
                          isSelected ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600"
                        }`}>
                          {String.fromCharCode(65 + optIdx)}
                        </div>
                        <div className="text-xs font-semibold leading-relaxed flex-1">
                          <Markdown content={opt} />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* EXPLANATION ACCORDION ONCE ANSWERED */}
                {evalResult && (
                  <div className="p-4 bg-indigo-50/70 rounded-2xl border border-indigo-100 space-y-1.5 animate-in fade-in duration-200">
                    <div className="flex items-center gap-1.5 text-xs font-black text-indigo-900">
                      <HelpCircle className="w-4 h-4 text-indigo-600 shrink-0" />
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
