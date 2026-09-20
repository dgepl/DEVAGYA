"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Lock, Mail, User, Eye, EyeOff, ShieldCheck, AlertCircle, RefreshCw } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { getApiBase } from "@/lib/api";

export default function LoginClient() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<"teacher" | "student" | "parent" | "school">("teacher");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const { user, setUser, logout } = useAppStore();
  const router = useRouter();

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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (email.includes(" ")) {
      setError("Email address cannot contain spaces.");
      return;
    }

    setLoading(true);
    setError(null);
    setStatusMessage(null);

    const cleanEmail = email.trim().toLowerCase();
    const primaryBase = getApiBase();
    const envBase = process.env.NEXT_PUBLIC_API_URL;
    
    // Candidate endpoints to try
    const baseCandidates = [primaryBase];
    if (envBase && !baseCandidates.includes(envBase)) {
      baseCandidates.push(envBase);
    }
    if (!baseCandidates.includes("/api/v1")) {
      baseCandidates.push("/api/v1");
    }

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

          const res = await fetch(`${base}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: cleanEmail, password, role }),
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
            // Business logic errors (e.g. invalid credentials) shouldn't retry
            setError(data.detail || data.message || "Authentication failed. Invalid email or password.");
            setLoading(false);
            setStatusMessage(null);
            return;
          }

          if (!data.user) {
            lastError = "Invalid response from server. Login failed.";
            continue;
          }

          // Successful authentication
          setUser(data.user);
          setStatusMessage(null);

          if (role === "student") router.push("/dashboard/student");
          else if (role === "parent") router.push("/dashboard/parent");
          else if (role === "school") router.push("/dashboard/school");
          else {
            if (!data.user.schoolName || !data.user.subject || data.user.isProfileComplete === false) {
              router.push("/dashboard/profile?onboarding=true");
            } else {
              router.push("/dashboard");
            }
          }
          return;
        } catch (fetchErr: any) {
          lastError = fetchErr?.name === "AbortError" 
            ? "Authentication service took too long to respond." 
            : (fetchErr?.message || "Failed to fetch");
        }
      }

      // If attempts remain, wait before retrying (exponential backoff)
      if (attempt < maxAttempts) {
        setStatusMessage(`Server is waking up. Retrying connection in ${attempt * 1.5}s (Attempt ${attempt}/${maxAttempts})...`);
        await new Promise((resolve) => setTimeout(resolve, attempt * 1500));
      }
    }

    setStatusMessage(null);
    setLoading(false);
    setError(
      lastError.includes("Failed to fetch") || lastError.includes("timeout") || lastError.includes("AbortError")
        ? "Unable to connect to the authentication server. The backend engine is restarting or initializing. Please retry in a few moments."
        : lastError
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-indigo-100/60 blur-[100px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md bg-white p-8 sm:p-10 rounded-3xl border border-slate-200/80 shadow-2xl relative z-10 space-y-6">
        
        {/* LOGO BRANDING */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center justify-center mb-1">
            <img 
              src="/logo.png" 
              alt="DEVGYA GLOBAL EDUTECH PRIVATE LIMITED" 
              className="h-16 w-auto object-contain mx-auto mix-blend-multiply" 
            />
          </Link>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">Sign In to DEVGYA</h1>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">CBSE & NCERT AI Education Portal</p>
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

        <form onSubmit={handleLogin} className="space-y-5">
          
          {/* ROLE SELECTOR (TEACHER, STUDENT, PARENT, SCHOOL) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Select Account Role</label>
            <div className="grid grid-cols-4 gap-1 p-1.5 bg-slate-100/80 rounded-2xl border border-slate-200">
              {[
                { id: "teacher", label: "Teacher" },
                { id: "student", label: "Student" },
                { id: "parent", label: "Parent" },
                { id: "school", label: "School" }
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setRole(tab.id as any)}
                  className={`py-2 text-[11px] font-extrabold rounded-xl transition-all ${
                    role === tab.id
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-700">
                {role === "student" ? "Student Username" : role === "school" ? "Official School Email" : "Email Address"}
              </label>
              {role === "student" && (
                <span className="text-[10px] text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded-md">
                  No Email Needed
                </span>
              )}
            </div>
            <div className="relative">
              {role === "student" ? (
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              ) : (
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              )}
              <input
                type={role === "student" ? "text" : "email"}
                value={email}
                onChange={(e) => handleEmailChange(e.target.value)}
                onKeyDown={(e) => { if (e.key === " ") e.preventDefault(); }}
                placeholder={role === "student" ? "Enter your student username (e.g. aryan_sharma)" : "you@domain.com (Spaces blocked)"}
                required
                className="w-full bg-slate-50/80 border border-slate-200 rounded-2xl pl-10 pr-4 py-3 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white font-semibold transition-all shadow-inner"
              />
            </div>
            {role === "student" && (
              <p className="text-[11px] text-slate-500 mt-1.5 pl-1">
                Tip: Enter your unique username created by your parent in the Parent Portal.
              </p>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-700">Password</label>
              <Link href="/forgot-password" className="text-xs text-indigo-600 font-bold hover:underline">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                className="w-full bg-slate-50/80 border border-slate-200 rounded-2xl pl-10 pr-10 py-3 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white font-semibold transition-all shadow-inner"
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
            Sign In to {role === "school" ? "School Portal" : "DEVGYA"}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center pt-2 border-t border-slate-100 space-y-1">
          <p className="text-xs text-slate-500 font-semibold">
            {role === "school" ? "Registering a new institution?" : "Don't have an account yet?"}{" "}
            <Link href="/register" className="text-indigo-600 font-bold hover:underline">
              {role === "school" ? "Register School" : "Sign Up Free"}
            </Link>
          </p>
          <p className="text-[11px] text-slate-400">
            Need login assistance? Contact <a href="mailto:dgepl.info@gmail.com" className="text-indigo-600 font-bold hover:underline">dgepl.info@gmail.com</a>
          </p>
        </div>

      </div>
    </div>
  );
}
