from fastapi import APIRouter, Query, HTTPException
from typing import Dict, Any, List
from schemas.phase4 import AgentExecutePayload, AgentResponse
from services.agent_manager import agent_manager_service

router = APIRouter(prefix="/agents", tags=["AI Agent OS & Agent Marketplace"])

@router.get("/list")
async def list_ai_agents(role_scope: str = Query("all")):
    """List all available specialized AI Agents in Marketplace."""
    agents = agent_manager_service.get_all_agents()
    if role_scope != "all":
        return [a for a in agents if a["role_scope"] == role_scope or a["role_scope"] == "general"]
    return agents

@router.get("/detail/{agent_code}")
async def get_agent_detail(agent_code: str):
    """Fetch details, configuration, and tools for a specific agent."""
    return agent_manager_service.get_agent_by_code(agent_code)

@router.post("/execute", response_model=AgentResponse)
async def execute_agent_query(payload: AgentExecutePayload):
    """Execute a query against a specific specialized AI Agent."""
    return await agent_manager_service.execute_agent(payload)
