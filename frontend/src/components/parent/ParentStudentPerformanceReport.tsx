"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  TrendingUp, 
  Award, 
  BookOpen, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight, 
  Sparkles, 
  RefreshCw, 
  User, 
  BarChart3, 
  ArrowRight,
  Brain,
  Layers,
  GraduationCap,
  Headphones
} from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { getApiBase } from "@/lib/api";

interface CoachReportData {
  diagnostic_completed: boolean;
  diagnostic_score: number;
  fluency_level: string;
  weak_points: string[];
  completed_modules_count: number;
  total_modules_count: number;
  final_report?: {
    overall_fluency_band: string;
    pronunciation_accuracy_percent: number;
    grammar_structure_percent: number;
    public_speaking_confidence_percent: number;
    mastered_competencies: string[];
    areas_for_continued_practice: string[];
    parent_recommendations: string[];
    teacher_recommendations: string[];
  } | null;
  is_expired: boolean;
}

interface SubjectAverage {
  subject: string;
  average: number;
  quizzes_count: number;
  highest?: number;
  lowest?: number;
  grade?: string;
}

interface WeeklyReport {
  week_index: number;
  label: string;
  date_range: string;
  full_label: string;
  week_average: number | null;
  quizzes_count: number;
  subject_averages: SubjectAverage[];
}

interface ChildAccount {
  id: string;
  username: string;
  name: string;
  class_name?: string;
  school_name?: string;
}

interface PerformanceData {
  status: string;
  has_children: boolean;
  children: ChildAccount[];
  selected_child: ChildAccount | null;
  overall_average: number;
  total_quizzes: number;
  performance_status: string;
  status_color: string;
  subject_averages: SubjectAverage[];
  weekly_reports: WeeklyReport[];
  all_quizzes?: any[];
}

export function ParentStudentPerformanceReport() {
  const { user } = useAppStore();
  const parentEmail = user?.email || "";

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<PerformanceData | null>(null);
  const [selectedUsername, setSelectedUsername] = useState<string>("");
  const [selectedWeekIdx, setSelectedWeekIdx] = useState<number>(0);
  const [coachReport, setCoachReport] = useState<CoachReportData | null>(null);
  const [coachLoading, setCoachLoading] = useState(false);

  const fetchPerformance = async (username?: string) => {
    if (!parentEmail) return;
    setLoading(true);
    try {
      const apiBase = getApiBase();
      const q = username ? `&student_username=${encodeURIComponent(username)}` : "";
      const res = await fetch(`${apiBase}/parent/student-performance?parent_email=${encodeURIComponent(parentEmail)}${q}`);
      if (res.ok) {
        const json: PerformanceData = await res.json();
        setData(json);
        if (json.selected_child && !username) {
          setSelectedUsername(json.selected_child.username);
        }
      }
    } catch (err) {
      console.warn("Failed to load student performance report:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCoachReport = async (studentId: string) => {
    if (!studentId) return;
    setCoachLoading(true);
    try {
      const apiBase = getApiBase();
      const res = await fetch(`${apiBase}/english-coach/parent-report/${encodeURIComponent(studentId)}`);
      if (res.ok) {
        const json = await res.json();
        setCoachReport(json);
      } else {
        setCoachReport(null);
      }
    } catch {
      setCoachReport(null);
    } finally {
      setCoachLoading(false);
    }
  };

  useEffect(() => {
    fetchPerformance(selectedUsername);
  }, [parentEmail, selectedUsername]);

  useEffect(() => {
    const studentId = selectedUsername || data?.selected_child?.username || data?.selected_child?.id;
    if (studentId) {
      fetchCoachReport(studentId);
    }
  }, [selectedUsername, data?.selected_child?.username, data?.selected_child?.id]);

  // Subject color mapping
  const getSubjectColor = (subject: string) => {
    const s = subject.toLowerCase();
    if (s.includes("science")) return { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", bar: "bg-emerald-500" };
    if (s.includes("math")) return { bg: "bg-indigo-50", text: "text-indigo-700", border: "border-indigo-200", bar: "bg-indigo-600" };
    if (s.includes("english")) return { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200", bar: "bg-purple-600" };
    if (s.includes("social") || s.includes("history") || s.includes("civics")) return { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", bar: "bg-amber-500" };
    if (s.includes("hindi") || s.includes("sanskrit")) return { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200", bar: "bg-rose-500" };
    return { bg: "bg-cyan-50", text: "text-cyan-700", border: "border-cyan-200", bar: "bg-cyan-500" };
  };

  if (loading && !data) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center space-y-3 shadow-xs">
        <RefreshCw className="w-6 h-6 animate-spin text-indigo-600 mx-auto" />
        <p className="text-xs font-bold text-slate-500">Calculating student average and weekly subject performance...</p>
      </div>
    );
  }

  if (!data || !data.has_children || data.children.length === 0) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-black">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-black text-slate-900">Student Average Performance Report</h2>
            <p className="text-xs text-slate-500">Weekly progress &amp; subject breakdown reports for parents</p>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-indigo-50/50 border border-dashed border-indigo-200 text-center space-y-3">
          <GraduationCap className="w-8 h-8 text-indigo-500 mx-auto" />
          <div className="space-y-1">
            <h3 className="text-sm font-extrabold text-slate-900">No Student Accounts Enrolled Yet</h3>
            <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
              To observe weekly subject reports and average scores, please enroll your child’s account with a username and password.
            </p>
          </div>
          <Link
            href="/dashboard/parent/children"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition active:scale-95"
          >
            <span>+ Enroll Child Account</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    );
  }

  const selectedChild = data.selected_child || data.children[0];
  const activeWeeklyReport = data.weekly_reports[selectedWeekIdx] || data.weekly_reports[0];

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-5 sm:p-7 space-y-6">
      
      {/* 1. HEADER & CHILD SELECTOR */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-black uppercase tracking-wider">
              <BarChart3 className="w-3.5 h-3.5 text-indigo-600" />
              <span>Student Performance Report</span>
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              Live Evaluation
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-black text-slate-900 font-[family-name:var(--font-outfit)]">
            Academic Performance &amp; Weekly Subject Report
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Review average scores, exam mastery, and week-wise subject progress for your child.
          </p>
        </div>

        {/* CHILD TABS (IF MULTIPLE CHILDREN) */}
        {data.children.length > 1 && (
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar p-1 bg-slate-100 rounded-2xl border border-slate-200 shrink-0">
            {data.children.map((ch) => {
              const isSelected = ch.username === selectedUsername;
              return (
                <button
                  key={ch.username}
                  onClick={() => setSelectedUsername(ch.username)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isSelected
                      ? "bg-white text-indigo-700 shadow-xs font-black border border-indigo-100"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                    isSelected ? "bg-indigo-600 text-white" : "bg-slate-200 text-slate-700"
                  }`}>
                    {ch.name.charAt(0).toUpperCase()}
                  </div>
                  <span>{ch.name}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 2. OVERALL AVERAGE STUDENT PERFORMANCE CARD */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
        
        {/* LEFT KPI: OVERALL AVERAGE SCORE GAUGE */}
        <div className="md:col-span-4 bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 flex flex-col justify-between space-y-4 shadow-md relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />
          
          <div className="space-y-1 relative z-10">
            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-300">
              Student Overall Average
            </span>
            <div className="flex items-baseline gap-2 pt-1">
              <span className="text-4xl sm:text-5xl font-black font-[family-name:var(--font-outfit)] text-white">
                {data.overall_average > 0 ? `${data.overall_average}%` : "—"}
              </span>
              <span className="text-xs font-bold text-indigo-300">avg. score</span>
            </div>
          </div>

          <div className="space-y-2 relative z-10">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 text-emerald-300 border border-white/15 text-xs font-extrabold">
              <Award className="w-3.5 h-3.5 text-amber-300" />
              <span>{data.performance_status}</span>
            </div>
            <div className="text-[11px] text-indigo-200 font-medium">
              Student: <strong className="text-white font-black">{selectedChild.name}</strong> • {selectedChild.class_name || "Class 10"}
            </div>
            <div className="text-[10.5px] text-indigo-300">
              Total Quizzes Completed: <strong className="text-white font-bold">{data.total_quizzes}</strong>
            </div>
          </div>
        </div>

        {/* RIGHT: ALL-TIME SUBJECT AVERAGES GRID */}
        <div className="md:col-span-8 bg-slate-50/80 rounded-3xl p-5 border border-slate-200/80 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200/70 pb-2">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
              <span>Subject-Wise Performance Breakdown (All Assessments)</span>
            </h3>
            <span className="text-[10px] font-bold text-slate-500">
              {data.subject_averages.length} Subjects Evaluated
            </span>
          </div>

          {data.subject_averages.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-400 font-medium">
              No subject quizzes attempted yet. Quizzes completed by {selectedChild.name} will appear here automatically.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {data.subject_averages.map((sub, idx) => {
                const color = getSubjectColor(sub.subject);
                return (
                  <div 
                    key={idx} 
                    className="p-3 bg-white rounded-2xl border border-slate-200/80 shadow-2xs space-y-2 hover:border-indigo-200 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-slate-900 truncate">
                        {sub.subject}
                      </span>
                      <span className="text-[10px] font-black px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
                        {sub.grade || "A"}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-black">
                        <span className="text-slate-500 text-[11px] font-medium">Average:</span>
                        <span className={color.text}>{sub.average}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${color.bar}`} 
                          style={{ width: `${Math.min(sub.average, 100)}%` }} 
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium pt-0.5">
                      <span>{sub.quizzes_count} {sub.quizzes_count === 1 ? "Quiz" : "Quizzes"}</span>
                      {sub.highest !== undefined && (
                        <span>High: {sub.highest}%</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* 2.5 SPOKEN ENGLISH & PUBLIC SPEAKING COACH MASTERY TRACK (LRSI / LRSP) */}
      <div className="bg-gradient-to-br from-indigo-50/70 via-white to-purple-50/50 rounded-3xl p-6 border border-indigo-150/70 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-indigo-100 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-black text-slate-900">
                  Spoken English & Public Speaking Track
                </h3>
                <span className="text-[10px] font-black uppercase tracking-wider bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
                  LRSI / LRSP Method
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Personalized pronunciation, live interactive speech, and public speaking confidence
              </p>
            </div>
          </div>
          {coachReport?.final_report && (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-100 border border-emerald-200 text-emerald-800 rounded-full text-xs font-black self-start sm:self-auto">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Certified Mastery</span>
            </div>
          )}
        </div>

        {coachLoading ? (
          <div className="py-6 flex items-center justify-center gap-2 text-xs text-slate-400 font-bold">
            <RefreshCw className="w-4 h-4 animate-spin text-indigo-600" />
            <span>Loading spoken English records for {selectedChild?.name || "student"}...</span>
          </div>
        ) : !coachReport?.diagnostic_completed ? (
          <div className="p-4 bg-white/80 rounded-2xl border border-slate-200 text-center space-y-2">
            <p className="text-xs font-bold text-slate-700">
              {selectedChild?.name || "Student"} has not yet taken the 10-Mark Diagnostic English Test.
            </p>
            <p className="text-[11px] text-slate-500 max-w-lg mx-auto">
              Once they complete the test in the English Speaking Coach, their identified weak points, personalized LRSI/LRSP lectures, and public speaking recordings will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Top diagnostic stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-white rounded-2xl border border-slate-200">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Diagnostic Score</span>
                <span className="text-lg font-black text-indigo-600">{coachReport.diagnostic_score} / 10</span>
              </div>
              <div className="p-3 bg-white rounded-2xl border border-slate-200">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Proficiency Level</span>
                <span className="text-lg font-black text-slate-900">{coachReport.fluency_level}</span>
              </div>
              <div className="p-3 bg-white rounded-2xl border border-slate-200">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Lectures Completed</span>
                <span className="text-lg font-black text-emerald-600">{coachReport.completed_modules_count} of {coachReport.total_modules_count}</span>
              </div>
              <div className="p-3 bg-white rounded-2xl border border-slate-200">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Cycle Status</span>
                <span className={`text-xs font-black inline-block mt-1 px-2 py-0.5 rounded-full ${coachReport.is_expired ? 'bg-amber-100 text-amber-800' : 'bg-indigo-100 text-indigo-700'}`}>
                  {coachReport.is_expired ? "Cycle Renewal Due" : "30-Day Active Track"}
                </span>
              </div>
            </div>

            {/* Weak points identified */}
            {coachReport.weak_points && coachReport.weak_points.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="font-bold text-slate-600">Target Focus Areas:</span>
                {coachReport.weak_points.map((wp, i) => (
                  <span key={i} className="px-2.5 py-0.5 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-bold">
                    ⚠️ {wp}
                  </span>
                ))}
              </div>
            )}

            {/* Final Report Card if generated */}
            {coachReport.final_report && (
              <div className="p-4 bg-white rounded-2xl border border-emerald-200/80 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-emerald-950 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Official Spoken English Mastery Assessment</span>
                  </h4>
                  <span className="text-xs font-black text-indigo-700 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-md">
                    Band: {coachReport.final_report.overall_fluency_band}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-150">
                    <span className="text-[10px] text-slate-500 font-bold block">Pronunciation Accuracy</span>
                    <span className="text-base font-black text-slate-900">{coachReport.final_report.pronunciation_accuracy_percent}%</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-150">
                    <span className="text-[10px] text-slate-500 font-bold block">Grammar in Spontaneous Speech</span>
                    <span className="text-base font-black text-slate-900">{coachReport.final_report.grammar_structure_percent}%</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-150">
                    <span className="text-[10px] text-slate-500 font-bold block">Public Speaking Confidence</span>
                    <span className="text-base font-black text-slate-900">{coachReport.final_report.public_speaking_confidence_percent}%</span>
                  </div>
                </div>

                {coachReport.final_report.parent_recommendations?.length > 0 && (
                  <div className="pt-2 border-t border-slate-100 space-y-1">
                    <span className="text-[11px] font-black text-slate-700 block">Home Action Plan for Parents:</span>
                    <ul className="space-y-1 text-xs text-slate-600 list-disc list-inside">
                      {coachReport.final_report.parent_recommendations.map((rec, rIdx) => (
                        <li key={rIdx}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 3. STUDENT AVERAGE REPORT PER WEEK-WISE IN EVERY SUBJECT */}
      <div className="space-y-4 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="space-y-0.5">
            <h3 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-orange-600" />
              <span>Weekly Academic Report (Per Week in Every Subject)</span>
            </h3>
            <p className="text-xs text-slate-500">
              Select a week below to inspect your child's weekly average score across all subjects.
            </p>
          </div>

          {/* WEEK SELECTOR PILLS */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            {data.weekly_reports.map((w) => {
              const isSelected = w.week_index === selectedWeekIdx;
              return (
                <button
                  key={w.week_index}
                  onClick={() => setSelectedWeekIdx(w.week_index)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                    isSelected
                      ? "bg-slate-900 text-white shadow-xs font-black"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  <span>{w.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ACTIVE WEEK CARD & SUBJECT DETAILS */}
        <div className="bg-slate-50/60 rounded-3xl p-5 sm:p-6 border border-slate-200 space-y-4">
          
          {/* Active Week Headline */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase text-slate-800 tracking-wider">
                  {activeWeeklyReport.full_label}
                </span>
                {activeWeeklyReport.week_average !== null && (
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                    Week Average: {activeWeeklyReport.week_average}%
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Total Assessments Attempted this week: <strong className="text-slate-800 font-bold">{activeWeeklyReport.quizzes_count}</strong>
              </p>
            </div>

            <Link
              href="/dashboard/parent/children"
              className="text-xs font-black text-indigo-600 hover:text-indigo-700 flex items-center gap-1 hover:underline self-start sm:self-auto"
            >
              <span>View Detailed Quiz Answers</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* WEEK'S SUBJECT-WISE AVERAGES */}
          {activeWeeklyReport.subject_averages.length === 0 ? (
            <div className="py-8 text-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-slate-200/60 text-slate-400 flex items-center justify-center mx-auto">
                <Calendar className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold text-slate-600">
                No assessments were taken by {selectedChild.name} in {activeWeeklyReport.label}.
              </p>
              <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                Encourage your child to practice 10-minute diagnostic quizzes on weekdays to track continuous subject improvement.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {activeWeeklyReport.subject_averages.map((sub, sIdx) => {
                const color = getSubjectColor(sub.subject);
                const isMastered = sub.average >= 85;

                return (
                  <div 
                    key={sIdx} 
                    className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="text-sm font-black text-slate-900">{sub.subject}</h4>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {sub.quizzes_count} {sub.quizzes_count === 1 ? "test" : "tests"} this week
                        </span>
                      </div>
                      <span className={`text-xs font-black px-2 py-0.5 rounded-lg ${color.bg} ${color.text} border ${color.border}`}>
                        {sub.average}% Avg
                      </span>
                    </div>

                    {/* Progress bar */}
                    <div className="space-y-1">
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${color.bar}`} 
                          style={{ width: `${Math.min(sub.average, 100)}%` }} 
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[10.5px] font-bold">
                      <span className={isMastered ? "text-emerald-600 flex items-center gap-1" : "text-slate-500"}>
                        {isMastered ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                            <span>High Mastery</span>
                          </>
                        ) : (
                          <span>Standard Progress</span>
                        )}
                      </span>
                      <span className="text-indigo-600 hover:underline cursor-pointer">
                        View Topic Details →
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      </div>

      {/* 4. ACTIONABLE PARENTING INSIGHT */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50/70 to-orange-50/70 border border-amber-200/80 flex items-start gap-3">
        <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
          <Brain className="w-4 h-4" />
        </div>
        <div className="space-y-0.5 text-xs">
          <h4 className="font-extrabold text-amber-950">AI Parenting Weekly Observation</h4>
          <p className="text-slate-700 leading-relaxed font-medium">
            {data.overall_average >= 80 
              ? `${selectedChild.name} is demonstrating strong, consistent academic grasp across primary subjects. Celebrate their steady progress and maintain a healthy balance of study and relaxation.`
              : `${selectedChild.name} is making steady efforts. We recommend focusing on 15 minutes of guided formula review in subjects averaging below 75% before bedtime.`}
          </p>
        </div>
      </div>

    </div>
  );
}
