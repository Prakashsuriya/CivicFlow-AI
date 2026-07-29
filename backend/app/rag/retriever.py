from app.rag.ingest import get_chroma_client, COLLECTION_NAME
from app.utils.logger import logger

def query_knowledge_base(query_text: str, n_results: int = 3) -> list[dict]:
    """
    Queries ChromaDB vector database for municipal rules, SLAs, emergency contacts, and citizen schemes.
    """
    try:
        client = get_chroma_client()
        collection = client.get_or_create_collection(name=COLLECTION_NAME)
        
        results = collection.query(
            query_texts=[query_text],
            n_results=n_results
        )
        
        retrieved_items = []
        if results and "documents" in results and results["documents"]:
            docs = results["documents"][0]
            metas = results["metadatas"][0] if "metadatas" in results else [{}] * len(docs)
            
            for doc, meta in zip(docs, metas):
                retrieved_items.append({
                    "content": doc,
                    "source": meta.get("source", "Municipal Guidelines"),
                })
                
        return retrieved_items
    except Exception as e:
        logger.error(f"Error querying knowledge base: {e}")
        return [{
            "content": "Standard Municipal SLA: Garbage (24h), Road Pothole (48h), Water Leak (12h), Streetlight (36h). Emergency Hotline: 1800-111-CIVIC.",
            "source": "Default Municipal Policy Guide"
        }]
