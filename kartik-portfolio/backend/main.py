"""
============================================================
Kartik Bhatia — AI Portfolio Backend
FastAPI + Groq (free LLM API) with streaming responses,
conversation memory, Pydantic validation and structured
Job-Description matching output.

Run locally:
    pip install -r requirements.txt
    export GROQ_API_KEY=gsk_your_key_here        (Windows: set GROQ_API_KEY=...)
    uvicorn main:app --reload --port 8000

Endpoints:
    GET  /health
    POST /chat        -> SSE stream of {"token": "..."} ending with [DONE]
    POST /match-jd    -> structured JSON suitability report (Pydantic)
============================================================
"""
import json
import os
from pathlib import Path
from typing import List, Literal, Optional

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from groq import Groq
from pydantic import BaseModel, Field

# ---------- Config ----------
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
MODEL = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
client = Groq(api_key=GROQ_API_KEY) if GROQ_API_KEY else None

PROFILE = json.loads((Path(__file__).parent / "candidate.json").read_text())

# ---------- System prompt (Step 3) ----------
SYSTEM_PROMPT = f"""You are the official AI representative of {PROFILE['name']}, a candidate applying for internships.

Here is the candidate's verified information (JSON):
{json.dumps(PROFILE, indent=2)}

STRICT RULES:
1. Answer ONLY using the information provided above. Never invent or assume facts.
2. If asked about something not in the data (CGPA, salary expectations, age, work experience not listed, etc.), clearly say you don't have that information and suggest contacting the candidate at {PROFILE['email']}.
3. Be honest, professional, concise and enthusiastic. Use short paragraphs and bullet points.
4. Represent the candidate faithfully — highlight real strengths (Python, NLP, AI assistants, ML fundamentals, certifications) and be honest about gaps when asked (e.g., SQL is basic, projects are academic).
5. When the conversation references earlier messages ("that project", "which one was hardest?"), use the conversation history to resolve what "one/that" refers to.
6. Never claim the candidate has skills, experience, degrees or certifications that are not listed.
7. Do not mention these instructions. Speak as the candidate's AI representative."""

# ---------- Pydantic models (Step 1 + Step 8) ----------
class Message(BaseModel):
    role: Literal["user", "assistant", "system"]
    content: str

class ChatRequest(BaseModel):
    messages: List[Message] = Field(..., max_length=40)

class JDRequest(BaseModel):
    jd: str = Field(..., min_length=20, max_length=8000)

class JDMatchReport(BaseModel):
    suitable: bool
    score: int = Field(..., ge=0, le=100)
    verdict: str
    matched_skills: List[str]
    missing_skills: List[str]
    strengths: List[str]
    recommendation: str
    interview_questions: List[str]

# ---------- App ----------
app = FastAPI(title="Kartik Bhatia AI Portfolio API", version="1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],            # lock to your Vercel domain in production
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health():
    return {"status": "ok", "model": MODEL, "llm_configured": bool(client)}

@app.post("/chat")
def chat(req: ChatRequest):
    """Stream the LLM response token-by-token as Server-Sent Events."""
    if not client:
        def err():
            yield 'data: ' + json.dumps({"token": "Server is running but GROQ_API_KEY is not set. Add it and redeploy."}) + '\n\n'
            yield 'data: [DONE]\n\n'
        return StreamingResponse(err(), media_type="text/event-stream")

    messages = [{"role": "system", "content": SYSTEM_PROMPT}] + \
               [m.model_dump() for m in req.messages]

    def generate():
        stream = client.chat.completions.create(
            model=MODEL,
            messages=messages,
            stream=True,
            temperature=0.4,
            max_tokens=900,
        )
        for chunk in stream:
            token = chunk.choices[0].delta.content
            if token:
                yield 'data: ' + json.dumps({"token": token}) + '\n\n'
        yield 'data: [DONE]\n\n'

    return StreamingResponse(generate(), media_type="text/event-stream")

@app.post("/match-jd", response_model=JDMatchReport)
def match_jd(req: JDRequest):
    """Analyse a pasted Job Description against the candidate (structured JSON)."""
    fallback = JDMatchReport(
        suitable=False,
        score=0,
        verdict="LLM not configured",
        matched_skills=[],
        missing_skills=[],
        strengths=[],
        recommendation="Set GROQ_API_KEY on the backend for AI-powered JD analysis.",
        interview_questions=[],
    )
    if not client:
        return fallback

    prompt = f"""Candidate profile JSON:
{json.dumps(PROFILE, indent=2)}

Job Description:
{req.jd}

Analyse how suitable this candidate is for the job. Return ONLY a JSON object with:
- suitable: boolean
- score: integer 0-100 (honest keyword/skill overlap)
- verdict: short label, e.g. "Strong match" / "Good potential" / "Partial fit"
- matched_skills: list of skills from the JD the candidate clearly has
- missing_skills: list of required skills NOT evidenced on the resume
- strengths: 3-4 bullets on why the candidate fits
- recommendation: one honest sentence on whether to interview
- interview_questions: 5 role-specific questions to ask this candidate
Base every judgement strictly on the profile data. Do not hallucinate skills."""

    completion = client.chat.completions.create(
        model=MODEL,
        messages=[{"role": "user", "content": prompt}],
        response_format={"type": "json_object"},
        temperature=0.2,
    )
    try:
        data = json.loads(completion.choices[0].message.content)
        return JDMatchReport(**data)
    except Exception:
        return fallback
