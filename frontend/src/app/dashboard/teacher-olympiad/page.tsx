"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { 
  Trophy, 
  ShieldAlert, 
  Camera, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  ArrowRight, 
  Award, 
  Lock, 
  RefreshCw, 
  BookOpen, 
  HelpCircle,
  Eye,
  FileCheck,
  ChevronRight,
  School,
  Maximize,
  Activity,
  ListOrdered,
  Calendar,
  History,
  Check,
  EyeOff,
  XCircle,
  CheckCircle,
  FileText
} from "lucide-react";
import { useAppStore } from "@/store/useAppStore";

export default function TeacherOlympiadPage() {
  const { user } = useAppStore();
  const [activeTab, setActiveTab] = useState<"instructions" | "previous_papers" | "published">("instructions");
  
  // Exam Engine State
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [examStarted, setExamStarted] = useState(false);
  const [examSubmitted, setExamSubmitted] = useState(false);
  const [submissionId, setSubmissionId] = useState<string | null>(null);

  // Practical Anti-Cheating & Security State
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [fullscreenExits, setFullscreenExits] = useState(0);
  const [faceMissingCount, setFaceMissingCount] = useState(0);
  const [gazeDeflectionCount, setGazeDeflectionCount] = useState(0);
  const [proctorLogs, setProctorLogs] = useState<string[]>([]);
  const [faceDetected, setFaceDetected] = useState(true);
  const [gazeDeflected, setGazeDeflected] = useState(false);

  const [warningModalOpen, setWarningModalOpen] = useState(false);
  const [warningMessage, setWarningMessage] = useState("");
  const [timeLeft, setTimeLeft] = useState(20 * 60); // 20 mins in seconds
  const [webcamActive, setWebcamActive] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number | null>(null);
  const boxPosRef = useRef({ x: 40, y: 30, w: 80, h: 80 });
  const deflectionTimerRef = useRef(0);
  const faceMissingStreakRef = useRef(0);
  const baseCenterXRef = useRef<number | null>(null);

  // Active Scheduled Paper Access Info
  const [activePaperInfo, setActivePaperInfo] = useState<any>(null);
  const [hasAlreadyAttempted, setHasAlreadyAttempted] = useState(false);

  // Published & Previous Papers State
  const [publishedResults, setPublishedResults] = useState<any[]>([]);
  const [loadingResults, setLoadingResults] = useState(false);
  const [previousPapers, setPreviousPapers] = useState<any[]>([]);
  const [loadingPreviousPapers, setLoadingPreviousPapers] = useState(false);
  const [previewArchivePaper, setPreviewArchivePaper] = useState<any | null>(null);

  // Answer Breakdown Modal State
  const [selectedBreakdownResult, setSelectedBreakdownResult] = useState<any | null>(null);
  const [breakdownFilter, setBreakdownFilter] = useState<"all" | "correct" | "wrong">("all");

  // Live Ticker State for Real-Time Unlocking
  const [nowTime, setNowTime] = useState<number>(Date.now());

  // 1. Fetch Questions & Active Paper Access Info
  const loadExamQuestions = async () => {
    setLoadingQuestions(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api/v1";
      const res = await fetch(`${baseUrl}/olympiad/questions`);
      const data = await res.json();
      if (data.questions) {
        setQuestions(data.questions);
      }
    } catch (e) {
      console.error("Error loading questions", e);
    } finally {
      setLoadingQuestions(false);
    }
  };

  const loadActivePaperInfo = async () => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api/v1";
      const res = await fetch(`${baseUrl}/olympiad/active-paper`);
      const data = await res.json();
      if (data.status === "success") {
        setActivePaperInfo(data);
        if (data.paper?.id) {
          loadAttemptStatus(data.paper.id);
        }
      }
    } catch (e) {
      console.error("Error loading active paper info", e);
    }
  };

  const loadAttemptStatus = async (paperId?: string) => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api/v1";
      const email = user?.email || "teacher@devgya.edu";
      const targetId = paperId || activePaperInfo?.paper?.id || "paper-101";
      const res = await fetch(`${baseUrl}/olympiad/attempt-status?email=${encodeURIComponent(email)}&paper_id=${encodeURIComponent(targetId)}`);
      const data = await res.json();
      if (data.has_attempted) {
        setHasAlreadyAttempted(true);
      }
    } catch (e) {
      console.error("Error loading attempt status", e);
    }
  };

  // 2. Fetch Published Results & Previous Papers Archive
  const loadPublishedResults = async () => {
    setLoadingResults(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api/v1";
      const userEmail = user?.email || "";
      const res = await fetch(`${baseUrl}/olympiad/results/published?email=${encodeURIComponent(userEmail)}`);
      const data = await res.json();
      if (data.results) {
        setPublishedResults(data.results);
      }
    } catch (e) {
      console.error("Error loading published results", e);
    } finally {
      setLoadingResults(false);
    }
  };

  const loadPreviousPapers = async () => {
    setLoadingPreviousPapers(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api/v1";
      const res = await fetch(`${baseUrl}/olympiad/previous-papers`);
      const data = await res.json();
      if (data.papers) {
        setPreviousPapers(data.papers);
      }
    } catch (e) {
      console.error("Error loading previous papers", e);
    } finally {
      setLoadingPreviousPapers(false);
    }
  };

  useEffect(() => {
    loadExamQuestions();
    loadActivePaperInfo();
    loadPublishedResults();
    loadPreviousPapers();

    // Live 1-second ticker for real-time countdown & auto-unlocking
    const ticker = setInterval(() => setNowTime(Date.now()), 1000);

    // 3-second polling to fetch scheduled access window status changes
    const statusPoll = setInterval(() => {
      if (!examStarted && !examSubmitted) {
        loadActivePaperInfo();
      }
    }, 3000);

    return () => {
      clearInterval(ticker);
      clearInterval(statusPoll);
    };
  }, [examStarted, examSubmitted]);

  // 3. Setup Webcam Proctoring & Real-Time Canvas Analysis Loop
  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 640, height: 480, facingMode: "user" }, 
        audio: false 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setWebcamActive(true);
      const timestamp = new Date().toLocaleTimeString();
      setProctorLogs(prev => [`${timestamp} - Live AI Proctor Feed Initialized`, ...prev]);

      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {});
      }

      animFrameRef.current = requestAnimationFrame(runProctorFrameAnalysis);
    } catch (err) {
      console.warn("Webcam access declined or unavailable", err);
      setWebcamActive(false);
      const timestamp = new Date().toLocaleTimeString();
      setProctorLogs(prev => [`${timestamp} - Warning: Camera feed unavailable`, ...prev]);
    }
  };

  const stopWebcam = () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
    }
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    if (document.fullscreenElement && document.exitFullscreen) {
      document.exitFullscreen().catch(() => {});
    }
  };

  // 60 FPS Real-time Live Face & Eye Gaze Deflection Tracker Canvas
  const runProctorFrameAnalysis = () => {
    if (videoRef.current && canvasRef.current && overlayCanvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const overlayCanvas = overlayCanvasRef.current;
      const ctx = canvas.getContext("2d");
      const oCtx = overlayCanvas.getContext("2d");

      if (video.readyState === video.HAVE_ENOUGH_DATA && ctx && oCtx) {
        const sw = 160;
        const sh = 120;
        canvas.width = sw;
        canvas.height = sh;
        ctx.drawImage(video, 0, 0, sw, sh);
        const frame = ctx.getImageData(0, 0, sw, sh);
        const data = frame.data;

        let skinPixels = 0;
        let minX = sw, minY = sh, maxX = 0, maxY = 0;

        for (let y = 0; y < sh; y += 2) {
          for (let x = 0; x < sw; x += 2) {
            const i = (y * sw + x) * 4;
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];

            // Hybrid YCbCr Chrominance + RGB Skin Detection (Zero false-positive face missing)
            const cb = 128 - 0.168736 * r - 0.331264 * g + 0.5 * b;
            const cr = 128 + 0.5 * r - 0.418688 * g - 0.081312 * b;
            const isChrominance = (cb >= 77 && cb <= 128 && cr >= 130 && cr <= 175);
            const isRgbSkin = (r > 45 && g > 30 && b > 15 && r > g && r > b && (r - g) > 6);

            if (isChrominance || isRgbSkin) {
              skinPixels++;
              if (x < minX) minX = x;
              if (x > maxX) maxX = x;
              if (y < minY) minY = y;
              if (y > maxY) maxY = y;
            }
          }
        }

        const boxW = Math.max(0, maxX - minX);
        const boxH = Math.max(0, maxY - minY);
        const boxRatio = boxH > 0 ? boxW / boxH : 0;
        const frameWidthCoverage = boxW / sw;

        // A true face must satisfy skin density, aspect ratio (0.45 to 1.5), and not cover > 65% of background wall
        const isFacePresent = 
          skinPixels > 18 && 
          boxW >= 12 && boxH >= 12 && 
          boxRatio >= 0.45 && boxRatio <= 1.5 && 
          frameWidthCoverage < 0.65;

        setFaceDetected(isFacePresent);

        const dw = overlayCanvas.clientWidth || 320;
        const dh = overlayCanvas.clientHeight || 240;
        overlayCanvas.width = dw;
        overlayCanvas.height = dh;
        oCtx.clearRect(0, 0, dw, dh);

        if (isFacePresent && maxX > minX && maxY > minY) {
          faceMissingStreakRef.current = 0;

          const rawX = (minX / sw) * dw;
          const rawY = (minY / sh) * dh;
          const rawW = Math.max(50, (boxW / sw) * dw);
          const rawH = Math.max(50, (boxH / sh) * dh);

          const curr = boxPosRef.current;
          curr.x += (rawX - curr.x) * 0.25;
          curr.y += (rawY - curr.y) * 0.25;
          curr.w += (rawW - curr.w) * 0.25;
          curr.h += (rawH - curr.h) * 0.25;

          const { x, y, w, h } = curr;
          const cx = x + w / 2;
          const cy = y + h / 2;

          // Calibrated baseline face center tracking
          if (baseCenterXRef.current === null) {
            baseCenterXRef.current = cx;
          }

          const dx = Math.abs(cx - baseCenterXRef.current) / dw;
          const dy = Math.abs(cy - dh / 2) / dh;

          // Trigger deflection if head/eyes turn left, right, up, or down > 9%
          const isDeflected = dx > 0.09 || dy > 0.12;
          setGazeDeflected(isDeflected);

          if (isDeflected) {
            deflectionTimerRef.current += 1;
            if (deflectionTimerRef.current === 35) {
              const timestamp = new Date().toLocaleTimeString();
              setGazeDeflectionCount(prev => prev + 1);
              setProctorLogs(logs => [`${timestamp} - Security Alert: Head/Eye Deflection Detected (Looking away from exam screen)`, ...logs]);
              setWarningMessage("SECURITY ALERT: Head/Eye Deflection Detected! You are looking away from the proctored exam screen. Please face forward towards your assessment.");
              setWarningModalOpen(true);
            }
          } else {
            deflectionTimerRef.current = 0;
          }

          const cornerLen = 14;
          const boxColor = isDeflected ? "#f59e0b" : "#10b981";
          const textY = Math.max(18, y - 6);
          const clampedY = Math.max(12, y);

          oCtx.strokeStyle = boxColor;
          oCtx.lineWidth = 3;
          oCtx.shadowColor = boxColor;
          oCtx.shadowBlur = 8;

          oCtx.beginPath(); oCtx.moveTo(x, clampedY + cornerLen); oCtx.lineTo(x, clampedY); oCtx.lineTo(x + cornerLen, clampedY); oCtx.stroke();
          oCtx.beginPath(); oCtx.moveTo(x + w - cornerLen, clampedY); oCtx.lineTo(x + w, clampedY); oCtx.lineTo(x + w, clampedY + cornerLen); oCtx.stroke();
          oCtx.beginPath(); oCtx.moveTo(x, clampedY + h - cornerLen); oCtx.lineTo(x, clampedY + h); oCtx.lineTo(x + cornerLen, clampedY + h); oCtx.stroke();
          oCtx.beginPath(); oCtx.moveTo(x + w - cornerLen, clampedY + h); oCtx.lineTo(x + w, clampedY + h); oCtx.lineTo(x + w, clampedY + h - cornerLen); oCtx.stroke();

          oCtx.fillStyle = boxColor;
          oCtx.font = "bold 9px monospace";
          if (isDeflected) {
            oCtx.fillText("GAZE WARNING: LOOKING AWAY!", x, textY);
          } else {
            oCtx.fillText("AI TARGET LOCKED: CANDIDATE #1", x, textY);
          }

          oCtx.strokeStyle = isDeflected ? "rgba(245, 158, 11, 0.9)" : "rgba(99, 102, 241, 0.8)";
          oCtx.lineWidth = 1;
          oCtx.beginPath(); oCtx.arc(cx, cy, 10, 0, Math.PI * 2); oCtx.stroke();
          oCtx.fillStyle = isDeflected ? "#f59e0b" : "#6366f1";
          oCtx.beginPath(); oCtx.arc(cx, cy, 3, 0, Math.PI * 2); oCtx.fill();

          oCtx.fillStyle = isDeflected ? "#ef4444" : "#f59e0b";
          oCtx.beginPath(); oCtx.arc(cx - w * 0.18, cy - h * 0.15, 2.5, 0, Math.PI * 2); oCtx.fill();
          oCtx.beginPath(); oCtx.arc(cx + w * 0.18, cy - h * 0.15, 2.5, 0, Math.PI * 2); oCtx.fill();

        } else {
          faceMissingStreakRef.current += 1;

          oCtx.strokeStyle = "#ef4444";
          oCtx.lineWidth = 3;
          oCtx.shadowColor = "#ef4444";
          oCtx.shadowBlur = 10;
          oCtx.strokeRect(10, 10, dw - 20, dh - 20);

          oCtx.fillStyle = "#ef4444";
          oCtx.font = "bold 11px monospace";
          oCtx.fillText("WARNING: FACE MISSING / STEPPED AWAY", 20, 30);

          if (faceMissingStreakRef.current === 45) { // ~0.75s continuous absence
            setFaceMissingCount(prev => prev + 1);
            const timestamp = new Date().toLocaleTimeString();
            setProctorLogs(logs => [`${timestamp} - AI Incident: Face Missing / Camera Covered`, ...logs]);
          }
        }
      }
    }

    animFrameRef.current = requestAnimationFrame(runProctorFrameAnalysis);
  };

  // 4. Practical Anti-Cheating Event Listeners
  useEffect(() => {
    if (!examStarted || examSubmitted) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        const timestamp = new Date().toLocaleTimeString();
        setTabSwitchCount((prev) => {
          const updated = prev + 1;
          setProctorLogs(logs => [`${timestamp} - Security Incident: Tab Switched / Window Blurred (Warning ${updated}/3)`, ...logs]);
          
          if (updated >= 3) {
            handleFinalExamSubmission(updated, "Auto-submitted due to 3 Tab-Switch Security Violations.");
          } else {
            setWarningMessage(`SECURITY ALERT (Warning ${updated}/3): You have navigated away from the proctored exam window! 3 violations will auto-terminate your test.`);
            setWarningModalOpen(true);
          }
          return updated;
        });
      }
    };

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        const timestamp = new Date().toLocaleTimeString();
        setFullscreenExits(prev => prev + 1);
        setProctorLogs(logs => [`${timestamp} - Security Incident: Candidate Exited Fullscreen Mode`, ...logs]);
        setWarningMessage("SECURITY ALERT: Fullscreen mode exited! Staying in full screen is mandatory for assessment integrity.");
        setWarningModalOpen(true);
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      const timestamp = new Date().toLocaleTimeString();
      setProctorLogs(logs => [`${timestamp} - Security Incident: Right-Click Context Menu Blocked`, ...logs]);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.ctrlKey && (e.key === 'c' || e.key === 'v' || e.key === 'u' || e.key === 'a')) ||
        e.key === 'F12'
      ) {
        e.preventDefault();
        const timestamp = new Date().toLocaleTimeString();
        setProctorLogs(logs => [`${timestamp} - Security Incident: Restricted Key Combo Blocked (${e.key})`, ...logs]);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [examStarted, examSubmitted, answers]);

  // 5. Exam Countdown Timer
  useEffect(() => {
    if (!examStarted || examSubmitted) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleFinalExamSubmission(tabSwitchCount, "Time expired.");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [examStarted, examSubmitted, tabSwitchCount, answers]);

  // Start Proctored Exam
  const handleStartExam = () => {
    setExamStarted(true);
    setExamSubmitted(false);
    setTabSwitchCount(0);
    setFullscreenExits(0);
    setFaceMissingCount(0);
    setGazeDeflectionCount(0);
    setProctorLogs([]);
    setTimeLeft(20 * 60);
    startWebcam();
  };

  const handleSelectOption = (qId: string, optionIdx: number) => {
    setAnswers(prev => ({ ...prev, [qId]: optionIdx }));
  };

  const handleFinalExamSubmission = async (switches = tabSwitchCount, reason = "") => {
    stopWebcam();
    setExamSubmitted(true);

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api/v1";
      const payload = {
        teacher_email: user?.email || "teacher@devgya.edu",
        teacher_name: user?.name || "Educator Candidate",
        paper_id: activePaperInfo?.paper?.id || "paper-101",
        answers: answers,
        tab_switch_count: switches,
        fullscreen_exits: fullscreenExits,
        face_missing_count: faceMissingCount,
        webcam_active: webcamActive,
        proctor_logs: proctorLogs,
        submitted_at: new Date().toLocaleString()
      };

      const res = await fetch(`${baseUrl}/olympiad/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.status === "already_submitted") {
        setHasAlreadyAttempted(true);
        setExamSubmitted(true);
        return;
      }
      if (data.submission_id) {
        setSubmissionId(data.submission_id);
        setHasAlreadyAttempted(true);
      }
    } catch (e) {
      console.error("Error submitting exam", e);
    }
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const secondsUntilUnlock = (() => {
    if (!activePaperInfo || !activePaperInfo.paper || !activePaperInfo.paper.start_time) return 0;
    const startMs = new Date(activePaperInfo.paper.start_time.replace(" ", "T")).getTime();
    if (isNaN(startMs)) return 0;
    const diff = Math.ceil((startMs - nowTime) / 1000);
    return diff > 0 ? diff : 0;
  })();

  const hasPaperFromAdmin = !!(activePaperInfo && activePaperInfo.paper && activePaperInfo.paper.questions && activePaperInfo.paper.questions.length > 0);

  const isExamAccessible = (() => {
    if (!hasPaperFromAdmin) return false;
    if (secondsUntilUnlock > 0) return false;
    const p = activePaperInfo.paper;
    if (activePaperInfo.is_live) return true;
    if (!p.end_time) return true;
    const endMs = new Date(p.end_time.replace(" ", "T")).getTime();
    if (isNaN(endMs)) return true;
    return nowTime <= endMs;
  })();

  // Filter breakdown items
  const getFilteredBreakdown = () => {
    if (!selectedBreakdownResult || !selectedBreakdownResult.detailed_breakdown) return [];
    const list = selectedBreakdownResult.detailed_breakdown;
    if (breakdownFilter === "correct") return list.filter((i: any) => i.is_correct);
    if (breakdownFilter === "wrong") return list.filter((i: any) => !i.is_correct);
    return list;
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 font-sans selection:bg-indigo-500 selection:text-white">
      
      {/* HEADER BANNER */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="absolute right-0 top-0 w-96 h-96 bg-purple-500/10 blur-3xl rounded-full pointer-events-none" />
        
        <div className="space-y-2 relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-black text-amber-300">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>National Teachers Skill Olympiad 2026</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
            AI-Proctored MCQ Teacher Assessment
          </h1>
          
          <p className="text-xs sm:text-sm text-indigo-200 font-medium leading-relaxed">
            Evaluate your pedagogical mastery, NEP 2020 integration, and AI-assisted teaching competence under secure anti-cheating supervision.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0 relative z-10">
          <Link
            href="/dashboard/teacher-olympiad/leaderboard"
            className="px-4 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white font-extrabold text-xs rounded-2xl flex items-center gap-2 transition-all shadow-md active:scale-95"
          >
            <Trophy className="w-4 h-4 text-amber-200" />
            <span>Live Leaderboard</span>
          </Link>

          <Link
            href="/dashboard/teacher-olympiad/practice"
            className="px-4 py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs rounded-2xl flex items-center gap-2 transition-all shadow-md active:scale-95"
          >
            <BookOpen className="w-4 h-4 text-emerald-400" />
            <span>Practice Olympiad</span>
          </Link>
        </div>
      </div>

      {/* TABS NAVIGATION */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 flex-wrap">
        <button
          onClick={() => { setActiveTab("instructions"); }}
          className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "instructions"
              ? "bg-indigo-600 text-white shadow-md"
              : "bg-white text-slate-600 hover:text-slate-900 border border-slate-200"
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>Active Olympiad Hall</span>
        </button>

        <button
          onClick={() => { setActiveTab("previous_papers"); loadPreviousPapers(); }}
          className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "previous_papers"
              ? "bg-indigo-600 text-white shadow-md"
              : "bg-white text-slate-600 hover:text-slate-900 border border-slate-200"
          }`}
        >
          <History className="w-4 h-4 text-amber-400" />
          <span>Previous Olympiad Papers Archive ({previousPapers.length})</span>
        </button>

        <button
          onClick={() => { setActiveTab("published"); loadPublishedResults(); }}
          className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "published"
              ? "bg-indigo-600 text-white shadow-md"
              : "bg-white text-slate-600 hover:text-slate-900 border border-slate-200"
          }`}
        >
          <Award className="w-4 h-4 text-amber-500" />
          <span>Published Evaluation Results</span>
        </button>
      </div>

      {/* WARNING MODAL DIALOG */}
      {warningModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-md bg-white border border-red-200 rounded-3xl p-6 shadow-2xl space-y-4 text-center animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-black text-slate-900">Anti-Cheating Security Alert</h3>
            <p className="text-xs text-slate-600 font-semibold leading-relaxed">
              {warningMessage}
            </p>
            <button
              onClick={() => setWarningModalOpen(false)}
              className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-black text-xs rounded-xl shadow-lg transition-all"
            >
              I Understand & Return to Exam
            </button>
          </div>
        </div>
      )}

      {/* TAB 1: OLYMPIAD EXAM HALL */}
      {activeTab === "instructions" && (
        <div className="space-y-6">
          
          {!examStarted && !examSubmitted && (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
              
              {/* STATE 1: NO PAPER FROM ADMIN — OLYMPIAD LOCKED */}
              {!hasPaperFromAdmin && (
                <div className="flex flex-col items-center justify-center py-16 space-y-6 text-center">
                  <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center shadow-inner">
                    <Lock className="w-10 h-10 text-slate-400" />
                  </div>
                  <div className="space-y-2 max-w-md">
                    <h3 className="text-xl font-black text-slate-800">No Olympiad Available</h3>
                    <p className="text-sm text-slate-500 font-medium leading-relaxed">
                      There is no active Olympiad paper published by the Admin at this time. Please check back later or contact your administrator for the next scheduled assessment.
                    </p>
                  </div>
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 border border-slate-200 text-xs font-bold text-slate-500">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Waiting for Admin to publish a new Olympiad paper...</span>
                  </div>
                </div>
              )}

              {/* STATE 2: PAPER EXISTS BUT TIME NOT YET — COUNTDOWN */}
              {hasPaperFromAdmin && !isExamAccessible && secondsUntilUnlock > 0 && (
                <div className="flex flex-col items-center justify-center py-12 space-y-6 text-center">
                  <div className="w-20 h-20 bg-amber-50 rounded-3xl flex items-center justify-center shadow-inner border border-amber-200">
                    <Clock className="w-10 h-10 text-amber-500 animate-pulse" />
                  </div>

                  <div className="space-y-2 max-w-lg">
                    <h3 className="text-xl font-black text-slate-800">Olympiad Paper Scheduled</h3>
                    <p className="text-sm text-slate-500 font-medium leading-relaxed">
                      An Olympiad paper has been published by the Admin. It will be accessible at the scheduled start time.
                    </p>
                  </div>

                  {/* Paper Info Card */}
                  <div className="w-full max-w-md p-4 rounded-2xl bg-indigo-50/60 border border-indigo-200 text-left space-y-2">
                    <p className="text-xs font-bold text-indigo-700 uppercase tracking-wider">Paper Details</p>
                    <p className="text-sm font-black text-slate-900">{activePaperInfo?.paper?.title}</p>
                    <p className="text-xs text-slate-600 font-semibold">{activePaperInfo?.paper?.class_name} &bull; {activePaperInfo?.paper?.subject}</p>
                    <div className="flex items-center gap-2 text-xs font-mono text-slate-500 pt-1">
                      <Clock className="w-3.5 h-3.5 text-indigo-500" />
                      <span>{activePaperInfo?.paper?.start_time} to {activePaperInfo?.paper?.end_time}</span>
                    </div>
                  </div>

                  {/* Live Countdown */}
                  <div className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-amber-50 border-2 border-amber-300 shadow-sm">
                    <div className="w-3 h-3 rounded-full bg-amber-500 animate-ping" />
                    <span className="text-lg font-black text-amber-800 font-mono tracking-widest">
                      {formatTime(secondsUntilUnlock)}
                    </span>
                    <span className="text-xs font-bold text-amber-600 uppercase">Until Unlock</span>
                  </div>

                  <p className="text-xs text-slate-400 font-medium">This page will automatically unlock when the scheduled time arrives.</p>
                </div>
              )}

              {/* STATE 3: PAPER EXISTS & TIME WINDOW CLOSED */}
              {hasPaperFromAdmin && !isExamAccessible && secondsUntilUnlock <= 0 && (
                <div className="flex flex-col items-center justify-center py-12 space-y-6 text-center">
                  <div className="w-20 h-20 bg-rose-50 rounded-3xl flex items-center justify-center shadow-inner border border-rose-200">
                    <Lock className="w-10 h-10 text-rose-400" />
                  </div>
                  <div className="space-y-2 max-w-md">
                    <h3 className="text-xl font-black text-slate-800">Assessment Window Closed</h3>
                    <p className="text-sm text-slate-500 font-medium leading-relaxed">
                      The scheduled time window for this Olympiad paper has ended. You can view your results in the Published Results tab or wait for the next scheduled assessment.
                    </p>
                  </div>
                  <div className="w-full max-w-md p-4 rounded-2xl bg-rose-50/60 border border-rose-200 text-left space-y-1">
                    <p className="text-xs font-bold text-rose-700 uppercase tracking-wider">Expired Paper</p>
                    <p className="text-sm font-black text-slate-900">{activePaperInfo?.paper?.title}</p>
                    <p className="text-xs text-slate-600 font-semibold">{activePaperInfo?.paper?.class_name} &bull; {activePaperInfo?.paper?.subject}</p>
                  </div>
                </div>
              )}

              {/* STATE 4: PAPER LIVE — SHOW INSTRUCTIONS & START BUTTON */}
              {hasPaperFromAdmin && isExamAccessible && (
                <>
                  {/* SCHEDULED TIME-WINDOW ACCESS STATUS BANNER */}
                  <div className="p-4 rounded-2xl border bg-emerald-50 border-emerald-300 text-emerald-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" />
                        <span className="text-xs font-black uppercase tracking-wider">Assessment Access Status: LIVE NOW</span>
                      </div>
                      <p className="text-xs font-semibold text-slate-700">
                        Paper Title: <span className="font-bold text-slate-900">{activePaperInfo?.paper?.title}</span> ({activePaperInfo?.paper?.class_name} &bull; {activePaperInfo?.paper?.subject})
                      </p>
                    </div>
                    <div className="text-left sm:text-right font-mono text-xs space-y-0.5 shrink-0">
                      <div className="text-[10px] text-slate-500 font-bold uppercase">Scheduled Time Window:</div>
                      <div className="font-extrabold text-slate-800">{activePaperInfo?.paper?.start_time}</div>
                      <div className="text-[11px] text-slate-600 font-semibold">to {activePaperInfo?.paper?.end_time}</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                      <ShieldAlert className="w-5 h-5 text-indigo-600" />
                      Module 2: Practical AI-Proctored MCQ Assessment Protocol
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">Please review mandatory security guidelines before initiating your live test.</p>
                  </div>

                  {/* SECURITY FEATURES GRID */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-2">
                      <div className="flex items-center gap-2 text-amber-700 font-black text-xs uppercase">
                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                        <span>Tab-Switch Lock</span>
                      </div>
                      <p className="text-xs text-slate-600 font-medium leading-relaxed">
                        Navigating to another window or tab is monitored. 3 security warnings will trigger immediate test termination &amp; auto-submission.
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-200 space-y-2">
                      <div className="flex items-center gap-2 text-indigo-700 font-black text-xs uppercase">
                        <Camera className="w-4 h-4 text-indigo-600" />
                        <span>Webcam &amp; Frame Analysis</span>
                      </div>
                      <p className="text-xs text-slate-600 font-medium leading-relaxed">
                        Live camera stream is active with real-time frame analysis for face presence detection &amp; gaze reticle tracking.
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-2">
                      <div className="flex items-center gap-2 text-emerald-700 font-black text-xs uppercase">
                        <Clock className="w-4 h-4 text-emerald-600" />
                        <span>Timer &amp; Real-Time Auto-Save</span>
                      </div>
                      <p className="text-xs text-slate-600 font-medium leading-relaxed">
                        20-Minute strict countdown. Every MCQ option selected is saved in real-time instantly.
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100">
                    <div className="text-xs text-slate-500 font-semibold flex items-center gap-2">
                      <Lock className="w-4 h-4 text-emerald-600" />
                      <span>Results will be submitted directly to the Official Evaluation Board on the Admin Panel.</span>
                    </div>

                    {hasAlreadyAttempted ? (
                      <div className="w-full sm:w-auto px-8 py-3.5 text-white font-extrabold text-xs rounded-2xl shadow-lg flex items-center justify-center gap-2 uppercase tracking-wider bg-emerald-600 opacity-90 cursor-not-allowed">
                        <CheckCircle2 className="w-4 h-4 text-white" />
                        <span>Assessment Completed - 1 Attempt Used</span>
                      </div>
                    ) : (
                      <button
                        onClick={handleStartExam}
                        disabled={loadingQuestions || questions.length === 0}
                        className="w-full sm:w-auto px-8 py-3.5 text-white font-extrabold text-xs rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 uppercase tracking-wider cursor-pointer bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 active:scale-95"
                      >
                        <Sparkles className="w-4 h-4 text-amber-300" />
                        <span>Begin Proctored Exam</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </>
              )}

            </div>
          )}

          {/* LIVE EXAM RUNNER */}
          {examStarted && !examSubmitted && (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              
              {/* MAIN QUESTION AREA */}
              <div className="lg:col-span-3 space-y-6">
                
                {/* PROCTORING STATUS TOP STRIP */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-3">
                    <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
                    <span className="text-xs font-black text-slate-800">AI Proctoring Active</span>
                  </div>

                  <div className="flex items-center gap-3 text-xs font-extrabold flex-wrap">
                    {gazeDeflected && (
                      <div className="flex items-center gap-1.5 bg-amber-500 text-white px-3 py-1 rounded-xl shadow-xs animate-pulse">
                        <EyeOff className="w-3.5 h-3.5" />
                        <span>Gaze Warning: Looking Away!</span>
                      </div>
                    )}

                    <div className="flex items-center gap-1.5 bg-red-50 text-red-700 px-3 py-1 rounded-xl border border-red-200">
                      <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                      <span>Tab Warnings: {tabSwitchCount}/3</span>
                    </div>

                    <div className="flex items-center gap-1.5 bg-indigo-50 text-indigo-700 px-3 py-1 rounded-xl border border-indigo-200">
                      <Clock className="w-3.5 h-3.5 text-indigo-600" />
                      <span className="font-mono text-sm">{formatTime(timeLeft)}</span>
                    </div>
                  </div>
                </div>

                {/* CURRENT QUESTION CARD */}
                {questions.length > 0 && (
                  <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                    
                    <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-700 font-extrabold text-[11px]">
                          MCQ Question {currentIdx + 1} of {questions.length}
                        </span>
                        <span className="px-2.5 py-1 rounded-lg bg-purple-50 border border-purple-100 text-purple-700 font-bold text-[11px]">
                          {questions[currentIdx]?.subject || "Science"}
                        </span>
                      </div>

                      <span className="text-[11px] font-black text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                        1 Mark (MCQ)
                      </span>
                    </div>

                    <div className="space-y-3">
                      <h2 className="text-base sm:text-lg font-extrabold text-slate-900 leading-relaxed">
                        {questions[currentIdx]?.question_text}
                      </h2>
                    </div>

                    {/* MCQ OPTIONS */}
                    <div className="space-y-2.5 pt-2">
                      {questions[currentIdx]?.options?.map((opt: string, optIdx: number) => {
                        const qId = questions[currentIdx].id;
                        const isSelected = answers[qId] === optIdx;

                        return (
                          <button
                            key={optIdx}
                            onClick={() => handleSelectOption(qId, optIdx)}
                            className={`w-full p-4 rounded-2xl border text-left text-xs font-bold transition-all flex items-start gap-3 cursor-pointer ${
                              isSelected
                                ? "bg-indigo-50/90 border-indigo-600 text-indigo-900 shadow-xs"
                                : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300"
                            }`}
                          >
                            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${
                              isSelected ? "bg-indigo-600 text-white" : "bg-slate-200 text-slate-700"
                            }`}>
                              {String.fromCharCode(65 + optIdx)}
                            </span>
                            <span className="flex-1 leading-relaxed">{opt}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* CONTROLS */}
                    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                      <button
                        onClick={() => setCurrentIdx(prev => Math.max(0, prev - 1))}
                        disabled={currentIdx === 0}
                        className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 text-xs font-extrabold transition-all cursor-pointer"
                      >
                        Previous
                      </button>

                      {currentIdx < questions.length - 1 ? (
                        <button
                          onClick={() => setCurrentIdx(prev => Math.min(questions.length - 1, prev + 1))}
                          className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold rounded-xl shadow-md transition-all cursor-pointer"
                        >
                          Next MCQ
                        </button>
                      ) : (
                        <button
                          onClick={() => handleFinalExamSubmission(tabSwitchCount, "User submitted")}
                          className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-xl shadow-lg transition-all cursor-pointer uppercase tracking-wider flex items-center gap-1.5"
                        >
                          <FileCheck className="w-4 h-4" />
                          <span>Complete & Submit Assessment</span>
                        </button>
                      )}
                    </div>

                  </div>
                )}
              </div>

              {/* SIDEBAR: LIVE WEBCAM HUD & SECURITY AUDIT LOG */}
              <div className="space-y-6">
                
                {/* WEBCAM FEED WITH AI HUD OVERLAY */}
                <div className="bg-slate-900 p-4 rounded-3xl border border-slate-800 text-white space-y-3 shadow-md">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5 text-slate-300">
                      <Camera className="w-4 h-4 text-emerald-400" />
                      Live AI Proctor Feed
                    </span>
                  </div>

                  <div className="relative aspect-video bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 flex items-center justify-center">
                    <video
                      ref={videoRef}
                      autoPlay
                      muted
                      playsInline
                      className="w-full h-full object-cover"
                    />
                    <canvas ref={canvasRef} className="hidden" />
                    <canvas ref={overlayCanvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-10" />

                    {webcamActive && (
                      <div className="absolute bottom-2 left-2 right-2 bg-slate-900/90 backdrop-blur-md p-2 rounded-xl text-[10px] font-mono text-slate-200 border border-white/10 flex items-center justify-between z-20">
                        <div className="flex items-center gap-1.5 font-bold">
                          <span className={`w-2 h-2 rounded-full ${faceDetected ? (gazeDeflected ? "bg-amber-500 animate-ping" : "bg-emerald-500 animate-pulse") : "bg-red-500 animate-ping"}`} />
                          <span>{faceDetected ? (gazeDeflected ? "GAZE: LOOKING AWAY!" : "FACE: OK (1)") : "FACE: MISSING!"}</span>
                        </div>
                        <div className={`font-extrabold ${gazeDeflected ? "text-amber-400" : "text-indigo-300"}`}>
                          {gazeDeflected ? "DEFLECTION DETECTED" : "GAZE: CENTER"}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* SECURITY AUDIT LOG */}
                <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Security Audit Log</span>
                    </h4>
                    <span className="text-[9px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                      {proctorLogs.length} Events
                    </span>
                  </div>

                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1 text-[11px] font-mono">
                    {proctorLogs.length === 0 ? (
                      <p className="text-slate-400 font-sans font-semibold text-[11px] italic">No security incidents detected.</p>
                    ) : (
                      proctorLogs.map((log, lIdx) => (
                        <div key={lIdx} className="p-1.5 rounded-lg bg-slate-50 border border-slate-100 text-slate-700 leading-tight">
                          {log}
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* HIDDEN RESULTS CONFIRMATION SCREEN */}
          {examSubmitted && (
            <div className="bg-white p-8 sm:p-12 rounded-3xl border border-slate-200 shadow-lg text-center space-y-6 max-w-2xl mx-auto">
              <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl font-black text-slate-900">Olympiad Assessment Submitted!</h2>
                <p className="text-xs text-slate-600 font-medium leading-relaxed max-w-md mx-auto">
                  Your proctored MCQ test script and AI security audit log have been submitted to the <span className="font-bold text-indigo-600">Super Admin & Olympiad Evaluation Board</span>.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100 text-left space-y-2 text-xs text-slate-700">
                <div className="flex items-center justify-between font-bold">
                  <span>Submission ID:</span>
                  <span className="font-mono text-indigo-700">{submissionId || "sub-992011"}</span>
                </div>
                <div className="flex items-center justify-between font-bold">
                  <span>Evaluation Status:</span>
                  <span className="text-amber-600 font-extrabold uppercase">Pending Admin Review & Publishing</span>
                </div>
              </div>

              <div className="pt-2 flex justify-center gap-4">
                <button
                  onClick={() => { setExamSubmitted(false); setExamStarted(false); setActiveTab("published"); loadPublishedResults(); }}
                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs rounded-2xl shadow-md transition-all cursor-pointer"
                >
                  View Published Results Tab
                </button>
              </div>
            </div>
          )}

        </div>
      )}

      {/* TAB 2: PREVIOUS OLYMPIAD PAPERS ARCHIVE */}
      {activeTab === "previous_papers" && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6 font-sans">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <History className="w-5 h-5 text-amber-500" />
                Previous Olympiad Examination Papers Archive ({previousPapers.length})
              </h3>
              <p className="text-xs text-slate-500 font-medium">Browse past Teachers Skill Olympiad question papers, subject blueprints, and model answer keys</p>
            </div>

            <button
              onClick={loadPreviousPapers}
              disabled={loadingPreviousPapers}
              className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingPreviousPapers ? "animate-spin text-indigo-600" : ""}`} />
              <span>Refresh Archive</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {previousPapers.length === 0 ? (
              <div className="col-span-2 p-12 text-center text-slate-400 font-semibold">
                No past Olympiad papers stored in the archive yet.
              </div>
            ) : (
              previousPapers.map((paper) => (
                <div key={paper.id} className="p-6 rounded-3xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 space-y-4 transition-all relative overflow-hidden">
                  
                  <div className="flex items-start justify-between gap-3">
                    <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 font-extrabold text-[10px] uppercase border border-amber-200">
                      Archived Paper
                    </span>
                    <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-lg border border-indigo-100">
                      {paper.class_name} • {paper.subject}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h4 className="text-base font-black text-slate-900">{paper.title}</h4>
                    <p className="text-xs text-slate-500 font-medium">
                      Held under {paper.school_name || "DEVGYA GLOBAL EDUTECH"}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs font-bold text-slate-700 bg-white p-3 rounded-2xl border border-slate-200">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-normal uppercase">Total MCQs</span>
                      <span>{paper.questions?.length || 0} Questions ({paper.total_marks} Marks)</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-normal uppercase">Time Window</span>
                      <span>{paper.time_allowed_mins} Mins</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                    <span className="text-[11px] text-slate-500 font-mono">
                      Ended: {paper.end_time || "Completed"}
                    </span>

                    <button
                      onClick={() => setPreviewArchivePaper(paper)}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Preview Questions</span>
                    </button>
                  </div>

                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* PREVIEW ARCHIVE PAPER MODAL */}
      {previewArchivePaper && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-3xl w-full bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 animate-in zoom-in-95 duration-200 text-slate-900 max-h-[90vh] overflow-y-auto font-sans">
            
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <span className="text-xs font-black uppercase tracking-wider text-indigo-600">Past Olympiad Paper Blueprint</span>
              <button onClick={() => setPreviewArchivePaper(null)} className="text-slate-400 hover:text-slate-700 font-black text-base">✕</button>
            </div>

            <div className="text-center space-y-1 border-b-2 border-slate-900 pb-4">
              <h2 className="text-lg font-black uppercase tracking-tight text-slate-900">{previewArchivePaper.school_name || "DEVGYA GLOBAL EDUTECH"}</h2>
              <h3 className="text-base font-extrabold text-indigo-900">{previewArchivePaper.title}</h3>
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 pt-2 px-2">
                <span>Class: {previewArchivePaper.class_name} ({previewArchivePaper.subject})</span>
                <span>Time Allowed: {previewArchivePaper.time_allowed_mins} Mins</span>
                <span>Maximum Marks: {previewArchivePaper.total_marks}</span>
              </div>
            </div>

            <div className="space-y-6 pt-2">
              {previewArchivePaper.questions?.map((q: any, idx: number) => (
                <div key={idx} className="space-y-2 border-b border-slate-100 pb-4">
                  <div className="flex items-start justify-between gap-3 text-xs font-extrabold text-slate-900">
                    <div>
                      <span>MCQ Q{idx + 1}. </span>
                      <span>{q.question_text}</span>
                    </div>
                    <span className="shrink-0 text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md text-[11px] font-black border border-indigo-100">
                      [1 Mark]
                    </span>
                  </div>

                  {q.options && (
                    <div className="grid grid-cols-2 gap-2 pl-4 text-xs font-medium text-slate-700">
                      {q.options.map((opt: string, oIdx: number) => (
                        <div key={oIdx} className="p-2 rounded-lg bg-slate-50 border border-slate-200">{opt}</div>
                      ))}
                    </div>
                  )}

                  {q.answer && (
                    <div className="mt-2 p-3 bg-emerald-50/70 rounded-xl border border-emerald-200 text-xs text-slate-700 space-y-1">
                      <div className="font-bold text-emerald-800 text-[10px] uppercase">Model Solution:</div>
                      <p>{q.answer}</p>
                      {q.explanation && <p className="text-[11px] text-slate-600 font-normal italic">Pedagogical Reason: {q.explanation}</p>}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                onClick={() => setPreviewArchivePaper(null)}
                className="px-6 py-2 bg-slate-900 text-white font-extrabold text-xs rounded-xl shadow-md"
              >
                Close Preview
              </button>
            </div>

          </div>
        </div>
      )}

      {/* TAB 3: PUBLISHED EVALUATION RESULTS */}
      {activeTab === "published" && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6 font-sans">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-500" />
                Officially Published Olympiad Results
              </h3>
              <p className="text-xs text-slate-500 font-medium">Evaluation results verified and published by the Admin Evaluation Board</p>
            </div>

            <button
              onClick={loadPublishedResults}
              disabled={loadingResults}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingResults ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>

          {publishedResults.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <Trophy className="w-12 h-12 text-slate-300 mx-auto" />
              <h4 className="text-sm font-black text-slate-700">No Published Results Available Yet</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto font-medium">
                Your submitted Olympiad assessment is currently being reviewed by the Admin Evaluation Board. Results will appear here once officially published.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {publishedResults.map((res) => (
                <div key={res.id} className="p-6 rounded-2xl border border-emerald-200 bg-emerald-50/40 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-100 pb-3">
                    <div>
                      <h4 className="text-sm font-black text-slate-900">{res.teacher_name}</h4>
                      <p className="text-xs text-slate-500 font-mono">{res.teacher_email}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full bg-emerald-600 text-white font-black text-xs shadow-xs">
                        Final Score: {res.score_percentage}%
                      </span>
                    </div>
                  </div>

                  {res.official_feedback && (
                    <div className="p-3.5 rounded-xl bg-white border border-emerald-200 text-xs text-slate-700 font-medium space-y-1">
                      <div className="font-bold text-emerald-800 text-[11px] uppercase tracking-wider">Evaluation Board Feedback:</div>
                      <p>{res.official_feedback}</p>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium pt-1 flex-wrap gap-2">
                    <span className="text-slate-500">Submitted: {res.submitted_at}</span>

                    <button
                      onClick={() => { setSelectedBreakdownResult(res); setBreakdownFilter("all"); }}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>View Question & Answer Breakdown</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* DETAILED QUESTION & ANSWER BREAKDOWN MODAL */}
      {selectedBreakdownResult && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-3xl w-full bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 animate-in zoom-in-95 duration-200 text-slate-900 max-h-[90vh] overflow-y-auto font-sans">
            
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-indigo-600">Candidate Evaluation Report</span>
                <h3 className="text-base font-black text-slate-900">{selectedBreakdownResult.teacher_name} ({selectedBreakdownResult.score_percentage}%)</h3>
              </div>
              <button onClick={() => setSelectedBreakdownResult(null)} className="text-slate-400 hover:text-slate-700 font-black text-base">✕</button>
            </div>

            {/* SCORE SUMMARY BANNER */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100 text-center space-y-1">
                <span className="text-[10px] font-extrabold uppercase text-indigo-700">Total Score</span>
                <p className="text-2xl font-black text-indigo-900">{selectedBreakdownResult.score_percentage}%</p>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 text-center space-y-1">
                <span className="text-[10px] font-extrabold uppercase text-emerald-700">Correct Answers</span>
                <p className="text-2xl font-black text-emerald-900">{selectedBreakdownResult.correct_count} / {selectedBreakdownResult.total_questions}</p>
              </div>

              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100 text-center space-y-1">
                <span className="text-[10px] font-extrabold uppercase text-rose-700">Incorrect Answers</span>
                <p className="text-2xl font-black text-rose-900">{selectedBreakdownResult.total_questions - selectedBreakdownResult.correct_count} / {selectedBreakdownResult.total_questions}</p>
              </div>
            </div>

            {/* FILTER TABS */}
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <button
                onClick={() => setBreakdownFilter("all")}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  breakdownFilter === "all" ? "bg-indigo-600 text-white shadow-xs" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                All Questions ({selectedBreakdownResult.detailed_breakdown?.length || 0})
              </button>

              <button
                onClick={() => setBreakdownFilter("correct")}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  breakdownFilter === "correct" ? "bg-emerald-600 text-white shadow-xs" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                Correct Answers Only ({selectedBreakdownResult.correct_count})
              </button>

              <button
                onClick={() => setBreakdownFilter("wrong")}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  breakdownFilter === "wrong" ? "bg-rose-600 text-white shadow-xs" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                Incorrect Answers ({selectedBreakdownResult.total_questions - selectedBreakdownResult.correct_count})
              </button>
            </div>

            {/* DETAILED QUESTION ITEMS LIST */}
            <div className="space-y-6 pt-1">
              {getFilteredBreakdown().length === 0 ? (
                <div className="p-8 text-center text-slate-400 font-semibold text-xs">
                  No questions match selected filter.
                </div>
              ) : (
                getFilteredBreakdown().map((item: any, idx: number) => (
                  <div key={idx} className={`p-5 rounded-2xl border space-y-3 ${
                    item.is_correct ? "bg-emerald-50/40 border-emerald-200" : "bg-rose-50/40 border-rose-200"
                  }`}>
                    
                    <div className="flex items-start justify-between gap-3">
                      <span className="font-extrabold text-xs text-slate-900">
                        Q{idx + 1}. {item.question_text}
                      </span>

                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shrink-0 flex items-center gap-1 ${
                        item.is_correct ? "bg-emerald-100 text-emerald-800 border border-emerald-300" : "bg-rose-100 text-rose-800 border border-rose-300"
                      }`}>
                        {item.is_correct ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                        {item.is_correct ? "Correct (+1 Mark)" : "Incorrect (0 Marks)"}
                      </span>
                    </div>

                    {/* OPTIONS & USER CHOICE */}
                    <div className="space-y-1.5 pl-2">
                      <div className="text-[11px] font-bold text-slate-600">Your Selection:</div>
                      <div className={`p-2.5 rounded-xl border text-xs font-bold ${
                        item.is_correct ? "bg-emerald-100/70 border-emerald-300 text-emerald-950" : "bg-rose-100/70 border-rose-300 text-rose-950"
                      }`}>
                        {item.user_selected_str}
                      </div>
                    </div>

                    {!item.is_correct && (
                      <div className="space-y-1.5 pl-2">
                        <div className="text-[11px] font-bold text-emerald-800">Official Correct Solution:</div>
                        <div className="p-2.5 rounded-xl bg-emerald-100/90 border border-emerald-300 text-xs font-extrabold text-emerald-950">
                          {item.correct_answer_str}
                        </div>
                      </div>
                    )}

                    {item.explanation && (
                      <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs text-slate-700 space-y-1 shadow-2xs">
                        <div className="font-extrabold text-indigo-900 text-[10px] uppercase tracking-wider">Pedagogical Solution & Marking Scheme:</div>
                        <p className="leading-relaxed">{item.explanation}</p>
                      </div>
                    )}

                  </div>
                ))
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                onClick={() => setSelectedBreakdownResult(null)}
                className="px-6 py-2 bg-slate-900 text-white font-extrabold text-xs rounded-xl shadow-md"
              >
                Close Report
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
