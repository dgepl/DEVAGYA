"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { 
  Sparkles, 
  ArrowLeft, 
  Search, 
  Bell, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  Sliders, 
  FileText, 
  GraduationCap, 
  Trophy, 
  BookOpen, 
  Headphones, 
  Briefcase, 
  Brain, 
  Target, 
  HeartHandshake, 
  Compass, 
  Video, 
  Layers, 
  ChevronRight, 
  MessageSquarePlus,
  Rocket
} from "lucide-react";
import { useToolConfigStore, ToolItem, isToolEnabled } from "@/store/useToolConfigStore";
import { useAppStore } from "@/store/useAppStore";
import { CURATED_COMING_SOON_DATA, ComingSoonContent } from "@/components/common/FeatureComingSoon";

// Icon mapping helper
const ICON_MAP: Record<string, any> = {
  Sliders,
  Sparkles,
  FileText,
  GraduationCap,
  Trophy,
  BookOpen,
  Headphones,
  Briefcase,
  Brain,
  Target,
  Clock,
  HeartHandshake,
  Search,
  Compass,
  Video,
  Layers,
  Rocket
};

export default function ComingSoonHubPage() {
  const { tools } = useToolConfigStore();
  const { user } = useAppStore();
  
  const [selectedRole, setSelectedRole] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [notifiedFeatures, setNotifiedFeatures] = useState<Record<string, boolean>>({});

  // Filter ONLY tools that are disabled (coming soon) by the admin panel
  const disabledTools = useMemo(() => {
    return tools.filter((tool) => !isToolEnabled(tool.is_enabled));
  }, [tools]);

  // Filter by role and search
  const filteredDisabledTools = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return disabledTools.filter((tool) => {
      // Role filter
      if (selectedRole !== "all" && tool.role !== selectedRole && tool.role !== "all") {
        return false;
      }
      // Search filter
      if (!q) return true;
      const curated = CURATED_COMING_SOON_DATA[tool.id];
      return (
        tool.name.toLowerCase().includes(q) ||
        tool.description.toLowerCase().includes(q) ||
        tool.category.toLowerCase().includes(q) ||
        (curated?.tagline && curated.tagline.toLowerCase().includes(q))
      );
    });
  }, [disabledTools, selectedRole, searchQuery]);

  const handleNotifyToggle = (toolId: string) => {
    setNotifiedFeatures((prev) => ({
      ...prev,
      [toolId]: !prev[toolId]
    }));
  };

  return (
    <div className="space-y-6 pb-20 max-w-6xl mx-auto px-1 sm:px-2 animate-in fade-in duration-300">
      
      {/* 1. HERO BANNER: INNOVATION ROADMAP & COMING SOON */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-[#172554] text-white border border-indigo-900/60 shadow-xl space-y-4">
        {/* Glow Accents */}
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-[11px] font-extrabold uppercase tracking-wider text-indigo-200">
              <Sparkles className="w-3.5 h-3.5 text-indigo-300 animate-pulse" />
              <span>DEVGYA Innovation Roadmap</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-tight">
              Upcoming AI Features & Enhancements
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
              Explore upcoming CBSE & NCERT AI pedagogical tools currently being fine-tuned for release. These features are scheduled for deployment soon.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/dashboard/suggestions"
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl border border-white/20 transition-all flex items-center gap-2 shadow-xs cursor-pointer active:scale-95"
            >
              <MessageSquarePlus className="w-4 h-4 text-amber-300" />
              <span>Suggest a Capability</span>
            </Link>
          </div>
        </div>

        {/* STATS STRIP */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-white/10 relative z-10 text-xs">
          <div className="bg-white/5 rounded-2xl p-3 border border-white/5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">In Development</p>
            <p className="text-xl font-black text-amber-300">{disabledTools.length}</p>
          </div>
          <div className="bg-white/5 rounded-2xl p-3 border border-white/5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total AI Suite</p>
            <p className="text-xl font-black text-indigo-200">{tools.length}</p>
          </div>
          <div className="bg-white/5 rounded-2xl p-3 border border-white/5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Currently Active</p>
            <p className="text-xl font-black text-emerald-400">{tools.length - disabledTools.length}</p>
          </div>
          <div className="bg-white/5 rounded-2xl p-3 border border-white/5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Compliance</p>
            <p className="text-xl font-black text-cyan-300">CBSE / NEP 2020</p>
          </div>
        </div>
      </div>

      {/* 2. SEARCH & ROLE FILTERS */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
          {/* SEARCH BAR */}
          <div className="flex items-center gap-2.5 flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus-within:border-indigo-500 focus-within:bg-white transition-all">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search upcoming tools, topics, capabilities..."
              className="w-full bg-transparent outline-none text-xs font-semibold text-slate-800 placeholder:text-slate-400"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="text-[10px] font-bold text-slate-400 hover:text-slate-600 uppercase"
              >
                Clear
              </button>
            )}
          </div>

          {/* ROLE FILTER TABS */}
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-none pb-1 sm:pb-0">
            {[
              { id: "all", label: "All Upcoming" },
              { id: "teacher", label: "Teacher Tools" },
              { id: "student", label: "Student Tools" },
              { id: "parent", label: "Parent Tools" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedRole(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  selectedRole === tab.id
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-600"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. COMING SOON CARDS GRID */}
      {filteredDisabledTools.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 border border-slate-200 shadow-xs text-center space-y-4 max-w-xl mx-auto my-8">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-black text-slate-900">
              {disabledTools.length === 0
                ? "All AI Features Are Currently Live! 🎉"
                : "No matching upcoming features found"}
            </h3>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              {disabledTools.length === 0
                ? "Every feature in the DEVGYA suite is active and accessible right now in your workspace."
                : "Try adjusting your search terms or selecting a different category filter above."}
            </p>
          </div>
          <div className="pt-2 flex items-center justify-center gap-3">
            <Link
              href="/dashboard"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
            >
              Return to Workspace
            </Link>
            <Link
              href="/dashboard/suggestions"
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors"
            >
              Request a New Feature
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {filteredDisabledTools.map((tool) => {
            const curated: ComingSoonContent | undefined = CURATED_COMING_SOON_DATA[tool.id];
            const IconComp = ICON_MAP[tool.icon_name] || Sparkles;
            const isNotified = Boolean(notifiedFeatures[tool.id]);

            const title = curated?.title || tool.name;
            const tagline = curated?.tagline;
            const description = curated?.description || tool.description;
            const benefits = curated?.benefits || [];
            const badge = curated?.badge || tool.badge || "IN ACTIVE ENHANCEMENT";
            const gradient = curated?.gradient || tool.color || "from-indigo-600 to-purple-600";

            return (
              <div
                key={tool.id}
                className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all overflow-hidden flex flex-col justify-between group"
              >
                {/* CARD HEADER */}
                <div className="p-6 space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3.5">
                      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${gradient} text-white flex items-center justify-center shadow-md shrink-0 group-hover:scale-105 transition-transform`}>
                        <IconComp className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-1.5 mb-1">
                          <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                            tool.role === "teacher" ? "bg-indigo-100 text-indigo-700" :
                            tool.role === "student" ? "bg-purple-100 text-purple-700" :
                            tool.role === "parent" ? "bg-rose-100 text-rose-700" : "bg-slate-100 text-slate-700"
                          }`}>
                            {tool.role} • {tool.category}
                          </span>
                          <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-amber-600" />
                            {badge}
                          </span>
                        </div>
                        <h3 className="text-base sm:text-lg font-black text-slate-900 group-hover:text-indigo-600 transition-colors">
                          {title}
                        </h3>
                      </div>
                    </div>
                  </div>

                  {tagline && (
                    <p className="text-xs font-extrabold text-indigo-600 bg-indigo-50/70 border border-indigo-100/80 px-3 py-1.5 rounded-xl">
                      {tagline}
                    </p>
                  )}

                  <p className="text-xs text-slate-600 leading-relaxed font-medium">
                    {description}
                  </p>

                  {/* KEY CAPABILITIES */}
                  {benefits.length > 0 && (
                    <div className="pt-2 border-t border-slate-100 space-y-2">
                      <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                        {curated?.sectionHeading || "Planned Capabilities:"}
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                        {benefits.slice(0, 6).map((b, bIdx) => (
                          <div
                            key={bIdx}
                            className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-100 text-[11px] font-semibold text-slate-700"
                          >
                            <span className="text-sm shrink-0">{b.emoji}</span>
                            <span className="truncate">{b.text}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* CARD FOOTER WITH INTERACTIVE ACTIONS */}
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => handleNotifyToggle(tool.id)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 ${
                      isNotified
                        ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                        : "bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-2xs"
                    }`}
                  >
                    {isNotified ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>We will alert you!</span>
                      </>
                    ) : (
                      <>
                        <Bell className="w-3.5 h-3.5 text-slate-500" />
                        <span>Notify Me on Launch</span>
                      </>
                    )}
                  </button>

                  <Link
                    href={`/dashboard/suggestions?feature=${encodeURIComponent(tool.name)}`}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors group/link"
                  >
                    <span>Suggest an Idea</span>
                    <ChevronRight className="w-3.5 h-3.5 group-hover/link:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 4. BOTTOM HELP CALLOUT */}
      <div className="p-5 rounded-2xl bg-indigo-50/70 border border-indigo-100 text-center space-y-2">
        <p className="text-xs text-indigo-900 font-bold">
          Want a specific curriculum tool or feature prioritized for your school?
        </p>
        <p className="text-[11px] text-slate-500 font-medium">
          Send us direct feedback or curriculum requirements. Our pedagogical engineering team releases updates weekly.
        </p>
        <div className="pt-1">
          <Link
            href="/dashboard/suggestions"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
          >
            <MessageSquarePlus className="w-3.5 h-3.5" />
            <span>Open Suggestions & Feedback Portal</span>
          </Link>
        </div>
      </div>

    </div>
  );
}
