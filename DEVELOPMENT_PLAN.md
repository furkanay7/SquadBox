# SquadBox Geliştirme Planı

> **Proje:** SquadBox - AI Destekli Sosyal Oyun Platformu  
> **Versiyon:** 1.0 MVP  
> **Son Güncelleme:** 22 Nisan 2026

---

## 1. Mimari ve Teknoloji Yığını

### 1.1 Genel Mimari

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                              │
│  ┌─────────────────────┐    ┌─────────────────────┐           │
│  │   React Native      │    │   React Native      │           │
│  │   (iOS/Android)     │    │   (iOS/Android)     │           │
│  │                     │    │                     │           │
│  │  • Socket.io Client │    │  • Socket.io Client │           │
│  │  • On-device STT    │    │  • On-device STT    │           │
│  │  • Haptic Feedback  │    │  • Haptic Feedback  │           │
│  └──────────┬──────────┘    └──────────┬──────────┘           │
└─────────────┼──────────────────────────┼───────────────────────┘
              │                          │
              └──────────┬───────────────┘
                         │ WebSocket
              ┌──────────▼───────────────┐
              │    SOCKET.IO SERVER      │
              │    (Load Balanced)       │
              └──────────┬───────────────┘
                         │
┌────────────────────────┼──────────────────────────────────────┐
│                   BACKEND LAYER                                │
│  ┌─────────────────────▼─────────────────────────────────────┐  │
│  │                    FastAPI (Async)                         │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌──────────────────┐   │  │
│  │  │ Game Engine │  │ AI Referee  │  │ Room/Lobby Mgmt  │   │  │
│  │  │   (FSM)     │  │  Service    │  │    Service       │   │  │
│  │  └─────────────┘  └─────────────┘  └──────────────────┘   │  │
│  └────────────────────────┬──────────────────────────────────┘  │
└───────────────────────────┼───────────────────────────────────────┘
                           │
              ┌────────────┼────────────┐
              ▼            ▼            ▼
        ┌─────────┐  ┌─────────┐  ┌──────────┐
        │PostgreSQL│  │  Redis  │  │External  │
        │ (State)  │  │ (Cache) │  │AI APIs   │
        └─────────┘  └─────────┘  └──────────┘
```

### 1.2 Teknoloji Seçimleri

| Katman | Teknoloji | Açıklama |
|--------|-----------|----------|
| **Frontend** | React Native 0.73+ | Cross-platform mobil (iOS/Android) |
| **State Mgmt** | Zustand / Redux Toolkit | Client-side oyun durumu yönetimi |
| **Navigation** | React Navigation 6+ | Ekran geçişleri ve deep linking |
| **Backend** | FastAPI 0.104+ | Async Python web framework |
| **ORM** | SQLModel | Pydantic + SQLAlchemy entegrasyonu |
| **Database** | PostgreSQL 15+ | Ana veri deposu |
| **Cache** | Redis 7+ | Session ve real-time state caching |
| **Real-time** | Socket.io 4.6+ | WebSocket tabanlı iletişim |
| **AI/STT** | Whisper API / On-device | Ses tanıma ve kelime analizi |
| **Testing** | Pytest / Jest | Unit ve integration testleri |
| **CI/CD** | GitHub Actions | Otomatik test ve deployment |

---

## 2. Proje Yapısı

```
App_Preneur/
├── .github/
│   └── workflows/
│       ├── backend-ci.yml
│       └── frontend-ci.yml
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                 # FastAPI uygulama girişi
│   │   ├── config.py               # Ortam değişkenleri
│   │   ├── api/
│   │   │   ├── __init__.py
│   │   │   ├── deps.py             # Bağımlılık enjeksiyonu
│   │   │   └── v1/
│   │   │       ├── __init__.py
│   │   │       ├── endpoints/
│   │   │       │   ├── rooms.py
│   │   │       │   ├── games.py
│   │   │       │   ├── players.py
│   │   │       │   └── health.py
│   │   │       └── router.py
│   │   ├── core/
│   │   │   ├── __init__.py
│   │   │   ├── events.py           # Startup/shutdown eventleri
│   │   │   └── logging.py
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   ├── room.py             # Pydantic + SQLModel modelleri
│   │   │   ├── player.py
│   │   │   ├── game.py
│   │   │   └── card.py
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   ├── room_service.py     # Oda yönetimi
│   │   │   ├── game_engine.py      # FSM oyun motoru
│   │   │   ├── ai_referee.py       # AI hakem servisi
│   │   │   └── card_generator.py   # LLM kelime üretimi
│   │   ├── socket/
│   │   │   ├── __init__.py
│   │   │   ├── manager.py          # Socket.io room yönetimi
│   │   │   └── handlers.py         # Event handler'lar
│   │   └── utils/
│   │       ├── __init__.py
│   │       ├── validators.py
│   │       └── exceptions.py
│   ├── tests/
│   │   ├── unit/
│   │   └── integration/
│   ├── alembic/                    # Database migrations
│   ├── requirements.txt
│   ├── pyproject.toml
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   ├── client.ts           # Axios/HTTP client
│   │   │   ├── rooms.ts
│   │   │   └── games.ts
│   │   ├── components/
│   │   │   ├── common/             # Button, Card, Input vb.
│   │   │   ├── game/               # Oyun bileşenleri
│   │   │   └── lobby/              # Lobi bileşenleri
│   │   ├── hooks/
│   │   │   ├── useSocket.ts        # Socket.io hook
│   │   │   ├── useGameState.ts     # Oyun durumu hook
│   │   │   └── useSpeech.ts        # Speech-to-text hook
│   │   ├── navigation/
│   │   │   └── AppNavigator.tsx
│   │   ├── screens/
│   │   │   ├── HomeScreen.tsx
│   │   │   ├── CreateRoomScreen.tsx
│   │   │   ├── JoinRoomScreen.tsx
│   │   │   ├── LobbyScreen.tsx
│   │   │   ├── TabooGameScreen.tsx
│   │   │   ├── VampireGameScreen.tsx
│   │   │   └── ScoreboardScreen.tsx
│   │   ├── services/
│   │   │   ├── socketService.ts
│   │   │   ├── speechService.ts
│   │   │   └── hapticService.ts
│   │   ├── store/
│   │   │   ├── index.ts
│   │   │   ├── slices/
│   │   │   │   ├── roomSlice.ts
│   │   │   │   ├── gameSlice.ts
│   │   │   │   └── playerSlice.ts
│   │   │   └── middleware/
│   │   ├── types/
│   │   │   ├── room.ts
│   │   │   ├── game.ts
│   │   │   └── api.ts
│   │   └── utils/
│   │       ├── constants.ts
│   │       └── helpers.ts
│   ├── tests/
│   ├── App.tsx
│   ├── app.json
│   ├── package.json
│   └── tsconfig.json
├── docs/
│   ├── API.md
│   ├── SOCKET_EVENTS.md
│   └── DEPLOYMENT.md
├── MVP.md
├── PRD.md
└── DEVELOPMENT_PLAN.md
```

---

## 3. Sprint Planı (8 Hafta)

### Sprint 1: Altyapı ve Temel Sistemler (Hafta 1-2)

#### Backend
- [ ] FastAPI proje yapılandırması
- [ ] PostgreSQL + SQLModel entegrasyonu
- [ ] Alembic migration sistemi
- [ ] Pydantic model tanımlamaları (Room, Player, Game)
- [ ] Temel API endpoint'leri (health check, versiyon)
- [ ] Socket.io server kurulumu ve bağlantı yönetimi
- [ ] Room oluşturma ve yönetim servisi
- [ ] 4 haneli oda kodu üretimi
- [ ] QR kod entegrasyonu (generation API)

#### Frontend
- [ ] React Native proje yapılandırması (TypeScript)
- [ ] Navigation stack kurulumu
- [ ] Redux Toolkit / Zustand store yapılandırması
- [ ] Axios HTTP client ve API servis katmanı
- [ ] Socket.io client entegrasyonu
- [ ] Giriş ekranları (Onboarding, Nickname girişi)
- [ ] Oda oluşturma ekranı
- [ ] Odaya katılma ekranı (kod/QR)
- [ ] Lobi ekranı (oyuncu listesi, hazır durumu)

#### DevOps
- [ ] GitHub Actions CI pipeline (lint, test)
- [ ] Docker containerization (backend)
- [ ] PostgreSQL ve Redis development ortamı

---

### Sprint 2: Oyun Motoru ve FSM (Hafta 2-3)

#### Backend
- [ ] Finite State Machine (FSM) implementasyonu
  - States: LOBBY → ROLE_ASSIGNMENT → GAME_START → ROUND_ACTIVE → PAUSE → ROUND_END → SCOREBOARD
- [ ] Oyun durumu geçiş validasyonları
- [ ] Turn-based sistem (sıra yönetimi)
- [ ] Puanlama sistemi
- [ ] Oyun konfigürasyon yönetimi (timer, rounds, difficulty)
- [ ] Real-time event broadcast (Socket.io)
- [ ] Oda durumu persistence (Redis)

#### Frontend
- [ ] GameState hook ve FSM entegrasyonu
- [ ] Oyun durumu UI gösterimi (state indicator)
- [ ] Timer bileşeni (countdown)
- [ ] Sıra göstergesi (turn indicator)
- [ ] Puan tahtası bileşeni
- [ ] Oyun modu seçimi ekranı
- [ ] Oyun ayarları (zorluk, round sayısı)

---

### Sprint 3: Yasaklı Kelime (Taboo AI) - Temel (Hafta 3-4)

#### Backend
- [ ] Kelime kartı modeli (hedef kelime + yasaklı kelimeler)
- [ ] Statik kelime paketleri (Genel, Yazılım, Futbol vb.)
- [ ] Kart dağıtma servisi
- [ ] Kart üretim servisi (LLM entegrasyonu için hazırlık)
- [ ] Anlatıcı/gösterici rol atama
- [ ] Zamanlayıcı ve round yönetimi

#### Frontend
- [ ] TabooGameScreen tasarımı
- [ ] Kart gösterme bileşeni (hedef + yasaklı kelimeler)
- [ ] "Doğru" ve "Pas" butonları
- [ ] Skor güncelleme animasyonları
- [ ] Round sonu ekranı
- [ ] Oyun sonu puan durumu

---

### Sprint 4: AI Hakem (AI Referee) (Hafta 4-5)

#### Backend
- [ ] Whisper API entegrasyonu (gürültülü ortam için)
- [ ] Ses analiz servisi mock (development)
- [ ] Keyword spotting algoritması
- [ ] Levenshtein Distance fuzzy matching
- [ ] İhlal tespit API'si (webhook/endpoint)
- [ ] İhlal kayıtları ve loglama

#### Frontend
- [ ] On-device Speech-to-Text (iOS: SFSpeechRecognizer, Android: SpeechRecognizer)
- [ ] Mikrofon izin yönetimi
- [ ] Ses algılama ve gönderme (Voice Activity Detection)
- [ ] Manual Override butonu (2 saniye timeout)
- [ ] İhlal uyarısı (görsel + haptic feedback)
- [ ] "Manuel Hakem" modu (AI devre dışı fallback)
- [ ] Noise cancellation optimizasyonu

---

### Sprint 5: Gizli Roller (Vampir-Köylü) (Hafta 5-6)

#### Backend
- [ ] Rol dağıtım algoritması (Vampir, Köylü, Doktor, Polis)
- [ ] Gizli rol atama (her oyuncuya özel)
- [ ] Gece/Gündüz döngüsü yönetimi
- [ ] Aksiyon toplama sistemi (oy verme, yetenek kullanma)
- [ ] Oyun sonuç hesaplama
- [ ] Sesli moderatör mesajları (TTS için hazırlık)

#### Frontend
- [ ] VampireGameScreen tasarımı
- [ ] Rol kartı gösterme (gizli, sadece ilgili oyuncu görür)
- [ ] Gece/Gündüz UI teması
- [ ] Oylama arayüzü
- [ ] Rol açıklama ekranları
- [ ] Oyun geçmişi ve log görüntüleme

---

### Sprint 6: Squads ve Sosyal Özellikler (Hafta 6-7)

#### Backend
- [ ] Squad (ekip) modeli ve CRUD
- [ ] Kalıcı grup oluşturma
- [ ] Grup üyelik yönetimi
- [ ] Grup içi istatistikler (enk iyi anlatıcı, en kurnaz vampir)
- [ ] Haftalık liderlik tablosu API'si
- [ ] Dynamic Difficulty Scaling algoritması

#### Frontend
- [ ] Squad oluşturma ve yönetim ekranları
- [ ] Davet bağlantısı paylaşımı
- [ ] Grup profili ve üye listesi
- [ ] İstatistik kartları ve grafikler
- [ ] Liderlik tablosu ekranı

---

### Sprint 7: Paket Market ve İçerik (Hafta 7)

#### Backend
- [ ] Kelime paketi modeli
- [ ] Hazır paketler (Trendler, Niche konular)
- [ ] Paket kategorileri API'si
- [ ] LLM entegrasyonu (OpenAI/Anthropic) dinamik kart üretimi
- [ ] Paket cache stratejisi

#### Frontend
- [ ] Paket market ekranı
- [ ] Kategori filtreleme
- [ ] Paket önizleme
- [ ] Paket seçimi ve oyun başlatma
- [ ] Trendler bölümü

---

### Sprint 8: Optimizasyon ve Beta (Hafta 7-8)

#### Backend
- [ ] Gecikme (latency) optimizasyonu (<150ms hedef)
- [ ] Load testing ve performans ayarları
- [ ] Re-join mekanizması (30 saniye reconnect window)
- [ ] Connection recovery
- [ ] Rate limiting ve güvenlik
- [ ] Logging ve monitoring (Prometheus/Grafana)

#### Frontend
- [ ] Offline mode desteği (kısa süreli)
- [ ] Connection status indicator
- [ ] Auto-reconnect mantığı
- [ ] Hata yönetimi ve retry mekanizmaları
- [ ] Performans optimizasyonu (React.memo, useMemo)
- [ ] Beta test için Analytics (Firebase/Amplitude)

#### QA & Launch
- [ ] Unit test coverage >%70
- [ ] Integration test'ler (Socket.io flow'ları)
- [ ] Beta test kullanıcıları (100 kullanıcı)
- [ ] Feedback toplama sistemi
- [ ] Bug fix ve son dokunuşlar

---

## 4. Veri Modelleri (Pydantic/SQLModel)

### 4.1 Room Model
```python
class RoomBase(SQLModel):
    room_code: str = Field(index=True, unique=True)  # 4 haneli: XY72
    status: RoomStatus = Field(default=RoomStatus.LOBBY)
    game_mode: GameMode
    config: GameConfig
    max_players: int = Field(default=8, ge=2, le=12)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    expires_at: datetime  # 24h TTL

class Room(RoomBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    players: List["Player"] = Relationship(back_populates="room")
    current_round: int = Field(default=0)
    current_turn_id: Optional[uuid.UUID] = None
    game_state: RoomStatus = Field(default=RoomStatus.LOBBY)

class RoomRead(RoomBase):
    id: uuid.UUID
    players: List["PlayerRead"]
    current_turn: Optional["PlayerRead"]
```

### 4.2 Player Model
```python
class PlayerBase(SQLModel):
    nickname: str = Field(max_length=20)
    is_host: bool = Field(default=False)
    is_ready: bool = Field(default=False)
    role: Optional[str] = None  # Oyun rolü (cluer, guesser, vampire...)
    score: int = Field(default=0)
    joined_at: datetime = Field(default_factory=datetime.utcnow)

class Player(PlayerBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    room_id: uuid.UUID = Field(foreign_key="room.id")
    room: Room = Relationship(back_populates="players")
    socket_id: Optional[str] = None
    is_connected: bool = Field(default=True)
    last_seen: datetime = Field(default_factory=datetime.utcnow)
```

### 4.3 Card Model (Taboo)
```python
class CardBase(SQLModel):
    target_word: str = Field(max_length=50)
    forbidden_words: List[str]  # 3-5 yasaklı kelime
    category: str  # Yazılım, Futbol, Genel...
    difficulty: DifficultyLevel

class Card(CardBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    created_by: Optional[str] = None  # "system" veya "llm"
    usage_count: int = Field(default=0)
```

---

## 5. Socket.io Event Yapısı

### Client → Server Events
| Event | Payload | Açıklama |
|-------|---------|----------|
| `room:create` | `{ game_mode, config }` | Yeni oda oluştur |
| `room:join` | `{ room_code, nickname }` | Odaya katıl |
| `room:leave` | `{}` | Odadan ayrıl |
| `room:ready` | `{ is_ready }` | Hazır durumu değiştir |
| `game:start` | `{}` | Oyunu başlat (host) |
| `game:action` | `{ action, data }` | Oyun aksiyonu (taboo:correct, taboo:pass, vampire:vote) |
| `speech:detected` | `{ transcript, confidence }` | AI Hakem için ses metni |
| `violation:override` | `{ override: true/false }` | İhlal iptal/onay |

### Server → Client Events
| Event | Payload | Açıklama |
|-------|---------|----------|
| `room:updated` | `RoomRead` | Oda durumu değişti |
| `player:joined` | `PlayerRead` | Yeni oyuncu katıldı |
| `player:left` | `{ player_id }` | Oyuncu ayrıldı |
| `game:started` | `{ initial_state }` | Oyun başladı |
| `game:state_changed` | `{ state, data }` | Oyun durumu değişti |
| `game:turn_changed` | `{ active_player_id, card }` | Sıra değişti |
| `game:score_updated` | `{ player_id, new_score }` | Skor güncellendi |
| `ai:violation_detected` | `{ word, confidence, cancel_timeout }` | AI ihlal tespit etti |
| `ai:status` | `{ is_listening, error }` | AI dinleme durumu |
| `error` | `{ code, message }` | Hata mesajı |
| `reconnect:state` | `{ room, game_state }` | Yeniden bağlantı durumu |

---

## 6. AI Hakem Akışı

```
┌──────────────┐     ┌─────────────────────┐     ┌──────────────────┐
│   Anlatıcı   │────▶│  On-device STT      │────▶│  WebSocket       │
│   Konuşuyor  │     │  (VAD activated)    │     │  speech:detected │
└──────────────┘     └─────────────────────┘     └────────┬─────────┘
                                                          │
                                                          ▼
┌──────────────┐     ┌─────────────────────┐     ┌──────────────────┐
│   Sonuç      │◀────│  İhlal Kararı       │◀────│  Keyword         │
│   (UI+Haptic)│     │  (Fuzzy Match)      │     │  Spotting        │
└──────────────┘     └─────────────────────┘     └──────────────────┘
         │
         │ 2sn timeout
         ▼
┌──────────────┐     ┌─────────────────────┐
│   Override   │────▶│  Puan Güncelleme    │
│   Butonu     │     │  (Eğer iptal edilmezse)
└──────────────┘     └─────────────────────┘
```

### AI Backend Processing (Whisper - Fallback)
```python
async def process_speech_segment(room_id: str, audio_data: bytes):
    # 1. Whisper API ile transcript al
    transcript = await whisper.transcribe(audio_data)
    
    # 2. Aktif kartın yasaklı kelimelerini al
    card = await get_active_card(room_id)
    forbidden = set(card.forbidden_words + [card.target_word])
    
    # 3. Fuzzy matching
    words = transcript.lower().split()
    for word in words:
        for forbidden_word in forbidden:
            if levenshtein_distance(word, forbidden_word) <= 1:
                return ViolationDetected(
                    detected_word=word,
                    matched_forbidden=forbidden_word,
                    confidence=0.92
                )
    
    return None
```

---

## 7. Güvenlik ve Performans Gereksinimleri

### 7.1 Güvenlik
- [ ] Input validation (Pydantic)
- [ ] Rate limiting (SlowAPI / Redis)
- [ ] Room code entropy (4 haneli = 10,000 kombinasyon, brute-force koruması)
- [ ] Socket authentication (JWT token)
- [ ] SQL injection koruması (SQLModel/parameterized queries)

### 7.2 Performans Hedefleri
| Metrik | Hedef | Ölçüm Metodu |
|--------|-------|--------------|
| API Response Time | <100ms p95 | Prometheus histogram |
| Socket Latency | <150ms | WebSocket ping/pong |
| STT Latency | <500ms | Client-side timing |
| Concurrent Rooms | 1000+ | Load test (k6/Artillery) |
| Reconnect Success | >99% | Analytics tracking |

### 7.3 Hata Yönetimi
```typescript
// Frontend Retry Strategy
const socketConfig = {
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  randomizationFactor: 0.5,
  timeout: 20000
};

// Backend Reconnect Window
RECONNECT_WINDOW_SECONDS = 30
```

---

## 8. Test Stratejisi

### 8.1 Unit Tests
```python
# Backend - Pytest
- test_room_service.py (oda oluşturma, katılma)
- test_game_engine.py (FSM durum geçişleri)
- test_ai_referee.py (fuzzy matching, ihlal tespiti)
- test_card_generator.py (kelime üretimi)
```

```typescript
// Frontend - Jest
- roomSlice.test.ts (Redux actions/reducers)
- useGameState.test.ts (Custom hooks)
- socketService.test.ts (Socket event handling)
```

### 8.2 Integration Tests
```python
# Socket Flow Testing
- test_socket_flow.py (tam oyun senaryoları)
- test_reconnect.py (bağlantı kopma ve recovery)
- test_hybrid_mode.py (fiziksel + online oyuncular)
```

### 8.3 E2E Tests
- Maestro / Detox ile kritik kullanıcı yolları:
  - Onboarding → Oda oluşturma → Oyuna katılma → Oyun oynama
  - Reconnect senaryosu
  - Background/foreground geçişleri

---

## 9. Deployment Planı

### 9.1 Infrastructure (AWS Önerisi)
| Servis | Kullanım |
|--------|----------|
| ECS/Fargate | FastAPI backend containers |
| RDS PostgreSQL | Ana veritabanı |
| ElastiCache Redis | Session cache |
| Application Load Balancer | HTTP + WebSocket desteği |
| S3 + CloudFront | Static assets (eğer gerekirse) |
| CloudWatch | Monitoring ve alerting |

### 9.2 CI/CD Pipeline
```yaml
# .github/workflows/backend-deploy.yml
1. Lint (ruff, black)
2. Unit Tests (pytest)
3. Integration Tests (pytest with test DB)
4. Build Docker Image
5. Push to ECR
6. Deploy to ECS
```

---

## 10. Başarı Metrikleri (KPI) Takibi

| KPI | Hedef | Takip Metodu |
|-----|-------|--------------|
| D1 Retention | >40% | Firebase Analytics |
| D7 Retention | >20% | Firebase Analytics |
| Time to First Game | <45 saniye | Custom event tracking |
| AI Precision | >92% | Manual validation sampling |
| Avg. Session Duration | >15 dakika | Firebase Analytics |
| Viral Invites / Room | >2 | `room:join` invite attribution |
| Hybrid Mode Usage | >30% | Game mode tracking |
| Crash-Free Sessions | >99% | Crashlytics |

---

## 11. Riskler ve Mitigasyonlar

| Risk | Olasılık | Etki | Mitigasyon |
|------|----------|------|------------|
| STT doğruluk düşüklüğü (gürültü) | Orta | Yüksek | On-device + Whisper fallback, Manual override |
| Socket.io ölçeklenebilirlik | Düşük | Yüksek | Redis Adapter, horizontal scaling |
| LLM maliyetleri | Orta | Orta | Caching, rate limiting, statik paketler |
| Cross-platform uyumsuzluk | Orta | Orta | Expo/React Native best practices, device testing |
| Beta feedback negatif | Düşük | Yüksek | Erken feedback toplama, pivot hazırlığı |

---

## 12. Özet ve Sonraki Adımlar

### Hemen Yapılacaklar
1. **Repo yapılandırması** - Backend ve frontend dizinlerini oluştur
2. **Development environment** - Docker Compose (PostgreSQL + Redis)
3. **Sprint 1 başlangıcı** - FastAPI ve React Native kurulumu

### Kritik Başarı Faktörleri
- **Gecikme:** Socket.io optimizasyonu ve Redis cache
- **AI Doğruluk:** On-device STT + Manual override kombinasyonu
- **UX:** <45 saniye time-to-first-game

### Önerilen İlk Adım
Backend ve frontend için paralel geliştirme başlat. İlk hedef: **Lobi sistemi + Socket.io bağlantısı çalışan bir demo**.

---

*Bu plan MVP.md, PRD.md ve .windsurfrules dosyalarına dayanarak oluşturulmuştur. Sprint süreleri esnek olup, geliştirme sırasında gerektiğinde ayarlanabilir.*
