"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Sparkles, ArrowRight, Menu, X, Bot, ShieldCheck, Zap } from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "About Us", href: "/about" },
    { label: "Why Choose Us", href: "/why-choose-us" },
    { label: "Features", href: "/features" },
    { label: "AI Platform", href: "/ai-platform" },
    { label: "FAQ", href: "/faq" },
  ];

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled 
        ? "bg-white/95 backdrop-blur-xl border-b border-indigo-100 shadow-md py-2.5" 
        : "bg-white/85 backdrop-blur-md border-b border-slate-200/80 py-3.5"
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* ELEGANT BRAND LOGO */}
          <Link href="/" className="flex items-center gap-3 group">
            <img 
              src="/logo.png" 
              alt="DEVGYA GLOBAL EDUTECH" 
              className="h-12 sm:h-16 w-auto max-h-16 object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-300" 
            />
            <div className="hidden sm:flex flex-col border-l border-slate-200 pl-3">
              <span className="font-extrabold text-[11px] text-slate-900 tracking-wide font-[family-name:var(--font-outfit)] uppercase">
                DEVGYA GLOBAL
              </span>
              <span className="text-[10px] font-semibold text-indigo-600 tracking-normal font-[family-name:var(--font-jakarta)]">
                AI School OS • K-12
              </span>
            </div>
          </Link>

          {/* DESKTOP NAVIGATION LINKS WITH ELEGANT OUTFIT & JAKARTA TYPOGRAPHY */}
          <div className="hidden lg:flex items-center gap-1 bg-slate-100/70 p-1.5 rounded-2xl border border-slate-200/80 backdrop-blur-md shadow-inner">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative px-4 py-2 rounded-xl font-bold text-xs sm:text-[13px] tracking-tight font-[family-name:var(--font-jakarta)] transition-all duration-200 flex items-center gap-1.5 ${
                    isActive
                      ? "bg-white text-indigo-600 shadow-xs border border-indigo-100 font-extrabold"
                      : "text-slate-600 hover:text-slate-900 hover:bg-white/60 font-semibold"
                  }`}
                >
                  <span>{link.label}</span>
                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* RIGHT ACTION: SHIMMER GLOW LOG IN BUTTON */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/login"
              className="relative inline-flex items-center justify-center p-0.5 overflow-hidden rounded-2xl group bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-md hover:shadow-xl hover:shadow-indigo-600/25 transition-all active:scale-95"
            >
              <span className="relative px-6 py-2.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 group-hover:from-indigo-700 group-hover:to-pink-700 text-white rounded-[14px] flex items-center gap-2 font-extrabold text-xs tracking-wider uppercase font-[family-name:var(--font-outfit)]">
                <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                <span>Log In</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
          </div>

          {/* MOBILE MENU TOGGLE BUTTON */}
          <div className="lg:hidden flex items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* MOBILE MENU DROPDOWN DRAWER */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-indigo-100 bg-white/98 backdrop-blur-xl px-6 pt-4 pb-6 space-y-3 shadow-2xl animate-in slide-in-from-top duration-300">
          <div className="space-y-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold font-[family-name:var(--font-jakarta)] transition-all ${
                    isActive
                      ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <span>{link.label}</span>
                  {isActive && <span className="text-[10px] font-black text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded-full">ACTIVE</span>}
                </Link>
              );
            })}
          </div>

          <div className="pt-3 border-t border-slate-200 space-y-2">
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full py-3.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white font-extrabold text-xs rounded-2xl text-center shadow-lg flex items-center justify-center gap-2 uppercase tracking-wider font-[family-name:var(--font-outfit)] active:scale-95"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Log In to School Platform</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
