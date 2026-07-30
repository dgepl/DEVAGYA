"use client";

import { useState } from "react";
import { BookOpen, Sparkles, Download, RefreshCw, Clock, CheckCircle2 } from "lucide-react";
import { generateLessonPlan, exportLessonPlanPDF } from "@/lib/api_phase2";

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
        title: `NCERT Master Plan: ${chapter}`,
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
    <div className="space-y-8">
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-200 pb-4 gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-indigo-600" />
            AI Lesson Planner Studio
          </h1>
          <p className="text-xs text-slate-500 font-semibold">Generate complete 5E lesson plans, group activities, and export vector PDFs</p>
        </div>

        {plan && (
          <button
            onClick={() => exportLessonPlanPDF(plan)}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-glow transition-all flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export Lesson Plan PDF
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Controls */}
        <div className="lg:col-span-4 glass-panel p-6 rounded-3xl border border-slate-200 space-y-4 shadow-sm">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-2">Plan Setup</h2>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Grade / Class</label>
            <input
              type="text"
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Subject</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Chapter Title</label>
            <input
              type="text"
              value={chapter}
              onChange={(e) => setChapter(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Period Duration (Mins)</label>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Learning Goals</label>
            <textarea
              rows={3}
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none font-medium"
            />
          </div>

          <button
            onClick={handleGeneratePlan}
            disabled={loading}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-glow transition-all flex items-center justify-center gap-2"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin text-cyan-200" /> : <Sparkles className="w-4 h-4 text-cyan-200" />}
            Generate Lesson Plan
          </button>
        </div>

        {/* Display */}
        <div className="lg:col-span-8 glass-panel p-6 rounded-3xl border border-slate-200 min-h-[450px] shadow-sm">
          {plan ? (
            <div className="space-y-6">
              
              <div className="border-b border-slate-200 pb-4">
                <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-600">Generated Lesson Plan</span>
                <h3 className="text-xl font-bold text-slate-900 mt-1">{plan.title}</h3>
                <p className="text-xs text-slate-600">{plan.class_name} • {plan.subject} • {plan.duration_mins} Minutes</p>
              </div>

              {/* Objectives */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-indigo-700 uppercase tracking-wide">1. Learning Objectives</h4>
                <ul className="space-y-1">
                  {plan.learning_objectives.map((obj: string, i: number) => (
                    <li key={i} className="text-xs text-slate-800 flex items-center gap-2 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{obj}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Strategy */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-indigo-700 uppercase tracking-wide">2. Teaching Strategy</h4>
                <p className="text-xs text-slate-800 bg-slate-50 p-3 rounded-xl border border-slate-200 font-medium">{plan.teaching_strategy}</p>
              </div>

              {/* Activities */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-indigo-700 uppercase tracking-wide">3. Timeline Breakdown</h4>
                <div className="space-y-2">
                  {plan.class_activities.map((act: any, i: number) => (
                    <div key={i} className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between text-xs shadow-sm">
                      <span className="font-bold text-indigo-600 shrink-0 mr-4 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {act.time}
                      </span>
                      <span className="text-slate-800 font-medium">{act.activity}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Homework */}
              <div className="space-y-2 pt-2 border-t border-slate-200">
                <h4 className="text-xs font-bold text-indigo-700 uppercase tracking-wide">4. Homework & Assessment</h4>
                <p className="text-xs text-slate-800 font-medium"><strong>Homework:</strong> {plan.homework}</p>
                <p className="text-xs text-slate-800 font-medium"><strong>Revision Summary:</strong> {plan.revision_summary}</p>
              </div>

            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-center space-y-3">
              <BookOpen className="w-12 h-12 text-slate-400 animate-pulse" />
              <h3 className="text-base font-bold text-slate-900">Lesson Planner Ready</h3>
              <p className="text-xs text-slate-500 font-medium max-w-sm">
                Fill in your class, subject, and chapter constraints on the left and click &quot;Generate Lesson Plan&quot;.
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
