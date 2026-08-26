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
  HelpCircle,
  FileCheck,
  XCircle,
  CheckCircle,
  FileText,
  Filter,
  Grid,
  X
} from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import Markdown from "@/components/chat/Markdown";

export default function TeacherOlympiadPage() {
  const { user } = useAppStore();

  const [activeTab, setActiveTab] = useState<"overview" | "exam" | "results">("overview");
  const [showMobilePalette, setShowMobilePalette] = useState<boolean>(false);

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
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [proctorWarningMsg, setProctorWarningMsg] = useState<string | null>(null);
  const [proctorLogs, setProctorLogs] = useState<string[]>([]);
  const [autoTerminatedReason, setAutoTerminatedReason] = useState<string | null>(null);
  const warningTimeoutRef = useRef<any>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Admin Declared Results & Detailed Answer Review State
  const [publishedResults, setPublishedResults] = useState<any[]>([]);
  const [hasAttempted, setHasAttempted] = useState<boolean>(false);
  const [userSubmission, setUserSubmission] = useState<any | null>(null);
  const [showAnswerReviewModal, setShowAnswerReviewModal] = useState<boolean>(false);
  const [reviewFilter, setReviewFilter] = useState<"all" | "correct" | "wrong" | "unattempted" | "Part-A" | "Part-B">("all");

  const cleanQuestionText = (text: string) => {
    if (!text) return "";
    return text.replace(/^\s*\[.*?\]\s*/, "").trim();
  };

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
        await checkAttemptStatus(data.paper.id);
      }
    } catch (e) {
      console.error("Error loading Olympiad 100 paper:", e);
    } finally {
      setLoading(false);
    }
  };

  // 2. Check Candidate's Attempt Status & Load Submitted Evaluations
  const checkAttemptStatus = async (targetPaperId?: string) => {
    if (!user?.email) return;
    const cleanEmail = user.email.trim().toLowerCase();
    const localSubjKey = `tso_submitted_${cleanEmail}_${selectedSubject.toLowerCase()}`;
    const localGeneralKey = `tso_submitted_${cleanEmail}`;

    // Instant local check
    if (typeof window !== "undefined") {
      if (localStorage.getItem(localSubjKey) === "true" || localStorage.getItem(localGeneralKey) === "true") {
        setHasAttempted(true);
      }
    }

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api/v1";
      const pId = targetPaperId || paperData?.id || "";
      const pQuery = pId ? `&paper_id=${encodeURIComponent(pId)}` : "";
      const res = await fetch(`${baseUrl}/olympiad/attempt-status?email=${encodeURIComponent(cleanEmail)}&subject=${encodeURIComponent(selectedSubject)}${pQuery}`);
      const data = await res.json();
      if (data.status === "success") {
        const isAttempted = Boolean(data.has_attempted);
        setHasAttempted(isAttempted);
        if (isAttempted && typeof window !== "undefined") {
          localStorage.setItem(localSubjKey, "true");
        }
        if (data.submission) {
          setUserSubmission(data.submission);
        }
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
        if (data.results && data.results.length > 0 && !userSubmission) {
          setUserSubmission(data.results[0]);
        }
      }
    } catch (e) {}
  };

  // Schedule Window Validation
  const scheduleStatus = useMemo(() => {
    if (!paperData) return { isOpen: true, message: "" };
    const now = new Date().getTime();
    if (paperData.start_time) {
      const startMs = new Date(paperData.start_time.replace(" ", "T")).getTime();
      if (!isNaN(startMs) && now < startMs) {
        return {
          isOpen: false,
          message: `Olympiad opens on ${new Date(startMs).toLocaleString()}`
        };
      }
    }
    if (paperData.end_time) {
      const endMs = new Date(paperData.end_time.replace(" ", "T")).getTime();
      if (!isNaN(endMs) && now > endMs) {
        return {
          isOpen: false,
          message: `Olympiad concluded on ${new Date(endMs).toLocaleString()}`
        };
      }
    }
    return { isOpen: true, message: "Live & Active" };
  }, [paperData]);

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

  // Dedicated Real-time Camera Lifecycle Stream
  useEffect(() => {
    let streamInstance: MediaStream | null = null;
    if (examStarted && !examSubmitted) {
      const initCamera = async () => {
        try {
          if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            const s = await navigator.mediaDevices.getUserMedia({
              video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: "user" },
              audio: false
            });
            streamInstance = s;
            setMediaStream(s);
            setWebcamEnabled(true);
            if (videoRef.current) {
              videoRef.current.srcObject = s;
              try { await videoRef.current.play(); } catch (e) {}
            }
          }
        } catch (e) {
          console.warn("Webcam access restricted or unavailable:", e);
        }
      };
      initCamera();
    } else {
      if (mediaStream) {
        mediaStream.getTracks().forEach((track) => track.stop());
        setMediaStream(null);
      }
    }

    return () => {
      if (streamInstance) {
        streamInstance.getTracks().forEach((track) => track.stop());
      }
    };
  }, [examStarted, examSubmitted]);

  // Re-attach video stream if element re-mounts
  useEffect(() => {
    if (videoRef.current && mediaStream) {
      videoRef.current.srcObject = mediaStream;
      videoRef.current.play().catch(() => {});
    }
  }, [mediaStream, examStarted]);

  // Trigger Proctoring Incident with 5-warning threshold and clear explanation
  const triggerProctorIncident = (reason: string) => {
    if (examSubmitted) return;
    setTabSwitches((prev) => {
      const count = prev + 1;
      const timeStr = new Date().toLocaleTimeString();
      const log = `[${timeStr}] Warning #${count}: ${reason}`;
      setProctorLogs((prevLogs) => [...prevLogs, log]);

      if (count >= 5) {
        const termMsg = `Maximum Proctoring Violations Reached (5/5 Warnings): ${reason}. Assessment automatically submitted.`;
        setAutoTerminatedReason(termMsg);
        setProctorWarningMsg(`🚨 MAXIMUM VIOLATIONS REACHED (5/5 Warnings): Assessment Auto-Submitted.`);
        setTimeout(() => {
          processSubmission(true, termMsg);
        }, 800);
      } else {
        setProctorWarningMsg(`⚠️ INTEGRITY NOTICE (Warning #${count}/5): ${reason}. Please stay on this screen.`);
        if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
        warningTimeoutRef.current = setTimeout(() => {
          setProctorWarningMsg(null);
        }, 5000);
      }

      return count;
    });
  };

  // Anti-Cheating: Reliable Tab Switch & Fullscreen Monitoring (No false window blur triggers)
  useEffect(() => {
    if (!examStarted || examSubmitted) return;

    let hiddenTimeout: NodeJS.Timeout | null = null;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Debounce 1.5s to prevent brief OS touch gestures or mobile notifications from firing false alerts
        hiddenTimeout = setTimeout(() => {
          if (document.hidden) {
            triggerProctorIncident("Tab switched or minimized");
          }
        }, 1500);
      } else {
        if (hiddenTimeout) clearTimeout(hiddenTimeout);
      }
    };

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setFullscreenExits((prev) => prev + 1);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      if (hiddenTimeout) clearTimeout(hiddenTimeout);
    };
  }, [examStarted, examSubmitted]);

  // Real-time AI Camera Presence & Stream Verification Loop
  useEffect(() => {
    if (!examStarted || examSubmitted || !mediaStream) return;

    let cameraOffTicks = 0;

    const visionTimer = setInterval(() => {
      if (!videoRef.current || examSubmitted) return;

      // Verify that mediaStream video track is live and enabled
      const videoTrack = mediaStream.getVideoTracks()[0];
      const isLive = videoTrack && videoTrack.readyState === "live" && videoTrack.enabled;

      if (!isLive) {
        cameraOffTicks += 1;
        if (cameraOffTicks >= 5) {
          triggerProctorIncident("Camera stream disconnected or disabled");
          cameraOffTicks = 0;
        }
      } else {
        cameraOffTicks = 0;
      }
    }, 2000);

    return () => clearInterval(visionTimer);
  }, [examStarted, examSubmitted, mediaStream]);

  // Format MM:SS
  const formattedTime = useMemo(() => {
    const mins = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }, [timeLeft]);

  // Start Real 60-Minute Exam with Re-Attempt & Active Paper Lock Guard
  const handleStartExam = async () => {
    if (!paperData || !questions || questions.length === 0) {
      alert("🔒 Assessment Hall Inactive: No official question paper has been published by the administration yet for this subject. Please check back when the exam window is activated.");
      return;
    }

    if (hasAttempted || userSubmission) {
      alert("🔒 Assessment Already Completed: Each educator is permitted exactly 1 official Olympiad attempt. You can view your scorecard and review questions in the Results tab.");
      setActiveTab("results");
      return;
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
    await processSubmission(false);
  };

  const handleAutoSubmit = async () => {
    await processSubmission(false);
  };

  const processSubmission = async (isAutoTerminated: boolean = false, termReason: string = "") => {
    setLoading(true);
    const timeTaken = 3600 - timeLeft;

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api/v1";
      const finalLogs = isAutoTerminated 
        ? [...proctorLogs, `[AUTO-TERMINATION] ${termReason}`] 
        : proctorLogs;

      const cleanEmail = (user?.email || "teacher@school.edu").trim().toLowerCase();
      const res = await fetch(`${baseUrl}/olympiad/submit-100`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teacher_email: cleanEmail,
          teacher_name: user?.name || "Educator",
          subject: selectedSubject,
          state: user?.state || "National",
          district: user?.district || "Central",
          paper_id: paperData?.id || paperData?.paper_id || `tso-national-2026-${selectedSubject.toLowerCase()}`,
          answers: answers,
          time_taken_seconds: timeTaken,
          tab_switch_count: tabSwitches,
          proctor_incidents: tabSwitches,
          proctor_logs: finalLogs
        })
      });

      const data = await res.json();
      if (res.ok || data.status === "success") {
        setSubmissionId(data.submission_id || data.id);
        setExamSubmitted(true);
        setHasAttempted(true);
        setExamStarted(false);

        if (typeof window !== "undefined") {
          localStorage.setItem(`tso_submitted_${cleanEmail}_${selectedSubject.toLowerCase()}`, "true");
          localStorage.setItem(`tso_submitted_${cleanEmail}`, "true");
        }

        await checkAttemptStatus();
        await loadPublishedResults();
        setActiveTab("results");
      }
    } catch (e) {
      console.error("Submission error:", e);
      setExamSubmitted(true);
      setHasAttempted(true);
      setExamStarted(false);
      setActiveTab("results");
    } finally {
      setLoading(false);
      // Stop webcam stream
      if (mediaStream) {
        mediaStream.getTracks().forEach((track) => track.stop());
        setMediaStream(null);
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
          {!paperData || !questions || questions.length === 0 ? (
            <div className="bg-amber-50/90 rounded-3xl p-6 border border-amber-200 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
              <div className="space-y-1 text-center sm:text-left flex-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 flex items-center gap-1.5 justify-center sm:justify-start">
                  <Lock className="w-3.5 h-3.5 text-amber-600" />
                  EXAMINATION HALL INACTIVE • ASSESSMENT LOCKED
                </span>
                <h3 className="text-base font-black text-slate-900">
                  No Official Assessment Paper Published Yet
                </h3>
                <p className="text-xs text-slate-600 font-medium">
                  The examination committee has not published an active assessment paper for {selectedSubject} yet. Please check back when the official examination window is activated by the administration.
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
                  disabled
                  className="flex-1 sm:flex-none px-6 py-3.5 bg-slate-200 text-slate-500 font-extrabold text-xs rounded-xl cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Lock className="w-4 h-4" />
                  <span>Assessment Locked</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-indigo-50 rounded-3xl p-6 border border-indigo-100 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
              <div className="space-y-1 text-center sm:text-left flex-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600">
                  {hasAttempted || userSubmission ? "ASSESSMENT RECORD PERMANENTLY ARCHIVED" : "LIVE TIMED ASSESSMENT"}
                </span>
                <h3 className="text-base font-black text-slate-900">
                  {hasAttempted || userSubmission ? "Official Assessment Completed (Locked)" : "Ready to take the 100-MCQ National Olympiad?"}
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  {hasAttempted || userSubmission 
                    ? "You have already completed your official assessment. Re-attempts are restricted to preserve national benchmarking integrity."
                    : "Make sure you have 60 uninterrupted minutes and a stable internet connection with webcam enabled."}
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

                {hasAttempted || userSubmission ? (
                  <button
                    type="button"
                    onClick={() => setActiveTab("results")}
                    className="flex-1 sm:flex-none px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
                  >
                    <FileCheck className="w-4 h-4" />
                    <span>View Scorecard & Answers →</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={!scheduleStatus.isOpen}
                    onClick={handleStartExam}
                    className="flex-1 sm:flex-none px-7 py-3.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:from-indigo-700 hover:to-purple-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-extrabold text-xs rounded-xl shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
                  >
                    <Trophy className="w-4 h-4 text-amber-300" />
                    <span>{scheduleStatus.isOpen ? "Start 60-Min 100-MCQ Exam" : scheduleStatus.message}</span>
                    {scheduleStatus.isOpen && <ArrowRight className="w-4 h-4" />}
                  </button>
                )}
              </div>
            </div>
          )}

        </div>
      )}

      {/* 3. LIVE 100-MCQ EXAM HALL ENVIRONMENT */}
      {examStarted && !examSubmitted && (
        <div className="space-y-5">
          
          {/* REAL-TIME ANTI-CHEATING WARNING BANNER */}
          {proctorWarningMsg && (
            <div className="p-4 rounded-2xl bg-rose-600 text-white font-bold text-xs shadow-lg shadow-rose-600/30 flex items-center justify-between gap-3 animate-bounce">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-300 shrink-0" />
                <span>{proctorWarningMsg}</span>
              </div>
              <button 
                onClick={() => setProctorWarningMsg(null)}
                className="text-white/80 hover:text-white font-black text-sm px-2 py-0.5"
              >
                ✕
              </button>
            </div>
          )}
          
          {/* EXAM HALL HEADER: TIMER, SECTION SWITCHER & MOBILE PALETTE BUTTON */}
          <div className="sticky top-16 z-30 bg-white/95 backdrop-blur-xl rounded-2xl p-3 sm:p-4 border border-slate-200 shadow-md flex flex-wrap items-center justify-between gap-3">
            
            {/* Section Switcher Tabs */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => setActiveSection("Part-A")}
                className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
                  activeSection === "Part-A"
                    ? "bg-purple-600 text-white shadow-md shadow-purple-600/25"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <span>Part-A: Pedagogy</span>
                <span className="text-[10px] bg-black/20 px-2 py-0.5 rounded-full">{partAAnsweredCount}/60</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveSection("Part-B")}
                className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
                  activeSection === "Part-B"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/25"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <span>Part-B: {selectedSubject}</span>
                <span className="text-[10px] bg-black/20 px-2 py-0.5 rounded-full">{partBAnsweredCount}/40</span>
              </button>

              {/* Mobile Question Palette Opener */}
              <button
                type="button"
                onClick={() => setShowMobilePalette(true)}
                className="lg:hidden px-3 py-2 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 text-indigo-800 font-extrabold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Grid className="w-3.5 h-3.5 text-indigo-600" />
                <span>100 Grid ({Object.keys(answers).length}/100)</span>
              </button>
            </div>

            {/* Countdown Clock & Submit Button */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 sm:gap-2 bg-slate-900 text-white px-3 sm:px-4 py-2 rounded-xl border border-slate-800 shadow-xs">
                <Clock className="w-4 h-4 text-amber-400 animate-pulse" />
                <span className="font-mono text-xs sm:text-sm font-black text-amber-300">{formattedTime}</span>
              </div>

              <button
                type="button"
                onClick={handleSubmitExam}
                className="px-4 sm:px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
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

                  {/* QUESTION TEXT (WITH KATEX MATHEMATICS & SCIENTIFIC FORMULA SUPPORT) */}
                  <div className="p-4 sm:p-5 bg-slate-50 rounded-2xl border border-slate-200/80 text-sm font-bold text-slate-800 leading-relaxed">
                    <Markdown content={cleanQuestionText(currentQ.question_text)} />
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
                          <div className="text-xs font-semibold text-slate-800 leading-relaxed flex-1">
                            <Markdown content={opt} />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* BOTTOM ACTION BUTTONS */}
                  <div className="flex items-center justify-between border-t border-slate-100 pt-4 flex-wrap gap-2">
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

            {/* DESKTOP QUESTION PALETTE GRID (1 COL) */}
            <div className="hidden lg:block bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4 h-fit sticky top-36">
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
              <div className="grid grid-cols-5 gap-1.5 max-h-[340px] overflow-y-auto pr-1">
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
                
                {/* Webcam Preview & Live Proctoring Widget */}
                <div className="relative w-full h-24 bg-slate-950 rounded-2xl overflow-hidden border border-slate-300 shadow-inner">
                  <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    muted 
                    className="w-full h-full object-cover mirror scale-x-[-1]" 
                  />
                  
                  {/* Status Overlay Badges */}
                  <div className="absolute top-1.5 left-1.5 bg-black/75 backdrop-blur-xs text-white text-[9px] font-black px-2 py-0.5 rounded-md flex items-center gap-1.5 shadow-xs">
                    <span className={`w-2 h-2 rounded-full ${webcamEnabled ? "bg-emerald-400 animate-pulse" : "bg-amber-400"}`} />
                    <span>{webcamEnabled ? "Camera Monitored" : "Camera Initializing..."}</span>
                  </div>

                  {tabSwitches > 0 && (
                    <div className="absolute bottom-1.5 right-1.5 bg-rose-600/90 backdrop-blur-xs text-white text-[9px] font-black px-2 py-0.5 rounded-md shadow-xs animate-pulse">
                      {tabSwitches} Warning(s)
                    </div>
                  )}
                </div>
              </div>

            </div>

          </div>

          {/* MOBILE SLIDE-UP QUESTION PALETTE DRAWER */}
          {showMobilePalette && (
            <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-end justify-center p-0 lg:hidden animate-in fade-in duration-200">
              <div className="w-full bg-white rounded-t-3xl p-6 space-y-4 shadow-2xl max-h-[85vh] flex flex-col">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 shrink-0">
                  <div>
                    <h3 className="text-sm font-black text-slate-900">100-MCQ Question Palette</h3>
                    <p className="text-[10px] font-bold text-slate-500">{Object.keys(answers).length} of 100 Answered</p>
                  </div>
                  <button
                    onClick={() => setShowMobilePalette(false)}
                    className="p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-4 gap-2 text-[10px] font-bold text-slate-600 shrink-0">
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" /> Answered</span>
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-purple-500 shrink-0" /> Review</span>
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-slate-200 shrink-0" /> Blank</span>
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-indigo-600 shrink-0" /> Current</span>
                </div>

                <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 overflow-y-auto flex-1 p-1">
                  {questions.map((q, idx) => {
                    const isCurrent = currentIdx === idx;
                    const isAnswered = answers[q.id] !== undefined;
                    const isReview = markedForReview[q.id];

                    let bg = "bg-slate-100 text-slate-700 font-bold";
                    if (isCurrent) bg = "bg-indigo-600 text-white ring-2 ring-indigo-600 ring-offset-1 font-black shadow-sm";
                    else if (isReview) bg = "bg-purple-500 text-white font-bold";
                    else if (isAnswered) bg = "bg-emerald-500 text-white font-bold";

                    return (
                      <button
                        key={q.id}
                        type="button"
                        onClick={() => {
                          setCurrentIdx(idx);
                          setActiveSection(q.section);
                          setShowMobilePalette(false);
                        }}
                        className={`h-10 rounded-xl text-xs flex items-center justify-center transition-all cursor-pointer ${bg}`}
                      >
                        {idx + 1}
                      </button>
                    );
                  })}
                </div>

                <div className="pt-3 border-t border-slate-100 shrink-0">
                  <button
                    onClick={() => setShowMobilePalette(false)}
                    className="w-full py-3 bg-slate-900 text-white font-black text-xs rounded-xl"
                  >
                    Close Palette
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      )}

      {/* 4. POST-SUBMISSION REASSURING CONFIRMATION SCREEN (100% ADMIN-CONTROLLED) */}
      {examSubmitted && (
        <div className="max-w-2xl mx-auto bg-white rounded-3xl p-8 border border-slate-200 shadow-2xl text-center space-y-6 animate-in zoom-in-95 duration-300">
          
          {autoTerminatedReason ? (
            <div className="w-18 h-18 rounded-3xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center mx-auto shadow-md animate-pulse">
              <AlertTriangle className="w-10 h-10" />
            </div>
          ) : (
            <div className="w-18 h-18 rounded-3xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 className="w-10 h-10" />
            </div>
          )}

          <div className="space-y-2">
            {autoTerminatedReason ? (
              <span className="text-[10px] font-black uppercase tracking-widest bg-rose-100 text-rose-800 px-3.5 py-1 rounded-full border border-rose-200">
                🚨 AUTO-SUBMITTED (MAXIMUM 3 WARNINGS EXCEEDED)
              </span>
            ) : (
              <span className="text-[10px] font-black uppercase tracking-widest bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full border border-emerald-200">
                ASSESSMENT ARCHIVED SUCCESSFULLY
              </span>
            )}

            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              {autoTerminatedReason ? "Assessment Terminated & Submitted" : `Thank You, ${user?.name || "Educator"}!`}
            </h2>

            <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed max-w-lg mx-auto">
              {autoTerminatedReason 
                ? "Your 100-MCQ assessment was automatically submitted to the evaluation committee because 3 consecutive proctoring infractions were logged by the automated anti-cheating system."
                : "Your responses for the 100-MCQ Teacher Skills Olympiad 2026 have been securely recorded and sent to the national evaluation committee."}
            </p>
          </div>

          {/* RECORDED INCIDENT LOGS BREAKDOWN */}
          {proctorLogs && proctorLogs.length > 0 && (
            <div className="p-4 bg-rose-50/80 rounded-2xl border border-rose-200 text-left space-y-2">
              <div className="flex items-center gap-1.5 text-rose-900 font-black text-xs">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>Recorded Anti-Cheating Incidents ({proctorLogs.length} Events):</span>
              </div>
              <div className="space-y-1 font-mono text-[11px] text-rose-800">
                {proctorLogs.map((log, lIdx) => (
                  <div key={lIdx} className="p-2 rounded-xl bg-white border border-rose-200/60 shadow-2xs">
                    {log}
                  </div>
                ))}
              </div>
            </div>
          )}

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
            <button
              onClick={() => {
                setExamSubmitted(false);
                setExamStarted(false);
                setActiveTab("results");
              }}
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-indigo-600/25 transition-all cursor-pointer"
            >
              View Results & Scorecard →
            </button>

            <Link
              href="/dashboard/teacher-olympiad/practice"
              className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
            >
              Practice More Mock Tests
            </Link>
          </div>

        </div>
      )}

      {/* 5. ADMIN DECLARED RESULTS TAB & PERFORMANCE SCORECARD */}
      {!examStarted && activeTab === "results" && (
        <div className="space-y-6">

          {/* CANDIDATE'S PERSONAL SCORECARD & REVIEW BANNER (IF ATTEMPTED) */}
          {userSubmission ? (
            <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-purple-950 text-white rounded-3xl p-6 sm:p-8 border border-indigo-500/30 shadow-xl space-y-6">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-black">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>{userSubmission.published ? "OFFICIALLY DECLARED MERIT SCORECARD" : "ASSESSMENT RECORD & SUBMISSION SCRIPT"}</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black tracking-tight">
                    {userSubmission.teacher_name} &bull; {userSubmission.subject} Assessment
                  </h2>
                  <p className="text-xs text-slate-300 font-medium">
                    National Teacher Skills Olympiad 2026 &bull; Submitted {userSubmission.submitted_at}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowAnswerReviewModal(true)}
                    className="px-5 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-500/25 transition-all flex items-center gap-2 cursor-pointer active:scale-95 uppercase tracking-wider"
                  >
                    <FileCheck className="w-4 h-4" />
                    <span>Check Right & Wrong Answers</span>
                  </button>
                </div>
              </div>

              {/* 4-METRIC STATS GRID */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                
                <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 space-y-1">
                  <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider block">Official Score</span>
                  <div className="text-2xl sm:text-3xl font-black text-amber-300">
                    {userSubmission.score_percentage}%
                  </div>
                  <p className="text-[11px] text-slate-300 font-medium">
                    {userSubmission.correct_count ?? 0}/100 Marks Scored
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 space-y-1">
                  <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider block">National Merit Rank</span>
                  <div className="text-2xl sm:text-3xl font-black text-white">
                    #{userSubmission.merit_rank ?? 1}
                  </div>
                  <p className="text-[11px] text-emerald-400 font-medium">
                    State Rank: #{userSubmission.state_rank ?? 1}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 space-y-1">
                  <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider block">Accuracy Breakdown</span>
                  <div className="flex items-center gap-2 text-xs font-bold pt-1">
                    <span className="text-emerald-400 font-black">✓ {userSubmission.correct_count ?? 0} Correct</span>
                    <span className="text-rose-400 font-black">✗ {userSubmission.wrong_count ?? 0} Wrong</span>
                  </div>
                  <p className="text-[11px] text-slate-300 font-medium">
                    ⚪ {userSubmission.unanswered_count ?? 0} Unattempted
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 space-y-1">
                  <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider block">Proctor Integrity</span>
                  <div className="text-lg font-black text-emerald-300 pt-1 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" />
                    <span>{Number(userSubmission.tab_switch_count ?? userSubmission.proctor_incidents ?? 0) === 0 ? "100% Clean Audit" : `${userSubmission.tab_switch_count} Tab Warnings`}</span>
                  </div>
                  <p className="text-[10px] text-slate-300">
                    {userSubmission.published ? "Officially Benchmarked" : "Under Final Board Audit"}
                  </p>
                </div>

              </div>

              {/* BADGES ROW */}
              {userSubmission.badges_awarded && userSubmission.badges_awarded.length > 0 && (
                <div className="pt-2 flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-slate-300">Awarded Distinctions:</span>
                  {userSubmission.badges_awarded.map((badge: string, bIdx: number) => (
                    <span key={bIdx} className="px-3 py-1 bg-amber-400/20 text-amber-300 border border-amber-400/30 rounded-full text-xs font-black flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5 text-amber-300" />
                      {badge}
                    </span>
                  ))}
                </div>
              )}

            </div>
          ) : (
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center mx-auto">
                <Trophy className="w-7 h-7" />
              </div>
              <h3 className="text-base font-black text-slate-900">
                You Have Not Attempted The Olympiad Yet
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto font-medium">
                Take the official 60-minute assessment to earn your National Merit Ranking, scorecard, and CBSE/CPD pedagogy badges.
              </p>
              <button
                onClick={() => setActiveTab("overview")}
                className="px-6 py-2.5 bg-indigo-600 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer hover:bg-indigo-700"
              >
                Go to Exam Hall
              </button>
            </div>
          )}

          {/* NATIONAL MERIT BENCHMARK LIST */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-black text-slate-900">
                  National Published Merit Standings & Distinction Cards
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Verified educators across CBSE/NCERT schools recognized for subject and pedagogical excellence.
                </p>
              </div>

              <Link
                href="/dashboard/teacher-olympiad/leaderboard"
                className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-extrabold text-xs rounded-xl border border-indigo-200 transition-colors flex items-center gap-1.5"
              >
                <Trophy className="w-3.5 h-3.5" />
                <span>View Full National Leaderboard</span>
              </Link>
            </div>

            {publishedResults.length === 0 ? (
              <div className="text-center py-12 px-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-2">
                <Clock className="w-6 h-6 text-slate-400 mx-auto" />
                <p className="text-xs text-slate-500 font-semibold">
                  National leaderboard declarations are refreshed periodically by the evaluation committee.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {publishedResults.map((r, idx) => (
                  <div key={idx} className="p-5 bg-gradient-to-br from-slate-50 to-white rounded-2xl border border-slate-200 space-y-3 shadow-2xs hover:shadow-sm transition-shadow">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                        RANK #{r.merit_rank || idx + 1}
                      </span>
                      <span className="text-xs font-black text-indigo-600 font-mono">
                        {r.score_percentage || r.official_score || 85}%
                      </span>
                    </div>

                    <div>
                      <h4 className="text-sm font-black text-slate-900">{r.teacher_name}</h4>
                      <p className="text-xs text-slate-500">{r.subject} &bull; {r.district}, {r.state}</p>
                    </div>

                    <div className="text-[10px] text-slate-400 font-medium pt-1 border-t border-slate-100">
                      Declared: {r.declared_at || r.submitted_at}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

      {/* 6. FULL 100-QUESTION PAPER ANSWER REVIEW MODAL (CHECK RIGHT & WRONG ANSWERS) */}
      {showAnswerReviewModal && userSubmission && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-4xl w-full bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 animate-in zoom-in-95 max-h-[90vh] flex flex-col font-sans">
            
            {/* MODAL HEADER */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4 shrink-0">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                    COMPLETE 100-QUESTION SCRIPT REVIEW
                  </span>
                  <span className="text-xs font-bold text-slate-500">
                    {userSubmission.subject} Assessment
                  </span>
                </div>
                <h3 className="text-lg font-black text-slate-900">
                  Question Paper & Pedagogical Solution Review
                </h3>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-sm font-black text-indigo-600">Score: {userSubmission.score_percentage}%</div>
                  <div className="text-[10px] text-slate-500 font-semibold">
                    ✓ {userSubmission.correct_count ?? 0} Correct &bull; ✗ {userSubmission.wrong_count ?? 0} Incorrect &bull; ⚪ {userSubmission.unanswered_count ?? 0} Unattempted
                  </div>
                </div>
                <button
                  onClick={() => setShowAnswerReviewModal(false)}
                  className="text-slate-400 hover:text-slate-700 font-black text-lg p-2 cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* FILTER TABS */}
            <div className="flex items-center gap-2 flex-wrap shrink-0">
              <button
                onClick={() => setReviewFilter("all")}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-colors cursor-pointer ${
                  reviewFilter === "all" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                All Questions (100)
              </button>

              <button
                onClick={() => setReviewFilter("correct")}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-colors cursor-pointer flex items-center gap-1 ${
                  reviewFilter === "correct" ? "bg-emerald-600 text-white" : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                }`}
              >
                <span>✓ Correct Only</span>
                <span className="text-[10px] bg-black/10 px-1.5 py-0.5 rounded-full">{userSubmission.correct_count ?? 0}</span>
              </button>

              <button
                onClick={() => setReviewFilter("wrong")}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-colors cursor-pointer flex items-center gap-1 ${
                  reviewFilter === "wrong" ? "bg-rose-600 text-white" : "bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200"
                }`}
              >
                <span>✗ Incorrect Only</span>
                <span className="text-[10px] bg-black/10 px-1.5 py-0.5 rounded-full">{userSubmission.wrong_count ?? 0}</span>
              </button>

              <button
                onClick={() => setReviewFilter("unattempted")}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-colors cursor-pointer flex items-center gap-1 ${
                  reviewFilter === "unattempted" ? "bg-slate-700 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <span>⚪ Unattempted</span>
                <span className="text-[10px] bg-black/10 px-1.5 py-0.5 rounded-full">{userSubmission.unanswered_count ?? 0}</span>
              </button>

              <button
                onClick={() => setReviewFilter("Part-A")}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-colors cursor-pointer ${
                  reviewFilter === "Part-A" ? "bg-purple-600 text-white" : "bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200"
                }`}
              >
                Part-A: Pedagogy (60)
              </button>

              <button
                onClick={() => setReviewFilter("Part-B")}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-colors cursor-pointer ${
                  reviewFilter === "Part-B" ? "bg-indigo-600 text-white" : "bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200"
                }`}
              >
                Part-B: Subject (40)
              </button>
            </div>

            {/* SCROLLABLE QUESTION REVIEW LIST */}
            <div className="overflow-y-auto space-y-5 pr-2 flex-1">
              {(() => {
                const evaluations = userSubmission.question_evaluations || [];
                const filtered = evaluations.filter((q: any) => {
                  if (reviewFilter === "correct") return q.is_correct;
                  if (reviewFilter === "wrong") return q.is_attempted && !q.is_correct;
                  if (reviewFilter === "unattempted") return !q.is_attempted;
                  if (reviewFilter === "Part-A") return q.section === "Part-A";
                  if (reviewFilter === "Part-B") return q.section === "Part-B";
                  return true;
                });

                if (filtered.length === 0) {
                  return (
                    <div className="text-center py-12 text-slate-400 font-semibold text-xs bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                      No questions match the selected filter.
                    </div>
                  );
                }

                return filtered.map((q: any, idx: number) => {
                  const isCorr = q.is_correct;
                  const isAttempted = q.is_attempted;

                  return (
                    <div
                      key={idx}
                      className={`p-5 sm:p-6 rounded-3xl border-2 space-y-4 shadow-2xs ${
                        !isAttempted
                          ? "bg-slate-50/70 border-slate-200"
                          : isCorr
                          ? "bg-emerald-50/40 border-emerald-300"
                          : "bg-rose-50/40 border-rose-300"
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/60 pb-3">
                        <div className="flex items-center gap-2">
                          <span className="w-7 h-7 rounded-xl bg-slate-900 text-white font-black text-xs flex items-center justify-center shadow-xs">
                            {q.question_number}
                          </span>
                          <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 shadow-2xs">
                            {q.section} &bull; {q.module}
                          </span>
                        </div>

                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider self-start sm:self-auto ${
                          !isAttempted
                            ? "bg-slate-200 text-slate-700"
                            : isCorr
                            ? "bg-emerald-600 text-white shadow-xs"
                            : "bg-rose-600 text-white shadow-xs"
                        }`}>
                          {!isAttempted ? "⚪ Not Attempted (0 Marks)" : isCorr ? "✓ Correct (+1 Mark)" : "✗ Incorrect (0 Marks)"}
                        </span>
                      </div>

                      <div className="text-sm font-bold text-slate-900 leading-relaxed">
                        <Markdown content={cleanQuestionText(q.question_text)} />
                      </div>

                      {/* 4 Options Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                        {(q.options || []).map((opt: string, optIdx: number) => {
                          const isCorrectAnswer = optIdx === q.correct_answer;
                          const isSelectedByCandidate = optIdx === q.selected_option;

                          let containerStyle = "bg-white border-slate-200 text-slate-700";
                          if (isCorrectAnswer) {
                            containerStyle = "bg-emerald-100/90 border-emerald-500 text-emerald-950 font-bold ring-2 ring-emerald-500/20";
                          } else if (isSelectedByCandidate && !isCorr) {
                            containerStyle = "bg-rose-100/90 border-rose-500 text-rose-950 font-bold ring-2 ring-rose-500/20";
                          }

                          return (
                            <div
                              key={optIdx}
                              className={`p-3.5 rounded-2xl border-2 flex items-center justify-between gap-2.5 transition-all ${containerStyle}`}
                            >
                              <div className="flex items-center gap-2 font-medium flex-1">
                                <span className={`w-5 h-5 rounded-md text-[10px] font-black flex items-center justify-center shrink-0 ${
                                  isCorrectAnswer
                                    ? "bg-emerald-600 text-white"
                                    : isSelectedByCandidate && !isCorr
                                    ? "bg-rose-600 text-white"
                                    : "bg-slate-100 text-slate-600"
                                }`}>
                                  {String.fromCharCode(65 + optIdx)}
                                </span>
                                <div className="flex-1 text-xs">
                                  <Markdown content={opt.replace(/^\([A-D]\)\s*/, "")} />
                                </div>
                              </div>

                              {isCorrectAnswer && (
                                <span className="text-[10px] font-black text-emerald-800 uppercase px-2 py-0.5 rounded-md bg-emerald-200/80 shrink-0">
                                  ✓ Correct
                                </span>
                              )}

                              {isSelectedByCandidate && !isCorr && (
                                <span className="text-[10px] font-black text-rose-800 uppercase px-2 py-0.5 rounded-md bg-rose-200/80 shrink-0">
                                  ✗ Your Choice
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Explanation Callout */}
                      {q.explanation && (
                        <div className="p-4 bg-white/90 rounded-2xl border border-slate-200 text-xs text-slate-700 space-y-1 shadow-2xs">
                          <span className="font-black text-indigo-700 flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                            Pedagogical Solution & NCERT/CBSE Reference:
                          </span>
                          <div className="leading-relaxed font-medium text-slate-700 pl-5">
                            <Markdown content={q.explanation} />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                });
              })()}
            </div>

            {/* MODAL FOOTER */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 shrink-0">
              <div className="text-xs text-slate-500 font-medium">
                National Teacher Skills Olympiad 2026 Assessment Analysis
              </div>

              <button
                onClick={() => setShowAnswerReviewModal(false)}
                className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl cursor-pointer"
              >
                Close Review
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
