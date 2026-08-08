from fastapi import FastAPI
from pydantic import BaseModel
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnableParallel, RunnableLambda


app = FastAPI()


# =========================
# Gemini Model
# =========================

model = ChatGoogleGenerativeAI(
    model="gemini-3.6-flash",
    api_key=""
)


# ============================================================
# PHASE 1 — Generate Interview Question
# ============================================================

class InterviewQuestion(BaseModel):
    role: str
    topic: str
    difficulty: str


class InterviewOutput(BaseModel):
    question: str
    difficulty: str
    topic: str
    expected_answer_points: list[str]


system_prompt = """
You are a senior technical interviewer.

Your job is to create high-quality technical interview questions.

Follow these rules:

- Ask questions that are relevant to the candidate's role.
- Focus specifically on the requested topic.
- Match the requested difficulty level.
- For beginner questions, avoid unnecessary complexity.
- For intermediate questions, test practical understanding and problem-solving.
- For advanced questions, test deep technical knowledge and real-world decision-making.
- Make the question clear and unambiguous.
"""


human_prompt = """
Generate one technical interview question based on the following:

Role: {role}
Topic: {topic}
Difficulty: {difficulty}

Also provide the important points that an ideal candidate should mention
when answering the question.
"""


prompt = ChatPromptTemplate.from_messages([
    ("system", system_prompt),
    ("human", human_prompt)
])


structured_model = model.with_structured_output(InterviewOutput)

interview_chain = prompt | structured_model


@app.post("/generate-question")
def generate_question(data: InterviewQuestion):

    response = interview_chain.invoke({
        "role": data.role,
        "topic": data.topic,
        "difficulty": data.difficulty
    })

    return {
        "question": response.question,
        "difficulty": response.difficulty,
        "topic": response.topic,
        "expected_answer_points": response.expected_answer_points
    }


# ============================================================
# PHASE 5 — RunnableParallel Evaluation
# ============================================================

class Evaluate(BaseModel):
    question: str
    answer: str


# =========================
# Score Output
# =========================

class ScoreOutput(BaseModel):
    score: int


# =========================
# Strength Output
# =========================

class StrengthOutput(BaseModel):
    strengths: list[str]


# =========================
# Weakness Output
# =========================

class WeaknessOutput(BaseModel):
    weaknesses: list[str]


# =========================
# Score Prompt
# =========================

score_prompt = ChatPromptTemplate.from_messages([
    (
        "system",
        """
You are a senior technical interviewer.

Evaluate the candidate's answer based on:

- Technical correctness
- Relevance to the question
- Completeness
- Depth of understanding

Give a score from 0 to 10.

0 means completely incorrect and 10 means an excellent answer.

The score must be an integer.
"""
    ),
    (
        "human",
        """
Question:
{question}

Candidate Answer:
{answer}
"""
    )
])


# =========================
# Strength Prompt
# =========================

strength_prompt = ChatPromptTemplate.from_messages([
    (
        "system",
        """
You are a senior technical interviewer.

Analyze the candidate's answer and identify its strongest points.

Focus on:

- Correct technical concepts
- Good explanations
- Relevant details
- Demonstrated understanding

Only identify genuine strengths.
"""
    ),
    (
        "human",
        """
Question:
{question}

Candidate Answer:
{answer}
"""
    )
])


# =========================
# Weakness Prompt
# =========================

weakness_prompt = ChatPromptTemplate.from_messages([
    (
        "system",
        """
You are a senior technical interviewer.

Analyze the candidate's answer and identify its weaknesses.

Focus on:

- Incorrect technical information
- Missing important concepts
- Incomplete explanations
- Misunderstandings
- Important details the candidate should have mentioned

Be specific and constructive.
"""
    ),
    (
        "human",
        """
Question:
{question}

Candidate Answer:
{answer}
"""
    )
])


# ============================================================
# Structured Models
# ============================================================

score_model = model.with_structured_output(ScoreOutput)

strength_model = model.with_structured_output(StrengthOutput)

weakness_model = model.with_structured_output(WeaknessOutput)


# ============================================================
# Individual Chains
# ============================================================

score_chain = score_prompt | score_model

strength_chain = strength_prompt | strength_model

weakness_chain = weakness_prompt | weakness_model


# ============================================================
# RunnableParallel
# ============================================================

evaluation_parallel = RunnableParallel(
    score=score_chain,
    strengths=strength_chain,
    weaknesses=weakness_chain
)


# ============================================================
# Transform Parallel Output
# ============================================================

def prepare_feedback(data):

    return {
        "score": data["score"].score,
        "strengths": data["strengths"].strengths,
        "weaknesses": data["weaknesses"].weaknesses
    }


prepare_feedback_chain = RunnableLambda(prepare_feedback)


# ============================================================
# Feedback Output
# ============================================================

class FeedbackOutput(BaseModel):
    feedback: str


# ============================================================
# Feedback Prompt
# ============================================================

feedback_prompt = ChatPromptTemplate.from_messages([
    (
        "system",
        """
You are a senior technical interviewer.

Based on the candidate's score, strengths, and weaknesses,
provide concise and constructive feedback.

Explain what the candidate did well and what they should
improve to give a stronger answer.
"""
    ),
    (
        "human",
        """
Score:
{score}

Strengths:
{strengths}

Weaknesses:
{weaknesses}

Give the candidate final feedback.
"""
    )
])


# ============================================================
# Feedback Chain
# ============================================================

feedback_model = model.with_structured_output(FeedbackOutput)

feedback_chain = feedback_prompt | feedback_model


# ============================================================
# FINAL EVALUATION CHAIN
# ============================================================

final_evaluation_chain = (
    evaluation_parallel
    | prepare_feedback_chain
    | feedback_chain
)


# ============================================================
# Evaluate Endpoint
# ============================================================

@app.post("/evaluate")
def evaluate(data: Evaluate):

    response = final_evaluation_chain.invoke({
        "question": data.question,
        "answer": data.answer
    })

    return {
        "feedback": response.feedback
    }