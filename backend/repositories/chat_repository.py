from sqlalchemy.orm import Session

from models import ChatMessage, ChatSession


def get_session(db: Session, session_id: str):
    return db.query(ChatSession).filter(ChatSession.id == session_id).first()


def create_session(
    db: Session,
    session_id: str,
    title: str,
):
    session = ChatSession(
        id=session_id,
        title=title,
    )

    db.add(session)
    db.commit()

    return session


def save_message(
    db: Session,
    session_id: str,
    role: str,
    message: str,
):
    chat = ChatMessage(
        session_id=session_id,
        role=role,
        message=message,
    )

    db.add(chat)
    db.commit()

    return chat


def get_recent_messages(
    db: Session,
    session_id: str,
    limit: int,
):
    return (
        db.query(ChatMessage)
        .filter(ChatMessage.session_id == session_id)
        .order_by(ChatMessage.created_at.desc())
        .limit(limit)
        .all()
    )
