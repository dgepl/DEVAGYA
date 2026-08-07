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

    try {
      const formData = new FormData();
      if (selectedFile) {
        formData.append("file", selectedFile);
      }
      formData.append("student_class", studentClass || "Class 10");
      formData.append("subject", subject || "General Studies");
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
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* HEADER BAR */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-yellow-600 text-white flex items-center justify-center shadow-lg shadow-amber-200">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900">AI Flashcard Studio</h1>
            <p className="text-xs text-slate-500">Spaced Repetition Active Recall Deck Generator</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleShuffle}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-2xl transition-colors flex items-center gap-1.5"
            title="Shuffle Deck"
          >
            <Shuffle className="w-4 h-4" />
            <span className="hidden sm:inline">Shuffle</span>
          </button>

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-2xl shadow-md transition-all flex items-center gap-2"
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4 text-yellow-200" />
            )}
            <span>{loading ? "Generating..." : `Generate ${numCards} Cards`}</span>
          </button>
        </div>
      </div>

      {/* CREATION OPTIONS CONTAINER */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        
        {/* TOP ROW: CLASS SELECTOR, SUBJECT & TOPIC */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          {/* CLASS / GRADE SELECTOR */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-amber-600" /> Target Class
            </label>
            <select
              value={studentClass}
              onChange={(e) => setStudentClass(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
            >
              {CLASS_OPTIONS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* SUBJECT */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Subject (Optional)
            </label>
            <input 
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Science, Mathematics, History"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
            />
          </div>

          {/* TOPIC / CHAPTER */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Chapter / Topic (Optional)
            </label>
            <input 
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Photosynthesis, Trigonometry"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
            />
          </div>
        </div>

        {/* MIDDLE ROW: CARD COUNT SELECTOR & FILE ATTACHMENT */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-slate-100">
          
          {/* NUMBER OF CARDS SELECTOR */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              How many Flashcards do you want?
            </label>
            <div className="flex items-center gap-2">
              {[3, 5, 8, 10, 15, 20].map((count) => (
                <button
                  key={count}
                  type="button"
                  onClick={() => setNumCards(count)}
                  className={`flex-1 py-2 rounded-xl text-xs font-black transition-all border ${
                    numCards === count
                      ? "bg-amber-500 text-white border-amber-500 shadow-md shadow-amber-200"
                      : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {count}
                </button>
              ))}
              <input
                type="number"
                min={1}
                max={25}
                value={numCards}
                onChange={(e) => setNumCards(Math.max(1, Math.min(25, Number(e.target.value) || 5)))}
                className="w-16 bg-slate-50 border border-slate-200 rounded-xl px-2 py-2 text-xs font-black text-center text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                title="Custom Card Count"
              />
            </div>
          </div>

          {/* FILE / PHOTO ATTACHMENT */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Upload Photo or Document (Optional)
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.doc,.txt,image/*"
              onChange={handleFileSelect}
              className="hidden"
            />

            {!selectedFile ? (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-2.5 px-4 bg-slate-50 hover:bg-amber-50 border border-dashed border-slate-300 hover:border-amber-400 rounded-xl text-xs font-bold text-slate-600 hover:text-amber-700 transition-all flex items-center justify-center gap-2 group"
              >
                <Upload className="w-4 h-4 text-slate-400 group-hover:text-amber-600 transition-colors" />
                <span>Upload Textbook Photo, PDF or Worksheet</span>
              </button>
            ) : (
              <div className="flex items-center justify-between p-2.5 bg-amber-50 border border-amber-200 rounded-xl">
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  {previewUrl ? (
                    <img src={previewUrl} alt="Preview" className="w-9 h-9 object-cover rounded-lg border border-amber-300 shrink-0" />
                  ) : (
                    <div className="w-9 h-9 rounded-lg bg-red-100 border border-red-200 flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5 text-red-600" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-900 truncate">{selectedFile.name}</p>
                    <p className="text-[10px] text-slate-500 font-medium">{formatFileSize(selectedFile.size)}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={removeFile}
                  className="p-1.5 hover:bg-amber-200 text-amber-800 rounded-lg transition-colors ml-2 shrink-0"
                  title="Remove attachment"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

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
