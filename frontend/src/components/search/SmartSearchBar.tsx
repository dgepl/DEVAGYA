"use client";

import { useState } from "react";
import { Search, ArrowRight, X } from "lucide-react";
import { smartSearch } from "@/lib/api_phase2";
import Link from "next/link";

export function SmartSearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    try {
      const res = await smartSearch(query);
      setResults(res.results || []);
      setIsOpen(true);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="relative w-full max-w-md">
      <form onSubmit={handleSearch} className="relative">
        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Smart AI Search e.g. 'Class 10 Biology worksheet'..."
          className="w-full bg-slate-100 border border-slate-200 rounded-xl pl-9 pr-8 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 font-semibold transition-all"
        />
        {query && (
          <button type="button" onClick={() => { setQuery(""); setIsOpen(false); }} className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-700">
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </form>

      {isOpen && results.length > 0 && (
        <div className="absolute top-12 left-0 right-0 glass-panel p-3 rounded-2xl border border-slate-200 shadow-lg z-50 space-y-2 bg-white">
          <div className="flex items-center justify-between text-[10px] text-slate-500 font-bold uppercase tracking-wider px-2 pb-1 border-b border-slate-100">
            <span>Natural Language Search Results</span>
            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-700">Close</button>
          </div>
          {results.map((item, idx) => (
            <Link
              key={idx}
              href={item.action}
              onClick={() => setIsOpen(false)}
              className="block p-2.5 bg-slate-50 hover:bg-indigo-50 rounded-xl border border-slate-200 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-indigo-600 uppercase">{item.type}</span>
                <ArrowRight className="w-3 h-3 text-slate-400" />
              </div>
              <p className="text-xs font-bold text-slate-900 mt-0.5">{item.title}</p>
              <p className="text-[10px] text-slate-500 font-medium mt-0.5">{item.snippet}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
