"use client";

import { useState } from "react";
import { Activity, DollarSign, Cpu, TrendingUp, Download } from "lucide-react";

export function AICostAnalytics() {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* HEADER BAR */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-200">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900">AI Cost & Token Consumption Analytics</h1>
            <p className="text-xs text-slate-500">Track API token usage, estimated costs per feature & monthly expenditure trends</p>
          </div>
        </div>

        <button className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-2xl transition-colors flex items-center gap-1.5">
          <Download className="w-4 h-4" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* METRIC OVERVIEW CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-bold text-slate-500">Total API Requests</span>
          <div className="text-2xl font-black text-slate-900">1,420 Requests</div>
          <span className="text-[11px] font-bold text-emerald-600">+18% this month</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-bold text-slate-500">Total Tokens Consumed</span>
          <div className="text-2xl font-black text-indigo-600">1,850,000 Tokens</div>
          <span className="text-[11px] font-bold text-indigo-600">Token optimization active</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-bold text-slate-500">Estimated Cost (USD)</span>
          <div className="text-2xl font-black text-emerald-600">$0.37 USD</div>
          <span className="text-[11px] font-bold text-slate-400">Low-cost LPU inference</span>
        </div>
      </div>

      {/* COST BREAKDOWN TABLE */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <h2 className="text-sm font-extrabold text-slate-900">Token Consumption Breakdown by Feature</h2>
        
        <div className="space-y-3">
          {[
            { feature: "Socratic AI Tutor", tokens: "620,000 Tokens", cost: "$0.12 USD", pct: "35%" },
            { feature: "Question Paper Generator", tokens: "480,000 Tokens", cost: "$0.10 USD", pct: "26%" },
            { feature: "Document RAG AI", tokens: "350,000 Tokens", cost: "$0.07 USD", pct: "19%" },
            { feature: "Lesson Planner", tokens: "250,000 Tokens", cost: "$0.05 USD", pct: "13%" },
            { feature: "Other Agents", tokens: "150,000 Tokens", cost: "$0.03 USD", pct: "7%" }
          ].map((item, idx) => (
            <div key={idx} className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-slate-900">{item.feature}</h3>
                <span className="text-[11px] text-slate-500">{item.tokens}</span>
              </div>
              <div className="text-right">
                <span className="text-xs font-extrabold text-slate-900 block">{item.cost}</span>
                <span className="text-[10px] font-bold text-indigo-600">{item.pct} of total</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
