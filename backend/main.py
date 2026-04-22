from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

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

@app.get("/")
async def root():
    return {
        "message": "SquadBox API çalışıyor",
        "version": "0.1.0",
        "status": "healthy"
    }

@app.get("/health")
async def health():
    return {"status": "ok"}

@app.get("/api/v1/rooms")
async def list_rooms():
    return {"rooms": [], "count": 0}

@app.post("/api/v1/rooms")
async def create_room():
    return {
        "room_code": "AB12",
        "status": "lobby",
        "message": "Oda oluşturuldu"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
