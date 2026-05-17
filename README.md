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

## Tech Stack

### Frontend

* React.js
* CSS
* Axios

### Backend

* FastAPI
* Python
* Gemini API

### Database & AI

* PostgreSQL
* ChromaDB
* Sentence Transformers

## Project Architecture

User Query → Embedding Generation → Vector Search → Context Retrieval → Prompt Construction → Gemini Response

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
```

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
