from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import func, select
from backend.database import get_db_session
from backend.models import Taboo

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
