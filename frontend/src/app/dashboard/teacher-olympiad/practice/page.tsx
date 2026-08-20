"use client";

import { useState, useEffect } from "react";
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
  GraduationCap
} from "lucide-react";

export default function OlympiadPracticePage() {
  const [subject, setSubject] = useState<string>("all");
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [evaluations, setEvaluations] = useState<Record<string, any>>({});
  const [streak, setStreak] = useState(0);

  const fetchPracticeQuestions = async (sub = subject) => {
    setLoading(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api/v1";
      const url = sub !== "all" ? `${baseUrl}/olympiad/practice?subject=${encodeURIComponent(sub)}` : `${baseUrl}/olympiad/practice`;
      const res = await fetch(url);
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
  }, [subject]);

  const handleSelectOption = async (qId: string, optionIdx: number) => {
    setSelectedAnswers(prev => ({ ...prev, [qId]: optionIdx }));

    // Evaluate answer instantly
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api/v1";
      const res = await fetch(`${baseUrl}/olympiad/practice/evaluate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question_id: qId, selected_option: optionIdx })
      });
      const data = await res.json();
      if (data.status === "success") {
        setEvaluations(prev => ({ ...prev, [qId]: data }));
        if (data.is_correct) {
          setStreak(prev => prev + 1);
        }
      }
    } catch (e) {
      console.error("Evaluation error", e);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 font-sans">
      
      {/* NAVIGATION BACK HEADER */}
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard/teacher-olympiad"
          className="inline-flex items-center gap-1.5 text-xs font-extrabold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-xl border border-indigo-100 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Proctored Hall</span>
        </Link>

        <div className="flex items-center gap-2 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200 text-amber-800 text-xs font-black">
          <Trophy className="w-4 h-4 text-amber-500" />
          <span>Practice Mastery Streak: {streak}</span>
        </div>
      </div>

      {/* HERO BANNER */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-black">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Olympiad Preparation Zone</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Teachers Skill Olympiad Practice
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
            Practice pedagogy scenarios, NEP 2020 frameworks, and AI classroom integration untimed with instant solutions.
          </p>
        </div>

        {/* SUBJECT FILTER SELECTOR */}
        <div className="shrink-0 space-y-1">
          <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Filter By Domain</label>
          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-white font-bold text-xs rounded-xl px-4 py-2.5 focus:outline-none focus:border-indigo-500 cursor-pointer"
          >
            <option value="all">All Olympiad Subjects</option>
            <option value="Pedagogy & Methodology">Pedagogy & Methodology</option>
            <option value="AI & Digital Tools">AI & Digital Tools</option>
            <option value="CBSE Policy & Ethics">CBSE Policy & Ethics</option>
          </select>
        </div>
      </div>

      {/* PRACTICE QUESTIONS CONTAINER */}
      {loading ? (
        <div className="p-12 text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
          <p className="text-xs font-bold text-slate-600">Loading Olympiad practice questions...</p>
        </div>
      ) : questions.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-2">
          <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
          <p className="text-xs font-bold text-slate-600">No practice questions found for this subject filter.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {questions.map((q, qIdx) => {
            const selectedOpt = selectedAnswers[q.id];
            const evalResult = evaluations[q.id];

            return (
              <div key={q.id} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-5">
                
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 font-extrabold text-[11px] border border-indigo-100">
                    Practice Question {qIdx + 1} • {q.subject}
                  </span>

                  {evalResult && (
                    <span className={`px-3 py-1 rounded-full text-[11px] font-black flex items-center gap-1 ${
                      evalResult.is_correct ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-red-50 text-red-700 border border-red-200"
                    }`}>
                      {evalResult.is_correct ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <XCircle className="w-3.5 h-3.5 text-red-600" />}
                      <span>{evalResult.is_correct ? "Correct Answer!" : "Incorrect Option"}</span>
                    </span>
                  )}
                </div>

                <h3 className="text-base font-extrabold text-slate-900 leading-relaxed">
                  {q.question_text}
                </h3>

                {/* OPTIONS */}
                <div className="space-y-2.5">
                  {q.options?.map((opt: string, optIdx: number) => {
                    const isSelected = selectedOpt === optIdx;
                    let optionStyle = "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100";

                    if (evalResult) {
                      if (optIdx === evalResult.correct_option) {
                        optionStyle = "bg-emerald-50 border-emerald-600 text-emerald-900 font-extrabold";
                      } else if (isSelected && !evalResult.is_correct) {
                        optionStyle = "bg-red-50 border-red-600 text-red-900 font-extrabold";
                      }
                    } else if (isSelected) {
                      optionStyle = "bg-indigo-50 border-indigo-600 text-indigo-900 font-bold";
                    }

                    return (
                      <button
                        key={optIdx}
                        onClick={() => handleSelectOption(q.id, optIdx)}
                        className={`w-full p-4 rounded-2xl border text-left text-xs transition-all flex items-start gap-3 cursor-pointer ${optionStyle}`}
                      >
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${
                          isSelected ? "bg-indigo-600 text-white" : "bg-slate-200 text-slate-700"
                        }`}>
                          {String.fromCharCode(65 + optIdx)}
                        </span>
                        <span className="flex-1 leading-relaxed">{opt}</span>
                      </button>
                    );
                  })}
                </div>

                {/* EXPLANATION BOX */}
                {evalResult && (
                  <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 space-y-1.5 animate-in fade-in duration-300">
                    <div className="flex items-center gap-1.5 text-indigo-900 font-black text-xs uppercase tracking-wider">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Pedagogical Solution & Explanation</span>
                    </div>
                    <p className="text-xs text-slate-700 font-medium leading-relaxed">
                      {evalResult.explanation}
                    </p>
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
