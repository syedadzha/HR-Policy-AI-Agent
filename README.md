# HR Policy AI Agent Project

An intelligent AI-powered system that allows employees to interact with company policy documents through a modern chat interface. The system uses advanced natural language processing to understand policy questions and provide accurate, contextual answers based on uploaded policy documents.

## 🚀 Features

- **Document Upload**: Upload PDF policy documents with categorization
- **AI Chat Interface**: Interactive chat with policy documents using OpenAI GPT-4
- **Vector Search**: Advanced semantic search using Qdrant vector database
- **Session Management**: Maintains conversation context across interactions
- **Modern UI**: Clean, responsive interface built with React and Tailwind CSS
- **Real-time Processing**: Fast document processing and query responses

## 🏗️ Architecture

The project follows a modern full-stack architecture with clear separation of concerns:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   External      │
│   (React)       │◄──►│   (FastAPI)     │◄──►│   Services      │
│                 │    │                 │    │                 │
│ • Chat UI       │    │ • API Endpoints │    │ • OpenAI API    │
│ • Upload UI     │    │ • Document Proc │    │ • Qdrant DB     │
│ • State Mgmt    │    │ • Vector Store  │    │ • Ollama Embed  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Backend Architecture

The backend is built with FastAPI and consists of several modules:

- **`main.py`**: FastAPI application with CORS middleware and API endpoints
- **`chat_agent.py`**: AI chat logic with OpenAI integration and session management
- **`embeddings.py`**: Text embedding generation using Ollama
- **`vectorstore.py`**: Qdrant vector database integration
- **`loader.py`**: PDF document loading and metadata extraction
- **`splitter.py`**: Document chunking for optimal vector search
- **`config.py`**: Configuration management for external services

### Frontend Architecture

The frontend is a React application with TypeScript:

- **`App.tsx`**: Main application component with state management
- **`components/`**: Reusable UI components
  - `Header.tsx`: Application header
  - `UploadTab.tsx`: Document upload interface
  - `ChatTab.tsx`: Chat interface with message history
  - `icons.tsx`: SVG icon components
- **`services/`**: API communication layer
  - `geminiService.ts`: Backend API integration
  - `localModelService.ts`: Local fallback service
- **`types.ts`**: TypeScript type definitions

## 📁 Project Structure

```
HR Policy AI Agent Project/
├── backend/
│   ├── main.py                 # FastAPI application entry point
│   ├── requirements.txt        # Python dependencies
│   └── modules/
│       ├── chat_agent.py       # AI chat logic and OpenAI integration
│       ├── config.py           # Configuration settings
│       ├── embeddings.py       # Text embedding generation
│       ├── loader.py           # PDF document loading
│       ├── splitter.py         # Document chunking
│       └── vectorstore.py      # Qdrant vector database integration
├── frontend/
│   ├── App.tsx                 # Main React application
│   ├── index.tsx               # React DOM entry point
│   ├── index.html              # HTML template
│   ├── package.json            # Node.js dependencies
│   ├── vite.config.ts          # Vite build configuration
│   ├── types.ts                # TypeScript type definitions
│   ├── components/
│   │   ├── Header.tsx          # Application header component
│   │   ├── UploadTab.tsx       # Document upload interface
│   │   ├── ChatTab.tsx         # Chat interface component
│   │   └── icons.tsx           # SVG icon components
│   └── services/
│       ├── geminiService.ts    # Backend API integration
│       └── localModelService.ts # Local fallback service
└── README.md                   # This file
```

## 🛠️ Technology Stack

### Backend
- **FastAPI**: Modern, fast web framework for building APIs
- **LangChain**: Framework for developing applications with LLMs
- **Qdrant**: Vector database for semantic search
- **Ollama**: Local embedding generation
- **OpenAI**: GPT-4 for chat responses
- **PyPDF**: PDF document processing

### Frontend
- **React 19**: Modern React with hooks
- **TypeScript**: Type-safe JavaScript
- **Vite**: Fast build tool and dev server
- **Tailwind CSS**: Utility-first CSS framework

## ⚙️ Setup Instructions

### Prerequisites

- Python 3.8+ 
- Node.js 16+
- Ollama installed and running
- OpenAI API key
- Qdrant cloud account

### Backend Setup

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Create a virtual environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment variables:**
   Copy the example environment file and update with your credentials:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and update the following:
   - `QDRANT_URL`: Your Qdrant cloud instance URL
   - `QDRANT_API_KEY`: Your Qdrant API key
   - `OPENAI_API_KEY`: Your OpenAI API key
   - `OLLAMA_BASE_URL`: Your Ollama server URL (default: http://192.168.100.61:11434)

5. **Start the backend server:**
   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

### Frontend Setup

1. **Navigate to the frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Access the application:**
   Open your browser and navigate to `http://localhost:3000`

## 🚀 How to Run

### Complete Setup

1. **Start Ollama service:**
   ```bash
   ollama serve
   ```

2. **Start the backend:**
   ```bash
   cd backend
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

3. **Start the frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

4. **Access the application:**
   - Frontend: `http://localhost:3000`
   - Backend API: `http://localhost:8000`
   - API Documentation: `http://localhost:8000/docs`

### Usage

1. **Upload Policy Documents:**
   - Click on "Upload Policy" tab
   - Select a PDF file
   - Enter a policy type (e.g., "HR", "IT Security")
   - Click "Upload and Process"

2. **Chat with Policies:**
   - Click on "Chat with Policies" tab
   - Type your question about company policies
   - The AI will search through uploaded documents and provide contextual answers

## 🔧 Configuration

### Backend Configuration

The backend configuration is managed through environment variables in `.env` file:

```bash
# Qdrant Configuration
QDRANT_URL=your_qdrant_url_here
QDRANT_API_KEY=your_qdrant_api_key_here
QDRANT_COLLECTION=company_policy

# Ollama Configuration
OLLAMA_MODEL=nomic-embed-text
OLLAMA_BASE_URL=http://localhost:11434

# OpenAI Configuration
OPENAI_MODEL=gpt-4o-mini
OPENAI_API_KEY=your_openai_api_key_here

# Application Configuration
DEBUG=False
LOG_LEVEL=INFO
```

**Security Note**: Never commit the `.env` file to version control. Use `.env.example` as a template and keep your actual credentials secure.

### Frontend Configuration

The frontend configuration is in `frontend/vite.config.ts`:

```typescript
export default defineConfig({
  server: {
    port: 3000,
    host: '0.0.0.0',
  },
  // ... other config
});
```

## 📡 API Endpoints

### Backend API

- **POST `/upload-policy`**
  - Upload and process a policy document
  - Parameters: `file` (PDF), `policy_type` (string)
  - Returns: Success message

- **POST `/chat`**
  - Send a chat message and get AI response
  - Parameters: `query` (string), `session_id` (string)
  - Returns: AI response and chat history

- **GET `/health`**
  - Health check endpoint
  - Returns: Application status and configuration info

## 🔍 Key Features Explained

### Document Processing Pipeline

1. **Upload**: PDF files are uploaded via the frontend
2. **Loading**: PyPDF extracts text content from PDFs
3. **Chunking**: Documents are split into manageable chunks
4. **Embedding**: Text chunks are converted to vector embeddings
5. **Storage**: Embeddings are stored in Qdrant vector database

### Chat Processing Pipeline

1. **Query Analysis**: User queries are analyzed to determine if policy context is needed
2. **Vector Search**: Relevant document chunks are retrieved from Qdrant
3. **Context Assembly**: Retrieved chunks are combined with conversation history
4. **AI Response**: OpenAI GPT-4 generates contextual responses
5. **Session Management**: Responses are stored in session memory

### Vector Search

The system uses semantic vector search to find relevant policy information:

- **Embeddings**: Text is converted to high-dimensional vectors using Ollama
- **Similarity Search**: Qdrant finds the most similar document chunks
- **Context Retrieval**: Top-k most relevant chunks are retrieved
- **Response Generation**: Retrieved context is used to generate accurate responses

## 🛡️ Security Considerations

- **API Keys**: Store sensitive API keys securely (consider environment variables)
- **CORS**: Configured for localhost development only
- **File Upload**: Only PDF files are accepted
- **Input Validation**: All user inputs are validated

## 🐛 Troubleshooting

### Common Issues

1. **Backend not starting:**
   - Check if all dependencies are installed
   - Verify API keys are correct
   - Ensure Ollama is running

2. **Frontend not connecting to backend:**
   - Verify backend is running on port 8000
   - Check CORS configuration
   - Ensure API_BASE_URL is correct

3. **Document upload failing:**
   - Check file size limits
   - Verify file is a valid PDF
   - Check Qdrant connection

4. **Chat not working:**
   - Verify OpenAI API key
   - Check if documents are properly uploaded
   - Ensure vector database is accessible

### Debug Mode

Enable debug logging by setting environment variables:

```bash
export DEBUG=1
export LOG_LEVEL=debug
```

## 📈 Performance Considerations

- **Chunk Size**: Optimized at 1000 characters with 100 character overlap
- **Batch Processing**: Documents are processed in batches of 10
- **Caching**: Session memory caches recent conversations
- **Vector Search**: Limited to top 3 most relevant chunks

## 🔮 Future Enhancements

- **Multi-language Support**: Support for documents in different languages
- **Advanced Search**: Filters by document type, date, or author
- **User Authentication**: Secure user management system
- **Analytics**: Track usage patterns and popular queries
- **Mobile App**: Native mobile application
- **Integration**: Connect with existing HR systems

## 📄 License

This project is for internal company use. Please ensure compliance with your organization's policies regarding AI and data handling.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For technical support or questions about this project, please contact the development team or create an issue in the project repository.

---

**Note**: This system processes sensitive company policy documents. Ensure all data handling complies with your organization's security and privacy requirements.
