// IP adresini az önce Wi-Fi altından bulduğun IPv4 adresi ile değiştir!
const BASE_URL = 'https://enlarging-sash-unwed.ngrok-free.dev/api/v1'; 

export const fetchRandomTabooWord = async () => {
    try {
        const response = await fetch(`${BASE_URL}/taboo/random`);
        if (!response.ok) {
            throw new Error('Ağ yanıtı hatalı');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Tabu kelimesi çekilirken hata oluştu:", error);
        return null;
    }
};

export const fetchSpyfallStart = async (playerCount: number) => {
    try {
        // Backend'e oyuncu sayısını (player_count) gönderiyoruz ki rolleri ona göre ayarlasın
        const response = await fetch(`${BASE_URL}/spyfall/start?player_count=${playerCount}`);
        if (!response.ok) {
            throw new Error('Ağ yanıtı hatalı');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Spyfall verisi çekilirken hata oluştu:", error);
        return null;
    }
};

export const generateAITabooCards = async (topic: string, count: number = 20) => {
    try {
        const response = await fetch(`${BASE_URL}/ai/generate/taboo`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ topic, count }),
        });
        if (!response.ok) throw new Error('AI isteği başarısız');
        const data = await response.json();
        return data.cards;
    } catch (error) {
        console.error("AI kart üretimi hatası:", error);
        return null;
    }
};

export const generateAISpyfallLocations = async (theme: string, count: number = 6) => {
    try {
        const response = await fetch(`${BASE_URL}/ai/generate/spyfall`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ theme, count }),
        });
        if (!response.ok) throw new Error('AI isteği başarısız');
        const data = await response.json();
        return data.locations;
    } catch (error) {
        console.error("AI Spyfall üretimi hatası:", error);
        return null;
    }
};