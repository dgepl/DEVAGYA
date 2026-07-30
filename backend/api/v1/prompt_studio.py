from fastapi import APIRouter
from schemas.phase4 import PromptTestPayload
from services.prompt_studio_service import prompt_studio_service

router = APIRouter(prefix="/prompt-studio", tags=["Prompt Studio & Templates"])

@router.get("/templates")
async def list_prompt_templates():
    """List prompt studio templates."""
    return prompt_studio_service.get_templates()

@router.post("/test")
async def test_prompt_template(payload: PromptTestPayload):
    """Test prompt template with variable interpolation."""
    return await prompt_studio_service.test_prompt(payload)
