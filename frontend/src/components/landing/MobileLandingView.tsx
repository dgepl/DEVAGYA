"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Sparkles, 
  ArrowRight, 
  BookOpen, 
  ScanText, 
  FileText, 
  ShieldCheck, 
  Star, 
  Trophy, 
  Brain, 
  Layers, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  GraduationCap, 
  Building2, 
  Users, 
  Zap, 
  Home, 
  Bot, 
  FileSpreadsheet, 
  User, 
  Award,
  Video,
  Info,
  HelpCircle
} from "lucide-react";

export function MobileLandingView() {
  const [currentSlide, setCurrentSlide] = useState(1);
  const [activeRole, setActiveRole] = useState<"teachers" | "students" | "parents" | "schools">("teachers");

  // Auto-rotate live showcase mockup slides
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev % 4) + 1);
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => setCurrentSlide((prev) => (prev % 4) + 1);
  const prevSlide = () => setCurrentSlide((prev) => (prev === 1 ? 4 : prev - 1));

  // 4 Live Interactive Mockup Showcase Slides
  const showcaseSlides = [
    {
      id: 1,
      tag: "Slide 01 / 04 (Auto 3s)",
      portalTitle: "Teacher Portal — Paper Generator",
      xp: "12000 XP",
      welcome: "Welcome Prof. Ananya Roy 👋",
      subtitle: "Your NCERT Question Papers & AI Tools",
      stat1: { label: "Papers Created", val: "128 Papers", color: "text-amber-500" },
      stat2: { label: "Time Saved", val: "98% Saved", color: "text-indigo-600" },
      stat3: { label: "Active Subject", val: "Science & Math", color: "text-slate-800" },
      progressLabel: "Class 10 Science Paper + Answer Key Included",
      progressPct: "94%",
      progressWidth: "w-[94%]",
      floatingCard1: {
        title: "Question Paper",
        subtitle: "Export Report.zip",
        detail: "PDF with school watermark",
        icon: FileText
      },
      floatingCard2: {
        app: "Devgya Mobile App",
        name: "Devgya AI iOS",
        sub: "Class 6-12",
        score: "94%",
        badge: "OVERALL MASTERY"
      }
    },
    {
      id: 2,
      tag: "Slide 02 / 04 (Auto 3s)",
      portalTitle: "AI Assignment & Ruled Lines Studio",
      xp: "14500 XP",
      welcome: "Worksheet & Homework Studio ✍️",
      subtitle: "Custom Student Writing Lines & Response Boxes",
      stat1: { label: "Worksheets", val: "64 Sheets", color: "text-emerald-600" },
      stat2: { label: "Print Format", val: "Ruled Lines", color: "text-blue-600" },
      stat3: { label: "Target Class", val: "Class 10 CBSE", color: "text-slate-800" },
      progressLabel: "Quadratic Equations Homework Sheet + Solution Rubric",
      progressPct: "100%",
      progressWidth: "w-[100%]",
      floatingCard1: {
        title: "Assignment PDF",
        subtitle: "Ready for Print",
        detail: "Vector Ruled Lines Included",
        icon: FileSpreadsheet
      },
      floatingCard2: {
        app: "Teacher Companion",
        name: "Devgya Teacher AI",
        sub: "CBSE & NCERT",
        score: "100%",
        badge: "ORIGINAL QUESTIONS"
      }
    },
    {
      id: 3,
      tag: "Slide 03 / 04 (Auto 3s)",
      portalTitle: "National Skill Enhance Program 2026",
      xp: "18200 XP",
      welcome: "Skill Enhance Practice 🏆",
      subtitle: "Official CBSE & NCERT Proficiency Mock Tests",
      stat1: { label: "Mock Bank", val: "100 Qs", color: "text-purple-600" },
      stat2: { label: "Timed Exam", val: "120 Mins", color: "text-amber-600" },
      stat3: { label: "Part B Subject", val: "Mathematics", color: "text-slate-800" },
      progressLabel: "Educator Pedagogy & NEP 2020 Readiness Test",
      progressPct: "88%",
      progressWidth: "w-[88%]",
      floatingCard1: {
        title: "Skill Enhance Program",
        subtitle: "Registration Live",
        detail: "National Certification",
        icon: Trophy
      },
      floatingCard2: {
        app: "Educator Rank",
        name: "All-India Rank #4",
        sub: "National Percentile",
        score: "99.2%",
        badge: "TOP EDUCATOR"
      }
    },
    {
      id: 4,
      tag: "Slide 04 / 04 (Auto 3s)",
      portalTitle: "Socratic AI Tutor & Self-Study Suite",
      xp: "24800 XP",
      welcome: "Hello Aryan! Ready to Learn? 🚀",
      subtitle: "Socratic Guidance, Flashcards & Practice Quizzes",
      stat1: { label: "Daily Streak", val: "14 Days 🔥", color: "text-orange-500" },
      stat2: { label: "Quizzes Solved", val: "42 Quizzes", color: "text-emerald-600" },
      stat3: { label: "Target Exam", val: "Board Exam", color: "text-slate-800" },
      progressLabel: "Physics Chapter 4: Motion in a Plane",
      progressPct: "78%",
      progressWidth: "w-[78%]",
      floatingCard1: {
        title: "Socratic Hint",
        subtitle: "Concept Explained",
        detail: "No Answer Spoilers",
        icon: Brain
      },
      floatingCard2: {
        app: "Active Recall",
        name: "Formula Deck",
        sub: "32 Flashcards",
        score: "96%",
        badge: "CONCEPT MASTERED"
      }
    }
  ];

  const activeSlideData = showcaseSlides[currentSlide - 1];

  return (
    <div className="min-h-screen bg-[#fafbfc] text-slate-900 pb-28 pt-16 font-sans overflow-x-hidden selection:bg-indigo-500 selection:text-white">
      
      {/* 1. TOP PILL BADGE */}
      <div className="pt-4 px-4 text-center">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-indigo-50/90 border border-indigo-200/80 text-indigo-700 text-[11px] font-black shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
          <span className="tracking-wide uppercase">TEACHER & EDUCATOR EMPOWERMENT</span>
        </div>
      </div>

      {/* 2. HERO HEADLINE */}
      <div className="px-4 pt-3 text-center space-y-2 max-w-md mx-auto">
        <h1 className="text-3xl font-black tracking-tight leading-[1.15] text-slate-950">
          AI Workspace for <br />
          <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-teal-500 bg-clip-text text-transparent">
            Master Teachers
          </span>
        </h1>

        {/* Academic Mortarboard Icon */}
        <div className="flex justify-center pt-0.5">
          <span className="text-2xl filter drop-shadow-sm">🎓</span>
        </div>

        {/* Hero Subtitle */}
        <p className="text-xs text-slate-600 font-semibold leading-relaxed max-w-xs mx-auto pt-0.5">
          Instant NCERT Question Paper Generator, OCR Book Scanner, Lesson Planner & 15 Specialized AI Employees.
        </p>
      </div>

      {/* 3. 5 QUICK FEATURE CHIPS (EXACT MATCH TO REFERENCE GRID) */}
      <div className="px-3 pt-5 max-w-md mx-auto">
        <div className="grid grid-cols-5 gap-1.5 text-center">
          {[
            { label: "5-Set-Paper AI", icon: Sparkles, color: "text-indigo-600 bg-indigo-50" },
            { label: "NCERT Catalog", icon: BookOpen, color: "text-purple-600 bg-purple-50" },
            { label: "OCR Book Scanner", icon: ScanText, color: "text-blue-600 bg-blue-50" },
            { label: "PDF Watermark", icon: FileText, color: "text-rose-600 bg-rose-50" },
            { label: "CBSE Compliance", icon: ShieldCheck, color: "text-emerald-600 bg-emerald-50" }
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="p-2 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex flex-col items-center justify-center gap-1.5 transition active:scale-95"
              >
                <div className={`w-8 h-8 rounded-xl ${item.color} flex items-center justify-center`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-[9px] font-black text-slate-800 leading-tight">
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. PRIMARY HIGH-CONVERSION CTA GRADIENT BUTTON */}
      <div className="px-4 pt-5 max-w-md mx-auto">
        <Link
          href="/login"
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:to-pink-700 text-white font-black text-sm shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 tracking-wide uppercase transition active:scale-95"
        >
          <span>CREATE PAPER NOW</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* 5. SOCIAL PROOF & METRICS STRIP (SIDE-BY-SIDE CARD) */}
      <div className="px-4 pt-5 max-w-md mx-auto">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-3.5 shadow-xs grid grid-cols-2 divide-x divide-slate-100 items-center text-center">
          {/* Left: 5k+ Educators */}
          <div className="pr-2 flex flex-col items-center justify-center">
            <div className="flex items-center -space-x-2 mb-1">
              <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 text-white text-[9px] font-black flex items-center justify-center border-2 border-white">
                AR
              </div>
              <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-500 text-white text-[9px] font-black flex items-center justify-center border-2 border-white">
                PS
              </div>
              <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-amber-500 to-rose-500 text-white text-[9px] font-black flex items-center justify-center border-2 border-white">
                VK
              </div>
              <div className="w-6 h-6 rounded-full bg-indigo-600 text-white text-[8px] font-black flex items-center justify-center border-2 border-white">
                5k+
              </div>
            </div>
            <p className="text-[10px] font-bold text-slate-700 leading-tight">
              Trusted by 5,000+ <br />
              <span className="text-slate-500 font-medium">Schools & Educators</span>
            </p>
          </div>

          {/* Right: 4.9/5 Rating */}
          <div className="pl-2 flex flex-col items-center justify-center">
            <div className="flex items-center gap-1 mb-0.5">
              <div className="flex text-amber-400">
                {"★★★★★".split("").map((s, i) => (
                  <span key={i} className="text-xs">{s}</span>
                ))}
              </div>
              <span className="text-xs font-black text-slate-900">4.9/5</span>
            </div>
            <p className="text-[10px] font-bold text-slate-600">
              User Rating
            </p>
          </div>
        </div>
      </div>

      {/* 6. INTERACTIVE MACOS-STYLE SHOWCASE MOCKUP CARD */}
      <div className="px-4 pt-6 max-w-md mx-auto">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden relative">
          
          {/* macOS Top Bar */}
          <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="text-[10px] font-bold text-slate-600 ml-1.5 truncate max-w-[140px]">
                {activeSlideData.portalTitle}
              </span>
            </div>

            <div className="flex items-center gap-1 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-full text-[9px] font-black text-amber-700">
              <span>⭐</span>
              <span>{activeSlideData.xp}</span>
            </div>
          </div>

          {/* Mockup Inner Body */}
          <div className="p-4 space-y-3.5 relative">
            
            {/* Welcome & Subtitle */}
            <div className="space-y-0.5">
              <h3 className="text-sm font-black text-slate-900">{activeSlideData.welcome}</h3>
              <p className="text-[10px] font-medium text-slate-500">{activeSlideData.subtitle}</p>
            </div>

            {/* 3 Metric Cards */}
            <div className="grid grid-cols-3 gap-1.5">
              <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 text-center">
                <span className="text-[9px] font-bold text-slate-400 block">{activeSlideData.stat1.label}</span>
                <span className={`text-xs font-black ${activeSlideData.stat1.color}`}>{activeSlideData.stat1.val}</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 text-center">
                <span className="text-[9px] font-bold text-slate-400 block">{activeSlideData.stat2.label}</span>
                <span className={`text-xs font-black ${activeSlideData.stat2.color}`}>{activeSlideData.stat2.val}</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 text-center">
                <span className="text-[9px] font-bold text-slate-400 block">{activeSlideData.stat3.label}</span>
                <span className={`text-[11px] font-black ${activeSlideData.stat3.color} truncate block`}>{activeSlideData.stat3.val}</span>
              </div>
            </div>

            {/* Progress / Status Bar */}
            <div className="p-2.5 rounded-xl bg-indigo-50/50 border border-indigo-100 space-y-1.5">
              <div className="flex items-center justify-between text-[10px] font-bold text-slate-700">
                <span className="truncate max-w-[200px]">{activeSlideData.progressLabel}</span>
                <span className="text-indigo-600 font-black shrink-0">{activeSlideData.progressPct}</span>
              </div>
              <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                <div className={`h-full bg-gradient-to-r from-indigo-600 to-purple-600 ${activeSlideData.progressWidth} rounded-full transition-all duration-500`} />
              </div>
            </div>

            {/* Floating Badge 1 (Left Pill) */}
            <div className="p-2 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0">
                <activeSlideData.floatingCard1.icon className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-black text-slate-900 truncate">
                  {activeSlideData.floatingCard1.title} • <span className="text-indigo-600">{activeSlideData.floatingCard1.subtitle}</span>
                </p>
                <p className="text-[9px] text-slate-400 font-medium truncate">
                  {activeSlideData.floatingCard1.detail}
                </p>
              </div>
            </div>

            {/* Floating Badge 2 (Right Mini Card) */}
            <div className="p-2 rounded-xl bg-gradient-to-r from-slate-900 to-indigo-950 text-white shadow-md flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-indigo-500 to-pink-500 flex items-center justify-center font-black text-[9px]">
                  DG
                </div>
                <div>
                  <p className="text-[10px] font-black">{activeSlideData.floatingCard2.name}</p>
                  <p className="text-[8px] text-indigo-300">{activeSlideData.floatingCard2.app}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[8px] font-black px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 uppercase">
                  {activeSlideData.floatingCard2.badge}
                </span>
                <span className="text-xs font-black text-emerald-400 block mt-0.5">{activeSlideData.floatingCard2.score}</span>
              </div>
            </div>

          </div>
        </div>

        {/* Carousel Slider Controls Bar */}
        <div className="flex items-center justify-between pt-3 px-2">
          {/* Slide dots and text */}
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              {[1, 2, 3, 4].map((i) => (
                <button
                  key={i}
                  onClick={() => setCurrentSlide(i)}
                  className={`h-1.5 rounded-full transition-all ${
                    currentSlide === i ? "w-5 bg-indigo-600" : "w-1.5 bg-slate-300"
                  }`}
                  aria-label={`Go to slide ${i}`}
                />
              ))}
            </div>
            <span className="text-[10px] font-bold text-slate-500">
              {activeSlideData.tag}
            </span>
          </div>

          {/* Left / Right arrows */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={prevSlide}
              className="w-7 h-7 rounded-full bg-white border border-slate-200 text-slate-700 flex items-center justify-center shadow-xs active:scale-90 transition"
              aria-label="Previous Slide"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextSlide}
              className="w-7 h-7 rounded-full bg-white border border-slate-200 text-slate-700 flex items-center justify-center shadow-xs active:scale-90 transition"
              aria-label="Next Slide"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 7. CURVED WAVE SEPARATOR */}
      <div className="pt-10">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto text-indigo-50/50 fill-current">
          <path d="M0,32L80,48C160,64,320,96,480,96C640,96,800,64,960,48C1120,32,1280,32,1360,32L1440,32L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z" />
        </svg>
      </div>

      {/* 8. SECTION: WHY TEACHERS & EDUCATORS LOVE DEVGYA AI */}
      <div className="bg-indigo-50/50 pt-2 pb-8 px-4">
        <div className="max-w-md mx-auto space-y-4">
          
          <div className="text-center space-y-1">
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              Why Teachers Love Devgya AI
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Powerful AI tools designed to save time & improve outcomes
            </p>
          </div>

          {/* Feature Cards Grid */}
          <div className="space-y-3 pt-2">
            
            {/* Tool 1: AI Question Paper Generator */}
            <Link
              href="/login"
              className="p-4 rounded-2xl bg-white border border-indigo-100 shadow-xs flex items-start gap-3.5 transition active:scale-98 block group"
            >
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center shrink-0 shadow-md">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black text-slate-900 group-hover:text-indigo-600 transition">
                    5-Sec Question Paper Generator
                  </h3>
                  <span className="text-[9px] font-extrabold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                    CBSE / NCERT
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 font-medium mt-1 leading-relaxed">
                  Generate blueprint-mapped test papers with multi-set variants and step-by-step marking schemes in seconds.
                </p>
              </div>
            </Link>

            {/* Tool 2: AI Assignment & Ruled Lines Studio */}
            <Link
              href="/login"
              className="p-4 rounded-2xl bg-white border border-indigo-100 shadow-xs flex items-start gap-3.5 transition active:scale-98 block group"
            >
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 text-white flex items-center justify-center shrink-0 shadow-md">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black text-slate-900 group-hover:text-indigo-600 transition">
                    Assignment & Ruled Lines Studio
                  </h3>
                  <span className="text-[9px] font-extrabold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                    Printable PDF
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 font-medium mt-1 leading-relaxed">
                  Create custom homework worksheets with ruled writing lines, response boxes, and printable teacher keys.
                </p>
              </div>
            </Link>

            {/* Tool 3: Vision OCR Book Scanner */}
            <Link
              href="/login"
              className="p-4 rounded-2xl bg-white border border-indigo-100 shadow-xs flex items-start gap-3.5 transition active:scale-98 block group"
            >
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-500 text-white flex items-center justify-center shrink-0 shadow-md">
                <ScanText className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black text-slate-900 group-hover:text-indigo-600 transition">
                    Vision OCR Scanner
                  </h3>
                  <span className="text-[9px] font-extrabold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">
                    Camera & PDF
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 font-medium mt-1 leading-relaxed">
                  Take a photo of any textbook page or question sheet to instantly extract text and synthesize questions.
                </p>
              </div>
            </Link>

            {/* Tool 4: National Skill Enhance Program 2026 */}
            <Link
              href="/login"
              className="p-4 rounded-2xl bg-white border border-indigo-100 shadow-xs flex items-start gap-3.5 transition active:scale-98 block group"
            >
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-500 text-white flex items-center justify-center shrink-0 shadow-md">
                <Trophy className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black text-slate-900 group-hover:text-indigo-600 transition">
                    Skill Enhance Program 2026
                  </h3>
                  <span className="text-[9px] font-extrabold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                    Live Practice
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 font-medium mt-1 leading-relaxed">
                  Official CBSE-aligned educator proficiency certification with 100-question practice mocks and national ranking.
                </p>
              </div>
            </Link>

            {/* Tool 5: 15 Specialized AI Employees */}
            <Link
              href="/login"
              className="p-4 rounded-2xl bg-white border border-indigo-100 shadow-xs flex items-start gap-3.5 transition active:scale-98 block group"
            >
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shrink-0 shadow-md">
                <Bot className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black text-slate-900 group-hover:text-indigo-600 transition">
                    15 Specialized AI Employees
                  </h3>
                  <span className="text-[9px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                    Multi-Role
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 font-medium mt-1 leading-relaxed">
                  Teacher Mentor, Socratic Student Tutor, Parenting Coach, Career Counselor, and English Coach.
                </p>
              </div>
            </Link>

          </div>

          {/* Bottom Callout */}
          <div className="pt-4 pb-16 text-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-xs font-extrabold text-indigo-600 hover:text-indigo-800 transition"
            >
              <span>Explore All 15 AI Tools & Start Free</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

        </div>
      </div>

    </div>
  );
}
