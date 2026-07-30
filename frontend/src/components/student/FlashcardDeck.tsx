"use client";

import { useState } from "react";
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
  Clock
} from "lucide-react";
import { generateFlashcards } from "@/lib/api";

export function FlashcardDeck() {
  const [subject, setSubject] = useState("Biology");
  const [topic, setTopic] = useState("Life Processes");
  const [loading, setLoading] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [bookmarkedCards, setBookmarkedCards] = useState<Record<string, boolean>>({});

  const [cards, setCards] = useState<any[]>([
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

  const handleGenerate = async () => {
    setLoading(true);
    setCurrentIdx(0);
    setIsFlipped(false);
    try {
      const res = await generateFlashcards({ subject, topic, num_cards: 6 });
      if (res && res.length > 0) setCards(res);
    } catch (e) {
      console.error(e);
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
          <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-lg shadow-amber-200">
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
            className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-2xl shadow-md transition-all flex items-center gap-1.5"
          >
            {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-yellow-200" />}
            <span>Generate Deck</span>
          </button>
        </div>
      </div>

      {/* TOPIC INPUT BAR */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <input 
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Subject (e.g. Biology)"
          className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
        />
        <input 
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Topic (e.g. Life Processes)"
          className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
        />
      </div>

      {/* 3D FLIP FLASHCARD CONTAINER */}
      <div className="perspective-1000 py-4">
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

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                toggleBookmark(currentCard.id);
              }}
              className={`p-2 rounded-xl border transition-colors ${
                bookmarkedCards[currentCard.id]
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
              {isFlipped ? currentCard.back : currentCard.front}
            </h2>

            {!isFlipped && currentCard.hint && (
              <p className="text-xs text-amber-700 bg-amber-50 p-2.5 rounded-xl border border-amber-200 max-w-md mx-auto">
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
