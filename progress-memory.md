# Social Game Hub - Progress Memory

## Durum: 13 Mayıs 2026

### Yapılanlar
1. **Doküman Analizi:** PRD.md ve MVP.md dosyaları okundu, projenin genel amacı ve MVP kapsamı anlaşıldı.
2. **Frontend Analizi:** frontend/ klasör yapısı, ana uygulama dosyaları (`App.tsx`, `AppFixed.tsx`, `AppNew.tsx`), navigasyon, bileşenler, mock veriler ve tema ayarları incelendi. `AppFixed.tsx`'in ana giriş noktası olduğu belirlendi.
3. **Development Plan:** DEVELOPMENT_PLAN.md oluşturuldu (Faz 1 MVP kapsamı).
4. **Temizlik:** Önceki karışıklık giderildi, fazla klasörler silindi, temel dosyalar eski haline getirildi.

### Mevcut Proje Yapısı
- `backend/main.py` - SquadBox API (temel FastAPI yapısı)
- `backend/requirements.txt` - 3 temel paket
- `frontend/App.tsx` - Basit ekranları yönlendiren navigasyon akışı
- `frontend/AppFixed.tsx` - `package.json`'da tanımlı ana giriş noktası, daha gelişmiş ekran yönlendirmeleri içerir.
- `frontend/AppNew.tsx` - Minimal karşılama ekranı
- `frontend/package.json` - Temel Expo/React Native bağımlılıkları ve `main` alanında `AppFixed.tsx`'e referans
- `frontend/src/screens/` - Uygulama ekranları (HomeScreen, SetupScreen, TabooTurnIntroScreen, TabooGameScreen, SpyfallRoleScreen)
- `frontend/src/components/` - Yeniden kullanılabilir UI bileşenleri (GameCard, Header, PlayerInput, PrimaryButton)
- `frontend/src/mocks/` - Mock oyun verileri (spyfallLocations.json, tabooWords.json)
- `frontend/src/theme/theme.ts` - Uygulama tema ayarları
- `.windsurfrules` - Frontend geliştirme için best practice'ler ve mimari kuralları
- `DEVELOPMENT_PLAN.md` - Yeni oluşturuldu

### Sonraki Adımlar (P0 - Kritik)
1. Backend APIRouter yapılandırması (`/api/tabu`, `/api/spyfall`)
2. Frontend navigation kurulumu ve `AppFixed.tsx`'in kullanıldığından emin olunması
3. Tabu oyun akışı (klasik deste)
4. Spyfall oyun akışı (sabit lokasyonlar)

### Not
Backend çalışıyor ancak şu an sadece temel endpoint'ler var. Router modüllerinin eklenmesi gerekiyor. Frontend tarafında `AppFixed.tsx`'in `main` olarak ayarlanmış olması, MVP kapsamındaki ekranlar için doğru başlangıç noktası olacaktır.