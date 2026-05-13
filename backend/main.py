from fastapi import FastAPI, APIRouter, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession
from backend.database import get_db_session
from backend.api.v1.endpoints import taboo, spyfall

app = FastAPI(
    title="SquadBox API",
    description="AI destekli sosyal oyun platformu",
    version="0.1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Base Router
router = APIRouter()

@router.get("/")
async def root():
    return {
        "message": "SquadBox API çalışıyor",
        "version": "0.1.0",
        "status": "healthy"
    }

@router.get("/health")
async def health_check(session: AsyncSession = Depends(get_db_session)):
    try:
        await session.connection()
        return {"status": "ok", "database": "connected"}
    except Exception as e:
        return {"status": "error", "database": "disconnected", "detail": str(e)}

# Ana router'ı dahil et
app.include_router(router)

# Oyun router'larını modüler olarak dahil et
app.include_router(taboo.router, prefix="/api/v1/taboo", tags=["Taboo"])
app.include_router(spyfall.router, prefix="/api/v1/spyfall", tags=["Spyfall"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
