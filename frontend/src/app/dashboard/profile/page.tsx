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
  Image as ImageIcon
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
  "Class 11", "Class 12"
];

function ProfileContent() {
  const { user, updateUserProfile } = useAppStore();
  const searchParams = useSearchParams();
  const router = useRouter();
  const isOnboarding = searchParams.get("onboarding") === "true";

  const [name, setName] = useState(user.name || "");
  const [email, setEmail] = useState(user.email || "");
  const [schoolName, setSchoolName] = useState(user.schoolName || "");
  const [board, setBoard] = useState(user.board || "CBSE");
  const [subject, setSubject] = useState(user.subject || "Science");
  const [classes, setClasses] = useState(user.classes || "Class 10");
  const [schoolLogo, setSchoolLogo] = useState<string>(user.schoolLogo || "");
  
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      if (user.name) setName(user.name);
      if (user.email) setEmail(user.email);
      if (user.schoolName) setSchoolName(user.schoolName);
      if (user.board) setBoard(user.board);
      if (user.subject) setSubject(user.subject);
      if (user.classes) setClasses(user.classes);
      if (user.schoolLogo) setSchoolLogo(user.schoolLogo);
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

    const profileUpdates = {
      name,
      schoolName: schoolName.trim() || "DEVGYA GLOBAL EDUTECH PRIVATE LIMITED",
      board,
      subject,
      classes,
      schoolLogo,
      isProfileComplete: true
    };

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
          school_name: schoolName.trim(),
          board,
          subject,
          classes,
          school_logo: schoolLogo
        })
      });

      if (!res.ok) {
        const data = await res.json();
        console.warn("Backend profile sync notice:", data);
      }
    } catch (err) {
      console.warn("Local profile saved; backend sync error:", err);
    } finally {
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 4000);
    }
  };

  return (
    <div className="max-w-4xl space-y-8 pb-12 font-sans">
      
      {/* ONBOARDING WELCOME ALERT */}
      {isOnboarding && (
        <div className="p-6 rounded-3xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-xl space-y-2 animate-in fade-in duration-300">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-black uppercase tracking-wider backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Welcome Educator! Complete Your Profile</span>
          </div>
          <h2 className="text-xl font-black">Configure Your School &amp; Teaching Credentials</h2>
          <p className="text-xs text-indigo-100 font-medium leading-relaxed">
            Please fill in your official School Name, Board, Subject, and upload your School Logo. These will automatically appear on all generated CBSE/NCERT Question Papers and downloadable PDFs!
          </p>
        </div>
      )}

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2.5">
            <Building2 className="w-6 h-6 text-indigo-600" />
            Teacher Profile &amp; School Branding
          </h1>
          <p className="text-xs text-slate-500 font-semibold mt-1">
            Manage your school header, official logo, teaching subjects, and assessment credentials
          </p>
        </div>

        {saved && (
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-black rounded-2xl shadow-xs animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Profile &amp; School Branding Saved!</span>
          </div>
        )}
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-2xl">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* SECTION 1: EDUCATOR DETAILS */}
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

        {/* SECTION 2: SCHOOL BRANDING & TEACHING INFO */}
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

        {/* SECTION 3: SCHOOL LOGO UPLOAD & BRANDING */}
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
            {/* LOGO PREVIEW CARD */}
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

            {/* UPLOAD DROPZONE */}
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

        {/* BOTTOM ACTION BUTTONS */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4">
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs rounded-2xl shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 uppercase tracking-wider transition-all cursor-pointer disabled:opacity-50 active:scale-95"
          >
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{saving ? "Saving Changes..." : "Save Profile & Branding"}</span>
          </button>

          {isOnboarding && (
            <button
              type="button"
              onClick={() => router.push("/dashboard/generator")}
              className="px-6 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs rounded-2xl shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 uppercase tracking-wider transition-all cursor-pointer"
            >
              <span>Go to Question Paper Generator</span>
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
