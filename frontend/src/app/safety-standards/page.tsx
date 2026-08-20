import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PageTransition } from "@/components/ui/PageTransition";
import { Award, ShieldCheck, Lock, CheckCircle2, HeartHandshake, Sparkles, BookOpen, ShieldAlert } from "lucide-react";

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
                <div 
                  key={idx}
                  className="bg-white border border-slate-200 hover:border-indigo-300 p-8 rounded-3xl space-y-4 shadow-md hover:shadow-xl transition-all group flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${pillar.color} text-white flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform`}>
                        <Icon className="w-7 h-7" />
                      </div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200 px-3 py-1 rounded-full">
                        {pillar.badge}
                      </span>
                    </div>

                    <h3 className="text-xl font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors">
                      {pillar.title}
                    </h3>

                    <p className="text-sm text-slate-600 leading-relaxed font-medium">
                      {pillar.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center gap-2 text-xs font-bold text-emerald-600">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Verified Standard</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* COMMITMENT BANNER */}
          <div className="bg-white border border-slate-200 rounded-3xl p-8 space-y-6 text-slate-700 leading-relaxed shadow-sm">
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Award className="w-5 h-5 text-indigo-600" />
              Our Promise to Schools, Educators & Families
            </h3>
            <p className="text-sm font-medium text-slate-600 leading-relaxed">
              Devgya Global Edutech Private Limited ensures every component of our service—from printed textbook delivery and teacher workshops to digital AI worksheets and student query tools—adheres to strict quality control, ethical standards, and bank-grade data security.
            </p>
            <div className="pt-4 border-t border-slate-100 flex flex-wrap gap-4 text-xs font-extrabold text-slate-700">
              <div><strong className="text-slate-900">Headquarters:</strong> Jhajjar, Haryana</div>
              <div><strong className="text-slate-900">Email:</strong> dgepl.info@gmail.com</div>
              <div><strong className="text-slate-900">Phone:</strong> +91 9466966350</div>
            </div>
          </div>

        </main>
      </PageTransition>
      <Footer />
    </div>
  );
}

