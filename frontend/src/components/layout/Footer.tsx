"use client";

import Link from "next/link";
import { 
  ShieldCheck, 
  Sparkles, 
  Bot, 
  BookOpen, 
  ScanText, 
  ArrowRight, 
  CheckCircle2, 
  Heart, 
  Code2 
} from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-[#09071B] text-slate-300 border-t border-purple-900/30 pt-16 pb-12 relative overflow-hidden selection:bg-indigo-500 selection:text-white">
      
      {/* BACKGROUND AMBIENT GLOWS */}
      <div className="absolute top-0 left-1/3 w-96 h-96 bg-purple-600/10 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-12">
        
        {/* MAIN 4-COLUMN FOOTER GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          
          {/* BRAND COLUMN */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="inline-block">
              <img 
                src="/logo.png" 
                alt="DEVGYA GLOBAL EDUTECH PRIVATE LIMITED" 
                className="h-14 sm:h-16 w-auto max-h-16 object-contain mix-blend-lighten" 
              />
            </Link>
            <p className="text-xs text-slate-400 max-w-sm leading-relaxed font-medium">
              DEVGYA GLOBAL EDUTECH PRIVATE LIMITED is an AI-powered K-12 education platform built for CBSE & NCERT schools. Combining physical school solutions, lab infrastructure, and cutting-edge digital AI tools.
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <div className="flex items-center gap-2 text-[11px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-full font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>Devgya AI Operating System Active</span>
              </div>
            </div>
          </div>

          {/* COLUMN 1: NAVIGATION & COMPANY */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-white uppercase tracking-widest border-b border-white/10 pb-2">
              Company Navigation
            </h4>
            <ul className="space-y-2 text-xs font-semibold text-slate-400">
              <li><Link href="/" className="hover:text-cyan-300 transition-colors">Home Page</Link></li>
              <li><Link href="/about" className="hover:text-cyan-300 transition-colors">About Us</Link></li>
              <li><Link href="/why-choose-us" className="hover:text-cyan-300 transition-colors">Why Choose Us</Link></li>
              <li><Link href="/faq" className="hover:text-cyan-300 transition-colors">FAQ & Support</Link></li>
            </ul>
          </div>

          {/* COLUMN 2: AI TOOLS & PORTALS */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-white uppercase tracking-widest border-b border-white/10 pb-2">
              Core AI Studios
            </h4>
            <ul className="space-y-2 text-xs font-semibold text-slate-400">
              <li><Link href="/login" className="hover:text-purple-300 transition-colors">AI Question Generator</Link></li>
              <li><Link href="/login" className="hover:text-purple-300 transition-colors">5E Lesson Planner</Link></li>
              <li><Link href="/login" className="hover:text-purple-300 transition-colors">OCR Book Scanner</Link></li>
              <li><Link href="/login" className="hover:text-purple-300 transition-colors">15 Specialized AI Agents</Link></li>
              <li><Link href="/login" className="hover:text-purple-300 transition-colors">Socratic Student Tutor</Link></li>
              <li><Link href="/login" className="hover:text-purple-300 transition-colors">Parenting Guidance Coach</Link></li>
              <li><Link href="/login" className="hover:text-purple-300 transition-colors">Video Consultation Studio</Link></li>
            </ul>
          </div>

          {/* COLUMN 3: PORTALS & SECURITY */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-white uppercase tracking-widest border-b border-white/10 pb-2">
              Access & Security
            </h4>
            <ul className="space-y-2 text-xs font-semibold text-slate-400">
              <li><Link href="/login" className="hover:text-pink-300 transition-colors">Teacher Sign In Portal</Link></li>
              <li><Link href="/login" className="hover:text-pink-300 transition-colors">Student Self-Study Corner</Link></li>
              <li><Link href="/login" className="hover:text-pink-300 transition-colors">Parent Growth Dashboard</Link></li>
              <li><Link href="/register" className="hover:text-pink-300 transition-colors">Create Educator Account</Link></li>
              <li><Link href="/forgot-password" className="hover:text-pink-300 transition-colors">Forgot Password Reset</Link></li>
              <li><Link href="/safety-standards" className="hover:text-pink-300 transition-colors">Bank-Grade Data Privacy</Link></li>
            </ul>
          </div>

        </div>

        {/* BOTTOM COPYRIGHT & DEVELOPER CREDITS BAR */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
          
          <div className="space-y-1 text-center md:text-left">
            <p className="text-slate-400 font-medium">
              &copy; 2026 DEVGYA GLOBAL EDUTECH PRIVATE LIMITED. All rights reserved.
            </p>
            <p className="text-[12px] font-bold text-slate-300 flex items-center justify-center md:justify-start gap-1.5">
              <Code2 className="w-3.5 h-3.5 text-cyan-400 inline" />
              <span>Designed and developed by <strong className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-indigo-300 to-pink-300">PY team</strong></span>
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-5 text-xs font-bold text-slate-400">
            <Link href="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms-of-service" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link href="/safety-standards" className="hover:text-white transition-colors">Quality & Safety Standards</Link>
          </div>

        </div>

      </div>
    </footer>
  );
}
