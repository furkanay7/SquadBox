import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import tabooWords from '../mocks/tabooWords.json';

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
    currentPlayerIndex = 0,
    currentRound = 1,
    teamAScore = 0,
    teamBScore = 0,
  } = route.params || {
    players: [{ name: 'Oyuncu 1' }, { name: 'Oyuncu 2' }, { name: 'Oyuncu 3' }, { name: 'Oyuncu 4' }],
    timer: 60,
    rounds: 3,
    passLimit: 3,
    teamAName: 'Takım A',
    teamBName: 'Takım B',
    currentPlayerIndex: 0,
    currentRound: 1,
    teamAScore: 0,
    teamBScore: 0,
  };

  const totalPlayers = players.length;
  
  // Team distribution: First half = Team A, Second half = Team B
  // 6 players: 0,1,2 = A, 3,4,5 = B
  // 5 players: 0,1,2 = A, 3,4 = B  (majority to A)
  // 4 players: 0,1 = A, 2,3 = B
  const teamASize = Math.ceil(totalPlayers / 2);
  
  // Current player and team
  const [currentPlayerIdx, setCurrentPlayerIdx] = useState(currentPlayerIndex);
  const currentPlayer = players[currentPlayerIdx % totalPlayers];
  const currentTeamIndex = currentPlayerIdx < teamASize ? 0 : 1; // 0 = Team A, 1 = Team B
  const currentTeamName = currentTeamIndex === 0 ? teamAName : teamBName;
  const currentTeamScore = currentTeamIndex === 0 ? teamAScore : teamBScore;

  // Game state
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(initialTimer);
  const [isPlaying, setIsPlaying] = useState(false);
  const [passesUsed, setPassesUsed] = useState(0);
  const [tabooCount, setTabooCount] = useState(0);
  const [gamePhase, setGamePhase] = useState<'playing' | 'scoreboard'>('playing');
  
  // Global turn counter - increments after each player's turn
  const [turnCounter, setTurnCounter] = useState(1);
  const [round, setRound] = useState(currentRound);
  const totalTurns = totalPlayers * rounds; // Mathematical formula: Players × Rounds

  // Scores
  const [scores, setScores] = useState({
    teamA: teamAScore,
    teamB: teamBScore,
  });

  const [gameWords] = useState(() => 
    [...tabooWords].sort(() => Math.random() - 0.5)
  );

  const currentWord = gameWords[currentWordIndex];
  const passDisabled = passLimit !== 999 && passesUsed >= passLimit;

  useEffect(() => {
    let interval: any;
    if (isPlaying && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev: number) => {
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
    setIsPlaying(false);
    
    // Increment global turn counter
    const newTurnCounter = turnCounter + 1;
    setTurnCounter(newTurnCounter);
    
    // Check if game is over: turnCounter === players × rounds
    // Last turn is when newTurnCounter equals totalTurns
    if (newTurnCounter >= totalTurns) {
      // This was the last turn - game over, go directly to scoreboard
      setGamePhase('scoreboard');
      return;
    }
    
    // Calculate which player is next (0 to totalPlayers-1)
    const nextPlayerIdx = newTurnCounter % totalPlayers;
    
    // Check if round is complete (nextPlayer is 0, meaning we cycled through all players)
    if (nextPlayerIdx === 0) {
      // Round complete, go to next round
      const nextRound = currentRound + 1;
      Alert.alert(
        `Tur ${currentRound} Tamamlandı!`,
        `Tüm oyuncular anlattı. ${nextRound}. tur başlıyor...`,
        [{ text: 'Devam', onPress: () => {
          setRound(nextRound);
          setCurrentPlayerIdx(0);
          setTimeLeft(initialTimer);
          setPassesUsed(0);
          // Go to turn intro for next round
          navigation.navigate('TabooTurnIntro', {
            players,
            timer: initialTimer,
            rounds,
            passLimit,
            teamAName,
            teamBName,
            currentPlayerIndex: 0,
            currentRound: nextRound,
            teamAScore: scores.teamA,
            teamBScore: scores.teamB,
          });
        }}]
      );
    } else {
      // Next player in same round
      Alert.alert(
        'Süre Doldu!',
        `Sıradaki oyuncuya geçiliyor...`,
        [{ text: 'Devam', onPress: () => {
          setCurrentPlayerIdx(nextPlayerIdx);
          setTimeLeft(initialTimer);
          setPassesUsed(0);
          // Go to turn intro
          navigation.navigate('TabooTurnIntro', {
            players,
            timer: initialTimer,
            rounds,
            passLimit,
            teamAName,
            teamBName,
            currentPlayerIndex: nextPlayerIdx,
            currentRound: currentRound,
            teamAScore: scores.teamA,
            teamBScore: scores.teamB,
          });
        }}]
      );
    }
  };

  const handleCorrect = useCallback(() => {
    setScores(prev => ({
      ...prev,
      [currentTeamIndex === 0 ? 'teamA' : 'teamB']: 
        prev[currentTeamIndex === 0 ? 'teamA' : 'teamB'] + 1
    }));
    nextWord();
  }, [currentTeamIndex, teamAName, teamBName]);

  const handlePass = useCallback(() => {
    if (passDisabled) return;
    setPassesUsed(prev => prev + 1);
    nextWord();
  }, [passDisabled]);

  const handleTaboo = useCallback(() => {
    setTabooCount((prev) => prev + 1);
    setScores(prev => ({
      ...prev,
      [currentTeamIndex === 0 ? 'teamA' : 'teamB']: 
        Math.max(0, prev[currentTeamIndex === 0 ? 'teamA' : 'teamB'] - 1)
    }));
    nextWord();
  }, [currentTeamIndex]);

  const nextWord = () => {
    setCurrentWordIndex((prev) => (prev + 1) % gameWords.length);
  };

  const startGame = () => {
    setIsPlaying(true);
  };

  const pauseGame = () => {
    setIsPlaying(false);
  };

  const endGame = () => {
    setGamePhase('scoreboard');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Scoreboard View
  if (gamePhase === 'scoreboard') {
    const winner = scores.teamA > scores.teamB ? teamAName : 
                   scores.teamB > scores.teamA ? teamBName : null;
    const isDraw = scores.teamA === scores.teamB;

    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>🏆 Puan Tablosu</Text>
          <Text style={styles.roundInfo}>Oyun Bitti!</Text>
        </View>

        <View style={styles.scoreboardContainer}>
          <View 
            style={[
              styles.teamCard, 
              winner === teamAName && styles.winnerCard
            ]}
          >
            <Text style={styles.teamName}>{teamAName}</Text>
            <Text style={styles.teamScore}>{scores.teamA}</Text>
            <Text style={styles.teamLabel}>puan</Text>
            {winner === teamAName && (
              <Text style={styles.winnerBadge}>👑 Kazanan</Text>
            )}
          </View>

          <View style={styles.vsContainer}>
            <Text style={styles.vsText}>VS</Text>
          </View>

          <View 
            style={[
              styles.teamCard, 
              winner === teamBName && styles.winnerCard
            ]}
          >
            <Text style={styles.teamName}>{teamBName}</Text>
            <Text style={styles.teamScore}>{scores.teamB}</Text>
            <Text style={styles.teamLabel}>puan</Text>
            {winner === teamBName && (
              <Text style={styles.winnerBadge}>👑 Kazanan</Text>
            )}
          </View>
        </View>

        {isDraw && (
          <View style={styles.drawContainer}>
            <Text style={styles.drawText}>🤝 Berabere!</Text>
          </View>
        )}

        <View style={styles.statsContainer}>
          <Text style={styles.statsTitle}>Oyun İstatistikleri</Text>
          <Text style={styles.statsText}>Toplam Tur: {rounds}</Text>
          <Text style={styles.statsText}>Tabu Sayısı: {tabooCount}</Text>
          <Text style={styles.statsText}>Toplam Pas: {passesUsed}</Text>
        </View>

        {/* Spacer to push buttons down */}
        <View style={styles.spacer} />

        {/* Fixed bottom buttons */}
        <View style={styles.fixedFooter}>
          <TouchableOpacity 
            style={styles.restartButton} 
            onPress={() => {
              navigation.navigate('TabooTurnIntro', {
                players,
                timer: initialTimer,
                rounds,
                passLimit,
                teamAName,
                teamBName,
                currentPlayerIndex: 0,
                currentRound: 1,
                teamAScore: 0,
                teamBScore: 0,
              });
            }}
          >
            <Text style={styles.restartButtonText}>Yeniden Oyna</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.homeButton} 
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={styles.homeButtonText}>Ana Menü</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Playing View
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Anlat Bakalım</Text>
        <Text style={styles.roundInfo}>Tur {round}/{rounds}</Text>
      </View>

      {/* Score Board */}
      <View style={styles.scoreBoard}>
        <View style={[styles.teamBadge, currentTeamIndex === 0 && styles.activeTeamBadge]}>
          <Text style={[styles.teamBadgeText, currentTeamIndex === 0 && styles.activeTeamBadgeText]}>
            {teamAName}: {scores.teamA}
          </Text>
        </View>
        <View style={[styles.teamBadge, currentTeamIndex === 1 && styles.activeTeamBadge]}>
          <Text style={[styles.teamBadgeText, currentTeamIndex === 1 && styles.activeTeamBadgeText]}>
            {teamBName}: {scores.teamB}
          </Text>
        </View>
      </View>

      {/* Timer */}
      <View style={styles.timerContainer}>
        <Text style={[styles.timer, timeLeft <= 10 && styles.timerWarning]}>
          {formatTime(timeLeft)}
        </Text>
      </View>

      {/* Current Player Banner */}
      <View style={styles.playerBanner}>
        <Text style={styles.playerBannerText}>
          {currentTeamName} - {currentPlayer.name}
        </Text>
        {passLimit !== 999 && (
          <Text style={styles.passCountText}>
            Pas: {passesUsed}/{passLimit}
          </Text>
        )}
      </View>

      {/* Word Card */}
      <View style={styles.wordCard}>
        <Text style={styles.word}>{currentWord?.word}</Text>
        <View style={styles.divider} />
        <Text style={styles.forbiddenTitle}>YASAK KELİMELER:</Text>
        {currentWord?.forbidden.map((word: string, index: number) => (
          <Text key={index} style={styles.forbiddenWord}>{word}</Text>
        ))}
      </View>

      {/* Game Controls */}
      <View style={styles.gameControls}>
        {!isPlaying ? (
          <TouchableOpacity style={styles.startButton} onPress={startGame}>
            <Text style={styles.startButtonText}>BAŞLA</Text>
          </TouchableOpacity>
        ) : (
          <>
            <TouchableOpacity style={styles.pauseButton} onPress={pauseGame}>
              <Text style={styles.pauseButtonText}>DURDUR</Text>
            </TouchableOpacity>

            <View style={styles.actionButtons}>
              <TouchableOpacity 
                style={[styles.actionButton, styles.tabooButton]} 
                onPress={handleTaboo}
              >
                <Text style={styles.actionButtonText}>TABU</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[
                  styles.actionButton, 
                  styles.passButton,
                  passDisabled && styles.passButtonDisabled
                ]} 
                onPress={handlePass}
                disabled={passDisabled}
              >
                <Text style={styles.actionButtonText}>
                  {passDisabled ? 'PAS YOK' : 'PAS'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.actionButton, styles.correctButton]} 
                onPress={handleCorrect}
              >
                <Text style={styles.actionButtonText}>DOĞRU</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>

      {/* Fixed Bottom Buttons */}
      <View style={styles.fixedFooter}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Geri</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.endButton} onPress={endGame}>
          <Text style={styles.endButtonText}>Oyunu Bitir</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#F8FAFC',
  },
  roundInfo: {
    fontSize: 16,
    color: '#6366F1',
    fontWeight: '600',
  },
  scoreBoard: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 10,
  },
  teamBadge: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#334155',
  },
  activeTeamBadge: {
    backgroundColor: '#6366F1',
    borderColor: '#6366F1',
  },
  teamBadgeText: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '600',
  },
  activeTeamBadgeText: {
    color: '#FFFFFF',
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  timer: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#F8FAFC',
  },
  timerWarning: {
    color: '#EF4444',
  },
  playerBanner: {
    backgroundColor: '#1E293B',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  playerBannerText: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '600',
  },
  passCountText: {
    color: '#F59E0B',
    fontSize: 14,
    fontWeight: '600',
  },
  wordCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 35,
    paddingVertical: 50,
    alignItems: 'center',
    marginBottom: 10,
    minHeight: 280,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  word: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 12,
  },
  divider: {
    width: '100%',
    height: 2,
    backgroundColor: '#E2E8F0',
    marginVertical: 12,
  },
  forbiddenTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#EF4444',
    marginBottom: 8,
  },
  forbiddenWord: {
    fontSize: 18,
    color: '#64748B',
    marginVertical: 3,
    fontWeight: '500',
  },
  gameControls: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingTop: 10,
  },
  startButton: {
    backgroundColor: '#10B981',
    padding: 18,
    borderRadius: 15,
    alignItems: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'bold',
  },
  pauseButton: {
    backgroundColor: '#334155',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 15,
  },
  pauseButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  actionButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  tabooButton: {
    backgroundColor: '#EF4444',
  },
  passButton: {
    backgroundColor: '#F59E0B',
  },
  passButtonDisabled: {
    backgroundColor: '#475569',
    opacity: 0.5,
  },
  correctButton: {
    backgroundColor: '#10B981',
  },
  // Fixed Footer
  fixedFooter: {
    flexDirection: 'row',
    paddingVertical: 15,
    paddingBottom: 30,
    gap: 10,
    backgroundColor: '#0F172A',
  },
  backButton: {
    flex: 1,
    backgroundColor: '#334155',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  endButton: {
    flex: 2,
    backgroundColor: '#DC2626',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  endButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  // Scoreboard styles
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#F8FAFC',
    textAlign: 'center',
  },
  scoreboardContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 15,
    marginTop: 20,
    marginBottom: 20,
  },
  teamCard: {
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    minWidth: 120,
    borderWidth: 2,
    borderColor: '#334155',
  },
  winnerCard: {
    borderColor: '#F59E0B',
    backgroundColor: '#2D1B0E',
  },
  vsContainer: {
    paddingHorizontal: 10,
  },
  vsText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6366F1',
  },
  teamName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#F8FAFC',
    marginBottom: 8,
  },
  teamScore: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#6366F1',
  },
  teamLabel: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 4,
  },
  winnerBadge: {
    fontSize: 12,
    color: '#F59E0B',
    fontWeight: 'bold',
    marginTop: 8,
  },
  drawContainer: {
    alignItems: 'center',
    marginBottom: 15,
  },
  drawText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#F8FAFC',
  },
  statsContainer: {
    backgroundColor: '#1E293B',
    borderRadius: 15,
    padding: 18,
    marginHorizontal: 10,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F8FAFC',
    marginBottom: 12,
    textAlign: 'center',
  },
  statsText: {
    fontSize: 14,
    color: '#94A3B8',
    marginBottom: 6,
    textAlign: 'center',
  },
  spacer: {
    flex: 1,
  },
  restartButton: {
    flex: 1,
    backgroundColor: '#6366F1',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginRight: 10,
  },
  restartButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  homeButton: {
    flex: 1,
    backgroundColor: '#334155',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  homeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
