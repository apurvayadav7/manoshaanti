# ManoShaanti

ManoShaanti is an AI-powered mental wellness platform with a privacy-first architecture, freemium access model, and personalized context-aware chatbot responses.

## Core Highlights
- Empathetic chatbot with crisis interception safety flow
- Multi-source context builder for personalized chat responses
- Emotion detection and ASL-assisted interaction support
- Journal, assessment, mood, rewards, and habit tools
- Voice interaction in chatbot using browser Web Speech APIs
- Freemium plans with ethical no-paywall support essentials

## Ethical No-Paywall Features
These remain free for all users:
- chatbot access
- crisis-safe responses
- breathing exercises
- basic assessment
- emotion detection
- ASL accessibility

## Plans and Pricing
- Free
- Premium: 149 INR
- Student Plan: 79 INR

## Tech Stack
- Frontend: React + Vite + Framer Motion + Lucide React
- Backend API: Node.js + Express
- AI Service: FastAPI (Python)
- AI Providers: Anthropic or Groq
- Database: SQLite (better-sqlite3)
- Auth: JWT + bcrypt

## Project Structure
- frontend
  - src/pages
  - src/components
  - src/context
  - src/features/voice
- backend
  - controllers
  - routes
  - middleware
  - services/contextBuilder.js
  - db
- ai-service
  - main.py
  - routes
  - services

## Environment Setup

### 1) Backend env
Create backend/.env with at least:
- PORT=5000
- AI_SERVICE_URL=http://localhost:8000
- JWT_SECRET=replace_with_secure_secret
- JWT_EXPIRES_IN=7d

### 2) AI service env
Create ai-service/.env with one provider configured:
- AI_PROVIDER=anthropic or groq
- For Anthropic:
  - ANTHROPIC_API_KEY=...
  - CLAUDE_MODEL=claude-3-5-haiku-20241022
- For Groq:
  - GROQ_API_KEY=...
  - GROQ_MODEL=llama-3.1-8b-instant

## Local Run

### Frontend
1. cd frontend
2. npm install
3. npm run dev

### Backend
1. cd backend
2. npm install
3. npm run dev

### AI Service
1. Activate Python environment
2. pip install -r ai-service/requirements.txt
3. python -m uvicorn main:app --host 0.0.0.0 --port 8000 --app-dir ai-service

## Service URLs
- Frontend: http://localhost:5173
- Backend: http://localhost:5000
- AI Service: http://localhost:8000

## Context-Aware Chatbot Flow
For each chat request:
1. backend checks crisis phrases
2. backend builds context object from:
   - latest assessment level
   - detected emotion
   - recent chat summary
   - journal themes (if allowed)
   - profile context
3. backend builds structured prompt
4. prompt and context sent to FastAPI AI service
5. AI response returned to frontend and chat memory persisted

## Voice Features (Frontend-Only)
In chatbot page:
- speech-to-text via window.SpeechRecognition or window.webkitSpeechRecognition
- text-to-speech via window.speechSynthesis
- manual speak button on assistant messages
- optional auto-read assistant responses
- graceful unsupported-browser handling

## Key API Endpoints

### Health
- GET /health (backend)
- GET http://localhost:8000/health (AI)

### Auth
- POST /api/auth/signup
- POST /api/auth/login
- GET /api/auth/me

### Chat and Emotion
- POST /api/chat
- POST /api/emotion

### Accessibility and ASL
- POST /api/asl/recognize
- POST /api/asl/calibrate
- GET /api/asl/templates

### Wellness Data
- POST /api/journal/settings
- POST /api/journal/entry
- GET /api/journal/entries/:userId
- POST /api/assessment/submit
- GET /api/assessment/recommendations/:userId
- GET /api/mood/weekly/:userId

### Rewards, Activities, Games
- GET /api/activities/suggestions/:userId
- POST /api/rewards/activity-complete
- POST /api/rewards/action
- GET /api/rewards/users/:userId
- GET /api/games/wordle/word
- GET /api/breathing/pattern

## Privacy Principles
- minimal account data (username, email, password)
- no phone/address/government ID collection
- passwords stored only as hashes
- no raw journal text sent to AI providers
- summarized context only for personalization
