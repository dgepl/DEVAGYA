import { Suspense } from "react";
import { AgentMarketplace } from "@/components/agent_os/AgentMarketplace";

export default function AgentsMarketplacePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <AgentMarketplace />
    </Suspense>
  );
}
