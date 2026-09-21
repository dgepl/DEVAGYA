"use client";

import React from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PageTransition } from "@/components/ui/PageTransition";
import { 
  Building2, 
  GraduationCap, 
  BookOpen, 
  Users, 
  MapPin, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  Phone,
  Mail,
  Home,
  Info,
  CheckCircle,
  HelpCircle,
  Truck,
  Cpu,
  HeartHandshake,
  ExternalLink
} from "lucide-react";
import { YouTubeLogo, InstagramLogo, YOUTUBE_URL, INSTAGRAM_URL } from "@/components/common/SocialButtons";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#FAF8F5] text-slate-800 flex flex-col selection:bg-teal-600 selection:text-white">
      <Navbar />

      {/* GENEROUS TOP SPACING BELOW THE FIXED NAVBAR */}
      <PageTransition className="flex-1 pt-24 sm:pt-28 lg:pt-32">
        
        {/* ========================================================================= */}
        {/* TOP NAVIGATION BREADCRUMB / PILL BAR                                    */}
        {/* ========================================================================= */}
        <div className="bg-[#0B1528] text-white border-b border-indigo-950/60 shadow-inner">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-bold font-[family-name:var(--font-jakarta)]">
            
            {/* HORIZONTALLY SCROLLABLE NAVIGATION PILLS (SWIPEABLE ON MOBILE) */}
            <div className="overflow-x-auto no-scrollbar flex items-center gap-2 py-0.5 -mx-4 px-4 sm:mx-0 sm:px-0">
              <Link 
                href="/" 
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white transition-all border border-white/10 shrink-0 text-xs active:scale-95"
              >
                <Home className="w-3.5 h-3.5 text-cyan-300 shrink-0" />
                <span>Home</span>
              </Link>
              
              <span className="text-white/30 shrink-0">•</span>

              <span className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-teal-600 text-white font-black shadow-md shadow-teal-600/30 border border-teal-400/40 shrink-0 text-xs">
                <Info className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                <span>About Us</span>
              </span>
              
              <span className="text-white/30 shrink-0">•</span>

              <Link 
                href="/why-choose-us" 
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white transition-all border border-white/10 shrink-0 text-xs active:scale-95"
              >
                <CheckCircle className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
                <span>Why Choose Us</span>
              </Link>
              
              <span className="text-white/30 shrink-0">•</span>

              <Link 
                href="/faq" 
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white transition-all border border-white/10 shrink-0 text-xs active:scale-95"
              >
                <HelpCircle className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                <span>FAQ</span>
              </Link>
              
              <span className="text-white/30 shrink-0">•</span>

              <Link 
                href="/contact" 
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white transition-all border border-white/10 shrink-0 text-xs active:scale-95"
              >
                <Mail className="w-3.5 h-3.5 text-pink-300 shrink-0" />
                <span>Contact</span>
              </Link>
            </div>

            {/* QUICK JUMP ANCHORS */}
            <div className="hidden lg:flex items-center gap-2 text-[11px] font-semibold text-slate-300 shrink-0">
              <span className="text-slate-400">Quick Jump:</span>
              <a href="#about-overview" className="hover:text-teal-300 transition-colors">Overview</a>
              <span>·</span>
              <a href="#publications" className="hover:text-teal-300 transition-colors">Publications</a>
              <span>·</span>
              <a href="#distribution" className="hover:text-teal-300 transition-colors">Distribution</a>
              <span>·</span>
              <a href="#ai-portal" className="hover:text-teal-300 transition-colors">AI Portal</a>
              <span>·</span>
              <a href="#contact-reach" className="hover:text-teal-300 transition-colors">Contact</a>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* HERO SECTION: CLIENT SLIDE 1 (DEVGYA GLOBAL EDUTECH PVT. LTD.)           */}
        {/* ========================================================================= */}
        <section className="relative overflow-hidden bg-gradient-to-b from-[#0B1528] via-[#0E1E38] to-[#12284C] text-white py-10 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 border-b border-indigo-900/30">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-teal-500/10 blur-[130px] rounded-full pointer-events-none" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/15 blur-[120px] rounded-full pointer-events-none" />

          <div className="max-w-7xl mx-auto relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              
              {/* LEFT COLUMN: BRANDING & HEADLINE */}
              <div className="lg:col-span-6 space-y-5 sm:space-y-6 text-center lg:text-left">
                
                {/* LOGO & EMBLEM HEADER */}
                <div className="inline-flex flex-col items-center lg:items-start space-y-2.5">
                  <div className="flex items-center gap-3">
                    <img 
                      src="/logo.png" 
                      alt="DEVGYA Logo" 
                      className="h-14 sm:h-20 w-auto object-contain drop-shadow-[0_4px_16px_rgba(20,184,166,0.35)]" 
                    />
                  </div>
                  <div>
                    <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight font-[family-name:var(--font-outfit)] text-white uppercase">
                      DEVGYA GLOBAL
                    </h1>
                    <p className="text-amber-400 font-extrabold text-xs sm:text-sm tracking-widest uppercase mt-1">
                      EDUTECH PRIVATE LIMITED
                    </p>
                  </div>
                </div>

                {/* SIGNATURE MOTTO */}
                <div className="pt-1">
                  <p className="text-xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-slate-100 font-[family-name:var(--font-outfit)] leading-snug">
                    Ideas that move <br className="hidden sm:inline" />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 via-cyan-200 to-amber-200">
                      education forward.
                    </span>
                  </p>
                </div>

                {/* 3 CORE PILLARS BREADCRUMB */}
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 pt-1 text-xs font-semibold">
                  <span className="px-3 py-1.5 rounded-full bg-white/10 border border-white/15 text-slate-200 backdrop-blur-md">
                    Publications
                  </span>
                  <span className="text-white/40">/</span>
                  <span className="px-3 py-1.5 rounded-full bg-white/10 border border-white/15 text-slate-200 backdrop-blur-md">
                    Distribution
                  </span>
                  <span className="text-white/40">/</span>
                  <span className="px-3 py-1.5 rounded-full bg-teal-500/20 border border-teal-400/40 text-teal-300 font-bold backdrop-blur-md">
                    AI Education Portal
                  </span>
                </div>

                {/* CTA BUTTONS */}
                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2 sm:pt-4">
                  <a 
                    href="#about-overview" 
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-sm shadow-lg shadow-teal-600/30 transition-all active:scale-95"
                  >
                    <span>Discover What We Do</span>
                    <ArrowRight className="w-4 h-4" />
                  </a>
                  <Link 
                    href="/contact" 
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-white/10 hover:bg-white/15 text-slate-200 hover:text-white border border-white/20 font-bold text-sm backdrop-blur-md transition-all active:scale-95"
                  >
                    <Mail className="w-4 h-4 text-pink-300" />
                    <span>Get in Touch</span>
                  </Link>
                </div>

              </div>

              {/* RIGHT COLUMN: HERO IMAGE SHOWCASE (TOP-TIER HIGH-DEF VISUAL) */}
              <div className="lg:col-span-6 relative">
                <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden border border-white/20 shadow-2xl bg-slate-900 group">
                  <div className="aspect-[16/10] sm:aspect-[16/10] lg:aspect-[4/3] xl:aspect-[16/10] w-full overflow-hidden">
                    <img 
                      src="/images/about/hero_about.jpg" 
                      alt="DEVGYA Educators and Students in STEM Environment" 
                      className="w-full h-full object-cover object-[center_15%] group-hover:scale-103 transition-transform duration-700" 
                    />
                  </div>
                  {/* SUBTLE INNER GRADIENT */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent pointer-events-none" />
                  
                  {/* FLOATING BADGE OVERLAY */}
                  <div className="absolute bottom-3 left-3 right-3 sm:bottom-5 sm:left-5 sm:right-5 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-900/85 backdrop-blur-md border border-white/15 text-white flex items-center justify-between">
                    <div className="flex items-center gap-2.5 sm:gap-3">
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center border border-teal-400/30 shrink-0">
                        <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm font-bold text-white leading-tight">Empowering Education Ecosystem</p>
                        <p className="text-[10px] sm:text-[11px] text-slate-300 mt-0.5">Classrooms, Homes &amp; Smart Digital Technology</p>
                      </div>
                    </div>
                    <span className="hidden sm:inline-block px-2.5 py-1 rounded-lg bg-teal-500/20 text-teal-300 text-[10px] font-extrabold uppercase tracking-wider shrink-0">
                      CBSE / NCERT
                    </span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION: ABOUT US & OUR SERVICES (CLIENT SLIDE 1 CONTENT)                */}
        {/* ========================================================================= */}
        <section id="about-overview" className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-10 sm:space-y-12">
          
          {/* HEADER & NARRATIVE */}
          <div className="space-y-3 sm:space-y-4 max-w-4xl">
            <div>
              <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight font-[family-name:var(--font-outfit)]">
                About Us
              </h2>
              <div className="w-16 h-1 bg-teal-600 rounded-full mt-2" />
            </div>
            
            <p className="text-sm sm:text-base lg:text-lg text-slate-700 font-medium leading-relaxed pt-1 sm:pt-2">
              Devgya Global Edutech Pvt. Ltd. works across educational publishing, books distribution and digital learning support. We develop and present useful content for schools and families, coordinate the supply of books through institutional and channel relationships, and are building an AI-powered education portal for Teachers, Students, Parents and Schools.
            </p>
          </div>

          {/* OUR SERVICES TITLE */}
          <div className="space-y-6">
            <h3 className="text-xl sm:text-3xl font-extrabold text-slate-900 font-[family-name:var(--font-outfit)]">
              Our Services
            </h3>

            {/* 3 SERVICES CARDS (MATCHING CLIENT SLIDE 1) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
              
              {/* SERVICE 1: PUBLICATIONS */}
              <div className="rounded-2xl bg-white border border-slate-200/90 p-5 sm:p-6 shadow-sm hover:shadow-xl transition-all duration-300 flex items-stretch gap-4 group">
                <div className="w-2.5 sm:w-3 rounded-full bg-teal-600 shrink-0 group-hover:scale-y-105 transition-transform" />
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-base sm:text-lg font-black text-slate-900 group-hover:text-teal-700 transition-colors">
                      Publications
                    </h4>
                    <BookOpen className="w-5 h-5 text-teal-600 group-hover:scale-110 transition-transform shrink-0" />
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                    Educational and Parenting Books
                  </p>
                </div>
              </div>

              {/* SERVICE 2: BOOKS DISTRIBUTION */}
              <div className="rounded-2xl bg-white border border-slate-200/90 p-5 sm:p-6 shadow-sm hover:shadow-xl transition-all duration-300 flex items-stretch gap-4 group">
                <div className="w-2.5 sm:w-3 rounded-full bg-teal-600 shrink-0 group-hover:scale-y-105 transition-transform" />
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-base sm:text-lg font-black text-slate-900 group-hover:text-teal-700 transition-colors">
                      Books Distribution
                    </h4>
                    <Truck className="w-5 h-5 text-teal-600 group-hover:scale-110 transition-transform shrink-0" />
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                    Institutional and Channel Supply Support
                  </p>
                </div>
              </div>

              {/* SERVICE 3: AI-POWERED PORTAL */}
              <div className="rounded-2xl bg-white border border-slate-200/90 p-5 sm:p-6 shadow-sm hover:shadow-xl transition-all duration-300 flex items-stretch gap-4 group">
                <div className="w-2.5 sm:w-3 rounded-full bg-teal-600 shrink-0 group-hover:scale-y-105 transition-transform" />
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-base sm:text-lg font-black text-slate-900 group-hover:text-teal-700 transition-colors">
                      AI-Powered Portal
                    </h4>
                    <Cpu className="w-5 h-5 text-teal-600 group-hover:scale-110 transition-transform shrink-0" />
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                    Role-Based Support for the School Community
                  </p>
                </div>
              </div>

            </div>

            {/* CALLOUT BANNER (CLIENT SLIDE 1 BANNER) */}
            <div className="p-3.5 sm:p-4.5 rounded-xl sm:rounded-2xl bg-[#E6F3F5] border border-teal-200/80 text-center shadow-xs">
              <p className="text-xs sm:text-base font-extrabold text-teal-950 tracking-tight">
                Clear communication. Practical content. Coordinated support.
              </p>
            </div>
          </div>

        </section>

        {/* ========================================================================= */}
        {/* VERTICAL 1: PUBLICATIONS AND BOOKS (CLIENT SLIDE 2)                      */}
        {/* ========================================================================= */}
        <section id="publications" className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-8 sm:space-y-10 border-t border-slate-200/80">
          
          {/* SECTION HEADER */}
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight font-[family-name:var(--font-outfit)]">
              Publications and Books
            </h2>
            <div className="w-16 h-1 bg-teal-600 rounded-full" />
            <p className="text-xs sm:text-base text-slate-600 font-medium pt-1">
              Educational content developed for practical use in classrooms and homes.
            </p>
          </div>

          {/* MAIN PHOTO SHOWCASE */}
          <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl border border-slate-200 bg-white group">
            <div className="aspect-[16/10] sm:aspect-[16/9] w-full overflow-hidden">
              <img 
                src="/images/about/publications_books.jpg" 
                alt="Publications and Books - Devgya Global Edutech" 
                className="w-full h-full object-cover object-center group-hover:scale-102 transition-transform duration-700" 
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />
            <div className="absolute bottom-3 left-3 right-3 sm:bottom-6 sm:left-6 text-white max-w-xl">
              <span className="px-2.5 sm:px-3 py-1 rounded-full bg-teal-600/90 text-white text-[10px] sm:text-xs font-bold uppercase tracking-wider backdrop-blur-md">
                KnowSphere &amp; Parenting Titles
              </span>
              <p className="text-xs sm:text-base font-semibold mt-1.5 sm:mt-2 text-slate-100 drop-shadow-md leading-snug">
                Carefully curated educational readers, holistic student workbooks, and modern parental guidance guides.
              </p>
            </div>
          </div>

          {/* WHAT WE DO & PUBLICATION AREAS */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start pt-2">
            
            {/* WHAT WE DO */}
            <div className="lg:col-span-5 space-y-2.5 sm:space-y-3">
              <h3 className="text-lg sm:text-2xl font-black text-slate-900 font-[family-name:var(--font-outfit)]">
                What We Do
              </h3>
              <p className="text-xs sm:text-sm lg:text-base text-slate-700 font-medium leading-relaxed">
                We work on educational and parenting titles with attention to the intended reader, age group, language and purpose. Our role can include concept planning, content development, editing, page design, cover preparation and print-ready production.
              </p>
            </div>

            {/* PUBLICATION AREAS CARDS */}
            <div className="lg:col-span-7 space-y-3 sm:space-y-4">
              <h3 className="text-lg sm:text-2xl font-black text-slate-900 font-[family-name:var(--font-outfit)]">
                Publication Areas
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                
                {/* AREA 1 */}
                <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition-all flex items-center gap-3.5 group">
                  <span className="w-3.5 h-3.5 rounded-full bg-amber-500 shrink-0 group-hover:scale-125 transition-transform" />
                  <span className="text-xs sm:text-sm font-extrabold text-slate-800">
                    School Educational Books
                  </span>
                </div>

                {/* AREA 2 */}
                <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition-all flex items-center gap-3.5 group">
                  <span className="w-3.5 h-3.5 rounded-full bg-amber-500 shrink-0 group-hover:scale-125 transition-transform" />
                  <span className="text-xs sm:text-sm font-extrabold text-slate-800">
                    Art, Activity and General Knowledge Books
                  </span>
                </div>

                {/* AREA 3 */}
                <div className="sm:col-span-2 p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition-all flex items-center gap-3.5 group">
                  <span className="w-3.5 h-3.5 rounded-full bg-amber-500 shrink-0 group-hover:scale-125 transition-transform" />
                  <span className="text-xs sm:text-sm font-extrabold text-slate-800">
                    Parenting and Family Guidance Books
                  </span>
                </div>

              </div>
            </div>

          </div>

          {/* WHO WE SERVE SECTION */}
          <div className="space-y-3 sm:space-y-4 pt-4 border-t border-slate-200/70">
            <h3 className="text-lg sm:text-2xl font-black text-slate-900 font-[family-name:var(--font-outfit)]">
              Who We Serve
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4">
              {[
                { name: "Schools", icon: Building2, desc: "Academic curriculum & libraries" },
                { name: "Teachers", icon: GraduationCap, desc: "Instructional pedagogy" },
                { name: "Students", icon: Sparkles, desc: "Experiential learning" },
                { name: "Parents", icon: Users, desc: "Child development guides" }
              ].map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div 
                    key={idx} 
                    className="p-3.5 sm:p-5 rounded-xl sm:rounded-2xl bg-[#EBF3F5] border border-teal-200/60 text-center space-y-1.5 sm:space-y-2 hover:bg-[#E0EEF1] hover:scale-102 transition-all duration-200 shadow-xs"
                  >
                    <div className="w-8 h-8 sm:w-10 sm:h-10 mx-auto rounded-xl bg-teal-600/10 text-teal-800 flex items-center justify-center font-bold">
                      <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <p className="text-xs sm:text-base font-black text-slate-900">
                      {item.name}
                    </p>
                    <p className="text-[10px] sm:text-[11px] text-slate-600 font-medium line-clamp-1 sm:line-clamp-none">
                      {item.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

        </section>

        {/* ========================================================================= */}
        {/* VERTICAL 2: BOOKS DISTRIBUTION NETWORK (CLIENT SLIDE 3)                   */}
        {/* ========================================================================= */}
        <section id="distribution" className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-8 sm:space-y-10 border-t border-slate-200/80">
          
          {/* SECTION HEADER */}
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight font-[family-name:var(--font-outfit)]">
              Books Distribution Network
            </h2>
            <div className="w-16 h-1 bg-teal-600 rounded-full" />
            <p className="text-xs sm:text-base text-slate-600 font-medium pt-1">
              Practical coordination for selecting, ordering and supplying educational books.
            </p>
          </div>

          {/* MAIN PHOTO SHOWCASE */}
          <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl border border-slate-200 bg-white group">
            <div className="aspect-[16/10] sm:aspect-[16/9] w-full overflow-hidden">
              <img 
                src="/images/about/books_distribution.jpg" 
                alt="Books Distribution Network - Devgya Logistics & Warehousing" 
                className="w-full h-full object-cover object-center group-hover:scale-102 transition-transform duration-700" 
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />
            <div className="absolute bottom-3 left-3 right-3 sm:bottom-6 sm:left-6 text-white max-w-xl">
              <span className="px-2.5 sm:px-3 py-1 rounded-full bg-teal-600/90 text-white text-[10px] sm:text-xs font-bold uppercase tracking-wider backdrop-blur-md">
                Institutional &amp; Channel Supply
              </span>
              <p className="text-xs sm:text-base font-semibold mt-1.5 sm:mt-2 text-slate-100 drop-shadow-md leading-snug">
                From Classrooms to Brighter Tomorrows — structured warehouse dispatch, timely delivery, and verified quality.
              </p>
            </div>
          </div>

          {/* HOW WE SUPPORT DISTRIBUTION */}
          <div className="space-y-5 sm:space-y-6">
            <div className="max-w-4xl space-y-2">
              <h3 className="text-lg sm:text-2xl font-black text-slate-900 font-[family-name:var(--font-outfit)]">
                How We Support Distribution
              </h3>
              <p className="text-xs sm:text-sm lg:text-base text-slate-700 font-medium leading-relaxed">
                We connect suitable titles with schools, institutions and channel partners. Each requirement is handled according to title availability, quantity, delivery location and agreed timelines. Coverage and commercial terms are confirmed for each order.
              </p>
            </div>

            {/* 4 NUMBERED STEPS WORKFLOW (MATCHING CLIENT SLIDE 3) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-6 pt-1">
              
              {/* STEP 1 */}
              <div className="p-4 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all flex items-start gap-3.5 sm:gap-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-amber-500 text-white flex items-center justify-center font-black text-sm sm:text-base shrink-0 shadow-md shadow-amber-500/30">
                  1
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm sm:text-lg font-black text-slate-900">
                    Understand the Requirement
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                    Identify the classes, subjects, titles, quantities, and delivery location.
                  </p>
                </div>
              </div>

              {/* STEP 2 */}
              <div className="p-4 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all flex items-start gap-3.5 sm:gap-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-amber-500 text-white flex items-center justify-center font-black text-sm sm:text-base shrink-0 shadow-md shadow-amber-500/30">
                  2
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm sm:text-lg font-black text-slate-900">
                    Confirm Suitable Titles
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                    Share suitable options, samples, or catalogue details as required.
                  </p>
                </div>
              </div>

              {/* STEP 3 */}
              <div className="p-4 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all flex items-start gap-3.5 sm:gap-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-amber-500 text-white flex items-center justify-center font-black text-sm sm:text-base shrink-0 shadow-md shadow-amber-500/30">
                  3
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm sm:text-lg font-black text-slate-900">
                    Coordinate the Order
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                    Confirm quantities, commercial terms, documentation, and the dispatch plan.
                  </p>
                </div>
              </div>

              {/* STEP 4 */}
              <div className="p-4 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all flex items-start gap-3.5 sm:gap-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-amber-500 text-white flex items-center justify-center font-black text-sm sm:text-base shrink-0 shadow-md shadow-amber-500/30">
                  4
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm sm:text-lg font-black text-slate-900">
                    Support Delivery
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                    Track communication and follow up on delivery with the relevant partner.
                  </p>
                </div>
              </div>

            </div>

            {/* CALLOUT BANNER (CLIENT SLIDE 3 BANNER) */}
            <div className="p-3.5 sm:p-4.5 rounded-xl sm:rounded-2xl bg-[#E6F3F5] border border-teal-200/80 text-center shadow-xs">
              <p className="text-xs sm:text-base font-extrabold text-teal-950 tracking-tight">
                Suitable for school requirements, institutional orders and coordinated supply through distribution partners.
              </p>
            </div>
          </div>

        </section>

        {/* ========================================================================= */}
        {/* VERTICAL 3: AI POWERED EDUCATION PORTAL (CLIENT SLIDE 4)                  */}
        {/* ========================================================================= */}
        <section id="ai-portal" className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-8 sm:space-y-10 border-t border-slate-200/80">
          
          {/* SECTION HEADER */}
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight font-[family-name:var(--font-outfit)]">
              AI Powered Education Portal
            </h2>
            <div className="w-16 h-1 bg-teal-600 rounded-full" />
            <p className="text-xs sm:text-base text-slate-600 font-medium pt-1">
              A connected digital environment planned for Teachers, Students, Parents and Schools.
            </p>
          </div>

          {/* MAIN PHOTO SHOWCASE */}
          <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl border border-slate-200 bg-white group">
            <div className="aspect-[16/10] sm:aspect-[16/9] w-full overflow-hidden">
              <img 
                src="/images/about/ai_portal_classroom.jpg" 
                alt="AI Powered Education Portal - Smart Classroom" 
                className="w-full h-full object-cover object-center group-hover:scale-102 transition-transform duration-700" 
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />
            <div className="absolute bottom-3 left-3 right-3 sm:bottom-6 sm:left-6 text-white max-w-xl">
              <span className="px-2.5 sm:px-3 py-1 rounded-full bg-teal-600/90 text-white text-[10px] sm:text-xs font-bold uppercase tracking-wider backdrop-blur-md">
                Connected Digital Ecosystem
              </span>
              <p className="text-xs sm:text-base font-semibold mt-1.5 sm:mt-2 text-slate-100 drop-shadow-md leading-snug">
                Interactive classroom learning, adaptive assessment generation, and real-time student analytics.
              </p>
            </div>
          </div>

          {/* ONE PORTAL FOR THE SCHOOL COMMUNITY */}
          <div className="space-y-5 sm:space-y-6">
            <div className="max-w-4xl space-y-2">
              <h3 className="text-lg sm:text-2xl font-black text-slate-900 font-[family-name:var(--font-outfit)]">
                One Portal for the School Community
              </h3>
              <p className="text-xs sm:text-sm lg:text-base text-slate-700 font-medium leading-relaxed">
                The portal is designed to organise role-based support within one system. Access and resources can be structured around each user group while schools coordinate implementation.
              </p>
            </div>

            {/* 4 ROLE-BASED CARDS (MATCHING CLIENT SLIDE 4) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-6">
              
              {/* ROLE 1: TEACHERS */}
              <div className="p-4.5 sm:p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-lg transition-all flex items-start gap-3.5 sm:gap-4 group">
                <span className="w-3.5 h-3.5 rounded-full bg-amber-500 shrink-0 mt-1.5 group-hover:scale-125 transition-transform" />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" />
                    <h4 className="text-sm sm:text-lg font-black text-slate-900">
                      Teachers
                    </h4>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                    Planning, Resources and Professional Support.
                  </p>
                </div>
              </div>

              {/* ROLE 2: STUDENTS */}
              <div className="p-4.5 sm:p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-lg transition-all flex items-start gap-3.5 sm:gap-4 group">
                <span className="w-3.5 h-3.5 rounded-full bg-amber-500 shrink-0 mt-1.5 group-hover:scale-125 transition-transform" />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" />
                    <h4 className="text-sm sm:text-lg font-black text-slate-900">
                      Students
                    </h4>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                    Learning, Practice and Guided Skill Development.
                  </p>
                </div>
              </div>

              {/* ROLE 3: PARENTS */}
              <div className="p-4.5 sm:p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-lg transition-all flex items-start gap-3.5 sm:gap-4 group">
                <span className="w-3.5 h-3.5 rounded-full bg-amber-500 shrink-0 mt-1.5 group-hover:scale-125 transition-transform" />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <HeartHandshake className="w-4 h-4 sm:w-5 sm:h-5 text-teal-600" />
                    <h4 className="text-sm sm:text-lg font-black text-slate-900">
                      Parents
                    </h4>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                    Parenting Guidance and Communication Support.
                  </p>
                </div>
              </div>

              {/* ROLE 4: SCHOOLS */}
              <div className="p-4.5 sm:p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-lg transition-all flex items-start gap-3.5 sm:gap-4 group">
                <span className="w-3.5 h-3.5 rounded-full bg-amber-500 shrink-0 mt-1.5 group-hover:scale-125 transition-transform" />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                    <h4 className="text-sm sm:text-lg font-black text-slate-900">
                      Schools
                    </h4>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                    Access Coordination and Institutional Support.
                  </p>
                </div>
              </div>

            </div>
          </div>

        </section>

        {/* ========================================================================= */}
        {/* CONTACT US & FOLLOW US HUB: CLIENT SLIDE 4 BOTTOM DARK CARD              */}
        {/* ========================================================================= */}
        <section id="contact-reach" className="py-10 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
          <div className="p-5 sm:p-8 lg:p-12 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[#0B1528] via-[#0F1D36] to-[#12284C] text-white shadow-2xl border border-teal-900/40 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-teal-500/10 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500/15 blur-[120px] rounded-full pointer-events-none" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 relative z-10 items-center">
              
              {/* LEFT: CONTACT DETAILS */}
              <div className="lg:col-span-7 space-y-5 sm:space-y-6">
                <div>
                  <h3 className="text-xl sm:text-3xl font-black text-white font-[family-name:var(--font-outfit)]">
                    Contact Us
                  </h3>
                  <p className="text-slate-300 text-xs sm:text-sm font-medium mt-1">
                    Connect with our corporate office for publishing queries, book distribution orders, and school partnerships.
                  </p>
                </div>

                <div className="space-y-3.5 sm:space-y-4 text-xs sm:text-sm">
                  {/* PHONE */}
                  <a 
                    href="tel:+919467582441" 
                    className="flex items-center gap-3.5 text-slate-200 hover:text-teal-300 transition-colors group p-2 -ml-2 rounded-xl hover:bg-white/5"
                  >
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0 border border-amber-500/30 group-hover:scale-110 transition-transform">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Call Directly</p>
                      <p className="font-extrabold tracking-wide text-sm sm:text-base text-white">
                        +91 9467582441
                      </p>
                    </div>
                  </a>

                  {/* EMAIL */}
                  <a 
                    href="mailto:dgepl.info@gmail.com" 
                    className="flex items-center gap-3.5 text-slate-200 hover:text-teal-300 transition-colors group p-2 -ml-2 rounded-xl hover:bg-white/5"
                  >
                    <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center shrink-0 border border-teal-500/30 group-hover:scale-110 transition-transform">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Email Us</p>
                      <p className="font-semibold text-xs sm:text-sm text-white">
                        dgepl.info@gmail.com
                      </p>
                    </div>
                  </a>

                  {/* WEBSITE */}
                  <a 
                    href="https://www.devgya.in" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex items-center gap-3.5 text-slate-200 hover:text-teal-300 transition-colors group p-2 -ml-2 rounded-xl hover:bg-white/5"
                  >
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center shrink-0 border border-cyan-500/30 group-hover:scale-110 transition-transform">
                      <ExternalLink className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Official Website</p>
                      <p className="font-semibold text-xs sm:text-sm text-white">
                        www.devgya.in
                      </p>
                    </div>
                  </a>

                  {/* ADDRESS */}
                  <div className="flex items-start gap-3.5 text-slate-200 p-2 -ml-2">
                    <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-300 flex items-center justify-center shrink-0 border border-rose-500/30 mt-0.5">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div className="font-medium text-xs sm:text-sm leading-relaxed text-slate-300">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Registered Corporate Office</p>
                      <p className="font-bold text-white text-xs sm:text-sm">7759, W-3, Near Chhara Chungi, Jhajjar-124103, Haryana, India</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT: FOLLOW US QR CODES & CHANNELS */}
              <div className="lg:col-span-5 space-y-4 pt-4 lg:pt-0 border-t lg:border-t-0 border-white/10">
                <div className="text-center lg:text-left">
                  <h4 className="text-lg sm:text-xl font-black text-white font-[family-name:var(--font-outfit)]">
                    Follow Us
                  </h4>
                  <p className="text-slate-400 text-xs">
                    Scan the QR code or click to visit our official social channels
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  
                  {/* YOUTUBE QR CARD */}
                  <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-white/5 border border-white/15 text-center space-y-2.5 sm:space-y-3 backdrop-blur-md hover:bg-white/10 transition-all flex flex-col items-center">
                    <div className="p-1.5 sm:p-2 bg-white rounded-xl shadow-md">
                      <img 
                        src="/images/about/qr_youtube.png" 
                        alt="Devgya YouTube QR Code" 
                        className="w-20 h-20 sm:w-28 sm:h-28 object-contain" 
                      />
                    </div>
                    <a
                      href={YOUTUBE_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 sm:py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-md transition-all active:scale-95"
                    >
                      <YouTubeLogo className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      <span>YouTube</span>
                    </a>
                  </div>

                  {/* INSTAGRAM QR CARD */}
                  <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-white/5 border border-white/15 text-center space-y-2.5 sm:space-y-3 backdrop-blur-md hover:bg-white/10 transition-all flex flex-col items-center">
                    <div className="p-1.5 sm:p-2 bg-white rounded-xl shadow-md">
                      <img 
                        src="/images/about/qr_instagram.png" 
                        alt="Devgya Instagram QR Code" 
                        className="w-20 h-20 sm:w-28 sm:h-28 object-contain" 
                      />
                    </div>
                    <a
                      href={INSTAGRAM_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 sm:py-2 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 hover:opacity-95 text-white text-xs font-bold shadow-md transition-all active:scale-95"
                    >
                      <InstagramLogo className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      <span>Instagram</span>
                    </a>
                  </div>

                </div>
              </div>

            </div>
          </div>
        </section>

      </PageTransition>

      <Footer />
    </div>
  );
}
