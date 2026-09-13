"use client";

import { useState, useMemo } from "react";
import { 
  Trophy, 
  Sparkles, 
  Target, 
  Calendar, 
  CheckCircle2, 
  RefreshCw, 
  HelpCircle,
  BookOpen,
  X,
  ChevronRight,
  AlertTriangle,
  ArrowRight,
  GraduationCap,
  Zap,
  Flame,
  Clock,
  ChevronDown,
  Layers,
  Lightbulb,
  Check
} from "lucide-react";
import Markdown from "@/components/chat/Markdown";
import { CBSE_NCERT_CURRICULUM } from "@/lib/cbseNcertCurriculum";
import { getApiBase } from "@/lib/api";

const CLASS_OPTIONS = Object.keys(CBSE_NCERT_CURRICULUM);
const PRESET_DAYS = [7, 14, 30, 60];

export function ExamPrepStudio() {
  // Cascading Selection State
  const [selectedClass, setSelectedClass] = useState("Class 10");

  const availableSubjects = useMemo(() => {
    return Object.keys(CBSE_NCERT_CURRICULUM[selectedClass]?.subjects || {});
  }, [selectedClass]);

  const [subject, setSubject] = useState(() => {
    const subjs = Object.keys(CBSE_NCERT_CURRICULUM["Class 10"]?.subjects || {});
    return subjs[0] || "Science";
  });

  const availableChapters = useMemo(() => {
    return CBSE_NCERT_CURRICULUM[selectedClass]?.subjects?.[subject] || [];
  }, [selectedClass, subject]);

  const [selectedChapter, setSelectedChapter] = useState("All High-Yield Chapters / Full Syllabus");
  const [customChapter, setCustomChapter] = useState("");
  const [isCustomChapter, setIsCustomChapter] = useState(false);

  const [examName, setExamName] = useState("CBSE Class 10 Board Exam");
  const [daysRemaining, setDaysRemaining] = useState(14);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Mobile navigation tab state
  const [mobileTab, setMobileTab] = useState<"topics" | "roadmap" | "questions" | "tips">("topics");

  const handleClassChange = (newClass: string) => {
    setSelectedClass(newClass);
    const subjs = Object.keys(CBSE_NCERT_CURRICULUM[newClass]?.subjects || {});
    const nextSubj = subjs.includes(subject) ? subject : (subjs[0] || "");
    setSubject(nextSubj);
    setSelectedChapter("All High-Yield Chapters / Full Syllabus");
    setIsCustomChapter(false);
    setCustomChapter("");
    setExamName(`CBSE ${newClass} Exam`);
  };

  const handleSubjectChange = (newSubj: string) => {
    setSubject(newSubj);
    setSelectedChapter("All High-Yield Chapters / Full Syllabus");
    setIsCustomChapter(false);
    setCustomChapter("");
  };

  const handleChapterChange = (val: string) => {
    if (val === "__custom__") {
      setIsCustomChapter(true);
      setSelectedChapter("");
    } else {
      setIsCustomChapter(false);
      setSelectedChapter(val);
    }
  };

  const effectiveTopic = isCustomChapter ? customChapter.trim() : (selectedChapter || "");

  // Modal / Topic Explanation State
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [explaining, setExplaining] = useState(false);
  const [topicData, setTopicData] = useState<any | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);

  const [examData, setExamData] = useState<any>({
    exam_name: "CBSE Class 10 Board Exam",
    subject: "Science",
    confidence_score: 85,
    high_yield_topics: [
      { topic: "Light - Reflection & Refraction", weightage_marks: 12 },
      { topic: "Chemical Reactions & Acids, Bases", weightage_marks: 15 },
      { topic: "Electricity & Magnetic Effects", weightage_marks: 13 },
      { topic: "Life Processes & Control Coordination", weightage_marks: 14 }
    ],
    revision_roadmap: [
      { day: 1, focus: "Optics numericals & ray diagrams", hours: 3.0 },
      { day: 2, focus: "Balancing chemical equations & salt preparations", hours: 3.5 },
      { day: 3, focus: "Ohm's law circuits & magnetic fields", hours: 4.0 },
      { day: 4, focus: "Human circulatory system & nephron diagrams", hours: 3.5 },
      { day: 5, focus: "Full-length mock exam & formula flashcards", hours: 4.5 }
    ],
    expected_questions: [
      {
        question: "Derive the relation between focal length and radius of curvature of a spherical mirror.",
        marks: 5,
        outline: "Draw neat ray diagram, label geometric points C and F, apply paraxial approximation."
      },
      {
        question: "Why does the color of copper sulphate solution change when an iron nail is dipped in it?",
        marks: 3,
        outline: "Write balanced displacement equation: Fe + CuSO4 -> FeSO4 + Cu. Explain iron's higher reactivity."
      },
      {
        question: "Explain the mechanism of transport of water and minerals in plants through xylem vessels.",
        marks: 4,
        outline: "Transpiration pull theory, root pressure, capillary action, and stomatal suction."
      }
    ],
    top_tips: [
      "Underline key technical terms with pencil in exam answers to guide the evaluator.",
      "Always sketch ray diagrams and circuit schematics with sharp pencil and scale.",
      "Reserve 15 minutes at the end specifically for checking calculation units and powers of 10."
    ]
  });

  const handleGenerate = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${getApiBase()}/student/exam-prep`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          exam_name: examName,
          target_class: selectedClass,
          subject,
          topic: effectiveTopic,
          days_remaining: daysRemaining 
        }),
      });
      const data = await res.json();
      if (data.high_yield_topics) {
        setExamData(data);
      } else {
        setError(data.detail || "Failed to generate strategy. Please try again.");
      }
    } catch (e) {
      console.error(e);
      setError("Connection failed. Make sure backend service is active.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenTopic = async (topicTitle: string) => {
    setSelectedTopic(topicTitle);
    setExplaining(true);
    setTopicData(null);
    setShowAnswer(false);

    try {
      const res = await fetch(`${getApiBase()}/student/explain-topic`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: topicTitle,
          subject: subject || examData.subject || "General",
          exam_name: examName || examData.exam_name || "Board Exam"
        })
      });
      const data = await res.json();
      setTopicData(data);
    } catch (e) {
      console.error("Error fetching topic explanation:", e);
      setTopicData({
        topic: topicTitle,
        title: `Brief AI Guide: ${topicTitle}`,
        summary: `Key concepts, scoring guidelines, and exam revision outline for ${topicTitle}.`,
        key_concepts: [
          "Study key NCERT definitions and fundamental principles.",
          "Practice textbook numericals and diagram labeling."
        ],
        common_exam_traps: [
          "Watch out for unit conversions and missing key formulas."
        ],
        practice_question: {
          question: `State the main principles related to ${topicTitle}.`,
          answer: "Focus on structured 3-point responses according to NCERT marking scheme.",
          explanation: "Highlight technical terms clearly."
        }
      });
    } finally {
      setExplaining(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-28 md:pb-16 px-2 sm:px-4">
      
      {/* ============================================================ */}
      {/* 1. HERO READINESS SCORECARD (MODERN & IMPACTFUL)             */}
      {/* ============================================================ */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-violet-950 text-white p-5 sm:p-7 shadow-xl border border-indigo-500/20">
        <div className="absolute top-0 right-0 w-72 h-72 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-60 h-60 bg-rose-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-500 text-white shadow-sm flex items-center gap-1.5">
                <Flame className="w-3 h-3 fill-white" />
                AI Exam Strategist
              </span>
              <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-white/10 text-indigo-200 border border-white/10">
                {selectedClass} • {subject}
              </span>
              <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {daysRemaining} Days Countdown
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight">
              {examData.exam_name}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl font-medium leading-relaxed">
              Curated CBSE/NCERT revision blueprints, high-yield weightage topics, and predicted scoring questions.
            </p>
          </div>

          {/* READINESS INDEX METER */}
          <div className="bg-white/10 backdrop-blur-xl border border-white/15 p-4 sm:p-5 rounded-2xl flex items-center gap-4 shrink-0 shadow-lg">
            <div className="relative flex items-center justify-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 border-white/10 flex items-center justify-center">
                <div className="text-center">
                  <span className="text-xl sm:text-2xl font-black text-amber-300">
                    {examData.confidence_score || 85}%
                  </span>
                </div>
              </div>
            </div>
            <div>
              <div className="text-[10px] font-black uppercase tracking-wider text-rose-300">Readiness Score</div>
              <div className="text-sm font-black text-white mt-0.5">Board Distinction Target</div>
              <div className="text-[10px] text-emerald-300 font-semibold mt-0.5 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Syllabus Aligned
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. SETUP CONTROLS CARD (EASY & INTUITIVE FOR BOTH DEVICES)   */}
      {/* ============================================================ */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-slate-900">Configure Target Exam & Timeline</h2>
              <p className="text-[11px] text-slate-400">Select your grade, subject, and remaining revision days</p>
            </div>
          </div>
        </div>

        {/* --- MOBILE COMPACT HORIZONTAL PILLS (FOR MOBILE VIEW) --- */}
        <div className="block md:hidden space-y-3.5">
          {/* CLASS SELECTION CHIPS */}
          <div>
            <label className="text-[11px] font-bold text-slate-700 block mb-1.5 flex items-center gap-1">
              <GraduationCap className="w-3.5 h-3.5 text-indigo-600" /> Select Grade / Class
            </label>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {CLASS_OPTIONS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => handleClassChange(c)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all shrink-0 cursor-pointer ${
                    selectedClass === c
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* SUBJECT SELECTION CHIPS */}
          <div>
            <label className="text-[11px] font-bold text-slate-700 block mb-1.5 flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5 text-emerald-600" /> Subject
            </label>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {availableSubjects.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => handleSubjectChange(s)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all shrink-0 cursor-pointer ${
                    subject === s
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* CHAPTER / FOCUS MODE SELECTION */}
          <div>
            <label className="text-[11px] font-bold text-slate-700 block mb-1.5 flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-amber-500" /> Syllabus Focus
            </label>
            <select
              value={isCustomChapter ? "__custom__" : selectedChapter}
              onChange={(e) => handleChapterChange(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500 cursor-pointer"
            >
              <option value="All High-Yield Chapters / Full Syllabus">🌟 Full Syllabus / All High-Yield Topics</option>
              {availableChapters.map((ch) => (
                <option key={ch} value={ch}>📖 {ch}</option>
              ))}
              <option value="__custom__">✏️ Custom Specific Topic...</option>
            </select>
            {isCustomChapter && (
              <input
                type="text"
                value={customChapter}
                onChange={(e) => setCustomChapter(e.target.value)}
                placeholder="Type specific chapter or topic..."
                className="mt-2 w-full bg-white border border-rose-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500 shadow-xs"
                autoFocus
              />
            )}
          </div>

          {/* DAYS REMAINING PRESETS */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-rose-500" /> Days Left
              </label>
              <span className="text-xs font-extrabold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-lg">
                {daysRemaining} Days
              </span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {PRESET_DAYS.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDaysRemaining(d)}
                  className={`py-2 rounded-xl text-xs font-bold transition-all text-center cursor-pointer ${
                    daysRemaining === d
                      ? "bg-rose-600 text-white shadow-sm font-black"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {d}d
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* --- DESKTOP GRID LAYOUT (FOR TABLET & DESKTOP) --- */}
        <div className="hidden md:grid grid-cols-4 gap-4">
          {/* TARGET CLASS */}
          <div>
            <label className="text-[11px] font-bold text-slate-700 block mb-1 flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-indigo-600" /> Target Class
            </label>
            <select
              value={selectedClass}
              onChange={(e) => handleClassChange(e.target.value)}
              className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500 cursor-pointer transition"
            >
              {CLASS_OPTIONS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* SUBJECT */}
          <div>
            <label className="text-[11px] font-bold text-slate-700 block mb-1 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-emerald-600" /> Subject
            </label>
            {availableSubjects.length > 0 ? (
              <select
                value={subject}
                onChange={(e) => handleSubjectChange(e.target.value)}
                className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500 cursor-pointer transition"
              >
                {availableSubjects.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            )}
          </div>

          {/* TOPIC / CHAPTER */}
          <div>
            <label className="text-[11px] font-bold text-slate-700 block mb-1 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-500" /> Topic / Focus
            </label>
            <select
              value={isCustomChapter ? "__custom__" : selectedChapter}
              onChange={(e) => handleChapterChange(e.target.value)}
              className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500 cursor-pointer transition"
            >
              <option value="All High-Yield Chapters / Full Syllabus">All High-Yield / Full Syllabus</option>
              {availableChapters.map((ch) => (
                <option key={ch} value={ch}>{ch}</option>
              ))}
              <option value="__custom__">✏️ Custom Specific Topic...</option>
            </select>
          </div>

          {/* DAYS REMAINING */}
          <div>
            <label className="text-[11px] font-bold text-slate-700 block mb-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-rose-500" /> Days Remaining
            </label>
            <div className="flex items-center gap-1.5">
              <input 
                type="number" 
                min={1}
                max={180}
                value={daysRemaining} 
                onChange={(e) => setDaysRemaining(parseInt(e.target.value) || 7)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
              <div className="flex items-center gap-1 shrink-0">
                {[7, 14, 30].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDaysRemaining(d)}
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition ${
                      daysRemaining === d
                        ? "bg-rose-50 border-rose-300 text-rose-700 font-extrabold"
                        : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100"
                    }`}
                  >
                    {d}d
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {isCustomChapter && (
          <div className="hidden md:block pt-1">
            <input
              type="text"
              value={customChapter}
              onChange={(e) => setCustomChapter(e.target.value)}
              placeholder="Type specific chapter, unit, or exam topic to focus on..."
              className="w-full bg-rose-50/50 border border-rose-300 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500 shadow-xs"
              autoFocus
            />
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-bold text-red-700 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* ============================================================ */}
      {/* 3. MOBILE TAB BAR (PREVENTS ENDLESS VERTICAL SCROLLING)       */}
      {/* ============================================================ */}
      <div className="block md:hidden">
        <div className="grid grid-cols-4 gap-1.5 p-1 bg-slate-100/90 rounded-2xl border border-slate-200">
          <button
            type="button"
            onClick={() => setMobileTab("topics")}
            className={`py-2 px-1 rounded-xl text-[11px] font-extrabold text-center transition-all flex flex-col items-center gap-1 ${
              mobileTab === "topics"
                ? "bg-white text-rose-700 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Target className="w-4 h-4" />
            <span>Topics</span>
          </button>
          <button
            type="button"
            onClick={() => setMobileTab("roadmap")}
            className={`py-2 px-1 rounded-xl text-[11px] font-extrabold text-center transition-all flex flex-col items-center gap-1 ${
              mobileTab === "roadmap"
                ? "bg-white text-purple-700 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Roadmap</span>
          </button>
          <button
            type="button"
            onClick={() => setMobileTab("questions")}
            className={`py-2 px-1 rounded-xl text-[11px] font-extrabold text-center transition-all flex flex-col items-center gap-1 ${
              mobileTab === "questions"
                ? "bg-white text-indigo-700 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>Questions</span>
          </button>
          <button
            type="button"
            onClick={() => setMobileTab("tips")}
            className={`py-2 px-1 rounded-xl text-[11px] font-extrabold text-center transition-all flex flex-col items-center gap-1 ${
              mobileTab === "tips"
                ? "bg-white text-amber-700 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Lightbulb className="w-4 h-4" />
            <span>Tips</span>
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 4. RESULTS DISPLAY (MOBILE TABS OR DESKTOP DUAL-COLUMN)      */}
      {/* ============================================================ */}

      {/* --- DESKTOP VIEW: 2-COLUMN SOPHISTICATED GRID --- */}
      <div className="hidden md:grid grid-cols-2 gap-6">
        
        {/* LEFT COLUMN: HIGH-YIELD TOPICS & PREDICTED QUESTIONS */}
        <div className="space-y-6">
          {/* HIGH YIELD TOPICS */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-rose-600" />
                <h3 className="text-sm font-extrabold text-slate-900">High-Yield NCERT Topics</h3>
              </div>
              <span className="text-[11px] font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-xl border border-rose-200">
                Click to Explain ➔
              </span>
            </div>

            <div className="space-y-3">
              {examData.high_yield_topics?.map((item: any, idx: number) => (
                <div 
                  key={idx} 
                  onClick={() => handleOpenTopic(item.topic)}
                  className="p-3.5 rounded-2xl border border-slate-200 hover:border-rose-400 bg-slate-50/60 hover:bg-rose-50/50 cursor-pointer transition-all flex items-center justify-between group shadow-2xs gap-3"
                >
                  <div className="flex items-center gap-2.5 flex-1 min-w-0">
                    <span className="w-7 h-7 rounded-xl bg-white border border-slate-200 flex items-center justify-center font-black text-xs text-rose-600 shrink-0 group-hover:bg-rose-600 group-hover:text-white transition-colors">
                      {idx + 1}
                    </span>
                    <div className="text-xs font-bold text-slate-800 group-hover:text-rose-950 transition-colors truncate">
                      <Markdown content={item.topic} />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-black text-rose-600 bg-rose-50 border border-rose-200 px-3 py-1 rounded-xl">
                      {item.weightage_marks} Marks
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-rose-600 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* EXPECTED QUESTIONS */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-extrabold text-slate-900">Predicted Board Questions</h3>
              </div>
              <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-xl border border-indigo-200">
                Click for Model Answer
              </span>
            </div>

            <div className="space-y-3.5">
              {examData.expected_questions?.map((q: any, idx: number) => (
                <div 
                  key={idx} 
                  onClick={() => handleOpenTopic(q.question)}
                  className="p-4 rounded-2xl border border-slate-200 hover:border-indigo-400 bg-slate-50/50 hover:bg-indigo-50/40 cursor-pointer transition-all space-y-2 group shadow-2xs"
                >
                  <div className="flex items-start justify-between text-xs font-bold gap-2">
                    <div className="text-slate-900 group-hover:text-indigo-950 transition-colors flex-1">
                      <Markdown content={`**Q${idx + 1}.** ${q.question}`} />
                    </div>
                    <span className="text-indigo-600 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-lg shrink-0 font-black text-xs">
                      {q.marks} Marks
                    </span>
                  </div>
                  <div className="text-xs text-slate-600 bg-white p-3 rounded-xl border border-slate-200 group-hover:border-indigo-200 transition-colors">
                    <span className="font-bold text-slate-800 text-[11px] block mb-1">💡 Scoring Outline:</span>
                    <Markdown content={q.outline} />
                  </div>
                  <div className="text-[11px] font-bold text-indigo-600 flex items-center justify-end gap-1 pt-1">
                    <span>Open AI Master Solution</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: REVISION ROADMAP & PRO EXAM TIPS */}
        <div className="space-y-6">
          {/* DAY-BY-DAY REVISION ROADMAP */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-purple-600" />
                <h3 className="text-sm font-extrabold text-slate-900">Day-by-Day Revision Roadmap</h3>
              </div>
              <span className="text-[11px] font-bold text-purple-600 bg-purple-50 px-2.5 py-1 rounded-xl border border-purple-200">
                {examData.revision_roadmap?.length || 0} Study Days
              </span>
            </div>

            <div className="space-y-3">
              {examData.revision_roadmap?.map((item: any, idx: number) => (
                <div 
                  key={idx} 
                  onClick={() => handleOpenTopic(item.focus)}
                  className="p-3.5 rounded-2xl border border-purple-100 hover:border-purple-400 bg-purple-50/40 hover:bg-purple-100/60 cursor-pointer transition-all flex items-center justify-between group shadow-2xs gap-3"
                >
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <span className="w-9 h-9 rounded-xl bg-purple-600 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-md shadow-purple-200 group-hover:scale-105 transition-transform">
                      D{item.day}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-slate-900 group-hover:text-purple-950 transition-colors">
                        <Markdown content={item.focus} />
                      </div>
                      <span className="text-[11px] text-purple-700 font-semibold mt-0.5 block">
                        Focus target: {item.hours} hrs deep study
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] font-bold text-purple-700 bg-white/90 border border-purple-200 px-2.5 py-1.5 rounded-xl shrink-0 group-hover:bg-purple-600 group-hover:text-white transition-all">
                    <span>Explain</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* EXAMINER PRO TIPS */}
          <div className="bg-gradient-to-br from-amber-500/10 via-amber-50 to-orange-50/60 rounded-3xl p-6 border border-amber-200/80 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-amber-900 font-black text-sm">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>Evaluator & Scoring Tips</span>
            </div>
            <div className="space-y-2.5">
              {examData.top_tips?.map((tip: string, idx: number) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs text-amber-950 font-medium bg-white/80 p-3 rounded-xl border border-amber-200/60">
                  <span className="font-black text-amber-600 shrink-0">#{idx + 1}</span>
                  <p className="leading-relaxed">{tip}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* --- MOBILE VIEW: TAB-SWITCHED CLEAN PANELS --- */}
      <div className="block md:hidden">
        {mobileTab === "topics" && (
          <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-sm space-y-3 animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-black text-slate-900">High-Yield Exam Topics</span>
              <span className="text-[10px] font-bold text-rose-600">Tap for instant AI guide</span>
            </div>
            <div className="space-y-2.5">
              {examData.high_yield_topics?.map((item: any, idx: number) => (
                <div 
                  key={idx} 
                  onClick={() => handleOpenTopic(item.topic)}
                  className="p-3 rounded-2xl border border-slate-200 active:bg-rose-50 bg-slate-50/70 flex items-center justify-between gap-2.5 cursor-pointer shadow-2xs"
                >
                  <div className="flex items-center gap-2.5 flex-1 min-w-0">
                    <span className="w-6 h-6 rounded-lg bg-rose-100 text-rose-700 font-black text-[11px] flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <div className="text-xs font-bold text-slate-900 truncate flex-1">
                      <Markdown content={item.topic} />
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[11px] font-black text-rose-700 bg-rose-50 px-2 py-0.5 rounded-lg border border-rose-200">
                      {item.weightage_marks}M
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {mobileTab === "roadmap" && (
          <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-sm space-y-3 animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-black text-slate-900">Daily Revision Plan</span>
              <span className="text-[10px] font-bold text-purple-600">{examData.revision_roadmap?.length} Days</span>
            </div>
            <div className="space-y-2.5">
              {examData.revision_roadmap?.map((item: any, idx: number) => (
                <div 
                  key={idx} 
                  onClick={() => handleOpenTopic(item.focus)}
                  className="p-3 rounded-2xl border border-purple-100 active:bg-purple-100/60 bg-purple-50/40 flex items-start gap-3 cursor-pointer shadow-2xs"
                >
                  <span className="w-8 h-8 rounded-xl bg-purple-600 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-sm">
                    D{item.day}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-slate-900 leading-snug">
                      <Markdown content={item.focus} />
                    </div>
                    <span className="text-[10px] text-purple-700 font-bold mt-1 block">
                      Target: {item.hours} hours study
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-purple-400 shrink-0 self-center" />
                </div>
              ))}
            </div>
          </div>
        )}

        {mobileTab === "questions" && (
          <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-sm space-y-3 animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-black text-slate-900">Expected Questions</span>
              <span className="text-[10px] font-bold text-indigo-600">Tap for full answer</span>
            </div>
            <div className="space-y-3">
              {examData.expected_questions?.map((q: any, idx: number) => (
                <div 
                  key={idx} 
                  onClick={() => handleOpenTopic(q.question)}
                  className="p-3.5 rounded-2xl border border-slate-200 active:bg-indigo-50/50 bg-slate-50/60 space-y-2 cursor-pointer shadow-2xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="text-xs font-bold text-slate-900 flex-1">
                      <Markdown content={`**Q${idx + 1}.** ${q.question}`} />
                    </div>
                    <span className="text-indigo-600 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-md font-black text-[10px] shrink-0">
                      {q.marks}M
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-600 bg-white p-2.5 rounded-xl border border-slate-200">
                    <span className="font-bold text-slate-800 text-[10px] block mb-0.5">Answer Outline:</span>
                    <Markdown content={q.outline} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {mobileTab === "tips" && (
          <div className="bg-gradient-to-br from-amber-50 via-white to-orange-50 rounded-3xl p-4 border border-amber-200 shadow-sm space-y-2.5 animate-in fade-in duration-200">
            <div className="flex items-center gap-1.5 text-amber-900 font-black text-xs pb-1 border-b border-amber-100">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Examiner Strategy Tips</span>
            </div>
            {examData.top_tips?.map((tip: string, idx: number) => (
              <div key={idx} className="p-3 bg-white rounded-xl border border-amber-200 text-xs font-medium text-amber-950 flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-amber-100 text-amber-800 font-black text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <p className="leading-relaxed">{tip}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ============================================================ */}
      {/* 5. PROMINENT BOTTOM "BUILD STRATEGY" ACTIONS                  */}
      {/* ============================================================ */}

      {/* DESKTOP STICKY BOTTOM BAR */}
      <div className="hidden md:block sticky bottom-4 z-20">
        <div className="bg-white/95 backdrop-blur-xl p-3.5 px-6 rounded-2xl border border-slate-200/90 shadow-xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-600 to-indigo-600 text-white flex items-center justify-center font-black shadow-md shadow-rose-600/20 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-black text-slate-900 truncate">
                Target: {selectedClass} • {subject} {effectiveTopic && effectiveTopic !== "All High-Yield Chapters / Full Syllabus" ? `(${effectiveTopic})` : ""}
              </div>
              <div className="text-[11px] text-slate-500 font-semibold truncate">
                {daysRemaining} Days Countdown • High-Yield NCERT Strategy Generator
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGenerate}
            disabled={loading}
            className="px-6 py-3 bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-700 hover:to-indigo-700 active:scale-98 disabled:opacity-50 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-rose-600/20 transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Building AI Strategy...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Build Exam Strategy</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* MOBILE FLOATING DOCKED BOTTOM BAR (DEDICATED FOR MOBILE UX) */}
      <div className="block md:hidden fixed bottom-14 left-0 right-0 z-30 p-2.5 px-4 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-2xl">
        <button
          type="button"
          onClick={handleGenerate}
          disabled={loading}
          className="w-full py-3 bg-gradient-to-r from-rose-600 via-purple-600 to-indigo-600 active:scale-98 disabled:opacity-50 text-white font-black text-xs rounded-xl shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2 cursor-pointer"
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Building Your Exam Strategy...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Build Strategy for {selectedClass}</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>

      {/* ============================================================ */}
      {/* 6. AI TOPIC EXPLANATION MODAL (INTERACTIVE CONCEPT GUIDE)     */}
      {/* ============================================================ */}
      {selectedTopic && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* MODAL HEADER */}
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-rose-950 text-white p-4 sm:p-5 flex items-start justify-between shrink-0">
              <div className="space-y-1 pr-4">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-rose-500/30 text-rose-200 text-[10px] font-black uppercase tracking-wider border border-rose-400/30">
                    AI Concept Guide
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-white/15 text-indigo-200 text-[10px] font-bold">
                    {subject} • {selectedClass}
                  </span>
                </div>
                <div className="text-base sm:text-lg font-extrabold text-white leading-snug line-clamp-2">
                  <Markdown content={selectedTopic} />
                </div>
              </div>

              <button 
                onClick={() => setSelectedTopic(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors shrink-0 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* MODAL BODY */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1 text-slate-800">
              {explaining ? (
                <div className="py-12 space-y-4 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto animate-bounce">
                    <Sparkles className="w-6 h-6 animate-spin" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-800">AI is synthesizing brief concept breakdown...</h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    Analyzing NCERT curriculum patterns, key formulas, and exam scoring traps for <span className="font-bold text-rose-600">"{selectedTopic}"</span>
                  </p>
                </div>
              ) : topicData ? (
                <>
                  {/* BRIEF EXECUTIVE SUMMARY */}
                  <div className="bg-rose-50/70 border border-rose-200/80 rounded-2xl p-4 space-y-1.5">
                    <h3 className="text-xs font-extrabold text-rose-900 flex items-center gap-1.5 uppercase tracking-wide">
                      <BookOpen className="w-4 h-4 text-rose-600" />
                      <span>Executive Overview</span>
                    </h3>
                    <div className="text-xs font-medium text-slate-800 leading-relaxed">
                      <Markdown content={topicData.summary} />
                    </div>
                  </div>

                  {/* KEY CONCEPTS & FORMULAS */}
                  {topicData.key_concepts && topicData.key_concepts.length > 0 && (
                    <div className="space-y-2.5">
                      <h3 className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5 uppercase tracking-wide">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Core NCERT Concepts & Key Formulas</span>
                      </h3>
                      <div className="space-y-2">
                        {topicData.key_concepts.map((pt: string, i: number) => (
                          <div key={i} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-2.5 text-xs text-slate-800 font-medium">
                            <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                              {i + 1}
                            </span>
                            <div className="leading-relaxed flex-1">
                              <Markdown content={pt} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* COMMON EXAM TRAPS */}
                  {topicData.common_exam_traps && topicData.common_exam_traps.length > 0 && (
                    <div className="space-y-2.5">
                      <h3 className="text-xs font-extrabold text-amber-900 flex items-center gap-1.5 uppercase tracking-wide">
                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                        <span>Common Scoring Pitfalls & Traps</span>
                      </h3>
                      <div className="space-y-2">
                        {topicData.common_exam_traps.map((trap: string, i: number) => (
                          <div key={i} className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl flex items-start gap-2.5 text-xs text-amber-950 font-medium">
                            <span className="text-amber-600 font-bold shrink-0">⚠️</span>
                            <div className="leading-relaxed flex-1">
                              <Markdown content={trap} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* PRACTICE QUESTION */}
                  {topicData.practice_question && (
                    <div className="bg-indigo-50/70 border border-indigo-200/80 rounded-2xl p-4 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-extrabold text-indigo-950 flex items-center gap-1.5 uppercase tracking-wide">
                          <HelpCircle className="w-4 h-4 text-indigo-600" />
                          <span>High-Probability Practice Question</span>
                        </h3>
                        <button
                          onClick={() => setShowAnswer(!showAnswer)}
                          className="text-[11px] font-bold text-indigo-700 hover:text-indigo-900 underline cursor-pointer"
                        >
                          {showAnswer ? "Hide Solution" : "Show Model Solution"}
                        </button>
                      </div>

                      <div className="text-xs font-bold text-slate-900">
                        <Markdown content={topicData.practice_question.question} />
                      </div>

                      {showAnswer && (
                        <div className="pt-2 border-t border-indigo-200/60 space-y-2 text-xs">
                          <div className="p-3 bg-white rounded-xl border border-indigo-200 text-indigo-950 font-medium leading-relaxed space-y-1">
                            <span className="font-bold text-emerald-700 block">Model Answer: </span>
                            <Markdown content={topicData.practice_question.answer} />
                          </div>
                          {topicData.practice_question.explanation && (
                            <div className="text-[11px] text-indigo-800 bg-indigo-100/50 p-2.5 rounded-xl border border-indigo-200/60">
                              <span className="font-bold block text-indigo-950 mb-0.5">💡 Scoring Guideline:</span>
                              <Markdown content={topicData.practice_question.explanation} />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </>
              ) : null}
            </div>

            {/* MODAL FOOTER */}
            <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
              <span className="text-[11px] font-semibold text-slate-500">
                DEVGYA AI NCERT Tutor
              </span>

              <button
                onClick={() => setSelectedTopic(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
