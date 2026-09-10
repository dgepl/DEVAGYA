"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Building2, 
  ShieldCheck, 
  ShieldAlert, 
  Clock, 
  Users, 
  Briefcase, 
  Plus, 
  FileText, 
  Download, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  RefreshCw, 
  Search, 
  Filter, 
  MapPin, 
  Phone, 
  Mail, 
  ChevronRight, 
  Eye, 
  Sparkles,
  Calendar,
  DollarSign,
  GraduationCap,
  Layers,
  Edit3,
  Trash2
} from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { getApiBase } from "@/lib/api";

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
  school_id: string;
  school_name: string;
  title: string;
  subject: string;
  level: string;
  board: string;
  experience_required: string;
  salary_range: string;
  openings: number;
  employment_type: string;
  description: string;
  status: "active" | "closed" | "paused";
  applicant_count: number;
  created_at: string;
}

interface JobApplication {
  id: string;
  vacancy_id: string;
  job_title: string;
  job_subject: string;
  job_level: string;
  teacher_id: string;
  teacher_name: string;
  teacher_email: string;
  teacher_phone: string;
  qualification: string;
  experience: string;
  current_school: string;
  cover_note: string;
  resume_filename: string;
  resume_url: string;
  status: "submitted" | "shortlisted" | "interview" | "selected" | "rejected";
  school_feedback?: string;
  created_at: string;
}

export default function SchoolDashboardPage() {
  const { user, setUser } = useAppStore();
  const router = useRouter();

  const [school, setSchool] = useState<SchoolData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<"vacancies" | "post" | "applicants" | "profile">("vacancies");

  // Data states
  const [vacancies, setVacancies] = useState<Vacancy[]>([]);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  // Filter states
  const [applicantFilter, setApplicantFilter] = useState<string>("all");
  const [selectedVacancyId, setSelectedVacancyId] = useState<string>("all");

  // New Vacancy Form
  const [newTitle, setNewTitle] = useState("");
  const [newLevel, setNewLevel] = useState("TGT");
  const [newSubject, setNewSubject] = useState("Mathematics");
  const [newBoard, setNewBoard] = useState("CBSE");
  const [newExp, setNewExp] = useState("1-3 Years");
  const [newSalary, setNewSalary] = useState("₹30,000 - ₹50,000 / month");
  const [newOpenings, setNewOpenings] = useState(1);
  const [newType, setNewType] = useState("Full Time");
  const [newDesc, setNewDesc] = useState("");
  const [postingJob, setPostingJob] = useState(false);
  const [jobSuccessMsg, setJobSuccessMsg] = useState<string | null>(null);

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
    } catch (err) {
      console.error("Error fetching school profile:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchSchoolData = async (schoolId: string) => {
    setLoadingData(true);
    try {
      const baseUrl = getApiBase();
      // Fetch vacancies
      const vacRes = await fetch(`${baseUrl}/recruitment/vacancies?school_id=${encodeURIComponent(schoolId)}&status=all`);
      if (vacRes.ok) {
        const vacData = await vacRes.json();
        setVacancies(vacData.vacancies || []);
      }

      // Fetch applications
      const appRes = await fetch(`${baseUrl}/recruitment/applications/school?school_id=${encodeURIComponent(schoolId)}`);
      if (appRes.ok) {
        const appData = await appRes.json();
        setApplications(appData.applications || []);
      }
    } catch (err) {
      console.error("Error fetching school vacancies and applications:", err);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    fetchSchoolProfile();
  }, [user?.email]);

  const handleCreateVacancy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!school || school.verification_status !== "verified") return;

    setPostingJob(true);
    setJobSuccessMsg(null);

    try {
      const baseUrl = getApiBase();
      const res = await fetch(`${baseUrl}/recruitment/vacancies`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          school_id: school.id,
          title: newTitle,
          subject: newSubject,
          level: newLevel,
          board: newBoard,
          experience_required: newExp,
          salary_range: newSalary,
          openings: newOpenings,
          employment_type: newType,
          description: newDesc
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to post vacancy.");

      setJobSuccessMsg("Vacancy posted successfully! Teachers can now discover and apply for this role.");
      setNewTitle("");
      setNewDesc("");
      fetchSchoolData(school.id);
      setTimeout(() => {
        setActiveTab("vacancies");
        setJobSuccessMsg(null);
      }, 1500);
    } catch (err: any) {
      alert(err.message || "Failed to create vacancy.");
    } finally {
      setPostingJob(false);
    }
  };

  const handleUpdateAppStatus = async (appId: string, newStatus: string) => {
    try {
      const baseUrl = getApiBase();
      const res = await fetch(`${baseUrl}/recruitment/applications/${appId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        setApplications(prev => prev.map(a => a.id === appId ? { ...a, status: newStatus as any } : a));
      }
    } catch (err) {
      console.error("Error updating application status:", err);
    }
  };

  const handleDeleteVacancy = async (vacId: string) => {
    if (!confirm("Are you sure you want to remove this vacancy?")) return;
    try {
      const baseUrl = getApiBase();
      const res = await fetch(`${baseUrl}/recruitment/vacancies/${vacId}`, {
        method: "DELETE"
      });
      if (res.ok) {
        setVacancies(prev => prev.filter(v => v.id !== vacId));
      }
    } catch (err) {
      console.error("Error deleting vacancy:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-3">
        <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-bold text-slate-500">Loading School Portal...</p>
      </div>
    );
  }

  const isVerified = school?.verification_status === "verified";

  // ==============================================================
  // 1. LOCKED VIEW (PENDING VERIFICATION OR REJECTED)
  // ==============================================================
  if (!isVerified) {
    const isPending = school?.verification_status === "pending_verification" || !school?.verification_status;
    return (
      <div className="max-w-4xl mx-auto space-y-6 pb-24 pt-4 px-2">
        {/* TOP STATUS CARD */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-10 shadow-xl relative overflow-hidden text-center space-y-6">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-amber-50 border-2 border-amber-200 flex items-center justify-center text-amber-600 shadow-lg shadow-amber-500/10">
            {isPending ? <Clock className="w-10 h-10 animate-pulse" /> : <ShieldAlert className="w-10 h-10 text-rose-600" />}
          </div>

          <div className="space-y-2 max-w-xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-amber-100/80 text-amber-800 border border-amber-300/60">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
              {isPending ? "Verification Under Review" : "Verification Status: Action Needed"}
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              School Dashboard Locked
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
              {isPending 
                ? "Your school registration has been submitted and is currently under verification review by the DEVGYA Super Admin team. Once verified and accepted, your complete School Dashboard will unlock immediately."
                : (school?.verification_notes || "Your school verification could not be approved. Please contact DEVGYA support for assistance.")}
            </p>
          </div>

          {/* ACTION BUTTON */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => fetchSchoolProfile(true)}
              disabled={refreshing}
              className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-2xl shadow-lg shadow-indigo-600/25 transition-all flex items-center gap-2 disabled:opacity-50 active:scale-95"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
              {refreshing ? "Checking Status..." : "Refresh Verification Status"}
            </button>
            <Link
              href="/"
              className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-2xl transition-all"
            >
              Back to Home
            </Link>
          </div>
        </div>

        {/* DETAILS SUBMITTED CARD */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-md space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Building2 className="w-4 h-4 text-indigo-600" />
              Submitted School Credentials
            </h2>
            <span className="text-[11px] font-bold text-slate-400">
              ID: {school?.id || "SCH-000"}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase">School Name</span>
              <p className="font-bold text-slate-900">{school?.school_name || "Institution Name"}</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase">Affiliation Board</span>
              <p className="font-bold text-slate-900">{school?.affiliation_board || "CBSE"}</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase">City & State</span>
              <p className="font-bold text-slate-900">{school?.city || "N/A"}, {school?.state || "N/A"}</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase">Contact Person / Principal</span>
              <p className="font-bold text-slate-900">{school?.contact_person || user?.name || "N/A"}</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase">Official Email</span>
              <p className="font-bold text-slate-900">{school?.email || user?.email}</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase">Phone Number</span>
              <p className="font-bold text-slate-900">{school?.phone || "N/A"}</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 text-indigo-900 text-xs flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed font-medium">
              <strong>Need urgent activation?</strong> You can contact DEVGYA Admin support at <a href="mailto:support@devgya.com" className="underline font-bold">support@devgya.com</a> with your affiliation number for rapid verification within 2–4 business hours.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ==============================================================
  // 2. UNLOCKED FULL WORKING SCHOOL DASHBOARD
  // ==============================================================
  const totalVacancies = vacancies.length;
  const activeVacanciesCount = vacancies.filter(v => v.status === "active").length;
  const totalAppsCount = applications.length;
  const shortlistedCount = applications.filter(a => a.status === "shortlisted" || a.status === "interview").length;

  // Filtered applications
  const filteredApplications = applications.filter(a => {
    if (selectedVacancyId !== "all" && a.vacancy_id !== selectedVacancyId) return false;
    if (applicantFilter !== "all" && a.status !== applicantFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6 pb-24 px-1 max-w-6xl mx-auto">
      
      {/* 1. HERO SCHOOL BANNER */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 rounded-[28px] shadow-2xl border border-indigo-900/40 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 relative z-10">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-extrabold uppercase tracking-widest bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 px-3 py-1 rounded-full flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Verified Institution • {school?.affiliation_board || "CBSE"}
            </span>
            <span className="text-[10px] font-bold text-slate-300 bg-white/10 px-2.5 py-1 rounded-full">
              {school?.city ? `${school.city}, ${school.state}` : "India"}
            </span>
          </div>
          <h1 className="text-xl sm:text-3xl font-black tracking-tight leading-tight">
            {school?.school_name || "Institution Dashboard"}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 font-medium">
            Manage teacher vacancies, review candidate PDF CVs, and track recruitment.
          </p>
        </div>

        <div className="flex items-center gap-2 relative z-10 shrink-0">
          <button
            onClick={() => setActiveTab("post")}
            className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-2xl shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Open Vacancy
          </button>
        </div>
      </div>

      {/* 2. STATS CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-1">
          <span className="text-[10px] sm:text-xs font-extrabold text-slate-400 uppercase tracking-wider">Active Openings</span>
          <p className="text-2xl sm:text-3xl font-black text-indigo-600">{activeVacanciesCount}</p>
          <span className="text-[10px] text-slate-500 font-semibold">{totalVacancies} total created</span>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-1">
          <span className="text-[10px] sm:text-xs font-extrabold text-slate-400 uppercase tracking-wider">Total Applicants</span>
          <p className="text-2xl sm:text-3xl font-black text-slate-900">{totalAppsCount}</p>
          <span className="text-[10px] text-emerald-600 font-semibold">Teacher resumes</span>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-1">
          <span className="text-[10px] sm:text-xs font-extrabold text-slate-400 uppercase tracking-wider">Shortlisted</span>
          <p className="text-2xl sm:text-3xl font-black text-amber-600">{shortlistedCount}</p>
          <span className="text-[10px] text-slate-500 font-semibold">Interview stage</span>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-1">
          <span className="text-[10px] sm:text-xs font-extrabold text-slate-400 uppercase tracking-wider">Portal Status</span>
          <p className="text-lg sm:text-xl font-black text-emerald-600 flex items-center gap-1.5 pt-1">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            Active
          </p>
          <span className="text-[10px] text-slate-500 font-semibold">Recruitment Live</span>
        </div>
      </div>

      {/* 3. TABS NAVIGATION */}
      <div className="flex border-b border-slate-200 gap-1 overflow-x-auto pb-px">
        {[
          { id: "vacancies", label: "My Vacancies", count: vacancies.length, icon: Briefcase },
          { id: "applicants", label: "Applicant Resumes", count: applications.length, icon: Users },
          { id: "post", label: "Post New Vacancy", icon: Plus },
          { id: "profile", label: "School Profile", icon: Building2 },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-extrabold border-b-2 transition-all shrink-0 ${
                isActive 
                  ? "border-indigo-600 text-indigo-600 bg-indigo-50/40 rounded-t-xl" 
                  : "border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-t-xl"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                  isActive ? "bg-indigo-600 text-white" : "bg-slate-200 text-slate-700"
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 4. TAB CONTENTS */}

      {/* TAB: VACANCIES */}
      {activeTab === "vacancies" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">
              Current Openings ({vacancies.length})
            </h2>
            <button
              onClick={() => setActiveTab("post")}
              className="px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-xl border border-indigo-200 transition-all flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Opening
            </button>
          </div>

          {vacancies.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
              <Briefcase className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-sm font-bold text-slate-900">No vacancies posted yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Start attracting qualified CBSE/ICSE educators by opening your first teacher vacancy.
              </p>
              <button
                onClick={() => setActiveTab("post")}
                className="px-4 py-2 bg-indigo-600 text-white font-bold text-xs rounded-xl shadow-md"
              >
                Post Your First Vacancy
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {vacancies.map(vac => (
                <div key={vac.id} className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-3 relative group hover:border-indigo-200 transition-all">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-indigo-100 text-indigo-800">
                          {vac.level} • {vac.subject}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          vac.status === "active" ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"
                        }`}>
                          {vac.status === "active" ? "Open" : "Closed"}
                        </span>
                      </div>
                      <h3 className="text-sm font-black text-slate-900 mt-1.5">{vac.title}</h3>
                    </div>

                    <button
                      onClick={() => handleDeleteVacancy(vac.id)}
                      className="p-1.5 text-slate-300 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-all"
                      title="Delete Vacancy"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600">
                    <div>
                      <span className="text-slate-400 font-semibold block">Experience:</span>
                      <span className="font-bold text-slate-800">{vac.experience_required}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-semibold block">Salary:</span>
                      <span className="font-bold text-slate-800">{vac.salary_range}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-semibold block">Openings:</span>
                      <span className="font-bold text-slate-800">{vac.openings} Seat{vac.openings > 1 ? "s" : ""}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-semibold block">Applicants:</span>
                      <span className="font-bold text-indigo-600">{vac.applicant_count || 0} candidate(s)</span>
                    </div>
                  </div>

                  {vac.description && (
                    <p className="text-xs text-slate-500 line-clamp-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      {vac.description}
                    </p>
                  )}

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400">
                      Posted: {new Date(vac.created_at).toLocaleDateString()}
                    </span>
                    <button
                      onClick={() => {
                        setSelectedVacancyId(vac.id);
                        setActiveTab("applicants");
                      }}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                    >
                      View Candidates ({vac.applicant_count || 0})
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB: POST NEW VACANCY */}
      {activeTab === "post" && (
        <div className="max-w-2xl bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Plus className="w-4 h-4 text-indigo-600" />
              Post New Teacher Vacancy
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Select teaching level (PRT/TGT/PGT), subject, and compensation to publish opening.
            </p>
          </div>

          {jobSuccessMsg && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{jobSuccessMsg}</span>
            </div>
          )}

          <form onSubmit={handleCreateVacancy} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Job Designation / Title *</label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Senior PGT Mathematics Faculty"
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 font-semibold"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Teaching Level (Grade Category) *</label>
                <select
                  value={newLevel}
                  onChange={(e) => setNewLevel(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 font-semibold"
                >
                  <option value="PGT">PGT (Post Graduate Teacher - Classes 11–12)</option>
                  <option value="TGT">TGT (Trained Graduate Teacher - Classes 6–10)</option>
                  <option value="PRT">PRT (Primary Teacher - Classes 1–5)</option>
                  <option value="NTT">NTT / Pre-Primary Educator</option>
                  <option value="Activity/Sports">Activity / Sports / Arts Faculty</option>
                  <option value="Special Educator">Special Educator / Counselor</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Subject *</label>
                <select
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 font-semibold"
                >
                  <option value="Mathematics">Mathematics</option>
                  <option value="Physics">Physics</option>
                  <option value="Chemistry">Chemistry</option>
                  <option value="Biology">Biology</option>
                  <option value="Science">General Science</option>
                  <option value="English">English</option>
                  <option value="Hindi">Hindi</option>
                  <option value="Social Science">Social Science (SST)</option>
                  <option value="Computer Science">Computer Science / AI</option>
                  <option value="Accountancy">Accountancy / Business Studies</option>
                  <option value="Economics">Economics</option>
                  <option value="Physical Education">Physical Education</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Board</label>
                <select
                  value={newBoard}
                  onChange={(e) => setNewBoard(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 font-semibold"
                >
                  <option value="CBSE">CBSE</option>
                  <option value="ICSE">ICSE</option>
                  <option value="State Board">State Board</option>
                  <option value="IB">IB</option>
                  <option value="Cambridge">Cambridge</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Experience Required</label>
                <select
                  value={newExp}
                  onChange={(e) => setNewExp(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 font-semibold"
                >
                  <option value="Fresher / 0-1 Years">Fresher / 0-1 Years</option>
                  <option value="1-3 Years">1–3 Years</option>
                  <option value="3-5 Years">3–5 Years</option>
                  <option value="5-8 Years">5–8 Years</option>
                  <option value="8+ Years">8+ Years</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Openings</label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={newOpenings}
                  onChange={(e) => setNewOpenings(parseInt(e.target.value) || 1)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 font-semibold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Monthly Salary / Pay Scale</label>
                <input
                  type="text"
                  value={newSalary}
                  onChange={(e) => setNewSalary(e.target.value)}
                  placeholder="e.g. ₹35,000 - ₹55,000 / month"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 font-semibold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Employment Type</label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 font-semibold"
                >
                  <option value="Full Time">Full Time</option>
                  <option value="Part Time">Part Time</option>
                  <option value="Visiting / Guest">Visiting / Guest</option>
                  <option value="Contract">Contract</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Job Description & Teacher Requirements</label>
              <textarea
                rows={4}
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="Mention B.Ed requirements, fluency expectations, class responsibilities, and school working hours..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 font-semibold"
              />
            </div>

            <button
              type="submit"
              disabled={postingJob}
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-extrabold text-xs rounded-2xl shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              {postingJob ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Publish Vacancy on Recruitment Portal
            </button>
          </form>
        </div>
      )}

      {/* TAB: APPLICANTS TRACKER */}
      {activeTab === "applicants" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-500">Filter by Vacancy:</span>
              <select
                value={selectedVacancyId}
                onChange={(e) => setSelectedVacancyId(e.target.value)}
                className="text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 focus:outline-none"
              >
                <option value="all">All Vacancies ({applications.length})</option>
                {vacancies.map(v => (
                  <option key={v.id} value={v.id}>{v.title} ({v.level} {v.subject})</option>
                ))}
              </select>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { id: "all", label: "All" },
                { id: "submitted", label: "New" },
                { id: "shortlisted", label: "Shortlisted" },
                { id: "interview", label: "Interview" },
                { id: "selected", label: "Selected" },
                { id: "rejected", label: "Rejected" },
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setApplicantFilter(f.id)}
                  className={`px-3 py-1 rounded-xl text-[11px] font-extrabold transition-all ${
                    applicantFilter === f.id
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {filteredApplications.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200/80 shadow-sm space-y-2">
              <Users className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="text-sm font-bold text-slate-900">No applications found</h3>
              <p className="text-xs text-slate-500">
                {applicantFilter !== "all" || selectedVacancyId !== "all" 
                  ? "No candidate matches the selected filters." 
                  : "When teachers submit their PDF resumes, they will appear here in real time."}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredApplications.map(app => (
                <div key={app.id} className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-black text-slate-900">{app.teacher_name}</h3>
                        <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                          app.status === "shortlisted" ? "bg-amber-100 text-amber-800" :
                          app.status === "interview" ? "bg-purple-100 text-purple-800" :
                          app.status === "selected" ? "bg-emerald-100 text-emerald-800" :
                          app.status === "rejected" ? "bg-rose-100 text-rose-800" :
                          "bg-blue-100 text-blue-800"
                        }`}>
                          {app.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">
                        Applied for: <strong className="text-indigo-600">{app.job_title}</strong> ({app.job_level} • {app.job_subject})
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <select
                        value={app.status}
                        onChange={(e) => handleUpdateAppStatus(app.id, e.target.value)}
                        className="text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-slate-800 focus:outline-none focus:border-indigo-600"
                      >
                        <option value="submitted">Status: Submitted</option>
                        <option value="shortlisted">Status: Shortlisted</option>
                        <option value="interview">Status: Interview Scheduled</option>
                        <option value="selected">Status: Selected</option>
                        <option value="rejected">Status: Rejected</option>
                      </select>

                      {app.resume_filename && (
                        <a
                          href={`${getApiBase()}/recruitment/resumes/${app.resume_filename}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5 shrink-0"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          View PDF Resume
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Qualification</span>
                      <p className="font-bold text-slate-800">{app.qualification || "B.Ed"}</p>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Teaching Exp</span>
                      <p className="font-bold text-slate-800">{app.experience || "1-3 Years"}</p>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Email</span>
                      <p className="font-bold text-slate-800 truncate">{app.teacher_email}</p>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Phone</span>
                      <p className="font-bold text-slate-800">{app.teacher_phone || "Not specified"}</p>
                    </div>
                  </div>

                  {app.cover_note && (
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600">
                      <strong className="text-slate-800 block text-[10px] uppercase font-black mb-0.5">Applicant Note:</strong>
                      {app.cover_note}
                    </div>
                  )}

                  <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1">
                    <span>Applied on: {new Date(app.created_at).toLocaleString()}</span>
                    <span>Application ID: {app.id}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB: SCHOOL PROFILE */}
      {activeTab === "profile" && (
        <div className="max-w-2xl bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Building2 className="w-4 h-4 text-indigo-600" />
                School Institutional Profile
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Official institution information visible to teacher applicants.
              </p>
            </div>
            <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-black uppercase">
              Verified
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Institution Name</span>
              <p className="font-black text-slate-900 text-sm">{school?.school_name}</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Affiliation Board</span>
              <p className="font-bold text-slate-800">{school?.affiliation_board}</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">City & State</span>
              <p className="font-bold text-slate-800">{school?.city}, {school?.state}</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Official Contact</span>
              <p className="font-bold text-slate-800">{school?.contact_person}</p>
            </div>
          </div>

          <div className="p-4 bg-indigo-50/60 rounded-2xl border border-indigo-100 text-xs text-indigo-900 space-y-2">
            <h4 className="font-bold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              DEVGYA School Partnership
            </h4>
            <p className="leading-relaxed font-medium">
              Your school is verified to hire educators, generate AI-aligned CBSE question papers, and run teacher enhancement certifications across all academic departments.
            </p>
          </div>
        </div>
      )}

    </div>
  );
}
