"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Building2, 
  ShieldCheck, 
  Clock, 
  ShieldAlert, 
  MapPin, 
  Phone, 
  Mail, 
  CheckCircle2, 
  AlertCircle, 
  Upload, 
  Save, 
  ArrowLeft,
  RefreshCw,
  LogOut,
  HelpCircle
} from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { getApiBase } from "@/lib/api";
import { MobileSchoolHeader } from "@/components/school/MobileSchoolHeader";

interface SchoolData {
  id: string;
  school_name: string;
  email: string;
  phone: string;
  affiliation_board: string;
  city: string;
  state: string;
  contact_person: string;
  address: string;
  logo_url: string;
  verification_status: "pending_verification" | "verified" | "rejected";
  verification_notes?: string;
  verified_at?: string;
  created_at: string;
}

export default function SchoolProfilePage() {
  const { user, setUser, logout } = useAppStore();
  const router = useRouter();

  const [school, setSchool] = useState<SchoolData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Form fields
  const [schoolName, setSchoolName] = useState("");
  const [affiliationBoard, setAffiliationBoard] = useState("CBSE");
  const [phone, setPhone] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [address, setAddress] = useState("");
  const [logoUrl, setLogoUrl] = useState("");

  const fetchSchoolProfile = async () => {
    if (!user?.email) return;
    setLoading(true);
    try {
      const baseUrl = getApiBase();
      const res = await fetch(`${baseUrl}/recruitment/schools/me?email=${encodeURIComponent(user.email.trim().toLowerCase())}`);
      if (res.ok) {
        const data = await res.json();
        if (data.school) {
          const s = data.school;
          setSchool(s);
          setSchoolName(s.school_name || "");
          setAffiliationBoard(s.affiliation_board || "CBSE");
          setPhone(s.phone || "");
          setContactPerson(s.contact_person || "");
          setCity(s.city || "");
          setState(s.state || "");
          setAddress(s.address || "");
          setLogoUrl(s.logo_url || "");
        }
      }
    } catch (e) {
      console.error("Failed to fetch school profile", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchoolProfile();
  }, [user?.email]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        setLogoUrl(uploadEvent.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.email) return;
    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      const baseUrl = getApiBase();
      const res = await fetch(`${baseUrl}/recruitment/schools/me`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email.trim().toLowerCase(),
          school_name: schoolName.trim(),
          affiliation_board: affiliationBoard,
          phone: phone.trim(),
          contact_person: contactPerson.trim(),
          city: city.trim(),
          state: state.trim(),
          address: address.trim(),
          logo_url: logoUrl
        })
      });

      const data = await res.json();
      if (res.ok) {
        setSchool(data.school);
        setUser({
          ...user,
          schoolName: data.school.school_name,
          affiliationBoard: data.school.affiliation_board,
          schoolCity: data.school.city,
          schoolState: data.school.state,
          contactPerson: data.school.contact_person
        });
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        setSaveError(data.detail || "Failed to update profile.");
      }
    } catch (err: any) {
      setSaveError(err.message || "Failed to save institutional profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = () => {
    logout();
    if (typeof window !== "undefined") {
      window.location.replace("/login");
    }
  };

  if (loading && !school) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-3">
        <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-bold text-slate-500">Loading School Profile...</p>
      </div>
    );
  }

  const isVerified = school?.verification_status === "verified";
  const isPending = school?.verification_status === "pending_verification";

  return (
    <div className="space-y-4 pb-28">
      {/* MOBILE HEADER */}
      <MobileSchoolHeader school={school} onRefresh={fetchSchoolProfile} />

      {/* BACK & TITLE ROW */}
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard/school"
          className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 p-1"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Portal</span>
        </Link>

        <button
          onClick={handleSignOut}
          className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl flex items-center gap-1 cursor-pointer transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* VERIFICATION BADGE CARD */}
      <div className={`p-4 rounded-3xl border ${
        isVerified 
          ? "bg-emerald-50/80 border-emerald-200 text-emerald-950" 
          : "bg-amber-50/80 border-amber-200 text-amber-950"
      }`}>
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
            isVerified ? "bg-emerald-100 text-emerald-600" : "bg-amber-100 text-amber-600"
          }`}>
            {isVerified ? <ShieldCheck className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-xs font-black uppercase tracking-wider">
              {isVerified ? "Verified Institution" : "Verification In Progress"}
            </h3>
            <p className="text-xs mt-0.5 leading-relaxed opacity-90">
              {isVerified 
                ? "Your school is officially verified on DEVGYA. Teachers can find your school and apply to active vacancies."
                : "Your account is under admin review. Once verified, your teaching vacancies and candidate applications will unlock."}
            </p>
            {school?.verification_notes && (
              <p className="text-[11px] font-bold mt-1.5 pt-1.5 border-t border-amber-200/60">
                Admin Note: {school.verification_notes}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* FORM CARD */}
      <form onSubmit={handleSaveProfile} className="bg-white rounded-3xl border border-slate-200/90 p-5 space-y-4 shadow-xs">
        <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
          <Building2 className="w-4 h-4 text-indigo-600" />
          Institutional Information
        </h3>

        {saveSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-bold text-emerald-700 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
            <span>School profile updated successfully!</span>
          </div>
        )}

        {saveError && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs font-bold text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{saveError}</span>
          </div>
        )}

        {/* LOGO PREVIEW & UPLOAD */}
        <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-2xl border border-slate-100">
          <div className="w-14 h-14 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 overflow-hidden border border-indigo-200 shadow-2xs">
            {logoUrl ? (
              <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              <Building2 className="w-7 h-7" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <label className="block text-xs font-bold text-slate-800 mb-1">School Logo</label>
            <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-extrabold text-indigo-600 hover:bg-slate-50 cursor-pointer shadow-2xs">
              <Upload className="w-3.5 h-3.5" />
              <span>Change Logo</span>
              <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
            </label>
          </div>
        </div>

        {/* SCHOOL NAME */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">School / Institution Name *</label>
          <input
            type="text"
            value={schoolName}
            onChange={(e) => setSchoolName(e.target.value)}
            required
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 font-semibold focus:outline-none focus:border-indigo-600"
          />
        </div>

        {/* AFFILIATION BOARD & CONTACT PERSON */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Affiliation Board *</label>
            <select
              value={affiliationBoard}
              onChange={(e) => setAffiliationBoard(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 font-semibold focus:outline-none focus:border-indigo-600"
            >
              <option value="CBSE">CBSE</option>
              <option value="ICSE">ICSE</option>
              <option value="State Board">State Board</option>
              <option value="IB / International">IB / International</option>
              <option value="Cambridge">Cambridge</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Contact Person</label>
            <input
              type="text"
              value={contactPerson}
              onChange={(e) => setContactPerson(e.target.value)}
              placeholder="e.g. Dr. Rajesh Sharma"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 font-semibold focus:outline-none focus:border-indigo-600"
            />
          </div>
        </div>

        {/* PHONE & EMAIL */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Official Phone</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 9876543210"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 font-semibold focus:outline-none focus:border-indigo-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Official Email</label>
            <input
              type="email"
              value={school?.email || user?.email || ""}
              disabled
              className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-500 font-semibold cursor-not-allowed"
            />
          </div>
        </div>

        {/* CITY & STATE */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">City</label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="e.g. New Delhi"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 font-semibold focus:outline-none focus:border-indigo-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">State</label>
            <input
              type="text"
              value={state}
              onChange={(e) => setState(e.target.value)}
              placeholder="e.g. Delhi"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 font-semibold focus:outline-none focus:border-indigo-600"
            />
          </div>
        </div>

        {/* FULL ADDRESS */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Campus / Institution Address</label>
          <textarea
            rows={2}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Complete street address, sector, landmark, pincode"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 font-semibold focus:outline-none focus:border-indigo-600"
          />
        </div>

        {/* SUBMIT BUTTON */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 cursor-pointer transition-all"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? "Saving Changes..." : "Save Institutional Profile"}</span>
          </button>
        </div>
      </form>

      {/* SUPPORT FOOTER */}
      <div className="text-center p-4 bg-indigo-50/50 border border-indigo-100 rounded-2xl text-xs text-indigo-950 flex items-center justify-center gap-2">
        <HelpCircle className="w-4 h-4 text-indigo-600 shrink-0" />
        <span>Need help with school setup? Contact <strong>contact@devgya.in</strong></span>
      </div>
    </div>
  );
}
