# Product Requirements Document (PRD)

**Ürün Adı:** Social Game Hub (Geçici İsim)
**Belge Sürümü:** 1.0
**Durum:** Taslak / Geliştirme Öncesi (MVP)

---

## 1. Yönetici Özeti ve Vizyon
**Social Game Hub**, fiziksel kutu oyunlarına veya çok sayıda farklı mobil uygulamaya ihtiyaç duymadan, arkadaş gruplarının bir araya geldiğinde tek bir cihaz üzerinden sayısız parti oyununu oynayabileceği bir "Super App" platformudur. Ürünün temel vizyonu, AI destekli dinamik içerik üretimi sayesinde geleneksel oyunların "içerik tüketimi" problemini çözmek ve sürtünmesiz bir "Pass & Play" (elden ele) deneyimi sunmaktır.

## 2. Problem ve Çözüm
*   **Problem:** Arkadaş grupları sık sık aynı oyunları (Tabu, Spyfall) oynadıklarında kelime havuzları hızla tükenir. Her farklı oyun için yeni bir uygulama indirmek, reklamlarla boğuşmak veya premium üyeliklere zorlanmak kullanıcı deneyimini baltalar. Oyun yöneticisi (hakem) gerektiren oyunlarda bir kişi oyunun dışında kalır.
*   **Çözüm:** Tek bir React Native uygulaması içinde toplanmış modüler oyunlar. FastAPI ve LLM entegrasyonu ile sonsuz, kullanıcı tercihine (kategori/lokasyon) göre anında üretilen özelleştirilmiş veri setleri. Tek cihaz üzerinden yönetilen akıcı oyun döngüleri.

## 3. Hedef Kitle ve Kullanıcı Personaları
*   **Katalizör Kerem (24):** Arkadaş grubunu organize eden, yenilikleri takip eden kişi. Telefonuna uygulamayı indirir, premium paketleri genellikle o satın alır ve grubu oyuna o yönlendirir. Uygulamanın hızına ve içerik kalitesine önem verir.
*   **Sosyal Oyuncu Ayşe (22):** Rekabetçi ama kuralları öğrenmekle vakit kaybetmek istemeyen kullanıcı. Karmaşık UI/UX yerine hemen oyuna girmeyi ve eğlenmeyi hedefler.

## 4. MVP (Minimum Geçerli Ürün) Kapsamı ve Epikler

### Epik 1: Çekirdek Uygulama Mimarisi ve UI
*   **Kullanıcı Hikayesi (User Story):** Kullanıcı olarak, uygulamayı açtığımda karmaşık menüler görmeden doğrudan oynamak istediğim oyunu (Anlat Bakalım veya Spyfall) seçmek istiyorum.
*   **Gereksinimler:**
    *   Ana ekranda mevcut oyunların carousel veya grid yapısında listelenmesi.
    *   Oyunlar arası geçişte state'in (örneğin oyuncu isimlerinin) korunması.

### Epik 2: Oyun 1 - Anlat Bakalım (AI Destekli)
*   **Kullanıcı Hikayesi:** Kullanıcı olarak, standart kategoriler dışında kendi belirlediğim bir konuda (örn. "Yazılımcı Jargonu") takım arkadaşlarıma kelime anlatmak istiyorum.
*   **Gereksinimler:**
    *   **Takım ve Kategori Seçimi:** Min 2 takım oluşturulması. Klasik desteler veya "AI Modu" seçimi.
    *   **AI Modu Akışı:** Kullanıcı input girer -> Backend'e istek atılır -> Yükleme ekranı (eğlenceli animasyon) -> Oyun başlar.
    *   **Oyun Döngüsü:** Doğru (Sağa Kaydır), Pas (Aşağı Kaydır), Tabu (Sola Kaydır) veya butonlarla kontrol. 60 saniyelik zamanlayıcı ve tur sonu skor ekranı.

### Epik 3: Oyun 2 - Spyfall
*   **Kullanıcı Hikayesi:** Kullanıcı olarak, kendi rolümü veya lokasyonu telefon elden ele gezerken başkalarının yanlışlıkla görmesini engellemek istiyorum.
*   **Gereksinimler:**
    *   **Oyuncu Kurulumu:** Min 3, max 10 kişi. İsim giriş ekranı.
    *   **Pass & Play Mekaniği:** Ekranda "Telefonu [İsim]'e ver" yazar. Kullanıcı "Göster" butonuna **basılı tuttuğu sürece** rolünü/lokasyonunu görür, parmağını çektiğinde ekran kapanır.
    *   **Oyun Sonu Fazı:** Casusu oylama mekanizması. Casus için lokasyon tahmin ekranı ve otomatik puanlama.

---

## 5. Teknik Mimari ve Gereksinimler

Mevcut teknoloji yığını, esneklik, performans ve hızlı iterasyon için aşağıdaki gibi belirlenmiştir:

*   **Frontend (Mobil):** React Native (Cross-platform destek ve akıcı animasyonlar için).
*   **Backend:** Python & FastAPI.
    *   Asenkron yapısı sayesinde AI API'lerinden gelen yanıtları bloke etmeden işleme.
    *   AI modülleri için yazılacak manuel Python scriptlerinin ve veri manipülasyonlarının kolay entegrasyonu.
*   **Veritabanı:** PostgreSQL (Kullanıcı hesapları, satın almalar, oyun ayarları) & Redis (Oyun içi aktif state'ler ve önbellekleme).

### 5.1. AI ve Veri Boru Hattı (Pipeline)
Sistemin kalbi AI içerik üretimidir. Doğrudan API çağrısı yerine aşağıdaki boru hattı kullanılacaktır:
1.  **Girdi (Input):** Kullanıcının girdiği konu başlığı (örn. "Doksanlar Pop").
2.  **Sistem Promptu:** FastAPI tarafında, kullanıcının girdisi detaylı bir sistem promptuna enjekte edilir. (Örn: *Sen bir parti oyunu kelime üreticisisin. Bana 'Doksanlar Pop' ile ilgili, JSON formatında 1 ana kelime ve 5 yasaklı kelime içeren 15 kartlık bir dizi ver.*)
3.  **Moderasyon ve Ayrıştırma:** LLM'den gelen yanıt JSON parser ile ayrıştırılır. Güvenlik ve uygunsuz içerik filtresinden geçirilir.
4.  **Teslimat:** Veri istemciye (mobile) gönderilir.

### 5.2. Telemetri ve Loglama
Üretilen içeriğin kalitesini artırmak ve oyun dengesini kurmak için kullanıcıların oyundaki etkileşimleri loglanacaktır:
*   Hangi kelimelerin çok hızlı bilindiği veya sürekli "Pas" geçildiği backend'e anonim olarak raporlanır.
*   Bu veriler, ileride default veri setlerini optimize etmek, kelime zorluk derecelerini belirlemek ve özel AI modelleri için **veri etiketleme** (data labeling) süreçlerinde kullanılmak üzere saklanır.

---

## 6. Gelir Modeli (Monetizasyon)
*   **Freemium Temel:** Uygulama ve temel veri setleri (klasik Tabu destesi, temel Spyfall lokasyonları) ücretsizdir.
*   **Uygulama İçi Satın Alma (IAP):** "Premium Paketler" (örn. "18+ Destesi", "Özel Lokasyonlar Paketi") 15-30 TL bandında tek seferlik satın alınır. Cihazdaki bir kişinin alması tüm grubu kapsar. Satın alımlar backend üzerinden makbuz doğrulaması (receipt validation) ile korunur.
*   **Reklam Stratejisi:** Oyun deneyimini bölmemek esastır. Sadece oyun tamamen bittiğinde (puan tablosu gösterilirken) veya yeni bir oyuna başlarken geçilebilir (skippable) reklamlar (AdMob vb.) gösterilir.

---

## 7. Temel Performans Göstergeleri (KPI'lar)
Ürünün başarısını ölçmek için MVP sonrası takip edilecek metrikler:
*   **Oturum Süresi (Session Length):** Arkadaş gruplarının uygulamada geçirdiği ortalama süre. (Hedef: > 20 dakika).
*   **Oyunlar Arası Geçiş Oranı:** Aynı oturumda Tabu'dan Spyfall'a geçen kullanıcı yüzdesi. (Uygulamanın "Hub" değerini ölçer).
*   **AI Başarı Oranı:** AI tarafından üretilen kelime paketlerinin kullanıcı tarafından iptal edilmeden oynanma oranı.
*   **Dönüşüm Oranı (Conversion Rate):** Ücretsiz kullanıcıların Premium paket satın alma yüzdesi.

---

## 8. İleriye Dönük Yol Haritası (Roadmap)
*   **Faz 1 (MVP):** Anlat Bakalım + Spyfall + Temel AI Kategori Üretimi.
*   **Faz 2:** Yeni oyunların entegrasyonu (Vampir Köylü, Ben Kimim, Codenames). 
*   **Faz 3:** İsteğe bağlı mikrofon izni ile "Sesli Hakem" (AI tabanlı yasaklı kelime dinleme ve otomatik hata tespiti).
*   **Faz 4:** Ana cihaz (Host) ve mobil cihazların (Clients) bir oda kodu üzerinden eşleştiği çoklu cihaz senkronizasyonu.

