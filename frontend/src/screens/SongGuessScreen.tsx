import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  TextInput, ScrollView, Alert, ActivityIndicator,
} from 'react-native';
import { theme } from '../theme/theme';

interface Song {
  lyrics: string;
  title: string;
  artist: string;
}

interface SongGuessScreenProps {
  navigation: any;
}

const CLASSIC_CATEGORIES = [
  '90\'lar Türkçe Pop',
  '2000\'ler Türkçe Pop',
  'Türkçe Rock',
  'Arabesk Klasikler',
  'Türkçe Hip-Hop',
  'Yabancı Pop Klasikler',
  '80\'ler Yabancı Rock',
];

export const SongGuessScreen: React.FC<SongGuessScreenProps> = ({ navigation }) => {
  const [phase, setPhase] = useState<'setup' | 'playing' | 'result'>('setup');
  const [playerNames, setPlayerNames] = useState(['', '']);
  const [gameMode, setGameMode] = useState<'classic' | 'ai'>('classic');
  const [selectedCategory, setSelectedCategory] = useState(CLASSIC_CATEGORIES[0]);
  const [aiTopic, setAiTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [songs, setSongs] = useState<Song[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [scores, setScores] = useState<number[]>([]);
  const [showAnswer, setShowAnswer] = useState(false);
  const [guess, setGuess] = useState('');

  const addPlayer = () => {
    if (playerNames.length >= 8) return;
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

  const generateSongs = async () => {
    const validNames = playerNames.filter(n => n.trim() !== '');
    if (validNames.length < 2) {
      Alert.alert('Eksik Oyuncu', 'En az 2 oyuncu gerekli!');
      return;
    }

    const topic = gameMode === 'ai' ? aiTopic.trim() : selectedCategory;
    if (!topic) {
      Alert.alert('Kategori Gerekli', 'Bir kategori seçin veya girin!');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('https://squadbox-production.up.railway.app/api/v1/ai/generate/songguess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, count: 10 }),
      });
      if (!response.ok) throw new Error('AI hatası');
      const data = await response.json();
      setSongs(data.songs);
      setScores(new Array(validNames.length).fill(0));
      setCurrentIndex(0);
      setCurrentPlayerIndex(0);
      setShowAnswer(false);
      setGuess('');
      setPhase('playing');
    } catch {
      Alert.alert('Hata', 'Şarkılar üretilemedi. Bağlantınızı kontrol edin.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCorrect = () => {
    const newScores = [...scores];
    newScores[currentPlayerIndex] += 1;
    setScores(newScores);
    nextSong();
  };

  const nextSong = () => {
    if (currentIndex >= songs.length - 1) {
      setPhase('result');
      return;
    }
    const validNames = playerNames.filter(n => n.trim() !== '');
    setCurrentPlayerIndex((currentPlayerIndex + 1) % validNames.length);
    setCurrentIndex(currentIndex + 1);
    setShowAnswer(false);
    setGuess('');
  };

  const validNames = playerNames.filter(n => n.trim() !== '');

  if (phase === 'setup') {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>🎵 Şarkı Bul</Text>
          <Text style={styles.subtitle}>Sözlerden şarkıyı tahmin et!</Text>
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={{ padding: 20 }}>
          <Text style={styles.sectionTitle}>Kategori Modu</Text>
          <View style={styles.modeContainer}>
            <TouchableOpacity
              style={[styles.modeButton, gameMode === 'classic' && styles.modeActive]}
              onPress={() => setGameMode('classic')}
            >
              <Text style={styles.modeIcon}>🎼</Text>
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
                placeholder="Örn: Türkçe Film Müzikleri, Jazz Klasikleri..."
                placeholderTextColor="#64748B"
                value={aiTopic}
                onChangeText={setAiTopic}
              />
              <Text style={styles.aiHint}>AI bu konuya özel şarkı sözleri üretecek</Text>
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
            onPress={generateSongs}
            disabled={isGenerating}
          >
            {isGenerating
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.startBtnText}>🎵 Başlat</Text>
            }
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (phase === 'playing') {
    const current = songs[currentIndex];
    const currentPlayer = validNames[currentPlayerIndex];

    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>🎵 Şarkı Bul</Text>
          <Text style={styles.subtitle}>Soru {currentIndex + 1}/{songs.length}</Text>
        </View>

        <View style={styles.scoreboard}>
          {validNames.map((name, idx) => (
            <View key={idx} style={[styles.scoreItem, idx === currentPlayerIndex && styles.scoreItemActive]}>
              <Text style={styles.scoreName}>{name}</Text>
              <Text style={styles.scoreValue}>{scores[idx]}</Text>
            </View>
          ))}
        </View>

        <View style={styles.playerBanner}>
          <Text style={styles.playerBannerText}>🎯 {currentPlayer}'in sırası</Text>
        </View>

        <View style={styles.lyricsCard}>
          <Text style={styles.lyricsLabel}>🎵 Şarkı Sözü:</Text>
          <Text style={styles.lyricsText}>"{current.lyrics}"</Text>
        </View>

        {!showAnswer ? (
          <View style={styles.guessContainer}>
            <TextInput
              style={styles.guessInput}
              placeholder="Şarkı adını yaz..."
              placeholderTextColor="#64748B"
              value={guess}
              onChangeText={setGuess}
            />
            <View style={styles.guessButtons}>
              <TouchableOpacity
                style={styles.revealBtn}
                onPress={() => setShowAnswer(true)}
              >
                <Text style={styles.revealBtnText}>Cevabı Gör</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.correctBtn}
                onPress={handleCorrect}
              >
                <Text style={styles.correctBtnText}>✓ Doğru Bildim!</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.answerCard}>
            <Text style={styles.answerLabel}>Cevap:</Text>
            <Text style={styles.answerTitle}>{current.title}</Text>
            <Text style={styles.answerArtist}>{current.artist}</Text>
            <View style={styles.answerButtons}>
              <TouchableOpacity style={styles.wrongBtn} onPress={nextSong}>
                <Text style={styles.wrongBtnText}>✗ Bilemedi</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.correctBtn} onPress={handleCorrect}>
                <Text style={styles.correctBtnText}>✓ Doğru Bildi!</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

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
    const sorted = validNames
      .map((name, idx) => ({ name, score: scores[idx] }))
      .sort((a, b) => b.score - a.score);

    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={styles.title}>🏆 Sonuçlar</Text>
        <Text style={[styles.subtitle, { marginBottom: 30 }]}>
          {gameMode === 'classic' ? selectedCategory : aiTopic}
        </Text>

        <View style={{ width: '100%', paddingHorizontal: 20 }}>
          {sorted.map((item, idx) => (
            <View key={idx} style={[styles.resultRow, idx === 0 && styles.winnerRow]}>
              <Text style={styles.rank}>{idx + 1}.</Text>
              <Text style={styles.resultName}>{item.name}</Text>
              <Text style={styles.resultScore}>{item.score} puan</Text>
              {idx === 0 && <Text style={styles.crown}>👑</Text>}
            </View>
          ))}
        </View>

        <View style={[styles.footer, { position: 'relative', marginTop: 30 }]}>
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
  header: { paddingTop: 60, paddingHorizontal: 20, alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 28, fontWeight: 'bold', color: theme.colors.text.primary, marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#0891B2', fontWeight: '600' },
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
  scoreboard: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 20, gap: 8, marginBottom: 15 },
  scoreItem: { backgroundColor: '#1E293B', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 2, borderColor: '#334155' },
  scoreItemActive: { borderColor: '#0891B2', backgroundColor: '#0C1A2E' },
  scoreName: { color: '#94A3B8', fontSize: 12 },
  scoreValue: { color: '#F8FAFC', fontSize: 18, fontWeight: 'bold', textAlign: 'center' },
  playerBanner: { backgroundColor: '#1E293B', marginHorizontal: 20, padding: 12, borderRadius: 10, alignItems: 'center', marginBottom: 15 },
  playerBannerText: { color: '#F8FAFC', fontSize: 16, fontWeight: '600' },
  lyricsCard: { backgroundColor: '#0C1A2E', marginHorizontal: 20, borderRadius: 15, padding: 25, marginBottom: 15, borderWidth: 2, borderColor: '#0891B2' },
  lyricsLabel: { fontSize: 14, color: '#0891B2', fontWeight: '600', marginBottom: 10 },
  lyricsText: { fontSize: 18, color: '#F8FAFC', fontStyle: 'italic', lineHeight: 28, textAlign: 'center' },
  guessContainer: { paddingHorizontal: 20 },
  guessInput: { backgroundColor: '#1E293B', borderRadius: 10, padding: 14, color: '#F8FAFC', fontSize: 16, borderWidth: 1, borderColor: '#334155', marginBottom: 12 },
  guessButtons: { flexDirection: 'row', gap: 10 },
  revealBtn: { flex: 1, backgroundColor: '#334155', padding: 14, borderRadius: 10, alignItems: 'center' },
  revealBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
  correctBtn: { flex: 1, backgroundColor: '#10B981', padding: 14, borderRadius: 10, alignItems: 'center' },
  correctBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: 'bold' },
  answerCard: { backgroundColor: '#1E293B', marginHorizontal: 20, borderRadius: 15, padding: 20, alignItems: 'center' },
  answerLabel: { fontSize: 14, color: '#94A3B8', marginBottom: 8 },
  answerTitle: { fontSize: 24, fontWeight: 'bold', color: '#F8FAFC', marginBottom: 4, textAlign: 'center' },
  answerArtist: { fontSize: 16, color: '#0891B2', marginBottom: 16 },
  answerButtons: { flexDirection: 'row', gap: 10, width: '100%' },
  wrongBtn: { flex: 1, backgroundColor: '#EF4444', padding: 14, borderRadius: 10, alignItems: 'center' },
  wrongBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: 'bold' },
  menuBtn: { position: 'absolute', bottom: 30, alignSelf: 'center', padding: 10 },
  menuBtnText: { color: '#64748B', fontSize: 14 },
  resultRow: { backgroundColor: '#1E293B', padding: 16, borderRadius: 12, marginBottom: 10, flexDirection: 'row', alignItems: 'center', gap: 10 },
  winnerRow: { backgroundColor: '#0C1A2E', borderWidth: 2, borderColor: '#0891B2' },
  rank: { color: '#64748B', fontSize: 16, width: 25 },
  resultName: { flex: 1, fontSize: 16, fontWeight: '600', color: '#F8FAFC' },
  resultScore: { fontSize: 18, fontWeight: 'bold', color: '#0891B2' },
  crown: { fontSize: 20 },
});