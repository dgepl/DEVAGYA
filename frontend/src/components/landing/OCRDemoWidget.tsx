"use client";

import { useState } from "react";
import { ScanText, UploadCloud, ArrowRight, FileCode, Sparkles } from "lucide-react";
import { scanOCRPage } from "@/lib/api";
import { useAppStore } from "@/store/useAppStore";
import { useRouter } from "next/navigation";

export function OCRDemoWidget() {
  const [extracting, setExtracting] = useState(false);
  const [extractedText, setExtractedText] = useState<string | null>(null);
  const { setOcrDraftText } = useAppStore();
  const router = useRouter();

  const handleSimulatedUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const handleUseInGenerator = () => {
    if (extractedText) {
      setOcrDraftText(extractedText);
      router.push("/dashboard/generator");
    }
  };

  return (
    <section id="ocr-demo" className="py-20 bg-white relative border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-600 mb-3">Vision & Book Scanner</h2>
          <p className="text-3xl sm:text-4xl font-extrabold text-slate-900">Scan Physical Textbooks into AI Prompts</p>
          <p className="text-slate-600 mt-3">Upload any printed NCERT chapter page or handwritten worksheet photo to extract clean text instantly.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          
          {/* Upload Drop Zone */}
          <div className="glass-panel p-8 rounded-3xl border border-slate-200 flex flex-col items-center justify-center text-center relative overflow-hidden group hover:border-indigo-400 transition-colors">
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={handleSimulatedUpload}
              className="absolute inset-0 opacity-0 cursor-pointer z-20"
            />
            
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-4 group-hover:scale-110 transition-transform">
              {extracting ? <ScanText className="w-8 h-8 animate-pulse text-indigo-600" /> : <UploadCloud className="w-8 h-8" />}
            </div>

            <h3 className="text-base font-bold text-slate-900 mb-1">
              {extracting ? "Running OCR Analysis..." : "Click or Drag & Drop Book Photo"}
            </h3>
            <p className="text-xs text-slate-500 max-w-xs mb-4">
              Supports PNG, JPG, WEBP, or PDF textbook scans (Up to 25MB)
            </p>

            <span className="px-4 py-2 bg-slate-100 border border-slate-200 text-xs font-bold text-indigo-700 rounded-xl">
              Choose Sample Textbook File
            </span>
          </div>

          {/* Extracted Text Result Box */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-200 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-indigo-600" />
                  OCR Extracted Markdown
                </span>
                {extractedText && (
                  <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full font-bold">
                    100% Accuracy
                  </span>
                )}
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs font-mono text-slate-800 h-48 overflow-y-auto leading-relaxed">
                {extractedText ? (
                  extractedText
                ) : (
                  <span className="text-slate-400 italic">
                    Upload a textbook page image to view extracted OCR content here...
                  </span>
                )}
              </div>
            </div>

            {extractedText && (
              <div className="pt-4 flex items-center justify-between border-t border-slate-200">
                <span className="text-xs text-slate-500">Ready to transform into Question Paper</span>
                <button
                  onClick={handleUseInGenerator}
                  className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-glow transition-all flex items-center gap-2"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Bridge to AI Paper Generator
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

        </div>

      </div>
    </section>
  );
}
