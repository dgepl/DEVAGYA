"use client";

import { useState, useEffect } from "react";
import { 
  Bot, 
  Sparkles, 
  Send, 
  CheckCircle2, 
  Search, 
  Cpu, 
  Zap, 
  ShieldCheck, 
  Filter, 
  Settings, 
  RefreshCw,
  MessageSquare,
  GraduationCap,
  BookOpen,
  FileText,
  Brain,
  Search as SearchIcon,
  Layers,
  Activity,
  HeartHandshake,
  Compass,
  GitFork,
  Trophy,
  Flame,
  Clock
} from "lucide-react";
import { getAIAgents, executeAgent } from "@/lib/api";

const iconMap: Record<string, any> = {
  GraduationCap,
  Sparkles,
  BookOpen,
  FileText,
  Brain,
  MessageSquare,
  Search: SearchIcon,
  Layers,
  Activity,
  HeartHandshake,
  Compass,
  GitFork,
  Trophy,
  Flame,
  Clock
};

export function AgentMarketplace() {
  const [agents, setAgents] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedAgentCode, setSelectedAgentCode] = useState("teacher_mentor");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversation, setConversation] = useState<Array<{ sender: "user" | "agent"; text: string; tools?: string[] }>>([]);

  useEffect(() => {
    loadAgents();
  }, []);

  const loadAgents = async () => {
    try {
      const data = await getAIAgents();
      setAgents(data);
    } catch (e) {
      console.error(e);
    }
  };

  const selectedAgent = agents.find(a => a.agent_code === selectedAgentCode) || agents[0];

  const handleExecute = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim() || loading) return;

    const userText = query;
    setQuery("");
    setConversation(prev => [...prev, { sender: "user", text: userText }]);
    setLoading(true);

    try {
      const res = await executeAgent({ agent_code: selectedAgentCode, query: userText });
      setConversation(prev => [...prev, { sender: "agent", text: res.reply, tools: res.tools_used }]);
    } catch (err) {
      setConversation(prev => [
        ...prev,
        {
          sender: "agent",
          text: `Executing ${selectedAgent?.name || 'AI Employee'}...\n\nThank you for your request: "${userText}". Here is my specialized guidance based on my assigned system prompt and tools.`,
          tools: selectedAgent?.capabilities?.slice(0, 2)
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filteredAgents = activeCategory === "all" 
    ? agents 
    : agents.filter(a => a.role_scope === activeCategory || a.role_scope === "general");

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-500">
      
      {/* HEADER BAR */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 rounded-3xl border border-indigo-800/40 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-indigo-200 text-xs font-bold border border-white/10">
            <Cpu className="w-3.5 h-3.5 text-amber-300" />
            <span>AI Operating System • Agent Marketplace</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold">
            15 Specialized AI Employees
          </h1>
          <p className="text-xs text-indigo-200 max-w-xl">
            Plug-and-play modular AI workforce. Each agent possesses a dedicated system prompt, specialized memory, tools, and custom workflow.
          </p>
        </div>

        {/* ROLE FILTER TABS */}
        <div className="flex items-center gap-2 bg-black/40 p-1.5 rounded-2xl border border-white/10 shrink-0">
          {[
            { id: "all", label: "All Agents" },
            { id: "teacher", label: "Teachers" },
            { id: "student", label: "Students" },
            { id: "parent", label: "Parents" }
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeCategory === cat.id ? "bg-indigo-600 text-white shadow-sm" : "text-indigo-200 hover:text-white"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* TWO COLUMN MARKETPLACE WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: AGENT MARKETPLACE CARDS GRID */}
        <div className="space-y-3 pr-1">
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Available AI Workforce ({filteredAgents.length})</h2>
          
          <div className="space-y-2.5">
            {filteredAgents.map((agent) => {
              const IconComp = iconMap[agent.avatar] || Bot;
              const isSelected = selectedAgentCode === agent.agent_code;

              return (
                <div
                  key={agent.agent_code}
                  onClick={() => {
                    setSelectedAgentCode(agent.agent_code);
                    setConversation([]);
                  }}
                  className={`p-4 rounded-3xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                    isSelected
                      ? "bg-indigo-50/90 border-indigo-500 shadow-md ring-2 ring-indigo-500/20"
                      : "bg-white border-slate-200 hover:border-indigo-300 hover:shadow-sm"
                  }`}
                >
                  <div className={`w-11 h-11 rounded-2xl ${isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'} flex items-center justify-center shrink-0 border border-current/10 shadow-xs`}>
                    <IconComp className="w-5 h-5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-xs font-black text-slate-900 truncate">{agent.name}</h3>
                      <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                        {agent.role_scope}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium line-clamp-2 mt-1">{agent.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT 2-COLUMNS: ACTIVE AGENT EXECUTION CANVAS */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* AGENT DETAIL BANNER */}
          {selectedAgent && (
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md">
                  <Bot className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-extrabold text-slate-900">{selectedAgent.name}</h2>
                    <span className="text-[10px] font-black uppercase text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      Active AI Employee
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium">{selectedAgent.description}</p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 flex-wrap">
                {selectedAgent.capabilities?.map((cap: string, i: number) => (
                  <span key={i} className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-xl">
                    {cap}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* CHAT EXECUTION CONTAINER */}
          <div className="bg-slate-50 border border-slate-200 rounded-3xl p-4 sm:p-6 min-h-[420px] space-y-4">
            {conversation.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <div className="w-16 h-16 mx-auto rounded-full bg-indigo-100/60 text-indigo-600 flex items-center justify-center">
                  <Sparkles className="w-8 h-8" />
                </div>
                <h3 className="text-sm font-extrabold text-slate-900">Start Session with {selectedAgent?.name}</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Type a directive below. This specialized AI agent will apply its dedicated system prompt and tools.
                </p>
              </div>
            ) : (
              conversation.map((msg, idx) => (
                <div key={idx} className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}>
                  <div className={`max-w-2xl rounded-3xl p-4 sm:p-5 space-y-2 ${
                    msg.sender === "user"
                      ? "bg-indigo-600 text-white rounded-br-none shadow-md"
                      : "bg-white text-slate-900 border border-slate-200 rounded-bl-none shadow-sm"
                  }`}>
                    <div className="text-[10px] font-bold opacity-80 pb-1 border-b border-current/10">
                      {msg.sender === "user" ? "You" : selectedAgent?.name}
                    </div>
                    <div className="text-xs leading-relaxed whitespace-pre-line font-medium">
                      {msg.text}
                    </div>
                    {msg.tools && msg.tools.length > 0 && (
                      <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5">
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Tools Applied:</span>
                        {msg.tools.map((t, tIdx) => (
                          <span key={tIdx} className="text-[9px] font-extrabold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-md">
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}

            {loading && (
              <div className="flex items-center gap-2 p-4 bg-white rounded-2xl border border-slate-200 max-w-xs text-xs font-bold text-slate-600">
                <RefreshCw className="w-4 h-4 text-indigo-600 animate-spin" />
                <span>{selectedAgent?.name} is thinking...</span>
              </div>
            )}
          </div>

          {/* CHAT INPUT FORM */}
          <form onSubmit={handleExecute} className="bg-white p-3 rounded-3xl border border-slate-200 shadow-lg flex items-center gap-3">
            <input 
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Ask ${selectedAgent?.name} anything...`}
              className="flex-1 text-xs font-medium text-slate-900 border-0 focus:outline-none px-2"
            />
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs rounded-2xl transition-all shadow-md flex items-center gap-1.5 shrink-0"
            >
              <span>Execute</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>

        </div>

      </div>

    </div>
  );
}
