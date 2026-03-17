import os
from typing import Optional, List, Dict, Any

from dotenv import load_dotenv

load_dotenv()


def _build_system_prompt(
    emotion: Optional[str],
    journal_context: Optional[List[str]] = None,
    chat_history_context: Optional[List[str]] = None,
    context_object: Optional[Dict[str, Any]] = None,
    context_prompt: Optional[str] = None,
) -> str:
    if context_prompt:
        return context_prompt

    if context_object:
        assessment_level = context_object.get("assessment_level", "Not Available")
        detected_emotion = context_object.get("detected_emotion", emotion or "Neutral")
        chat_summary = context_object.get("chat_summary", "No recent conversation summary available.")
        journal_themes = context_object.get("journal_themes", []) or []
        profile_context = context_object.get("profile_context", {}) or {}

        return (
            "You are ManoShaanti, an empathetic AI mental wellness assistant. "
            "Respond in a warm, supportive, and concise way (2-5 sentences). "
            "Do not diagnose medical conditions. Encourage healthy coping tools and professional support when needed.\n\n"
            "User context:\n"
            f"Assessment level: {assessment_level}\n"
            f"Detected emotion: {detected_emotion}\n"
            f"Recent conversation summary: {chat_summary}\n"
            f"Journal themes: {', '.join(journal_themes) if journal_themes else 'None'}\n"
            f"Profile: {profile_context}\n\n"
            "Context priority order:\n"
            "1. Crisis detection\n"
            "2. Assessment level\n"
            "3. Current emotion\n"
            "4. Chat history summary\n"
            "5. Journal themes\n"
            "6. Profile context\n"
        )

    emotion_line = (
        f"Detected emotion from client-side face-api.js: {emotion}. "
        "Use this gently as context, but do not overstate certainty."
        if emotion
        else "No detected emotion was provided."
    )

    journal_lines = ""
    if journal_context:
        joined = "\n".join([f"- {entry}" for entry in journal_context])
        journal_lines = (
            "Recent user journal context (if relevant, use gently):\n"
            f"{joined}\n"
        )

    history_lines = ""
    if chat_history_context:
        joined_history = "\n\n".join(chat_history_context)
        history_lines = (
            "Recent conversation memory (last 5 days, up to 67 blocks):\n"
            f"{joined_history}\n"
        )

    return (
        "You are ManoShaanti, an empathetic AI mental wellness assistant for a hackathon demo. "
        "Respond in a warm, supportive, and concise way (2-5 sentences). "
        "Do not diagnose medical conditions. Encourage seeking help from trusted people "
        "or professionals when concerns are serious. "
        f"{emotion_line} "
        f"{journal_lines}"
        f"{history_lines}"
    )


def _chat_with_anthropic(
    user_message: str,
    emotion: Optional[str],
    journal_context: Optional[List[str]] = None,
    chat_history_context: Optional[List[str]] = None,
    context_object: Optional[Dict[str, Any]] = None,
    context_prompt: Optional[str] = None,
) -> str:
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
        system=_build_system_prompt(
            emotion,
            journal_context,
            chat_history_context,
            context_object,
            context_prompt,
        ),
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


def _chat_with_groq(
    user_message: str,
    emotion: Optional[str],
    journal_context: Optional[List[str]] = None,
    chat_history_context: Optional[List[str]] = None,
    context_object: Optional[Dict[str, Any]] = None,
    context_prompt: Optional[str] = None,
) -> str:
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
            {
                "role": "system",
                "content": _build_system_prompt(
                    emotion,
                    journal_context,
                    chat_history_context,
                    context_object,
                    context_prompt,
                ),
            },
            {"role": "user", "content": user_message},
        ],
    )
    content = (completion.choices[0].message.content or "").strip()
    return content or "I am here with you. Can you share a little more about how you feel right now?"


def get_chat_response(
    user_message: str,
    emotion: Optional[str] = None,
    journal_context: Optional[List[str]] = None,
    chat_history_context: Optional[List[str]] = None,
    context_object: Optional[Dict[str, Any]] = None,
    context_prompt: Optional[str] = None,
) -> str:
    provider = os.getenv("AI_PROVIDER", "anthropic").strip().lower()

    if provider == "groq":
        return _chat_with_groq(
            user_message,
            emotion,
            journal_context,
            chat_history_context,
            context_object,
            context_prompt,
        )
    if provider == "anthropic":
        return _chat_with_anthropic(
            user_message,
            emotion,
            journal_context,
            chat_history_context,
            context_object,
            context_prompt,
        )

    return (
        "Configuration error: AI_PROVIDER must be 'anthropic' or 'groq'. "
        "Please update ai-service/.env."
    )

