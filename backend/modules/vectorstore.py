from langchain_qdrant import QdrantVectorStore
from qdrant_client import QdrantClient
from modules.config import QDRANT_URL, QDRANT_API_KEY, QDRANT_COLLECTION

def get_vectorstore(embeddings):
    return QdrantVectorStore.from_existing_collection(
        url=QDRANT_URL,
        api_key=QDRANT_API_KEY,
        collection_name=QDRANT_COLLECTION, 
        embedding=embeddings
    )

def insert_documents(vstore, docs):
    try:
        # Process documents in batches of 10
        for i in range(0, len(docs), 10):
            batch = docs[i:i+10]
            vstore.add_documents(batch)
    except Exception as e:
        print(f"Error inserting documents: {e}")
        raise
