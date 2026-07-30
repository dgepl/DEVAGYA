"use client";

import Link from "next/link";
import { useState } from "react";
import { Sparkles, ArrowRight, Menu, X } from "lucide-react";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-slate-200 bg-white shadow-xs transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-24">
          
          {/* BRAND LOGO - BIGGER & SHIFTED RIGHT */}
          <Link href="/" className="flex items-center group pl-8 sm:pl-16">
            <img 
              src="/logo.png" 
              alt="DEVAGYA GLOBAL PRIVATE LIMITED" 
              className="h-16 sm:h-20 w-auto max-h-20 object-contain mix-blend-multiply group-hover:scale-105 transition-transform" 
            />
          </Link>

          {/* DESKTOP NAVIGATION LINKS */}
          <div className="hidden lg:flex items-center gap-6 text-xs font-extrabold text-slate-700 uppercase tracking-wider">
            <Link href="/" className="hover:text-indigo-600 transition-colors">Home</Link>
            <Link href="/about" className="hover:text-indigo-600 transition-colors">About Us</Link>
            <Link href="/why-choose-us" className="hover:text-indigo-600 transition-colors">Why Choose Us</Link>
            <Link href="/features" className="hover:text-indigo-600 transition-colors">Features</Link>
            <Link href="/ai-platform" className="hover:text-indigo-600 transition-colors">AI Platform</Link>
            <Link href="/pricing" className="hover:text-indigo-600 transition-colors">Pricing</Link>
            <Link href="/faq" className="hover:text-indigo-600 transition-colors">FAQ</Link>
          </div>

          {/* RIGHT ACTION: SINGLE STYLED LOG IN BUTTON */}
          <div className="hidden md:flex items-center">
            <Link
              href="/login"
              className="relative inline-flex items-center justify-center p-0.5 overflow-hidden text-xs font-black rounded-2xl group bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 text-white shadow-md hover:shadow-lg transition-all active:scale-95"
            >
              <span className="relative px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-[14px] flex items-center gap-2 font-extrabold text-xs tracking-wider uppercase">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Log In</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
          </div>

          {/* MOBILE MENU BUTTON */}
          <div className="lg:hidden flex items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-700 hover:text-slate-900 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* MOBILE MENU DROPDOWN */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-slate-200 bg-white/98 px-6 pt-4 pb-6 space-y-3 shadow-xl">
          <Link href="/" onClick={() => setMobileMenuOpen(false)} className="block text-slate-800 hover:text-indigo-600 py-1.5 font-bold text-xs uppercase tracking-wider">Home</Link>
          <Link href="/about" onClick={() => setMobileMenuOpen(false)} className="block text-slate-800 hover:text-indigo-600 py-1.5 font-bold text-xs uppercase tracking-wider">About Us</Link>
          <Link href="/why-choose-us" onClick={() => setMobileMenuOpen(false)} className="block text-slate-800 hover:text-indigo-600 py-1.5 font-bold text-xs uppercase tracking-wider">Why Choose Us</Link>
          <Link href="/features" onClick={() => setMobileMenuOpen(false)} className="block text-slate-800 hover:text-indigo-600 py-1.5 font-bold text-xs uppercase tracking-wider">Features</Link>
          <Link href="/ai-platform" onClick={() => setMobileMenuOpen(false)} className="block text-slate-800 hover:text-indigo-600 py-1.5 font-bold text-xs uppercase tracking-wider">AI Platform Demo</Link>
          <Link href="/pricing" onClick={() => setMobileMenuOpen(false)} className="block text-slate-800 hover:text-indigo-600 py-1.5 font-bold text-xs uppercase tracking-wider">Pricing</Link>
          <Link href="/faq" onClick={() => setMobileMenuOpen(false)} className="block text-slate-800 hover:text-indigo-600 py-1.5 font-bold text-xs uppercase tracking-wider">FAQ</Link>
          
          <div className="pt-3 border-t border-slate-200">
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-extrabold text-xs rounded-2xl text-center shadow-md flex items-center justify-center gap-2 uppercase tracking-wider"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Log In to School Platform</span>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
