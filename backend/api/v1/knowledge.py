from fastapi import APIRouter
from schemas.phase4 import KnowledgeQueryPayload, DocumentAIActionPayload
from services.knowledge_service import knowledge_service

router = APIRouter(prefix="/knowledge", tags=["RAG Knowledge Base & Document AI"])

@router.get("/documents")
async def list_knowledge_documents():
    """List indexed RAG knowledge documents."""
    return await knowledge_service.get_indexed_documents()

@router.post("/rag-search")
async def query_knowledge_rag(payload: KnowledgeQueryPayload):
    """Execute hybrid RAG vector search with source citations."""
    return await knowledge_service.search_knowledge_rag(payload)

@router.post("/document-ai")
async def process_document_ai(payload: DocumentAIActionPayload):
    """Process uploaded text into summaries, quizzes, flashcards, mindmaps, or formula sheets."""
    return await knowledge_service.execute_document_ai(payload)
