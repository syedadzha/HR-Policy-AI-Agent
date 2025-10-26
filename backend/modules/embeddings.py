from langchain_ollama import OllamaEmbeddings
from modules.config import OLLAMA_MODEL, OLLAMA_BASE_URL

def get_embeddings():
    return OllamaEmbeddings(model=OLLAMA_MODEL, base_url=OLLAMA_BASE_URL)
