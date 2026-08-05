"use client";

import { useState } from "react";
import { 
  Trophy, 
  Sparkles, 
  Target, 
  Calendar, 
  TrendingUp, 
  CheckCircle2, 
  RefreshCw, 
  Award, 
  FileText,
  HelpCircle,
  Lightbulb
} from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "/api/v1";

export function ExamPrepStudio() {
  const [examName, setExamName] = useState("CBSE Class 10 Board Exam");
  const [subject, setSubject] = useState("Science");
  const [daysRemaining, setDaysRemaining] = useState(14);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
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

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      
      {/* HEADER BAR */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-rose-600 text-white flex items-center justify-center shadow-lg shadow-rose-200">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900">AI Exam Preparation Suite</h1>
            <p className="text-xs text-slate-500">Custom revision roadmap, high-yield topic weightage & expected questions</p>
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-2xl shadow-md transition-all flex items-center gap-1.5 shrink-0"
        >
          {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-amber-300" />}
          <span>Build AI Strategy</span>
        </button>
      </div>

      {/* INPUT CONTROLS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">Target Exam</label>
          <input 
            type="text" 
            value={examName} 
            onChange={(e) => setExamName(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
          />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">Subject</label>
          <input 
            type="text" 
            value={subject} 
            onChange={(e) => setSubject(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
          />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">Days Remaining</label>
          <input 
            type="number" 
            value={daysRemaining} 
            onChange={(e) => setDaysRemaining(parseInt(e.target.value) || 7)}
            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
          />
        </div>
      </div>

      {/* CONFIDENCE SCORE METER */}
      <div className="bg-gradient-to-r from-rose-900 via-rose-800 to-indigo-900 text-white p-6 sm:p-8 rounded-3xl border border-rose-700/50 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-rose-200 bg-white/10 px-3 py-1 rounded-full border border-white/10">
            AI Exam Readiness Index
          </span>
          <h2 className="text-2xl font-extrabold">{examData.exam_name} Strategy</h2>
          <p className="text-xs text-rose-100 max-w-lg">
            Based on your quiz attempts and weak topic revisions, your calculated exam confidence score is high!
          </p>
        </div>

        <div className="bg-black/30 backdrop-blur-md p-6 rounded-3xl border border-white/10 text-center shrink-0 min-w-[200px]">
          <div className="text-xs text-rose-200 font-bold uppercase tracking-wider">Confidence Score</div>
          <div className="text-4xl font-black text-amber-300 mt-1">{examData.confidence_score}%</div>
          <span className="text-[10px] text-emerald-400 font-extrabold mt-1 block">Ready for High Distinction</span>
        </div>
      </div>

      {/* TWO COLUMN CONTENT LAYOUT */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* HIGH YIELD TOPICS & EXPECTED QUESTIONS */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <Target className="w-4 h-4 text-rose-600" />
              <span>High Yield Topics & Marks Weightage</span>
            </h3>

            <div className="space-y-3">
              {examData.high_yield_topics?.map((item: any, idx: number) => (
                <div key={idx} className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">{item.topic}</span>
                  <span className="text-xs font-extrabold text-rose-600 bg-rose-50 border border-rose-200 px-3 py-1 rounded-xl">
                    {item.weightage_marks} Marks
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-indigo-600" />
              <span>High Probability Expected Questions</span>
            </h3>

            <div className="space-y-4">
              {examData.expected_questions?.map((q: any, idx: number) => (
                <div key={idx} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-900">Q{idx + 1}. {q.question}</span>
                    <span className="text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">{q.marks} Marks</span>
                  </div>
                  <p className="text-xs text-slate-600 bg-white p-3 rounded-xl border border-slate-200">
                    💡 <span className="font-bold text-slate-800">Answer Key Outline:</span> {q.outline}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* DAY BY DAY REVISION ROADMAP */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-purple-600" />
            <span>Day-by-Day Countdown Revision Roadmap</span>
          </h3>

          <div className="space-y-3">
            {examData.revision_roadmap?.map((item: any, idx: number) => (
              <div key={idx} className="p-4 rounded-2xl border border-purple-100 bg-purple-50/40 flex items-start gap-3">
                <span className="w-8 h-8 rounded-xl bg-purple-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0">
                  D{item.day}
                </span>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{item.focus}</h4>
                  <span className="text-[11px] text-purple-700 font-medium">Target: {item.hours} hours focus study</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
