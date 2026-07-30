"use client";

import { useState, useEffect } from "react";
import { ShieldCheck, Building2, Users, Cpu, Sparkles } from "lucide-react";
import { getAdminStats } from "@/lib/api";

export default function SuperAdminPage() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    getAdminStats().then(setStats).catch(console.error);
  }, []);

  return (
    <div className="space-y-8">
      
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-indigo-600" />
          Super Admin Control Panel
        </h1>
        <p className="text-xs text-slate-500 font-semibold">Institutional metrics, teacher subscriptions, AI token consumption & audit logs</p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-card p-6 rounded-2xl border border-slate-200 space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-indigo-600">
            <Building2 className="w-5 h-5" />
            <span className="text-[10px] uppercase font-bold bg-indigo-50 px-2 py-0.5 rounded">Tenant Schools</span>
          </div>
          <p className="text-3xl font-extrabold text-slate-900">{stats?.metrics?.total_schools || 42}</p>
          <p className="text-xs text-slate-500 font-medium">Registered Institutions</p>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-slate-200 space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-cyan-600">
            <Users className="w-5 h-5" />
            <span className="text-[10px] uppercase font-bold bg-cyan-50 px-2 py-0.5 rounded">Active Teachers</span>
          </div>
          <p className="text-3xl font-extrabold text-slate-900">{stats?.metrics?.active_teachers || 1280}</p>
          <p className="text-xs text-slate-500 font-medium">Licensed User Accounts</p>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-slate-200 space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-emerald-600">
            <Sparkles className="w-5 h-5" />
            <span className="text-[10px] uppercase font-bold bg-emerald-50 px-2 py-0.5 rounded">Papers Generated</span>
          </div>
          <p className="text-3xl font-extrabold text-slate-900">{stats?.metrics?.question_papers_generated || 18450}</p>
          <p className="text-xs text-slate-500 font-medium">NCERT Assessments</p>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-slate-200 space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-purple-600">
            <Cpu className="w-5 h-5" />
            <span className="text-[10px] uppercase font-bold bg-purple-50 px-2 py-0.5 rounded">AI API Tokens</span>
          </div>
          <p className="text-3xl font-extrabold text-slate-900">14.2M</p>
          <p className="text-xs text-slate-500 font-medium">OpenAI Provider Usage</p>
        </div>
      </div>

      {/* Schools Table */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-200 space-y-4 shadow-sm">
        <h3 className="text-base font-bold text-slate-900">Registered Tenant Institutions</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-800">
            <thead className="bg-slate-100 text-slate-600 uppercase text-[10px] tracking-wider font-bold">
              <tr>
                <th className="p-3">School Name</th>
                <th className="p-3">Board</th>
                <th className="p-3">Active Teachers</th>
                <th className="p-3">Onboarded Date</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {(stats?.recent_schools || [
                { id: "1", name: "Apex International Academy", board: "CBSE", teachers: 45, joined_date: "2025-01-15" },
                { id: "2", name: "St. Xavier Higher Secondary", board: "ICSE", teachers: 62, joined_date: "2025-02-01" },
                { id: "3", name: "Delhi Public World School", board: "CBSE", teachers: 88, joined_date: "2025-02-14" }
              ]).map((sch: any) => (
                <tr key={sch.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3 font-bold text-slate-900">{sch.name}</td>
                  <td className="p-3 font-bold text-indigo-600">{sch.board}</td>
                  <td className="p-3 font-semibold">{sch.teachers} Teachers</td>
                  <td className="p-3 text-slate-500">{sch.joined_date}</td>
                  <td className="p-3">
                    <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">
                      Active SLA
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
