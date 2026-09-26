"use client";

import React from "react";
import { CoachProfile } from "./types";
import {
  Sparkles,
  Award,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Brain,
  Calendar,
  Layers,
  Volume2,
  Flame
} from "lucide-react";

interface Props {
  profile: CoachProfile;
  reportData?: any;
  onContinueToDashboard: () => void;
  onRetakeTest?: () => void;
}

export function AssessmentReportView({
  profile,
  reportData,
  onContinueToDashboard,
  onRetakeTest
}: Props) {
  const level = profile.overall_level || "A2";
  const score = profile.overall_score || 65;
  const skills = profile.skills || {
    speaking: 60,
    grammar: 55,
    vocabulary: 65,
    pronunciation: 60,
    fluency: 50,
    confidence: 70,
    conversation: 55
  };

  const getLevelBadgeInfo = (lvl: string) => {
    switch (lvl.toUpperCase()) {
      case "A1":
        return {
          title: "Beginner (A1)",
          desc: "You can form basic greetings and simple words. Ready to build solid sentence patterns!",
          color: "from-amber-500 to-orange-600"
        };
      case "A2":
        return {
          title: "Elementary Speaker (A2)",
          desc: "You can communicate basic daily needs. With structured practice, you'll reach conversational flow!",
          color: "from-blue-500 to-indigo-600"
        };
      case "B1":
        return {
          title: "Intermediate Conversationalist (B1)",
          desc: "You express yourself well in familiar topics. Focus on eliminating pauses and fine-tuning tenses.",
          color: "from-emerald-500 to-teal-600"
        };
      case "B2":
        return {
          title: "Fluent Communicator (B2)",
          desc: "You speak naturally with good pace. Ready for professional idioms, debate sparring, and executive pitch!",
          color: "from-purple-500 to-pink-600"
        };
      case "C1":
        return {
          title: "Advanced Mastery (C1)",
          desc: "Exceptional nuance, rich vocabulary, and effortless real-time voice fluency.",
          color: "from-rose-500 to-red-600"
        };
      default:
        return {
          title: `Proficiency Level (${lvl})`,
          desc: "Your speaking diagnostic is complete. Let's begin training your target areas!",
          color: "from-indigo-500 to-purple-600"
        };
    }
  };

  const badgeInfo = getLevelBadgeInfo(level);
  const feedback = profile.coach_feedback || reportData?.coach_feedback || {};

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
      {/* Top Congratulatory Banner */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs font-bold tracking-wide uppercase mb-3">
          <Sparkles className="w-4 h-4 text-indigo-500" />
          <span>CEFR Diagnostic Report Card</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
          Your Spoken English Assessment
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base mt-2 max-w-xl mx-auto">
          Here is your linguistic breakdown, identified strengths, root weaknesses, and custom 4-week speaking roadmap.
        </p>
      </div>

      {/* Main Level & Score Hero Card */}
      <div className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-xl shadow-slate-200/50 dark:shadow-none mb-8 relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* CEFR Level Badge */}
          <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
            <div
              className={`w-28 h-28 rounded-3xl bg-gradient-to-tr ${badgeInfo.color} text-white flex flex-col items-center justify-center shadow-xl shadow-indigo-500/20 transform hover:scale-105 transition flex-shrink-0`}
            >
              <span className="text-3xl font-black tracking-tight">{level}</span>
              <span className="text-[10px] font-bold uppercase tracking-widest mt-1 opacity-90">
                CEFR LEVEL
              </span>
            </div>

            <div>
              <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                  {badgeInfo.title}
                </h2>
                <Award className="w-5 h-5 text-indigo-500 flex-shrink-0" />
              </div>
              <p className="text-slate-600 dark:text-slate-400 text-sm max-w-md leading-relaxed">
                {badgeInfo.desc}
              </p>
            </div>
          </div>

          {/* Overall Score Dial */}
          <div className="flex items-center gap-4 bg-indigo-50/60 dark:bg-slate-800/80 border border-indigo-100 dark:border-slate-700 rounded-2xl px-6 py-4">
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-black text-indigo-600 dark:text-indigo-400">
                {score}
                <span className="text-sm font-semibold text-slate-400">/100</span>
              </div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mt-0.5">
                Speaking Score
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 7 Core Skill Rings / Progress Bars */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-lg shadow-slate-200/40 dark:shadow-none mb-8">
        <h3 className="text-lg font-black text-slate-900 dark:text-white mb-6 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <span>7 Core Spoken Competencies</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Object.entries(skills).map(([key, val]) => {
            const skillScore = Number(val) || 0;
            const label = key.charAt(0).toUpperCase() + key.slice(1);
            return (
              <div
                key={key}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    {label}
                  </span>
                  <span className="text-sm font-black text-indigo-600 dark:text-indigo-400">
                    {skillScore}%
                  </span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.max(10, skillScore))}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Personal Coach Feedback Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        <div className="bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/50 rounded-3xl p-6">
          <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold text-sm mb-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>What You Are Good At</span>
          </div>
          <p className="text-slate-700 dark:text-slate-300 text-xs sm:text-sm leading-relaxed">
            {feedback.what_you_are_good_at ||
              "You express your thoughts with natural enthusiasm and communicate clear basic ideas."}
          </p>
        </div>

        <div className="bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/50 rounded-3xl p-6">
          <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-bold text-sm mb-2">
            <AlertTriangle className="w-4 h-4" />
            <span>What We Need To Improve</span>
          </div>
          <p className="text-slate-700 dark:text-slate-300 text-xs sm:text-sm leading-relaxed">
            {feedback.what_we_need_to_improve ||
              "Mid-sentence pauses, finding the right past tense verbs, and sentence connectors."}
          </p>
        </div>

        <div className="bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-800/50 rounded-3xl p-6">
          <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400 font-bold text-sm mb-2">
            <Brain className="w-4 h-4" />
            <span>Your Target Focus</span>
          </div>
          <p className="text-slate-700 dark:text-slate-300 text-xs sm:text-sm leading-relaxed">
            {feedback.your_biggest_focus ||
              "We will build fluency through structured sentence patterns and daily 5-minute speaking challenges."}
          </p>
        </div>
      </div>

      {/* Strengths & Weaknesses Detail */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Strengths */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6">
          <h4 className="font-bold text-slate-900 dark:text-white text-base mb-4 flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
            <span>Identified Strengths</span>
          </h4>
          <ul className="space-y-2.5">
            {(profile.strengths || ["Willingness to speak without hesitation", "Comprehends spoken questions quickly"]).map(
              (st, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 flex-shrink-0" />
                  <span>{st}</span>
                </li>
              )
            )}
          </ul>
        </div>

        {/* Weaknesses */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6">
          <h4 className="font-bold text-slate-900 dark:text-white text-base mb-4 flex items-center gap-2 text-rose-600 dark:text-rose-400">
            <AlertTriangle className="w-5 h-5" />
            <span>Root Weaknesses to Train</span>
          </h4>
          <ul className="space-y-2.5">
            {(profile.weaknesses || ["Frequent pauses between phrases", "Inconsistent past tense verb forms"]).map(
              (wk, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-2 flex-shrink-0" />
                  <span>{wk}</span>
                </li>
              )
            )}
          </ul>
        </div>
      </div>

      {/* Personalized 4-Week Roadmap */}
      {profile.personalized_roadmap && profile.personalized_roadmap.length > 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-lg shadow-slate-200/40 dark:shadow-none mb-10">
          <h3 className="text-lg font-black text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span>Your Personalized 4-Week Learning Roadmap</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {profile.personalized_roadmap.map((weekItem) => (
              <div
                key={weekItem.week}
                className="p-5 rounded-2xl bg-indigo-50/50 dark:bg-slate-800/50 border border-indigo-100 dark:border-slate-700/80 flex flex-col justify-between"
              >
                <div>
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-600 text-white mb-2">
                    Week {weekItem.week}
                  </span>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-1">
                    {weekItem.theme}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {weekItem.focus}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bottom CTA to start training */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-xl shadow-indigo-600/30">
        <div>
          <h3 className="text-xl font-black">
            Ready to Begin Your Fluency Training?
          </h3>
          <p className="text-indigo-100 text-xs sm:text-sm mt-1">
            Level 1: Foundations is now unlocked with your custom speaking drills.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {onRetakeTest && (
            <button
              onClick={onRetakeTest}
              className="px-4 py-2.5 rounded-xl border border-white/30 text-white hover:bg-white/10 text-xs font-semibold transition"
            >
              Retake Test
            </button>
          )}

          <button
            onClick={onContinueToDashboard}
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-white text-indigo-700 hover:bg-indigo-50 font-bold text-sm shadow-md transition transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
          >
            <span>Start Level 1: Foundations</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
