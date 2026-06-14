import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  TextInput, ScrollView, Alert, ActivityIndicator,
} from 'react-native';
import { theme } from '../theme/theme';

interface Player {
  id: string;
  name: string;
  card: string;
  hasGuessed: boolean;
  score: number;
}

interface WhoIsItScreenProps {
  navigation: any;
}

const DEFAULT_CARDS = [
  'Atatürk', 'Einstein', 'Ronaldo', 'Beyoncé', 'Napoleon',
  'Cleopatra', 'Steve Jobs', 'Mozart', 'Leonardo da Vinci', 'Sherlock Holmes',
  'Harry Potter', 'Darth Vader', 'Mickey Mouse', 'Batman', 'Superman',
  'Elon Musk', 'Marilyn Monroe', 'Michael Jackson', 'Shakespeare', 'Socrates',
];

type GamePhase = 'setup' | 'cardAssign' | 'guessing' | 'roundResult' | 'gameEnd';

export const WhoIsItScreen: React.FC<WhoIsItScreenProps> = ({ navigation }) => {
  const [phase, setPhase] = useState<GamePhase>('setup');
  const [playerNames, setPlayerNames] = useState(['', '']);
  const [gameMode, setGameMode] = useState<'classic' | 'ai'>('classic');
  const [aiTopic, setAiTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [showCard, setShowCard] = useState(false);
  const [cardShownToOthers, setCardShownToOthers] = useState(false);
  const [currentCardInput, setCurrentCardInput] = useState('');
  const [roundScores, setRoundScores] = useState<boolean[]>([]);
  const [currentGuessIndex, setCurrentGuessIndex] = useState(0);
  const [aiCards, setAiCards] = useState<string[]>([]);
  const [totalRounds, setTotalRounds] = useState(3);
  const [currentRound, setCurrentRound] = useState(1);

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

  const generateAICards = async (topic: string, count: number) => {
    try {
      const response = await fetch('https://squadbox-production.up.railway.app/api/v1/ai/generate/whoisit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, count }),
      });
      if (!response.ok) throw new Error('AI hatası');
      const data = await response.json();
      return data.cards;
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

    if (gameMode === 'ai') {
      if (!aiTopic.trim()) {
        Alert.alert('Konu Gerekli', 'AI modu için konu girin!');
        return;
      }
      setIsGenerating(true);
      const cards = await generateAICards(aiTopic.trim(), validNames.length);
      setIsGenerating(false);
      if (!cards) {
        Alert.alert('Hata', 'AI kartları üretilemedi.');
        return;
      }
      setAiCards(cards);
      const newPlayers: Player[] = validNames.map((name, idx) => ({
        id: idx.toString(),
        name,
        card: cards[idx] || DEFAULT_CARDS[idx % DEFAULT_CARDS.length],
        hasGuessed: false,
        score: 0,
      }));
      setPlayers(newPlayers);
    } else {
      const newPlayers: Player[] = validNames.map((name, idx) => ({
        id: idx.toString(),
        name,
        card: '',
        hasGuessed: false,
        score: 0,
      }));
      setPlayers(newPlayers);
    }

    setCurrentRound(1);
    setCurrentPlayerIndex(0);
    setShowCard(false);
    setCardShownToOthers(false);
    setCurrentCardInput('');
    setRoundScores([]);
    setCurrentGuessIndex(0);
    setPhase('cardAssign');
  };

  const handleCardAssigned = () => {
    if (gameMode === 'classic' && !currentCardInput.trim()) {
      Alert.alert('Karakter Yaz', 'Lütfen bir karakter adı yazın!');
      return;
    }

    if (gameMode === 'classic') {
      const updated = [...players];
      updated[currentPlayerIndex].card = currentCardInput.trim();
      setPlayers(updated);
    }

    setCardShownToOthers(true);
    setShowCard(true);
  };

  const handlePlayerReady = () => {
    setShowCard(false);
    setCardShownToOthers(false);
    setCurrentCardInput('');

    if (currentPlayerIndex < players.length - 1) {
      setCurrentPlayerIndex(prev => prev + 1);
    } else {
      const nextIdx = currentPlayerIndex === players.length - 1 ? 0 : currentPlayerIndex + 1;
      setCurrentGuessIndex(nextIdx);
      setRoundScores(new Array(players.length).fill(false));
      setPhase('guessing');
    }
  };

  const handleGuessResult = (guessed: boolean) => {
    const newScores = [...roundScores];
    newScores[currentGuessIndex] = guessed;
    setRoundScores(newScores);

    const nextIdx = (currentGuessIndex + 1) % players.length;
    const startIdx = currentPlayerIndex === players.length - 1 ? 0 : currentPlayerIndex + 1;

    if (nextIdx === startIdx) {
      const updatedPlayers = [...players];
      newScores.forEach((correct, idx) => {
        if (correct) updatedPlayers[idx].score += 1;
      });
      setPlayers(updatedPlayers);
      setPhase('roundResult');
    } else {
      setCurrentGuessIndex(nextIdx);
    }
  };

  const startNewRound = () => {
    if (currentRound >= totalRounds) {
      setPhase('gameEnd');
      return;
    }

    setCurrentRound(prev => prev + 1);

    if (gameMode === 'classic') {
      const resetPlayers = players.map(p => ({ ...p, card: '', hasGuessed: false }));
      setPlayers(resetPlayers);
    } else {
      const newCards = [...DEFAULT_CARDS].sort(() => Math.random() - 0.5).slice(0, players.length);
      const resetPlayers = players.map((p, idx) => ({ ...p, card: newCards[idx], hasGuessed: false }));
      setPlayers(resetPlayers);
    }
    setCurrentPlayerIndex(0);
    setShowCard(false);
    setCardShownToOthers(false);
    setCurrentCardInput('');
    setRoundScores([]);
    setCurrentGuessIndex(0);
    setPhase('cardAssign');
  };

  // SETUP
  if (phase === 'setup') {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Ben Kimim?</Text>
          <Text style={styles.subtitle}>Alnındaki kartı tahmin et!</Text>
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={{ padding: 20 }}>
          <Text style={styles.sectionTitle}>Oyun Modu</Text>
          <View style={styles.modeContainer}>
            <TouchableOpacity
              style={[styles.modeButton, gameMode === 'classic' && styles.modeActive]}
              onPress={() => setGameMode('classic')}
            >
              <Text style={styles.modeIcon}>🎭</Text>
              <Text style={[styles.modeTitle, gameMode === 'classic' && styles.modeTitleActive]}>Klasik</Text>
              <Text style={styles.modeDesc}>Arkadaşlar karakter yazar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modeButton, gameMode === 'ai' && styles.modeActiveAI]}
              onPress={() => setGameMode('ai')}
            >
              <Text style={styles.modeIcon}>🤖</Text>
              <Text style={[styles.modeTitle, gameMode === 'ai' && styles.modeTitleActive]}>AI Modu</Text>
              <Text style={styles.modeDesc}>AI karakter üretir</Text>
            </TouchableOpacity>
          </View>

          {gameMode === 'ai' && (
            <View style={styles.aiContainer}>
              <Text style={styles.aiLabel}>Konu Gir</Text>
              <TextInput
                style={styles.aiInput}
                placeholder="Örn: Marvel Karakterleri, Türk Sanatçılar..."
                placeholderTextColor="#64748B"
                value={aiTopic}
                onChangeText={setAiTopic}
              />
              <Text style={styles.aiHint}>🤖 AI bu konuya özel karakterler üretecek</Text>
            </View>
          )}

          <Text style={styles.sectionTitle}>Tur Sayısı</Text>
          <View style={styles.modeContainer}>
            {[1, 2, 3, 5].map((r) => (
              <TouchableOpacity
                key={r}
                style={[styles.roundBtn, totalRounds === r && styles.roundBtnActive]}
                onPress={() => setTotalRounds(r)}
              >
                <Text style={[styles.roundBtnText, totalRounds === r && styles.roundBtnTextActive]}>{r}</Text>
              </TouchableOpacity>
            ))}
          </View>

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
              : <Text style={styles.startBtnText}>{gameMode === 'ai' ? '🤖 AI ile Başlat' : 'Oyunu Başlat'}</Text>
            }
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // KART ATAMA
  if (phase === 'cardAssign') {
    const current = players[currentPlayerIndex];

    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Ben Kimim?</Text>
          <Text style={styles.subtitle}>Tur {currentRound}/{totalRounds} • Oyuncu {currentPlayerIndex + 1}/{players.length}</Text>
        </View>

        {!cardShownToOthers ? (
          <View style={{ flex: 1, paddingHorizontal: 20 }}>
            <View style={styles.passCard}>
              <Text style={styles.passName}>🙈 {current.name} bakmasın!</Text>
              <Text style={styles.passInstruction}>
                Diğer oyuncular {current.name} için{'\n'}bir karakter yazın.
              </Text>
            </View>

            {gameMode === 'classic' ? (
              <>
                <TextInput
                  style={styles.bigInput}
                  placeholder={`${current.name} için karakter yaz...`}
                  placeholderTextColor="#64748B"
                  value={currentCardInput}
                  onChangeText={setCurrentCardInput}
                  autoFocus
                />
                <TouchableOpacity
                  style={[{ backgroundColor: '#6366F1', padding: 14, borderRadius: 10, alignItems: 'center', marginTop: 15 }, !currentCardInput.trim() && styles.disabled]}
                  onPress={handleCardAssigned}
                  disabled={!currentCardInput.trim()}
                >
                  <Text style={styles.startBtnText}>Kart Hazır →</Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity 
                style={{ backgroundColor: '#6366F1', padding: 14, borderRadius: 10, alignItems: 'center', marginTop: 15 }} 
                onPress={handleCardAssigned}
              >
                <Text style={styles.startBtnText}>Kartı Göster →</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View style={{ flex: 1, paddingHorizontal: 20, justifyContent: 'center', alignItems: 'center', gap: 15 }}>
            <View style={styles.passCard}>
              <Text style={styles.passInstruction}>
                Telefonu {current.name}'e ver,{'\n'}ekrana bakmadan kafasına koysun!
              </Text>
            </View>
            <View style={styles.cardContainer}>
              <Text style={styles.cardLabel}>Kart:</Text>
              <Text style={styles.cardValue}>{current.card}</Text>
            </View>
            <TouchableOpacity
              style={{ backgroundColor: '#6366F1', padding: 14, borderRadius: 10, alignItems: 'center', marginTop: 20, width: '100%' }}
              onPress={handlePlayerReady}
            >
              <Text style={styles.startBtnText}>Devam Et →</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  }

  // TAHMİN AŞAMASI
  if (phase === 'guessing') {
    const current = players[currentGuessIndex];

    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 }]}>
        <Text style={styles.subtitle}>Tur {currentRound}/{totalRounds}</Text>
        <Text style={[styles.title, { marginTop: 8 }]}>🎯 {current.name}</Text>
        <Text style={[styles.subtitle, { marginBottom: 30, textAlign: 'center' }]}>
          Kartını tahmin edebildi mi?
        </Text>

        <View style={styles.cardContainer}>
          <Text style={styles.cardLabel}>Kartı:</Text>
          <Text style={styles.cardValue}>{current.card}</Text>
        </View>

        <View style={{ flexDirection: 'row', gap: 15, marginTop: 30, width: '100%' }}>
          <TouchableOpacity
            style={[styles.startBtn, { flex: 1, backgroundColor: '#10B981' }]}
            onPress={() => handleGuessResult(true)}
          >
            <Text style={styles.startBtnText}>✓ Bildi!</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.startBtn, { flex: 1, backgroundColor: '#EF4444' }]}
            onPress={() => handleGuessResult(false)}
          >
            <Text style={styles.startBtnText}>✗ Bilemedi</Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.hint, { marginTop: 20 }]}>
          {currentGuessIndex + 1}/{players.length} oyuncu
        </Text>
      </View>
    );
  }

  // TUR SONUCU
  if (phase === 'roundResult') {
    const isLastRound = currentRound >= totalRounds;

    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 }]}>
        <Text style={styles.title}>
          {isLastRound ? '🏆 Oyun Bitti!' : `📊 Tur ${currentRound} Bitti!`}
        </Text>
        <Text style={[styles.subtitle, { marginBottom: 30 }]}>
          {isLastRound ? 'Genel puan tablosu' : `${currentRound}/${totalRounds} tur tamamlandı`}
        </Text>

        <View style={{ width: '100%' }}>
          {[...players]
            .sort((a, b) => b.score - a.score)
            .map((player, idx) => (
              <View key={idx} style={[styles.resultRow, idx === 0 && styles.winnerRow]}>
                <Text style={styles.rank}>{idx + 1}.</Text>
                <Text style={styles.resultName}>{player.name}</Text>
                <Text style={styles.resultCard}>{player.score} puan</Text>
                {idx === 0 && <Text style={{ fontSize: 20 }}>👑</Text>}
              </View>
            ))}
        </View>

        <View style={{ flexDirection: 'row', gap: 10, marginTop: 30, width: '100%' }}>
          <TouchableOpacity style={[styles.backBtn, { flex: 1 }]} onPress={() => navigation.navigate('Home')}>
            <Text style={styles.backBtnText}>Ana Menü</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.startBtn, { flex: 2 }]} onPress={isLastRound ? () => setPhase('setup') : startNewRound}>
            <Text style={styles.startBtnText}>{isLastRound ? 'Yeniden Oyna' : `Tur ${currentRound + 1} →`}</Text>
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
  title: { fontSize: 32, fontWeight: 'bold', color: theme.colors.text.primary, marginBottom: 8 },
  subtitle: { fontSize: 16, color: theme.colors.primary.main, fontWeight: '600' },
  scroll: { flex: 1 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#F8FAFC', marginBottom: 12 },
  hint: { fontSize: 14, color: '#F59E0B', marginBottom: 10, fontStyle: 'italic' },
  modeContainer: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  modeButton: { flex: 1, backgroundColor: '#1E293B', borderRadius: 12, padding: 16, alignItems: 'center', borderWidth: 2, borderColor: '#334155' },
  modeActive: { borderColor: '#6366F1', backgroundColor: '#1E1B4B' },
  modeActiveAI: { borderColor: '#10B981', backgroundColor: '#022C22' },
  modeIcon: { fontSize: 28, marginBottom: 8 },
  modeTitle: { fontSize: 16, fontWeight: 'bold', color: '#94A3B8', marginBottom: 4 },
  modeTitleActive: { color: '#FFFFFF' },
  modeDesc: { fontSize: 12, color: '#64748B', textAlign: 'center' },
  roundBtn: { flex: 1, backgroundColor: '#1E293B', borderRadius: 10, padding: 14, alignItems: 'center', borderWidth: 2, borderColor: '#334155' },
  roundBtnActive: { borderColor: '#6366F1', backgroundColor: '#1E1B4B' },
  roundBtnText: { fontSize: 18, fontWeight: 'bold', color: '#94A3B8' },
  roundBtnTextActive: { color: '#FFFFFF' },
  aiContainer: { backgroundColor: '#022C22', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#10B981', marginBottom: 20 },
  aiLabel: { fontSize: 14, color: '#10B981', fontWeight: '600', marginBottom: 8 },
  aiInput: { backgroundColor: '#1E293B', borderRadius: 10, padding: 12, color: '#F8FAFC', fontSize: 16, borderWidth: 1, borderColor: '#334155', marginBottom: 8 },
  aiHint: { fontSize: 12, color: '#64748B' },
  playerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 10 },
  playerNum: { color: '#64748B', fontSize: 16, width: 25 },
  input: { flex: 1, backgroundColor: '#1E293B', borderRadius: 10, padding: 12, color: '#F8FAFC', fontSize: 16, borderWidth: 1, borderColor: '#334155' },
  bigInput: { backgroundColor: '#1E293B', borderRadius: 15, padding: 20, color: '#F8FAFC', fontSize: 24, fontWeight: 'bold', borderWidth: 2, borderColor: '#6366F1', textAlign: 'center', marginTop: 15 },
  removeBtn: { backgroundColor: '#EF4444', borderRadius: 20, width: 30, height: 30, alignItems: 'center', justifyContent: 'center' },
  removeBtnText: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
  addBtn: { backgroundColor: '#334155', padding: 12, borderRadius: 10, alignItems: 'center', borderWidth: 2, borderColor: '#6366F1', borderStyle: 'dashed' },
  addBtnText: { color: '#6366F1', fontSize: 16, fontWeight: '600' },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', padding: 20, paddingBottom: 40, backgroundColor: '#0F172A', borderTopWidth: 1, borderTopColor: '#1E293B', gap: 10 },
  backBtn: { flex: 1, backgroundColor: '#334155', padding: 15, borderRadius: 10, alignItems: 'center' },
  backBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  startBtn: { flex: 2, backgroundColor: '#6366F1', padding: 15, borderRadius: 10, alignItems: 'center' },
  disabled: { opacity: 0.5 },
  startBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  passCard: { backgroundColor: '#1E293B', borderRadius: 15, padding: 25, alignItems: 'center', marginBottom: 20, borderWidth: 2, borderColor: '#6366F1' },
  passName: { fontSize: 24, fontWeight: 'bold', color: '#F8FAFC', marginBottom: 12 },
  passInstruction: { fontSize: 16, color: '#94A3B8', textAlign: 'center', lineHeight: 24 },
  cardContainer: { backgroundColor: '#1E293B', borderRadius: 15, padding: 25, alignItems: 'center', width: '100%' },
  cardLabel: { fontSize: 14, color: '#94A3B8', marginBottom: 10 },
  cardValue: { fontSize: 36, fontWeight: 'bold', color: '#F8FAFC', textAlign: 'center' },
  resultRow: { backgroundColor: '#1E293B', padding: 16, borderRadius: 12, marginBottom: 10, flexDirection: 'row', alignItems: 'center', gap: 10 },
  winnerRow: { backgroundColor: '#2D1B0E', borderWidth: 2, borderColor: '#F59E0B' },
  rank: { color: '#64748B', fontSize: 16, width: 25 },
  resultName: { flex: 1, fontSize: 16, fontWeight: '600', color: '#F8FAFC' },
  resultCard: { fontSize: 18, fontWeight: 'bold', color: '#6366F1' },
  guessCard: { backgroundColor: '#1E293B', padding: 16, borderRadius: 12, marginBottom: 10, borderWidth: 2, borderColor: '#334155' },
  guessCardDone: { borderColor: '#10B981', backgroundColor: '#022C22' },
  guessCardText: { color: '#F8FAFC', fontSize: 16, fontWeight: '600' },
});