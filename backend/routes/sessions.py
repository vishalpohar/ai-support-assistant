from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from dependencies import get_db

from models import ChatSession

router = APIRouter(prefix="/sessions", tags=["sessions"])


@router.get("/")
def get_sessions(db: Session = Depends(get_db)):
    sessions = db.query(ChatSession).order_by(ChatSession.created_at.desc()).all()

    return [{"id": session.id, "title": session.title} for session in sessions]
