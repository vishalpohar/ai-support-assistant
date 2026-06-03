# AI Support Assistant with RAG

An AI-powered support assistant built using React.js, FastAPI, Gemini API, ChromaDB, and PostgreSQL with Retrieval-Augmented Generation (RAG) capabilities.

## Features

* Conversational AI chat interface
* PDF upload and text extraction
* Semantic search using embeddings
* Retrieval-Augmented Generation (RAG)
* Persistent chat history
* Session management
* Context-aware AI responses
* AI-powered conversational chat
* PDF upload and processing
* Retrieval-Augmented Generation (RAG)
* Semantic document search
* Session-based chat history
* Persistent storage with PostgreSQL
* Context-aware responses
* Error handling and validation
* Redux Toolkit state management
* Responsive UI
* Dark mode support

## Tech Stack

### Frontend

* React.js
* TypeScript
* Redux Toolkit
* React Redux
* Axios
* React Hot Toast
* Tailwind CSS

### Backend

* FastAPI
* Python
* Gemini API

### Database & AI

* PostgreSQL
* ChromaDB
* Sentence Transformers
* SQLAlchemy

## Project Architecture

User
   ↓
React + Redux
   ↓
FastAPI Backend
   ↓
PDF Processing
   ↓
ChromaDB Vector Store
   ↓
Context Retrieval (RAG)
   ↓
Gemini API
   ↓
Response Generation
   ↓
PostgreSQL Storage

## Setup Instructions

### Backend Setup

```bash
cd backend
pip install -r requirements.txt
uvicorn app:app --reload
```

### Frontend Setup

```bash
cd frontend
npm install
npm start
```

## Environment Variables

Create a `.env` file and add:

```env
GEMINI_API_KEY=your_api_key
DATABASE_URL=postgresql://postgres:password@localhost:5432/ai_assistant
```

---

#### 5. Add Database Setup

```md
## PostgreSQL Setup

1. Install PostgreSQL
2. Create database:

```sql
CREATE DATABASE ai_assistant;

## Screenshots

### Chat Interface
![Chat Interface](screenshots/home.png)

### RAG-based PDF Response
![RAG Response](screenshots/rag-response.png)

## Future Improvements

* Streaming responses
* Voice input support
* Multi-file support
* User authentication
