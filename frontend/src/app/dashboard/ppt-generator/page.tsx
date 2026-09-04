"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Sparkles,
  Download,
  FileText,
  Edit3,
  Trash2,
  Copy,
  Plus,
  ArrowUp,
  ArrowDown,
  Eye,
  Play,
  RotateCcw,
  CheckCircle2,
  HelpCircle,
  Settings,
  Layers,
  Palette,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  RefreshCw,
  BookOpen,
  Wand2,
  Sliders,
  ExternalLink,
  X
} from "lucide-react";
import {
  generatePPT,
  refinePPTSlide,
  downloadPPTX,
  downloadPPTPDF,
  PresentationData,
  SlideItem,
  GeneratePPTRequest
} from "@/lib/api";
import { useAppStore } from "@/store/useAppStore";
import Markdown from "@/components/chat/Markdown";

const THEMES = [
  { id: "modern_navy", name: "Modern Navy", primary: "#1E3A8A", accent: "#0D9488", bg: "bg-slate-50" },
  { id: "emerald_sage", name: "Emerald Sage", primary: "#065F46", accent: "#F59E0B", bg: "bg-emerald-50/40" },
  { id: "sunset_coral", name: "Sunset Coral", primary: "#991B1B", accent: "#EA580C", bg: "bg-orange-50/40" },
  { id: "dark_cyber", name: "Dark Cyber", primary: "#6366F1", accent: "#06B6D4", bg: "bg-slate-900" },
  { id: "royal_purple", name: "Royal Purple", primary: "#581C87", accent: "#EC4899", bg: "bg-purple-50/40" },
  { id: "slate_academic", name: "Slate Academic", primary: "#1E293B", accent: "#2563EB", bg: "bg-slate-100/60" },
];

const TOPIC_CHIPS = [
  "Quantum Computing & Superposition",
  "Photosynthesis & Cellular Energy",
  "Indian Independence Movement (1857-1947)",
  "Artificial Intelligence & Future of Jobs",
  "Vedic Mathematics Fast Calculation",
  "Climate Change & Renewable Solutions",
  "Human Heart Anatomy & Blood Circulation",
  "Financial Literacy & Personal Budgeting",
];

const TEACHER_GUIDANCE_PRESETS = [
  "Include real-world examples and everyday analogies.",
  "Keep text concise, visual, and limited to 3-4 key bullet points.",
  "Add a thought-provoking classroom discussion question on the last slide.",
  "Tailor explanations specifically for middle school learners.",
  "Include practical case applications from India.",
];

export default function PPTGeneratorPage() {
  const { user } = useAppStore();

  // Generator Form State
  const [topic, setTopic] = useState("");
  const [targetAudience, setTargetAudience] = useState("Class 10-12 / High School");
  const [numSlides, setNumSlides] = useState(8);
  const [tone, setTone] = useState("Engaging & Visual");
  const [language, setLanguage] = useState("English");
  const [theme, setTheme] = useState("modern_navy");
  const [teacherGuidance, setTeacherGuidance] = useState("");

  // Presentation State
  const [presentation, setPresentation] = useState<PresentationData | null>(null);
  const [activeSlideIdx, setActiveSlideIdx] = useState<number>(0);
  const [viewMode, setViewMode] = useState<"editor" | "preview">("editor");
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Loading & Action State
  const [generating, setGenerating] = useState(false);
  const [refiningSlide, setRefiningSlide] = useState(false);
  const [downloadingPPTX, setDownloadingPPTX] = useState(false);
  const [downloadingPDF, setDownloadingPDF] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showMobileModal, setShowMobileModal] = useState(false);

  // Slide Image Editing Modal
  const [showImageModal, setShowImageModal] = useState(false);
  const [customImageUrl, setCustomImageUrl] = useState("");
  const [customImageKeyword, setCustomImageKeyword] = useState("");

  // Slide AI Refine Prompt Modal
  const [showRefineModal, setShowRefineModal] = useState(false);
  const [refinePrompt, setRefinePrompt] = useState("");

  // Saved Decks History in LocalStorage
  const [savedDecks, setSavedDecks] = useState<PresentationData[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("devgya_saved_ppt_decks");
      if (stored) {
        setSavedDecks(JSON.parse(stored));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const saveDeckToLocalStorage = (deck: PresentationData) => {
    try {
      const filtered = savedDecks.filter((d) => d.id !== deck.id);
      const updated = [deck, ...filtered].slice(0, 10);
      setSavedDecks(updated);
      localStorage.setItem("devgya_saved_ppt_decks", JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  // Keyboard navigation in Preview Mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (viewMode !== "preview" || !presentation) return;
      if (e.key === "ArrowRight" || e.key === "PageDown" || e.key === " ") {
        e.preventDefault();
        setActiveSlideIdx((prev) => Math.min(presentation.slides.length - 1, prev + 1));
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
        setActiveSlideIdx((prev) => Math.max(0, prev - 1));
      } else if (e.key === "Escape" && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [viewMode, presentation, isFullscreen]);

  // Handle Main PPT Generation
  const handleGenerate = async () => {
    if (!topic.trim()) {
      setError("Please enter a study topic for the presentation.");
      return;
    }
    setError(null);
    setGenerating(true);

    try {
      const res = await generatePPT({
        topic: topic.trim(),
        target_audience: targetAudience,
        num_slides: numSlides,
        tone,
        language,
        theme,
        teacher_guidance: teacherGuidance.trim(),
        user_email: user?.email || ""
      });

      setPresentation(res);
      setActiveSlideIdx(0);
      saveDeckToLocalStorage(res);
      if (typeof window !== "undefined" && window.innerWidth < 1024) {
        setShowMobileModal(true);
      }
    } catch (err: any) {
      setError(err.message || "Failed to generate presentation. Please check connection.");
    } finally {
      setGenerating(false);
    }
  };

  // Active Slide updates
  const activeSlide: SlideItem | undefined = presentation?.slides[activeSlideIdx];

  const updateActiveSlide = (fields: Partial<SlideItem>) => {
    if (!presentation || !activeSlide) return;
    const updatedSlides = presentation.slides.map((s, idx) => {
      if (idx === activeSlideIdx) {
        return { ...s, ...fields };
      }
      return s;
    });
    const updatedPres = { ...presentation, slides: updatedSlides };
    setPresentation(updatedPres);
    saveDeckToLocalStorage(updatedPres);
  };

  // Add Bullet to active slide
  const handleAddBullet = () => {
    if (!activeSlide) return;
    const updatedBullets = [...activeSlide.bullets, "New key concept point..."];
    updateActiveSlide({ bullets: updatedBullets });
  };

  // Delete bullet from active slide
  const handleDeleteBullet = (bulletIdx: number) => {
    if (!activeSlide) return;
    const updatedBullets = activeSlide.bullets.filter((_, i) => i !== bulletIdx);
    updateActiveSlide({ bullets: updatedBullets });
  };

  // Update bullet text
  const handleUpdateBullet = (bulletIdx: number, text: string) => {
    if (!activeSlide) return;
    const updatedBullets = [...activeSlide.bullets];
    updatedBullets[bulletIdx] = text;
    updateActiveSlide({ bullets: updatedBullets });
  };

  // Move slide up/down
  const handleMoveSlide = (fromIdx: number, toIdx: number) => {
    if (!presentation) return;
    if (toIdx < 0 || toIdx >= presentation.slides.length) return;
    const newSlides = [...presentation.slides];
    const [moved] = newSlides.splice(fromIdx, 1);
    newSlides.splice(toIdx, 0, moved);
    // Renumber
    newSlides.forEach((s, i) => (s.slide_number = i + 1));
    const updatedPres = { ...presentation, slides: newSlides };
    setPresentation(updatedPres);
    setActiveSlideIdx(toIdx);
    saveDeckToLocalStorage(updatedPres);
  };

  // Duplicate Slide
  const handleDuplicateSlide = (idx: number) => {
    if (!presentation) return;
    const target = presentation.slides[idx];
    const duplicated: SlideItem = {
      ...JSON.parse(JSON.stringify(target)),
      slide_number: presentation.slides.length + 1,
      title: `${target.title} (Copy)`
    };
    const newSlides = [...presentation.slides];
    newSlides.splice(idx + 1, 0, duplicated);
    newSlides.forEach((s, i) => (s.slide_number = i + 1));
    const updatedPres = { ...presentation, slides: newSlides, num_slides: newSlides.length };
    setPresentation(updatedPres);
    setActiveSlideIdx(idx + 1);
    saveDeckToLocalStorage(updatedPres);
  };

  // Delete Slide
  const handleDeleteSlide = (idx: number) => {
    if (!presentation || presentation.slides.length <= 1) {
      alert("Presentation must have at least one slide.");
      return;
    }
    const newSlides = presentation.slides.filter((_, i) => i !== idx);
    newSlides.forEach((s, i) => (s.slide_number = i + 1));
    const nextIdx = Math.min(activeSlideIdx, newSlides.length - 1);
    const updatedPres = { ...presentation, slides: newSlides, num_slides: newSlides.length };
    setPresentation(updatedPres);
    setActiveSlideIdx(nextIdx);
    saveDeckToLocalStorage(updatedPres);
  };

  // Add New Empty Slide
  const handleAddNewSlide = () => {
    if (!presentation) return;
    const newSlide: SlideItem = {
      slide_number: presentation.slides.length + 1,
      layout: "title_bullets",
      category: "Additional Concept",
      title: "New Presentation Slide",
      subtitle: "Add descriptive subheadings here",
      bullets: [
        "First key takeaway point",
        "Second explanatory observation",
        "Third actionable classroom conclusion"
      ],
      image_keyword: presentation.topic,
      image_caption: `Visual illustration for ${presentation.topic}`,
      speaker_notes: "Guide the students through this concept step-by-step."
    };
    const newSlides = [...presentation.slides, newSlide];
    const updatedPres = { ...presentation, slides: newSlides, num_slides: newSlides.length };
    setPresentation(updatedPres);
    setActiveSlideIdx(newSlides.length - 1);
    saveDeckToLocalStorage(updatedPres);
  };

  // AI Refine Slide Handler
  const handleExecuteRefine = async (customInstruction?: string) => {
    if (!presentation || !activeSlide) return;
    const instruction = customInstruction || refinePrompt;
    if (!instruction.trim()) return;

    setRefiningSlide(true);
    setShowRefineModal(false);
    setRefinePrompt("");

    try {
      const refined = await refinePPTSlide({
        slide: activeSlide,
        instruction: instruction.trim(),
        topic: presentation.topic,
        target_audience: presentation.target_audience
      });

      const newSlides = presentation.slides.map((s, i) => (i === activeSlideIdx ? refined : s));
      const updatedPres = { ...presentation, slides: newSlides };
      setPresentation(updatedPres);
      saveDeckToLocalStorage(updatedPres);
    } catch (err: any) {
      alert(err.message || "Failed to refine slide.");
    } finally {
      setRefiningSlide(false);
    }
  };

  // Download PPTX
  const handleDownloadPPTX = async () => {
    if (!presentation) return;
    setDownloadingPPTX(true);
    try {
      const blob = await downloadPPTX(presentation);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${presentation.title.replace(/[^a-zA-Z0-9_-]/g, "_")}.pptx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(err.message || "Failed to export PowerPoint presentation.");
    } finally {
      setDownloadingPPTX(false);
    }
  };

  // Download PDF
  const handleDownloadPDF = async () => {
    if (!presentation) return;
    setDownloadingPDF(true);
    try {
      const blob = await downloadPPTPDF(presentation);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${presentation.title.replace(/[^a-zA-Z0-9_-]/g, "_")}_slides.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(err.message || "Failed to export Presentation PDF.");
    } finally {
      setDownloadingPDF(false);
    }
  };

  const currentTheme = THEMES.find((t) => t.id === (presentation?.theme || theme)) || THEMES[0];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      
      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 text-white p-6 rounded-3xl shadow-xl">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-indigo-500/20 backdrop-blur-md border border-indigo-400/30 rounded-xl">
              <Sliders className="w-5 h-5 text-amber-300" />
            </span>
            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-200 bg-indigo-950/60 border border-indigo-700/50 px-2.5 py-0.5 rounded-full">
              Teacher Presentation Studio
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight">AI PPT Generator</h1>
          <p className="text-xs sm:text-sm text-indigo-100 max-w-2xl font-medium">
            Guide AI to craft beautiful, image-rich slide decks on <b>any study topic</b> (freeform or curriculum).
            Full live slide editing, presentation mode, PPTX export, and PDF preview included.
          </p>
        </div>

        {/* Quick Action when presentation loaded */}
        {presentation && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode(viewMode === "editor" ? "preview" : "editor")}
              className={`px-4 py-2.5 rounded-xl font-black text-xs flex items-center gap-2 transition cursor-pointer shadow-md ${
                viewMode === "preview"
                  ? "bg-amber-400 text-amber-950 hover:bg-amber-300"
                  : "bg-white text-indigo-900 hover:bg-indigo-50"
              }`}
            >
              {viewMode === "preview" ? <Edit3 className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              <span>{viewMode === "preview" ? "Edit Slides" : "Preview PDF / Slides"}</span>
            </button>
          </div>
        )}
      </div>

      {/* ERROR ALERT */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs font-bold text-rose-800 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-rose-600 hover:underline">Dismiss</button>
        </div>
      )}

      {/* MAIN TWO-COLUMN WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* LEFT COLUMN: SETUP & AI GUIDANCE CONTROLS */}
        <div className="lg:col-span-4 space-y-5">
          <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-xs space-y-5">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-indigo-600" /> Topic & Audience
              </span>
              <span className="text-[10px] font-bold text-slate-500">Any Study Field</span>
            </div>

            {/* 1. Freeform Study Topic */}
            <div className="space-y-1.5">
              <label className="block text-xs font-extrabold text-slate-800">
                Presentation Topic <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={2}
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Quantum Computing & Superposition, Vedic Math Tricks, Photosynthesis, French Revolution..."
                className="w-full bg-slate-50 border border-slate-300 focus:border-indigo-500 focus:bg-white rounded-2xl p-3 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />

              {/* Topic Chips */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {TOPIC_CHIPS.slice(0, 4).map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => setTopic(chip)}
                    className="text-[10px] font-semibold text-slate-600 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 px-2.5 py-1 rounded-lg transition text-left cursor-pointer truncate max-w-full"
                  >
                    + {chip}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Target Audience & Slide Count */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1">Target Audience</label>
                <select
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 cursor-pointer"
                >
                  <option value="Middle School (Class 6-8)">Middle School (Class 6-8)</option>
                  <option value="Class 9-10 (CBSE/NCERT)">Class 9-10 (CBSE/NCERT)</option>
                  <option value="Class 11-12 / High School">Class 11-12 / High School</option>
                  <option value="College / Competitive Exams">College / Competitive Exams</option>
                  <option value="General Public / Lifelong Learners">General Public / Lifelong</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1">Slide Count</label>
                <select
                  value={numSlides}
                  onChange={(e) => setNumSlides(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 cursor-pointer"
                >
                  <option value={5}>5 Slides (Summary)</option>
                  <option value={8}>8 Slides (Standard Deck)</option>
                  <option value={10}>10 Slides (Comprehensive)</option>
                  <option value={12}>12 Slides (Deep Dive)</option>
                  <option value={15}>15 Slides (Masterclass)</option>
                </select>
              </div>
            </div>

            {/* 3. Tone & Language */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1">Tone & Style</label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 cursor-pointer"
                >
                  <option value="Engaging & Visual">Engaging & Visual</option>
                  <option value="Academic & Rigorous">Academic & Rigorous</option>
                  <option value="Storytelling & Interactive">Storytelling & Interactive</option>
                  <option value="Exam Revision & Key Points">Exam Revision & Keys</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1">Language</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 cursor-pointer"
                >
                  <option value="English">English</option>
                  <option value="Hindi">Hindi (हिंदी)</option>
                  <option value="Hinglish">Hinglish (Conversational)</option>
                </select>
              </div>
            </div>

            {/* 4. Color Theme Selector */}
            <div className="space-y-1.5">
              <label className="block text-xs font-extrabold text-slate-700 flex items-center justify-between">
                <span>Color Theme</span>
                <span className="text-[10px] font-bold text-indigo-600">{currentTheme.name}</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {THEMES.map((th) => (
                  <button
                    key={th.id}
                    type="button"
                    onClick={() => {
                      setTheme(th.id);
                      if (presentation) {
                        const updated = { ...presentation, theme: th.id };
                        setPresentation(updated);
                        saveDeckToLocalStorage(updated);
                      }
                    }}
                    className={`p-2 rounded-xl border flex items-center gap-2 transition cursor-pointer ${
                      (presentation?.theme || theme) === th.id
                        ? "border-indigo-600 bg-indigo-50/70 ring-2 ring-indigo-500/20"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <span className="w-4 h-4 rounded-full shrink-0 shadow-xs" style={{ backgroundColor: th.primary }}></span>
                    <span className="text-[11px] font-bold text-slate-800 truncate">{th.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 5. Teacher Guidance to AI */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                  <Wand2 className="w-3.5 h-3.5 text-purple-600" />
                  <span>Teacher Instructions to AI</span>
                </label>
                <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-md">
                  Custom Guidance
                </span>
              </div>
              <textarea
                rows={3}
                value={teacherGuidance}
                onChange={(e) => setTeacherGuidance(e.target.value)}
                placeholder="Instruct the AI: e.g., 'Focus heavily on the practical applications; keep text concise; add a 2-question quiz on the final slide for students...'"
                className="w-full bg-slate-50 border border-slate-300 focus:border-purple-500 focus:bg-white rounded-2xl p-3 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />

              {/* Guidance Presets */}
              <div className="flex flex-wrap gap-1">
                {TEACHER_GUIDANCE_PRESETS.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setTeacherGuidance((prev) => (prev ? `${prev} ${p}` : p))}
                    className="text-[9px] font-medium text-slate-500 bg-slate-100 hover:bg-purple-50 hover:text-purple-700 px-2 py-0.5 rounded transition cursor-pointer"
                  >
                    + {p.slice(0, 28)}...
                  </button>
                ))}
              </div>
            </div>

            {/* GENERATE BUTTON */}
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 text-white font-black text-sm rounded-2xl shadow-md flex items-center justify-center gap-2 cursor-pointer transition active:scale-98"
            >
              {generating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Synthesizing Slides with AI...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Generate Presentation Deck</span>
                </>
              )}
            </button>
          </div>

          {/* SAVED PRESENTATIONS HISTORY */}
          {savedDecks.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-xs space-y-3">
              <span className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                <span>Recent Saved Decks ({savedDecks.length})</span>
              </span>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {savedDecks.map((deck) => (
                  <button
                    key={deck.id}
                    onClick={() => {
                      setPresentation(deck);
                      setActiveSlideIdx(0);
                    }}
                    className={`w-full text-left p-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-between cursor-pointer ${
                      presentation?.id === deck.id
                        ? "border-indigo-500 bg-indigo-50/60 text-indigo-900"
                        : "border-slate-100 hover:border-slate-300 bg-slate-50 text-slate-800"
                    }`}
                  >
                    <div className="truncate pr-2">
                      <div className="truncate font-black">{deck.title}</div>
                      <div className="text-[10px] text-slate-500">{deck.num_slides} slides • {deck.target_audience}</div>
                    </div>
                    <span className="text-[10px] text-indigo-600 shrink-0">Open →</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: SLIDE STUDIO & PREVIEW CANVAS */}
        <div className="lg:col-span-8 space-y-4">
          
          {presentation ? (
            <>
              {/* TOP ACTION & EXPORT TOOLBAR */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-slate-200 p-3.5 rounded-2xl shadow-xs">
                
                {/* View Switcher */}
                <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
                  <button
                    onClick={() => setViewMode("editor")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-black transition cursor-pointer ${
                      viewMode === "editor" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Slide Editor
                  </button>
                  <button
                    onClick={() => setViewMode("preview")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-black transition cursor-pointer flex items-center gap-1 ${
                      viewMode === "preview" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5 text-indigo-600" />
                    <span>PDF / Slide Preview</span>
                  </button>
                </div>

                {/* Exports & Add Slide */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleAddNewSlide}
                    className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-extrabold text-xs rounded-xl flex items-center gap-1 cursor-pointer transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Slide</span>
                  </button>

                  <button
                    onClick={handleDownloadPPTX}
                    disabled={downloadingPPTX}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-extrabold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs transition active:scale-95"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{downloadingPPTX ? "Building..." : "PowerPoint (.pptx)"}</span>
                  </button>

                  <button
                    onClick={handleDownloadPDF}
                    disabled={downloadingPDF}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-extrabold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs transition active:scale-95"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>{downloadingPDF ? "Building..." : "Landscape PDF"}</span>
                  </button>
                </div>
              </div>

              {/* VIEW MODE 1: SLIDE EDITOR */}
              {viewMode === "editor" && activeSlide && (
                <div className="space-y-4">
                  
                  {/* THUMBNAIL STRIP */}
                  <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-1">
                    {presentation.slides.map((s, idx) => (
                      <button
                        key={s.slide_number}
                        onClick={() => setActiveSlideIdx(idx)}
                        className={`shrink-0 w-32 p-2.5 rounded-2xl border text-left transition cursor-pointer relative ${
                          activeSlideIdx === idx
                            ? "border-indigo-600 bg-indigo-50/80 ring-2 ring-indigo-500/20 shadow-xs"
                            : "border-slate-200 hover:border-slate-300 bg-white"
                        }`}
                      >
                        <div className="flex items-center justify-between text-[10px] font-black text-slate-500 mb-1">
                          <span>Slide {idx + 1}</span>
                          <span className="uppercase text-[8px] bg-slate-200 px-1 rounded">{s.layout.replace("_", " ")}</span>
                        </div>
                        <div className="text-[11px] font-bold text-slate-900 truncate">{s.title || "Untitled"}</div>
                      </button>
                    ))}
                  </div>

                  {/* ACTIVE SLIDE EDITOR WORKBENCH */}
                  <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-6">
                    
                    {/* SLIDE CONTROL TOOLBAR */}
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                      
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-xl">
                          Slide {activeSlideIdx + 1} of {presentation.slides.length}
                        </span>

                        {/* Layout Selector */}
                        <select
                          value={activeSlide.layout}
                          onChange={(e) => updateActiveSlide({ layout: e.target.value })}
                          className="bg-slate-100 border border-slate-300 text-xs font-bold text-slate-800 rounded-xl px-2.5 py-1 cursor-pointer"
                        >
                          <option value="title_bullets">Layout: Title & Bullets</option>
                          <option value="two_column">Layout: Two Columns Comparison</option>
                          <option value="stat_highlight">Layout: Key Metrics / Stats</option>
                          <option value="quote_insight">Layout: Insight / Quote</option>
                        </select>
                      </div>

                      {/* Slide Reorder / Duplicate / Delete */}
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleMoveSlide(activeSlideIdx, activeSlideIdx - 1)}
                          disabled={activeSlideIdx === 0}
                          className="p-1.5 text-slate-500 hover:text-slate-800 disabled:opacity-30 rounded-lg hover:bg-slate-100"
                          title="Move Slide Up"
                        >
                          <ArrowUp className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleMoveSlide(activeSlideIdx, activeSlideIdx + 1)}
                          disabled={activeSlideIdx === presentation.slides.length - 1}
                          className="p-1.5 text-slate-500 hover:text-slate-800 disabled:opacity-30 rounded-lg hover:bg-slate-100"
                          title="Move Slide Down"
                        >
                          <ArrowDown className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDuplicateSlide(activeSlideIdx)}
                          className="p-1.5 text-slate-500 hover:text-indigo-700 rounded-lg hover:bg-indigo-50"
                          title="Duplicate Slide"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteSlide(activeSlideIdx)}
                          className="p-1.5 text-slate-500 hover:text-rose-700 rounded-lg hover:bg-rose-50"
                          title="Delete Slide"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>

                        {/* AI Polish Button */}
                        <button
                          onClick={() => setShowRefineModal(true)}
                          disabled={refiningSlide}
                          className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 font-extrabold text-xs rounded-xl flex items-center gap-1 cursor-pointer transition ml-2"
                        >
                          <Wand2 className="w-3.5 h-3.5" />
                          <span>{refiningSlide ? "Refining..." : "AI Polish"}</span>
                        </button>
                      </div>
                    </div>

                    {/* EDITABLE FIELDS */}
                    <div className="space-y-4">
                      
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="sm:col-span-1">
                          <label className="block text-[10px] font-extrabold text-slate-500 mb-1">Category / Tag</label>
                          <input
                            type="text"
                            value={activeSlide.category}
                            onChange={(e) => updateActiveSlide({ category: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-[10px] font-extrabold text-slate-500 mb-1">Slide Title</label>
                          <input
                            type="text"
                            value={activeSlide.title}
                            onChange={(e) => updateActiveSlide({ title: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-black text-slate-900"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-extrabold text-slate-500 mb-1">Subtitle (Optional)</label>
                        <input
                          type="text"
                          value={activeSlide.subtitle || ""}
                          onChange={(e) => updateActiveSlide({ subtitle: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium text-slate-700"
                          placeholder="Supporting sentence or takeaway..."
                        />
                      </div>

                      {/* LAYOUT BODY CONTENT */}
                      {activeSlide.layout === "two_column" ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                          {/* Column 1 */}
                          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                            <label className="block text-[10px] font-black text-slate-700">Column 1 Title</label>
                            <input
                              type="text"
                              value={activeSlide.left_column?.title || "Part A"}
                              onChange={(e) => {
                                const left = { ...activeSlide.left_column, title: e.target.value, bullets: activeSlide.left_column?.bullets || [] };
                                updateActiveSlide({ left_column: left });
                              }}
                              className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-800"
                            />
                            <label className="block text-[10px] font-black text-slate-700">Column 1 Bullets (one per line)</label>
                            <textarea
                              rows={4}
                              value={(activeSlide.left_column?.bullets || []).join("\n")}
                              onChange={(e) => {
                                const left = { ...activeSlide.left_column, title: activeSlide.left_column?.title || "Part A", bullets: e.target.value.split("\n") };
                                updateActiveSlide({ left_column: left });
                              }}
                              className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs font-medium text-slate-800"
                            />
                          </div>

                          {/* Column 2 */}
                          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                            <label className="block text-[10px] font-black text-slate-700">Column 2 Title</label>
                            <input
                              type="text"
                              value={activeSlide.right_column?.title || "Part B"}
                              onChange={(e) => {
                                const right = { ...activeSlide.right_column, title: e.target.value, bullets: activeSlide.right_column?.bullets || [] };
                                updateActiveSlide({ right_column: right });
                              }}
                              className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-800"
                            />
                            <label className="block text-[10px] font-black text-slate-700">Column 2 Bullets (one per line)</label>
                            <textarea
                              rows={4}
                              value={(activeSlide.right_column?.bullets || []).join("\n")}
                              onChange={(e) => {
                                const right = { ...activeSlide.right_column, title: activeSlide.right_column?.title || "Part B", bullets: e.target.value.split("\n") };
                                updateActiveSlide({ right_column: right });
                              }}
                              className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs font-medium text-slate-800"
                            />
                          </div>
                        </div>
                      ) : activeSlide.layout === "stat_highlight" ? (
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                          <span className="text-[11px] font-black text-slate-800 block">Metric Callout Cards</span>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {[0, 1, 2].map((idx) => {
                              const metric = (activeSlide.metrics || [])[idx] || { value: "100%", label: "Key Stat" };
                              return (
                                <div key={idx} className="bg-white p-3 rounded-xl border border-slate-200 space-y-2">
                                  <input
                                    type="text"
                                    value={metric.value}
                                    onChange={(e) => {
                                      const metrics = [...(activeSlide.metrics || [{ value: "", label: "" }, { value: "", label: "" }, { value: "", label: "" }])];
                                      metrics[idx] = { ...metrics[idx], value: e.target.value };
                                      updateActiveSlide({ metrics });
                                    }}
                                    placeholder="e.g. 99.9%"
                                    className="w-full text-center font-black text-indigo-700 text-lg border border-slate-200 rounded-lg py-1"
                                  />
                                  <input
                                    type="text"
                                    value={metric.label}
                                    onChange={(e) => {
                                      const metrics = [...(activeSlide.metrics || [{ value: "", label: "" }, { value: "", label: "" }, { value: "", label: "" }])];
                                      metrics[idx] = { ...metrics[idx], label: e.target.value };
                                      updateActiveSlide({ metrics });
                                    }}
                                    placeholder="Metric label"
                                    className="w-full text-center font-bold text-slate-700 text-xs border border-slate-200 rounded-lg py-1"
                                  />
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ) : activeSlide.layout === "quote_insight" ? (
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                          <label className="block text-[10px] font-black text-slate-700">Quote / Axiom Text</label>
                          <textarea
                            rows={3}
                            value={activeSlide.quote?.text || ""}
                            onChange={(e) => updateActiveSlide({ quote: { text: e.target.value, author: activeSlide.quote?.author || "Expert Insight" } })}
                            className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs font-bold text-slate-900 italic"
                          />
                          <label className="block text-[10px] font-black text-slate-700">Author / Source</label>
                          <input
                            type="text"
                            value={activeSlide.quote?.author || ""}
                            onChange={(e) => updateActiveSlide({ quote: { text: activeSlide.quote?.text || "", author: e.target.value } })}
                            className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-800"
                          />
                        </div>
                      ) : (
                        /* Standard Bullets List */
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <label className="text-[10px] font-extrabold text-slate-700">Bullet Points</label>
                            <button
                              onClick={handleAddBullet}
                              className="text-[10px] font-extrabold text-indigo-600 hover:underline flex items-center gap-0.5 cursor-pointer"
                            >
                              <Plus className="w-3 h-3" /> Add Bullet Point
                            </button>
                          </div>

                          <div className="space-y-2">
                            {activeSlide.bullets.map((b, bIdx) => (
                              <div key={bIdx} className="flex items-start gap-2">
                                <span className="text-xs font-black text-indigo-600 pt-2 shrink-0">•</span>
                                <textarea
                                  rows={2}
                                  value={b}
                                  onChange={(e) => handleUpdateBullet(bIdx, e.target.value)}
                                  className="flex-1 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:bg-white rounded-xl p-2.5 text-xs font-medium text-slate-800 leading-relaxed"
                                />
                                <button
                                  onClick={() => handleDeleteBullet(bIdx)}
                                  className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition shrink-0"
                                  title="Delete point"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* SLIDE IMAGE SECTION */}
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          {activeSlide.image_url ? (
                            <img
                              src={activeSlide.image_url}
                              alt={activeSlide.image_caption || activeSlide.title}
                              className="w-16 h-16 object-cover rounded-xl border border-slate-300 shadow-xs"
                            />
                          ) : (
                            <div className="w-16 h-16 rounded-xl bg-slate-200 flex items-center justify-center text-slate-400">
                              <ImageIcon className="w-6 h-6" />
                            </div>
                          )}
                          <div>
                            <div className="text-xs font-black text-slate-900">Slide Illustration & Media</div>
                            <div className="text-[10px] text-slate-500 max-w-sm truncate font-medium">
                              {activeSlide.image_caption || `Visual: ${activeSlide.image_keyword}`}
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            setCustomImageUrl(activeSlide.image_url || "");
                            setCustomImageKeyword(activeSlide.image_keyword || "");
                            setShowImageModal(true);
                          }}
                          className="px-3.5 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 rounded-xl text-xs font-extrabold text-slate-800 transition cursor-pointer shadow-xs"
                        >
                          Change Image / Keyword
                        </button>
                      </div>

                      {/* TEACHER SPEAKER NOTES */}
                      <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-1.5">
                        <label className="block text-[11px] font-black text-amber-900 flex items-center gap-1">
                          <span>💡</span> Teacher Speaker Guidance & Pedagogy Notes:
                        </label>
                        <textarea
                          rows={2}
                          value={activeSlide.speaker_notes}
                          onChange={(e) => updateActiveSlide({ speaker_notes: e.target.value })}
                          className="w-full bg-white border border-amber-300 rounded-xl p-2.5 text-xs font-medium text-slate-900 leading-relaxed"
                          placeholder="Notes to guide you when presenting this slide to students..."
                        />
                      </div>

                    </div>
                  </div>
                </div>
              )}

              {/* VIEW MODE 2: PDF / PRESENTATION SLIDE PREVIEW */}
              {viewMode === "preview" && (
                <div className={`space-y-4 ${isFullscreen ? "fixed inset-0 z-50 bg-slate-950 p-6 flex flex-col justify-between" : ""}`}>
                  
                  {/* Presentation Mode Controls */}
                  <div className="flex items-center justify-between bg-white border border-slate-200 p-3 rounded-2xl shadow-xs">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setActiveSlideIdx((prev) => Math.max(0, prev - 1))}
                        disabled={activeSlideIdx === 0}
                        className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-30 text-slate-800 cursor-pointer"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>

                      <span className="text-xs font-black text-slate-900 px-2">
                        Slide {activeSlideIdx + 1} / {presentation.slides.length}
                      </span>

                      <button
                        onClick={() => setActiveSlideIdx((prev) => Math.min(presentation.slides.length - 1, prev + 1))}
                        disabled={activeSlideIdx === presentation.slides.length - 1}
                        className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-30 text-slate-800 cursor-pointer"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setIsFullscreen(!isFullscreen)}
                        className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 cursor-pointer"
                        title="Toggle Fullscreen"
                      >
                        {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* 16:9 SLIDE CARD CANVAS (MATCHES PDF EXACTLY) */}
                  {activeSlide && (
                    <div
                      className={`w-full aspect-[16/9] rounded-3xl border shadow-xl p-8 sm:p-12 flex flex-col justify-between transition-all overflow-hidden relative ${
                        isFullscreen ? "max-w-6xl mx-auto my-auto" : ""
                      }`}
                      style={{
                        backgroundColor: currentTheme.id === "dark_cyber" ? "#0F172A" : "#FFFFFF",
                        borderColor: currentTheme.accent
                      }}
                    >
                      {/* Top Header Bar */}
                      <div>
                        <div className="flex items-center justify-between border-b pb-3 mb-4" style={{ borderColor: currentTheme.accent + "40" }}>
                          <span className="text-xs font-black tracking-widest uppercase" style={{ color: currentTheme.accent }}>
                            {activeSlide.category} • DEVGYA AI STUDY SUITE
                          </span>
                          <span className="text-xs font-bold text-slate-400">
                            Slide {activeSlide.slide_number} of {presentation.slides.length}
                          </span>
                        </div>

                        <h2 className="text-2xl sm:text-3xl font-black leading-tight tracking-tight" style={{ color: currentTheme.primary }}>
                          {activeSlide.title}
                        </h2>
                        {activeSlide.subtitle && (
                          <p className="text-sm font-medium mt-1 text-slate-500">
                            {activeSlide.subtitle}
                          </p>
                        )}
                      </div>

                      {/* Main Slide Body */}
                      <div className="my-auto py-4">
                        {activeSlide.layout === "two_column" && (activeSlide.left_column || activeSlide.right_column) ? (
                          <div className="grid grid-cols-2 gap-6">
                            <div className="p-5 bg-slate-50/80 rounded-2xl border border-slate-200 space-y-2">
                              <h3 className="text-base font-black" style={{ color: currentTheme.primary }}>
                                {activeSlide.left_column?.title}
                              </h3>
                              <ul className="space-y-2 text-xs sm:text-sm font-medium text-slate-700">
                                {activeSlide.left_column?.bullets.map((b, i) => (
                                  <li key={i} className="flex items-start gap-2">
                                    <span className="text-indigo-600 font-bold">•</span>
                                    <span>{b}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            <div className="p-5 bg-slate-50/80 rounded-2xl border border-slate-200 space-y-2">
                              <h3 className="text-base font-black" style={{ color: currentTheme.primary }}>
                                {activeSlide.right_column?.title}
                              </h3>
                              <ul className="space-y-2 text-xs sm:text-sm font-medium text-slate-700">
                                {activeSlide.right_column?.bullets.map((b, i) => (
                                  <li key={i} className="flex items-start gap-2">
                                    <span className="text-indigo-600 font-bold">•</span>
                                    <span>{b}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        ) : activeSlide.layout === "stat_highlight" && activeSlide.metrics ? (
                          <div className="grid grid-cols-3 gap-6 text-center">
                            {activeSlide.metrics.slice(0, 3).map((m, i) => (
                              <div key={i} className="p-6 bg-slate-50/80 border rounded-2xl space-y-2" style={{ borderColor: currentTheme.accent }}>
                                <div className="text-4xl sm:text-5xl font-black" style={{ color: currentTheme.accent }}>
                                  {m.value}
                                </div>
                                <div className="text-xs sm:text-sm font-bold text-slate-800">
                                  {m.label}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : activeSlide.layout === "quote_insight" && activeSlide.quote ? (
                          <div className="max-w-2xl mx-auto text-center space-y-4 p-8 bg-slate-50/60 rounded-3xl border border-slate-200">
                            <blockquote className="text-xl sm:text-2xl font-bold italic" style={{ color: currentTheme.primary }}>
                              “{activeSlide.quote.text}”
                            </blockquote>
                            <cite className="block text-xs font-black uppercase tracking-wider" style={{ color: currentTheme.accent }}>
                              — {activeSlide.quote.author}
                            </cite>
                          </div>
                        ) : (
                          /* Standard Bullets + Visual Card */
                          <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
                            <div className="sm:col-span-8 space-y-3">
                              {activeSlide.bullets.map((b, i) => (
                                <div key={i} className="flex items-start gap-3 text-xs sm:text-sm font-medium text-slate-800 leading-relaxed">
                                  <span className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: currentTheme.accent }}></span>
                                  <div>
                                    <Markdown content={b} />
                                  </div>
                                </div>
                              ))}
                            </div>

                            {activeSlide.image_url && (
                              <div className="sm:col-span-4">
                                <img
                                  src={activeSlide.image_url}
                                  alt={activeSlide.image_caption || activeSlide.title}
                                  className="w-full h-44 object-cover rounded-2xl shadow-md border border-slate-200"
                                />
                                {activeSlide.image_caption && (
                                  <p className="text-[10px] text-slate-500 font-medium text-center mt-1.5 italic">
                                    {activeSlide.image_caption}
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Bottom Footer & Speaker Notes */}
                      <div className="border-t pt-3 flex items-center justify-between text-[11px] text-slate-400 font-medium">
                        <span>Topic: {presentation.topic} • Audience: {presentation.target_audience}</span>
                        <span>DEVGYA Global Edutech Private Limited</span>
                      </div>
                    </div>
                  )}

                  {/* Speaker Notes Preview Box */}
                  {activeSlide?.speaker_notes && (
                    <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-2xl text-xs space-y-1">
                      <span className="font-black text-amber-900 flex items-center gap-1.5">
                        <span>🎙️</span> Presenter Speaker Notes:
                      </span>
                      <p className="text-slate-800 font-medium leading-relaxed">
                        {activeSlide.speaker_notes}
                      </p>
                    </div>
                  )}
                </div>
              )}

            </>
          ) : (
            /* EMPTY STATE HERO */
            <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-4 shadow-xs">
              <div className="w-16 h-16 bg-indigo-50 border border-indigo-200 rounded-2xl flex items-center justify-center mx-auto text-indigo-600">
                <Sliders className="w-8 h-8" />
              </div>
              <div className="space-y-1 max-w-md mx-auto">
                <h3 className="text-lg font-black text-slate-900">Ready to build your slide presentation?</h3>
                <p className="text-xs text-slate-500 font-medium">
                  Enter any study topic on the left panel (e.g. Science, Mathematics, History, Soft Skills, Coding), choose your audience, and let AI build a fully editable slide deck with speaker notes and images.
                </p>
              </div>

              {/* Sample Topic Buttons */}
              <div className="flex flex-wrap justify-center gap-2 pt-2">
                {TOPIC_CHIPS.slice(0, 3).map((chip) => (
                  <button
                    key={chip}
                    onClick={() => {
                      setTopic(chip);
                    }}
                    className="text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3.5 py-1.5 rounded-xl transition cursor-pointer"
                  >
                    Try: {chip}
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* MODAL 1: CHANGE SLIDE IMAGE */}
      {showImageModal && activeSlide && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-indigo-600" />
              <span>Update Slide Media</span>
            </h3>

            <div className="space-y-2">
              <label className="block text-xs font-extrabold text-slate-700">Custom Image Direct URL</label>
              <input
                type="text"
                value={customImageUrl}
                onChange={(e) => setCustomImageUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-extrabold text-slate-700">Or Search Keyword</label>
              <input
                type="text"
                value={customImageKeyword}
                onChange={(e) => setCustomImageKeyword(e.target.value)}
                placeholder="e.g. quantum computer, space telescope, plant cell"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowImageModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-extrabold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  updateActiveSlide({
                    image_url: customImageUrl || undefined,
                    image_keyword: customImageKeyword || activeSlide.image_keyword
                  });
                  setShowImageModal(false);
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black cursor-pointer"
              >
                Save Image
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: AI POLISH SLIDE */}
      {showRefineModal && activeSlide && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Wand2 className="w-5 h-5 text-purple-600" />
              <span>AI Polish This Slide</span>
            </h3>

            <p className="text-xs text-slate-500 font-medium">
              Tell the AI how you want to refine slide {activeSlideIdx + 1} ("{activeSlide.title}"):
            </p>

            {/* Quick action chips */}
            <div className="flex flex-wrap gap-1.5">
              {[
                "Simplify text for younger students",
                "Add 2 more real-world practical examples",
                "Rephrase into sharp, punchy bullet points",
                "Add an Indian case study example"
              ].map((chip) => (
                <button
                  key={chip}
                  onClick={() => setRefinePrompt(chip)}
                  className="text-[10px] font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 px-2.5 py-1 rounded-lg transition text-left cursor-pointer"
                >
                  ⚡ {chip}
                </button>
              ))}
            </div>

            <textarea
              rows={3}
              value={refinePrompt}
              onChange={(e) => setRefinePrompt(e.target.value)}
              placeholder="e.g. Make it simpler and add an analogy..."
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowRefineModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-extrabold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleExecuteRefine()}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-black cursor-pointer"
              >
                Apply AI Polish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FLOATING ACTION PILL ON MOBILE TO OPEN POPUP RESULT */}
      {presentation && !showMobileModal && (
        <div className="lg:hidden fixed bottom-6 left-4 right-4 z-40 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <button
            type="button"
            onClick={() => setShowMobileModal(true)}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:from-indigo-700 hover:to-purple-800 text-white font-black text-xs rounded-2xl shadow-2xl shadow-indigo-500/40 flex items-center justify-center gap-2 border border-white/20 active:scale-95 transition cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
            <span>View Generated PPT ({presentation.slides.length} Slides)</span>
          </button>
        </div>
      )}

      {/* FULL-SCREEN MOBILE POP-UP MODAL RESULT */}
      {showMobileModal && presentation && (
        <div className="lg:hidden fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex flex-col justify-end p-0 overflow-hidden animate-in fade-in duration-200">
          <div className="bg-white rounded-t-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border-t border-slate-200">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/90">
              <div className="min-w-0 pr-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 block">
                  AI Generated Presentation
                </span>
                <h3 className="text-sm font-black text-slate-900 truncate">
                  {presentation.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowMobileModal(false)}
                className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 flex items-center justify-center text-slate-700 transition cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Slide Navigation Bar */}
            <div className="px-4 py-2.5 bg-indigo-50/60 border-b border-indigo-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setActiveSlideIdx((prev) => Math.max(0, prev - 1))}
                disabled={activeSlideIdx === 0}
                className="px-2.5 py-1 bg-white border border-slate-200 disabled:opacity-40 rounded-lg text-xs font-black text-slate-700 flex items-center gap-1 shadow-2xs cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Prev</span>
              </button>

              <span className="text-xs font-black text-indigo-900">
                Slide {activeSlideIdx + 1} of {presentation.slides.length}
              </span>

              <button
                type="button"
                onClick={() => setActiveSlideIdx((prev) => Math.min(presentation.slides.length - 1, prev + 1))}
                disabled={activeSlideIdx === presentation.slides.length - 1}
                className="px-2.5 py-1 bg-white border border-slate-200 disabled:opacity-40 rounded-lg text-xs font-black text-slate-700 flex items-center gap-1 shadow-2xs cursor-pointer"
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Modal Body: Slide Canvas Preview */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {activeSlide && (
                <div
                  className="rounded-2xl p-5 border shadow-sm space-y-4"
                  style={{
                    backgroundColor: currentTheme.bg.startsWith("#") ? currentTheme.bg : "#ffffff",
                    borderColor: currentTheme.primary + "30"
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md text-white"
                      style={{ backgroundColor: currentTheme.accent }}
                    >
                      {activeSlide.category || "Core Concept"}
                    </span>
                    <span className="text-[10px] text-slate-500 font-bold">
                      {activeSlide.layout.replace("_", " ")}
                    </span>
                  </div>

                  <div>
                    <h2
                      className="text-base font-black leading-tight"
                      style={{ color: currentTheme.primary }}
                    >
                      {activeSlide.title}
                    </h2>
                    {activeSlide.subtitle && (
                      <p className="text-xs font-medium text-slate-600 mt-1">
                        {activeSlide.subtitle}
                      </p>
                    )}
                  </div>

                  {/* Real Image Preview */}
                  {activeSlide.image_url && (
                    <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-100 relative">
                      <img
                        src={activeSlide.image_url}
                        alt={activeSlide.image_caption || activeSlide.image_keyword}
                        className="w-full h-44 object-cover"
                        loading="lazy"
                      />
                      <div className="p-2 bg-white/95 backdrop-blur-xs text-[10px] font-semibold text-slate-700 border-t border-slate-100 flex items-center justify-between">
                        <span className="truncate">{activeSlide.image_caption || activeSlide.image_keyword}</span>
                        <span className="text-[9px] text-indigo-600 font-bold shrink-0 ml-1">HD Visual</span>
                      </div>
                    </div>
                  )}

                  {/* Slide Bullets */}
                  {activeSlide.bullets && activeSlide.bullets.length > 0 && (
                    <div className="space-y-2 bg-white/80 rounded-xl p-3 border border-slate-100">
                      {activeSlide.bullets.map((b, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs font-semibold text-slate-800">
                          <span
                            className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0"
                            style={{ backgroundColor: currentTheme.accent }}
                          />
                          <span>{b.replace(/\*\*/g, "")}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Speaker Notes */}
                  {activeSlide.speaker_notes && (
                    <div className="p-3 rounded-xl bg-slate-100/90 text-slate-700 text-[11px] space-y-1">
                      <span className="font-extrabold text-slate-900 block text-[10px] uppercase tracking-wider">
                        Teacher Speaker Notes:
                      </span>
                      <p className="leading-relaxed">{activeSlide.speaker_notes}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer: Quick Download Buttons */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleDownloadPPTX}
                disabled={downloadingPPTX}
                className="py-2.5 px-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-black flex items-center justify-center gap-1.5 shadow-xs cursor-pointer active:scale-95 transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{downloadingPPTX ? "Building..." : "Download PPTX"}</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadPDF}
                disabled={downloadingPDF}
                className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-black flex items-center justify-center gap-1.5 shadow-xs cursor-pointer active:scale-95 transition"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>{downloadingPDF ? "Building..." : "Landscape PDF"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
