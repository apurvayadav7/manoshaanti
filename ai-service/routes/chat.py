# routes/chat.py
# Defines the /chat endpoint for the FastAPI AI service.
# Express backend will call POST /chat with the user message + emotion.

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from services.chatService import get_chat_response

router = APIRouter()


# ─── Request/Response Models ───────────────────────────────────────────────────
# Pydantic models describe the shape of the JSON we expect and return.
# FastAPI validates the incoming request automatically.

class ChatRequest(BaseModel):
    message: str               # The user's message (required)
    emotion: Optional[str] = None  # The detected emotion from face-api.js (optional)
    journal_context: Optional[List[str]] = None
    chat_history_context: Optional[List[str]] = None


class ChatResponse(BaseModel):
    reply: str


# ─── POST /chat ────────────────────────────────────────────────────────────────
@router.post("/", response_model=ChatResponse)
async def chat(request: ChatRequest):
    if not request.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    try:
        reply = get_chat_response(
            user_message=request.message,
            emotion=request.emotion,
            journal_context=request.journal_context or [],
            chat_history_context=request.chat_history_context or []
        )
        return ChatResponse(reply=reply)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI service error: {str(e)}")
