# Design System

## Renk Paleti

### Ana Renkler
- **Primary:** `#6366F1` (İndigo) — Ana butonlar, aktif elementler, Tabu oyunu
- **Success:** `#10B981` (Yeşil) — Doğru cevap, onay butonları
- **Error:** `#EF4444` (Kırmızı) — Tabu butonu, hata durumları, Takım A aksanı
- **Warning:** `#F59E0B` (Sarı/Amber) — Pas sayacı, uyarılar, ipuçları

### Oyun Renkleri
- **Tabu:** `#6366F1` (İndigo)
- **Spyfall:** Secondary renk paleti
- **Ben Kimim?:** `#E11D48` (Kırmızı-Pembe)
- **Doğru mu Yanlış mı?:** `#D97706` (Amber)
- **Kategori Yarışması:** `#0891B2` (Cyan)
- **Şarkı Bul:** `#0891B2` (Cyan)

### Arka Plan Renkleri
- **Primary BG:** `#0F172A` (Koyu Lacivert) — Ana ekran arka planı
- **Secondary BG:** `#1E293B` — Kart ve bileşen arka planları
- **Tertiary BG:** `#334155` — Pasif butonlar, ayırıcılar

### Metin Renkleri
- **Primary Text:** `#F8FAFC` — Ana içerik metni
- **Secondary Text:** `#94A3B8` — Yardımcı metinler
- **Disabled Text:** `#64748B` — Pasif elementler
- **Hint Text:** `#F59E0B` — İpucu metinleri

### AI Modu Rengi
- **AI Green:** `#10B981` — AI modu border ve aksanları
- **AI BG:** `#022C22` — AI modu arka planı

## Tipografi

### Font Büyüklükleri
- **Başlık (XL):** 48px — Timer, büyük sayılar
- **Başlık (L):** 36-44px — Oyun başlıkları, kart değerleri
- **Başlık (M):** 28-32px — Ekran başlıkları
- **Başlık (S):** 22-26px — Alt başlıklar
- **Body (L):** 18-20px — Önemli içerik metni
- **Body (M):** 16px — Standart metin, buton yazıları
- **Body (S):** 14px — Yardımcı metinler, ipuçları
- **Caption:** 11-13px — Etiketler, küçük bilgiler

### Font Ağırlıkları
- **Bold (700):** Başlıklar, buton yazıları, önemli değerler
- **SemiBold (600):** Alt başlıklar, vurgulu metinler
- **Medium (500):** Yasak kelimeler
- **Regular (400):** Normal içerik

## Bileşen Kuralları

### Butonlar
- **Primary Button:** `#6366F1` arka plan, beyaz metin, 10-15px border radius, 14-18px padding
- **Secondary Button:** `#334155` arka plan, beyaz metin
- **Danger Button:** `#EF4444` arka plan (Tabu, silme)
- **Success Button:** `#10B981` arka plan (Doğru, onay)
- **Disabled State:** `opacity: 0.5-0.6`

### Kartlar
- **Oyun Kartı (Ana Ekran):** Border radius 24px, shadow, oyuna özel renk
- **Kelime Kartı (Tabu):** Beyaz arka plan, border radius 20px, büyük gölge
- **Bilgi Kartı:** `#1E293B` arka plan, border radius 12-15px, 2px border

### Input Alanları
- **Standart Input:** `#1E293B` arka plan, `#334155` border, border radius 10px
- **Büyük Input (Ben Kimim):** 24px font, kalın border, merkezi hizalama
- **Aktif Input:** `#6366F1` veya oyuna özel renk border

### Badge ve Chip'ler
- **Takım Badge:** border radius 20px, aktif/pasif durumlar
- **Oyuncu Chip:** Küçük, kompakt tasarım
- **AI Badge:** Yeşil border ve arka plan

## Boşluk ve Layout
- **Ekran Padding:** 20px yatay
- **Bileşen Gap:** 8-15px arası
- **Section Margin:** 20-25px alt boşluk
- **Fixed Footer:** Absolute position, bottom 0, 40px alt padding (iOS safe area)
- **Header Padding Top:** 50-60px (status bar için)

## İkonlar ve Emojiler
Uygulama boyunca sistem emojileri kullanılmaktadır:
- 🎮 Oyun başlangıç
- 🏆 Kazanan/Puan tablosu
- 🤖 AI modu
- ⏰ Süre
- 🎯 Sıra göstergesi
- 👑 Birinci
- ✓ / ✗ Doğru/Yanlış