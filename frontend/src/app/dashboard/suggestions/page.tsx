"use client";

import { useState, useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";
import { getApiBase } from "@/lib/api";
import { 
  MessageSquarePlus, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Send, 
  Clock, 
  Layers, 
  Check, 
  HelpCircle,
  Lightbulb,
  Bug,
  SlidersHorizontal,
  GraduationCap,
  HeartHandshake,
  Brain,
  Building2,
  RefreshCw,
  User,
  Mail,
  ShieldCheck,
  ChevronRight
} from "lucide-react";

interface SuggestionItem {
  id: string;
  user_name: string;
  user_email: string;
  user_role: string;
  school_name?: string;
  feature_id: string;
  feature_name: string;
  category: string;
  title: string;
  description: string;
  impact_rating: string;
  status: string;
  admin_response?: string | null;
  created_at: string;
  created_at_display: string;
}

const FEATURE_OPTIONS_BY_ROLE: Record<string, Array<{ id: string; name: string }>> = {
  teacher: [
    { id: "question_generator", name: "AI Question Generator" },
    { id: "ppt_generator", name: "AI PPT Generator" },
    { id: "assignments", name: "AI Assignment & Worksheet Maker" },
    { id: "teacher_mentor", name: "Teacher Mentor AI" },
    { id: "teacher_olympiad", name: "Skill Enhance Program" },
    { id: "english_coach", name: "English Speaking Coach" },
    { id: "recruitment", name: "Faculty Recruitment" },
    { id: "ocr_grading", name: "OCR & Document Scanner" },
    { id: "video_consultation", name: "Live Video Consultation" },
    { id: "general_teaching", name: "Teaching Pedagogy & Curriculum" },
    { id: "other", name: "Other / Propose New Feature" },
  ],
  student: [
    { id: "student_tutor", name: "AI Socratic Tutor" },
    { id: "exam_prep", name: "AI Exam Prep Studio" },
    { id: "practice_quizzes", name: "Practice & Quizzes" },
    { id: "notes", name: "Notion Smart Notes" },
    { id: "timer", name: "Pomodoro Study Timer" },
    { id: "leaderboard", name: "Student Leaderboard & XP" },
    { id: "english_coach", name: "English Speaking Coach" },
    { id: "revision", name: "Revision Studio & Flashcards" },
    { id: "other", name: "Other / Propose New Feature" },
  ],
  parent: [
    { id: "parent_coach", name: "Parenting AI Coach" },
    { id: "children_accounts", name: "Children Accounts & Progress Tracking" },
    { id: "english_coach", name: "English Speaking Coach" },
    { id: "research_assistant", name: "Research Assistant" },
    { id: "parent_reports", name: "Child Academic Report Cards" },
    { id: "other", name: "Other / Propose New Feature" },
  ],
  school: [
    { id: "vacancies", name: "Job Vacancies & Posting" },
    { id: "applicants", name: "Applicants & Resume Review" },
    { id: "school_profile", name: "Campus Profile & Branding" },
    { id: "school_analytics", name: "Campus Performance Analytics" },
    { id: "other", name: "Other / Propose New Feature" },
  ]
};

const CATEGORIES = [
  { id: "Feature Request", label: "Feature Request / New Idea", icon: Lightbulb, color: "text-amber-500 bg-amber-50 border-amber-200" },
  { id: "Improvement", label: "Enhancement to Existing Tool", icon: SlidersHorizontal, color: "text-indigo-500 bg-indigo-50 border-indigo-200" },
  { id: "Bug Report", label: "Bug or Glitch Encountered", icon: Bug, color: "text-rose-500 bg-rose-50 border-rose-200" },
  { id: "Curriculum & Content", label: "Curriculum / NCERT Content", icon: GraduationCap, color: "text-teal-500 bg-teal-50 border-teal-200" },
  { id: "UI & Mobile Design", label: "Design, Speed & Usability", icon: Sparkles, color: "text-purple-500 bg-purple-50 border-purple-200" },
];

export default function SuggestionsPage() {
  const { user } = useAppStore();
  const currentRole = user?.role || "teacher";

  // Form State
  const [selectedFeature, setSelectedFeature] = useState<string>("");
  const [category, setCategory] = useState<string>("Feature Request");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [impactRating, setImpactRating] = useState<string>("High Impact");
  const [customFeatureName, setCustomFeatureName] = useState("");

  // UI States
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // History State
  const [mySuggestions, setMySuggestions] = useState<SuggestionItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const availableFeatures = FEATURE_OPTIONS_BY_ROLE[currentRole] || FEATURE_OPTIONS_BY_ROLE.teacher;

  useEffect(() => {
    if (availableFeatures.length > 0 && !selectedFeature) {
      setSelectedFeature(availableFeatures[0].id);
    }
  }, [currentRole, availableFeatures]);

  const loadMySuggestions = async () => {
    if (!user?.email) return;
    setLoadingHistory(true);
    try {
      const baseUrl = getApiBase();
      const res = await fetch(`${baseUrl}/suggestions/my?email=${encodeURIComponent(user.email)}`);
      if (res.ok) {
        const data = await res.json();
        setMySuggestions(data.suggestions || []);
      }
    } catch {
      // Fallback
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    loadMySuggestions();
  }, [user?.email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.email) {
      setSubmitError("Please sign in with a valid user profile to submit suggestions.");
      return;
    }
    if (!title.trim()) {
      setSubmitError("Please provide a title for your suggestion.");
      return;
    }
    if (!description.trim()) {
      setSubmitError("Please provide details for your suggestion.");
      return;
    }

    setSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(null);

    const featObj = availableFeatures.find((f) => f.id === selectedFeature);
    const resolvedFeatureName = selectedFeature === "other" 
      ? (customFeatureName.trim() || "Custom Feature Proposal")
      : (featObj?.name || "General Platform");

    const payload = {
      user_name: user.name || user.email.split("@")[0],
      user_email: user.email,
      user_role: currentRole,
      school_name: user.schoolName || "",
      feature_id: selectedFeature,
      feature_name: resolvedFeatureName,
      category,
      title: title.trim(),
      description: description.trim(),
      impact_rating: impactRating
    };

    try {
      const baseUrl = getApiBase();
      const res = await fetch(`${baseUrl}/suggestions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setSubmitSuccess("Your suggestion has been submitted directly to the DEVGYA product engineering team!");
        setTitle("");
        setDescription("");
        setCustomFeatureName("");
        loadMySuggestions();
      } else {
        const errData = await res.json().catch(() => ({}));
        setSubmitError(errData.detail || "Failed to submit suggestion. Please try again.");
      }
    } catch (err: any) {
      setSubmitError(err.message || "Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16 font-sans">
      
      {/* HERO HEADER */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-indigo-900/50 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none" />
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-black uppercase tracking-wider">
            <Lightbulb className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
            <span>Community Co-Creation Hub</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white font-[family-name:var(--font-outfit)]">
            Platform Ideas &amp; Feature Suggestions
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl font-medium leading-relaxed">
            Your real classroom, study, and parenting feedback directly shapes DEVGYA AI. Select any feature, tell us what would make it better, and track the progress of your suggestions.
          </p>

          {/* AUTO-FILLED PROFILE BADGE */}
          {user && (
            <div className="pt-2 flex flex-wrap items-center gap-2.5 text-xs">
              <span className="text-slate-400 font-semibold">Submitting as:</span>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/10 border border-white/15 text-white font-bold backdrop-blur-md">
                <User className="w-3.5 h-3.5 text-cyan-300" />
                <span>{user.name || "Educator"}</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/10 border border-white/15 text-slate-300 font-mono text-[11px] backdrop-blur-md">
                <Mail className="w-3.5 h-3.5 text-purple-300" />
                <span>{user.email}</span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-400/40 text-[10px] font-black uppercase tracking-wider">
                {currentRole}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: SUGGESTION FORM */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <MessageSquarePlus className="w-5 h-5 text-indigo-600" />
              <span>Share Your Suggestion or Feedback</span>
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Fill in the form below. Our development and pedagogy team reviews every submission.
            </p>
          </div>

          {submitSuccess && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-start gap-3 animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-extrabold text-emerald-900">Suggestion Received!</p>
                <p className="font-medium text-emerald-700">{submitSuccess}</p>
              </div>
            </div>
          )}

          {submitError && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-start gap-3 animate-in fade-in">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-extrabold text-rose-900">Notice</p>
                <p className="font-medium text-rose-700">{submitError}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* 1. SELECT TARGET FEATURE */}
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-indigo-600" />
                <span>1. Which Feature are you suggesting for? <span className="text-rose-500">*</span></span>
              </label>
              
              <select
                value={selectedFeature}
                onChange={(e) => setSelectedFeature(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white transition-all cursor-pointer"
              >
                {availableFeatures.map((feat) => (
                  <option key={feat.id} value={feat.id}>
                    {feat.name}
                  </option>
                ))}
              </select>

              {selectedFeature === "other" && (
                <input
                  type="text"
                  value={customFeatureName}
                  onChange={(e) => setCustomFeatureName(e.target.value)}
                  placeholder="Specify the tool, feature or concept name..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white transition-all"
                />
              )}
            </div>

            {/* 2. SUGGESTION CATEGORY */}
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                <span>2. Category of Suggestion <span className="text-rose-500">*</span></span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  const isSelected = category === cat.id;
                  return (
                    <button
                      type="button"
                      key={cat.id}
                      onClick={() => setCategory(cat.id)}
                      className={`p-3 rounded-2xl border text-left transition-all flex items-center gap-2.5 cursor-pointer text-xs font-bold ${
                        isSelected 
                          ? "bg-indigo-50/80 border-indigo-400 text-indigo-900 shadow-xs ring-2 ring-indigo-500/20" 
                          : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      <span className={`p-1.5 rounded-xl border ${cat.color}`}>
                        <Icon className="w-3.5 h-3.5" />
                      </span>
                      <span className="truncate">{cat.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. SUGGESTION TITLE */}
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center justify-between">
                <span>3. Suggestion Title <span className="text-rose-500">*</span></span>
                <span className="text-[10px] text-slate-400 font-medium">Clear &amp; brief summary</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="E.g., Option to export question papers with CBSE blueprint tables"
                maxLength={120}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs font-semibold text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white transition-all placeholder:text-slate-400"
              />
            </div>

            {/* 4. DETAILED DESCRIPTION */}
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center justify-between">
                <span>4. Detailed Explanation &amp; Use Case <span className="text-rose-500">*</span></span>
                <span className="text-[10px] text-slate-400 font-medium">Why would this be useful?</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Explain the workflow, what difficulty you face now, and how this proposed feature would solve it for your teaching or studying..."
                rows={4}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs font-medium text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white transition-all placeholder:text-slate-400 leading-relaxed resize-none"
              />
            </div>

            {/* 5. IMPACT RATING */}
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-700 uppercase tracking-wider">
                5. How Important is this to You?
              </label>
              <div className="grid grid-cols-3 gap-2 text-xs">
                {["Nice to Have", "High Impact", "Critical Need"].map((rating) => {
                  const isSelected = impactRating === rating;
                  return (
                    <button
                      type="button"
                      key={rating}
                      onClick={() => setImpactRating(rating)}
                      className={`py-2 px-3 rounded-xl border text-center font-black transition-all cursor-pointer ${
                        isSelected
                          ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                          : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      {rating}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* SUBMIT ACTION BUTTON */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:to-pink-700 text-white font-extrabold text-xs tracking-wider uppercase shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Transmitting to Supabase...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Submit Suggestion</span>
                  </>
                )}
              </button>
            </div>

          </form>
        </div>

        {/* RIGHT COLUMN: MY SUBMITTED SUGGESTIONS HISTORY */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-purple-600" />
                  <span>My Suggestions History</span>
                </h3>
                <p className="text-[11px] text-slate-500 font-medium">
                  Track review status of your ideas
                </p>
              </div>

              <button
                onClick={loadMySuggestions}
                className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
                title="Refresh history"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingHistory ? "animate-spin" : ""}`} />
              </button>
            </div>

            {loadingHistory && mySuggestions.length === 0 ? (
              <div className="py-10 text-center space-y-2">
                <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs text-slate-400 font-medium">Loading your submissions...</p>
              </div>
            ) : mySuggestions.length === 0 ? (
              <div className="py-8 px-4 text-center rounded-2xl bg-slate-50 border border-dashed border-slate-200 space-y-2">
                <Lightbulb className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-xs font-bold text-slate-700">No suggestions submitted yet</p>
                <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                  Submit your first feature proposal or bug report using the form.
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[540px] overflow-y-auto pr-1">
                {mySuggestions.map((item) => {
                  const statusColors: Record<string, string> = {
                    "Under Review": "bg-amber-100 text-amber-800 border-amber-200",
                    "Planned": "bg-indigo-100 text-indigo-800 border-indigo-200",
                    "Implemented": "bg-emerald-100 text-emerald-800 border-emerald-200",
                    "Reviewed": "bg-blue-100 text-blue-800 border-blue-200",
                  };
                  const pillClass = statusColors[item.status] || "bg-slate-100 text-slate-700 border-slate-200";

                  return (
                    <div
                      key={item.id}
                      className="p-4 rounded-2xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 transition-all space-y-2 text-xs"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-extrabold text-slate-900 text-[13px] leading-tight">
                          {item.title}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border uppercase tracking-wider shrink-0 ${pillClass}`}>
                          {item.status}
                        </span>
                      </div>

                      <p className="text-[11.5px] text-slate-600 line-clamp-2 leading-relaxed font-medium">
                        {item.description}
                      </p>

                      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-200/60 text-[10.5px] text-slate-400 font-semibold">
                        <span className="text-indigo-600 font-bold">{item.feature_name}</span>
                        <span>{item.created_at_display}</span>
                      </div>

                      {item.admin_response && (
                        <div className="mt-2 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-[11px] font-medium space-y-0.5">
                          <p className="font-black text-emerald-950 uppercase text-[9.5px]">Product Team Response:</p>
                          <p>{item.admin_response}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

          </div>

          {/* PERMANENT PERSISTENCE GUARANTEE BADGE */}
          <div className="p-4 rounded-2xl bg-slate-100 border border-slate-200/80 flex items-center gap-3 text-xs text-slate-600 font-medium">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
            <p className="text-[11px] leading-relaxed">
              Your feedback is permanently stored in Supabase Cloud PostgreSQL and reviewed weekly by our senior curriculum &amp; engineering leads.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}
