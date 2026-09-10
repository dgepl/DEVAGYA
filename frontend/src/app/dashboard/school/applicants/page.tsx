"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { 
  Building2, 
  Users, 
  Search, 
  FileText, 
  Download, 
  CheckCircle2, 
  Clock, 
  Phone, 
  Mail, 
  ChevronRight, 
  Briefcase, 
  X, 
  Filter, 
  Check, 
  XCircle,
  ExternalLink,
  Award,
  GraduationCap
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
  verification_status: "pending_verification" | "verified" | "rejected";
  logo_url: string;
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

interface Vacancy {
  id: string;
  title: string;
  subject: string;
}

const STATUS_FILTERS = [
  { key: "all", label: "All" },
  { key: "submitted", label: "New" },
  { key: "shortlisted", label: "Shortlisted" },
  { key: "interview", label: "Interview" },
  { key: "selected", label: "Selected" },
  { key: "rejected", label: "Rejected" }
];

export default function SchoolApplicantsPage() {
  const { user } = useAppStore();
  const searchParams = useSearchParams();

  const [school, setSchool] = useState<SchoolData | null>(null);
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [vacancies, setVacancies] = useState<Vacancy[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  // Filters
  const [selectedVacancyId, setSelectedVacancyId] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Action status update
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [selectedAppModal, setSelectedAppModal] = useState<JobApplication | null>(null);

  const fetchSchoolProfile = async () => {
    if (!user?.email) return;
    setLoading(true);
    try {
      const baseUrl = getApiBase();
      const res = await fetch(`${baseUrl}/recruitment/schools/me?email=${encodeURIComponent(user.email.trim().toLowerCase())}`);
      if (res.ok) {
        const data = await res.json();
        if (data.school) {
          setSchool(data.school);
          if (data.school.verification_status === "verified") {
            fetchApplicationsAndVacancies(data.school.id);
          }
        }
      }
    } catch (e) {
      console.error("Failed to load school profile", e);
    } finally {
      setLoading(false);
    }
  };

  const fetchApplicationsAndVacancies = async (schoolId: string) => {
    setLoadingData(true);
    try {
      const baseUrl = getApiBase();
      const [appRes, vacRes] = await Promise.all([
        fetch(`${baseUrl}/recruitment/applications/school?school_id=${schoolId}`),
        fetch(`${baseUrl}/recruitment/vacancies?school_id=${schoolId}&status=all`)
      ]);

      if (appRes.ok) {
        const appData = await appRes.json();
        setApplications(appData.applications || []);
      }
      if (vacRes.ok) {
        const vacData = await vacRes.json();
        setVacancies(vacData.vacancies || []);
      }
    } catch (e) {
      console.error("Failed to load applicants", e);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    fetchSchoolProfile();
  }, [user?.email]);

  useEffect(() => {
    const vId = searchParams.get("vacancy_id");
    if (vId) setSelectedVacancyId(vId);

    const st = searchParams.get("status");
    if (st) setSelectedStatus(st);
  }, [searchParams]);

  const handleUpdateStatus = async (appId: string, newStatus: string) => {
    setUpdatingId(appId);
    try {
      const baseUrl = getApiBase();
      const res = await fetch(`${baseUrl}/recruitment/applications/${appId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        setApplications(prev => prev.map(a => a.id === appId ? { ...a, status: newStatus as any } : a));
        if (selectedAppModal && selectedAppModal.id === appId) {
          setSelectedAppModal({ ...selectedAppModal, status: newStatus as any });
        }
      } else {
        alert("Failed to update applicant status");
      }
    } catch (e) {
      alert("Error updating applicant status");
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading && !school) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-3">
        <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-bold text-slate-500">Loading Applicants...</p>
      </div>
    );
  }

  if (school && school.verification_status !== "verified") {
    return (
      <div className="space-y-4">
        <MobileSchoolHeader school={school} />
        <SchoolLockedBanner school={school} onRefresh={fetchSchoolProfile} />
      </div>
    );
  }

  // Filtered Applications
  const filteredApps = applications.filter(app => {
    const matchesVacancy = selectedVacancyId === "all" || app.vacancy_id === selectedVacancyId;
    const matchesStatus = selectedStatus === "all" || app.status === selectedStatus;
    const matchesSearch = app.teacher_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          app.teacher_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          app.job_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          app.job_subject.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesVacancy && matchesStatus && matchesSearch;
  });

  const baseUrl = getApiBase();

  return (
    <div className="space-y-4 pb-28">
      {/* MOBILE SCHOOL HEADER */}
      <MobileSchoolHeader school={school} onRefresh={fetchSchoolProfile} />

      {/* PAGE TITLE & SUMMARY */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-black text-slate-900 tracking-tight">Applicant Tracking</h2>
          <p className="text-xs text-slate-500">
            {applications.length} candidate CV{applications.length === 1 ? "" : "s"} received
          </p>
        </div>

        {vacancies.length > 0 && (
          <select
            value={selectedVacancyId}
            onChange={(e) => setSelectedVacancyId(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 font-bold focus:outline-none focus:border-indigo-600 shadow-xs max-w-[150px] truncate"
          >
            <option value="all">All Vacancies</option>
            {vacancies.map(v => (
              <option key={v.id} value={v.id}>{v.title}</option>
            ))}
          </select>
        )}
      </div>

      {/* SEARCH BAR */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by teacher name, subject, or role..."
          className="w-full bg-white border border-slate-200/80 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 font-semibold shadow-xs"
        />
        {searchQuery && (
          <button 
            onClick={() => setSearchQuery("")}
            className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* HORIZONTAL STATUS CHIPS */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none -mx-4 px-4">
        {STATUS_FILTERS.map(st => {
          const count = st.key === "all" 
            ? applications.length 
            : applications.filter(a => a.status === st.key).length;

          return (
            <button
              key={st.key}
              onClick={() => setSelectedStatus(st.key)}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-extrabold whitespace-nowrap transition-colors shrink-0 ${
                selectedStatus === st.key 
                  ? "bg-indigo-600 text-white shadow-xs" 
                  : "bg-white text-slate-600 border border-slate-200"
              }`}
            >
              {st.label} ({count})
            </button>
          );
        })}
      </div>

      {/* CANDIDATE CARDS LIST */}
      {filteredApps.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center space-y-3 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-black text-slate-900">No applicants found</h3>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            {searchQuery || selectedStatus !== "all" || selectedVacancyId !== "all"
              ? "No candidate applications match your current filters."
              : "As soon as teachers apply to your vacancies, their resumes and profiles will appear here."}
          </p>
          {(searchQuery || selectedStatus !== "all" || selectedVacancyId !== "all") && (
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedStatus("all");
                setSelectedVacancyId("all");
              }}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs rounded-xl shadow-xs inline-flex items-center gap-1.5"
            >
              <span>Clear All Filters</span>
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredApps.map((app) => (
            <div
              key={app.id}
              className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs hover:border-indigo-200 transition-all space-y-3"
            >
              {/* TOP HEADER: CANDIDATE INFO & BADGE */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-black text-sm flex items-center justify-center shrink-0 shadow-xs">
                    {app.teacher_name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xs font-black text-slate-900 truncate leading-snug">
                      {app.teacher_name}
                    </h3>
                    <p className="text-[11px] text-indigo-700 font-bold truncate">
                      {app.job_title} • {app.job_subject}
                    </p>
                  </div>
                </div>

                <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shrink-0 ${
                  app.status === "selected"
                    ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                    : app.status === "shortlisted" || app.status === "interview"
                    ? "bg-blue-100 text-blue-800 border border-blue-200"
                    : app.status === "rejected"
                    ? "bg-rose-100 text-rose-800 border border-rose-200"
                    : "bg-amber-100 text-amber-800 border border-amber-200"
                }`}>
                  {app.status}
                </span>
              </div>

              {/* CANDIDATE DETAILS ROW */}
              <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded-xl">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Experience</span>
                  <span className="font-extrabold text-slate-800">{app.experience}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Qualification</span>
                  <span className="font-extrabold text-slate-800 truncate block">{app.qualification || "B.Ed / Post Grad"}</span>
                </div>
                {app.teacher_phone && (
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Phone</span>
                    <a href={`tel:${app.teacher_phone}`} className="font-extrabold text-indigo-600 truncate block">
                      {app.teacher_phone}
                    </a>
                  </div>
                )}
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Email</span>
                  <span className="font-extrabold text-slate-800 truncate block">{app.teacher_email}</span>
                </div>
              </div>

              {/* COVER NOTE */}
              {app.cover_note && (
                <div className="p-2.5 bg-indigo-50/50 rounded-xl border border-indigo-100/60 text-[11px] text-slate-700 italic">
                  "{app.cover_note}"
                </div>
              )}

              {/* ACTIONS: RESUME DOWNLOAD & STATUS BUTTONS */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                {/* PDF RESUME BUTTON */}
                <a
                  href={`${baseUrl}/recruitment/resumes/${app.resume_filename}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-transform active:scale-95 shrink-0"
                >
                  <Download className="w-3.5 h-3.5 text-indigo-400" />
                  <span>View Resume (PDF)</span>
                </a>

                {/* STATUS ACTIONS DROPDOWN/PILLS */}
                <div className="flex items-center gap-1 shrink-0">
                  <select
                    value={app.status}
                    disabled={updatingId === app.id}
                    onChange={(e) => handleUpdateStatus(app.id, e.target.value)}
                    className="bg-white border border-slate-300 rounded-xl px-2 py-1 text-[11px] font-bold text-slate-800 focus:outline-none focus:border-indigo-600 shadow-2xs"
                  >
                    <option value="submitted">New / Pending</option>
                    <option value="shortlisted">Shortlist</option>
                    <option value="interview">Interview</option>
                    <option value="selected">Select / Hire</option>
                    <option value="rejected">Reject</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
