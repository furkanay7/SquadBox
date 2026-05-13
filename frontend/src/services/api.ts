// IP adresini az önce Wi-Fi altından bulduğun IPv4 adresi ile değiştir!
const BASE_URL = 'http://192.168.1.103:8000/api/v1'; 

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