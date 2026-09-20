"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { 
  User, 
  Plus, 
  Award, 
  FileText, 
  CheckCircle2, 
  XCircle, 
  Copy, 
  Check, 
  Trash2, 
  RefreshCw, 
  X, 
  GraduationCap, 
  ChevronRight, 
  ArrowLeft, 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  AlertCircle,
  HelpCircle,
  BookOpen,
  Calendar
} from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { getApiBase } from "@/lib/api";
import Markdown from "@/components/chat/Markdown";

interface ChildAccount {
  id: string;
  username: string;
  name: string;
  full_name?: string;
  class_name: string;
  school_name?: string;
  board?: string;
  created_at?: string;
}

interface QuizAttempt {
  id: string;
  quiz_title: string;
  subject: string;
  chapter?: string;
  score: number;
  total: number;
  percentage: number;
  xp_earned?: number;
  feedback?: string;
  breakdown?: Array<{
    question: string;
    user_answer: string;
    correct_answer: string;
    is_correct: boolean;
    explanation?: string;
  }>;
  timestamp: string;
}

interface StudentNote {
  id: string;
  title: string;
  subject: string;
  tags: string[];
  content: string;
  updated_at: string;
}

const CLASS_OPTIONS = [
  "Class 1", "Class 2", "Class 3", "Class 4", "Class 5",
  "Class 6", "Class 7", "Class 8", "Class 9", "Class 10",
  "Class 11", "Class 12"
];

export default function ParentChildrenPage() {
  const { user } = useAppStore();
  const parentEmail = user?.email || "";

  // Data states
  const [children, setChildren] = useState<ChildAccount[]>([]);
  const [selectedChildUsername, setSelectedChildUsername] = useState<string | null>(null);
  const [loadingChildren, setLoadingChildren] = useState(true);

  // Activity states
  const [activeTab, setActiveTab] = useState<"quizzes" | "notes">("quizzes");
  const [quizzes, setQuizzes] = useState<QuizAttempt[]>([]);
  const [notes, setNotes] = useState<StudentNote[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(false);

  // Modals & UI states
  const [isAddChildOpen, setIsAddChildOpen] = useState(false);
  const [selectedQuizDetail, setSelectedQuizDetail] = useState<QuizAttempt | null>(null);
  const [selectedNoteDetail, setSelectedNoteDetail] = useState<StudentNote | null>(null);
  const [copiedUsername, setCopiedUsername] = useState(false);

  // Add Child Form
  const [newChildName, setNewChildName] = useState("");
  const [newChildUsername, setNewChildUsername] = useState("");
  const [newChildPassword, setNewChildPassword] = useState("");
  const [newChildClass, setNewChildClass] = useState("Class 10");
  const [newChildSchool, setNewChildSchool] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [successCredentialCard, setSuccessCredentialCard] = useState<{ username: string; password: string; name: string } | null>(null);

  // Fetch children list
  const fetchChildren = useCallback(async () => {
    if (!parentEmail) return;
    setLoadingChildren(true);
    try {
      const apiBase = getApiBase();
      const res = await fetch(`${apiBase}/parent/children?parent_email=${encodeURIComponent(parentEmail)}`);
      const data = await res.json();
      if (data && data.status === "success" && Array.isArray(data.children)) {
        setChildren(data.children);
        if (data.children.length > 0) {
          setSelectedChildUsername((prev) => {
            if (prev && data.children.some((c: ChildAccount) => c.username === prev)) {
              return prev;
            }
            return data.children[0].username;
          });
        } else {
          setSelectedChildUsername(null);
        }
      }
    } catch (err) {
      console.warn("Failed to fetch children list:", err);
    } finally {
      setLoadingChildren(false);
    }
  }, [parentEmail]);

  useEffect(() => {
    fetchChildren();
  }, [fetchChildren]);

  // Fetch activities of the selected child
  const fetchActivities = useCallback(async () => {
    if (!selectedChildUsername) {
      setQuizzes([]);
      setNotes([]);
      return;
    }
    setLoadingActivities(true);
    const apiBase = getApiBase();
    try {
      const [quizRes, noteRes] = await Promise.all([
        fetch(`${apiBase}/parent/children/${encodeURIComponent(selectedChildUsername)}/quizzes`),
        fetch(`${apiBase}/parent/children/${encodeURIComponent(selectedChildUsername)}/notes`)
      ]);
      const quizData = await quizRes.json();
      const noteData = await noteRes.json();

      if (quizData && quizData.status === "success") {
        setQuizzes(quizData.quizzes || []);
      }
      if (noteData && noteData.status === "success") {
        setNotes(noteData.notes || []);
      }
    } catch (err) {
      console.warn("Failed to load child activities:", err);
    } finally {
      setLoadingActivities(false);
    }
  }, [selectedChildUsername]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  const handleAddChild = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSubmitting(true);

    const cleanUsername = newChildUsername.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "");
    if (cleanUsername.length < 3) {
      setFormError("Student username must be at least 3 characters.");
      setFormSubmitting(false);
      return;
    }

    if (newChildPassword.length < 6) {
      setFormError("Password must be at least 6 characters.");
      setFormSubmitting(false);
      return;
    }

    try {
      const apiBase = getApiBase();
      const res = await fetch(`${apiBase}/parent/children?parent_email=${encodeURIComponent(parentEmail)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newChildName.trim(),
          username: cleanUsername,
          password: newChildPassword,
          class_name: newChildClass,
          school_name: newChildSchool.trim(),
          board: "CBSE"
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setFormError(data.detail || data.message || "Failed to create child account.");
        setFormSubmitting(false);
        return;
      }

      // Success
      setSuccessCredentialCard({
        username: cleanUsername,
        password: newChildPassword,
        name: newChildName.trim()
      });
      fetchChildren();
      setSelectedChildUsername(cleanUsername);
      setNewChildName("");
      setNewChildUsername("");
      setNewChildPassword("");
      setNewChildSchool("");
    } catch (err: any) {
      setFormError(err?.message || "An unexpected error occurred.");
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDeleteChild = async (username: string) => {
    if (!window.confirm(`Are you sure you want to remove ${username}'s account? This action cannot be undone.`)) {
      return;
    }
    try {
      const apiBase = getApiBase();
      await fetch(`${apiBase}/parent/children/${encodeURIComponent(username)}?parent_email=${encodeURIComponent(parentEmail)}`, {
        method: "DELETE"
      });
      fetchChildren();
    } catch (err) {
      console.warn("Delete error:", err);
    }
  };

  const copyUsername = (uname: string) => {
    navigator.clipboard.writeText(uname);
    setCopiedUsername(true);
    setTimeout(() => setCopiedUsername(false), 2000);
  };

  const selectedChild = children.find(c => c.username === selectedChildUsername) || null;

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-24 px-3 sm:px-6 pt-4 animate-in fade-in duration-300">
      
      {/* 1. TOP APP BAR & PAGE TITLE */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <Link
            href="/dashboard/parent"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors mb-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Parent Dashboard</span>
          </Link>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Child Management
            </h1>
            <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
              {children.length} {children.length === 1 ? "Child" : "Children"}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage student logins, monitor practice quiz scores, and view study notes in real-time.
          </p>
        </div>

        <button
          onClick={() => {
            setSuccessCredentialCard(null);
            setFormError(null);
            setIsAddChildOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-2xl shadow-md active:scale-95 transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Child Account</span>
        </button>
      </div>

      {/* 2. CHILD SELECTOR STRIP (EASY HORIZONTAL TABS ON MOBILE) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
            Select Child to View
          </span>
          {selectedChild && (
            <button
              onClick={fetchActivities}
              className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              <RefreshCw className={`w-3 h-3 ${loadingActivities ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          )}
        </div>

        {loadingChildren ? (
          <div className="p-6 bg-white rounded-2xl border border-slate-200 text-center text-xs text-slate-400 font-bold flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-indigo-600" />
            <span>Loading enrolled children...</span>
          </div>
        ) : children.length === 0 ? (
          <div className="p-8 bg-white rounded-3xl border border-dashed border-indigo-200 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 mx-auto flex items-center justify-center">
              <User className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">No Child Accounts Enrolled Yet</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                Students do not need an email! Create your child's username and password below so they can start practicing.
              </p>
            </div>
            <button
              onClick={() => setIsAddChildOpen(true)}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold rounded-xl shadow-sm transition"
            >
              + Create First Child Account
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2.5 overflow-x-auto pb-1.5 scrollbar-none">
            {children.map((child) => {
              const isSelected = child.username === selectedChildUsername;
              return (
                <button
                  key={child.username}
                  onClick={() => setSelectedChildUsername(child.username)}
                  className={`flex items-center gap-3 p-3 px-4 rounded-2xl border transition-all text-left shrink-0 cursor-pointer min-w-[200px] ${
                    isSelected
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-md ring-2 ring-indigo-600/20"
                      : "bg-white hover:bg-slate-50 border-slate-200 text-slate-700"
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black shrink-0 ${
                    isSelected ? "bg-white/20 text-white" : "bg-indigo-50 text-indigo-600 border border-indigo-100"
                  }`}>
                    {child.name?.slice(0, 1).toUpperCase()}
                  </div>
                  <div className="overflow-hidden">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-black truncate">{child.name}</span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                        isSelected ? "bg-white/20 text-indigo-100" : "bg-slate-100 text-slate-600"
                      }`}>
                        {child.class_name}
                      </span>
                      <span className={`text-[10px] truncate font-mono ${
                        isSelected ? "text-indigo-200" : "text-slate-400"
                      }`}>
                        @{child.username}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. SELECTED CHILD DETAILS & LOGIN CREDENTIALS CARD */}
      {selectedChild && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-4 sm:p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-800 text-white flex items-center justify-center text-xl font-black shadow-sm shrink-0">
                {selectedChild.name?.slice(0, 1).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-black text-slate-900">{selectedChild.name}</h2>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                    {selectedChild.class_name}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {selectedChild.school_name ? `🏫 ${selectedChild.school_name}` : "CBSE Curriculum"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center">
              <button
                onClick={() => handleDeleteChild(selectedChild.username)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-xs font-bold transition"
                title="Remove Child Account"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove</span>
              </button>
            </div>
          </div>

          {/* QUICK STUDENT LOGIN INFO CALLOUT */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-bold text-slate-700">Student Login Username:</span>
              <span className="font-black font-mono text-indigo-700 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                {selectedChild.username}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => copyUsername(selectedChild.username)}
                className="inline-flex items-center gap-1 px-3 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-700 font-bold text-[11px] transition shadow-2xs"
              >
                {copiedUsername ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copiedUsername ? "Copied!" : "Copy Username"}</span>
              </button>
              <span className="text-[11px] text-slate-400 font-medium hidden md:inline">
                Login at /login using Username &amp; Password
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 4. ACTIVITY TABS: QUIZZES & SMART NOTES */}
      {selectedChild && (
        <div className="space-y-4">
          
          {/* TAB BUTTONS */}
          <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-200/70 rounded-2xl">
            <button
              onClick={() => setActiveTab("quizzes")}
              className={`py-3 text-xs font-extrabold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === "quizzes"
                  ? "bg-white text-indigo-600 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Award className="w-4 h-4" />
              <span>Practice Quizzes ({quizzes.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("notes")}
              className={`py-3 text-xs font-extrabold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === "notes"
                  ? "bg-white text-indigo-600 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Smart Notes ({notes.length})</span>
            </button>
          </div>

          {/* TAB 1: QUIZZES */}
          {activeTab === "quizzes" && (
            <div className="space-y-3">
              {loadingActivities ? (
                <div className="py-12 bg-white rounded-3xl border border-slate-200 text-center text-xs text-slate-400 font-bold flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-indigo-600" />
                  <span>Loading quiz results...</span>
                </div>
              ) : quizzes.length === 0 ? (
                <div className="py-12 bg-white rounded-3xl border border-slate-200 text-center p-6 space-y-2">
                  <Award className="w-10 h-10 text-slate-300 mx-auto" />
                  <h3 className="text-sm font-extrabold text-slate-800">No Quizzes Taken Yet</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    When {selectedChild.name} takes practice quizzes in the Student Portal, the scores and question breakdown will appear here.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {quizzes.map((quiz, idx) => {
                    const isHigh = quiz.percentage >= 80;
                    const isMedium = quiz.percentage >= 50 && quiz.percentage < 80;
                    return (
                      <div
                        key={quiz.id || idx}
                        className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 hover:border-indigo-300 shadow-xs hover:shadow-md transition-all space-y-3 flex flex-col justify-between"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700">
                              {quiz.subject}
                            </span>
                            <span className={`text-[11px] font-black px-2.5 py-0.5 rounded-full ${
                              isHigh
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : isMedium
                                ? "bg-amber-50 text-amber-700 border border-amber-200"
                                : "bg-rose-50 text-rose-700 border border-rose-200"
                            }`}>
                              {quiz.percentage}% Accuracy
                            </span>
                          </div>

                          <h3 className="text-sm font-extrabold text-slate-900 leading-snug">
                            {quiz.quiz_title}
                          </h3>

                          {quiz.chapter && (
                            <p className="text-xs text-slate-500 font-medium line-clamp-1">
                              {quiz.chapter}
                            </p>
                          )}
                        </div>

                        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1.5 font-extrabold text-slate-800">
                            <span>Score:</span>
                            <span className="text-sm font-black text-indigo-600">{quiz.score}/{quiz.total}</span>
                          </div>

                          <button
                            onClick={() => setSelectedQuizDetail(quiz)}
                            className="inline-flex items-center gap-1 text-xs font-extrabold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                          >
                            <span>Review Questions ({quiz.total})</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: SMART NOTES */}
          {activeTab === "notes" && (
            <div className="space-y-3">
              {loadingActivities ? (
                <div className="py-12 bg-white rounded-3xl border border-slate-200 text-center text-xs text-slate-400 font-bold flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-indigo-600" />
                  <span>Loading notes...</span>
                </div>
              ) : notes.length === 0 ? (
                <div className="py-12 bg-white rounded-3xl border border-slate-200 text-center p-6 space-y-2">
                  <FileText className="w-10 h-10 text-slate-300 mx-auto" />
                  <h3 className="text-sm font-extrabold text-slate-800">No Notes Written Yet</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Notes created by {selectedChild.name} in the Notion Smart Notes studio will automatically appear here.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {notes.map((note, idx) => (
                    <div
                      key={note.id || idx}
                      onClick={() => setSelectedNoteDetail(note)}
                      className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 hover:border-indigo-300 shadow-xs hover:shadow-md transition-all space-y-3 cursor-pointer flex flex-col justify-between group"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-extrabold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[10px]">
                            {note.subject || "General"}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">
                            {note.updated_at ? new Date(note.updated_at).toLocaleDateString() : ""}
                          </span>
                        </div>

                        <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                          {note.title || "Untitled Note"}
                        </h3>

                        <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100 font-mono text-[11px]">
                          {note.content?.slice(0, 140) || "(Empty note)"}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs font-extrabold text-indigo-600 group-hover:translate-x-0.5 transition-transform">
                        <span>Read Full Note</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      )}

      {/* ────────── MODAL: ADD CHILD ACCOUNT ────────── */}
      {isAddChildOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            
            <div className="p-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                  <User className="w-5 h-5 text-amber-300" />
                </div>
                <div>
                  <h3 className="text-base font-black">Add Child Account</h3>
                  <p className="text-xs text-indigo-200">Create login credentials (No student email needed)</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddChildOpen(false)}
                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {successCredentialCard ? (
              <div className="p-6 space-y-4">
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-extrabold text-emerald-950">Student Account Created!</h4>
                    <p className="text-xs text-emerald-800 mt-0.5">
                      Your child can now log into the Student Portal at <strong>/login</strong> using these details:
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5 text-xs font-bold">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Student Name:</span>
                    <span className="text-slate-900">{successCredentialCard.name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Student Username:</span>
                    <span className="text-indigo-600 font-mono text-sm">{successCredentialCard.username}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Student Password:</span>
                    <span className="text-slate-900 font-mono">{successCredentialCard.password}</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setSuccessCredentialCard(null);
                    setIsAddChildOpen(false);
                  }}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-md transition"
                >
                  Done &amp; View Child Profile
                </button>
              </div>
            ) : (
              <form onSubmit={handleAddChild} className="p-5 sm:p-6 space-y-3.5">
                
                {formError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-bold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Child's Full Name</label>
                  <input
                    type="text"
                    value={newChildName}
                    onChange={(e) => setNewChildName(e.target.value)}
                    placeholder="e.g. Aarav Sharma"
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-semibold focus:outline-none focus:border-indigo-600"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Username <span className="text-[10px] text-indigo-600">(Unique ID)</span>
                    </label>
                    <input
                      type="text"
                      value={newChildUsername}
                      onChange={(e) => setNewChildUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ""))}
                      placeholder="e.g. aarav_sharma"
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-mono font-semibold focus:outline-none focus:border-indigo-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Class / Grade</label>
                    <select
                      value={newChildClass}
                      onChange={(e) => setNewChildClass(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 font-semibold focus:outline-none focus:border-indigo-600"
                    >
                      {CLASS_OPTIONS.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Password (Min 6 chars)</label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={newChildPassword}
                      onChange={(e) => setNewChildPassword(e.target.value)}
                      placeholder="••••••••••••"
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-3.5 pr-10 py-2.5 text-xs text-slate-900 font-semibold focus:outline-none focus:border-indigo-600"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">School Name (Optional)</label>
                  <input
                    type="text"
                    value={newChildSchool}
                    onChange={(e) => setNewChildSchool(e.target.value)}
                    placeholder="e.g. Delhi Public School"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-semibold focus:outline-none focus:border-indigo-600"
                  />
                </div>

                <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl text-[11px] text-indigo-900 font-medium">
                  💡 <strong>Child Login:</strong> Your child will log in using only their <strong>Username</strong> and <strong>Password</strong> at <strong>/login</strong>. No email is needed.
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddChildOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 font-extrabold text-xs transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={formSubmitting}
                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-md transition flex items-center gap-2"
                  >
                    {formSubmitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                    <span>Create Child Account</span>
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

      {/* ────────── MODAL: QUIZ DETAIL BREAKDOWN ────────── */}
      {selectedQuizDetail && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            
            <div className="p-5 bg-gradient-to-r from-indigo-900 to-slate-900 text-white flex items-center justify-between shrink-0">
              <div>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-white/20 text-indigo-100">
                  {selectedQuizDetail.subject}
                </span>
                <h3 className="text-base font-black text-white mt-1">{selectedQuizDetail.quiz_title}</h3>
              </div>
              <button
                onClick={() => setSelectedQuizDetail(null)}
                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* SCORE STRIP */}
            <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-xs font-bold shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-slate-500">Score:</span>
                <span className="text-base font-black text-indigo-600">
                  {selectedQuizDetail.score}/{selectedQuizDetail.total}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-[11px] font-black">
                  {selectedQuizDetail.percentage}%
                </span>
              </div>
              <span className="text-slate-400 font-medium text-[11px]">
                {selectedQuizDetail.timestamp ? new Date(selectedQuizDetail.timestamp).toLocaleDateString() : ""}
              </span>
            </div>

            {/* QUESTIONS LIST */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-3 flex-1">
              {(!selectedQuizDetail.breakdown || selectedQuizDetail.breakdown.length === 0) ? (
                <div className="py-8 text-center text-slate-400 text-xs">
                  Detailed question breakdown was not recorded for this test.
                </div>
              ) : (
                selectedQuizDetail.breakdown.map((item, qIdx) => (
                  <div
                    key={qIdx}
                    className={`p-4 rounded-2xl border space-y-2 text-xs ${
                      item.is_correct
                        ? "bg-emerald-50/40 border-emerald-200"
                        : "bg-rose-50/40 border-rose-200"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span className="font-extrabold text-slate-900 flex-1">
                        Q{qIdx + 1}: {item.question}
                      </span>
                      {item.is_correct ? (
                        <span className="inline-flex items-center gap-1 font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md shrink-0 text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Correct
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 font-extrabold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-md shrink-0 text-[11px]">
                          <XCircle className="w-3.5 h-3.5" /> Incorrect
                        </span>
                      )}
                    </div>

                    <div className="pt-2 border-t border-slate-200/60 space-y-1 text-[11px]">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-500 font-bold">Child's Answer:</span>
                        <span className={`font-black ${item.is_correct ? 'text-emerald-700' : 'text-rose-600'}`}>
                          {item.user_answer}
                        </span>
                      </div>
                      {!item.is_correct && (
                        <div className="flex items-center gap-2">
                          <span className="text-slate-500 font-bold">Correct Answer:</span>
                          <span className="font-black text-emerald-700">{item.correct_answer}</span>
                        </div>
                      )}
                      {item.explanation && (
                        <p className="text-slate-600 mt-1 italic">
                          💡 {item.explanation}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end shrink-0">
              <button
                onClick={() => setSelectedQuizDetail(null)}
                className="px-5 py-2 bg-slate-800 text-white font-bold text-xs rounded-xl"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ────────── MODAL: NOTE PREVIEW ────────── */}
      {selectedNoteDetail && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            
            <div className="p-5 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-center justify-between shrink-0">
              <div>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-white/20 text-indigo-100">
                  {selectedNoteDetail.subject}
                </span>
                <h3 className="text-base font-black text-white mt-1">{selectedNoteDetail.title}</h3>
              </div>
              <button
                onClick={() => setSelectedNoteDetail(null)}
                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 sm:p-6 overflow-y-auto flex-1 prose prose-slate max-w-none text-xs leading-relaxed">
              <Markdown content={selectedNoteDetail.content} />
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end shrink-0">
              <button
                onClick={() => setSelectedNoteDetail(null)}
                className="px-5 py-2 bg-slate-800 text-white font-bold text-xs rounded-xl"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
