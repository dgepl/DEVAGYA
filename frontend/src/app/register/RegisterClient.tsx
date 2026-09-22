"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Lock, Mail, User, Building2, Eye, EyeOff, ShieldCheck, AlertCircle, RefreshCw, Phone, MapPin } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { OTPModal } from "@/components/auth/OTPModal";
import { getApiBase } from "@/lib/api";

export default function RegisterClient() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<"teacher" | "parent" | "school">("teacher");

  // School Specific Fields
  const [schoolName, setSchoolName] = useState("");
  const [affiliationBoard, setAffiliationBoard] = useState("CBSE");
  const [city, setCity] = useState("");
  const [stateName, setStateName] = useState("");
  const [phone, setPhone] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isOTPModalOpen, setIsOTPModalOpen] = useState(false);

  const { user, setUser } = useAppStore();
  const router = useRouter();

  // Returning User Persistent Session Auto-Redirect
  useEffect(() => {
    if (user && user.email) {
      if (user.role === "student") router.replace("/dashboard/student");
      else if (user.role === "parent") router.replace("/dashboard/parent");
      else if (user.role === "school") router.replace("/dashboard/school");
      else router.replace("/dashboard");
    }
  }, [user, router]);

  const handleNameChange = (val: string) => {
    // AUTOMATICALLY BLOCK & REMOVE NUMBERS/DIGITS IN NAME
    const cleanName = val.replace(/[0-9]/g, "");
    setName(cleanName);
    if (/[0-9]/.test(val)) {
      setError("Numbers are blocked in full name.");
    } else {
      setError(null);
    }
  };

  const handleEmailChange = (val: string) => {
    // AUTOMATICALLY BLOCK & REMOVE SPACES IN EMAIL
    const cleanEmail = val.replace(/\s+/g, "");
    setEmail(cleanEmail);
    if (val.includes(" ")) {
      setError("Spaces are automatically blocked in email addresses.");
    } else {
      setError(null);
    }
  };

  const handleStartRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (email.includes(" ")) {
      setError("Email address cannot contain spaces.");
      return;
    }

    if (role === "school" && (!schoolName.trim() || !city.trim())) {
      setError("Please provide School Name and City.");
      return;
    }

    setLoading(true);
    setError(null);
    setStatusMessage(null);

    const cleanEmail = email.trim().toLowerCase();
    const primaryBase = getApiBase();
    const envBase = process.env.NEXT_PUBLIC_API_URL;
    const baseCandidates = [primaryBase];
    if (envBase && !baseCandidates.includes(envBase)) baseCandidates.push(envBase);
    if (!baseCandidates.includes("/api/v1")) baseCandidates.push("/api/v1");

    let lastError = "Unable to connect to authentication service.";
    const maxAttempts = 3;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      for (const base of baseCandidates) {
        try {
          if (attempt > 1) {
            setStatusMessage(`Waking up authentication service (Attempt ${attempt}/${maxAttempts})...`);
          }

          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 12000);

          const res = await fetch(`${base}/auth/send-otp`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: cleanEmail, name: role === "school" ? (schoolName || name) : name, role }),
            signal: controller.signal
          });
          clearTimeout(timeoutId);

          let data: any = {};
          try {
            data = await res.json();
          } catch {
            if (!res.ok) {
              if ([502, 503, 504].includes(res.status)) {
                lastError = "Backend server is waking up or reloading. Retrying...";
                continue;
              }
              lastError = "Authentication service returned an invalid response.";
              continue;
            }
          }

          if (!res.ok) {
            setError(data.detail || "Failed to send verification email.");
            setLoading(false);
            setStatusMessage(null);
            return;
          }

          // Open 6-digit OTP verification modal
          setStatusMessage(null);
          setIsOTPModalOpen(true);
          setLoading(false);
          return;
        } catch (fetchErr: any) {
          lastError = fetchErr?.name === "AbortError" 
            ? "Authentication service took too long to respond." 
            : (fetchErr?.message || "Failed to fetch");
        }
      }

      if (attempt < maxAttempts) {
        setStatusMessage(`Server is waking up. Retrying in ${attempt * 1.5}s (Attempt ${attempt}/${maxAttempts})...`);
        await new Promise((r) => setTimeout(r, attempt * 1500));
      }
    }

    setStatusMessage(null);
    setLoading(false);
    setError(
      lastError.includes("Failed to fetch") || lastError.includes("timeout") || lastError.includes("AbortError")
        ? "Unable to connect to the authentication server. The backend engine is restarting or initializing. Please retry in a moment."
        : lastError
    );
  };

  const handleOTPVerified = async (otpCode: string) => {
    setIsOTPModalOpen(false);
    setLoading(true);
    setError(null);
    setStatusMessage(null);

    const cleanEmail = email.trim().toLowerCase();
    const primaryBase = getApiBase();
    const envBase = process.env.NEXT_PUBLIC_API_URL;
    const baseCandidates = [primaryBase];
    if (envBase && !baseCandidates.includes(envBase)) baseCandidates.push(envBase);
    if (!baseCandidates.includes("/api/v1")) baseCandidates.push("/api/v1");

    let lastError = "Registration failed.";
    const maxAttempts = 3;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      for (const base of baseCandidates) {
        try {
          if (attempt > 1) {
            setStatusMessage(`Finalizing registration (Attempt ${attempt}/${maxAttempts})...`);
          }

          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 12000);

          const res = await fetch(`${base}/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: cleanEmail,
              password,
              name: role === "school" ? (name || "Principal/Administrator") : name,
              role,
              otp_code: otpCode,
              school_name: role === "school" ? schoolName.trim() : "",
              affiliation_board: affiliationBoard,
              city: city.trim(),
              state: stateName.trim(),
              contact_person: name.trim(),
              phone: phone.trim()
            }),
            signal: controller.signal
          });
          clearTimeout(timeoutId);

          let data: any = {};
          try {
            data = await res.json();
          } catch {
            if (!res.ok) {
              if ([502, 503, 504].includes(res.status)) {
                lastError = "Backend server is waking up. Retrying...";
                continue;
              }
              lastError = "Unable to connect to authentication service.";
              continue;
            }
          }

          if (!res.ok) {
            setError(data.detail || "Registration failed.");
            setLoading(false);
            setStatusMessage(null);
            return;
          }

          const registeredUser = {
            ...data.user,
            role: role,
            isProfileComplete: false
          };
          setUser(registeredUser);
          setStatusMessage(null);

          // Redirect to appropriate dashboard
          if (role === "teacher") {
            router.push("/onboarding");
          } else if (role === "parent") {
            router.push("/dashboard/parent");
          } else if (role === "school") {
            router.replace("/dashboard/school");
          } else {
            router.push("/dashboard");
          }
          return;
        } catch (fetchErr: any) {
          lastError = fetchErr?.name === "AbortError" 
            ? "Authentication service took too long to respond." 
            : (fetchErr?.message || "Failed to fetch");
        }
      }

      if (attempt < maxAttempts) {
        setStatusMessage(`Server is waking up. Retrying in ${attempt * 1.5}s...`);
        await new Promise((r) => setTimeout(r, attempt * 1500));
      }
    }

    setStatusMessage(null);
    setLoading(false);
    setError(lastError);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* BACKGROUND IMAGE WITH SUBTLE FOCUS-OPTIMIZED OVERLAY */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat pointer-events-none scale-105 filter blur-[1px] opacity-40 sm:opacity-45 transition-opacity"
        style={{ backgroundImage: "url('/images/auth_background.jpeg')" }}
      />
      <div className="fixed inset-0 bg-gradient-to-tr from-slate-950/85 via-indigo-950/75 to-slate-950/85 pointer-events-none" />

      {/* AMBIENT GLOW */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-indigo-500/10 blur-[130px] rounded-full pointer-events-none" />

      {/* REGISTER CARD WITH PRIMARY FOCUS */}
      <div className="w-full max-w-lg bg-white/95 sm:bg-white backdrop-blur-xl p-7 sm:p-10 rounded-3xl border border-white/60 sm:border-slate-200/90 shadow-2xl relative z-10 space-y-6">
        
        {/* BRAND HEADER WITH DEVGYA GLOBAL EDUTECH */}
        <div className="text-center space-y-2.5">
          <Link href="/" className="inline-flex items-center justify-center gap-2.5 sm:gap-3 group mb-1 hover:opacity-95 transition-opacity">
            <img 
              src="/logo.png" 
              alt="DEVGYA GLOBAL EDUTECH" 
              className="h-12 sm:h-14 w-auto object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-200 shrink-0" 
            />
            <div className="flex flex-col text-left justify-center leading-none select-none">
              <span className="font-black text-base sm:text-lg tracking-tight text-slate-900 font-[family-name:var(--font-outfit)] uppercase whitespace-nowrap">
                DEVGYA GLOBAL
              </span>
              <span className="font-extrabold text-[10px] sm:text-[11px] tracking-widest text-teal-700 font-[family-name:var(--font-outfit)] uppercase whitespace-nowrap mt-0.5">
                EDUTECH
              </span>
            </div>
          </Link>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {role === "school" ? "Register Your School" : "Create Your Account"}
          </h1>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">
            {role === "school" ? "School Recruitment & AI Portal" : "Join DEVGYA AI Learning Platform"}
          </p>
        </div>

        {statusMessage && (
          <div className="p-3.5 bg-indigo-50/90 border border-indigo-200 rounded-2xl text-indigo-700 text-xs font-bold flex items-center gap-2.5 shadow-sm animate-pulse">
            <RefreshCw className="w-4 h-4 shrink-0 text-indigo-600 animate-spin" />
            <span>{statusMessage}</span>
          </div>
        )}

        {error && (
          <div className="p-3.5 bg-red-50/80 border border-red-200 rounded-2xl text-red-700 text-xs font-bold flex items-center gap-2.5 shadow-sm">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleStartRegister} className="space-y-4">
          
          {/* ROLE SELECTOR PILLS (3 TABS: TEACHER, PARENT, SCHOOL) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Select Your Account Type</label>
            <div className="grid grid-cols-3 gap-1.5 p-1.5 bg-slate-100/80 rounded-2xl border border-slate-200">
              <button
                type="button"
                onClick={() => setRole("teacher")}
                className={`py-2 text-xs font-extrabold rounded-xl transition-all ${
                  role === "teacher" ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20" : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
                }`}
              >
                Teacher
              </button>
              <button
                type="button"
                onClick={() => setRole("parent")}
                className={`py-2 text-xs font-extrabold rounded-xl transition-all ${
                  role === "parent" ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20" : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
                }`}
              >
                Parent
              </button>
              <button
                type="button"
                onClick={() => setRole("school")}
                className={`py-2 text-xs font-extrabold rounded-xl transition-all ${
                  role === "school" ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20" : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
                }`}
              >
                School
              </button>
            </div>

            {/* INFORMATIVE NOTICE FOR STUDENTS */}
            <div className="mt-2.5 p-2.5 rounded-xl bg-indigo-50/70 border border-indigo-100 flex items-start gap-2 text-left">
              <span className="text-sm">🎒</span>
              <p className="text-[11px] text-indigo-900 font-medium leading-relaxed">
                <strong className="font-extrabold text-indigo-950">Student Registration:</strong> Direct student self-registration is closed. Parents create and manage student accounts with username &amp; password directly inside the <strong className="font-extrabold text-indigo-950">Parent Portal</strong>.
              </p>
            </div>
          </div>

          {/* SCHOOL SPECIFIC FIELDS */}
          {role === "school" && (
            <div className="space-y-3 p-4 bg-indigo-50/50 border border-indigo-100 rounded-2xl">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">School / Institution Name</label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    value={schoolName}
                    onChange={(e) => setSchoolName(e.target.value)}
                    placeholder="e.g. Delhi Public School, R.K. Puram"
                    required
                    className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Affiliation Board</label>
                  <select
                    value={affiliationBoard}
                    onChange={(e) => setAffiliationBoard(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 font-semibold"
                  >
                    <option value="CBSE">CBSE</option>
                    <option value="ICSE">ICSE / ISC</option>
                    <option value="State Board">State Board</option>
                    <option value="IB">IB World School</option>
                    <option value="Cambridge">Cambridge / IGCSE</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">City / District</label>
                  <div className="relative">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. New Delhi"
                      required
                      className="w-full bg-white border border-slate-200 rounded-xl pl-8 pr-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 font-semibold"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">State</label>
                  <input
                    type="text"
                    value={stateName}
                    onChange={(e) => setStateName(e.target.value)}
                    placeholder="e.g. Delhi"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Official Phone</label>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 9876543210"
                      className="w-full bg-white border border-slate-200 rounded-xl pl-8 pr-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 font-semibold"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              {role === "school" ? "Contact Person / Principal Name" : "Full Name"}
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                onKeyDown={(e) => { if (/[0-9]/.test(e.key)) e.preventDefault(); }}
                placeholder={role === "school" ? "e.g. Dr. Rajesh Kumar (Principal)" : "Enter your full name (Numbers blocked)"}
                required
                className="w-full bg-slate-50/80 border border-slate-200 rounded-2xl pl-10 pr-4 py-3 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 font-semibold shadow-inner transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              {role === "school" ? "Official School Email Address" : "Email Address"}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="email"
                value={email}
                onChange={(e) => handleEmailChange(e.target.value)}
                onKeyDown={(e) => { if (e.key === " ") e.preventDefault(); }}
                placeholder={role === "school" ? "principal@dpsrkp.edu.in" : "you@domain.com (Spaces blocked)"}
                required
                className="w-full bg-slate-50/80 border border-slate-200 rounded-2xl pl-10 pr-4 py-3 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 font-semibold shadow-inner transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                className="w-full bg-slate-50/80 border border-slate-200 rounded-2xl pl-10 pr-10 py-3 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 font-semibold shadow-inner transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-700 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs rounded-2xl shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/40 transition-all flex items-center justify-center gap-2"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin text-white" /> : <ShieldCheck className="w-4 h-4" />}
            {role === "school" ? "Register School & Verify" : "Send Verification Code"}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center pt-2 border-t border-slate-100 space-y-1">
          <p className="text-xs text-slate-500 font-semibold">
            Already have an account?{" "}
            <Link href="/login" className="text-indigo-600 font-bold hover:underline">
              Sign In
            </Link>
          </p>
          <p className="text-[11px] text-slate-400">
            Need registration help? Contact <a href="mailto:dgepl.info@gmail.com" className="text-indigo-600 font-bold hover:underline">dgepl.info@gmail.com</a>
          </p>
        </div>

      </div>

      {/* 6-DIGIT RESEND OTP MODAL */}
      <OTPModal
        email={email.trim()}
        name={role === "school" ? (schoolName || name) : name}
        isOpen={isOTPModalOpen}
        onClose={() => setIsOTPModalOpen(false)}
        onVerified={handleOTPVerified}
      />
    </div>
  );
}
