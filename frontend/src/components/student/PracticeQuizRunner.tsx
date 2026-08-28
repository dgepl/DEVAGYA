"use client";

import { useState, useRef } from "react";
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
  Upload,
  FileText,
  X,
  Gauge,
  Flame,
  Check,
  Zap
} from "lucide-react";
import { generatePracticeQuizFromFile } from "@/lib/api";

const CLASS_OPTIONS = [
  "Nursery / KG",
  "Class 1", "Class 2", "Class 3", "Class 4", "Class 5",
  "Class 6", "Class 7", "Class 8", "Class 9", "Class 10",
  "Class 11", "Class 12", "College / Competitive Exam"
];

const DIFFICULTY_LEVELS = [
  { label: "Easy", desc: "Basic recall & core definitions", color: "bg-emerald-50 text-emerald-700 border-emerald-300 active:bg-emerald-500", selectedBg: "bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-200" },
  { label: "Medium", desc: "Standard NCERT concepts & application", color: "bg-amber-50 text-amber-700 border-amber-300 active:bg-amber-500", selectedBg: "bg-amber-500 text-white border-amber-500 shadow-md shadow-amber-200" },
  { label: "Hard", desc: "Challenging analytical & Board level", color: "bg-rose-50 text-rose-700 border-rose-300 active:bg-rose-500", selectedBg: "bg-rose-600 text-white border-rose-600 shadow-md shadow-rose-200" }
];

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
  const [selectedClass, setSelectedClass] = useState("Class 10");
  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("Medium");
  const [numQuestions, setNumQuestions] = useState(5);
  
  // Attachment state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Quiz execution state
  const [quizStarted, setQuizStarted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [showHint, setShowHint] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [quiz, setQuiz] = useState<{ title: string; questions: QuizQuestion[] } | null>(null);
  const [error, setError] = useState("");

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);

    if (file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleGenerateQuiz = async () => {
    setLoading(true);
    setError("");
    setResult(null);
    setCurrentIdx(0);
    setUserAnswers({});
    setShowHint(false);

    try {
      const formData = new FormData();
      if (selectedFile) {
        formData.append("file", selectedFile);
      }
      formData.append("student_class", selectedClass || "Class 10");
      formData.append("subject", subject || "General Knowledge");
      formData.append("topic", topic || "");
      formData.append("difficulty", difficulty || "Medium");
      formData.append("num_questions", String(numQuestions));

      const data = await generatePracticeQuizFromFile(formData);
      if (data.questions && data.questions.length > 0) {
        setQuiz({
          title: `${selectedClass} ${subject || "Practice"} Quiz (${difficulty})`,
          questions: data.questions.map((q: any, i: number) => {
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
              explanation: q.explanation || "Based on standard NCERT concepts.",
              hint: q.hint || "Refer to core chapter definitions.",
            };
          }),
        });
        setQuizStarted(true);
      } else {
        setError(data.detail || data.error || "Could not generate quiz. Try adjusting your settings.");
      }
    } catch (e: any) {
      console.error(e);
      setError(`Failed to generate quiz: ${e.message || "Please try again."}`);
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
      <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-500">
        
        {/* HEADER */}
        <div className="bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-700 text-white p-8 rounded-3xl shadow-2xl">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center backdrop-blur-sm border border-white/20 shadow-inner">
              <Target className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold">Practice & AI Quizzes</h1>
              <p className="text-emerald-100 text-xs sm:text-sm">
                Generate custom quizzes from your uploaded worksheets, textbook photos, or CBSE/NCERT topics!
              </p>
            </div>
          </div>
        </div>

        {/* SETUP CARD */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
          
          <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Sparkles className="w-5 h-5 text-amber-500" />
            Configure Custom AI Quiz
          </h2>

          {/* 1. UPLOAD ATTACHMENT (WORKSHEET / PHOTO / PDF) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Upload className="w-4 h-4 text-emerald-600" /> Upload Worksheet, PDF, or Photo (Optional)
              </span>
              <span className="text-[10px] text-slate-400 font-semibold">PDF, DOCX, TXT, PNG, JPG</span>
            </label>

            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.doc,.txt,image/*"
              onChange={handleFileSelect}
              className="hidden"
            />

            {!selectedFile ? (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-3.5 px-4 bg-slate-50 hover:bg-emerald-50/60 border-2 border-dashed border-slate-300 hover:border-emerald-400 rounded-2xl text-xs font-bold text-slate-600 hover:text-emerald-700 transition-all flex items-center justify-center gap-2.5 group"
              >
                <Upload className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-colors" />
                <span>Upload Textbook Photo, PDF Worksheet or Notes to generate questions</span>
              </button>
            ) : (
              <div className="flex items-center justify-between p-3 bg-emerald-50/80 border border-emerald-200 rounded-2xl">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {previewUrl ? (
                    <img src={previewUrl} alt="Preview" className="w-10 h-10 object-cover rounded-xl border border-emerald-300 shrink-0" />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-red-100 border border-red-200 flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5 text-red-600" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-900 truncate">{selectedFile.name}</p>
                    <p className="text-[10px] text-slate-500 font-medium">{formatFileSize(selectedFile.size)}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={removeFile}
                  className="p-1.5 hover:bg-emerald-200 text-emerald-800 rounded-xl transition-colors ml-2 shrink-0"
                  title="Remove attachment"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* 2. CLASS & SUBJECT INPUTS */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* CLASS SELECTOR */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-indigo-500" /> Target Class
              </label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
              >
                {CLASS_OPTIONS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* SUBJECT */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-emerald-500" /> Subject (Optional)
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Science, Mathematics, History"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
              />
            </div>

            {/* TOPIC / CHAPTER */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-500" /> Topic / Chapter (Optional)
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Acids & Bases, Polynomials"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
              />
            </div>
          </div>

          {/* 3. DIFFICULTY LEVEL SELECTOR (EASY, MEDIUM, HARD) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
              <Gauge className="w-4 h-4 text-rose-500" /> Select Difficulty Level
            </label>
            <div className="grid grid-cols-3 gap-3">
              {DIFFICULTY_LEVELS.map((lvl) => {
                const isSelected = difficulty === lvl.label;
                return (
                  <button
                    key={lvl.label}
                    type="button"
                    onClick={() => setDifficulty(lvl.label)}
                    className={`p-3.5 rounded-2xl text-left transition-all border ${
                      isSelected ? lvl.selectedBg : `${lvl.color} hover:shadow-sm`
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-black">{lvl.label}</span>
                      {isSelected && <Check className="w-4 h-4 text-white" />}
                    </div>
                    <p className={`text-[10px] mt-1 font-medium ${isSelected ? "text-white/90" : "opacity-80"}`}>
                      {lvl.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. NUMBER OF QUESTIONS SELECTOR */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
              <Hash className="w-4 h-4 text-violet-500" /> Number of Questions
            </label>
            <div className="flex items-center gap-2">
              {[3, 5, 8, 10, 15, 20].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setNumQuestions(n)}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all border ${
                    numQuestions === n
                      ? "bg-violet-600 text-white border-violet-600 shadow-md shadow-violet-200"
                      : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {n}
                </button>
              ))}
              <input
                type="number"
                min={1}
                max={25}
                value={numQuestions}
                onChange={(e) => setNumQuestions(Math.max(1, Math.min(25, Number(e.target.value) || 5)))}
                className="w-16 bg-slate-50 border border-slate-200 rounded-xl px-2 py-2 text-xs font-black text-center text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                title="Custom Question Count"
              />
            </div>
          </div>

          {/* ERROR DISPLAY */}
          {error && (
            <p className="text-xs text-rose-600 font-bold bg-rose-50 p-3 rounded-xl border border-rose-200">
              ⚠️ {error}
            </p>
          )}

          {/* GENERATE BUTTON */}
          <button
            onClick={handleGenerateQuiz}
            disabled={loading}
            className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-emerald-200 transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Creating {numQuestions} Questions Quiz ({difficulty})...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Start {numQuestions} Question Quiz ({difficulty})</span>
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  // ────────── RESULT VIEW ──────────
  if (result) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500">
        <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center space-y-4 shadow-xl">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto text-2xl font-black">
            🏆
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900">Quiz Completed!</h2>
          <p className="text-slate-600 text-sm font-semibold">{result.feedback}</p>

          <div className="grid grid-cols-3 gap-4 pt-4">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <span className="text-xs font-bold text-slate-500 block">Score</span>
              <span className="text-2xl font-black text-slate-900">{result.score} / {result.total}</span>
            </div>
            <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200">
              <span className="text-xs font-bold text-emerald-700 block">Percentage</span>
              <span className="text-2xl font-black text-emerald-700">{result.percentage}%</span>
            </div>
            <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200">
              <span className="text-xs font-bold text-amber-700 block">XP Earned</span>
              <span className="text-2xl font-black text-amber-700">+{result.xp_earned} XP</span>
            </div>
          </div>

          {/* Breakdown */}
          <div className="space-y-3 pt-6 text-left border-t border-slate-100">
            <h3 className="text-sm font-extrabold text-slate-900">Question Analysis</h3>
            {result.breakdown.map((item: any, idx: number) => (
              <div
                key={idx}
                className={`p-4 rounded-2xl border text-xs space-y-1.5 ${
                  item.is_correct ? "bg-emerald-50/60 border-emerald-200" : "bg-rose-50/60 border-rose-200"
                }`}
              >
                <div className="flex items-start justify-between gap-2 font-bold text-slate-900">
                  <span>Q{idx + 1}. {item.question}</span>
                  {item.is_correct ? (
                    <span className="text-emerald-600 font-extrabold shrink-0">✓ Correct</span>
                  ) : (
                    <span className="text-rose-600 font-extrabold shrink-0">✗ Incorrect</span>
                  )}
                </div>
                <div className="text-slate-600">
                  <span className="font-semibold">Your Answer:</span> {item.user_answer}
                </div>
                {!item.is_correct && (
                  <div className="text-emerald-700 font-bold">
                    <span>Correct Answer:</span> {item.correct_answer}
                  </div>
                )}
                <p className="text-slate-500 text-[11px] font-medium pt-1 italic">
                  💡 {item.explanation}
                </p>
              </div>
            ))}
          </div>

          <button
            onClick={resetQuiz}
            className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 mt-4"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Take Another Quiz</span>
          </button>
        </div>
      </div>
    );
  }

  // ────────── QUIZ RUNNER VIEW ──────────
  const currentQ = quiz.questions[currentIdx];
  const selectedAns = userAnswers[currentQ.id.toString()];

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500">
      
      {/* Header bar */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <span className="text-xs font-extrabold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            {quiz.title}
          </span>
        </div>
        <button
          onClick={resetQuiz}
          className="text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
        >
          Exit Quiz
        </button>
      </div>

      {/* Question Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between text-xs font-extrabold text-slate-400">
          <span>Question {currentIdx + 1} of {quiz.questions.length}</span>
          <span>{Math.round(((currentIdx + 1) / quiz.questions.length) * 100)}% Complete</span>
        </div>

        {/* Question Text */}
        <h2 className="text-base sm:text-lg font-black text-slate-900 leading-relaxed">
          {currentQ.question}
        </h2>

        {/* Hint Box */}
        {showHint && currentQ.hint && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 font-semibold animate-in fade-in">
            💡 <span className="font-extrabold">Hint:</span> {currentQ.hint}
          </div>
        )}

        {/* Options */}
        <div className="space-y-3">
          {currentQ.options.map((opt, i) => {
            const isSelected = selectedAns === opt;
            return (
              <button
                key={i}
                onClick={() => handleSelectOption(currentQ.id, opt)}
                className={`w-full p-4 rounded-2xl text-left text-xs font-extrabold transition-all border flex items-center justify-between ${
                  isSelected
                    ? "bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-200"
                    : "bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100 hover:border-slate-300"
                }`}
              >
                <span>{opt}</span>
                {isSelected && <CheckCircle2 className="w-4 h-4 text-white shrink-0" />}
              </button>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <button
            onClick={() => setShowHint(!showHint)}
            className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1"
          >
            <HelpCircle className="w-4 h-4" />
            <span>{showHint ? "Hide Hint" : "Need a Hint?"}</span>
          </button>

          <div className="flex items-center gap-2">
            {currentIdx > 0 && (
              <button
                onClick={() => setCurrentIdx((prev) => prev - 1)}
                className="px-4 py-2 bg-slate-100 text-slate-700 font-extrabold text-xs rounded-xl hover:bg-slate-200 transition-colors"
              >
                Previous
              </button>
            )}

            {currentIdx < quiz.questions.length - 1 ? (
              <button
                onClick={() => {
                  setShowHint(false);
                  setCurrentIdx((prev) => prev + 1);
                }}
                className="px-5 py-2 bg-emerald-600 text-white font-extrabold text-xs rounded-xl hover:bg-emerald-700 transition-colors flex items-center gap-1 shadow-md"
              >
                <span>Next Question</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmitQuiz}
                disabled={submitting}
                className="px-6 py-2.5 bg-slate-900 text-white font-extrabold text-xs rounded-xl hover:bg-slate-800 transition-colors shadow-lg flex items-center gap-2"
              >
                <Award className="w-4 h-4 text-amber-400" />
                <span>Submit Quiz</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
