"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, 
  ArrowRight, 
  Bot, 
  BookOpen, 
  TrendingUp, 
  Mic, 
  ShieldCheck, 
  Star, 
  Search, 
  Bell, 
  Flame, 
  Smartphone, 
  Brain, 
  GraduationCap, 
  Activity,
  ChevronLeft,
  ChevronRight,
  FileText,
  ScanText,
  Target,
  Trophy,
  HeartHandshake,
  Layers
} from "lucide-react";

export function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      badge: "Teacher & Educator Empowerment",
      headline: <>AI Workspace for <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-teal-400">Master Teachers</span> 🎓</>,
      subtitle: "Instant NCERT Question Paper Generator, OCR Book Scanner, AI Assignment Studio & 15 Specialized AI Employees.",
      pills: [
        { icon: Sparkles, label: "5-Set Paper AI" },
        { icon: BookOpen, label: "NCERT Catalog" },
        { icon: ScanText, label: "OCR Book Scanner" },
        { icon: FileText, label: "PDF Ruled Lines" },
        { icon: ShieldCheck, label: "CBSE Compliance" }
      ],
      ctaText: "Create Paper Now",
      ctaLink: "/login",
      mockupTitle: "Teacher Portal • Paper Generator",
      mockupHeader: "Welcome Prof. Ananya Roy 👩‍🏫",
      mockupSub: "Generate NCERT Question Papers & Ruled Worksheets",
      card1Title: "Papers Created",
      card1Val: "128 Papers",
      card2Title: "Time Saved",
      card2Val: "98% Saved",
      card3Title: "Active Subject",
      card3Val: "Science & Math",
      progressTitle: "Class 10 Science Paper • Answer Key Included",
      progressPct: "94%",
      tutorMsg: "Question Paper & Assignment ready! Export ReportLab PDF with school watermark."
    },
    {
      badge: "AI-Powered Education Platform",
      headline: <>The Future of <br />Education is <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-indigo-300 to-pink-400">AI</span> ✨</>,
      subtitle: "Empowering Teachers, Students & Parents with AI Agents, Smart Tools and Personalized Learning.",
      pills: [
        { icon: Bot, label: "AI Agents for Everyone" },
        { icon: BookOpen, label: "Personalized Learning" },
        { icon: TrendingUp, label: "Smart Analytics" },
        { icon: Mic, label: "Voice & OCR Powered" },
        { icon: ShieldCheck, label: "Secure & Private" }
      ],
      ctaText: "Get Started Free",
      ctaLink: "/login",
      mockupTitle: "Student Portal • DEVGYA GLOBAL",
      mockupHeader: "Good morning, Ananya! 👋",
      mockupSub: "Ready to learn something amazing today?",
      card1Title: "Study Streak",
      card1Val: "12 Days 🔥",
      card2Title: "Today's Goal",
      card2Val: "3/5 Done",
      card3Title: "AI Topic",
      card3Val: "Physics • Motion",
      progressTitle: "Physics • Chapter 4: Motion in a Plane",
      progressPct: "75%",
      tutorMsg: "Hi Ananya! 👋 How can I help you learn today?"
    },
    {
      badge: "Gamified Self-Study Corner",
      headline: <>Socratic AI Tutor & <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-orange-400">Practice Suite</span> 🏆</>,
      subtitle: "Duolingo-style XP Streaks, Socratic Hints without Answer Spoilers, Active Recall Flashcards & Leaderboards.",
      pills: [
        { icon: Brain, label: "Socratic Guidance" },
        { icon: Target, label: "Adaptive Quizzes" },
        { icon: Layers, label: "Flashcards Deck" },
        { icon: Trophy, label: "XP Leaderboards" },
        { icon: FileText, label: "Notion AI Notes" }
      ],
      ctaText: "Explore Self-Study",
      ctaLink: "/login",
      mockupTitle: "Socratic AI Tutor • Student Corner",
      mockupHeader: "Aarav Sharma • Rank #1 🏅",
      mockupSub: "Socratic AI step-by-step problem solver active",
      card1Title: "XP Earned",
      card1Val: "480 XP",
      card2Title: "Level",
      card2Val: "Level 5",
      card3Title: "Target Goal",
      card3Val: "95%+ Board Exam",
      progressTitle: "Optics Socratic Derivation • Concave Mirror Formula",
      progressPct: "90%",
      tutorMsg: "What happens to light rays passing through the center of curvature?"
    },
    {
      badge: "Parent Visibility & Guidance",
      headline: <>Holistic Child Growth & <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-rose-300 to-purple-400">Parent Portal</span> 👨‍👩‍👧</>,
      subtitle: "Complete Academic Progress Charts, AI Parenting Coach, Screen-Time Management & Real-Time Alerts.",
      pills: [
        { icon: HeartHandshake, label: "AI Parenting Coach" },
        { icon: Activity, label: "Child Progress" },
        { icon: Smartphone, label: "Screen-Time Control" },
        { icon: Bell, label: "Real-Time Alerts" },
        { icon: ShieldCheck, label: "Holistic Safety" }
      ],
      ctaText: "Parent Portal Login",
      ctaLink: "/login",
      mockupTitle: "Parent Dashboard • Child Growth",
      mockupHeader: "Rajesh & Meena Sharma 👨‍👩‍👧",
      mockupSub: "Tracking Aarav Sharma's learning journey",
      card1Title: "Overall Score",
      card1Val: "85% Dist.",
      card2Title: "Attendance",
      card2Val: "92% Month",
      card3Title: "Home Study",
      card3Val: "1.5 Hrs/Day",
      progressTitle: "Weekly Subject Mastery • Physics 88% | Math 92%",
      progressPct: "88%",
      tutorMsg: "Parent Tip: Schedule 15-min quiet study after dinner tonight."
    }
  ];

  // Auto-switch slide every 3 seconds (3000ms)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const slide = slides[currentSlide];

  return (
    <section className="relative pt-28 pb-12 md:pt-36 md:pb-16 overflow-hidden bg-gradient-to-b from-indigo-50/80 via-white to-slate-50 text-slate-900">
      
      {/* BACKGROUND AMBIENT GLOWS */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-200/40 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-purple-200/40 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#6366f10c_1px,transparent_1px),linear-gradient(to_bottom,#6366f10c_1px,transparent_1px)] bg-[size:3rem_3rem] pointer-events-none" />

      <div className="max-w-[1350px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-8">
        
        {/* SLIDE CONTENT ANIMATION CONTAINER */}
        <AnimatePresence mode="wait">
          <motion.div 
            key={currentSlide}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-6 items-center"
          >
            
            {/* LEFT COLUMN */}
            <div className="lg:col-span-5 space-y-5 text-left">
              
              {/* BRAND BADGE */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-indigo-200 text-indigo-700 text-xs font-extrabold shadow-sm backdrop-blur-md">
                <div className="w-4.5 h-4.5 rounded-md bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center">
                  <Sparkles className="w-3 h-3 text-white" />
                </div>
                <span className="tracking-wide uppercase">{slide.badge}</span>
              </div>

              {/* MAIN HEADLINE */}
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] text-slate-900">
                {slide.headline}
              </h1>

              {/* SUBTITLE */}
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed font-medium max-w-lg">
                {slide.subtitle}
              </p>

              {/* 5 ICON FEATURE PILL CARDS GRID */}
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 pt-1">
                {slide.pills.map((feat, i) => (
                  <div 
                    key={i} 
                    className="bg-white border border-slate-200 hover:border-indigo-400 p-2.5 rounded-xl flex flex-col items-center text-center space-y-1 transition-all shadow-xs group hover:bg-indigo-50/50"
                  >
                    <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white flex items-center justify-center border border-indigo-100 transition-colors">
                      <feat.icon className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[9px] font-extrabold text-slate-700 leading-tight group-hover:text-indigo-900">
                      {feat.label}
                    </span>
                  </div>
                ))}
              </div>

              {/* CTA ACTION BUTTONS */}
              <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
                <Link
                  href={slide.ctaLink}
                  className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:to-pink-700 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 group uppercase tracking-wider active:scale-95"
                >
                  <span>{slide.ctaText}</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

              {/* SOCIAL PROOF & RATING BADGES */}
              <div className="flex items-center gap-5 pt-3 border-t border-slate-200">
                <div className="flex items-center gap-2.5">
                  <div className="flex -space-x-2">
                    {["usr1", "usr2", "usr3", "usr4"].map((u, i) => (
                      <div 
                        key={i} 
                        className="w-6 h-6 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 border-2 border-white flex items-center justify-center text-[9px] font-bold text-white shadow-xs"
                      >
                        {["A", "R", "S", "P"][i]}
                      </div>
                    ))}
                    <div className="w-6 h-6 rounded-full bg-indigo-600 border-2 border-white flex items-center justify-center text-[8px] font-black text-white">
                      5K+
                    </div>
                  </div>
                  <div className="text-left">
                    <span className="text-[10px] font-extrabold text-slate-800 block leading-tight">Trusted by 5,000+</span>
                    <span className="text-[9px] text-slate-500 font-semibold">Schools & Educators</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 border-l border-slate-200 pl-5">
                  <div className="flex text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-amber-400" />
                    ))}
                  </div>
                  <div className="text-left">
                    <span className="text-xs font-black text-slate-900 block leading-tight">4.9/5</span>
                    <span className="text-[9px] text-slate-500 font-semibold">User Rating</span>
                  </div>
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN: SAAS DASHBOARD MOCKUP */}
            <div className="lg:col-span-7 relative">
              
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 blur-2xl rounded-3xl" />

              <div className="relative bg-white border border-indigo-200 rounded-3xl shadow-2xl overflow-hidden p-4 text-left space-y-3">
                
                {/* TOP HEADER BAR */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span className="text-[11px] font-extrabold text-slate-700 ml-2">{slide.mockupTitle}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 px-2 py-0.5 bg-amber-50 border border-amber-200 text-amber-700 rounded-full text-[10px] font-extrabold">
                      <Flame className="w-3 h-3 fill-amber-500 text-amber-500" />
                      <span>1200 XP</span>
                    </div>
                    <div className="relative">
                      <Bell className="w-3.5 h-3.5 text-slate-500" />
                      <span className="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-rose-500" />
                    </div>
                  </div>
                </div>

                {/* SAAS DASHBOARD CONTENT LAYOUT */}
                <div className="grid grid-cols-12 gap-3">
                  
                  {/* MINI SIDEBAR */}
                  <div className="hidden sm:block sm:col-span-3 space-y-1 border-r border-slate-100 pr-2">
                    {[
                      { label: "Dashboard", active: true },
                      { label: "AI Chat" },
                      { label: "AI Agents" },
                      { label: "Study Planner" },
                      { label: "Assignments" },
                      { label: "Resources" },
                      { label: "Analytics" },
                      { label: "Notes" },
                      { label: "Flashcards" }
                    ].map((nav, nIdx) => (
                      <div 
                        key={nIdx}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                          nav.active ? "bg-indigo-600 text-white shadow-xs" : "text-slate-600 hover:text-indigo-600 hover:bg-indigo-50"
                        }`}
                      >
                        {nav.label}
                      </div>
                    ))}
                  </div>

                  {/* MAIN DASHBOARD PANEL */}
                  <div className="col-span-12 sm:col-span-9 space-y-3">
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                          <span>{slide.mockupHeader}</span>
                        </h3>
                        <p className="text-[10px] text-slate-500 font-medium">{slide.mockupSub}</p>
                      </div>
                      <div className="relative">
                        <Search className="w-3 h-3 text-slate-400 absolute left-2.5 top-1.5" />
                        <input 
                          type="text" 
                          readOnly 
                          placeholder="Search..." 
                          className="bg-slate-50 border border-slate-200 rounded-lg pl-7 pr-2 py-0.5 text-[10px] text-slate-700 w-28"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-amber-50/50 border border-amber-100 p-2 rounded-xl space-y-0.5">
                        <span className="text-[9px] text-amber-800 font-bold block">{slide.card1Title}</span>
                        <div className="text-xs font-black text-amber-600 flex items-center gap-1">
                          <span>{slide.card1Val}</span>
                        </div>
                      </div>

                      <div className="bg-indigo-50/50 border border-indigo-100 p-2 rounded-xl space-y-0.5">
                        <span className="text-[9px] text-indigo-800 font-bold block">{slide.card2Title}</span>
                        <div className="text-xs font-black text-indigo-600">
                          {slide.card2Val}
                        </div>
                      </div>

                      <div className="bg-purple-50/50 border border-purple-100 p-2 rounded-xl space-y-0.5">
                        <span className="text-[9px] text-purple-800 font-bold block">{slide.card3Title}</span>
                        <span className="text-[9px] font-bold text-slate-900 block truncate">{slide.card3Val}</span>
                      </div>
                    </div>

                    <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl space-y-1.5">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="font-extrabold text-slate-800">{slide.progressTitle}</span>
                        <span className="text-indigo-600 font-black">{slide.progressPct}</span>
                      </div>
                      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 h-full" style={{ width: slide.progressPct }} />
                      </div>
                    </div>

                  </div>

                </div>

              </div>

              {/* FLOATING AI TUTOR CHAT WIDGET */}
              <div className="absolute top-1/4 -left-3 sm:-left-6 z-20 w-56 sm:w-64 bg-white/95 border border-indigo-200 rounded-2xl p-3 shadow-xl backdrop-blur-xl space-y-2 hidden md:block">
                <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-xs">
                      <Bot className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h4 className="text-[11px] font-bold text-slate-900">AI Assistant</h4>
                      <span className="text-[8px] text-emerald-600 font-bold block">● Active</span>
                    </div>
                  </div>
                </div>

                <div className="text-[10px] text-slate-700 bg-indigo-50/50 p-2 rounded-xl border border-indigo-100 leading-relaxed font-semibold">
                  {slide.tutorMsg}
                </div>
              </div>

              {/* MOBILE IPHONE MOCKUP OVERLAY */}
              <div className="absolute -bottom-4 -right-3 sm:-right-6 z-20 w-44 sm:w-52 bg-white border-2 border-indigo-100 rounded-2xl p-2.5 shadow-xl hidden sm:block space-y-2">
                <div className="flex items-center justify-between text-[9px] font-extrabold text-indigo-700 border-b border-slate-100 pb-1">
                  <span>Devgya Mobile App</span>
                  <Smartphone className="w-3 h-3 text-indigo-600" />
                </div>
                <div className="flex items-center gap-1.5 bg-slate-50 p-1.5 rounded-xl border border-slate-200">
                  <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-[10px] font-bold text-white">
                    DG
                  </div>
                  <div>
                    <h5 className="text-[10px] font-extrabold text-slate-900">Devgya AI OS</h5>
                    <span className="text-[8px] text-slate-500 font-semibold">Class K-12</span>
                  </div>
                </div>

                <div className="bg-emerald-50 border border-emerald-200 p-2 rounded-xl text-center space-y-0.5">
                  <span className="text-[8px] text-emerald-800 font-extrabold block uppercase">Overall Mastery</span>
                  <span className="text-base font-black text-emerald-600 block">94%</span>
                </div>
              </div>

            </div>

          </motion.div>
        </AnimatePresence>

        {/* AUTO SLIDESHOW CONTROLS & DOTS */}
        <div className="flex items-center justify-between pt-2">
          
          <div className="flex items-center gap-2">
            {slides.map((_, sIdx) => (
              <button
                key={sIdx}
                onClick={() => setCurrentSlide(sIdx)}
                className={`h-2 rounded-full transition-all ${
                  currentSlide === sIdx 
                    ? "w-8 bg-indigo-600 shadow-xs" 
                    : "w-2 bg-slate-300 hover:bg-slate-400"
                }`}
                title={`Slide ${sIdx + 1}`}
              />
            ))}
            <span className="text-[11px] font-bold text-indigo-700 ml-2">
              Slide 0{currentSlide + 1} / 04 (Auto 3s)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1))}
              className="p-2 rounded-xl bg-white hover:bg-indigo-50 text-slate-700 border border-slate-200 transition-colors shadow-xs"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
              className="p-2 rounded-xl bg-white hover:bg-indigo-50 text-slate-700 border border-slate-200 transition-colors shadow-xs"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

        </div>

        {/* BOTTOM RIBBON BAR */}
        <div className="bg-white border border-indigo-100 backdrop-blur-xl rounded-2xl p-4 shadow-md flex flex-wrap items-center justify-around gap-3 text-xs font-bold text-slate-700">
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4 text-indigo-600" />
            <span>AI-Powered Learning</span>
          </div>
          <div className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-purple-600" />
            <span>Adaptive & Personal</span>
          </div>
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-600" />
            <span>Real-time Analytics</span>
          </div>
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-pink-600" />
            <span>Multi-Device Support</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-600" />
            <span>Trusted by Educators</span>
          </div>
        </div>

      </div>

    </section>
  );
}
