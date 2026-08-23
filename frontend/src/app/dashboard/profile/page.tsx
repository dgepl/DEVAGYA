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
  Compass
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

function ProfileContent() {
  const { user, updateUserProfile } = useAppStore();
  const searchParams = useSearchParams();
  const router = useRouter();
  const isOnboarding = searchParams.get("onboarding") === "true";

  // Common Profile State
  const [name, setName] = useState(user.name || "");
  const [email, setEmail] = useState(user.email || "");
  const [schoolName, setSchoolName] = useState(user.schoolName || "");
  const [board, setBoard] = useState(user.board || "CBSE");
  const [classes, setClasses] = useState(user.classes || "Class 10");
  
  // Teacher Specific State
  const [subject, setSubject] = useState(user.subject || "Science");
  const [schoolLogo, setSchoolLogo] = useState<string>(user.schoolLogo || "");

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
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const userRole = user.role || "teacher";

  useEffect(() => {
    if (user) {
      if (user.name) setName(user.name);
      if (user.email) setEmail(user.email);
      if (user.schoolName) setSchoolName(user.schoolName);
      if (user.board) setBoard(user.board);
      if (user.classes) setClasses(user.classes);
      if (user.subject) setSubject(user.subject);
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
  }, [user]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrorMsg("Please upload a valid image file (PNG, JPG, JPEG, WEBP).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg("Image size exceeds 5MB limit. Please upload a smaller image.");
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      setSchoolLogo(base64);
      setErrorMsg(null);

      // Upload to Cloudinary backend
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api/v1";
        const res = await fetch(`${baseUrl}/auth/upload-logo`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: base64, email: user.email || email })
        });
        if (res.ok) {
          const data = await res.json();
          if (data.secure_url) {
            setSchoolLogo(data.secure_url);
          }
        }
      } catch (err) {
        console.warn("Cloudinary upload fallback to local base64:", err);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    setSchoolLogo("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg(null);

    const profileUpdates: any = {
      name,
      role: userRole,
      isProfileComplete: true
    };

    if (userRole === "teacher") {
      profileUpdates.schoolName = schoolName.trim() || "DEVGYA GLOBAL EDUTECH";
      profileUpdates.board = board;
      profileUpdates.subject = subject;
      profileUpdates.classes = classes;
      profileUpdates.schoolLogo = schoolLogo;
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

    // Sync with backend API
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api/v1";
      const res = await fetch(`${baseUrl}/auth/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email || email,
          full_name: name,
          role: userRole,
          school_name: userRole === "teacher" ? schoolName.trim() : (userRole === "student" ? schoolName.trim() : childSchool.trim()),
          board: userRole === "parent" ? childBoard : board,
          classes: userRole === "parent" ? childClass : classes,
          subject: userRole === "teacher" ? subject : strongSubject,
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
          phone,
          parenting_focus: parentingFocus,
          weekly_report_alerts: weeklyReportAlerts
        })
      });

      if (!res.ok) {
        const data = await res.json();
        console.warn("Backend profile sync notice:", data);
      }
    } catch (err) {
      console.warn("Local profile saved; backend sync notice:", err);
    } finally {
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 4000);
    }
  };

  return (
    <div className="max-w-4xl space-y-8 pb-12 font-sans">
      
      {/* ROLE-SPECIFIC ONBOARDING BANNER */}
      {isOnboarding && (
        <div className="p-6 rounded-3xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-xl space-y-2 animate-in fade-in duration-300">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-black uppercase tracking-wider backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>
              {userRole === "student" && "Welcome Student! Setup Your Study Goals"}
              {userRole === "parent" && "Welcome Parent! Link Your Child's Learning Profile"}
              {userRole === "teacher" && "Welcome Educator! Configure Your School Credentials"}
            </span>
          </div>
          <h2 className="text-xl font-black">
            {userRole === "student" && "Personalize Your AI Tutor & Exam Target"}
            {userRole === "parent" && "Tailor AI Guidance to Your Child's Class & Growth"}
            {userRole === "teacher" && "Configure Your Official School & Teaching Credentials"}
          </h2>
          <p className="text-xs text-indigo-100 font-medium leading-relaxed">
            {userRole === "student" && "Set your class, board, target exams, and favorite subjects so AI mentors can provide laser-accurate NCERT explanations and study plans."}
            {userRole === "parent" && "Provide your child's academic details to receive customized weekly progress reports, parenting advice, and syllabus timelines."}
            {userRole === "teacher" && "Fill in your official School Name, Board, Subject, and upload your School Logo to embed in all generated Question Paper PDFs."}
          </p>
        </div>
      )}

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2.5">
            {userRole === "student" && <GraduationCap className="w-7 h-7 text-indigo-600" />}
            {userRole === "parent" && <HeartHandshake className="w-7 h-7 text-purple-600" />}
            {userRole === "teacher" && <Building2 className="w-7 h-7 text-indigo-600" />}

            <span>
              {userRole === "student" && "Student Academic Profile & Study Goals"}
              {userRole === "parent" && "Parent Profile & Child Guidance Center"}
              {userRole === "teacher" && "Teacher Profile & School Branding"}
            </span>
          </h1>
          <p className="text-xs text-slate-500 font-semibold mt-1">
            {userRole === "student" && "Manage your class, target exam goals, strong/weak subjects, and daily study target."}
            {userRole === "parent" && "Manage parent contact details, child's grade, mentoring focus, and weekly progress alerts."}
            {userRole === "teacher" && "Manage your school header, official logo, teaching subjects, and assessment credentials."}
          </p>
        </div>

        {saved && (
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-black rounded-2xl shadow-xs animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Profile Updated Successfully!</span>
          </div>
        )}
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-2xl">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* =========================================================================
            1. STUDENT PROFILE FORM
        ========================================================================= */}
        {userRole === "student" && (
          <>
            {/* Student Info */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-5">
              <div className="border-b border-slate-100 pb-3 flex items-center gap-2">
                <User className="w-4 h-4 text-indigo-600" />
                <h2 className="text-xs font-black text-slate-900 uppercase tracking-wider">Student Information</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1.5">Student Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Aryan Sharma"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 font-bold focus:outline-none focus:border-indigo-600 focus:bg-white transition-all shadow-inner"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1.5">Account Email</label>
                  <input
                    type="email"
                    disabled
                    value={email}
                    className="w-full bg-slate-100 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-500 font-bold cursor-not-allowed shadow-inner"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1.5">School / College Name</label>
                  <input
                    type="text"
                    value={schoolName}
                    onChange={(e) => setSchoolName(e.target.value)}
                    placeholder="e.g. Delhi Public School / St. Xavier's"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 font-bold focus:outline-none focus:border-indigo-600 focus:bg-white transition-all shadow-inner"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1.5">Current Class / Grade</label>
                  <select
                    value={classes}
                    onChange={(e) => setClasses(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 font-bold focus:outline-none focus:border-indigo-600 focus:bg-white cursor-pointer shadow-inner"
                  >
                    {CLASS_OPTIONS.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1.5">Educational Board</label>
                  <select
                    value={board}
                    onChange={(e) => setBoard(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 font-bold focus:outline-none focus:border-indigo-600 focus:bg-white cursor-pointer shadow-inner"
                  >
                    {BOARD_OPTIONS.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Academic Ambitions & Exam Target */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-5">
              <div className="border-b border-slate-100 pb-3 flex items-center gap-2">
                <Target className="w-4 h-4 text-purple-600" />
                <h2 className="text-xs font-black text-slate-900 uppercase tracking-wider">Academic Goals &amp; Subject Mastery</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1.5">Primary Target Exam / Milestone</label>
                  <select
                    value={targetExam}
                    onChange={(e) => setTargetExam(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 font-bold focus:outline-none focus:border-indigo-600 focus:bg-white cursor-pointer shadow-inner"
                  >
                    {STUDENT_TARGET_EXAMS.map((exam) => (
                      <option key={exam} value={exam}>{exam}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1.5">Favorite / Strongest Subject</label>
                  <select
                    value={strongSubject}
                    onChange={(e) => setStrongSubject(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 font-bold focus:outline-none focus:border-indigo-600 focus:bg-white cursor-pointer shadow-inner"
                  >
                    {SUBJECT_OPTIONS.map((sub) => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1.5">Focus Subject (Needs AI Practice)</label>
                  <select
                    value={weakSubject}
                    onChange={(e) => setWeakSubject(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 font-bold focus:outline-none focus:border-indigo-600 focus:bg-white cursor-pointer shadow-inner"
                  >
                    {SUBJECT_OPTIONS.map((sub) => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1.5">Daily Self-Study Target</label>
                  <select
                    value={dailyGoalHours}
                    onChange={(e) => setDailyGoalHours(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 font-bold focus:outline-none focus:border-indigo-600 focus:bg-white cursor-pointer shadow-inner"
                  >
                    <option value="1">1 Hour / day</option>
                    <option value="2">2 Hours / day</option>
                    <option value="3">3 Hours / day (Recommended)</option>
                    <option value="4">4 Hours / day</option>
                    <option value="5">5+ Hours / day (Intensive Prep)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1.5">Preferred AI Tutor Language</label>
                  <select
                    value={preferredLanguage}
                    onChange={(e) => setPreferredLanguage(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 font-bold focus:outline-none focus:border-indigo-600 focus:bg-white cursor-pointer shadow-inner capitalize"
                  >
                    <option value="english">English</option>
                    <option value="hinglish">Hinglish (Hindi + English)</option>
                    <option value="hindi">Hindi (हिन्दी)</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1.5">Personal Study Motto / Dream Score</label>
                  <input
                    type="text"
                    value={studyMotto}
                    onChange={(e) => setStudyMotto(e.target.value)}
                    placeholder="e.g. Aiming for 98% in CBSE Boards and Top Rank in Olympiad"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 font-bold focus:outline-none focus:border-indigo-600 focus:bg-white transition-all shadow-inner"
                  />
                </div>
              </div>
            </div>
          </>
        )}

        {/* =========================================================================
            2. PARENT PROFILE FORM
        ========================================================================= */}
        {userRole === "parent" && (
          <>
            {/* Parent Info */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-5">
              <div className="border-b border-slate-100 pb-3 flex items-center gap-2">
                <User className="w-4 h-4 text-purple-600" />
                <h2 className="text-xs font-black text-slate-900 uppercase tracking-wider">Parent / Guardian Information</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1.5">Parent Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Mr. Rajesh Sharma"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 font-bold focus:outline-none focus:border-purple-600 focus:bg-white transition-all shadow-inner"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1.5">Account Email</label>
                  <input
                    type="email"
                    disabled
                    value={email}
                    className="w-full bg-slate-100 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-500 font-bold cursor-not-allowed shadow-inner"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1.5">Relationship to Student</label>
                  <select
                    value={parentRelation}
                    onChange={(e) => setParentRelation(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 font-bold focus:outline-none focus:border-purple-600 focus:bg-white cursor-pointer shadow-inner"
                  >
                    <option value="Father">Father</option>
                    <option value="Mother">Mother</option>
                    <option value="Legal Guardian">Legal Guardian</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1.5">Mobile / Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. +91 98765 43210"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 font-bold focus:outline-none focus:border-purple-600 focus:bg-white transition-all shadow-inner"
                  />
                </div>
              </div>
            </div>

            {/* Child's Academic Details */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-5">
              <div className="border-b border-slate-100 pb-3 flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-purple-600" />
                <h2 className="text-xs font-black text-slate-900 uppercase tracking-wider">Student / Child Academic Details</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1.5">Child's Full Name</label>
                  <input
                    type="text"
                    required
                    value={childName}
                    onChange={(e) => setChildName(e.target.value)}
                    placeholder="e.g. Aarav Sharma"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 font-bold focus:outline-none focus:border-purple-600 focus:bg-white transition-all shadow-inner"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1.5">Child's School Name</label>
                  <input
                    type="text"
                    value={childSchool}
                    onChange={(e) => setChildSchool(e.target.value)}
                    placeholder="e.g. Delhi Public School"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 font-bold focus:outline-none focus:border-purple-600 focus:bg-white transition-all shadow-inner"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1.5">Child's Current Class / Grade</label>
                  <select
                    value={childClass}
                    onChange={(e) => setChildClass(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 font-bold focus:outline-none focus:border-purple-600 focus:bg-white cursor-pointer shadow-inner"
                  >
                    {CLASS_OPTIONS.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1.5">Child's Board</label>
                  <select
                    value={childBoard}
                    onChange={(e) => setChildBoard(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 font-bold focus:outline-none focus:border-purple-600 focus:bg-white cursor-pointer shadow-inner"
                  >
                    {BOARD_OPTIONS.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1.5">Primary Parenting &amp; Guidance Focus</label>
                  <select
                    value={parentingFocus}
                    onChange={(e) => setParentingFocus(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 font-bold focus:outline-none focus:border-purple-600 focus:bg-white cursor-pointer shadow-inner"
                  >
                    {PARENT_FOCUS_AREAS.map((area) => (
                      <option key={area} value={area}>{area}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Notifications & Weekly Reports */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-purple-600" />
                  <h2 className="text-xs font-black text-slate-900 uppercase tracking-wider">Weekly Progress Alerts &amp; AI Coach</h2>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-purple-50/60 rounded-2xl border border-purple-100">
                <div className="space-y-0.5 max-w-lg">
                  <p className="text-xs font-black text-slate-900">Weekly Student Assessment &amp; Growth Summary</p>
                  <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                    Receive automated weekly performance digests highlighting quiz scores, practice hours, and focus recommendations from Parenting Coach AI.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={weeklyReportAlerts}
                  onChange={(e) => setWeeklyReportAlerts(e.target.checked)}
                  className="w-5 h-5 rounded-lg text-purple-600 focus:ring-purple-500 border-slate-300 cursor-pointer"
                />
              </div>
            </div>
          </>
        )}

        {/* =========================================================================
            3. TEACHER PROFILE FORM
        ========================================================================= */}
        {userRole === "teacher" && (
          <>
            {/* Educator Info */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-5">
              <div className="border-b border-slate-100 pb-3 flex items-center gap-2">
                <User className="w-4 h-4 text-indigo-600" />
                <h2 className="text-xs font-black text-slate-900 uppercase tracking-wider">Teacher Personal Info</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1.5">Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Prof. Ananya Roy"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 font-bold focus:outline-none focus:border-indigo-600 focus:bg-white transition-all shadow-inner"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1.5">Email Address</label>
                  <input
                    type="email"
                    disabled
                    value={email}
                    className="w-full bg-slate-100 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-500 font-bold cursor-not-allowed shadow-inner"
                  />
                  <span className="text-[10px] text-slate-400 font-medium">Registered account email</span>
                </div>
              </div>
            </div>

            {/* School & Teaching Info */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-5">
              <div className="border-b border-slate-100 pb-3 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-indigo-600" />
                <h2 className="text-xs font-black text-slate-900 uppercase tracking-wider">School &amp; Subject Details (Auto-Fetched in Paper Generator)</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1.5">Official School / Institution Name</label>
                  <input
                    type="text"
                    required
                    value={schoolName}
                    onChange={(e) => setSchoolName(e.target.value)}
                    placeholder="e.g. Delhi Public School / Apex International Academy"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 font-bold focus:outline-none focus:border-indigo-600 focus:bg-white transition-all shadow-inner"
                  />
                  <span className="text-[10px] text-slate-500 font-medium">This name will be printed on top of all Question Paper PDFs.</span>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1.5">Education Board</label>
                  <select
                    value={board}
                    onChange={(e) => setBoard(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 font-bold focus:outline-none focus:border-indigo-600 focus:bg-white cursor-pointer shadow-inner"
                  >
                    {BOARD_OPTIONS.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1.5">Primary Subject Taught</label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 font-bold focus:outline-none focus:border-indigo-600 focus:bg-white cursor-pointer shadow-inner"
                  >
                    {SUBJECT_OPTIONS.map((sub) => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1.5">Primary Class / Grade Taught</label>
                  <select
                    value={classes}
                    onChange={(e) => setClasses(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 font-bold focus:outline-none focus:border-indigo-600 focus:bg-white cursor-pointer shadow-inner"
                  >
                    {CLASS_OPTIONS.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* School Logo & Branding */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-5">
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-indigo-600" />
                  <h2 className="text-xs font-black text-slate-900 uppercase tracking-wider">School Logo (Embedded in PDF Header)</h2>
                </div>
                {schoolLogo && (
                  <button
                    type="button"
                    onClick={handleRemoveLogo}
                    className="text-xs text-rose-600 font-bold hover:text-rose-700 flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove Custom Logo</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center flex flex-col items-center justify-center min-h-[140px] space-y-2">
                  {schoolLogo ? (
                    <img 
                      src={schoolLogo} 
                      alt="Official School Logo" 
                      className="max-h-24 max-w-full object-contain rounded-lg shadow-sm"
                    />
                  ) : (
                    <img 
                      src="/logo.png" 
                      alt="Default DEVGYA Logo" 
                      className="max-h-16 max-w-full object-contain opacity-80"
                    />
                  )}
                  <span className="text-[10px] font-extrabold text-slate-600 uppercase tracking-wider">
                    {schoolLogo ? "Custom School Logo Active" : "Default DEVGYA Logo Active"}
                  </span>
                </div>

                <div className="sm:col-span-2 space-y-3">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                    onChange={handleLogoUpload}
                    className="hidden"
                    id="school-logo-input"
                  />

                  <label
                    htmlFor="school-logo-input"
                    className="border-2 border-dashed border-indigo-200 hover:border-indigo-500 bg-indigo-50/40 hover:bg-indigo-50/80 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all space-y-2 group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Upload className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-black text-indigo-900 block">Click to Upload School Logo</span>
                      <span className="text-[10px] text-slate-500 font-medium">PNG, JPG, or WEBP (Max 5MB)</span>
                    </div>
                  </label>

                  <p className="text-[11px] text-slate-500 font-medium">
                    💡 Tip: Upload a transparent background PNG logo for high-quality official PDF question paper headers.
                  </p>
                </div>
              </div>
            </div>
          </>
        )}

        {/* BOTTOM ACTION BUTTONS */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4">
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs rounded-2xl shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 uppercase tracking-wider transition-all cursor-pointer disabled:opacity-50 active:scale-95"
          >
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{saving ? "Saving Changes..." : "Save Profile Settings"}</span>
          </button>

          {isOnboarding && (
            <button
              type="button"
              onClick={() => {
                if (userRole === "student") router.push("/dashboard/student");
                else if (userRole === "parent") router.push("/dashboard/parent");
                else router.push("/dashboard/generator");
              }}
              className="px-6 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs rounded-2xl shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 uppercase tracking-wider transition-all cursor-pointer"
            >
              <span>Continue to Workspace</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>

      </form>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400 font-semibold">Loading Profile Settings...</div>}>
      <ProfileContent />
    </Suspense>
  );
}
