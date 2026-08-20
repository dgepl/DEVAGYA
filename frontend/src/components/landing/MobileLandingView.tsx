"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Sparkles, 
  BookOpen, 
  ScanText, 
  Bot, 
  ArrowRight, 
  ShieldCheck, 
  CheckCircle2, 
  ChevronRight, 
  Zap, 
  Activity, 
  FileText, 
  Video, 
  Search, 
  Layers, 
  Brain, 
  Trophy, 
  Flame, 
  Star,
  Smartphone,
  Check,
  Building2,
  Clock,
  Calculator,
  Award,
  Users,
  GraduationCap,
  HeartHandshake,
  Lock,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  MapPin,
  HelpCircle as QuestionIcon,
  Play,
  RotateCcw,
  Sparkle
} from "lucide-react";

export function MobileLandingView() {
  // State 1: Active Interactive Simulator Demo Tab
  const [activeDemo, setActiveDemo] = useState<"generator" | "ocr" | "planner" | "tutor">("generator");
  
  // State 2: Selected Grade for Generator Demo
  const [selectedGrade, setSelectedGrade] = useState<string>("Class 10");

  // State 3: Active Role Filter for AI Agents
  const [agentRoleFilter, setAgentRoleFilter] = useState<"all" | "teacher" | "student" | "parent">("all");

  // State 4: Interactive Quiz Widget State
  const [quizSelectedOpt, setQuizSelectedOpt] = useState<number | null>(null);
  const [quizAnswered, setQuizAnswered] = useState<boolean>(false);

  // State 5: FAQ Accordion Open Toggles
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // 15 AI Agents Catalog
  const allAgents = [
    { code: "teacher_mentor", name: "Teacher Mentor", role: "teacher", badge: "Pedagogy", desc: "CBSE curriculum strategy & classroom management", color: "from-blue-600 to-indigo-600", icon: GraduationCap },
    { code: "question_generator", name: "Question Generator", role: "teacher", badge: "NCERT Engine", desc: "Instantly create 1M, 3M, 5M periodic assessment papers", color: "from-indigo-600 to-purple-600", icon: Sparkles },
    { code: "lesson_planner", name: "5E Lesson Planner", role: "teacher", badge: "5E Framework", desc: "Build daily 5E Framework activity timelines & blueprints", color: "from-purple-600 to-pink-600", icon: BookOpen },
    { code: "student_tutor", name: "Socratic AI Tutor", role: "student", badge: "Step-by-Step", desc: "Guides math & science problems without spoiling answers", color: "from-amber-500 to-orange-600", icon: Brain },
    { code: "parent_coach", name: "Parenting Coach", role: "parent", badge: "Child Growth", desc: "Balanced screen-time controls & home study routines", color: "from-rose-500 to-pink-600", icon: HeartHandshake },
    { code: "english_coach", name: "English Coach", role: "teacher", badge: "Communication", desc: "Enhance educator English speaking & vocabulary skills", color: "from-emerald-600 to-teal-600", icon: Trophy },
    { code: "exam_strategist", name: "Exam Strategist", role: "student", badge: "Board Prep", desc: "Board mark weightage analysis & study timetable planner", color: "from-cyan-600 to-blue-600", icon: Flame },
    { code: "homework_assistant", name: "Homework Assistant", role: "student", badge: "AI Helper", desc: "Interactive query assistance & conceptual practice", color: "from-violet-600 to-indigo-600", icon: Zap }
  ];

  const filteredAgents = allAgents.filter(a => {
    if (agentRoleFilter === "all") return true;
    return a.role === agentRoleFilter;
  });

  // FAQs
  const faqs = [
    {
      q: "What is Devgya Global Edutech Private Limited?",
      a: "At Devgya Global Edutech, we bridge the gap between schools, teachers, and parents. Headquartered in Jhajjar, Haryana, we provide seamless book supply, CBSE teacher training, OCR worksheet tools, Socratic AI student assistance, and parenting guides under one roof."
    },
    {
      q: "How does the AI Question Generator work?",
      a: "Our AI engine generates CBSE/NCERT periodic assessment question papers with 1M, 3M, and 5M questions along with model step-by-step answer keys in under 5 seconds."
    },
    {
      q: "Is student data safe and private on Devgya?",
      a: "Yes! We use advanced encryption and secure protocols to protect user data. We do not sell or rent personal information to third parties."
    },
    {
      q: "What physical school support does Devgya provide?",
      a: "We facilitate seamless book supplies, academic publishing, professional CBSE teacher training workshops, composite science lab hardware, and job placement support."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-28 pt-20 relative overflow-hidden font-sans md:hidden selection:bg-indigo-500 selection:text-white">
      
      {/* GLOWING AMBIENT BACKGROUND ORBS */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[380px] h-[340px] bg-indigo-200/50 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute top-[600px] right-0 w-[300px] h-[300px] bg-purple-200/40 blur-[100px] rounded-full pointer-events-none" />

      {/* 1. TOP ANNOUNCEMENT BANNER */}
      <div className="px-4 text-center relative z-10 mb-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-indigo-100 shadow-xs text-slate-800 text-[11px] font-extrabold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
          <span>Devgya Global • Jhajjar, Haryana</span>
        </div>
      </div>

      {/* 2. HERO SECTION */}
      <div className="px-5 text-center space-y-5 relative z-10">
        
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 border border-indigo-200/80 text-indigo-900 text-xs font-black shadow-xs">
          <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
          <span>K-12 School AI Operating System</span>
        </div>

        <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-[1.18]">
          Welcome to <br />
          <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Devgya Global Edutech
          </span>
        </h1>

        <p className="text-xs text-slate-600 font-medium leading-relaxed max-w-xs mx-auto">
          Bridging the gap between schools, teachers, and parents with 360° tools, academic resources, CBSE workshops, and 15 AI Agents.
        </p>

        {/* HERO ROLE HIGHLIGHT SWITCHER */}
        <div className="grid grid-cols-3 gap-2 pt-1 max-w-xs mx-auto">
          <div className="p-2.5 rounded-2xl bg-white border border-indigo-100 shadow-xs text-center">
            <Building2 className="w-5 h-5 text-indigo-600 mx-auto mb-1" />
            <span className="text-[10px] font-extrabold text-slate-800 block">For Schools</span>
          </div>
          <div className="p-2.5 rounded-2xl bg-white border border-purple-100 shadow-xs text-center">
            <GraduationCap className="w-5 h-5 text-purple-600 mx-auto mb-1" />
            <span className="text-[10px] font-extrabold text-slate-800 block">For Teachers</span>
          </div>
          <div className="p-2.5 rounded-2xl bg-white border border-emerald-100 shadow-xs text-center">
            <Users className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
            <span className="text-[10px] font-extrabold text-slate-800 block">Parents & Students</span>
          </div>
        </div>

        {/* HERO MAIN CTA BUTTONS */}
        <div className="space-y-2.5 pt-2">
          <Link
            href="/login"
            className="w-full py-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:opacity-95 text-white font-extrabold text-xs rounded-2xl shadow-xl shadow-indigo-600/25 flex items-center justify-center gap-2 uppercase tracking-wider active:scale-95 transition-transform"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Sign In to AI Operating System</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <div className="grid grid-cols-2 gap-2">
            <Link
              href="/register"
              className="py-3 bg-white hover:bg-slate-50 text-slate-800 font-extrabold text-[11px] rounded-xl border border-slate-200/90 shadow-xs flex items-center justify-center gap-1.5 active:scale-95 transition-transform"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Create Account</span>
            </Link>

            <Link
              href="/why-choose-us"
              className="py-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-extrabold text-[11px] rounded-xl border border-indigo-200 shadow-xs flex items-center justify-center gap-1.5 active:scale-95 transition-transform"
            >
              <Award className="w-3.5 h-3.5 text-indigo-600" />
              <span>Why Choose Us</span>
            </Link>
          </div>
        </div>

      </div>

      {/* 3. KEY METRICS STATS BAR */}
      <div className="mt-8 px-5">
        <div className="grid grid-cols-2 gap-3 p-4 rounded-3xl bg-white border border-slate-200/80 shadow-md">
          <div className="flex items-center gap-2.5 p-2">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-extrabold text-xs">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <div className="text-base font-black text-slate-900 leading-none">5,000+</div>
              <div className="text-[10px] text-slate-500 font-bold mt-0.5">Partner Schools</div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-2">
            <div className="w-9 h-9 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 font-extrabold text-xs">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <div className="text-base font-black text-slate-900 leading-none">98%</div>
              <div className="text-[10px] text-slate-500 font-bold mt-0.5">Prep Time Saved</div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 font-extrabold text-xs">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <div className="text-base font-black text-slate-900 leading-none">100%</div>
              <div className="text-[10px] text-slate-500 font-bold mt-0.5">CBSE & NCERT</div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-2">
            <div className="w-9 h-9 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 font-extrabold text-xs">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="text-base font-black text-slate-900 leading-none">Encrypted</div>
              <div className="text-[10px] text-slate-500 font-bold mt-0.5">Student Privacy</div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. LIVE INTERACTIVE FEATURE SIMULATOR */}
      <div className="mt-10 px-5 space-y-4 relative z-10">
        
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 block">Interactive Playground</span>
            <h2 className="text-lg font-black text-slate-900">Experience AI Tools Live</h2>
          </div>
          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            Real-time Demo
          </span>
        </div>

        {/* DEMO SELECTOR PILLS */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: "generator", label: "Paper Generator", icon: Zap },
            { id: "ocr", label: "Vision Scanner", icon: ScanText },
            { id: "planner", label: "5E Planner", icon: BookOpen },
            { id: "tutor", label: "Socratic AI", icon: Brain }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveDemo(tab.id as any)}
              className={`px-3.5 py-2.5 rounded-xl font-extrabold text-xs shrink-0 transition-all border flex items-center gap-1.5 ${
                activeDemo === tab.id
                  ? "bg-indigo-600 text-white border-indigo-600 shadow-md font-black"
                  : "bg-white text-slate-700 border-slate-200"
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* SIMULATOR CARD 1: QUESTION PAPER GENERATOR */}
        {activeDemo === "generator" && (
          <div className="p-5 rounded-3xl bg-white border border-indigo-100 shadow-xl space-y-4 animate-in fade-in duration-300">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-indigo-600" />
                <h3 className="text-sm font-extrabold text-slate-900">AI Question Paper Generator</h3>
              </div>
              <span className="text-[9px] font-extrabold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded-md">
                3 Seconds
              </span>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-extrabold uppercase text-slate-500 block">Select Target Grade</label>
              <div className="grid grid-cols-3 gap-2">
                {["Class 9", "Class 10", "Class 12"].map(grade => (
                  <button
                    key={grade}
                    onClick={() => setSelectedGrade(grade)}
                    className={`py-1.5 text-xs font-bold rounded-lg border transition-all ${
                      selectedGrade === grade 
                        ? "bg-indigo-50 text-indigo-700 border-indigo-300 font-extrabold" 
                        : "bg-slate-50 text-slate-600 border-slate-200"
                    }`}
                  >
                    {grade}
                  </button>
                ))}
              </div>
            </div>

            {/* GENERATED SIMULATION OUTPUT PAPER */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-extrabold text-indigo-700">DEVGYA Model Paper • {selectedGrade} Science</span>
                <span className="font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">100% NCERT</span>
              </div>
              <p className="text-xs font-bold text-slate-800 leading-snug">
                Q1. Explain the process of redox reactions with a balanced chemical equation. [3 Marks]
              </p>
              <div className="p-2 bg-white rounded-xl border border-slate-200 text-[11px] text-slate-600 font-medium leading-relaxed">
                <strong className="text-indigo-600">Model Answer Key:</strong> Oxidation involves loss of electrons, while reduction involves gain...
              </div>
            </div>

            <Link
              href="/login"
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 uppercase tracking-wider active:scale-95 transition-transform"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Generate Full Paper (Sign In)</span>
            </Link>
          </div>
        )}

        {/* SIMULATOR CARD 2: VISION OCR SCANNER */}
        {activeDemo === "ocr" && (
          <div className="p-5 rounded-3xl bg-white border border-indigo-100 shadow-xl space-y-4 animate-in fade-in duration-300">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <ScanText className="w-5 h-5 text-cyan-600" />
                <h3 className="text-sm font-extrabold text-slate-900">OCR Vision Book Scanner</h3>
              </div>
              <span className="text-[9px] font-extrabold uppercase tracking-wider bg-cyan-50 text-cyan-700 border border-cyan-200 px-2 py-0.5 rounded-md">
                Vision AI
              </span>
            </div>

            <p className="text-xs text-slate-600 font-medium">
              Snap textbook pages or handwritten assignments to extract clean formatted NCERT text.
            </p>

            <div className="grid grid-cols-2 gap-2">
              <div className="p-3 bg-slate-900 text-white rounded-2xl space-y-1.5">
                <span className="text-[9px] font-bold uppercase text-cyan-400 block">1. Scanned Image</span>
                <img src="/showcase-ocr.png" alt="OCR Scan" className="w-full h-20 object-cover rounded-lg border border-white/20" />
              </div>

              <div className="p-3 bg-cyan-50 border border-cyan-200 rounded-2xl space-y-1 text-slate-800">
                <span className="text-[9px] font-extrabold uppercase text-cyan-800 block">2. Extracted Text</span>
                <p className="text-[10px] font-semibold leading-tight line-clamp-4">
                  NCERT Class 10 Ch 1: "A chemical equation is a symbolic representation of a reaction..."
                </p>
              </div>
            </div>

            <Link
              href="/login"
              className="w-full py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 uppercase tracking-wider active:scale-95 transition-transform"
            >
              <ScanText className="w-4 h-4" />
              <span>Scan Textbook (Sign In)</span>
            </Link>
          </div>
        )}

        {/* SIMULATOR CARD 3: 5E LESSON PLANNER */}
        {activeDemo === "planner" && (
          <div className="p-5 rounded-3xl bg-white border border-indigo-100 shadow-xl space-y-4 animate-in fade-in duration-300">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-purple-600" />
                <h3 className="text-sm font-extrabold text-slate-900">5E Framework Lesson Planner</h3>
              </div>
              <span className="text-[9px] font-extrabold uppercase tracking-wider bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded-md">
                Pedagogy
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] font-bold">
              <div className="p-2.5 rounded-xl bg-purple-50 border border-purple-200 text-purple-900">
                1. Engage (10m)
              </div>
              <div className="p-2.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-900">
                2. Explore (20m)
              </div>
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900">
                3. Explain (15m)
              </div>
              <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900">
                4. Elaborate (10m)
              </div>
            </div>

            <Link
              href="/login"
              className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 uppercase tracking-wider active:scale-95 transition-transform"
            >
              <BookOpen className="w-4 h-4" />
              <span>Create Lesson Plan (Sign In)</span>
            </Link>
          </div>
        )}

        {/* SIMULATOR CARD 4: SOCRATIC AI TUTOR */}
        {activeDemo === "tutor" && (
          <div className="p-5 rounded-3xl bg-white border border-indigo-100 shadow-xl space-y-4 animate-in fade-in duration-300">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-amber-600" />
                <h3 className="text-sm font-extrabold text-slate-900">Socratic AI Student Tutor</h3>
              </div>
              <span className="text-[9px] font-extrabold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-md">
                Guided Learning
              </span>
            </div>

            <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-2 text-xs text-slate-800">
              <div className="font-extrabold text-amber-900">Student Question:</div>
              <p className="font-semibold text-slate-700 text-[11px]">"How do I balance a chemical equation step-by-step?"</p>
              <div className="pt-2 border-t border-amber-200 text-[11px] font-bold text-amber-800 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>Socratic AI Hint: First count atoms of each element on react & product sides...</span>
              </div>
            </div>

            <Link
              href="/login"
              className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 uppercase tracking-wider active:scale-95 transition-transform"
            >
              <Brain className="w-4 h-4" />
              <span>Ask Socratic Tutor (Sign In)</span>
            </Link>
          </div>
        )}

      </div>

      {/* 5. 15 SPECIALIZED AI AGENTS SHOWCASE */}
      <div className="mt-12 px-5 space-y-4 relative z-10">
        
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 block">AI Agent Marketplace</span>
            <h2 className="text-lg font-black text-slate-900">15 Specialized AI Assistants</h2>
          </div>
          <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100">
            Role Filtered
          </span>
        </div>

        {/* ROLE FILTER PILLS */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: "all", label: "All Agents" },
            { id: "teacher", label: "For Teachers" },
            { id: "student", label: "For Students" },
            { id: "parent", label: "For Parents" }
          ].map(r => (
            <button
              key={r.id}
              onClick={() => setAgentRoleFilter(r.id as any)}
              className={`px-3.5 py-2 rounded-xl text-xs font-extrabold shrink-0 border transition-all ${
                agentRoleFilter === r.id
                  ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                  : "bg-white text-slate-600 border-slate-200"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>

        {/* AGENTS GRID */}
        <div className="grid grid-cols-1 gap-3">
          {filteredAgents.map((ag, idx) => {
            const Icon = ag.icon;
            return (
              <div 
                key={idx}
                className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-indigo-300 shadow-xs flex items-center justify-between gap-3 group transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-tr ${ag.color} text-white flex items-center justify-center shadow-md shrink-0`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-black text-slate-900">{ag.name}</h4>
                      <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                        {ag.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-semibold line-clamp-1 mt-0.5">
                      {ag.desc}
                    </p>
                  </div>
                </div>

                <Link
                  href="/login"
                  className="w-8 h-8 rounded-xl bg-indigo-50 hover:bg-indigo-600 text-indigo-600 hover:text-white flex items-center justify-center shrink-0 border border-indigo-200 transition-colors"
                >
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            );
          })}
        </div>

      </div>

      {/* 6. 360-DEGREE ECOSYSTEM SPOTLIGHT (THE 4 STAKEHOLDER CARDS) */}
      <div className="mt-12 px-5 space-y-4 relative z-10">
        
        <div className="text-center space-y-1">
          <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600">360° Educational Ecosystem</span>
          <h2 className="text-xl font-black text-slate-900">Tailored Solutions for Everyone</h2>
        </div>

        <div className="space-y-4">
          
          {/* CARD 1: FOR SCHOOLS */}
          <div className="p-5 rounded-3xl bg-white border border-indigo-100 shadow-md space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md">
                <Building2 className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-extrabold uppercase bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full border border-blue-200">
                Institutional Support
              </span>
            </div>
            <h3 className="text-base font-extrabold text-slate-900">For Schools</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              We facilitate seamless book supply, academic publishing, professional CBSE teacher training workshops, and reliable job placement support.
            </p>
            <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5 text-xs font-bold text-indigo-600">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Seamless Book Supply & Workshops</span>
            </div>
          </div>

          {/* CARD 2: FOR TEACHERS */}
          <div className="p-5 rounded-3xl bg-white border border-purple-100 shadow-md space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-600 text-white flex items-center justify-center shadow-md">
                <GraduationCap className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-extrabold uppercase bg-purple-50 text-purple-700 px-2.5 py-1 rounded-full border border-purple-200">
                Educator Growth
              </span>
            </div>
            <h3 className="text-base font-extrabold text-slate-900">For Teachers</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              We equip educators with cutting-edge digital tools like OCR worksheet and assignment generators, the Teachers Skill Olympiad, and modern pedagogy books to enhance classroom efficiency.
            </p>
            <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5 text-xs font-bold text-purple-600">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>OCR Worksheets & Skill Olympiads</span>
            </div>
          </div>

          {/* CARD 3: FOR PARENTS & STUDENTS */}
          <div className="p-5 rounded-3xl bg-white border border-emerald-100 shadow-md space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white flex items-center justify-center shadow-md">
                <Users className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-extrabold uppercase bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full border border-emerald-200">
                Holistic Learning
              </span>
            </div>
            <h3 className="text-base font-extrabold text-slate-900">For Parents & Students</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              We foster engaging learning through interactive homework and AI-powered query assistance, fun educational quizzes, and specialised parenting guides to ensure holistic child development.
            </p>
            <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5 text-xs font-bold text-emerald-600">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>AI Query Assistance & Parenting Guides</span>
            </div>
          </div>

          {/* CARD 4: QUALITY & SAFETY SYSTEM */}
          <div className="p-5 rounded-3xl bg-white border border-amber-100 shadow-md space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 text-white flex items-center justify-center shadow-md">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-extrabold uppercase bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full border border-amber-200">
                Quality & Safety
              </span>
            </div>
            <h3 className="text-base font-extrabold text-slate-900">Quality & Safety System</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              High-grade quality academic books, advanced encryption for student data security, carefully monitored child-friendly digital space, and reliable support transparency.
            </p>
            <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5 text-xs font-bold text-amber-700">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Strict Educational Standards & Privacy</span>
            </div>
          </div>

        </div>

      </div>

      {/* 7. GAMIFIED XP & INTERACTIVE QUIZ WIDGET DEMO */}
      <div className="mt-12 px-5 relative z-10">
        <div className="p-5 rounded-3xl bg-gradient-to-br from-indigo-900 via-slate-900 to-purple-950 text-white shadow-xl space-y-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-purple-500/20 blur-[70px] rounded-full pointer-events-none" />

          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-cyan-300 bg-white/10 px-2.5 py-1 rounded-full border border-white/20">
              Interactive Quiz Preview
            </span>
            <div className="flex items-center gap-1 text-xs font-extrabold text-amber-400">
              <Flame className="w-4 h-4 fill-amber-400" />
              <span>+50 XP Streak</span>
            </div>
          </div>

          <h3 className="text-sm font-black text-white leading-snug">
            Sample Question: Which organelle is responsible for photosynthesis in plant cells?
          </h3>

          <div className="grid grid-cols-2 gap-2 text-xs font-bold">
            {[
              { id: 0, text: "A. Chloroplast", correct: true },
              { id: 1, text: "B. Mitochondria", correct: false },
              { id: 2, text: "C. Ribosome", correct: false },
              { id: 3, text: "D. Nucleus", correct: false }
            ].map((opt) => {
              const isSelected = quizSelectedOpt === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => {
                    setQuizSelectedOpt(opt.id);
                    setQuizAnswered(true);
                  }}
                  className={`p-3 rounded-xl border text-left transition-all font-semibold text-[11px] ${
                    isSelected
                      ? opt.correct
                        ? "bg-emerald-500 text-white border-emerald-400 shadow-md font-bold"
                        : "bg-rose-500 text-white border-rose-400 shadow-md"
                      : "bg-white/10 border-white/15 text-slate-200 hover:bg-white/20"
                  }`}
                >
                  {opt.text}
                </button>
              );
            })}
          </div>

          {quizAnswered && (
            <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-bold flex items-center justify-between animate-in fade-in">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Correct Answer! +50 XP Streak Earned</span>
              </div>
              <button 
                onClick={() => { setQuizAnswered(false); setQuizSelectedOpt(null); }}
                className="text-[10px] text-cyan-300 underline"
              >
                Reset
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 8. FREQUENTLY ASKED QUESTIONS (ACCORDION) */}
      <div className="mt-12 px-5 space-y-4 relative z-10">
        
        <div className="text-center space-y-1">
          <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600">Got Questions?</span>
          <h2 className="text-xl font-black text-slate-900">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div 
                key={idx}
                className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-4 text-left font-extrabold text-xs text-slate-900 flex items-center justify-between gap-3"
                >
                  <span>{faq.q}</span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-indigo-600 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                </button>

                {isOpen && (
                  <div className="px-4 pb-4 text-xs text-slate-600 font-medium leading-relaxed border-t border-slate-100 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>

      {/* 9. BOTTOM FOOTER & CALL-TO-ACTION BANNER */}
      <div className="mt-12 px-5 space-y-6 relative z-10">
        
        <div className="p-6 rounded-3xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white text-center space-y-4 shadow-xl">
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md mx-auto flex items-center justify-center text-amber-300">
            <Sparkles className="w-6 h-6" />
          </div>

          <h3 className="text-xl font-black">
            Ready to Modernize Your Schooling Experience?
          </h3>

          <p className="text-xs text-slate-100 font-medium leading-relaxed max-w-xs mx-auto">
            Devgya Global Edutech Private Limited is your trusted partner in shaping a smarter, brighter future.
          </p>

          <Link
            href="/login"
            className="w-full py-3.5 bg-white text-indigo-900 font-black text-xs rounded-2xl shadow-md uppercase tracking-wider flex items-center justify-center gap-2 active:scale-95 transition-transform"
          >
            <span>Sign In to Platform</span>
            <ArrowRight className="w-4 h-4 text-indigo-600" />
          </Link>
        </div>

        {/* QUICK FOOTER LINKS */}
        <div className="text-center space-y-3 pt-4 border-t border-slate-200">
          <p className="text-xs font-extrabold text-slate-700">
            &copy; 2026 Devgya Global Edutech Private Limited
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-xs font-bold text-slate-600">
            <Link href="/about" className="hover:text-indigo-600">About Us</Link>
            <Link href="/why-choose-us" className="hover:text-indigo-600">Why Choose Us</Link>
            <Link href="/safety-standards" className="hover:text-indigo-600">Quality & Safety</Link>
            <Link href="/privacy-policy" className="hover:text-indigo-600">Privacy Policy</Link>
          </div>
        </div>

      </div>

      {/* 10. FLOATING MOBILE QUICK DOCK FOR EASY NAVIGATION */}
      <div className="fixed bottom-3 left-1/2 -translate-x-1/2 w-[92%] max-w-md bg-slate-900/95 backdrop-blur-md text-white border border-white/20 rounded-2xl p-2 shadow-2xl z-50 flex items-center justify-around">
        <Link
          href="/"
          className="flex flex-col items-center gap-0.5 text-cyan-400 font-extrabold text-[10px]"
        >
          <Building2 className="w-4 h-4" />
          <span>Home</span>
        </Link>

        <Link
          href="/about"
          className="flex flex-col items-center gap-0.5 text-slate-300 hover:text-white font-extrabold text-[10px]"
        >
          <BookOpen className="w-4 h-4" />
          <span>About</span>
        </Link>

        <Link
          href="/why-choose-us"
          className="flex flex-col items-center gap-0.5 text-slate-300 hover:text-white font-extrabold text-[10px]"
        >
          <Award className="w-4 h-4" />
          <span>Why Us</span>
        </Link>

        <Link
          href="/login"
          className="px-3 py-1.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-black text-[11px] rounded-xl flex items-center gap-1 shadow-md"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>Sign In</span>
        </Link>
      </div>

    </div>
  );
}

