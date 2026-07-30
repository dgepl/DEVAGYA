"use client";

import { useState, useEffect } from "react";
import { 
  Clock, 
  Play, 
  Pause, 
  RotateCcw, 
  Music, 
  Zap, 
  Sparkles, 
  CheckCircle2,
  Volume2
} from "lucide-react";
import { logPomodoroSession } from "@/lib/api";

export function PomodoroTimer() {
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [sessionType, setSessionType] = useState<"pomodoro" | "short_break" | "long_break">("pomodoro");
  const [focusRating, setFocusRating] = useState(5);
  const [activeMusic, setActiveMusic] = useState<string>("lofi");
  const [logStatus, setLogStatus] = useState<string | null>(null);

  useEffect(() => {
    let interval: any = null;
    if (isActive && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft(prev => prev - 1);
      }, 1000);
    } else if (secondsLeft === 0 && isActive) {
      setIsActive(false);
      handleFinishSession();
    }
    return () => clearInterval(interval);
  }, [isActive, secondsLeft]);

  const toggleTimer = () => setIsActive(!isActive);

  const resetTimer = (type: "pomodoro" | "short_break" | "long_break") => {
    setIsActive(false);
    setSessionType(type);
    if (type === "pomodoro") setSecondsLeft(25 * 60);
    if (type === "short_break") setSecondsLeft(5 * 60);
    if (type === "long_break") setSecondsLeft(15 * 60);
  };

  const handleFinishSession = async () => {
    try {
      const res = await logPomodoroSession({
        duration_seconds: sessionType === "pomodoro" ? 25 * 60 : 5 * 60,
        focus_rating: focusRating
      });
      setLogStatus(res.message);
    } catch (e) {
      console.error(e);
    }
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* HEADER BAR */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-200">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900">Pomodoro Focus Timer</h1>
            <p className="text-xs text-slate-500">25-Minute Focus & Rest Cycles for Maximum Information Retention</p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
          {[
            { id: "pomodoro", label: "25m Focus" },
            { id: "short_break", label: "5m Break" },
            { id: "long_break", label: "15m Break" }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => resetTimer(item.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                sessionType === item.id ? "bg-indigo-600 text-white shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* MAIN CLOCK DISPLAY CARD */}
      <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 text-white p-8 sm:p-12 rounded-3xl border border-indigo-700/50 shadow-2xl text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-indigo-200 text-xs font-bold border border-white/10">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span className="capitalize">{sessionType.replace('_', ' ')} Session Active</span>
        </div>

        <div className="w-56 h-56 sm:w-64 sm:h-64 mx-auto rounded-full border-8 border-indigo-500/30 flex items-center justify-center bg-black/30 backdrop-blur-md relative shadow-inner">
          <span className="text-5xl sm:text-6xl font-black tracking-widest text-white font-mono">
            {formatTime(secondsLeft)}
          </span>
        </div>

        {/* TIMER CONTROL BUTTONS */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={toggleTimer}
            className={`px-8 py-3.5 rounded-2xl font-black text-sm transition-all shadow-lg flex items-center gap-2 ${
              isActive 
                ? "bg-amber-500 hover:bg-amber-600 text-slate-950" 
                : "bg-indigo-600 hover:bg-indigo-700 text-white"
            }`}
          >
            {isActive ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
            <span>{isActive ? "Pause Focus" : "Start Focus"}</span>
          </button>

          <button
            onClick={() => resetTimer(sessionType)}
            className="p-3.5 bg-white/10 hover:bg-white/20 text-indigo-200 rounded-2xl border border-white/10 transition-colors"
            title="Reset Timer"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>

        {/* FOCUS AMBIENCE MUSIC SELECTOR */}
        <div className="pt-6 border-t border-white/10 flex flex-wrap items-center justify-center gap-3 text-xs">
          <span className="text-indigo-300 font-bold flex items-center gap-1">
            <Volume2 className="w-4 h-4 text-amber-400" />
            <span>Focus Music Ambience:</span>
          </span>
          {[
            { id: "lofi", label: "Lofi Beats" },
            { id: "rain", label: "Raindrops" },
            { id: "alpha", label: "Alpha Waves" }
          ].map((m) => (
            <button
              key={m.id}
              onClick={() => setActiveMusic(m.id)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all border ${
                activeMusic === m.id
                  ? "bg-amber-400 text-slate-950 border-amber-400"
                  : "bg-white/5 border-white/10 text-indigo-200 hover:bg-white/10"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {logStatus && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-bold text-emerald-800 text-center animate-in fade-in">
          🎉 {logStatus}
        </div>
      )}

    </div>
  );
}
