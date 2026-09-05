import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PageTransition } from "@/components/ui/PageTransition";
import { ShieldCheck, Lock, EyeOff, Database, UserCheck, ShieldAlert, CheckCircle2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy | DEVGYA GLOBAL EDUTECH PRIVATE LIMITED",
  description: "Read the official privacy policy of DEVGYA GLOBAL EDUTECH PRIVATE LIMITED. Learn how we securely protect user, teacher, and student data with encryption and zero third-party selling.",
  keywords: [
    "DEVGYA Privacy Policy",
    "Edtech Data Privacy",
    "School Student Privacy India",
    "DEVGYA Data Protection"
  ],
  alternates: {
    canonical: "https://devgya.in/privacy-policy"
  },
  openGraph: {
    title: "Privacy Policy | DEVGYA GLOBAL EDUTECH PRIVATE LIMITED",
    description: "Learn how DEVGYA GLOBAL EDUTECH protects student and educator privacy.",
    url: "https://devgya.in/privacy-policy",
    siteName: "DEVGYA GLOBAL EDUTECH",
    images: [{ url: "https://devgya.in/logo-with-name.png", width: 1200, height: 630, alt: "DEVGYA Privacy Policy" }],
    locale: "en_IN",
    type: "website"
  }
};

export default function PrivacyPolicyPage() {
  const privacyPoints = [
    {
      title: "Information We Collect",
      description: "We only collect necessary information to provide you with our educational services, such as your name, contact details, and school-related data.",
      icon: Database,
      badge: "Necessary Data Only",
      color: "from-blue-600 to-indigo-600"
    },
    {
      title: "Data Security",
      description: "We use secure encryption and standard safety protocols to keep your data safe from unauthorized access.",
      icon: Lock,
      badge: "Encrypted Security",
      color: "from-purple-600 to-pink-600"
    },
    {
      title: "No Data Sharing",
      description: "We do not sell or rent your personal information to third parties. Your data is used strictly for improving your learning and teaching experience with us.",
      icon: EyeOff,
      badge: "Zero Third-Party Selling",
      color: "from-rose-600 to-red-600"
    },
    {
      title: "User Control",
      description: "You have full control over your information and can request updates or deletion of your account data at any time.",
      icon: UserCheck,
      badge: "Complete Ownership",
      color: "from-emerald-600 to-teal-600"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col pt-24 md:pt-28 selection:bg-indigo-500 selection:text-white">
      <Navbar />
      <PageTransition>
        <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
          
          {/* HEADER */}
          <div className="text-center space-y-4 border-b border-slate-200 pb-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-extrabold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              <span>Data Protection & Privacy</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
              Privacy Policy
            </h1>
            <p className="text-slate-600 text-base sm:text-lg font-medium max-w-3xl mx-auto leading-relaxed">
              At Devgya Global Edutech Private Limited, your privacy is our priority. We are committed to protecting the information you share with us.
            </p>
          </div>

          {/* 4 CORE PRIVACY PRINCIPLES */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {privacyPoints.map((point, idx) => {
              const Icon = point.icon;
              return (
                <div key={idx} className="p-8 rounded-3xl bg-white border border-slate-200/80 hover:border-indigo-200 hover:shadow-xl transition-all space-y-4 shadow-sm group">
                  <div className="flex items-center justify-between">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${point.color} text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider bg-slate-100 text-slate-700 px-3 py-1 rounded-full">
                      {point.badge}
                    </span>
                  </div>

                  <h3 className="text-xl font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    {point.title}
                  </h3>

                  <p className="text-sm text-slate-600 leading-relaxed font-medium">
                    {point.description}
                  </p>
                </div>
              );
            })}
          </div>

          {/* LEGAL NOTICE FOOTNOTE */}
          <div className="p-8 rounded-3xl bg-slate-100 border border-slate-200 text-slate-700 space-y-4">
            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Policy Compliance & Updates
            </h4>
            <p className="text-xs sm:text-sm leading-relaxed text-slate-600">
              We may update this policy periodically to reflect evolving technology, school safety regulations, and legal compliance. Continued use of Devgya indicates acceptance of any updated privacy terms.
            </p>
            <p className="text-xs text-slate-500 font-semibold">
              Last Updated: September 2026 • DEVGYA GLOBAL EDUTECH PRIVATE LIMITED
            </p>
          </div>

        </main>
      </PageTransition>
      <Footer />
    </div>
  );
}
