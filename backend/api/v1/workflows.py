from fastapi import APIRouter
from schemas.phase4 import WorkflowRunPayload
from services.workflow_engine import workflow_engine_service

router = APIRouter(prefix="/workflows", tags=["AI Workflow Engine"])

@router.get("/templates")
async def list_workflow_templates():
    """List pre-built visual AI workflows."""
    return workflow_engine_service.get_workflows()

@router.post("/run")
async def run_workflow(payload: WorkflowRunPayload):
    """Execute a multi-step visual AI workflow."""
    return await workflow_engine_service.execute_workflow(payload)
