import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config import settings

# Phase 1 Routers
from api.v1.generator import router as generator_router
from api.v1.ocr import router as ocr_router
from api.v1.pdf import router as pdf_router
from api.v1.admin import router as admin_router
from api.v1.auth import router as auth_router

# Phase 2 Routers
from api.v1.chat import router as chat_router
from api.v1.mentor import router as mentor_router
from api.v1.lesson_planner import router as lesson_router
from api.v1.content_generator import router as content_router
from api.v1.prompts import router as prompt_router
from api.v1.voice import router as voice_router
from api.v1.search import router as search_router
from api.v1.analytics import router as analytics_router

# Phase 3 Routers
from api.v1.student import router as student_router
from api.v1.parent import router as parent_router
from api.v1.quizzes import router as quizzes_router
from api.v1.revision import router as revision_router

# Phase 4 Routers
from api.v1.agents import router as agents_router
from api.v1.knowledge import router as knowledge_router
from api.v1.workflows import router as workflows_router
from api.v1.prompt_studio import router as prompt_studio_router
from api.v1.memory_v2 import router as memory_v2_router
from api.v1.ai_models import router as ai_models_router

# Phase 5 Routers
from api.v1.xp import router as xp_router
from api.v1.olympiad import router as olympiad_router
from api.v1.assignment import router as assignment_router

logging.basicConfig(level=logging.INFO)

app = FastAPI(
    title=settings.APP_NAME,
    description="World-Class AI-Powered Education SaaS Platform Engine - AI Operating System Active.",
    version="4.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-Conversation-Id", "X-XP-Earned"],
)

# Mount Phase 1 Routers
app.include_router(generator_router, prefix=settings.API_V1_STR)
app.include_router(ocr_router, prefix=settings.API_V1_STR)
app.include_router(pdf_router, prefix=settings.API_V1_STR)
app.include_router(admin_router, prefix=settings.API_V1_STR)
app.include_router(auth_router, prefix=settings.API_V1_STR)

# Mount Phase 2 Routers
app.include_router(chat_router, prefix=settings.API_V1_STR)
app.include_router(mentor_router, prefix=settings.API_V1_STR)
app.include_router(lesson_router, prefix=settings.API_V1_STR)
app.include_router(content_router, prefix=settings.API_V1_STR)
app.include_router(prompt_router, prefix=settings.API_V1_STR)
app.include_router(voice_router, prefix=settings.API_V1_STR)
app.include_router(search_router, prefix=settings.API_V1_STR)
app.include_router(analytics_router, prefix=settings.API_V1_STR)

# Mount Phase 3 Routers
app.include_router(student_router, prefix=settings.API_V1_STR)
app.include_router(parent_router, prefix=settings.API_V1_STR)
app.include_router(quizzes_router, prefix=settings.API_V1_STR)
app.include_router(revision_router, prefix=settings.API_V1_STR)

# Mount Phase 4 Routers
app.include_router(agents_router, prefix=settings.API_V1_STR)
app.include_router(knowledge_router, prefix=settings.API_V1_STR)
app.include_router(workflows_router, prefix=settings.API_V1_STR)
app.include_router(prompt_studio_router, prefix=settings.API_V1_STR)
app.include_router(memory_v2_router, prefix=settings.API_V1_STR)
app.include_router(ai_models_router, prefix=settings.API_V1_STR)

# Mount Phase 5 Routers
app.include_router(xp_router, prefix=settings.API_V1_STR)
app.include_router(olympiad_router, prefix=settings.API_V1_STR)
app.include_router(assignment_router, prefix=settings.API_V1_STR)

@app.get("/")
async def root():
    return {
        "status": "online",
        "service": settings.APP_NAME,
        "phase": "Phase 4 AI Operating System Engine Active",
        "docs": "/docs",
        "version": "4.0.0"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy", "provider_url": settings.API_V1_STR}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
