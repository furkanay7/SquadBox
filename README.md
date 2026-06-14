# SquadBox 🎮

Arkadaş grupları için AI destekli çok oyunlu parti oyunları platformu. Tek cihaz üzerinden Pass & Play deneyimiyle beş farklı oyun oynayın.

## Oyunlar

- 🃏 **Anlat Bakalım (Tabu)** — Yasak kelimeleri kullanmadan anlat. AI modu ile kendi konunu seç.
- 🕵️ **Spyfall** — Kim casus? Lokasyonu bul veya gizli rolünü sakla.
- 🎭 **Ben Kimim?** — Alnındaki kartı tahmin et. AI modu ile sonsuz karakter.
- ✓✗ **Doğru mu Yanlış mı?** — AI'ın ürettiği sorulara cevap ver. Kolay, orta, zor modlar.
- 🎯 **Kategori Yarışması** — Sırayla kelime söyle, tekrar edersen elenisin!

## Canlı URL

**Backend API:** https://squadbox-production.up.railway.app

**API Docs:** https://squadbox-production.up.railway.app/docs

## Kurulum

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
source venv/bin/activate  # Mac/Linux
pip install -r requirements.txt
```

`.env` dosyası oluştur:
DATABASE_URL=postgresql+asyncpg://kullanici:sifre@localhost/dbadi
OPENAI_API_KEY=

Veritabanını başlat:
```bash
python -m backend.seed_data
```

Sunucuyu başlat:
```bash
cd ..
python -m uvicorn backend.main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npx expo start
```

Expo Go uygulamasını telefonuna indir ve QR kodu tara.

## Mimari
SquadBox/

├── frontend/          # React Native + Expo

│   └── src/

│       ├── screens/   # Oyun ekranları

│       ├── services/  # API çağrıları

│       └── theme/     # Renk ve stil sistemi

├── backend/           # Python + FastAPI

│   ├── api/v1/

│   │   └── endpoints/ # taboo, spyfall, ai, truefalse, category

│   ├── models.py      # SQLAlchemy modelleri

│   ├── database.py    # DB bağlantısı

│   └── seed_data.py   # Veri yükleme scripti

└── prodocs/           # AI ajan referans dosyaları

## Tech Stack

| Katman | Teknoloji |
|--------|-----------|
| Frontend | React Native, Expo, TypeScript |
| Backend | Python, FastAPI, SQLAlchemy |
| Veritabanı | PostgreSQL |
| AI | OpenAI GPT-4o-mini |
| Deploy | Railway |

## Environment Variables

```env
DATABASE_URL=postgresql+asyncpg://...
OPENAI_API_KEY=sk-proj-...
```

Gerçek değerler için `.env.example` dosyasına bakın.