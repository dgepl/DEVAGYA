"use client";

import { useState } from "react";
import { Bell, CheckCircle2, Award, AlertTriangle, Info, Clock } from "lucide-react";

export function ParentNotificationCenter() {
  const [notifications] = useState([
    { id: "n1", title: "Homework Completed", message: "Aarav completed Science Worksheet #4 with 95% accuracy.", time: "2 hours ago", type: "success" },
    { id: "n2", title: "Quiz Mastered!", message: "Aarav scored 100% on Mathematics Practice Quiz on Quadratic Equations.", time: "Yesterday", type: "achievement" },
    { id: "n3", title: "Upcoming Exam Reminder", message: "Mathematics Mid-Term Unit Test is scheduled in 7 days.", time: "2 days ago", type: "warning" },
    { id: "n4", title: "Weekly Report Ready", message: "Aarav logged 14.5 study hours this week, exceeding target by 2 hours!", time: "3 days ago", type: "info" }
  ]);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-200">
            <Bell className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900">Parent Notifications Feed</h1>
            <p className="text-xs text-slate-500">Real-time alerts for assignments, quiz milestones & exam reminders</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3">
        {notifications.map((n) => (
          <div 
            key={n.id} 
            className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors flex items-start gap-3"
          >
            <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0">
              {n.type === "success" && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
              {n.type === "achievement" && <Award className="w-5 h-5 text-amber-500" />}
              {n.type === "warning" && <AlertTriangle className="w-5 h-5 text-rose-500" />}
              {n.type === "info" && <Info className="w-5 h-5 text-indigo-600" />}
            </div>

            <div className="flex-1">
              <div className="flex items-center justify-between text-xs">
                <h3 className="font-extrabold text-slate-900">{n.title}</h3>
                <span className="text-slate-400 font-medium flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {n.time}
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1 font-medium">{n.message}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
