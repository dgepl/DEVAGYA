"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  ShieldCheck, 
  Building2, 
  Users, 
  Cpu, 
  Sparkles, 
  Lock, 
  User, 
  Search, 
  Trash2, 
  UserCheck, 
  UserX, 
  RefreshCw, 
  AlertCircle,
  CheckCircle2
} from "lucide-react";

export default function SuperAdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminUser, setAdminUser] = useState("");
  const [adminPass, setAdminPass] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loadingLogin, setLoadingLogin] = useState(false);

  const [stats, setStats] = useState<any>(null);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [loadingData, setLoadingData] = useState(false);
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoadingLogin(true);

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api/v1";
      const res = await fetch(`${baseUrl}/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: adminUser.trim(), password: adminPass.trim() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Authentication failed.");

      setIsAuthenticated(true);
      fetchAdminData();
    } catch (err: any) {
      setLoginError(err.message || "Invalid Admin Credentials.");
    } finally {
      setLoadingLogin(false);
    }
  };

  const fetchAdminData = async () => {
    setLoadingData(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api/v1";
      const res = await fetch(`${baseUrl}/admin/stats`);
      const data = await res.json();
      setStats(data.metrics);
      if (data.profiles) {
        setUsersList(data.profiles);
      }
    } catch (e) {
      console.error("Error fetching admin stats", e);
    } finally {
      setLoadingData(false);
    }
  };

  const handleDeleteUser = async (userId: string, userEmail: string) => {
    if (!confirm(`Are you sure you want to delete user ${userEmail}?`)) return;
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api/v1";
      const res = await fetch(`${baseUrl}/admin/users/${userId}`, { method: "DELETE" });
      if (res.ok) {
        setActionMsg(`User ${userEmail} deleted successfully.`);
        setUsersList(usersList.filter(u => u.id !== userId));
        setTimeout(() => setActionMsg(null), 4000);
      }
    } catch (e) {
      alert("Failed to delete user.");
    }
  };

  // Filtered profiles
  const filteredUsers = usersList.filter((u) => {
    const matchesSearch = 
      (u.full_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.email || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = filterRole === "all" || u.role === filterRole;
    return matchesSearch && matchesRole;
  });

  // Admin Auth Gate
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-indigo-600/20 blur-[120px] rounded-full pointer-events-none" />

        <div className="w-full max-w-md bg-slate-800/90 border border-slate-700 p-8 sm:p-10 rounded-3xl shadow-2xl relative z-10 space-y-6 text-white backdrop-blur-xl">
          
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center mx-auto mb-3 shadow-inner">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-black tracking-tight">Super Admin Portal</h1>
            <p className="text-xs text-slate-400 font-semibold">Enter your administrative credentials to continue</p>
          </div>

          {loginError && (
            <div className="p-3.5 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-300 text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">Admin Username</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  value={adminUser}
                  onChange={(e) => setAdminUser(e.target.value)}
                  placeholder="admin"
                  required
                  className="w-full bg-slate-900/80 border border-slate-700 rounded-2xl pl-10 pr-4 py-3 text-xs text-white focus:outline-none focus:border-indigo-500 font-semibold transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">Admin Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  value={adminPass}
                  onChange={(e) => setAdminPass(e.target.value)}
                  placeholder="admin123"
                  required
                  className="w-full bg-slate-900/80 border border-slate-700 rounded-2xl pl-10 pr-4 py-3 text-xs text-white focus:outline-none focus:border-indigo-500 font-semibold transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loadingLogin}
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs rounded-2xl shadow-lg shadow-indigo-600/40 transition-all flex items-center justify-center gap-2"
            >
              {loadingLogin ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
              Access Admin Control Panel
            </button>
          </form>

          <div className="text-center pt-2 border-t border-slate-700/50 text-[11px] text-slate-400 font-mono">
            Default Credentials: admin / admin123
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto p-4 sm:p-6">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-7 h-7 text-indigo-600" />
            Super Admin Control Panel
          </h1>
          <p className="text-xs text-slate-500 font-semibold">Live Supabase Cloud Database & User Access Control</p>
        </div>

        <button
          onClick={() => fetchAdminData()}
          disabled={loadingData}
          className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-bold text-xs rounded-xl flex items-center gap-2 transition-all shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loadingData ? "animate-spin" : ""}`} />
          Refresh Live Data
        </button>
      </div>

      {actionMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-700 text-xs font-bold flex items-center gap-2 shadow-sm">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{actionMsg}</span>
        </div>
      )}

      {/* METRICS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-indigo-600">
            <Users className="w-5 h-5" />
            <span className="text-[10px] uppercase font-bold bg-indigo-50 px-2 py-0.5 rounded-full">Total Profiles</span>
          </div>
          <p className="text-3xl font-black text-slate-900">{stats?.total_users || usersList.length}</p>
          <p className="text-xs text-slate-500 font-medium">Registered Accounts</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-cyan-600">
            <UserCheck className="w-5 h-5" />
            <span className="text-[10px] uppercase font-bold bg-cyan-50 px-2 py-0.5 rounded-full">Teachers</span>
          </div>
          <p className="text-3xl font-black text-slate-900">{stats?.teachers_count || usersList.filter(u=>u.role==="teacher").length}</p>
          <p className="text-xs text-slate-500 font-medium">Licensed Educators</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-emerald-600">
            <Sparkles className="w-5 h-5" />
            <span className="text-[10px] uppercase font-bold bg-emerald-50 px-2 py-0.5 rounded-full">Students</span>
          </div>
          <p className="text-3xl font-black text-slate-900">{stats?.students_count || usersList.filter(u=>u.role==="student").length}</p>
          <p className="text-xs text-slate-500 font-medium">Learners Onboarded</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-purple-600">
            <Building2 className="w-5 h-5" />
            <span className="text-[10px] uppercase font-bold bg-purple-50 px-2 py-0.5 rounded-full">Parents</span>
          </div>
          <p className="text-3xl font-black text-slate-900">{stats?.parents_count || usersList.filter(u=>u.role==="parent").length}</p>
          <p className="text-xs text-slate-500 font-medium">Parent Portals</p>
        </div>
      </div>

      {/* USER MANAGEMENT PANEL */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-lg font-black text-slate-900">Registered Supabase Profiles</h3>
            <p className="text-xs text-slate-500 font-medium">Manage user permissions and access status</p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* SEARCH */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search email or name..."
                className="bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 font-semibold focus:outline-none focus:border-indigo-600 w-48 sm:w-64"
              />
            </div>

            {/* ROLE FILTER */}
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 font-bold focus:outline-none focus:border-indigo-600 cursor-pointer"
            >
              <option value="all">All Roles</option>
              <option value="teacher">Teachers</option>
              <option value="student">Students</option>
              <option value="parent">Parents</option>
            </select>
          </div>
        </div>

        {/* PROFILES TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-800">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider font-extrabold border-b border-slate-200">
              <tr>
                <th className="p-3">User Profile</th>
                <th className="p-3">Email Address</th>
                <th className="p-3">Role</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400 font-semibold">
                    No user profiles found matching filters.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3 font-bold text-slate-900 flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-black flex items-center justify-center text-xs">
                        {(u.full_name || u.email || "U")[0].toUpperCase()}
                      </div>
                      <span>{u.full_name || "Registered User"}</span>
                    </td>
                    <td className="p-3 font-mono text-slate-600">{u.email}</td>
                    <td className="p-3">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        u.role === "teacher" ? "bg-indigo-50 text-indigo-700 border border-indigo-200" :
                        u.role === "student" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" :
                        "bg-purple-50 text-purple-700 border border-purple-200"
                      }`}>
                        {u.role || "User"}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        Active
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => handleDeleteUser(u.id, u.email)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete User Profile"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
