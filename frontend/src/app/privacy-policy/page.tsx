import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PageTransition } from "@/components/ui/PageTransition";
import { ShieldCheck, Lock, EyeOff, Database, FileCheck } from "lucide-react";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col pt-24 md:pt-28">
      <Navbar />
      <PageTransition>
        <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
          
          {/* HEADER */}
          <div className="text-center space-y-3 border-b border-slate-200 pb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-extrabold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              <span>DEVGYA GLOBAL Privacy Policy</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Privacy Policy & Data Security
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-semibold max-w-2xl mx-auto">
              Effective Date: July 2026 • DEVGYA GLOBAL EDUTECH PRIVATE LIMITED
            </p>
          </div>

          {/* HIGHLIGHT BOXES */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white border border-slate-200 p-5 rounded-2xl space-y-2 shadow-xs">
              <Lock className="w-6 h-6 text-indigo-600" />
              <h4 className="text-sm font-bold text-slate-900">Zero Data Selling</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                We never monetize, sell, or advertise against student or school data.
              </p>
            </div>

            <div className="bg-white border border-slate-200 p-5 rounded-2xl space-y-2 shadow-xs">
              <Database className="w-6 h-6 text-purple-600" />
              <h4 className="text-sm font-bold text-slate-900">Isolated Vector RAG</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Textbooks & school documents are encrypted in multi-tenant isolated vector stores.
              </p>
            </div>

            <div className="bg-white border border-slate-200 p-5 rounded-2xl space-y-2 shadow-xs">
              <EyeOff className="w-6 h-6 text-pink-600" />
              <h4 className="text-sm font-bold text-slate-900">Encrypted AI Pipeline</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                FastAPI & Supabase TLS 1.3 encryption for all question paper and quiz generations.
              </p>
            </div>
          </div>

          {/* DETAILED CONTENT SECTIONS */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-8 text-sm text-slate-700 leading-relaxed">
            
            <section className="space-y-3">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-indigo-600" />
                1. Overview & Commitment
              </h3>
              <p>
                At <strong>DEVGYA GLOBAL EDUTECH PRIVATE LIMITED</strong>, we prioritize the protection of educational data. 
                Whether you are a teacher creating CBSE NCERT question papers, a student using the Socratic AI Tutor, or a parent monitoring academic progress, your information is handled under strict security standards.
              </p>
            </section>

            <section className="space-y-3 border-t border-slate-100 pt-6">
              <h3 className="text-lg font-black text-slate-900">2. Data We Collect & How It Is Used</h3>
              <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm text-slate-600">
                <li><strong>Account Credentials:</strong> Full name, institutional email address, school affiliation, and education board (CBSE, ICSE, State Board, IB).</li>
                <li><strong>Academic Content:</strong> NCERT textbook chapters, scanned worksheets, generated quizzes, active recall flashcards, and student XP progress.</li>
                <li><strong>RAG Knowledge Documents:</strong> Uploaded school PDFs, DOCX, and PPTX files processed via embedding algorithms solely to power internal school search.</li>
              </ul>
            </section>

            <section className="space-y-3 border-t border-slate-100 pt-6">
              <h3 className="text-lg font-black text-slate-900">3. AI Model & Data Privacy Integrity</h3>
              <p>
                Prompts sent to our AI Operating System tools (such as Question Generator, Socratic Tutor, and Worksheet Creator) are executed through secure, enterprise OpenAI-compatible API pipelines. <strong>Your inputs are never used to train public LLM models.</strong>
              </p>
            </section>

            <section className="space-y-3 border-t border-slate-100 pt-6">
              <h3 className="text-lg font-black text-slate-900">4. Contact Data Protection Officer</h3>
              <p className="text-xs text-slate-600">
                For privacy inquiries or data removal requests, contact DEVGYA GLOBAL EDUTECH PRIVATE LIMITED at:<br />
                <strong className="text-slate-900">Email:</strong> privacy@devgyaglobal.com | <strong className="text-slate-900">Phone:</strong> +91 8307224756
              </p>
            </section>

          </div>

        </main>
      </PageTransition>
      <Footer />
    </div>
  );
}
