from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from database import get_db_session
from models import Category

router = APIRouter()

@router.get("/all")
async def get_all_categories(db: AsyncSession = Depends(get_db_session)):
    query = select(Category).order_by(func.random())
    result = await db.execute(query)
    categories = result.scalars().all()
    return [{"id": c.id, "name": c.name, "words": c.words} for c in categories]

@router.get("/random")
async def get_random_category(db: AsyncSession = Depends(get_db_session)):
    query = select(Category).order_by(func.random()).limit(1)
    result = await db.execute(query)
    category = result.scalar_one_or_none()
    if not category:
        return {"name": "Genel", "words": []}
    return {"id": category.id, "name": category.name, "words": category.words}