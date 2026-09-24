"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { 
  Building2, 
  Users, 
  Briefcase, 
  Plus, 
  FileText, 
  ChevronRight, 
  Sparkles,
  ArrowRight,
  UserCheck,
  Clock,
  Search,
  SlidersHorizontal,
  X,
  CheckCircle2,
  Mail,
  ExternalLink,
  Target,
  Compass
} from "lucide-react";

interface SchoolData {
  id: string;
  school_name: string;
  email: string;
  phone: string;
  affiliation_board: string;
  city: string;
  state: string;
  contact_person: string;
  address: string;
  logo_url: string;
  verification_status: "pending_verification" | "verified" | "rejected";
  verification_notes?: string;
  created_at: string;
}

interface Vacancy {
  id: string;
  title: string;
  subject: string;
  level: string;
  board: string;
  salary_range: string;
  openings: number;
  status: "active" | "closed" | "paused";
  applicant_count: number;
  created_at: string;
}

interface JobApplication {
  id: string;
  vacancy_id: string;
  job_title: string;
  job_subject: string;
  teacher_name: string;
  experience: string;
  status: "submitted" | "shortlisted" | "interview" | "selected" | "rejected";
  created_at: string;
}

interface MobileSchoolDashboardProps {
  school: SchoolData | null;
  vacancies: Vacancy[];
  applications: JobApplication[];
}

export function MobileSchoolDashboard({
  school,
  vacancies,
  applications
}: MobileSchoolDashboardProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const activeVacancies = vacancies.filter(v => v.status === "active");
  const totalOpenings = activeVacancies.reduce((acc, v) => acc + (v.openings || 1), 0);
  const totalApplicants = applications.length;
  const inReviewCount = applications.filter(a => a.status === "shortlisted" || a.status === "interview").length;
  const hiredCount = applications.filter(a => a.status === "selected").length;

  const schoolTools = [
    { name: "Job Vacancies", sub: "Manage active openings", href: "/dashboard/school/vacancies", icon: Building2, color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-100" },
    { name: "Applicants & CVs", sub: "Review teacher resumes", href: "/dashboard/school/applicants", icon: Users, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100" },
    { name: "Post Vacancy", sub: "TGT, PGT, PRT hiring", href: "/dashboard/school/vacancies?action=new", icon: Plus, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" },
    { name: "School Profile", sub: "CBSE affiliation & details", href: "/dashboard/school/profile", icon: FileText, color: "text-indigo-600", bg: "bg-indigo-50", border: "border-indigo-100" },
  ];

  // Dynamic search matching
  const matchingTools = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    return schoolTools.filter(t => 
      t.name.toLowerCase().includes(q) || 
      t.sub.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const matchingVacancies = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    return vacancies.filter(v => 
      (v.title || "").toLowerCase().includes(q) ||
      (v.subject || "").toLowerCase().includes(q) ||
      (v.level || "").toLowerCase().includes(q) ||
      (v.board || "").toLowerCase().includes(q)
    );
  }, [searchQuery, vacancies]);

  const matchingApplications = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    return applications.filter(a => 
      (a.teacher_name || "").toLowerCase().includes(q) ||
      (a.job_title || "").toLowerCase().includes(q) ||
      (a.job_subject || "").toLowerCase().includes(q) ||
      (a.status || "").toLowerCase().includes(q)
    );
  }, [searchQuery, applications]);

  const hasSearch = searchQuery.trim().length > 0;
  const totalResults = matchingTools.length + matchingVacancies.length + matchingApplications.length;

  return (
    <div className="space-y-5 pb-24 animate-in fade-in duration-300 md:hidden px-1">
      
      {/* 1. HERO BANNER: MIRRORS TEACHER OS WITH DARK INDIGO GRADIENT & 3D ASSET */}
      <div className="bg-gradient-to-br from-[#1b1c54] via-[#2a1b6d] to-[#12163b] text-white p-5 rounded-[28px] shadow-xl border border-indigo-700/40 relative overflow-hidden space-y-3">
        {/* Decorative background glow */}
        <div className="absolute -top-10 -right-10 w-44 h-44 bg-purple-500/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-44 h-44 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />

        {/* Top Badges */}
        <div className="flex items-center justify-between relative z-10">
          <span className="text-[10px] font-extrabold uppercase tracking-wider bg-white/15 px-3 py-1 rounded-full text-indigo-100 border border-white/10 backdrop-blur-md flex items-center gap-1.5">
            <Building2 className="w-3 h-3 text-indigo-300" />
            <span>SCHOOL OS HUB</span>
          </span>
          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/20 border border-emerald-400/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Live Portal
          </span>
        </div>

        {/* Headline & 3D Illustration Row */}
        <div className="flex items-center justify-between gap-2 relative z-10 pt-1">
          <div className="space-y-1 max-w-[64%]">
            <h1 className="text-xl font-black tracking-tight leading-tight">
              Welcome back,<br />
              <span className="text-white font-extrabold line-clamp-1">
                {school?.school_name || "School Portal"}! 🏫
              </span>
            </h1>
            <p className="text-[11px] text-slate-300 font-medium leading-tight">
              CBSE & State Board Verified Hiring & Campus OS
            </p>
          </div>

          {/* 3D Graduation Cap & Book Asset */}
          <div className="relative shrink-0 w-22 h-22 flex items-center justify-center">
            <img 
              src="/images/school_hero_cap.png" 
              alt="School Portal" 
              className="w-20 h-20 object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.35)] select-none pointer-events-none"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 pt-1 relative z-10">
          <Link
            href="/dashboard/school/vacancies?action=new"
            className="px-4 py-2.5 bg-white text-indigo-900 font-extrabold text-xs rounded-2xl shadow-lg flex items-center gap-2 active:scale-95 transition-all hover:bg-slate-50 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-purple-600 stroke-[2.5]" />
            <span>Post Vacancy</span>
          </Link>
          
          <Link
            href="/dashboard/school/applicants"
            className="p-2.5 bg-white/15 hover:bg-white/25 text-white rounded-2xl border border-white/20 transition-all flex items-center justify-center active:scale-95 cursor-pointer"
            title="Review Teacher Applications"
          >
            <Users className="w-5 h-5 text-indigo-200" />
          </Link>

          <Link
            href="/dashboard/school/vacancies"
            className="p-2.5 bg-white/15 hover:bg-white/25 text-white rounded-2xl border border-white/20 transition-all flex items-center justify-center active:scale-95 cursor-pointer"
            title="Manage Openings"
          >
            <Briefcase className="w-5 h-5 text-indigo-200" />
          </Link>
        </div>
      </div>

      {/* 2. REAL-TIME SEARCH BAR WITH CLEAR & FILTER BUTTON */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs px-4 py-3 flex items-center justify-between gap-2.5 transition-all focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100">
        <div className="flex items-center gap-2.5 flex-1 text-slate-400 text-xs">
          <Search className="w-4 h-4 text-indigo-600 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search vacancies, applicants, subjects (e.g. Maths, TGT)..."
            className="w-full bg-transparent outline-none text-slate-900 placeholder:text-slate-400 text-xs font-semibold"
          />
        </div>
        {hasSearch ? (
          <button
            type="button"
            onClick={() => setSearchQuery("")}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        ) : (
          <button 
            type="button" 
            className="p-1.5 text-slate-400 hover:text-slate-700 transition-colors"
            aria-label="Filter"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* 3. DYNAMIC SEARCH RESULTS (WHEN SEARCH QUERY IS ACTIVE) */}
      {hasSearch && (
        <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-black uppercase tracking-wider text-indigo-700">
              Search Results ({totalResults})
            </h2>
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="text-[11px] font-bold text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              Clear
            </button>
          </div>

          {totalResults === 0 ? (
            <div className="p-8 bg-white rounded-3xl border border-slate-200/80 text-center space-y-2">
              <Search className="w-8 h-8 text-slate-300 mx-auto" />
              <h3 className="text-xs font-bold text-slate-700">No matching vacancies or applicants found</h3>
              <p className="text-[11px] text-slate-400">Try searching for "Science", "Maths", "TGT", "PGT", or applicant name</p>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Matching Tools */}
              {matchingTools.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider px-1">
                    Matching Features ({matchingTools.length})
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {matchingTools.map((tool, idx) => {
                      const IconComp = tool.icon;
                      return (
                        <Link
                          key={idx}
                          href={tool.href}
                          className="p-3 bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:border-indigo-300 hover:shadow-md transition-all space-y-2"
                        >
                          <div className={`w-9 h-9 rounded-xl ${tool.bg} ${tool.border} border flex items-center justify-center ${tool.color}`}>
                            <IconComp className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="text-xs font-black text-slate-900 leading-tight">{tool.name}</h3>
                            <p className="text-[10px] text-slate-400 font-bold mt-0.5 leading-tight">{tool.sub}</p>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Matching Vacancies */}
              {matchingVacancies.length > 0 && (
                <div className="space-y-2 pt-2">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider px-1">
                    Matching Vacancies ({matchingVacancies.length})
                  </span>
                  <div className="space-y-2">
                    {matchingVacancies.map((v, idx) => (
                      <Link
                        key={idx}
                        href="/dashboard/school/vacancies"
                        className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between gap-2"
                      >
                        <div className="space-y-0.5 min-w-0 pr-2">
                          <h3 className="text-xs font-black text-slate-900 truncate">{v.title}</h3>
                          <p className="text-[10px] text-slate-400 font-bold">
                            {v.level} • {v.subject} • {v.openings} Openings
                          </p>
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold shrink-0">
                          {v.status === "active" ? "Open" : v.status}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Matching Applicants */}
              {matchingApplications.length > 0 && (
                <div className="space-y-2 pt-2">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider px-1">
                    Matching Candidates ({matchingApplications.length})
                  </span>
                  <div className="space-y-2">
                    {matchingApplications.map((a, idx) => (
                      <Link
                        key={idx}
                        href="/dashboard/school/applicants"
                        className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between gap-2"
                      >
                        <div className="space-y-0.5 min-w-0 pr-2">
                          <h3 className="text-xs font-black text-slate-900 truncate">{a.teacher_name}</h3>
                          <p className="text-[10px] text-slate-400 font-bold">
                            Applied for {a.job_title} ({a.experience || "Fresh"})
                          </p>
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold shrink-0 capitalize">
                          {a.status}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* DEFAULT SECTIONS (WHEN NOT SEARCHING) */}
      {!hasSearch && (
        <>
          {/* 4. KPI STATS OVERVIEW (MATCHING QUICK STATS GRID) */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                RECRUITMENT OVERVIEW
              </h2>
              <Link 
                href="/dashboard/school/applicants"
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors"
              >
                <span>View Details</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {/* Card 1: Active Jobs */}
              <Link
                href="/dashboard/school/vacancies"
                className="bg-white rounded-2xl p-3.5 border border-slate-100 shadow-xs hover:shadow-md transition-all group block"
              >
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="text-2xl font-black text-slate-900 leading-none mb-1">
                  {activeVacancies.length}
                </div>
                <div className="text-xs font-bold text-slate-800 leading-tight">Active Jobs</div>
                <div className="text-[10px] font-semibold text-slate-400 mt-0.5">({totalOpenings} Seats)</div>
              </Link>

              {/* Card 2: Applications Received */}
              <Link
                href="/dashboard/school/applicants"
                className="bg-white rounded-2xl p-3.5 border border-slate-100 shadow-xs hover:shadow-md transition-all group block"
              >
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                  <Users className="w-4 h-4" />
                </div>
                <div className="text-2xl font-black text-slate-900 leading-none mb-1">
                  {totalApplicants}
                </div>
                <div className="text-xs font-bold text-slate-800 leading-tight">Applications Received</div>
                <div className="text-[10px] font-semibold text-slate-400 mt-0.5">Candidates</div>
              </Link>

              {/* Card 3: In Review / Interview */}
              <Link
                href="/dashboard/school/applicants?status=shortlisted"
                className="bg-white rounded-2xl p-3.5 border border-slate-100 shadow-xs hover:shadow-md transition-all group block"
              >
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                  <Clock className="w-4 h-4" />
                </div>
                <div className="text-2xl font-black text-slate-900 leading-none mb-1">
                  {inReviewCount}
                </div>
                <div className="text-xs font-bold text-slate-800 leading-tight">In Review / Interview</div>
                <div className="text-[10px] font-semibold text-slate-400 mt-0.5">Shortlisted</div>
              </Link>

              {/* Card 4: Hired / Selected */}
              <Link
                href="/dashboard/school/applicants?status=selected"
                className="bg-white rounded-2xl p-3.5 border border-slate-100 shadow-xs hover:shadow-md transition-all group block"
              >
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div className="text-2xl font-black text-slate-900 leading-none mb-1">
                  {hiredCount}
                </div>
                <div className="text-xs font-bold text-slate-800 leading-tight">Hired / Selected</div>
                <div className="text-[10px] font-semibold text-slate-400 mt-0.5">Finalized</div>
              </Link>
            </div>
          </div>

          {/* 5. SCHOOL CORE TOOLS / QUICK NAVIGATION (4 SQUARES IN 2 LINES ON MOBILE) */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                SCHOOL CORE TOOLS
              </h2>
              <Link 
                href="/dashboard/school/vacancies" 
                className="text-xs font-extrabold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer active:scale-95 transition-transform"
              >
                <span>View All Openings</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {/* 1. Job Vacancies */}
              <Link
                href="/dashboard/school/vacancies"
                className="p-4 bg-white rounded-3xl border border-slate-100 shadow-xs hover:border-indigo-200 hover:shadow-md flex flex-col justify-between gap-3 group active:scale-95 transition-all aspect-[1.12/1]"
              >
                <div className="flex items-center justify-between w-full">
                  <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div className="w-6 h-6 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-indigo-600 group-hover:bg-indigo-50 transition-colors">
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xs font-black text-slate-900 leading-tight">Job Vacancies</h3>
                  <p className="text-[10px] text-slate-400 font-medium truncate mt-0.5">Manage open positions</p>
                </div>
              </Link>

              {/* 2. Applicants & CVs */}
              <Link
                href="/dashboard/school/applicants"
                className="p-4 bg-white rounded-3xl border border-slate-100 shadow-xs hover:border-indigo-200 hover:shadow-md flex flex-col justify-between gap-3 group active:scale-95 transition-all aspect-[1.12/1]"
              >
                <div className="flex items-center justify-between w-full">
                  <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Users className="w-5 h-5" />
                  </div>
                  <div className="w-6 h-6 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-indigo-600 group-hover:bg-indigo-50 transition-colors">
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xs font-black text-slate-900 leading-tight">Applicants & CVs</h3>
                  <p className="text-[10px] text-slate-400 font-medium truncate mt-0.5">Review PDF resumes</p>
                </div>
              </Link>

              {/* 3. + Post Vacancy */}
              <Link
                href="/dashboard/school/vacancies?action=new"
                className="p-4 bg-white rounded-3xl border border-slate-100 shadow-xs hover:border-indigo-200 hover:shadow-md flex flex-col justify-between gap-3 group active:scale-95 transition-all aspect-[1.12/1]"
              >
                <div className="flex items-center justify-between w-full">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Plus className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <div className="w-6 h-6 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-indigo-600 group-hover:bg-indigo-50 transition-colors">
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xs font-black text-slate-900 leading-tight">+ Post Vacancy</h3>
                  <p className="text-[10px] text-slate-400 font-medium truncate mt-0.5">TGT, PGT, PRT roles</p>
                </div>
              </Link>

              {/* 4. School Profile */}
              <Link
                href="/dashboard/school/profile"
                className="p-4 bg-white rounded-3xl border border-slate-100 shadow-xs hover:border-indigo-200 hover:shadow-md flex flex-col justify-between gap-3 group active:scale-95 transition-all aspect-[1.12/1]"
              >
                <div className="flex items-center justify-between w-full">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="w-6 h-6 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-indigo-600 group-hover:bg-indigo-50 transition-colors">
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xs font-black text-slate-900 leading-tight">School Profile</h3>
                  <p className="text-[10px] text-slate-400 font-medium truncate mt-0.5">Credentials & Board</p>
                </div>
              </Link>

              {/* 5. Stream Assessment AI */}
              <Link
                href="/dashboard/school/stream-assessment"
                className="p-4 bg-gradient-to-br from-indigo-50/70 to-purple-50/70 rounded-3xl border border-indigo-100 shadow-xs hover:border-indigo-200 hover:shadow-md flex flex-col justify-between gap-3 group active:scale-95 transition-all aspect-[1.12/1] col-span-2"
              >
                <div className="flex items-center justify-between w-full">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center group-hover:scale-105 transition-transform shadow-xs">
                    <Compass className="w-5 h-5" />
                  </div>
                  <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-slate-400 group-hover:text-indigo-600 transition-colors">
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div>
                  <span className="text-[9px] font-black uppercase text-indigo-700 bg-indigo-100 px-1.5 py-0.5 rounded">Class 11-12</span>
                  <h3 className="text-xs font-black text-slate-900 leading-tight mt-1">Stream Assessment AI</h3>
                  <p className="text-[10px] text-slate-500 font-medium truncate mt-0.5">Generate paper & download PDF</p>
                </div>
              </Link>
            </div>
          </div>

          {/* 6. ACTIVE TEACHING OPENINGS LIST */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                ACTIVE TEACHING OPENINGS ({activeVacancies.length})
              </h2>
              <Link 
                href="/dashboard/school/vacancies?action=new" 
                className="text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-0.5 rounded-full flex items-center gap-1 transition-colors cursor-pointer"
              >
                Post New +
              </Link>
            </div>

            {vacancies.length === 0 ? (
              <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-xs text-center space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                  <Briefcase className="w-6 h-6" />
                </div>
                <h3 className="text-xs font-bold text-slate-800">No active vacancies posted yet</h3>
                <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                  Post your teaching requirements (TGT, PGT, PRT) to start receiving qualified teacher applications.
                </p>
                <Link
                  href="/dashboard/school/vacancies?action=new"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all active:scale-95 mt-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Post Vacancy</span>
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {vacancies.slice(0, 4).map((v) => (
                  <Link
                    key={v.id}
                    href="/dashboard/school/vacancies"
                    className="p-3.5 bg-white rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between gap-2 hover:border-indigo-200 transition-all active:scale-98"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                        <Briefcase className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-xs font-black text-slate-900 truncate leading-tight">
                          {v.title}
                        </h3>
                        <p className="text-[10px] text-slate-400 font-bold mt-0.5">
                          {v.level} • {v.subject} • {v.openings} Openings
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[9.5px] font-bold">
                        {v.status === "active" ? "Open" : v.status}
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* 7. DEDICATED SCHOOL PARTNER SUPPORT */}
          <div className="p-4 rounded-3xl bg-gradient-to-r from-indigo-50/80 via-white to-purple-50/80 border border-indigo-100 flex items-center justify-between gap-3 text-xs shadow-xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Mail className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="font-extrabold text-slate-900 truncate">Dedicated School Support</p>
                <p className="text-[10px] text-slate-500 truncate">Recruitment & candidate assistance</p>
              </div>
            </div>
            <a 
              href="mailto:dgepl.info@gmail.com"
              className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px] shrink-0 transition-colors shadow-xs flex items-center gap-1 active:scale-95"
            >
              <Mail className="w-3 h-3" />
              <span>Contact</span>
            </a>
          </div>
        </>
      )}

    </div>
  );
}
