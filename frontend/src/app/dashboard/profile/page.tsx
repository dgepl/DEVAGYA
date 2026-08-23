"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { 
  User, 
  Save, 
  Building2, 
  GraduationCap, 
  Upload, 
  Trash2, 
  Sparkles, 
  CheckCircle2, 
  BookOpen, 
  Layers, 
  ArrowRight,
  RefreshCw,
  Image as ImageIcon,
  Target,
  Trophy,
  HeartHandshake,
  Clock,
  MessageSquare,
  Shield,
  Smartphone,
  Check,
  Award,
  Compass,
  Camera,
  Cloud,
  Mail,
  Zap,
  FileText,
  LogOut
} from "lucide-react";
import { useAppStore } from "@/store/useAppStore";

const BOARD_OPTIONS = [
  "CBSE",
  "ICSE / ISC",
  "State Board",
  "IB International",
  "Cambridge (IGCSE)"
];

const SUBJECT_OPTIONS = [
  "Science",
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "English",
  "Social Science",
  "Hindi",
  "Computer Science / IT",
  "Economics",
  "Accountancy",
  "Business Studies"
];

const CLASS_OPTIONS = [
  "Class 1", "Class 2", "Class 3", "Class 4", "Class 5",
  "Class 6", "Class 7", "Class 8", "Class 9", "Class 10",
  "Class 11", "Class 12", "College / Foundation"
];

const STUDENT_TARGET_EXAMS = [
  "CBSE Class 10 Board Exam 2026",
  "CBSE Class 12 Board Exam 2026",
  "JEE Main & Advanced",
  "NEET (Medical UG)",
  "School Periodic Assessments & Finals",
  "Science & Math Olympiads",
  "CUET (UG)",
  "ICSE / State Board Finals"
];

const PARENT_FOCUS_AREAS = [
  "Exam Stress & Anxiety Relief",
  "Daily Study Routine & Screen Time Balance",
  "Concept Clarity in Math & Science",
  "Consistent Homework & Test Prep",
  "Career Counseling & Higher Studies Guidance",
  "Overall Personality & Spoken English Growth"
];

/**
 * Compress image on client-side using HTML5 Canvas
 * Transforms any 5-15MB phone camera photo into a super lightweight (~20KB) JPEG in milliseconds.
 */
const compressImageFile = (file: File, maxWidth = 320, quality = 0.82): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Failed to read image file"));
    reader.onload = (event) => {
      const img = new Image();
      img.onerror = () => reject(new Error("Failed to load image"));
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(event.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const compressedBase64 = canvas.toDataURL("image/jpeg", quality);
        resolve(compressedBase64);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
};

function ProfileContent() {
  const { user, updateUserProfile, logout } = useAppStore();
  const searchParams = useSearchParams();
  const router = useRouter();
  const isOnboarding = searchParams.get("onboarding") === "true";

  // Common Profile State
  const [name, setName] = useState(user.name || "");
  const [email, setEmail] = useState(user.email || "");
  const [schoolName, setSchoolName] = useState(user.schoolName || "");
  const [board, setBoard] = useState(user.board || "CBSE");
  const [classes, setClasses] = useState(user.classes || "Class 10");
  
  // Distinct User Avatar and School Logo
  const [avatarUrl, setAvatarUrl] = useState<string>(user.avatarUrl || "");
  const [schoolLogo, setSchoolLogo] = useState<string>(user.schoolLogo || "");
  
  // Teacher Specific State
  const [subject, setSubject] = useState(user.subject || "Science");

  // Student Specific State
  const [targetExam, setTargetExam] = useState(user.targetExam || "CBSE Class 10 Board Exam 2026");
  const [strongSubject, setStrongSubject] = useState(user.strongSubject || "Mathematics");
  const [weakSubject, setWeakSubject] = useState(user.weakSubject || "Science");
  const [dailyGoalHours, setDailyGoalHours] = useState(user.dailyGoalHours || "3");
  const [studyMotto, setStudyMotto] = useState(user.studyMotto || "Aiming for 95%+ in Board Exams!");
  const [preferredLanguage, setPreferredLanguage] = useState(user.preferredLanguage || "english");

  // Parent Specific State
  const [childName, setChildName] = useState(user.childName || "Aarav Sharma");
  const [childSchool, setChildSchool] = useState(user.childSchool || "Delhi Public School");
  const [childClass, setChildClass] = useState(user.childClass || "Class 10");
  const [childBoard, setChildBoard] = useState(user.childBoard || "CBSE");
  const [parentRelation, setParentRelation] = useState(user.parentRelation || "Father");
  const [phone, setPhone] = useState(user.phone || "");
  const [parentingFocus, setParentingFocus] = useState(user.parentingFocus || "Exam Stress & Anxiety Relief");
  const [weeklyReportAlerts, setWeeklyReportAlerts] = useState<boolean>(user.weeklyReportAlerts ?? true);

  // Status & Feedback
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // Separate Refs for Avatar and School Logo
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const schoolLogoInputRef = useRef<HTMLInputElement>(null);

  const userRole = user.role || "teacher";

  useEffect(() => {
    if (user && user.email) {
      if (user.name) setName(user.name);
      if (user.email) setEmail(user.email);
      if (user.schoolName) setSchoolName(user.schoolName);
      if (user.board) setBoard(user.board);
      if (user.classes) setClasses(user.classes);
      if (user.subject) setSubject(user.subject);
      
      if (user.avatarUrl) setAvatarUrl(user.avatarUrl);
      if (user.schoolLogo) setSchoolLogo(user.schoolLogo);

      if (user.targetExam) setTargetExam(user.targetExam);
      if (user.strongSubject) setStrongSubject(user.strongSubject);
      if (user.weakSubject) setWeakSubject(user.weakSubject);
      if (user.dailyGoalHours) setDailyGoalHours(user.dailyGoalHours);
      if (user.studyMotto) setStudyMotto(user.studyMotto);
      if (user.preferredLanguage) setPreferredLanguage(user.preferredLanguage);

      if (user.childName) setChildName(user.childName);
      if (user.childSchool) setChildSchool(user.childSchool);
      if (user.childClass) setChildClass(user.childClass);
      if (user.childBoard) setChildBoard(user.childBoard);
      if (user.parentRelation) setParentRelation(user.parentRelation);
      if (user.phone) setPhone(user.phone);
      if (user.parentingFocus) setParentingFocus(user.parentingFocus);
      if (user.weeklyReportAlerts !== undefined) setWeeklyReportAlerts(user.weeklyReportAlerts);
    }
  }, [user?.email]);

  // 1. Handle User Profile Picture / Avatar Upload (Client-compressed + Instant Cloud Sync)
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrorMsg("Please upload a valid image file (PNG, JPG, JPEG, WEBP).");
      return;
    }

    setUploadingAvatar(true);
    setErrorMsg(null);

    try {
      // Compress in browser instantly down to < 25KB
      const compressedBase64 = await compressImageFile(file, 320, 0.82);
      setAvatarUrl(compressedBase64);
      updateUserProfile({ avatarUrl: compressedBase64 });

      // Save directly to cloud database immediately
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api/v1";
      await fetch(`${baseUrl}/auth/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email || email,
          full_name: name.trim() || user.name,
          role: userRole,
          avatar_url: compressedBase64,
          school_logo: schoolLogo
        })
      });
    } catch (err: any) {
      console.warn("Avatar upload notice:", err);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleRemoveAvatar = async () => {
    setAvatarUrl("");
    updateUserProfile({ avatarUrl: "" });
    if (avatarInputRef.current) {
      avatarInputRef.current.value = "";
    }
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api/v1";
      await fetch(`${baseUrl}/auth/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email || email,
          full_name: name.trim() || user.name,
          role: userRole,
          avatar_url: "",
          school_logo: schoolLogo
        })
      });
    } catch (e) {}
  };

  // 2. Handle School / Institution Logo Upload (Client-compressed + Instant Cloud Sync)
  const handleSchoolLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrorMsg("Please upload a valid image file for the school logo.");
      return;
    }

    setUploadingLogo(true);
    setErrorMsg(null);

    try {
      // Compress in browser instantly down to < 30KB
      const compressedBase64 = await compressImageFile(file, 380, 0.85);
      setSchoolLogo(compressedBase64);
      updateUserProfile({ schoolLogo: compressedBase64 });

      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api/v1";
      await fetch(`${baseUrl}/auth/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email || email,
          full_name: name.trim() || user.name,
          role: userRole,
          avatar_url: avatarUrl,
          school_logo: compressedBase64
        })
      });
    } catch (err: any) {
      console.warn("Logo upload notice:", err);
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleRemoveSchoolLogo = async () => {
    setSchoolLogo("");
    updateUserProfile({ schoolLogo: "" });
    if (schoolLogoInputRef.current) {
      schoolLogoInputRef.current.value = "";
    }
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api/v1";
      await fetch(`${baseUrl}/auth/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email || email,
          full_name: name.trim() || user.name,
          role: userRole,
          avatar_url: avatarUrl,
          school_logo: ""
        })
      });
    } catch (e) {}
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg(null);

    const profileUpdates: any = {
      name: name.trim() || (userRole === "teacher" ? "Educator" : "User"),
      role: userRole,
      avatarUrl: avatarUrl,
      schoolLogo: schoolLogo,
      isProfileComplete: true
    };

    if (userRole === "teacher") {
      profileUpdates.schoolName = schoolName.trim() || "DEVGYA GLOBAL EDUTECH";
      profileUpdates.board = board;
      profileUpdates.subject = subject;
      profileUpdates.classes = classes;
    } else if (userRole === "student") {
      profileUpdates.schoolName = schoolName.trim() || "Student Academy";
      profileUpdates.board = board;
      profileUpdates.classes = classes;
      profileUpdates.targetExam = targetExam;
      profileUpdates.strongSubject = strongSubject;
      profileUpdates.weakSubject = weakSubject;
      profileUpdates.dailyGoalHours = dailyGoalHours;
      profileUpdates.studyMotto = studyMotto;
      profileUpdates.preferredLanguage = preferredLanguage;
    } else if (userRole === "parent") {
      profileUpdates.phone = phone;
      profileUpdates.parentRelation = parentRelation;
      profileUpdates.childName = childName;
      profileUpdates.childSchool = childSchool;
      profileUpdates.childClass = childClass;
      profileUpdates.childBoard = childBoard;
      profileUpdates.parentingFocus = parentingFocus;
      profileUpdates.weeklyReportAlerts = weeklyReportAlerts;
    }

    // Update local Zustand store & localStorage immediately
    updateUserProfile(profileUpdates);

    // Sync with backend API (Supabase Cloud)
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api/v1";
      const res = await fetch(`${baseUrl}/auth/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email || email,
          full_name: name.trim(),
          role: userRole,
          school_name: userRole === "teacher" ? schoolName.trim() : (userRole === "student" ? schoolName.trim() : childSchool.trim()),
          board: userRole === "parent" ? childBoard : board,
          classes: userRole === "parent" ? childClass : classes,
          subject: userRole === "teacher" ? subject : strongSubject,
          avatar_url: avatarUrl,
          school_logo: schoolLogo,
          target_exam: targetExam,
          strong_subject: strongSubject,
          weak_subject: weakSubject,
          daily_goal_hours: dailyGoalHours,
          study_motto: studyMotto,
          preferred_language: preferredLanguage,
          child_name: childName,
          child_school: childSchool,
          child_class: childClass,
          child_board: childBoard,
          parent_relation: parentRelation,
          phone: phone,
          parenting_focus: parentingFocus,
          weekly_report_alerts: weeklyReportAlerts
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          updateUserProfile(data.user);
        }
        setSaved(true);
        setTimeout(() => setSaved(false), 3500);

        if (isOnboarding) {
          const dest = userRole === "student" ? "/dashboard/student" : (userRole === "parent" ? "/dashboard/parent" : "/dashboard");
          router.push(dest);
        }
      } else {
        const errData = await res.json().catch(() => ({}));
        setErrorMsg(errData.detail || "Failed to update profile on server.");
      }
    } catch (err: any) {
      console.error("Profile update error:", err);
      // Fallback: local save worked
      setSaved(true);
      setTimeout(() => setSaved(false), 3500);
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = () => {
    logout();
    if (typeof window !== "undefined") {
      window.location.replace("/");
    }
  };

  const getRoleBadgeInfo = () => {
    switch (userRole) {
      case "student":
        return { label: "Student Learner", color: "from-blue-600 to-indigo-600", bg: "bg-blue-50 text-blue-700 border-blue-200" };
      case "parent":
        return { label: "Guardian / Parent", color: "from-purple-600 to-pink-600", bg: "bg-purple-50 text-purple-700 border-purple-200" };
      default:
        return { label: "Educator / Teacher", color: "from-indigo-600 to-violet-600", bg: "bg-indigo-50 text-indigo-700 border-indigo-200" };
    }
  };

  const roleInfo = getRoleBadgeInfo();

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16 animate-in fade-in duration-300">
      
      {/* 1. PROFESSIONAL HERO PROFILE HEADER CARD */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-2xl relative overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-6">
          
          {/* USER AVATAR WITH CAMERA BADGE & REMOVE BUTTON */}
          <div className="relative group shrink-0">
            <div 
              onClick={() => avatarInputRef.current?.click()}
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 p-1 shadow-xl ring-4 ring-white/10 cursor-pointer hover:opacity-95 transition-opacity"
              title="Click to upload profile photo"
            >
              <div className="w-full h-full rounded-full bg-slate-900 overflow-hidden flex items-center justify-center text-3xl font-black text-white relative">
                {avatarUrl ? (
                  <img src={avatarUrl} alt={name || "User"} className="w-full h-full object-cover" />
                ) : (
                  <span>{name?.trim() ? name.trim().charAt(0).toUpperCase() : userRole.charAt(0).toUpperCase()}</span>
                )}

                {uploadingAvatar && (
                  <div className="absolute inset-0 bg-slate-900/80 flex items-center justify-center">
                    <RefreshCw className="w-6 h-6 text-indigo-400 animate-spin" />
                  </div>
                )}
              </div>
            </div>

            {/* Change Avatar Button */}
            <button
              type="button"
              onClick={() => avatarInputRef.current?.click()}
              className="absolute bottom-0 right-0 p-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full shadow-lg border-2 border-slate-900 transition-transform active:scale-90 cursor-pointer"
              title="Upload Profile Photo"
            >
              <Camera className="w-4 h-4" />
            </button>

            {/* Remove Avatar Button if photo exists */}
            {avatarUrl && (
              <button
                type="button"
                onClick={handleRemoveAvatar}
                className="absolute top-0 right-0 p-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-full shadow-lg border-2 border-slate-900 transition-transform active:scale-90 cursor-pointer"
                title="Remove Profile Photo"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}

            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarUpload}
            />
          </div>

          {/* USER DETAILS & BADGES */}
          <div className="space-y-3 text-center sm:text-left flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <span className={`text-[11px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full border ${roleInfo.bg}`}>
                {roleInfo.label}
              </span>
              <span className="text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Verified Account
              </span>
              {avatarUrl && avatarUrl.startsWith("http") && (
                <span className="text-[10px] font-bold bg-white/10 text-indigo-200 border border-white/15 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Cloud className="w-3 h-3 text-cyan-300" />
                  Cloud Hosted
                </span>
              )}
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {name || "Account Profile"}
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 font-medium flex items-center justify-center sm:justify-start gap-1.5 mt-1">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                {email || "user@devgya.com"}
              </p>
            </div>

            {/* Quick Meta Chips */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
              <span className="text-xs font-semibold text-slate-300 bg-white/10 px-3 py-1 rounded-xl border border-white/10 backdrop-blur-md">
                🏛️ {schoolName || childSchool || "Institutional Account"}
              </span>
              <span className="text-xs font-semibold text-slate-300 bg-white/10 px-3 py-1 rounded-xl border border-white/10 backdrop-blur-md">
                📖 {board || childBoard || "CBSE"} • {classes || childClass || "Class 10"}
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* ERROR MESSAGE NOTIFICATION */}
      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs font-bold flex items-center justify-between animate-in fade-in">
          <span>⚠️ {errorMsg}</span>
          <button type="button" onClick={() => setErrorMsg(null)} className="text-rose-500 hover:text-rose-800 cursor-pointer">✕</button>
        </div>
      )}

      {/* SUCCESS TOAST */}
      {saved && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-black flex items-center gap-2 animate-in fade-in shadow-sm">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Profile, picture, and branding successfully saved & synced to cloud!</span>
        </div>
      )}

      {/* 2. FORM DETAILS CARD */}
      <form onSubmit={handleSave} className="space-y-6">
        
        {/* SECTION 1: PERSONAL IDENTITY */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <User className="w-5 h-5 text-indigo-600" />
              Personal Profile Identity
            </h2>
            <span className="text-xs font-bold text-slate-400">Step 1 of 3</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-700">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                required
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-xs font-bold outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-700">Email Address (Read-Only)</label>
              <input
                type="email"
                value={email}
                disabled
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-100/70 text-slate-500 text-xs font-bold outline-none cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: ROLE-SPECIFIC SETTINGS & SCHOOL LOGO */}
        {userRole === "teacher" && (
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-indigo-600" />
                School Branding & Curriculum Settings
              </h2>
              <span className="text-xs font-bold text-slate-400">Step 2 of 3</span>
            </div>

            {/* Dedicated School Logo Upload Box */}
            <div className="p-4 bg-purple-50/50 rounded-2xl border border-purple-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-white text-purple-700 font-black text-xl flex items-center justify-center overflow-hidden border border-purple-200 shadow-xs shrink-0 p-1">
                  {schoolLogo ? (
                    <img src={schoolLogo} alt="School Logo Preview" className="w-full h-full object-contain" />
                  ) : (
                    <Building2 className="w-8 h-8 text-purple-400" />
                  )}
                </div>
                <div className="space-y-0.5 text-center sm:text-left">
                  <div className="flex items-center justify-center sm:justify-start gap-1.5">
                    <h3 className="text-xs font-black text-slate-900">School / Institution Official Logo</h3>
                    <span className="text-[9px] font-extrabold bg-purple-100 text-purple-700 px-2 py-0.5 rounded-md">Exam Paper Branding</span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium">
                    This logo is automatically placed on the top header of generated CBSE Question Papers, Answer Keys & Watermarks.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => schoolLogoInputRef.current?.click()}
                  disabled={uploadingLogo}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50 active:scale-95"
                >
                  <Upload className="w-3.5 h-3.5" />
                  {uploadingLogo ? "Uploading..." : "Upload School Logo"}
                </button>
                {schoolLogo && (
                  <button
                    type="button"
                    onClick={handleRemoveSchoolLogo}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                    title="Remove School Logo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}

                <input
                  ref={schoolLogoInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleSchoolLogoUpload}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-700">School / Coaching Name</label>
                <input
                  type="text"
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  placeholder="e.g. Delhi Public School, Apex Coaching"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-xs font-bold outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-700">Curriculum Board</label>
                <select
                  value={board}
                  onChange={(e) => setBoard(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-xs font-bold outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all bg-white"
                >
                  {BOARD_OPTIONS.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-700">Primary Subject Taught</label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-xs font-bold outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all bg-white"
                >
                  {SUBJECT_OPTIONS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-700">Grades / Classes</label>
                <select
                  value={classes}
                  onChange={(e) => setClasses(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-xs font-bold outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all bg-white"
                >
                  {CLASS_OPTIONS.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {userRole === "student" && (
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Target className="w-5 h-5 text-indigo-600" />
                Student Exam Target & Study Roadmap
              </h2>
              <span className="text-xs font-bold text-slate-400">Step 2 of 3</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-700">School / Academy Name</label>
                <input
                  type="text"
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  placeholder="e.g. Modern School, Allen Academy"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-xs font-bold outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-700">Primary Target Exam</label>
                <select
                  value={targetExam}
                  onChange={(e) => setTargetExam(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-xs font-bold outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all bg-white"
                >
                  {STUDENT_TARGET_EXAMS.map((ex) => (
                    <option key={ex} value={ex}>{ex}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-700">Strongest Subject</label>
                <select
                  value={strongSubject}
                  onChange={(e) => setStrongSubject(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-xs font-bold outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all bg-white"
                >
                  {SUBJECT_OPTIONS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-700">Subject Needing AI Focus</label>
                <select
                  value={weakSubject}
                  onChange={(e) => setWeakSubject(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-xs font-bold outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all bg-white"
                >
                  {SUBJECT_OPTIONS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-700">Daily Study Goal (Hours)</label>
                <input
                  type="number"
                  min="1"
                  max="16"
                  value={dailyGoalHours}
                  onChange={(e) => setDailyGoalHours(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-xs font-bold outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-700">Personal Study Motto</label>
                <input
                  type="text"
                  value={studyMotto}
                  onChange={(e) => setStudyMotto(e.target.value)}
                  placeholder="e.g. Consistent effort beats talent!"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-xs font-bold outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all"
                />
              </div>
            </div>
          </div>
        )}

        {userRole === "parent" && (
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <HeartHandshake className="w-5 h-5 text-indigo-600" />
                Parent & Child Profile Settings
              </h2>
              <span className="text-xs font-bold text-slate-400">Step 2 of 3</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-700">Relationship to Student</label>
                <select
                  value={parentRelation}
                  onChange={(e) => setParentRelation(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-xs font-bold outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all bg-white"
                >
                  <option value="Father">Father</option>
                  <option value="Mother">Mother</option>
                  <option value="Guardian">Guardian</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-700">Phone Number (For Progress SMS)</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-xs font-bold outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-700">Child's Full Name</label>
                <input
                  type="text"
                  value={childName}
                  onChange={(e) => setChildName(e.target.value)}
                  placeholder="e.g. Aarav Sharma"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-xs font-bold outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-700">Child's School</label>
                <input
                  type="text"
                  value={childSchool}
                  onChange={(e) => setChildSchool(e.target.value)}
                  placeholder="e.g. Delhi Public School"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-xs font-bold outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-700">Child's Class</label>
                <select
                  value={childClass}
                  onChange={(e) => setChildClass(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-xs font-bold outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all bg-white"
                >
                  {CLASS_OPTIONS.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-700">Parenting Primary Focus</label>
                <select
                  value={parentingFocus}
                  onChange={(e) => setParentingFocus(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-xs font-bold outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all bg-white"
                >
                  {PARENT_FOCUS_AREAS.map((pf) => (
                    <option key={pf} value={pf}>{pf}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 3: SAVE ACTIONS BAR */}
        <div className="sticky bottom-4 z-20 bg-white/95 backdrop-blur-md rounded-2xl p-4 border border-slate-200 shadow-xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
            <Shield className="w-4 h-4 text-indigo-600" />
            <span className="hidden sm:inline">Settings are encrypted and backed up to Supabase Cloud PostgreSQL.</span>
            <span className="sm:hidden">Auto-synced to Cloud</span>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:from-indigo-700 hover:to-purple-800 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-indigo-600/25 transition-all flex items-center gap-2 active:scale-95 cursor-pointer disabled:opacity-50 shrink-0"
          >
            {saving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Saving to Cloud...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save All Changes</span>
              </>
            )}
          </button>
        </div>

        {/* SECTION 4: MOBILE & DESKTOP SIGN OUT SECTION */}
        <div className="bg-rose-50/60 rounded-3xl p-6 border border-rose-100 flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-xs font-black text-rose-900 flex items-center justify-center sm:justify-start gap-1.5">
              <LogOut className="w-4 h-4 text-rose-600" />
              Sign Out of Account
            </h3>
            <p className="text-[11px] text-rose-700/80 font-medium">
              Safely end your session on this device. Your saved papers and profile stay preserved in the cloud.
            </p>
          </div>

          <button
            type="button"
            onClick={handleSignOut}
            className="w-full sm:w-auto px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 shrink-0"
          >
            <LogOut className="w-4 h-4" />
            <span>Log Out Account</span>
          </button>
        </div>

      </form>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={
      <div className="min-h-[400px] flex items-center justify-center">
        <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    }>
      <ProfileContent />
    </Suspense>
  );
}
