"use client";

import { useState } from "react";
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Sparkles, 
  Plus, 
  CheckCircle2, 
  BookOpen, 
  Brain, 
  Target, 
  ArrowRight,
  RefreshCw
} from "lucide-react";
import { generateStudyPlanner } from "@/lib/api";

export function StudyPlanner() {
  const [period, setPeriod] = useState<"daily" | "weekly" | "monthly" | "exam">("weekly");
  const [availableHours, setAvailableHours] = useState(3.5);
  const [loading, setLoading] = useState(false);
  const [scheduleData, setScheduleData] = useState<any>({
    period: "weekly",
    total_study_hours: 21,
    daily_breakdown: [
      {
        day: "Monday",
        focus_subject: "Mathematics",
        tasks: [
          { time: "04:30 PM - 05:30 PM", topic: "Quadratic Formula Practice", type: "practice_quiz", completed: true },
          { time: "05:45 PM - 06:30 PM", topic: "Weak Topic Socratic Drill", type: "socratic_tutor", completed: false }
        ]
      },
      {
        day: "Tuesday",
        focus_subject: "Science",
        tasks: [
          { time: "04:30 PM - 05:30 PM", topic: "Optics Ray Diagrams", type: "revision", completed: false },
          { time: "05:45 PM - 06:30 PM", topic: "Physics Flashcard Spaced Repetition", type: "flashcards", completed: false }
        ]
      },
      {
        day: "Wednesday",
        focus_subject: "English & Social Studies",
        tasks: [
          { time: "04:30 PM - 05:30 PM", topic: "Grammar Rules & Essay Writing", type: "notes", completed: false },
          { time: "05:45 PM - 06:30 PM", topic: "History Timeline Revision", type: "revision", completed: false }
        ]
      }
    ],
    ai_tips: [
      "Schedule weak topics during peak energy hours (4:30 PM - 6:00 PM).",
      "Use Pomodoro 25-min timers with 5-min rest breaks to maintain peak mental retention."
    ]
  });

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await generateStudyPlanner({
        available_hours_per_day: availableHours,
        weak_subjects: ["Mathematics", "History"],
        target_period: period
      });
      setScheduleData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      
      {/* HEADER & AI AUTO-GEN CONTROLS */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-200">
            <CalendarIcon className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900">AI Personal Study Planner</h1>
            <p className="text-xs text-slate-500">Auto-schedules study hours based on weak topics, homework, and exam dates.</p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
            {(["daily", "weekly", "monthly", "exam"] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                  period === p ? "bg-indigo-600 text-white shadow-sm" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-2xl shadow-md transition-all flex items-center gap-1.5"
          >
            {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-amber-300" />}
            <span>Auto-Generate Plan</span>
          </button>
        </div>
      </div>

      {/* AI PLANNER TIPS BANNER */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white p-6 rounded-3xl border border-purple-700/40 shadow-xl space-y-3">
        <div className="flex items-center gap-2 text-xs font-extrabold text-amber-300 uppercase tracking-wider">
          <Brain className="w-4 h-4" />
          <span>AI Schedule Optimization Strategy</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {scheduleData.ai_tips?.map((tip: string, idx: number) => (
            <div key={idx} className="flex items-start gap-2 bg-white/10 p-3 rounded-2xl border border-white/10 text-xs text-indigo-100 font-medium">
              <span className="text-amber-400 font-bold">•</span>
              <span>{tip}</span>
            </div>
          ))}
        </div>
      </div>

      {/* BREAKDOWN BY DAYS GRID */}
      <div className="space-y-6">
        {scheduleData.daily_breakdown?.map((dayPlan: any, dIdx: number) => (
          <div key={dIdx} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 font-extrabold text-xs flex items-center justify-center border border-indigo-100">
                  {dIdx + 1}
                </span>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">{dayPlan.day}</h3>
                  <span className="text-xs text-indigo-600 font-bold bg-indigo-50 px-2.5 py-0.5 rounded-md">
                    Focus: {dayPlan.focus_subject}
                  </span>
                </div>
              </div>

              <div className="text-xs text-slate-500 font-medium">
                {dayPlan.tasks?.length} Planned Tasks
              </div>
            </div>

            <div className="space-y-3">
              {dayPlan.tasks?.map((task: any, tIdx: number) => (
                <div key={tIdx} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full border-2 border-indigo-600 flex items-center justify-center text-transparent">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">{task.topic}</span>
                        <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md capitalize">
                          {task.type.replace('_', ' ')}
                        </span>
                      </div>
                      <span className="text-xs text-slate-500 font-medium flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{task.time}</span>
                      </span>
                    </div>
                  </div>

                  <button className="px-3 py-1.5 bg-white hover:bg-indigo-50 text-indigo-600 border border-slate-200 hover:border-indigo-200 rounded-xl text-xs font-bold transition-colors">
                    Start Session
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
