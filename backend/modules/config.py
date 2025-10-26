import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Qdrant Configuration
QDRANT_URL = os.getenv("QDRANT_URL")
QDRANT_API_KEY = os.getenv("QDRANT_API_KEY")
QDRANT_COLLECTION = os.getenv("QDRANT_COLLECTION")

# Ollama Configuration
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "nomic-embed-text")
OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://127.0.0.1:11434")

# OpenAI Configuration
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# Application Configuration
DEBUG = os.getenv("DEBUG", "False").lower() == "true"
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")

# n8n Webhook Configuration  
N8N_WEBHOOK_URL = os.getenv("N8N_WEBHOOK_URL") or os.getenv("N8N_WEBHOOK_API")