"use client";

import React, { useState, useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";
import {
  CoachProfile,
  CoachLevel,
  CoachActivity,
  CoachView
} from "./types";
import {
  fetchCoachProfile,
  fetchCoachLevels,
  resetCoachProfile
} from "@/lib/api";
import { DiagnosticAssessment } from "./DiagnosticAssessment";
import { AssessmentReportView } from "./AssessmentReportView";
import { CoachDashboard } from "./CoachDashboard";
import { LevelRoadmapView } from "./LevelRoadmapView";
import { ActivityPlayer } from "./ActivityPlayer";
import { LiveVoiceConversation } from "./LiveVoiceConversation";
import {
  Sparkles,
  Award,
  ArrowRight,
  ShieldCheck,
  Brain,
  Volume2,
  Mic,
  BookOpen,
  TrendingUp,
  RotateCcw
} from "lucide-react";

export function EnglishCoachContainer() {
  const { user } = useAppStore();
  const userId = user?.id || (typeof window !== "undefined" ? localStorage.getItem("devgya_user_id") || "guest_learner" : "guest_learner");
  const userRole = user?.role || "student";
  const userName = user?.name || "Learner";

  const [view, setView] = useState<CoachView>("dashboard");
  const [profile, setProfile] = useState<CoachProfile | null>(null);
  const [levels, setLevels] = useState<CoachLevel[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<CoachLevel | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<CoachActivity | null>(null);
  const [latestReportData, setLatestReportData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Initial data loading
  useEffect(() => {
    loadData();
  }, [userId, userRole]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [profRes, lvlRes] = await Promise.all([
        fetchCoachProfile(userId, userRole, userName),
        fetchCoachLevels(userId, userRole)
      ]);

      if (profRes.profile) {
        setProfile(profRes.profile);
        if (!profRes.profile.has_taken_diagnostic) {
          setView("welcome");
        } else {
          setView("dashboard");
        }
      }

      if (lvlRes.levels) {
        setLevels(lvlRes.levels);
      }
    } catch (err) {
      console.error("Failed to load coach data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDiagnosticComplete = (newProfile: CoachProfile, report: any) => {
    setProfile(newProfile);
    setLatestReportData(report);
    setView("report");
    // Reload levels
    fetchCoachLevels(userId, userRole).then((res) => {
      if (res.levels) setLevels(res.levels);
    });
  };

  const handleRetakeDiagnostic = async () => {
    if (
      !confirm(
        "Are you sure you want to retake your Spoken Diagnostic Assessment? This will reset your current progress so you can be re-evaluated."
      )
    ) {
      return;
    }

    try {
      setLoading(true);
      const res = await resetCoachProfile(userId, userRole);
      if (res.profile) {
        setProfile(res.profile);
      }
      setView("diagnostic");
    } catch (err: any) {
      console.error("Failed to reset profile:", err);
      alert(err.message || "Failed to reset.");
    } finally {
      setLoading(false);
    }
  };

  const handleStartActivity = (level: CoachLevel, activity: CoachActivity) => {
    setSelectedLevel(level);
    setSelectedActivity(activity);
    setView("activity");
  };

  const handleActivityFinished = (result: any) => {
    // Refresh state & go to dashboard
    loadData();
    setView("dashboard");
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] text-center p-6">
        <div className="w-14 h-14 border-4 border-indigo-500/30 border-t-indigo-600 rounded-full animate-spin mb-4" />
        <h3 className="text-xl font-bold text-slate-800 dark:text-white">
          Loading Your AI English Coach...
        </h3>
        <p className="text-slate-500 text-xs mt-1">
          Synchronizing personalized learning track & voice models.
        </p>
      </div>
    );
  }

  // 1. WELCOME SCREEN (When user has not yet taken the diagnostic assessment)
  if (view === "welcome") {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 sm:py-16 text-center">
        {/* Glow & Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs font-bold tracking-wide uppercase mb-6 shadow-sm">
          <Sparkles className="w-4 h-4 text-indigo-600" />
          <span>Personal AI English Speaking Coach</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight mb-4">
          Master Fluent Spoken English with Your Personal AI Coach
        </h1>

        <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base max-w-2xl mx-auto mb-10 leading-relaxed">
          Not another generic grammar course. Our AI listens to your voice, identifies your exact speaking weaknesses, and guides you through 5 progressive locked levels until you speak naturally and confidently.
        </p>

        {/* 3 Step Diagnostic Flow Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 text-left">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-black text-lg mb-4">
              1
            </div>
            <h3 className="font-black text-slate-900 dark:text-white text-base mb-1">
              10-Question Voice Test
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Answer 10 short spoken prompts covering daily life, past experiences, storytelling, and opinions.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center font-black text-lg mb-4">
              2
            </div>
            <h3 className="font-black text-slate-900 dark:text-white text-base mb-1">
              Deep CEFR Evaluation
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              AI evaluates fluency, grammar, vocabulary, pronunciation, and confidence to find your root weaknesses.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-pink-50 dark:bg-pink-950/60 text-pink-600 dark:text-pink-400 flex items-center justify-center font-black text-lg mb-4">
              3
            </div>
            <h3 className="font-black text-slate-900 dark:text-white text-base mb-1">
              5 Locked Levels
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Progress step-by-step through daily targeted speaking drills up to real-time voice conversation with AI.
            </p>
          </div>
        </div>

        {/* Start Diagnostic Assessment Button */}
        <button
          onClick={() => setView("diagnostic")}
          className="px-10 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:to-pink-700 text-white font-extrabold text-base shadow-xl shadow-indigo-600/30 transition transform hover:scale-105 inline-flex items-center gap-2.5"
        >
          <Mic className="w-5 h-5" />
          <span>Start Spoken Diagnostic Assessment (5 mins)</span>
          <ArrowRight className="w-5 h-5" />
        </button>

        <p className="text-slate-400 text-xs mt-4">
          Microphone access recommended. Text fallback is also supported.
        </p>
      </div>
    );
  }

  // 2. DIAGNOSTIC ASSESSMENT VIEW
  if (view === "diagnostic") {
    return (
      <DiagnosticAssessment
        userId={userId}
        userRole={userRole}
        userName={userName}
        onComplete={handleDiagnosticComplete}
        onCancel={() => {
          if (profile?.has_taken_diagnostic) {
            setView("dashboard");
          } else {
            setView("welcome");
          }
        }}
      />
    );
  }

  // 3. REPORT CARD VIEW
  if (view === "report" && profile) {
    return (
      <AssessmentReportView
        profile={profile}
        reportData={latestReportData}
        onContinueToDashboard={() => setView("dashboard")}
        onRetakeTest={handleRetakeDiagnostic}
      />
    );
  }

  // 4. ROADMAP LADDER VIEW
  if (view === "roadmap" && profile) {
    return (
      <LevelRoadmapView
        levels={levels}
        currentLevelNumber={profile.current_level || 1}
        onSelectActivity={handleStartActivity}
        onBackToDashboard={() => setView("dashboard")}
      />
    );
  }

  // 5. ACTIVITY PLAYER VIEW
  if (view === "activity" && selectedLevel && selectedActivity) {
    return (
      <ActivityPlayer
        level={selectedLevel}
        activity={selectedActivity}
        userId={userId}
        userRole={userRole}
        onActivityFinished={handleActivityFinished}
        onBack={() => setView("roadmap")}
      />
    );
  }

  // 6. LIVE VOICE CONVERSATION LOUNGE (Level 5)
  if (view === "live_voice") {
    return (
      <LiveVoiceConversation
        userId={userId}
        userRole={userRole}
        onBack={() => setView("dashboard")}
      />
    );
  }

  // 7. DASHBOARD (Default view)
  if (profile) {
    return (
      <CoachDashboard
        profile={profile}
        levels={levels}
        onStartActivity={handleStartActivity}
        onOpenRoadmap={() => setView("roadmap")}
        onOpenReport={() => setView("report")}
        onOpenLiveVoice={() => setView("live_voice")}
        onRetakeDiagnostic={handleRetakeDiagnostic}
      />
    );
  }

  return null;
}
