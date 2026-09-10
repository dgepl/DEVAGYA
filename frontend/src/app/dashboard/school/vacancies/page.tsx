"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { 
  Building2, 
  Briefcase, 
  Plus, 
  Search, 
  Filter, 
  Users, 
  Clock, 
  Trash2, 
  CheckCircle2, 
  X, 
  ChevronRight, 
  AlertCircle,
  Sliders,
  DollarSign,
  Calendar,
  Layers
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

const SUBJECT_OPTIONS = [
  "Mathematics",
  "Science",
  "Physics",
  "Chemistry",
  "Biology",
  "English",
  "Hindi",
  "Social Science",
  "History",
  "Geography",
  "Computer Science / IT",
  "Physical Education",
  "Art & Craft",
  "Music",
  "Other"
];

const LEVEL_OPTIONS = ["PRT", "TGT", "PGT", "NTT", "Activity / Sports", "Coordinator / Vice Principal"];

export default function SchoolVacanciesPage() {
  const { user } = useAppStore();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [school, setSchool] = useState<SchoolData | null>(null);
  const [loading, setLoading] = useState(true);
  const [vacancies, setVacancies] = useState<Vacancy[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [filterLevel, setFilterLevel] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // Post Vacancy Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [postingJob, setPostingJob] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  // New Vacancy Form Fields
  const [newTitle, setNewTitle] = useState("");
  const [newLevel, setNewLevel] = useState("TGT");
  const [newSubject, setNewSubject] = useState("Mathematics");
  const [newBoard, setNewBoard] = useState("CBSE");
  const [newExp, setNewExp] = useState("1-3 Years");
  const [newSalary, setNewSalary] = useState("₹30,000 - ₹50,000 / month");
  const [newOpenings, setNewOpenings] = useState(1);
  const [newType, setNewType] = useState("Full Time");
  const [newDesc, setNewDesc] = useState("");

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
            fetchVacancies(data.school.id);
          }
        }
      }
    } catch (e) {
      console.error("Failed to fetch school", e);
    } finally {
      setLoading(false);
    }
  };

  const fetchVacancies = async (schoolId: string) => {
    setLoadingData(true);
    try {
      const baseUrl = getApiBase();
      const res = await fetch(`${baseUrl}/recruitment/vacancies?school_id=${schoolId}&status=all`);
      if (res.ok) {
        const data = await res.json();
        setVacancies(data.vacancies || []);
      }
    } catch (e) {
      console.error("Failed to load vacancies", e);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    fetchSchoolProfile();
  }, [user?.email]);

  useEffect(() => {
    if (searchParams.get("action") === "new") {
      setIsModalOpen(true);
    }
  }, [searchParams]);

  const handleCreateVacancy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!school) return;
    if (!newTitle.trim()) {
      setFormError("Job title is required.");
      return;
    }

    setPostingJob(true);
    setFormError(null);
    try {
      const baseUrl = getApiBase();
      const res = await fetch(`${baseUrl}/recruitment/vacancies`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          school_id: school.id,
          title: newTitle.trim(),
          subject: newSubject,
          level: newLevel,
          board: newBoard,
          experience_required: newExp,
          salary_range: newSalary,
          openings: Number(newOpenings) || 1,
          employment_type: newType,
          description: newDesc.trim()
        })
      });
      const data = await res.json();
      if (res.ok) {
        setFormSuccess("Vacancy posted successfully! Certified teachers can now apply.");
        setNewTitle("");
        setNewDesc("");
        fetchVacancies(school.id);
        setTimeout(() => {
          setFormSuccess(null);
          setIsModalOpen(false);
        }, 1500);
      } else {
        setFormError(data.detail || "Failed to post vacancy.");
      }
    } catch (err: any) {
      setFormError(err.message || "Failed to connect to server.");
    } finally {
      setPostingJob(false);
    }
  };

  const handleToggleStatus = async (vacId: string, currentStatus: string) => {
    const nextStatus = currentStatus === "active" ? "closed" : "active";
    try {
      const baseUrl = getApiBase();
      const res = await fetch(`${baseUrl}/recruitment/vacancies/${vacId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus })
      });
      if (res.ok) {
        setVacancies(prev => prev.map(v => v.id === vacId ? { ...v, status: nextStatus as any } : v));
      }
    } catch (e) {
      alert("Failed to update status.");
    }
  };

  const handleDeleteVacancy = async (vacId: string) => {
    if (!confirm("Are you sure you want to delete this vacancy?")) return;
    try {
      const baseUrl = getApiBase();
      const res = await fetch(`${baseUrl}/recruitment/vacancies/${vacId}`, {
        method: "DELETE"
      });
      if (res.ok) {
        setVacancies(prev => prev.filter(v => v.id !== vacId));
      }
    } catch (e) {
      alert("Failed to delete vacancy.");
    }
  };

  if (loading && !school) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-3">
        <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-bold text-slate-500">Loading Vacancies...</p>
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

  // Filtered Vacancies
  const filteredVacancies = vacancies.filter(v => {
    const matchesSearch = v.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          v.subject.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLevel = filterLevel === "all" || v.level === filterLevel;
    const matchesStatus = filterStatus === "all" || v.status === filterStatus;
    return matchesSearch && matchesLevel && matchesStatus;
  });

  return (
    <div className="space-y-4 pb-28">
      {/* MOBILE SCHOOL HEADER */}
      <MobileSchoolHeader school={school} onRefresh={fetchSchoolProfile} />

      {/* PAGE TITLE & CTA */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-black text-slate-900 tracking-tight">Teaching Vacancies</h2>
          <p className="text-xs text-slate-500">
            {vacancies.length} total opening{vacancies.length === 1 ? "" : "s"} listed
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-indigo-600/20 flex items-center gap-1.5 active:scale-95 transition-transform cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Post Vacancy</span>
        </button>
      </div>

      {/* SEARCH INPUT */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by subject or role (e.g. Mathematics, TGT)..."
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

      {/* HORIZONTAL SCROLLING FILTER PILLS */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none -mx-4 px-4">
        <button
          onClick={() => setFilterStatus("all")}
          className={`px-3 py-1.5 rounded-xl text-[11px] font-extrabold whitespace-nowrap transition-colors shrink-0 ${
            filterStatus === "all" ? "bg-slate-900 text-white" : "bg-white text-slate-600 border border-slate-200"
          }`}
        >
          All ({vacancies.length})
        </button>
        <button
          onClick={() => setFilterStatus("active")}
          className={`px-3 py-1.5 rounded-xl text-[11px] font-extrabold whitespace-nowrap transition-colors shrink-0 ${
            filterStatus === "active" ? "bg-emerald-600 text-white" : "bg-white text-slate-600 border border-slate-200"
          }`}
        >
          Active ({vacancies.filter(v => v.status === "active").length})
        </button>
        <button
          onClick={() => setFilterStatus("closed")}
          className={`px-3 py-1.5 rounded-xl text-[11px] font-extrabold whitespace-nowrap transition-colors shrink-0 ${
            filterStatus === "closed" ? "bg-rose-600 text-white" : "bg-white text-slate-600 border border-slate-200"
          }`}
        >
          Closed ({vacancies.filter(v => v.status === "closed").length})
        </button>

        <span className="w-px h-4 bg-slate-300 mx-1 shrink-0" />

        {["PRT", "TGT", "PGT"].map(lvl => (
          <button
            key={lvl}
            onClick={() => setFilterLevel(filterLevel === lvl ? "all" : lvl)}
            className={`px-3 py-1.5 rounded-xl text-[11px] font-extrabold whitespace-nowrap transition-colors shrink-0 ${
              filterLevel === lvl ? "bg-indigo-600 text-white" : "bg-white text-slate-600 border border-slate-200"
            }`}
          >
            {lvl}
          </button>
        ))}
      </div>

      {/* VACANCY CARDS LIST */}
      {filteredVacancies.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center space-y-3 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
            <Briefcase className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-black text-slate-900">No vacancies found</h3>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            {searchQuery || filterLevel !== "all" || filterStatus !== "all"
              ? "Try adjusting your filters or search keywords."
              : "Post your school's teaching requirements to start receiving qualified teacher CVs."}
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-xs inline-flex items-center gap-1.5 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Post New Vacancy</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredVacancies.map((vac) => (
            <div
              key={vac.id}
              className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs hover:border-indigo-200 transition-all space-y-3"
            >
              {/* TOP ROW: BADGES & STATUS TOGGLE */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100 text-[10px] font-black uppercase">
                    {vac.level}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold">
                    {vac.subject}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-semibold">
                    {vac.board || "CBSE"}
                  </span>
                </div>

                <button
                  onClick={() => handleToggleStatus(vac.id, vac.status)}
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-colors cursor-pointer ${
                    vac.status === "active" 
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                      : "bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100"
                  }`}
                  title="Click to toggle status"
                >
                  {vac.status === "active" ? "● Active" : "○ Closed"}
                </button>
              </div>

              {/* TITLE & DETAILS */}
              <div>
                <h3 className="text-sm font-black text-slate-900 leading-snug">{vac.title}</h3>
                <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                  <div className="text-[11px] text-slate-600 flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{vac.salary_range}</span>
                  </div>
                  <div className="text-[11px] text-slate-600 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{vac.experience_required} Exp</span>
                  </div>
                </div>
              </div>

              {/* BOTTOM ACTIONS: APPLICANTS & ACTIONS */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                <Link
                  href={`/dashboard/school/applicants?vacancy_id=${vac.id}`}
                  className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-extrabold text-xs rounded-xl flex items-center gap-1.5 transition-colors"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>{vac.applicant_count || 0} Applicants</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleDeleteVacancy(vac.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                    title="Delete vacancy"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* POST VACANCY MODAL (Thumb-friendly mobile bottom-sheet) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-200">
            {/* MODAL HEADER */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Briefcase className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-black text-slate-900">Post New Teaching Vacancy</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* MODAL BODY */}
            <form onSubmit={handleCreateVacancy} className="p-4 sm:p-6 overflow-y-auto space-y-4">
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-bold text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                  <span>{formError}</span>
                </div>
              )}
              {formSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-700 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
                  <span>{formSuccess}</span>
                </div>
              )}

              {/* JOB TITLE */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Job Title / Designation *</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. TGT Mathematics Teacher (Classes 6-10)"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 font-semibold"
                />
              </div>

              {/* LEVEL & SUBJECT GRID */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Grade Level *</label>
                  <select
                    value={newLevel}
                    onChange={(e) => setNewLevel(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 font-semibold focus:outline-none focus:border-indigo-600"
                  >
                    {LEVEL_OPTIONS.map((lvl) => (
                      <option key={lvl} value={lvl}>{lvl}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Subject *</label>
                  <select
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 font-semibold focus:outline-none focus:border-indigo-600"
                  >
                    {SUBJECT_OPTIONS.map((sub) => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* SALARY & SEATS GRID */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Salary Range</label>
                  <input
                    type="text"
                    value={newSalary}
                    onChange={(e) => setNewSalary(e.target.value)}
                    placeholder="e.g. ₹30,000 - ₹50,000 / mo"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 font-semibold focus:outline-none focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Number of Openings</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={newOpenings}
                    onChange={(e) => setNewOpenings(parseInt(e.target.value) || 1)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 font-semibold focus:outline-none focus:border-indigo-600"
                  />
                </div>
              </div>

              {/* EXPERIENCE & BOARD GRID */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Experience Required</label>
                  <select
                    value={newExp}
                    onChange={(e) => setNewExp(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 font-semibold focus:outline-none focus:border-indigo-600"
                  >
                    <option value="Fresher / 0-1 Years">Fresher / 0-1 Years</option>
                    <option value="1-3 Years">1-3 Years</option>
                    <option value="3-5 Years">3-5 Years</option>
                    <option value="5+ Years">5+ Years</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Board</label>
                  <select
                    value={newBoard}
                    onChange={(e) => setNewBoard(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 font-semibold focus:outline-none focus:border-indigo-600"
                  >
                    <option value="CBSE">CBSE</option>
                    <option value="ICSE">ICSE</option>
                    <option value="State Board">State Board</option>
                    <option value="IB / Cambridge">IB / Cambridge</option>
                  </select>
                </div>
              </div>

              {/* DESCRIPTION & REQUIREMENTS */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Job Description & Responsibilities</label>
                <textarea
                  rows={3}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Key responsibilities, teaching medium, class assignments, etc."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 font-semibold focus:outline-none focus:border-indigo-600"
                />
              </div>

              {/* SUBMIT BUTTON */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={postingJob}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>{postingJob ? "Publishing Opening..." : "Publish Vacancy on DEVAGYA"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
