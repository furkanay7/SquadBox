from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import func, select
from database import get_db_session
from models import Taboo

router = APIRouter()

@router.get("/random")
async def get_random_taboo_word(db: AsyncSession = Depends(get_db_session)):
    # SQL'de ORDER BY RANDOM() ile rastgele bir satır çek
    query = select(Taboo).order_by(func.random()).limit(1)
    result = await db.execute(query)
    word = result.scalar_one_or_none()
    
    if not word:
        raise HTTPException(status_code=404, detail="Kelime bulunamadı. Veritabanının seed edildiğinden emin olun.")
        
    return {
        "id": word.id,
        "word": word.word,
        "category": word.category,
        "forbidden_words": word.forbidden_words
    }


@router.get("/all")
async def get_all_taboo_words(db: AsyncSession = Depends(get_db_session)):
    query = select(Taboo).order_by(func.random())
    result = await db.execute(query)
    words = result.scalars().all()
    return [{"id": w.id, "word": w.word, "category": w.category, "forbidden_words": w.forbidden_words} for w in words]