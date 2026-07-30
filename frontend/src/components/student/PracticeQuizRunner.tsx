"use client";

import { useState } from "react";
import { 
  Target, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  Award, 
  RefreshCw, 
  ArrowRight, 
  RotateCcw,
  Zap,
  Flame
} from "lucide-react";
import { generateAdaptiveQuiz, submitQuizAnswers } from "@/lib/api";

export function PracticeQuizRunner() {
  const [subject, setSubject] = useState("Mathematics");
  const [chapter, setChapter] = useState("Quadratic Equations");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [showHint, setShowHint] = useState(false);
  const [result, setResult] = useState<any>(null);

  const [quiz, setQuiz] = useState<any>({
    title: "Practice Quiz: Quadratic Equations",
    questions: [
      {
        id: 1,
        question_type: "mcq",
        question: "What is the discriminant of a quadratic equation ax^2 + bx + c = 0?",
        options: ["b^2 - 4ac", "b^2 + 4ac", "2a / b", "b - a"],
        correct_answer: "b^2 - 4ac",
        explanation: "The discriminant D = b^2 - 4ac dictates the nature of roots.",
        hint: "Look for the expression under the square root sign in the quadratic formula."
      },
      {
        id: 2,
        question_type: "assertion_reason",
        question: "Assertion (A): Real roots exist if D >= 0.\nReason (R): Square root of a negative number is imaginary.",
        options: [
          "Both A and R are true and R is the correct explanation of A",
          "Both A and R are true but R is NOT the correct explanation of A",
          "A is true but R is false",
          "A is false but R is true"
        ],
        correct_answer: "Both A and R are true and R is the correct explanation of A",
        explanation: "Since sqrt(D) is imaginary when D < 0, real roots require D >= 0.",
        hint: "Consider what happens when you take the square root of -4."
      },
      {
        id: 3,
        question_type: "true_false",
        question: "A quadratic equation can have at most three distinct real roots.",
        options: ["True", "False"],
        correct_answer: "False",
        explanation: "By the Fundamental Theorem of Algebra, a degree 2 polynomial has at most 2 roots.",
        hint: "Degree of quadratic polynomial is 2."
      }
    ]
  });

  const handleGenerateNewQuiz = async () => {
    setLoading(true);
    setResult(null);
    setCurrentIdx(0);
    setUserAnswers({});
    try {
      const res = await generateAdaptiveQuiz({
        subject,
        chapter,
        question_types: ["mcq", "assertion_reason", "true_false"],
        num_questions: 5
      });
      setQuiz(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (qid: number, option: string) => {
    setUserAnswers(prev => ({ ...prev, [qid.toString()]: option }));
  };

  const handleSubmitQuiz = async () => {
    setSubmitting(true);
    try {
      const res = await submitQuizAnswers({
        subject,
        chapter,
        answers: userAnswers
      });
      setResult(res);
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const currentQ = quiz.questions[currentIdx];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* HEADER & QUIZ GENERATION SELECTOR */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-200">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900">Adaptive Practice & Quiz Runner</h1>
            <p className="text-xs text-slate-500">Supports MCQs, Assertion & Reason, Case Studies & Short Questions.</p>
          </div>
        </div>

        <button
          onClick={handleGenerateNewQuiz}
          disabled={loading}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-2xl shadow-md transition-all flex items-center gap-1.5 shrink-0"
        >
          {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-amber-300" />}
          <span>Generate AI Quiz</span>
        </button>
      </div>

      {/* RESULT VIEW AFTER QUIZ SUBMISSION */}
      {result ? (
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl space-y-6 animate-in zoom-in-95 duration-300">
          <div className="text-center space-y-3">
            <div className="w-20 h-20 mx-auto rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center border-4 border-emerald-200">
              <Award className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900">Quiz Completed!</h2>
            <p className="text-sm font-bold text-slate-600">{result.feedback}</p>

            <div className="flex items-center justify-center gap-4 pt-2">
              <div className="bg-emerald-50 border border-emerald-200 px-6 py-3 rounded-2xl text-center">
                <div className="text-xs text-emerald-700 font-bold uppercase">Score</div>
                <div className="text-2xl font-black text-emerald-900">{result.score} / {result.total} ({result.percentage}%)</div>
              </div>
              <div className="bg-amber-50 border border-amber-200 px-6 py-3 rounded-2xl text-center">
                <div className="text-xs text-amber-700 font-bold uppercase">XP Earned</div>
                <div className="text-2xl font-black text-amber-900">+{result.xp_earned} XP</div>
              </div>
            </div>
          </div>

          {/* DETAILED QUESTION BREAKDOWN */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h3 className="text-sm font-extrabold text-slate-900">Detailed Solution Breakdown:</h3>
            {result.breakdown?.map((item: any, idx: number) => (
              <div 
                key={idx} 
                className={`p-4 rounded-2xl border ${
                  item.is_correct ? "bg-emerald-50/40 border-emerald-200" : "bg-rose-50/40 border-rose-200"
                } space-y-2`}
              >
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-900">Q{idx + 1}. {item.question}</span>
                  {item.is_correct ? (
                    <span className="text-emerald-700 flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> Correct</span>
                  ) : (
                    <span className="text-rose-700 flex items-center gap-1"><XCircle className="w-4 h-4" /> Incorrect</span>
                  )}
                </div>
                <p className="text-xs text-slate-600">Your Answer: <span className="font-bold">{item.user_answer}</span></p>
                <p className="text-xs text-emerald-700">Correct Answer: <span className="font-bold">{item.correct_answer}</span></p>
                <p className="text-xs text-slate-500 bg-white p-2.5 rounded-xl border border-slate-200 mt-1">
                  💡 <span className="font-bold text-slate-800">Explanation:</span> {item.explanation}
                </p>
              </div>
            ))}
          </div>

          <button
            onClick={() => setResult(null)}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-2xl shadow-md transition-all flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Retake or Try Another Practice Quiz</span>
          </button>
        </div>
      ) : (
        /* ACTIVE QUIZ QUESTION RUNNER */
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          
          {/* PROGRESS BAR */}
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span>Question {currentIdx + 1} of {quiz.questions.length}</span>
            <span className="uppercase text-emerald-600 font-extrabold bg-emerald-50 px-2 py-0.5 rounded-md">
              {currentQ.question_type.replace('_', ' ')}
            </span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div 
              className="bg-emerald-600 h-full transition-all duration-300" 
              style={{ width: `${((currentIdx + 1) / quiz.questions.length) * 100}%` }}
            />
          </div>

          {/* QUESTION TEXT */}
          <div className="space-y-2">
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900 leading-snug">
              {currentQ.question}
            </h2>

            {/* HINT BUTTON */}
            {currentQ.hint && (
              <div>
                <button
                  onClick={() => setShowHint(!showHint)}
                  className="text-xs font-bold text-amber-600 hover:underline flex items-center gap-1 mt-1"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>{showHint ? "Hide Hint" : "Need a Hint?"}</span>
                </button>
                {showHint && (
                  <p className="text-xs text-amber-900 bg-amber-50 p-3 rounded-xl border border-amber-200 mt-2">
                    💡 <span className="font-bold">Hint:</span> {currentQ.hint}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* OPTIONS LIST */}
          <div className="space-y-3">
            {currentQ.options?.map((opt: string, optIdx: number) => {
              const isSelected = userAnswers[currentQ.id.toString()] === opt;
              return (
                <button
                  key={optIdx}
                  onClick={() => handleSelectOption(currentQ.id, opt)}
                  className={`w-full text-left p-4 rounded-2xl border text-xs font-bold transition-all flex items-center justify-between ${
                    isSelected
                      ? "bg-emerald-50 border-emerald-500 text-emerald-950 shadow-sm"
                      : "bg-slate-50/50 border-slate-200 text-slate-800 hover:bg-slate-100"
                  }`}
                >
                  <span>{opt}</span>
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                    isSelected ? "bg-emerald-600 border-emerald-600 text-white" : "border-slate-300"
                  }`}>
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                  </div>
                </button>
              );
            })}
          </div>

          {/* NAVIGATION BUTTONS */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              onClick={() => setCurrentIdx(prev => Math.max(0, prev - 1))}
              disabled={currentIdx === 0}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 font-bold text-xs rounded-xl transition-colors"
            >
              Previous
            </button>

            {currentIdx < quiz.questions.length - 1 ? (
              <button
                onClick={() => {
                  setShowHint(false);
                  setCurrentIdx(prev => prev + 1);
                }}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-all shadow-md flex items-center gap-1.5"
              >
                <span>Next Question</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmitQuiz}
                disabled={submitting}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all shadow-lg flex items-center gap-1.5"
              >
                {submitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Award className="w-4 h-4" />}
                <span>Submit Quiz for Evaluation</span>
              </button>
            )}
          </div>

        </div>
      )}

    </div>
  );
}
