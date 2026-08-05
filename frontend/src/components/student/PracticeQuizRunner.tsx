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
  BookOpen,
  GraduationCap,
  Hash,
} from "lucide-react";

// CBSE Class-Subject mapping
const CLASS_SUBJECTS: Record<string, string[]> = {
  "6": ["Mathematics", "Science", "Social Science", "English", "Hindi"],
  "7": ["Mathematics", "Science", "Social Science", "English", "Hindi"],
  "8": ["Mathematics", "Science", "Social Science", "English", "Hindi"],
  "9": ["Mathematics", "Science", "Social Science", "English", "Hindi", "Computer Science"],
  "10": ["Mathematics", "Science", "Social Science", "English", "Hindi", "Computer Science"],
  "11": ["Physics", "Chemistry", "Mathematics", "Biology", "English", "Computer Science", "Accountancy", "Economics", "Business Studies"],
  "12": ["Physics", "Chemistry", "Mathematics", "Biology", "English", "Computer Science", "Accountancy", "Economics", "Business Studies"],
};

const QUESTION_COUNTS = [5, 10, 15, 20, 25];

interface QuizQuestion {
  id: number;
  question_type: string;
  question: string;
  options: string[];
  correct_answer: string;
  explanation: string;
  hint: string;
}

export function PracticeQuizRunner() {
  // Setup state
  const [selectedClass, setSelectedClass] = useState("");
  const [subject, setSubject] = useState("");
  const [numQuestions, setNumQuestions] = useState(5);
  const [quizStarted, setQuizStarted] = useState(false);

  // Quiz state
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [showHint, setShowHint] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [quiz, setQuiz] = useState<{ title: string; questions: QuizQuestion[] } | null>(null);
  const [error, setError] = useState("");

  const availableSubjects = selectedClass ? CLASS_SUBJECTS[selectedClass] || [] : [];

  const handleGenerateQuiz = async () => {
    if (!selectedClass || !subject) return;
    setLoading(true);
    setError("");
    setResult(null);
    setCurrentIdx(0);
    setUserAnswers({});
    setShowHint(false);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api/v1";
      const res = await fetch(`${baseUrl}/student/practice-quiz`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject,
          topic: `CBSE Class ${selectedClass} ${subject} — General NCERT syllabus topics`,
          difficulty: "Medium",
          num_questions: numQuestions,
        }),
      });
      const data = await res.json();
      if (data.questions && data.questions.length > 0) {
        setQuiz({
          title: `Class ${selectedClass} ${subject} Quiz`,
          questions: data.questions.map((q: any, i: number) => {
            // Derive correct answer: prefer correct_answer string, fallback to options[correct_option]
            let correctAns = "";
            if (q.correct_answer) {
              correctAns = q.correct_answer;
            } else if (typeof q.correct_option === "number" && q.options) {
              correctAns = q.options[q.correct_option] || q.options[0] || "";
            } else if (q.options) {
              correctAns = q.options[0] || "";
            }
            return {
              id: i + 1,
              question_type: q.question_type || "mcq",
              question: q.question,
              options: q.options || ["Option A", "Option B", "Option C", "Option D"],
              correct_answer: correctAns,
              explanation: q.explanation || "Based on NCERT concepts.",
              hint: q.hint || "Refer to your NCERT textbook.",
            };
          }),
        });
        setQuizStarted(true);
      } else {
        setError(data.detail || data.error || "Could not generate quiz. Try fewer questions or a different subject.");
      }
    } catch (e: any) {
      console.error(e);
      setError(`Failed to connect: ${e.message || "Please try again."}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (qid: number, option: string) => {
    setUserAnswers((prev) => ({ ...prev, [qid.toString()]: option }));
  };

  const handleSubmitQuiz = () => {
    if (!quiz) return;
    setSubmitting(true);
    // Client-side evaluation
    let score = 0;
    const breakdown = quiz.questions.map((q) => {
      const userAns = userAnswers[q.id.toString()] || "(Not answered)";
      const isCorrect = userAns === q.correct_answer;
      if (isCorrect) score++;
      return {
        question: q.question,
        user_answer: userAns,
        correct_answer: q.correct_answer,
        is_correct: isCorrect,
        explanation: q.explanation,
      };
    });
    const total = quiz.questions.length;
    const percentage = Math.round((score / total) * 100);
    setResult({
      score,
      total,
      percentage,
      feedback: percentage >= 80 ? "Excellent! You've mastered this topic! 🎉" : percentage >= 50 ? "Good effort! Review the mistakes and try again. 💪" : "Keep practicing! Focus on the concepts explained below. 📖",
      xp_earned: score * 10,
      breakdown,
    });
    setSubmitting(false);
  };

  const resetQuiz = () => {
    setQuizStarted(false);
    setQuiz(null);
    setResult(null);
    setCurrentIdx(0);
    setUserAnswers({});
    setShowHint(false);
    setError("");
  };

  // ────────── SETUP FORM ──────────
  if (!quizStarted || !quiz) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500">
        {/* Header */}
        <div className="bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-700 text-white p-8 rounded-3xl shadow-2xl">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center backdrop-blur-sm border border-white/20">
              <Target className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold">Practice & Quizzes</h1>
              <p className="text-emerald-100 text-sm">AI-generated quizzes based on CBSE/NCERT syllabus</p>
            </div>
          </div>
        </div>

        {/* Setup Card */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
          <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            Configure Your Quiz
          </h2>

          {/* Class Selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4 text-indigo-500" />
              Select Class
            </label>
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
              {Object.keys(CLASS_SUBJECTS).map((cls) => (
                <button
                  key={cls}
                  onClick={() => {
                    setSelectedClass(cls);
                    setSubject("");
                  }}
                  className={`py-2.5 rounded-xl text-sm font-bold transition-all border ${
                    selectedClass === cls
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-md"
                      : "bg-slate-50 text-slate-700 border-slate-200 hover:border-indigo-300 hover:bg-indigo-50"
                  }`}
                >
                  {cls}
                </button>
              ))}
            </div>
          </div>

          {/* Subject Selection */}
          {selectedClass && (
            <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-emerald-500" />
                Select Subject
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {availableSubjects.map((sub) => (
                  <button
                    key={sub}
                    onClick={() => setSubject(sub)}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all border ${
                      subject === sub
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-md"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50"
                    }`}
                  >
                    {sub}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Number of Questions */}
          {subject && (
            <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Hash className="w-4 h-4 text-violet-500" />
                Number of Questions
              </label>
              <div className="flex gap-2">
                {QUESTION_COUNTS.map((n) => (
                  <button
                    key={n}
                    onClick={() => setNumQuestions(n)}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all border ${
                      numQuestions === n
                        ? "bg-violet-600 text-white border-violet-600 shadow-md"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:border-violet-300 hover:bg-violet-50"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <p className="text-xs text-rose-600 font-bold bg-rose-50 p-3 rounded-xl border border-rose-200">
              ⚠️ {error}
            </p>
          )}

          {/* Generate Button */}
          <button
            onClick={handleGenerateQuiz}
            disabled={!selectedClass || !subject || loading}
            className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm rounded-2xl shadow-lg shadow-emerald-200 transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Generating Quiz...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-300" />
                Generate AI Quiz
              </>
            )}
          </button>

          {/* Summary */}
          {selectedClass && subject && (
            <p className="text-center text-xs text-slate-400 font-semibold">
              Class {selectedClass} • {subject} • {numQuestions} Questions • CBSE/NCERT
            </p>
          )}
        </div>
      </div>
    );
  }

  // ────────── RESULT VIEW ──────────
  const currentQ = quiz.questions[currentIdx];

  if (result) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-500">
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl space-y-6">
          <div className="text-center space-y-3">
            <div className="w-20 h-20 mx-auto rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center border-4 border-emerald-200">
              <Award className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900">Quiz Completed!</h2>
            <p className="text-sm font-bold text-slate-600">{result.feedback}</p>

            <div className="flex items-center justify-center gap-4 pt-2">
              <div className="bg-emerald-50 border border-emerald-200 px-6 py-3 rounded-2xl text-center">
                <div className="text-xs text-emerald-700 font-bold uppercase">Score</div>
                <div className="text-2xl font-black text-emerald-900">
                  {result.score} / {result.total} ({result.percentage}%)
                </div>
              </div>
              <div className="bg-amber-50 border border-amber-200 px-6 py-3 rounded-2xl text-center">
                <div className="text-xs text-amber-700 font-bold uppercase">XP Earned</div>
                <div className="text-2xl font-black text-amber-900">+{result.xp_earned} XP</div>
              </div>
            </div>
          </div>

          {/* Detailed Breakdown */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h3 className="text-sm font-extrabold text-slate-900">Detailed Solution Breakdown:</h3>
            {result.breakdown?.map((item: any, idx: number) => (
              <div
                key={idx}
                className={`p-4 rounded-2xl border ${
                  item.is_correct ? "bg-emerald-50/40 border-emerald-200" : "bg-rose-50/40 border-rose-200"
                } space-y-2`}
              >
                <div className="flex items-start justify-between text-xs font-bold gap-2">
                  <span className="text-slate-900 flex-1">Q{idx + 1}. {item.question}</span>
                  {item.is_correct ? (
                    <span className="text-emerald-700 flex items-center gap-1 shrink-0">
                      <CheckCircle2 className="w-4 h-4" /> Correct
                    </span>
                  ) : (
                    <span className="text-rose-700 flex items-center gap-1 shrink-0">
                      <XCircle className="w-4 h-4" /> Incorrect
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-600">
                  Your Answer: <span className="font-bold">{item.user_answer}</span>
                </p>
                <p className="text-xs text-emerald-700">
                  Correct Answer: <span className="font-bold">{item.correct_answer}</span>
                </p>
                <p className="text-xs text-slate-500 bg-white p-2.5 rounded-xl border border-slate-200 mt-1">
                  💡 <span className="font-bold text-slate-800">Explanation:</span> {item.explanation}
                </p>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <button
              onClick={resetQuiz}
              className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-2xl transition-all flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              New Quiz
            </button>
            <button
              onClick={() => {
                setResult(null);
                setCurrentIdx(0);
                setUserAnswers({});
              }}
              className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-2xl shadow-md transition-all flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Retake Same Quiz
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ────────── QUIZ RUNNER ──────────
  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-500">
      {/* Quiz Info Bar */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-2xl px-4 py-2.5 flex items-center justify-between">
        <span className="text-xs font-bold text-indigo-700">
          Class {selectedClass} • {subject} • {quiz.questions.length} Questions
        </span>
        <button
          onClick={resetQuiz}
          className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
        >
          ✕ Exit Quiz
        </button>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        {/* Progress Bar */}
        <div className="flex items-center justify-between text-xs font-bold text-slate-500">
          <span>Question {currentIdx + 1} of {quiz.questions.length}</span>
          <span className="uppercase text-emerald-600 font-extrabold bg-emerald-50 px-2 py-0.5 rounded-md">
            {currentQ.question_type.replace("_", " ")}
          </span>
        </div>
        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="bg-emerald-600 h-full transition-all duration-300"
            style={{ width: `${((currentIdx + 1) / quiz.questions.length) * 100}%` }}
          />
        </div>

        {/* Question */}
        <div className="space-y-2">
          <h2 className="text-base sm:text-lg font-extrabold text-slate-900 leading-snug whitespace-pre-line">
            {currentQ.question}
          </h2>
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

        {/* Options */}
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
                <div
                  className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                    isSelected ? "bg-emerald-600 border-emerald-600 text-white" : "border-slate-300"
                  }`}
                >
                  {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                </div>
              </button>
            );
          })}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <button
            onClick={() => setCurrentIdx((prev) => Math.max(0, prev - 1))}
            disabled={currentIdx === 0}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 font-bold text-xs rounded-xl transition-colors"
          >
            Previous
          </button>

          {currentIdx < quiz.questions.length - 1 ? (
            <button
              onClick={() => {
                setShowHint(false);
                setCurrentIdx((prev) => prev + 1);
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
              <span>Submit Quiz</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
