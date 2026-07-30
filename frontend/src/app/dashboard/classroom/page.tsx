"use client";

import { useState } from "react";
import { Gamepad2 } from "lucide-react";

export default function ClassroomAssistantPage() {
  const [activeTab, setActiveTab] = useState("icebreakers");

  const activities = {
    icebreakers: [
      { title: "Two Truths & A Scientific Myth", duration: "10 Mins", desc: "Students share two real science facts and one common misconception." },
      { title: "Formula Speed Dating", duration: "12 Mins", desc: "Pairs explain one formula to each other in 60 seconds before swapping partners." }
    ],
    games: [
      { title: "NCERT Bingo Challenge", duration: "15 Mins", desc: "Interactive grid game covering key chapter terms and definitions." },
      { title: "Jeopardy Science Bowl", duration: "20 Mins", desc: "Team-based trivia categorizing questions by difficulty and mark weightage." }
    ],
    discussions: [
      { title: "AI vs Human Creativity Debate", duration: "15 Mins", desc: "Structured debate on technological advancements and ethics." },
      { title: "Environmental Conservation Forum", duration: "20 Mins", desc: "Group discussions evaluating local ecological challenges." }
    ]
  };

  return (
    <div className="space-y-8">
      
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
          <Gamepad2 className="w-6 h-6 text-indigo-600" />
          AI Classroom Assistant
        </h1>
        <p className="text-xs text-slate-500 font-semibold">Interactive Icebreakers, Educational Games, and Group Discussion prompts</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-3 border-b border-slate-200 pb-3">
        {[
          { key: "icebreakers", label: "Icebreakers & Warm-ups" },
          { key: "games", label: "Educational Games" },
          { key: "discussions", label: "Group Discussions" }
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === t.key ? "bg-indigo-600 text-white shadow-glow" : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-100"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {(activities[activeTab as keyof typeof activities] || []).map((act, idx) => (
          <div key={idx} className="glass-panel p-6 rounded-3xl border border-slate-200 space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-wide">{activeTab}</span>
              <span className="text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-200 px-2.5 py-0.5 rounded-full font-bold">
                {act.duration}
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-900">{act.title}</h3>
            <p className="text-xs text-slate-600 font-medium leading-relaxed">{act.desc}</p>
          </div>
        ))}
      </div>

    </div>
  );
}
