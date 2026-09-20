import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PageTransition } from "@/components/ui/PageTransition";
import { 
  Award, 
  Layers, 
  Cpu, 
  GraduationCap, 
  Building2, 
  HeartHandshake, 
  CheckCircle2, 
  Sparkles, 
  ArrowRight, 
  Zap, 
  ShieldCheck, 
  Bot, 
  Video,
  Home,
  Info,
  CheckCircle,
  HelpCircle,
  Mail
} from "lucide-react";

export const metadata: Metadata = {
  title: "Why Choose Us | DEVGYA GLOBAL EDUTECH PRIVATE LIMITED",
  description: "Discover why top CBSE schools, educators, students, and parents trust DEVGYA GLOBAL EDUTECH: Unified 360-degree ecosystem, smart OCR & AI tools, educator Olympiad, and dependable school infrastructure.",
  keywords: [
    "Why Choose DEVGYA",
    "DEVGYA Advantages",
    "Best AI Education Platform India",
    "Smart School Ecosystem",
    "CBSE Question Paper Generator Benefits",
    "Teacher Empowerment AI"
  ],
  alternates: {
    canonical: "https://devgya.in/why-choose-us"
  },
  openGraph: {
    title: "Why Choose Us | DEVGYA GLOBAL EDUTECH PRIVATE LIMITED",
    description: "Partner with DEVGYA GLOBAL EDUTECH for modernizing K-12 education with hybrid AI, certified school labs, and comprehensive educator support.",
    url: "https://devgya.in/why-choose-us",
    siteName: "DEVGYA GLOBAL EDUTECH",
    images: [{ url: "https://devgya.in/logo-with-name.png", width: 1200, height: 630, alt: "Why Choose DEVGYA GLOBAL EDUTECH" }],
    locale: "en_IN",
    type: "website"
  }
};

export default function WhyChooseUsPage() {
  const whyUsPillars = [
    {
      title: "360-Degree Educational Ecosystem",
      description: "We bridge the gap between schools, teachers, and parents with comprehensive tools, books, and training programs under one roof.",
      icon: Layers,
      color: "from-blue-600 to-indigo-600",
      badge: "Unified Ecosystem"
    },
    {
      title: "Smart Technology",
      description: "We provide advanced digital solutions like OCR worksheet generators and AI-powered homework support to make learning and teaching effortless.",
      icon: Cpu,
      color: "from-purple-600 to-pink-600",
      badge: "Digital Solutions"
    },
    {
      title: "Empowering Educators",
      description: "Through skill enhance programs and pedagogy resources, we actively help teachers upgrade their classroom efficiency.",
      icon: GraduationCap,
      color: "from-emerald-600 to-teal-600",
      badge: "Teacher Growth"
    },
    {
      title: "Reliable School Support",
      description: "We ensure smooth academic book supplies, CBSE teacher training workshops, and trusted placement support.",
      icon: Building2,
      color: "from-amber-500 to-orange-600",
      badge: "Institutional Reliability"
    },
    {
      title: "Holistic Development",
      description: "We support children and families with interactive quizzes and specialized parenting guides.",
      icon: HeartHandshake,
      color: "from-rose-500 to-pink-600",
      badge: "Family & Child Growth"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-indigo-500 selection:text-white">
      <Navbar />

      <PageTransition className="flex-1 pt-20 sm:pt-24">
        
        {/* HERO & BREADCRUMB NAVIGATION BAR (MATCHING CONTACT PAGE EXACT UI/UX) */}
        <section className="relative overflow-hidden bg-gradient-to-b from-indigo-950 via-slate-900 to-[#09071B] text-white py-14 sm:py-20 px-4 sm:px-6 lg:px-8 border-b border-indigo-900/30">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/15 blur-[120px] rounded-full pointer-events-none" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-purple-500/15 blur-[100px] rounded-full pointer-events-none" />

          <div className="max-w-7xl mx-auto space-y-8 relative z-10">
            
            {/* INTERACTIVE NAVIGATION PILL TABS */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs font-bold font-[family-name:var(--font-jakarta)]">
              <Link 
                href="/" 
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white transition-all border border-white/10"
              >
                <Home className="w-3.5 h-3.5 text-cyan-300" />
                <span>Home</span>
              </Link>
              <span className="text-white/30">•</span>

              <Link 
                href="/about" 
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white transition-all border border-white/10"
              >
                <Info className="w-3.5 h-3.5 text-purple-300" />
                <span>About Us</span>
              </Link>
              <span className="text-white/30">•</span>

              <span className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 text-white font-black shadow-md shadow-indigo-600/40 border border-indigo-400/30">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-300" />
                <span>Why Choose Us</span>
              </span>
              <span className="text-white/30">•</span>

              <Link 
                href="/faq" 
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white transition-all border border-white/10"
              >
                <HelpCircle className="w-3.5 h-3.5 text-amber-300" />
                <span>FAQ</span>
              </Link>
              <span className="text-white/30">•</span>

              <Link 
                href="/contact" 
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white transition-all border border-white/10"
              >
                <Mail className="w-3.5 h-3.5 text-pink-300" />
                <span>Contact Us</span>
              </Link>
            </div>

            {/* HERO TITLE */}
            <div className="space-y-4 max-w-4xl">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-black uppercase tracking-wider">
                <Award className="w-3.5 h-3.5 text-amber-300" />
                <span>Why Choose DEVGYA GLOBAL</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white font-[family-name:var(--font-outfit)] leading-tight">
                Partner with a Trusted Team <br className="hidden sm:inline" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-indigo-300 to-pink-300">
                  Modernizing K-12 Education
                </span>
              </h1>

              <p className="text-sm sm:text-base text-slate-300 font-medium leading-relaxed max-w-3xl">
                Choosing Devgya Global Edutech Private Limited means partnering with a dedicated team committed to upgrading educational quality, empowering educators, and supporting student development under one unified platform. Here is why schools, teachers, and parents choose us:
              </p>

              {/* AUTHENTIC CORE ADVANTAGE PILLS IN DARK GLASSMORPHISM */}
              <div className="flex flex-wrap items-center gap-2.5 pt-2">
                {[
                  { text: "360° Educational Ecosystem", icon: Layers },
                  { text: "Smart OCR & AI Tools", icon: Cpu },
                  { text: "Educator Empowerment", icon: GraduationCap },
                  { text: "Reliable School Support", icon: Building2 },
                  { text: "Holistic Student Growth", icon: HeartHandshake },
                ].map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <div 
                      key={idx} 
                      className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 backdrop-blur-md shadow-xs text-xs font-bold text-slate-200 transition"
                    >
                      <Icon className="w-3.5 h-3.5 text-cyan-300" />
                      <span>{item.text}</span>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </section>

        {/* 5 CORE REASONS CARDS SECTION */}
        <section className="py-14 sm:py-18 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-12">
          
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-extrabold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Core Advantages</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900">
              The 5 Pillars of Our Educational Impact
            </h2>
            <p className="text-slate-600 text-sm sm:text-base font-medium">
              Every feature, curriculum resource, and AI tool is meticulously engineered for pedagogical excellence:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {whyUsPillars.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div 
                  key={idx} 
                  className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-xl transition-all space-y-6 flex flex-col justify-between group"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${item.color} text-white flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform`}>
                        <Icon className="w-7 h-7" />
                      </div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200 px-3 py-1 rounded-full">
                        {item.badge}
                      </span>
                    </div>

                    <h3 className="text-xl font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors">
                      {item.title}
                    </h3>

                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                      {item.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center gap-2 text-xs font-bold text-indigo-600">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Proven Key Advantage</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* QUICK CTA BANNER */}
          <div className="pt-8 text-center">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm shadow-lg shadow-indigo-600/30 transition active:scale-95"
            >
              <Mail className="w-4 h-4" />
              <span>Partner With DEVGYA GLOBAL — Contact Us</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>

        </section>

      </PageTransition>

      <Footer />
    </div>
  );
}
