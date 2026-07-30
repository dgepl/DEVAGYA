"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Lock, Mail, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";

export default function LoginPage() {
  const [email, setEmail] = useState("ananya.roy@devagyaglobal.com");
  const [password, setPassword] = useState("Password@123");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<"teacher" | "student" | "parent" | "super_admin">("teacher");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { setUser } = useAppStore();
  const router = useRouter();

  const handleRoleChange = (selectedRole: "teacher" | "student" | "parent" | "super_admin") => {
    setRole(selectedRole);
    if (selectedRole === "teacher") {
      setEmail("ananya.roy@devagyaglobal.com");
    } else if (selectedRole === "student") {
      setEmail("aarav.student@devagyaglobal.com");
    } else if (selectedRole === "parent") {
      setEmail("sharma.parent@devagyaglobal.com");
    } else {
      setEmail("admin@devagyaglobal.com");
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("http://localhost:8000/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Authentication failed.");

      setUser(data.user);

      if (role === "student") router.push("/dashboard/student");
      else if (role === "parent") router.push("/dashboard/parent");
      else if (role === "super_admin") router.push("/admin");
      else router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to log in.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-indigo-100/60 blur-[100px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md bg-white p-8 rounded-3xl border border-slate-200 shadow-xl relative z-10 space-y-6">
        
        {/* LOGO ONLY */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center justify-center">
            <img 
              src="/logo.png" 
              alt="DEVAGYA GLOBAL PRIVATE LIMITED" 
              className="h-14 sm:h-16 w-auto max-h-16 object-contain mix-blend-multiply mx-auto" 
            />
          </Link>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider pt-1">Select Portal to Sign In</p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-bold">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          
          {/* PORTAL ROLE SELECTOR */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Select Your Portal</label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl border border-slate-200">
              {[
                { id: "teacher", label: "Teacher" },
                { id: "student", label: "Student" },
                { id: "parent", label: "Parent" },
                { id: "super_admin", label: "Super Admin" }
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleRoleChange(tab.id as any)}
                  className={`py-2 text-xs font-bold rounded-lg transition-all ${
                    role === tab.id
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Work / Student Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 font-semibold"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-700">Password</label>
              <Link href="/register" className="text-[11px] text-indigo-600 font-bold hover:underline">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-10 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 font-semibold"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-700"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-glow transition-all flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-4 h-4" />
            Sign In to {role.replace('_', ' ').toUpperCase()} Portal
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center pt-2 border-t border-slate-100 space-y-2">
          <p className="text-xs text-slate-500 font-semibold">
            Don&apos;t have an account yet?{" "}
            <Link href="/register" className="text-indigo-600 font-bold hover:underline">
              Create Free Account
            </Link>
          </p>
          <p className="text-xs text-slate-500 font-semibold">
            Need to register a school?{" "}
            <Link href="/onboarding" className="text-indigo-600 font-bold hover:underline">
              School Campus Setup
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}
