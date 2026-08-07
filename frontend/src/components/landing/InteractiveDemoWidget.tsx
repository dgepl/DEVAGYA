"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Sparkles, FileText, Download, CheckCircle, RefreshCw, Cpu, Lock } from "lucide-react";
import { generateQuestionPaper, GeneratedPaperResponse, downloadPDF } from "@/lib/api";

export function InteractiveDemoWidget() {
  const router = useRouter();
  const [selectedClass, setSelectedClass] = useState("Class 10");
  const [selectedSubject, setSelectedSubject] = useState("Science");
  const [selectedChapter, setSelectedChapter] = useState("Chemical Reactions and Equations");
  const [difficulty, setDifficulty] = useState("medium");
  const [loading, setLoading] = useState(false);
  const [paper, setPaper] = useState<GeneratedPaperResponse | null>(null);

  // REDIRECT UNAUTHENTICATED HOMEPAGE USERS DIRECTLY TO LOGIN PAGE
  const handleGenerate = () => {
    router.push("/login");
  };

  const handlePdfRedirect = () => {
    router.push("/login");
  };

  return (
    <section id="demo" className="py-20 bg-slate-50 relative border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-600 mb-3">Live Interactive Generator</h2>
          <p className="text-3xl sm:text-4xl font-extrabold text-slate-900">Experience AI Question Paper Generation</p>
          <p className="text-slate-600 mt-3">Select your grade and chapter below to test our NCERT engine in real time.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Controls Card */}
          <div className="lg:col-span-5 glass-panel p-6 rounded-3xl border border-slate-200 space-y-6 bg-white shadow-md">
            
            <div className="flex items-center gap-3 pb-4 border-b border-slate-200">
              <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                <Cpu className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Paper Constraints</h3>
                <p className="text-xs text-slate-500">NCERT Catalog Aligned</p>
              </div>
            </div>

            {/* Class Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Select Grade / Class</label>
              <div className="grid grid-cols-3 gap-2">
                {["Class 9", "Class 10", "Class 12"].map((cls) => (
                  <button
                    key={cls}
                    onClick={() => setSelectedClass(cls)}
                    className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all ${
                      selectedClass === cls
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                        : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    {cls}
                  </button>
                ))}
              </div>
            </div>

            {/* Subject Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Subject</label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 font-semibold"
              >
                <option value="Science">Science (Physics, Chemistry, Bio)</option>
                <option value="Mathematics">Mathematics</option>
                <option value="Physics">Physics (Class 12)</option>
              </select>
            </div>

            {/* Chapter Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-2">NCERT Chapter</label>
              <select
                value={selectedChapter}
                onChange={(e) => setSelectedChapter(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 font-semibold"
              >
                <option value="Chemical Reactions and Equations">Ch 1: Chemical Reactions and Equations</option>
                <option value="Electricity">Ch 11: Electricity</option>
                <option value="Life Processes">Ch 5: Life Processes</option>
                <option value="Quadratic Equations">Ch 4: Quadratic Equations</option>
              </select>
            </div>

            {/* Difficulty Pill */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Difficulty Curve</label>
              <div className="grid grid-cols-3 gap-2">
                {["easy", "medium", "hard"].map((diff) => (
                  <button
                    key={diff}
                    onClick={() => setDifficulty(diff)}
                    className={`py-2 text-xs font-bold rounded-xl border capitalize transition-all ${
                      difficulty === diff
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                        : "bg-white text-slate-700 border-slate-200"
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>

            {/* Generate CTA Button - REDIRECTS TO LOGIN */}
            <button
              onClick={handleGenerate}
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-wider active:scale-95"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Generate Question Paper</span>
            </button>

          </div>

          {/* Right Live Preview Card */}
          <div className="lg:col-span-7 glass-panel p-6 rounded-3xl border border-slate-200 min-h-[480px] flex flex-col justify-between bg-white shadow-md">
            
            <div className="space-y-6">
              
              {/* Paper Header */}
              <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] uppercase font-extrabold tracking-widest text-indigo-600">Sample Generated Output</span>
                  <h4 className="text-lg font-black text-slate-900">Apex International Academy</h4>
                  <p className="text-xs text-slate-600 font-medium">CBSE Mid-Term Examination 2025 • Class 10 (Science)</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePdfRedirect}
                    className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Paper PDF
                  </button>
                  <button
                    onClick={handlePdfRedirect}
                    className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    Answer Key PDF
                  </button>
                </div>
              </div>

              {/* Questions List */}
              <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2">
                {[
                  {
                    num: 1,
                    type: "MCQ",
                    marks: 1,
                    text: "What is the general equation for a chemical reaction?",
                    opts: ["(A) a + b → c", "(B) a + b → c + d", "(C) a → b", "(D) a + b → ab"]
                  },
                  {
                    num: 2,
                    type: "MCQ",
                    marks: 1,
                    text: "What is the term for the amount of substance that changes during a chemical reaction?",
                    opts: ["(A) Quantity", "(B) Mole", "(C) Mass", "(D) Volume"]
                  }
                ].map((q) => (
                  <div
                    key={q.num}
                    className="p-4 bg-slate-50 rounded-2xl border border-slate-200 shadow-xs space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-indigo-600 uppercase tracking-wide">
                        Question {q.num} • <span className="text-slate-600">{q.type}</span>
                      </span>
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        {q.marks} Mark
                      </span>
                    </div>
                    <p className="text-sm font-bold text-slate-800">{q.text}</p>
                    
                    <div className="grid grid-cols-2 gap-2 pt-2">
                      {q.opts.map((opt, idx) => (
                        <div key={idx} className="text-xs text-slate-700 bg-white p-2 rounded-lg border border-slate-200 font-medium">
                          {opt}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Direct Action Link */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Sign in to generate unlimited full-length papers</span>
                <button
                  onClick={handleGenerate}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Log In to Access</span>
                </button>
              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
