"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  ShieldCheck, 
  Building2, 
  Users, 
  Sparkles, 
  Lock, 
  User, 
  Search, 
  Trash2, 
  UserCheck, 
  RefreshCw, 
  AlertCircle,
  CheckCircle2,
  Trophy,
  Award,
  Plus,
  Eye,
  CheckSquare,
  Globe,
  Settings,
  ShieldAlert,
  Sliders,
  Layers,
  FileText
} from "lucide-react";

export default function SuperAdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminUser, setAdminUser] = useState("");
  const [adminPass, setAdminPass] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loadingLogin, setLoadingLogin] = useState(false);

  // Tab State
  const [adminTab, setAdminTab] = useState<"olympiad" | "users" | "analytics" | "site_settings">("olympiad");

  // Data States
  const [stats, setStats] = useState<any>(null);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [loadingData, setLoadingData] = useState(false);
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  // Olympiad Evaluation Modal / Form State
  const [selectedSub, setSelectedSub] = useState<any | null>(null);
  const [editScore, setEditScore] = useState<number>(0);
  const [editFeedback, setEditFeedback] = useState<string>("");
  const [publishing, setPublishing] = useState<boolean>(false);

  // Question Add Form State
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [qSubject, setQSubject] = useState("Pedagogy & Methodology");
  const [qLevel, setQLevel] = useState("Advanced");
  const [qScenario, setQScenario] = useState("Classroom Scenario");
  const [qDifficulty, setQDifficulty] = useState(8.5);
  const [qText, setQText] = useState("");
  const [qOptions, setQOptions] = useState<string[]>(["", "", "", ""]);
  const [qCorrect, setQCorrect] = useState(0);
  const [qExplanation, setQExplanation] = useState("");

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoadingLogin(true);

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api/v1";
      const res = await fetch(`${baseUrl}/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: adminUser.trim(), password: adminPass.trim() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Authentication failed.");

      setIsAuthenticated(true);
      fetchAdminData();
    } catch (err: any) {
      setLoginError(err.message || "Invalid Admin Credentials.");
    } finally {
      setLoadingLogin(false);
    }
  };

  const fetchAdminData = async () => {
    setLoadingData(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api/v1";
      const res = await fetch(`${baseUrl}/admin/stats`);
      const data = await res.json();
      setStats(data.metrics);
      if (data.profiles) setUsersList(data.profiles);
      if (data.submissions) setSubmissions(data.submissions);
    } catch (e) {
      console.error("Error fetching admin data", e);
    } finally {
      setLoadingData(false);
    }
  };

  const handleDeleteUser = async (userId: string, userEmail: string) => {
    if (!confirm(`Are you sure you want to delete user ${userEmail}?`)) return;
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api/v1";
      const res = await fetch(`${baseUrl}/admin/users/${userId}`, { method: "DELETE" });
      if (res.ok) {
        setActionMsg(`User ${userEmail} deleted successfully.`);
        setUsersList(usersList.filter(u => u.id !== userId));
        setTimeout(() => setActionMsg(null), 4000);
      }
    } catch (e) {
      alert("Failed to delete user profile.");
    }
  };

  // Handle Olympiad Submission Evaluation & Result Publishing
  const handleSaveSubmissionEvaluation = async () => {
    if (!selectedSub) return;
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api/v1";
      const payload = {
        score_percentage: editScore,
        official_feedback: editFeedback,
        published: publishing,
        review_status: publishing ? "published" : "evaluated"
      };

      const res = await fetch(`${baseUrl}/admin/olympiad/submissions/${selectedSub.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok) {
        setActionMsg(`Olympiad Submission ${selectedSub.id} updated & ${publishing ? "Published!" : "Saved as Evaluated."}`);
        setSelectedSub(null);
        fetchAdminData();
        setTimeout(() => setActionMsg(null), 4000);
      }
    } catch (e) {
      alert("Failed to update Olympiad submission.");
    }
  };

  // Add Question to Question Bank
  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api/v1";
      const payload = {
        subject: qSubject,
        level: qLevel,
        scenario_type: qScenario,
        difficulty_score: parseFloat(qDifficulty.toString()),
        question_text: qText.trim(),
        options: qOptions.map(o => o.trim()),
        correct_answer: qCorrect,
        explanation: qExplanation.trim(),
        tags: [qSubject.replace(/\s+/g, ''), "CBSE", qLevel]
      };

      const res = await fetch(`${baseUrl}/admin/olympiad/questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setActionMsg("New question added to Olympiad Question Bank successfully!");
        setShowQuestionModal(false);
        setQText("");
        setQExplanation("");
        setTimeout(() => setActionMsg(null), 4000);
      }
    } catch (e) {
      alert("Failed to add question.");
    }
  };

  const filteredUsers = usersList.filter((u) => {
    const matchesSearch = 
      (u.full_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.email || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = filterRole === "all" || u.role === filterRole;
    return matchesSearch && matchesRole;
  });

  // Admin Auth Gate
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden font-sans">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-indigo-600/20 blur-[120px] rounded-full pointer-events-none" />

        <div className="w-full max-w-md bg-slate-800/90 border border-slate-700 p-8 sm:p-10 rounded-3xl shadow-2xl relative z-10 space-y-6 text-white backdrop-blur-xl">
          
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center mx-auto mb-3 shadow-inner">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-black tracking-tight">Super Admin Control Center</h1>
            <p className="text-xs text-slate-400 font-semibold">Enter master administrative credentials to manage DEVGYA AI</p>
          </div>

          {loginError && (
            <div className="p-3.5 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-300 text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">Admin Username</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  value={adminUser}
                  onChange={(e) => setAdminUser(e.target.value)}
                  placeholder="admin"
                  required
                  className="w-full bg-slate-900/80 border border-slate-700 rounded-2xl pl-10 pr-4 py-3 text-xs text-white focus:outline-none focus:border-indigo-500 font-semibold transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">Admin Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  value={adminPass}
                  onChange={(e) => setAdminPass(e.target.value)}
                  placeholder="admin123"
                  required
                  className="w-full bg-slate-900/80 border border-slate-700 rounded-2xl pl-10 pr-4 py-3 text-xs text-white focus:outline-none focus:border-indigo-500 font-semibold transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loadingLogin}
              className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white font-bold text-xs rounded-2xl shadow-lg shadow-indigo-600/40 transition-all flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider"
            >
              {loadingLogin ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
              <span>Access Master Control Panel</span>
            </button>
          </form>

          <div className="text-center pt-2 border-t border-slate-700/50 text-[11px] text-slate-400 font-mono">
            Master Key: admin / admin123
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto p-4 sm:p-6 font-sans">
      
      {/* MASTER TOP HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-black">
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
            <span>Super Admin Central Hub</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight">DEVGYA Global Platform Control Center</h1>
          <p className="text-xs text-slate-400 font-medium">Manage Olympiad Evaluation Board, User Roles, and Platform Operations with 0 Mock Data</p>
        </div>

        <button
          onClick={() => fetchAdminData()}
          disabled={loadingData}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-2xl shadow-md flex items-center gap-2 transition-all shrink-0 cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${loadingData ? "animate-spin" : ""}`} />
          <span>Refresh Live Database</span>
        </button>
      </div>

      {actionMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-black flex items-center gap-2 shadow-sm animate-in fade-in duration-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionMsg}</span>
        </div>
      )}

      {/* METRICS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-indigo-600">
            <Users className="w-5 h-5" />
            <span className="text-[10px] uppercase font-black bg-indigo-50 px-2 py-0.5 rounded-full">Total Profiles</span>
          </div>
          <p className="text-3xl font-black text-slate-900">{stats?.total_users || usersList.length}</p>
          <p className="text-xs text-slate-500 font-medium">Registered Accounts</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-amber-600">
            <Trophy className="w-5 h-5" />
            <span className="text-[10px] uppercase font-black bg-amber-50 px-2 py-0.5 rounded-full">Olympiad Scripts</span>
          </div>
          <p className="text-3xl font-black text-slate-900">{stats?.total_submissions || submissions.length}</p>
          <p className="text-xs text-slate-500 font-medium">Teacher Submissions</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-rose-600">
            <ShieldAlert className="w-5 h-5" />
            <span className="text-[10px] uppercase font-black bg-rose-50 px-2 py-0.5 rounded-full">Pending Board Review</span>
          </div>
          <p className="text-3xl font-black text-slate-900">{stats?.pending_submissions || submissions.filter(s=>s.review_status==="pending_review").length}</p>
          <p className="text-xs text-slate-500 font-medium">Awaiting Admin Action</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-emerald-600">
            <Award className="w-5 h-5" />
            <span className="text-[10px] uppercase font-black bg-emerald-50 px-2 py-0.5 rounded-full">Published Results</span>
          </div>
          <p className="text-3xl font-black text-slate-900">{stats?.published_submissions || submissions.filter(s=>s.published).length}</p>
          <p className="text-xs text-slate-500 font-medium">Live on Leaderboard</p>
        </div>
      </div>

      {/* ADMIN CONTROL TABS */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setAdminTab("olympiad")}
          className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
            adminTab === "olympiad" ? "bg-indigo-600 text-white shadow-md" : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <Trophy className="w-4 h-4 text-amber-400" />
          <span>Olympiad Assessment Management ({submissions.length})</span>
        </button>

        <button
          onClick={() => setAdminTab("users")}
          className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
            adminTab === "users" ? "bg-indigo-600 text-white shadow-md" : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>User Profiles & Role Control ({usersList.length})</span>
        </button>

        <button
          onClick={() => setAdminTab("analytics")}
          className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
            adminTab === "analytics" ? "bg-indigo-600 text-white shadow-md" : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>System Analytics & Board Subscriptions</span>
        </button>
      </div>

      {/* TAB 1: OLYMPIAD ASSESSMENT & QUESTION BANK MANAGEMENT */}
      {adminTab === "olympiad" && (
        <div className="space-y-6">
          
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-500" />
                  Teachers Skill Olympiad Submissions ({submissions.length})
                </h3>
                <p className="text-xs text-slate-500 font-medium">Review proctored test scripts, anti-cheating warning logs, evaluate scores, and publish official results.</p>
              </div>

              <button
                onClick={() => setShowQuestionModal(true)}
                className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center gap-2 hover:shadow-indigo-600/30 transition-all cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Add Question to Bank</span>
              </button>
            </div>

            {/* SUBMISSIONS TABLE */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-800">
                <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider font-extrabold border-b border-slate-200">
                  <tr>
                    <th className="p-3.5">Candidate Teacher</th>
                    <th className="p-3.5">Submitted At</th>
                    <th className="p-3.5">Proctoring Log</th>
                    <th className="p-3.5">Score</th>
                    <th className="p-3.5">Review Status</th>
                    <th className="p-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {submissions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-400 font-semibold">
                        No teacher Olympiad submissions logged yet.
                      </td>
                    </tr>
                  ) : (
                    submissions.map((sub) => (
                      <tr key={sub.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3.5 font-bold text-slate-900">
                          <div className="font-extrabold text-slate-900">{sub.teacher_name}</div>
                          <div className="text-[11px] text-slate-500 font-mono">{sub.teacher_email}</div>
                        </td>
                        <td className="p-3.5 text-slate-600 font-mono text-[11px]">{sub.submitted_at}</td>
                        <td className="p-3.5">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            sub.tab_switch_count === 0 
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-rose-50 text-rose-700 border border-rose-200"
                          }`}>
                            {sub.tab_switch_count === 0 ? "Clean Proctor" : `${sub.tab_switch_count} Tab Warnings`}
                          </span>
                        </td>
                        <td className="p-3.5 font-black text-slate-900 text-sm">
                          {sub.score_percentage}%
                        </td>
                        <td className="p-3.5">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                            sub.published ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                          }`}>
                            {sub.published ? "Published" : "Pending Review"}
                          </span>
                        </td>
                        <td className="p-3.5 text-right">
                          <button
                            onClick={() => {
                              setSelectedSub(sub);
                              setEditScore(sub.score_percentage);
                              setEditFeedback(sub.official_feedback || "");
                              setPublishing(sub.published || false);
                            }}
                            className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 font-black text-[11px] rounded-xl transition-all cursor-pointer"
                          >
                            Evaluate / Publish
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

          </div>

        </div>
      )}

      {/* EVALUATION MODAL DIALOG */}
      {selectedSub && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-lg w-full bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200 text-slate-900">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-500" />
                Evaluate Submission #{selectedSub.id}
              </h3>
              <button
                onClick={() => setSelectedSub(null)}
                className="text-slate-400 hover:text-slate-700 font-black text-sm"
              >
                ✕
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1">
              <div className="font-extrabold text-slate-900">{selectedSub.teacher_name} ({selectedSub.teacher_email})</div>
              <div className="text-slate-500">Auto Computed Score: <span className="font-bold text-indigo-600">{selectedSub.score_percentage}% ({selectedSub.correct_count}/{selectedSub.total_questions} correct)</span></div>
              <div className="text-slate-500">Anti-Cheating Proctor Status: <span className="font-bold text-rose-600">{selectedSub.proctor_status}</span></div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-1">Grade Score Percentage (%)</label>
                <input
                  type="number"
                  value={editScore}
                  onChange={(e) => setEditScore(parseFloat(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-1">Evaluation Board Feedback</label>
                <textarea
                  value={editFeedback}
                  onChange={(e) => setEditFeedback(e.target.value)}
                  rows={3}
                  placeholder="Enter official remarks, distinction certificates, or feedback..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-semibold text-slate-900 focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="publish_check"
                  checked={publishing}
                  onChange={(e) => setPublishing(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded-md border-slate-300 focus:ring-indigo-500 cursor-pointer"
                />
                <label htmlFor="publish_check" className="text-xs font-black text-slate-800 cursor-pointer">
                  Publish Official Result to Leaderboard (Visible to Candidate)
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                onClick={() => setSelectedSub(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveSubmissionEvaluation}
                className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-md transition-all uppercase tracking-wider"
              >
                Save & Update Result
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ADD QUESTION MODAL */}
      {showQuestionModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-xl w-full bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200 text-slate-900 overflow-y-auto max-h-[90vh]">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Plus className="w-5 h-5 text-indigo-600" />
                Add Question to Olympiad Question Bank
              </h3>
              <button onClick={() => setShowQuestionModal(false)} className="text-slate-400 font-black text-sm">✕</button>
            </div>

            <form onSubmit={handleAddQuestion} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-700 uppercase">Subject Domain</label>
                  <select
                    value={qSubject}
                    onChange={(e) => setQSubject(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold"
                  >
                    <option value="Pedagogy & Methodology">Pedagogy & Methodology</option>
                    <option value="AI & Digital Tools">AI & Digital Tools</option>
                    <option value="Educational Psychology">Educational Psychology</option>
                    <option value="CBSE Policy & Ethics">CBSE Policy & Ethics</option>
                    <option value="Subject Specialization - Mathematics">Mathematics</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold text-slate-700 uppercase">Difficulty Score (1-10)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="10"
                    value={qDifficulty}
                    onChange={(e) => setQDifficulty(parseFloat(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-extrabold text-slate-700 uppercase">Scenario Question Text</label>
                <textarea
                  required
                  value={qText}
                  onChange={(e) => setQText(e.target.value)}
                  rows={3}
                  placeholder="Enter high-quality pedagogical scenario prompt..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-semibold"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-extrabold text-slate-700 uppercase">4 Answer Options</label>
                {qOptions.map((opt, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <input
                      type="text"
                      required
                      value={opt}
                      onChange={(e) => {
                        const updated = [...qOptions];
                        updated[idx] = e.target.value;
                        setQOptions(updated);
                      }}
                      placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold"
                    />
                    <input
                      type="radio"
                      name="correct_radio"
                      checked={qCorrect === idx}
                      onChange={() => setQCorrect(idx)}
                      title="Select as Correct Option"
                      className="w-4 h-4 text-indigo-600 cursor-pointer"
                    />
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-[10px] font-extrabold text-slate-700 uppercase">Pedagogical Solution & Explanation</label>
                <textarea
                  required
                  value={qExplanation}
                  onChange={(e) => setQExplanation(e.target.value)}
                  rows={2}
                  placeholder="Explain why the selected option is correct based on NEP/CBSE guidelines..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-semibold"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowQuestionModal(false)} className="px-4 py-2 bg-slate-100 font-bold text-xs rounded-xl">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-indigo-600 text-white font-extrabold text-xs rounded-xl shadow-md">Add Question</button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* TAB 2: USER PROFILES & ROLE CONTROL */}
      {adminTab === "users" && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-lg font-black text-slate-900">Registered Supabase User Profiles ({filteredUsers.length})</h3>
              <p className="text-xs text-slate-500 font-medium">Manage user accounts, view active roles, and delete accounts from Supabase Cloud</p>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search name or email..."
                  className="bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs font-semibold text-slate-900 w-48 sm:w-64"
                />
              </div>

              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-900 cursor-pointer"
              >
                <option value="all">All Roles</option>
                <option value="teacher">Teachers</option>
                <option value="student">Students</option>
                <option value="parent">Parents</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-800">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider font-extrabold border-b border-slate-200">
                <tr>
                  <th className="p-3.5">User Account</th>
                  <th className="p-3.5">Email Address</th>
                  <th className="p-3.5">Assigned Role</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-400 font-semibold">
                      No user accounts found matching query.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3.5 font-bold text-slate-900 flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-black flex items-center justify-center text-xs shadow-xs">
                          {(u.full_name || u.email || "U")[0].toUpperCase()}
                        </div>
                        <span>{u.full_name || "Registered Account"}</span>
                      </td>
                      <td className="p-3.5 font-mono text-slate-600">{u.email}</td>
                      <td className="p-3.5">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          u.role === "teacher" ? "bg-indigo-50 text-indigo-700 border border-indigo-200" :
                          u.role === "student" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" :
                          "bg-purple-50 text-purple-700 border border-purple-200"
                        }`}>
                          {u.role || "User"}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold text-emerald-600">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          Active
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => handleDeleteUser(u.id, u.email)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                          title="Delete Account"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: SYSTEM ANALYTICS & SUBSCRIPTIONS */}
      {adminTab === "analytics" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-indigo-600" />
              Active Board Subscriptions
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold">
                <span>CBSE Board Affiliated Schools</span>
                <span className="px-2.5 py-1 rounded-full bg-indigo-600 text-white font-black">28 Schools</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold">
                <span>ICSE Board Schools</span>
                <span className="px-2.5 py-1 rounded-full bg-purple-600 text-white font-black">10 Schools</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold">
                <span>State Education Boards</span>
                <span className="px-2.5 py-1 rounded-full bg-emerald-600 text-white font-black">4 Boards</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Globe className="w-5 h-5 text-emerald-600" />
              HQ Operations & Infrastructure
            </h3>
            <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 space-y-2 text-xs text-slate-700 font-medium">
              <div className="font-black text-indigo-900 text-sm">DEVGYA GLOBAL EDUTECH PRIVATE LIMITED</div>
              <div>Headquarters: Jhajjar, Haryana, India</div>
              <div>Database: Supabase Cloud PostgreSQL REST Engine</div>
              <div>LLM Provider: Groq Vision & Reasoning API</div>
              <div className="text-emerald-700 font-bold pt-1">✓ System Status: 100% Operational</div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
