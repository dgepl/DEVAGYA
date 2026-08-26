"use client";

import { useState, useRef } from "react";
import { 
  Layers, 
  Sparkles, 
  RotateCw, 
  Bookmark, 
  Shuffle, 
  CheckCircle2, 
  HelpCircle, 
  ArrowRight, 
  ArrowLeft,
  RefreshCw,
  Clock,
  Paperclip,
  Image as ImageIcon,
  FileText,
  X,
  Upload,
  BookOpen,
  GraduationCap
} from "lucide-react";
import { generateFlashcardsFromFile } from "@/lib/api";

interface Flashcard {
  id: string;
  front: string;
  back: string;
  hint?: string;
  difficulty?: "easy" | "medium" | "hard";
}

const CLASS_OPTIONS = [
  "Class 1", "Class 2", "Class 3", "Class 4", "Class 5",
  "Class 6", "Class 7", "Class 8", "Class 9", "Class 10",
  "Class 11", "Class 12", "College / Competitive Exam"
];

export function FlashcardDeck() {
  const [studentClass, setStudentClass] = useState("Class 10");
  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");
  const [numCards, setNumCards] = useState<number>(6);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showOptions, setShowOptions] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [bookmarkedCards, setBookmarkedCards] = useState<Record<string, boolean>>({});

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [cards, setCards] = useState<Flashcard[]>([
    {
      id: "card-1",
      front: "What is the primary function of Stomata in plant leaves?",
      back: "Stomata regulate gas exchange (CO2 & O2) and facilitate transpiration water loss.",
      hint: "Think about microscopic pores on leaf surfaces.",
      difficulty: "easy"
    },
    {
      id: "card-2",
      front: "Where does the light reaction of photosynthesis take place?",
      back: "Light-dependent reactions occur within the Thylakoid membranes of chloroplasts.",
      hint: "Internal disc-like structures inside chloroplasts.",
      difficulty: "medium"
    },
    {
      id: "card-3",
      front: "Define Anaerobic Respiration in yeast cells and state its end products.",
      back: "Anaerobic breakdown of glucose producing Ethanol, Carbon Dioxide, and 2 ATP energy.",
      hint: "Process involved in bread fermentation.",
      difficulty: "hard"
    }
  ]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);

    if (file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleGenerate = async () => {
    setLoading(true);
    setCurrentIdx(0);
    setIsFlipped(false);
    setShowOptions(false);

    try {
      const formData = new FormData();
      if (selectedFile) {
        formData.append("file", selectedFile);
      }
      formData.append("student_class", studentClass || "Class 10");
      formData.append("subject", subject || "General");
      formData.append("topic", topic || "");
      formData.append("num_cards", String(numCards));

      const res = await generateFlashcardsFromFile(formData);
      if (res && res.cards && res.cards.length > 0) {
        setCards(res.cards);
      }
    } catch (e) {
      console.error("Flashcard generation failed:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleShuffle = () => {
    setCards([...cards].sort(() => Math.random() - 0.5));
    setCurrentIdx(0);
    setIsFlipped(false);
  };

  const toggleBookmark = (id: string) => {
    setBookmarkedCards(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const currentCard = cards[currentIdx] || cards[0];

  return (
    <div className="space-y-4 max-w-3xl mx-auto px-1 sm:px-0">
      
      {/* COMPACT MOBILE-FIRST HEADER */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-xs flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-200 shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h1 className="text-sm sm:text-base font-black text-slate-900 truncate">AI Flashcard Studio</h1>
            <p className="text-[11px] text-slate-500 font-medium truncate">Spaced Repetition Active Recall Deck</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={handleShuffle}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors flex items-center gap-1"
            title="Shuffle Deck"
          >
            <Shuffle className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setShowOptions(!showOptions)}
            className={`px-3 py-2 text-xs font-black rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
              showOptions ? "bg-slate-800 text-white" : "bg-amber-500 text-white shadow-xs hover:bg-amber-600"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-yellow-200" />
            <span>{showOptions ? "Close" : "New Deck"}</span>
          </button>
        </div>
      </div>

      {/* COLLAPSIBLE CREATION OPTIONS ACCORDION */}
      {showOptions && (
        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-amber-200 shadow-sm space-y-3 animate-in fade-in duration-150">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="text-xs font-black text-slate-800">Generate Custom Flashcards</span>
            <button onClick={() => setShowOptions(false)} className="text-slate-400 hover:text-slate-700">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Target Class</label>
              <select
                value={studentClass}
                onChange={(e) => setStudentClass(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold"
              >
                {CLASS_OPTIONS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Subject</label>
              <input 
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Science, Mathematics"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Topic / Chapter</label>
              <input 
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Photosynthesis"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-black text-xs rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer transition active:scale-98"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Synthesizing Flashcard Deck...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-yellow-200" />
                  <span>Create {numCards} AI Flashcards</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* 3D FLIP FLASHCARD CONTAINER */}
      <div className="perspective-1000 py-2">
        <div 
          onClick={() => setIsFlipped(!isFlipped)}
          className={`w-full min-h-[300px] sm:min-h-[360px] bg-gradient-to-br ${
            isFlipped 
              ? "from-indigo-900 via-indigo-950 to-slate-950 text-white border-indigo-700"
              : "from-amber-500/10 via-white to-white text-slate-900 border-amber-200"
          } border-2 rounded-3xl p-8 shadow-xl cursor-pointer transition-all duration-500 flex flex-col justify-between relative group select-none`}
        >
          {/* CARD TOP STATUS BAR */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">
              {isFlipped ? "Answer / Solution" : `Card ${currentIdx + 1} of ${cards.length}`}
            </span>

            {currentCard?.difficulty && (
              <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
                currentCard.difficulty === "easy" 
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : currentCard.difficulty === "medium"
                  ? "bg-amber-50 text-amber-700 border-amber-200"
                  : "bg-rose-50 text-rose-700 border-rose-200"
              }`}>
                {currentCard.difficulty}
              </span>
            )}

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (currentCard) toggleBookmark(currentCard.id);
              }}
              className={`p-2 rounded-xl border transition-colors ${
                currentCard && bookmarkedCards[currentCard.id]
                  ? "bg-amber-400 border-amber-400 text-slate-950"
                  : "bg-white/10 border-current/20 text-slate-400 hover:text-amber-500"
              }`}
            >
              <Bookmark className="w-4 h-4 fill-current" />
            </button>
          </div>

          {/* MAIN PROMPT / ANSWER TEXT */}
          <div className="my-auto text-center space-y-4 px-4">
            <h2 className="text-lg sm:text-2xl font-black leading-relaxed">
              {isFlipped ? currentCard?.back : currentCard?.front}
            </h2>

            {!isFlipped && currentCard?.hint && (
              <p className="text-xs text-amber-800 bg-amber-50 p-2.5 rounded-xl border border-amber-200 max-w-md mx-auto">
                💡 <span className="font-bold">Hint:</span> {currentCard.hint}
              </p>
            )}
          </div>

          {/* FLIP INSTRUCTION FOOTER */}
          <div className="flex items-center justify-center gap-2 text-xs font-bold text-slate-400 opacity-70 group-hover:opacity-100 transition-opacity">
            <RotateCw className="w-4 h-4 animate-spin-slow" />
            <span>Click card to flip ({isFlipped ? "Show Question" : "Show Answer"})</span>
          </div>
        </div>
      </div>

      {/* SPACED REPETITION REVIEW BUTTONS */}
      {isFlipped && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 animate-in fade-in duration-300">
          {[
            { label: "Again", subtitle: "Review in 1d", color: "bg-rose-600 hover:bg-rose-700 text-white" },
            { label: "Hard", subtitle: "Review in 3d", color: "bg-amber-600 hover:bg-amber-700 text-white" },
            { label: "Good", subtitle: "Review in 6d", color: "bg-indigo-600 hover:bg-indigo-700 text-white" },
            { label: "Easy", subtitle: "Review in 12d", color: "bg-emerald-600 hover:bg-emerald-700 text-white" }
          ].map((btn, idx) => (
            <button
              key={idx}
              onClick={() => {
                setIsFlipped(false);
                setCurrentIdx(prev => (prev + 1) % cards.length);
              }}
              className={`p-3 rounded-2xl ${btn.color} font-bold shadow-md transition-all text-center`}
            >
              <div className="text-xs">{btn.label}</div>
              <div className="text-[10px] opacity-80 font-medium">{btn.subtitle}</div>
            </button>
          ))}
        </div>
      )}

      {/* CARD NAV CONTROLS */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={() => {
            setIsFlipped(false);
            setCurrentIdx(prev => Math.max(0, prev - 1));
          }}
          disabled={currentIdx === 0}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 font-bold text-xs rounded-xl transition-colors flex items-center gap-1"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Previous</span>
        </button>

        <span className="text-xs font-bold text-slate-500">
          Card {currentIdx + 1} / {cards.length}
        </span>

        <button
          onClick={() => {
            setIsFlipped(false);
            setCurrentIdx(prev => Math.min(cards.length - 1, prev + 1));
          }}
          disabled={currentIdx === cards.length - 1}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 font-bold text-xs rounded-xl transition-colors flex items-center gap-1"
        >
          <span>Next</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
}
