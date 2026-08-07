"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, UploadCloud, CheckCircle2, ArrowRight, ArrowLeft, BookOpen } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";

export default function SchoolOnboardingPage() {
  const [step, setStep] = useState(1);
  const [schoolName, setSchoolName] = useState("Apex International Academy");
  const [board, setBoard] = useState("CBSE");
  const [academicYear, setAcademicYear] = useState("2025-2026");
  const [principalName, setPrincipalName] = useState("Dr. Rajesh Sharma");
  const [contactEmail, setContactEmail] = useState("principal@apexacademy.edu");
  const [selectedSubjects, setSelectedSubjects] = useState(["Physics", "Chemistry", "Biology", "Mathematics"]);

  const router = useRouter();
  const { setUser } = useAppStore();

  const handleFinishOnboarding = () => {
    setUser({
      id: "usr-teacher-1",
      name: principalName,
      email: contactEmail,
      role: "teacher",
      schoolName: schoolName,
      board: board
    });
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative">
      <div className="w-full max-w-2xl glass-panel p-8 rounded-3xl border border-slate-200 shadow-sm space-y-8">
        
        {/* Step Progress Bar */}
        <div>
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-3">
            <span className="text-indigo-600">Step {step} of 3</span>
            <span>{step === 1 ? "School Basic Info" : step === 2 ? "Branding & Logo" : "Curriculum Setup"}</span>
          </div>
          <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-600 transition-all duration-300"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
        </div>

        {/* Step 1: Basic Info */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-indigo-600" />
              Register Your Institution
            </h2>
            
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Official School Name</label>
              <input
                type="text"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 font-semibold focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Education Board</label>
                <select
                  value={board}
                  onChange={(e) => setBoard(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 font-semibold focus:outline-none"
                >
                  <option value="CBSE">CBSE (Central Board)</option>
                  <option value="ICSE">ICSE / ISC</option>
                  <option value="STATE">State Board</option>
                  <option value="IB">IB International</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Academic Year</label>
                <input
                  type="text"
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 font-semibold"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Principal / Administrator Name</label>
                <input
                  type="text"
                  value={principalName}
                  onChange={(e) => setPrincipalName(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Contact Email</label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 font-semibold"
                />
              </div>
            </div>

          </div>
        )}

        {/* Step 2: Logo & Cloudinary Upload */}
        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
              <UploadCloud className="w-5 h-5 text-indigo-600" />
              School Logo & PDF Watermark
            </h2>
            <p className="text-xs text-slate-600 font-medium">
              Upload your high-res logo. This will be automatically embedded in generated Question Paper PDFs.
            </p>

            <div className="border-2 border-dashed border-slate-300 bg-white rounded-2xl p-8 flex flex-col items-center justify-center text-center space-y-3 hover:border-indigo-500 transition-colors">
              <img 
                src="/logo.png" 
                alt="DEVGYA GLOBAL EDUTECH PRIVATE LIMITED" 
                className="h-14 w-auto object-contain" 
              />
              <span className="text-xs text-slate-800 font-bold">DEVGYA GLOBAL Logo Active</span>
              <span className="text-[10px] text-slate-500">Official High-Res Branding Image</span>
            </div>
          </div>
        )}

        {/* Step 3: Curriculum Setup */}
        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-600" />
              Select Active Subjects
            </h2>
            <p className="text-xs text-slate-600 font-medium">Choose subjects your faculty will generate question papers for.</p>

            <div className="grid grid-cols-2 gap-3">
              {["Physics", "Chemistry", "Biology", "Mathematics", "English Literature", "Social Science"].map((subj) => (
                <button
                  key={subj}
                  type="button"
                  onClick={() => {
                    if (selectedSubjects.includes(subj)) {
                      setSelectedSubjects(selectedSubjects.filter(s => s !== subj));
                    } else {
                      setSelectedSubjects([...selectedSubjects, subj]);
                    }
                  }}
                  className={`p-3 text-xs font-bold rounded-xl border flex items-center justify-between transition-all ${
                    selectedSubjects.includes(subj)
                      ? "bg-indigo-50 border-indigo-500 text-indigo-700 shadow-sm"
                      : "bg-white border-slate-200 text-slate-700"
                  }`}
                >
                  <span>{subj}</span>
                  {selectedSubjects.includes(subj) && <CheckCircle2 className="w-4 h-4 text-indigo-600" />}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Wizard Controls */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-200">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="px-4 py-2.5 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
          ) : <div />}

          {step < 3 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-glow flex items-center gap-2"
            >
              Next Step <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleFinishOnboarding}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-glow flex items-center gap-2"
            >
              Complete School Setup <CheckCircle2 className="w-4 h-4" />
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
