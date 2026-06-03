from sqlalchemy import Column, Index, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import declarative_base
from datetime import datetime, timezone

Base = declarative_base()

class ChatSession(Base):
    __tablename__ = "chat_sessions"

    id = Column(
        String,
        primary_key=True
    )

    title = Column(
        String(255),
        nullable=False
    )

    created_at = Column(
        DateTime(timezone=True),
        default=datetime.now(timezone.utc)
    )

class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, autoincrement=True)

    session_id = Column(String, ForeignKey("chat_sessions.id", ondelete="CASCADE"), nullable=False)

    role = Column(
        String,
        nullable=False
    )

    message = Column(
        Text,
        nullable=False
    )

    created_at = Column(
        DateTime(timezone=True),
        default=datetime.now(timezone.utc)
    )

    __table_args__ = (Index("ix_chat_messages_session_id", "session_id"),)