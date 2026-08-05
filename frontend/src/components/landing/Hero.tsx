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
      badge: "Teacher & Educator Empowerment",
      headline: <>AI Workspace for <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-cyan-300 to-emerald-400">Master Teachers</span> 🎓</>,
      subtitle: "Instant NCERT Question Paper Generator, OCR Book Scanner, Lesson Planner & 15 Specialized AI Employees.",
      pills: [
        { icon: Sparkles, label: "5-Sec Paper AI" },
        { icon: BookOpen, label: "NCERT Catalog" },
        { icon: ScanText, label: "OCR Book Scanner" },
        { icon: FileText, label: "PDF Watermark" },
        { icon: ShieldCheck, label: "CBSE Compliance" }
      ],
      ctaText: "Create Paper Now",
      ctaLink: "/login",
      mockupTitle: "Teacher Portal • Paper Generator",
      mockupHeader: "Welcome Prof. Ananya Roy 👩‍🏫",
      mockupSub: "Generate NCERT Question Papers & 45-Min Lesson Plans",
      card1Title: "Papers Created",
      card1Val: "48 Papers",
      card2Title: "Time Saved",
      card2Val: "98% Saved",
      card3Title: "Active Subject",
      card3Val: "Science & Math",
      progressTitle: "CBSE Class 10 Science Paper • Answer Key Included",
      progressPct: "100%",
      tutorMsg: "Question Paper ready! Export ReportLab PDF with school watermark."
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
    <section className="relative pt-28 pb-10 md:pt-32 md:pb-14 overflow-hidden bg-[#09071B] text-white">
      
      {/* BACKGROUND AMBIENT GLOWS & NEON PARTICLES */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-purple-600/20 blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-indigo-600/20 blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:3rem_3rem] pointer-events-none" />

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
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-purple-500/30 text-purple-300 text-xs font-bold backdrop-blur-md shadow-lg">
                <div className="w-4.5 h-4.5 rounded-md bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center">
                  <Sparkles className="w-3 h-3 text-white" />
                </div>
                <span className="tracking-wide">{slide.badge}</span>
              </div>

              {/* MAIN HEADLINE */}
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] text-white">
                {slide.headline}
              </h1>

              {/* SUBTITLE */}
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed font-normal max-w-lg">
                {slide.subtitle}
              </p>

              {/* 5 ICON FEATURE PILL CARDS GRID */}
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 pt-1">
                {slide.pills.map((feat, i) => (
                  <div 
                    key={i} 
                    className="bg-white/5 border border-white/10 hover:border-purple-500/50 p-2 rounded-xl flex flex-col items-center text-center space-y-1 transition-all group hover:bg-purple-900/20"
                  >
                    <div className="w-7 h-7 rounded-lg bg-purple-500/10 text-purple-400 group-hover:text-purple-300 flex items-center justify-center border border-purple-500/20">
                      <feat.icon className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[9px] font-bold text-slate-300 leading-tight group-hover:text-white">
                      {feat.label}
                    </span>
                  </div>
                ))}
              </div>

              {/* CTA ACTION BUTTONS */}
              <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
                <Link
                  href={slide.ctaLink}
                  className="w-full sm:w-auto px-7 py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-xs rounded-xl shadow-[0_0_20px_rgba(147,51,234,0.4)] transition-all flex items-center justify-center gap-2 group uppercase tracking-wider"
                >
                  <span>{slide.ctaText}</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

              {/* SOCIAL PROOF & RATING BADGES */}
              <div className="flex items-center gap-5 pt-3 border-t border-white/10">
                <div className="flex items-center gap-2.5">
                  <div className="flex -space-x-2">
                    {["usr1", "usr2", "usr3", "usr4"].map((u, i) => (
                      <div 
                        key={i} 
                        className="w-6 h-6 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-600 border-2 border-[#09071B] flex items-center justify-center text-[9px] font-bold text-white"
                      >
                        {["A", "R", "S", "P"][i]}
                      </div>
                    ))}
                    <div className="w-6 h-6 rounded-full bg-purple-600 border-2 border-[#09071B] flex items-center justify-center text-[8px] font-black text-white">
                      5K+
                    </div>
                  </div>
                  <div className="text-left">
                    <span className="text-[10px] font-bold text-slate-300 block leading-tight">Trusted by 5,000+</span>
                    <span className="text-[9px] text-slate-400">Schools & Educators</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 border-l border-white/10 pl-5">
                  <div className="flex text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-amber-400" />
                    ))}
                  </div>
                  <div className="text-left">
                    <span className="text-xs font-black text-white block leading-tight">4.9/5</span>
                    <span className="text-[9px] text-slate-400">User Rating</span>
                  </div>
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN: SAAS DASHBOARD MOCKUP */}
            <div className="lg:col-span-7 relative">
              
              <div className="absolute inset-0 bg-gradient-to-tr from-purple-600/20 to-indigo-600/20 blur-2xl rounded-3xl" />

              <div className="relative bg-[#0F0D29] border border-purple-500/30 rounded-3xl shadow-2xl overflow-hidden p-4 text-left space-y-3">
                
                {/* TOP HEADER BAR */}
                <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                    <span className="text-[11px] font-extrabold text-slate-300 ml-2">{slide.mockupTitle}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 px-2 py-0.5 bg-amber-500/10 border border-amber-500/30 text-amber-300 rounded-full text-[10px] font-bold">
                      <Flame className="w-3 h-3 fill-amber-400" />
                      <span>1200 XP</span>
                    </div>
                    <div className="relative">
                      <Bell className="w-3.5 h-3.5 text-slate-400" />
                      <span className="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-rose-500" />
                    </div>
                  </div>
                </div>

                {/* SAAS DASHBOARD CONTENT LAYOUT */}
                <div className="grid grid-cols-12 gap-3">
                  
                  {/* MINI SIDEBAR */}
                  <div className="hidden sm:block sm:col-span-3 space-y-1 border-r border-white/10 pr-2">
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
                          nav.active ? "bg-purple-600 text-white shadow-md" : "text-slate-400 hover:text-slate-200"
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
                        <h3 className="text-xs sm:text-sm font-extrabold text-white flex items-center gap-1.5">
                          <span>{slide.mockupHeader}</span>
                        </h3>
                        <p className="text-[10px] text-slate-400">{slide.mockupSub}</p>
                      </div>
                      <div className="relative">
                        <Search className="w-3 h-3 text-slate-400 absolute left-2.5 top-1.5" />
                        <input 
                          type="text" 
                          readOnly 
                          placeholder="Search..." 
                          className="bg-white/5 border border-white/10 rounded-lg pl-7 pr-2 py-0.5 text-[10px] text-slate-300 w-28"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-white/5 border border-white/10 p-2 rounded-xl space-y-0.5">
                        <span className="text-[9px] text-slate-400 font-semibold block">{slide.card1Title}</span>
                        <div className="text-xs font-black text-amber-400 flex items-center gap-1">
                          <span>{slide.card1Val}</span>
                        </div>
                      </div>

                      <div className="bg-white/5 border border-white/10 p-2 rounded-xl space-y-0.5">
                        <span className="text-[9px] text-slate-400 font-semibold block">{slide.card2Title}</span>
                        <div className="text-xs font-black text-indigo-400">
                          {slide.card2Val}
                        </div>
                      </div>

                      <div className="bg-white/5 border border-purple-500/30 bg-purple-500/10 p-2 rounded-xl space-y-0.5">
                        <span className="text-[9px] text-purple-300 font-bold block">{slide.card3Title}</span>
                        <span className="text-[9px] font-bold text-white block truncate">{slide.card3Val}</span>
                      </div>
                    </div>

                    <div className="bg-white/5 border border-white/10 p-2.5 rounded-xl space-y-1.5">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="font-bold text-slate-200">{slide.progressTitle}</span>
                        <span className="text-purple-400 font-bold">{slide.progressPct}</span>
                      </div>
                      <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-gradient-to-r from-purple-500 to-indigo-500 h-full" style={{ width: slide.progressPct }} />
                      </div>
                    </div>

                  </div>

                </div>

              </div>

              {/* FLOATING AI TUTOR CHAT WIDGET */}
              <div className="absolute top-1/4 -left-3 sm:-left-6 z-20 w-56 sm:w-64 bg-[#14123B]/95 border border-purple-500/40 rounded-2xl p-3 shadow-2xl backdrop-blur-xl space-y-2 hidden md:block">
                <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-purple-600 flex items-center justify-center text-white font-bold text-xs">
                      <Bot className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h4 className="text-[11px] font-bold text-white">AI Assistant</h4>
                      <span className="text-[8px] text-emerald-400 font-bold block">● Active</span>
                    </div>
                  </div>
                </div>

                <div className="text-[10px] text-slate-200 bg-white/5 p-2 rounded-xl border border-white/10 leading-relaxed font-medium">
                  {slide.tutorMsg}
                </div>
              </div>

              {/* MOBILE IPHONE MOCKUP OVERLAY */}
              <div className="absolute -bottom-4 -right-3 sm:-right-6 z-20 w-44 sm:w-52 bg-[#0F0D29] border-2 border-[#252250] rounded-2xl p-2.5 shadow-2xl hidden sm:block space-y-2">
                <div className="flex items-center justify-between text-[9px] font-bold text-purple-300 border-b border-white/10 pb-1">
                  <span>Devgya Mobile App</span>
                  <Smartphone className="w-3 h-3 text-purple-400" />
                </div>
                <div className="flex items-center gap-1.5 bg-white/5 p-1.5 rounded-xl">
                  <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-[10px] font-bold text-white">
                    DG
                  </div>
                  <div>
                    <h5 className="text-[10px] font-bold text-white">Devgya AI OS</h5>
                    <span className="text-[8px] text-slate-400">Class K-12</span>
                  </div>
                </div>

                <div className="bg-purple-900/30 border border-purple-500/30 p-2 rounded-xl text-center space-y-0.5">
                  <span className="text-[8px] text-purple-200 font-bold block uppercase">Overall Mastery</span>
                  <span className="text-base font-black text-emerald-400 block">94%</span>
                </div>
              </div>

            </div>

          </motion.div>
        </AnimatePresence>

        {/* AUTO SLIDESHOW CONTROLS & DOTS (3 SEC TIMER ACTIVE) */}
        <div className="flex items-center justify-between pt-2">
          
          <div className="flex items-center gap-2">
            {slides.map((_, sIdx) => (
              <button
                key={sIdx}
                onClick={() => setCurrentSlide(sIdx)}
                className={`h-2 rounded-full transition-all ${
                  currentSlide === sIdx 
                    ? "w-8 bg-gradient-to-r from-purple-500 to-indigo-500 shadow-md" 
                    : "w-2 bg-white/20 hover:bg-white/40"
                }`}
                title={`Slide ${sIdx + 1}`}
              />
            ))}
            <span className="text-[11px] font-bold text-purple-300 ml-2">
              Slide 0{currentSlide + 1} / 04 (Auto-switching 3s)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1))}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/10 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/10 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

        </div>

        {/* BOTTOM RIBBON BAR */}
        <div className="bg-white/5 border border-purple-500/30 backdrop-blur-xl rounded-2xl p-3.5 shadow-2xl flex flex-wrap items-center justify-around gap-3 text-xs font-bold text-slate-200">
          <div className="flex items-center gap-2">
            <Brain className="w-3.5 h-3.5 text-purple-400" />
            <span>AI-Powered Learning</span>
          </div>
          <div className="flex items-center gap-2">
            <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />
            <span>Adaptive & Personal</span>
          </div>
          <div className="flex items-center gap-2">
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            <span>Real-time Analytics</span>
          </div>
          <div className="flex items-center gap-2">
            <Smartphone className="w-3.5 h-3.5 text-pink-400" />
            <span>Multi-Device Support</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>Trusted by Educators</span>
          </div>
        </div>

      </div>

    </section>
  );
}
