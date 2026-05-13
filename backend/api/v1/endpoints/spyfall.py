import random
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import func, select
from backend.database import get_db_session
from backend.models import Spyfall
from typing import List

router = APIRouter()

@router.get("/start")
async def start_spyfall_game(
    player_count: int = Query(..., gt=2, description="Oyuncu sayısı en az 3 olmalıdır."),
    db: AsyncSession = Depends(get_db_session)
):
    # Rastgele bir lokasyon seç
    query = select(Spyfall).order_by(func.random()).limit(1)
    result = await db.execute(query)
    location_data = result.scalar_one_or_none()
    
    if not location_data:
        raise HTTPException(status_code=404, detail="Lokasyon bulunamadı. Veritabanının seed edildiğinden emin olun.")

    # Rolleri karıştır ve dağıt
    available_roles = list(location_data.roles)
    # CASPUS rolünü listeden ayır (zaten mock veride var ama garantileyelim)
    spy_role = "CASPUS"
    if spy_role in available_roles:
        available_roles.remove(spy_role)
    
    # Oyuncu sayısına göre rollerden rastgele seç (casus hariç player_count - 1 kadar rol lazım)
    # Eğer rolden fazla oyuncu varsa roller tekrarlanabilir veya genel roller atanabilir
    selected_roles = []
    for i in range(player_count - 1):
        if available_roles:
            role = random.choice(available_roles)
            selected_roles.append(role)
            available_roles.remove(role) # Herkesin farklı rolü olsun (yettiği kadar)
        else:
            selected_roles.append("Sıradan Vatandaş") # Rol biterse yedek rol

    # Casusu rastgele bir pozisyona ekle
    final_players = []
    for role in selected_roles:
        final_players.append({"role": role, "location": location_data.location})
    
    # Rastgele birine casusluğu ver
    spy_index = random.randint(0, player_count - 1)
    final_players.insert(spy_index, {"role": spy_role, "location": "???"})
    
    # Listeyi sınırlı tut (insert ile player_count + 1 oldu)
    final_players = final_players[:player_count]

    return {
        "location": location_data.location,
        "players": final_players
    }
