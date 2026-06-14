# Progress Log

## Proje Özeti
**SquadBox** — Arkadaş grupları için AI destekli çok oyunlu parti oyunları platformu.

---

## Faz 1: Planlama ve Mimari (Mayıs 2026 - Başlangıç)

### Yapılanlar
- PRD.md, MVP.md ve DEVELOPMENT_PLAN.md dokümanları oluşturuldu
- React Native + FastAPI + PostgreSQL tech stack kararı alındı
- Modüler router yapısı tasarlandı
- Pass & Play mekanizması konsept olarak belirlendi

### Kararlar
- **Neden React Native?** Cross-platform destek, tek kod tabanı
- **Neden FastAPI?** Asenkron yapı, AI API çağrıları için ideal
- **Neden PostgreSQL?** Structured data, JSON column desteği

---

## Faz 2: Backend Geliştirme

### Yapılanlar
- FastAPI uygulama iskelet kurulumu
- SQLAlchemy async engine ve session factory kurulumu
- Taboo ve Spyfall modelleri oluşturuldu
- `/api/v1/taboo` ve `/api/v1/spyfall` router'ları yazıldı
- Seed data scripti hazırlandı
- PostgreSQL bağlantısı test edildi

### Hatalar ve Çözümler
- **Import path sorunu:** Railway deploy sırasında `backend.module` yerine direkt `module` import'u gerekti
- **Virtual environment sorunu:** `.venv` klasörü bozuk, yeni `venv` oluşturuldu
- **asyncpg sürüm uyumsuzluğu:** requirements.txt güncellendi

---

## Faz 3: Frontend Geliştirme

### Yapılanlar
- React Navigation stack kurulumu (AppFixed.tsx)
- HomeScreen — carousel oyun listesi
- SetupScreen — oyuncu girişi, takım isimleri, oyun ayarları
- TabooGameScreen — timer, skor takibi, takım sistemi
- SpyfallRoleScreen — hold-to-reveal mekaniği, oylama
- TabooTurnIntroScreen → TabooGameScreen içine entegre edildi

### Kararlar
- **Pass & Play:** Tek cihaz üzerinden tüm oyuncular oynayabilir
- **Hold-to-Reveal:** Spyfall'da parmak basılı tutunca rol görünür, çekilince gizlenir

---

## Faz 4: AI Entegrasyonu

### Yapılanlar
- OpenAI GPT-4o-mini entegrasyonu (Gemini rate limit sorunları nedeniyle geçildi)
- `/api/v1/ai/generate/taboo` endpoint'i
- `/api/v1/ai/generate/spyfall` endpoint'i
- `/api/v1/ai/generate/whoisit` endpoint'i
- `/api/v1/ai/generate/truefalse` endpoint'i
- `/api/v1/ai/generate/songguess` endpoint'i
- `/api/v1/ai/generate/category` endpoint'i
- `/api/v1/ai/generate/werewolf` endpoint'i
- SetupScreen'e AI modu eklendi (konu girişi, loading state)

### Kararlar
- **Neden GPT-4o-mini?** Düşük maliyet, yeterli kalite, hızlı yanıt
- **JSON response_format:** Structured output garantisi için kullanıldı
- **Moderasyon katmanı:** JSON parse hatalarına karşı try-catch zinciri

---

## Faz 5: Deploy

### Yapılanlar
- Railway'e backend deploy edildi
- Railway PostgreSQL servisi oluşturuldu
- Environment variables (DATABASE_URL, OPENAI_API_KEY) Railway'e eklendi
- Import path'leri Railway ortamına göre düzenlendi
- Seed data Railway konsolundan yüklendi
- Public URL: `squadbox-production.up.railway.app`

### Hatalar ve Çözümler
- **ModuleNotFoundError 'backend':** Root directory `/backend` ayarı ile çözüldü
- **DATABASE_URL eksik:** Railway Variables'a eklendi
- **Duplicate key seed hatası:** Her item için existence check eklendi

---

## Faz 6: Yeni Oyunlar

### Eklenen Oyunlar
1. **Ben Kimim?** — Klasik mod (arkadaşlar karakter yazar) + AI modu + tur sistemi
2. **Doğru mu Yanlış mı?** — Klasik mod (DB sorular) + AI modu + zorluk seçimi + soru sayısı
3. **Kategori Yarışması** — Klasik mod (DB kategoriler) + AI modu + kelime validasyonu
4. **Şarkı Bul** — Klasik kategoriler + AI modu

### Veritabanı Genişletme
- `truefalse` tablosu oluşturuldu (kolay/orta/zor sorular)
- `category` tablosu oluşturuldu (8 kategori, 30-40 kelime her biri)
- Taboo kelime havuzu 114'ten 300'e çıkarıldı

---

## Faz 7: Oyun İyileştirmeleri

### Düzeltmeler
- Tabu takım sırası düzeltildi (A1→B1→A2→B2 sırası)
- Tabu klasik modda kelime tekrarı engellendi (tüm kelimeler önceden yüklenir)
- Spyfall tahmin akışı güncellendi (casus → lokasyon tahmin sırası)
- Ben Kimim tur sistemi eklendi
- Doğru/Yanlış soru sayısı ayarlanabilir hale getirildi
- Kategori Yarışması geçersiz kelime kontrolü eklendi

---

## Bilinen Eksikler ve Sonraki Adımlar

### Backlog
- Codenames oyunu (karmaşık grid sistemi nedeniyle ertelendi)
- Vampir Köylü (moderatörsüz oynama zorluğu nedeniyle ertelendi)
- EAS Build ile gerçek mobil uygulama build'i
- App Store / Play Store yayını
- Telemetri ve kelime istatistikleri
- Kullanıcı hesapları ve oturum yönetimi
- Çoklu cihaz senkronizasyonu (WebSocket)
- Sesli hakem özelliği (mikrofon + AI)



---

## Faz 8: Son İyileştirmeler ve Teslim Hazırlığı

### Yapılanlar
- Tabu Setup ekranında takım A/B oyuncu ayrımı görsel olarak gösterildi
- Tabu sıra sistemi tamamen yeniden yazıldı (A1→B1→A2→B2 doğru sıra)
- Tabu kelime hazinesi 300 kelimeye çıkarıldı (AI ile üretildi)
- Tabu oturum boyunca kelime tekrarı engellendi (`/taboo/all` endpoint'i eklendi)
- Tabu negatif skor desteği eklendi
- Tabu oyuncu bazlı istatistikler eklendi (doğru/pas/tabu sayıları)
- Spyfall tahmin akışı güncellendi (tek buton → casus tahmin → lokasyon tahmin)
- Ben Kimim tur sistemi eklendi (1/2/3/5 tur seçimi)
- Doğru/Yanlış soru sayısı kurulum ekranından ayarlanabilir hale getirildi
- Doğru/Yanlış ve Kategori klasik modları veritabanına taşındı
- `truefalse` ve `category` tabloları oluşturuldu, seed data eklendi
- Kategori Yarışması kurulum ekranında kategoriler DB'den çekilerek listelendi
- Yeniden Oyna butonu Setup ekranına yönlendirecek şekilde güncellendi
- Tüm belgeler tamamlandı (README, tech-stack, DesignSystem, Progress)

### Kararlar
- **Frontend'de sabit veri yok:** Tüm klasik mod verileri DB'den çekiliyor
- **prodocs klasörü:** AI ajan referans dosyaları proje kökünden kopyalandı