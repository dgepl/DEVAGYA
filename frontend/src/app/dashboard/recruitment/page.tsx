"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Briefcase, 
  Building2, 
  Search, 
  Filter, 
  MapPin, 
  Calendar, 
  Clock, 
  DollarSign, 
  ShieldCheck, 
  Upload, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight, 
  X, 
  RefreshCw,
  Sparkles,
  Layers,
  Send,
  User,
  GraduationCap
} from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { getApiBase } from "@/lib/api";

interface Vacancy {
  id: string;
  school_id: string;
  school_name: string;
  school_city: string;
  school_state: string;
  school_logo?: string;
  title: string;
  subject: string;
  level: string;
  board: string;
  experience_required: string;
  salary_range: string;
  openings: number;
  employment_type: string;
  description: string;
  created_at: string;
}

interface Application {
  id: string;
  vacancy_id: string;
  school_name: string;
  job_title: string;
  job_subject: string;
  job_level: string;
  teacher_name: string;
  status: "submitted" | "shortlisted" | "interview" | "selected" | "rejected";
  school_feedback?: string;
  resume_filename: string;
  created_at: string;
}

export default function TeacherRecruitmentPage() {
  const { user } = useAppStore();

  const [vacancies, setVacancies] = useState<Vacancy[]>([]);
  const [myApplications, setMyApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"browse" | "applications">("browse");

  // Filter states
  const [levelFilter, setLevelFilter] = useState<string>("all");
  const [subjectFilter, setSubjectFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Application Modal state
  const [applyingVacancy, setApplyingVacancy] = useState<Vacancy | null>(null);
  const [qualification, setQualification] = useState(user.highestQualification || "B.Ed");
  const [experience, setExperience] = useState(user.totalExperience || "3–5 Years");
  const [currentSchool, setCurrentSchool] = useState(user.schoolName || "");
  const [phone, setPhone] = useState(user.phone || "");
  const [coverNote, setCoverNote] = useState("");
  
  // Resume state - strictly PDF
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [applySuccessMsg, setApplySuccessMsg] = useState<string | null>(null);

  const fetchVacancies = async () => {
    setLoading(true);
    try {
      const baseUrl = getApiBase();
      const res = await fetch(`${baseUrl}/recruitment/vacancies?status=active`);
      if (res.ok) {
        const data = await res.json();
        setVacancies(data.vacancies || []);
      }
    } catch (err) {
      console.error("Error fetching vacancies:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyApplications = async () => {
    if (!user?.email) return;
    try {
      const baseUrl = getApiBase();
      const res = await fetch(`${baseUrl}/recruitment/applications/teacher?email=${encodeURIComponent(user.email.trim().toLowerCase())}`);
      if (res.ok) {
        const data = await res.json();
        setMyApplications(data.applications || []);
      }
    } catch (err) {
      console.error("Error fetching my applications:", err);
    }
  };

  useEffect(() => {
    fetchVacancies();
    fetchMyApplications();
  }, [user?.email]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null);
    if (!e.target.files || e.target.files.length === 0) {
      setPdfFile(null);
      return;
    }

    const file = e.target.files[0];
    const extension = file.name.split(".").pop()?.toLowerCase();

    // STRICT VALIDATION: PDF ONLY
    if (extension !== "pdf" || file.type !== "application/pdf") {
      setFileError("Invalid file format! Only PDF resumes (.pdf) are accepted.");
      setPdfFile(null);
      e.target.value = "";
      return;
    }

    // Size limit: 10MB
    if (file.size > 10 * 1024 * 1024) {
      setFileError("PDF file size must be less than 10MB.");
      setPdfFile(null);
      e.target.value = "";
      return;
    }

    setPdfFile(file);
  };

  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!applyingVacancy) return;

    if (!pdfFile) {
      setFileError("Please select your resume in PDF format (.pdf) to continue.");
      return;
    }

    setSubmitting(true);
    setFileError(null);
    setApplySuccessMsg(null);

    try {
      const baseUrl = getApiBase();

      // Step 1: Upload strictly PDF resume
      const formData = new FormData();
      formData.append("file", pdfFile);

      const uploadRes = await fetch(`${baseUrl}/recruitment/upload-resume`, {
        method: "POST",
        body: formData
      });

      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) {
        throw new Error(uploadData.detail || "Failed to upload PDF resume.");
      }

      const resumeFilename = uploadData.filename;

      // Step 2: Submit candidate application
      const applyRes = await fetch(`${baseUrl}/recruitment/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vacancy_id: applyingVacancy.id,
          teacher_id: user.id || "usr-teacher",
          teacher_name: user.name || "Educator",
          teacher_email: user.email,
          teacher_phone: phone,
          qualification,
          experience,
          current_school: currentSchool,
          cover_note: coverNote,
          resume_filename: resumeFilename
        })
      });

      const applyData = await applyRes.json();
      if (!applyRes.ok) {
        throw new Error(applyData.detail || "Failed to submit application.");
      }

      setApplySuccessMsg(`Your application has been successfully sent to ${applyingVacancy.school_name}!`);
      fetchMyApplications();

      setTimeout(() => {
        setApplyingVacancy(null);
        setPdfFile(null);
        setCoverNote("");
        setApplySuccessMsg(null);
        setActiveTab("applications");
      }, 1500);

    } catch (err: any) {
      setFileError(err.message || "Failed to submit application.");
    } finally {
      setSubmitting(false);
    }
  };

  // Filtered vacancies
  const filteredVacancies = vacancies.filter(v => {
    if (levelFilter !== "all" && v.level.toLowerCase() !== levelFilter.toLowerCase()) return false;
    if (subjectFilter !== "all" && v.subject.toLowerCase() !== subjectFilter.toLowerCase()) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchTitle = v.title.toLowerCase().includes(q);
      const matchSchool = v.school_name.toLowerCase().includes(q);
      const matchCity = (v.school_city || "").toLowerCase().includes(q);
      const matchSubject = v.subject.toLowerCase().includes(q);
      if (!matchTitle && !matchSchool && !matchCity && !matchSubject) return false;
    }
    return true;
  });

  const hasAlreadyApplied = (vacancyId: string) => {
    return myApplications.some(a => a.vacancy_id === vacancyId);
  };

  return (
    <div className="space-y-6 pb-24 px-1 max-w-6xl mx-auto">
      
      {/* 1. HERO HEADER */}
      <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 text-white p-6 sm:p-8 rounded-[28px] shadow-2xl border border-indigo-800/40 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 relative z-10 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider bg-white/10 px-3 py-1 rounded-full text-indigo-200 border border-white/15">
              DEVGYA TEACHER RECRUITMENT PORTAL
            </span>
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/20 border border-emerald-400/30 px-2.5 py-1 rounded-full flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              Verified CBSE / ICSE Schools
            </span>
          </div>

          <h1 className="text-xl sm:text-3xl font-black tracking-tight leading-tight">
            School Vacancies & Educator Hiring
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 font-medium">
            Explore active openings across verified partner schools and apply directly with your PDF resume.
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex bg-white/10 p-1.5 rounded-2xl border border-white/15 relative z-10 shrink-0">
          <button
            onClick={() => setActiveTab("browse")}
            className={`px-4 py-2 text-xs font-black rounded-xl transition-all ${
              activeTab === "browse" ? "bg-white text-slate-950 shadow-md" : "text-white/80 hover:text-white"
            }`}
          >
            Browse Openings ({vacancies.length})
          </button>
          <button
            onClick={() => setActiveTab("applications")}
            className={`px-4 py-2 text-xs font-black rounded-xl transition-all ${
              activeTab === "applications" ? "bg-white text-slate-950 shadow-md" : "text-white/80 hover:text-white"
            }`}
          >
            My Applications ({myApplications.length})
          </button>
        </div>
      </div>

      {/* 2. TAB: BROWSE OPENINGS */}
      {activeTab === "browse" && (
        <div className="space-y-4">
          
          {/* SEARCH & FILTERS BAR */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm flex flex-col md:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by school, subject, city, or job title..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 font-semibold"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-500">Level:</span>
                <select
                  value={levelFilter}
                  onChange={(e) => setLevelFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none"
                >
                  <option value="all">All Levels</option>
                  <option value="PGT">PGT (Classes 11–12)</option>
                  <option value="TGT">TGT (Classes 6–10)</option>
                  <option value="PRT">PRT (Classes 1–5)</option>
                  <option value="NTT">NTT / Pre-Primary</option>
                  <option value="Activity/Sports">Activity / Sports</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-500">Subject:</span>
                <select
                  value={subjectFilter}
                  onChange={(e) => setSubjectFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none"
                >
                  <option value="all">All Subjects</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="Physics">Physics</option>
                  <option value="Chemistry">Chemistry</option>
                  <option value="Biology">Biology</option>
                  <option value="Science">Science</option>
                  <option value="English">English</option>
                  <option value="Hindi">Hindi</option>
                  <option value="Social Science">Social Science</option>
                  <option value="Computer Science">Computer Science</option>
                </select>
              </div>
            </div>
          </div>

          {/* VACANCY CARDS */}
          {loading ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200/80">
              <RefreshCw className="w-6 h-6 animate-spin text-indigo-600 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-500">Loading vacancies from verified schools...</p>
            </div>
          ) : filteredVacancies.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200/80 space-y-2">
              <Briefcase className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="text-sm font-bold text-slate-900">No vacancies match your criteria</h3>
              <p className="text-xs text-slate-500">
                Try clearing or adjusting your subject and teaching level filters.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredVacancies.map(vac => {
                const applied = hasAlreadyApplied(vac.id);
                return (
                  <div 
                    key={vac.id} 
                    className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4 hover:border-indigo-300 transition-all flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800">
                              {vac.level}
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                              {vac.subject}
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                              {vac.board}
                            </span>
                          </div>
                          <h3 className="text-base font-black text-slate-900 mt-1.5 leading-snug">
                            {vac.title}
                          </h3>
                        </div>

                        <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full flex items-center gap-1 shrink-0">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          Verified
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-slate-700 font-bold">
                        <Building2 className="w-4 h-4 text-indigo-600 shrink-0" />
                        <span>{vac.school_name}</span>
                        {vac.school_city && (
                          <span className="text-slate-400 font-medium flex items-center gap-0.5">
                            • <MapPin className="w-3 h-3" /> {vac.school_city}, {vac.school_state}
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <div>
                          <span className="text-slate-400 font-semibold block">Experience:</span>
                          <span className="font-bold text-slate-800">{vac.experience_required}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 font-semibold block">Salary:</span>
                          <span className="font-bold text-slate-800">{vac.salary_range}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 font-semibold block">Type:</span>
                          <span className="font-bold text-slate-800">{vac.employment_type}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 font-semibold block">Openings:</span>
                          <span className="font-bold text-slate-800">{vac.openings} Seat(s)</span>
                        </div>
                      </div>

                      {vac.description && (
                        <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                          {vac.description}
                        </p>
                      )}
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                      <span className="text-[10px] text-slate-400">
                        Posted: {new Date(vac.created_at).toLocaleDateString()}
                      </span>

                      {applied ? (
                        <span className="px-4 py-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold rounded-xl flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          Applied
                        </span>
                      ) : (
                        <button
                          onClick={() => setApplyingVacancy(vac)}
                          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold rounded-xl shadow-md shadow-indigo-600/25 transition-all flex items-center gap-1.5 active:scale-95"
                        >
                          <Send className="w-3.5 h-3.5" />
                          Apply with PDF CV
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 3. TAB: MY APPLICATIONS */}
      {activeTab === "applications" && (
        <div className="space-y-4">
          <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">
            My Submitted Applications ({myApplications.length})
          </h2>

          {myApplications.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200/80 space-y-2">
              <FileText className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="text-sm font-bold text-slate-900">No applications submitted yet</h3>
              <p className="text-xs text-slate-500">
                Browse open teaching vacancies and submit your resume to start receiving interview calls.
              </p>
              <button
                onClick={() => setActiveTab("browse")}
                className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl shadow-md mt-2"
              >
                Browse Open Vacancies
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {myApplications.map(app => (
                <div key={app.id} className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-3">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-100 text-indigo-800">
                          {app.job_level} • {app.job_subject}
                        </span>
                        <h3 className="text-sm font-black text-slate-900">{app.job_title}</h3>
                      </div>
                      <p className="text-xs text-slate-500 font-bold mt-0.5 flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                        {app.school_name}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full ${
                        app.status === "shortlisted" ? "bg-amber-100 text-amber-800 border border-amber-300" :
                        app.status === "interview" ? "bg-purple-100 text-purple-800 border border-purple-300" :
                        app.status === "selected" ? "bg-emerald-100 text-emerald-800 border border-emerald-300" :
                        app.status === "rejected" ? "bg-rose-100 text-rose-800 border border-rose-300" :
                        "bg-blue-100 text-blue-800 border border-blue-200"
                      }`}>
                        Status: {app.status}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between text-xs text-slate-600 gap-2">
                    <span className="text-[10px] text-slate-400">
                      Applied: {new Date(app.created_at).toLocaleString()}
                    </span>

                    {app.resume_filename && (
                      <a
                        href={`${getApiBase()}/recruitment/resumes/${app.resume_filename}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        View Uploaded PDF Resume
                      </a>
                    )}
                  </div>

                  {app.school_feedback && (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900">
                      <strong className="block text-[10px] uppercase font-black">Message from School:</strong>
                      {app.school_feedback}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* RECRUITMENT HELPLINE FOOTER */}
      <div className="p-4 bg-indigo-50/60 border border-indigo-100 rounded-2xl text-xs text-indigo-950 flex flex-col sm:flex-row items-center justify-between gap-2 shadow-2xs">
        <span className="font-semibold">Questions about recruitment or career opportunities?</span>
        <a 
          href="mailto:dgepl.info@gmail.com" 
          className="font-extrabold text-indigo-700 underline hover:text-indigo-900"
        >
          Email Support: dgepl.info@gmail.com
        </a>
      </div>

      {/* 4. APPLY MODAL (STRICTLY PDF RESUME) */}
      {applyingVacancy && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5 relative my-8 animate-in fade-in zoom-in-95 duration-200">
            
            <button
              onClick={() => {
                setApplyingVacancy(null);
                setPdfFile(null);
                setFileError(null);
              }}
              className="absolute right-5 top-5 p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600">
                Application Form
              </span>
              <h2 className="text-lg font-black text-slate-900">
                {applyingVacancy.title}
              </h2>
              <p className="text-xs text-slate-500 font-semibold flex items-center gap-1 mt-0.5">
                <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                {applyingVacancy.school_name}
              </p>
            </div>

            {applySuccessMsg && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{applySuccessMsg}</span>
              </div>
            )}

            {fileError && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{fileError}</span>
              </div>
            )}

            <form onSubmit={handleSubmitApplication} className="space-y-4">
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Highest Qualification</label>
                  <input
                    type="text"
                    value={qualification}
                    onChange={(e) => setQualification(e.target.value)}
                    placeholder="e.g. M.Sc, B.Ed"
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:border-indigo-600"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Teaching Experience</label>
                  <input
                    type="text"
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    placeholder="e.g. 4 Years"
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:border-indigo-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Contact Phone</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 9876543210"
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:border-indigo-600"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Current School (if any)</label>
                  <input
                    type="text"
                    value={currentSchool}
                    onChange={(e) => setCurrentSchool(e.target.value)}
                    placeholder="Current institution"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:border-indigo-600"
                  />
                </div>
              </div>

              {/* STRICTLY PDF FILE UPLOAD */}
              <div>
                <label className="block text-[11px] font-black text-slate-900 uppercase tracking-wider mb-1">
                  Upload Resume / CV (PDF Format Only) *
                </label>
                <div className={`p-4 border-2 border-dashed rounded-2xl text-center cursor-pointer transition-all ${
                  pdfFile ? "border-emerald-400 bg-emerald-50/50" : "border-indigo-200 bg-indigo-50/40 hover:bg-indigo-50"
                }`}>
                  <input
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={handleFileChange}
                    id="resume-pdf-upload"
                    className="hidden"
                  />
                  <label htmlFor="resume-pdf-upload" className="cursor-pointer block space-y-1">
                    <FileText className={`w-8 h-8 mx-auto ${pdfFile ? "text-emerald-600" : "text-indigo-600"}`} />
                    <p className="text-xs font-black text-slate-800">
                      {pdfFile ? pdfFile.name : "Click to select your PDF resume"}
                    </p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                      Strictly .PDF only (Max 10MB)
                    </p>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Brief Note / Message to School</label>
                <textarea
                  rows={2}
                  value={coverNote}
                  onChange={(e) => setCoverNote(e.target.value)}
                  placeholder="Introduce your pedagogical background and key CBSE achievements..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 font-semibold"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setApplyingVacancy(null)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-black rounded-xl shadow-lg shadow-indigo-600/30 flex items-center gap-2 active:scale-95"
                >
                  {submitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  Submit Application
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
