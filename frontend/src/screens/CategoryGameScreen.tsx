import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  TextInput, ScrollView, Alert, ActivityIndicator,
} from 'react-native';
import { theme } from '../theme/theme';

interface CategoryGameScreenProps {
  navigation: any;
}

const CLASSIC_CATEGORIES = [
  'Türkiye Şehirleri',
  'Hayvanlar',
  'Meyveler',
  'Futbol Takımları',
  'Ülkeler',
  'Renk İsimleri',
  'Türk Yemekleri',
  'Meslekler',
];

const CLASSIC_WORD_LISTS: { [key: string]: string[] } = {
  'Türkiye Şehirleri': ['istanbul', 'ankara', 'izmir', 'bursa', 'antalya', 'adana', 'konya', 'gaziantep', 'şanlıurfa', 'mersin', 'kayseri', 'eskişehir', 'trabzon', 'samsun', 'malatya', 'gebze', 'erzurum', 'denizli', 'van', 'batman', 'elazığ', 'diyarbakır', 'sakarya', 'manisa', 'balıkesir', 'kocaeli', 'muğla', 'tekirdağ', 'hatay', 'kahramanmaraş'],
  'Hayvanlar': ['aslan', 'kaplan', 'fil', 'zürafa', 'penguen', 'köpek', 'kedi', 'at', 'inek', 'kuş', 'balık', 'yılan', 'timsah', 'ahtapot', 'köpekbalığı', 'kartal', 'baykuş', 'tavşan', 'ayı', 'kurt', 'tilki', 'maymun', 'goril', 'zebra', 'gergedan', 'hipopotam', 'deve', 'kanguru', 'koala', 'panda'],
  'Meyveler': ['elma', 'armut', 'muz', 'portakal', 'çilek', 'kiraz', 'üzüm', 'karpuz', 'kavun', 'şeftali', 'erik', 'vişne', 'kayısı', 'ananas', 'mango', 'papaya', 'kivi', 'limon', 'mandalina', 'greyfurt', 'incir', 'nar', 'dut', 'ahududu', 'böğürtlen', 'yaban mersini', 'avokado', 'hindistancevizi', 'hurma', 'muşmula'],
  'Futbol Takımları': ['galatasaray', 'fenerbahçe', 'beşiktaş', 'trabzonspor', 'bursaspor', 'başakşehir', 'sivasspor', 'konyaspor', 'antalyaspor', 'adanaspor', 'real madrid', 'barcelona', 'atletico madrid', 'manchester united', 'manchester city', 'liverpool', 'chelsea', 'arsenal', 'juventus', 'milan', 'inter', 'napoli', 'psg', 'bayern münih', 'dortmund', 'ajax', 'benfica', 'porto', 'roma', 'arsenal'],
  'Ülkeler': ['türkiye', 'almanya', 'fransa', 'ispanya', 'italya', 'japonya', 'çin', 'hindistan', 'brezilya', 'arjantin', 'meksika', 'kanada', 'avustralya', 'rusya', 'mısır', 'güney afrika', 'nijerya', 'kenya', 'suudi arabistan', 'iran', 'irak', 'suriye', 'yunanistan', 'polonya', 'hollanda', 'belçika', 'isveç', 'norveç', 'danimarka', 'finlandiya'],
  'Renk İsimleri': ['kırmızı', 'mavi', 'yeşil', 'sarı', 'turuncu', 'mor', 'pembe', 'beyaz', 'siyah', 'gri', 'kahverengi', 'lacivert', 'turkuaz', 'bordo', 'bej', 'krem', 'altın', 'gümüş', 'bronz', 'eflatun', 'leylak', 'mercan', 'limon sarısı', 'fıstık yeşili', 'kiremit', 'tarçın', 'şarap', 'zeytin yeşili', 'gece mavisi', 'pudra pembe'],
  'Türk Yemekleri': ['kebap', 'köfte', 'dolma', 'sarma', 'börek', 'baklava', 'künefe', 'lahmacun', 'pide', 'mantı', 'mercimek çorbası', 'ezogelin', 'tarhana', 'pilav', 'makarna', 'karnıyarık', 'imam bayıldı', 'çorba', 'cacık', 'ayran', 'şiş kebap', 'adana kebap', 'urfa kebap', 'döner', 'iskender', 'çiğ köfte', 'gözleme', 'simit', 'poğaça', 'açma'],
  'Meslekler': ['doktor', 'öğretmen', 'mühendis', 'avukat', 'hemşire', 'pilot', 'şef', 'mimar', 'psikolog', 'eczacı', 'diş hekimi', 'veteriner', 'polis', 'asker', 'itfaiyeci', 'gazeteci', 'oyuncu', 'müzisyen', 'ressam', 'sporcu', 'çiftçi', 'balıkçı', 'kasap', 'berber', 'terzi', 'şoför', 'tamirci', 'elektrikçi', 'tesisatçı', 'marangoz'],
};

export const CategoryGameScreen: React.FC<CategoryGameScreenProps> = ({ navigation }) => {
  const [phase, setPhase] = useState<'setup' | 'playing' | 'result'>('setup');
  const [playerNames, setPlayerNames] = useState(['', '']);
  const [gameMode, setGameMode] = useState<'classic' | 'ai'>('classic');
  const [selectedCategory, setSelectedCategory] = useState(CLASSIC_CATEGORIES[0]);
  const [aiTopic, setAiTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [category, setCategory] = useState('');
  const [alivePlayers, setAlivePlayers] = useState<string[]>([]);
  const [eliminatedPlayers, setEliminatedPlayers] = useState<string[]>([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [usedWords, setUsedWords] = useState<string[]>([]);
  const [currentWord, setCurrentWord] = useState('');
  const [timeLeft, setTimeLeft] = useState(10);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [validWords, setValidWords] = useState<string[]>([]);
  const timerRef = useRef<any>(null);

  const addPlayer = () => {
    if (playerNames.length >= 10) return;
    setPlayerNames([...playerNames, '']);
  };

  const removePlayer = (index: number) => {
    if (playerNames.length <= 2) return;
    setPlayerNames(playerNames.filter((_, i) => i !== index));
  };

  const updateName = (index: number, name: string) => {
    const updated = [...playerNames];
    updated[index] = name;
    setPlayerNames(updated);
  };

  const getAICategory = async (topic: string) => {
    try {
      const response = await fetch('https://squadbox-production.up.railway.app/api/v1/ai/generate/category', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic }),
      });
      if (!response.ok) throw new Error('AI hatası');
      const data = await response.json();
      return data;
    } catch {
      return null;
    }
  };

  const startGame = async () => {
    const validNames = playerNames.filter(n => n.trim() !== '');
    if (validNames.length < 2) {
      Alert.alert('Eksik Oyuncu', 'En az 2 oyuncu gerekli!');
      return;
    }

    let cat = '';

    if (gameMode === 'ai') {
      if (!aiTopic.trim()) {
        Alert.alert('Konu Gerekli', 'Bir konu girin!');
        return;
      }
      setIsGenerating(true);
      const aiResult = await getAICategory(aiTopic.trim());
      setIsGenerating(false);
      if (!aiResult) {
        Alert.alert('Hata', 'Kategori üretilemedi.');
        return;
      }
      cat = aiResult.category;
      setValidWords(aiResult.words.map((w: string) => w.toLowerCase()));
    } else {
      cat = selectedCategory;
      setValidWords(CLASSIC_WORD_LISTS[selectedCategory] || []);
    }

    setCategory(cat);
    setAlivePlayers(validNames);
    setEliminatedPlayers([]);
    setCurrentPlayerIndex(0);
    setUsedWords([]);
    setCurrentWord('');
    setTimeLeft(10);
    setPhase('playing');
  };

  useEffect(() => {
    if (phase === 'playing') {
      startTimer();
    }
    return () => clearInterval(timerRef.current);
  }, [phase, currentPlayerIndex]);

  const startTimer = () => {
    clearInterval(timerRef.current);
    setTimeLeft(10);
    setIsTimerRunning(true);
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setIsTimerRunning(false);
          handleEliminate('timeout');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSubmitWord = () => {
    const word = currentWord.trim().toLowerCase();
    if (!word) return;

    if (validWords.length > 0 && !validWords.includes(word)) {
      Alert.alert('❌ Geçersiz!', `"${currentWord}" bu kategoriye ait değil! ${alivePlayers[currentPlayerIndex]} elendi.`,
        [{ text: 'Tamam', onPress: () => handleEliminate('invalid') }]
      );
      clearInterval(timerRef.current);
      return;
    }

    if (usedWords.includes(word)) {
      clearInterval(timerRef.current);
      Alert.alert('❌ Tekrar!', `"${currentWord}" daha önce söylendi! ${alivePlayers[currentPlayerIndex]} elendi.`,
        [{ text: 'Tamam', onPress: () => handleEliminate('repeat') }]
      );
      return;
    }

    clearInterval(timerRef.current);
    setUsedWords(prev => [...prev, word]);
    setCurrentWord('');
    nextPlayer();
  };

 const handleEliminate = (reason: 'timeout' | 'repeat' | 'invalid') => {
    const eliminated = alivePlayers[currentPlayerIndex];
    const newAlive = alivePlayers.filter((_, i) => i !== currentPlayerIndex);
    setEliminatedPlayers(prev => [...prev, eliminated]);
    setAlivePlayers(newAlive);
    setCurrentWord('');

    if (newAlive.length <= 1) {
      setPhase('result');
      return;
    }

    const nextIdx = currentPlayerIndex >= newAlive.length ? 0 : currentPlayerIndex;
    setCurrentPlayerIndex(nextIdx);
  };

  const nextPlayer = () => {
    if (alivePlayers.length <= 1) {
      setPhase('result');
      return;
    }
    const nextIdx = (currentPlayerIndex + 1) % alivePlayers.length;
    setCurrentPlayerIndex(nextIdx);
  };

  useEffect(() => {
    if (phase === 'playing' && alivePlayers.length > 0) {
      startTimer();
    }
  }, [currentPlayerIndex, alivePlayers]);

  const validNames = playerNames.filter(n => n.trim() !== '');

  if (phase === 'setup') {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>🎯 Kategori Yarışması</Text>
          <Text style={styles.subtitle}>Sırayla kelime söyle, tekrar edersen elenisin!</Text>
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={{ padding: 20 }}>
          <Text style={styles.sectionTitle}>Kategori Modu</Text>
          <View style={styles.modeContainer}>
            <TouchableOpacity
              style={[styles.modeButton, gameMode === 'classic' && styles.modeActive]}
              onPress={() => setGameMode('classic')}
            >
              <Text style={styles.modeIcon}>📋</Text>
              <Text style={[styles.modeTitle, gameMode === 'classic' && styles.modeTitleActive]}>Klasik</Text>
              <Text style={styles.modeDesc}>Hazır kategoriler</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modeButton, gameMode === 'ai' && styles.modeActiveAI]}
              onPress={() => setGameMode('ai')}
            >
              <Text style={styles.modeIcon}>🤖</Text>
              <Text style={[styles.modeTitle, gameMode === 'ai' && styles.modeTitleActive]}>AI Modu</Text>
              <Text style={styles.modeDesc}>Kendi konunu seç</Text>
            </TouchableOpacity>
          </View>

          {gameMode === 'classic' ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Kategori Seç</Text>
              {CLASSIC_CATEGORIES.map((cat, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={[styles.categoryBtn, selectedCategory === cat && styles.categoryBtnActive]}
                  onPress={() => setSelectedCategory(cat)}
                >
                  <Text style={[styles.categoryBtnText, selectedCategory === cat && styles.categoryBtnTextActive]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.aiContainer}>
              <Text style={styles.aiLabel}>🤖 Konu Gir</Text>
              <TextInput
                style={styles.aiInput}
                placeholder="Örn: Marvel Karakterleri, NBA Takımları..."
                placeholderTextColor="#64748B"
                value={aiTopic}
                onChangeText={setAiTopic}
              />
              <Text style={styles.aiHint}>AI bu konuya özel bir kategori oluşturacak</Text>
            </View>
          )}

          <Text style={styles.sectionTitle}>Oyuncular</Text>
          <Text style={styles.hint}>En az 2 oyuncu gerekli</Text>
          {playerNames.map((name, index) => (
            <View key={index} style={styles.playerRow}>
              <Text style={styles.playerNum}>{index + 1}.</Text>
              <TextInput
                style={styles.input}
                placeholder={`Oyuncu ${index + 1}`}
                placeholderTextColor="#64748B"
                value={name}
                onChangeText={(t) => updateName(index, t)}
              />
              <TouchableOpacity style={styles.removeBtn} onPress={() => removePlayer(index)}>
                <Text style={styles.removeBtnText}>×</Text>
              </TouchableOpacity>
            </View>
          ))}
          <TouchableOpacity style={styles.addBtn} onPress={addPlayer}>
            <Text style={styles.addBtnText}>+ Oyuncu Ekle</Text>
          </TouchableOpacity>
          <View style={{ height: 100 }} />
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backBtnText}>Geri</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.startBtn, isGenerating && styles.disabled]}
            onPress={startGame}
            disabled={isGenerating}
          >
            {isGenerating
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.startBtnText}>Oyunu Başlat</Text>
            }
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (phase === 'playing') {
    const currentPlayer = alivePlayers[currentPlayerIndex];

    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>🎯 {category}</Text>
          <Text style={[styles.timer, timeLeft <= 3 && styles.timerWarning]}>{timeLeft}s</Text>
        </View>

        <View style={styles.playersRow}>
          {alivePlayers.map((name, idx) => (
            <View key={idx} style={[styles.playerChip, idx === currentPlayerIndex && styles.playerChipActive]}>
              <Text style={[styles.playerChipText, idx === currentPlayerIndex && styles.playerChipTextActive]}>
                {name}
              </Text>
            </View>
          ))}
        </View>

        {eliminatedPlayers.length > 0 && (
          <View style={styles.eliminatedRow}>
            {eliminatedPlayers.map((name, idx) => (
              <View key={idx} style={styles.eliminatedChip}>
                <Text style={styles.eliminatedChipText}>💀 {name}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.playerBanner}>
          <Text style={styles.playerBannerText}>🎯 {currentPlayer}'in sırası</Text>
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.wordInput}
            placeholder={`${category} kategorisinden bir kelime...`}
            placeholderTextColor="#64748B"
            value={currentWord}
            onChangeText={setCurrentWord}
            onSubmitEditing={handleSubmitWord}
            autoFocus
            returnKeyType="done"
          />
          <TouchableOpacity style={styles.submitBtn} onPress={handleSubmitWord}>
            <Text style={styles.submitBtnText}>Söyle →</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.menuBtn}
          onPress={() => navigation.navigate('Home')}
        >
          <Text style={styles.menuBtnText}>Ana Menü</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (phase === 'result') {
    const winner = alivePlayers[0];

    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ fontSize: 60, marginBottom: 20 }}>🏆</Text>
        <Text style={styles.title}>{winner} Kazandı!</Text>
        <Text style={[styles.subtitle, { marginBottom: 20 }]}>Kategori: {category}</Text>
        <Text style={[styles.hint, { marginBottom: 30 }]}>
          Toplam {usedWords.length} kelime söylendi
        </Text>

        <View style={{ width: '100%', paddingHorizontal: 20, marginBottom: 20 }}>
          <Text style={styles.sectionTitle}>Söylenen Kelimeler:</Text>
          <View style={styles.allWordsContainer}>
            {usedWords.map((word, idx) => (
              <View key={idx} style={styles.usedWordChip}>
                <Text style={styles.usedWordText}>{word}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={[styles.footer, { position: 'relative', marginTop: 10 }]}>
          <TouchableOpacity style={styles.backBtn} onPress={() => setPhase('setup')}>
            <Text style={styles.backBtnText}>Tekrar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.startBtn} onPress={() => navigation.navigate('Home')}>
            <Text style={styles.startBtnText}>Ana Menü</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return null;
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background.primary },
  header: { paddingTop: 60, paddingHorizontal: 20, alignItems: 'center', marginBottom: 10 },
  title: { fontSize: 24, fontWeight: 'bold', color: theme.colors.text.primary, marginBottom: 8, textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#0891B2', fontWeight: '600', textAlign: 'center' },
  timer: { fontSize: 48, fontWeight: 'bold', color: '#F8FAFC', marginTop: 5 },
  timerWarning: { color: '#EF4444' },
  scroll: { flex: 1 },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#F8FAFC', marginBottom: 12 },
  hint: { fontSize: 14, color: '#F59E0B', marginBottom: 10, fontStyle: 'italic' },
  modeContainer: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  modeButton: { flex: 1, backgroundColor: '#1E293B', borderRadius: 12, padding: 16, alignItems: 'center', borderWidth: 2, borderColor: '#334155' },
  modeActive: { borderColor: '#0891B2', backgroundColor: '#0C1A2E' },
  modeActiveAI: { borderColor: '#10B981', backgroundColor: '#022C22' },
  modeIcon: { fontSize: 28, marginBottom: 8 },
  modeTitle: { fontSize: 16, fontWeight: 'bold', color: '#94A3B8', marginBottom: 4 },
  modeTitleActive: { color: '#FFFFFF' },
  modeDesc: { fontSize: 12, color: '#64748B', textAlign: 'center' },
  categoryBtn: { backgroundColor: '#1E293B', padding: 14, borderRadius: 10, marginBottom: 8, borderWidth: 2, borderColor: '#334155' },
  categoryBtnActive: { borderColor: '#0891B2', backgroundColor: '#0C1A2E' },
  categoryBtnText: { color: '#94A3B8', fontSize: 15, fontWeight: '600' },
  categoryBtnTextActive: { color: '#FFFFFF' },
  aiContainer: { backgroundColor: '#022C22', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#10B981', marginBottom: 20 },
  aiLabel: { fontSize: 14, color: '#10B981', fontWeight: '600', marginBottom: 8 },
  aiInput: { backgroundColor: '#1E293B', borderRadius: 10, padding: 12, color: '#F8FAFC', fontSize: 16, borderWidth: 1, borderColor: '#334155', marginBottom: 8 },
  aiHint: { fontSize: 12, color: '#64748B' },
  playerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 10 },
  playerNum: { color: '#64748B', fontSize: 16, width: 25 },
  input: { flex: 1, backgroundColor: '#1E293B', borderRadius: 10, padding: 12, color: '#F8FAFC', fontSize: 16, borderWidth: 1, borderColor: '#334155' },
  removeBtn: { backgroundColor: '#EF4444', borderRadius: 20, width: 30, height: 30, alignItems: 'center', justifyContent: 'center' },
  removeBtnText: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
  addBtn: { backgroundColor: '#334155', padding: 12, borderRadius: 10, alignItems: 'center', borderWidth: 2, borderColor: '#0891B2', borderStyle: 'dashed' },
  addBtnText: { color: '#0891B2', fontSize: 16, fontWeight: '600' },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', padding: 20, paddingBottom: 40, backgroundColor: '#0F172A', borderTopWidth: 1, borderTopColor: '#1E293B', gap: 10 },
  backBtn: { flex: 1, backgroundColor: '#334155', padding: 15, borderRadius: 10, alignItems: 'center' },
  backBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  startBtn: { flex: 2, backgroundColor: '#0891B2', padding: 15, borderRadius: 10, alignItems: 'center' },
  disabled: { opacity: 0.6 },
  startBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  playersRow: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 20, gap: 8, marginBottom: 10 },
  playerChip: { backgroundColor: '#1E293B', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 2, borderColor: '#334155' },
  playerChipActive: { borderColor: '#0891B2', backgroundColor: '#0C1A2E' },
  playerChipText: { color: '#94A3B8', fontSize: 14, fontWeight: '600' },
  playerChipTextActive: { color: '#FFFFFF' },
  eliminatedRow: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 20, gap: 8, marginBottom: 10 },
  eliminatedChip: { backgroundColor: '#1E293B', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 15, opacity: 0.5 },
  eliminatedChipText: { color: '#64748B', fontSize: 12 },
  playerBanner: { backgroundColor: '#1E293B', marginHorizontal: 20, padding: 12, borderRadius: 10, alignItems: 'center', marginBottom: 15 },
  playerBannerText: { color: '#F8FAFC', fontSize: 16, fontWeight: '600' },
  usedWordsContainer: { marginHorizontal: 20, marginBottom: 15 },
  usedWordsTitle: { fontSize: 14, color: '#64748B', marginBottom: 8 },
  usedWordsList: { flexDirection: 'row' },
  usedWordChip: { backgroundColor: '#1E293B', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 15, marginRight: 8, borderWidth: 1, borderColor: '#334155' },
  usedWordText: { color: '#94A3B8', fontSize: 13 },
  inputContainer: { marginHorizontal: 20, flexDirection: 'row', gap: 10 },
  wordInput: { flex: 1, backgroundColor: '#1E293B', borderRadius: 10, padding: 14, color: '#F8FAFC', fontSize: 16, borderWidth: 2, borderColor: '#0891B2' },
  submitBtn: { backgroundColor: '#0891B2', padding: 14, borderRadius: 10, justifyContent: 'center' },
  submitBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  menuBtn: { alignSelf: 'center', padding: 12, marginTop: 10 },
  menuBtnText: { color: '#64748B', fontSize: 14 },
  allWordsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
});