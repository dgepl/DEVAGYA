"use client";

import { useState } from "react";
import { BookOpen, Sparkles, Download, RefreshCw, Clock, CheckCircle2, GraduationCap, Target, Layers, FileText } from "lucide-react";
import { generateLessonPlan, exportLessonPlanPDF } from "@/lib/api_phase2";

const CLASS_OPTIONS = [
  "Class 1", "Class 2", "Class 3", "Class 4", "Class 5",
  "Class 6", "Class 7", "Class 8", "Class 9", "Class 10",
  "Class 11", "Class 12", "College / Competitive Exam"
];

export default function LessonPlannerPage() {
  const [className, setClassName] = useState("Class 10");
  const [subject, setSubject] = useState("Science");
  const [chapter, setChapter] = useState("Life Processes");
  const [duration, setDuration] = useState(45);
  const [goal, setGoal] = useState("Master cellular respiration and difference between aerobic & anaerobic respiration.");
  
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<any | null>(null);

  const handleGeneratePlan = async () => {
    setLoading(true);
    try {
      const res = await generateLessonPlan({
        title: `NCERT Lesson Plan: ${chapter}`,
        class_name: className,
        subject,
        chapter,
        duration_mins: duration,
        learning_goals: [goal]
      });
      setPlan(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* HEADER */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-800 to-indigo-900 text-white p-8 rounded-3xl shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6 border border-emerald-700/50">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-emerald-300" />
            </div>
            <div>
              <h1 className="text-2xl font-black">AI Lesson Planner Studio</h1>
              <p className="text-emerald-100 text-xs sm:text-sm">
                Generate 5E pedagogical lesson plans, learning objectives, step-by-step teaching flows, and printable PDF guides.
              </p>
            </div>
          </div>
        </div>

        {plan && (
          <button
            onClick={() => exportLessonPlanPDF(plan)}
            className="px-5 py-3 bg-white text-emerald-950 hover:bg-emerald-50 font-extrabold text-xs rounded-2xl shadow-lg transition-all flex items-center gap-2 shrink-0"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>Export Printable Lesson Plan PDF</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* FORM CONTROLS (LEFT) */}
        <div className="lg:col-span-5 bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 space-y-5 shadow-sm">
          
          <h2 className="text-base font-black text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Target className="w-5 h-5 text-emerald-600" />
            Lesson Plan Parameters
          </h2>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4 text-emerald-500" /> Target Grade / Class
            </label>
            <select
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {CLASS_OPTIONS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-indigo-500" /> Subject
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Science, Mathematics, English"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-purple-500" /> Chapter / Unit Title
            </label>
            <input
              type="text"
              value={chapter}
              onChange={(e) => setChapter(e.target.value)}
              placeholder="e.g. Life Processes, Quadratic Equations"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-rose-500" /> Period Duration (Mins)
            </label>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              placeholder="45"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-teal-500" /> Primary Learning Goal / Focus
            </label>
            <textarea
              rows={3}
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="e.g. Students will understand the steps of cellular respiration..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <button
            onClick={handleGeneratePlan}
            disabled={loading}
            className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-black text-xs sm:text-sm rounded-2xl shadow-lg shadow-emerald-200 transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Designing Pedagogical Lesson Plan...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Generate 5E Lesson Plan</span>
              </>
            )}
          </button>
        </div>

        {/* PREVIEW PLAN (RIGHT) */}
        <div className="lg:col-span-7 space-y-6">
          {!plan ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4 shadow-sm flex flex-col items-center justify-center min-h-[450px]">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <BookOpen className="w-8 h-8" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900">No Lesson Plan Generated Yet</h3>
              <p className="text-xs text-slate-500 font-medium max-w-sm">
                Fill out the lesson parameters on the left and click <b>Generate 5E Lesson Plan</b> to build your teaching roadmap.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xl animate-in fade-in">
              <div className="border-b border-slate-200 pb-4">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-md text-[10px] font-black uppercase">
                    5E NCERT Framework
                  </span>
                  <span className="text-xs text-slate-500 font-bold">{plan.class_name} • {plan.subject}</span>
                </div>
                <h2 className="text-xl font-black text-slate-900 mt-1">{plan.title}</h2>
                <p className="text-xs text-slate-500 font-semibold">Duration: {plan.duration_mins} Minutes</p>
              </div>

              {/* Learning Goals */}
              <div className="space-y-2">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">🎯 Learning Objectives</h3>
                <ul className="space-y-1">
                  {plan.learning_goals?.map((g: string, i: number) => (
                    <li key={i} className="text-xs font-bold text-slate-700 flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{g}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Teaching Flow Steps */}
              {plan.teaching_flow && (
                <div className="space-y-3">
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">⏱️ Lesson Flow & Timeline</h3>
                  <div className="space-y-2">
                    {plan.teaching_flow.map((step: any, i: number) => (
                      <div key={i} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1">
                        <div className="flex items-center justify-between font-extrabold text-slate-900">
                          <span className="text-emerald-700">{step.phase}</span>
                          <span className="text-slate-500">{step.time_mins} Mins</span>
                        </div>
                        <p className="text-slate-700 font-semibold">{step.activity}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Assessment & Homework */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 bg-indigo-50/80 border border-indigo-200 rounded-2xl text-xs space-y-1">
                  <h4 className="font-black text-indigo-900">📝 In-Class Assessment</h4>
                  <p className="text-indigo-800 font-medium">{plan.assessment_strategy || "Formative quick quiz & concept mapping."}</p>
                </div>

                <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-2xl text-xs space-y-1">
                  <h4 className="font-black text-amber-900">🏠 Homework Assignment</h4>
                  <p className="text-amber-800 font-medium">{plan.homework_assignment || "Complete NCERT exercises 1 to 5."}</p>
                </div>
              </div>

            </div>
          )}
        </div>

      </div>

    </div>
  );
}
