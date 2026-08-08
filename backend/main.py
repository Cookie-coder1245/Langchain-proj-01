"""
Viva — AI Technical Interviewer
FastAPI + LangChain + Gemini backend.

Architecture (preserved as requested):
    ChatPromptTemplate -> Structured Output -> LCEL -> RunnableParallel -> RunnableLambda -> FastAPI -> Gemini
"""

import os
from typing import List

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnableParallel, RunnableLambda

load_dotenv()

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
if not GOOGLE_API_KEY:
    raise RuntimeError(
        "GOOGLE_API_KEY is not set. Create a .env file in the backend/ folder "
        "with GOOGLE_API_KEY=your_key_here (see .env.example)."
    )

# ---------------------------------------------------------------------------
# Model
# ---------------------------------------------------------------------------

model = ChatGoogleGenerativeAI(
    model="gemini-3.6-flash",
    api_key=GOOGLE_API_KEY,
    temperature=0.7,
)

# ---------------------------------------------------------------------------
# Pydantic schemas — API contract
# ---------------------------------------------------------------------------


class InterviewSetupRequest(BaseModel):
    role: str = Field(..., min_length=2, max_length=120, description="e.g. Python Backend Developer")
    topic: str = Field(..., min_length=2, max_length=120, description="e.g. FastAPI")
    difficulty: str = Field(..., description="Beginner | Intermediate | Advanced")


class QuestionResponse(BaseModel):
    role: str
    topic: str
    difficulty: str
    question: str
    expected_points: List[str]


class EvaluateRequest(BaseModel):
    role: str
    topic: str
    difficulty: str
    question: str = Field(..., min_length=5)
    answer: str = Field(..., min_length=1)


class EvaluationResponse(BaseModel):
    score: int = Field(..., ge=0, le=10)
    strengths: List[str]
    weaknesses: List[str]
    feedback: str


# ---------------------------------------------------------------------------
# Structured output schemas — these are what Gemini is constrained to return
# ---------------------------------------------------------------------------


class QuestionOutput(BaseModel):
    """Structured output for the question-generation chain."""

    question: str = Field(..., description="A single, clear technical interview question")
    expected_points: List[str] = Field(
        ..., description="3-5 short bullet points describing what a strong answer should cover"
    )


class ScoreOutput(BaseModel):
    """Structured output for the scoring half of the evaluation chain."""

    score: int = Field(..., ge=0, le=10, description="Score out of 10")
    strengths: List[str] = Field(..., description="2-4 short bullet points on what the candidate did well")
    weaknesses: List[str] = Field(..., description="2-4 short bullet points on what was missing or wrong")


class FeedbackOutput(BaseModel):
    """Structured output for the feedback half of the evaluation chain."""

    feedback: str = Field(..., description="2-4 sentences of constructive, encouraging AI feedback")


# ---------------------------------------------------------------------------
# Chain 1 — Question generation
# ChatPromptTemplate -> structured output -> LCEL
# ---------------------------------------------------------------------------

question_prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            "You are a senior technical interviewer. You write focused, realistic "
            "technical interview questions and the key points a strong answer should hit. "
            "Always tailor the question to the given role, topic, and difficulty.",
        ),
        (
            "human",
            "Role: {role}\n"
            "Topic: {topic}\n"
            "Difficulty: {difficulty}\n\n"
            "Generate ONE interview question for this role/topic/difficulty, plus 3-5 "
            "expected answer points a strong candidate should mention.",
        ),
    ]
)

question_structured_model = model.with_structured_output(QuestionOutput)

question_chain = question_prompt | question_structured_model

# ---------------------------------------------------------------------------
# Chain 2 — Evaluation
# RunnableParallel (score chain + feedback chain running together)
#   -> RunnableLambda (merges both structured outputs into one response)
# ---------------------------------------------------------------------------

score_prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            "You are a strict but fair senior technical interviewer grading a candidate's "
            "spoken/written answer. Score out of 10 and list concrete strengths and weaknesses.",
        ),
        (
            "human",
            "Role: {role}\n"
            "Topic: {topic}\n"
            "Difficulty: {difficulty}\n\n"
            "Question: {question}\n\n"
            "Candidate's answer: {answer}\n\n"
            "Score this answer out of 10 and list its strengths and weaknesses.",
        ),
    ]
)

feedback_prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            "You are a supportive technical interview coach. Give the candidate short, "
            "actionable, encouraging feedback on how to improve their answer.",
        ),
        (
            "human",
            "Role: {role}\n"
            "Topic: {topic}\n"
            "Difficulty: {difficulty}\n\n"
            "Question: {question}\n\n"
            "Candidate's answer: {answer}\n\n"
            "Write 2-4 sentences of constructive feedback for the candidate.",
        ),
    ]
)

score_chain = score_prompt | model.with_structured_output(ScoreOutput)
feedback_chain = feedback_prompt | model.with_structured_output(FeedbackOutput)

evaluation_parallel = RunnableParallel(
    score_eval=score_chain,
    feedback_eval=feedback_chain,
)


def merge_evaluation(parallel_result: dict) -> EvaluationResponse:
    """RunnableLambda step: combine the parallel branch outputs into one API response."""
    score_eval: ScoreOutput = parallel_result["score_eval"]
    feedback_eval: FeedbackOutput = parallel_result["feedback_eval"]

    return EvaluationResponse(
        score=score_eval.score,
        strengths=score_eval.strengths,
        weaknesses=score_eval.weaknesses,
        feedback=feedback_eval.feedback,
    )


merge_step = RunnableLambda(merge_evaluation)

evaluation_chain = evaluation_parallel | merge_step

# ---------------------------------------------------------------------------
# FastAPI app
# ---------------------------------------------------------------------------

app = FastAPI(title="Viva — AI Technical Interviewer API", version="1.0.0")

# CORS: local Vite dev server. Add your deployed frontend origin here too.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health_check():
    return {"status": "ok"}


@app.post("/generate-question", response_model=QuestionResponse)
def generate_question(payload: InterviewSetupRequest):
    try:
        result: QuestionOutput = question_chain.invoke(
            {
                "role": payload.role,
                "topic": payload.topic,
                "difficulty": payload.difficulty,
            }
        )
    except Exception as exc:  # noqa: BLE001 — surfaced as a clean 502 to the client
        raise HTTPException(
            status_code=502,
            detail="We couldn't generate your question right now. Please try again.",
        ) from exc

    return QuestionResponse(
        role=payload.role,
        topic=payload.topic,
        difficulty=payload.difficulty,
        question=result.question,
        expected_points=result.expected_points,
    )


@app.post("/evaluate", response_model=EvaluationResponse)
def evaluate_answer(payload: EvaluateRequest):
    try:
        result: EvaluationResponse = evaluation_chain.invoke(
            {
                "role": payload.role,
                "topic": payload.topic,
                "difficulty": payload.difficulty,
                "question": payload.question,
                "answer": payload.answer,
            }
        )
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(
            status_code=502,
            detail="We couldn't evaluate your answer right now. Please try again.",
        ) from exc

    return result
