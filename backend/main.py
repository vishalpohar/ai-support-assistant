from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import engine
from models import Base

from routes.chat import router as chat_router
from routes.sessions import router as sessions_router
from routes.messages import router as messages_router

# Create FastAPI app
app = FastAPI(
    title="SmartAssist API",
    description="API for SmartAssist AI Support Assistant",
    version="1.0.0",
)

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

app.include_router(chat_router)
app.include_router(sessions_router)
app.include_router(messages_router)
