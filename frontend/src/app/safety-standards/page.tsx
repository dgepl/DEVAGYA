import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PageTransition } from "@/components/ui/PageTransition";
import { Award, ShieldCheck, Cpu, FlaskConical, GraduationCap } from "lucide-react";

export default function SafetyStandardsPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col pt-24 md:pt-28">
      <Navbar />
      <PageTransition>
        <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
          
          {/* HEADER */}
          <div className="text-center space-y-3 border-b border-slate-200 pb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-extrabold uppercase tracking-wider">
              <Award className="w-4 h-4 text-emerald-600" />
              <span>Quality & Safety Excellence</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Quality & Safety Standards
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-semibold max-w-2xl mx-auto">
              DEVGYA GLOBAL EDUTECH PRIVATE LIMITED • Certified K-12 Educational Infrastructure & Ethical AI
            </p>
          </div>

          {/* HIGHLIGHT CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white border border-slate-200 p-5 rounded-2xl space-y-2 shadow-xs">
              <FlaskConical className="w-6 h-6 text-emerald-600" />
              <h4 className="text-sm font-bold text-slate-900">Certified Science Labs</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                ISO & safety-certified laboratory equipment and curriculum-aligned lab apparatus.
              </p>
            </div>

            <div className="bg-white border border-slate-200 p-5 rounded-2xl space-y-2 shadow-xs">
              <GraduationCap className="w-6 h-6 text-indigo-600" />
              <h4 className="text-sm font-bold text-slate-900">CBSE/NCERT Accuracy</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                100% textbook alignment with verified answer keys and Bloom&apos;s Taxonomy difficulty indexing.
              </p>
            </div>

            <div className="bg-white border border-slate-200 p-5 rounded-2xl space-y-2 shadow-xs">
              <Cpu className="w-6 h-6 text-purple-600" />
              <h4 className="text-sm font-bold text-slate-900">Socratic AI Guardrails</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Built-in guardrails preventing direct homework cheating, focusing on Socratic reasoning hints.
              </p>
            </div>
          </div>

          {/* DETAILED SECTIONS */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-8 text-sm text-slate-700 leading-relaxed">
            
            <section className="space-y-3">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                1. Physical School Infrastructure & Science Laboratory Safety
              </h3>
              <p>
                At <strong>DEVGYA GLOBAL EDUTECH PRIVATE LIMITED</strong>, our physical school infrastructure—ranging from curriculum-aligned textbooks to certified science laboratories—undergoes rigorous quality assurance checks before deployment to schools.
              </p>
            </section>

            <section className="space-y-3 border-t border-slate-100 pt-6">
              <h3 className="text-lg font-black text-slate-900">2. Ethical AI & Socratic Learning Safety</h3>
              <p className="text-xs sm:text-sm text-slate-600">
                Our AI Operating System is engineered specifically for student safety. The Socratic AI Tutor guides students step-by-step through mathematical and scientific concepts without spoiling answers, reinforcing genuine understanding rather than passive copy-pasting.
              </p>
            </section>

            <section className="space-y-3 border-t border-slate-100 pt-6">
              <h3 className="text-lg font-black text-slate-900">3. Quality Certification & Verification Contact</h3>
              <p className="text-xs text-slate-600">
                For safety documentation or institutional compliance verification:<br />
                <strong className="text-slate-900">DEVGYA GLOBAL EDUTECH PRIVATE LIMITED</strong><br />
                Phone: +91 8307224756 | Email: quality@devgyaglobal.com
              </p>
            </section>

          </div>

        </main>
      </PageTransition>
      <Footer />
    </div>
  );
}
