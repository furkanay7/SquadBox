import asyncio
import json
import os
from sqlalchemy import select
from backend.database import async_session_factory, async_engine, Base
from backend.models import Taboo, Spyfall

async def seed_data():
    base_path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    taboo_path = os.path.join(base_path, 'frontend', 'src', 'mocks', 'tabooWords.json')
    spyfall_path = os.path.join(base_path, 'frontend', 'src', 'mocks', 'spyfallLocations.json')

    with open(taboo_path, 'r', encoding='utf-8') as f:
        taboo_data = json.load(f)
    with open(spyfall_path, 'r', encoding='utf-8') as f:
        spyfall_data = json.load(f)

    async with async_session_factory() as session:
        # 1. Mevcut kelimeleri ve lokasyonları veritabanından çek (Hata almamak için)
        existing_words_res = await session.execute(select(Taboo.word))
        existing_words = set(existing_words_res.scalars().all())

        existing_locs_res = await session.execute(select(Spyfall.location))
        existing_locs = set(existing_locs_res.scalars().all())

        # 2. Tabu verilerini kontrol ederek ekle
        taboo_count = 0
        for item in taboo_data:
            if item['word'] not in existing_words:
                forbidden_list = item.get('forbidden') or item.get('forbidden_words')
                taboo = Taboo(
                    category="Genel",
                    word=item['word'],
                    forbidden_words=forbidden_list
                )
                session.add(taboo)
                taboo_count += 1
                existing_words.add(item['word']) # Aynı listede tekrar varsa ekleme

        # 3. Spyfall verilerini kontrol ederek ekle
        spyfall_count = 0
        for item in spyfall_data:
            if item['name'] not in existing_locs:
                spyfall = Spyfall(
                    location=item['name'],
                    roles=item['roles']
                )
                session.add(spyfall)
                spyfall_count += 1
                existing_locs.add(item['name'])

        if taboo_count > 0 or spyfall_count > 0:
            await session.commit()
            print(f"✅ İşlem Tamam: {taboo_count} yeni Tabu kelimesi ve {spyfall_count} yeni lokasyon eklendi.")
        else:
            print("ℹ️ Bilgi: Eklenecek yeni bir veri bulunamadı, tüm veriler zaten mevcut.")

if __name__ == "__main__":
    asyncio.run(seed_data())