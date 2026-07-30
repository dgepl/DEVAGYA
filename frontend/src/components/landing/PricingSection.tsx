"use client";

import { Check, Sparkles } from "lucide-react";
import Link from "next/link";

export function PricingSection() {
  const plans = [
    {
      name: "Teacher Starter",
      price: "₹0",
      period: "Forever Free Phase 1 & 2",
      description: "For individual teachers testing AI NCERT question generation.",
      features: [
        "Up to 20 Question Papers / Month",
        "NCERT Science & Math Catalog",
        "Basic OCR Scanner (5 Pages/Mo)",
        "Standard PDF Export"
      ],
      cta: "Get Started Free",
      popular: false
    },
    {
      name: "Institutional Pro",
      price: "₹4,999",
      period: "Per School / Month",
      description: "Complete platform access for up to 50 teachers with school branding.",
      features: [
        "Unlimited Question Papers",
        "Full CBSE, ICSE & State Catalogs",
        "Unlimited OCR Vision Scanning",
        "Custom Logo & Watermark PDFs",
        "Answer Key PDF Compiler",
        "OpenAI / Groq API Engine"
      ],
      cta: "Launch Institutional Trial",
      popular: true
    },
    {
      name: "Enterprise Network",
      price: "Custom",
      period: "Multi-Branch License",
      description: "For school chains & education boards requiring custom APIs.",
      features: [
        "All Institutional Pro Features",
        "Dedicated Supabase RLS Instance",
        "Super Admin Usage Analytics",
        "Phase 2 Portal Extensions",
        "24/7 Dedicated SLA Support"
      ],
      cta: "Contact Enterprise Sales",
      popular: false
    }
  ];

  return (
    <section id="pricing" className="py-24 bg-white relative border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-600 mb-3">Transparent Pricing</h2>
          <p className="text-3xl sm:text-5xl font-extrabold text-slate-900">Simple Plans for Every School</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((p, idx) => (
            <div
              key={idx}
              className={`glass-panel p-8 rounded-3xl border flex flex-col justify-between relative shadow-sm ${
                p.popular ? "border-indigo-500 shadow-glow bg-slate-50/90" : "border-slate-200"
              }`}
            >
              {p.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-600 to-cyan-600 text-white text-[11px] uppercase tracking-wider font-extrabold px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
                  <Sparkles className="w-3 h-3" /> Most Popular
                </div>
              )}

              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{p.name}</h3>
                <p className="text-xs text-slate-500 font-medium mb-6">{p.description}</p>
                <div className="mb-6">
                  <span className="text-4xl font-extrabold text-slate-900">{p.price}</span>
                  <span className="text-xs text-slate-500 font-semibold ml-2">{p.period}</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {p.features.map((feat, fidx) => (
                    <li key={fidx} className="flex items-center gap-2 text-xs text-slate-700 font-medium">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Link
                href="/dashboard"
                className={`w-full py-3.5 text-center font-bold text-xs rounded-xl transition-all ${
                  p.popular
                    ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-glow"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200"
                }`}
              >
                {p.cta}
              </Link>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
