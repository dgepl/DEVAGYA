"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Users, 
  Sparkles, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  Brain, 
  BookOpen, 
  AlertCircle, 
  Award,
  ArrowRight,
  MessageSquare,
  Activity,
  HeartHandshake
} from "lucide-react";
import { useAppStore } from "@/store/useAppStore";

export function ParentDashboard() {
  const { user, activeChildId, setActiveChildId } = useAppStore();

  const [children] = useState([
    { id: "std-1", name: "Aarav Sharma", class: "Class 10-A", school: "Apex International Academy" },
    { id: "std-2", name: "Ananya Sharma", class: "Class 7-B", school: "Apex International Academy" }
  ]);

  const selectedChild = children.find(c => c.id === activeChildId) || children[0];

  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-in fade-in duration-500">
      
      {/* PARENT DASHBOARD HEADER & CHILD SELECTOR */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 rounded-3xl border border-indigo-800/40 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-indigo-200 text-xs font-bold border border-white/10">
            <HeartHandshake className="w-3.5 h-3.5 text-rose-400" />
            <span>Parent Learning Portal & Progress Monitor</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold">
            Child Overview: <span className="text-amber-300">{selectedChild.name}</span>
          </h1>
          <p className="text-xs text-indigo-200">
            {selectedChild.class} • {selectedChild.school}
          </p>
        </div>

        {/* MULTI-CHILD SELECTOR DROPDOWN */}
        <div className="flex items-center gap-3 bg-black/40 p-3 rounded-2xl border border-white/10 shrink-0">
          <Users className="w-5 h-5 text-indigo-400" />
          <div>
            <div className="text-[10px] text-indigo-300 font-bold uppercase">Switch Child</div>
            <select
              value={activeChildId}
              onChange={(e) => setActiveChildId(e.target.value)}
              className="bg-transparent text-xs font-bold text-white focus:outline-none cursor-pointer"
            >
              {children.map((c) => (
                <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                  {c.name} ({c.class})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* METRIC OVERVIEW CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Study Time (This Week)", value: "14.5 Hours", status: "+2.5 hrs vs target", color: "text-indigo-600 bg-indigo-50 border-indigo-200", icon: Clock },
          { label: "Homework Completion", value: "92%", status: "11 of 12 Submitted", color: "text-emerald-600 bg-emerald-50 border-emerald-200", icon: CheckCircle2 },
          { label: "Attendance", value: "96.5%", status: "Regular & Punctual", color: "text-purple-600 bg-purple-50 border-purple-200", icon: Activity },
          { label: "Learning Streak", value: "7 Days", status: "Active Learning", color: "text-amber-600 bg-amber-50 border-amber-200", icon: TrendingUp }
        ].map((card, idx) => (
          <div key={idx} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">{card.label}</span>
              <div className={`w-8 h-8 rounded-xl ${card.color} border flex items-center justify-center`}>
                <card.icon className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl font-black text-slate-900">{card.value}</div>
            <span className="text-[11px] font-bold text-emerald-600">{card.status}</span>
          </div>
        ))}
      </div>

      {/* QUICK PARENT ACTION TILES */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link 
          href="/dashboard/parent/coach" 
          className="p-5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-3xl shadow-lg hover:shadow-xl transition-all flex items-center justify-between group"
        >
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300">AI Assistance</span>
            <h3 className="text-base font-extrabold">Ask AI Parenting Coach</h3>
            <p className="text-xs text-indigo-100">Get evidence-based advice to help {selectedChild.name} study.</p>
          </div>
          <ArrowRight className="w-6 h-6 text-amber-300 group-hover:translate-x-1 transition-transform" />
        </Link>

        <Link 
          href="/dashboard/parent/analytics" 
          className="p-5 bg-white border border-slate-200 rounded-3xl shadow-sm hover:border-indigo-300 transition-all flex items-center justify-between group"
        >
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">Visual Insights</span>
            <h3 className="text-base font-extrabold text-slate-900">Child Analytics & Progress</h3>
            <p className="text-xs text-slate-500">Subject mastery, weak topic radar & quiz trends.</p>
          </div>
          <ArrowRight className="w-5 h-5 text-indigo-600 group-hover:translate-x-1 transition-transform" />
        </Link>

        <Link 
          href="/dashboard/parent/notifications" 
          className="p-5 bg-white border border-slate-200 rounded-3xl shadow-sm hover:border-indigo-300 transition-all flex items-center justify-between group"
        >
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600">Real-time Feed</span>
            <h3 className="text-base font-extrabold text-slate-900">Notifications & Alerts</h3>
            <p className="text-xs text-slate-500">Homework assigned, completed quizzes & exam alerts.</p>
          </div>
          <ArrowRight className="w-5 h-5 text-rose-600 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* TWO COLUMN DETAILS: SUBJECT MASTERY & TEACHER FEEDBACK */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* SUBJECT MASTERY BREAKDOWN */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-base font-extrabold text-slate-900">Subject Performance & Mastery</h2>
            <span className="text-xs text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded-md">Updated Today</span>
          </div>

          <div className="space-y-4">
            {[
              { subject: "Science (Physics / Chem / Bio)", score: 92, status: "Excellent", color: "bg-emerald-500" },
              { subject: "English Literature & Grammar", score: 88, status: "Strong", color: "bg-indigo-500" },
              { subject: "Mathematics", score: 85, status: "Strong", color: "bg-purple-500" },
              { subject: "Social Studies", score: 74, status: "Needs Improvement", color: "bg-amber-500" }
            ].map((sub, i) => (
              <div key={i} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-900">{sub.subject}</span>
                  <span className="text-slate-700">{sub.score}% ({sub.status})</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full ${sub.color} rounded-full`} style={{ width: `${sub.score}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* TEACHER FEEDBACK & AI RECOMMENDATIONS */}
        <div className="space-y-6">
          
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-indigo-600 font-extrabold text-sm border-b border-slate-100 pb-2">
              <MessageSquare className="w-4 h-4" />
              <span>Latest Teacher Feedback</span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed font-medium bg-slate-50 p-4 rounded-2xl border border-slate-100">
              &quot;{selectedChild.name} demonstrates excellent problem-solving ability in Science. Encouraging more structured practice in History essay questions will yield top marks in upcoming term exams.&quot;
            </p>
            <span className="text-[10px] text-slate-400 font-bold block">Prof. Ananya Roy • Apex Academy</span>
          </div>

          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl p-6 border border-amber-200 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-amber-900 font-extrabold text-sm">
              <Brain className="w-4 h-4 text-amber-600" />
              <span>AI Recommended Action for Parents</span>
            </div>
            <p className="text-xs text-amber-950 leading-relaxed font-medium">
              Recommend 20 minutes of daily flashcard review in Social Studies to boost long-term retention before upcoming term exams.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}
