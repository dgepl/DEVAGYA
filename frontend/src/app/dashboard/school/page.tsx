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
  UserCheck,
  Target,
  RefreshCw,
  Mail
} from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { getApiBase } from "@/lib/api";
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
    <div className="space-y-5 pb-24 max-w-4xl mx-auto">
      {/* 1. HERO BANNER: WELCOME BACK, SCHOOL PORTAL WITH 3D GRADUATION CAP & BOOK */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-7 bg-gradient-to-br from-blue-50/90 via-indigo-50/60 to-purple-50/70 border border-indigo-100/70 shadow-xs">
        {/* Subtle Decorative Sparkles */}
        <div className="absolute top-4 right-36 w-3 h-3 select-none pointer-events-none opacity-80">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
        </div>
        <div className="absolute top-10 right-10 w-3 h-3 select-none pointer-events-none opacity-60">
          <Sparkles className="w-2.5 h-2.5 text-indigo-400" />
        </div>

        <div className="relative z-10 max-w-[62%] sm:max-w-md space-y-2">
          <p className="text-xs sm:text-sm font-semibold text-slate-500">Welcome Back,</p>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
            {school?.school_name || "School Portal"}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-normal">
            Manage your school operations, review teacher candidates, and stay updated with ease.
          </p>
          <div className="pt-1">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/95 border border-slate-200/80 text-xs font-bold text-slate-700 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <span>School Portal</span>
              <span className="text-slate-300">|</span>
              <span className="text-emerald-600 font-extrabold capitalize">
                {school?.verification_status === "verified" ? "Active" : "Pending Verification"}
              </span>
            </span>
          </div>
        </div>

        {/* 3D Graduation Cap & Book Illustration */}
        <div className="absolute -right-2 sm:right-4 top-1/2 -translate-y-1/2 w-32 h-32 sm:w-44 sm:h-44 pointer-events-none select-none flex items-center justify-center">
          <img 
            src="/images/school_hero_cap.jpg" 
            alt="School Portal" 
            className="w-full h-full object-contain drop-shadow-md rounded-2xl"
          />
        </div>
      </div>

      {/* 2. QUICK OVERVIEW */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-base font-extrabold text-slate-900">Quick Overview</h2>
          <Link 
            href="/dashboard/school/applicants"
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors"
          >
            <span>View Details</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Card 1: Active Jobs */}
          <Link
            href="/dashboard/school/vacancies"
            className="bg-white hover:bg-slate-50/80 rounded-2xl p-4 border border-slate-100 shadow-xs hover:shadow-sm transition-all group block"
          >
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
              <FileText className="w-4 h-4" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 leading-none mb-1">
              {activeVacancies.length}
            </div>
            <div className="text-xs font-bold text-slate-700 leading-tight">Active Jobs</div>
            <div className="text-[10px] font-semibold text-slate-400 mt-0.5">({totalOpenings} Seats)</div>
          </Link>

          {/* Card 2: Applications Received */}
          <Link
            href="/dashboard/school/applicants"
            className="bg-white hover:bg-slate-50/80 rounded-2xl p-4 border border-slate-100 shadow-xs hover:shadow-sm transition-all group block"
          >
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
              <Users className="w-4 h-4" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 leading-none mb-1">
              {totalApplicants}
            </div>
            <div className="text-xs font-bold text-slate-700 leading-tight">Applications Received</div>
            <div className="text-[10px] font-semibold text-slate-400 mt-0.5">&nbsp;</div>
          </Link>

          {/* Card 3: In Review / Interview */}
          <Link
            href="/dashboard/school/applicants?status=shortlisted"
            className="bg-white hover:bg-slate-50/80 rounded-2xl p-4 border border-slate-100 shadow-xs hover:shadow-sm transition-all group block"
          >
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
              <Clock className="w-4 h-4" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 leading-none mb-1">
              {inReviewCount}
            </div>
            <div className="text-xs font-bold text-slate-700 leading-tight">In Review / Interview</div>
            <div className="text-[10px] font-semibold text-slate-400 mt-0.5">&nbsp;</div>
          </Link>

          {/* Card 4: Hired / Selected */}
          <Link
            href="/dashboard/school/applicants?status=selected"
            className="bg-white hover:bg-slate-50/80 rounded-2xl p-4 border border-slate-100 shadow-xs hover:shadow-sm transition-all group block"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
              <UserCheck className="w-4 h-4" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 leading-none mb-1">
              {hiredCount}
            </div>
            <div className="text-xs font-bold text-slate-700 leading-tight">Hired / Selected</div>
            <div className="text-[10px] font-semibold text-slate-400 mt-0.5">&nbsp;</div>
          </Link>
        </div>
      </div>

      {/* 3. QUICK NAVIGATION */}
      <div className="space-y-3">
        <h2 className="text-base font-extrabold text-slate-900 px-1">Quick Navigation</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* 1. Job Vacancies */}
          <Link
            href="/dashboard/school/vacancies"
            className="p-4 bg-white rounded-2xl border border-slate-100 hover:border-indigo-100 shadow-xs flex items-center justify-between gap-3 group active:scale-98 transition-all"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-11 h-11 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                <Building2 className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">Job Vacancies</h3>
                <p className="text-[11px] text-slate-400 truncate mt-0.5">Manage open openings</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all shrink-0" />
          </Link>

          {/* 2. Applicants & CVs */}
          <Link
            href="/dashboard/school/applicants"
            className="p-4 bg-white rounded-2xl border border-slate-100 hover:border-indigo-100 shadow-xs flex items-center justify-between gap-3 group active:scale-98 transition-all"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">Applicants & CVs</h3>
                <p className="text-[11px] text-slate-400 truncate mt-0.5">Review PDF resumes</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all shrink-0" />
          </Link>

          {/* 3. + Post Vacancy */}
          <Link
            href="/dashboard/school/vacancies?action=new"
            className="p-4 bg-white rounded-2xl border border-slate-100 hover:border-indigo-100 shadow-xs flex items-center justify-between gap-3 group active:scale-98 transition-all"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <Plus className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div className="min-w-0">
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">+ Post Vacancy</h3>
                <p className="text-[11px] text-slate-400 truncate mt-0.5">TGT, PGT, PRT roles</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all shrink-0" />
          </Link>

          {/* 4. School Profile */}
          <Link
            href="/dashboard/school/profile"
            className="p-4 bg-white rounded-2xl border border-slate-100 hover:border-indigo-100 shadow-xs flex items-center justify-between gap-3 group active:scale-98 transition-all"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-11 h-11 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">School Profile</h3>
                <p className="text-[11px] text-slate-400 truncate mt-0.5">Credentials & Board</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all shrink-0" />
          </Link>
        </div>
      </div>

      {/* 4. ACTIVE TEACHING OPENINGS */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <Target className="w-3.5 h-3.5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 leading-tight">Active Teaching Openings</h2>
              <p className="text-[11px] text-slate-400">Positions visible to verified teachers</p>
            </div>
          </div>
          <Link 
            href="/dashboard/school/vacancies"
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {vacancies.length === 0 ? (
          <div className="text-center py-7 px-4 bg-white rounded-2xl border border-dashed border-slate-200 space-y-2.5">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
              <Briefcase className="w-6 h-6" />
            </div>
            <p className="text-xs font-bold text-slate-800">No active vacancies posted yet</p>
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
          <div className="space-y-2.5">
            {vacancies.slice(0, 5).map((v) => (
              <Link
                key={v.id}
                href={`/dashboard/school/vacancies`}
                className="p-4 bg-white rounded-2xl border border-slate-100 hover:border-indigo-100 shadow-xs flex items-center justify-between gap-3 group active:scale-98 transition-all"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-11 h-11 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight truncate">
                      {v.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[11px] text-slate-500 font-medium truncate">
                        {v.level} • {v.subject}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                        {v.status === "active" ? "Open" : v.status}
                      </span>
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all shrink-0" />
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* 5. DEDICATED SCHOOL PARTNER SUPPORT */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-50/80 via-white to-purple-50/80 border border-indigo-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Mail className="w-4 h-4" />
          </div>
          <div>
            <p className="font-extrabold text-slate-900">Dedicated School Partner Support</p>
            <p className="text-[11px] text-slate-500">Need vacancy assistance or teacher recruitment help?</p>
          </div>
        </div>
        <a 
          href="mailto:dgepl.info@gmail.com"
          className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shrink-0 transition-colors shadow-xs flex items-center gap-1.5"
        >
          <Mail className="w-3.5 h-3.5" />
          <span>dgepl.info@gmail.com</span>
        </a>
      </div>
    </div>
  );
}
