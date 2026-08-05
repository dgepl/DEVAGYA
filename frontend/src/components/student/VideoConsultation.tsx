"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Phone,
  PhoneOff,
  Volume2,
  VolumeX,
  Bot,
  User,
  Smile,
  Globe,
  Send,
  MessageSquare,
  X,
} from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import * as faceapi from "@vladmandic/face-api";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "/api/v1";

const LANGUAGES = [
  { code: "english", label: "English", flag: "🇺🇸", speechLang: "en-IN", ttsLang: "en-IN" },
  { code: "hindi", label: "Hindi", flag: "🇮🇳", speechLang: "hi-IN", ttsLang: "hi-IN" },
  { code: "hinglish", label: "Hinglish", flag: "🇮🇳", speechLang: "hi-IN", ttsLang: "hi-IN" },
];

const EXPR_EMOJI: Record<string, string> = {
  happy: "😊", sad: "😢", confused: "😕", surprised: "😮",
  neutral: "😐", angry: "😠", fearful: "😨",
};

export function VideoConsultation() {
  const user = useAppStore((s) => s.user);

  // State
  const [inCall, setInCall] = useState(false);
  const [cameraOn, setCameraOn] = useState(true);
  const [micOn, setMicOn] = useState(true);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [language, setLanguage] = useState("english");
  const [aiSpeaking, setAiSpeaking] = useState(false);
  const [aiThinking, setAiThinking] = useState(false);
  const [expression, setExpression] = useState("neutral");
  const [faceReady, setFaceReady] = useState(false);
  const [callTime, setCallTime] = useState(0);

  // Subtitles (shown ON the video, not in a chat panel)
  const [userSub, setUserSub] = useState("");
  const [aiSub, setAiSub] = useState("");

  // Text input + transcript panel toggle
  const [textInput, setTextInput] = useState("");
  const [showTranscript, setShowTranscript] = useState(false);
  const [transcript, setTranscript] = useState<{ who: "you" | "ai"; text: string }[]>([]);

  // Speech
  const [speechOk, setSpeechOk] = useState(true);

  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<any>(null);
  const faceTimerRef = useRef<any>(null);
  const inCallRef = useRef(false);
  const micOnRef = useRef(true);
  const transcriptRef = useRef<HTMLDivElement>(null);

  const lang = LANGUAGES.find((l) => l.code === language) || LANGUAGES[0];

  // Keep refs in sync (fixes stale closure issue)
  useEffect(() => { inCallRef.current = inCall; }, [inCall]);
  useEffect(() => { micOnRef.current = micOn; }, [micOn]);

  // Auto-scroll transcript
  useEffect(() => { transcriptRef.current?.scrollTo(0, 99999); }, [transcript]);

  // Call timer
  useEffect(() => {
    if (inCall) {
      timerRef.current = setInterval(() => setCallTime((p) => p + 1), 1000);
    } else {
      clearInterval(timerRef.current);
      setCallTime(0);
    }
    return () => clearInterval(timerRef.current);
  }, [inCall]);

  const fmt = (s: number) => `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  // ── CAMERA ──
  const startCamera = useCallback(async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
        audio: true,
      });
      streamRef.current = s;
      if (videoRef.current) { videoRef.current.srcObject = s; videoRef.current.play().catch(() => {}); }
    } catch {
      try {
        const s = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = s;
        setCameraOn(false);
      } catch {
        setCameraOn(false);
        setMicOn(false);
      }
    }
  }, []);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
  }, []);

  // Re-attach stream after render
  useEffect(() => {
    if (inCall && streamRef.current && videoRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch(() => {});
    }
  }, [inCall]);

  const toggleCamera = () => {
    const vt = streamRef.current?.getVideoTracks()[0];
    if (vt) { vt.enabled = !vt.enabled; setCameraOn(vt.enabled); }
  };
  const toggleMic = () => {
    const at = streamRef.current?.getAudioTracks()[0];
    if (at) { at.enabled = !at.enabled; setMicOn(at.enabled); }
  };

  // ── SPEECH RECOGNITION (uses refs to avoid stale closures) ──
  const startListening = useCallback(() => {
    if (recognitionRef.current) return; // Already running
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { setSpeechOk(false); return; }

    const rec = new SR();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = lang.speechLang;

    rec.onresult = (e: any) => {
      let interim = "";
      let final = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) { final += t; } else { interim += t; }
      }
      // Show interim as live subtitle
      if (interim) setUserSub(interim);
      if (final) {
        setUserSub(final);
        sendMessage(final);
      }
    };

    rec.onerror = (e: any) => {
      console.warn("Speech:", e.error);
      if (["network", "not-allowed", "service-not-allowed"].includes(e.error)) {
        setSpeechOk(false);
        recognitionRef.current = null;
      }
    };

    // ALWAYS restart when it ends (unless call ended)
    rec.onend = () => {
      recognitionRef.current = null;
      if (inCallRef.current && micOnRef.current) {
        // Small delay then restart
        setTimeout(() => {
          if (inCallRef.current && micOnRef.current) startListening();
        }, 300);
      }
    };

    recognitionRef.current = rec;
    try { rec.start(); } catch { setSpeechOk(false); }
  }, [lang.speechLang]); // Minimal deps — uses refs

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
  }, []);

  // ── TTS ──
  const speak = useCallback((text: string) => {
    if (!ttsEnabled || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.rate = 1.05; utt.pitch = 1; utt.lang = lang.ttsLang;
    utt.onstart = () => setAiSpeaking(true);
    utt.onend = () => { setAiSpeaking(false); setTimeout(() => setAiSub(""), 3000); };
    window.speechSynthesis.speak(utt);
  }, [ttsEnabled, lang.ttsLang]);

  // ── SEND MESSAGE TO AI ──
  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || aiThinking) return;
    setUserSub("");
    setTranscript((p) => [...p, { who: "you", text }]);
    setAiThinking(true);

    try {
      const fd = new FormData();
      const ctx = expression !== "neutral" ? `[Student looks ${expression}] ${text}` : text;
      fd.append("message", ctx);
      fd.append("agent_code", "student_tutor");
      fd.append("user_id", user.id);
      fd.append("language", language);

      const res = await fetch(`${API_BASE}/agents/chat`, { method: "POST", body: fd });

      if (res.body) {
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let full = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          full += decoder.decode(value, { stream: true });
          // Show live on video
          setAiSub(full.length > 250 ? "..." + full.slice(-250) : full);
        }
        try { const j = JSON.parse(full); full = j.response || full; } catch {}
        setAiSub(full.length > 250 ? full.slice(0, 250) + "..." : full);
        setTranscript((p) => [...p, { who: "ai", text: full }]);
        speak(full);
      } else {
        const d = await res.json();
        const t = d.response || "I'm here to help!";
        setAiSub(t.length > 250 ? t.slice(0, 250) + "..." : t);
        setTranscript((p) => [...p, { who: "ai", text: t }]);
        speak(t);
      }
    } catch {
      setAiSub("Connection issue. Try again.");
    } finally {
      setAiThinking(false);
    }
  }, [user.id, expression, speak, language, aiThinking]);

  // ── FACE-API.JS ──
  useEffect(() => {
    (async () => {
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
          faceapi.nets.faceExpressionNet.loadFromUri("/models"),
        ]);
        setFaceReady(true);
      } catch (e) { console.warn("Face models failed:", e); }
    })();
  }, []);

  useEffect(() => {
    if (!inCall || !cameraOn || !faceReady) return;
    const detect = async () => {
      if (!videoRef.current) return;
      try {
        const d = await faceapi
          .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.5 }))
          .withFaceExpressions();
        if (d?.expressions) {
          let best = "neutral", bestVal = 0;
          for (const [k, v] of Object.entries(d.expressions as any)) {
            if (typeof v === "number" && v > bestVal) { bestVal = v; best = k; }
          }
          if (bestVal > 0.4) setExpression(best);
        }
      } catch {}
    };
    faceTimerRef.current = setInterval(detect, 500);
    return () => clearInterval(faceTimerRef.current);
  }, [inCall, cameraOn, faceReady]);

  // ── START / END CALL ──
  const startCall = async () => {
    await startCamera();
    setInCall(true);
    setTranscript([]);
    const msg = language === "hindi"
      ? "नमस्ते! मैं आपका AI ट्यूटर हूँ। बोलिए, मैं सुन रहा हूँ! 🎓"
      : "Hi! I'm your AI Tutor. Just speak — I'm listening! 🎓";
    setAiSub(msg);
    setTranscript([{ who: "ai", text: msg }]);
    setTimeout(() => startListening(), 500);
    speak(msg);
  };

  const endCall = () => {
    stopListening();
    stopCamera();
    window.speechSynthesis?.cancel();
    setInCall(false);
    setCameraOn(true);
    setMicOn(true);
    setAiSpeaking(false);
    setExpression("neutral");
    setUserSub("");
    setAiSub("");
  };

  // ══════════ PRE-CALL ══════════
  if (!inCall) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500">
        <div className="bg-gradient-to-br from-violet-600 via-purple-700 to-indigo-800 text-white p-10 rounded-3xl shadow-2xl text-center space-y-6">
          <div className="w-20 h-20 mx-auto rounded-full bg-white/15 flex items-center justify-center backdrop-blur-sm border-2 border-white/20">
            <Video className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-extrabold">AI Video Consultation</h1>
          <p className="text-violet-100 max-w-md mx-auto">
            Live video call with AI Tutor. Just speak naturally — no typing needed.
            AI responds with voice in real-time.
          </p>

          <div className="flex items-center justify-center gap-2 pt-2">
            <Globe className="w-4 h-4 text-violet-200" />
            {LANGUAGES.map((l) => (
              <button key={l.code} onClick={() => setLanguage(l.code)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${language === l.code ? "bg-white text-violet-700 shadow-lg" : "bg-white/10 text-white hover:bg-white/20"}`}>
                {l.flag} {l.label}
              </button>
            ))}
          </div>

          <button onClick={startCall}
            className="px-10 py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-base rounded-2xl shadow-xl shadow-emerald-500/30 transition-all flex items-center gap-3 mx-auto">
            <Phone className="w-5 h-5" /> Start AI Video Call
          </button>
        </div>
      </div>
    );
  }

  // ══════════ IN-CALL (FULL VIDEO-CENTRIC) ══════════
  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col animate-in fade-in duration-300 relative">
      {/* FULL-WIDTH VIDEO */}
      <div className="flex-1 relative bg-slate-900 rounded-2xl overflow-hidden min-h-[300px]">
        <video ref={videoRef} autoPlay muted playsInline
          style={{ display: cameraOn ? "block" : "none", position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", transform: "scaleX(-1)" }}
        />
        {!cameraOn && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
            <div className="w-24 h-24 rounded-full bg-slate-700 flex items-center justify-center">
              <User className="w-12 h-12 text-slate-400" />
            </div>
          </div>
        )}

        {/* ─── TOP BAR ─── */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <div className="px-3 py-1.5 bg-black/60 backdrop-blur-sm rounded-xl flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-white text-xs font-bold">{fmt(callTime)}</span>
            </div>
            <div className="px-3 py-1.5 bg-violet-600/80 backdrop-blur-sm rounded-xl">
              <span className="text-white text-xs font-bold">{lang.flag} {lang.label}</span>
            </div>
            {!speechOk && (
              <div className="px-3 py-1.5 bg-amber-500/80 backdrop-blur-sm rounded-xl">
                <span className="text-white text-xs font-bold">🎤 Voice Off</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className="px-3 py-1.5 bg-black/60 backdrop-blur-sm rounded-xl flex items-center gap-2">
              <span className="text-lg">{EXPR_EMOJI[expression] || "😐"}</span>
              <span className="text-white text-xs font-bold capitalize">{expression}</span>
            </div>
            <button onClick={() => setShowTranscript(!showTranscript)}
              className="px-3 py-1.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl text-white transition-all">
              <MessageSquare className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ─── AI SUBTITLE (big, centered on video) ─── */}
        {aiSub && (
          <div className="absolute bottom-20 left-4 right-4 z-10 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="bg-violet-600/90 backdrop-blur-md rounded-2xl px-6 py-4 shadow-2xl max-w-2xl mx-auto">
              {aiSpeaking && (
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex gap-0.5">
                    {[1,2,3,4,5].map((i) => (
                      <div key={i} className="w-1 bg-white/80 rounded-full animate-pulse" style={{ height: `${6 + Math.random() * 10}px`, animationDelay: `${i * 0.1}s` }} />
                    ))}
                  </div>
                  <span className="text-white/80 text-[10px] font-bold uppercase tracking-wide">AI Tutor</span>
                </div>
              )}
              <p className="text-white text-sm sm:text-base font-semibold leading-relaxed">{aiSub}</p>
            </div>
          </div>
        )}

        {/* ─── USER SPEECH SUBTITLE (bottom of video) ─── */}
        {userSub && !aiSub && (
          <div className="absolute bottom-20 left-4 right-4 z-10 animate-in fade-in duration-200">
            <div className="bg-indigo-600/80 backdrop-blur-md rounded-2xl px-6 py-3 shadow-xl max-w-2xl mx-auto">
              <div className="flex items-center gap-2 mb-1">
                <Mic className="w-3 h-3 text-white/80 animate-pulse" />
                <span className="text-white/80 text-[10px] font-bold uppercase tracking-wide">You</span>
              </div>
              <p className="text-white text-sm font-semibold">{userSub}</p>
            </div>
          </div>
        )}

        {/* ─── AI THINKING ─── */}
        {aiThinking && !aiSub && (
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-10 px-6 py-3 bg-slate-800/80 backdrop-blur-sm rounded-2xl flex items-center gap-3">
            {[0,1,2].map((i) => (
              <div key={i} className="w-2.5 h-2.5 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
            ))}
            <span className="text-white text-xs font-bold">AI is thinking...</span>
          </div>
        )}

        {/* ─── TRANSCRIPT PANEL (slide-over, optional) ─── */}
        {showTranscript && (
          <div className="absolute top-0 right-0 bottom-0 w-80 bg-white/95 backdrop-blur-md z-20 flex flex-col animate-in slide-in-from-right duration-300 border-l border-slate-200">
            <div className="p-3 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-violet-600" />
                <span className="text-xs font-extrabold text-slate-900">Transcript</span>
              </div>
              <button onClick={() => setShowTranscript(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div ref={transcriptRef} className="flex-1 overflow-y-auto p-3 space-y-2">
              {transcript.map((m, i) => (
                <div key={i} className={`flex ${m.who === "you" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] px-3 py-2 rounded-2xl text-xs font-medium ${
                    m.who === "you" ? "bg-indigo-600 text-white rounded-br-md" : "bg-slate-100 text-slate-800 rounded-bl-md"
                  }`}>
                    {m.text}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ─── CONTROLS BAR ─── */}
      <div className="flex items-center justify-center gap-3 py-3">
        <button onClick={toggleCamera} className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${cameraOn ? "bg-slate-200 hover:bg-slate-300 text-slate-700" : "bg-red-100 text-red-600"}`}>
          {cameraOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
        </button>
        <button onClick={toggleMic} className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${micOn ? "bg-slate-200 hover:bg-slate-300 text-slate-700" : "bg-red-100 text-red-600"}`}>
          {micOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
        </button>
        <button onClick={endCall} className="w-14 h-14 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-lg shadow-red-300 transition-all">
          <PhoneOff className="w-6 h-6" />
        </button>
        <button onClick={() => setTtsEnabled(!ttsEnabled)} className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${ttsEnabled ? "bg-slate-200 hover:bg-slate-300 text-slate-700" : "bg-amber-100 text-amber-600"}`}>
          {ttsEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
        </button>
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${faceReady ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-400 animate-pulse"}`} title={faceReady ? "Expression AI active" : "Loading..."}>
          <Smile className="w-5 h-5" />
        </div>

        {/* Text input inline */}
        <form onSubmit={(e) => { e.preventDefault(); if (textInput.trim()) { sendMessage(textInput.trim()); setTextInput(""); }}}
          className="flex items-center gap-2 ml-4">
          <input type="text" value={textInput} onChange={(e) => setTextInput(e.target.value)}
            placeholder="Type here..."
            className="w-48 px-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-200"
          />
          <button type="submit" disabled={!textInput.trim() || aiThinking}
            className="px-3 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl transition-all">
            <Send className="w-4 h-4" />
          </button>
        </form>

        {!speechOk && (
          <button onClick={() => { setSpeechOk(true); startListening(); }}
            className="px-3 py-2 text-xs font-bold bg-amber-100 text-amber-700 rounded-xl hover:bg-amber-200 transition-all flex items-center gap-1">
            <Mic className="w-3 h-3" /> Retry
          </button>
        )}
      </div>
    </div>
  );
}
