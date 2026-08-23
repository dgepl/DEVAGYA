"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Trophy, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  GraduationCap, 
  BookOpen, 
  ShieldCheck, 
  Award, 
  Zap, 
  Clock, 
  TrendingUp, 
  Users, 
  Building2, 
  Phone, 
  Mail, 
  MapPin, 
  Check, 
  CreditCard,
  ScanText,
  FileSpreadsheet,
  Mic,
  Gift,
  HelpCircle,
  User
} from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { INDIAN_STATES_AND_DISTRICTS, INDIAN_STATES } from "@/lib/indianStatesAndDistricts";
import { DevgyaLogo } from "@/components/common/DevgyaLogo";

const SUBJECTS = [
  "Science",
  "Mathematics",
  "English",
  "Hindi",
  "Social Science",
  "Physics",
  "Chemistry",
  "Biology",
  "Computer Science / IT",
  "Economics",
  "Accountancy",
  "Business Studies"
];

const GRADE_LEVELS = [
  "Primary (Classes 1–5)",
  "Middle School (Classes 6–8)",
  "High School / Secondary (Classes 9–10)",
  "Senior Secondary (Classes 11–12)",
  "K-12 All Grades / Coordinator"
];

const QUALIFICATIONS = [
  "B.Ed (Bachelor of Education)",
  "D.El.Ed (Diploma in Elementary Education)",
  "Master's Degree (M.Sc / M.A / M.Com) with B.Ed",
  "Bachelor's Degree (B.Sc / B.A / B.Com)",
  "M.Ed (Master of Education)",
  "Doctorate / Ph.D in Education / Subject",
  "Other Teaching Diploma / Degree"
];

const EXPERIENCES = [
  "Fresher (0–1 Year)",
  "1–3 Years",
  "3–5 Years",
  "5–10 Years",
  "10+ Years (Senior Educator / HOD)"
];

export default function TSOOnboardingPage() {
  const router = useRouter();
  const { user, setUser, updateUserProfile } = useAppStore();

  const [step, setStep] = useState<number>(1);
  const [loading, setLoading] = useState(false);

  // STEP 1: PRIMARY SIGNUP (< 60s Quick Lead Capture)
  const [fullName, setFullName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [email, setEmail] = useState(user?.email || "");
  const [selectedState, setSelectedState] = useState<string>("Delhi");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("New Delhi");

  // Cascading districts list
  const districtOptions = useMemo(() => {
    return INDIAN_STATES_AND_DISTRICTS[selectedState] || ["Central"];
  }, [selectedState]);

  // STEP 2: MANDATORY TEACHING PROFILE
  const [primarySubject, setPrimarySubject] = useState(user?.subject || "Science");
  const [teachingGradeLevel, setTeachingGradeLevel] = useState("High School / Secondary (Classes 9–10)");
  const [highestQualification, setHighestQualification] = useState("B.Ed (Bachelor of Education)");
  const [totalExperience, setTotalExperience] = useState("3–5 Years");
  const [schoolName, setSchoolName] = useState(user?.schoolName || "Delhi Public School");

  // STEP 3: TSO INFORMATION BANNER & SELECTION
  const [joinTSO, setJoinTSO] = useState<boolean>(true);
  const [tsoSubject, setTsoSubject] = useState("Science");
  const [tsoCategoryLevel, setTsoCategoryLevel] = useState("Secondary");
  const [tsoMedium, setTsoMedium] = useState("English");

  // STEP 4: TRIAL ACTIVATION
  const [trialPaid, setTrialPaid] = useState(false);

  const handleStateChange = (st: string) => {
    setSelectedState(st);
    const dists = INDIAN_STATES_AND_DISTRICTS[st] || [];
    setSelectedDistrict(dists[0] || "");
  };

  const handleStep1Proceed = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim()) return;

    // Create session record
    const updated = {
      ...user,
      name: fullName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      state: selectedState,
      district: selectedDistrict,
      role: "teacher" as const
    };
    setUser(updated);
    setStep(2);
  };

  const handleStep2Proceed = (e: React.FormEvent) => {
    e.preventDefault();
    setTsoSubject(primarySubject);
    setStep(3);
  };

  const handleStep3Proceed = async () => {
    setLoading(true);
    try {
      // Register TSO preference with backend
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api/v1";
      if (joinTSO) {
        await fetch(`${baseUrl}/olympiad/register-tso`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: email.trim().toLowerCase(),
            name: fullName.trim(),
            phone: phone.trim(),
            state: selectedState,
            district: selectedDistrict,
            tso_subject: tsoSubject,
            category_level: tsoCategoryLevel,
            medium: tsoMedium
          })
        });
      }

      // Sync user profile
      await fetch(`${baseUrl}/auth/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          full_name: fullName.trim(),
          phone: phone.trim(),
          state: selectedState,
          district: selectedDistrict,
          subject: primarySubject,
          classes: teachingGradeLevel,
          school_name: schoolName,
          highest_qualification: highestQualification,
          total_experience: totalExperience,
          teaching_grade_level: teachingGradeLevel,
          tso_joined: joinTSO,
          tso_subject: tsoSubject,
          tso_category_level: tsoCategoryLevel,
          tso_medium: tsoMedium,
          trial_activated: true
        })
      });

      updateUserProfile({
        name: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        subject: primarySubject,
        schoolName: schoolName,
        isProfileComplete: true
      });

      setStep(4);
    } catch (err) {
      console.warn("TSO onboarding sync notice:", err);
      setStep(4);
    } finally {
      setLoading(false);
    }
  };

  const handleActivateTrialAndEnter = () => {
    setTrialPaid(true);
    setTimeout(() => {
      router.push("/dashboard");
    }, 800);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900 text-slate-900 flex flex-col justify-between p-4 sm:p-6 relative overflow-hidden">
      
      {/* Background glow ambient */}
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* TOP BRAND HEADER */}
      <header className="max-w-3xl w-full mx-auto flex items-center justify-between py-2 relative z-10">
        <Link href="/" className="flex items-center gap-2">
          <div className="bg-white px-3 py-1.5 rounded-2xl shadow-sm border border-white/20">
            <DevgyaLogo size="sm" showText={false} />
          </div>
        </Link>
        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/15 text-white text-xs font-bold">
          <Trophy className="w-3.5 h-3.5 text-amber-400" />
          <span>TSO National Portal 2026</span>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="max-w-2xl w-full mx-auto my-6 relative z-10">
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-6 animate-in fade-in duration-300">
          
          {/* STEP PROGRESS TRACKER */}
          <div>
            <div className="flex items-center justify-between text-xs font-black text-slate-400 mb-2">
              <span className="text-indigo-600 uppercase tracking-wider">Step {step} of 4</span>
              <span>
                {step === 1 && "1. Quick Registration"}
                {step === 2 && "2. Teaching Profile"}
                {step === 3 && "3. Teacher Skills Olympiad (TSO)"}
                {step === 4 && "4. ₹1 Trial & AI Suite"}
              </span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 transition-all duration-300 rounded-full"
                style={{ width: `${(step / 4) * 100}%` }}
              />
            </div>
          </div>

          {/* ========================================================================= */}
          {/* STEP 1: PRIMARY SIGNUP (< 60s Lead Capture with Cascading State/District) */}
          {/* ========================================================================= */}
          {step === 1 && (
            <form onSubmit={handleStep1Proceed} className="space-y-5">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                    Educator Registration
                  </h2>
                </div>
                <p className="text-xs text-slate-500 font-medium">
                  Create your official verified teacher account in under 60 seconds.
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-700 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Full Name (For Official Records & Certificates) *</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value.replace(/[0-9]/g, ""))}
                    placeholder="e.g. Dr. Rajesh Sharma"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-700 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Mobile Number *</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-700 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Email ID (Invoices & Notifications) *</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value.replace(/\s+/g, ""))}
                      placeholder="teacher@school.edu"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all"
                    />
                  </div>
                </div>

                {/* Cascading State & District Dropdowns */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-700 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-indigo-600" />
                      <span>State (For Regional TSO Rankings) *</span>
                    </label>
                    <select
                      value={selectedState}
                      onChange={(e) => handleStateChange(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all bg-white"
                    >
                      {INDIAN_STATES.map((st) => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-700 flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                      <span>District (For District Rank & Matching) *</span>
                    </label>
                    <select
                      value={selectedDistrict}
                      onChange={(e) => setSelectedDistrict(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all bg-white"
                    >
                      {districtOptions.map((dist) => (
                        <option key={dist} value={dist}>{dist}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
                >
                  <span>Proceed to Teaching Profile</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* ========================================================================= */}
          {/* STEP 2: MANDATORY TEACHING PROFILE */}
          {/* ========================================================================= */}
          {step === 2 && (
            <form onSubmit={handleStep2Proceed} className="space-y-5">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                    Professional Teaching Profile
                  </h2>
                </div>
                <p className="text-xs text-slate-500 font-medium">
                  Configure your primary pedagogical domain to unlock customized AI tools and TSO modules.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-700">Primary Subject Taught *</label>
                  <select
                    value={primarySubject}
                    onChange={(e) => setPrimarySubject(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all bg-white"
                  >
                    {SUBJECTS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-700">Teaching Grade Level *</label>
                  <select
                    value={teachingGradeLevel}
                    onChange={(e) => setTeachingGradeLevel(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all bg-white"
                  >
                    {GRADE_LEVELS.map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-700">Highest Teaching Qualification *</label>
                  <select
                    value={highestQualification}
                    onChange={(e) => setHighestQualification(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all bg-white"
                  >
                    {QUALIFICATIONS.map((q) => (
                      <option key={q} value={q}>{q}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-700">Total Teaching Experience *</label>
                  <select
                    value={totalExperience}
                    onChange={(e) => setTotalExperience(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all bg-white"
                  >
                    {EXPERIENCES.map((exp) => (
                      <option key={exp} value={exp}>{exp}</option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-black text-slate-700">Current School / Institution Name</label>
                  <input
                    type="text"
                    value={schoolName}
                    onChange={(e) => setSchoolName(e.target.value)}
                    placeholder="e.g. Delhi Public School, R.K. Puram"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-3 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>

                <button
                  type="submit"
                  className="flex-1 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
                >
                  <span>Continue to Olympiad Overview</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* ========================================================================= */}
          {/* STEP 3: TSO INFORMATION BANNER & SELECTION */}
          {/* ========================================================================= */}
          {step === 3 && (
            <div className="space-y-5">
              
              {/* DEDICATED TSO INFORMATION BANNER */}
              <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 text-white rounded-2xl p-5 sm:p-6 border border-indigo-500/30 shadow-xl space-y-4 relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-36 h-36 bg-amber-400/20 rounded-full blur-2xl pointer-events-none" />
                
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center text-slate-950 font-black shadow-md shrink-0">
                    <Trophy className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black tracking-widest uppercase text-amber-300">NATIONAL INITIATIVE</span>
                    <h3 className="text-base sm:text-lg font-black text-white leading-tight">
                      Teacher Skills Olympiad (TSO) 2026
                    </h3>
                  </div>
                </div>

                {/* 5 Core Advantages Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  <div className="p-3 bg-white/10 rounded-xl border border-white/10 backdrop-blur-md space-y-1">
                    <div className="flex items-center gap-1.5 text-amber-300 text-xs font-black">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>100% Free Entry & Benchmarking</span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-snug">
                      Evaluate your digital pedagogy against educators nationwide with zero registration fee.
                    </p>
                  </div>

                  <div className="p-3 bg-white/10 rounded-xl border border-white/10 backdrop-blur-md space-y-1">
                    <div className="flex items-center gap-1.5 text-amber-300 text-xs font-black">
                      <Award className="w-3.5 h-3.5" />
                      <span>Cash Prizes & Felicitations</span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-snug">
                      Compete for cash awards. Top performers are felicitated at District & State levels by dignitaries.
                    </p>
                  </div>

                  <div className="p-3 bg-white/10 rounded-xl border border-white/10 backdrop-blur-md space-y-1">
                    <div className="flex items-center gap-1.5 text-amber-300 text-xs font-black">
                      <TrendingUp className="w-3.5 h-3.5" />
                      <span>Appraisal Edge & Salary Growth</span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-snug">
                      Present verified National Skill Scorecards for annual salary increments and HOD promotions.
                    </p>
                  </div>

                  <div className="p-3 bg-white/10 rounded-xl border border-white/10 backdrop-blur-md space-y-1">
                    <div className="flex items-center gap-1.5 text-amber-300 text-xs font-black">
                      <Users className="w-3.5 h-3.5" />
                      <span>Priority Recruitment Badge</span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-snug">
                      Earn a "TSO Benchmarked Rank Badge" for high visibility to top recruiting private schools.
                    </p>
                  </div>
                </div>

                <div className="p-2.5 bg-emerald-500/20 border border-emerald-400/30 rounded-xl text-emerald-200 text-xs font-bold flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Daily Workload Reduction: Save up to 2 hours daily in paper creation with companion AI tools.</span>
                </div>
              </div>

              {/* ACTION PROMPT: JOIN FREE TSO? */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="text-xs font-black text-slate-900">
                      Do you want to join the Free Teacher Skills Olympiad (TSO)?
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Zero fee, national certificate & verified badge.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setJoinTSO(true)}
                      className={`px-5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                        joinTSO
                          ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/25 ring-2 ring-indigo-600"
                          : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>YES, JOIN FREE</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setJoinTSO(false)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        !joinTSO
                          ? "bg-slate-800 text-white"
                          : "bg-white text-slate-500 border border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      NO, SKIP
                    </button>
                  </div>
                </div>

                {/* DYNAMICALLY EXPANDED TSO PARAMETERS WHEN YES */}
                {joinTSO && (
                  <div className="pt-3 border-t border-slate-200/80 grid grid-cols-1 sm:grid-cols-3 gap-3 animate-in fade-in duration-200">
                    <div className="space-y-1">
                      <label className="text-[11px] font-black text-slate-700">TSO Subject</label>
                      <select
                        value={tsoSubject}
                        onChange={(e) => setTsoSubject(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-white"
                      >
                        {SUBJECTS.map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-black text-slate-700">Category Level</label>
                      <select
                        value={tsoCategoryLevel}
                        onChange={(e) => setTsoCategoryLevel(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-white"
                      >
                        <option value="Primary">Primary (Classes 1–5)</option>
                        <option value="Middle">Middle (Classes 6–8)</option>
                        <option value="Secondary">Secondary (Classes 9–10)</option>
                        <option value="Senior Secondary">Senior Secondary (Classes 11–12)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-black text-slate-700">Exam Medium</label>
                      <select
                        value={tsoMedium}
                        onChange={(e) => setTsoMedium(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-white"
                      >
                        <option value="English">English</option>
                        <option value="Hindi">Hindi (हिंदी)</option>
                        <option value="Bilingual">Bilingual (English + Hindi)</option>
                      </select>
                    </div>

                    <p className="sm:col-span-3 text-[10px] text-slate-400 font-medium">
                      ℹ️ Note: Official TSO exam dates and session slots will be announced by the administration team.
                    </p>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-4 py-3 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  disabled={loading}
                  onClick={handleStep3Proceed}
                  className="flex-1 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                >
                  <span>{loading ? "Registering Preferences..." : "Proceed to ₹1 Trial & AI Suite Unlock"}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 4: ₹1 TRIAL ACTIVATION & FULL AI SUITE UNLOCK */}
          {/* ========================================================================= */}
          {step === 4 && (
            <div className="space-y-6 text-center">
              <div className="space-y-2">
                <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center mx-auto shadow-xl">
                  <Zap className="w-8 h-8 text-amber-300" />
                </div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                  Unlock 15-Day Full AI Suite Access
                </h2>
                <p className="text-xs text-slate-500 font-medium max-w-md mx-auto">
                  Activate your full educator trial with a nominal ₹1 verification token. Zero hidden charges.
                </p>
              </div>

              {/* FEATURES INCLUDED IN TRIAL CARD */}
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-4 text-left">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-black uppercase text-indigo-600">PRO EDUCATOR PASS</span>
                    <h3 className="text-base font-extrabold text-slate-900">15-Day Complete Access Pass</h3>
                  </div>
                  <div className="text-right">
                    <span className="text-xs line-through text-slate-400 font-bold">₹999</span>
                    <div className="text-xl font-black text-emerald-600">₹1 <span className="text-[10px] text-slate-500 font-bold">Only</span></div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Instant OCR Book Scanner (Unlimited)</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>AI Test Paper Generator (CBSE/NCERT)</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>NCERT Worksheet & Blueprint Creator</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Voice AI PTM & Spoken English Coach</span>
                  </div>
                  {joinTSO && (
                    <div className="sm:col-span-2 flex items-center gap-2 text-xs font-black text-indigo-700 bg-indigo-50 p-2.5 rounded-xl border border-indigo-100">
                      <Trophy className="w-4 h-4 text-amber-500 shrink-0" />
                      <span>Full Access to TSO Practice Assessments & Mock Drills Included</span>
                    </div>
                  )}
                </div>
              </div>

              {/* PAYMENT BUTTON */}
              <button
                type="button"
                onClick={handleActivateTrialAndEnter}
                className="w-full py-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-700 hover:from-emerald-700 hover:to-indigo-800 text-white font-black text-sm rounded-2xl shadow-xl shadow-emerald-600/25 flex items-center justify-center gap-2.5 transition-all active:scale-95 cursor-pointer uppercase tracking-wider"
              >
                {trialPaid ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-white animate-bounce" />
                    <span>Trial Activated! Entering Dashboard...</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5 text-amber-300" />
                    <span>Pay ₹1 & Activate 15-Day Full AI Access</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>

              <p className="text-[11px] text-slate-400 font-medium">
                🔒 Secure 256-Bit SSL Payment • Instant Auto-Activation • Cancel Anytime
              </p>
            </div>
          )}

        </div>
      </main>

      {/* FOOTER */}
      <footer className="max-w-2xl w-full mx-auto text-center text-[11px] text-slate-400 font-medium py-2">
        DEVGYA GLOBAL EDUTECH PRIVATE LIMITED • National Teacher Skills Olympiad 2026
      </footer>

    </div>
  );
}
