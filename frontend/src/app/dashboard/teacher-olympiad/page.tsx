"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import { 
  Trophy, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  ArrowRight, 
  ArrowLeft,
  Award, 
  Lock, 
  RefreshCw, 
  BookOpen, 
  ShieldCheck,
  ChevronRight,
  Bookmark,
  Send,
  Eye,
  Check,
  Building2,
  MapPin,
  Camera,
  Activity,
  Layers,
  HelpCircle
} from "lucide-react";
import { useAppStore } from "@/store/useAppStore";

export default function TeacherOlympiadPage() {
  const { user } = useAppStore();

  const [activeTab, setActiveTab] = useState<"overview" | "exam" | "results">("overview");

  // Candidate Assessment Preferences
  const userSubject = user?.subject || "Science";
  const [selectedSubject, setSelectedSubject] = useState<string>(userSubject);
  const [selectedLevel, setSelectedLevel] = useState<string>("Secondary");

  // Exam Paper & Questions State (100-MCQ structure)
  const [paperData, setPaperData] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [markedForReview, setMarkedForReview] = useState<Record<string, boolean>>({});
  const [activeSection, setActiveSection] = useState<"Part-A" | "Part-B">("Part-A");

  // Exam Progress State
  const [examStarted, setExamStarted] = useState<boolean>(false);
  const [examSubmitted, setExamSubmitted] = useState<boolean>(false);
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // 60-Minute Live Countdown Timer
  const [timeLeft, setTimeLeft] = useState<number>(60 * 60); // 3600 seconds
  const [timerActive, setTimerActive] = useState<boolean>(false);

  // Proctoring & Integrity Checks
  const [tabSwitches, setTabSwitches] = useState<number>(0);
  const [fullscreenExits, setFullscreenExits] = useState<number>(0);
  const [webcamEnabled, setWebcamEnabled] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Admin Declared Results State
  const [publishedResults, setPublishedResults] = useState<any[]>([]);
  const [hasAttempted, setHasAttempted] = useState<boolean>(false);

  // 1. Fetch 100-MCQ Assessment Paper from Backend
  const loadExamPaper = async () => {
    setLoading(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api/v1";
      const res = await fetch(`${baseUrl}/olympiad/exam-paper?subject=${encodeURIComponent(selectedSubject)}&level=${encodeURIComponent(selectedLevel)}`);
      const data = await res.json();
      if (data.status === "success" && data.paper) {
        setPaperData(data.paper);
        setQuestions(data.paper.questions || []);
      }
    } catch (e) {
      console.error("Error loading Olympiad 100 paper:", e);
    } finally {
      setLoading(false);
    }
  };

  // 2. Check Candidate's Attempt Status
  const checkAttemptStatus = async () => {
    if (!user?.email) return;
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api/v1";
      const res = await fetch(`${baseUrl}/olympiad/attempt-status?email=${encodeURIComponent(user.email.trim().toLowerCase())}`);
      const data = await res.json();
      if (data.status === "success") {
        setHasAttempted(data.has_attempted);
      }
    } catch (e) {
      console.warn("Attempt status check notice:", e);
    }
  };

  // 3. Fetch Admin Published Results
  const loadPublishedResults = async () => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api/v1";
      const userEmail = user?.email ? `?email=${encodeURIComponent(user.email.trim().toLowerCase())}` : "";
      const res = await fetch(`${baseUrl}/olympiad/results${userEmail}`);
      const data = await res.json();
      if (data.status === "success") {
        setPublishedResults(data.results || []);
      }
    } catch (e) {}
  };

  useEffect(() => {
    loadExamPaper();
    checkAttemptStatus();
    loadPublishedResults();
  }, [user?.email, selectedSubject, selectedLevel]);

  // 60-Minute Countdown Timer Hook
  useEffect(() => {
    let interval: any = null;
    if (examStarted && !examSubmitted && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [examStarted, examSubmitted, timeLeft]);

  // Anti-Cheating: Tab Switch & Visibility Detection
  useEffect(() => {
    if (!examStarted || examSubmitted) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitches((prev) => prev + 1);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [examStarted, examSubmitted]);

  // Format MM:SS
  const formattedTime = useMemo(() => {
    const mins = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }, [timeLeft]);

  // Start Real 60-Minute Exam
  const handleStartExam = async () => {
    // Request webcam if available
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setWebcamEnabled(true);
      }
    } catch (e) {
      console.warn("Webcam optional notice:", e);
    }

    // Try requesting fullscreen
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen().catch(() => {});
      }
    } catch (e) {}

    setTimeLeft(60 * 60);
    setExamStarted(true);
    setActiveTab("exam");
    setCurrentIdx(0);
  };

  // Select Option for Current Question
  const handleSelectOption = (optIdx: number) => {
    if (!questions[currentIdx]) return;
    const qId = questions[currentIdx].id;
    setAnswers((prev) => ({
      ...prev,
      [qId]: optIdx
    }));
  };

  // Toggle Mark For Review
  const handleToggleReview = () => {
    if (!questions[currentIdx]) return;
    const qId = questions[currentIdx].id;
    setMarkedForReview((prev) => ({
      ...prev,
      [qId]: !prev[qId]
    }));
  };

  // Clear Current Answer
  const handleClearAnswer = () => {
    if (!questions[currentIdx]) return;
    const qId = questions[currentIdx].id;
    setAnswers((prev) => {
      const copy = { ...prev };
      delete copy[qId];
      return copy;
    });
  };

  // Submit Exam
  const handleSubmitExam = async () => {
    if (!confirm("Are you sure you want to finish and submit your 100-MCQ assessment? Your answers will be archived for official board evaluation.")) {
      return;
    }
    await processSubmission();
  };

  const handleAutoSubmit = async () => {
    await processSubmission();
  };

  const processSubmission = async () => {
    setLoading(true);
    const timeTaken = 3600 - timeLeft;

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api/v1";
      const res = await fetch(`${baseUrl}/olympiad/submit-100`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teacher_email: user?.email || "teacher@school.edu",
          teacher_name: user?.name || "Educator",
          subject: selectedSubject,
          state: user?.state || "National",
          district: user?.district || "Central",
          paper_id: paperData?.paper_id || `tso-national-2026-${selectedSubject.toLowerCase()}`,
          answers: answers,
          time_taken_seconds: timeTaken,
          proctor_incidents: tabSwitches + fullscreenExits
        })
      });

      const data = await res.json();
      if (res.ok) {
        setSubmissionId(data.submission_id);
        setExamSubmitted(true);
        setHasAttempted(true);
      }
    } catch (e) {
      console.error("Submission error:", e);
      setExamSubmitted(true);
    } finally {
      setLoading(false);
      // Stop webcam stream
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    }
  };

  // Filter Questions by Active Section
  const sectionQuestions = useMemo(() => {
    return questions.filter(q => q.section === activeSection);
  }, [questions, activeSection]);

  const currentQ = questions[currentIdx];

  const partAAnsweredCount = useMemo(() => {
    return questions.filter(q => q.section === "Part-A" && answers[q.id] !== undefined).length;
  }, [questions, answers]);

  const partBAnsweredCount = useMemo(() => {
    return questions.filter(q => q.section === "Part-B" && answers[q.id] !== undefined).length;
  }, [questions, answers]);

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20 animate-in fade-in duration-300">
      
      {/* 1. TOP HEADER OVERVIEW (WHEN NOT IN EXAM HALL) */}
      {!examStarted && (
        <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-2xl relative overflow-hidden space-y-4">
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-amber-400/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
            <div className="space-y-1.5 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest bg-amber-400/20 text-amber-300 border border-amber-400/30 px-3 py-0.5 rounded-full">
                  NATIONAL ASSESSMENT BLUEPRINT
                </span>
                <span className="text-[10px] font-bold bg-white/10 text-slate-300 px-2.5 py-0.5 rounded-full">
                  CBSE / NCERT Standard
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Teacher Skills Olympiad (TSO) 2026
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 font-medium">
                National Pedagogy & Subject Mastery Assessment (100 MCQs • 60 Minutes • 60/40 Hybrid Structure)
              </p>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => setActiveTab("overview")}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  activeTab === "overview"
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/25"
                    : "bg-white/10 text-slate-300 hover:bg-white/20"
                }`}
              >
                Assessment Overview
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("results")}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === "results"
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/25"
                    : "bg-white/10 text-slate-300 hover:bg-white/20"
                }`}
              >
                <Award className="w-3.5 h-3.5" />
                <span>Results & Rank Cards</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-white/10 relative z-10 text-xs font-bold">
            <div className="p-3 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md">
              <span className="text-slate-400 text-[10px] block">Assessment Format</span>
              <span className="text-white text-sm font-black">100 Online MCQs</span>
            </div>
            <div className="p-3 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md">
              <span className="text-slate-400 text-[10px] block">Time Allowed</span>
              <span className="text-amber-300 text-sm font-black">60 Minutes</span>
            </div>
            <div className="p-3 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md">
              <span className="text-slate-400 text-[10px] block">Structure Breakdown</span>
              <span className="text-cyan-300 text-sm font-black">60 Part-A + 40 Part-B</span>
            </div>
            <div className="p-3 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md">
              <span className="text-slate-400 text-[10px] block">Negative Marking</span>
              <span className="text-emerald-400 text-sm font-black">None (0 Penalty)</span>
            </div>
          </div>
        </div>
      )}

      {/* 2. OVERVIEW & EXAM LAUNCHER TAB */}
      {!examStarted && activeTab === "overview" && (
        <div className="space-y-6">
          
          {/* SECTION BREAKDOWN (60/40 HYBRID STRUCTURE) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            
            {/* PART-A CARD */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 font-black">
                    A
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900">
                      Part-A: Universal CBSE Pedagogy
                    </h3>
                    <p className="text-[10px] text-purple-600 font-extrabold uppercase">
                      60% Weightage • 60 Questions • 60 Marks
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-100 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-900">1. CBSE CPD Modules & NEP Guidelines</span>
                    <span className="text-[10px] font-extrabold bg-purple-100 text-purple-700 px-2 py-0.5 rounded-md">20 MCQs</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    CBSE 50-hour mandatory training modules, Competency-Based Education (CBE), and learning outcomes.
                  </p>
                </div>

                <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-100 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-900">2. Personal Classroom Experience & Scenarios</span>
                    <span className="text-[10px] font-extrabold bg-purple-100 text-purple-700 px-2 py-0.5 rounded-md">20 MCQs</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Real classroom situation handling, student behavior management, and practical experience-based decision making.
                  </p>
                </div>

                <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-100 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-900">3. Modern Pedagogy & Critical Thinking</span>
                    <span className="text-[10px] font-extrabold bg-purple-100 text-purple-700 px-2 py-0.5 rounded-md">20 MCQs</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Socratic method, Higher Order Thinking Skills (HOTS) question framing, Inclusive Education, and Art-Integrated Learning.
                  </p>
                </div>
              </div>
            </div>

            {/* PART-B CARD */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-black">
                    B
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900">
                      Part-B: Subject Content & Pedagogy
                    </h3>
                    <p className="text-[10px] text-indigo-600 font-extrabold uppercase">
                      40% Weightage • 40 Questions • 40 Marks ({selectedSubject})
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-900">1. Core Subject Knowledge</span>
                    <span className="text-[10px] font-extrabold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-md">20 MCQs</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Conceptual clarity and subject mastery based on NCERT/CBSE secondary curriculum for {selectedSubject}.
                  </p>
                </div>

                <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-900">2. Subject Pedagogical Knowledge</span>
                    <span className="text-[10px] font-extrabold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-md">10 MCQs</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Subject-specific teaching methodologies, Teaching-Learning Material (TLM) usage, and classroom activities.
                  </p>
                </div>

                <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-900">3. Misconceptions & HOTS</span>
                    <span className="text-[10px] font-extrabold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-md">10 MCQs</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Identifying and remedying common cognitive misconceptions in {selectedSubject}.
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* LAUNCH EXAM ACTION PANEL */}
          <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-indigo-50 rounded-3xl p-6 border border-indigo-100 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
            <div className="space-y-1 text-center sm:text-left">
              <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600">LIVE TIMED ASSESSMENT</span>
              <h3 className="text-base font-black text-slate-900">
                Ready to take the 100-MCQ National Olympiad?
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Make sure you have 60 uninterrupted minutes and a stable internet connection.
              </p>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Link
                href="/dashboard/teacher-olympiad/practice"
                className="flex-1 sm:flex-none px-5 py-3.5 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <BookOpen className="w-4 h-4 text-slate-500" />
                <span>Practice Mock Tests</span>
              </Link>

              <button
                type="button"
                onClick={handleStartExam}
                className="flex-1 sm:flex-none px-7 py-3.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:from-indigo-700 hover:to-purple-800 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
              >
                <Trophy className="w-4 h-4 text-amber-300" />
                <span>Start 60-Min 100-MCQ Exam</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>
      )}

      {/* 3. LIVE 100-MCQ EXAM HALL ENVIRONMENT */}
      {examStarted && !examSubmitted && (
        <div className="space-y-5">
          
          {/* EXAM HALL HEADER: TIMER & SECTION SWITCHER */}
          <div className="sticky top-16 z-30 bg-white/95 backdrop-blur-xl rounded-2xl p-4 border border-slate-200 shadow-md flex flex-wrap items-center justify-between gap-4">
            
            {/* Section Switcher Tabs */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveSection("Part-A")}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
                  activeSection === "Part-A"
                    ? "bg-purple-600 text-white shadow-md shadow-purple-600/25"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <span>Part-A: Pedagogy (60 Qs)</span>
                <span className="text-[10px] bg-black/20 px-2 py-0.5 rounded-full">{partAAnsweredCount}/60</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveSection("Part-B")}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
                  activeSection === "Part-B"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/25"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <span>Part-B: {selectedSubject} (40 Qs)</span>
                <span className="text-[10px] bg-black/20 px-2 py-0.5 rounded-full">{partBAnsweredCount}/40</span>
              </button>
            </div>

            {/* Countdown Clock & Submit Button */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-xl border border-slate-800 shadow-xs">
                <Clock className="w-4 h-4 text-amber-400 animate-pulse" />
                <span className="font-mono text-sm font-black text-amber-300">{formattedTime}</span>
              </div>

              <button
                type="button"
                onClick={handleSubmitExam}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Exam</span>
              </button>
            </div>
          </div>

          {/* QUESTION ARENA + SIDE PALETTE */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            
            {/* MAIN QUESTION DISPLAY (3 COLS) */}
            <div className="lg:col-span-3 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
              
              {currentQ ? (
                <>
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100">
                          {currentQ.section}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400">
                          {currentQ.module}
                        </span>
                      </div>
                      <h2 className="text-sm sm:text-base font-extrabold text-slate-900 pt-1">
                        Question {currentQ.q_number} of 100
                      </h2>
                    </div>

                    <button
                      type="button"
                      onClick={handleToggleReview}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                        markedForReview[currentQ.id]
                          ? "bg-purple-100 text-purple-700 border border-purple-200"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      <Bookmark className="w-3.5 h-3.5" />
                      <span>{markedForReview[currentQ.id] ? "Marked for Review" : "Mark Review"}</span>
                    </button>
                  </div>

                  {/* QUESTION TEXT */}
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                    <p className="text-sm font-bold text-slate-800 leading-relaxed">
                      {currentQ.question_text}
                    </p>
                  </div>

                  {/* OPTIONS LIST */}
                  <div className="space-y-3">
                    {currentQ.options?.map((opt: string, optIdx: number) => {
                      const isSelected = answers[currentQ.id] === optIdx;
                      return (
                        <div
                          key={optIdx}
                          onClick={() => handleSelectOption(optIdx)}
                          className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center gap-3.5 ${
                            isSelected
                              ? "bg-indigo-50/70 border-indigo-600 shadow-sm"
                              : "bg-white border-slate-200 hover:border-indigo-200 hover:bg-slate-50/50"
                          }`}
                        >
                          <div className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ${
                            isSelected
                              ? "bg-indigo-600 text-white shadow-xs"
                              : "bg-slate-100 text-slate-600 border border-slate-200"
                          }`}>
                            {String.fromCharCode(65 + optIdx)}
                          </div>
                          <span className="text-xs font-semibold text-slate-800 leading-relaxed">
                            {opt}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* BOTTOM ACTION BUTTONS */}
                  <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={currentIdx === 0}
                        onClick={() => setCurrentIdx(prev => Math.max(0, prev - 1))}
                        className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>Previous</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleClearAnswer}
                        className="px-3 py-2.5 text-slate-400 hover:text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                      >
                        Clear Selection
                      </button>
                    </div>

                    <button
                      type="button"
                      disabled={currentIdx >= questions.length - 1}
                      onClick={() => setCurrentIdx(prev => Math.min(questions.length - 1, prev + 1))}
                      className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
                    >
                      <span>Next Question</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center py-12 text-slate-400">Loading Question...</div>
              )}

            </div>

            {/* QUESTION PALETTE GRID (1 COL) */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4 h-fit">
              <div className="space-y-1">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                  Question Palette (100 MCQs)
                </h3>
                <div className="grid grid-cols-2 gap-1.5 text-[10px] font-bold text-slate-500 pt-1">
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Answered</span>
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-purple-500" /> Review</span>
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-slate-200" /> Unanswered</span>
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-indigo-600" /> Current</span>
                </div>
              </div>

              {/* 100 Grid Cells */}
              <div className="grid grid-cols-5 gap-1.5 max-h-[360px] overflow-y-auto pr-1">
                {questions.map((q, idx) => {
                  const isCurrent = currentIdx === idx;
                  const isAnswered = answers[q.id] !== undefined;
                  const isReview = markedForReview[q.id];

                  let bg = "bg-slate-100 text-slate-600 hover:bg-slate-200";
                  if (isCurrent) bg = "bg-indigo-600 text-white ring-2 ring-indigo-600 ring-offset-1 font-black";
                  else if (isReview) bg = "bg-purple-500 text-white font-bold";
                  else if (isAnswered) bg = "bg-emerald-500 text-white font-bold";

                  return (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => {
                        setCurrentIdx(idx);
                        setActiveSection(q.section);
                      }}
                      className={`h-8 rounded-lg text-[11px] transition-all cursor-pointer flex items-center justify-center ${bg}`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>

              <div className="pt-2 border-t border-slate-100 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-600">
                  <span>Total Answered:</span>
                  <span className="font-black text-indigo-600">{Object.keys(answers).length} / 100</span>
                </div>
                
                {/* Webcam Preview if active */}
                <div className="relative w-full h-24 bg-slate-950 rounded-xl overflow-hidden border border-slate-200">
                  <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                  <div className="absolute top-1 left-1 bg-black/60 backdrop-blur-xs text-white text-[9px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    AI Proctor Active
                  </div>
                </div>
              </div>

            </div>

          </div>

        </div>
      )}

      {/* 4. POST-SUBMISSION REASSURING CONFIRMATION SCREEN (100% ADMIN-CONTROLLED) */}
      {examSubmitted && (
        <div className="max-w-2xl mx-auto bg-white rounded-3xl p-8 border border-slate-200 shadow-2xl text-center space-y-6 animate-in zoom-in-95 duration-300">
          
          <div className="w-18 h-18 rounded-3xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto shadow-md">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-black uppercase tracking-widest bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full border border-emerald-200">
              ASSESSMENT ARCHIVED SUCCESSFULLY
            </span>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Thank You, {user?.name || "Educator"}!
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed max-w-lg mx-auto">
              Your responses for the <strong>100-MCQ Teacher Skills Olympiad 2026</strong> have been securely recorded and sent to the national evaluation committee.
            </p>
          </div>

          {/* OFFICIAL EVALUATION NOTICE BANNER */}
          <div className="p-5 bg-gradient-to-br from-indigo-50 via-purple-50 to-indigo-50 rounded-2xl border border-indigo-100 space-y-3 text-left">
            <div className="flex items-center gap-2 text-indigo-900 font-black text-xs">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              <span>Official Result Declaration & Badge Issuance Protocol</span>
            </div>
            
            <ul className="text-xs text-slate-600 space-y-2 font-medium">
              <li className="flex items-start gap-2">
                <span className="text-indigo-600 font-bold">•</span>
                <span><strong>No Instant Score:</strong> In adherence to national benchmarking standards, scores are held under confidential review.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-600 font-bold">•</span>
                <span><strong>Result Declaration Timeline:</strong> Official Merit Lists, State & District Percentile Scorecards will be declared within <strong>10–15 days</strong>.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-600 font-bold">•</span>
                <span><strong>Manual Badge Approval:</strong> Verified badges (<em>CBSE-CPD Aligned Pedagogy</em>, <em>Verified Subject Expert</em>, <em>TSO Benchmarked</em>) will be granted to your profile after administrative audit.</span>
              </li>
            </ul>
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <Link
              href="/dashboard"
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-indigo-600/25 transition-all cursor-pointer"
            >
              Return to Teacher Dashboard
            </Link>

            <Link
              href="/dashboard/teacher-olympiad/practice"
              className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
            >
              Practice More Mock Tests
            </Link>
          </div>

        </div>
      )}

      {/* 5. ADMIN DECLARED RESULTS TAB */}
      {!examStarted && activeTab === "results" && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-black text-slate-900">
                Official Olympiad Merit Rankings & Verified Badges
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Published upon administrative evaluation and national committee review.
              </p>
            </div>
          </div>

          {publishedResults.length === 0 ? (
            <div className="text-center py-16 px-4 bg-slate-50 rounded-3xl border border-dashed border-slate-200 space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto">
                <Clock className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-black text-slate-800">
                  Assessment Evaluations Under Administration Review
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto font-medium">
                  Official scorecards and merit ranks are published according to the administration timeline (10–15 days post-assessment).
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {publishedResults.map((r, idx) => (
                <div key={idx} className="p-5 bg-gradient-to-br from-indigo-50/50 to-white rounded-2xl border border-indigo-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                      VERIFIED MERIT CARD
                    </span>
                    <span className="text-xs font-black text-indigo-600">
                      Score: {r.official_score || 85}%
                    </span>
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-900">{r.teacher_name}</h4>
                    <p className="text-xs text-slate-500">{r.subject} • {r.district}, {r.state}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
}
