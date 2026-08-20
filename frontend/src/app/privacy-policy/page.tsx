import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PageTransition } from "@/components/ui/PageTransition";
import { ShieldCheck, Lock, EyeOff, Database, UserCheck, ShieldAlert, CheckCircle2 } from "lucide-react";

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
                <div 
                  key={idx}
                  className="bg-white border border-slate-200 hover:border-indigo-300 p-8 rounded-3xl space-y-4 shadow-md hover:shadow-xl transition-all group flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${point.color} text-white flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform`}>
                        <Icon className="w-7 h-7" />
                      </div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200 px-3 py-1 rounded-full">
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

                  <div className="pt-4 border-t border-slate-100 flex items-center gap-2 text-xs font-bold text-indigo-600">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Protected Principle</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* TRUST STATEMENT BANNER */}
          <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-r from-indigo-900 via-slate-900 to-purple-950 text-white shadow-xl relative overflow-hidden text-center space-y-4">
            <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/20 blur-[100px] rounded-full pointer-events-none" />

            <h3 className="text-xl sm:text-2xl font-black text-white">
              Your Trust is Our Highest Priority
            </h3>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-3xl mx-auto font-medium">
              By using our platform, you trust us with your information, and we work hard to keep that trust secure.
            </p>

            <div className="pt-4 flex items-center justify-center gap-6 text-xs text-slate-400 font-semibold border-t border-white/10 max-w-xl mx-auto">
              <span><strong>Entity:</strong> Devgya Global Edutech Pvt. Ltd.</span>
              <span>•</span>
              <span><strong>Location:</strong> Jhajjar, Haryana</span>
            </div>
          </div>

        </main>
      </PageTransition>
      <Footer />
    </div>
  );
}

