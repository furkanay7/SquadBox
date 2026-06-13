import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  TextInput, ScrollView, Alert, ActivityIndicator,
} from 'react-native';
import { theme } from '../theme/theme';

interface Player {
  name: string;
  role: string;
  isAlive: boolean;
}

interface WerewolfScreenProps {
  navigation: any;
}

const CLASSIC_ROLES = {
  vampire: 'Vampir',
  villager: 'Köylü',
  doctor: 'Doktor',
  seer: 'Kahin',
  hunter: 'Avcı',
};

export const WerewolfScreen: React.FC<WerewolfScreenProps> = ({ navigation }) => {
  const [phase, setPhase] = useState<'setup' | 'roleReveal' | 'playing' | 'result'>('setup');
  const [playerNames, setPlayerNames] = useState(['', '', '', '', '']);
  const [gameMode, setGameMode] = useState<'classic' | 'ai'>('classic');
  const [aiTheme, setAiTheme] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentRevealIndex, setCurrentRevealIndex] = useState(0);
  const [showRole, setShowRole] = useState(false);
  const [hasSeenRole, setHasSeenRole] = useState<boolean[]>([]);
  const [dayCount, setDayCount] = useState(1);
  const [gamePhase, setGamePhase] = useState<'night' | 'day'>('night');
  const [eliminatedIndex, setEliminatedIndex] = useState<number | null>(null);
  const [aiRoles, setAiRoles] = useState<string[]>([]);

  const addPlayer = () => {
    if (playerNames.length >= 15) return;
    setPlayerNames([...playerNames, '']);
  };

  const removePlayer = (index: number) => {
    if (playerNames.length <= 5) return;
    setPlayerNames(playerNames.filter((_, i) => i !== index));
  };

  const updateName = (index: number, name: string) => {
    const updated = [...playerNames];
    updated[index] = name;
    setPlayerNames(updated);
  };

  const assignRoles = (names: string[], customRoles?: string[]) => {
    const count = names.length;
    let roles: string[] = [];

    if (customRoles && customRoles.length > 0) {
      roles = [...customRoles];
      while (roles.length < count) roles.push('Köylü');
      roles = roles.slice(0, count);
    } else {
      const vampireCount = Math.max(1, Math.floor(count / 4));
      const hasSeer = count >= 6;
      const hasDoctor = count >= 7;
      const hasHunter = count >= 9;

      for (let i = 0; i < vampireCount; i++) roles.push(CLASSIC_ROLES.vampire);
      if (hasSeer) roles.push(CLASSIC_ROLES.seer);
      if (hasDoctor) roles.push(CLASSIC_ROLES.doctor);
      if (hasHunter) roles.push(CLASSIC_ROLES.hunter);
      while (roles.length < count) roles.push(CLASSIC_ROLES.villager);
    }

    const shuffledRoles = roles.sort(() => Math.random() - 0.5);
    return names.map((name, idx) => ({
      name,
      role: shuffledRoles[idx],
      isAlive: true,
    }));
  };

  const generateAIRoles = async (theme: string, count: number) => {
    try {
      const response = await fetch('https://squadbox-production.up.railway.app/api/v1/ai/generate/werewolf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme, count }),
      });
      if (!response.ok) throw new Error('AI hatası');
      const data = await response.json();
      return data.roles;
    } catch {
      return null;
    }
  };

  const startGame = async () => {
    const validNames = playerNames.filter(n => n.trim() !== '');
    if (validNames.length < 5) {
      Alert.alert('Eksik Oyuncu', 'En az 5 oyuncu gerekli!');
      return;
    }

    let newPlayers: Player[] = [];

    if (gameMode === 'ai') {
      if (!aiTheme.trim()) {
        Alert.alert('Tema Gerekli', 'AI modu için tema girin!');
        return;
      }
      setIsGenerating(true);
      const roles = await generateAIRoles(aiTheme.trim(), validNames.length);
      setIsGenerating(false);
      if (!roles) {
        Alert.alert('Hata', 'AI rolleri üretilemedi.');
        return;
      }
      setAiRoles(roles);
      newPlayers = assignRoles(validNames, roles);
    } else {
      newPlayers = assignRoles(validNames);
    }

    setPlayers(newPlayers);
    setCurrentRevealIndex(0);
    setShowRole(false);
    setHasSeenRole(new Array(validNames.length).fill(false));
    setDayCount(1);
    setGamePhase('night');
    setPhase('roleReveal');
  };

  const handleShowRole = () => setShowRole(true);

  const handleNextPlayer = () => {
    const newSeen = [...hasSeenRole];
    newSeen[currentRevealIndex] = true;
    setHasSeenRole(newSeen);
    setShowRole(false);

    if (currentRevealIndex < players.length - 1) {
      setCurrentRevealIndex(prev => prev + 1);
    } else {
      Alert.alert(
        'Herkes Rolünü Gördü!',
        'Oyun başlıyor! Vampirler gözlerini kapatsın...',
        [{ text: 'Oyunu Başlat', onPress: () => setPhase('playing') }]
      );
    }
  };

  const eliminatePlayer = (index: number) => {
    Alert.alert(
      'Oyuncuyu Elimi?',
      `${players[index].name} oyundan çıkarılsın mı?`,
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Evet, Çıkar', onPress: () => {
            const updated = [...players];
            updated[index].isAlive = false;
            setPlayers(updated);
            checkWinCondition(updated);
          }
        }
      ]
    );
  };

  const checkWinCondition = (currentPlayers: Player[]) => {
    const alivePlayers = currentPlayers.filter(p => p.isAlive);
    const aliveVampires = alivePlayers.filter(p =>
      p.role === CLASSIC_ROLES.vampire || (aiRoles.length > 0 && p.role === aiRoles[0])
    );
    const aliveVillagers = alivePlayers.filter(p =>
      p.role !== CLASSIC_ROLES.vampire && !(aiRoles.length > 0 && p.role === aiRoles[0])
    );

    if (aliveVampires.length === 0) {
      Alert.alert('🎉 Köylüler Kazandı!', 'Tüm vampirler temizlendi!', [
        { text: 'Sonuçları Gör', onPress: () => setPhase('result') }
      ]);
    } else if (aliveVampires.length >= aliveVillagers.length) {
      Alert.alert('🧛 Vampirler Kazandı!', 'Vampirler köyü ele geçirdi!', [
        { text: 'Sonuçları Gör', onPress: () => setPhase('result') }
      ]);
    }
  };

  const getRoleColor = (role: string) => {
    if (role === CLASSIC_ROLES.vampire || (aiRoles.length > 0 && role === aiRoles[0])) return '#EF4444';
    if (role === CLASSIC_ROLES.seer) return '#8B5CF6';
    if (role === CLASSIC_ROLES.doctor) return '#10B981';
    if (role === CLASSIC_ROLES.hunter) return '#F59E0B';
    return '#6366F1';
  };

  if (phase === 'setup') {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>🧛 Vampir Köylü</Text>
          <Text style={styles.subtitle}>Kim vampir, kim köylü?</Text>
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={{ padding: 20 }}>
          <Text style={styles.sectionTitle}>Oyun Modu</Text>
          <View style={styles.modeContainer}>
            <TouchableOpacity
              style={[styles.modeButton, gameMode === 'classic' && styles.modeActive]}
              onPress={() => setGameMode('classic')}
            >
              <Text style={styles.modeIcon}>🏘️</Text>
              <Text style={[styles.modeTitle, gameMode === 'classic' && styles.modeTitleActive]}>Klasik</Text>
              <Text style={styles.modeDesc}>Standart roller</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modeButton, gameMode === 'ai' && styles.modeActiveAI]}
              onPress={() => setGameMode('ai')}
            >
              <Text style={styles.modeIcon}>🤖</Text>
              <Text style={[styles.modeTitle, gameMode === 'ai' && styles.modeTitleActive]}>AI Modu</Text>
              <Text style={styles.modeDesc}>Özel tema ve roller</Text>
            </TouchableOpacity>
          </View>

          {gameMode === 'ai' && (
            <View style={styles.aiContainer}>
              <Text style={styles.aiLabel}>🤖 Tema Gir</Text>
              <TextInput
                style={styles.aiInput}
                placeholder="Örn: Uzay, Orta Çağ, Korku Filmleri..."
                placeholderTextColor="#64748B"
                value={aiTheme}
                onChangeText={setAiTheme}
              />
              <Text style={styles.aiHint}>AI bu temaya özel roller üretecek</Text>
            </View>
          )}

          {gameMode === 'classic' && (
            <View style={styles.infoBox}>
              <Text style={styles.infoTitle}>Klasik Roller</Text>
              <Text style={styles.infoText}>🧛 Vampir — Geceleri köylü öldürür</Text>
              <Text style={styles.infoText}>🔮 Kahin — Her gece bir kişinin rolünü öğrenir (6+ oyuncu)</Text>
              <Text style={styles.infoText}>💉 Doktor — Her gece birini korur (7+ oyuncu)</Text>
              <Text style={styles.infoText}>🏹 Avcı — Ölünce birini götürür (9+ oyuncu)</Text>
              <Text style={styles.infoText}>👨‍🌾 Köylü — Vampiri bulmaya çalışır</Text>
            </View>
          )}

          <Text style={styles.sectionTitle}>Oyuncular</Text>
          <Text style={styles.hint}>En az 5 oyuncu gerekli</Text>
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

  if (phase === 'roleReveal') {
    const current = players[currentRevealIndex];
    const roleColor = getRoleColor(current.role);

    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>🧛 Vampir Köylü</Text>
          <Text style={styles.subtitle}>Oyuncu {currentRevealIndex + 1}/{players.length}</Text>
        </View>

        <View style={styles.passCard}>
          <Text style={styles.passName}>{current.name}</Text>
          <Text style={styles.passInstruction}>Telefonu {current.name}'e ver.{'\n'}Rolünü görmek için basılı tut.</Text>
        </View>

        <TouchableOpacity
          style={[styles.revealBtn, { borderColor: showRole ? roleColor : '#334155' }]}
          onPressIn={handleShowRole}
          onPressOut={() => setShowRole(false)}
          activeOpacity={0.9}
        >
          {showRole ? (
            <View style={{ alignItems: 'center' }}>
              <Text style={[styles.roleText, { color: roleColor }]}>{current.role}</Text>
              <Text style={styles.roleHint}>
                {current.role === CLASSIC_ROLES.vampire || (aiRoles.length > 0 && current.role === aiRoles[0])
                  ? 'Kimliğini gizle! Köylüleri kandır.'
                  : current.role === CLASSIC_ROLES.seer
                    ? 'Her gece bir kişinin rolünü öğren.'
                    : current.role === CLASSIC_ROLES.doctor
                      ? 'Her gece birini koru.'
                      : 'Vampiri bulmaya çalış!'}
              </Text>
            </View>
          ) : (
            <>
              <Text style={styles.holdText}>BASILI TUT</Text>
              <Text style={styles.holdSub}>Rolünü görmek için</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={styles.progressDots}>
          {players.map((_, idx) => (
            <View key={idx} style={[
              styles.dot,
              idx === currentRevealIndex && styles.dotActive,
              hasSeenRole[idx] && styles.dotSeen,
            ]} />
          ))}
        </View>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.nextBtn, !showRole && !hasSeenRole[currentRevealIndex] && styles.disabled]}
            onPress={handleNextPlayer}
          >
            <Text style={styles.nextBtnText}>
              {currentRevealIndex < players.length - 1 ? 'Sonraki Oyuncu →' : 'Oyunu Başlat'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (phase === 'playing') {
    const alivePlayers = players.filter(p => p.isAlive);
    const deadPlayers = players.filter(p => !p.isAlive);

    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>
            {gamePhase === 'night' ? '🌙 Gece' : '☀️ Gündüz'} {dayCount}
          </Text>
          <Text style={styles.subtitle}>
            {gamePhase === 'night'
              ? 'Vampirler uyanıyor...'
              : 'Köylüler tartışıyor...'}
          </Text>
        </View>

        <View style={styles.phaseInfo}>
          <Text style={styles.phaseInfoText}>
            {gamePhase === 'night'
              ? '🧛 Vampirler gözlerini açsın ve kurbanlarını seçsin.\n\nSonra herkes uyusun, sabah olsun.'
              : '☀️ Sabah oldu! Herkes gözlerini açsın.\n\nKim elenmeli? Tartışın ve oylayın.'}
          </Text>
        </View>

        <ScrollView style={{ flex: 1, paddingHorizontal: 20 }}>
          <Text style={styles.sectionTitle}>Hayatta ({alivePlayers.length})</Text>
          {alivePlayers.map((player, idx) => {
            const originalIdx = players.indexOf(player);
            return (
              <TouchableOpacity
                key={idx}
                style={styles.playerCard}
                onPress={() => eliminatePlayer(originalIdx)}
              >
                <Text style={styles.playerCardName}>{player.name}</Text>
                <Text style={styles.playerCardAction}>Ele Al →</Text>
              </TouchableOpacity>
            );
          })}

          {deadPlayers.length > 0 && (
            <>
              <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Elenenler ({deadPlayers.length})</Text>
              {deadPlayers.map((player, idx) => (
                <View key={idx} style={[styles.playerCard, styles.deadCard]}>
                  <Text style={[styles.playerCardName, { color: '#64748B' }]}>💀 {player.name}</Text>
                  <Text style={[styles.playerCardAction, { color: getRoleColor(player.role) }]}>{player.role}</Text>
                </View>
              ))}
            </>
          )}
          <View style={{ height: 100 }} />
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.phaseBtn}
            onPress={() => {
              if (gamePhase === 'night') {
                setGamePhase('day');
              } else {
                setGamePhase('night');
                setDayCount(prev => prev + 1);
              }
            }}
          >
            <Text style={styles.phaseBtnText}>
              {gamePhase === 'night' ? '☀️ Sabah Oldu' : '🌙 Gece Oldu'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (phase === 'result') {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={styles.title}>Oyun Bitti!</Text>
        <Text style={[styles.subtitle, { marginBottom: 30 }]}>Tüm rollerin açıklandı:</Text>

        <ScrollView style={{ width: '100%', paddingHorizontal: 20 }}>
          {players.map((player, idx) => (
            <View key={idx} style={[styles.resultRow, !player.isAlive && styles.deadResultRow]}>
              <Text style={styles.resultName}>{player.isAlive ? '✅' : '💀'} {player.name}</Text>
              <Text style={[styles.resultRole, { color: getRoleColor(player.role) }]}>{player.role}</Text>
            </View>
          ))}
        </ScrollView>

        <View style={[styles.footer, { position: 'relative', marginTop: 20 }]}>
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
  infoBox: { backgroundColor: '#1E293B', borderRadius: 12, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: '#334155' },
  infoTitle: { fontSize: 16, fontWeight: 'bold', color: '#F8FAFC', marginBottom: 10 },
  infoText: { fontSize: 14, color: '#94A3B8', marginBottom: 6 },
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
  startBtn: { flex: 2, backgroundColor: '#7C3AED', padding: 15, borderRadius: 10, alignItems: 'center' },
  disabled: { opacity: 0.6 },
  startBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  passCard: { backgroundColor: '#1E293B', borderRadius: 15, padding: 25, alignItems: 'center', marginHorizontal: 20, marginBottom: 20, borderWidth: 2, borderColor: '#7C3AED' },
  passName: { fontSize: 28, fontWeight: 'bold', color: '#F8FAFC', marginBottom: 12 },
  passInstruction: { fontSize: 16, color: '#94A3B8', textAlign: 'center', lineHeight: 24 },
  revealBtn: { backgroundColor: '#7C3AED', marginHorizontal: 20, padding: 40, borderRadius: 20, alignItems: 'center', borderWidth: 3, borderColor: '#334155' },
  roleText: { fontSize: 32, fontWeight: 'bold', marginBottom: 10 },
  roleHint: { fontSize: 14, color: 'rgba(255,255,255,0.8)', textAlign: 'center' },
  holdText: { fontSize: 24, fontWeight: 'bold', color: '#FFFFFF' },
  holdSub: { fontSize: 14, color: 'rgba(255,255,255,0.7)', marginTop: 8 },
  progressDots: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginTop: 20 },
  dot: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#334155' },
  dotActive: { backgroundColor: '#7C3AED', transform: [{ scale: 1.3 }] },
  dotSeen: { backgroundColor: '#10B981' },
  nextBtn: { flex: 1, backgroundColor: '#7C3AED', padding: 15, borderRadius: 10, alignItems: 'center' },
  nextBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  phaseInfo: { backgroundColor: '#1E293B', marginHorizontal: 20, borderRadius: 12, padding: 16, marginBottom: 20, borderLeftWidth: 4, borderLeftColor: '#7C3AED' },
  phaseInfoText: { fontSize: 15, color: '#94A3B8', lineHeight: 22 },
  playerCard: { backgroundColor: '#1E293B', padding: 16, borderRadius: 12, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: '#334155' },
  deadCard: { opacity: 0.5 },
  playerCardName: { fontSize: 16, fontWeight: '600', color: '#F8FAFC' },
  playerCardAction: { fontSize: 14, color: '#EF4444', fontWeight: '600' },
  phaseBtn: { flex: 1, backgroundColor: '#7C3AED', padding: 15, borderRadius: 10, alignItems: 'center' },
  phaseBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  resultRow: { backgroundColor: '#1E293B', padding: 16, borderRadius: 12, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  deadResultRow: { opacity: 0.6 },
  resultName: { fontSize: 16, fontWeight: '600', color: '#F8FAFC' },
  resultRole: { fontSize: 14, fontWeight: 'bold' },
});