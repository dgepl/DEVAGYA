import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PageTransition } from "@/components/ui/PageTransition";
import { FileText, CheckCircle2, Scale, BookOpen, Building2 } from "lucide-react";

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col pt-24 md:pt-28">
      <Navbar />
      <PageTransition>
        <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
          
          {/* HEADER */}
          <div className="text-center space-y-3 border-b border-slate-200 pb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-purple-700 text-xs font-extrabold uppercase tracking-wider">
              <Scale className="w-4 h-4 text-purple-600" />
              <span>Terms of Service Agreement</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Terms of Service
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-semibold max-w-2xl mx-auto">
              DEVGYA GLOBAL EDUTECH PRIVATE LIMITED • End-to-End Educational Solution Provider
            </p>
          </div>

          {/* SUMMARY HIGHLIGHT CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white border border-slate-200 p-5 rounded-2xl space-y-2 shadow-xs">
              <Building2 className="w-6 h-6 text-indigo-600" />
              <h4 className="text-sm font-bold text-slate-900">Comprehensive Solutions</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Combines physical textbook infrastructure, certified science labs, and AI software.
              </p>
            </div>

            <div className="bg-white border border-slate-200 p-5 rounded-2xl space-y-2 shadow-xs">
              <BookOpen className="w-6 h-6 text-purple-600" />
              <h4 className="text-sm font-bold text-slate-900">Academic Alignment</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Full compliance with CBSE, ICSE, and NCERT curriculum standards.
              </p>
            </div>

            <div className="bg-white border border-slate-200 p-5 rounded-2xl space-y-2 shadow-xs">
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              <h4 className="text-sm font-bold text-slate-900">Institutional Ownership</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Schools retain full ownership of generated question papers, worksheets, and logos.
              </p>
            </div>
          </div>

          {/* DETAILED CONTENT SECTIONS */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-8 text-sm text-slate-700 leading-relaxed">
            
            <section className="space-y-3">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-600" />
                1. Acceptance of Terms
              </h3>
              <p>
                By accessing or using the platform, software tools, textbooks, or laboratory equipment provided by <strong>DEVGYA GLOBAL EDUTECH PRIVATE LIMITED</strong>, schools, educators, and students agree to be bound by these Terms of Service.
              </p>
            </section>

            <section className="space-y-3 border-t border-slate-100 pt-6">
              <h3 className="text-lg font-black text-slate-900">2. Scope of Services</h3>
              <p>
                Devgya Global Edutech Private Limited acts as an end-to-end strategic educational partner for K-12 schools and study centers. Services include:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-slate-600">
                <li>Physical school infrastructure (curriculum textbooks, science lab equipment, smart hardware).</li>
                <li>Digital AI Operating System platform (NCERT Question Generator, Socratic AI Tutor, OCR Scanner, Worksheets, Memory 2.0).</li>
                <li>Custom school branding and automated ReportLab PDF generation with institution watermarks.</li>
              </ul>
            </section>

            <section className="space-y-3 border-t border-slate-100 pt-6">
              <h3 className="text-lg font-black text-slate-900">3. Authorized User Conduct & Security</h3>
              <p className="text-xs sm:text-sm text-slate-600">
                Users agree not to reverse engineer AI engine API endpoints, upload harmful malware, or misuse automated tools beyond authorized school teaching and learning activities.
              </p>
            </section>

            <section className="space-y-3 border-t border-slate-100 pt-6">
              <h3 className="text-lg font-black text-slate-900">4. Support & Contact</h3>
              <p className="text-xs text-slate-600">
                For contract or technical support inquiries:<br />
                <strong className="text-slate-900">DEVGYA GLOBAL EDUTECH PRIVATE LIMITED</strong><br />
                Phone: +91 9466966350 | Email: dgepl.info@gmail.com
              </p>
            </section>

          </div>

        </main>
      </PageTransition>
      <Footer />
    </div>
  );
}
