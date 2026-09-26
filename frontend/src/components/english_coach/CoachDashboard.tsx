"use client";

import React from "react";
import { CoachProfile, CoachLevel, CoachActivity } from "./types";
import {
  Flame,
  Star,
  BookOpen,
  ArrowRight,
  Play,
  Award,
  Sparkles,
  Map,
  FileText,
  Mic,
  RotateCcw,
  CheckCircle2,
  Lock,
  ChevronRight,
  TrendingUp,
  Volume2
} from "lucide-react";

interface Props {
  profile: CoachProfile;
  levels: CoachLevel[];
  onStartActivity: (level: CoachLevel, activity: CoachActivity) => void;
  onOpenRoadmap: () => void;
  onOpenReport: () => void;
  onOpenLiveVoice: () => void;
  onRetakeDiagnostic: () => void;
}

export function CoachDashboard({
  profile,
  levels,
  onStartActivity,
  onOpenRoadmap,
  onOpenReport,
  onOpenLiveVoice,
  onRetakeDiagnostic
}: Props) {
  const currentLvlNum = profile.current_level || 1;
  const currentLevel = levels.find((l) => l.level_number === currentLvlNum) || levels[0];

  // Find next uncompleted activity
  let nextActivity: CoachActivity | null = null;
  let nextLevel: CoachLevel = currentLevel;

  if (currentLevel && currentLevel.activities) {
    nextActivity = currentLevel.activities.find((a) => !a.is_completed) || null;
  }

  // If all completed in current level, check next unlocked level
  if (!nextActivity) {
    const higherUnlocked = levels.find(
      (l) => l.level_number > currentLvlNum && l.is_unlocked && l.activities.some((a) => !a.is_completed)
    );
    if (higherUnlocked) {
      nextLevel = higherUnlocked;
      nextActivity = higherUnlocked.activities.find((a) => !a.is_completed) || null;
    }
  }

  // Fallback to first activity of current level
  if (!nextActivity && currentLevel?.activities?.length) {
    nextActivity = currentLevel.activities[0];
  }

  const isLevel5Unlocked = profile.unlocked_levels?.includes(5);

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 sm:py-10">
      {/* Top Welcome Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
              CEFR {profile.overall_level || "A2"}
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Level {currentLvlNum} of 5 Active
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Welcome back, {profile.user_name || "Learner"}!
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-0.5">
            Your personal AI Speaking Coach is ready for today&apos;s daily speaking drills.
          </p>
        </div>

        {/* Daily Stats Badges */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300">
            <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
            <div className="text-left">
              <div className="text-xs font-black">{profile.daily_streak || 1} Days</div>
              <div className="text-[10px] text-amber-600/80 dark:text-amber-400/80 font-medium">Streak</div>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-indigo-800 dark:text-indigo-300">
            <Star className="w-4 h-4 text-indigo-500 fill-indigo-500" />
            <div className="text-left">
              <div className="text-xs font-black">{profile.xp || 0} XP</div>
              <div className="text-[10px] text-indigo-600/80 dark:text-indigo-400/80 font-medium">Earned</div>
            </div>
          </div>
        </div>
      </div>

      {/* Hero: "What Should I Practice Today?" Card */}
      {nextActivity && (
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-indigo-600/20 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-bold tracking-wide uppercase mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Recommended Practice for Today</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black mb-2 leading-tight">
                {nextActivity.title}
              </h2>
              <p className="text-indigo-100 text-xs sm:text-sm max-w-xl leading-relaxed mb-4">
                {nextActivity.instructions}
              </p>

              <div className="flex flex-wrap items-center gap-3 text-xs text-indigo-100">
                <span className="px-2.5 py-1 rounded-xl bg-white/15">
                  ⏱️ {nextActivity.duration}
                </span>
                <span className="px-2.5 py-1 rounded-xl bg-white/15">
                  ⭐ +{nextActivity.xp} XP
                </span>
                <span className="px-2.5 py-1 rounded-xl bg-white/15">
                  🏷️ Stage: Level {nextLevel?.level_number} ({nextLevel?.title})
                </span>
              </div>
            </div>

            <button
              onClick={() => onStartActivity(nextLevel, nextActivity!)}
              className="self-start md:self-center px-8 py-4 rounded-2xl bg-white hover:bg-indigo-50 text-indigo-700 font-extrabold text-sm shadow-xl transition transform hover:scale-105 flex items-center gap-2.5 flex-shrink-0"
            >
              <Play className="w-4 h-4 fill-indigo-700" />
              <span>Start Activity Now</span>
            </button>
          </div>
        </div>
      )}

      {/* 3 Core Questions Dashboard Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Card 1: Where am I? & How close am I to the next level? */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-black text-slate-900 dark:text-white text-base flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-600" />
              <span>Current Level Progress</span>
            </h3>
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
              Level {currentLvlNum} of 5
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                <span>{currentLevel?.title}</span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400">
                  {currentLevel?.progress_percentage || 0}%
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-500"
                  style={{ width: `${currentLevel?.progress_percentage || 0}%` }}
                />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-2">
                🔒 Next Level Unlock Criteria:
              </div>
              <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1.5">
                <li className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${((currentLevel?.progress_percentage || 0) >= 80) ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-600"}`} />
                  <span>Reach 80% activities completion ({currentLevel?.completed_activities_count || 0}/{currentLevel?.total_activities_count || 0})</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${currentLevel?.capstone_passed ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-600"}`} />
                  <span>Pass Level {currentLvlNum} Capstone Spoken Exam ({currentLevel?.pass_percentage || 80}%+)</span>
                </li>
              </ul>
            </div>

            <button
              onClick={onOpenRoadmap}
              className="w-full py-2.5 rounded-xl border border-indigo-200 dark:border-indigo-800/80 text-indigo-600 dark:text-indigo-400 font-bold text-xs hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition flex items-center justify-center gap-1.5"
            >
              <span>View Full 5-Level Roadmap</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Card 2: Identified Weaknesses & Personalized Focus */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-black text-slate-900 dark:text-white text-base flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                <span>Coach Target Focus Areas</span>
              </h3>
              <button
                onClick={onOpenReport}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
              >
                View Report
              </button>
            </div>

            <div className="space-y-2 mb-4">
              {(profile.priority_focus || ["Speaking Fluency", "Sentence Formation", "Everyday Vocabulary"]).map(
                (f, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2.5 p-2.5 rounded-xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/40 text-xs font-semibold text-purple-900 dark:text-purple-300"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                    <span>{f}</span>
                  </div>
                )
              )}
            </div>

            {profile.coach_feedback?.what_we_need_to_improve && (
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed italic bg-slate-50 dark:bg-slate-800/40 p-3 rounded-2xl">
                &ldquo;{profile.coach_feedback.what_we_need_to_improve}&rdquo;
              </p>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Diagnosed: CEFR {profile.overall_level}</span>
            <button
              onClick={onRetakeDiagnostic}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center gap-1 transition"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Retake Diagnostic</span>
            </button>
          </div>
        </div>
      </div>

      {/* Live AI Voice Conversation Lounge (Level 5 Teaser or Launcher) */}
      <div
        className={`rounded-3xl p-6 sm:p-8 border transition-all ${
          isLevel5Unlocked
            ? "bg-gradient-to-r from-rose-500 via-pink-600 to-purple-600 text-white shadow-xl shadow-rose-500/20"
            : "bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800"
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                isLevel5Unlocked
                  ? "bg-white text-rose-600 shadow-md"
                  : "bg-slate-200 dark:bg-slate-800 text-slate-400"
              }`}
            >
              <Mic className="w-7 h-7" />
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={`text-xs font-bold uppercase tracking-wider ${
                    isLevel5Unlocked ? "text-rose-100" : "text-slate-400"
                  }`}
                >
                  Level 5 • Real-Time Voice Partner
                </span>
                {!isLevel5Unlocked && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center gap-1">
                    <Lock className="w-2.5 h-2.5" />
                    Locked
                  </span>
                )}
              </div>
              <h3
                className={`text-lg sm:text-xl font-black ${
                  isLevel5Unlocked ? "text-white" : "text-slate-800 dark:text-slate-200"
                }`}
              >
                AI Conversation Mastery Lounge
              </h3>
              <p
                className={`text-xs sm:text-sm mt-0.5 max-w-lg ${
                  isLevel5Unlocked
                    ? "text-rose-100"
                    : "text-slate-500 dark:text-slate-400"
                }`}
              >
                {isLevel5Unlocked
                  ? "Practice natural, continuous voice conversation with your AI coach anytime on casual, intermediate, or advanced debate topics."
                  : "Complete Levels 1 to 4 to unlock 1-on-1 real-time voice conversation with native fluency feedback."}
              </p>
            </div>
          </div>

          {isLevel5Unlocked ? (
            <button
              onClick={onOpenLiveVoice}
              className="px-6 py-3.5 rounded-2xl bg-white text-rose-600 font-extrabold text-sm shadow-lg hover:bg-rose-50 transition transform hover:scale-105 flex items-center justify-center gap-2 flex-shrink-0"
            >
              <Volume2 className="w-4 h-4" />
              <span>Enter Voice Lounge</span>
            </button>
          ) : (
            <button
              onClick={onOpenRoadmap}
              className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400 font-semibold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center justify-center gap-1 flex-shrink-0"
            >
              <span>View Level 5 Requirements</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
