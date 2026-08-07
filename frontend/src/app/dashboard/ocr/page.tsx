"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ScanText, UploadCloud, ArrowRight, FileCode, Sparkles, Copy, Check, Download, RefreshCw, FileText } from "lucide-react";
import { scanOCRPage } from "@/lib/api";
import { useAppStore } from "@/store/useAppStore";

export default function OCRPage() {
  const [extracting, setExtracting] = useState(false);
  const [extractedText, setExtractedText] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const { setOcrDraftText } = useAppStore();
  const router = useRouter();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setExtracting(true);
    try {
      const res = await scanOCRPage(file);
      setExtractedText(res.extracted_text);
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
      router.push("/dashboard/generator");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* HEADER */}
      <div className="bg-gradient-to-r from-indigo-900 via-purple-900 to-slate-900 text-white p-8 rounded-3xl shadow-xl flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center">
          <ScanText className="w-7 h-7 text-indigo-300" />
        </div>
        <div>
          <h1 className="text-2xl font-black">Working OCR Textbook & Worksheet Scanner</h1>
          <p className="text-indigo-200 text-xs sm:text-sm">
            AI Vision OCR Engine extracts precise text, formulas, equations, and question statements from textbook photos, PDFs, and worksheets.
          </p>
        </div>
      </div>

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

        {/* EXTRACTED MARKDOWN RESULT (RIGHT) */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 flex flex-col justify-between space-y-4 shadow-sm min-h-[380px]">
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
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-extrabold flex items-center gap-1 transition-colors"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? "Copied!" : "Copy"}</span>
                  </button>

                  <button
                    onClick={handleDownloadTxt}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-extrabold flex items-center gap-1 transition-colors"
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

          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <span className="text-xs text-slate-500 font-semibold">
              {extractedText ? `${extractedText.split(' ').length} words extracted` : 'Waiting for file upload...'}
            </span>

            <button
              onClick={handleBridgeToGenerator}
              disabled={!extractedText}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-extrabold text-xs rounded-2xl shadow-md transition-all flex items-center gap-2"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Use in AI Paper Generator</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
