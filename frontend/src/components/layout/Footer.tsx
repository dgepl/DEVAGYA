import Link from "next/link";
import { Cpu, ShieldCheck, Sparkles } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white text-slate-600 py-16 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-12 mb-16">
          
          <div className="md:col-span-2 space-y-4">
            <Link href="/" className="inline-block">
              <img 
                src="/logo.png" 
                alt="DEVGYA GLOBAL EDUTECH PRIVATE LIMITED" 
                className="h-12 sm:h-14 w-auto max-h-14 object-contain mix-blend-multiply" 
              />
            </Link>
            <p className="text-sm text-slate-600 max-w-sm leading-relaxed font-medium">
              Empowering Schools with Smart Learning, Teacher Tools, and an All-in-One Digital Platform. Comprehensive K-12 education partner combining physical school infrastructure with cutting-edge AI learning technology.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full w-fit font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>Devgya AI Operating System Active • System Normal</span>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Platform</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/dashboard/agents" className="hover:text-indigo-600 transition-colors">15 Specialized AI Agents</Link></li>
              <li><Link href="/dashboard/knowledge" className="hover:text-indigo-600 transition-colors">RAG Knowledge Base</Link></li>
              <li><Link href="/dashboard/workflows" className="hover:text-indigo-600 transition-colors">AI Workflows</Link></li>
              <li><Link href="/dashboard/student" className="hover:text-indigo-600 transition-colors">Student Self-Study Corner</Link></li>
              <li><Link href="/dashboard/parent" className="hover:text-indigo-600 transition-colors">Parenting Guidance</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Stakeholders</h4>
            <ul className="space-y-2.5 text-sm">
              <li><span className="text-indigo-600 font-semibold">Teachers & Educators</span></li>
              <li><span className="text-indigo-600 font-semibold">School Management</span></li>
              <li><span className="text-indigo-600 font-semibold">Students & Gamified Learning</span></li>
              <li><span className="text-indigo-600 font-semibold">Parents & Screen Time</span></li>
              <li><span className="text-indigo-600 font-semibold">Study Centers</span></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Security & Tech</h4>
            <ul className="space-y-2.5 text-sm">
              <li><span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-indigo-600" /> Certified Safety & Security</span></li>
              <li><span className="flex items-center gap-1.5"><Sparkles className="w-4 h-4 text-cyan-600" /> Multi-Model AI Engine</span></li>
              <li><span>Python FastAPI Engine</span></li>
              <li><span>Next.js 15 App Router</span></li>
              <li><span>Textbooks & Lab Hardware</span></li>
            </ul>
          </div>

        </div>

        <div className="border-t border-slate-200 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="space-y-1">
            <p>© 2026 Devgya Global Edutech Private Limited. All rights reserved.</p>
            <p className="text-[11px] font-extrabold text-indigo-600">Designed and Developed by pratikk yadav +91 8307224756</p>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/privacy-policy" className="hover:text-slate-900 transition-colors">Privacy Policy</Link>
            <Link href="/terms-of-service" className="hover:text-slate-900 transition-colors">Terms of Service</Link>
            <Link href="/safety-standards" className="hover:text-slate-900 transition-colors">Quality & Safety Standards</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
