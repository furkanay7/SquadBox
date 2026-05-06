# Social Game Hub - Development Plan (Faz 1: MVP)

**Belge Sürümü:** 1.0  
**Son Güncelleme:** 6 Mayıs 2026

---

## 1. Vizyon ve Kapsam

Social Game Hub, arkadaş gruplarının tek cihaz üzerinden Pass & Play (elden ele) deneyimiyle parti oyunları oynayabileceği bir platformdur. Faz 1 (MVP) kapsamında:

- **Anlat Bakalım (Tabu):** AI destekli dinamik içerik üretimi
- **Spyfall:** Gizli rol mekaniği
- **Çekirdek Mimari:** React Native + FastAPI

---

## 2. Backend Geliştirme Planı

### Bölüm 2.1: Temel Altyapı

| Adım | Görev | Dosya | Çıktı |
|------|-------|-------|-------|
| 2.1.1 | Modüler router yapısı | `main.py` | `APIRouter` kayıtları: `/api/tabu`, `/api/spyfall`, `/api/ai` |
| 2.1.2 | Pydantic modelleri | `models/tabu.py` | `TabuCard`, `TabuDeck`, `Team` |
| 2.1.3 | Pydantic modelleri | `models/spyfall.py` | `SpyfallLocation`, `SpyfallRole`, `Player` |
| 2.1.4 | Pydantic modelleri | `models/ai.py` | `AIGenerationRequest`, `AIGeneratedDeck` |

### Bölüm 2.2: Router Implementasyonları

| Adım | Endpoint | Dosya | İşlev |
|------|----------|-------|-------|
| 2.2.1 | `GET /health` | `routers/health.py` | Sağlık kontrolü |
| 2.2.2 | `POST /api/tabu/decks` | `routers/tabu.py` | AI destekli deste üretimi |
| 2.2.3 | `GET /api/tabu/classic` | `routers/tabu.py` | Klasik desteler listesi |
| 2.2.4 | `POST /api/spyfall/setup` | `routers/spyfall.py` | Oyun kurulumu (lokasyon + rol atama) |
| 2.2.5 | `GET /api/spyfall/locations` | `routers/spyfall.py` | Mevcut lokasyonlar |
| 2.2.6 | `POST /api/ai/generate/tabu` | `routers/ai.py` | LLM entegrasyonu endpoint'i |

### Bölüm 2.3: AI Servisi

| Adım | Görev | Dosya | Açıklama |
|------|-------|-------|----------|
| 2.3.1 | Prompt şablonları | `services/ai_prompts.py` | Tabu için sistem prompt şablonu |
| 2.3.2 | AI istemcisi | `services/ai_client.py` | LLM API çağrıları ve JSON parsing |
| 2.3.3 | Mock modu | `services/ai_client.py` | LLM olmadan test verisi üretimi |
| 2.3.4 | Moderasyon | `services/moderation.py` | JSON validasyon ve içerik kontrolü |

### Bölüm 2.4: Sabit Veriler

| Adım | Dosya | İçerik |
|------|-------|--------|
| 2.4.1 | `data/tabu_classic.json` | 50+ klasik Tabu kartı |
| 2.4.2 | `data/spyfall_locations.json` | 15+ lokasyon, her biri 5-7 rol |

---

## 3. Frontend Geliştirme Planı

### Bölüm 3.1: Altyapı ve Navigation

| Adım | Görev | Dosya | Açıklama |
|------|-------|-------|----------|
| 3.1.1 | Navigation kurulumu | `src/navigation/AppNavigator.tsx` | React Native Stack Navigator |
| 3.1.2 | Game Context | `src/contexts/GameContext.tsx` | Oyuncu isimleri ve aktif oyun state'i |
| 3.1.3 | API servisi | `src/services/api.ts` | Backend endpoint'lerine HTTP çağrıları |

### Bölüm 3.2: Ekranlar (Screens)

| Ekran | Dosya | İçerik |
|-------|-------|--------|
| Ana Ekran | `src/screens/HomeScreen.tsx` | Oyun listesi (Anlat Bakalım, Spyfall) |
| Tabu Setup | `src/screens/TabuSetupScreen.tsx` | Takım oluşturma, AI/klasik seçimi |
| Tabu Loading | `src/screens/TabuLoadingScreen.tsx` | AI üretim loading animasyonu |
| Tabu Game | `src/screens/TabuGameScreen.tsx` | 60s timer, kart gösterimi, skor takibi |
| Tabu Score | `src/screens/TabuScoreScreen.tsx` | Tur sonu skor tablosu |
| Spyfall Setup | `src/screens/SpyfallSetupScreen.tsx` | 3-10 oyuncu isim girişi |
| Spyfall Reveal | `src/screens/SpyfallRevealScreen.tsx` | Hold-to-reveal rol/lokasyon gösterimi |
| Spyfall Vote | `src/screens/SpyfallVoteScreen.tsx` | Casus oylama ve lokasyon tahmini |

### Bölüm 3.3: Bileşenler (Components)

| Bileşen | Dosya | Amaç |
|---------|-------|------|
| Button | `src/components/Button.tsx` | Büyük, erişilebilir butonlar (Pass & Play) |
| Timer | `src/components/Timer.tsx` | 60 saniye geri sayım |
| HoldToReveal | `src/components/HoldToReveal.tsx` | Basılı tutunca göster, çekince gizle |
| SwipeCard | `src/components/SwipeCard.tsx` | Tabu kartı (ana kelime + yasaklı kelimeler) |
| TeamCard | `src/components/TeamCard.tsx` | Takım skor ve bilgisi gösterimi |

### Bölüm 3.4: Hooks

| Hook | Dosya | İşlev |
|------|-------|-------|
| useTabuGame | `src/hooks/useTabuGame.ts` | Tabu oyun mantığı ve state yönetimi |
| useSpyfallGame | `src/hooks/useSpyfallGame.ts` | Spyfall oyun mantığı |
| useAI | `src/hooks/useAI.ts` | AI deste üretimi API çağrıları |

---

## 4. Oyun Mekanikleri Implementasyon Detayları

### 4.1 Anlat Bakalım (Tabu)

```
Kullanıcı Akışı:
1. Ana Ekran → Anlat Bakalım seç
2. Setup: Takım isimleri gir (min 2 takım)
3. Kategori: AI Modu veya Klasik Deste seç
4. Eğer AI Modu: Konu başlığı gir (örn. "Yazılımcı Jargonu")
5. Loading: AI deste üretimi (animasyonlu)
6. Oyun: 60 saniye süre, kartlar gösterilir
   - Doğru: Sağa kaydır veya buton → +1 puan
   - Pas: Aşağı kaydır veya buton → 0 puan
   - Tabu: Sola kaydır veya buton → -1 puan
7. Tur Sonu: Skor tablosu → Yeni tur veya bitir
```

**Teknik Detaylar:**
- Kart formatı: `{ "word": "ana_kelime", "taboo_words": ["yasak1", "yasak2", ...] }`
- AI Prompt: *"Sen bir parti oyunu kelime üreticisisin. Bana '{konu}' ile ilgili, JSON formatında 1 ana kelime ve 5 yasaklı kelime içeren 15 kartlık bir dizi ver."*
- Backend'de JSON parsing ve moderasyon katmanı zorunlu

### 4.2 Spyfall

```
Kullanıcı Akışı:
1. Ana Ekran → Spyfall seç
2. Setup: 3-10 oyuncu ismi gir
3. Başlat: Sistem rastgele lokasyon seçer ve casusu atar
4. Pass & Play: "Telefonu [İsim]'e ver" ekranı göster
5. Hold-to-Reveal: Her oyuncu basılı tutunca rolünü/lokasyonunu görür
6. Oyun: 8 dakika tartışma (harici zamanlayıcı)
7. Oylama: Herkes casus olduğunu düşündüğü kişiyi seçer
8. Casus Tahmini: Casus lokasyonu tahmin etmeye çalışır
9. Sonuç: Otomatik puanlama ekranı
```

**Teknik Detaylar:**
- Lokasyon formatı: `{ "name": "Hastane", "roles": ["Doktor", "Hemşire", "Hasta", ...] }`
- Casus ataması: Random seçim, backend'de yapılır
- Hold-to-Reveal: React Native `Pressable` ile `onPressIn`/`onPressOut` kullanımı

---

## 5. Bağımlılıklar

### Backend Requirements

```txt
fastapi==0.115.0
uvicorn[standard]==0.32.0
pydantic==2.9.0
httpx==0.27.0          # LLM API çağrıları için
python-dotenv==1.0.0   # Ortam değişkenleri
```

### Frontend Package.json

```json
{
  "dependencies": {
    "@react-navigation/native": "^7.0.0",
    "@react-navigation/native-stack": "^7.0.0",
    "react-native-screens": "~4.0.0",
    "react-native-safe-area-context": "~4.12.0",
    "axios": "^1.7.0"
  }
}
```

---

## 6. Önceliklendirme (Priority)

### P0 - MVP Kritik (Yapılmazsa çalışmaz)
1. Backend router yapılandırması (`main.py` + APIRouter)
2. Frontend navigation kurulumu
3. Tabu: Setup → Game → Score akışı (klasik deste ile)
4. Spyfall: Setup → Reveal → Vote akışı (sabit lokasyonlar ile)

### P1 - Önemli (Olması gereken)
5. AI deste üretimi endpoint'i
6. Loading animasyonları
7. Hold-to-reveal mekaniği

### P2 - Nice-to-have (Sonra yapılır)
8. Telemetri (kelime istatistikleri)
9. Lottie animasyonları
10. Hata boundary'leri

---

## 7. Dosya Referansları

- **PRD:** `PRD.md`
- **MVP:** `MVP.md`
- **Global Kurallar:** `.windsurfrules`
- **Frontend Kuralları:** `frontend/.windsurfrules`
- **Backend Kuralları:** `backend/.windsurfrules`
