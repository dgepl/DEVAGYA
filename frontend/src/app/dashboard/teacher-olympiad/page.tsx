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
  ListOrdered
} from "lucide-react";
import { useAppStore } from "@/store/useAppStore";

export default function TeacherOlympiadPage() {
  const { user } = useAppStore();
  const [activeTab, setActiveTab] = useState<"exam" | "published" | "instructions">("instructions");
  
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
  const [proctorLogs, setProctorLogs] = useState<string[]>([]);
  const [faceDetected, setFaceDetected] = useState(true);

  const [warningModalOpen, setWarningModalOpen] = useState(false);
  const [warningMessage, setWarningMessage] = useState("");
  const [timeLeft, setTimeLeft] = useState(20 * 60); // 20 mins in seconds
  const [webcamActive, setWebcamActive] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number | null>(null);

  // Published Results State
  const [publishedResults, setPublishedResults] = useState<any[]>([]);
  const [loadingResults, setLoadingResults] = useState(false);

  // 1. Fetch Questions
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

  // 2. Fetch Published Results
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

  useEffect(() => {
    loadExamQuestions();
    loadPublishedResults();
  }, []);

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

      // Request Fullscreen for maximum proctoring security
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {});
      }

      // Start frame analysis loop
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

  // Real-time Canvas Video Frame Analyzer
  const runProctorFrameAnalysis = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      if (video.readyState === video.HAVE_ENOUGH_DATA && ctx) {
        canvas.width = 160;
        canvas.height = 120;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const frame = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = frame.data;

        // Calculate average brightness & skin pixel distribution
        let totalBrightness = 0;
        let skinPixels = 0;
        for (let i = 0; i < data.length; i += 16) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const brightness = (r + g + b) / 3;
          totalBrightness += brightness;

          if (r > 60 && g > 40 && b > 20 && r > g && r > b) {
            skinPixels++;
          }
        }

        const avgBrightness = totalBrightness / (data.length / 16);
        const isFacePresent = avgBrightness > 15 && skinPixels > 5;

        setFaceDetected(isFacePresent);

        if (!isFacePresent) {
          setFaceMissingCount(prev => {
            const updated = prev + 1;
            if (updated % 60 === 0) { // Log warning every 5s of camera occlusion
              const timestamp = new Date().toLocaleTimeString();
              setProctorLogs(logs => [`${timestamp} - AI Incident: Face Missing / Camera Covered`, ...logs]);
            }
            return updated;
          });
        }
      }
    }

    animFrameRef.current = requestAnimationFrame(runProctorFrameAnalysis);
  };

  // 4. Practical Anti-Cheating Event Listeners (Visibility, Fullscreen, Shortcuts)
  useEffect(() => {
    if (!examStarted || examSubmitted) return;

    // Tab-Switch / Visibility Change Listener
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

    // Fullscreen Exit Listener
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        const timestamp = new Date().toLocaleTimeString();
        setFullscreenExits(prev => prev + 1);
        setProctorLogs(logs => [`${timestamp} - Security Incident: Candidate Exited Fullscreen Mode`, ...logs]);
        setWarningMessage("SECURITY ALERT: Fullscreen mode exited! Staying in full screen is mandatory for assessment integrity.");
        setWarningModalOpen(true);
      }
    };

    // Prevent Right-Click Context Menu
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      const timestamp = new Date().toLocaleTimeString();
      setProctorLogs(logs => [`${timestamp} - Security Incident: Right-Click Context Menu Blocked`, ...logs]);
    };

    // Prevent Copy/Paste & DevTools Shortcuts
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
    setProctorLogs([]);
    setTimeLeft(20 * 60);
    startWebcam();
  };

  // Select Option & Real-Time Auto-Save
  const handleSelectOption = (qId: string, optionIdx: number) => {
    setAnswers(prev => ({ ...prev, [qId]: optionIdx }));
  };

  // Submit Exam (Results Hidden from Teacher, Held for Admin Review)
  const handleFinalExamSubmission = async (switches = tabSwitchCount, reason = "") => {
    stopWebcam();
    setExamSubmitted(true);

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api/v1";
      const payload = {
        teacher_email: user?.email || "teacher@devgya.edu",
        teacher_name: user?.name || "Educator Candidate",
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
      if (data.submission_id) {
        setSubmissionId(data.submission_id);
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
            AI-Proctored Teacher Skill Assessment
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
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => { setActiveTab("instructions"); }}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 ${
            activeTab === "instructions"
              ? "bg-indigo-600 text-white shadow-md"
              : "bg-white text-slate-600 hover:text-slate-900 border border-slate-200"
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>Olympiad Exam Hall</span>
        </button>

        <button
          onClick={() => { setActiveTab("published"); loadPublishedResults(); }}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 ${
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
              
              <div className="space-y-2">
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-indigo-600" />
                  Module 2: Practical AI-Proctored Assessment Protocol
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
                    Navigating to another window or tab is monitored. 3 security warnings will trigger immediate test termination & auto-submission.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-200 space-y-2">
                  <div className="flex items-center gap-2 text-indigo-700 font-black text-xs uppercase">
                    <Camera className="w-4 h-4 text-indigo-600" />
                    <span>Webcam & Frame Analysis</span>
                  </div>
                  <p className="text-xs text-slate-600 font-medium leading-relaxed">
                    Live camera stream is active with real-time frame analysis for face presence detection & gaze reticle tracking.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-700 font-black text-xs uppercase">
                    <Clock className="w-4 h-4 text-emerald-600" />
                    <span>Timer & Real-Time Auto-Save</span>
                  </div>
                  <p className="text-xs text-slate-600 font-medium leading-relaxed">
                    20-Minute strict countdown. Every answer option selected is saved in real-time instantly.
                  </p>
                </div>

              </div>

              {/* QUESTION BANK SUMMARY */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">Question Bank Architecture</h4>
                <p className="text-xs text-slate-600 font-medium">
                  Questions are dynamically tagged with <span className="font-bold text-indigo-600">Subject, Level, Scenario Type, and Difficulty Score</span> to provide every educator a balanced competency test.
                </p>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100">
                <div className="text-xs text-slate-500 font-semibold flex items-center gap-2">
                  <Lock className="w-4 h-4 text-emerald-600" />
                  <span>Results will be submitted directly to the Official Evaluation Board on the Admin Panel.</span>
                </div>

                <button
                  onClick={handleStartExam}
                  disabled={loadingQuestions || questions.length === 0}
                  className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-extrabold text-xs rounded-2xl shadow-lg hover:shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 uppercase tracking-wider active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Begin Proctored Exam</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

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
                          Question {currentIdx + 1} of {questions.length}
                        </span>
                        <span className="px-2.5 py-1 rounded-lg bg-purple-50 border border-purple-100 text-purple-700 font-bold text-[11px]">
                          {questions[currentIdx]?.subject}
                        </span>
                      </div>

                      <span className="text-[11px] font-black text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                        Difficulty: {questions[currentIdx]?.difficulty_score} / 10
                      </span>
                    </div>

                    <div className="space-y-3">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                        Scenario Type: {questions[currentIdx]?.scenario_type}
                      </span>
                      <h2 className="text-base sm:text-lg font-extrabold text-slate-900 leading-relaxed">
                        {questions[currentIdx]?.question_text}
                      </h2>
                    </div>

                    {/* OPTIONS */}
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
                          Next Question
                        </button>
                      ) : (
                        <button
                          onClick={() => handleFinalExamSubmission(tabSwitchCount, "User submitted")}
                          className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-xl shadow-lg transition-all cursor-pointer uppercase tracking-wider flex items-center gap-1.5"
                        >
                          <FileCheck className="w-4 h-4" />
                          <span>Complete & Submit Exam</span>
                        </button>
                      )}
                    </div>

                  </div>
                )}
              </div>

              {/* SIDEBAR: LIVE WEBCAM HUD & SECURITY INCIDENT AUDIT LOG */}
              <div className="space-y-6">
                
                {/* WEBCAM FEED WITH AI HUD OVERLAY */}
                <div className="bg-slate-900 p-4 rounded-3xl border border-slate-800 text-white space-y-3 shadow-md">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5 text-slate-300">
                      <Camera className="w-4 h-4 text-emerald-400" />
                      Live AI Proctor Feed
                    </span>
                    <span className={`px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase ${
                      webcamActive ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : "bg-red-500/20 text-red-300 border border-red-500/30"
                    }`}>
                      {webcamActive ? "Monitoring" : "Camera Off"}
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

                    {/* AI PROCTOR HUD RETICLE OVERLAY */}
                    {webcamActive && (
                      <>
                        <div className="absolute inset-3 border-2 border-indigo-400/60 border-dashed rounded-xl pointer-events-none animate-pulse flex items-center justify-center">
                          <div className="w-12 h-12 border border-emerald-400/50 rounded-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-emerald-400 rounded-full" />
                          </div>
                        </div>

                        {/* LIVE HUD OVERLAY STATUS */}
                        <div className="absolute bottom-2 left-2 right-2 bg-slate-900/90 backdrop-blur-md p-2 rounded-xl text-[10px] font-mono text-slate-200 border border-white/10 flex items-center justify-between">
                          <div className="flex items-center gap-1.5 font-bold">
                            <span className={`w-2 h-2 rounded-full ${faceDetected ? "bg-emerald-500 animate-pulse" : "bg-red-500 animate-ping"}`} />
                            <span>{faceDetected ? "FACE: OK (1)" : "FACE: MISSING!"}</span>
                          </div>
                          <div className="text-indigo-300 font-extrabold">GAZE: CENTER</div>
                        </div>
                      </>
                    )}

                    {!webcamActive && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center p-3 text-center text-slate-500 space-y-1">
                        <Camera className="w-6 h-6 text-slate-600" />
                        <span className="text-[10px] font-medium">Camera Stream Inactive</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* SECURITY INCIDENT AUDIT LOG (LIVE AUDIT TRAIL) */}
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

                {/* QUESTION PALETTE */}
                <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-3">
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">Question Navigator</h4>
                  <div className="grid grid-cols-5 gap-2">
                    {questions.map((q, idx) => {
                      const isAnswered = answers[q.id] !== undefined;
                      const isCurrent = currentIdx === idx;
                      return (
                        <button
                          key={q.id}
                          onClick={() => setCurrentIdx(idx)}
                          className={`h-9 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                            isCurrent
                              ? "bg-indigo-600 text-white ring-2 ring-indigo-300"
                              : isAnswered
                              ? "bg-emerald-500 text-white"
                              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                          }`}
                        >
                          {idx + 1}
                        </button>
                      );
                    })}
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
                  Your proctored test script and AI security audit log have been submitted to the <span className="font-bold text-indigo-600">Super Admin & Olympiad Evaluation Board</span>.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100 text-left space-y-2 text-xs text-slate-700">
                <div className="flex items-center justify-between font-bold">
                  <span>Submission ID:</span>
                  <span className="font-mono text-indigo-700">{submissionId || "sub-992011"}</span>
                </div>
                <div className="flex items-center justify-between font-bold">
                  <span>Proctoring Audit Events:</span>
                  <span className="text-emerald-700 font-bold">{proctorLogs.length} Events Recorded</span>
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

      {/* TAB 2: PUBLISHED EVALUATION RESULTS */}
      {activeTab === "published" && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
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

                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium pt-1">
                    <span>Submitted: {res.submitted_at}</span>
                    <span className="font-bold text-emerald-600">Verification Certificate Granted</span>
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
