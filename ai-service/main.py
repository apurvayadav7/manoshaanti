from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from routes import chat
from routes import asl

load_dotenv()

app = FastAPI(title="ManoShaanti AI Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "ai-service", "port": 8000}


app.include_router(chat.router, prefix="/chat", tags=["Chat"])
app.include_router(asl.router, prefix="/asl", tags=["ASL"])
