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
  Award, 
  HeartHandshake, 
  Lightbulb,
  Mail,
  Home,
  Info,
  CheckCircle,
  HelpCircle
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

              <span className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 text-white font-black shadow-md shadow-indigo-600/40 border border-indigo-400/30">
                <Info className="w-3.5 h-3.5 text-amber-300" />
                <span>About Us</span>
              </span>
              <span className="text-white/30">•</span>

              <Link 
                href="/why-choose-us" 
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white transition-all border border-white/10"
              >
                <CheckCircle className="w-3.5 h-3.5 text-emerald-300" />
                <span>Why Choose Us</span>
              </Link>
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
              <div className="flex flex-wrap items-center gap-2.5">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-black uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>About DEVGYA GLOBAL</span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-slate-200 text-xs font-semibold">
                  <MapPin className="w-3.5 h-3.5 text-rose-400" />
                  <span>Headquartered in Jhajjar, Haryana</span>
                </div>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white font-[family-name:var(--font-outfit)] leading-tight">
                Empowering the Entire <br className="hidden sm:inline" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-indigo-300 to-pink-300">
                  Academic Ecosystem
                </span>
              </h1>

              <p className="text-sm sm:text-base text-slate-300 font-medium leading-relaxed max-w-3xl">
                At Devgya Global Edutech Private Limited, we are dedicated to transforming the educational landscape by bridging the gap between schools, teachers, and parents through innovative digital solutions and quality academic resources.
              </p>

              {/* AUTHENTIC FEATURE PILLS IN DARK GLASSMORPHISM */}
              <div className="flex flex-wrap items-center gap-2.5 pt-2">
                {[
                  { text: "Seamless Book Supply & Publishing", icon: BookOpen },
                  { text: "CBSE Teacher Training Workshops", icon: GraduationCap },
                  { text: "Teachers Skill Olympiad", icon: Award },
                  { text: "AI Homework & Query Assistant", icon: HeartHandshake },
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

        {/* MAIN STAKEHOLDER SUPPORT SECTION */}
        <section className="py-14 sm:py-18 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-12">
          
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-50 border border-purple-200 text-purple-700 text-xs font-extrabold uppercase tracking-wider">
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {stakeholderSupport.map((item, idx) => {
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
                    <span>Empowering Education</span>
                  </div>
                </div>
              );
            })}
          </div>

        </section>

        {/* MISSION STATEMENT CARD (MATCHING CONTACT STYLE GLASS CONTAINER) */}
        <section className="pb-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full">
          <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 text-white shadow-2xl relative overflow-hidden text-center space-y-5 border border-indigo-900/40">
            <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/15 blur-[100px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-72 h-72 bg-indigo-500/15 blur-[100px] rounded-full pointer-events-none" />
            
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-cyan-300 text-xs font-extrabold uppercase tracking-wider relative z-10">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Our Commitment</span>
            </div>

            <h3 className="text-xl sm:text-3xl font-black leading-tight text-white max-w-3xl mx-auto relative z-10">
              Shaping a Smarter, Brighter Future for the Next Generation
            </h3>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-3xl mx-auto font-medium relative z-10">
              Driven by innovation and a commitment to excellence, Devgya Global Edutech is your trusted partner in shaping a smarter, brighter future for the next generation.
            </p>

            {/* DIRECT CONTACT & SUPPORT */}
            <div className="pt-6 border-t border-white/10 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-300 relative z-10">
              <a href="mailto:dgepl.info@gmail.com" className="inline-flex items-center gap-2 hover:text-cyan-300 font-bold transition-colors">
                <Mail className="w-4 h-4 text-cyan-400" />
                <span>Email: dgepl.info@gmail.com</span>
              </a>
              <span className="inline-flex items-center gap-2 font-medium text-slate-400">
                <MapPin className="w-4 h-4 text-rose-400" />
                <span>Jhajjar, Haryana, India</span>
              </span>
              <Link href="/contact" className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition">
                <span>Contact Desk</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </section>

      </PageTransition>

      <Footer />
    </div>
  );
}
