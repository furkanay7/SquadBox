import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  TextInput, ScrollView, Alert, ActivityIndicator,
} from 'react-native';
import { theme } from '../theme/theme';

interface Question {
  question: string;
  answer: boolean;
  explanation: string;
}

interface TrueFalseScreenProps {
  navigation: any;
}

export const TrueFalseScreen: React.FC<TrueFalseScreenProps> = ({ navigation }) => {
  const [phase, setPhase] = useState<'setup' | 'playing' | 'result'>('setup');
  const [playerNames, setPlayerNames] = useState(['', '']);
  const [aiTopic, setAiTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [scores, setScores] = useState<number[]>([]);
  const [answered, setAnswered] = useState(false);
  const [wasCorrect, setWasCorrect] = useState<boolean | null>(null);

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

  const generateQuestions = async () => {
    const validNames = playerNames.filter(n => n.trim() !== '');
    if (validNames.length < 2) {
      Alert.alert('Eksik Oyuncu', 'En az 2 oyuncu gerekli!');
      return;
    }
    if (!aiTopic.trim()) {
      Alert.alert('Konu Gerekli', 'Bir konu girin!');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('https://squadbox-production.up.railway.app/api/v1/ai/generate/truefalse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: aiTopic.trim(), count: 15 }),
      });
      if (!response.ok) throw new Error('AI hatası');
      const data = await response.json();
      setQuestions(data.questions);
      setScores(new Array(validNames.length).fill(0));
      setCurrentIndex(0);
      setCurrentPlayerIndex(0);
      setAnswered(false);
      setWasCorrect(null);
      setPhase('playing');
    } catch {
      Alert.alert('Hata', 'Sorular üretilemedi. Bağlantınızı kontrol edin.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAnswer = (answer: boolean) => {
    if (answered) return;
    const current = questions[currentIndex];
    const correct = answer === current.answer;
    setAnswered(true);
    setWasCorrect(correct);

    if (correct) {
      const newScores = [...scores];
      newScores[currentPlayerIndex] += 1;
      setScores(newScores);
    }
  };

  const nextQuestion = () => {
    if (currentIndex >= questions.length - 1) {
      setPhase('result');
      return;
    }
    const validNames = playerNames.filter(n => n.trim() !== '');
    setCurrentPlayerIndex((currentPlayerIndex + 1) % validNames.length);
    setCurrentIndex(currentIndex + 1);
    setAnswered(false);
    setWasCorrect(null);
  };

  const validNames = playerNames.filter(n => n.trim() !== '');

  if (phase === 'setup') {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Doğru mu Yanlış mı?</Text>
          <Text style={styles.subtitle}>AI sorular üretsin, sen cevapla!</Text>
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={{ padding: 20 }}>
          <View style={styles.aiContainer}>
            <Text style={styles.aiLabel}>🤖 Konu Gir</Text>
            <TextInput
              style={styles.aiInput}
              placeholder="Örn: Türk Tarihi, Bilim, Futbol..."
              placeholderTextColor="#64748B"
              value={aiTopic}
              onChangeText={setAiTopic}
            />
            <Text style={styles.aiHint}>AI bu konuya özel 15 soru üretecek</Text>
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
            onPress={generateQuestions}
            disabled={isGenerating}
          >
            {isGenerating
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.startBtnText}>🤖 Soruları Üret</Text>
            }
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (phase === 'playing') {
    const current = questions[currentIndex];
    const currentPlayer = validNames[currentPlayerIndex];

    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Doğru mu Yanlış mı?</Text>
          <Text style={styles.subtitle}>Soru {currentIndex + 1}/{questions.length}</Text>
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

        <View style={styles.questionCard}>
          <Text style={styles.questionText}>{current.question}</Text>
        </View>

        {!answered ? (
          <View style={styles.answerButtons}>
            <TouchableOpacity style={styles.trueBtn} onPress={() => handleAnswer(true)}>
              <Text style={styles.answerBtnText}>✓ DOĞRU</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.falseBtn} onPress={() => handleAnswer(false)}>
              <Text style={styles.answerBtnText}>✗ YANLIŞ</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.resultCard}>
            <Text style={[styles.resultText, wasCorrect ? styles.correct : styles.wrong]}>
              {wasCorrect ? '🎉 Doğru!' : '❌ Yanlış!'}
            </Text>
            <Text style={styles.explanationText}>{current.explanation}</Text>
            <TouchableOpacity style={styles.nextBtn} onPress={nextQuestion}>
              <Text style={styles.nextBtnText}>
                {currentIndex >= questions.length - 1 ? 'Sonuçları Gör' : 'Sonraki Soru →'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
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
        <Text style={[styles.subtitle, { marginBottom: 30 }]}>Konu: {aiTopic}</Text>

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
  subtitle: { fontSize: 16, color: theme.colors.primary.main, fontWeight: '600' },
  scroll: { flex: 1 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#F8FAFC', marginBottom: 12 },
  hint: { fontSize: 14, color: '#F59E0B', marginBottom: 10, fontStyle: 'italic' },
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
  disabled: { opacity: 0.6 },
  startBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  scoreboard: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 20, gap: 8, marginBottom: 15 },
  scoreItem: { backgroundColor: '#1E293B', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 2, borderColor: '#334155' },
  scoreItemActive: { borderColor: '#6366F1', backgroundColor: '#1E1B4B' },
  scoreName: { color: '#94A3B8', fontSize: 12 },
  scoreValue: { color: '#F8FAFC', fontSize: 18, fontWeight: 'bold', textAlign: 'center' },
  playerBanner: { backgroundColor: '#1E293B', marginHorizontal: 20, padding: 12, borderRadius: 10, alignItems: 'center', marginBottom: 15 },
  playerBannerText: { color: '#F8FAFC', fontSize: 16, fontWeight: '600' },
  questionCard: { backgroundColor: '#FFFFFF', marginHorizontal: 20, borderRadius: 20, padding: 30, minHeight: 150, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  questionText: { fontSize: 20, fontWeight: '600', color: '#1E293B', textAlign: 'center', lineHeight: 28 },
  answerButtons: { flexDirection: 'row', paddingHorizontal: 20, gap: 15 },
  trueBtn: { flex: 1, backgroundColor: '#10B981', padding: 20, borderRadius: 15, alignItems: 'center' },
  falseBtn: { flex: 1, backgroundColor: '#EF4444', padding: 20, borderRadius: 15, alignItems: 'center' },
  answerBtnText: { color: '#FFFFFF', fontSize: 20, fontWeight: 'bold' },
  resultCard: { backgroundColor: '#1E293B', marginHorizontal: 20, borderRadius: 15, padding: 20, alignItems: 'center' },
  resultText: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  correct: { color: '#10B981' },
  wrong: { color: '#EF4444' },
  explanationText: { fontSize: 14, color: '#94A3B8', textAlign: 'center', lineHeight: 20, marginBottom: 15 },
  nextBtn: { backgroundColor: '#6366F1', padding: 14, borderRadius: 10, alignItems: 'center', width: '100%' },
  nextBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  resultRow: { backgroundColor: '#1E293B', padding: 16, borderRadius: 12, marginBottom: 10, flexDirection: 'row', alignItems: 'center', gap: 10 },
  winnerRow: { backgroundColor: '#2D1B0E', borderWidth: 2, borderColor: '#F59E0B' },
  rank: { color: '#64748B', fontSize: 16, width: 25 },
  resultName: { flex: 1, fontSize: 16, fontWeight: '600', color: '#F8FAFC' },
  resultScore: { fontSize: 18, fontWeight: 'bold', color: '#6366F1' },
  crown: { fontSize: 20 },
});