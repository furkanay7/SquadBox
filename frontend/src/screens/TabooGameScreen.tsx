import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { fetchAllTabooWords } from '../services/api';

interface TabooGameScreenProps {
  navigation: any;
  route: any;
}

export const TabooGameScreen: React.FC<TabooGameScreenProps> = ({ navigation, route }) => {
  const {
    players,
    timer: initialTimer,
    rounds,
    passLimit,
    teamAName = 'Takım A',
    teamBName = 'Takım B',
    teamAScore: initScoreA = 0,
    teamBScore: initScoreB = 0,
    aiCards = null,
    gameMode = 'classic',
  } = route.params || {};

  const totalPlayers = players?.length || 4;
  const teamASize = Math.ceil(totalPlayers / 2);
  const teamBSize = totalPlayers - teamASize;

  // Takım oyuncuları
  const teamAPlayers = players?.slice(0, teamASize) || [];
  const teamBPlayers = players?.slice(teamASize) || [];

  // Oyun state
  const [round, setRound] = useState(1);
  const [teamATurn, setTeamATurn] = useState(0); // Takım A'dan sıradaki index
  const [teamBTurn, setTeamBTurn] = useState(0); // Takım B'den sıradaki index
  const [isTeamATurn, setIsTeamATurn] = useState(true); // Hangi takım oynuyor
  const [scores, setScores] = useState({ teamA: initScoreA, teamB: initScoreB });
  const [timeLeft, setTimeLeft] = useState(initialTimer);
  const [isPlaying, setIsPlaying] = useState(false);
  const [passesUsed, setPassesUsed] = useState(0);
  const [tabooCount, setTabooCount] = useState(0);
  const [gamePhase, setGamePhase] = useState<'playing' | 'turnEnd' | 'scoreboard'>('playing');
  const [currentWord, setCurrentWord] = useState<any>(null);
  const [isLoadingWord, setIsLoadingWord] = useState(false);
  const [turnsThisRound, setTurnsThisRound] = useState(0); // Bu turda kaç hamle yapıldı
  const [playerStats, setPlayerStats] = useState<{[key: string]: {correct: number, pass: number, taboo: number}}>(
    () => Object.fromEntries(players?.map((p: any) => [p.name, {correct: 0, pass: 0, taboo: 0}]) || [])
  );

  const isGameEnded = useRef(false);
  const aiCardIndex = useRef(0);
  const classicCards = useRef<any[]>([]);
  const classicCardIndex = useRef(0);

  // Mevcut oyuncu
  const currentPlayer = isTeamATurn
    ? teamAPlayers[teamATurn % teamASize]
    : teamBPlayers[teamBTurn % teamBSize];
  const currentTeamName = isTeamATurn ? teamAName : teamBName;

  const passDisabled = passLimit !== 999 && passesUsed >= passLimit;
  const totalTurnsPerRound = totalPlayers; // Her turda toplam hamle sayısı

  // Kelimeleri önceden yükle
  useEffect(() => {
    const preload = async () => {
      if (gameMode !== 'ai') {
        setIsLoadingWord(true);
        const words = await fetchAllTabooWords();
        if (words) {
          classicCards.current = words.sort(() => Math.random() - 0.5);
          classicCardIndex.current = 0;
        }
        setIsLoadingWord(false);
      }
      loadNewWord();
      setIsPlaying(true);
    };
    preload();
  }, []);

  const loadNewWord = useCallback(() => {
    if (gameMode === 'ai' && aiCards && aiCards.length > 0) {
      const idx = aiCardIndex.current % aiCards.length;
      setCurrentWord(aiCards[idx]);
      aiCardIndex.current += 1;
    } else if (classicCards.current.length > 0) {
      const idx = classicCardIndex.current % classicCards.current.length;
      setCurrentWord(classicCards.current[idx]);
      classicCardIndex.current += 1;
    }
  }, [gameMode, aiCards]);

  // Timer
  useEffect(() => {
    let interval: any;
    if (isPlaying && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleTurnEnd();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, timeLeft]);

  const handleTurnEnd = () => {
    if (isGameEnded.current) return;
    setIsPlaying(false);
    setGamePhase('turnEnd');
  };

  const goToNextTurn = () => {
    const newTurnsThisRound = turnsThisRound + 1;

    if (newTurnsThisRound >= totalTurnsPerRound) {
      if (round >= rounds) {
        setGamePhase('scoreboard');
      } else {
        setRound(prev => prev + 1);
        setTurnsThisRound(0);
        setIsTeamATurn(true);
        setTeamATurn(prev => prev + 1);
        setTeamBTurn(prev => prev + 1);
        setTimeLeft(initialTimer);
        setPassesUsed(0);
        loadNewWord();
        setGamePhase('playing');
        setIsPlaying(true);
      }
    } else {
      if (isTeamATurn) {
        setIsTeamATurn(false);
      } else {
        setIsTeamATurn(true);
        setTeamATurn(prev => prev + 1);
        setTeamBTurn(prev => prev + 1);
      }
      setTurnsThisRound(newTurnsThisRound);
      setTimeLeft(initialTimer);
      setPassesUsed(0);
      loadNewWord();
      setGamePhase('playing');
      setIsPlaying(true);
    }
  };

  const startTurn = () => {
    loadNewWord();
    setGamePhase('playing');
    setIsPlaying(true);
  };

  const handleCorrect = useCallback(() => {
    setScores(prev => ({
      ...prev,
      [isTeamATurn ? 'teamA' : 'teamB']:
        prev[isTeamATurn ? 'teamA' : 'teamB'] + 1,
    }));
    setPlayerStats(prev => ({
      ...prev,
      [currentPlayer?.name]: {
        ...prev[currentPlayer?.name],
        correct: (prev[currentPlayer?.name]?.correct || 0) + 1,
      }
    }));
    loadNewWord();
  }, [isTeamATurn, loadNewWord, currentPlayer]);

  const handlePass = useCallback(() => {
    if (passDisabled) return;
    setPassesUsed(prev => prev + 1);
    setPlayerStats(prev => ({
      ...prev,
      [currentPlayer?.name]: {
        ...prev[currentPlayer?.name],
        pass: (prev[currentPlayer?.name]?.pass || 0) + 1,
      }
    }));
    loadNewWord();
  }, [passDisabled, loadNewWord, currentPlayer]);

  const handleTaboo = useCallback(() => {
    setTabooCount(prev => prev + 1);
    setScores(prev => ({
      ...prev,
      [isTeamATurn ? 'teamA' : 'teamB']:
        prev[isTeamATurn ? 'teamA' : 'teamB'] - 1,
    }));
    setPlayerStats(prev => ({
      ...prev,
      [currentPlayer?.name]: {
        ...prev[currentPlayer?.name],
        taboo: (prev[currentPlayer?.name]?.taboo || 0) + 1,
      }
    }));
    loadNewWord();
  }, [isTeamATurn, loadNewWord, currentPlayer]);

  const endGame = () => {
    isGameEnded.current = true;
    setIsPlaying(false);
    setGamePhase('scoreboard');
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const capitalize = (s: string) => s ? s.charAt(0).toUpperCase() + s.slice(1) : '';

  // ── INTRO ──────────────────────────────────────────
  if (gamePhase === 'intro') {
    return (
      <View style={st.container}>
        <View style={st.header}>
          <Text style={st.headerTitle}>Anlat Bakalım</Text>
          <Text style={st.roundInfo}>Tur {round}/{rounds}</Text>
        </View>

        <View style={st.scoreBoard}>
          <View style={[st.teamBadge, isTeamATurn && st.activeTeamBadge]}>
            <Text style={[st.teamBadgeText, isTeamATurn && st.activeTeamBadgeText]}>
              {teamAName}: {scores.teamA}
            </Text>
          </View>
          <View style={[st.teamBadge, !isTeamATurn && st.activeTeamBadge]}>
            <Text style={[st.teamBadgeText, !isTeamATurn && st.activeTeamBadgeText]}>
              {teamBName}: {scores.teamB}
            </Text>
          </View>
        </View>

        <View style={st.introCard}>
          <View style={[st.teamLabel, { backgroundColor: isTeamATurn ? '#6366F1' : '#EC4899' }]}>
            <Text style={st.teamLabelText}>{currentTeamName}</Text>
          </View>
          <Text style={st.introSira}>Sıra</Text>
          <Text style={st.introPlayer}>{currentPlayer?.name}</Text>
          <Text style={st.introSira}>de</Text>
          <View style={st.infoRow}>
            <Text style={st.infoText}>⏱ {initialTimer} saniye</Text>
            {passLimit !== 999 && <Text style={st.infoText}>↩ {passLimit} pas</Text>}
          </View>
        </View>

        <View style={st.fixedFooter}>
          <TouchableOpacity style={st.secondaryBtn} onPress={() => navigation.navigate('Home')}>
            <Text style={st.secondaryBtnText}>Ana Menü</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[st.primaryBtn, { backgroundColor: isTeamATurn ? '#6366F1' : '#EC4899' }]} onPress={startTurn}>
            <Text style={st.primaryBtnText}>BAŞLAT</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (gamePhase === 'turnEnd') {
    // Sıradaki oyuncuyu hesapla
    const nextIsTeamA = !isTeamATurn;
const nextTeamATurnIdx = isTeamATurn ? teamATurn : teamATurn + 1;
const nextTeamBTurnIdx = isTeamATurn ? teamBTurn : teamBTurn;
const nextPlayer = nextIsTeamA
  ? teamAPlayers[nextTeamATurnIdx % teamASize]
  : teamBPlayers[nextTeamBTurnIdx % teamBSize];
const nextTeamName = nextIsTeamA ? teamAName : teamBName;
const isLastTurn = turnsThisRound + 1 >= totalTurnsPerRound && round >= rounds;

    return (
      <View style={st.container}>
        <View style={st.header}>
          <Text style={st.headerTitle}>⏰ Süre Doldu!</Text>
          <Text style={st.roundInfo}>Tur {round}/{rounds}</Text>
        </View>

        <View style={st.scoreBoard}>
          <View style={[st.teamBadge, isTeamATurn && st.activeTeamBadge]}>
            <Text style={[st.teamBadgeText, isTeamATurn && st.activeTeamBadgeText]}>
              {teamAName}: {scores.teamA}
            </Text>
          </View>
          <View style={[st.teamBadge, !isTeamATurn && st.activeTeamBadge]}>
            <Text style={[st.teamBadgeText, !isTeamATurn && st.activeTeamBadgeText]}>
              {teamBName}: {scores.teamB}
            </Text>
          </View>
        </View>

        <View style={st.introCard}>
          <Text style={st.introSira}>Süre doldu!</Text>
          <Text style={st.introPlayer}>{currentPlayer?.name}</Text>
          <Text style={st.introSira}>anlattı.</Text>

          {!isLastTurn && (
            <>
              <View style={{ height: 30 }} />
              <Text style={st.introSira}>Sıradaki:</Text>
              <View style={[st.teamLabel, { backgroundColor: nextIsTeamA ? '#6366F1' : '#EC4899' }]}>
                <Text style={st.teamLabelText}>{nextTeamName}</Text>
              </View>
              <Text style={st.introPlayer}>{nextPlayer?.name}</Text>
            </>
          )}
        </View>

        <View style={st.fixedFooter}>
          <TouchableOpacity style={st.secondaryBtn} onPress={endGame}>
            <Text style={st.secondaryBtnText}>Bitir</Text>
          </TouchableOpacity>
          <TouchableOpacity style={st.primaryBtn} onPress={goToNextTurn}>
            <Text style={st.primaryBtnText}>
              {isLastTurn ? 'Sonuçları Gör' : 'Devam →'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ── SCOREBOARD ─────────────────────────────────────
  if (gamePhase === 'scoreboard') {
    const winner = scores.teamA > scores.teamB ? teamAName
      : scores.teamB > scores.teamA ? teamBName : null;
    const isDraw = scores.teamA === scores.teamB;

    return (
      <View style={st.container}>
        <View style={st.header}>
          <Text style={st.headerTitle}>🏆 Oyun Bitti!</Text>
        </View>

        <View style={st.scoreboardContainer}>
          <View style={[st.teamCard, winner === teamAName && st.winnerCard]}>
            <Text style={st.teamCardName}>{teamAName}</Text>
            <Text style={st.teamCardScore}>{scores.teamA}</Text>
            <Text style={st.teamCardLabel}>puan</Text>
            {winner === teamAName && <Text style={st.winnerBadge}>👑 Kazanan</Text>}
          </View>
          <View style={st.vsContainer}>
            <Text style={st.vsText}>VS</Text>
          </View>
          <View style={[st.teamCard, winner === teamBName && st.winnerCard]}>
            <Text style={st.teamCardName}>{teamBName}</Text>
            <Text style={st.teamCardScore}>{scores.teamB}</Text>
            <Text style={st.teamCardLabel}>puan</Text>
            {winner === teamBName && <Text style={st.winnerBadge}>👑 Kazanan</Text>}
          </View>
        </View>

        {isDraw && <Text style={st.drawText}>🤝 Berabere!</Text>}

        <View style={st.statsContainer}>
  <Text style={st.statsTitle}>{teamAName}</Text>
  {teamAPlayers.map((p: any, i: number) => (
    <View key={i} style={st.playerStatRow}>
      <Text style={st.playerStatName}>{p.name}</Text>
      <Text style={[st.playerStatValue, {color: '#10B981'}]}>✓ {playerStats[p.name]?.correct || 0}</Text>
      <Text style={[st.playerStatValue, {color: '#F59E0B'}]}>↩ {playerStats[p.name]?.pass || 0}</Text>
      <Text style={[st.playerStatValue, {color: '#EF4444'}]}>✗ {playerStats[p.name]?.taboo || 0}</Text>
    </View>
  ))}

  <View style={st.statsDivider} />

  <Text style={st.statsTitle}>{teamBName}</Text>
  {teamBPlayers.map((p: any, i: number) => (
    <View key={i} style={st.playerStatRow}>
      <Text style={st.playerStatName}>{p.name}</Text>
      <Text style={[st.playerStatValue, {color: '#10B981'}]}>✓ {playerStats[p.name]?.correct || 0}</Text>
      <Text style={[st.playerStatValue, {color: '#F59E0B'}]}>↩ {playerStats[p.name]?.pass || 0}</Text>
      <Text style={[st.playerStatValue, {color: '#EF4444'}]}>✗ {playerStats[p.name]?.taboo || 0}</Text>
    </View>
  ))}
</View>

        <View style={st.spacer} />

        <View style={st.fixedFooter}>
          <TouchableOpacity style={st.secondaryBtn} onPress={() => navigation.navigate('Setup', { gameType: 'taboo' })}>
  <Text style={st.secondaryBtnText}>Yeniden Oyna</Text>
</TouchableOpacity>
          <TouchableOpacity style={st.primaryBtn} onPress={() => navigation.navigate('Home')}>
            <Text style={st.primaryBtnText}>Ana Menü</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ── PLAYING ────────────────────────────────────────
  return (
    <View style={st.container}>
      <View style={st.header}>
        <Text style={st.headerTitle}>Anlat Bakalım</Text>
        <Text style={st.roundInfo}>Tur {round}/{rounds}</Text>
      </View>

      <View style={st.scoreBoard}>
        <View style={[st.teamBadge, isTeamATurn && st.activeTeamBadge]}>
          <Text style={[st.teamBadgeText, isTeamATurn && st.activeTeamBadgeText]}>
            {teamAName}: {scores.teamA}
          </Text>
        </View>
        <View style={[st.teamBadge, !isTeamATurn && st.activeTeamBadge]}>
          <Text style={[st.teamBadgeText, !isTeamATurn && st.activeTeamBadgeText]}>
            {teamBName}: {scores.teamB}
          </Text>
        </View>
      </View>

      <View style={st.timerContainer}>
        <Text style={[st.timer, timeLeft <= 10 && st.timerWarning]}>
          {formatTime(timeLeft)}
        </Text>
      </View>

      <View style={st.playerBanner}>
        <Text style={st.playerBannerText}>
          {currentTeamName} — {currentPlayer?.name}
        </Text>
        {passLimit !== 999 && (
          <Text style={st.passCountText}>Pas: {passesUsed}/{passLimit}</Text>
        )}
      </View>

      <View style={st.wordCard}>
        {isLoadingWord ? (
          <Text style={st.word}>⏳ Yükleniyor...</Text>
        ) : (
          <>
            <Text style={st.word}>{capitalize(currentWord?.word || '')}</Text>
            <View style={st.divider} />
            <Text style={st.forbiddenTitle}>YASAK KELİMELER:</Text>
            {(currentWord?.forbidden_words || []).map((w: string, i: number) => (
              <Text key={i} style={st.forbiddenWord}>{capitalize(w)}</Text>
            ))}
          </>
        )}
      </View>

      <View style={st.gameControls}>
        <View style={st.actionButtons}>
          <TouchableOpacity style={[st.actionButton, st.tabooButton]} onPress={handleTaboo}>
            <Text style={st.actionButtonText}>TABU</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[st.actionButton, st.passButton, passDisabled && st.passButtonDisabled]}
            onPress={handlePass}
            disabled={passDisabled}
          >
            <Text style={st.actionButtonText}>{passDisabled ? 'PAS YOK' : 'PAS'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[st.actionButton, st.correctButton]} onPress={handleCorrect}>
            <Text style={st.actionButtonText}>DOĞRU</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={st.fixedFooter}>
        <TouchableOpacity style={st.secondaryBtn} onPress={endGame}>
          <Text style={st.secondaryBtnText}>Bitir</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[st.primaryBtn, { backgroundColor: '#334155' }]}
          onPress={() => setIsPlaying(p => !p)}
        >
          <Text style={st.primaryBtnText}>{isPlaying ? '⏸ DURDUR' : '▶ DEVAM'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const st = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A', paddingHorizontal: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 50, marginBottom: 10 },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#F8FAFC' },
  roundInfo: { fontSize: 16, color: '#6366F1', fontWeight: '600' },
  scoreBoard: { flexDirection: 'row', justifyContent: 'center', gap: 10, marginBottom: 10 },
  teamBadge: { backgroundColor: '#1E293B', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, borderWidth: 2, borderColor: '#334155' },
  activeTeamBadge: { backgroundColor: '#6366F1', borderColor: '#6366F1' },
  teamBadgeText: { color: '#94A3B8', fontSize: 14, fontWeight: '600' },
  activeTeamBadgeText: { color: '#FFFFFF' },
  introCard: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  teamLabel: { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20, marginBottom: 16 },
  teamLabelText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  introSira: { fontSize: 22, color: '#94A3B8', marginVertical: 4 },
  introPlayer: { fontSize: 44, fontWeight: 'bold', color: '#F8FAFC', textAlign: 'center', marginVertical: 4 },
  infoRow: { flexDirection: 'row', gap: 20, marginTop: 20 },
  infoText: { fontSize: 16, color: '#F59E0B' },
  timerContainer: { alignItems: 'center', marginBottom: 8 },
  timer: { fontSize: 48, fontWeight: 'bold', color: '#F8FAFC' },
  timerWarning: { color: '#EF4444' },
  playerBanner: { backgroundColor: '#1E293B', padding: 12, borderRadius: 10, alignItems: 'center', marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between' },
  playerBannerText: { color: '#F8FAFC', fontSize: 16, fontWeight: '600' },
  passCountText: { color: '#F59E0B', fontSize: 14, fontWeight: '600' },
  wordCard: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 25, alignItems: 'center', marginBottom: 10, minHeight: 240, justifyContent: 'center' },
  word: { fontSize: 28, fontWeight: 'bold', color: '#1E293B', marginBottom: 12 },
  divider: { width: '100%', height: 2, backgroundColor: '#E2E8F0', marginVertical: 10 },
  forbiddenTitle: { fontSize: 13, fontWeight: 'bold', color: '#EF4444', marginBottom: 6 },
  forbiddenWord: { fontSize: 17, color: '#64748B', marginVertical: 2, fontWeight: '500' },
  gameControls: { flex: 1, justifyContent: 'flex-start', paddingTop: 8 },
  actionButtons: { flexDirection: 'row', gap: 10 },
  actionButton: { flex: 1, padding: 18, borderRadius: 12, alignItems: 'center' },
  actionButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: 'bold' },
  tabooButton: { backgroundColor: '#EF4444' },
  passButton: { backgroundColor: '#F59E0B' },
  passButtonDisabled: { backgroundColor: '#475569', opacity: 0.5 },
  correctButton: { backgroundColor: '#10B981' },
  fixedFooter: { flexDirection: 'row', paddingVertical: 12, paddingBottom: 30, gap: 10, backgroundColor: '#0F172A' },
  secondaryBtn: { flex: 1, backgroundColor: '#334155', padding: 14, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  secondaryBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '600' },
  primaryBtn: { flex: 1, backgroundColor: '#6366F1', padding: 14, borderRadius: 10, alignItems: 'center' },
  primaryBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  scoreboardContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 15, marginTop: 20, marginBottom: 20 },
  teamCard: { backgroundColor: '#1E293B', borderRadius: 20, padding: 20, alignItems: 'center', minWidth: 120, borderWidth: 2, borderColor: '#334155' },
  winnerCard: { borderColor: '#F59E0B', backgroundColor: '#2D1B0E' },
  vsContainer: { paddingHorizontal: 10 },
  vsText: { fontSize: 20, fontWeight: 'bold', color: '#6366F1' },
  teamCardName: { fontSize: 14, fontWeight: 'bold', color: '#F8FAFC', marginBottom: 8 },
  teamCardScore: { fontSize: 40, fontWeight: 'bold', color: '#6366F1' },
  teamCardLabel: { fontSize: 12, color: '#94A3B8', marginTop: 4 },
  winnerBadge: { fontSize: 12, color: '#F59E0B', fontWeight: 'bold', marginTop: 8 },
  drawText: { fontSize: 22, fontWeight: 'bold', color: '#F8FAFC', textAlign: 'center', marginBottom: 15 },
  statsContainer: { backgroundColor: '#1E293B', borderRadius: 15, padding: 18, marginHorizontal: 10 },
  statsTitle: { fontSize: 16, fontWeight: 'bold', color: '#F8FAFC', marginBottom: 12, textAlign: 'center' },
  statsText: { fontSize: 14, color: '#94A3B8', marginBottom: 6, textAlign: 'center' },
  spacer: { flex: 1 },
  playerStatRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 8 },
playerStatName: { flex: 1, fontSize: 14, color: '#F8FAFC', fontWeight: '600' },
playerStatValue: { fontSize: 14, fontWeight: 'bold', minWidth: 35, textAlign: 'center' },
statsDivider: { height: 1, backgroundColor: '#334155', marginVertical: 12 },
});