from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import httpx
import json
import os
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), '..', '..', '..', '.env'))

router = APIRouter()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
OPENAI_URL = "https://api.openai.com/v1/chat/completions"

class AIGenerateRequest(BaseModel):
    topic: str
    count: int = 20

@router.post("/generate/taboo")
async def generate_taboo_cards(request: AIGenerateRequest):
    if not OPENAI_API_KEY:
        raise HTTPException(status_code=500, detail="OpenAI API anahtarı bulunamadı.")

    prompt = f"""Sen bir Türkçe parti oyunu kelime üreticisisin. 
'{request.topic}' konusuyla ilgili Tabu oyunu için {request.count} kart üret.
Her kartta 1 ana kelime ve 5 yasak kelime olsun.
SADECE aşağıdaki JSON formatında yanıt ver, başka hiçbir şey yazma:

[
  {{
    "word": "ana kelime",
    "forbidden_words": ["yasak1", "yasak2", "yasak3", "yasak4", "yasak5"]
  }}
]"""

    payload = {
        "model": "gpt-4o-mini",
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.9,
        "response_format": {"type": "json_object"}
    }

    headers = {
        "Authorization": f"Bearer {OPENAI_API_KEY}",
        "Content-Type": "application/json"
    }

    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            response = await client.post(OPENAI_URL, json=payload, headers=headers)
            response.raise_for_status()
            data = response.json()
            
            raw_text = data["choices"][0]["message"]["content"]
            parsed = json.loads(raw_text)
            
            # OpenAI json_object modunda bazen {"cards": [...]} döner
            if isinstance(parsed, dict):
                cards = parsed.get("cards", list(parsed.values())[0])
            else:
                cards = parsed
                
            return {"topic": request.topic, "cards": cards}
            
        except json.JSONDecodeError:
            raise HTTPException(status_code=500, detail="AI yanıtı parse edilemedi.")
        except httpx.HTTPError as e:
            raise HTTPException(status_code=502, detail=f"OpenAI API hatası: {str(e)}")
        

class AISpyfallRequest(BaseModel):
    theme: str
    count: int = 6

@router.post("/generate/spyfall")
async def generate_spyfall_locations(request: AISpyfallRequest):
    if not OPENAI_API_KEY:
        raise HTTPException(status_code=500, detail="OpenAI API anahtarı bulunamadı.")

    prompt = f"""Sen bir Türkçe parti oyunu tasarımcısısın.
'{request.theme}' temasıyla ilgili Spyfall oyunu için {request.count} farklı lokasyon üret.
Her lokasyonda 8 farklı rol olsun.
SADECE aşağıdaki JSON formatında yanıt ver, başka hiçbir şey yazma:

[
  {{
    "name": "lokasyon adı",
    "roles": ["rol1", "rol2", "rol3", "rol4", "rol5", "rol6", "rol7", "rol8"]
  }}
]"""

    payload = {
        "model": "gpt-4o-mini",
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.9,
        "response_format": {"type": "json_object"}
    }

    headers = {
        "Authorization": f"Bearer {OPENAI_API_KEY}",
        "Content-Type": "application/json"
    }

    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            response = await client.post(OPENAI_URL, json=payload, headers=headers)
            response.raise_for_status()
            data = response.json()
            
            raw_text = data["choices"][0]["message"]["content"]
            parsed = json.loads(raw_text)
            
            if isinstance(parsed, dict):
                locations = parsed.get("locations", list(parsed.values())[0])
            else:
                locations = parsed
                
            return {"theme": request.theme, "locations": locations}
            
        except json.JSONDecodeError:
            raise HTTPException(status_code=500, detail="AI yanıtı parse edilemedi.")
        except httpx.HTTPError as e:
            raise HTTPException(status_code=502, detail=f"OpenAI API hatası: {str(e)}")
        

class AIWhoIsItRequest(BaseModel):
    topic: str
    count: int = 10

@router.post("/generate/whoisit")
async def generate_whoisit_cards(request: AIWhoIsItRequest):
    if not OPENAI_API_KEY:
        raise HTTPException(status_code=500, detail="OpenAI API anahtarı bulunamadı.")

    prompt = f"""Sen bir Türkçe parti oyunu tasarımcısısın.
'{request.topic}' konusuyla ilgili 'Ben Kimim?' oyunu için {request.count} farklı karakter veya isim üret.
Karakterler tanınabilir ve eğlenceli olsun.
SADECE aşağıdaki JSON formatında yanıt ver, başka hiçbir şey yazma:

{{
  "cards": ["karakter1", "karakter2", "karakter3"]
}}"""

    payload = {
        "model": "gpt-4o-mini",
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.9,
        "response_format": {"type": "json_object"}
    }

    headers = {
        "Authorization": f"Bearer {OPENAI_API_KEY}",
        "Content-Type": "application/json"
    }

    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            response = await client.post(OPENAI_URL, json=payload, headers=headers)
            response.raise_for_status()
            data = response.json()
            raw_text = data["choices"][0]["message"]["content"]
            parsed = json.loads(raw_text)
            cards = parsed.get("cards", [])
            return {"topic": request.topic, "cards": cards}
        except json.JSONDecodeError:
            raise HTTPException(status_code=500, detail="AI yanıtı parse edilemedi.")
        except httpx.HTTPError as e:
            raise HTTPException(status_code=502, detail=f"OpenAI API hatası: {str(e)}")