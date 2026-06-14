# Tech Stack

## Genel Mimari
SquadBox, frontend ve backend'in birbirinden bağımsız çalıştığı bir mimari üzerine inşa edilmiştir. Backend, REST API olarak çalışmakta ve ileride farklı platformlara (web, iOS, Android) hizmet verebilecek şekilde tasarlanmıştır.

## Frontend
- **React Native + Expo** — Cross-platform mobil uygulama geliştirme. Tek kod tabanıyla hem iOS hem Android desteği sağlar.
- **TypeScript** — Tip güvenliği ve daha az hata için tercih edildi.
- **React Navigation** — Ekranlar arası geçiş ve navigation stack yönetimi.

## Backend
- **Python + FastAPI** — Asenkron yapısı sayesinde AI API çağrılarını bloke etmeden işler. Modüler router yapısıyla genişletilebilir mimari.
- **SQLAlchemy (Async)** — ORM katmanı; PostgreSQL ile asenkron iletişim.
- **Pydantic** — Request/Response validasyonu ve settings yönetimi.

## Veritabanı
- **PostgreSQL** — Tabu kelimeleri, Spyfall lokasyonları, Doğru/Yanlış soruları ve Kategori verileri için kullanılır.
- **Railway PostgreSQL** — Production ortamında managed PostgreSQL servisi.

## AI Entegrasyonu
- **OpenAI GPT-4o-mini** — Oyunlara özel dinamik içerik üretimi için kullanılır.
  - Tabu: Konuya özel kart üretimi (ana kelime + 5 yasak kelime)
  - Spyfall: Temaya özel lokasyon ve rol üretimi
  - Ben Kimim?: Konuya özel karakter listesi üretimi
  - Doğru mu Yanlış mı?: Konuya özel soru üretimi
  - Kategori Yarışması: Konuya özel kategori ve kelime listesi üretimi
  - Şarkı Bul: Kategoriye özel şarkı sözü üretimi

## Deploy
- **Railway** — Backend ve PostgreSQL veritabanı Railway'de host edilmektedir.
- **Expo Go** — Frontend demo için Expo Go uygulaması üzerinden QR kod ile erişilir.

## Geliştirme Sürecinde AI Kullanımı
Proje boyunca Windsurf, Gemini ve Claude yapay zeka asistanı aktif olarak kullanıldı:
- Kod yazımı ve hata ayıklama
- Mimari kararlar ve best practice önerileri
- Backend endpoint tasarımı
- Frontend component geliştirme
- Veritabanı seed data üretimi
- Prompt mühendisliği (AI içerik üretimi için sistem promptları)