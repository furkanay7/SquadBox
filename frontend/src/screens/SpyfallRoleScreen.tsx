import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import spyfallLocations from '../mocks/spyfallLocations.json';
import { theme } from '../theme/theme';

interface SpyfallRoleScreenProps {
  navigation: any;
  route: any;
}

interface GameState {
  location: typeof spyfallLocations[0];
  spyIndex: number;
  currentPlayerIndex: number;
  roles: string[];
}

interface Score {
  playerIndex: number;
  playerName: string;
  score: number;
  isSpy: boolean;
}

export const SpyfallRoleScreen: React.FC<SpyfallRoleScreenProps> = ({ navigation, route }) => {
  const { players, rounds = 3, currentRound = 1, previousScores } = route.params || { 
    players: [{ name: 'Oyuncu 1' }, { name: 'Oyuncu 2' }, { name: 'Oyuncu 3' }],
    rounds: 3,
    currentRound: 1,
    previousScores: null,
  };

  const [gameState, setGameState] = useState<GameState>(() => {
    const randomLocation = spyfallLocations[Math.floor(Math.random() * spyfallLocations.length)];
    const spyIndex = Math.floor(Math.random() * players.length);
    const shuffledRoles = [...randomLocation.roles]
      .filter(role => role !== 'CASPUS')
      .sort(() => Math.random() - 0.5);
    
    const roles = players.map((_: any, index: number) => 
      index === spyIndex ? 'CASUS' : shuffledRoles[index % shuffledRoles.length]
    );

    return {
      location: randomLocation,
      spyIndex,
      currentPlayerIndex: 0,
      roles,
    };
  });

  const [showingRole, setShowingRole] = useState(false);
  const [hasSeenRole, setHasSeenRole] = useState<boolean[]>(new Array(players.length).fill(false));
  const [gamePhase, setGamePhase] = useState<'roleReveal' | 'playing' | 'voting' | 'guessLocation' | 'roundEnd' | 'gameEnd' | 'locationGuide'>('roleReveal');
  
  // 8 minute timer (480 seconds)
  const [timeLeft, setTimeLeft] = useState(480);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  
  // Location guide modal
  const [locationModalVisible, setLocationModalVisible] = useState(false);
  
  // Scoring - cumulative across rounds
  const [scores, setScores] = useState<Score[]>(() => {
    if (previousScores) {
      // Use previous scores if continuing from previous round
      return previousScores;
    }
    // Initialize new scores
    return players.map((p: any, idx: number) => ({
      playerIndex: idx,
      playerName: p.name,
      score: 0,
      isSpy: idx === gameState.spyIndex,
    }));
  });

  // Update spy status for current round
  useEffect(() => {
    setScores(prev => prev.map((s, idx) => ({
      ...s,
      isSpy: idx === gameState.spyIndex,
    })));
  }, [gameState.spyIndex]);

  // Timer effect
  useEffect(() => {
    let interval: any;
    if (isTimerRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsTimerRunning(false);
            Alert.alert('Süre Doldu!', 'Oyun süresi bitti! Oylamaya geçelim.');
            setGamePhase('voting');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timeLeft]);

  const handlePressIn = () => {
    setShowingRole(true);
  };

  const handlePressOut = () => {
    setShowingRole(false);
    if (!hasSeenRole[gameState.currentPlayerIndex]) {
      const newHasSeen = [...hasSeenRole];
      newHasSeen[gameState.currentPlayerIndex] = true;
      setHasSeenRole(newHasSeen);
    }
  };

  const nextPlayer = () => {
    if (gameState.currentPlayerIndex < players.length - 1) {
      setGameState(prev => ({
        ...prev,
        currentPlayerIndex: prev.currentPlayerIndex + 1,
      }));
      setShowingRole(false);
    } else {
      Alert.alert(
        'Tüm Roller Gösterildi',
        'Oyun başlıyor! 8 dakikanız var.',
        [{ text: 'Başla', onPress: () => {
          setGamePhase('playing');
          setIsTimerRunning(true);
        }}]
      );
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleGuessSpy = () => {
    setGamePhase('voting');
  };

  const handleSpyGuessLocation = () => {
    setGamePhase('guessLocation');
  };

  const voteForSpy = (index: number) => {
    const isSpy = index === gameState.spyIndex;
    
    if (isSpy) {
      // Spy found! Non-spy players get points
      const updatedScores = scores.map((s) => {
        if (!s.isSpy) {
          return { ...s, score: s.score + 1 };
        }
        return s;
      });
      setScores(updatedScores);
      
      // Check if game should end or next round
      handleRoundEnd(updatedScores, `Tebrikler! ${players[index].name} casustu. Diğer oyuncular 1'er puan kazandı!`);
    } else {
      // Wrong guess! Spy gets 2 points
      const updatedScores = scores.map((s) => {
        if (s.isSpy) {
          return { ...s, score: s.score + 2 };
        }
        return s;
      });
      setScores(updatedScores);
      
      // Check if game should end or next round
      handleRoundEnd(updatedScores, `Yanlış tahmin! Casus ${players[gameState.spyIndex].name} idi. Casus 2 puan kazandı!`);
    }
  };

  const guessLocation = (locationName: string) => {
    const isCorrect = locationName === gameState.location.name;
    
    if (isCorrect) {
      // Spy guessed correctly! Spy gets 2 points
      const updatedScores = scores.map((s) => {
        if (s.isSpy) {
          return { ...s, score: s.score + 2 };
        }
        return s;
      });
      setScores(updatedScores);
      
      handleRoundEnd(updatedScores, `Doğru tahmin! Casus lokasyonu bildi ve 2 puan kazandı!`);
    } else {
      // Wrong guess! Non-spy players get points
      const updatedScores = scores.map((s) => {
        if (!s.isSpy) {
          return { ...s, score: s.score + 1 };
        }
        return s;
      });
      setScores(updatedScores);
      
      handleRoundEnd(updatedScores, `Yanlış tahmin! Doğru lokasyon: ${gameState.location.name}. Diğer oyuncular 1'er puan kazandı!`);
    }
  };

  const handleRoundEnd = (updatedScores: Score[], message: string) => {
    if (currentRound >= rounds) {
      // Game over
      Alert.alert(
        'Tur Bitti!',
        message,
        [{ text: 'Oyun Sonu', onPress: () => setGamePhase('gameEnd') }]
      );
    } else {
      // Next round
      Alert.alert(
        `Tur ${currentRound} Tamamlandı!`,
        message + `\n\nSıradaki tur başlıyor...`,
        [{ text: 'Devam', onPress: () => {
          // Reset for next round but keep scores
          const randomLocation = spyfallLocations[Math.floor(Math.random() * spyfallLocations.length)];
          const newSpyIndex = Math.floor(Math.random() * players.length);
          const shuffledRoles = [...randomLocation.roles]
            .filter(role => role !== 'CASPUS')
            .sort(() => Math.random() - 0.5);
          
          const newRoles = players.map((_: any, idx: number) => 
            idx === newSpyIndex ? 'CASUS' : shuffledRoles[idx % shuffledRoles.length]
          );

          setGameState({
            location: randomLocation,
            spyIndex: newSpyIndex,
            currentPlayerIndex: 0,
            roles: newRoles,
          });
          setShowingRole(false);
          setHasSeenRole(new Array(players.length).fill(false));
          setGamePhase('roleReveal');
          setTimeLeft(480);
          setIsTimerRunning(false);
          
          // Navigate to next round with updated scores
          navigation.replace('SpyfallRole', {
            players,
            rounds,
            currentRound: currentRound + 1,
            previousScores: updatedScores.map((s, idx) => ({
              ...s,
              isSpy: idx === newSpyIndex,
            })),
          });
        }}]
      );
    }
  };

  // Get contextual hint based on role
  const getRoleHint = () => {
    const currentPlayerIsSpy = gameState.currentPlayerIndex === gameState.spyIndex;
    if (currentPlayerIsSpy) {
      return {
        title: 'CASUS',
        color: theme.colors.error.main,
        neutralColor: theme.colors.background.tertiary,
        hint: 'Lokasyonu bilmediğini belli etmemeye çalış! Diğer oyuncuları kandır ve kimin casus olduğunu anlamalarını engelle.',
        action: 'Gizli rolünü koru!',
      };
    } else {
      return {
        title: 'KÖYLÜ',
        color: theme.colors.success.main,
        neutralColor: theme.colors.background.tertiary,
        hint: `Lokasyon: ${gameState.location.name}\n\nCasusu tespit etmeye çalış! Şüpheli davranan oyunculara dikkat et.`,
        action: 'Casusu bul!',
      };
    }
  };

  // Game End View
  if (gamePhase === 'gameEnd') {
    const sortedScores = [...scores].sort((a, b) => b.score - a.score);
    const winner = sortedScores[0];

    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>🏆 Oyun Bitti!</Text>
          <Text style={styles.locationDisplay}>{rounds} tur tamamlandı</Text>
        </View>

        <View style={styles.finalScoreboard}>
          {sortedScores.map((score, index) => (
            <View 
              key={score.playerIndex} 
              style={[
                styles.finalScoreRow,
                index === 0 && styles.finalWinnerRow,
              ]}
            >
              <View style={styles.rankBadge}>
                <Text style={styles.rankText}>{index + 1}</Text>
              </View>
              <View style={styles.nameSection}>
                <Text style={styles.finalPlayerName}>{score.playerName}</Text>
                {score.isSpy && <Text style={styles.finalSpyBadge}>SON CASUS</Text>}
              </View>
              <Text style={styles.finalScore}>{score.score} puan</Text>
            </View>
          ))}
        </View>

        <View style={styles.fixedFooter}>
          <TouchableOpacity 
            style={styles.restartButton} 
            onPress={() => {
              navigation.replace('SpyfallRole', {
                players,
                rounds,
                currentRound: 1,
                previousScores: null,
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

  // Location Guide View (Full Screen instead of Modal)
  if (gamePhase === 'locationGuide') {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>📍 Lokasyon Rehberi</Text>
          <Text style={styles.subtitle}>Olası lokasyonları incele</Text>
        </View>
        
        <ScrollView style={styles.locationsContainer}>
          {spyfallLocations.map((loc) => (
            <View key={loc.id} style={styles.locationListItem}>
              <Text style={styles.locationListName}>{loc.name}</Text>
              <Text style={styles.locationListRoles}>
                Roller: {loc.roles.filter(r => r !== 'CASPUS').slice(0, 3).join(', ')}...
              </Text>
            </View>
          ))}
        </ScrollView>
        
        <View style={styles.footer}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => setGamePhase('playing')}
          >
            <Text style={styles.backButtonText}>Oyuna Dön</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Location Guessing View (for spy)
  if (gamePhase === 'guessLocation') {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Lokasyon Tahmini</Text>
          <Text style={styles.subtitle}>Casus, lokasyonu tahmin et!</Text>
        </View>

        <ScrollView style={styles.locationsContainer}>
          {spyfallLocations.map((loc) => (
            <TouchableOpacity
              key={loc.id}
              style={styles.locationCard}
              onPress={() => guessLocation(loc.name)}
            >
              <Text style={styles.locationName}>{loc.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => setGamePhase('playing')}
        >
          <Text style={styles.backButtonText}>Geri Dön</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Role Reveal Phase
  if (gamePhase === 'roleReveal') {
    const roleHint = getRoleHint();
    
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Spyfall</Text>
          <Text style={styles.playerInfo}>
            Oyuncu {gameState.currentPlayerIndex + 1}/{players.length} • Tur {currentRound}/{rounds}
          </Text>
        </View>

        <View style={styles.playerCard}>
          <Text style={styles.currentPlayer}>{players[gameState.currentPlayerIndex].name}</Text>
          <Text style={styles.instruction}>
            Rolünü görmek için butona bas ve basılı tut
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.revealButton, { borderColor: showingRole ? roleHint.color : roleHint.neutralColor, borderWidth: 3 }]}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={0.8}
        >
          {showingRole ? (
            <View style={styles.roleContainer}>
              {gameState.currentPlayerIndex === gameState.spyIndex ? (
                <>
                  <Text style={[styles.roleText, { color: '#EF4444' }]}>CASUS</Text>
                  <Text style={styles.spyHint}>Lokasyonu bilmediğini gizle!</Text>
                </>
              ) : (
                <>
                  <Text style={styles.locationText}>{gameState.location.name}</Text>
                  <Text style={styles.roleText}>{gameState.roles[gameState.currentPlayerIndex]}</Text>
                  <Text style={styles.hintText}>Casusu bulmaya çalış!</Text>
                </>
              )}
            </View>
          ) : (
            <>
              <Text style={styles.holdText}>BASILI TUT</Text>
              <Text style={styles.holdSubtext}>Rolünü görmek için</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={styles.progressContainer}>
          {players.map((_: any, index: number) => (
            <View
              key={index}
              style={[
                styles.progressDot,
                index === gameState.currentPlayerIndex && styles.progressDotActive,
                hasSeenRole[index] && styles.progressDotSeen,
              ]}
            />
          ))}
        </View>

        {/* Minimalist Back Button */}
        <TouchableOpacity 
          style={styles.minimalistBackButton} 
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.minimalistBackButtonText}>←</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <TouchableOpacity 
            style={[styles.nextButton, !hasSeenRole[gameState.currentPlayerIndex] && styles.nextButtonDisabled]}
            onPress={nextPlayer}
            disabled={!hasSeenRole[gameState.currentPlayerIndex]}
          >
            <Text style={styles.nextButtonText}>
              {gameState.currentPlayerIndex < players.length - 1 ? 'Sonraki Oyuncu' : 'Oyunu Başlat'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Playing Phase
  if (gamePhase === 'playing') {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Spyfall</Text>
          <View style={[styles.timerContainer, timeLeft <= 60 && styles.timerWarning]}>
            <Text style={styles.timerText}>⏱️ {formatTime(timeLeft)}</Text>
          </View>
          <Text style={styles.roundIndicator}>Tur {currentRound}/{rounds}</Text>
        </View>

        {/* General Game Info Banner - No role reveal here */}
        <View style={styles.gameInfoBanner}>
          <Text style={styles.gameInfoTitle}>🎮 Oyun Başladı!</Text>
          <Text style={styles.gameInfoText}>
            Casus lokasyonu bulmaya çalışır, masumlar casusu tespit etmeye çalışır.{'\n'}
            Birbirinize sorular sorun ve şüpheli davranışları takip edin.
          </Text>
        </View>

        <View style={styles.playingContainer}>
          {/* Location Guide Button */}
          <TouchableOpacity 
            style={styles.locationGuideButton}
            onPress={() => setGamePhase('locationGuide')}
          >
            <Text style={styles.locationGuideButtonText}>📍 Lokasyon Rehberi</Text>
          </TouchableOpacity>

          <View style={styles.buttonsContainer}>
            <TouchableOpacity style={styles.guessSpyButton} onPress={handleGuessSpy}>
              <Text style={styles.guessSpyButtonText}>🕵️ Casusu Tahmin Et</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.guessLocationButton} onPress={handleSpyGuessLocation}>
              <Text style={styles.guessLocationButtonText}>📍 Lokasyonu Tahmin Et</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Minimalist Back Button */}
        <TouchableOpacity 
          style={styles.minimalistBackButton} 
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.minimalistBackButtonText}>←</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Voting Phase
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Oylama</Text>
        <Text style={styles.subtitle}>Casusu seçin:</Text>
      </View>

      <ScrollView style={styles.votingContainer}>
        {players.map((player: any, index: number) => (
          <TouchableOpacity
            key={index}
            style={styles.voteCard}
            onPress={() => voteForSpy(index)}
          >
            <Text style={styles.voteCardText}>{player.name}</Text>
            <Text style={styles.voteCardSubtext}>Casus olabilir mi?</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <TouchableOpacity style={styles.backButton} onPress={() => setGamePhase('playing')}>
        <Text style={styles.backButtonText}>Geri Dön</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
    padding: 20,
  },
  header: {
    paddingTop: 50,
    marginBottom: 30,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: theme.colors.text.secondary,
  },
  playerInfo: {
    fontSize: 16,
    color: theme.colors.primary.main,
    fontWeight: '600',
  },
  roundIndicator: {
    fontSize: 16,
    color: theme.colors.secondary.main,
    fontWeight: '600',
    marginTop: 5,
  },
  playerCard: {
    backgroundColor: theme.colors.background.secondary,
    borderRadius: 15,
    padding: 25,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: theme.colors.primary.main,
  },
  currentPlayer: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginBottom: 10,
  },
  instruction: {
    fontSize: 16,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
  revealButton: {
    backgroundColor: theme.colors.primary.main,
    borderRadius: 20,
    minHeight: 180,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: theme.colors.primary.main,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
  },
  roleContainer: {
    alignItems: 'center',
  },
  locationText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginBottom: 10,
  },
  roleText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.success.main,
    marginBottom: 10,
  },
  spyHint: {
    fontSize: 16,
    color: theme.colors.error.main,
    fontWeight: 'bold',
  },
  hintText: {
    fontSize: 14,
    color: theme.colors.text.secondary,
  },
  holdText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.primary.contrast,
  },
  holdSubtext: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 8,
  },
  hintCard: {
    backgroundColor: theme.colors.background.secondary,
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
  },
  hintCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  hintCardText: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginBottom: 8,
    lineHeight: 20,
  },
  hintCardAction: {
    fontSize: 14,
    color: theme.colors.secondary.main,
    fontWeight: '600',
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 20,
  },
  progressDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: theme.colors.background.tertiary,
  },
  progressDotActive: {
    backgroundColor: theme.colors.primary.main,
    transform: [{ scale: 1.3 }],
  },
  progressDotSeen: {
    backgroundColor: theme.colors.success.main,
  },
  timerContainer: {
    backgroundColor: theme.colors.background.secondary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 10,
  },
  timerWarning: {
    backgroundColor: theme.colors.error.main,
  },
  timerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
  },
  contextBanner: {
    backgroundColor: '#2D1B0E',
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: theme.colors.secondary.main,
  },
  contextText: {
    fontSize: 16,
    color: theme.colors.secondary.main,
    fontWeight: '600',
    textAlign: 'center',
  },
  playingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  locationGuideButton: {
    backgroundColor: theme.colors.background.tertiary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 20,
    marginBottom: 30,
    borderWidth: 2,
    borderColor: theme.colors.primary.main,
    borderStyle: 'dashed',
  },
  locationGuideButtonText: {
    color: theme.colors.primary.main,
    fontSize: 16,
    fontWeight: '600',
  },
  buttonsContainer: {
    gap: 15,
    width: '100%',
  },
  guessSpyButton: {
    backgroundColor: theme.colors.error.main,
    padding: 18,
    borderRadius: 15,
    alignItems: 'center',
  },
  guessSpyButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  guessLocationButton: {
    backgroundColor: theme.colors.success.main,
    padding: 18,
    borderRadius: 15,
    alignItems: 'center',
  },
  guessLocationButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  votingContainer: {
    flex: 1,
    gap: 15,
  },
  voteCard: {
    backgroundColor: theme.colors.background.secondary,
    padding: 20,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: theme.colors.error.main,
    alignItems: 'center',
  },
  voteCardText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
  },
  voteCardSubtext: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginTop: 5,
  },
  locationsContainer: {
    flex: 1,
  },
  locationCard: {
    backgroundColor: theme.colors.background.secondary,
    padding: 18,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: theme.colors.background.tertiary,
    alignItems: 'center',
  },
  locationName: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  locationDisplay: {
    fontSize: 18,
    color: theme.colors.primary.main,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    paddingBottom: 30,
    gap: 10,
  },
  backButton: {
    flex: 1,
    backgroundColor: theme.colors.background.tertiary,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  nextButton: {
    flex: 2,
    backgroundColor: theme.colors.success.main,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  nextButtonDisabled: {
    backgroundColor: theme.colors.background.tertiary,
    opacity: 0.5,
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: theme.colors.background.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: theme.colors.background.secondary,
    borderRadius: 20,
    padding: 20,
    width: '100%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: 5,
  },
  modalSubtitle: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  locationList: {
    maxHeight: 400,
  },
  locationListItem: {
    backgroundColor: theme.colors.background.tertiary,
    padding: 14,
    borderRadius: 10,
    marginBottom: 8,
  },
  locationListName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: 4,
  },
  locationListRoles: {
    fontSize: 12,
    color: theme.colors.text.secondary,
  },
  closeModalButton: {
    backgroundColor: theme.colors.primary.main,
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 15,
  },
  closeModalButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  // Game End styles
  finalScoreboard: {
    flex: 1,
    marginTop: 20,
  },
  finalScoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background.secondary,
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
  },
  finalWinnerRow: {
    backgroundColor: '#2D1B0E',
    borderWidth: 2,
    borderColor: theme.colors.secondary.main,
  },
  rankBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.background.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  rankText: {
    color: theme.colors.text.primary,
    fontWeight: 'bold',
    fontSize: 16,
  },
  nameSection: {
    flex: 1,
  },
  finalPlayerName: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  finalSpyBadge: {
    fontSize: 12,
    color: theme.colors.error.main,
    marginTop: 2,
  },
  finalScore: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.primary.main,
  },
  fixedFooter: {
    flexDirection: 'row',
    paddingBottom: 30,
    gap: 10,
  },
  restartButton: {
    flex: 1,
    backgroundColor: theme.colors.primary.main,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  restartButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  homeButton: {
    flex: 1,
    backgroundColor: theme.colors.background.tertiary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  homeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  // General Game Info Banner (neutral, no role reveal)
  gameInfoBanner: {
    backgroundColor: theme.colors.background.secondary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary.main,
  },
  gameInfoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.primary.main,
    marginBottom: 8,
  },
  gameInfoText: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    lineHeight: 20,
  },
  // Minimalist Back Button
  minimalistBackButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.background.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  minimalistBackButtonText: {
    color: theme.colors.text.secondary,
    fontSize: 20,
    fontWeight: 'bold',
  },
  // Role Info Banner
  roleInfoBanner: {
    backgroundColor: theme.colors.background.secondary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderLeftWidth: 4,
  },
  roleInfoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginBottom: 4,
  },
  roleInfoLocation: {
    fontSize: 16,
    color: theme.colors.text.secondary,
    marginTop: 4,
  },
  roleInfoHint: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginTop: 6,
    lineHeight: 20,
  },
});
