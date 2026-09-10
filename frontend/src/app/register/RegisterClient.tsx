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
  const [role, setRole] = useState<"teacher" | "student" | "parent" | "school">("teacher");

  // School Specific Fields
  const [schoolName, setSchoolName] = useState("");
  const [affiliationBoard, setAffiliationBoard] = useState("CBSE");
  const [city, setCity] = useState("");
  const [stateName, setStateName] = useState("");
  const [phone, setPhone] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
      setError("Spaces are blocked in email addresses.");
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

    try {
      // Step 1: Send OTP to user's email via Resend API
      const baseUrl = getApiBase();
      const res = await fetch(`${baseUrl}/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), name: role === "school" ? (schoolName || name) : name, role })
      });
      let data: any = {};
      try {
        data = await res.json();
      } catch {
        if (!res.ok) {
          throw new Error("Unable to connect to authentication service. Please ensure the backend is running on port 8000.");
        }
      }
      if (!res.ok) throw new Error(data.detail || "Failed to send verification email.");

      // Open 6-digit OTP verification modal
      setIsOTPModalOpen(true);
    } catch (err: any) {
      if (err?.message === "Failed to fetch" || err?.message?.includes("fetch")) {
        setError("Unable to connect to the authentication server. Please ensure the backend service is running on port 8000.");
      } else {
        setError(err.message || "Failed to send OTP code.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOTPVerified = async (otpCode: string) => {
    setIsOTPModalOpen(false);
    setLoading(true);

    try {
      const baseUrl = getApiBase();
      const res = await fetch(`${baseUrl}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
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
        })
      });
      let data: any = {};
      try {
        data = await res.json();
      } catch {
        if (!res.ok) {
          throw new Error("Unable to connect to authentication service. Please ensure the backend is running on port 8000.");
        }
      }
      if (!res.ok) throw new Error(data.detail || "Registration failed.");

      const registeredUser = {
        ...data.user,
        isProfileComplete: false
      };
      setUser(registeredUser);

      // Redirect to appropriate dashboard
      if (role === "teacher") {
        router.push("/onboarding");
      } else if (role === "student") {
        router.push("/dashboard/student");
      } else if (role === "parent") {
        router.push("/dashboard/parent");
      } else if (role === "school") {
        router.push("/dashboard/school");
      } else {
        router.push("/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-indigo-100/60 blur-[100px] rounded-full pointer-events-none" />

      <div className="w-full max-w-lg bg-white p-8 sm:p-10 rounded-3xl border border-slate-200/80 shadow-2xl relative z-10 space-y-6">
        
        {/* BRAND HEADER */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center justify-center mb-1">
            <img 
              src="/logo.png" 
              alt="DEVGYA GLOBAL EDUTECH PRIVATE LIMITED" 
              className="h-16 w-auto object-contain mx-auto mix-blend-multiply" 
            />
          </Link>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">
            {role === "school" ? "Register Your School" : "Create Your Account"}
          </h1>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">
            {role === "school" ? "School Recruitment & AI Portal" : "Join DEVGYA AI Learning Platform"}
          </p>
        </div>

        {error && (
          <div className="p-3.5 bg-red-50/80 border border-red-200 rounded-2xl text-red-700 text-xs font-bold flex items-center gap-2.5 shadow-sm">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleStartRegister} className="space-y-4">
          
          {/* ROLE SELECTOR PILLS (4 TABS) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Select Your Role</label>
            <div className="grid grid-cols-4 gap-1 p-1.5 bg-slate-100/80 rounded-2xl border border-slate-200">
              <button
                type="button"
                onClick={() => setRole("teacher")}
                className={`py-2 text-[11px] font-extrabold rounded-xl transition-all ${
                  role === "teacher" ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20" : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
                }`}
              >
                Teacher
              </button>
              <button
                type="button"
                onClick={() => setRole("student")}
                className={`py-2 text-[11px] font-extrabold rounded-xl transition-all ${
                  role === "student" ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20" : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
                }`}
              >
                Student
              </button>
              <button
                type="button"
                onClick={() => setRole("parent")}
                className={`py-2 text-[11px] font-extrabold rounded-xl transition-all ${
                  role === "parent" ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20" : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
                }`}
              >
                Parent
              </button>
              <button
                type="button"
                onClick={() => setRole("school")}
                className={`py-2 text-[11px] font-extrabold rounded-xl transition-all ${
                  role === "school" ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20" : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
                }`}
              >
                School
              </button>
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

        <div className="text-center pt-2 border-t border-slate-100">
          <p className="text-xs text-slate-500 font-semibold">
            Already have an account?{" "}
            <Link href="/login" className="text-indigo-600 font-bold hover:underline">
              Sign In
            </Link>
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
