\# 🚀 MVP Kapsam Dokümanı: Social Game Hub AI



\*\*Proje Adı:\*\* Social Game Hub AI (Geçici İsim)  

\*\*Ürün Sahibi:\*\* Furkan Ay \& Product Developer AI  

\*\*Versiyon:\*\* 1.0 (MVP)  

\*\*Durum:\*\* Planlama Aşamasında  



\---



\## 1. Ürün Vizyonu \& Hedef

Fiziksel kutu oyunlarının "kelime tekrarı", "kural tartışması" ve "yönetici (moderatör) gereksinimi" gibi kronik sorunlarını teknolojiyle çözmek. Hem aynı fiziksel ortamdaki arkadaş gruplarına hem de uzaktaki kullanıcılara (Online/Hibrit) kesintisiz, adil ve sonsuz içerikli bir eğlence platformu sunmak.



\---



\## 2. Kullanıcı Segmentasyonu (Target Audience)

\* \*\*Fiziksel Partiler:\*\* Evde toplanan, kutu oyunu olmayan veya mevcut oyunlardan sıkılan kalabalık arkadaş grupları.

\* \*\*Uzaktan Sosyalleşenler:\*\* Discord, Zoom veya WhatsApp üzerinden "Hadi bir şeyler oynayalım" diyen online ekipler.

\* \*\*Niche İlgi Grupları:\*\* Yazılımcılar, futbol tutkunları gibi genel kelimelerden ziyade kendi dünyalarına ait içerik arayanlar.



\---



\## 3. Hibrit Oyun Modelleri (Hybrid Architecture)



| Mod | Senaryo | Teknoloji / Gereksinim |

| :--- | :--- | :--- |

| \*\*Local Play (Fiziksel)\*\* | Tek telefon elden ele geçer veya ana cihaz TV'ye yansıtılır. | Cihaz içi sensörler ve AI ses işleme. |

| \*\*Online Play (Remote)\*\* | Her oyuncu kendi cihazından odaya katılır. | Real-time Socket.io / Firebase senkronizasyonu. |

| \*\*Hibrit Mod\*\* | Bir grup fiziksel olarak bir arada, bazı kişiler online bağlı. | Paylaşımlı Lobi Sistemi (Shared Lobby). |



\---



\## 4. MVP Özellik Seti (Must-Haves)



\### 4.1. Çekirdek Oyun Mekanikleri

\* \*\*Oyun 1: Yasaklı Kelime (Tabu Tarzı):\*\* \* \*\*AI Sesli Hakem:\*\* Anlatıcı yasaklı kelimeyi söylediğinde mikrofon üzerinden tespit ve "Bip" uyarısı.

&#x20;   \* \*\*Dinamik Kartlar:\*\* LLM (Large Language Model) destekli, asla tekrara düşmeyen kelime çiftleri.

\* \*\*Oyun 2: Gizli Roller (Vampir-Köylü Tarzı):\*\*

&#x20;   \* \*\*Dijital Moderatör:\*\* Gece/Gündüz döngüsünü sesli yönetir, rolleri gizli olarak telefonlara dağıtır.



\### 4.2. Teknik Altyapı

\* \*\*Lobi ve Oda Sistemi:\*\* 4 haneli oda kodu veya QR kod ile hızlı giriş.

\* \*\*Dinamik Paket Market:\*\* Yazılım, Futbol, Sanat gibi hazır kelime paketleri seçicisi.

\* \*\*Sıfır Sürtünme Onboarding:\*\* Hesap oluşturma zorunluluğu olmadan, takma adla saniyeler içinde oyuna giriş.

\* \*\*Hibrit Senkronizasyon:\*\* Online modda tüm oyuncuların ekranının milisaniyeler içinde güncellenmesi.



\### 4.3. UX / Kullanıcı Deneyimi

\* \*\*Haptik Geri Bildirim:\*\* Hata yapıldığında veya süre bittiğinde özel titreşim efektleri.

\* \*\*Manual Override:\*\* AI'ın yanlış anladığı durumlarda hakem yetkisini kullanıcıya veren buton.

\* \*\*Hızlı Geçiş:\*\* Bir oyun bittiğinde puanları koruyarak farklı bir oyun moduna saniyeler içinde geçebilme.



\---



\## 5. Elde Tutma (Retention) ve Sosyal Faktörler

\* \*\*Squads (Ekipler):\*\* Arkadaş gruplarının isimleriyle (örn: "Sakarya Bilgisayar Ekibi") kalıcı grup kurabilmesi.

\* \*\*Grup Liderlik Tablosu:\*\* O grubun kendi içindeki "En İyi Anlatıcı", "En Kurnaz Vampir" istatistiklerinin tutulması.

\* \*\*Haftalık Niche Paketler:\*\* Her hafta güncellenen "Trendler" paketi ile uygulamanın taze kalması.



\---



\## 6. Teknik Kısıtlar ve Varsayımlar

\* \*\*Ses İşleme:\*\* AI Hakem özelliği gürültülü ortamlarda çalışabilmesi için optimize edilmelidir (Noise Cancellation).

\* \*\*Gecikme (Latency):\*\* Online modda oyunun akışını bozmamak için gecikme <200ms olmalıdır.

\* \*\*Platform:\*\* MVP ilk aşamada Cross-Platform (React Native / Flutter) olarak tek kod tabanından çıkacaktır.



\---



\## 7. Başarı Metrikleri (KPIs)

1\.  \*\*Retention (D1 \& D7):\*\* Kullanıcının bir sonraki hafta sonu tekrar uygulamaya girmesi.

2\.  \*\*Viralite Katsayısı:\*\* Her bir odanın ortalama kaç yeni kullanıcıyı (arkadaş davetiyle) sisteme dahil ettiği.

3\.  \*\*Hibrit Oranı:\*\* Toplam oyunların ne kadarının "Online Mod" üzerinden oynandığı.

