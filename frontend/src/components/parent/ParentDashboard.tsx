"use client";

import Link from "next/link";
import { 
  HeartHandshake, 
  Sparkles, 
  Video, 
  MessageSquare, 
  Search, 
  Clock, 
  ShieldCheck, 
  ArrowRight,
  BookOpen,
  Brain,
  Smartphone,
  Smile,
  Target
} from "lucide-react";
import { useAppStore } from "@/store/useAppStore";

export function ParentDashboard() {
  const { user } = useAppStore();

  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-in fade-in duration-500">
      
      {/* HERO WELCOME HEADER */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 rounded-3xl border border-indigo-800/40 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-indigo-200 text-xs font-bold border border-white/10">
            <HeartHandshake className="w-3.5 h-3.5 text-rose-400" />
            <span>AI Parenting & Home Study Guide Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold">
            Welcome, <span className="text-amber-300">{user.name}</span> 👋
          </h1>
          <p className="text-xs sm:text-sm text-indigo-200 max-w-2xl">
            Get expert AI guidance on parenting strategies, home study routines, screen-time management, and direct mentor consultation.
          </p>
        </div>

        <Link
          href="/dashboard/agents?agent=parent_coach"
          className="inline-flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-rose-500 to-indigo-600 hover:from-rose-600 hover:to-indigo-700 text-white font-extrabold text-xs rounded-2xl shadow-lg hover:shadow-xl transition-all shrink-0 active:scale-95"
        >
          <Brain className="w-4 h-4 text-amber-200" />
          <span>Ask AI Parenting Coach</span>
        </Link>
      </div>

      {/* PARENT AI TOOLS & CONSULTATION TILES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* PARENTING COACH */}
        <Link 
          href="/dashboard/agents?agent=parent_coach" 
          className="p-6 bg-gradient-to-br from-rose-500 to-indigo-600 text-white rounded-3xl shadow-lg hover:shadow-xl transition-all flex flex-col justify-between group h-48"
        >
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/20">
              <HeartHandshake className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-base font-extrabold">AI Parenting Coach</h3>
            <p className="text-xs text-rose-100 leading-relaxed font-medium">
              Evidence-based strategies for study motivation, screen time & exam anxiety.
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-200 group-hover:translate-x-1 transition-transform">
            <span>Launch Assistant</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </Link>

        {/* LIVE VIDEO CONSULTATION */}
        <Link 
          href="/dashboard/video-consultation" 
          className="p-6 bg-white border border-slate-200 rounded-3xl shadow-sm hover:border-indigo-300 transition-all flex flex-col justify-between group h-48"
        >
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 border border-purple-200 flex items-center justify-center">
              <Video className="w-5 h-5" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900">Video Consultation</h3>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              Schedule 1-on-1 video calls with academic mentors & teachers.
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-purple-600 group-hover:translate-x-1 transition-transform">
            <span>Book Live Call</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </Link>

        {/* ENGLISH & COMMUNICATION COACH */}
        <Link 
          href="/dashboard/agents?agent=english_coach" 
          className="p-6 bg-white border border-slate-200 rounded-3xl shadow-sm hover:border-indigo-300 transition-all flex flex-col justify-between group h-48"
        >
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-200 flex items-center justify-center">
              <MessageSquare className="w-5 h-5" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900">English Coach</h3>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              Improve conversational fluency, vocabulary & public speaking tips.
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 group-hover:translate-x-1 transition-transform">
            <span>Practice English</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </Link>

        {/* ACADEMIC RESEARCH ASSISTANT */}
        <Link 
          href="/dashboard/agents?agent=research_assistant" 
          className="p-6 bg-white border border-slate-200 rounded-3xl shadow-sm hover:border-indigo-300 transition-all flex flex-col justify-between group h-48"
        >
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-cyan-50 text-cyan-600 border border-cyan-200 flex items-center justify-center">
              <Search className="w-5 h-5" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900">Research Assistant</h3>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              Investigate school streams, entrance exams & degree pathways.
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-600 group-hover:translate-x-1 transition-transform">
            <span>Explore Research</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </Link>

      </div>

      {/* PARENTING GUIDANCE & HOME STUDY STRATEGIES */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-600" /> Essential Parenting & Home Study Guide
            </h2>
            <p className="text-xs text-slate-500">Expert-backed actionable advice for supporting your child at home</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* SCREEN TIME MANAGEMENT */}
          <Link 
            href={`/dashboard/agents?agent=parent_coach&prompt=${encodeURIComponent("How do I set healthy screen time limits and manage mobile phone distractions for my child without causing arguments?")}`}
            className="p-5 bg-gradient-to-br from-indigo-50/70 to-purple-50/70 hover:from-indigo-100 hover:to-purple-100 rounded-2xl border border-indigo-100 space-y-3 transition-all group block"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md">
                <Smartphone className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-extrabold text-slate-900">Managing Screen Time & Mobile Distractions</h3>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed font-medium">
              Establish a "No Phones During Homework" agreement. Encourage using phone chargers outside bedrooms at night to improve sleep and focus.
            </p>
            <div className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 group-hover:underline">
              <span>Ask AI Coach for Custom Screen Schedule</span> →
            </div>
          </Link>

          {/* OVERCOMING EXAM STRESS */}
          <Link 
            href={`/dashboard/agents?agent=parent_coach&prompt=${encodeURIComponent("What are proven parenting strategies to help my child overcome exam pressure, stress, and build test confidence?")}`}
            className="p-5 bg-gradient-to-br from-rose-50/70 to-amber-50/70 hover:from-rose-100 hover:to-amber-100 rounded-2xl border border-rose-100 space-y-3 transition-all group block"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-rose-600 text-white flex items-center justify-center shadow-md">
                <Smile className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-extrabold text-slate-900">Overcoming Exam Anxiety & Pressure</h3>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed font-medium">
              Praise daily study effort rather than focusing solely on final marks. Ensure healthy meals and 8 hours of consistent sleep during exam weeks.
            </p>
            <div className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 group-hover:underline">
              <span>Get Anti-Anxiety Parent Tips</span> →
            </div>
          </Link>

          {/* BALANCED HOME ROUTINE */}
          <Link 
            href={`/dashboard/agents?agent=parent_coach&prompt=${encodeURIComponent("Design a balanced 2-hour evening home study schedule with focus blocks and relaxation breaks for my child.")}`}
            className="p-5 bg-gradient-to-br from-emerald-50/70 to-teal-50/70 hover:from-emerald-100 hover:to-teal-100 rounded-2xl border border-emerald-100 space-y-3 transition-all group block"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-extrabold text-slate-900">Ideal 2-Hour Evening Home Study Routine</h3>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed font-medium">
              Divide evening study into 45-minute focus blocks with 10-minute relaxation breaks. End sessions with a 15-minute key formula review.
            </p>
            <div className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 group-hover:underline">
              <span>Create Custom Evening Schedule</span> →
            </div>
          </Link>

          {/* POSITIVE MOTIVATION */}
          <Link 
            href={`/dashboard/agents?agent=parent_coach&prompt=${encodeURIComponent("Provide 5 positive parenting techniques and growth mindset affirmations to encourage my child at home.")}`}
            className="p-5 bg-gradient-to-br from-amber-50/70 to-yellow-50/70 hover:from-amber-100 hover:to-yellow-100 rounded-2xl border border-amber-100 space-y-3 transition-all group block"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-600 text-white flex items-center justify-center shadow-md">
                <Target className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-extrabold text-slate-900">Building a Growth Mindset at Home</h3>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed font-medium">
              Reframe mistakes as learning opportunities. Encourage curiosity by discussing real-world applications of Science and History topics.
            </p>
            <div className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 group-hover:underline">
              <span>Explore Growth Mindset Affirmations</span> →
            </div>
          </Link>

        </div>
      </div>

    </div>
  );
}
