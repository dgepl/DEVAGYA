"use client";

import { useState, useEffect, useMemo } from "react";
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
  Clock,
  Calendar,
  CalendarClock,
  Zap,
  Rocket,
  Edit3,
  Filter,
  Brain,
  HeartHandshake,
  Activity,
  Video,
  SlidersHorizontal,
  LayoutGrid,
  Table as TableIcon,
  Tag,
  MessageSquare,
  MapPin,
  LogOut,
  Menu,
  X,
  TrendingUp,
  BarChart3,
  Check,
  ChevronRight,
  Headphones,
  Laptop,
  CheckCircle,
  XCircle,
  Flame,
  ArrowUpRight
} from "lucide-react";
import { useToolConfigStore, ToolItem } from "@/store/useToolConfigStore";
import { getApiBase } from "@/lib/api";
import { DevgyaLogo } from "@/components/common/DevgyaLogo";

export default function SuperAdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminUser, setAdminUser] = useState("");
  const [adminPass, setAdminPass] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loadingLogin, setLoadingLogin] = useState(false);
  const [sessionRevokedNotice, setSessionRevokedNotice] = useState<string | null>(null);

  const getLocalISOString = (offsetMs = 0) => {
    const d = new Date(Date.now() + offsetMs);
    const tzOffset = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - tzOffset).toISOString().slice(0, 16);
  };

  // Main Left Slidebar Tabs
  const [adminTab, setAdminTab] = useState<"analytics" | "users" | "permissions" | "paper_studio" | "olympiad" | "schools" | "security">("analytics");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Platform Feature Permission Store
  const { tools, toggleFeatureAllowed, setAllFeaturesAllowed, resetToDefaults, fetchFromServer, saveToServer } = useToolConfigStore();
  const [permissionRoleFilter, setPermissionRoleFilter] = useState<"all" | "teacher" | "student" | "parent">("all");
  const [permissionSearch, setPermissionSearch] = useState("");
  const [permissionStatusFilter, setPermissionStatusFilter] = useState<"all" | "allowed" | "disabled">("all");

  // Sync tools on mount
  useEffect(() => {
    fetchFromServer();
  }, []);

  // Detailed Analytics State
  const [detailedAnalytics, setDetailedAnalytics] = useState<any | null>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  // School Management & Verification State
  const [schoolsList, setSchoolsList] = useState<any[]>([]);
  const [schoolFilter, setSchoolFilter] = useState<"all" | "pending_verification" | "verified" | "rejected">("all");
  const [selectedSchoolDetail, setSelectedSchoolDetail] = useState<any | null>(null);
  const [verifyingSchoolId, setVerifyingSchoolId] = useState<string | null>(null);

  // Paper Studio Sub-Tab State
  const [paperStudioSubTab, setPaperStudioSubTab] = useState<"tso_100_ai" | "manual_builder" | "repository">("tso_100_ai");

  // Master TSO 100-MCQ AI Generator & Editor State
  const [tsoSubject, setTsoSubject] = useState("Science");
  const [tsoClass, setTsoClass] = useState("Secondary (Classes 9–10)");
  const [tsoTitle, setTsoTitle] = useState("National Teacher Skills Olympiad 2026 — SCIENCE");
  const [tsoDifficulty, setTsoDifficulty] = useState("medium");
  const [tsoStartTime, setTsoStartTime] = useState(getLocalISOString(0));
  const [tsoEndTime, setTsoEndTime] = useState(getLocalISOString(30 * 24 * 60 * 60 * 1000));
  const [generatingTso100, setGeneratingTso100] = useState(false);
  const [tsoDraftPaper, setTsoDraftPaper] = useState<any | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<any | null>(null);
  const [editQuestionModalOpen, setEditQuestionModalOpen] = useState(false);
  const [savingQuestionEdit, setSavingQuestionEdit] = useState(false);
  const [activatingTsoPaper, setActivatingTsoPaper] = useState(false);

  // Data States
  const [stats, setStats] = useState<any>(null);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [userActiveTodayFilter, setUserActiveTodayFilter] = useState<"all" | "active_today">("all");
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [papersList, setPapersList] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterGrade, setFilterGrade] = useState("all");
  const [filterSubject, setFilterSubject] = useState("all");
  const [filterBoard, setFilterBoard] = useState("all");
  const [loadingData, setLoadingData] = useState(false);
  const [actionMsg, setActionMsg] = useState<string | null>(null);
  const [selectedUserDetail, setSelectedUserDetail] = useState<any | null>(null);

  // User Activity Timeline Modal
  const [activityModalUser, setActivityModalUser] = useState<any | null>(null);
  const [userTimeline, setUserTimeline] = useState<any[]>([]);
  const [loadingTimeline, setLoadingTimeline] = useState(false);

  // Olympiad Evaluation Modal State
  const [selectedSub, setSelectedSub] = useState<any | null>(null);
  const [editScore, setEditScore] = useState<number>(0);
  const [editFeedback, setEditFeedback] = useState<string>("");
  const [publishing, setPublishing] = useState<boolean>(false);
  const [selectedPaperForSubmissions, setSelectedPaperForSubmissions] = useState<string | "all">("all");
  const [bulkPublishing, setBulkPublishing] = useState<boolean>(false);
  const [deletingSubId, setDeletingSubId] = useState<string | null>(null);
  const [bulkDeleting, setBulkDeleting] = useState<boolean>(false);
  const [reviewingSubScript, setReviewingSubScript] = useState<any | null>(null);

  // AI Prompt Generator Form State
  const [aiPromptText, setAiPromptText] = useState("Generate an official Class 10 CBSE Science Olympiad Assessment focusing on Light, Electricity, and Chemical Reactions. ALL QUESTIONS MUST BE MCQs ONLY.");
  const [aiTitle, setAiTitle] = useState("Class 10 CBSE Science Olympiad Assessment");
  const [aiClass, setAiClass] = useState("Class 10");
  const [aiSubject, setAiSubject] = useState("Science");
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

  // Schedule & Timing Edit Modal State
  const [scheduleModalPaper, setScheduleModalPaper] = useState<any | null>(null);
  const [schedTitle, setSchedTitle] = useState("");
  const [schedStartTime, setSchedStartTime] = useState(getLocalISOString(0));
  const [schedEndTime, setSchedEndTime] = useState(getLocalISOString(30 * 24 * 60 * 60 * 1000));
  const [schedPublished, setSchedPublished] = useState(true);
  const [savingSchedule, setSavingSchedule] = useState(false);

  const handleRevokedSession = (msg?: string) => {
    localStorage.removeItem("devgya_admin_token");
    setIsAuthenticated(false);
    setSessionRevokedNotice(
      msg || "Another administrator logged in from another device. For security, your session has been ended automatically."
    );
  };

  const verifySession = async (tokenToCheck?: string) => {
    const token = tokenToCheck || (typeof window !== "undefined" ? localStorage.getItem("devgya_admin_token") : null);
    if (!token) {
      setIsAuthenticated(false);
      return false;
    }
    try {
      const baseUrl = getApiBase();
      const res = await fetch(`${baseUrl}/admin/session-verify`, {
        headers: { "x-admin-token": token }
      });
      if (res.ok) {
        return true;
      }
      if (res.status === 401) {
        const err = await res.json().catch(() => ({}));
        if (err.detail === "SESSION_REVOKED") {
          handleRevokedSession("Another administrator logged in from another device. You have been logged out automatically.");
        } else {
          handleRevokedSession("Admin session has expired. Please log in again.");
        }
        return false;
      }
      return false;
    } catch (e) {
      return true;
    }
  };

  // Restore session from localStorage on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("devgya_admin_token");
    if (token) {
      verifySession(token).then((isValid) => {
        if (isValid) {
          setIsAuthenticated(true);
          fetchAdminData(token);
        }
      });
    }
  }, []);

  // Heartbeat monitor: actively checks session every 5s while authenticated
  useEffect(() => {
    if (!isAuthenticated) return;
    const interval = setInterval(() => {
      verifySession();
    }, 5000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const handleAdminLogout = async () => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("devgya_admin_token") : null;
      const baseUrl = getApiBase();
      await fetch(`${baseUrl}/admin/logout`, {
        method: "POST",
        headers: token ? { "x-admin-token": token } : {}
      });
    } catch {
      // ignore
    } finally {
      if (typeof window !== "undefined") {
        localStorage.removeItem("devgya_admin_token");
      }
      setIsAuthenticated(false);
      setSessionRevokedNotice(null);
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setSessionRevokedNotice(null);
    setLoadingLogin(true);

    try {
      const baseUrl = getApiBase();
      const res = await fetch(`${baseUrl}/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: adminUser.trim(), password: adminPass.trim() })
      });
      let data: any = {};
      try {
        data = await res.json();
      } catch {}

      if (res.ok && data.token) {
        localStorage.setItem("devgya_admin_token", data.token);
        setIsAuthenticated(true);
        fetchAdminData(data.token);
      } else {
        setLoginError(data.detail || "Invalid Super Admin credentials. Use admin / admin123");
      }
    } catch (err) {
      setLoginError("Failed to reach server. Ensure FastAPI backend is running on port 8000.");
    } finally {
      setLoadingLogin(false);
    }
  };

  const fetchAdminData = async (tokenOverride?: string) => {
    setLoadingData(true);
    try {
      const token = tokenOverride || (typeof window !== "undefined" ? localStorage.getItem("devgya_admin_token") : null);
      const baseUrl = getApiBase();

      // 1. Fetch Admin Stats & Submissions
      const res = await fetch(`${baseUrl}/admin/stats`, {
        headers: token ? { "x-admin-token": token } : {}
      });
      if (res.status === 401) {
        handleRevokedSession("Session has been terminated because another device logged in.");
        return;
      }
      const data = await res.json();
      setStats(data.metrics);
      if (data.submissions) setSubmissions(data.submissions);
      if (data.papers) setPapersList(data.papers);
      if (data.schools) setSchoolsList(data.schools);

      // 2. Fetch User Profiles enriched with today's live activity
      const usersRes = await fetch(`${baseUrl}/admin/users`, {
        headers: token ? { "x-admin-token": token } : {}
      });
      if (usersRes.ok) {
        const usersData = await usersRes.json();
        if (usersData.users) setUsersList(usersData.users);
      }

      // 3. Fetch Detailed Real-Time Platform Analytics
      fetchDetailedAnalytics(token || undefined);
    } catch (e) {
      console.error("Error fetching admin data", e);
    } finally {
      setLoadingData(false);
    }
  };

  const fetchDetailedAnalytics = async (tokenOverride?: string) => {
    setLoadingAnalytics(true);
    try {
      const token = tokenOverride || (typeof window !== "undefined" ? localStorage.getItem("devgya_admin_token") : null);
      const baseUrl = getApiBase();
      const res = await fetch(`${baseUrl}/admin/analytics/detailed`, {
        headers: token ? { "x-admin-token": token } : {}
      });
      if (res.ok) {
        const data = await res.json();
        setDetailedAnalytics(data.analytics);
      }
    } catch (e) {
      console.error("Error fetching detailed analytics:", e);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  const handleOpenUserActivity = async (u: any) => {
    setActivityModalUser(u);
    setLoadingTimeline(true);
    setUserTimeline([]);
    try {
      const baseUrl = getApiBase();
      const token = typeof window !== "undefined" ? localStorage.getItem("devgya_admin_token") : null;
      const res = await fetch(`${baseUrl}/admin/users/${encodeURIComponent(u.email)}/activity?limit=50`, {
        headers: token ? { "x-admin-token": token } : {}
      });
      if (res.ok) {
        const data = await res.json();
        setUserTimeline(data.timeline || []);
      }
    } catch (e) {
      console.error("Failed to load user activity:", e);
    } finally {
      setLoadingTimeline(false);
    }
  };

  const handleVerifySchool = async (schoolId: string) => {
    setVerifyingSchoolId(schoolId);
    try {
      const baseUrl = getApiBase();
      const res = await fetch(`${baseUrl}/admin/schools/${schoolId}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: "Approved by administrator" })
      });
      const data = await res.json();
      if (res.ok) {
        setActionMsg(data.message || "School verified and dashboard unlocked!");
        setSchoolsList(prev => prev.map(s => s.id === schoolId ? { ...s, verification_status: "verified" } : s));
        setSelectedSchoolDetail((prev: any) => prev && prev.id === schoolId ? { ...prev, verification_status: "verified" } : prev);
        setTimeout(() => setActionMsg(null), 4000);
      } else {
        alert(data.detail || "Failed to verify school");
      }
    } catch (err: any) {
      alert("Failed to verify school: " + (err?.message || "Unknown error"));
    } finally {
      setVerifyingSchoolId(null);
    }
  };

  const handleRejectSchool = async (schoolId: string) => {
    if (!confirm("Are you sure you want to reject/suspend this school?")) return;
    setVerifyingSchoolId(schoolId);
    try {
      const baseUrl = getApiBase();
      const res = await fetch(`${baseUrl}/admin/schools/${schoolId}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: "Rejected by administrator" })
      });
      const data = await res.json();
      if (res.ok) {
        setActionMsg(data.message || "School verification rejected.");
        setSchoolsList(prev => prev.map(s => s.id === schoolId ? { ...s, verification_status: "rejected" } : s));
        setSelectedSchoolDetail((prev: any) => prev && prev.id === schoolId ? { ...prev, verification_status: "rejected" } : prev);
        setTimeout(() => setActionMsg(null), 4000);
      } else {
        alert(data.detail || "Failed to reject school");
      }
    } catch (err: any) {
      alert("Failed to reject school: " + (err?.message || "Unknown error"));
    } finally {
      setVerifyingSchoolId(null);
    }
  };

  // Generate Paper with AI via Prompt
  const handleGenerateAiPaper = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneratingAiPaper(true);
    try {
      const baseUrl = getApiBase();
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
        setActionMsg(`AI Paper "${data.paper.title}" generated with ${data.paper.questions?.length || aiTotalMarks} questions! You can now review and click Publish.`);
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

  // Master 100-MCQ TSO AI Generator Handler (60/40 Hybrid Structure)
  const handleGenerateTso100AI = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneratingTso100(true);
    try {
      const baseUrl = getApiBase();
      const payload = {
        subject: tsoSubject,
        class_name: tsoClass,
        title: tsoTitle,
        difficulty: tsoDifficulty,
        start_time: tsoStartTime.replace("T", " ") + ":00",
        end_time: tsoEndTime.replace("T", " ") + ":00",
        school_name: "DEVGYA GLOBAL EDUTECH"
      };

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000);

      const res = await fetch(`${baseUrl}/admin/tso/generate-100-ai`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      
      let data: any = {};
      try {
        data = await res.json();
      } catch {
        throw new Error("Unable to parse server response.");
      }

      if (res.ok && (data.paper || data.status === "success")) {
        const generatedPaper = data.paper || data;
        setTsoDraftPaper(generatedPaper);
        setActionMsg(`100-MCQ National TSO Paper for "${generatedPaper.subject || tsoSubject}" synthesized with 60/40 Hybrid Structure!`);
        fetchAdminData();
        setTimeout(() => setActionMsg(null), 5000);
      } else {
        alert(data.detail || data.message || "Failed to synthesize 100-MCQ paper with AI.");
      }
    } catch (err: any) {
      const isAbort = err?.name === "AbortError";
      alert(isAbort ? "Paper generation took longer than expected. Please try again." : (err?.message || "Failed to synthesize TSO paper."));
    } finally {
      setGeneratingTso100(false);
    }
  };

  // Open Edit Question Modal
  const handleOpenEditQuestion = (q: any) => {
    setEditingQuestion({
      ...q,
      options: [...(q.options || ["", "", "", ""])]
    });
    setEditQuestionModalOpen(true);
  };

  // Save Question Updates
  const handleSaveEditedQuestion = async () => {
    if (!editingQuestion || !tsoDraftPaper) return;
    setSavingQuestionEdit(true);
    try {
      const baseUrl = getApiBase();
      const qId = editingQuestion.id || editingQuestion.question_number;
      const res = await fetch(`${baseUrl}/admin/tso/papers/${tsoDraftPaper.id}/questions/${qId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question_text: editingQuestion.question_text,
          options: editingQuestion.options,
          correct_answer: editingQuestion.correct_answer,
          explanation: editingQuestion.explanation,
          module: editingQuestion.module,
          section: editingQuestion.section
        })
      });
      const data = await res.json();
      if (res.ok) {
        const updatedQs = tsoDraftPaper.questions.map((q: any) => {
          if (q.id === qId || q.question_number === qId) {
            return {
              ...q,
              ...editingQuestion,
              answer: editingQuestion.options[editingQuestion.correct_answer]
            };
          }
          return q;
        });
        setTsoDraftPaper({ ...tsoDraftPaper, questions: updatedQs });
        setEditQuestionModalOpen(false);
        setEditingQuestion(null);
        setActionMsg(`Question #${qId} successfully updated and saved!`);
        fetchAdminData();
        setTimeout(() => setActionMsg(null), 4000);
      } else {
        alert(data.detail || "Failed to update question.");
      }
    } catch (err) {
      alert("Error saving question updates.");
    } finally {
      setSavingQuestionEdit(false);
    }
  };

  // Save Schedule & Activate TSO Paper for Live Exam Hall
  const handlePublishTsoPaper = async () => {
    if (!tsoDraftPaper) return;
    setActivatingTsoPaper(true);
    try {
      const baseUrl = getApiBase();
      const res = await fetch(`${baseUrl}/admin/tso/papers/${tsoDraftPaper.id}/schedule`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: tsoTitle,
          start_time: tsoStartTime.replace("T", " ") + ":00",
          end_time: tsoEndTime.replace("T", " ") + ":00",
          published: true
        })
      });
      const data = await res.json();
      if (res.ok) {
        setActionMsg(`TSO Paper "${tsoDraftPaper.title}" is now the ACTIVE LIVE paper for the National Olympiad!`);
        fetchAdminData();
        setTimeout(() => setActionMsg(null), 6000);
      } else {
        alert(data.detail || "Failed to activate TSO paper.");
      }
    } catch (err) {
      alert("Error activating TSO paper.");
    } finally {
      setActivatingTsoPaper(false);
    }
  };

  // Publish AI Draft Paper after Admin Review
  const handlePublishAiDraftPaper = async () => {
    if (!aiDraftPaper) return;
    setPublishingAiPaper(true);
    try {
      const baseUrl = getApiBase();
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

  // Save Manual Paper
  const handleSaveManualPaper = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualTitle.trim()) {
      alert("Please enter a Paper Title.");
      return;
    }
    setSavingManualPaper(true);
    try {
      const baseUrl = getApiBase();
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

  // Calculate Live Schedule Status
  const getPaperScheduleStatus = (paper: any) => {
    if (paper.published === false) {
      return { status: "inactive", label: "Draft / Inactive", color: "bg-slate-100 text-slate-600 border-slate-200" };
    }
    const now = Date.now();
    if (paper.start_time) {
      const startMs = new Date(paper.start_time.replace(" ", "T")).getTime();
      if (!isNaN(startMs) && now < startMs) {
        return { status: "upcoming", label: "Upcoming Scheduled", color: "bg-amber-50 text-amber-700 border-amber-200" };
      }
    }
    if (paper.end_time) {
      const endMs = new Date(paper.end_time.replace(" ", "T")).getTime();
      if (!isNaN(endMs) && now > endMs) {
        return { status: "expired", label: "Concluded", color: "bg-rose-50 text-rose-700 border-rose-200" };
      }
    }
    return { status: "live", label: "Live & Active", color: "bg-emerald-50 text-emerald-700 border-emerald-200" };
  };

  // Open Schedule Editor Modal
  const openScheduleModal = (paper: any) => {
    setScheduleModalPaper(paper);
    setSchedTitle(paper.title || "");
    const formatForInput = (isoStr?: string, defaultOffset = 0) => {
      if (!isoStr) return getLocalISOString(defaultOffset);
      try {
        const d = new Date(isoStr.replace(" ", "T"));
        if (isNaN(d.getTime())) return getLocalISOString(defaultOffset);
        const tzOffset = d.getTimezoneOffset() * 60000;
        return new Date(d.getTime() - tzOffset).toISOString().slice(0, 16);
      } catch {
        return getLocalISOString(defaultOffset);
      }
    };
    setSchedStartTime(formatForInput(paper.start_time, 0));
    setSchedEndTime(formatForInput(paper.end_time, 30 * 24 * 60 * 60 * 1000));
    setSchedPublished(paper.published !== false);
  };

  // Save Paper Schedule Changes
  const handleSavePaperSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduleModalPaper) return;
    setSavingSchedule(true);
    setActionMsg(null);
    try {
      const baseUrl = getApiBase();
      const startFormatted = schedStartTime.replace("T", " ") + (schedStartTime.length === 16 ? ":00" : "");
      const endFormatted = schedEndTime.replace("T", " ") + (schedEndTime.length === 16 ? ":00" : "");
      const res = await fetch(`${baseUrl}/admin/tso/papers/${scheduleModalPaper.id}/schedule`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: schedTitle.trim() || scheduleModalPaper.title,
          start_time: startFormatted,
          end_time: endFormatted,
          published: schedPublished
        })
      });
      const data = await res.json();
      if (!res.ok || data.status === "error") {
        throw new Error(data.message || data.detail || "Failed to update schedule");
      }
      setActionMsg(`✅ Schedule updated successfully for "${schedTitle || scheduleModalPaper.title}".`);
      setScheduleModalPaper(null);
      await fetchAdminData();
      setTimeout(() => setActionMsg(null), 5000);
    } catch (err: any) {
      alert(err.message || "Failed to save paper schedule");
    } finally {
      setSavingSchedule(false);
    }
  };

  // Delete Paper
  const handleDeletePaper = async (paperId: string) => {
    if (!confirm("Are you sure you want to delete this question paper?")) return;
    try {
      const baseUrl = getApiBase();
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

  const handleDeleteUser = async (userId: string, userEmail: string) => {
    if (!confirm(`Are you sure you want to delete user ${userEmail}?`)) return;
    try {
      const baseUrl = getApiBase();
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
      const baseUrl = getApiBase();
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
      if (res.ok && data.status === "success") {
        setActionMsg(`Olympiad Submission #${selectedSub.id} updated & ${publishing ? "Published to Live Leaderboard!" : "Saved as Evaluated."}`);
        setSelectedSub(null);
        await fetchAdminData();
        setTimeout(() => setActionMsg(null), 4000);
      } else {
        alert(data.detail || data.message || "Failed to update Olympiad submission.");
      }
    } catch (e: any) {
      alert(`Failed to update Olympiad submission: ${e.message || e}`);
    }
  };

  // 1-Click Bulk Publish Olympiad Results
  const handleBulkPublishSubmissions = async (paperId?: string) => {
    const targetId = paperId || (selectedPaperForSubmissions !== "all" ? selectedPaperForSubmissions : "");
    if (!confirm(`Are you sure you want to publish results for all participants ${targetId ? `for paper (${targetId})` : "across all papers"} to the live public leaderboard?`)) {
      return;
    }
    setBulkPublishing(true);
    try {
      const baseUrl = getApiBase();
      const query = targetId ? `?paper_id=${encodeURIComponent(targetId)}` : "";
      const res = await fetch(`${baseUrl}/admin/olympiad/publish-all${query}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      const data = await res.json();
      if (res.ok && data.status === "success") {
        setActionMsg(`1-Click Publish Success! Published results for ${data.published_count || "all"} candidate(s) to Live Leaderboard! 🚀`);
        await fetchAdminData();
        setTimeout(() => setActionMsg(null), 5000);
      } else {
        alert(data.detail || data.message || "Failed to bulk publish results.");
      }
    } catch (e: any) {
      alert(`Error executing bulk publish: ${e.message || e}`);
    } finally {
      setBulkPublishing(false);
    }
  };

  // Delete single Olympiad Submission
  const handleDeleteSubmission = async (subId: string) => {
    if (!confirm(`Are you sure you want to permanently delete submission #${subId}?`)) return;
    setDeletingSubId(subId);
    try {
      const baseUrl = getApiBase();
      const res = await fetch(`${baseUrl}/admin/olympiad/submissions/${subId}`, { method: "DELETE" });
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

  // Bulk Delete Submissions
  const handleBulkDeleteSubmissions = async (paperId?: string) => {
    const targetId = paperId || (selectedPaperForSubmissions !== "all" ? selectedPaperForSubmissions : "all");
    const paperName = targetId === "all" ? "ALL papers" : `paper (${targetId})`;
    if (!confirm(`⚠️ DANGER: Are you sure you want to PERMANENTLY DELETE ALL results for ${paperName}?`)) return;
    setBulkDeleting(true);
    try {
      const baseUrl = getApiBase();
      const query = targetId !== "all" ? `?paper_id=${encodeURIComponent(targetId)}` : "?paper_id=all";
      const res = await fetch(`${baseUrl}/admin/olympiad/submissions${query}`, { method: "DELETE" });
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

  // Filtered Users computation
  const filteredUsers = useMemo(() => {
    return usersList.filter((u) => {
      // 1. Filter by Active Today if active_today filter is selected
      if (userActiveTodayFilter === "active_today" && !u.is_active_today) {
        return false;
      }

      // 2. Filter by search query
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = 
        !q ||
        (u.full_name || "").toLowerCase().includes(q) ||
        (u.email || "").toLowerCase().includes(q) ||
        (u.school_name || u.child_school || "").toLowerCase().includes(q) ||
        (u.phone || "").toLowerCase().includes(q) ||
        (u.district || "").toLowerCase().includes(q) ||
        (u.state || "").toLowerCase().includes(q);

      if (!matchesSearch) return false;

      // 3. Filter by role
      if (filterRole !== "all" && u.role !== filterRole) return false;

      // 4. Filter by grade
      const uClasses = (u.classes || u.child_class || u.category_level || "").toLowerCase();
      if (filterGrade !== "all") {
        if (filterGrade === "primary") {
          const isPrimary = uClasses.includes("primary") || ["class 1", "class 2", "class 3", "class 4", "class 5"].some(k => uClasses.includes(k));
          if (!isPrimary) return false;
        } else if (filterGrade === "middle") {
          const isMiddle = uClasses.includes("middle") || ["class 6", "class 7", "class 8"].some(k => uClasses.includes(k));
          if (!isMiddle) return false;
        } else if (filterGrade === "secondary") {
          const isSec = uClasses.includes("secondary") || ["class 9", "class 10"].some(k => uClasses.includes(k));
          if (!isSec) return false;
        } else if (filterGrade === "senior") {
          const isSenior = uClasses.includes("senior") || ["class 11", "class 12"].some(k => uClasses.includes(k));
          if (!isSenior) return false;
        } else if (!uClasses.includes(filterGrade)) {
          return false;
        }
      }

      // 5. Filter by subject
      if (filterSubject !== "all") {
        const uSub = (u.subject || u.target_exam || "").toLowerCase();
        if (!uSub.includes(filterSubject)) return false;
      }

      // 6. Filter by board
      if (filterBoard !== "all") {
        const uBoard = (u.board || u.child_board || "").toLowerCase();
        if (!uBoard.includes(filterBoard)) return false;
      }

      return true;
    });
  }, [usersList, userActiveTodayFilter, searchQuery, filterRole, filterGrade, filterSubject, filterBoard]);

  // Active Users Today Count
  const activeTodayCount = useMemo(() => {
    return usersList.filter(u => u.is_active_today).length;
  }, [usersList]);

  // Filtered Tools for Permissions Management
  const filteredTools = useMemo(() => {
    return tools.filter((tool) => {
      if (permissionRoleFilter !== "all" && tool.role !== permissionRoleFilter) {
        return false;
      }
      if (permissionStatusFilter === "allowed" && tool.is_enabled === false) {
        return false;
      }
      if (permissionStatusFilter === "disabled" && tool.is_enabled !== false) {
        return false;
      }
      if (permissionSearch.trim()) {
        const q = permissionSearch.toLowerCase().trim();
        const match = 
          tool.name.toLowerCase().includes(q) ||
          tool.category.toLowerCase().includes(q) ||
          tool.path.toLowerCase().includes(q) ||
          tool.badge.toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [tools, permissionRoleFilter, permissionStatusFilter, permissionSearch]);

  // Cheating Badge Helper for Olympiad
  const renderCheatingBadge = (sub: any) => {
    const audit = sub.proctoring_audit || {};
    const count = Number(audit.warnings_count ?? audit.warning_count ?? 0);
    const isDisqualified = Boolean(audit.disqualified || count >= 5);

    if (isDisqualified || count >= 5) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase bg-red-100 text-red-800 border border-red-300 shadow-2xs">
          <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
          <span>{count} Warnings (Disqualified)</span>
        </span>
      );
    }
    if (count >= 3) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase bg-amber-100 text-amber-800 border border-amber-300 shadow-2xs">
          <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
          <span>{count} Warnings</span>
        </span>
      );
    }
    if (count > 0) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase bg-yellow-50 text-yellow-800 border border-yellow-200">
          <span>{count} Warning{count > 1 ? "s" : ""}</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
        <span>0 Warnings (Clean)</span>
      </span>
    );
  };

  // LOGIN SCREEN
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 bg-gradient-to-tr from-indigo-500 via-purple-500 to-amber-400 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <ShieldCheck className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-black tracking-tight text-white">Super Admin Control</h2>
            <p className="text-xs text-slate-400 font-medium">DEVGYA GLOBAL EDUTECH PRIVATE LIMITED</p>
          </div>

          {sessionRevokedNotice && (
            <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-amber-300 text-xs font-bold flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>{sessionRevokedNotice}</span>
            </div>
          )}

          {loginError && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-300 text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Admin Username</label>
              <input
                type="text"
                required
                value={adminUser}
                onChange={(e) => setAdminUser(e.target.value)}
                placeholder="admin"
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs font-semibold focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Admin Password</label>
              <input
                type="password"
                required
                value={adminPass}
                onChange={(e) => setAdminPass(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs font-semibold focus:outline-none focus:border-indigo-500"
              />
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

          <div className="text-center pt-2 border-t border-slate-800 text-[11px] text-slate-400 font-mono">
            Default Credentials: admin / admin123
          </div>
        </div>
      </div>
    );
  }

  // NAVIGATION ITEMS FOR LEFT SLIDEBAR
  const navItemsList = [
    {
      id: "analytics",
      label: "Site Analytics",
      icon: Activity,
      badge: "LIVE",
      badgeColor: "bg-emerald-500 text-white"
    },
    {
      id: "users",
      label: "Users & Activity",
      icon: Users,
      badge: `${activeTodayCount} Today`,
      badgeColor: activeTodayCount > 0 ? "bg-indigo-500 text-white" : "bg-slate-700 text-slate-300"
    },
    {
      id: "permissions",
      label: "Feature Permissions",
      icon: Sliders,
      badge: `${tools.filter(t => t.is_enabled !== false).length} Active`,
      badgeColor: "bg-amber-500 text-white"
    },
    {
      id: "paper_studio",
      label: "Paper Studio",
      icon: Wand2,
      badge: `${papersList.length}`,
      badgeColor: "bg-purple-500 text-white"
    },
    {
      id: "olympiad",
      label: "Olympiad Board",
      icon: Trophy,
      badge: `${submissions.length}`,
      badgeColor: "bg-yellow-500 text-slate-900 font-black"
    },
    {
      id: "schools",
      label: "School Verification",
      icon: Building2,
      badge: `${schoolsList.filter(s => s.verification_status === "pending_verification").length} Pending`,
      badgeColor: schoolsList.filter(s => s.verification_status === "pending_verification").length > 0 ? "bg-rose-500 text-white" : "bg-slate-700 text-slate-300"
    },
    {
      id: "security",
      label: "Security & Sessions",
      icon: Lock,
      badge: "Single Session",
      badgeColor: "bg-cyan-500 text-white"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row text-slate-900 font-sans">
      
      {/* ========================================================================= */}
      {/* DESKTOP FIXED LEFT SLIDEBAR */}
      {/* ========================================================================= */}
      <aside className="hidden md:flex flex-col w-64 lg:w-72 bg-slate-900 text-white border-r border-slate-800 p-5 fixed inset-y-0 z-40 justify-between">
        <div className="space-y-6 overflow-y-auto pr-1">
          
          {/* LOGO & BRAND HEADER */}
          <div className="space-y-2 pb-4 border-b border-slate-800">
            <Link href="/dashboard" className="flex items-center gap-2">
              <DevgyaLogo size="md" showText={true} className="brightness-125" />
            </Link>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-[10px] font-black uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
              <span>Super Admin Portal</span>
            </div>
          </div>

          {/* ACTIVE DEVICE CARD */}
          <div className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700/70 space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                <Laptop className="w-3.5 h-3.5 text-emerald-400" />
                <span>Device Protected</span>
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            </div>
            <p className="text-[10px] text-slate-400 font-medium">Single-session lock active</p>
          </div>

          {/* NAVIGATION SLIDEBAR ITEMS */}
          <nav className="space-y-1.5">
            <p className="text-[10px] uppercase font-black text-slate-500 px-3 tracking-wider">Navigation Menu</p>
            {navItemsList.map((item) => {
              const Icon = item.icon;
              const isActive = adminTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setAdminTab(item.id as any)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 border border-indigo-500"
                      : "text-slate-400 hover:text-white hover:bg-slate-800/70"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* BOTTOM ACTION BUTTONS */}
        <div className="pt-4 border-t border-slate-800 space-y-2">
          <button
            onClick={() => fetchAdminData()}
            disabled={loadingData}
            className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingData ? "animate-spin" : ""}`} />
            <span>Refresh Data</span>
          </button>

          <button
            onClick={handleAdminLogout}
            className="w-full py-2 px-3 rounded-xl bg-rose-500/20 hover:bg-rose-600 text-rose-300 hover:text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Log Out Admin</span>
          </button>
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* MOBILE TOP BAR WITH HAMBURGER DRAWER */}
      {/* ========================================================================= */}
      <header className="md:hidden sticky top-0 z-40 bg-slate-900 text-white px-4 py-3 flex items-center justify-between border-b border-slate-800 shadow-md">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setMobileNavOpen(true)}
            className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
            aria-label="Open Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="text-sm font-black tracking-tight">Super Admin</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchAdminData()}
            disabled={loadingData}
            className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
            title="Refresh Database"
          >
            <RefreshCw className={`w-4 h-4 ${loadingData ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={handleAdminLogout}
            className="p-2 rounded-xl bg-rose-500/20 text-rose-300 hover:bg-rose-600 hover:text-white cursor-pointer"
            title="Log Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* MOBILE SLIDE-OUT DRAWER */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex justify-start md:hidden">
          <div className="w-4/5 max-w-xs bg-slate-900 text-white h-full p-5 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-left duration-200">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-indigo-400" />
                  <span className="font-black text-sm">DEVGYA Admin</span>
                </div>
                <button
                  onClick={() => setMobileNavOpen(false)}
                  className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="space-y-1.5">
                {navItemsList.map((item) => {
                  const Icon = item.icon;
                  const isActive = adminTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setAdminTab(item.id as any);
                        setMobileNavOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isActive
                          ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                          : "text-slate-400 hover:text-white hover:bg-slate-800/70"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${item.badgeColor}`}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>

            <div className="pt-4 border-t border-slate-800">
              <button
                onClick={handleAdminLogout}
                className="w-full py-2.5 px-3 rounded-xl bg-rose-600 text-white text-xs font-bold flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MAIN CONTENT AREA */}
      {/* ========================================================================= */}
      <main className="flex-1 md:pl-64 lg:pl-72 flex flex-col min-h-screen">
        
        {/* TOP SUB-HEADER BAR */}
        <div className="bg-white border-b border-slate-200 px-4 sm:px-8 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sticky top-0 md:static z-20 shadow-2xs">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400 font-medium">Control Center</span>
            <span className="text-slate-300">/</span>
            <span className="font-extrabold text-slate-800 capitalize">
              {navItemsList.find(n => n.id === adminTab)?.label || "Dashboard"}
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Live Database Sync</span>
            </div>
            
            <button
              onClick={() => fetchAdminData()}
              disabled={loadingData}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingData ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* NOTIFICATION MESSAGE */}
        {actionMsg && (
          <div className="m-4 sm:m-6 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-black flex items-center gap-2 shadow-sm animate-in fade-in duration-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionMsg}</span>
          </div>
        )}

        <div className="p-4 sm:p-6 lg:p-8 space-y-6 flex-1 max-w-7xl w-full mx-auto">
          
          {/* ========================================================================= */}
          {/* TAB 1: SITE ANALYTICS (DETAILED FULL-SITE ANALYTICS)                      */}
          {/* ========================================================================= */}
          {adminTab === "analytics" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              {/* TOP SUMMARY CARDS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-2">
                  <div className="flex items-center justify-between text-emerald-600">
                    <Activity className="w-5 h-5" />
                    <span className="text-[10px] uppercase font-black bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full">
                      Live Today
                    </span>
                  </div>
                  <p className="text-3xl font-black text-slate-900">
                    {activeTodayCount}
                  </p>
                  <p className="text-xs text-slate-500 font-medium">Daily Active Users (DAU)</p>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-2">
                  <div className="flex items-center justify-between text-indigo-600">
                    <Zap className="w-5 h-5" />
                    <span className="text-[10px] uppercase font-black bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full">
                      Interactions
                    </span>
                  </div>
                  <p className="text-3xl font-black text-slate-900">
                    {detailedAnalytics?.actions_today || 0}
                  </p>
                  <p className="text-xs text-slate-500 font-medium">Actions Executed Today</p>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-2">
                  <div className="flex items-center justify-between text-purple-600">
                    <Users className="w-5 h-5" />
                    <span className="text-[10px] uppercase font-black bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full">
                      Total
                    </span>
                  </div>
                  <p className="text-3xl font-black text-slate-900">
                    {stats?.total_users || usersList.length}
                  </p>
                  <p className="text-xs text-slate-500 font-medium">Registered User Profiles</p>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-2">
                  <div className="flex items-center justify-between text-amber-600">
                    <Building2 className="w-5 h-5" />
                    <span className="text-[10px] uppercase font-black bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full">
                      Schools
                    </span>
                  </div>
                  <p className="text-3xl font-black text-slate-900">
                    {stats?.schools_count || schoolsList.length}
                  </p>
                  <p className="text-xs text-slate-500 font-medium">Affiliated School Campuses</p>
                </div>

              </div>

              {/* TRAFFIC & FEATURE RANKINGS GRID */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* 2-Column: TOP FEATURES RANKING */}
                <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-5">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                      <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-indigo-600" />
                        <span>Platform Feature Usage Rankings (Today)</span>
                      </h3>
                      <p className="text-xs text-slate-500 font-medium">
                        Real-time telemetry measuring user engagement per feature
                      </p>
                    </div>
                  </div>

                  {(!detailedAnalytics?.features_ranking || detailedAnalytics.features_ranking.length === 0) ? (
                    <div className="text-center py-8 text-slate-400 font-medium text-xs">
                      No feature interactions logged yet today. Telemetry updates automatically as users browse.
                    </div>
                  ) : (
                    <div className="space-y-3.5">
                      {detailedAnalytics.features_ranking.map((feat: any, idx: number) => {
                        const totalActions = detailedAnalytics.actions_today || 1;
                        const percentage = Math.min(100, Math.round((feat.count / totalActions) * 100));
                        return (
                          <div key={feat.name} className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <div className="flex items-center gap-2 font-bold text-slate-800">
                                <span className="w-5 h-5 rounded-md bg-slate-100 text-slate-600 flex items-center justify-center font-mono text-[10px]">
                                  #{idx + 1}
                                </span>
                                <span>{feat.name}</span>
                              </div>
                              <div className="flex items-center gap-2 text-[11px] font-extrabold text-indigo-600">
                                <span>{feat.count} visits</span>
                                <span className="text-slate-400">({percentage}%)</span>
                              </div>
                            </div>
                            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                              <div 
                                className="bg-gradient-to-r from-indigo-500 to-purple-600 h-full rounded-full transition-all duration-500" 
                                style={{ width: `${Math.max(6, percentage)}%` }} 
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* 1-Column: ROLE DISTRIBUTION */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-5">
                  <div className="border-b border-slate-100 pb-3">
                    <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                      <Users className="w-5 h-5 text-purple-600" />
                      <span>User Role Breakdown</span>
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">Active demographics across accounts</p>
                  </div>

                  <div className="space-y-3">
                    {[
                      { role: "Teachers", count: stats?.teachers_count ?? usersList.filter(u => u.role === "teacher").length, color: "bg-indigo-500", text: "text-indigo-600", bg: "bg-indigo-50" },
                      { role: "Students", count: stats?.students_count ?? usersList.filter(u => u.role === "student").length, color: "bg-purple-500", text: "text-purple-600", bg: "bg-purple-50" },
                      { role: "Parents", count: stats?.parents_count ?? usersList.filter(u => u.role === "parent").length, color: "bg-rose-500", text: "text-rose-600", bg: "bg-rose-50" },
                      { role: "Schools", count: stats?.schools_count ?? schoolsList.length, color: "bg-amber-500", text: "text-amber-600", bg: "bg-amber-50" }
                    ].map((item) => {
                      const total = usersList.length || 1;
                      const pct = Math.round((item.count / total) * 100);
                      return (
                        <div key={item.role} className={`p-3.5 rounded-2xl ${item.bg} border border-slate-100 space-y-1.5`}>
                          <div className="flex items-center justify-between text-xs font-bold">
                            <span className={item.text}>{item.role}</span>
                            <span className="font-extrabold text-slate-900">{item.count} users ({pct}%)</span>
                          </div>
                          <div className="w-full bg-white h-2 rounded-full overflow-hidden">
                            <div className={`${item.color} h-full rounded-full`} style={{ width: `${Math.max(5, pct)}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>

              {/* RECENT ACTIVITY STREAM */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-emerald-600" />
                      <span>Live Site-Wide User Event Feed</span>
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">Chronological stream of real-time actions across the platform</p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase">
                    Auto-Recording
                  </span>
                </div>

                {(!detailedAnalytics?.recent_events || detailedAnalytics.recent_events.length === 0) ? (
                  <div className="text-center py-8 text-slate-400 font-medium text-xs">
                    No events recorded today yet.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                    {detailedAnalytics.recent_events.slice(0, 15).map((ev: any, idx: number) => {
                      const timeStr = ev.timestamp ? new Date(ev.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Recently";
                      return (
                        <div key={idx} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-slate-100/70 border border-slate-100 transition-colors text-xs">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black shrink-0">
                              <Zap className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="font-bold text-slate-900">
                                {ev.user_name || ev.user_email}
                                <span className="ml-2 text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-200 text-slate-700 uppercase">
                                  {ev.user_role || "User"}
                                </span>
                              </div>
                              <div className="text-[11px] text-slate-500 font-medium">
                                Used feature: <span className="font-extrabold text-indigo-600">{ev.feature_name || ev.path}</span>
                              </div>
                            </div>
                          </div>
                          <span className="text-[10px] font-mono font-bold text-slate-400">
                            {timeStr}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: USERS & TODAY'S ACTIVITY CONTROL                                   */}
          {/* ========================================================================= */}
          {adminTab === "users" && (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6 font-sans animate-in fade-in duration-200">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <Users className="w-5 h-5 text-indigo-600" />
                    <span>User Profiles & Today's Activity</span>
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Monitor who visited the platform today, inspect which features each educator or student used, and view timelines
                  </p>
                </div>

                {/* QUICK FILTER: ALL USERS VS ACTIVE TODAY */}
                <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-2xl">
                  <button
                    onClick={() => setUserActiveTodayFilter("all")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                      userActiveTodayFilter === "all"
                        ? "bg-white text-slate-900 shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    All Users ({usersList.length})
                  </button>

                  <button
                    onClick={() => setUserActiveTodayFilter("active_today")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                      userActiveTodayFilter === "active_today"
                        ? "bg-emerald-600 text-white shadow-xs"
                        : "text-emerald-700 hover:bg-emerald-50"
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Active Today ({activeTodayCount})</span>
                  </button>
                </div>
              </div>

              {/* SEARCH & FILTERS ROW */}
              <div className="flex flex-wrap items-center gap-2.5">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search name, email, school..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs font-semibold text-slate-900 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-900 cursor-pointer focus:outline-none"
                >
                  <option value="all">All Roles</option>
                  <option value="teacher">Teachers</option>
                  <option value="student">Students</option>
                  <option value="parent">Parents</option>
                </select>

                <select
                  value={filterBoard}
                  onChange={(e) => setFilterBoard(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-900 cursor-pointer focus:outline-none"
                >
                  <option value="all">All Boards</option>
                  <option value="cbse">CBSE</option>
                  <option value="icse">ICSE</option>
                  <option value="state">State Board</option>
                </select>

                {(searchQuery || filterRole !== "all" || filterBoard !== "all" || userActiveTodayFilter !== "all") && (
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setFilterRole("all");
                      setFilterBoard("all");
                      setUserActiveTodayFilter("all");
                    }}
                    className="px-3 py-1.5 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl cursor-pointer"
                  >
                    Reset Filters
                  </button>
                )}
              </div>

              {/* USERS TABLE WITH ACTIVITY COLUMNS */}
              <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                <table className="w-full text-left text-xs text-slate-800">
                  <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider font-extrabold border-b border-slate-200">
                    <tr>
                      <th className="p-3.5">User / Account</th>
                      <th className="p-3.5">Today's Site Visit</th>
                      <th className="p-3.5">Features Used Today</th>
                      <th className="p-3.5">Role & School</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-slate-400 font-semibold">
                          {userActiveTodayFilter === "active_today"
                            ? "No users visited the site yet today."
                            : "No user accounts match query."}
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((u) => {
                        const isActiveToday = Boolean(u.is_active_today);
                        const featuresUsed = u.features_used_today || [];
                        const lastTime = u.last_active_today 
                          ? new Date(u.last_active_today).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                          : null;

                        return (
                          <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                            
                            {/* USER ACCOUNT */}
                            <td className="p-3.5 font-bold text-slate-900">
                              <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-black flex items-center justify-center text-xs shrink-0 shadow-xs">
                                  {(u.full_name || u.email || "U")[0].toUpperCase()}
                                </div>
                                <div>
                                  <div className="font-extrabold text-slate-900">{u.full_name || "Account"}</div>
                                  <div className="text-[11px] font-mono text-slate-500">{u.email}</div>
                                </div>
                              </div>
                            </td>

                            {/* TODAY'S VISIT STATUS */}
                            <td className="p-3.5">
                              {isActiveToday ? (
                                <div className="space-y-0.5">
                                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-black">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                                    <span>Active Today</span>
                                  </span>
                                  {lastTime && (
                                    <p className="text-[10px] font-mono text-slate-500 font-medium">Last: {lastTime}</p>
                                  )}
                                </div>
                              ) : (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-bold">
                                  Inactive Today
                                </span>
                              )}
                            </td>

                            {/* FEATURES USED TODAY */}
                            <td className="p-3.5">
                              {featuresUsed.length > 0 ? (
                                <div className="flex flex-wrap gap-1 max-w-xs">
                                  {featuresUsed.map((feat: string, fIdx: number) => (
                                    <span 
                                      key={fIdx} 
                                      className="px-2 py-0.5 rounded-md bg-indigo-50 border border-indigo-200 text-indigo-700 text-[10px] font-bold"
                                    >
                                      {feat}
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-slate-400 text-[11px] font-medium">—</span>
                              )}
                            </td>

                            {/* ROLE & SCHOOL */}
                            <td className="p-3.5">
                              <div className="space-y-0.5">
                                <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${
                                  u.role === "teacher" ? "bg-indigo-100 text-indigo-800" :
                                  u.role === "student" ? "bg-purple-100 text-purple-800" :
                                  u.role === "parent" ? "bg-rose-100 text-rose-800" : "bg-slate-100 text-slate-800"
                                }`}>
                                  {u.role || "teacher"}
                                </span>
                                <div className="text-[11px] text-slate-600 font-medium truncate max-w-[160px]">
                                  {u.school_name || u.child_school || "DEVGYA"}
                                </div>
                              </div>
                            </td>

                            {/* ACTIONS: TIMELINE & PROFILE */}
                            <td className="p-3.5 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => handleOpenUserActivity(u)}
                                  className="px-2.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-extrabold text-[11px] transition-colors flex items-center gap-1 cursor-pointer"
                                  title="View Detailed Activity Timeline"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  <span>Activity</span>
                                </button>

                                <button
                                  onClick={() => setSelectedUserDetail(u)}
                                  className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                                  title="View Full Profile"
                                >
                                  <User className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>

                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: FEATURE PERMISSION & ACCESS CONTROL (REPLACED COMING SOON)          */}
          {/* ========================================================================= */}
          {adminTab === "permissions" && (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6 font-sans animate-in fade-in duration-200">
              
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-[11px] font-black uppercase">
                    <Sliders className="w-3.5 h-3.5" />
                    <span>Permission Manager</span>
                  </div>
                  <h3 className="text-lg font-black text-slate-900">Feature Access & Section Permissions</h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Toggle which sections are available to users. When disabled by Admin, a feature is immediately hidden from both the desktop slidebar and mobile views, and direct URL routing is blocked.
                  </p>
                </div>

                {/* GLOBAL BULK ACTIONS */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      if (confirm("Allow all features platform-wide?")) {
                        setAllFeaturesAllowed("all", true);
                        setActionMsg("✅ All platform sections have been allowed!");
                        setTimeout(() => setActionMsg(null), 4000);
                      }
                    }}
                    className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-extrabold flex items-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Allow All</span>
                  </button>

                  <button
                    onClick={() => {
                      if (confirm("Disable all non-essential features? Users will only have access to home dashboards.")) {
                        setAllFeaturesAllowed("all", false);
                        setActionMsg("⚠️ All non-essential sections have been disabled.");
                        setTimeout(() => setActionMsg(null), 4000);
                      }
                    }}
                    className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-extrabold flex items-center gap-1.5 cursor-pointer"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Disable All</span>
                  </button>

                  <button
                    onClick={() => {
                      if (confirm("Reset tool permission configurations to platform defaults?")) {
                        resetToDefaults();
                        setActionMsg("✅ Tool permissions reset to factory defaults.");
                        setTimeout(() => setActionMsg(null), 4000);
                      }
                    }}
                    className="px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Reset Defaults
                  </button>
                </div>
              </div>

              {/* ROLE TABS & STATUS FILTER */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  {[
                    { key: "all", label: "All Sections", count: tools.length },
                    { key: "teacher", label: "Teacher Tools", count: tools.filter(t => t.role === "teacher").length },
                    { key: "student", label: "Student Tools", count: tools.filter(t => t.role === "student").length },
                    { key: "parent", label: "Parent Tools", count: tools.filter(t => t.role === "parent").length },
                  ].map((pill) => (
                    <button
                      key={pill.key}
                      onClick={() => setPermissionRoleFilter(pill.key as any)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer border ${
                        permissionRoleFilter === pill.key
                          ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                          : "bg-white text-slate-600 hover:bg-slate-50 border-slate-200"
                      }`}
                    >
                      <span>{pill.label}</span>
                      <span className="ml-1.5 opacity-60 text-[10px]">({pill.count})</span>
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={permissionStatusFilter}
                    onChange={(e) => setPermissionStatusFilter(e.target.value as any)}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 cursor-pointer focus:outline-none"
                  >
                    <option value="all">All Status</option>
                    <option value="allowed">Allowed Only</option>
                    <option value="disabled">Disabled Only</option>
                  </select>

                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={permissionSearch}
                      onChange={(e) => setPermissionSearch(e.target.value)}
                      placeholder="Search section..."
                      className="bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs font-medium text-slate-800 focus:outline-none focus:border-indigo-500 w-44 sm:w-56"
                    />
                  </div>
                </div>
              </div>

              {/* PERMISSIONS GRID */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTools.map((tool) => {
                  const isAllowed = tool.is_enabled !== false;
                  return (
                    <div 
                      key={tool.id} 
                      className={`p-5 rounded-3xl border transition-all space-y-4 ${
                        isAllowed 
                          ? "bg-white border-slate-200 hover:border-indigo-300 shadow-xs" 
                          : "bg-rose-50/40 border-rose-200"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <span className={`inline-block text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${
                            tool.role === "teacher" ? "bg-indigo-100 text-indigo-700" :
                            tool.role === "student" ? "bg-purple-100 text-purple-700" :
                            tool.role === "parent" ? "bg-rose-100 text-rose-700" : "bg-slate-100 text-slate-700"
                          }`}>
                            {tool.role} • {tool.category}
                          </span>
                          <h4 className="text-sm font-black text-slate-900">{tool.name}</h4>
                          <p className="text-[11px] font-mono text-slate-400 truncate max-w-[200px]">{tool.path}</p>
                        </div>

                        {/* TOGGLE SWITCH */}
                        <button
                          type="button"
                          onClick={() => toggleFeatureAllowed(tool.id)}
                          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            isAllowed ? "bg-emerald-600" : "bg-slate-300"
                          }`}
                          aria-label={`Toggle access for ${tool.name}`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                              isAllowed ? "translate-x-5" : "translate-x-0"
                            }`}
                          />
                        </button>
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed font-medium line-clamp-2">
                        {tool.description}
                      </p>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                        <span className="text-[10px] font-bold uppercase text-slate-400">Visibility Status:</span>
                        {isAllowed ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-emerald-700">
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Allowed (Visible)</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-rose-700">
                            <X className="w-3.5 h-3.5 text-rose-600" />
                            <span>Disabled (Hidden)</span>
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 4: PAPER STUDIO (TSO 100-MCQ AI + MANUAL BUILDER + REPOSITORY)        */}
          {/* ========================================================================= */}
          {adminTab === "paper_studio" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              {/* SUB-TABS */}
              <div className="bg-white p-3 rounded-2xl border border-slate-200 flex items-center gap-2 overflow-x-auto shadow-2xs">
                <button
                  onClick={() => setPaperStudioSubTab("tso_100_ai")}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer shrink-0 ${
                    paperStudioSubTab === "tso_100_ai"
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  TSO 100-MCQ AI Generator (60/40 Hybrid)
                </button>

                <button
                  onClick={() => setPaperStudioSubTab("manual_builder")}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer shrink-0 ${
                    paperStudioSubTab === "manual_builder"
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  Manual Paper Builder
                </button>

                <button
                  onClick={() => setPaperStudioSubTab("repository")}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer shrink-0 ${
                    paperStudioSubTab === "repository"
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  Paper Repository ({papersList.length})
                </button>
              </div>

              {/* SUB-TAB 1: TSO 100-MCQ AI GENERATOR */}
              {paperStudioSubTab === "tso_100_ai" && (
                <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                  <div>
                    <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-indigo-600" />
                      <span>Synthesize 100-MCQ Teacher Skills Olympiad Paper</span>
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      Adheres to official 60/40 Hybrid Structure: Part A (60 MCQs: CPD/NEP, Scenarios, Pedagogy) + Part B (40 MCQs: Core Subject, Pedagogy, HOTS)
                    </p>
                  </div>

                  <form onSubmit={handleGenerateTso100AI} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700">Subject</label>
                        <select
                          value={tsoSubject}
                          onChange={(e) => {
                            setTsoSubject(e.target.value);
                            setTsoTitle(`National Teacher Skills Olympiad 2026 — ${e.target.value.toUpperCase()}`);
                          }}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800"
                        >
                          <option value="Science">Science (Physics, Chemistry, Biology)</option>
                          <option value="Mathematics">Mathematics</option>
                          <option value="Social Science">Social Science (History, Geo, Civics)</option>
                          <option value="English">English Language & Literature</option>
                          <option value="Hindi">Hindi Language & Pedagogy</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700">Class Level</label>
                        <select
                          value={tsoClass}
                          onChange={(e) => setTsoClass(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800"
                        >
                          <option value="Secondary (Classes 9–10)">Secondary (Classes 9–10)</option>
                          <option value="Senior Secondary (Classes 11–12)">Senior Secondary (Classes 11–12)</option>
                          <option value="Middle School (Classes 6–8)">Middle School (Classes 6–8)</option>
                          <option value="Primary (Classes 1–5)">Primary (Classes 1–5)</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700">Difficulty Scale</label>
                        <select
                          value={tsoDifficulty}
                          onChange={(e) => setTsoDifficulty(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800"
                        >
                          <option value="medium">Standard National Level (Medium)</option>
                          <option value="hard">Advanced HOTS & Leadership (Hard)</option>
                          <option value="easy">Foundational NEP Assessment (Easy)</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Exam Title</label>
                      <input
                        type="text"
                        value={tsoTitle}
                        onChange={(e) => setTsoTitle(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700">Scheduled Start Time</label>
                        <input
                          type="datetime-local"
                          value={tsoStartTime}
                          onChange={(e) => setTsoStartTime(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700">Scheduled End Time</label>
                        <input
                          type="datetime-local"
                          value={tsoEndTime}
                          onChange={(e) => setTsoEndTime(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={generatingTso100}
                      className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-extrabold text-xs rounded-2xl shadow-md flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
                    >
                      {generatingTso100 ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                      <span>{generatingTso100 ? "Synthesizing 100 Hybrid MCQs..." : "Generate 100-MCQ TSO Paper with AI"}</span>
                    </button>
                  </form>

                  {/* DRAFT PREVIEW & QUESTION EDITOR */}
                  {tsoDraftPaper && (
                    <div className="p-6 bg-slate-50 rounded-3xl border border-indigo-200 space-y-4 animate-in fade-in">
                      <div className="flex items-center justify-between border-b border-indigo-100 pb-3">
                        <div>
                          <h4 className="text-sm font-black text-slate-900">{tsoDraftPaper.title}</h4>
                          <p className="text-xs text-slate-600 font-semibold">{tsoDraftPaper.questions?.length || 100} Questions • 100 Marks • 120 Mins</p>
                        </div>
                        <button
                          onClick={handlePublishTsoPaper}
                          disabled={activatingTsoPaper}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-md cursor-pointer"
                        >
                          {activatingTsoPaper ? "Activating..." : "Activate for Live Exam Hall"}
                        </button>
                      </div>

                      <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                        {(tsoDraftPaper.questions || []).map((q: any, idx: number) => (
                          <div key={idx} className="p-3 bg-white rounded-xl border border-slate-200 text-xs space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="font-extrabold text-slate-900">Q{idx + 1}. {q.question_text}</span>
                              <button
                                onClick={() => handleOpenEditQuestion(q)}
                                className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-bold"
                              >
                                Edit
                              </button>
                            </div>
                            <div className="grid grid-cols-2 gap-1 text-[11px] text-slate-600">
                              {(q.options || []).map((opt: string, oIdx: number) => (
                                <div key={oIdx} className={oIdx === q.correct_answer ? "font-bold text-emerald-700" : ""}>
                                  {opt}
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* SUB-TAB 2: MANUAL PAPER BUILDER */}
              {paperStudioSubTab === "manual_builder" && (
                <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                  <div>
                    <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-indigo-600" />
                      <span>Manual Question Paper Builder</span>
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">Add custom questions, options, and model answers</p>
                  </div>

                  <form onSubmit={handleSaveManualPaper} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700">Paper Title</label>
                        <input
                          type="text"
                          required
                          value={manualTitle}
                          onChange={(e) => setManualTitle(e.target.value)}
                          placeholder="Class 10 Science Midterm Paper"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700">Subject</label>
                        <input
                          type="text"
                          required
                          value={manualSubject}
                          onChange={(e) => setManualSubject(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700">Class Name</label>
                        <input
                          type="text"
                          required
                          value={manualClass}
                          onChange={(e) => setManualClass(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
                        />
                      </div>
                    </div>

                    <div className="space-y-3 pt-2">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                        <h4 className="text-xs font-black uppercase text-slate-700">Questions ({manualQuestions.length})</h4>
                        <button
                          type="button"
                          onClick={() => handleAddManualQuestions(1)}
                          className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Question</span>
                        </button>
                      </div>

                      <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                        {manualQuestions.map((q, idx) => (
                          <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-black text-slate-900">Question #{idx + 1}</span>
                              {manualQuestions.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => setManualQuestions(manualQuestions.filter((_, i) => i !== idx))}
                                  className="text-rose-600 hover:text-rose-800 text-xs font-bold"
                                >
                                  Remove
                                </button>
                              )}
                            </div>

                            <input
                              type="text"
                              required
                              value={q.question_text}
                              onChange={(e) => {
                                const newQs = [...manualQuestions];
                                newQs[idx].question_text = e.target.value;
                                setManualQuestions(newQs);
                              }}
                              placeholder="Enter question text..."
                              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
                            />

                            <div className="grid grid-cols-2 gap-2">
                              {q.options.map((opt: string, oIdx: number) => (
                                <div key={oIdx} className="flex items-center gap-2">
                                  <input
                                    type="radio"
                                    name={`correct_${idx}`}
                                    checked={q.correct_answer === oIdx}
                                    onChange={() => {
                                      const newQs = [...manualQuestions];
                                      newQs[idx].correct_answer = oIdx;
                                      setManualQuestions(newQs);
                                    }}
                                    className="cursor-pointer"
                                  />
                                  <input
                                    type="text"
                                    required
                                    value={opt}
                                    onChange={(e) => {
                                      const newQs = [...manualQuestions];
                                      newQs[idx].options[oIdx] = e.target.value;
                                      setManualQuestions(newQs);
                                    }}
                                    placeholder={`Option ${String.fromCharCode(65 + oIdx)}`}
                                    className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs"
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={savingManualPaper}
                      className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs rounded-xl shadow-md cursor-pointer"
                    >
                      {savingManualPaper ? "Saving Paper..." : "Construct & Save Paper"}
                    </button>
                  </form>
                </div>
              )}

              {/* SUB-TAB 3: PAPER REPOSITORY */}
              {paperStudioSubTab === "repository" && (
                <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                      <h3 className="text-base font-black text-slate-900">Question Paper Repository</h3>
                      <p className="text-xs text-slate-500 font-medium">All generated & uploaded assessment papers</p>
                    </div>
                  </div>

                  <div className="divide-y divide-slate-100">
                    {papersList.map((paper) => {
                      const schedStatus = getPaperScheduleStatus(paper);
                      return (
                        <div key={paper.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-black text-slate-900">{paper.title}</h4>
                              <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold border ${schedStatus.color}`}>
                                {schedStatus.label}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 font-medium">
                              {paper.class_name} • {paper.subject} • {paper.board} • {paper.total_marks || 20} Marks
                            </p>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => openScheduleModal(paper)}
                              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
                            >
                              Schedule
                            </button>

                            <button
                              onClick={() => setPreviewPaper(paper)}
                              className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold cursor-pointer"
                            >
                              Preview
                            </button>

                            <button
                              onClick={() => handleDeletePaper(paper.id)}
                              className="p-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 5: OLYMPIAD BOARD (RESULTS & CHEATING WARNINGS AUDIT)                 */}
          {/* ========================================================================= */}
          {adminTab === "olympiad" && (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6 font-sans animate-in fade-in duration-200">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-amber-500" />
                    <span>National Educator Skills Olympiad Evaluation Board</span>
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Review teacher answer submissions, cheating warnings audits, declare percentages, and publish live results
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleBulkPublishSubmissions()}
                    disabled={bulkPublishing}
                    className="px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 font-black text-xs rounded-xl shadow-md flex items-center gap-2 cursor-pointer"
                  >
                    <Rocket className="w-4 h-4" />
                    <span>{bulkPublishing ? "Publishing..." : "1-Click Publish All Results"}</span>
                  </button>
                </div>
              </div>

              {/* SUBMISSIONS TABLE */}
              <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                <table className="w-full text-left text-xs text-slate-800">
                  <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider font-extrabold border-b border-slate-200">
                    <tr>
                      <th className="p-3.5">Candidate / Educator</th>
                      <th className="p-3.5">Paper & Subject</th>
                      <th className="p-3.5">Score Percentage</th>
                      <th className="p-3.5">Cheating Warnings Audit</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {submissions.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-slate-400 font-semibold">
                          No assessment submissions received yet.
                        </td>
                      </tr>
                    ) : (
                      submissions.map((sub) => (
                        <tr key={sub.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-3.5 font-bold text-slate-900">
                            <div>
                              <div className="font-extrabold">{sub.candidate_name || "Educator Candidate"}</div>
                              <div className="text-[11px] font-mono text-slate-500">{sub.candidate_email}</div>
                            </div>
                          </td>

                          <td className="p-3.5">
                            <div className="font-bold text-slate-800">{sub.paper_title || "National TSO 2026"}</div>
                            <div className="text-[10px] text-slate-500">{sub.subject || "General"}</div>
                          </td>

                          <td className="p-3.5 font-black text-indigo-700 text-sm">
                            {typeof sub.score_percentage === "number" ? `${sub.score_percentage}%` : "Pending"}
                          </td>

                          {/* CHEATING WARNINGS BADGE */}
                          <td className="p-3.5">
                            {renderCheatingBadge(sub)}
                          </td>

                          <td className="p-3.5">
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${
                              sub.published ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"
                            }`}>
                              {sub.published ? "Published" : "Draft"}
                            </span>
                          </td>

                          <td className="p-3.5 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => {
                                  setSelectedSub(sub);
                                  setEditScore(sub.score_percentage || 0);
                                  setEditFeedback(sub.official_feedback || "");
                                  setPublishing(sub.published || false);
                                }}
                                className="px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-bold cursor-pointer"
                              >
                                Evaluate
                              </button>

                              <button
                                onClick={() => handleDeleteSubmission(sub.id)}
                                className="p-1 rounded-lg hover:bg-rose-50 text-rose-600 cursor-pointer"
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

          {/* ========================================================================= */}
          {/* TAB 6: SCHOOL VERIFICATION                                                */}
          {/* ========================================================================= */}
          {adminTab === "schools" && (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6 font-sans animate-in fade-in duration-200">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-emerald-600" />
                    <span>School Registration & Verification Board</span>
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Review and verify partner schools to unlock their recruitment dashboards
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={schoolFilter}
                    onChange={(e) => setSchoolFilter(e.target.value as any)}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800"
                  >
                    <option value="all">All Schools ({schoolsList.length})</option>
                    <option value="pending_verification">Pending Verification</option>
                    <option value="verified">Verified Only</option>
                    <option value="rejected">Rejected Only</option>
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                <table className="w-full text-left text-xs text-slate-800">
                  <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider font-extrabold border-b border-slate-200">
                    <tr>
                      <th className="p-3.5">School Name</th>
                      <th className="p-3.5">Board & City</th>
                      <th className="p-3.5">Contact Details</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {schoolsList
                      .filter(s => schoolFilter === "all" || s.verification_status === schoolFilter)
                      .map((school) => (
                        <tr key={school.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-3.5 font-bold text-slate-900">
                            <div>
                              <div className="font-extrabold">{school.school_name}</div>
                              <div className="text-[11px] font-mono text-slate-500">{school.principal_name || "Principal"}</div>
                            </div>
                          </td>

                          <td className="p-3.5">
                            <div className="font-bold text-slate-800">{school.affiliation_board || "CBSE"}</div>
                            <div className="text-[10px] text-slate-500">{school.city}, {school.state}</div>
                          </td>

                          <td className="p-3.5">
                            <div className="font-mono text-[11px] text-slate-700">{school.email}</div>
                            <div className="text-[10px] text-slate-500 font-bold">{school.phone || "N/A"}</div>
                          </td>

                          <td className="p-3.5">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                              school.verification_status === "verified" ? "bg-emerald-100 text-emerald-800" :
                              school.verification_status === "rejected" ? "bg-rose-100 text-rose-800" : "bg-amber-100 text-amber-800"
                            }`}>
                              {school.verification_status || "Pending"}
                            </span>
                          </td>

                          <td className="p-3.5 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => setSelectedSchoolDetail(school)}
                                className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold cursor-pointer"
                              >
                                Details
                              </button>

                              {school.verification_status !== "verified" ? (
                                <button
                                  onClick={() => handleVerifySchool(school.id)}
                                  disabled={verifyingSchoolId === school.id}
                                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold cursor-pointer"
                                >
                                  Approve
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleRejectSchool(school.id)}
                                  disabled={verifyingSchoolId === school.id}
                                  className="px-3 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-bold cursor-pointer"
                                >
                                  Suspend
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 7: SECURITY & SINGLE-DEVICE SESSION MANAGEMENT                        */}
          {/* ========================================================================= */}
          {adminTab === "security" && (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6 font-sans animate-in fade-in duration-200">
              
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <Lock className="w-5 h-5 text-indigo-600" />
                  <span>Super Admin Security & Session Enforcement</span>
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Active single-device session lock prevents concurrent logins from unauthorized devices
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <span className="text-[10px] font-black uppercase text-indigo-600">Enforcement Policy</span>
                  <h4 className="text-sm font-black text-slate-900">Single-Device Active Lock</h4>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">
                    When an administrator logs in from any new device or browser, all previous active admin sessions on any other device are instantly invalidated.
                  </p>
                </div>

                <div className="p-5 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-2">
                  <span className="text-[10px] font-black uppercase text-emerald-700">Heartbeat Status</span>
                  <h4 className="text-sm font-black text-emerald-950 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    <span>Active Verified Session</span>
                  </h4>
                  <p className="text-xs text-emerald-800 leading-relaxed font-medium">
                    Continuous 5-second polling actively verifies session validity with backend memory.
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-800">Need to revoke session immediately?</p>
                  <p className="text-[11px] text-slate-500 font-medium">Clicking logout invalidates the token across all systems.</p>
                </div>
                <button
                  onClick={handleAdminLogout}
                  className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs rounded-xl shadow-md cursor-pointer"
                >
                  End Active Session & Sign Out
                </button>
              </div>

            </div>
          )}

        </div>
      </main>

      {/* ========================================================================= */}
      {/* MODAL 1: USER ACTIVITY TIMELINE MODAL                                     */}
      {/* ========================================================================= */}
      {activityModalUser && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 max-w-xl w-full shadow-2xl space-y-5 animate-in zoom-in-95 duration-200 max-h-[85vh] flex flex-col">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black shrink-0">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    {activityModalUser.full_name || "User"} Activity Timeline
                  </h3>
                  <p className="text-xs font-mono text-slate-500">{activityModalUser.email}</p>
                </div>
              </div>
              <button
                onClick={() => setActivityModalUser(null)}
                className="p-1.5 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Quick summary cards */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] font-black uppercase text-slate-400 block">Today's Status</span>
                <span className="font-extrabold text-slate-900">
                  {activityModalUser.is_active_today ? "Active Online Today" : "Not Active Today"}
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] font-black uppercase text-slate-400 block">Features Visited Today</span>
                <span className="font-extrabold text-indigo-600">
                  {activityModalUser.features_used_today?.length || 0} features
                </span>
              </div>
            </div>

            {/* Timeline Stream */}
            <div className="space-y-2 flex-1 overflow-y-auto pr-1">
              <p className="text-[10px] uppercase font-black tracking-wider text-slate-400">Chronological Event Log</p>
              
              {loadingTimeline ? (
                <div className="py-8 text-center text-slate-400 font-bold text-xs flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Loading user activity events...</span>
                </div>
              ) : userTimeline.length === 0 ? (
                <div className="py-8 text-center text-slate-400 font-semibold text-xs">
                  No recorded events found for this account.
                </div>
              ) : (
                userTimeline.map((item, idx) => {
                  const evDate = item.timestamp ? new Date(item.timestamp).toLocaleString([], { dateStyle: "short", timeStyle: "short" }) : "Recently";
                  return (
                    <div key={idx} className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-indigo-700">{item.feature_name || item.path}</span>
                        <span className="text-[10px] font-mono text-slate-400">{evDate}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono truncate">
                        Path: {item.path} • Action: {item.action || "view"}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setActivityModalUser(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: USER PROFILE DETAIL MODAL                                        */}
      {/* ========================================================================= */}
      {selectedUserDetail && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">User Profile Details</h3>
                  <p className="text-xs text-slate-500 font-mono">{selectedUserDetail.email}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedUserDetail(null)}
                className="p-1.5 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Full Name</span>
                  <span className="font-black text-slate-900">{selectedUserDetail.full_name || "Registered User"}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Role</span>
                  <span className="font-black text-slate-900 uppercase">{selectedUserDetail.role}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">School</span>
                  <span className="font-bold text-slate-800 truncate block">{selectedUserDetail.school_name || selectedUserDetail.child_school || "DEVGYA"}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Board & Class</span>
                  <span className="font-bold text-slate-800">{selectedUserDetail.board || "CBSE"} {selectedUserDetail.classes ? `(${selectedUserDetail.classes})` : ""}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => handleDeleteUser(selectedUserDetail.id, selectedUserDetail.email)}
                className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Account</span>
              </button>
              <button
                onClick={() => setSelectedUserDetail(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: SCHOOL DETAIL MODAL                                              */}
      {/* ========================================================================= */}
      {selectedSchoolDetail && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">{selectedSchoolDetail.school_name}</h3>
                  <p className="text-xs text-slate-500 font-mono">ID: {selectedSchoolDetail.id}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedSchoolDetail(null)}
                className="p-1.5 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Affiliation Board</span>
                  <span className="font-black text-slate-900">{selectedSchoolDetail.affiliation_board || "CBSE"}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Status</span>
                  <span className="font-black text-slate-900 uppercase">{selectedSchoolDetail.verification_status || "Pending"}</span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Location & Address</span>
                <p className="font-bold text-slate-800">{selectedSchoolDetail.city}, {selectedSchoolDetail.state}</p>
                {selectedSchoolDetail.address && <p className="text-slate-500">{selectedSchoolDetail.address}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Official Email</span>
                  <span className="font-bold text-slate-800 truncate block">{selectedSchoolDetail.email}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Phone</span>
                  <span className="font-bold text-slate-800">{selectedSchoolDetail.phone || "N/A"}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setSelectedSchoolDetail(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
              >
                Close
              </button>
              {selectedSchoolDetail.verification_status !== "verified" ? (
                <button
                  onClick={() => {
                    handleVerifySchool(selectedSchoolDetail.id);
                    setSelectedSchoolDetail(null);
                  }}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Approve School</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    handleRejectSchool(selectedSchoolDetail.id);
                    setSelectedSchoolDetail(null);
                  }}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs rounded-xl shadow-md"
                >
                  Suspend School
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: OLYMPIAD EVALUATION MODAL                                        */}
      {/* ========================================================================= */}
      {selectedSub && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900">Evaluate Olympiad Submission</h3>
                <p className="text-xs text-slate-500 font-medium">{selectedSub.candidate_name} ({selectedSub.candidate_email})</p>
              </div>
              <button
                onClick={() => setSelectedSub(null)}
                className="p-1.5 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Cheating Audit Display */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
              <span className="text-[10px] font-black uppercase text-slate-400 block">Proctoring & Cheating Warnings</span>
              {renderCheatingBadge(selectedSub)}
              {selectedSub.proctoring_audit?.events && selectedSub.proctoring_audit.events.length > 0 && (
                <div className="pt-1 text-[11px] text-slate-600 font-medium max-h-24 overflow-y-auto space-y-0.5">
                  {selectedSub.proctoring_audit.events.map((ev: any, evIdx: number) => (
                    <p key={evIdx}>• {ev.reason || "Warning event recorded"} ({ev.time || ""})</p>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Score Percentage (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={editScore}
                  onChange={(e) => setEditScore(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Official Evaluation Feedback</label>
                <textarea
                  value={editFeedback}
                  onChange={(e) => setEditFeedback(e.target.value)}
                  placeholder="Commendable pedagogical approach with strong NEP 2020 alignment..."
                  rows={3}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-medium text-slate-800"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="pubToggle"
                  checked={publishing}
                  onChange={(e) => setPublishing(e.target.checked)}
                  className="rounded cursor-pointer"
                />
                <label htmlFor="pubToggle" className="text-xs font-bold text-slate-800 cursor-pointer">
                  Publish to Public Leaderboard & Activate Certificate
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setSelectedSub(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveSubmissionEvaluation}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs rounded-xl shadow-md cursor-pointer"
              >
                Save Evaluation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: SCHEDULE & TIMING EDITOR MODAL                                   */}
      {/* ========================================================================= */}
      {scheduleModalPaper && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900">Edit Paper Schedule & Activation</h3>
                <p className="text-xs text-slate-500 font-medium">Configure examination window for students or teachers</p>
              </div>
              <button
                onClick={() => setScheduleModalPaper(null)}
                className="p-1.5 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSavePaperSchedule} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Exam Title</label>
                <input
                  type="text"
                  value={schedTitle}
                  onChange={(e) => setSchedTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Start Time</label>
                <input
                  type="datetime-local"
                  required
                  value={schedStartTime}
                  onChange={(e) => setSchedStartTime(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">End Time</label>
                <input
                  type="datetime-local"
                  required
                  value={schedEndTime}
                  onChange={(e) => setSchedEndTime(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="schedPub"
                  checked={schedPublished}
                  onChange={(e) => setSchedPublished(e.target.checked)}
                  className="rounded cursor-pointer"
                />
                <label htmlFor="schedPub" className="text-xs font-bold text-slate-800 cursor-pointer">
                  Published & Active for Students
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setScheduleModalPaper(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingSchedule}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs rounded-xl shadow-md cursor-pointer"
                >
                  {savingSchedule ? "Saving..." : "Save Schedule"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 6: PAPER PREVIEW MODAL                                              */}
      {/* ========================================================================= */}
      {previewPaper && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 max-w-2xl w-full shadow-2xl space-y-4 animate-in zoom-in-95 duration-200 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900">{previewPaper.title}</h3>
                <p className="text-xs text-slate-500 font-medium">
                  {previewPaper.class_name} • {previewPaper.subject} • {previewPaper.questions?.length || 0} Questions
                </p>
              </div>
              <button
                onClick={() => setPreviewPaper(null)}
                className="p-1.5 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto pr-1">
              {(previewPaper.questions || []).map((q: any, idx: number) => (
                <div key={idx} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1.5">
                  <div className="font-extrabold text-slate-900">Q{idx + 1}. {q.question_text}</div>
                  <div className="grid grid-cols-2 gap-1.5 text-[11px] text-slate-600">
                    {(q.options || []).map((opt: string, oIdx: number) => (
                      <div key={oIdx} className={oIdx === q.correct_answer ? "font-black text-emerald-700 bg-emerald-50 p-1 rounded" : "p-1"}>
                        {opt}
                      </div>
                    ))}
                  </div>
                  {q.explanation && (
                    <p className="text-[10px] text-slate-500 font-medium pt-1 border-t border-slate-100">
                      <strong>Explanation:</strong> {q.explanation}
                    </p>
                  )}
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setPreviewPaper(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 7: EDIT TSO QUESTION MODAL                                          */}
      {/* ========================================================================= */}
      {editQuestionModalOpen && editingQuestion && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900">Edit Question #{editingQuestion.id || editingQuestion.question_number}</h3>
                <p className="text-xs text-slate-500 font-medium">Modify question text, options, and correct answer index</p>
              </div>
              <button
                onClick={() => setEditQuestionModalOpen(false)}
                className="p-1.5 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Question Text</label>
                <textarea
                  rows={2}
                  value={editingQuestion.question_text}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, question_text: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-800"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700">Options & Correct Answer</label>
                {(editingQuestion.options || []).map((opt: string, oIdx: number) => (
                  <div key={oIdx} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="correct_q_edit"
                      checked={editingQuestion.correct_answer === oIdx}
                      onChange={() => setEditingQuestion({ ...editingQuestion, correct_answer: oIdx })}
                      className="cursor-pointer"
                    />
                    <input
                      type="text"
                      value={opt}
                      onChange={(e) => {
                        const newOpts = [...editingQuestion.options];
                        newOpts[oIdx] = e.target.value;
                        setEditingQuestion({ ...editingQuestion, options: newOpts });
                      }}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs"
                    />
                  </div>
                ))}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Explanation</label>
                <textarea
                  rows={2}
                  value={editingQuestion.explanation || ""}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, explanation: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-medium text-slate-800"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setEditQuestionModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEditedQuestion}
                disabled={savingQuestionEdit}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs rounded-xl shadow-md cursor-pointer"
              >
                {savingQuestionEdit ? "Saving..." : "Save Question"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
