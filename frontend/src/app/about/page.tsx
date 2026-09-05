import type { Metadata } from "next";
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
  Globe2, 
  Award, 
  HeartHandshake, 
  Lightbulb 
} from "lucide-react";

export const metadata: Metadata = {
  title: "About Us | DEVGYA GLOBAL EDUTECH PRIVATE LIMITED",
  description: "Learn about DEVGYA GLOBAL EDUTECH PRIVATE LIMITED, India's premier K-12 AI education ecosystem based in Jhajjar, Haryana. Empowering CBSE schools, teachers, students, and parents with cutting-edge AI tools and school infrastructure.",
  keywords: [
    "About DEVGYA",
    "DEVGYA GLOBAL EDUTECH PRIVATE LIMITED",
    "Devgya Edutech Haryana",
    "CBSE AI Education Company India",
    "AI Question Paper Generator Company",
    "Smart School Infrastructure Provider"
  ],
  alternates: {
    canonical: "https://devgya.in/about"
  },
  openGraph: {
    title: "About Us | DEVGYA GLOBAL EDUTECH PRIVATE LIMITED",
    description: "Transforming K-12 education with hybrid AI software, CBSE question generators, teacher training, and accredited school lab solutions.",
    url: "https://devgya.in/about",
    siteName: "DEVGYA GLOBAL EDUTECH",
    images: [{ url: "https://devgya.in/logo-with-name.png", width: 1200, height: 630, alt: "About DEVGYA GLOBAL EDUTECH" }],
    locale: "en_IN",
    type: "website"
  }
};

export default function AboutPage() {
  const stakeholderSupport = [
    {
      title: "For Schools",
      badge: "Institutional Support",
      icon: Building2,
      color: "from-blue-600 to-indigo-600",
      description: "We facilitate seamless book supply, academic publishing, professional CBSE teacher training workshops, and reliable job placement support."
    },
    {
      title: "For Teachers",
      badge: "Educator Empowerment",
      icon: GraduationCap,
      color: "from-purple-600 to-pink-600",
      description: "We equip educators with cutting-edge digital tools like OCR worksheet and assignment generators, the Teachers Skill Olympiad, and modern pedagogy books to enhance classroom efficiency."
    },
    {
      title: "For Parents & Students",
      badge: "Holistic Development",
      icon: Users,
      color: "from-emerald-600 to-teal-600",
      description: "We foster engaging learning through interactive homework and AI-powered query assistance, fun educational quizzes, and specialised parenting guides to ensure holistic child development."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col pt-24 md:pt-28 selection:bg-indigo-500 selection:text-white">
      <Navbar />
      
      <PageTransition>
        <main className="flex-1 space-y-20 pb-20">
          
          {/* PROFESSIONALLY ENGAGING HERO BANNER */}
          <section className="relative py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-indigo-50/80 via-white to-slate-50 border-b border-indigo-100/80 overflow-hidden">
            {/* AMBIENT GLOW ORBS */}
            <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-200/30 blur-[130px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-purple-200/30 blur-[120px] rounded-full pointer-events-none" />

            <div className="max-w-4xl mx-auto text-center space-y-6 relative z-10">
              <div className="flex flex-wrap items-center justify-center gap-2.5">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-100/90 border border-indigo-200 text-indigo-800 text-xs font-extrabold shadow-xs">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  <span className="uppercase tracking-wider">About DEVGYA GLOBAL</span>
                </div>

                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold">
                  <MapPin className="w-3.5 h-3.5 text-rose-500" />
                  <span>Headquartered in Jhajjar, Haryana</span>
                </div>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight text-slate-900">
                Empowering the Entire <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
                  Academic Ecosystem
                </span>
              </h1>

              <p className="text-slate-700 text-base sm:text-lg leading-relaxed max-w-3xl mx-auto font-medium">
                At Devgya Global Edutech Private Limited, we are dedicated to transforming the educational landscape by bridging the gap between schools, teachers, and parents through innovative digital solutions and quality academic resources.
              </p>

              {/* AUTHENTIC FEATURE PILLS */}
              <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                {[
                  { text: "Seamless Book Supply & Publishing", icon: BookOpen },
                  { text: "CBSE Teacher Training Workshops", icon: GraduationCap },
                  { text: "Teachers Skill Olympiad", icon: Award },
                  { text: "AI Homework & Query Assistant", icon: HeartHandshake },
                ].map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <div key={idx} className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white border border-slate-200/80 shadow-xs text-xs font-bold text-slate-700">
                      <Icon className="w-3.5 h-3.5 text-indigo-600" />
                      <span>{item.text}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* STAKEHOLDER SUPPORT SECTION */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="text-center max-w-3xl mx-auto space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-purple-700 text-xs font-extrabold uppercase tracking-wider">
                <Lightbulb className="w-3.5 h-3.5 text-purple-600" />
                <span>End-to-End Support</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black text-slate-900">
                Tailored Support for Every Stakeholder
              </h2>
              <p className="text-slate-600 text-sm sm:text-base font-medium">
                We provide comprehensive, end-to-end support tailored to every stakeholder in education:
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {stakeholderSupport.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div 
                    key={idx} 
                    className="p-8 rounded-3xl bg-white border border-indigo-100 hover:border-indigo-300 transition-all space-y-6 shadow-md hover:shadow-xl flex flex-col justify-between group"
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

                      <p className="text-sm text-slate-600 leading-relaxed font-medium">
                        {item.description}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex items-center gap-2 text-xs font-bold text-indigo-600">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Empowering Education</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* MISSION STATEMENT CARD */}
          <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-indigo-900 via-slate-900 to-purple-950 text-white shadow-2xl relative overflow-hidden text-center space-y-4">
              <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/20 blur-[100px] rounded-full pointer-events-none" />
              
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-cyan-300 text-xs font-extrabold uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Our Commitment</span>
              </div>

              <h3 className="text-xl sm:text-3xl font-black leading-tight text-white max-w-3xl mx-auto">
                Shaping a Smarter, Brighter Future for the Next Generation
              </h3>

              <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-3xl mx-auto font-medium">
                Driven by innovation and a commitment to excellence, Devgya Global Edutech is your trusted partner in shaping a smarter, brighter future for the next generation.
              </p>
            </div>
          </section>

        </main>
      </PageTransition>

      <Footer />
    </div>
  );
}
