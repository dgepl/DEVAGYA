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
  FileText,
  Wand2,
  BookOpen,
  Printer,
  FileCheck
} from "lucide-react";

export default function SuperAdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminUser, setAdminUser] = useState("");
  const [adminPass, setAdminPass] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loadingLogin, setLoadingLogin] = useState(false);

  // Main Tab State
  const [adminTab, setAdminTab] = useState<"olympiad" | "paper_studio" | "users" | "analytics">("paper_studio");

  // Paper Studio Sub-Tab State
  const [paperStudioSubTab, setPaperStudioSubTab] = useState<"ai_prompt" | "manual_builder" | "repository">("ai_prompt");

  // Data States
  const [stats, setStats] = useState<any>(null);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [papersList, setPapersList] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [loadingData, setLoadingData] = useState(false);
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  // Olympiad Evaluation Modal State
  const [selectedSub, setSelectedSub] = useState<any | null>(null);
  const [editScore, setEditScore] = useState<number>(0);
  const [editFeedback, setEditFeedback] = useState<string>("");
  const [publishing, setPublishing] = useState<boolean>(false);

  // AI Prompt Generator Form State
  const [aiPromptText, setAiPromptText] = useState("Create an official Class 10 CBSE Science Examination Paper focusing on Light Reflection, Refraction, and Electricity with HOTS questions.");
  const [aiTitle, setAiTitle] = useState("Class 10 CBSE Science Mid-Term Exam");
  const [aiClass, setAiClass] = useState("Class 10");
  const [aiSubject, setAiSubject] = useState("Science");
  const [aiBoard, setAiBoard] = useState("CBSE");
  const [aiDifficulty, setAiDifficulty] = useState("medium");
  const [aiTotalMarks, setAiTotalMarks] = useState(40);
  const [aiTimeMins, setAiTimeMins] = useState(90);
  const [generatingAiPaper, setGeneratingAiPaper] = useState(false);

  // Manual Paper Builder State
  const [manualTitle, setManualTitle] = useState("");
  const [manualClass, setManualClass] = useState("Class 10");
  const [manualSubject, setManualSubject] = useState("Science");
  const [manualBoard, setManualBoard] = useState("CBSE");
  const [manualSchool, setManualSchool] = useState("DEVGYA GLOBAL ACADEMY");
  const [manualMarks, setManualMarks] = useState(40);
  const [manualTime, setManualTime] = useState(90);
  const [manualQuestions, setManualQuestions] = useState<any[]>([
    {
      id: 1,
      question_number: 1,
      question_type: "mcq",
      question_text: "What is the SI unit of electric current?",
      marks: 1,
      options: ["(A) Ampere", "(B) Volt", "(C) Ohm", "(D) Joule"],
      answer: "(A) Ampere",
      explanation: "Electric current is measured in Amperes (A)."
    }
  ]);
  const [savingManualPaper, setSavingManualPaper] = useState(false);

  // Paper Preview Modal State
  const [previewPaper, setPreviewPaper] = useState<any | null>(null);

  // Olympiad Question Add Form State
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
      if (data.papers) setPapersList(data.papers);
    } catch (e) {
      console.error("Error fetching admin data", e);
    } finally {
      setLoadingData(false);
    }
  };

  // Generate Paper with AI via Prompt
  const handleGenerateAiPaper = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneratingAiPaper(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api/v1";
      const payload = {
        prompt_text: aiPromptText.trim(),
        title: aiTitle.trim(),
        class_name: aiClass,
        subject: aiSubject,
        board: aiBoard,
        difficulty: aiDifficulty,
        total_marks: aiTotalMarks,
        time_allowed_mins: aiTimeMins,
        school_name: "DEVGYA GLOBAL EDUTECH"
      };

      const res = await fetch(`${baseUrl}/admin/papers/ai-generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok && data.paper) {
        setActionMsg(`AI Paper "${data.paper.title}" generated and published to repository!`);
        fetchAdminData();
        setPreviewPaper(data.paper);
        setPaperStudioSubTab("repository");
        setTimeout(() => setActionMsg(null), 5000);
      } else {
        alert(data.detail || "Failed to generate paper with AI.");
      }
    } catch (err) {
      alert("Error calling AI Paper Generator.");
    } finally {
      setGeneratingAiPaper(false);
    }
  };

  // Save Manual Paper
  const handleSaveManualPaper = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualTitle.trim()) {
      alert("Please enter a Paper Title.");
      return;
    }
    setSavingManualPaper(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api/v1";
      const payload = {
        title: manualTitle.trim(),
        class_name: manualClass,
        subject: manualSubject,
        board: manualBoard,
        school_name: manualSchool,
        total_marks: manualMarks,
        time_allowed_mins: manualTime,
        instructions: [
          "All questions are compulsory.",
          "Write neat and clean diagrams wherever required."
        ],
        questions: manualQuestions
      };

      const res = await fetch(`${baseUrl}/admin/papers/manual`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok && data.paper) {
        setActionMsg(`Manual Paper "${data.paper.title}" constructed and saved successfully!`);
        fetchAdminData();
        setPaperStudioSubTab("repository");
        setTimeout(() => setActionMsg(null), 5000);
      }
    } catch (err) {
      alert("Failed to save manual paper.");
    } finally {
      setSavingManualPaper(false);
    }
  };

  // Delete Paper
  const handleDeletePaper = async (paperId: string) => {
    if (!confirm("Are you sure you want to delete this question paper?")) return;
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api/v1";
      const res = await fetch(`${baseUrl}/admin/papers/${paperId}`, { method: "DELETE" });
      if (res.ok) {
        setActionMsg("Question paper deleted successfully.");
        setPapersList(prev => prev.filter(p => p.id !== paperId));
        setTimeout(() => setActionMsg(null), 4000);
      }
    } catch (err) {
      alert("Failed to delete paper.");
    }
  };

  // Add Question to Manual Builder
  const handleAddManualQuestion = () => {
    setManualQuestions(prev => [
      ...prev,
      {
        id: prev.length + 1,
        question_number: prev.length + 1,
        question_type: "mcq",
        question_text: "",
        marks: 1,
        options: ["(A) ", "(B) ", "(C) ", "(D) "],
        answer: "(A) ",
        explanation: ""
      }
    ]);
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
            <p className="text-xs text-slate-400 font-semibold">Master Administrative Management Portal</p>
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
            Master Credentials: admin / admin123
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
            <span>Super Admin Paper Studio & Control Center</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight">DEVGYA Global Platform Master Control</h1>
          <p className="text-xs text-slate-400 font-medium">Manage Paper Studio (AI Prompt Paper Maker & Manual Builder), Olympiad Evaluation, and Platform Users</p>
        </div>

        <button
          onClick={() => fetchAdminData()}
          disabled={loadingData}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-2xl shadow-md flex items-center gap-2 transition-all shrink-0 cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${loadingData ? "animate-spin" : ""}`} />
          <span>Refresh Database</span>
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
            <FileText className="w-5 h-5" />
            <span className="text-[10px] uppercase font-black bg-indigo-50 px-2 py-0.5 rounded-full">Paper Studio</span>
          </div>
          <p className="text-3xl font-black text-slate-900">{stats?.total_papers || papersList.length}</p>
          <p className="text-xs text-slate-500 font-medium">Generated Question Papers</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-amber-600">
            <Trophy className="w-5 h-5" />
            <span className="text-[10px] uppercase font-black bg-amber-50 px-2 py-0.5 rounded-full">Olympiad Submissions</span>
          </div>
          <p className="text-3xl font-black text-slate-900">{stats?.total_submissions || submissions.length}</p>
          <p className="text-xs text-slate-500 font-medium">Teacher Assessment Scripts</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-emerald-600">
            <Users className="w-5 h-5" />
            <span className="text-[10px] uppercase font-black bg-emerald-50 px-2 py-0.5 rounded-full">User Profiles</span>
          </div>
          <p className="text-3xl font-black text-slate-900">{stats?.total_users || usersList.length}</p>
          <p className="text-xs text-slate-500 font-medium">Registered Accounts</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-purple-600">
            <Building2 className="w-5 h-5" />
            <span className="text-[10px] uppercase font-black bg-purple-50 px-2 py-0.5 rounded-full">HQ Operations</span>
          </div>
          <p className="text-3xl font-black text-slate-900">Jhajjar, HR</p>
          <p className="text-xs text-slate-500 font-medium">Headquarters</p>
        </div>
      </div>

      {/* ADMIN CONTROL MAIN TABS */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setAdminTab("paper_studio")}
          className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
            adminTab === "paper_studio" ? "bg-indigo-600 text-white shadow-md" : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <Wand2 className="w-4 h-4 text-amber-300" />
          <span>Super Admin Paper Studio ({papersList.length})</span>
        </button>

        <button
          onClick={() => setAdminTab("olympiad")}
          className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
            adminTab === "olympiad" ? "bg-indigo-600 text-white shadow-md" : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <Trophy className="w-4 h-4 text-amber-400" />
          <span>Olympiad Evaluation Board ({submissions.length})</span>
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
      </div>

      {/* TAB 1: SUPER ADMIN PAPER STUDIO */}
      {adminTab === "paper_studio" && (
        <div className="space-y-6">
          
          {/* PAPER STUDIO SUB-TABS */}
          <div className="bg-slate-100 p-1.5 rounded-2xl inline-flex items-center gap-1">
            <button
              onClick={() => setPaperStudioSubTab("ai_prompt")}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer ${
                paperStudioSubTab === "ai_prompt" ? "bg-white text-indigo-600 shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Wand2 className="w-4 h-4 text-indigo-600" />
              <span>AI Paper Generator via Prompt</span>
            </button>

            <button
              onClick={() => setPaperStudioSubTab("manual_builder")}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer ${
                paperStudioSubTab === "manual_builder" ? "bg-white text-indigo-600 shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Plus className="w-4 h-4 text-indigo-600" />
              <span>Manual Paper Builder</span>
            </button>

            <button
              onClick={() => setPaperStudioSubTab("repository")}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer ${
                paperStudioSubTab === "repository" ? "bg-white text-indigo-600 shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <BookOpen className="w-4 h-4 text-indigo-600" />
              <span>Saved Paper Repository ({papersList.length})</span>
            </button>
          </div>

          {/* SUB-TAB A: AI PAPER GENERATOR VIA PROMPT */}
          {paperStudioSubTab === "ai_prompt" && (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
              <div className="space-y-1 border-b border-slate-100 pb-4">
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <Wand2 className="w-5 h-5 text-indigo-600" />
                  Generate Question Paper from Custom Prompt
                </h3>
                <p className="text-xs text-slate-500 font-medium">Enter your custom instruction prompt and let DEVGYA AI generate a structured CBSE/NCERT paper with model answers.</p>
              </div>

              <form onSubmit={handleGenerateAiPaper} className="space-y-5">
                <div>
                  <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-1.5">AI Paper Generation Prompt</label>
                  <textarea
                    required
                    value={aiPromptText}
                    onChange={(e) => setAiPromptText(e.target.value)}
                    rows={4}
                    placeholder="E.g. Generate a Class 10 CBSE Science Mid-Term Exam covering Electricity, Magnetic Effects, and Light with HOTS questions..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs font-semibold text-slate-900 focus:outline-none focus:border-indigo-600 shadow-inner"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[11px] font-extrabold text-slate-700 uppercase mb-1">Paper Title</label>
                    <input
                      type="text"
                      required
                      value={aiTitle}
                      onChange={(e) => setAiTitle(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-extrabold text-slate-700 uppercase mb-1">Class / Grade</label>
                    <select
                      value={aiClass}
                      onChange={(e) => setAiClass(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
                    >
                      <option value="Class 9">Class 9</option>
                      <option value="Class 10">Class 10</option>
                      <option value="Class 11">Class 11</option>
                      <option value="Class 12">Class 12</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-extrabold text-slate-700 uppercase mb-1">Subject</label>
                    <select
                      value={aiSubject}
                      onChange={(e) => setAiSubject(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
                    >
                      <option value="Science">Science</option>
                      <option value="Mathematics">Mathematics</option>
                      <option value="English">English</option>
                      <option value="Physics">Physics</option>
                      <option value="Chemistry">Chemistry</option>
                      <option value="Biology">Biology</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[11px] font-extrabold text-slate-700 uppercase mb-1">Board</label>
                    <select
                      value={aiBoard}
                      onChange={(e) => setAiBoard(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
                    >
                      <option value="CBSE">CBSE</option>
                      <option value="ICSE">ICSE</option>
                      <option value="State Board">State Board</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-extrabold text-slate-700 uppercase mb-1">Total Marks</label>
                    <input
                      type="number"
                      value={aiTotalMarks}
                      onChange={(e) => setAiTotalMarks(parseInt(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-extrabold text-slate-700 uppercase mb-1">Time Allowed (Mins)</label>
                    <input
                      type="number"
                      value={aiTimeMins}
                      onChange={(e) => setAiTimeMins(parseInt(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={generatingAiPaper}
                  className="w-full py-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-black text-xs rounded-2xl shadow-lg flex items-center justify-center gap-2 uppercase tracking-wider cursor-pointer disabled:opacity-50 transition-all"
                >
                  {generatingAiPaper ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4 text-amber-300" />}
                  <span>{generatingAiPaper ? "Generating Paper with AI..." : "Generate Question Paper with AI"}</span>
                </button>
              </form>
            </div>
          )}

          {/* SUB-TAB B: MANUAL PAPER BUILDER */}
          {paperStudioSubTab === "manual_builder" && (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
              <div className="space-y-1 border-b border-slate-100 pb-4">
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <Plus className="w-5 h-5 text-indigo-600" />
                  Manual Question Paper Studio
                </h3>
                <p className="text-xs text-slate-500 font-medium">Manually construct and format every section, question, marks allocation, and answer key.</p>
              </div>

              <form onSubmit={handleSaveManualPaper} className="space-y-6">
                
                {/* PAPER METADATA */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[11px] font-extrabold text-slate-700 uppercase mb-1">Paper Title</label>
                    <input
                      type="text"
                      required
                      value={manualTitle}
                      onChange={(e) => setManualTitle(e.target.value)}
                      placeholder="e.g. Class 10 Physics Unit Test"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-extrabold text-slate-700 uppercase mb-1">Class / Grade</label>
                    <select
                      value={manualClass}
                      onChange={(e) => setManualClass(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
                    >
                      <option value="Class 9">Class 9</option>
                      <option value="Class 10">Class 10</option>
                      <option value="Class 11">Class 11</option>
                      <option value="Class 12">Class 12</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-extrabold text-slate-700 uppercase mb-1">Subject</label>
                    <input
                      type="text"
                      required
                      value={manualSubject}
                      onChange={(e) => setManualSubject(e.target.value)}
                      placeholder="Science / Math"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[11px] font-extrabold text-slate-700 uppercase mb-1">School Header</label>
                    <input
                      type="text"
                      value={manualSchool}
                      onChange={(e) => setManualSchool(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-extrabold text-slate-700 uppercase mb-1">Total Marks</label>
                    <input
                      type="number"
                      value={manualMarks}
                      onChange={(e) => setManualMarks(parseInt(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-extrabold text-slate-700 uppercase mb-1">Time Allowed (Mins)</label>
                    <input
                      type="number"
                      value={manualTime}
                      onChange={(e) => setManualTime(parseInt(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
                    />
                  </div>
                </div>

                {/* QUESTIONS BUILDER LIST */}
                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">Construct Questions ({manualQuestions.length})</h4>
                    <button
                      type="button"
                      onClick={handleAddManualQuestion}
                      className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-extrabold text-xs rounded-xl flex items-center gap-1 transition-all cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Question</span>
                    </button>
                  </div>

                  {manualQuestions.map((q, qIdx) => (
                    <div key={qIdx} className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-xs text-indigo-700 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-lg">
                          Question #{qIdx + 1}
                        </span>

                        <button
                          type="button"
                          onClick={() => setManualQuestions(manualQuestions.filter((_, idx) => idx !== qIdx))}
                          className="text-slate-400 hover:text-red-600 text-xs font-bold"
                        >
                          Remove Question
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-extrabold text-slate-600 uppercase">Question Type</label>
                          <select
                            value={q.question_type}
                            onChange={(e) => {
                              const updated = [...manualQuestions];
                              updated[qIdx].question_type = e.target.value;
                              setManualQuestions(updated);
                            }}
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold"
                          >
                            <option value="mcq">Multiple Choice Question (MCQ)</option>
                            <option value="short">Short Answer Question</option>
                            <option value="long">Long Answer Question</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[10px] font-extrabold text-slate-600 uppercase">Marks Allocated</label>
                          <input
                            type="number"
                            value={q.marks}
                            onChange={(e) => {
                              const updated = [...manualQuestions];
                              updated[qIdx].marks = parseInt(e.target.value);
                              setManualQuestions(updated);
                            }}
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-extrabold text-slate-600 uppercase mb-1">Question Prompt Text</label>
                        <textarea
                          required
                          value={q.question_text}
                          onChange={(e) => {
                            const updated = [...manualQuestions];
                            updated[qIdx].question_text = e.target.value;
                            setManualQuestions(updated);
                          }}
                          rows={2}
                          placeholder="Enter question text..."
                          className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-semibold"
                        />
                      </div>

                      {q.question_type === "mcq" && (
                        <div className="space-y-1.5">
                          <label className="block text-[10px] font-extrabold text-slate-600 uppercase">MCQ Options & Answer</label>
                          {q.options.map((opt: string, optIdx: number) => (
                            <input
                              key={optIdx}
                              type="text"
                              value={opt}
                              onChange={(e) => {
                                const updated = [...manualQuestions];
                                updated[qIdx].options[optIdx] = e.target.value;
                                setManualQuestions(updated);
                              }}
                              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1 text-xs font-semibold"
                            />
                          ))}
                        </div>
                      )}

                      <div>
                        <label className="block text-[10px] font-extrabold text-slate-600 uppercase mb-1">Answer / Marking Scheme Solution</label>
                        <textarea
                          value={q.answer}
                          onChange={(e) => {
                            const updated = [...manualQuestions];
                            updated[qIdx].answer = e.target.value;
                            setManualQuestions(updated);
                          }}
                          rows={2}
                          placeholder="Model solution text..."
                          className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-semibold"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={savingManualPaper}
                  className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-2xl shadow-lg flex items-center justify-center gap-2 uppercase tracking-wider cursor-pointer transition-all"
                >
                  <FileCheck className="w-4 h-4" />
                  <span>{savingManualPaper ? "Saving Manual Paper..." : "Save & Publish Question Paper"}</span>
                </button>
              </form>
            </div>
          )}

          {/* SUB-TAB C: REPOSITORY */}
          {paperStudioSubTab === "repository" && (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-indigo-600" />
                    Saved Paper Repository ({papersList.length})
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">All manually constructed and AI-generated examination papers available across the platform</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-800">
                  <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider font-extrabold border-b border-slate-200">
                    <tr>
                      <th className="p-3.5">Paper Title</th>
                      <th className="p-3.5">Grade & Subject</th>
                      <th className="p-3.5">Board</th>
                      <th className="p-3.5">Total Marks</th>
                      <th className="p-3.5">Source</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {papersList.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-slate-400 font-semibold">
                          No papers found in repository. Create one using AI or Manual Builder!
                        </td>
                      </tr>
                    ) : (
                      papersList.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-3.5 font-bold text-slate-900">
                            <div>{p.title}</div>
                            <div className="text-[10px] text-slate-400 font-mono">{p.id}</div>
                          </td>
                          <td className="p-3.5 font-semibold text-slate-700">
                            {p.class_name} • {p.subject}
                          </td>
                          <td className="p-3.5 font-bold text-indigo-600">{p.board || "CBSE"}</td>
                          <td className="p-3.5 font-bold">{p.total_marks} Marks ({p.time_allowed_mins} mins)</td>
                          <td className="p-3.5">
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${
                              p.source === "ai_prompt" ? "bg-purple-50 text-purple-700 border border-purple-200" : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            }`}>
                              {p.source === "ai_prompt" ? "AI Generated" : "Manual"}
                            </span>
                          </td>
                          <td className="p-3.5 text-right space-x-2">
                            <button
                              onClick={() => setPreviewPaper(p)}
                              className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[11px] rounded-xl transition-all cursor-pointer inline-flex items-center gap-1"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Preview</span>
                            </button>

                            <button
                              onClick={() => handleDeletePaper(p.id)}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer inline-flex"
                              title="Delete Paper"
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

        </div>
      )}

      {/* PAPER PREVIEW MODAL */}
      {previewPaper && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-3xl w-full bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 animate-in zoom-in-95 duration-200 text-slate-900 max-h-[90vh] overflow-y-auto font-sans">
            
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <span className="text-xs font-black uppercase tracking-wider text-indigo-600">Official Exam Script Preview</span>
              <button onClick={() => setPreviewPaper(null)} className="text-slate-400 hover:text-slate-700 font-black text-base">✕</button>
            </div>

            {/* PRINTABLE PAPER HEADER */}
            <div className="text-center space-y-1 border-b-2 border-slate-900 pb-4">
              <h2 className="text-lg font-black uppercase tracking-tight text-slate-900">{previewPaper.school_name || "DEVGYA GLOBAL EDUTECH"}</h2>
              <h3 className="text-base font-extrabold text-indigo-900">{previewPaper.title}</h3>
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 pt-2 px-2">
                <span>Class: {previewPaper.class_name} ({previewPaper.subject})</span>
                <span>Time Allowed: {previewPaper.time_allowed_mins} Mins</span>
                <span>Maximum Marks: {previewPaper.total_marks}</span>
              </div>
            </div>

            {/* INSTRUCTIONS */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1 text-xs">
              <div className="font-extrabold text-slate-800 uppercase tracking-wider text-[10px]">General Instructions:</div>
              <ul className="list-disc list-inside text-slate-600 space-y-0.5">
                {previewPaper.instructions?.map((inst: string, idx: number) => (
                  <li key={idx}>{inst}</li>
                ))}
              </ul>
            </div>

            {/* QUESTIONS LIST */}
            <div className="space-y-6 pt-2">
              {previewPaper.questions?.map((q: any, idx: number) => (
                <div key={idx} className="space-y-2 border-b border-slate-100 pb-4">
                  <div className="flex items-start justify-between gap-3 text-xs font-extrabold text-slate-900">
                    <div>
                      <span>Q{idx + 1}. </span>
                      <span>{q.question_text}</span>
                    </div>
                    <span className="shrink-0 text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md text-[11px] font-black border border-indigo-100">
                      [{q.marks} {q.marks === 1 ? "Mark" : "Marks"}]
                    </span>
                  </div>

                  {q.options && (
                    <div className="grid grid-cols-2 gap-2 pl-4 text-xs font-medium text-slate-700">
                      {q.options.map((opt: string, oIdx: number) => (
                        <div key={oIdx}>{opt}</div>
                      ))}
                    </div>
                  )}

                  {q.answer && (
                    <div className="mt-2 p-3 bg-emerald-50/70 rounded-xl border border-emerald-200 text-xs text-slate-700 space-y-1">
                      <div className="font-bold text-emerald-800 text-[10px] uppercase">Model Answer & Solution:</div>
                      <p>{q.answer}</p>
                      {q.explanation && <p className="text-[11px] text-slate-600 font-normal italic">Reason: {q.explanation}</p>}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                onClick={() => setPreviewPaper(null)}
                className="px-6 py-2 bg-slate-900 text-white font-extrabold text-xs rounded-xl shadow-md"
              >
                Close Preview
              </button>
            </div>

          </div>
        </div>
      )}

      {/* TAB 2: OLYMPIAD EVALUATION BOARD */}
      {adminTab === "olympiad" && (
        <div className="space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-500" />
                  Teachers Skill Olympiad Submissions ({submissions.length})
                </h3>
                <p className="text-xs text-slate-500 font-medium">Review proctored test scripts, anti-cheating warning logs, evaluate scores, and publish official results to leaderboard.</p>
              </div>
            </div>

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
          <div className="max-w-lg w-full bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200 text-slate-900 font-sans">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-500" />
                Evaluate Submission #{selectedSub.id}
              </h3>
              <button onClick={() => setSelectedSub(null)} className="text-slate-400 hover:text-slate-700 font-black text-sm">✕</button>
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
              <button onClick={() => setSelectedSub(null)} className="px-4 py-2 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl">Cancel</button>
              <button onClick={handleSaveSubmissionEvaluation} className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-md transition-all uppercase tracking-wider">Save & Update Result</button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: USER PROFILES */}
      {adminTab === "users" && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6 font-sans">
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

    </div>
  );
}
