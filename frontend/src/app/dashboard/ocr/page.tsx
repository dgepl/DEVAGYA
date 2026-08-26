"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  ScanText, 
  UploadCloud, 
  ArrowRight, 
  FileCode, 
  Sparkles, 
  Copy, 
  Check, 
  Download, 
  RefreshCw, 
  FileText,
  GraduationCap,
  X,
  Eye
} from "lucide-react";
import { scanOCRPage } from "@/lib/api";
import { useAppStore } from "@/store/useAppStore";

export default function OCRPage() {
  const [extracting, setExtracting] = useState(false);
  const [extractedText, setExtractedText] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showMobileOcrModal, setShowMobileOcrModal] = useState(false);
  const { setOcrDraftText } = useAppStore();
  const router = useRouter();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setExtracting(true);
    try {
      const res = await scanOCRPage(file);
      setExtractedText(res.extracted_text);
      setShowMobileOcrModal(true);
    } catch (err) {
      console.error("OCR Scan Error:", err);
      alert("OCR scanning failed. Please try a clear image or readable PDF document.");
    } finally {
      setExtracting(false);
    }
  };

  const handleCopy = () => {
    if (!extractedText) return;
    navigator.clipboard.writeText(extractedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadTxt = () => {
    if (!extractedText) return;
    const blob = new Blob([extractedText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "OCR_Scanned_Excerpt.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleBridgeToGenerator = () => {
    if (extractedText) {
      setOcrDraftText(extractedText);
      setShowMobileOcrModal(false);
      router.push("/dashboard/generator");
    }
  };

  const handleSendToMentorAI = () => {
    if (!extractedText) return;
    const prompt = `Here is the textbook / worksheet content extracted from the OCR Scanner. Please analyze this curriculum material, explain core concepts, and provide lesson planning and teaching strategies:\n\n${extractedText}`;
    if (typeof window !== "undefined") {
      sessionStorage.setItem("devgya_mentor_initial_prompt", prompt);
    }
    setShowMobileOcrModal(false);
    router.push(`/dashboard/agents?agent=teacher_mentor&prompt=${encodeURIComponent(prompt.slice(0, 1200))}`);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 relative pb-20 sm:pb-8">
      
      {/* HEADER */}
      <div className="bg-gradient-to-r from-indigo-900 via-purple-900 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center shrink-0">
            <ScanText className="w-6 h-6 sm:w-7 sm:h-7 text-indigo-300" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black">AI OCR Textbook & Document Scanner</h1>
            <p className="text-indigo-200 text-xs sm:text-sm">
              Extract precise text, formulas, equations, and question statements from photos and PDFs.
            </p>
          </div>
        </div>

        {extractedText && (
          <button
            onClick={() => setShowMobileOcrModal(true)}
            className="md:hidden w-full sm:w-auto px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black rounded-xl shadow-md flex items-center justify-center gap-2"
          >
            <Eye className="w-4 h-4 text-amber-300" />
            <span>View Extracted Text Studio</span>
          </button>
        )}
      </div>

      {/* STICKY BOTTOM BUTTON FOR MOBILE WHEN TEXT IS EXTRACTED */}
      {extractedText && (
        <div className="md:hidden fixed bottom-18 left-4 right-4 z-40 animate-in slide-in-from-bottom-5">
          <button
            onClick={() => setShowMobileOcrModal(true)}
            className="w-full py-3.5 px-5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-black text-xs sm:text-sm rounded-2xl shadow-2xl shadow-indigo-600/40 flex items-center justify-between border border-white/20"
          >
            <span className="flex items-center gap-2 truncate">
              <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />
              <span className="truncate">Extracted Text ({extractedText.split(/\s+/).length} words)</span>
            </span>
            <span className="bg-white/20 px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase shrink-0">Open Pop-up ↗</span>
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        
        {/* UPLOAD ZONE (LEFT) */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 flex flex-col items-center justify-center text-center relative overflow-hidden group min-h-[380px] shadow-sm hover:border-indigo-400 transition-colors">
          <input
            type="file"
            accept="image/*,.pdf,.docx,.txt"
            onChange={handleFileUpload}
            className="absolute inset-0 opacity-0 cursor-pointer z-20"
          />

          <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform font-bold">
            {extracting ? (
              <RefreshCw className="w-8 h-8 animate-spin" />
            ) : (
              <UploadCloud className="w-8 h-8 text-indigo-600" />
            )}
          </div>

          <h3 className="text-base font-black text-slate-900 mb-1">
            {extracting ? "Running AI Vision OCR Extraction..." : "Upload Textbook Photo, Worksheet or PDF"}
          </h3>
          <p className="text-xs text-slate-500 font-semibold max-w-xs mb-4">
            Supports PNG, JPG, WEBP, or PDF textbook scans (Up to 25MB)
          </p>

          <span className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-2xl shadow-md transition-all">
            {extracting ? "Processing OCR..." : "Browse File from Computer"}
          </span>
        </div>

        {/* EXTRACTED MARKDOWN RESULT (RIGHT - DESKTOP ONLY) */}
        <div className="hidden md:flex bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 flex-col justify-between space-y-4 shadow-sm min-h-[380px]">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <span className="text-xs font-black text-slate-800 flex items-center gap-2">
                <FileCode className="w-4 h-4 text-indigo-600" />
                Extracted Markdown Text
              </span>

              {extractedText && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopy}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-extrabold flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? "Copied!" : "Copy"}</span>
                  </button>

                  <button
                    onClick={handleDownloadTxt}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-extrabold flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Download className="w-3 h-3" />
                    <span>Download TXT</span>
                  </button>
                </div>
              )}
            </div>

            <textarea
              value={extractedText || ""}
              onChange={(e) => setExtractedText(e.target.value)}
              placeholder="Extracted textbook text will appear here. You can also edit or manually paste text..."
              rows={12}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed font-semibold"
            />
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
            <span className="text-xs text-slate-500 font-semibold">
              {extractedText ? `${extractedText.split(/\s+/).length} words extracted` : 'Waiting for file upload...'}
            </span>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={handleSendToMentorAI}
                disabled={!extractedText}
                className="flex-1 sm:flex-initial px-4 py-2.5 bg-indigo-50 hover:bg-indigo-100 disabled:opacity-50 text-indigo-700 font-extrabold text-xs rounded-2xl border border-indigo-200 shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                title="Send extracted textbook text to Teacher Mentor AI for lesson planning & pedagogy"
              >
                <GraduationCap className="w-4 h-4 text-indigo-600" />
                <span>Send to Teacher Mentor AI</span>
              </button>

              <button
                onClick={handleBridgeToGenerator}
                disabled={!extractedText}
                className="flex-1 sm:flex-initial px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 text-white font-extrabold text-xs rounded-2xl shadow-md shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                title="Bridge text directly to Question Paper Generator to create custom test papers"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Create Question Paper</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* FULL-SCREEN MOBILE OCR POP-UP MODAL */}
      {showMobileOcrModal && extractedText && (
        <div className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-md flex flex-col p-2 sm:p-4 pb-24 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl flex flex-col h-full overflow-hidden max-w-2xl mx-auto w-full animate-in zoom-in-95 duration-200">
            
            {/* MODAL HEADER */}
            <div className="p-4 sm:p-5 bg-gradient-to-r from-indigo-900 via-purple-900 to-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center">
                  <ScanText className="w-5 h-5 text-amber-300" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black">Extracted OCR Text Studio</h3>
                  <p className="text-[11px] text-indigo-200 font-medium">
                    {extractedText.split(/\s+/).length} Words Extracted
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowMobileOcrModal(false)}
                className="p-2 hover:bg-white/20 rounded-xl text-white transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* ACTION TOOLBAR */}
            <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-2">
              <span className="text-[11px] font-extrabold text-slate-600 flex items-center gap-1.5">
                <FileCode className="w-3.5 h-3.5 text-indigo-600" />
                Editable Text Excerpt
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-xs font-extrabold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-600" />}
                  <span>{copied ? "Copied" : "Copy"}</span>
                </button>

                <button
                  onClick={handleDownloadTxt}
                  className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-xs font-extrabold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-slate-600" />
                  <span>Download</span>
                </button>
              </div>
            </div>

            {/* TEXTAREA BODY */}
            <div className="p-4 flex-1 overflow-y-auto">
              <textarea
                value={extractedText}
                onChange={(e) => setExtractedText(e.target.value)}
                rows={12}
                className="w-full h-full min-h-[220px] bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed font-medium"
              />
            </div>

            {/* MODAL FOOTER ACTIONS */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row gap-2.5">
              <button
                onClick={handleSendToMentorAI}
                className="flex-1 py-3 px-4 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-extrabold text-xs rounded-xl border border-indigo-200 flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <GraduationCap className="w-4 h-4 text-indigo-600" />
                <span>Send to Teacher Mentor AI</span>
              </button>

              <button
                onClick={handleBridgeToGenerator}
                className="flex-1 py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Create Question Paper</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
