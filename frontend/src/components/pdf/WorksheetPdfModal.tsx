"use client";

import { useState } from "react";
import { 
  FileText, 
  Download, 
  X, 
  Palette, 
  Check, 
  Type, 
  Building2, 
  RefreshCw
} from "lucide-react";
import { downloadWorksheetPDF, GenerateWorksheetPdfPayload } from "@/lib/api";
import { useAppStore } from "@/store/useAppStore";

interface WorksheetPdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialContent: string;
  defaultTitle?: string;
  defaultSubject?: string;
  defaultClass?: string;
}

const THEMES = [
  {
    id: "cbse",
    name: "CBSE / NCERT Official",
    desc: "Classic publication layout with deep navy borders and formal typography",
    primaryColor: "bg-blue-900",
    accentColor: "bg-blue-500",
    badge: "Official Standard"
  },
  {
    id: "modern",
    name: "Modern Academic",
    desc: "Sleek Indigo & Cyan accents with clean section headers and pill badges",
    primaryColor: "bg-indigo-600",
    accentColor: "bg-cyan-500",
    badge: "Most Popular"
  },
  {
    id: "minimalist",
    name: "Eco Minimalist",
    desc: "High-density clean layout designed to save paper and printer ink for large classes",
    primaryColor: "bg-slate-900",
    accentColor: "bg-slate-500",
    badge: "Ink & Paper Saver"
  },
  {
    id: "emerald",
    name: "Emerald Eco",
    desc: "Fresh botanical green palette ideal for Science, Biology, and interactive exercises",
    primaryColor: "bg-emerald-800",
    accentColor: "bg-emerald-500",
    badge: "Science & Nature"
  }
];

export function WorksheetPdfModal({
  isOpen,
  onClose,
  initialContent,
  defaultTitle = "Academic Overview & Study Notes",
  defaultSubject = "Science",
  defaultClass = "Class 10"
}: WorksheetPdfModalProps) {
  const user = useAppStore((s) => s.user);

  const [title, setTitle] = useState(defaultTitle);
  const [subject, setSubject] = useState(user.subject || defaultSubject);
  const [className, setClassName] = useState(user.classes || defaultClass);
  const [chapter, setChapter] = useState("Curriculum Notes");
  const [theme, setTheme] = useState<"cbse" | "modern" | "minimalist" | "emerald">("cbse");
  const [fontSize, setFontSize] = useState<"compact" | "standard" | "large">("standard");
  const [includeHeaderBar, setIncludeHeaderBar] = useState(true);
  const [schoolName, setSchoolName] = useState(user.schoolName || "DEVGYA GLOBAL ACADEMY");
  const [generating, setGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDownload = async () => {
    setGenerating(true);
    setErrorMsg(null);
    try {
      const payload: GenerateWorksheetPdfPayload = {
        title: title.trim() || "Academic Document",
        subject: subject.trim() || "General",
        class_name: className.trim() || "Class 10",
        chapter: chapter.trim() || "Curriculum",
        content: initialContent,
        theme,
        font_size: fontSize,
        include_student_header: includeHeaderBar,
        school_name: schoolName.trim() || "DEVGYA GLOBAL EDUTECH",
        school_logo: user.schoolLogo
      };

      await downloadWorksheetPDF(payload);
      onClose();
    } catch (err: any) {
      console.error("Failed to generate PDF:", err);
      setErrorMsg(err.message || "Failed to generate PDF. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* MODAL HEADER */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-indigo-50/80 via-white to-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/30">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                PDF Document Studio
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-md">
                  A4 Print Ready
                </span>
              </h2>
              <p className="text-xs text-slate-500 font-semibold mt-0.5">Customize styling, themes, and branding for publication</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* MODAL BODY */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs font-semibold">
          
          {errorMsg && (
            <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs font-bold">
              {errorMsg}
            </div>
          )}

          {/* 1. DOCUMENT METADATA */}
          <div className="space-y-3">
            <label className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-indigo-600" />
              Document Titles & Classification
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <span className="text-[11px] text-slate-500 font-bold">Document Title</span>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold focus:outline-none focus:border-indigo-500 focus:bg-white"
                  placeholder="e.g. Chemistry Overview & Study Guide"
                />
              </div>
              <div className="space-y-1">
                <span className="text-[11px] text-slate-500 font-bold">Subject & Class</span>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold focus:outline-none focus:border-indigo-500 focus:bg-white"
                    placeholder="Subject"
                  />
                  <input
                    type="text"
                    value={className}
                    onChange={(e) => setClassName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold focus:outline-none focus:border-indigo-500 focus:bg-white"
                    placeholder="Class"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 2. THEME SELECTION */}
          <div className="space-y-3">
            <label className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Palette className="w-4 h-4 text-indigo-600" />
              Select PDF Styling Theme
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {THEMES.map((th) => (
                <button
                  key={th.id}
                  type="button"
                  onClick={() => setTheme(th.id as any)}
                  className={`p-3.5 rounded-2xl border text-left transition-all relative flex flex-col justify-between cursor-pointer ${
                    theme === th.id
                      ? "border-indigo-600 bg-indigo-50/50 shadow-sm ring-2 ring-indigo-500/20"
                      : "border-slate-200 hover:border-slate-300 hover:bg-slate-50/60 bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-1">
                        <div className={`w-3.5 h-3.5 rounded-full ${th.primaryColor} border border-white`} />
                        <div className={`w-3.5 h-3.5 rounded-full ${th.accentColor} border border-white`} />
                      </div>
                      <span className="text-xs font-black text-slate-900">{th.name}</span>
                    </div>
                    {theme === th.id && (
                      <span className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-500 font-medium leading-relaxed">{th.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* 3. LAYOUT & DENSITY CONTROLS */}
          <div className="space-y-3">
            <label className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Type className="w-4 h-4 text-indigo-600" />
              Typography & Header Settings
            </label>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Font Size Scaling */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                <span className="text-[11px] font-bold text-slate-800 block">Font Spacing & Density</span>
                <div className="grid grid-cols-3 gap-1.5 bg-slate-200/60 p-1 rounded-xl">
                  {[
                    { id: "compact", label: "Compact" },
                    { id: "standard", label: "Standard" },
                    { id: "large", label: "Large" }
                  ].map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setFontSize(f.id as any)}
                      className={`py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                        fontSize === f.id
                          ? "bg-white text-indigo-700 shadow-xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Header Details Bar Checkbox */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center">
                <label className="flex items-center gap-2.5 cursor-pointer w-full">
                  <input
                    type="checkbox"
                    checked={includeHeaderBar}
                    onChange={(e) => setIncludeHeaderBar(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
                  />
                  <div className="flex-1">
                    <span className="text-xs font-bold text-slate-900 block">Include Subject & Session Header</span>
                    <span className="text-[10px] text-slate-500 font-medium">Adds Subject, Class, and Academic Session badge bar</span>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* 4. SCHOOL BRANDING */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase text-slate-700 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-indigo-600" />
                School / Institution Branding
              </span>
              {user.schoolLogo ? (
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md font-bold">
                  ✓ Custom Logo Attached
                </span>
              ) : (
                <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded-md font-bold">
                  Standard Seal
                </span>
              )}
            </div>
            <input
              type="text"
              value={schoolName}
              onChange={(e) => setSchoolName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 font-bold focus:outline-none focus:border-indigo-500"
              placeholder="e.g. DELHI PUBLIC SCHOOL RK PURAM"
            />
          </div>

        </div>

        {/* MODAL FOOTER */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/80 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 border border-slate-200 hover:bg-slate-100 text-slate-600 font-bold text-xs rounded-xl transition-all cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleDownload}
            disabled={generating}
            className="px-7 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-black text-xs rounded-xl shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all cursor-pointer active:scale-95"
          >
            {generating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Compiling A4 PDF...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Download PDF Document</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
