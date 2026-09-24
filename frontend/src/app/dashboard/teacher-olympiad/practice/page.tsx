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
  Filter,
  RotateCcw,
  AlertCircle
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
  const [isSubmitted, setIsSubmitted] = useState(false);

  const cleanQuestionText = (text: string) => {
    if (!text) return "";
    return text.replace(/^\s*\[.*?\]\s*/, "").trim();
  };

  const fetchPracticeQuestions = async () => {
    setLoading(true);
    setIsSubmitted(false);
    setSelectedAnswers({});
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

  // Record user selection without any live right/wrong evaluation
  const handleSelectOption = (qId: string, optionIdx: number) => {
    if (isSubmitted) return; // Prevent changing after submission
    setSelectedAnswers(prev => ({ ...prev, [qId]: optionIdx }));
  };

  const filteredQuestions = useMemo(() => {
    if (selectedModule === "all") return questions;
    if (selectedModule === "Part-A") return questions.filter(q => q.section === "Part-A");
    if (selectedModule === "Part-B") return questions.filter(q => q.section === "Part-B");
    return questions.filter(q => q.module === selectedModule);
  }, [questions, selectedModule]);

  const partACount = useMemo(() => questions.filter(q => q.section === "Part-A").length, [questions]);
  const partBCount = useMemo(() => questions.filter(q => q.section === "Part-B").length, [questions]);

  const totalAnswered = Object.keys(selectedAnswers).length;

  // Evaluation results computed strictly when user submits at the end
  const resultStats = useMemo(() => {
    let correct = 0;
    let wrong = 0;
    let unanswered = 0;

    for (const q of filteredQuestions) {
      const userAns = selectedAnswers[q.id];
      if (userAns === undefined) {
        unanswered++;
      } else if (userAns === q.correct_answer) {
        correct++;
      } else {
        wrong++;
      }
    }

    const total = filteredQuestions.length;
    const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
    const accuracy = (correct + wrong) > 0 ? Math.round((correct / (correct + wrong)) * 100) : 0;

    return {
      correct,
      wrong,
      unanswered,
      total,
      percentage: pct,
      accuracy
    };
  }, [filteredQuestions, selectedAnswers]);

  const handleSubmitPractice = () => {
    if (totalAnswered === 0) {
      alert("Please answer at least one question before viewing the results.");
      return;
    }
    if (totalAnswered < filteredQuestions.length) {
      if (!confirm(`You have answered ${totalAnswered} out of ${filteredQuestions.length} questions. Do you want to submit and view your full results now?`)) {
        return;
      }
    }
    setIsSubmitted(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleRetakePractice = () => {
    setSelectedAnswers({});
    setIsSubmitted(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="space-y-4 sm:space-y-6 max-w-4xl mx-auto pb-28 font-sans animate-in fade-in duration-300 px-3 sm:px-4">
      
      {/* TOP NAVIGATION BAR */}
      <div className="flex items-center justify-between gap-2 pt-2">
        <Link
          href="/dashboard/teacher-olympiad"
          className="inline-flex items-center gap-1 text-xs font-black text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-xl border border-indigo-100 transition-colors shrink-0"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Back to Hall</span>
          <span className="sm:hidden">Back</span>
        </Link>

        {/* Progress or Score Badges */}
        <div className="flex items-center gap-2 sm:gap-3">
          {!isSubmitted ? (
            <div className="flex items-center gap-2 bg-indigo-50 px-3 py-1.5 rounded-xl border border-indigo-200 text-indigo-900 text-xs font-black">
              <span>Answered: {totalAnswered} / {filteredQuestions.length}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-emerald-50 px-3.5 py-1.5 rounded-xl border border-emerald-300 text-emerald-900 text-xs font-black">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Score: {resultStats.correct} / {resultStats.total} ({resultStats.percentage}%)</span>
            </div>
          )}

          {isSubmitted && (
            <button
              onClick={handleRetakePractice}
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition flex items-center gap-1 cursor-pointer shadow-xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Retake</span>
            </button>
          )}
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
              100 authentic questions across CBSE NEP Pedagogy &amp; Core Subject modules. Select answers freely; full results and pedagogical explanations will appear in the end upon submission.
            </p>
          </div>

          {/* Subject Dropdown */}
          <div className="shrink-0">
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              disabled={isSubmitted}
              className="w-full sm:w-auto bg-slate-800 border border-slate-700 text-white font-bold text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-400 cursor-pointer disabled:opacity-50"
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

        {/* MODULE FILTER: ONLY PART-A AND PART-B */}
        <div className="pt-2 border-t border-slate-800/80">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs font-black">
            <button
              onClick={() => setSelectedModule("all")}
              className={`px-3.5 py-1.5 rounded-xl whitespace-nowrap transition cursor-pointer text-xs font-black ${
                selectedModule === "all" 
                  ? "bg-white text-slate-950 shadow-md ring-2 ring-white/20" 
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
            >
              All Questions ({questions.length})
            </button>

            <button
              onClick={() => setSelectedModule("Part-A")}
              className={`px-3.5 py-1.5 rounded-xl whitespace-nowrap transition cursor-pointer text-xs font-black flex items-center gap-1.5 ${
                selectedModule === "Part-A" 
                  ? "bg-purple-500 text-white shadow-md shadow-purple-500/30 ring-2 ring-purple-400" 
                  : "bg-slate-800 text-purple-300 hover:bg-slate-700"
              }`}
            >
              <span>Part A: Pedagogy &amp; NEP</span>
              <span className="px-1.5 py-0.5 rounded-md text-[10px] bg-purple-900/50 text-purple-200">
                {partACount || 60} Qs
              </span>
            </button>

            <button
              onClick={() => setSelectedModule("Part-B")}
              className={`px-3.5 py-1.5 rounded-xl whitespace-nowrap transition cursor-pointer text-xs font-black flex items-center gap-1.5 ${
                selectedModule === "Part-B" 
                  ? "bg-indigo-500 text-white shadow-md shadow-indigo-500/30 ring-2 ring-indigo-400" 
                  : "bg-slate-800 text-indigo-300 hover:bg-slate-700"
              }`}
            >
              <span>Part B: {selectedSubject} Track</span>
              <span className="px-1.5 py-0.5 rounded-md text-[10px] bg-indigo-900/50 text-indigo-200">
                {partBCount || 40} Qs
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* FINAL ASSESSMENT SCORECARD (REVEALED IN THE END UPON SUBMITTING)           */}
      {/* ========================================================================= */}
      {isSubmitted && (
        <div className="bg-white rounded-3xl border-2 border-indigo-200 p-6 sm:p-8 text-center space-y-6 shadow-xl animate-in zoom-in-95 duration-300">
          <div className="space-y-2">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-amber-400 to-amber-500 text-slate-950 flex items-center justify-center mx-auto shadow-lg shadow-amber-400/30">
              <Award className="w-9 h-9" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Skill Enhance Practice Completed!
            </h2>
            <p className="text-xs sm:text-sm font-semibold text-slate-600 max-w-xl mx-auto">
              {resultStats.percentage >= 80 
                ? "🌟 Outstanding Pedagogical Mastery! You demonstrated exceptional command over CBSE & NEP classroom standards."
                : resultStats.percentage >= 50
                ? "👍 Good Performance! Review the detailed question-by-question analysis below to master tricky pedagogical concepts."
                : "📚 Practice makes perfect! Carefully analyze the correct answers and pedagogical explanations detailed below."}
            </p>
          </div>

          {/* METRICS GRID */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-emerald-50/80 p-4 rounded-2xl border border-emerald-200 text-center">
              <span className="text-[11px] font-black uppercase tracking-wider text-emerald-700 block">Correct Answers</span>
              <span className="text-2xl sm:text-3xl font-black text-emerald-800">{resultStats.correct}</span>
              <span className="text-[10px] text-emerald-600 font-bold block mt-0.5">+{resultStats.correct} Marks</span>
            </div>

            <div className="bg-rose-50/80 p-4 rounded-2xl border border-rose-200 text-center">
              <span className="text-[11px] font-black uppercase tracking-wider text-rose-700 block">Incorrect Answers</span>
              <span className="text-2xl sm:text-3xl font-black text-rose-800">{resultStats.wrong}</span>
              <span className="text-[10px] text-rose-600 font-bold block mt-0.5">0 Marks</span>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 block">Unanswered</span>
              <span className="text-2xl sm:text-3xl font-black text-slate-700">{resultStats.unanswered}</span>
              <span className="text-[10px] text-slate-400 font-bold block mt-0.5">Skipped</span>
            </div>

            <div className="bg-indigo-50/80 p-4 rounded-2xl border border-indigo-200 text-center">
              <span className="text-[11px] font-black uppercase tracking-wider text-indigo-700 block">Final Percentage</span>
              <span className="text-2xl sm:text-3xl font-black text-indigo-900">{resultStats.percentage}%</span>
              <span className="text-[10px] text-indigo-600 font-bold block mt-0.5">{resultStats.accuracy}% Accuracy</span>
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={handleRetakePractice}
              className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Retake Practice</span>
            </button>

            <a
              href="#questions-review"
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <BookOpen className="w-4 h-4" />
              <span>Review All Answers Below ↓</span>
            </a>
          </div>
        </div>
      )}

      {/* PRACTICE QUESTIONS LIST */}
      <div id="questions-review" className="space-y-4">
        {loading ? (
          <div className="p-12 text-center space-y-3 bg-white rounded-3xl border border-slate-200 shadow-sm">
            <RefreshCw className="w-7 h-7 text-indigo-600 animate-spin mx-auto" />
            <p className="text-xs font-bold text-slate-600">Loading practice questions...</p>
          </div>
        ) : filteredQuestions.length === 0 ? (
          <div className="p-10 text-center bg-white rounded-3xl border border-slate-200 space-y-2">
            <BookOpen className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-xs font-bold text-slate-600">No practice questions found for this filter.</p>
          </div>
        ) : (
          filteredQuestions.map((q, qIdx) => {
            const selectedOpt = selectedAnswers[q.id];
            const isAnswered = selectedOpt !== undefined;
            const isCorrect = selectedOpt === q.correct_answer;

            return (
              <div 
                key={q.id} 
                className={`p-4 sm:p-6 rounded-3xl border shadow-xs space-y-3 transition-all ${
                  isSubmitted 
                    ? isAnswered 
                      ? isCorrect 
                        ? "bg-white border-emerald-200" 
                        : "bg-white border-rose-200"
                      : "bg-white border-slate-200"
                    : isAnswered
                    ? "bg-white border-indigo-200 shadow-sm"
                    : "bg-white border-slate-200"
                }`}
              >
                
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

                  {/* Right Status Badge */}
                  {isSubmitted ? (
                    isAnswered ? (
                      isCorrect ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Correct (+1 Mark)</span>
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black flex items-center gap-1 bg-rose-50 text-rose-700 border border-rose-200">
                          <XCircle className="w-3 h-3 text-rose-600" />
                          <span>Incorrect (0 Marks)</span>
                        </span>
                      )
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500 border border-slate-200">
                        Unanswered
                      </span>
                    )
                  ) : isAnswered ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                      Answer Selected
                    </span>
                  ) : null}
                </div>

                {/* Question Stem */}
                <div className="text-xs sm:text-sm font-bold text-slate-900 leading-relaxed">
                  <Markdown content={cleanQuestionText(q.question_text)} />
                </div>

                {/* 4 Options */}
                <div className="space-y-2">
                  {q.options?.map((opt: string, optIdx: number) => {
                    const isSelected = selectedOpt === optIdx;

                    let optionStyle = "bg-white border-slate-200 hover:border-indigo-300 hover:bg-slate-50/50";
                    let badgeLabel: string | null = null;
                    let badgeClass = "";

                    if (!isSubmitted) {
                      // IN PRACTICE MODE: NO RIGHT/WRONG FEEDBACK
                      if (isSelected) {
                        optionStyle = "bg-indigo-50 border-indigo-500 text-indigo-950 font-bold shadow-xs ring-2 ring-indigo-500/30";
                        badgeLabel = "Selected";
                        badgeClass = "bg-indigo-600 text-white font-black";
                      }
                    } else {
                      // IN RESULTS MODE: REVEAL WRITE & WRONG
                      if (optIdx === q.correct_answer) {
                        optionStyle = "bg-emerald-50 border-emerald-500 text-emerald-950 font-bold ring-2 ring-emerald-500/40 shadow-xs";
                        badgeLabel = isSelected ? "✓ Your Answer (Correct)" : "✓ Correct Answer";
                        badgeClass = "bg-emerald-600 text-white font-black";
                      } else if (isSelected) {
                        optionStyle = "bg-rose-50 border-rose-400 text-rose-950 font-bold ring-2 ring-rose-400/40";
                        badgeLabel = "✗ Your Answer (Incorrect)";
                        badgeClass = "bg-rose-600 text-white font-black";
                      } else {
                        optionStyle = "bg-slate-50/60 border-slate-200 text-slate-500 opacity-60";
                      }
                    }

                    return (
                      <div
                        key={optIdx}
                        onClick={() => !isSubmitted && handleSelectOption(q.id, optIdx)}
                        className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-2.5 ${
                          !isSubmitted ? "cursor-pointer active:scale-98" : "cursor-default"
                        } ${optionStyle}`}
                      >
                        <div className="flex items-center gap-2.5 flex-1">
                          <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black shrink-0 ${
                            isSubmitted 
                              ? optIdx === q.correct_answer 
                                ? "bg-emerald-600 text-white" 
                                : isSelected 
                                ? "bg-rose-600 text-white" 
                                : "bg-slate-100 text-slate-600"
                              : isSelected 
                              ? "bg-indigo-600 text-white" 
                              : "bg-slate-100 text-slate-600"
                          }`}>
                            {String.fromCharCode(65 + optIdx)}
                          </div>
                          <div className="text-xs font-medium leading-relaxed">
                            <Markdown content={opt} />
                          </div>
                        </div>

                        {badgeLabel && (
                          <span className={`px-2 py-0.5 rounded-md text-[10px] shrink-0 ${badgeClass}`}>
                            {badgeLabel}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Pedagogical Explanation (Revealed ONLY at the end upon submission) */}
                {isSubmitted && (
                  <div className="p-3.5 bg-indigo-50/80 rounded-2xl border border-indigo-100 space-y-1 animate-in fade-in duration-200">
                    <div className="flex items-center gap-1.5 text-xs font-black text-indigo-900">
                      <HelpCircle className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                      <span>Pedagogical Analysis &amp; Explanation:</span>
                    </div>
                    <div className="text-xs text-slate-800 leading-relaxed font-medium">
                      <Markdown content={q.explanation || "Standard CBSE/NCERT curriculum and pedagogical concept benchmark."} />
                    </div>
                  </div>
                )}

              </div>
            );
          })
        )}
      </div>

      {/* ========================================================================= */}
      {/* STICKY BOTTOM ACTION BAR (IN PRACTICE MODE WHILE ANSWERING)                */}
      {/* ========================================================================= */}
      {!isSubmitted && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30 max-w-xl w-[92%] bg-slate-900/95 backdrop-blur-md text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center justify-between gap-4 border border-slate-700 animate-in slide-in-from-bottom duration-300">
          <div className="space-y-1">
            <p className="text-xs font-extrabold text-white flex items-center gap-1.5">
              <span>{totalAnswered} of {filteredQuestions.length} Answered</span>
            </p>
            <div className="w-28 sm:w-44 h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-indigo-400 transition-all duration-300"
                style={{ width: `${filteredQuestions.length > 0 ? (totalAnswered / filteredQuestions.length) * 100 : 0}%` }}
              />
            </div>
          </div>

          <button
            onClick={handleSubmitPractice}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <Award className="w-4 h-4 text-amber-300" />
            <span>Submit &amp; View Results</span>
          </button>
        </div>
      )}

    </div>
  );
}
