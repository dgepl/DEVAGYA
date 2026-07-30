"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, Search, Sparkles, ArrowRight } from "lucide-react";

export default function NCERTPage() {
  const [selectedClass, setSelectedClass] = useState("Class 10");
  const [selectedSubject, setSelectedSubject] = useState("Science");
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const chapters = [
    { number: 1, title: "Chemical Reactions and Equations", category: "Chemistry", markWeightage: "8 Marks" },
    { number: 2, title: "Acids, Bases and Salts", category: "Chemistry", markWeightage: "7 Marks" },
    { number: 3, title: "Metals and Non-metals", category: "Chemistry", markWeightage: "10 Marks" },
    { number: 4, title: "Carbon and its Compounds", category: "Chemistry", markWeightage: "8 Marks" },
    { number: 5, title: "Life Processes", category: "Biology", markWeightage: "12 Marks" },
    { number: 6, title: "Control and Coordination", category: "Biology", markWeightage: "7 Marks" },
    { number: 7, title: "How do Organisms Reproduce?", category: "Biology", markWeightage: "8 Marks" },
    { number: 8, title: "Heredity and Evolution", category: "Biology", markWeightage: "7 Marks" },
    { number: 9, title: "Light – Reflection and Refraction", category: "Physics", markWeightage: "10 Marks" },
    { number: 10, title: "The Human Eye and the Colorful World", category: "Physics", markWeightage: "5 Marks" },
    { number: 11, title: "Electricity", category: "Physics", markWeightage: "12 Marks" },
    { number: 12, title: "Magnetic Effects of Electric Current", category: "Physics", markWeightage: "6 Marks" },
  ];

  const filtered = chapters.filter(c => c.title.toLowerCase().includes(searchQuery.toLowerCase()));

  const handleSelectChapter = (title: string) => {
    router.push(`/dashboard/generator`);
  };

  return (
    <div className="space-y-8">
      
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-indigo-600" />
          NCERT Curriculum Catalog
        </h1>
        <p className="text-xs text-slate-500 font-semibold">Search CBSE & ICSE syllabus topics and launch AI paper generator</p>
      </div>

      {/* Filter Controls */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 font-semibold"
          >
            <option value="Class 9">Class 9</option>
            <option value="Class 10">Class 10</option>
            <option value="Class 12">Class 12</option>
          </select>

          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 font-semibold"
          >
            <option value="Science">Science</option>
            <option value="Mathematics">Mathematics</option>
            <option value="Physics">Physics</option>
          </select>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search chapter title or keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:border-indigo-500"
          />
        </div>

      </div>

      {/* Chapters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((chap) => (
          <div key={chap.number} className="glass-card p-6 rounded-3xl border border-slate-200 flex flex-col justify-between space-y-4 shadow-sm group hover:border-indigo-400">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-600 uppercase tracking-wide">
                  Chapter {chap.number} • <span className="text-slate-500">{chap.category}</span>
                </span>
                <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full font-bold">
                  {chap.markWeightage}
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{chap.title}</h3>
            </div>

            <button
              onClick={() => handleSelectChapter(chap.title)}
              className="w-full py-2.5 bg-slate-100 hover:bg-indigo-600 text-slate-700 hover:text-white font-bold text-xs rounded-xl border border-slate-200 transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-500 group-hover:text-cyan-200" />
              Generate Paper for Chapter
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

    </div>
  );
}
