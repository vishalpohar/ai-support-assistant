from fastapi import FastAPI, UploadFile, Form, File, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from dotenv import load_dotenv
from google import genai
from pypdf import PdfReader

from database import SessionLocal, engine
from models import Base, ChatMessage, ChatSession
from vector_store import add_document, search_document

import uuid
import os

# Load environment variables
load_dotenv()

# Configure Gemini
client = genai.Client()
model = "gemini-3-flash-preview"

# Create FastAPI app
app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create tables
Base.metadata.create_all(bind=engine)


# Database Dependency
def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


@app.post("/chat")
async def chat(
    message: str = Form(...),
    session_id: str = Form(...),
    file: UploadFile = File(None),
    db: Session = Depends(get_db),
):
    try:
        user_message = message.strip()

        if not user_message:
            return {"error": "Message is required"}

        # Create session if not exists
        session = db.query(ChatSession).filter(ChatSession.id == session_id).first()

        if not session:
            session = ChatSession(id=session_id, title=user_message[:30])

            db.add(session)
            db.commit()

        user_chat = ChatMessage(
            session_id=session_id, role="user", message=user_message
        )

        db.add(user_chat)
        db.commit()

        file_text = ""

        if file and file.filename:
            os.makedirs("uploads", exist_ok=True)

            unique_name = f"{uuid.uuid4()}_{file.filename}"
            filepath = os.path.join("uploads", unique_name)

            with open(filepath, "wb") as f:
                content = await file.read()
                f.write(content)

            # Extract text if PDF
            if file.filename.lower().endswith(".pdf"):
                reader = PdfReader(filepath)

                for page in reader.pages:
                    page_text = page.extract_text()
                    if page_text:
                        file_text += page_text

            # Store in vector DB
            if file_text.strip():
                add_document(
                    doc_id=str(uuid.uuid4()), text=file_text, session_id=session_id
                )

        # Fetch previous messages
        previous_messages = (
            db.query(ChatMessage)
            .filter(ChatMessage.session_id == session_id)
            .order_by(ChatMessage.created_at.desc())
            .limit(10)
            .all()
        )

        conversation = ""

        for msg in reversed(previous_messages):
            conversation += f"{msg.role.upper()}: {msg.message}\n"

        relevant_docs = search_document(user_message)

        retrieved_context = "\n\n".join(relevant_docs[:3]) if relevant_docs else ""

        context_parts = []

        if file_text.strip():
            context_parts.append("UPLOADED FILE CONTEXT:\n" + file_text[:3000])

        if retrieved_context:
            context_parts.append("RETRIEVED CONTEXT:\n" + retrieved_context)

        context = (
            "\n\n".join(context_parts) if context_parts else "No context available"
        )

        # Prompt
        prompt = f"""
        You are an AI support assistant.

        Answer clearly and professionally.

        If relevant context is provided, use it to answer accurately.

        If no context is available, answer normally using your own knowledge.

        Context:
        {context}

        Conversation History:
        {conversation}

        User:
        {user_message}
        """

        # Gemini response
        response = client.models.generate_content(model=model, contents=prompt)

        ai_reply = response.text

        # Save assistant reply
        bot_chat = ChatMessage(
            session_id=session_id, role="assistant", message=ai_reply
        )

        db.add(bot_chat)
        db.commit()

        return {"reply": ai_reply}

    except Exception as e:
        print("ERROR:", str(e))
        return {"error": "Internal Server Error"}


@app.get("/sessions")
def get_sessions(db: Session = Depends(get_db)):
    sessions = db.query(ChatSession).order_by(ChatSession.created_at.desc()).all()

    return [{"id": session.id, "title": session.title} for session in sessions]


@app.get("/messages/{session_id}")
def get_messages(session_id: str, db: Session = Depends(get_db)):
    messages = db.query(ChatMessage).filter(ChatMessage.session_id == session_id).all()

    return [
        {"role": msg.role, "text": msg.message, "timestamp": msg.created_at}
        for msg in messages
    ]
