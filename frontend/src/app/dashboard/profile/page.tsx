"use client";

import { useState } from "react";
import { User, Save } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";

export default function ProfilePage() {
  const { user, setUser } = useAppStore();

  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [schoolName, setSchoolName] = useState(user.schoolName);
  const [board, setBoard] = useState(user.board);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setUser({ ...user, name, email, schoolName, board });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-3xl space-y-8">
      
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
          <User className="w-6 h-6 text-indigo-600" />
          School Branding & Profile Settings
        </h1>
        <p className="text-xs text-slate-500 font-semibold">Manage your institution details, official logo, and teacher credentials</p>
      </div>

      {saved && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold rounded-2xl">
          Profile & Branding settings saved successfully!
        </div>
      )}

      <form onSubmit={handleSave} className="glass-panel p-8 rounded-3xl border border-slate-200 space-y-6 shadow-sm">
        
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-2">Teacher Info</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 font-semibold"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t border-slate-200">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-2">School Branding (PDF Header)</h2>
          
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Institution Name</label>
            <input
              type="text"
              value={schoolName}
              onChange={(e) => setSchoolName(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Education Board</label>
            <input
              type="text"
              value={board}
              onChange={(e) => setBoard(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">School Logo (Cloudinary Storage)</label>
            <div className="border border-dashed border-slate-300 bg-slate-50 p-6 rounded-2xl flex items-center justify-center gap-4">
              <img 
                src="/logo.png" 
                alt="DEVAGYA GLOBAL PRIVATE LIMITED" 
                className="h-12 w-auto object-contain" 
              />
              <div>
                <p className="text-xs font-bold text-slate-900">DEVAGYA GLOBAL Official Logo</p>
                <p className="text-[10px] text-slate-500 font-medium">Used for official PDF headers and watermarks</p>
              </div>
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-glow transition-all flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          Save Changes
        </button>

      </form>

    </div>
  );
}
