
# QuantumPDF - AI-Powered Document Analysis & Chat

A sophisticated AI-powered PDF document analysis application that enables users to upload PDF documents, extract and process their content, and engage in intelligent conversations about the document contents using advanced RAG (Retrieval-Augmented Generation) technology.

## 🚀 Features

### Core Functionality
- **Multi-Format PDF Processing**: Advanced PDF text extraction with fallback methods
- **AI-Powered Chat**: Intelligent conversation interface for document Q&A
- **Vector Search**: Semantic search using document embeddings
- **Document Management**: Comprehensive library with metadata tracking
- **Multi-Provider AI Support**: OpenAI, Anthropic, Groq, Hugging Face, and more

### Advanced Capabilities
- **Enhanced PDF Processing**: Browser-based and server-side extraction methods
- **Vector Database Integration**: Support for Pinecone, Weaviate, Chroma, and local storage
- **Smart Chunking**: Advanced text chunking with semantic preservation
- **Real-time Search**: Enhanced document search with filtering options
- **System Monitoring**: Comprehensive status tracking and health monitoring
- **Error Handling**: Robust error management with user-friendly notifications

### User Experience
- **Modern UI**: Clean, responsive design with dark mode support
- **Real-time Chat**: Interactive chat interface with typing indicators
- **Document Preview**: In-line document viewing and content exploration
- **Progress Tracking**: Real-time processing progress indicators
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices

## 🏗️ Architecture

### Frontend Stack
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Shadcn/UI** for component library
- **Zustand** for state management
- **Vite** for build tooling

### AI & ML Integration
- **Multiple AI Providers**: OpenAI, Anthropic, Groq, Hugging Face, etc.
- **Vector Databases**: Pinecone, Weaviate, Chroma, local storage
- **PDF Processing**: PDF.js, server-side extraction, OCR fallbacks
- **Embeddings**: Configurable embedding models and dimensions

### Key Components
- **RAG Engine**: Core retrieval-augmented generation system
- **PDF Processors**: Multi-method PDF text extraction
- **Vector Database**: Semantic search and storage
- **AI Client**: Unified interface for multiple AI providers
- **Chat Interface**: Real-time conversation management

## 🛠️ Setup & Installation

### Prerequisites
- Node.js 18+ and npm/yarn
- Modern web browser with PDF.js support

### Quick Start

1. **Clone and Install**
   ```bash
   git clone <repository-url>
   cd quantumpdf
   npm install
   ```

2. **Add Required Build Script**
   Add this to your `package.json` scripts section:
   ```json
   {
     "scripts": {
       "build:dev": "vite build --mode development"
     }
   }
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

4. **Configure AI Provider**
   - Open the application
   - Navigate to Settings tab
   - Configure your preferred AI provider (OpenAI, Anthropic, etc.)
   - Add your API key and select model

5. **Upload Documents**
   - Go to Documents tab
   - Upload PDF files using the unified processor
   - Wait for processing to complete

6. **Start Chatting**
   - Switch to Chat tab
   - Ask questions about your uploaded documents
   - Receive AI-powered answers with source citations

## 🔧 Configuration

### AI Providers
The application supports multiple AI providers:

- **OpenAI**: GPT-3.5, GPT-4, GPT-4 Turbo
- **Anthropic**: Claude 3 Haiku, Sonnet, Opus
- **Groq**: Fast inference with Llama models
- **Hugging Face**: Open-source models
- **And many more**: AIML, OpenRouter, DeepInfra, etc.

### Vector Databases
Choose from several vector storage options:

- **Local**: Browser-based storage (default)
- **Pinecone**: Cloud vector database
- **Weaviate**: Open-source vector search
- **Chroma**: Open-source embedding database

### Environment Variables
Configure these settings in the UI or via environment:

```bash
# AI Provider Configuration
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key
GROQ_API_KEY=your_groq_key

# Vector Database (if using cloud providers)
PINECONE_API_KEY=your_pinecone_key
PINECONE_ENVIRONMENT=your_environment
WEAVIATE_URL=your_weaviate_url
```

## 📊 System Monitoring

The application includes comprehensive monitoring:

- **Model Status**: Real-time AI provider connection status
- **Document Stats**: Processing metrics and library statistics
- **Performance Monitoring**: Response times and confidence scores
- **Error Tracking**: Comprehensive error logging and notifications

## 🎯 Usage Guide

### Document Processing
1. **Upload PDFs**: Drag and drop or click to upload PDF files
2. **Processing Methods**: Automatic fallback from PDF.js to server-side to OCR
3. **Quality Assessment**: Automatic quality scoring and confidence metrics
4. **Chunking**: Smart text chunking with semantic preservation

### Chat Interface
1. **Ask Questions**: Natural language questions about document content
2. **Source Citations**: Answers include relevant document sources
3. **Context Awareness**: Multi-turn conversations with context retention
4. **Search Integration**: Enhanced search for specific document sections

### Advanced Features
1. **Multi-Document Chat**: Ask questions across multiple documents
2. **Semantic Search**: Find content by meaning, not just keywords
3. **Export Options**: Download processed text and conversation history
4. **Batch Processing**: Process multiple documents simultaneously

## 🔍 Technical Details

### PDF Processing Pipeline
1. **Primary**: PDF.js browser-based extraction
2. **Fallback**: Server-side processing via API
3. **Last Resort**: OCR processing for image-based PDFs
4. **Quality Control**: Automatic quality assessment and method selection

### RAG Implementation
1. **Text Chunking**: Semantic-aware chunking with overlap
2. **Embedding Generation**: Vector embeddings for semantic search
3. **Similarity Search**: Cosine similarity for relevant chunk retrieval
4. **Answer Generation**: Context-aware response generation

### State Management
- **Zustand Store**: Centralized state with persistence
- **Real-time Updates**: Live status and progress tracking
- **Error Handling**: Comprehensive error state management
- **Local Storage**: Automatic state persistence across sessions

## 🚀 Deployment

### Frontend Deployment
```bash
# Build for production
npm run build

# Deploy to Vercel, Netlify, or any static host
npm run preview
```

### Backend Requirements
For full functionality, consider deploying:
- PDF processing API (Python/FastAPI recommended)
- Vector database (if not using local storage)
- AI provider integrations

## 📝 API Documentation

### Core Endpoints
- `POST /api/pdf/extract` - PDF text extraction
- `POST /api/embeddings/generate` - Generate embeddings
- `POST /api/chat/completions` - AI chat completions
- `GET /api/documents` - Document management

### Data Models
- **Document**: PDF metadata and processed content
- **Message**: Chat message with metadata
- **Embedding**: Vector representations for search
- **Configuration**: AI provider and system settings

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Check the system status in the Status tab
- Review error messages in the notification system
- Ensure proper AI provider configuration
- Verify document upload formats (PDF only)

## 🔮 Roadmap

- [ ] Multi-language document support
- [ ] Advanced OCR integration
- [ ] Real-time collaboration features
- [ ] Mobile app development
- [ ] Enterprise authentication
- [ ] Custom model training

---

**QuantumPDF** - Transforming how you interact with documents through AI-powered analysis and conversation.
