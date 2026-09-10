"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Building2, 
  ShieldCheck, 
  Clock, 
  Users, 
  Briefcase, 
  Plus, 
  FileText, 
  ChevronRight, 
  Sparkles,
  ArrowRight,
  TrendingUp,
  Award,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { getApiBase } from "@/lib/api";
import { MobileSchoolHeader } from "@/components/school/MobileSchoolHeader";
import { SchoolLockedBanner } from "@/components/school/SchoolLockedBanner";

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

export default function SchoolDashboardHomePage() {
  const { user, setUser } = useAppStore();
  const router = useRouter();

  const [school, setSchool] = useState<SchoolData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [vacancies, setVacancies] = useState<Vacancy[]>([]);
  const [applications, setApplications] = useState<JobApplication[]>([]);

  const fetchSchoolProfile = async (silent = false) => {
    if (!user?.email) return;
    if (!silent) setLoading(true);
    else setRefreshing(true);

    try {
      const baseUrl = getApiBase();
      const res = await fetch(`${baseUrl}/recruitment/schools/me?email=${encodeURIComponent(user.email.trim().toLowerCase())}`);
      if (res.ok) {
        const data = await res.json();
        if (data.school) {
          setSchool(data.school);
          setUser({
            ...user,
            schoolId: data.school.id,
            verificationStatus: data.school.verification_status,
            schoolName: data.school.school_name,
            affiliationBoard: data.school.affiliation_board,
            schoolCity: data.school.city,
            schoolState: data.school.state,
            contactPerson: data.school.contact_person
          });

          if (data.school.verification_status === "verified") {
            fetchSchoolData(data.school.id);
          }
        }
      }
    } catch (e) {
      console.error("Failed to load school profile", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchSchoolData = async (schoolId: string) => {
    try {
      const baseUrl = getApiBase();
      const [vacRes, appRes] = await Promise.all([
        fetch(`${baseUrl}/recruitment/vacancies?school_id=${schoolId}&status=all`),
        fetch(`${baseUrl}/recruitment/applications/school?school_id=${schoolId}`)
      ]);

      if (vacRes.ok) {
        const vacData = await vacRes.json();
        setVacancies(vacData.vacancies || []);
      }
      if (appRes.ok) {
        const appData = await appRes.json();
        setApplications(appData.applications || []);
      }
    } catch (e) {
      console.error("Failed to load recruitment data", e);
    }
  };

  useEffect(() => {
    fetchSchoolProfile();
  }, [user?.email]);

  if (loading && !school) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-3">
        <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-bold text-slate-500">Loading School Dashboard...</p>
      </div>
    );
  }

  // If verification is pending or rejected, render clean locked state
  if (school && school.verification_status !== "verified") {
    return (
      <div className="space-y-4">
        <MobileSchoolHeader 
          school={school} 
          onRefresh={() => fetchSchoolProfile(true)} 
          refreshing={refreshing} 
        />
        <SchoolLockedBanner 
          school={school} 
          onRefresh={() => fetchSchoolProfile(true)} 
          refreshing={refreshing} 
        />
      </div>
    );
  }

  const activeVacancies = vacancies.filter(v => v.status === "active");
  const totalOpenings = activeVacancies.reduce((acc, v) => acc + (v.openings || 1), 0);
  const totalApplicants = applications.length;
  const inReviewCount = applications.filter(a => a.status === "shortlisted" || a.status === "interview").length;
  const hiredCount = applications.filter(a => a.status === "selected").length;

  return (
    <div className="space-y-5 pb-28">
      {/* MOBILE TOP HEADER */}
      <MobileSchoolHeader 
        school={school} 
        onRefresh={() => fetchSchoolProfile(true)} 
        refreshing={refreshing} 
      />

      {/* VERIFIED GREETING & ANNOUNCEMENT BANNER */}
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-900 via-indigo-800 to-indigo-950 text-white rounded-3xl p-5 sm:p-6 shadow-xl shadow-indigo-950/20">
        <div className="absolute -right-12 -bottom-12 w-40 h-40 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-[10px] font-black uppercase tracking-wider">
              <ShieldCheck className="w-3 h-3" />
              Verified CBSE Hiring Portal
            </div>
            <h2 className="text-lg sm:text-xl font-black tracking-tight">
              {school?.school_name}
            </h2>
            <p className="text-xs text-indigo-200/90 leading-relaxed max-w-lg">
              Manage your teaching openings, review teacher candidate CVs in PDF format, and hire top verified educators.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/dashboard/school/vacancies?action=new"
              className="px-4 py-2.5 bg-white hover:bg-slate-100 text-indigo-950 font-black text-xs rounded-xl shadow-lg transition-all flex items-center gap-1.5 active:scale-95"
            >
              <Plus className="w-4 h-4 text-indigo-600" />
              <span>Post Vacancy</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 4 CORE KPI METRICS (Mobile Grid) */}
      <div>
        <div className="flex items-center justify-between mb-2.5 px-1">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-500">Recruitment Overview</h3>
          <span className="text-[10px] font-bold text-slate-400">Live Status</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Active Vacancies */}
          <Link 
            href="/dashboard/school/vacancies"
            className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:border-indigo-200 transition-all group block"
          >
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <Briefcase className="w-4 h-4" />
            </div>
            <div className="text-2xl font-black text-slate-900">{activeVacancies.length}</div>
            <div className="text-[11px] font-bold text-slate-500">Active Jobs ({totalOpenings} Seats)</div>
          </Link>

          {/* Total Applicants */}
          <Link 
            href="/dashboard/school/applicants"
            className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:border-indigo-200 transition-all group block"
          >
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <Users className="w-4 h-4" />
            </div>
            <div className="text-2xl font-black text-slate-900">{totalApplicants}</div>
            <div className="text-[11px] font-bold text-slate-500">Applications Received</div>
          </Link>

          {/* Under Review */}
          <Link 
            href="/dashboard/school/applicants?status=shortlisted"
            className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:border-indigo-200 transition-all group block"
          >
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <Clock className="w-4 h-4" />
            </div>
            <div className="text-2xl font-black text-slate-900">{inReviewCount}</div>
            <div className="text-[11px] font-bold text-slate-500">In Review / Interview</div>
          </Link>

          {/* Selected / Hired */}
          <Link 
            href="/dashboard/school/applicants?status=selected"
            className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:border-indigo-200 transition-all group block"
          >
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <Award className="w-4 h-4" />
            </div>
            <div className="text-2xl font-black text-slate-900">{hiredCount}</div>
            <div className="text-[11px] font-bold text-slate-500">Hired / Selected</div>
          </Link>
        </div>
      </div>

      {/* QUICK ACTIONS NAVIGATOR (Mobile Thumb-Friendly Grid) */}
      <div>
        <div className="flex items-center justify-between mb-2.5 px-1">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-500">Quick Navigation</h3>
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          <Link
            href="/dashboard/school/vacancies"
            className="p-3.5 bg-white rounded-2xl border border-slate-200/80 hover:border-indigo-200 shadow-xs flex items-center gap-3 transition-all active:scale-98"
          >
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <Briefcase className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-black text-slate-900">Job Vacancies</h4>
              <p className="text-[10px] text-slate-500 truncate">Manage open openings</p>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
          </Link>

          <Link
            href="/dashboard/school/applicants"
            className="p-3.5 bg-white rounded-2xl border border-slate-200/80 hover:border-indigo-200 shadow-xs flex items-center gap-3 transition-all active:scale-98"
          >
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-black text-slate-900">Applicants & CVs</h4>
              <p className="text-[10px] text-slate-500 truncate">Review PDF resumes</p>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
          </Link>

          <Link
            href="/dashboard/school/vacancies?action=new"
            className="p-3.5 bg-white rounded-2xl border border-slate-200/80 hover:border-indigo-200 shadow-xs flex items-center gap-3 transition-all active:scale-98"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Plus className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-black text-slate-900">+ Post Vacancy</h4>
              <p className="text-[10px] text-slate-500 truncate">TGT, PGT, PRT roles</p>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
          </Link>

          <Link
            href="/dashboard/school/profile"
            className="p-3.5 bg-white rounded-2xl border border-slate-200/80 hover:border-indigo-200 shadow-xs flex items-center gap-3 transition-all active:scale-98"
          >
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-black text-slate-900">School Profile</h4>
              <p className="text-[10px] text-slate-500 truncate">Credentials & Board</p>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
          </Link>
        </div>
      </div>

      {/* ACTIVE VACANCIES PREVIEW CARD */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-black text-slate-900">Active Teaching Openings</h3>
            <p className="text-[11px] text-slate-500">Positions visible to verified teachers</p>
          </div>
          <Link
            href="/dashboard/school/vacancies"
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {vacancies.length === 0 ? (
          <div className="text-center py-6 px-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-2">
            <Briefcase className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="text-xs font-bold text-slate-700">No vacancies posted yet</p>
            <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
              Post your subject requirements (TGT, PGT, PRT) to start receiving qualified teacher applications.
            </p>
            <Link
              href="/dashboard/school/vacancies?action=new"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white font-extrabold text-xs rounded-xl shadow-xs mt-2"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Post Your First Vacancy</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-2.5">
            {vacancies.slice(0, 3).map((v) => (
              <div 
                key={v.id}
                className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-3 hover:border-indigo-100 transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-700 text-[10px] font-black">
                      {v.level}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-slate-200/80 text-slate-700 text-[10px] font-bold">
                      {v.subject}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 truncate">{v.title}</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">{v.salary_range} • {v.openings} Opening{v.openings > 1 ? "s" : ""}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    href={`/dashboard/school/applicants?vacancy_id=${v.id}`}
                    className="px-2.5 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-indigo-600 text-[11px] font-bold flex items-center gap-1 shadow-2xs"
                  >
                    <Users className="w-3.5 h-3.5 text-indigo-600" />
                    <span>{v.applicant_count || 0}</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* RECENT APPLICATIONS PREVIEW CARD */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-black text-slate-900">Recent Applications</h3>
            <p className="text-[11px] text-slate-500">Teacher CVs submitted for your review</p>
          </div>
          <Link
            href="/dashboard/school/applicants"
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {applications.length === 0 ? (
          <div className="text-center py-6 px-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-2">
            <Users className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="text-xs font-bold text-slate-700">No applications received yet</p>
            <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
              Once you post active vacancies, certified teachers on DEVGYA can apply with their PDF resumes.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {applications.slice(0, 3).map((app) => (
              <div 
                key={app.id}
                className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-3 hover:border-indigo-100 transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-black text-slate-900 truncate">{app.teacher_name}</h4>
                  <p className="text-[11px] text-indigo-700 font-semibold truncate">{app.job_title} ({app.job_subject})</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">{app.experience} Exp</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    app.status === "selected" 
                      ? "bg-emerald-100 text-emerald-700"
                      : app.status === "shortlisted" || app.status === "interview"
                      ? "bg-blue-100 text-blue-700"
                      : app.status === "rejected"
                      ? "bg-rose-100 text-rose-700"
                      : "bg-amber-100 text-amber-700"
                  }`}>
                    {app.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
