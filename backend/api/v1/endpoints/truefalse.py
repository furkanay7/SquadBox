from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from database import get_db_session
from models import TrueFalse

router = APIRouter()

@router.get("/random")
async def get_random_questions(difficulty: str = "medium", count: int = 10, db: AsyncSession = Depends(get_db_session)):
    query = select(TrueFalse).where(TrueFalse.difficulty == difficulty).order_by(func.random()).limit(count)
    result = await db.execute(query)
    questions = result.scalars().all()
    return [{"id": q.id, "question": q.question, "answer": q.answer == "true", "explanation": q.explanation, "difficulty": q.difficulty} for q in questions]

@router.get("/all")
async def get_all_questions(difficulty: str = "medium", db: AsyncSession = Depends(get_db_session)):
    query = select(TrueFalse).where(TrueFalse.difficulty == difficulty).order_by(func.random())
    result = await db.execute(query)
    questions = result.scalars().all()
    return [{"id": q.id, "question": q.question, "answer": q.answer == "true", "explanation": q.explanation, "difficulty": q.difficulty} for q in questions]