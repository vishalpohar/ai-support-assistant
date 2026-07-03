from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from dependencies import get_db

from models import ChatMessage

router = APIRouter(prefix="/messages", tags=["messages"])


@router.get("/messages/{session_id}")
def get_messages(session_id: str, db: Session = Depends(get_db)):
    messages = db.query(ChatMessage).filter(ChatMessage.session_id == session_id).all()

    return [
        {"role": msg.role, "text": msg.message, "timestamp": msg.created_at}
        for msg in messages
    ]
