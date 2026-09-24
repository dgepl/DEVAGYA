"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Sparkles, 
  ArrowLeft, 
  Bell, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  LayoutDashboard,
  ChevronRight
} from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { useToolConfigStore, ToolItem } from "@/store/useToolConfigStore";

export interface ComingSoonContent {
  id: string;
  title: string;
  tagline?: string;
  description: string;
  sectionHeading: string;
  benefits: {
    emoji: string;
    text: string;
    detail?: string;
  }[];
  badge?: string;
  gradient?: string;
}

export const CURATED_COMING_SOON_DATA: Record<string, ComingSoonContent> = {
  // 1. AI PPT GENERATOR (Exact text from User Image 1)
  ppt_generator: {
    id: "ppt_generator",
    title: "AI PPT GENERATOR",
    badge: "IN ACTIVE ENHANCEMENT",
    gradient: "from-blue-600 via-indigo-600 to-purple-600",
    description:
      "Turn your ideas, notes, or topics into beautiful, professional PowerPoint presentations automatically. Our AI PPT Maker understands your content, creates a logical structure, generates slides, and gives your presentation a polished look—all in just a few clicks.",
    sectionHeading: "Why use our AI PPT Maker?",
    benefits: [
      { emoji: "⚡", text: "Create presentations in minutes" },
      { emoji: "🎨", text: "Professional and attractive designs" },
      { emoji: "✏️", text: "Easily edit and customize slides" },
      { emoji: "📊", text: "Perfect for business, education, meetings & projects" },
      { emoji: "⏰", text: "Save hours of manual PPT preparation" },
      { emoji: "📥", text: "Download and present with ease" }
    ]
  },

  // 2. TEACHER MENTOR AI (Exact text from User Image 2)
  teacher_mentor: {
    id: "teacher_mentor",
    title: "TEACHER MENTOR AI",
    badge: "5-IN-1 SUPER AGENT",
    gradient: "from-purple-600 via-indigo-600 to-blue-600",
    description:
      "Teacher Mentor AI helps teachers save time by creating lesson plans, worksheets, question papers, activities, assessments, teaching ideas, and classroom resources in just a few clicks. It acts like a digital teaching assistant, helping educators prepare better while spending more time focusing on their students.",
    sectionHeading: "Why teachers will love it:",
    benefits: [
      { emoji: "📚", text: "Create lesson plans quickly" },
      { emoji: "📝", text: "Generate worksheets & question papers" },
      { emoji: "🎯", text: "Create engaging classroom activities" },
      { emoji: "📊", text: "Prepare assessments and quizzes" },
      { emoji: "⏰", text: "Save valuable preparation time" },
      { emoji: "✨", text: "Get ideas tailored to different learning needs" }
    ]
  },

  // 4. ENGLISH SPEAKING COACH (Exact text from User Image 3)
  english_coach: {
    id: "english_coach",
    title: "ENGLISH SPEAKING COACH",
    tagline: "Speak English with Confidence. Learn. Practise. Improve.",
    badge: "LIVE SPOKEN AI",
    gradient: "from-rose-500 via-pink-600 to-purple-600",
    description:
      "Our AI English Speaking Coach helps students and professionals improve their English speaking skills through interactive, real-time practice. Users can practise conversations, improve pronunciation and vocabulary, build fluency, and gain confidence in everyday English communication.",
    sectionHeading: "Key Benefits:",
    benefits: [
      { emoji: "🗣️", text: "Interactive English speaking practice" },
      { emoji: "🤖", text: "AI-powered conversation partner" },
      { emoji: "🎯", text: "Improve fluency and vocabulary" },
      { emoji: "🔊", text: "Practice pronunciation" },
      { emoji: "💬", text: "Real-life conversation scenarios" },
      { emoji: "📈", text: "Identify mistakes and improve" },
      { emoji: "🌟", text: "Build confidence in speaking English" }
    ]
  },

  // Also map teacher_english_coach ID
  teacher_english_coach: {
    id: "teacher_english_coach",
    title: "ENGLISH SPEAKING COACH",
    tagline: "Speak English with Confidence. Learn. Practise. Improve.",
    badge: "LIVE SPOKEN AI",
    gradient: "from-rose-500 via-pink-600 to-purple-600",
    description:
      "Our AI English Speaking Coach helps students and professionals improve their English speaking skills through interactive, real-time practice. Users can practise conversations, improve pronunciation and vocabulary, build fluency, and gain confidence in everyday English communication.",
    sectionHeading: "Key Benefits:",
    benefits: [
      { emoji: "🗣️", text: "Interactive English speaking practice" },
      { emoji: "🤖", text: "AI-powered conversation partner" },
      { emoji: "🎯", text: "Improve fluency and vocabulary" },
      { emoji: "🔊", text: "Practice pronunciation" },
      { emoji: "💬", text: "Real-life conversation scenarios" },
      { emoji: "📈", text: "Identify mistakes and improve" },
      { emoji: "🌟", text: "Build confidence in speaking English" }
    ]
  },

  // QUESTION GENERATOR AI
  question_generator: {
    id: "question_generator",
    title: "QUESTION GENERATOR AI",
    tagline: "100% CBSE & NCERT-Aligned Test Synthesis",
    badge: "EXAM STUDIO",
    gradient: "from-amber-500 via-orange-600 to-red-600",
    description:
      "Generate comprehensive CBSE and NCERT-compliant examination papers with balanced difficulty calibration, Bloom's taxonomy mapping, and official model answers from textbook syllabus or uploaded document chapters.",
    sectionHeading: "Why educators choose Question Generator AI:",
    benefits: [
      { emoji: "🎯", text: "100% CBSE/NCERT curriculum alignment" },
      { emoji: "⚡", text: "Instant multi-section test generation with model answer keys" },
      { emoji: "📑", text: "Publication-grade vector A4 PDF downloads with school logo" },
      { emoji: "🧩", text: "Supports MCQs, Assertion-Reason, Short & Case Scenarios" },
      { emoji: "⏰", text: "Save 3+ hours of manual question drafting and typesetting" },
      { emoji: "🛡️", text: "Balanced cognitive distribution across Bloom's levels" }
    ]
  },

  // ASSIGNMENT MAKER
  assignments: {
    id: "assignments",
    title: "AI ASSIGNMENT MAKER",
    tagline: "Structured Chapter Worksheets & Printable Homework Sheets",
    badge: "PDF STUDIO",
    gradient: "from-blue-600 via-indigo-600 to-cyan-600",
    description:
      "Build high-quality homework tasks, chapter worksheets, and ruled-line submission sheets with QR code verification and teacher scoring rubrics in seconds.",
    sectionHeading: "Key Features & Benefits:",
    benefits: [
      { emoji: "📝", text: "Instant ruled-line student submission sheets" },
      { emoji: "🔍", text: "QR verification for authentic student assignment tracking" },
      { emoji: "🎨", text: "Custom institutional crest and school branding" },
      { emoji: "📊", text: "Structured step-by-step marking schemes and criteria" },
      { emoji: "⏰", text: "Save valuable homework preparation time" },
      { emoji: "📥", text: "Ready-to-print vector A4 PDF downloads" }
    ]
  },

  // TEACHER OLYMPIAD
  teacher_olympiad: {
    id: "teacher_olympiad",
    title: "NATIONAL TEACHER SKILLS OLYMPIAD",
    tagline: "Benchmarking Pedagogical Excellence Nationwide",
    badge: "NATIONAL CERTIFICATION",
    gradient: "from-amber-500 via-yellow-600 to-orange-600",
    description:
      "An official national examination evaluating instructional leadership, Bloom's taxonomy application, modern classroom management, and NEP 2020 pedagogical standards.",
    sectionHeading: "Why participate in the Teacher Olympiad?",
    benefits: [
      { emoji: "🏆", text: "Official Gold & Silver tier national credentials" },
      { emoji: "📊", text: "In-depth pedagogical competency radar breakdown" },
      { emoji: "🤖", text: "AI-proctored anti-cheat verified examination" },
      { emoji: "🌟", text: "Institutional recognition and career portfolio enhancement" },
      { emoji: "💡", text: "Real-time classroom scenario decision challenges" },
      { emoji: "📜", text: "Verifiable digital certificate for your school resume" }
    ]
  },

  // TEACHER OLYMPIAD PRACTICE
  teacher_olympiad_practice: {
    id: "teacher_olympiad_practice",
    title: "SKILL ENHANCE PRACTICE LAB",
    tagline: "Master Pedagogical Speed & Precision",
    badge: "PRACTICE LAB",
    gradient: "from-emerald-500 via-teal-600 to-cyan-600",
    description:
      "Unlimited timed mock papers, case dilemmas, and pedagogical skill quizzes to prepare for high scores in the National Teacher Skills Olympiad.",
    sectionHeading: "What you get in the Practice Lab:",
    benefits: [
      { emoji: "⏱️", text: "Real-time countdown examination simulations" },
      { emoji: "💡", text: "Instant pedagogical explanations for every question" },
      { emoji: "📈", text: "Skill gap analysis across Bloom's levels" },
      { emoji: "🔄", text: "Unlimited retakes with dynamic question pools" },
      { emoji: "🎯", text: "Targeted pedagogical improvement tips" }
    ]
  },

  // TEACHER RECRUITMENT
  teacher_recruitment: {
    id: "teacher_recruitment",
    title: "TEACHER RECRUITMENT PORTAL",
    tagline: "Connect with Verified Partner Schools Across India",
    badge: "CAREER OPPORTUNITIES",
    gradient: "from-emerald-600 via-teal-600 to-cyan-700",
    description:
      "Discover verified teaching openings, view institutional perks, apply with your certified profile, and get contacted directly by school hiring coordinators.",
    sectionHeading: "Why use the Recruitment Portal?",
    benefits: [
      { emoji: "🏫", text: "Verified direct school vacancies without middlemen" },
      { emoji: "📄", text: "1-Click application with your educator profile and CV" },
      { emoji: "💬", text: "Direct communication with school principals" },
      { emoji: "🔔", text: "Real-time alerts for matching subject requirements" },
      { emoji: "📍", text: "Filter by city, board (CBSE/ICSE), and salary range" }
    ]
  },

  // VIDEO CONSULTATION
  "video-consultation": {
    id: "video-consultation",
    title: "AI VIDEO CONSULTATION",
    tagline: "Interactive 1-on-1 Academic & Pedagogical Mentoring",
    badge: "LIVE VIDEO",
    gradient: "from-red-500 via-rose-600 to-pink-600",
    description:
      "Connect through high-definition live video consultation with AI academic mentors for real-time lesson demonstration critiques, student counseling, and doubt resolution.",
    sectionHeading: "Key Capabilities:",
    benefits: [
      { emoji: "📹", text: "Crystal-clear HD low-latency video and audio" },
      { emoji: "🤖", text: "Real-time AI pedagogical feedback during demos" },
      { emoji: "📝", text: "Automatic session notes and action items synthesis" },
      { emoji: "🔒", text: "Secure end-to-end encrypted academic rooms" }
    ]
  },

  // SOCRATIC AI TUTOR
  student_tutor: {
    id: "student_tutor",
    title: "SOCRATIC AI TUTOR",
    tagline: "Never Give Direct Answers — Learn How to Think",
    badge: "24/7 STUDY COMPANION",
    gradient: "from-purple-600 via-pink-600 to-indigo-600",
    description:
      "A 24/7 personal study companion that guides students step-by-step through tough science, mathematics, and humanities problems using the proven Socratic method.",
    sectionHeading: "Why students love Socratic Tutor:",
    benefits: [
      { emoji: "🧠", text: "Deep conceptual understanding over rote memorization" },
      { emoji: "💬", text: "Patient, 24/7 personalized explanations" },
      { emoji: "📐", text: "Step-by-step guidance for complex mathematical problems" },
      { emoji: "🌐", text: "Hindi, Hinglish, and English multilingual conversation" },
      { emoji: "🚀", text: "Instant doubt resolution without embarrassment" }
    ]
  },

  // STUDENT EXAM PREP
  student_exam_prep: {
    id: "student_exam_prep",
    title: "AI EXAM PREP STUDIO",
    tagline: "Target High-Yield Chapters & Score 95%+",
    badge: "BOARD MASTERY",
    gradient: "from-amber-500 via-red-600 to-rose-600",
    description:
      "Detailed chapter weightage radars, previous year question frequency trends, and AI-predicted mock assessments tailored to upcoming CBSE board examinations.",
    sectionHeading: "Exam Prep Highlights:",
    benefits: [
      { emoji: "🎯", text: "High-probability predicted board examination questions" },
      { emoji: "📊", text: "Topic importance heatmaps based on past 10-year papers" },
      { emoji: "⏱️", text: "Timed full-syllabus mock examinations with rank analysis" },
      { emoji: "📝", text: "Detailed step-by-step marking rubrics for maximum scores" }
    ]
  },

  // STUDENT PRACTICE
  student_practice: {
    id: "student_practice",
    title: "PRACTICE & QUIZZES",
    tagline: "Gamified Active Recall & Timed Mastery",
    badge: "ACTIVE RECALL",
    gradient: "from-emerald-500 via-green-600 to-teal-600",
    description:
      "Bite-sized chapter quizzes, speed drills, and instant diagnostic feedback to reinforce concept retention and build exam confidence every single day.",
    sectionHeading: "Key Benefits:",
    benefits: [
      { emoji: "⚡", text: "Fast-paced 10-question practice rounds" },
      { emoji: "💡", text: "Instant concept breakdown for every answer" },
      { emoji: "🏆", text: "Earn XP points and unlock achievement badges" },
      { emoji: "📈", text: "Track personal mastery and retention over time" }
    ]
  },

  // STUDENT NOTES
  student_notes: {
    id: "student_notes",
    title: "SMART STUDY NOTES",
    tagline: "High-Yield Chapter Summaries & Formula Sheets",
    badge: "RICH STUDY CARDS",
    gradient: "from-blue-500 via-indigo-600 to-violet-600",
    description:
      "Curated, beautifully formatted revision sheets, concept mind-maps, and key definition lists designed for rapid last-minute exam recall.",
    sectionHeading: "What's inside Smart Notes:",
    benefits: [
      { emoji: "📖", text: "NCERT chapter summaries with high-yield points highlighted" },
      { emoji: "📐", text: "Essential formula & derivation cheat-sheets" },
      { emoji: "🎨", text: "Clear tables, diagrams, and bulleted mnemonics" },
      { emoji: "📥", text: "Printable PDF revision sheets for offline study" }
    ]
  },

  // STUDENT TIMER
  student_timer: {
    id: "student_timer",
    title: "FOCUS POMODORO TIMER",
    tagline: "Beat Procrastination & Enter Deep Work",
    badge: "FOCUS LAB",
    gradient: "from-rose-500 via-amber-600 to-orange-600",
    description:
      "Science-backed 25-minute Pomodoro study intervals with calming ambient lo-fi sounds, task checklists, and daily focus streak tracking.",
    sectionHeading: "Productivity Features:",
    benefits: [
      { emoji: "⏱️", text: "Customizable focus and break intervals" },
      { emoji: "🎧", text: "Built-in ambient binaural & nature sounds" },
      { emoji: "📊", text: "Daily and weekly focus hour logs" },
      { emoji: "🚫", text: "Distraction-free full-screen mode" }
    ]
  },

  // STUDENT LEADERBOARD
  student_leaderboard: {
    id: "student_leaderboard",
    title: "STUDENT LEADERBOARD",
    tagline: "Compete, Learn & Rise to the Top",
    badge: "XP & RANKS",
    gradient: "from-yellow-500 via-amber-600 to-orange-600",
    description:
      "Measure your study consistency, quiz scores, and learning milestones against ambitious students across the country in real time.",
    sectionHeading: "Leaderboard Features:",
    benefits: [
      { emoji: "🏅", text: "Weekly and all-time national rankings" },
      { emoji: "🔥", text: "Maintain your daily active study streak" },
      { emoji: "🎖️", text: "Unlock exclusive academic achievement badges" },
      { emoji: "🤝", text: "Friendly school and grade-level competitions" }
    ]
  },

  // PARENT COACH
  parent_coach: {
    id: "parent_coach",
    title: "PARENTING COACH AI",
    tagline: "Empathetic, Science-Backed Guidance for Parents",
    badge: "FAMILY AI",
    gradient: "from-rose-500 via-pink-600 to-red-600",
    description:
      "Personalized advice for managing screen time, handling exam anxiety, cultivating healthy study routines, and nurturing positive child-parent communication.",
    sectionHeading: "Why parents appreciate Parenting Coach:",
    benefits: [
      { emoji: "🧘", text: "Calm, non-judgmental guidance available 24/7" },
      { emoji: "💡", text: "Practical tips for adolescent behavior & motivation" },
      { emoji: "📚", text: "Homework support strategies without conflict" },
      { emoji: "🌐", text: "Multilingual conversation in Hindi, Hinglish & English" }
    ]
  },

  // RESEARCH ASSISTANT
  research_assistant: {
    id: "research_assistant",
    title: "RESEARCH ASSISTANT AI",
    tagline: "Comprehensive Academic & Career Insights",
    badge: "RESEARCH AI",
    gradient: "from-cyan-500 via-blue-600 to-indigo-600",
    description:
      "Compare educational boards (CBSE, ICSE, IB), evaluate college entrance requirements, verify syllabus changes, and research scholarship opportunities.",
    sectionHeading: "Key Research Capabilities:",
    benefits: [
      { emoji: "🔍", text: "Unbiased board & curriculum comparisons" },
      { emoji: "🎓", text: "College & university eligibility insights" },
      { emoji: "📋", text: "Scholarship and talent olympiad guidance" },
      { emoji: "📑", text: "Concise, citation-backed research reports" }
    ]
  }
};

export function getComingSoonContent(path: string, agentCode?: string, fallbackTool?: ToolItem): ComingSoonContent {
  // 1. Direct match by agentCode
  if (agentCode && CURATED_COMING_SOON_DATA[agentCode]) {
    return CURATED_COMING_SOON_DATA[agentCode];
  }

  // 2. Query param resolution
  if (path.includes("agent=")) {
    const code = path.split("agent=")[1]?.split("&")[0];
    if (code && CURATED_COMING_SOON_DATA[code]) {
      return CURATED_COMING_SOON_DATA[code];
    }
  }

  // 3. Exact or path-based match
  const clean = path.split("?")[0].replace("/dashboard/", "").replace("/", "_");
  if (CURATED_COMING_SOON_DATA[clean]) {
    return CURATED_COMING_SOON_DATA[clean];
  }

  // Special path maps
  if (path.includes("ppt-generator")) return CURATED_COMING_SOON_DATA.ppt_generator;
  if (path.includes("teacher_mentor") || path === "/dashboard/mentor") return CURATED_COMING_SOON_DATA.teacher_mentor;
  if (path.includes("english-coach")) return CURATED_COMING_SOON_DATA.english_coach;
  if (path.includes("generator")) return CURATED_COMING_SOON_DATA.question_generator;
  if (path.includes("assignments")) return CURATED_COMING_SOON_DATA.assignments;
  if (path.includes("teacher-olympiad/practice")) return CURATED_COMING_SOON_DATA.teacher_olympiad_practice;
  if (path.includes("teacher-olympiad")) return CURATED_COMING_SOON_DATA.teacher_olympiad;
  if (path.includes("recruitment")) return CURATED_COMING_SOON_DATA.teacher_recruitment;
  if (path.includes("video-consultation")) return CURATED_COMING_SOON_DATA["video-consultation"];
  if (path.includes("student/exam-prep")) return CURATED_COMING_SOON_DATA.student_exam_prep;
  if (path.includes("student/practice")) return CURATED_COMING_SOON_DATA.student_practice;
  if (path.includes("student/notes")) return CURATED_COMING_SOON_DATA.student_notes;
  if (path.includes("student/timer")) return CURATED_COMING_SOON_DATA.student_timer;
  if (path.includes("student/leaderboard")) return CURATED_COMING_SOON_DATA.student_leaderboard;

  // Fallback using ToolItem metadata or generic
  const toolName = fallbackTool?.name || (clean ? clean.replace(/_/g, " ").toUpperCase() : "THIS FEATURE");
  return {
    id: fallbackTool?.id || clean || "feature",
    title: toolName.toUpperCase(),
    tagline: "Innovative Learning Experience In Development",
    badge: "COMING SOON",
    gradient: fallbackTool?.color ? `bg-gradient-to-r ${fallbackTool.color}` : "from-indigo-600 via-blue-600 to-purple-600",
    description: fallbackTool?.description || 
      `${toolName} is currently undergoing scheduled platform upgrades and quality calibration. Our engineering and academic team is preparing an authentic, curriculum-aligned experience that will be made available shortly.`,
    sectionHeading: `Why you'll love ${toolName}:`,
    benefits: [
      { emoji: "⚡", text: "AI-accelerated academic workflows and instant synthesis" },
      { emoji: "🎯", text: "100% compliant with CBSE and NEP 2020 pedagogical guidelines" },
      { emoji: "✨", text: "Intuitive, clean, and distraction-free educator experience" },
      { emoji: "📊", text: "Detailed diagnostic feedback and progress analytics" },
      { emoji: "⏰", text: "Designed to save valuable classroom preparation hours" }
    ]
  };
}

interface FeatureComingSoonProps {
  path: string;
  agentCode?: string;
}

export default function FeatureComingSoon({ path, agentCode }: FeatureComingSoonProps) {
  const { user } = useAppStore();
  const { getToolByPath } = useToolConfigStore();
  const matchedTool = getToolByPath(path, agentCode);
  const data = getComingSoonContent(path, agentCode, matchedTool);

  const [notified, setNotified] = useState(false);

  // Fallback dashboard URL
  const homeUrl = 
    user?.role === "student" ? "/dashboard/student" :
    user?.role === "parent" ? "/dashboard/parent" :
    user?.role === "school" ? "/dashboard/school" : "/dashboard";

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 animate-in fade-in zoom-in-95 duration-200">
      
      {/* 1. TOP BREADCRUMB */}
      <div className="flex items-center justify-between border-b border-slate-200/80 pb-4">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
          <Link href={homeUrl} className="hover:text-indigo-600 transition-colors flex items-center gap-1">
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </Link>
          <ChevronRight className="w-3 h-3 text-slate-400" />
          <span className="text-slate-800 font-extrabold">{data.title}</span>
          <ChevronRight className="w-3 h-3 text-slate-400" />
          <span className="text-amber-600 font-black">Coming Soon</span>
        </div>

        <Link
          href={homeUrl}
          className="text-xs font-bold text-slate-600 hover:text-indigo-600 flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Dashboard</span>
        </Link>
      </div>

      {/* 2. HERO CARD WITH VIBRANT GRADIENT ACCENT */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        
        {/* Top Gradient Banner */}
        <div className={`h-3 bg-gradient-to-r ${data.gradient || 'from-indigo-600 to-purple-600'}`} />

        <div className="p-6 sm:p-10 space-y-8">
          
          {/* Header Block */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200/80 shadow-2xs">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                <span>{data.badge || "COMING SOON"}</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-200">
                <ShieldCheck className="w-3 h-3 text-indigo-600" />
                <span>DEVGYA OFFICIAL PREVIEW</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
              {data.title}
            </h1>

            {data.tagline && (
              <p className="text-sm sm:text-base font-bold text-indigo-600">
                {data.tagline}
              </p>
            )}

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal pt-1 max-w-3xl">
              {data.description}
            </p>
          </div>

          {/* 3. BENEFITS & VALUE PROPOSITION */}
          <div className="space-y-4 pt-2 border-t border-slate-100">
            <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
              <span>{data.sectionHeading}</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {data.benefits.map((b, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80 hover:border-indigo-200 hover:bg-indigo-50/20 transition-all flex items-start gap-3 group"
                >
                  <span className="text-xl sm:text-2xl shrink-0 select-none group-hover:scale-110 transition-transform">
                    {b.emoji}
                  </span>
                  <div className="space-y-0.5 min-w-0">
                    <p className="text-xs sm:text-sm font-bold text-slate-800 leading-snug">
                      {b.text}
                    </p>
                    {b.detail && (
                      <p className="text-[11px] text-slate-500 font-normal leading-relaxed">
                        {b.detail}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 4. NOTIFICATION & ACTION FOOTER */}
          <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50 -mx-6 -mb-6 sm:-mx-10 sm:-mb-10 p-6 sm:p-8 rounded-b-3xl">
            <div className="space-y-1">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-700">
                Interested in early access?
              </h3>
              <p className="text-xs text-slate-500">
                This feature is actively being developed. Get notified the moment it goes live for your institution.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => setNotified(true)}
                disabled={notified}
                className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 shadow-2xs cursor-pointer ${
                  notified 
                    ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                    : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm active:scale-98"
                }`}
              >
                {notified ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Notification Set!</span>
                  </>
                ) : (
                  <>
                    <Bell className="w-4 h-4" />
                    <span>Notify Me on Launch</span>
                  </>
                )}
              </button>

              <Link
                href={homeUrl}
                className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors"
              >
                Dashboard
              </Link>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
