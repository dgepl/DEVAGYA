"use client";

import { useState } from "react";
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
  ArrowRight
} from "lucide-react";
import Markdown from "@/components/chat/Markdown";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "/api/v1";

export function ExamPrepStudio() {
  const [examName, setExamName] = useState("CBSE Class 10 Board Exam");
  const [subject, setSubject] = useState("Science");
  const [daysRemaining, setDaysRemaining] = useState(14);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
      { topic: "Electricity & Magnetic Effects", weightage_marks: 13 }
    ],
    revision_roadmap: [
      { day: 1, focus: "Optics numericals & ray diagrams", hours: 3.0 },
      { day: 2, focus: "Balancing chemical equations & salt preparations", hours: 3.5 },
      { day: 3, focus: "Ohm's law circuits & magnetic fields", hours: 4.0 }
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
      }
    ],
    top_tips: [
      "Underline key technical terms with pencil in exam answers.",
      "Reserve 15 minutes at the end for reviewing numerical calculations."
    ]
  });

  const handleGenerate = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/student/exam-prep`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ exam_name: examName, subject, days_remaining: daysRemaining }),
      });
      const data = await res.json();
      if (data.high_yield_topics) {
        setExamData(data);
      } else {
        setError(data.detail || "Failed to generate. Try again.");
      }
    } catch (e) {
      console.error(e);
      setError("Connection failed. Make sure backend is running.");
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
      const res = await fetch(`${API_BASE}/student/explain-topic`, {
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
    <div className="space-y-4 sm:space-y-6 max-w-5xl mx-auto pb-12 px-1 sm:px-0">
      
      {/* HEADER BAR */}
      <div className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-rose-600 text-white flex items-center justify-center shadow-lg shadow-rose-200 shrink-0">
            <Trophy className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <h1 className="text-base sm:text-xl font-extrabold text-slate-900">AI Exam Preparation Suite</h1>
            <p className="text-[11px] sm:text-xs text-slate-500">Custom revision roadmap & expected questions. <span className="font-bold text-rose-600">Click any topic for AI explanation!</span></p>
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
        >
          {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-amber-300" />}
          <span>{loading ? "Generating..." : "Build Strategy"}</span>
        </button>
      </div>

      {/* INPUT CONTROLS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-4 bg-white p-4 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <label className="text-[11px] font-bold text-slate-700 block mb-1">Target Exam</label>
          <input 
            type="text" 
            value={examName} 
            onChange={(e) => setExamName(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
        </div>
        <div>
          <label className="text-[11px] font-bold text-slate-700 block mb-1">Subject</label>
          <input 
            type="text" 
            value={subject} 
            onChange={(e) => setSubject(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
        </div>
        <div>
          <label className="text-[11px] font-bold text-slate-700 block mb-1">Days Remaining</label>
          <input 
            type="number" 
            value={daysRemaining} 
            onChange={(e) => setDaysRemaining(parseInt(e.target.value) || 7)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
        </div>
      </div>

      {/* CONFIDENCE SCORE METER */}
      <div className="bg-gradient-to-r from-rose-900 via-rose-800 to-indigo-900 text-white p-5 sm:p-7 rounded-3xl border border-rose-700/50 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-200 bg-white/10 px-3 py-1 rounded-full border border-white/10">
            AI Exam Readiness Index
          </span>
          <h2 className="text-xl sm:text-2xl font-extrabold">{examData.exam_name} Strategy</h2>
          <p className="text-xs text-rose-100 max-w-lg">
            Click on any topic or expected question below to open an instant AI concept guide!
          </p>
        </div>

        <div className="bg-black/30 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-white/10 text-center shrink-0 min-w-[160px]">
          <div className="text-[10px] text-rose-200 font-bold uppercase tracking-wider">Confidence Score</div>
          <div className="text-3xl font-black text-amber-300 mt-0.5">{examData.confidence_score}%</div>
          <span className="text-[10px] text-emerald-400 font-extrabold block">High Distinction Ready</span>
        </div>
      </div>

      {/* TWO COLUMN CONTENT LAYOUT */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        
        {/* HIGH YIELD TOPICS & EXPECTED QUESTIONS */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <Target className="w-4 h-4 text-rose-600" />
                <span>High Yield Topics & Marks Weightage</span>
              </h3>
              <span className="text-[11px] font-bold text-rose-600">Click topic to explain ➔</span>
            </div>

            <div className="space-y-3">
              {examData.high_yield_topics?.map((item: any, idx: number) => (
                <div 
                  key={idx} 
                  onClick={() => handleOpenTopic(item.topic)}
                  className="p-3.5 rounded-2xl border border-slate-200 hover:border-rose-400 bg-slate-50/70 hover:bg-rose-50/50 cursor-pointer transition-all flex items-center justify-between group shadow-xs gap-2"
                >
                  <div className="flex items-center gap-2.5 flex-1 min-w-0">
                    <BookOpen className="w-4 h-4 text-rose-500 group-hover:scale-110 transition-transform shrink-0" />
                    <div className="text-xs font-bold text-slate-800 group-hover:text-rose-950 transition-colors flex-1">
                      <Markdown content={item.topic} />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-extrabold text-rose-600 bg-rose-50 border border-rose-200 px-3 py-1 rounded-xl">
                      {item.weightage_marks} Marks
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-rose-600 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-indigo-600" />
                <span>High Probability Expected Questions</span>
              </h3>
              <span className="text-[11px] font-bold text-indigo-600">Click to study ➔</span>
            </div>

            <div className="space-y-4">
              {examData.expected_questions?.map((q: any, idx: number) => (
                <div 
                  key={idx} 
                  onClick={() => handleOpenTopic(q.question)}
                  className="p-4 rounded-2xl border border-slate-200 hover:border-indigo-400 bg-slate-50/50 hover:bg-indigo-50/40 cursor-pointer transition-all space-y-2 group shadow-xs"
                >
                  <div className="flex items-start justify-between text-xs font-bold gap-2">
                    <div className="text-slate-900 group-hover:text-indigo-950 transition-colors flex-1">
                      <Markdown content={`**Q${idx + 1}.** ${q.question}`} />
                    </div>
                    <span className="text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md shrink-0 ml-2 font-black">{q.marks} Marks</span>
                  </div>
                  <div className="text-xs text-slate-600 bg-white p-3 rounded-xl border border-slate-200 group-hover:border-indigo-200 transition-colors space-y-1">
                    <span className="font-bold text-slate-800 text-[11px] block">💡 Answer Key Outline:</span>
                    <Markdown content={q.outline} />
                  </div>
                  <div className="text-[11px] font-bold text-indigo-600 flex items-center gap-1 pt-1 justify-end">
                    <span>View AI Detailed Explanation</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* DAY BY DAY REVISION ROADMAP */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-purple-600" />
              <span>Day-by-Day Countdown Revision Roadmap</span>
            </h3>
            <span className="text-[11px] font-bold text-purple-600">Click day to explain ➔</span>
          </div>

          <div className="space-y-3">
            {examData.revision_roadmap?.map((item: any, idx: number) => (
              <div 
                key={idx} 
                onClick={() => handleOpenTopic(item.focus)}
                className="p-4 rounded-2xl border border-purple-100 hover:border-purple-400 bg-purple-50/40 hover:bg-purple-100/60 cursor-pointer transition-all flex items-center justify-between group shadow-xs gap-3"
              >
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <span className="w-9 h-9 rounded-xl bg-purple-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0 shadow-md shadow-purple-200 group-hover:scale-105 transition-transform">
                    D{item.day}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-slate-900 group-hover:text-purple-950 transition-colors">
                      <Markdown content={item.focus} />
                    </div>
                    <span className="text-[11px] text-purple-700 font-medium">Target: {item.hours} hours focus study</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-[11px] font-bold text-purple-700 bg-white/80 border border-purple-200 px-2.5 py-1 rounded-xl shrink-0 group-hover:bg-purple-600 group-hover:text-white transition-all">
                  <span>Explain</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* AI TOPIC EXPLANATION MODAL */}
      {selectedTopic && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* MODAL HEADER */}
            <div className="bg-gradient-to-r from-rose-900 via-rose-800 to-indigo-900 text-white p-5 sm:p-6 flex items-start justify-between shrink-0">
              <div className="space-y-1 pr-4">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-rose-100 text-[10px] font-bold uppercase tracking-wider border border-white/20">
                    AI Topic Master Class
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[10px] font-bold border border-amber-300/30">
                    {subject || "NCERT Concept"}
                  </span>
                </div>
                <div className="text-lg font-extrabold text-white leading-snug line-clamp-2">
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
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-800">
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
                  <div className="bg-rose-50/70 border border-rose-200/80 rounded-2xl p-4.5 space-y-2">
                    <h3 className="text-xs font-extrabold text-rose-900 flex items-center gap-1.5 uppercase tracking-wide">
                      <BookOpen className="w-4 h-4 text-rose-600" />
                      <span>Executive Brief Overview</span>
                    </h3>
                    <div className="text-xs font-medium text-slate-800 leading-relaxed">
                      <Markdown content={topicData.summary} />
                    </div>
                  </div>

                  {/* KEY CONCEPTS & FORMULAS */}
                  {topicData.key_concepts && topicData.key_concepts.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5 uppercase tracking-wide">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Core NCERT Concepts & Key Points</span>
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
                    <div className="space-y-3">
                      <h3 className="text-xs font-extrabold text-amber-900 flex items-center gap-1.5 uppercase tracking-wide">
                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                        <span>Common Exam Pitfalls & Scoring Traps</span>
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
                    <div className="bg-indigo-50/70 border border-indigo-200/80 rounded-2xl p-4.5 space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-extrabold text-indigo-950 flex items-center gap-1.5 uppercase tracking-wide">
                          <HelpCircle className="w-4 h-4 text-indigo-600" />
                          <span>High Probability Practice Question</span>
                        </h3>
                        <button
                          onClick={() => setShowAnswer(!showAnswer)}
                          className="text-[11px] font-bold text-indigo-700 hover:text-indigo-900 underline cursor-pointer"
                        >
                          {showAnswer ? "Hide Solution" : "Show Solution"}
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
                            <div className="text-[11px] text-indigo-800 italic bg-indigo-100/50 p-2.5 rounded-xl border border-indigo-200/60">
                              <span className="font-bold block not-italic text-indigo-950 mb-0.5">💡 Examiner Tip:</span>
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
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
              <span className="text-[11px] font-medium text-slate-500">
                DEVAGYA AI NCERT Educator
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedTopic(null)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
