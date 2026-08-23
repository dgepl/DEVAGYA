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
  FileCheck,
  Clock
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
  const [selectedUserDetail, setSelectedUserDetail] = useState<any | null>(null);

  // Olympiad Evaluation Modal State
  const [selectedSub, setSelectedSub] = useState<any | null>(null);
  const [editScore, setEditScore] = useState<number>(0);
  const [editFeedback, setEditFeedback] = useState<string>("");
  const [publishing, setPublishing] = useState<boolean>(false);
  const [selectedPaperForSubmissions, setSelectedPaperForSubmissions] = useState<string | "all">("all");
  const [bulkPublishing, setBulkPublishing] = useState<boolean>(false);
  const [deletingSubId, setDeletingSubId] = useState<string | null>(null);
  const [bulkDeleting, setBulkDeleting] = useState<boolean>(false);

  // AI Prompt Generator Form State
  const [aiPromptText, setAiPromptText] = useState("Generate an official Class 10 CBSE Science Olympiad Assessment focusing on Light, Electricity, and Chemical Reactions. ALL QUESTIONS MUST BE MCQs ONLY.");
  const [aiTitle, setAiTitle] = useState("Class 10 CBSE Science Olympiad Assessment");
  const [aiClass, setAiClass] = useState("Class 10");
  const [aiSubject, setAiSubject] = useState("Science");
  const getLocalISOString = (offsetMs = 0) => {
    const d = new Date(Date.now() + offsetMs);
    const tzOffset = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - tzOffset).toISOString().slice(0, 16);
  };

  const [aiBoard, setAiBoard] = useState("CBSE");
  const [aiDifficulty, setAiDifficulty] = useState("medium");
  const [aiTotalMarks, setAiTotalMarks] = useState(20);
  const [aiTimeMins, setAiTimeMins] = useState(30);
  const [aiStartTime, setAiStartTime] = useState(getLocalISOString(0));
  const [aiEndTime, setAiEndTime] = useState(getLocalISOString(7 * 24 * 60 * 60 * 1000));
  const [generatingAiPaper, setGeneratingAiPaper] = useState(false);
  const [aiDraftPaper, setAiDraftPaper] = useState<any | null>(null);
  const [publishingAiPaper, setPublishingAiPaper] = useState(false);

  // Manual Paper Builder State
  const [manualTitle, setManualTitle] = useState("");
  const [manualClass, setManualClass] = useState("Class 10");
  const [manualSubject, setManualSubject] = useState("Science");
  const [manualBoard, setManualBoard] = useState("CBSE");
  const [manualSchool, setManualSchool] = useState("DEVGYA GLOBAL ACADEMY");
  const [manualMarks, setManualMarks] = useState(1);
  const [manualTime, setManualTime] = useState(30);
  const [manualStartTime, setManualStartTime] = useState(getLocalISOString(0));
  const [manualEndTime, setManualEndTime] = useState(getLocalISOString(7 * 24 * 60 * 60 * 1000));
  const [bulkAddCount, setBulkAddCount] = useState<number>(1);
  const [manualQuestions, setManualQuestions] = useState<any[]>([
    {
      id: 1,
      question_number: 1,
      question_type: "mcq",
      question_text: "What is the SI unit of electric current?",
      marks: 1,
      options: ["(A) Ampere", "(B) Volt", "(C) Ohm", "(D) Joule"],
      correct_answer: 0,
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
      let data: any = {};
      try {
        data = await res.json();
      } catch {
        // Fallback for non-JSON response
      }
      if (!res.ok) throw new Error(data.detail || `Server error (${res.status}). Please check backend status.`);

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

  // Generate Paper with AI via Prompt (Total Marks = Question Count, returns draft for review)
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
        start_time: aiStartTime.replace("T", " ") + ":00",
        end_time: aiEndTime.replace("T", " ") + ":00",
        school_name: "DEVGYA GLOBAL EDUTECH"
      };

      const res = await fetch(`${baseUrl}/admin/papers/ai-generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok && data.paper) {
        setAiDraftPaper(data.paper);
        setActionMsg(`AI Paper "${data.paper.title}" generated with ${data.paper.questions?.length || aiTotalMarks} questions! You can now edit questions and click Publish.`);
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

  // Publish AI Draft Paper after Admin Review / Edits
  const handlePublishAiDraftPaper = async () => {
    if (!aiDraftPaper) return;
    setPublishingAiPaper(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api/v1";
      const formattedQuestions = (aiDraftPaper.questions || []).map((q: any, idx: number) => {
        const corrIdx = typeof q.correct_answer === "number" ? q.correct_answer : 0;
        const corrText = q.options[corrIdx] || q.answer || `Option ${String.fromCharCode(65 + corrIdx)}`;
        return {
          ...q,
          id: idx + 1,
          question_number: idx + 1,
          question_type: "mcq",
          marks: 1,
          correct_answer: corrIdx,
          answer: corrText
        };
      });

      const payload = {
        ...aiDraftPaper,
        total_marks: formattedQuestions.length,
        published: true,
        questions: formattedQuestions
      };

      const res = await fetch(`${baseUrl}/admin/papers/manual`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok && data.paper) {
        setActionMsg(`AI Question Paper "${data.paper.title}" successfully published to Olympiad repository!`);
        fetchAdminData();
        setAiDraftPaper(null);
        setPaperStudioSubTab("repository");
        setTimeout(() => setActionMsg(null), 5000);
      } else {
        alert(data.detail || "Failed to publish paper.");
      }
    } catch (err) {
      alert("Error publishing AI question paper.");
    } finally {
      setPublishingAiPaper(false);
    }
  };

  // Save Manual Paper (100% MCQ Enforcement + Time Scheduling)
  const handleSaveManualPaper = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualTitle.trim()) {
      alert("Please enter a Paper Title.");
      return;
    }
    setSavingManualPaper(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api/v1";

      const formattedQuestions = manualQuestions.map((q, idx) => {
        const corrIdx = typeof q.correct_answer === "number" ? q.correct_answer : 0;
        const corrText = q.options[corrIdx] || q.answer || `Option ${String.fromCharCode(65 + corrIdx)}`;
        return {
          ...q,
          id: idx + 1,
          question_number: idx + 1,
          question_type: "mcq",
          marks: 1,
          correct_answer: corrIdx,
          answer: corrText
        };
      });

      const payload = {
        title: manualTitle.trim(),
        class_name: manualClass,
        subject: manualSubject,
        board: manualBoard,
        school_name: manualSchool,
        total_marks: formattedQuestions.length,
        time_allowed_mins: manualTime,
        start_time: manualStartTime.replace("T", " ") + ":00",
        end_time: manualEndTime.replace("T", " ") + ":00",
        instructions: [
          "All questions are compulsory Multiple Choice Questions (MCQs).",
          "Select the single correct option for each question."
        ],
        questions: formattedQuestions
      };

      const res = await fetch(`${baseUrl}/admin/papers/manual`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok && data.paper) {
        setActionMsg(`Manual MCQ Paper "${data.paper.title}" constructed & published!`);
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

  // Add Multiple Questions to Manual Builder
  const handleAddManualQuestions = (count = 1) => {
    const numToAdd = Math.max(1, Math.min(50, count));
    setManualQuestions(prev => {
      const newQuestions = [...prev];
      for (let i = 0; i < numToAdd; i++) {
        const newNum = newQuestions.length + 1;
        newQuestions.push({
          id: newNum,
          question_number: newNum,
          question_type: "mcq",
          question_text: "",
          marks: 1,
          options: ["", "", "", ""],
          correct_answer: 0,
          answer: "",
          explanation: ""
        });
      }
      setManualMarks(newQuestions.length);
      return newQuestions;
    });
  };

  // Add Single Question alias
  const handleAddManualQuestion = () => handleAddManualQuestions(1);

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

  // 1-Click Bulk Publish Olympiad Results for All Participants
  const handleBulkPublishSubmissions = async (paperId?: string) => {
    const targetId = paperId || (selectedPaperForSubmissions !== "all" ? selectedPaperForSubmissions : "");
    if (!confirm(`Are you sure you want to publish results for all participants ${targetId ? `for paper (${targetId})` : "across all papers"} to the live public leaderboard?`)) {
      return;
    }
    setBulkPublishing(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api/v1";
      const query = targetId ? `?paper_id=${encodeURIComponent(targetId)}` : "";
      const res = await fetch(`${baseUrl}/admin/olympiad/publish-all${query}`, {
        method: "POST"
      });
      const data = await res.json();
      if (res.ok) {
        setActionMsg(`1-Click Publish Success! Published results for ${data.published_count || "all"} candidate(s) to Live Leaderboard! 🚀`);
        fetchAdminData();
        setTimeout(() => setActionMsg(null), 5000);
      } else {
        alert(data.detail || "Failed to bulk publish results.");
      }
    } catch (e) {
      alert("Error executing bulk publish.");
    } finally {
      setBulkPublishing(false);
    }
  };

  // Delete single Olympiad Result/Submission
  const handleDeleteSubmission = async (subId: string) => {
    if (!confirm(`Are you sure you want to permanently delete submission #${subId}? This candidate's test attempt and record will be erased.`)) {
      return;
    }
    setDeletingSubId(subId);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api/v1";
      const res = await fetch(`${baseUrl}/admin/olympiad/submissions/${subId}`, {
        method: "DELETE"
      });
      const data = await res.json();
      if (res.ok) {
        setActionMsg(`Submission #${subId} successfully deleted.`);
        if (selectedSub?.id === subId) setSelectedSub(null);
        fetchAdminData();
        setTimeout(() => setActionMsg(null), 4000);
      } else {
        alert(data.detail || "Failed to delete submission.");
      }
    } catch (e) {
      alert("Error deleting submission.");
    } finally {
      setDeletingSubId(null);
    }
  };

  // Bulk Delete Olympiad Submissions for Paper or All
  const handleBulkDeleteSubmissions = async (paperId?: string) => {
    const targetId = paperId || (selectedPaperForSubmissions !== "all" ? selectedPaperForSubmissions : "all");
    const paperName = targetId === "all" ? "ALL papers" : `paper (${targetId})`;
    if (!confirm(`⚠️ DANGER: Are you sure you want to PERMANENTLY DELETE ALL results for ${paperName}? This will reset previous candidate submissions.`)) {
      return;
    }
    setBulkDeleting(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api/v1";
      const query = targetId !== "all" ? `?paper_id=${encodeURIComponent(targetId)}` : "?paper_id=all";
      const res = await fetch(`${baseUrl}/admin/olympiad/submissions${query}`, {
        method: "DELETE"
      });
      const data = await res.json();
      if (res.ok) {
        setActionMsg(`Successfully deleted ${data.deleted_count ?? "all"} submission(s) for ${paperName}.`);
        fetchAdminData();
        setTimeout(() => setActionMsg(null), 5000);
      } else {
        alert(data.detail || "Failed to delete submissions.");
      }
    } catch (e) {
      alert("Error deleting submissions.");
    } finally {
      setBulkDeleting(false);
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
                    <label className="block text-[11px] font-extrabold text-slate-700 uppercase mb-1 flex items-center justify-between">
                      <span>Total Marks (Question Count)</span>
                      <span className="text-[9px] text-indigo-600 font-black lowercase">1 mark = 1 question</span>
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={aiTotalMarks}
                      onChange={(e) => setAiTotalMarks(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-extrabold text-slate-700 uppercase mb-1">Time Allowed (Mins)</label>
                    <input
                      type="number"
                      min={5}
                      value={aiTimeMins}
                      onChange={(e) => setAiTimeMins(parseInt(e.target.value) || 30)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100">
                  <div>
                    <label className="block text-[11px] font-extrabold text-indigo-900 uppercase mb-1 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-indigo-600" />
                      Paper Access Start Time
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={aiStartTime}
                      onChange={(e) => setAiStartTime(e.target.value)}
                      className="w-full bg-white border border-indigo-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 shadow-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-extrabold text-indigo-900 uppercase mb-1 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-rose-600" />
                      Paper Access End Time (Closing Time)
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={aiEndTime}
                      onChange={(e) => setAiEndTime(e.target.value)}
                      className="w-full bg-white border border-indigo-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 shadow-xs"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={generatingAiPaper}
                  className="w-full py-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-black text-xs rounded-2xl shadow-lg flex items-center justify-center gap-2 uppercase tracking-wider cursor-pointer disabled:opacity-50 transition-all"
                >
                  {generatingAiPaper ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4 text-amber-300" />}
                  <span>{generatingAiPaper ? `Synthesizing ${aiTotalMarks} MCQ Questions with AI...` : `Generate ${aiTotalMarks} Questions Paper with AI`}</span>
                </button>
              </form>

              {/* AI DRAFT REVIEW & LIVE QUESTION EDITOR */}
              {aiDraftPaper && (
                <div className="p-6 rounded-3xl border-2 border-indigo-300 bg-gradient-to-b from-indigo-50/50 via-white to-white shadow-xl space-y-6 animate-in fade-in duration-300">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-indigo-100 pb-4">
                    <div>
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-100 text-indigo-800 text-[10px] font-black uppercase tracking-wider mb-2">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        AI Paper Draft Ready — Review, Edit &amp; Publish
                      </div>
                      <h3 className="text-xl font-black text-slate-900">{aiDraftPaper.title}</h3>
                      <p className="text-xs text-slate-500 font-semibold mt-0.5">
                        {aiDraftPaper.class_name} • {aiDraftPaper.subject} • {aiDraftPaper.board} • {aiDraftPaper.questions?.length || 0} Questions ({aiDraftPaper.questions?.length || 0} Marks)
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setAiDraftPaper(null)}
                        className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-extrabold text-xs transition-all cursor-pointer"
                      >
                        Discard Draft
                      </button>

                      <button
                        type="button"
                        disabled={publishingAiPaper}
                        onClick={handlePublishAiDraftPaper}
                        className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-lg shadow-emerald-600/30 flex items-center gap-2 uppercase tracking-wider transition-all cursor-pointer active:scale-95"
                      >
                        {publishingAiPaper ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                        <span>Publish Paper to Olympiad</span>
                      </button>
                    </div>
                  </div>

                  {/* EDITABLE QUESTIONS LIST */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                        Generated Questions ({aiDraftPaper.questions?.length || 0})
                      </h4>
                      <button
                        type="button"
                        onClick={() => {
                          const updatedQ = [...(aiDraftPaper.questions || [])];
                          const newNum = updatedQ.length + 1;
                          updatedQ.push({
                            id: newNum,
                            question_number: newNum,
                            question_type: "mcq",
                            question_text: "",
                            marks: 1,
                            options: ["", "", "", ""],
                            correct_answer: 0,
                            answer: "",
                            explanation: ""
                          });
                          setAiDraftPaper({ ...aiDraftPaper, questions: updatedQ, total_marks: updatedQ.length });
                        }}
                        className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-extrabold text-xs rounded-xl flex items-center gap-1 transition-all cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Question</span>
                      </button>
                    </div>

                    {aiDraftPaper.questions?.map((q: any, qIdx: number) => (
                      <div key={qIdx} className="p-5 rounded-2xl border border-slate-200 bg-white space-y-3 shadow-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-xs text-indigo-700 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-lg">
                            Question #{qIdx + 1} (1 Mark)
                          </span>

                          <button
                            type="button"
                            onClick={() => {
                              const updatedQ = aiDraftPaper.questions.filter((_: any, idx: number) => idx !== qIdx);
                              setAiDraftPaper({ ...aiDraftPaper, questions: updatedQ, total_marks: updatedQ.length });
                            }}
                            className="text-slate-400 hover:text-red-600 text-xs font-bold cursor-pointer"
                          >
                            Remove Question
                          </button>
                        </div>

                        <div>
                          <label className="block text-[10px] font-extrabold text-slate-600 uppercase mb-1">Question Prompt Text</label>
                          <textarea
                            required
                            value={q.question_text}
                            onChange={(e) => {
                              const updated = [...aiDraftPaper.questions];
                              updated[qIdx].question_text = e.target.value;
                              setAiDraftPaper({ ...aiDraftPaper, questions: updated });
                            }}
                            rows={2}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-semibold text-slate-900"
                          />
                        </div>

                        {/* MCQ OPTIONS & RADIO BUTTONS */}
                        <div className="space-y-3 bg-slate-50/70 p-4 rounded-2xl border border-slate-200">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2">
                            <label className="block text-[11px] font-black text-slate-800 uppercase tracking-wider">
                              MCQ Options &amp; Correct Answer Key
                            </label>

                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-bold text-slate-500 uppercase">Correct Answer:</span>
                              <select
                                value={q.correct_answer ?? 0}
                                onChange={(e) => {
                                  const updated = [...aiDraftPaper.questions];
                                  const selectedIdx = parseInt(e.target.value);
                                  updated[qIdx].correct_answer = selectedIdx;
                                  updated[qIdx].answer = updated[qIdx].options[selectedIdx] || `Option ${String.fromCharCode(65 + selectedIdx)}`;
                                  setAiDraftPaper({ ...aiDraftPaper, questions: updated });
                                }}
                                className="bg-emerald-50 border border-emerald-300 text-emerald-800 font-extrabold text-xs rounded-xl px-3 py-1 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                              >
                                <option value={0}>Option A (1st Option)</option>
                                <option value={1}>Option B (2nd Option)</option>
                                <option value={2}>Option C (3rd Option)</option>
                                <option value={3}>Option D (4th Option)</option>
                              </select>
                            </div>
                          </div>

                          <div className="space-y-2">
                            {(q.options || ["", "", "", ""]).map((opt: string, optIdx: number) => {
                              const isCorrect = (q.correct_answer ?? 0) === optIdx;
                              const optLetter = String.fromCharCode(65 + optIdx);

                              return (
                                <div
                                  key={optIdx}
                                  className={`p-2.5 rounded-xl border transition-all flex items-center gap-3 ${
                                    isCorrect 
                                      ? "bg-emerald-50/90 border-emerald-500 ring-2 ring-emerald-500/20" 
                                      : "bg-white border-slate-200 hover:border-slate-300"
                                  }`}
                                >
                                  <label className="flex items-center gap-2 cursor-pointer shrink-0">
                                    <input
                                      type="radio"
                                      name={`ai_draft_correct_opt_${qIdx}`}
                                      checked={isCorrect}
                                      onChange={() => {
                                        const updated = [...aiDraftPaper.questions];
                                        updated[qIdx].correct_answer = optIdx;
                                        updated[qIdx].answer = opt || `Option ${optLetter}`;
                                        setAiDraftPaper({ ...aiDraftPaper, questions: updated });
                                      }}
                                      className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                                    />
                                    <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black ${
                                      isCorrect ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-700"
                                    }`}>
                                      {optLetter}
                                    </span>
                                  </label>

                                  <input
                                    type="text"
                                    required
                                    value={opt}
                                    placeholder={`Enter option ${optLetter} text...`}
                                    onChange={(e) => {
                                      const updated = [...aiDraftPaper.questions];
                                      updated[qIdx].options[optIdx] = e.target.value;
                                      if ((updated[qIdx].correct_answer ?? 0) === optIdx) {
                                        updated[qIdx].answer = e.target.value;
                                      }
                                      setAiDraftPaper({ ...aiDraftPaper, questions: updated });
                                    }}
                                    className="flex-1 bg-transparent border-0 text-xs font-bold text-slate-900 focus:outline-none placeholder:text-slate-400"
                                  />

                                  {isCorrect && (
                                    <span className="px-2.5 py-0.5 rounded-md bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wider shrink-0">
                                      ✅ Correct Option
                                    </span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-extrabold text-slate-600 uppercase mb-1">
                            Pedagogical Solution &amp; Explanation
                          </label>
                          <textarea
                            value={q.explanation || ""}
                            onChange={(e) => {
                              const updated = [...aiDraftPaper.questions];
                              updated[qIdx].explanation = e.target.value;
                              setAiDraftPaper({ ...aiDraftPaper, questions: updated });
                            }}
                            rows={2}
                            placeholder="Reasoning explanation..."
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-semibold text-slate-900"
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* BOTTOM PUBLISH ACTION */}
                  <div className="pt-4 border-t border-indigo-100 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      disabled={publishingAiPaper}
                      onClick={handlePublishAiDraftPaper}
                      className="w-full sm:w-auto px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-2xl shadow-xl shadow-emerald-600/30 flex items-center justify-center gap-2 uppercase tracking-wider transition-all cursor-pointer"
                    >
                      {publishingAiPaper ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                      <span>Publish Paper to Olympiad</span>
                    </button>
                  </div>
                </div>
              )}
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
                    <label className="block text-[11px] font-extrabold text-slate-700 uppercase mb-1 flex items-center justify-between">
                      <span>Total Marks</span>
                      <span className="text-[9px] text-indigo-600 font-black lowercase">{manualQuestions.length} questions = {manualQuestions.length} marks</span>
                    </label>
                    <input
                      type="number"
                      readOnly
                      value={manualQuestions.length}
                      className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 cursor-not-allowed"
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100">
                  <div>
                    <label className="block text-[11px] font-extrabold text-indigo-900 uppercase mb-1 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-indigo-600" />
                      Paper Access Start Time
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={manualStartTime}
                      onChange={(e) => setManualStartTime(e.target.value)}
                      className="w-full bg-white border border-indigo-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 shadow-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-extrabold text-indigo-900 uppercase mb-1 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-rose-600" />
                      Paper Access End Time (Closing Time)
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={manualEndTime}
                      onChange={(e) => setManualEndTime(e.target.value)}
                      className="w-full bg-white border border-indigo-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 shadow-xs"
                    />
                  </div>
                </div>

                {/* QUESTIONS BUILDER LIST */}
                <div className="space-y-4 pt-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                    <div>
                      <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                        Construct Questions ({manualQuestions.length}) • Total Marks: {manualQuestions.length}
                      </h4>
                      <p className="text-[10px] text-slate-500 font-medium">1 Mark allocated per MCQ question</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <div className="flex items-center gap-1.5 bg-slate-100 px-2 py-1 rounded-xl border border-slate-200">
                        <span className="text-[10px] font-extrabold text-slate-600 uppercase">Quantity:</span>
                        <input
                          type="number"
                          min={1}
                          max={50}
                          value={bulkAddCount}
                          onChange={(e) => setBulkAddCount(Math.max(1, parseInt(e.target.value) || 1))}
                          className="w-12 bg-white border border-slate-300 rounded-lg px-2 py-0.5 text-xs font-black text-slate-900 text-center"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => handleAddManualQuestions(bulkAddCount)}
                        className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add {bulkAddCount > 1 ? `${bulkAddCount} Questions` : "Question"}</span>
                      </button>

                      <div className="hidden sm:flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleAddManualQuestions(1)}
                          className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold rounded-lg transition-all cursor-pointer"
                        >
                          +1
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAddManualQuestions(5)}
                          className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold rounded-lg transition-all cursor-pointer"
                        >
                          +5
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAddManualQuestions(10)}
                          className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold rounded-lg transition-all cursor-pointer"
                        >
                          +10
                        </button>
                      </div>
                    </div>
                  </div>

                  {manualQuestions.map((q, qIdx) => (
                    <div key={qIdx} className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-xs text-indigo-700 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-lg">
                          Question #{qIdx + 1} (1 Mark)
                        </span>

                        <button
                          type="button"
                          onClick={() => {
                            const updated = manualQuestions.filter((_, idx) => idx !== qIdx);
                            setManualQuestions(updated);
                            setManualMarks(updated.length);
                          }}
                          className="text-slate-400 hover:text-red-600 text-xs font-bold cursor-pointer"
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
                        <div className="space-y-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2">
                            <label className="block text-[11px] font-black text-slate-800 uppercase tracking-wider">
                              MCQ Options &amp; Correct Answer Selection
                            </label>

                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-bold text-slate-500 uppercase">Correct Answer:</span>
                              <select
                                value={q.correct_answer ?? 0}
                                onChange={(e) => {
                                  const updated = [...manualQuestions];
                                  const selectedIdx = parseInt(e.target.value);
                                  updated[qIdx].correct_answer = selectedIdx;
                                  updated[qIdx].answer = updated[qIdx].options[selectedIdx] || `Option ${String.fromCharCode(65 + selectedIdx)}`;
                                  setManualQuestions(updated);
                                }}
                                className="bg-emerald-50 border border-emerald-300 text-emerald-800 font-extrabold text-xs rounded-xl px-3 py-1 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                              >
                                <option value={0}>Option A (1st Option)</option>
                                <option value={1}>Option B (2nd Option)</option>
                                <option value={2}>Option C (3rd Option)</option>
                                <option value={3}>Option D (4th Option)</option>
                              </select>
                            </div>
                          </div>

                          <div className="space-y-2">
                            {q.options.map((opt: string, optIdx: number) => {
                              const isCorrect = (q.correct_answer ?? 0) === optIdx;
                              const optLetter = String.fromCharCode(65 + optIdx);

                              return (
                                <div
                                  key={optIdx}
                                  className={`p-2.5 rounded-xl border transition-all flex items-center gap-3 ${
                                    isCorrect 
                                      ? "bg-emerald-50/90 border-emerald-500 ring-2 ring-emerald-500/20" 
                                      : "bg-slate-50 border-slate-200 hover:border-slate-300"
                                  }`}
                                >
                                  <label className="flex items-center gap-2 cursor-pointer shrink-0">
                                    <input
                                      type="radio"
                                      name={`correct_opt_${qIdx}`}
                                      checked={isCorrect}
                                      onChange={() => {
                                        const updated = [...manualQuestions];
                                        updated[qIdx].correct_answer = optIdx;
                                        updated[qIdx].answer = opt || `Option ${optLetter}`;
                                        setManualQuestions(updated);
                                      }}
                                      className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                                    />
                                    <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black ${
                                      isCorrect ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-700"
                                    }`}>
                                      {optLetter}
                                    </span>
                                  </label>

                                  <input
                                    type="text"
                                    required
                                    value={opt}
                                    placeholder={`Enter option ${optLetter} text...`}
                                    onChange={(e) => {
                                      const updated = [...manualQuestions];
                                      updated[qIdx].options[optIdx] = e.target.value;
                                      if ((updated[qIdx].correct_answer ?? 0) === optIdx) {
                                        updated[qIdx].answer = e.target.value;
                                      }
                                      setManualQuestions(updated);
                                    }}
                                    className="flex-1 bg-transparent border-0 text-xs font-bold text-slate-900 focus:outline-none placeholder:text-slate-400"
                                  />

                                  {isCorrect && (
                                    <span className="px-2.5 py-0.5 rounded-md bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wider shrink-0">
                                      ✅ Correct Option
                                    </span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      <div>
                        <label className="block text-[10px] font-extrabold text-slate-600 uppercase mb-1">
                          Pedagogical Solution &amp; Explanation (Optional)
                        </label>
                        <textarea
                          value={q.explanation || ""}
                          onChange={(e) => {
                            const updated = [...manualQuestions];
                            updated[qIdx].explanation = e.target.value;
                            setManualQuestions(updated);
                          }}
                          rows={2}
                          placeholder="Provide pedagogical rationale or step-by-step marking key..."
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
          {/* PAPER-WISE SELECTION STRIP */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-600" />
                  Select Assessment Paper ({papersList.length})
                </h4>
                <p className="text-xs text-slate-500 font-medium">Click on a paper to view its candidate submissions &amp; 1-click publish results</p>
              </div>

              <button
                onClick={() => handleBulkPublishSubmissions(selectedPaperForSubmissions)}
                disabled={bulkPublishing || submissions.length === 0}
                className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center gap-2 transition-all cursor-pointer uppercase tracking-wider"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>{bulkPublishing ? "Publishing..." : "Publish All Results (1-Click)"}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {/* ALL PAPERS OPTION */}
              <div 
                onClick={() => setSelectedPaperForSubmissions("all")}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  selectedPaperForSubmissions === "all"
                    ? "bg-indigo-50/80 border-indigo-500 shadow-md ring-2 ring-indigo-500/20"
                    : "bg-white border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-900">All Papers Combined</span>
                  <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-extrabold">
                    {submissions.length} Total
                  </span>
                </div>
                <div className="mt-2 text-[11px] text-slate-500 font-medium">
                  {submissions.filter(s => s.published).length} Published &bull; {submissions.filter(s => !s.published).length} Pending Review
                </div>
              </div>

              {/* INDIVIDUAL PAPERS */}
              {papersList.map((paper) => {
                const paperSubmissions = submissions.filter(s => (s.paper_id || "paper-101") === paper.id || (paper.id === "paper-101" && !s.paper_id));
                const publishedCount = paperSubmissions.filter(s => s.published).length;
                const isSelected = selectedPaperForSubmissions === paper.id;

                return (
                  <div
                    key={paper.id}
                    onClick={() => setSelectedPaperForSubmissions(paper.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-indigo-50/80 border-indigo-500 shadow-md ring-2 ring-indigo-500/20"
                        : "bg-white border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-black text-slate-900 truncate">{paper.title}</span>
                      <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-extrabold shrink-0">
                        {paperSubmissions.length} Subs
                      </span>
                    </div>
                    <div className="mt-1 text-[11px] text-slate-500 font-medium">
                      {paper.class_name} &bull; {paper.subject}
                    </div>
                    <div className="mt-2 flex items-center justify-between text-[10px] font-bold">
                      <span className="text-emerald-700 font-extrabold">{publishedCount} Published</span>
                      <span className="text-amber-700">{paperSubmissions.length - publishedCount} Pending</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-500" />
                  {selectedPaperForSubmissions === "all" ? "All Candidate Submissions" : `Submissions for: ${papersList.find(p => p.id === selectedPaperForSubmissions)?.title || selectedPaperForSubmissions}`}
                  {" "}({
                    (selectedPaperForSubmissions === "all"
                      ? submissions
                      : submissions.filter(s => (s.paper_id || "paper-101") === selectedPaperForSubmissions || (selectedPaperForSubmissions === "paper-101" && !s.paper_id))
                    ).length
                  })
                </h3>
                <p className="text-xs text-slate-500 font-medium">Review proctored test scripts, anti-cheating warning logs, evaluate scores, and publish official results to leaderboard.</p>
              </div>

              <div className="flex items-center gap-2.5 flex-wrap">
                <button
                  onClick={() => handleBulkDeleteSubmissions(selectedPaperForSubmissions)}
                  disabled={bulkDeleting || (selectedPaperForSubmissions === "all" ? submissions.length === 0 : submissions.filter(s => (s.paper_id || "paper-101") === selectedPaperForSubmissions || (selectedPaperForSubmissions === "paper-101" && !s.paper_id)).length === 0)}
                  className="px-3.5 py-2.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-extrabold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                  title="Delete all candidate test submissions for this paper"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                  <span>{bulkDeleting ? "Deleting..." : "Delete All Results"}</span>
                </button>

                <button
                  onClick={() => handleBulkPublishSubmissions(selectedPaperForSubmissions)}
                  disabled={bulkPublishing}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center gap-2 transition-all cursor-pointer uppercase tracking-wider shrink-0"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>{bulkPublishing ? "Publishing..." : "Publish All For This Paper (1-Click)"}</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-800">
                <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider font-extrabold border-b border-slate-200">
                  <tr>
                    <th className="p-3.5">Candidate Teacher</th>
                    <th className="p-3.5">Paper / Subject</th>
                    <th className="p-3.5">Submitted At</th>
                    <th className="p-3.5">Proctoring Log</th>
                    <th className="p-3.5">Score</th>
                    <th className="p-3.5">Review Status</th>
                    <th className="p-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(() => {
                    const currentSubs = selectedPaperForSubmissions === "all"
                      ? submissions
                      : submissions.filter(s => (s.paper_id || "paper-101") === selectedPaperForSubmissions || (selectedPaperForSubmissions === "paper-101" && !s.paper_id));

                    if (currentSubs.length === 0) {
                      return (
                        <tr>
                          <td colSpan={7} className="p-8 text-center text-slate-400 font-semibold">
                            No teacher Olympiad submissions found for the selected paper.
                          </td>
                        </tr>
                      );
                    }

                    return currentSubs.map((sub) => {
                      const matchedPaper = papersList.find(p => p.id === (sub.paper_id || "paper-101"));

                      return (
                        <tr key={sub.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-3.5 font-bold text-slate-900">
                            <div className="font-extrabold text-slate-900">{sub.teacher_name}</div>
                            <div className="text-[11px] text-slate-500 font-mono">{sub.teacher_email}</div>
                          </td>
                          <td className="p-3.5">
                            <span className="font-bold text-slate-800 text-xs">{matchedPaper?.title || sub.paper_id || "Science Olympiad"}</span>
                            <div className="text-[10px] text-slate-500 font-semibold">{matchedPaper?.class_name || "Class 10"} &bull; {matchedPaper?.subject || "Science"}</div>
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
                            <div className="flex items-center justify-end gap-2">
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

                              <button
                                onClick={() => handleDeleteSubmission(sub.id)}
                                disabled={deletingSubId === sub.id}
                                className="p-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 hover:text-rose-700 rounded-xl transition-all cursor-pointer disabled:opacity-50"
                                title={`Delete submission #${sub.id}`}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    });
                  })()}
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

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
              <div className="font-extrabold text-slate-900">{selectedSub.teacher_name} ({selectedSub.teacher_email})</div>
              <div className="text-slate-500">Auto Computed Score: <span className="font-bold text-indigo-600">{selectedSub.score_percentage}% ({selectedSub.correct_count}/{selectedSub.total_questions} correct)</span></div>
              <div className="text-slate-500">Anti-Cheating Proctor Status: <span className="font-bold text-rose-600">{selectedSub.proctor_status}</span></div>
              {selectedSub.proctor_logs && selectedSub.proctor_logs.length > 0 && (
                <div className="pt-2 border-t border-slate-200 space-y-1">
                  <div className="font-black text-[10px] uppercase text-rose-700">Detailed AI Proctor Incident Logs ({selectedSub.proctor_logs.length} Events):</div>
                  <div className="max-h-24 overflow-y-auto space-y-1 pr-1 font-mono text-[10px] text-slate-700">
                    {selectedSub.proctor_logs.map((log: string, lIdx: number) => (
                      <div key={lIdx} className="p-1 rounded bg-white border border-slate-200">{log}</div>
                    ))}
                  </div>
                </div>
              )}
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

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <button
                onClick={() => handleDeleteSubmission(selectedSub.id)}
                disabled={deletingSubId === selectedSub.id}
                className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                <span>Delete Result</span>
              </button>

              <div className="flex items-center gap-2">
                <button onClick={() => setSelectedSub(null)} className="px-4 py-2 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl">Cancel</button>
                <button onClick={handleSaveSubmissionEvaluation} className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-md transition-all uppercase tracking-wider">Save & Update Result</button>
              </div>
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
              <p className="text-xs text-slate-500 font-medium">Inspect educator institutional credentials, school logos, active roles, and cloud profiles</p>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search name, email, school..."
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
                  <th className="p-3.5">User / Educator</th>
                  <th className="p-3.5">School &amp; Logo</th>
                  <th className="p-3.5">Board &amp; Subject</th>
                  <th className="p-3.5">Role</th>
                  <th className="p-3.5">Profile Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400 font-semibold">
                      No user accounts found matching query.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3.5 font-bold text-slate-900">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-black flex items-center justify-center text-xs shadow-xs shrink-0">
                            {(u.full_name || u.email || "U")[0].toUpperCase()}
                          </div>
                          <div>
                            <div className="font-extrabold text-slate-900">{u.full_name || "Registered Account"}</div>
                            <div className="text-[11px] font-mono text-slate-500">{u.email}</div>
                          </div>
                        </div>
                      </td>

                      <td className="p-3.5">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center p-0.5 shrink-0 shadow-2xs">
                            {u.school_logo ? (
                              <img src={u.school_logo} alt="Logo" className="w-full h-full object-contain" />
                            ) : (
                              <Building2 className="w-4 h-4 text-slate-400" />
                            )}
                          </div>
                          <span className="font-bold text-slate-800 text-[11px] max-w-[180px] truncate block">
                            {u.school_name || "Not Specified"}
                          </span>
                        </div>
                      </td>

                      <td className="p-3.5">
                        <div className="space-y-0.5">
                          <div className="font-extrabold text-slate-800 text-[11px]">
                            {u.subject || (u.role === "teacher" ? "General" : "N/A")} {u.classes ? `• ${u.classes}` : ""}
                          </div>
                          <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                            {u.board || "CBSE"} Board
                          </div>
                        </div>
                      </td>

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
                        {u.is_profile_complete || (u.school_name && u.subject) ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-extrabold">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Complete
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-extrabold">
                            <Clock className="w-3 h-3 text-amber-600" />
                            Incomplete
                          </span>
                        )}
                      </td>

                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedUserDetail(u)}
                            className="px-2.5 py-1.5 bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 font-bold text-[11px] rounded-xl transition-all cursor-pointer flex items-center gap-1"
                            title="Inspect User Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Details</span>
                          </button>

                          <button
                            onClick={() => handleDeleteUser(u.id, u.email)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                            title="Delete Account"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* USER PROFILE DETAIL MODAL */}
      {selectedUserDetail && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">User Profile Details</h3>
                  <p className="text-xs text-slate-500 font-medium">{selectedUserDetail.email}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedUserDetail(null)}
                className="p-1.5 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="w-16 h-16 rounded-xl bg-white border border-slate-200 p-1 flex items-center justify-center shrink-0 shadow-sm">
                  {selectedUserDetail.school_logo ? (
                    <img src={selectedUserDetail.school_logo} alt="School Logo" className="w-full h-full object-contain" />
                  ) : (
                    <Building2 className="w-8 h-8 text-slate-300" />
                  )}
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase text-indigo-600 block">Affiliated Institution</span>
                  <div className="text-sm font-black text-slate-900">{selectedUserDetail.school_name || "DEVGYA GLOBAL EDUTECH"}</div>
                  <div className="text-[11px] text-slate-500 font-semibold">{selectedUserDetail.board || "CBSE"} Board</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <div className="text-[10px] font-extrabold uppercase text-slate-500">Educator Name</div>
                  <div className="font-bold text-slate-900">{selectedUserDetail.full_name || "Registered Account"}</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <div className="text-[10px] font-extrabold uppercase text-slate-500">Role</div>
                  <div className="font-bold text-slate-900 uppercase">{selectedUserDetail.role}</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <div className="text-[10px] font-extrabold uppercase text-slate-500">Teaching Subject</div>
                  <div className="font-bold text-slate-900">{selectedUserDetail.subject || "Not Specified"}</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <div className="text-[10px] font-extrabold uppercase text-slate-500">Class / Grade</div>
                  <div className="font-bold text-slate-900">{selectedUserDetail.classes || "Not Specified"}</div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                onClick={() => setSelectedUserDetail(null)}
                className="px-5 py-2.5 bg-slate-900 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer hover:bg-slate-800"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
