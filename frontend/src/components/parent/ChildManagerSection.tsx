"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  User, 
  Plus, 
  Sparkles, 
  Award, 
  BookOpen, 
  FileText, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Lock, 
  Eye, 
  EyeOff, 
  Trash2, 
  Edit3, 
  RefreshCw, 
  X, 
  School, 
  GraduationCap, 
  ChevronRight,
  TrendingUp,
  AlertCircle
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

export function ChildManagerSection() {
  const { user } = useAppStore();
  const parentEmail = user?.email || "";

  const [children, setChildren] = useState<ChildAccount[]>([]);
  const [selectedChildUsername, setSelectedChildUsername] = useState<string | null>(null);
  const [loadingChildren, setLoadingChildren] = useState(true);

  // Child Activities State
  const [activeTab, setActiveTab] = useState<"quizzes" | "notes">("quizzes");
  const [quizzes, setQuizzes] = useState<QuizAttempt[]>([]);
  const [notes, setNotes] = useState<StudentNote[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(false);

  // Modals
  const [isAddChildOpen, setIsAddChildOpen] = useState(false);
  const [selectedQuizDetail, setSelectedQuizDetail] = useState<QuizAttempt | null>(null);
  const [selectedNoteDetail, setSelectedNoteDetail] = useState<StudentNote | null>(null);

  // New Child Form
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
      console.warn("Notice: Failed to fetch children:", err);
    } finally {
      setLoadingChildren(false);
    }
  }, [parentEmail]);

  useEffect(() => {
    fetchChildren();
  }, [fetchChildren]);

  // Fetch selected child activities
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
      console.warn("Notice: Failed to load child activities:", err);
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
    if (!window.confirm(`Are you sure you want to remove ${username}'s account from your Parent Portal?`)) {
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

  const selectedChild = children.find(c => c.username === selectedChildUsername) || null;

  return (
    <div className="space-y-6">
      
      {/* 1. TOP HEADER & CHILD SELECTOR STRIP */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-100 mb-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
              <span>Multi-Child Education Management</span>
            </div>
            <h2 className="text-xl font-black text-slate-900">My Children &amp; Student Accounts</h2>
            <p className="text-xs text-slate-500">
              Create student accounts with Username &amp; Password only. Track quizzes, scores, and smart notes in real-time.
            </p>
          </div>

          <button
            onClick={() => {
              setSuccessCredentialCard(null);
              setFormError(null);
              setIsAddChildOpen(true);
            }}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-extrabold text-xs rounded-2xl shadow-md hover:shadow-lg transition-all shrink-0 active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Child Account</span>
          </button>
        </div>

        {/* CHILD TABS / PILLS */}
        {loadingChildren ? (
          <div className="py-6 text-center text-xs text-slate-400 font-bold flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-indigo-600" />
            <span>Loading enrolled children...</span>
          </div>
        ) : children.length === 0 ? (
          <div className="p-6 rounded-2xl bg-indigo-50/50 border border-dashed border-indigo-200 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 mx-auto flex items-center justify-center">
              <User className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-extrabold text-slate-900">No Child Accounts Enrolled Yet</p>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-0.5">
                Students do not need an email! Click <strong>"Add Child Account"</strong> to create your child's username and password so they can log into the student portal.
              </p>
            </div>
            <button
              onClick={() => setIsAddChildOpen(true)}
              className="px-5 py-2.5 bg-indigo-600 text-white font-bold text-xs rounded-xl shadow-xs hover:bg-indigo-700 transition-colors"
            >
              + Create First Child Account
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-none">
            {children.map((child) => {
              const isSelected = child.username === selectedChildUsername;
              return (
                <button
                  key={child.username}
                  onClick={() => setSelectedChildUsername(child.username)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all text-left shrink-0 cursor-pointer ${
                    isSelected
                      ? "bg-gradient-to-br from-indigo-50 via-white to-indigo-50/60 border-indigo-600 shadow-md ring-2 ring-indigo-600/20"
                      : "bg-slate-50 hover:bg-slate-100/80 border-slate-200 text-slate-600"
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black shrink-0 ${
                    isSelected ? "bg-indigo-600 text-white shadow-sm" : "bg-white text-slate-700 border border-slate-200"
                  }`}>
                    {child.name?.slice(0, 1).toUpperCase() || "S"}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-slate-900">{child.name}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        isSelected ? "bg-indigo-600 text-white" : "bg-slate-200 text-slate-700"
                      }`}>
                        {child.class_name}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                      @{child.username}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 2. SELECTED CHILD ACTIVITY OBSERVATION DASHBOARD */}
      {selectedChild && (
        <div className="space-y-6">
          
          {/* CHILD OVERVIEW CARD */}
          <div className="p-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl border border-indigo-900/50 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-2xl font-black text-amber-300 shadow-inner shrink-0">
                {selectedChild.name?.slice(0, 1).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-lg font-black text-white">{selectedChild.name}</h3>
                  <span className="text-[10px] font-bold bg-amber-400 text-slate-950 px-2.5 py-0.5 rounded-full">
                    {selectedChild.class_name}
                  </span>
                  <span className="text-[10px] font-bold bg-white/20 text-indigo-200 px-2 py-0.5 rounded-md font-mono">
                    Login: {selectedChild.username}
                  </span>
                </div>
                <p className="text-xs text-indigo-200 mt-1 flex items-center gap-2 flex-wrap">
                  {selectedChild.school_name && <span>🏫 {selectedChild.school_name}</span>}
                  <span>• Permanent Supabase Cloud Synchronization Active</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start md:self-center shrink-0">
              <button
                onClick={fetchActivities}
                className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
                title="Refresh Activities"
              >
                <RefreshCw className={`w-4 h-4 ${loadingActivities ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={() => handleDeleteChild(selectedChild.username)}
                className="p-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/40 text-rose-300 border border-rose-500/30 transition-colors"
                title="Remove Child Account"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* SUB-TABS: QUIZZES & SMART NOTES */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
            
            {/* SUB-TAB SELECTOR */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab("quizzes")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                    activeTab === "quizzes"
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200/70"
                  }`}
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>Quizzes &amp; Results ({quizzes.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab("notes")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                    activeTab === "notes"
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200/70"
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Smart Notes ({notes.length})</span>
                </button>
              </div>

              <span className="text-[11px] text-slate-500 font-bold hidden sm:inline">
                Viewing activity for <strong className="text-indigo-600">{selectedChild.name}</strong>
              </span>
            </div>

            {/* TAB 1: QUIZZES & RESULTS */}
            {activeTab === "quizzes" && (
              <div className="space-y-4">
                {loadingActivities ? (
                  <div className="py-12 text-center text-xs text-slate-400 font-bold flex items-center justify-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin text-indigo-600" />
                    <span>Loading quiz history from Supabase Cloud...</span>
                  </div>
                ) : quizzes.length === 0 ? (
                  <div className="py-12 text-center text-slate-500 space-y-2">
                    <Award className="w-10 h-10 text-slate-300 mx-auto" />
                    <p className="text-sm font-bold text-slate-700">No quizzes attempted yet</p>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto">
                      When {selectedChild.name} takes practice quizzes in the Student Portal, the scores, percentage, and question breakdown will appear here.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {quizzes.map((quiz, idx) => {
                      const isHigh = quiz.percentage >= 80;
                      const isMedium = quiz.percentage >= 50 && quiz.percentage < 80;
                      return (
                        <div
                          key={quiz.id || idx}
                          className="p-5 rounded-2xl border border-slate-200 hover:border-indigo-300 bg-white hover:shadow-md transition-all space-y-3 flex flex-col justify-between"
                        >
                          <div className="space-y-2">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                                {quiz.subject}
                              </span>
                              <span className={`text-xs font-black px-2.5 py-0.5 rounded-full ${
                                isHigh
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : isMedium
                                  ? "bg-amber-50 text-amber-700 border border-amber-200"
                                  : "bg-rose-50 text-rose-700 border border-rose-200"
                              }`}>
                                {quiz.percentage}% Accuracy
                              </span>
                            </div>

                            <h4 className="text-sm font-extrabold text-slate-900 leading-snug">
                              {quiz.quiz_title}
                            </h4>

                            {quiz.chapter && (
                              <p className="text-xs text-slate-500 font-medium">
                                {quiz.chapter}
                              </p>
                            )}
                          </div>

                          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                            <div className="flex items-center gap-1.5 font-bold text-slate-700">
                              <span>Score:</span>
                              <span className="font-black text-indigo-600">{quiz.score}/{quiz.total}</span>
                              {quiz.xp_earned ? (
                                <span className="text-[10px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded font-bold">
                                  +{quiz.xp_earned} XP
                                </span>
                              ) : null}
                            </div>

                            <button
                              onClick={() => setSelectedQuizDetail(quiz)}
                              className="text-xs font-extrabold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                            >
                              <span>View Breakdown</span>
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
              <div className="space-y-4">
                {loadingActivities ? (
                  <div className="py-12 text-center text-xs text-slate-400 font-bold flex items-center justify-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin text-indigo-600" />
                    <span>Loading notes from Supabase Cloud...</span>
                  </div>
                ) : notes.length === 0 ? (
                  <div className="py-12 text-center text-slate-500 space-y-2">
                    <FileText className="w-10 h-10 text-slate-300 mx-auto" />
                    <p className="text-sm font-bold text-slate-700">No notes written yet</p>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto">
                      Notes created by {selectedChild.name} in the Notion Smart Notes studio will automatically synchronize and display here.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {notes.map((note, idx) => (
                      <div
                        key={note.id || idx}
                        onClick={() => setSelectedNoteDetail(note)}
                        className="p-5 rounded-2xl border border-slate-200 hover:border-indigo-300 bg-white hover:shadow-md transition-all space-y-3 cursor-pointer flex flex-col justify-between group"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[10px]">
                              {note.subject || "General"}
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium">
                              {note.updated_at ? new Date(note.updated_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : ""}
                            </span>
                          </div>

                          <h4 className="text-sm font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                            {note.title || "Untitled Note"}
                          </h4>

                          <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed font-mono text-[11px] bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                            {note.content?.slice(0, 150) || "(Empty note)"}
                          </p>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs font-bold text-indigo-600 group-hover:translate-x-0.5 transition-transform">
                          <span>Read Full Note</span>
                          <ChevronRight className="w-4 h-4" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      )}

      {/* ────────── MODAL: ADD CHILD ACCOUNT ────────── */}
      {isAddChildOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            
            <div className="p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                  <User className="w-5 h-5 text-amber-300" />
                </div>
                <div>
                  <h3 className="text-base font-black">Add Child Account</h3>
                  <p className="text-xs text-indigo-200">Create login credentials for your child (No email required)</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddChildOpen(false)}
                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* CONFIRMATION / CREDENTIALS CARD AFTER CREATION */}
            {successCredentialCard ? (
              <div className="p-6 space-y-4">
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-extrabold text-emerald-950">Student Account Created Successfully!</h4>
                    <p className="text-xs text-emerald-800 mt-0.5">
                      Your child can now log into the Student Portal at <strong>/login</strong> using these credentials:
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs font-bold">
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
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl transition-all shadow-md"
                >
                  Done &amp; Return to Dashboard
                </button>
              </div>
            ) : (
              <form onSubmit={handleAddChild} className="p-6 space-y-4">
                
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
                      Student Username <span className="text-[10px] text-indigo-600">(Unique ID)</span>
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
                  <label className="block text-xs font-bold text-slate-700 mb-1">Student Password (Min 6 chars)</label>
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
                    placeholder="e.g. Delhi Public School, R.K. Puram"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-semibold focus:outline-none focus:border-indigo-600"
                  />
                </div>

                <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl text-[11px] text-indigo-900 font-medium">
                  💡 <strong>Student Access:</strong> Your child will log into the site using only their <strong>Username</strong> and <strong>Password</strong>. No email or OTP is required for child accounts.
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddChildOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 font-extrabold text-xs transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={formSubmitting}
                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-2"
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
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            
            <div className="p-5 bg-gradient-to-r from-indigo-900 to-slate-900 text-white flex items-center justify-between shrink-0">
              <div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white/20 text-indigo-100">
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
                <span className="text-slate-500">Total Score:</span>
                <span className="text-lg font-black text-indigo-600">
                  {selectedQuizDetail.score}/{selectedQuizDetail.total}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-[11px] font-black">
                  {selectedQuizDetail.percentage}%
                </span>
              </div>
              <span className="text-slate-400 font-medium">
                {selectedQuizDetail.timestamp ? new Date(selectedQuizDetail.timestamp).toLocaleDateString() : ""}
              </span>
            </div>

            {/* QUESTIONS LIST */}
            <div className="p-6 overflow-y-auto space-y-4 flex-1">
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
                        ? "bg-emerald-50/40 border-emerald-200 text-slate-900"
                        : "bg-rose-50/40 border-rose-200 text-slate-900"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span className="font-extrabold text-slate-900 flex-1">
                        Q{qIdx + 1}: {item.question}
                      </span>
                      {item.is_correct ? (
                        <span className="inline-flex items-center gap-1 font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md shrink-0">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Correct
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 font-extrabold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-md shrink-0">
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
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            
            <div className="p-5 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-center justify-between shrink-0">
              <div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white/20 text-indigo-100">
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

            <div className="p-6 overflow-y-auto flex-1 prose prose-slate max-w-none text-xs leading-relaxed">
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
