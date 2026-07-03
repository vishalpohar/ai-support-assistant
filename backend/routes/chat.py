import uuid
import traceback

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session

from core.config import client, model
from dependencies import get_db

from repositories.chat_repository import (
    get_session,
    create_session,
    save_message,
    get_recent_messages,
)

from services.rag_service import retrieve_context
from services.pdf_service import extract_pdf_text
from services.prompt_service import build_prompt

from vector_store import add_document

router = APIRouter(prefix="/chat", tags=["chat"])


@router.post("/")
async def chat(
    message: str = Form(...),
    session_id: str = Form(...),
    file: UploadFile = File(None),
    db: Session = Depends(get_db),
):
    try:
        user_message = message.strip()

        if not user_message:
            raise HTTPException(status_code=400, detail="Message is required")

        # Create session if not exists
        session = get_session(db, session_id)

        if not session:
            create_session(
                db,
                session_id,
                user_message[:30],
            )

        # Fetch previous messages
        previous_messages = get_recent_messages(
            db,
            session_id,
            limit=4,
        )

        conversation = ""
        for msg in reversed(previous_messages):
            conversation += f"{msg.role.upper()}: {msg.message}\n"

        file_text = ""
        doc_id = None

        if file is not None:
            file_text = await extract_pdf_text(file)

            doc_id = str(uuid.uuid4())

            add_document(doc_id=doc_id, text=file_text, session_id=session_id)

        save_message(
            db,
            session_id,
            "user",
            user_message,
        )

        retrieved_context = retrieve_context(
            user_message=user_message,
            conversation=conversation,
            session_id=session_id,
            file_text=file_text if file is not None else "",
            doc_id=doc_id,
        )

        context = retrieved_context or "No context available"

        # Prompt
        prompt = build_prompt(user_message, conversation, context)

        # Gemini response
        response = client.models.generate_content(model=model, contents=prompt)

        ai_reply = response.text

        save_message(
            db,
            session_id,
            "assistant",
            ai_reply,
        )

        return {"reply": ai_reply}

    except HTTPException:
        raise

    except Exception:
        traceback.print_exc()

        raise HTTPException(status_code=500, detail="Internal Server Error")
