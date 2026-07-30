"use client";

import { useState } from "react";
import { Activity, TrendingUp, Award, Clock, Target, CheckCircle2, AlertCircle } from "lucide-react";

export function ChildAnalyticsCharts() {
  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      
      {/* HEADER */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-200">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900">Child Academic Analytics & Progress</h1>
            <p className="text-xs text-slate-500">Comprehensive study trends, subject mastery, and weak topic radar</p>
          </div>
        </div>
      </div>

      {/* WEEKLY STUDY TIME & QUIZ ACCURACY CHARTS (SVG/CSS STYLED) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* WEEKLY STUDY TIME TREND */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-sm font-extrabold text-slate-900">Daily Study Hours (This Week)</h2>
            <span className="text-xs text-indigo-600 font-bold bg-indigo-50 px-2.5 py-0.5 rounded-md">Total: 14.5 Hrs</span>
          </div>

          <div className="h-44 flex items-end justify-between gap-3 pt-6 px-2">
            {[
              { day: "Mon", hrs: 2.0, pct: "50%" },
              { day: "Tue", hrs: 2.5, pct: "62%" },
              { day: "Wed", hrs: 3.0, pct: "75%" },
              { day: "Thu", hrs: 1.5, pct: "38%" },
              { day: "Fri", hrs: 2.5, pct: "62%" },
              { day: "Sat", hrs: 3.5, pct: "88%" },
              { day: "Sun", hrs: 2.0, pct: "50%" }
            ].map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                <span className="text-[10px] font-bold text-slate-600">{d.hrs}h</span>
                <div className="w-full bg-indigo-100 rounded-t-xl overflow-hidden flex items-end h-full">
                  <div className="bg-indigo-600 w-full rounded-t-xl transition-all duration-500" style={{ height: d.pct }} />
                </div>
                <span className="text-xs font-extrabold text-slate-700">{d.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* QUIZ ACCURACY TREND */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-sm font-extrabold text-slate-900">Quiz Accuracy & Mastery</h2>
            <span className="text-xs text-emerald-600 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-md">Average: 88%</span>
          </div>

          <div className="space-y-4 pt-2">
            {[
              { subject: "Science", accuracy: 94, quizzes: 8 },
              { subject: "English", accuracy: 90, quizzes: 6 },
              { subject: "Mathematics", accuracy: 84, quizzes: 10 },
              { subject: "Social Studies", accuracy: 72, quizzes: 5 }
            ].map((q, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-900">{q.subject} ({q.quizzes} Quizzes)</span>
                  <span className="text-slate-700">{q.accuracy}% Accuracy</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${q.accuracy >= 90 ? 'bg-emerald-500' : q.accuracy >= 80 ? 'bg-indigo-500' : 'bg-amber-500'}`} 
                    style={{ width: `${q.accuracy}%` }} 
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* STRENGTHS VS WEAKNESSES RADAR LIST */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-emerald-50/50 rounded-3xl p-6 border border-emerald-200 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-emerald-900 font-extrabold text-sm">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>Mastered Concepts & Strong Topics</span>
          </div>
          <ul className="space-y-2 text-xs font-bold text-slate-800">
            <li className="p-3 bg-white rounded-xl border border-emerald-100">Light Reflection & Refraction (100% Mastery)</li>
            <li className="p-3 bg-white rounded-xl border border-emerald-100">Chemical Reactions & Equations (95% Mastery)</li>
            <li className="p-3 bg-white rounded-xl border border-emerald-100">English Grammar & Sentence Transformation (90% Mastery)</li>
          </ul>
        </div>

        <div className="bg-amber-50/50 rounded-3xl p-6 border border-amber-200 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-amber-900 font-extrabold text-sm">
            <AlertCircle className="w-5 h-5 text-amber-600" />
            <span>Attention Needed (Weak Topics)</span>
          </div>
          <ul className="space-y-2 text-xs font-bold text-slate-800">
            <li className="p-3 bg-white rounded-xl border border-amber-100">Quadratic Equations Word Problems (60% Mastery)</li>
            <li className="p-3 bg-white rounded-xl border border-amber-100">History - Nationalism in India Essay Answers (65% Mastery)</li>
          </ul>
        </div>
      </div>

    </div>
  );
}
