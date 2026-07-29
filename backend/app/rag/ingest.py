import os
import glob
import chromadb
from chromadb.config import Settings as ChromaSettings
from app.config import settings
from app.utils.logger import logger

COLLECTION_NAME = "civic_knowledge"

def get_chroma_client():
    os.makedirs(settings.CHROMA_PERSIST_DIR, exist_ok=True)
    client = chromadb.PersistentClient(path=settings.CHROMA_PERSIST_DIR)
    return client

def chunk_text(text: str, chunk_size: int = 500, overlap: int = 50) -> list[str]:
    paragraphs = text.split("\n\n")
    chunks = []
    current_chunk = ""
    
    for para in paragraphs:
        if len(current_chunk) + len(para) <= chunk_size:
            current_chunk += ("\n\n" + para if current_chunk else para)
        else:
            if current_chunk:
                chunks.append(current_chunk.strip())
            current_chunk = para
            
    if current_chunk:
        chunks.append(current_chunk.strip())
        
    return chunks

def ingest_docs():
    logger.info("Starting ChromaDB Municipal Document Ingestion...")
    client = get_chroma_client()
    
    # Get or create collection
    collection = client.get_or_create_collection(name=COLLECTION_NAME)
    
    docs_dir = os.path.join(os.path.dirname(__file__), "docs")
    doc_files = glob.glob(os.path.join(docs_dir, "*.md")) + glob.glob(os.path.join(docs_dir, "*.txt"))
    
    if not doc_files:
        logger.warning(f"No documents found in {docs_dir}")
        return
        
    documents = []
    metadatas = []
    ids = []
    
    doc_counter = 0
    for file_path in doc_files:
        filename = os.path.basename(file_path)
        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()
            
        chunks = chunk_text(content)
        for idx, chunk in enumerate(chunks):
            doc_counter += 1
            chunk_id = f"{filename}_{idx}"
            documents.append(chunk)
            metadatas.append({"source": filename, "chunk_index": idx})
            ids.append(chunk_id)
            
    if documents:
        # Upsert into ChromaDB
        collection.upsert(
            documents=documents,
            metadatas=metadatas,
            ids=ids
        )
        logger.info(f"Successfully ingested {doc_counter} chunks from {len(doc_files)} files into ChromaDB collection '{COLLECTION_NAME}'.")

if __name__ == "__main__":
    ingest_docs()
