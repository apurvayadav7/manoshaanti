import os
from typing import Optional

from dotenv import load_dotenv

load_dotenv()


def _build_system_prompt(emotion: Optional[str]) -> str:
    emotion_line = (
        f"Detected emotion from client-side face-api.js: {emotion}. "
        "Use this gently as context, but do not overstate certainty."
        if emotion
        else "No detected emotion was provided."
    )

    return (
        "You are ManoShaanti, an empathetic AI mental wellness assistant for a hackathon demo. "
        "Respond in a warm, supportive, and concise way (2-5 sentences). "
        "Do not diagnose medical conditions. Encourage seeking help from trusted people "
        "or professionals when concerns are serious. "
        f"{emotion_line}"
    )


def _chat_with_anthropic(user_message: str, emotion: Optional[str]) -> str:
    from anthropic import Anthropic

    api_key = os.getenv("ANTHROPIC_API_KEY", "").strip()
    model = os.getenv("CLAUDE_MODEL", "claude-3-5-haiku-20241022")

    if not api_key or api_key == "your_anthropic_api_key_here":
        return (
            "Demo mode: Anthropic API key is not configured yet. "
            "Please set ANTHROPIC_API_KEY in ai-service/.env or switch AI_PROVIDER to groq."
        )

    client = Anthropic(api_key=api_key)
    response = client.messages.create(
        model=model,
        max_tokens=300,
        system=_build_system_prompt(emotion),
        messages=[
            {
                "role": "user",
                "content": user_message,
            }
        ],
    )

    text_chunks = [
        block.text for block in response.content if getattr(block, "type", None) == "text"
    ]
    final_text = "\n".join(text_chunks).strip()
    return final_text or "I am here with you. Can you share a little more about how you feel right now?"


def _chat_with_groq(user_message: str, emotion: Optional[str]) -> str:
    from groq import Groq

    api_key = os.getenv("GROQ_API_KEY", "").strip()
    model = os.getenv("GROQ_MODEL", "llama-3.1-8b-instant")

    if not api_key or api_key == "your_groq_api_key_here":
        return (
            "Demo mode: Groq API key is not configured yet. "
            "Please set GROQ_API_KEY in ai-service/.env."
        )

    client = Groq(api_key=api_key)
    completion = client.chat.completions.create(
        model=model,
        temperature=0.6,
        max_tokens=300,
        messages=[
            {"role": "system", "content": _build_system_prompt(emotion)},
            {"role": "user", "content": user_message},
        ],
    )
    content = (completion.choices[0].message.content or "").strip()
    return content or "I am here with you. Can you share a little more about how you feel right now?"


def get_chat_response(user_message: str, emotion: Optional[str] = None) -> str:
    provider = os.getenv("AI_PROVIDER", "anthropic").strip().lower()

    if provider == "groq":
        return _chat_with_groq(user_message, emotion)
    if provider == "anthropic":
        return _chat_with_anthropic(user_message, emotion)

    return (
        "Configuration error: AI_PROVIDER must be 'anthropic' or 'groq'. "
        "Please update ai-service/.env."
    )

