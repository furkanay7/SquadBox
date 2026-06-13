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

export const WhoIsItScreen: React.FC<WhoIsItScreenProps> = ({ navigation }) => {
  const [phase, setPhase] = useState<'setup' | 'playing' | 'result'>('setup');
  const [playerNames, setPlayerNames] = useState(['', '', '']);
  const [gameMode, setGameMode] = useState<'classic' | 'ai'>('classic');
  const [aiTopic, setAiTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [showCard, setShowCard] = useState(false);
  const [waitingForPass, setWaitingForPass] = useState(false);

  const addPlayer = () => {
    if (playerNames.length >= 10) return;
    setPlayerNames([...playerNames, '']);
  };

  const removePlayer = (index: number) => {
    if (playerNames.length <= 3) return;
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
    if (validNames.length < 3) {
      Alert.alert('Eksik Oyuncu', 'En az 3 oyuncu gerekli!');
      return;
    }

    let cards: string[] = [];

    if (gameMode === 'ai') {
      if (!aiTopic.trim()) {
        Alert.alert('Konu Gerekli', 'AI modu için konu girin!');
        return;
      }
      setIsGenerating(true);
      const aiCards = await generateAICards(aiTopic.trim(), validNames.length);
      setIsGenerating(false);
      if (!aiCards) {
        Alert.alert('Hata', 'AI kartları üretilemedi.');
        return;
      }
      cards = aiCards;
    } else {
      const shuffled = [...DEFAULT_CARDS].sort(() => Math.random() - 0.5);
      cards = shuffled.slice(0, validNames.length);
    }

    const newPlayers: Player[] = validNames.map((name, idx) => ({
      id: idx.toString(),
      name,
      card: cards[idx] || DEFAULT_CARDS[idx % DEFAULT_CARDS.length],
      hasGuessed: false,
    }));

    setPlayers(newPlayers);
    setCurrentPlayerIndex(0);
    setShowCard(false);
    setWaitingForPass(false);
    setPhase('playing');
  };

  const handleShowCard = () => setShowCard(true);

  const handleReady = () => {
    setShowCard(false);
    setWaitingForPass(false);
    if (currentPlayerIndex < players.length - 1) {
      setCurrentPlayerIndex(prev => prev + 1);
    } else {
      Alert.alert('Herkes Hazır!', 'Oyun başlıyor! Sorular sormaya başlayın.', [
        { text: 'Tamam' }
      ]);
    }
  };

  const handleGuessed = (playerIndex: number) => {
    const updated = [...players];
    updated[playerIndex].hasGuessed = true;
    setPlayers(updated);

    const allGuessed = updated.every(p => p.hasGuessed);
    if (allGuessed) {
      setPhase('result');
    }
  };

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
              <Text style={styles.modeDesc}>Hazır ünlüler</Text>
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

          <Text style={styles.sectionTitle}>Oyuncular</Text>
          <Text style={styles.hint}>En az 3 oyuncu gerekli</Text>
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
            style={[styles.startBtn, isGenerating && styles.startBtnDisabled]}
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

  if (phase === 'playing') {
    const current = players[currentPlayerIndex];
    const allReady = currentPlayerIndex >= players.length;

    if (allReady) {
      return (
        <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
          <Text style={styles.title}>🎮 Oyun Başladı!</Text>
          <Text style={[styles.subtitle, { textAlign: 'center', marginHorizontal: 20, marginTop: 10 }]}>
            Herkes kartını gördü. Birbirinize sorular sorarak kendi kartınızı tahmin etmeye çalışın!
          </Text>
          <Text style={[styles.hint, { marginTop: 20, textAlign: 'center' }]}>
            Sorulara sadece Evet/Hayır cevabı verilebilir.
          </Text>

          <View style={{ marginTop: 40, width: '100%', paddingHorizontal: 20 }}>
            <Text style={styles.sectionTitle}>Kim Tahmin Etti?</Text>
            {players.map((player, idx) => (
              <TouchableOpacity
                key={idx}
                style={[styles.guessCard, player.hasGuessed && styles.guessCardDone]}
                onPress={() => !player.hasGuessed && handleGuessed(idx)}
                disabled={player.hasGuessed}
              >
                <Text style={styles.guessCardText}>
                  {player.hasGuessed ? '✅' : '⬜'} {player.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={[styles.backBtn, { marginTop: 30 }]} onPress={() => navigation.goBack()}>
            <Text style={styles.backBtnText}>Ana Menü</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Ben Kimim?</Text>
          <Text style={styles.subtitle}>
            Oyuncu {currentPlayerIndex + 1}/{players.length}
          </Text>
        </View>

        <View style={styles.passCard}>
          <Text style={styles.passName}>{current.name}</Text>
          <Text style={styles.passInstruction}>
            Telefonu {current.name}'e ver.{'\n'}Hazır olduğunda butona bas.
          </Text>
        </View>

        {!showCard ? (
          <TouchableOpacity style={styles.revealBtn} onPress={handleShowCard}>
            <Text style={styles.revealBtnText}>KARTI GÖSTER</Text>
            <Text style={styles.revealBtnSub}>Başkası görmesin!</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.cardContainer}>
            <Text style={styles.cardLabel}>Senin Kartin:</Text>
            <Text style={styles.cardValue}>{current.card}</Text>
            <Text style={styles.cardHint}>Bu kartı alnına yapıştır veya unutma!</Text>
            <TouchableOpacity style={styles.readyBtn} onPress={handleReady}>
              <Text style={styles.readyBtnText}>Gördüm, Hazırım ✓</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  }

  if (phase === 'result') {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={[styles.title, { fontSize: 40 }]}>🎉</Text>
        <Text style={styles.title}>Oyun Bitti!</Text>
        <Text style={[styles.subtitle, { marginTop: 10, marginBottom: 30 }]}>Herkes kartını tahmin etti!</Text>

        <View style={{ width: '100%', paddingHorizontal: 20 }}>
          {players.map((player, idx) => (
            <View key={idx} style={styles.resultRow}>
              <Text style={styles.resultName}>{player.name}</Text>
              <Text style={styles.resultCard}>{player.card}</Text>
            </View>
          ))}
        </View>

        <View style={[styles.footer, { position: 'relative', marginTop: 30 }]}>
          <TouchableOpacity style={styles.backBtn} onPress={() => setPhase('setup')}>
            <Text style={styles.backBtnText}>Tekrar Oyna</Text>
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
  aiContainer: { backgroundColor: '#022C22', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#10B981', marginBottom: 20 },
  aiLabel: { fontSize: 14, color: '#10B981', fontWeight: '600', marginBottom: 8 },
  aiInput: { backgroundColor: '#1E293B', borderRadius: 10, padding: 12, color: '#F8FAFC', fontSize: 16, borderWidth: 1, borderColor: '#334155', marginBottom: 8 },
  aiHint: { fontSize: 12, color: '#64748B' },
  playerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 10 },
  playerNum: { color: '#64748B', fontSize: 16, width: 25 },
  input: { flex: 1, backgroundColor: '#1E293B', borderRadius: 10, padding: 12, color: '#F8FAFC', fontSize: 16, borderWidth: 1, borderColor: '#334155' },
  removeBtn: { backgroundColor: '#EF4444', borderRadius: 20, width: 30, height: 30, alignItems: 'center', justifyContent: 'center' },
  removeBtnText: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
  addBtn: { backgroundColor: '#334155', padding: 12, borderRadius: 10, alignItems: 'center', borderWidth: 2, borderColor: '#6366F1', borderStyle: 'dashed' },
  addBtnText: { color: '#6366F1', fontSize: 16, fontWeight: '600' },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', padding: 20, paddingBottom: 40, backgroundColor: '#0F172A', borderTopWidth: 1, borderTopColor: '#1E293B', gap: 10 },
  backBtn: { flex: 1, backgroundColor: '#334155', padding: 15, borderRadius: 10, alignItems: 'center' },
  backBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  startBtn: { flex: 2, backgroundColor: '#6366F1', padding: 15, borderRadius: 10, alignItems: 'center' },
  startBtnDisabled: { opacity: 0.6 },
  startBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  passCard: { backgroundColor: '#1E293B', borderRadius: 15, padding: 25, alignItems: 'center', marginHorizontal: 20, marginBottom: 20, borderWidth: 2, borderColor: '#6366F1' },
  passName: { fontSize: 28, fontWeight: 'bold', color: '#F8FAFC', marginBottom: 12 },
  passInstruction: { fontSize: 16, color: '#94A3B8', textAlign: 'center', lineHeight: 24 },
  revealBtn: { backgroundColor: '#6366F1', marginHorizontal: 20, padding: 25, borderRadius: 15, alignItems: 'center' },
  revealBtnText: { color: '#FFFFFF', fontSize: 22, fontWeight: 'bold' },
  revealBtnSub: { color: 'rgba(255,255,255,0.7)', fontSize: 14, marginTop: 8 },
  cardContainer: { backgroundColor: '#1E293B', marginHorizontal: 20, borderRadius: 15, padding: 25, alignItems: 'center' },
  cardLabel: { fontSize: 14, color: '#94A3B8', marginBottom: 10 },
  cardValue: { fontSize: 36, fontWeight: 'bold', color: '#F8FAFC', marginBottom: 10, textAlign: 'center' },
  cardHint: { fontSize: 14, color: '#64748B', textAlign: 'center', marginBottom: 20 },
  readyBtn: { backgroundColor: '#10B981', padding: 15, borderRadius: 10, alignItems: 'center', width: '100%' },
  readyBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  guessCard: { backgroundColor: '#1E293B', padding: 16, borderRadius: 12, marginBottom: 10, borderWidth: 2, borderColor: '#334155' },
  guessCardDone: { borderColor: '#10B981', backgroundColor: '#022C22' },
  guessCardText: { color: '#F8FAFC', fontSize: 16, fontWeight: '600' },
  resultRow: { backgroundColor: '#1E293B', padding: 16, borderRadius: 12, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  resultName: { fontSize: 16, fontWeight: '600', color: '#F8FAFC' },
  resultCard: { fontSize: 16, color: '#6366F1', fontWeight: 'bold' },
});