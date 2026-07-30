"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ScanText, UploadCloud, ArrowRight, FileCode, Sparkles } from "lucide-react";
import { scanOCRPage } from "@/lib/api";
import { useAppStore } from "@/store/useAppStore";

export default function OCRPage() {
  const [extracting, setExtracting] = useState(false);
  const [extractedText, setExtractedText] = useState<string | null>(null);
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
      console.error(err);
    } finally {
      setExtracting(false);
    }
  };

  const handleBridgeToGenerator = () => {
    if (extractedText) {
      setOcrDraftText(extractedText);
      router.push("/dashboard/generator");
    }
  };

  return (
    <div className="space-y-8">
      
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
          <ScanText className="w-6 h-6 text-indigo-600" />
          OCR Textbook & Page Scanner
        </h1>
        <p className="text-xs text-slate-500 font-semibold">Digitize physical NCERT textbooks, worksheets, or handwritten notes into AI prompts</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Upload Zone */}
        <div className="glass-panel p-8 rounded-3xl border border-slate-200 flex flex-col items-center justify-center text-center relative overflow-hidden group min-h-[350px] shadow-sm hover:border-indigo-400 transition-colors">
          <input
            type="file"
            accept="image/*,.pdf"
            onChange={handleFileUpload}
            className="absolute inset-0 opacity-0 cursor-pointer z-20"
          />

          <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform font-bold">
            <UploadCloud className="w-8 h-8" />
          </div>

          <h3 className="text-base font-bold text-slate-900 mb-1">
            {extracting ? "Running Mistral OCR Processing..." : "Upload NCERT Page Photo"}
          </h3>
          <p className="text-xs text-slate-500 font-medium max-w-xs mb-4">
            Supports PNG, JPG, or PDF textbook scans (Up to 25MB)
          </p>

          <span className="px-4 py-2 bg-slate-100 border border-slate-200 text-xs font-bold text-indigo-700 rounded-xl">
            Browse File from Computer
          </span>
        </div>

        {/* Extracted Text Box */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-200 flex flex-col justify-between space-y-4 shadow-sm">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-2">
                <FileCode className="w-4 h-4 text-indigo-600" />
                Extracted Markdown Result
              </span>
              {extractedText && (
                <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full font-bold">
                  OCR Ready
                </span>
              )}
            </div>

            <textarea
              value={extractedText || ""}
              onChange={(e) => setExtractedText(e.target.value)}
              placeholder="Extracted textbook text will appear here. You can also manually paste text..."
              rows={12}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs font-mono text-slate-800 focus:outline-none focus:border-indigo-500 leading-relaxed font-semibold"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-slate-500 font-semibold">{extractedText ? `${extractedText.split(' ').length} words extracted` : 'Waiting for upload...'}</span>
            <button
              onClick={handleBridgeToGenerator}
              disabled={!extractedText}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-glow transition-all flex items-center gap-2"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Use in AI Paper Generator
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
