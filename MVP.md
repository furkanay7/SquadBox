# MVP (Minimum Geçerli Ürün) Kapsam Dokümanı

**Ürün Adı:** Social Game Hub[cite: 1]
**Aşama:** Faz 1 (MVP)[cite: 1]

---

## 1. MVP Hedefi
MVP sürümünün temel amacı, arkadaş gruplarının bir araya geldiğinde tek bir cihaz üzerinden, fiziksel materyal gerektirmeyen "Pass & Play" (elden ele) deneyimiyle oyun oynayabileceği temel mimariyi test etmektir[cite: 1]. Bu sürümde odak noktası, AI destekli dinamik içerik üretimi sayesinde geleneksel oyunların "içerik tüketimi" problemini çözmek ve kesintisiz bir deneyim sunmaktır[cite: 1].

## 2. Teknik Mimari
*   **Mobil Uygulama (Frontend):** Çapraz platform desteği ve akıcı animasyonlar sağlamak amacıyla React Native kullanılacaktır[cite: 1].
*   **Sunucu (Backend):** Asenkron yapısı ve AI entegrasyonlarına uygunluğu sebebiyle Python ve FastAPI tercih edilmiştir[cite: 1].
*   **Veritabanı:** Kullanıcı hesapları, satın almalar ve oyun ayarları için PostgreSQL; önbellekleme ve oyun içi aktif state'ler için Redis kullanılacaktır[cite: 1].

## 3. Geliştirilecek Epikler ve Özellikler

### Epik 1: Çekirdek Uygulama Mimarisi ve Arayüz (UI)[cite: 1]
*   Ana ekranda mevcut oyunların carousel veya grid yapısında listelenmesi sağlanacaktır[cite: 1].
*   Oyunlar arasında geçiş yapılırken oyuncu isimleri gibi state verilerinin korunması garanti altına alınacaktır[cite: 1].

### Epik 2: Oyun 1 - Anlat Bakalım (AI Destekli)[cite: 1]
*   Minimum 2 takımın oluşturulması ve isimlerinin belirlenmesi sağlanacaktır[cite: 1].
*   Klasik desteler veya "AI Modu" arasında seçim yapılabilecektir[cite: 1].
*   **AI Modu Akışı:** Kullanıcının girdiği konu başlığı (örn. "Doksanlar Pop") backend'e iletilecek, sistem promptuna enjekte edilecek ve LLM'den alınan yanıt güvenlik/uygunsuz içerik filtresinden geçirilerek JSON formatında mobile teslim edilecektir[cite: 1].
*   Yükleme esnasında ekranı eğlenceli animasyonlar süsleyecektir[cite: 1].
*   Oyun içi kontroller Doğru (Sağa Kaydır), Pas (Aşağı Kaydır) ve Tabu (Sola Kaydır) kaydırma hareketleri veya butonlar ile sağlanacaktır[cite: 1].
*   60 saniyelik zamanlayıcı ve tur sonu skor ekranı bulunacaktır[cite: 1].

### Epik 3: Oyun 2 - Spyfall[cite: 1]
*   Minimum 3, maksimum 10 kişilik oyuncu kurulumu ve isim giriş ekranı hazırlanacaktır[cite: 1].
*   Arka planda rastgele lokasyon ve casus ataması yapılacaktır[cite: 1].
*   **Pass & Play Gizlilik Mekaniği:** Ekranda "Telefonu [İsim]'e ver" uyarısı çıkacak ve kullanıcının rolünü veya lokasyonunu görmek için "Göster" butonuna basılı tutması gerekecektir; parmak çekildiğinde ekran gizlenecektir[cite: 1].
*   Oyun sonunda casusu oylama mekanizması, casus için lokasyon tahmin ekranı ve otomatik puanlama tablosu devreye girecektir[cite: 1].

## 4. Gelir Modeli ve Veri Toplama
*   **Monetizasyon:** Uygulama ücretsiz olarak indirilecek olup, 15-30 TL bandındaki Premium içerik paketleri (örn. "18+ Destesi", "Özel Lokasyonlar Paketi") tek seferlik uygulama içi satın alma (IAP) ile sunulacaktır[cite: 1]. Grubu temsilen tek bir kişinin satın alması yeterli olacaktır[cite: 1]. Satın alımlar backend üzerinden makbuz doğrulaması (receipt validation) ile korunacaktır[cite: 1].
*   **Reklam:** Oyun deneyimini bölmemek adına, yalnızca oyun tamamen bittiğinde (puan tablosu gösterilirken) veya yeni bir oyuna başlarken geçilebilir (skippable) reklamlar gösterilecektir[cite: 1].
*   **Telemetri:** Hangi kelimelerin çok hızlı bilindiği veya sürekli pas geçildiği gibi veriler, oyun dengesini optimize etmek, zorluk derecelerini belirlemek ve AI modelleri için veri etiketleme süreçlerinde kullanılmak üzere backend'e anonim olarak raporlanacaktır[cite: 1].