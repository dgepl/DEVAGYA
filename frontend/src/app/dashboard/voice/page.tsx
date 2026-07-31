"use client";

import { useState, useEffect } from "react";
import { Mic, MicOff, Volume2, Square, RotateCcw, Sparkles, Send, RefreshCw, MessageSquare } from "lucide-react";

export default function VoiceTutorPage() {
  const [voiceState, setVoiceState] = useState<"idle" | "listening" | "thinking" | "speaking">("idle");
  const [subject, setSubject] = useState("Science");
  const [transcript, setTranscript] = useState("");
  const [aiResponse, setAiResponse] = useState("Hello! I am your AI Voice Tutor. Click the microphone button and ask me anything about your studies!");
  const [textFallback, setTextFallback] = useState("");

  const handleStartListening = () => {
    setVoiceState("listening");
    
    // Web Speech API recognition if supported
    if (typeof window !== "undefined" && ("SpeechRecognition" in window || "webkitSpeechRecognition" in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "en-US";

      recognition.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        setTranscript(text);
        processVoiceQuery(text);
      };

      recognition.onerror = () => {
        setVoiceState("idle");
      };

      recognition.start();
    } else {
      // Simulate listening for dev environment
      setTimeout(() => {
        const sampleQuery = "Explain how reflection works in concave mirrors";
        setTranscript(sampleQuery);
        processVoiceQuery(sampleQuery);
      }, 2500);
    }
  };

  const handleStopListening = () => {
    setVoiceState("idle");
  };

  const processVoiceQuery = async (queryText: string) => {
    if (!queryText.trim()) return;
    setVoiceState("thinking");

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api/v1";
      const res = await fetch(`${baseUrl}/student/voice-tutor`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript: queryText, subject, grade: "Class 10" })
      });
      const data = await res.json();
      setAiResponse(data.response || "Great question! Let's break this down together.");
      setVoiceState("speaking");

      // Browser Speech Synthesis
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(data.response);
        utterance.onend = () => setVoiceState("idle");
        window.speechSynthesis.speak(utterance);
      }
    } catch (err) {
      setAiResponse("I heard your query! Let's discuss this step-by-step.");
      setVoiceState("idle");
    }
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textFallback.trim()) return;
    setTranscript(textFallback);
    processVoiceQuery(textFallback);
    setTextFallback("");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* HEADER */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm text-center space-y-3">
        <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-indigo-200">
          <Mic className="w-7 h-7" />
        </div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Interactive AI Voice Tutor</h1>
        <p className="text-xs text-slate-500 font-semibold max-w-md mx-auto">
          Speak directly with your Groq AI Tutor. Hear spoken explanations and interactive follow-up questions!
        </p>

        {/* SUBJECT SELECTOR */}
        <div className="flex justify-center gap-2 pt-2">
          {["Science", "Mathematics", "English", "Social Science"].map((sub) => (
            <button
              key={sub}
              onClick={() => setSubject(sub)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                subject === sub ? "bg-indigo-600 text-white shadow-sm" : "bg-slate-100 text-slate-600 hover:text-slate-900"
              }`}
            >
              {sub}
            </button>
          ))}
        </div>
      </div>

      {/* VOICE INTERACTIVE ORB & STATES */}
      <div className="bg-slate-900 p-8 sm:p-12 rounded-3xl border border-slate-800 shadow-2xl text-center space-y-8 relative overflow-hidden text-white">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* VOICE STATE INDICATOR */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-indigo-300 text-xs font-bold backdrop-blur-md border border-white/10">
          <span className={`w-2.5 h-2.5 rounded-full ${
            voiceState === "listening" ? "bg-red-500 animate-ping" :
            voiceState === "thinking" ? "bg-amber-400 animate-pulse" :
            voiceState === "speaking" ? "bg-emerald-400 animate-bounce" : "bg-slate-500"
          }`} />
          <span className="uppercase tracking-wider font-extrabold">
            {voiceState === "listening" ? "Listening to your voice..." :
             voiceState === "thinking" ? "Groq AI is thinking..." :
             voiceState === "speaking" ? "AI Tutor Speaking..." : "Ready to speak"}
          </span>
        </div>

        {/* MAIN MICROPHONE ORB */}
        <div className="flex justify-center items-center py-4">
          <button
            onClick={voiceState === "listening" ? handleStopListening : handleStartListening}
            className={`w-28 h-28 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl relative ${
              voiceState === "listening" ? "bg-red-600 scale-110 shadow-red-500/50" :
              voiceState === "thinking" ? "bg-amber-500 animate-pulse" :
              voiceState === "speaking" ? "bg-emerald-600 shadow-emerald-500/50" : "bg-indigo-600 hover:scale-105 shadow-indigo-600/40"
            }`}
          >
            {voiceState === "listening" ? (
              <Square className="w-10 h-10 text-white" />
            ) : (
              <Mic className="w-10 h-10 text-white" />
            )}
          </button>
        </div>

        {/* CONTROL BUTTONS */}
        <div className="flex justify-center items-center gap-4">
          {voiceState !== "idle" && (
            <button
              onClick={() => {
                if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
                setVoiceState("idle");
              }}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold border border-slate-700 flex items-center gap-2"
            >
              <MicOff className="w-4 h-4" />
              Stop Voice
            </button>
          )}

          <button
            onClick={() => handleStartListening()}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold border border-slate-700 flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Restart Voice
          </button>
        </div>

        {/* TRANSCRIPT & AI RESPONSE DISPLAY */}
        <div className="space-y-4 max-w-xl mx-auto text-left pt-4 border-t border-slate-800">
          {transcript && (
            <div className="p-3.5 bg-slate-800/80 rounded-2xl border border-slate-700/80 text-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Your Speech Transcript</span>
              <p className="text-slate-200 font-medium">{transcript}</p>
            </div>
          )}

          <div className="p-4 bg-indigo-950/60 rounded-2xl border border-indigo-500/30 text-xs">
            <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider block mb-1 flex items-center gap-1.5">
              <Volume2 className="w-3.5 h-3.5 text-indigo-400" />
              AI Voice Response
            </span>
            <p className="text-indigo-100 font-semibold leading-relaxed">{aiResponse}</p>
          </div>
        </div>
      </div>

      {/* TEXT FALLBACK INPUT FOR MICROPHONE PRIVACY */}
      <form onSubmit={handleTextSubmit} className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm space-y-3">
        <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
          <MessageSquare className="w-4 h-4 text-indigo-600" />
          Text Fallback (If microphone is disabled)
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={textFallback}
            onChange={(e) => setTextFallback(e.target.value)}
            placeholder="Type your question here instead of speaking..."
            className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs text-slate-900 font-semibold focus:outline-none focus:border-indigo-600"
          />
          <button
            type="submit"
            className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-2xl shadow-md flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            Send
          </button>
        </div>
      </form>

    </div>
  );
}
