"use client";

import { useState } from "react";
import { Settings, Cpu, ShieldCheck, CheckCircle2, Zap } from "lucide-react";

export function AIModelSettings() {
  const [provider, setProvider] = useState("groq");
  const [model, setModel] = useState("llama-3.3-70b-versatile");
  const [temperature, setTemperature] = useState(0.5);
  const [maxTokens, setMaxTokens] = useState(2500);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* HEADER BAR */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-200">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900">AI Model & Provider Manager</h1>
            <p className="text-xs text-slate-500">Configure LLM providers, active models, temperature, max tokens & fallback retry policies</p>
          </div>
        </div>
      </div>

      {/* MODEL SETTINGS FORM CARD */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Active AI Provider</label>
            <select
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
            >
              <option value="groq">Groq LPU Acceleration (Default)</option>
              <option value="openai">OpenAI Official API</option>
              <option value="openrouter">OpenRouter Multi-Model</option>
              <option value="deepseek">DeepSeek AI</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Target Model Name</label>
            <input 
              type="text"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
            />
          </div>
        </div>

        <div className="space-y-4 pt-2 border-t border-slate-100">
          <div>
            <div className="flex items-center justify-between text-xs font-bold mb-1">
              <span className="text-slate-700">Temperature: {temperature}</span>
              <span className="text-slate-400">0.0 (Strict) to 1.0 (Creative)</span>
            </div>
            <input 
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
              className="w-full text-indigo-600"
            />
          </div>

          <div>
            <div className="flex items-center justify-between text-xs font-bold mb-1">
              <span className="text-slate-700">Max Output Tokens: {maxTokens}</span>
              <span className="text-slate-400">Tokens limit per completion</span>
            </div>
            <input 
              type="number"
              value={maxTokens}
              onChange={(e) => setMaxTokens(parseInt(e.target.value) || 2500)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
            />
          </div>
        </div>

        <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-2xl text-xs text-indigo-900 font-medium">
          🔒 <span className="font-extrabold">Zero Code Change Architecture:</span> All agents, RAG, and workflow engines instantly adopt updated model settings.
        </div>
      </div>

    </div>
  );
}
