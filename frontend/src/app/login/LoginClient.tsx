"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Lock, Mail, Eye, EyeOff, ShieldCheck, AlertCircle, RefreshCw } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { getApiBase } from "@/lib/api";

export default function LoginClient() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<"teacher" | "student" | "parent" | "school">("teacher");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

    try {
      const baseUrl = getApiBase();
      const res = await fetch(`${baseUrl}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password, role })
      });
      
      let data: any = {};
      try {
        data = await res.json();
      } catch {
        if (!res.ok) {
          if (res.status === 502 || res.status === 503 || res.status === 504) {
            throw new Error("Backend server is currently offline or unreachable. Please ensure the backend server is running on port 8000.");
          }
          throw new Error("Unable to connect to authentication service. Please ensure the backend is running.");
        }
      }

      if (!res.ok) {
        throw new Error(data.detail || data.message || "Authentication failed. Invalid email or password.");
      }

      if (!data.user) {
        throw new Error("Invalid response from server. Login failed.");
      }

      setUser(data.user);

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
    } catch (err: any) {
      if (err?.message === "Failed to fetch") {
        setError("Unable to connect to the authentication server. Please ensure the backend service is running on port 8000.");
      } else {
        setError(err.message || "Failed to log in.");
      }
    } finally {
      setLoading(false);
    }
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
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              {role === "school" ? "Official School Email" : "Email Address"}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="email"
                value={email}
                onChange={(e) => handleEmailChange(e.target.value)}
                onKeyDown={(e) => { if (e.key === " ") e.preventDefault(); }}
                placeholder="you@domain.com (Spaces blocked)"
                required
                className="w-full bg-slate-50/80 border border-slate-200 rounded-2xl pl-10 pr-4 py-3 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white font-semibold transition-all shadow-inner"
              />
            </div>
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

        <div className="text-center pt-2 border-t border-slate-100">
          <p className="text-xs text-slate-500 font-semibold">
            {role === "school" ? "Registering a new institution?" : "Don't have an account yet?"}{" "}
            <Link href="/register" className="text-indigo-600 font-bold hover:underline">
              {role === "school" ? "Register School" : "Sign Up Free"}
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}
