"use client";

import { useState } from "react";
import { ChevronDown, Mail, Phone } from "lucide-react";

export function FAQSection() {
  const faqs = [
    {
      q: "How does Devgya Global ensure NCERT & CBSE compliance?",
      a: "Our AI engine is fine-tuned with exact NCERT chapter structures, marking schemes (1, 3, 5 marks), and HOTS (Higher Order Thinking Skills) guidelines as prescribed by CBSE & ICSE boards."
    },
    {
      q: "Can I upload custom textbook photos using OCR?",
      a: "Yes! Our built-in OCR Scanner processes uploaded images or PDF pages of printed workbooks and extracts clear text for immediate question paper synthesis."
    },
    {
      q: "Can we add our school's official logo and watermark to PDFs?",
      a: "Absolutely. In your Teacher/School Profile, upload your high-res logo. Our ReportLab PDF engine automatically formats the header, watermark, and styling."
    },
    {
      q: "How are future portals (Student, Parent, Management) supported?",
      a: "The underlying database schema uses multi-tenant Supabase PostgreSQL with RLS and enums for super_admin, teacher, student, parent, and management. Phase 1 & 2 deliver Teacher & Super Admin interfaces with zero structural technical debt."
    }
  ];

  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <section id="faq" className="py-24 bg-slate-50 relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-16">
          <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-600 mb-3">Frequently Asked Questions</h2>
          <p className="text-3xl font-extrabold text-slate-900">Got Questions? We Have Answers</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div key={idx} className="glass-panel rounded-2xl border border-slate-200 overflow-hidden shadow-sm transition-colors">
              <button
                onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
                className="w-full px-6 py-4 text-left font-bold text-slate-800 hover:text-indigo-600 flex items-center justify-between gap-4 text-sm"
              >
                <span>{faq.q}</span>
                <ChevronDown className={`w-4 h-4 text-indigo-600 transition-transform ${openIdx === idx ? 'rotate-180' : ''}`} />
              </button>
              {openIdx === idx && (
                <div className="px-6 pb-5 text-xs text-slate-600 leading-relaxed border-t border-slate-200 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* STILL HAVE QUESTIONS HELP CARD */}
        <div className="mt-12 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-indigo-900 via-slate-900 to-purple-950 text-white shadow-xl text-center space-y-3">
          <p className="text-xs font-black uppercase tracking-widest text-indigo-400">Direct Support Helpline</p>
          <h3 className="text-lg sm:text-xl font-black">Still Have Questions or Need Assistance?</h3>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto font-medium">
            Our educational support and onboarding team is here to assist schools, teachers, students, and parents.
          </p>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-4 text-xs font-bold">
            <a 
              href="mailto:dgepl.info@gmail.com" 
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition-all flex items-center gap-2 shadow-sm"
            >
              <Mail className="w-4 h-4 text-cyan-300" />
              <span>Email: dgepl.info@gmail.com</span>
            </a>
            <span className="px-4 py-2 rounded-xl bg-white/10 border border-white/10 text-slate-200 flex items-center gap-2">
              <Phone className="w-4 h-4 text-emerald-400" />
              <span>Phone: +91 8307224756</span>
            </span>
          </div>
        </div>

      </div>
    </section>
  );
}
