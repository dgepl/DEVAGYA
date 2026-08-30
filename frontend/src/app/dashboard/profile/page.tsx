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
  CheckCircle2, 
  RefreshCw, 
  Camera, 
  Mail, 
  LogOut,
  Target,
  HeartHandshake,
  BookOpen,
  Phone,
  Sparkles,
  ShieldCheck
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
  "Nursery / KG",
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
 * Client-side lightweight image compression using HTML5 Canvas (< 30KB)
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
  }, [user?.email, user?.avatarUrl, user?.schoolLogo, user?.name, user?.schoolName]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrorMsg("Please upload a valid image file (PNG, JPG, WEBP).");
      return;
    }

    setUploadingAvatar(true);
    setErrorMsg(null);

    try {
      const compressedBase64 = await compressImageFile(file, 450, 0.85);
      setAvatarUrl(compressedBase64);
      updateUserProfile({ avatarUrl: compressedBase64 });

      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api/v1";
      const res = await fetch(`${baseUrl}/auth/profile`, {
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
      if (res.ok) {
        const data = await res.json();
        if (data.user?.avatarUrl) {
          setAvatarUrl(data.user.avatarUrl);
          updateUserProfile({ avatarUrl: data.user.avatarUrl });
        }
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
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

  const handleSchoolLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrorMsg("Please upload a valid image file for school logo.");
      return;
    }

    setUploadingLogo(true);
    setErrorMsg(null);

    try {
      const compressedBase64 = await compressImageFile(file, 450, 0.85);
      setSchoolLogo(compressedBase64);
      updateUserProfile({ schoolLogo: compressedBase64 });

      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api/v1";
      const res = await fetch(`${baseUrl}/auth/profile`, {
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
      if (res.ok) {
        const data = await res.json();
        if (data.user?.schoolLogo) {
          setSchoolLogo(data.user.schoolLogo);
          updateUserProfile({ schoolLogo: data.user.schoolLogo });
        }
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
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

    updateUserProfile(profileUpdates);

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
        setErrorMsg(errData.detail || "Failed to update profile.");
      }
    } catch (err: any) {
      console.error("Profile update error:", err);
      setSaved(true);
      setTimeout(() => setSaved(false), 3500);
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = () => {
    logout();
    if (typeof window !== "undefined") {
      window.location.replace("/login");
    }
  };

  const getRoleLabel = () => {
    switch (userRole) {
      case "student": return "Student Learner";
      case "parent": return "Guardian / Parent";
      default: return "Teacher / Educator";
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20 font-sans animate-in fade-in duration-300">
      
      {/* PAGE HEADER */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2">
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            My Profile & Settings
          </h1>
          <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
            {getRoleLabel()}
          </span>
        </div>
        <p className="text-xs text-slate-500 font-medium mt-1">
          Manage your personal credentials, institution details, and curriculum preferences.
        </p>
      </div>

      {/* ERROR OR SUCCESS ALERTS */}
      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs font-bold flex items-center justify-between animate-in fade-in">
          <span>⚠️ {errorMsg}</span>
          <button type="button" onClick={() => setErrorMsg(null)} className="text-rose-500 hover:text-rose-800 cursor-pointer">✕</button>
        </div>
      )}

      {saved && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-black flex items-center gap-2 animate-in fade-in shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Profile and settings successfully saved to cloud!</span>
        </div>
      )}

      {/* MAIN TWO-COLUMN RESPONSIVE LAYOUT */}
      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: COMPACT PROFILE & AVATAR CARD */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs text-center space-y-4">
            
            {/* AVATAR WITH CAMERA OVERLAY */}
            <div className="relative inline-block mx-auto">
              <div 
                onClick={() => avatarInputRef.current?.click()}
                className="w-28 h-28 rounded-full bg-slate-100 p-1 ring-4 ring-indigo-50 cursor-pointer hover:ring-indigo-200 transition-all mx-auto overflow-hidden relative group"
                title="Click to upload profile photo"
              >
                <div className="w-full h-full rounded-full bg-slate-900 overflow-hidden flex items-center justify-center text-3xl font-black text-white">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt={name || "User"} className="w-full h-full object-cover" />
                  ) : (
                    <span>{name?.trim() ? name.trim().charAt(0).toUpperCase() : userRole.charAt(0).toUpperCase()}</span>
                  )}

                  {uploadingAvatar && (
                    <div className="absolute inset-0 bg-slate-900/80 flex items-center justify-center">
                      <RefreshCw className="w-6 h-6 text-white animate-spin" />
                    </div>
                  )}

                  <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition-opacity">
                    <Camera className="w-5 h-5 mb-0.5" />
                    <span className="text-[9px] font-black uppercase tracking-wider">Change</span>
                  </div>
                </div>
              </div>

              {avatarUrl && (
                <button
                  type="button"
                  onClick={handleRemoveAvatar}
                  className="absolute bottom-0 right-0 p-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-full shadow-md border-2 border-white transition-transform active:scale-90 cursor-pointer"
                  title="Remove Photo"
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

            {/* USER INFO */}
            <div>
              <h2 className="text-base font-black text-slate-900">
                {name || "Your Name"}
              </h2>
              <p className="text-xs text-slate-500 font-medium flex items-center justify-center gap-1.5 mt-0.5">
                <Mail className="w-3 h-3 text-slate-400" />
                {email || "user@devgya.com"}
              </p>
            </div>

            <div className="pt-2 border-t border-slate-100 flex flex-wrap justify-center gap-1.5 text-[11px] font-bold text-slate-600">
              <span className="bg-slate-100 px-2.5 py-1 rounded-lg">
                🏛️ {schoolName || childSchool || "School"}
              </span>
              <span className="bg-slate-100 px-2.5 py-1 rounded-lg">
                📚 {board || childBoard || "CBSE"} • {classes || childClass || "Class 10"}
              </span>
            </div>

            {/* LOG OUT BUTTON */}
            <div className="pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={handleSignOut}
                className="w-full py-2 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 font-extrabold text-xs rounded-xl border border-rose-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-600" />
                <span>Log Out</span>
              </button>
            </div>

          </div>

          {/* CLOUD BACKUP BADGE */}
          <div className="p-4 bg-indigo-50/60 rounded-2xl border border-indigo-100 text-indigo-900 text-xs flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-indigo-600 shrink-0" />
            <p className="font-semibold text-[11px] leading-relaxed">
              Your profile credentials, generated papers, and assessments are automatically synced to Cloud.
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN: CLEAN FORM SECTIONS */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* CARD 1: PERSONAL INFORMATION */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-sm font-black text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3 uppercase tracking-wider">
              <User className="w-4 h-4 text-indigo-600" />
              <span>Personal Information</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-slate-700">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-xs font-bold outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all bg-slate-50/50"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-slate-700">Email Address (Registered)</label>
                <input
                  type="email"
                  disabled
                  value={email}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-100 text-slate-500 text-xs font-bold outline-none cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* CARD 2: ACADEMIC & INSTITUTIONAL SETTINGS (ROLE-SPECIFIC) */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-sm font-black text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3 uppercase tracking-wider">
              <GraduationCap className="w-4 h-4 text-indigo-600" />
              <span>{userRole === "teacher" ? "School & Teaching Profile" : (userRole === "student" ? "Academic & Study Settings" : "Parent & Student Info")}</span>
            </h2>

            {/* TEACHER PROFILE */}
            {userRole === "teacher" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-slate-700">School / Institution Name</label>
                  <input
                    type="text"
                    value={schoolName}
                    onChange={(e) => setSchoolName(e.target.value)}
                    placeholder="e.g. Delhi Public School"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-xs font-bold outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all bg-slate-50/50"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-slate-700">Curriculum Board</label>
                  <select
                    value={board}
                    onChange={(e) => setBoard(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-xs font-bold outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all bg-slate-50/50 cursor-pointer"
                  >
                    {BOARD_OPTIONS.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-slate-700">Primary Subject</label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-xs font-bold outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all bg-slate-50/50 cursor-pointer"
                  >
                    {SUBJECT_OPTIONS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-slate-700">Classes Taught</label>
                  <select
                    value={classes}
                    onChange={(e) => setClasses(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-xs font-bold outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all bg-slate-50/50 cursor-pointer"
                  >
                    {CLASS_OPTIONS.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* STUDENT PROFILE */}
            {userRole === "student" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-slate-700">School / Academy Name</label>
                  <input
                    type="text"
                    value={schoolName}
                    onChange={(e) => setSchoolName(e.target.value)}
                    placeholder="e.g. Modern School"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-xs font-bold outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all bg-slate-50/50"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-slate-700">Target Exam</label>
                  <select
                    value={targetExam}
                    onChange={(e) => setTargetExam(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-xs font-bold outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all bg-slate-50/50 cursor-pointer"
                  >
                    {STUDENT_TARGET_EXAMS.map((ex) => (
                      <option key={ex} value={ex}>{ex}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-slate-700">Strong Subject</label>
                  <select
                    value={strongSubject}
                    onChange={(e) => setStrongSubject(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-xs font-bold outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all bg-slate-50/50 cursor-pointer"
                  >
                    {SUBJECT_OPTIONS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-slate-700">Subject Needing Focus</label>
                  <select
                    value={weakSubject}
                    onChange={(e) => setWeakSubject(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-xs font-bold outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all bg-slate-50/50 cursor-pointer"
                  >
                    {SUBJECT_OPTIONS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-slate-700">Daily Study Goal (Hours)</label>
                  <input
                    type="number"
                    min="1"
                    max="16"
                    value={dailyGoalHours}
                    onChange={(e) => setDailyGoalHours(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-xs font-bold outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all bg-slate-50/50"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-slate-700">Study Motto</label>
                  <input
                    type="text"
                    value={studyMotto}
                    onChange={(e) => setStudyMotto(e.target.value)}
                    placeholder="e.g. Aiming for 95%+!"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-xs font-bold outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all bg-slate-50/50"
                  />
                </div>
              </div>
            )}

            {/* PARENT PROFILE */}
            {userRole === "parent" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-slate-700">Relationship to Student</label>
                  <select
                    value={parentRelation}
                    onChange={(e) => setParentRelation(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-xs font-bold outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all bg-slate-50/50 cursor-pointer"
                  >
                    <option value="Father">Father</option>
                    <option value="Mother">Mother</option>
                    <option value="Guardian">Guardian</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-slate-700">Contact Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-xs font-bold outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all bg-slate-50/50"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-slate-700">Child's Name</label>
                  <input
                    type="text"
                    value={childName}
                    onChange={(e) => setChildName(e.target.value)}
                    placeholder="e.g. Aarav Sharma"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-xs font-bold outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all bg-slate-50/50"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-slate-700">Child's School</label>
                  <input
                    type="text"
                    value={childSchool}
                    onChange={(e) => setChildSchool(e.target.value)}
                    placeholder="e.g. Delhi Public School"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-xs font-bold outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all bg-slate-50/50"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-slate-700">Child's Class</label>
                  <select
                    value={childClass}
                    onChange={(e) => setChildClass(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-xs font-bold outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all bg-slate-50/50 cursor-pointer"
                  >
                    {CLASS_OPTIONS.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-slate-700">Primary Parenting Focus</label>
                  <select
                    value={parentingFocus}
                    onChange={(e) => setParentingFocus(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-xs font-bold outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all bg-slate-50/50 cursor-pointer"
                  >
                    {PARENT_FOCUS_AREAS.map((pf) => (
                      <option key={pf} value={pf}>{pf}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* CARD 3: SCHOOL / INSTITUTION LOGO (FOR TEACHERS) */}
          {userRole === "teacher" && (
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h2 className="text-sm font-black text-slate-900 flex items-center gap-2 uppercase tracking-wider">
                  <Building2 className="w-4 h-4 text-purple-600" />
                  <span>Exam Paper Branding (School Logo)</span>
                </h2>
                <span className="text-[10px] font-extrabold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-100">
                  Optional
                </span>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-2xl bg-purple-50/40 border border-purple-100">
                <div className="w-16 h-16 rounded-2xl bg-white text-purple-700 font-black text-xl flex items-center justify-center overflow-hidden border border-purple-200 shadow-xs shrink-0 p-1">
                  {schoolLogo ? (
                    <img src={schoolLogo} alt="School Logo" className="w-full h-full object-contain" />
                  ) : (
                    <Building2 className="w-8 h-8 text-purple-300" />
                  )}
                </div>

                <div className="space-y-1 flex-1 text-center sm:text-left">
                  <h3 className="text-xs font-black text-slate-900">
                    Official School / Academy Logo
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Automatically printed on the top header of all generated CBSE question papers and answer keys.
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => schoolLogoInputRef.current?.click()}
                    disabled={uploadingLogo}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 active:scale-95"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{uploadingLogo ? "Uploading..." : "Upload Logo"}</span>
                  </button>

                  {schoolLogo && (
                    <button
                      type="button"
                      onClick={handleRemoveSchoolLogo}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                      title="Remove Logo"
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
            </div>
          )}

          {/* BOTTOM SAVE BUTTON */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={saving}
              className="w-full sm:w-auto px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-2xl shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-95 uppercase tracking-wider"
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
