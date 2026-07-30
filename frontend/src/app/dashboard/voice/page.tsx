"use client";

import { useState } from "react";
import { Mic, MicOff, Award, CheckCircle2, RefreshCw, Sparkles } from "lucide-react";
import { WaveformVisualizer } from "@/components/voice/WaveformVisualizer";
import { analyzeVoiceSpeech } from "@/lib/api_phase2";

export default function VoicePage() {
  const [isRecording, setIsRecording] = useState(false);
  const [mode, setMode] = useState("teaching");
  const [transcript, setTranscript] = useState("Good morning students! Today we shall discuss Ohm's Law and how potential difference drives current flow.");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<any | null>(null);

  const handleToggleRecord = () => {
    if (!isRecording) {
      setIsRecording(true);
    } else {
      setIsRecording(false);
      handleAnalyzeSpeech();
    }
  };

  const handleAnalyzeSpeech = async () => {
    setLoading(true);
    try {
      const res = await analyzeVoiceSpeech(transcript, mode);
      setFeedback(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
          <Mic className="w-6 h-6 text-indigo-600" />
          Voice AI Assistant & English Fluency Coach
        </h1>
        <p className="text-xs text-slate-500 font-semibold">Speech-to-text recording, real-time waveform visualization, and fluency scoring</p>
      </div>

      {/* Practice Mode Selector */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { key: "teaching", label: "Classroom Teaching" },
          { key: "interview", label: "Job Interview" },
          { key: "presentation", label: "Presentation" },
          { key: "parent_meeting", label: "Parent Meeting" },
          { key: "daily_english", label: "Daily English" }
        ].map((m) => (
          <button
            key={m.key}
            onClick={() => setMode(m.key)}
            className={`py-3 px-3 rounded-2xl text-xs font-bold border transition-all ${
              mode === m.key
                ? "bg-indigo-600 border-indigo-600 text-white shadow-glow"
                : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        
        {/* Voice Controls */}
        <div className="md:col-span-5 glass-panel p-6 rounded-3xl border border-slate-200 space-y-6 flex flex-col items-center text-center shadow-sm">
          
          <WaveformVisualizer isRecording={isRecording} />

          <button
            onClick={handleToggleRecord}
            className={`w-20 h-20 rounded-full flex items-center justify-center text-white transition-all transform active:scale-95 shadow-glow ${
              isRecording ? "bg-red-600 animate-pulse" : "bg-gradient-to-tr from-indigo-600 to-cyan-600"
            }`}
          >
            {isRecording ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
          </button>

          <div>
            <p className="text-xs font-bold text-slate-900 mb-1">
              {isRecording ? "Recording Live Speech..." : "Click Mic to Start Voice Session"}
            </p>
            <p className="text-[10px] text-slate-500 font-semibold">Mode: <strong className="text-indigo-600 capitalize">{mode.replace('_', ' ')}</strong></p>
          </div>

          <div className="w-full text-left space-y-2 pt-2 border-t border-slate-200">
            <label className="block text-xs font-bold text-slate-700">Transcript Preview / Manual Edit</label>
            <textarea
              rows={4}
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 font-semibold focus:outline-none"
            />
          </div>

          <button
            onClick={handleAnalyzeSpeech}
            disabled={loading}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-glow transition-all flex items-center justify-center gap-2"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin text-cyan-200" /> : <Sparkles className="w-4 h-4 text-cyan-200" />}
            Analyze Speech & Get Feedback
          </button>

        </div>

        {/* Feedback Scorecard */}
        <div className="md:col-span-7 glass-panel p-6 rounded-3xl border border-slate-200 space-y-6 shadow-sm">
          {feedback ? (
            <div className="space-y-6">
              
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">Speech Analysis Results</span>
                  <h3 className="text-lg font-bold text-slate-900">Fluency & Vocabulary Scorecard</h3>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <span className="text-2xl font-extrabold text-emerald-700">{feedback.fluency_score}%</span>
                    <span className="text-[10px] text-slate-500 block font-bold">Fluency</span>
                  </div>
                  <div className="text-center">
                    <span className="text-2xl font-extrabold text-indigo-700">{feedback.confidence_score}%</span>
                    <span className="text-[10px] text-slate-500 block font-bold">Confidence</span>
                  </div>
                </div>
              </div>

              {/* Grammar Feedback */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-indigo-700 uppercase tracking-wide">Grammar & Syntax Analysis</h4>
                <div className="space-y-2">
                  {feedback.grammar_corrections.map((g: any, i: number) => (
                    <div key={i} className="p-3 bg-white rounded-xl border border-slate-200 text-xs space-y-1 shadow-sm">
                      <p className="text-slate-600 font-semibold"><strong>Original:</strong> &quot;{g.original}&quot;</p>
                      <p className="text-emerald-700 font-bold"><strong>Correction:</strong> &quot;{g.correction}&quot;</p>
                      <p className="text-[10px] text-slate-500">{g.reason}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Vocabulary Enhancement */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-indigo-700 uppercase tracking-wide">Vocabulary Enhancements</h4>
                <ul className="space-y-1">
                  {feedback.vocabulary_enhancements.map((v: string, i: number) => (
                    <li key={i} className="text-xs text-slate-800 flex items-center gap-2 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                      <span>{v}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Teaching Tips */}
              <div className="space-y-2 pt-2 border-t border-slate-200">
                <h4 className="text-xs font-bold text-indigo-700 uppercase tracking-wide">Pedagogical Delivery Tips</h4>
                <ul className="space-y-1">
                  {feedback.teaching_tips.map((t: string, i: number) => (
                    <li key={i} className="text-xs text-slate-800 font-medium">• {t}</li>
                  ))}
                </ul>
              </div>

            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-3">
              <Award className="w-12 h-12 text-slate-400 animate-pulse" />
              <h3 className="text-base font-bold text-slate-900">Voice Speech Coach Ready</h3>
              <p className="text-xs text-slate-500 font-medium max-w-sm">
                Click the microphone on the left to record your teaching session or type a transcript to receive fluency scoring.
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
