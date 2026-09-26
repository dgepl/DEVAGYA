"use client";

import React from "react";
import { CoachLevel, CoachActivity } from "./types";
import {
  Lock,
  Unlock,
  CheckCircle2,
  ArrowRight,
  Flame,
  Award,
  Sparkles,
  Play,
  Clock,
  Star,
  ShieldAlert,
  Mic
} from "lucide-react";

interface Props {
  levels: CoachLevel[];
  currentLevelNumber: number;
  onSelectActivity: (level: CoachLevel, activity: CoachActivity) => void;
  onBackToDashboard: () => void;
}

export function LevelRoadmapView({
  levels,
  currentLevelNumber,
  onSelectActivity,
  onBackToDashboard
}: Props) {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <button
            onClick={onBackToDashboard}
            className="text-xs font-semibold text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 mb-2 inline-flex items-center gap-1"
          >
            ← Back to Coach Dashboard
          </button>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            5-Level Progressive Mastery Roadmap
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-1">
            Complete activities and pass each level capstone exam to unlock the next progressive stage.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <span className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 font-bold text-xs">
            Current Stage: Level {currentLevelNumber}
          </span>
        </div>
      </div>

      {/* Levels Stack */}
      <div className="space-y-6">
        {levels.map((lvl) => {
          const isUnlocked = lvl.is_unlocked;
          const isCompleted = lvl.is_completed;
          const isCurrent = lvl.level_number === currentLevelNumber;

          return (
            <div
              key={lvl.level_number}
              className={`rounded-3xl border transition-all duration-300 overflow-hidden ${
                isCurrent
                  ? "bg-white dark:bg-slate-900 border-indigo-500/50 shadow-xl shadow-indigo-500/10 ring-2 ring-indigo-500/20"
                  : isUnlocked
                  ? "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-md"
                  : "bg-slate-50/70 dark:bg-slate-900/40 border-slate-200/60 dark:border-slate-800/60 opacity-80"
              }`}
            >
              {/* Level Header Bar */}
              <div className="p-6 sm:p-7 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-start sm:items-center gap-4">
                  {/* Level Number Indicator */}
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl flex-shrink-0 shadow-md ${
                      isCompleted
                        ? "bg-emerald-500 text-white shadow-emerald-500/20"
                        : isUnlocked
                        ? "bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-indigo-500/20"
                        : "bg-slate-200 dark:bg-slate-800 text-slate-400"
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-7 h-7" />
                    ) : isUnlocked ? (
                      lvl.level_number
                    ) : (
                      <Lock className="w-6 h-6" />
                    )}
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                        Level {lvl.level_number}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {lvl.badge}
                      </span>
                      {isCurrent && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-indigo-600 text-white animate-pulse">
                          Active Level
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                      {lvl.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                      {lvl.tagline}
                    </p>
                  </div>
                </div>

                {/* Level Progress & Lock Status */}
                <div className="flex flex-col items-start md:items-end justify-center min-w-[200px]">
                  {isUnlocked ? (
                    <div className="w-full">
                      <div className="flex justify-between items-center text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                        <span>Progress</span>
                        <span className="text-indigo-600 dark:text-indigo-400 font-bold">
                          {lvl.progress_percentage}% ({lvl.completed_activities_count}/{lvl.total_activities_count})
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-500"
                          style={{ width: `${lvl.progress_percentage}%` }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-200/60 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 text-xs font-medium">
                      <Lock className="w-3.5 h-3.5" />
                      <span>{lvl.unlock_requirement}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Activity List Accordion / Grid (Shown for unlocked levels) */}
              {isUnlocked && (
                <div className="border-t border-slate-100 dark:border-slate-800/80 p-6 bg-slate-50/50 dark:bg-slate-900/30">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center justify-between">
                    <span>Curriculum Activities ({lvl.activities.length})</span>
                    <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold lowercase">
                      pass mark: {lvl.pass_percentage}%
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {lvl.activities.map((act) => {
                      const isActDone = !!act.is_completed;
                      const isCapstone = act.type === "level_capstone_test";

                      return (
                        <div
                          key={act.id}
                          onClick={() => onSelectActivity(lvl, act)}
                          className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                            isActDone
                              ? "bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200/70 dark:border-emerald-800/40 hover:border-emerald-400"
                              : isCapstone
                              ? "bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/20 dark:to-indigo-950/20 border-purple-200 dark:border-purple-800 hover:border-purple-400 shadow-sm"
                              : "bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700/70 hover:border-indigo-400 hover:shadow-md"
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div
                              className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                                isActDone
                                  ? "bg-emerald-500 text-white"
                                  : isCapstone
                                  ? "bg-purple-600 text-white"
                                  : "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400"
                              }`}
                            >
                              {isActDone ? (
                                <CheckCircle2 className="w-5 h-5" />
                              ) : isCapstone ? (
                                <Award className="w-5 h-5" />
                              ) : (
                                <Play className="w-4 h-4 ml-0.5" />
                              )}
                            </div>

                            <div className="min-w-0">
                              <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                                {act.title}
                              </h4>
                              <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                                <span>{act.duration}</span>
                                <span>•</span>
                                <span className="text-amber-600 dark:text-amber-400 font-semibold">
                                  +{act.xp} XP
                                </span>
                              </div>
                            </div>
                          </div>

                          <ArrowRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
