from app.agents.base import BaseAgent
from app.rag.retriever import query_knowledge_base
from app.utils.logger import logger

class KnowledgeAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            name="Knowledge Agent",
            role="Municipal Rulebook & RAG Specialist",
            description="Retrieves official municipal bylaws, SLA timelines, emergency contacts, and citizen schemes from ChromaDB."
        )

    def execute(self, inputs: dict) -> dict:
        query = inputs.get("query", "Municipal SLA and complaint guidelines")
        logger.info(f"[{self.name}] Querying municipal knowledge base for: '{query}'")
        
        results = query_knowledge_base(query, n_results=2)
        
        grounded_context = "\n".join([f"- ({r['source']}): {r['content']}" for r in results])
        
        return {
            "agent": self.name,
            "success": True,
            "query": query,
            "retrieved_docs": results,
            "summary": f"Retrieved {len(results)} municipal policy citations:\n{grounded_context}"
        }
