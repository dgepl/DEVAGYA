import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PageTransition } from "@/components/ui/PageTransition";
import { Award, ShieldCheck, Lock, CheckCircle2, HeartHandshake, Sparkles, BookOpen, ShieldAlert } from "lucide-react";

export const metadata: Metadata = {
  title: "Quality & Safety System | DEVGYA GLOBAL EDUTECH PRIVATE LIMITED",
  description: "Explore DEVGYA GLOBAL EDUTECH's commitment to high academic quality, secure encryption, child-safe AI learning spaces, and certified educational resources.",
  keywords: [
    "DEVGYA Safety Standards",
    "Educational Safety AI",
    "Child Safe AI Tools",
    "CBSE School Data Privacy",
    "Encrypted Edtech Platform"
  ],
  alternates: {
    canonical: "https://devgya.in/safety-standards"
  },
  openGraph: {
    title: "Quality & Safety System | DEVGYA GLOBAL EDUTECH PRIVATE LIMITED",
    description: "Our framework for educational excellence, student data protection, and child-safe AI technology.",
    url: "https://devgya.in/safety-standards",
    siteName: "DEVGYA GLOBAL EDUTECH",
    images: [{ url: "https://devgya.in/logo-with-name.png", width: 1200, height: 630, alt: "DEVGYA Quality & Safety Standards" }],
    locale: "en_IN",
    type: "website"
  }
};

export default function SafetyStandardsPage() {
  const qualityPillars = [
    {
      title: "High-Grade Quality",
      description: "All our academic books, teaching tools, and training modules meet strict educational standards.",
      icon: Award,
      color: "from-blue-600 to-indigo-600",
      badge: "Educational Excellence"
    },
    {
      title: "Data Security & Privacy",
      description: "Our platform uses advanced encryption and secure protocols to protect user data and student privacy.",
      icon: Lock,
      color: "from-purple-600 to-pink-600",
      badge: "Advanced Encryption"
    },
    {
      title: "Safe Digital Environment",
      description: "All digital tools, quizzes, and AI features are carefully monitored to ensure a secure and child-friendly learning space.",
      icon: ShieldCheck,
      color: "from-emerald-600 to-teal-600",
      badge: "Child-Friendly Space"
    },
    {
      title: "Reliable Support",
      description: "We maintain total transparency and trust in all our book supplies, school services, and digital interactions.",
      icon: HeartHandshake,
      color: "from-amber-500 to-orange-600",
      badge: "Transparent & Trusted"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col pt-24 md:pt-28 selection:bg-indigo-500 selection:text-white">
      <Navbar />
      <PageTransition>
        <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
          
          {/* HEADER */}
          <div className="text-center space-y-4 border-b border-slate-200 pb-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-extrabold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Safety & Excellence Framework</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
              Quality & Safety System
            </h1>
            <p className="text-slate-600 text-base sm:text-lg font-medium max-w-3xl mx-auto leading-relaxed">
              At Devgya Global Edutech Private Limited, we prioritize uncompromised quality and complete digital safety.
            </p>
          </div>

          {/* 4 CORE QUALITY & SAFETY PILLARS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {qualityPillars.map((pillar, idx) => {
              const Icon = pillar.icon;
              return (
                <div key={idx} className="p-8 rounded-3xl bg-white border border-slate-200/80 hover:border-emerald-200 hover:shadow-xl transition-all space-y-4 shadow-sm group">
                  <div className="flex items-center justify-between">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${pillar.color} text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider bg-slate-100 text-slate-700 px-3 py-1 rounded-full">
                      {pillar.badge}
                    </span>
                  </div>

                  <h3 className="text-xl font-extrabold text-slate-900 group-hover:text-emerald-700 transition-colors">
                    {pillar.title}
                  </h3>

                  <p className="text-sm text-slate-600 leading-relaxed font-medium">
                    {pillar.description}
                  </p>
                </div>
              );
            })}
          </div>

          {/* COMMITMENT BANNER */}
          <div className="p-8 rounded-3xl bg-gradient-to-r from-emerald-900 to-teal-950 text-white text-center space-y-4 shadow-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-extrabold uppercase tracking-wider">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Continuous Improvement</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black">
              Certified Pedagogical Standards & Security First
            </h2>
            <p className="text-slate-300 text-sm max-w-2xl mx-auto font-medium">
              We regularly review and update our systems to ensure they align with the latest educational guidelines, CBSE NEP 2020 directives, and highest security benchmarks.
            </p>
          </div>

        </main>
      </PageTransition>
      <Footer />
    </div>
  );
}
