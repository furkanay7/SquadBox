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

const EASY_QUESTIONS: Question[] = [
  { question: 'Türkiye\'nin başkenti Ankara\'dır.', answer: true, explanation: 'Ankara, 1923\'ten beri Türkiye\'nin başkentidir.' },
  { question: 'Ay, Dünya\'nın uydusudur.', answer: true, explanation: 'Ay, Dünya\'nın tek doğal uydusudur.' },
  { question: 'Su 100 derecede kaynar.', answer: true, explanation: 'Su, deniz seviyesinde 100 derecede kaynar.' },
  { question: 'Dünya Güneş\'in etrafında döner.', answer: true, explanation: 'Dünya, Güneş\'in etrafında 365 günde bir tur atar.' },
  { question: 'İstanbul Türkiye\'nin en kalabalık şehridir.', answer: true, explanation: 'İstanbul, 15 milyonun üzerinde nüfusuyla Türkiye\'nin en kalabalık şehridir.' },
  { question: 'Balina bir balıktır.', answer: false, explanation: 'Balina, balık değil memeli bir hayvandır.' },
  { question: 'Güneş doğudan doğar.', answer: true, explanation: 'Güneş her gün doğudan doğar, batıdan batar.' },
  { question: 'Elmas, bilinen en sert doğal maddedir.', answer: true, explanation: 'Elmas, Mohs sertlik skalasında 10 puan alır.' },
  { question: 'İnsan vücudunda 206 kemik vardır.', answer: true, explanation: 'Yetişkin bir insan iskeletinde 206 kemik bulunur.' },
  { question: 'Okyanuslar, Dünya yüzeyinin yaklaşık %70\'ini kaplar.', answer: true, explanation: 'Dünya yüzeyinin yaklaşık %71\'i su ile kaplıdır.' },
];

const MEDIUM_QUESTIONS: Question[] = [
  { question: 'Venüs, Güneş\'e en yakın gezegendir.', answer: false, explanation: 'Güneş\'e en yakın gezegen Merkür\'dür.' },
  { question: 'Türkiye hem Avrupa hem Asya kıtasında yer alır.', answer: true, explanation: 'Türkiye, İstanbul Boğazı ile iki kıtaya yayılır.' },
  { question: 'Işık, sesten daha hızlı hareket eder.', answer: true, explanation: 'Işık saniyede 300.000 km, ses ise yaklaşık 340 m/s hareket eder.' },
  { question: 'Piyano 88 tuşa sahiptir.', answer: true, explanation: 'Standart bir piyano 88 tuşa sahiptir.' },
  { question: 'Fil, kara hayvanları arasında en büyük olandır.', answer: true, explanation: 'Afrika fili, karada yaşayan en büyük hayvandır.' },
  { question: 'Atlantik Okyanusu, dünyanın en büyük okyanusudur.', answer: false, explanation: 'En büyük okyanus Pasifik\'tir.' },
  { question: 'Çin, dünyanın en kalabalık ülkesidir.', answer: false, explanation: '2023 itibarıyla Hindistan, Çin\'i geçerek en kalabalık ülke oldu.' },
  { question: 'Japon bayrağında yıldız vardır.', answer: false, explanation: 'Japon bayrağında beyaz zemin üzerinde kırmızı daire vardır.' },
  { question: 'DNA çift sarmal yapısındadır.', answer: true, explanation: 'DNA, Watson ve Crick tarafından keşfedilen çift sarmal yapıya sahiptir.' },
  { question: 'Osmanlı İmparatorluğu 600 yıldan fazla sürdü.', answer: true, explanation: 'Osmanlı İmparatorluğu 1299-1922 yılları arasında yaklaşık 623 yıl sürdü.' },
];

const HARD_QUESTIONS: Question[] = [
  { question: 'Işığın vakumdaki hızı saniyede 299.792 km\'dir.', answer: true, explanation: 'Işığın vakumdaki hızı tam olarak 299.792.458 m/s\'dir.' },
  { question: 'Dünyanın en derin gölü Hazar Gölü\'dür.', answer: false, explanation: 'Dünyanın en derin gölü Rusya\'daki Baykal Gölü\'dür.' },
  { question: 'Periyodik tabloda 118 element bulunur.', answer: true, explanation: '2016 yılında onaylanan 4 yeni elementle toplam 118 element tamamlandı.' },
  { question: 'Türkiye\'de 81 il bulunmaktadır.', answer: true, explanation: 'Türkiye 81 ilden oluşmaktadır.' },
  { question: 'Kuantum mekaniğinde Schrödinger\'in kedisi bir düşünce deneyidir.', answer: true, explanation: 'Erwin Schrödinger, 1935\'te bu ünlü düşünce deneyini ortaya attı.' },
  { question: 'İnsan genomu yaklaşık 3 milyar baz çiftinden oluşur.', answer: true, explanation: 'İnsan genomu yaklaşık 3,2 milyar baz çifti içerir.' },
  { question: 'Güneş sistemi Samanyolu\'nun merkezinde yer alır.', answer: false, explanation: 'Güneş sistemi, Samanyolu\'nun merkezinden yaklaşık 26.000 ışık yılı uzaktadır.' },
  { question: 'Fibonacci dizisinde her sayı kendinden önceki iki sayının toplamıdır.', answer: true, explanation: 'Fibonacci dizisi: 0, 1, 1, 2, 3, 5, 8, 13... şeklinde devam eder.' },
  { question: 'Dünyanın manyetik kuzey kutbu ile coğrafi kuzey kutbu aynı noktadadır.', answer: false, explanation: 'Manyetik ve coğrafi kuzey kutupları farklı konumlardadır ve manyetik kutup zamanla kayar.' },
  { question: 'ATP, hücrelerin temel enerji molekülüdür.', answer: true, explanation: 'Adenozin trifosfat (ATP), hücresel enerji transferinin temel molekülüdür.' },
];

export const TrueFalseScreen: React.FC<TrueFalseScreenProps> = ({ navigation }) => {
  const [phase, setPhase] = useState<'setup' | 'playing' | 'result'>('setup');
  const [playerNames, setPlayerNames] = useState(['', '']);
  const [gameMode, setGameMode] = useState<'classic' | 'ai'>('classic');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
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
        body: JSON.stringify({ topic: aiTopic.trim(), count: 15, difficulty }),
      });
      if (!response.ok) throw new Error('AI hatası');
      const data = await response.json();
      startPlaying(data.questions, validNames);
    } catch {
      Alert.alert('Hata', 'Sorular üretilemedi.');
    } finally {
      setIsGenerating(false);
    }
  };

  const startClassic = () => {
    const validNames = playerNames.filter(n => n.trim() !== '');
    if (validNames.length < 2) {
      Alert.alert('Eksik Oyuncu', 'En az 2 oyuncu gerekli!');
      return;
    }
    const questionPool = difficulty === 'easy' ? EASY_QUESTIONS : difficulty === 'hard' ? HARD_QUESTIONS : MEDIUM_QUESTIONS;
    const shuffled = [...questionPool].sort(() => Math.random() - 0.5);
    startPlaying(shuffled, validNames);
  };

  const startPlaying = (qs: Question[], names: string[]) => {
    setQuestions(qs);
    setScores(new Array(names.length).fill(0));
    setCurrentIndex(0);
    setCurrentPlayerIndex(0);
    setAnswered(false);
    setWasCorrect(null);
    setPhase('playing');
  };

  const handleAnswer = (answer: boolean) => {
    if (answered) return;
    const correct = answer === questions[currentIndex].answer;
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

  // ── SETUP ──────────────────────────────────────────
  if (phase === 'setup') {
    return (
      <View style={s.container}>
        <View style={s.header}>
          <Text style={s.title}>Doğru mu Yanlış mı?</Text>
          <Text style={s.subtitle}>Soruları cevapla, puan kazan!</Text>
        </View>

        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 120 }}>
          <Text style={s.label}>Oyun Modu</Text>
          <View style={s.modeRow}>
            <TouchableOpacity
              style={[s.modeBtn, gameMode === 'classic' && s.modeBtnActive]}
              onPress={() => setGameMode('classic')}
            >
              <Text style={s.modeIcon}>📚</Text>
              <Text style={[s.modeName, gameMode === 'classic' && s.modeNameActive]}>Klasik</Text>
              <Text style={s.modeDesc}>Genel kültür</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.modeBtn, gameMode === 'ai' && s.modeBtnActiveAI]}
              onPress={() => setGameMode('ai')}
            >
              <Text style={s.modeIcon}>🤖</Text>
              <Text style={[s.modeName, gameMode === 'ai' && s.modeNameActive]}>AI Modu</Text>
              <Text style={s.modeDesc}>Kendi konunu seç</Text>
            </TouchableOpacity>
          </View>

          {gameMode === 'ai' && (
            <View style={s.aiBox}>
              <Text style={s.aiLabel}>🤖 Konu Gir</Text>
              <TextInput
                style={s.aiInput}
                placeholder="Örn: Türk Tarihi, Bilim, Futbol..."
                placeholderTextColor="#64748B"
                value={aiTopic}
                onChangeText={setAiTopic}
              />
            </View>
          )}

          <Text style={[s.label, { marginTop: 20 }]}>Zorluk</Text>
          <View style={s.modeRow}>
            {(['easy', 'medium', 'hard'] as const).map((d) => (
              <TouchableOpacity
                key={d}
                style={[s.modeBtn, difficulty === d && s.modeBtnActive]}
                onPress={() => setDifficulty(d)}
              >
                <Text style={s.modeIcon}>
                  {d === 'easy' ? '😊' : d === 'medium' ? '🤔' : '🔥'}
                </Text>
                <Text style={[s.modeName, difficulty === d && s.modeNameActive]}>
                  {d === 'easy' ? 'Kolay' : d === 'medium' ? 'Orta' : 'Zor'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={[s.label, { marginTop: 20 }]}>Oyuncular</Text>
          <Text style={s.hint}>En az 2 oyuncu gerekli</Text>
          {playerNames.map((name, i) => (
            <View key={i} style={s.playerRow}>
              <Text style={s.playerNum}>{i + 1}.</Text>
              <TextInput
                style={s.input}
                placeholder={`Oyuncu ${i + 1}`}
                placeholderTextColor="#64748B"
                value={name}
                onChangeText={t => updateName(i, t)}
              />
              <TouchableOpacity style={s.removeBtn} onPress={() => removePlayer(i)}>
                <Text style={s.removeBtnText}>×</Text>
              </TouchableOpacity>
            </View>
          ))}
          <TouchableOpacity style={s.addBtn} onPress={addPlayer}>
            <Text style={s.addBtnText}>+ Oyuncu Ekle</Text>
          </TouchableOpacity>
        </ScrollView>

        <View style={s.footer}>
          <TouchableOpacity style={s.secondaryBtn} onPress={() => navigation.goBack()}>
            <Text style={s.secondaryBtnText}>Geri</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[s.primaryBtn, isGenerating && s.disabled]}
            onPress={gameMode === 'ai' ? generateQuestions : startClassic}
            disabled={isGenerating}
          >
            {isGenerating
              ? <ActivityIndicator color="#fff" />
              : <Text style={s.primaryBtnText}>
                  {gameMode === 'ai' ? '🤖 Soruları Üret' : 'Başlat'}
                </Text>
            }
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ── PLAYING ────────────────────────────────────────
  if (phase === 'playing') {
    const current = questions[currentIndex];
    const currentPlayer = validNames[currentPlayerIndex];

    return (
      <View style={s.container}>
        <View style={s.header}>
          <Text style={s.title}>Doğru mu Yanlış mı?</Text>
          <Text style={s.subtitle}>Soru {currentIndex + 1}/{questions.length}</Text>
        </View>

        <View style={s.scoreboard}>
          {validNames.map((name, idx) => (
            <View key={idx} style={[s.scoreChip, idx === currentPlayerIndex && s.scoreChipActive]}>
              <Text style={s.scoreChipName}>{name}</Text>
              <Text style={s.scoreChipValue}>{scores[idx]}</Text>
            </View>
          ))}
        </View>

        <View style={s.playerBanner}>
          <Text style={s.playerBannerText}>🎯 {currentPlayer}'in sırası</Text>
        </View>

        <View style={s.questionCard}>
          <Text style={s.questionText}>{current.question}</Text>
        </View>

        {!answered ? (
          <View style={s.answerRow}>
            <TouchableOpacity style={[s.answerBtn, { backgroundColor: '#10B981' }]} onPress={() => handleAnswer(true)}>
              <Text style={s.answerBtnText}>✓ DOĞRU</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[s.answerBtn, { backgroundColor: '#EF4444' }]} onPress={() => handleAnswer(false)}>
              <Text style={s.answerBtnText}>✗ YANLIŞ</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={s.resultCard}>
            <Text style={[s.resultText, wasCorrect ? s.correct : s.wrong]}>
              {wasCorrect ? '🎉 Doğru!' : '❌ Yanlış!'}
            </Text>
            <Text style={s.explanationText}>{current.explanation}</Text>
            <TouchableOpacity style={s.nextBtn} onPress={nextQuestion}>
              <Text style={s.nextBtnText}>
                {currentIndex >= questions.length - 1 ? 'Sonuçları Gör' : 'Sonraki →'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ flexDirection: 'row', paddingHorizontal: 20, gap: 10, marginTop: 10 }}>
  <TouchableOpacity 
    style={[s.secondaryBtn, { flex: 1 }]} 
    onPress={() => navigation.goBack()}
  >
    <Text style={s.secondaryBtnText}>← Geri</Text>
  </TouchableOpacity>
  <TouchableOpacity 
    style={[s.secondaryBtn, { flex: 1 }]} 
    onPress={() => navigation.navigate('Home')}
  >
    <Text style={s.secondaryBtnText}>Ana Menü</Text>
  </TouchableOpacity>
</View>
      </View>
    );
  }

  // ── RESULT ─────────────────────────────────────────
  if (phase === 'result') {
    const sorted = validNames
      .map((name, idx) => ({ name, score: scores[idx] }))
      .sort((a, b) => b.score - a.score);

    return (
      <View style={s.container}>
        <View style={s.header}>
          <Text style={s.title}>🏆 Sonuçlar</Text>
          {gameMode === 'ai' && <Text style={s.subtitle}>{aiTopic}</Text>}
        </View>

        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 120 }}>
          {sorted.map((item, idx) => (
            <View key={idx} style={[s.scoreRow, idx === 0 && s.scoreRowWinner]}>
              <Text style={s.scoreRank}>{idx + 1}.</Text>
              <Text style={s.scoreName}>{item.name}</Text>
              <Text style={s.scoreValue}>{item.score} puan</Text>
              {idx === 0 && <Text style={{ fontSize: 20 }}>👑</Text>}
            </View>
          ))}
        </ScrollView>

        <View style={s.footer}>
          <TouchableOpacity style={s.secondaryBtn} onPress={() => setPhase('setup')}>
            <Text style={s.secondaryBtnText}>Tekrar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.primaryBtn} onPress={() => navigation.navigate('Home')}>
            <Text style={s.primaryBtnText}>Ana Menü</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return null;
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background.primary },
  header: { paddingTop: 60, paddingHorizontal: 20, alignItems: 'center', marginBottom: 15 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#F8FAFC', marginBottom: 6 },
  subtitle: { fontSize: 16, color: theme.colors.primary.main, fontWeight: '600' },
  label: { fontSize: 18, fontWeight: '600', color: '#F8FAFC', marginBottom: 12 },
  hint: { fontSize: 14, color: '#F59E0B', marginBottom: 10, fontStyle: 'italic' },
  modeRow: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  modeBtn: { flex: 1, backgroundColor: '#1E293B', borderRadius: 12, padding: 14, alignItems: 'center', borderWidth: 2, borderColor: '#334155' },
  modeBtnActive: { borderColor: '#6366F1', backgroundColor: '#1E1B4B' },
  modeBtnActiveAI: { borderColor: '#10B981', backgroundColor: '#022C22' },
  modeIcon: { fontSize: 24, marginBottom: 6 },
  modeName: { fontSize: 14, fontWeight: 'bold', color: '#94A3B8', marginBottom: 2 },
  modeNameActive: { color: '#FFFFFF' },
  modeDesc: { fontSize: 11, color: '#64748B', textAlign: 'center' },
  aiBox: { backgroundColor: '#022C22', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#10B981', marginBottom: 10 },
  aiLabel: { fontSize: 14, color: '#10B981', fontWeight: '600', marginBottom: 8 },
  aiInput: { backgroundColor: '#1E293B', borderRadius: 10, padding: 12, color: '#F8FAFC', fontSize: 16, borderWidth: 1, borderColor: '#334155' },
  playerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 10 },
  playerNum: { color: '#64748B', fontSize: 16, width: 25 },
  input: { flex: 1, backgroundColor: '#1E293B', borderRadius: 10, padding: 12, color: '#F8FAFC', fontSize: 16, borderWidth: 1, borderColor: '#334155' },
  removeBtn: { backgroundColor: '#EF4444', borderRadius: 20, width: 30, height: 30, alignItems: 'center', justifyContent: 'center' },
  removeBtnText: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
  addBtn: { backgroundColor: '#334155', padding: 12, borderRadius: 10, alignItems: 'center', borderWidth: 2, borderColor: '#6366F1', borderStyle: 'dashed', marginTop: 8 },
  addBtnText: { color: '#6366F1', fontSize: 16, fontWeight: '600' },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', padding: 20, paddingBottom: 40, backgroundColor: '#0F172A', borderTopWidth: 1, borderTopColor: '#1E293B', gap: 10 },
  secondaryBtn: { flex: 1, backgroundColor: '#334155', padding: 15, borderRadius: 10, alignItems: 'center' },
  secondaryBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  primaryBtn: { flex: 2, backgroundColor: '#6366F1', padding: 15, borderRadius: 10, alignItems: 'center' },
  primaryBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  disabled: { opacity: 0.5 },
  scoreboard: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 20, gap: 8, marginBottom: 12 },
  scoreChip: { backgroundColor: '#1E293B', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 2, borderColor: '#334155' },
  scoreChipActive: { borderColor: '#6366F1', backgroundColor: '#1E1B4B' },
  scoreChipName: { color: '#94A3B8', fontSize: 12 },
  scoreChipValue: { color: '#F8FAFC', fontSize: 18, fontWeight: 'bold', textAlign: 'center' },
  playerBanner: { backgroundColor: '#1E293B', marginHorizontal: 20, padding: 12, borderRadius: 10, alignItems: 'center', marginBottom: 12 },
  playerBannerText: { color: '#F8FAFC', fontSize: 16, fontWeight: '600' },
  questionCard: { backgroundColor: '#FFFFFF', marginHorizontal: 20, borderRadius: 20, padding: 28, minHeight: 140, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  questionText: { fontSize: 18, fontWeight: '600', color: '#1E293B', textAlign: 'center', lineHeight: 26 },
  answerRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 12 },
  answerBtn: { flex: 1, padding: 18, borderRadius: 14, alignItems: 'center' },
  answerBtnText: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
  resultCard: { backgroundColor: '#1E293B', marginHorizontal: 20, borderRadius: 15, padding: 20, alignItems: 'center' },
  resultText: { fontSize: 22, fontWeight: 'bold', marginBottom: 8 },
  correct: { color: '#10B981' },
  wrong: { color: '#EF4444' },
  explanationText: { fontSize: 14, color: '#94A3B8', textAlign: 'center', lineHeight: 20, marginBottom: 14 },
  nextBtn: { backgroundColor: '#6366F1', padding: 13, borderRadius: 10, alignItems: 'center', width: '100%' },
  nextBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: 'bold' },
  menuBtn: { alignSelf: 'center', padding: 12, marginTop: 10 },
  menuBtnText: { color: '#64748B', fontSize: 14 },
  scoreRow: { backgroundColor: '#1E293B', padding: 16, borderRadius: 12, marginBottom: 10, flexDirection: 'row', alignItems: 'center', gap: 10 },
  scoreRowWinner: { backgroundColor: '#2D1B0E', borderWidth: 2, borderColor: '#F59E0B' },
  scoreRank: { color: '#64748B', fontSize: 16, width: 25 },
  scoreName: { flex: 1, fontSize: 16, fontWeight: '600', color: '#F8FAFC' },
  scoreValue: { fontSize: 18, fontWeight: 'bold', color: '#6366F1' },
});