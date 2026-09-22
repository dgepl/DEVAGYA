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
  Heart
} from "lucide-react";
import { YouTubeLogo, InstagramLogo, YOUTUBE_URL, INSTAGRAM_URL } from "@/components/common/SocialButtons";

export function Footer() {
  return (
    <footer className="bg-[#09071B] text-slate-300 border-t border-purple-900/30 pt-16 pb-12 relative overflow-hidden selection:bg-indigo-500 selection:text-white">
      
      {/* BACKGROUND AMBIENT GLOWS */}
      <div className="absolute top-0 left-1/3 w-96 h-96 bg-purple-600/10 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-12">
        
        {/* MAIN 3-COLUMN FOOTER GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          
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

            {/* OFFICIAL CHANNELS: YOUTUBE & INSTAGRAM */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <a
                href={YOUTUBE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-red-500/20 border border-white/10 hover:border-red-500/40 text-slate-300 hover:text-white text-xs font-bold transition-all group"
                title="Watch DEVGYA on YouTube"
              >
                <YouTubeLogo className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span>YouTube</span>
              </a>
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-pink-500/20 border border-white/10 hover:border-pink-500/40 text-slate-300 hover:text-white text-xs font-bold transition-all group"
                title="Follow DEVGYA on Instagram"
              >
                <InstagramLogo className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span>Instagram</span>
              </a>
            </div>
          </div>

          {/* COLUMN 1: NAVIGATION & COMPANY */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-white uppercase tracking-widest border-b border-white/10 pb-2">
              Company &amp; Support
            </h4>
            <ul className="space-y-2 text-xs font-semibold text-slate-400">
              <li><Link href="/" className="hover:text-cyan-300 transition-colors">Home Page</Link></li>
              <li><Link href="/about" className="hover:text-cyan-300 transition-colors">About Us</Link></li>
              <li><Link href="/why-choose-us" className="hover:text-cyan-300 transition-colors">Why Choose Us</Link></li>
              <li><Link href="/faq" className="hover:text-cyan-300 transition-colors">FAQ &amp; Support</Link></li>
              <li><Link href="/contact" className="hover:text-cyan-300 transition-colors">Contact &amp; Location</Link></li>
              <li>
                <Link 
                  href="/business" 
                  className="inline-flex items-center gap-1.5 text-amber-400 hover:text-amber-300 font-bold transition-colors"
                >
                  <span>DEVGYA for Business</span>
                  <span className="px-1.5 py-0.2 text-[8px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded uppercase">
                    Institutional
                  </span>
                </Link>
              </li>
            </ul>
          </div>

          {/* COLUMN 2: CORE AI STUDIOS */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-white uppercase tracking-widest border-b border-white/10 pb-2">
              Core AI Studios
            </h4>
            <ul className="space-y-2 text-xs font-semibold text-slate-400">
              <li><Link href="/login" className="hover:text-purple-300 transition-colors">AI Question Generator</Link></li>
              <li><Link href="/login" className="hover:text-purple-300 transition-colors">AI Assignment & Worksheet Maker</Link></li>
              <li><Link href="/login" className="hover:text-purple-300 transition-colors">OCR Book Scanner</Link></li>
              <li><Link href="/login" className="hover:text-purple-300 transition-colors">Socratic Student Tutor</Link></li>
              <li><Link href="/login" className="hover:text-purple-300 transition-colors">Parenting Guidance Coach</Link></li>
              <li><Link href="/login" className="hover:text-purple-300 transition-colors">Video Consultation Studio</Link></li>
            </ul>
          </div>

        </div>

        {/* DEDICATED LEGAL & ACCREDITATION STANDARDS BAR */}
        <div className="border-t border-white/10 pt-6 space-y-4">
          
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-bold text-slate-300">
            <Link 
              href="/privacy-policy" 
              className="hover:text-cyan-300 transition-colors whitespace-nowrap py-1 border-b border-transparent hover:border-cyan-400"
            >
              Privacy Policy
            </Link>
            <span className="text-white/20 hidden sm:inline font-mono">•</span>
            <Link 
              href="/terms-of-service" 
              className="hover:text-cyan-300 transition-colors whitespace-nowrap py-1 border-b border-transparent hover:border-cyan-400"
            >
              Terms of Service
            </Link>
            <span className="text-white/20 hidden sm:inline font-mono">•</span>
            <Link 
              href="/safety-standards" 
              className="hover:text-cyan-300 transition-colors whitespace-nowrap py-1 border-b border-transparent hover:border-cyan-400"
            >
              Quality &amp; Safety Standards
            </Link>
            <span className="text-white/20 hidden sm:inline font-mono">•</span>
            <Link 
              href="/contact" 
              className="hover:text-cyan-300 transition-colors whitespace-nowrap py-1 border-b border-transparent hover:border-cyan-400"
            >
              Contact &amp; Location
            </Link>
          </div>

          {/* BOTTOM COPYRIGHT BAR */}
          <div className="pt-4 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="text-center sm:text-left w-full">
              <p className="text-xs text-slate-400 font-medium text-center">
                &copy; 2026 DEVGYA GLOBAL EDUTECH PRIVATE LIMITED. All rights reserved.
              </p>
            </div>
          </div>

        </div>

      </div>
    </footer>
  );
}
