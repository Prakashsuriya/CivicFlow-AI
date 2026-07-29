from fastapi import APIRouter
from pydantic import BaseModel
from app.rag.retriever import query_knowledge_base

router = APIRouter(prefix="/rag", tags=["Knowledge RAG"])

class RAGQueryRequest(BaseModel):
    query: str

@router.post("/query")
def query_rag_knowledge(req: RAGQueryRequest):
    """
    Queries ChromaDB vector database directly for municipal rules, scheme info, and SLAs.
    """
    results = query_knowledge_base(req.query, n_results=4)
    return {"query": req.query, "results": results}
