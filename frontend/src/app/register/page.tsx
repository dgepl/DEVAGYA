"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Lock, Mail, User, Building2, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { OTPModal } from "@/components/auth/OTPModal";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<"teacher" | "student" | "parent">("teacher");
  const [schoolName, setSchoolName] = useState("");
  const [board, setBoard] = useState("CBSE");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOTPModalOpen, setIsOTPModalOpen] = useState(false);
  const [debugCode, setDebugCode] = useState<string | null>(null);

  const { setUser } = useAppStore();
  const router = useRouter();

  const handleStartRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Step 1: Send OTP to user's email via Resend API
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api/v1";
      const res = await fetch(`${baseUrl}/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name, role })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to send verification email.");

      if (data.debug_code) {
        setDebugCode(data.debug_code);
      } else {
        setDebugCode(null);
      }

      // Open 6-digit OTP verification modal
      setIsOTPModalOpen(true);
    } catch (err: any) {
      setError(err.message || "Failed to send OTP code.");
    } finally {
      setLoading(false);
    }
  };

  const handleOTPVerified = async (otpCode: string) => {
    setIsOTPModalOpen(false);
    setLoading(true);

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api/v1";
      const res = await fetch(`${baseUrl}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          name,
          role,
          school_name: schoolName,
          board,
          otp_code: otpCode
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Registration failed.");

      setUser(data.user);

      // Redirect to correct role dashboard
      if (role === "student") router.push("/dashboard/student");
      else if (role === "parent") router.push("/dashboard/parent");
      else router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Registration completed with fallback session.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-indigo-100/60 blur-[100px] rounded-full pointer-events-none" />

      <div className="w-full max-w-lg bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-xl relative z-10 space-y-6">
        
        {/* BRAND HEADER */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center justify-center mb-1">
            <img 
              src="/logo.png" 
              alt="DEVAGYA GLOBAL PRIVATE LIMITED" 
              className="h-16 w-auto object-contain mx-auto mix-blend-multiply" 
            />
          </Link>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">Create Your Account</h1>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Join DEVAGYA AI Learning Platform</p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-bold">
            {error}
          </div>
        )}

        <form onSubmit={handleStartRegister} className="space-y-4">
          
          {/* ROLE SELECTOR PILLS */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Select Your Role</label>
            <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => setRole("teacher")}
                className={`py-2 text-xs font-bold rounded-lg transition-all ${
                  role === "teacher" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Teacher
              </button>
              <button
                type="button"
                onClick={() => setRole("student")}
                className={`py-2 text-xs font-bold rounded-lg transition-all ${
                  role === "student" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Student
              </button>
              <button
                type="button"
                onClick={() => setRole("parent")}
                className={`py-2 text-xs font-bold rounded-lg transition-all ${
                  role === "parent" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Parent
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 font-semibold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
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

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Institution / School</label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3 py-2.5 text-xs text-slate-900 font-semibold"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Board</label>
              <select
                value={board}
                onChange={(e) => setBoard(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 font-semibold"
              >
                <option value="CBSE">CBSE Board</option>
                <option value="ICSE">ICSE / ISC</option>
                <option value="STATE">State Board</option>
                <option value="IB">IB International</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
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
            Send OTP Verification Code
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
        email={email}
        name={name}
        isOpen={isOTPModalOpen}
        debugCode={debugCode}
        onClose={() => setIsOTPModalOpen(false)}
        onVerified={handleOTPVerified}
      />
    </div>
  );
}
