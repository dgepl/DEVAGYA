"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Flame, 
  Trophy, 
  Sparkles, 
  Target, 
  BookOpen, 
  Clock, 
  Brain, 
  CheckCircle2, 
  ArrowRight, 
  Zap, 
  HelpCircle, 
  Layers, 
  FileText, 
  Award,
  Play,
  TrendingUp,
  Plus
} from "lucide-react";
import { useAppStore } from "@/store/useAppStore";

export function StudentDashboard() {
  const { user } = useAppStore();
  const [tasks, setTasks] = useState([
    { id: "t1", time: "04:30 PM", subject: "Science", topic: "Refraction at Spherical Surfaces", duration: "45 mins", completed: true },
    { id: "t2", time: "05:30 PM", subject: "Mathematics", topic: "Quadratic Word Problems", duration: "60 mins", completed: false },
    { id: "t3", time: "07:00 PM", subject: "English", topic: "Grammar & Letter Writing", duration: "30 mins", completed: false }
  ]);

  const toggleTask = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto">
      
      {/* GAMIFIED HERO WELCOME HEADER */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 text-white p-6 sm:p-8 shadow-2xl border border-indigo-700/50">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-indigo-200 text-xs font-bold backdrop-blur-md border border-white/10">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>DEVAGYA GLOBAL Student Self-Study Corner</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-yellow-200">{user.name}</span>! 👋
            </h1>
            <p className="text-indigo-200 text-sm max-w-xl">
              You are on a <span className="text-amber-300 font-bold">7-Day Learning Streak</span>! Complete today&apos;s goal to level up to <span className="font-bold text-white">Level 6</span>.
            </p>
          </div>

          {/* DUOLINGO STYLE XP & STREAK BADGES */}
          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            <div className="flex items-center gap-2 bg-black/30 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-amber-500/30">
              <Flame className="w-6 h-6 text-amber-400 fill-amber-400 animate-bounce" />
              <div>
                <div className="text-xs text-amber-200 font-bold uppercase tracking-wider">Streak</div>
                <div className="text-lg font-black text-amber-300">7 Days</div>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-black/30 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-indigo-400/30">
              <Zap className="w-6 h-6 text-indigo-400 fill-indigo-400" />
              <div>
                <div className="text-xs text-indigo-200 font-bold uppercase tracking-wider">XP Points</div>
                <div className="text-lg font-black text-white">480 XP</div>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-black/30 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-emerald-400/30">
              <Trophy className="w-6 h-6 text-emerald-400" />
              <div>
                <div className="text-xs text-emerald-200 font-bold uppercase tracking-wider">Leaderboard</div>
                <div className="text-lg font-black text-emerald-300">Rank #3</div>
              </div>
            </div>
          </div>
        </div>

        {/* PROGRESS BAR TO NEXT LEVEL */}
        <div className="mt-6 pt-4 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-indigo-200">Level 5 Scholar</span>
            <div className="w-48 sm:w-64 h-2.5 bg-white/10 rounded-full overflow-hidden p-0.5">
              <div className="bg-gradient-to-r from-amber-400 to-yellow-300 h-full rounded-full w-[75%]" />
            </div>
            <span className="font-bold text-amber-300">750 / 1000 XP</span>
          </div>
          <Link 
            href="/dashboard/student/tutor" 
            className="inline-flex items-center gap-1.5 font-bold text-amber-300 hover:text-white transition-colors"
          >
            <span>Continue Socratic Study</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* QUICK LAUNCH ACTION TILES */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
        {[
          { label: "Socratic AI", href: "/dashboard/student/tutor", icon: Brain, color: "bg-indigo-500/10 text-indigo-600 border-indigo-200", badge: "AI Tutor" },
          { label: "Practice Quiz", href: "/dashboard/student/practice", icon: Target, color: "bg-emerald-500/10 text-emerald-600 border-emerald-200", badge: "9 Types" },
          { label: "Flashcards", href: "/dashboard/student/flashcards", icon: Layers, color: "bg-amber-500/10 text-amber-600 border-amber-200", badge: "Spaced Rep" },
          { label: "Revision Studio", href: "/dashboard/student/revision", icon: BookOpen, color: "bg-purple-500/10 text-purple-600 border-purple-200", badge: "Mind Maps" },
          { label: "AI Exam Prep", href: "/dashboard/student/exam-prep", icon: Trophy, color: "bg-rose-500/10 text-rose-600 border-rose-200", badge: "Mock Tests" },
          { label: "Notion Notes", href: "/dashboard/student/notes", icon: FileText, color: "bg-blue-500/10 text-blue-600 border-blue-200", badge: "Smart Notes" }
        ].map((item, idx) => (
          <Link
            key={idx}
            href={item.href}
            className={`p-4 rounded-2xl border bg-white shadow-sm hover:shadow-md transition-all flex flex-col items-center text-center group relative overflow-hidden`}
          >
            <div className={`w-12 h-12 rounded-2xl ${item.color} flex items-center justify-center mb-3 border group-hover:scale-110 transition-transform`}>
              <item.icon className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-slate-800">{item.label}</span>
            <span className="text-[10px] text-slate-400 font-medium mt-0.5">{item.badge}</span>
          </Link>
        ))}
      </div>

      {/* MAIN TWO-COLUMN DASHBOARD GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT 2-COLUMN: STUDY PLAN & HOMEWORK */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* TODAY'S STUDY PLAN & TASKS */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Today&apos;s Study Plan</h2>
                  <p className="text-xs text-slate-500">AI auto-generated schedule based on weak subjects</p>
                </div>
              </div>
              <Link 
                href="/dashboard/student/planner" 
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
              >
                <span>Full Schedule</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3">
              {tasks.map((task) => (
                <div 
                  key={task.id}
                  onClick={() => toggleTask(task.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    task.completed 
                      ? "bg-slate-50 border-slate-200 opacity-60 line-through"
                      : "bg-white border-slate-200 hover:border-indigo-300 hover:shadow-sm"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <button className={`w-6 h-6 rounded-full border flex items-center justify-center transition-colors ${
                      task.completed ? "bg-emerald-500 border-emerald-500 text-white" : "border-slate-300 text-transparent"
                    }`}>
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-extrabold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                          {task.subject}
                        </span>
                        <span className="text-xs text-slate-400 font-medium">{task.time} ({task.duration})</span>
                      </div>
                      <p className="text-sm font-bold text-slate-800 mt-1">{task.topic}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-xl">
                      +20 XP
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI RECOMMENDATIONS & WEAK TOPICS */}
          <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-white rounded-3xl p-6 border border-indigo-100 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md">
                <Brain className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-slate-900">Personalized AI Recommendations</h2>
                <p className="text-xs text-slate-500">Based on your recent quiz attempts & homework speed</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-2xl border border-indigo-100 shadow-sm space-y-2">
                <span className="text-[10px] font-bold uppercase text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">Weak Topic Alert</span>
                <h3 className="text-xs font-extrabold text-slate-900">Quadratic Equations Word Problems</h3>
                <p className="text-xs text-slate-500">Your score was 60% on yesterday&apos;s drill. Practice with Socratic AI hints.</p>
                <Link 
                  href="/dashboard/student/tutor" 
                  className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:underline pt-1"
                >
                  <span>Start Socratic Drill</span>
                  <Play className="w-3 h-3 fill-indigo-600" />
                </Link>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-indigo-100 shadow-sm space-y-2">
                <span className="text-[10px] font-bold uppercase text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">High Yield Exam Focus</span>
                <h3 className="text-xs font-extrabold text-slate-900">Physics Ray Diagram Formulae</h3>
                <p className="text-xs text-slate-500">Expected 12 marks in upcoming board exam. Flashcard deck ready.</p>
                <Link 
                  href="/dashboard/student/flashcards" 
                  className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 hover:underline pt-1"
                >
                  <span>Open Flashcards</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: BADGES, POMODORO TIMER & RECENT NOTES */}
        <div className="space-y-8">
          
          {/* POMODORO FOCUS TIMER CARD */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4 text-center">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-indigo-600" />
                <h2 className="text-sm font-extrabold text-slate-900">Pomodoro Focus Timer</h2>
              </div>
              <span className="text-xs text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">25 Mins</span>
            </div>

            <div className="py-4">
              <div className="w-32 h-32 mx-auto rounded-full border-4 border-indigo-600/20 flex items-center justify-center relative bg-indigo-50/50">
                <span className="text-3xl font-black text-indigo-900 tracking-wider">25:00</span>
              </div>
            </div>

            <Link
              href="/dashboard/student/timer"
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Start Focus Session</span>
            </Link>
          </div>

          {/* ACHIEVEMENTS & BADGES */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-500" />
                <h2 className="text-sm font-extrabold text-slate-900">Recent Badges</h2>
              </div>
              <span className="text-xs text-slate-400 font-bold">3 Unlocked</span>
            </div>

            <div className="space-y-3">
              {[
                { title: "7-Day Warrior", icon: Flame, color: "text-amber-500 bg-amber-50 border-amber-200", desc: "Studied 7 days in a row" },
                { title: "Quiz Master", icon: Trophy, color: "text-indigo-500 bg-indigo-50 border-indigo-200", desc: "Scored 100% on 5 quizzes" },
                { title: "Socratic Thinker", icon: Brain, color: "text-purple-500 bg-purple-50 border-purple-200", desc: "Used Socratic AI 10 times" }
              ].map((badge, i) => (
                <div key={i} className="flex items-center gap-3 p-2.5 rounded-2xl border border-slate-100 bg-slate-50/50">
                  <div className={`w-10 h-10 rounded-xl ${badge.color} border flex items-center justify-center shrink-0`}>
                    <badge.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">{badge.title}</h3>
                    <p className="text-[11px] text-slate-500">{badge.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RECENT NOTION NOTES */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <h2 className="text-sm font-extrabold text-slate-900">Recent Smart Notes</h2>
              </div>
              <Link href="/dashboard/student/notes" className="text-xs font-bold text-blue-600 hover:underline">View All</Link>
            </div>

            <div className="space-y-2">
              {[
                { title: "Light Reflection & Ray Diagrams", subject: "Science", date: "Today" },
                { title: "Quadratic Formula & Discriminant", subject: "Math", date: "Yesterday" }
              ].map((note, idx) => (
                <Link 
                  key={idx} 
                  href="/dashboard/student/notes"
                  className="p-3 rounded-xl border border-slate-100 bg-slate-50 hover:bg-slate-100 transition-colors flex items-center justify-between"
                >
                  <div>
                    <p className="text-xs font-bold text-slate-900">{note.title}</p>
                    <span className="text-[10px] text-slate-400 font-medium">{note.subject} • {note.date}</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                </Link>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
