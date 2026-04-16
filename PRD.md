\# 🏆 Master PRD: Social Game Hub AI (v1.0 - Hyper-Detailed)



\---



\## 1. Sistem Mimarisi ve Veri Akışı (Technical Blueprint)



MVP'nin başarısı, düşük gecikmeli (low-latency) bir iletişim katmanına bağlıdır.



\### 1.1. Teknoloji Yığını (Recommended Stack)



\* \*\*Mobile:\*\* React Native (Cross-platform performans ve hızlı iterasyon için)

\* \*\*Real-time Communication:\*\* Socket.io (WebSocket)



&#x20; \* Firebase Realtime DB, state yönetimi için yedek katman olarak kullanılacak

\* \*\*Backend:\*\*



&#x20; \* Node.js (Event-driven mimari)

&#x20; \* Alternatif: Python (FastAPI) — AI entegrasyon yoğunluğu artarsa

\* \*\*AI Engine:\*\*



&#x20; \* \*\*Primary:\*\* On-device STT



&#x20;   \* iOS: SFSpeechRecognizer

&#x20;   \* Android: SpeechRecognizer

&#x20; \* \*\*Secondary:\*\* OpenAI Whisper API (Gürültülü ortamlar için asenkron analiz)



\---



\### 1.2. State Management Logic



Oyunun her anı bir \*\*Finite State Machine (FSM)\*\* olarak yönetilmelidir:



```

LOBBY → ROLE\_ASSIGNMENT → GAME\_START → ROUND\_ACTIVE → PAUSE/OVERRIDE → ROUND\_END → SCOREBOARD

```



\---



\## 2. Derinlemesine Özellik Seti (Functional Deep-Dive)



\### 2.1. AI Referee (Anlat Bakalım Modu)



Sistemin sadece kelimeyi duyması yetmez, bağlamı anlaması gerekir.



\* \*\*VAD (Voice Activity Detection):\*\*

&#x20; Sürekli dinleme yerine sadece ses algılandığında (threshold > -40dB) işlemciyi tetikleme (pil tasarrufu)



\* \*\*Keyword Spotting:\*\*

&#x20; Yasaklı kelimeler ve hedef kelime için bir \*\*Set\*\* veri yapısı oluşturulur



\* \*\*Fuzzy Matching:\*\*

&#x20; Kullanıcı "Araba" yerine "Arabalar" derse, \*\*Levenshtein Distance\*\* kullanılır



&#x20; \* Kriter: `Distance ≤ 1` → İhlal sayılır



\* \*\*Manual Override Flow:\*\*

&#x20; AI ihlal tespit ettiğinde:



&#x20; \* 2 saniyelik \*\*"İptal Et"\*\* butonu çıkar

&#x20; \* Basılmazsa puan düşülür



\---



\### 2.2. Hibrit Bağlantı Protokolü (The Hybrid Flow)



| Senaryo            | Bağlantı Tipi        | Veri Senkronizasyonu                   |

| ------------------ | -------------------- | -------------------------------------- |

| Aynı Odada (Local) | Local Discovery / QR | Bir cihaz "Master", diğerleri "Client" |

| Uzaktan (Remote)   | Global WebSocket     | Merkezi socket sunucusu (AWS/Heroku)   |



\---



\## 3. Veri Modeli ve API Yapısı



\### 3.1. Room Object (JSON Schema)



```json

{

&#x20; "roomId": "XY72B1",

&#x20; "status": "active",

&#x20; "gameMode": "taboo\_ai",

&#x20; "config": { "timer": 60, "rounds": 5, "difficulty": "hard" },

&#x20; "players": \[

&#x20;   { "uid": "p1", "nick": "Furkan", "role": "cluer", "score": 12 },

&#x20;   { "uid": "p2", "nick": "AI\_Bot", "role": "referee", "status": "listening" }

&#x20; ],

&#x20; "currentTurn": {

&#x20;   "activePlayer": "p1",

&#x20;   "word": "Yapay Zeka",

&#x20;   "forbidden": \["Bilgisayar", "Kod", "Robot"]

&#x20; }

}

```



\---



\## 4. Kullanıcı Deneyimi ve Edge Cases (UX/UI)



\### 4.1. Kritik Hata Yönetimi



\* \*\*İnternet Kopması:\*\*

&#x20; Oyuncu 30 saniye içinde dönerse:



&#x20; \* Re-join mekanizması ile state geri yüklenir



\* \*\*Mikrofon İzni Reddi:\*\*



&#x20; \* Otomatik olarak \*\*"Manuel Hakem"\*\* moduna geçilir

&#x20; \* AI devre dışı kalır



\---



\### 4.2. Gamification \& Retention Logic



\* \*\*The "Squad" System:\*\*



&#x20; \* Haftalık liderlik tabloları

&#x20; \* Örnek: "En İyi Yazılımcı Grubu", "En İyi Futbolcular"



\* \*\*Dynamic Difficulty Scaling:\*\*



&#x20; \* Grup hızlıysa → daha zor kelimeler

&#x20; \* AI dinamik olarak zorluk artırır



\---



\## 5. Başarı Metrikleri (KPI)



Puanlama sadece "oynandı mı?" değil, "ne kadar keyif alındı?" üzerine kuruludur.



```

Engagement Score = (Total Session Time / Number of Rounds) × Viral Invites

```



\* \*\*Time to First Game (TTFG):\*\* < 45 saniye

\* \*\*AI Precision:\*\* > %92

\* \*\*Cross-Platform Latency:\*\* < 150ms



\---



\## 6. MVP Yol Haritası (Release Plan)



\* \*\*Hafta 1-2:\*\*

&#x20; Core Engine (Socket.io) + Lobi sistemi



\* \*\*Hafta 3-4:\*\*

&#x20; AI Referee (On-device STT) + "Anlat Bakalım"



\* \*\*Hafta 5-6:\*\*

&#x20; "Karanlık Şehir" + UI/UX cilalama



\* \*\*Hafta 7:\*\*

&#x20; Beta Test (100 kullanıcı) + Feedback



