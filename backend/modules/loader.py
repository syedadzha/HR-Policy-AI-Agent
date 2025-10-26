from langchain_community.document_loaders import PyPDFLoader
from datetime import datetime
import os

def load_policy(file_path, policy_type):
    loader = PyPDFLoader(file_path)
    docs = loader.load()
    for doc in docs:
        doc.metadata = {
            "filename": os.path.basename(file_path),  # Cross-platform filename extraction
            "policy_type": policy_type,
            "uploaded_at": datetime.utcnow().isoformat()
        }
    return docs
