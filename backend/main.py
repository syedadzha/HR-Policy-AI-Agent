from fastapi import FastAPI, UploadFile, Form, HTTPException
from modules.loader import load_policy
from modules.splitter import split_documents
from modules.embeddings import get_embeddings
from modules.vectorstore import get_vectorstore, insert_documents
from modules.chat_agent import generate_chat_response
from modules.config import DEBUG, LOG_LEVEL, N8N_WEBHOOK_URL
import tempfile
import logging
import os
import httpx
from fastapi.middleware.cors import CORSMiddleware

# Configure logging
logging.basicConfig(
    level=getattr(logging, LOG_LEVEL.upper()),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Company Policy API",
    debug=DEBUG,
    description="AI-powered company policy assistant with document upload and chat capabilities"
)

origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Allows specific origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods (GET, POST, etc.)
    allow_headers=["*"],  # Allows all headers
)

# Initialize embeddings and vectorstore
try:
    logger.info("Initializing embeddings and vectorstore...")
    embeddings = get_embeddings()
    vectorstore = get_vectorstore(embeddings)
    logger.info("Successfully initialized embeddings and vectorstore")
except Exception as e:
    logger.error(f"Failed to initialize embeddings or vectorstore: {e}")
    raise

@app.post("/upload-policy")
async def upload_policy(file: UploadFile, policy_type: str = Form(...)):
    try:
        logger.info(f"Uploading policy document: {file.filename}, type: {policy_type}")
        
        # Validate file type
        if not file.filename.lower().endswith('.pdf'):
            raise HTTPException(status_code=400, detail="Only PDF files are allowed")
        
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
            tmp.write(await file.read())
            file_path = tmp.name

        docs = load_policy(file_path, policy_type)
        
        # Update metadata with original filename
        for doc in docs:
            doc.metadata["filename"] = file.filename
        
        chunks = split_documents(docs)
        insert_documents(vectorstore, chunks)
        
        # Clean up temporary file
        os.unlink(file_path)
        
        logger.info(f"Successfully uploaded and indexed {policy_type} policy")
        return {"message": f"{policy_type} uploaded and indexed successfully."}
        
    except Exception as e:
        logger.error(f"Error uploading policy: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to upload policy: {str(e)}")

@app.post("/chat")
async def chat(query: str = Form(...), session_id: str = Form(...)):
    try:
        logger.info(f"Processing chat query for session {session_id}: {query[:100]}...")
        answer, chat_history = generate_chat_response(session_id, vectorstore, query)
        logger.info(f"Successfully generated response for session {session_id}")
        return {"response": answer, "history": chat_history}
    except Exception as e:
        logger.error(f"Error processing chat query: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to process chat query: {str(e)}")

@app.get("/policies")
async def get_policies():
    """Get list of uploaded policies from vector store"""
    try:
        logger.info("Fetching policies from vector store")
        
        # Get all documents from the vector store
        # Note: This is a simplified approach - in production you might want to store metadata separately
        all_docs = vectorstore.similarity_search("", k=1000)  # Get all documents
        
        # Extract unique policies based on metadata
        policies = []
        seen_policies = set()
        
        for doc in all_docs:
            metadata = doc.metadata
            policy_key = f"{metadata.get('filename', 'unknown')}_{metadata.get('policy_type', 'unknown')}"
            
            if policy_key not in seen_policies:
                seen_policies.add(policy_key)
                policies.append({
                    "name": metadata.get('filename', 'Unknown Document'),
                    "type": metadata.get('policy_type', 'Unknown'),
                    "uploaded_at": metadata.get('uploaded_at', ''),
                    "pages": len(doc.page_content.split('\n')),  # Rough page estimate
                    "size": len(doc.page_content) / 1024  # Rough size in KB
                })
        
        logger.info(f"Found {len(policies)} unique policies")
        return {"policies": policies}
        
    except Exception as e:
        logger.error(f"Error fetching policies: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch policies: {str(e)}")

@app.delete("/policies/clear-all")
async def clear_all_policies():
    """Clear all policies from the vector store"""
    try:
        logger.info("Clearing all policies from vector store")
        
        # Get the Qdrant client from the vectorstore
        client = vectorstore.client
        
        # Get all points in the collection
        search_result = client.scroll(
            collection_name=vectorstore.collection_name,
            limit=10000  # Large limit to get all points
        )
        
        points_to_delete = []
        for point in search_result[0]:  # search_result is (points, next_page_offset)
            points_to_delete.append(point.id)
        
        if not points_to_delete:
            logger.info("No documents found in vector store")
            return {"message": "No documents found in vector store"}
        
        # Delete all points from Qdrant
        client.delete(
            collection_name=vectorstore.collection_name,
            points_selector=points_to_delete
        )
        
        logger.info(f"Successfully deleted {len(points_to_delete)} documents from vector store")
        return {
            "message": f"Successfully deleted {len(points_to_delete)} documents from vector store"
        }
        
    except Exception as e:
        logger.error(f"Error clearing all policies: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to clear all policies: {str(e)}")

@app.delete("/policies/{policy_name}")
async def delete_policy(policy_name: str):
    """Delete a policy from the vector store"""
    try:
        logger.info(f"Deleting policy: {policy_name}")
        
        # Get the Qdrant client from the vectorstore
        client = vectorstore.client
        
        # Search for documents with the specific filename
        search_result = client.scroll(
            collection_name=vectorstore.collection_name,
            scroll_filter={
                "must": [
                    {
                        "key": "filename",
                        "match": {"value": policy_name}
                    }
                ]
            },
            limit=1000
        )
        
        points_to_delete = []
        for point in search_result[0]:  # search_result is (points, next_page_offset)
            points_to_delete.append(point.id)
        
        if not points_to_delete:
            logger.warning(f"No documents found with filename: {policy_name}")
            return {"message": f"No documents found with filename: {policy_name}"}
        
        # Delete the points from Qdrant
        client.delete(
            collection_name=vectorstore.collection_name,
            points_selector=points_to_delete
        )
        
        logger.info(f"Successfully deleted {len(points_to_delete)} documents for policy: {policy_name}")
        return {
            "message": f"Successfully deleted {len(points_to_delete)} documents for policy '{policy_name}'"
        }
        
    except Exception as e:
        logger.error(f"Error deleting policy: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to delete policy: {str(e)}")

@app.post("/webhook/chat")
async def webhook_chat(query: str = Form(...), sessionId: str = Form(...)):
    """
    Chat endpoint that sends user query to n8n webhook using POST (JSON payload)
    matching AI Agent node's expected format:
        {
          "sessionId": "...",
          "chatInput": "..."
        }
    """
    try:
        logger.info(f"🔵 WEBHOOK CHAT ENDPOINT CALLED")
        logger.info(f"📝 Processing chat for sessionId={sessionId}: {query[:100]}...")

        if not N8N_WEBHOOK_URL:
            logger.error("❌ n8n webhook URL not configured")
            raise HTTPException(status_code=500, detail="n8n webhook URL not configured")
        
        logger.info(f"✅ Webhook URL: {N8N_WEBHOOK_URL}")

        # ✅ Match n8n's expected JSON keys
        payload = {
            "sessionId": sessionId,
            "chatInput": query
        }

        logger.info(f"📤 POST payload to n8n: {payload}")

        logger.info(f"🚀 Sending request to n8n webhook: {N8N_WEBHOOK_URL}")
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(N8N_WEBHOOK_URL, json=payload)
            logger.info(f"📥 Received response from n8n: status={response.status_code}")
            response.raise_for_status()

        # Attempt to parse n8n JSON response
        try:
            n8n_data = response.json()
            logger.info(f"📄 Parsed n8n response: {n8n_data}")
            
            # Extract text from common n8n response formats
            response_text = ""
            if isinstance(n8n_data, dict):
                # Try common keys for AI response
                response_text = n8n_data.get("text", 
                    n8n_data.get("output", 
                    n8n_data.get("response", 
                    n8n_data.get("answer", 
                    str(n8n_data.get("raw_response", ""))))
                ))
            else:
                response_text = str(n8n_data)
            
            logger.info(f"✅ Extracted response text: {response_text[:100]}...")
        except Exception as e:
            logger.error(f"❌ Error parsing n8n response: {e}")
            response_text = response.text

        logger.info(f"✅ n8n responded with status {response.status_code}")
        final_response = {
            "status": "success",
            "sessionId": sessionId,
            "response": response_text
        }
        logger.info(f"📤 Returning response to frontend: {final_response}")
        return final_response

    except httpx.HTTPStatusError as e:
        logger.error(f"HTTP error from n8n: {e}")
        raise HTTPException(
            status_code=e.response.status_code,
            detail=f"n8n returned error: {e.response.text}"
        )

    except Exception as e:
        logger.error(f"Error processing webhook chat: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to process webhook chat: {str(e)}"
        )


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "debug": DEBUG, "log_level": LOG_LEVEL}
