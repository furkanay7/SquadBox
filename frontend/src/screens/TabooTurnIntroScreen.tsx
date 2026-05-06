import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';

interface TabooTurnIntroScreenProps {
  navigation: any;
  route: any;
}

export const TabooTurnIntroScreen: React.FC<TabooTurnIntroScreenProps> = ({ navigation, route }) => {
  const {
    players,
    timer,
    rounds,
    passLimit,
    teamAName,
    teamBName,
    currentPlayerIndex,
    currentRound,
    teamAScore,
    teamBScore,
  } = route.params;

  // Determine current team and player
  const totalPlayers = players.length;
  const currentTeamIndex = currentPlayerIndex % 2; // 0 for Team A, 1 for Team B
  const currentTeamName = currentTeamIndex === 0 ? teamAName : teamBName;
  const currentPlayer = players[currentPlayerIndex % totalPlayers];

  const handleStart = () => {
    navigation.navigate('TabooGame', {
      players,
      timer,
      rounds,
      passLimit,
      teamAName,
      teamBName,
      currentPlayerIndex,
      currentRound,
      teamAScore,
      teamBScore,
      currentPlayerName: currentPlayer.name,
      currentTeamName,
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.roundText}>Tur {currentRound} / {rounds}</Text>
        <Text style={styles.scoreText}>
          {teamAName}: {teamAScore} - {teamBScore} :{teamBName}
        </Text>
      </View>

      <View style={styles.content}>
        <View style={styles.teamBadge}>
          <Text style={styles.teamBadgeText}>{currentTeamName}</Text>
        </View>

        <Text style={styles.turnText}>Sıra</Text>
        <Text style={styles.playerName}>{currentPlayer.name}</Text>
        <Text style={styles.instruction}>nde!</Text>

        <View style={styles.separator} />

        <Text style={styles.hintText}>
          Hazır olduğunda başlat butonuna bas
        </Text>
        
        <Text style={styles.timerPreview}>
          Süre: {timer} saniye
        </Text>

        {passLimit !== 999 && (
          <Text style={styles.passPreview}>
            Pas Hakkı: {passLimit}
          </Text>
        )}
      </View>

      <TouchableOpacity style={styles.startButton} onPress={handleStart}>
        <Text style={styles.startButtonText}>BAŞLAT</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.backButton} 
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backButtonText}>Kuruluma Dön</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  roundText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6366F1',
    marginBottom: 8,
  },
  scoreText: {
    fontSize: 16,
    color: '#94A3B8',
  },
  content: {
    alignItems: 'center',
    marginTop: -50,
  },
  teamBadge: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
    marginBottom: 30,
  },
  teamBadgeText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  turnText: {
    fontSize: 28,
    color: '#94A3B8',
    marginBottom: 10,
  },
  playerName: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#F8FAFC',
    textAlign: 'center',
    marginBottom: 5,
  },
  instruction: {
    fontSize: 28,
    color: '#94A3B8',
  },
  separator: {
    width: 60,
    height: 4,
    backgroundColor: '#6366F1',
    borderRadius: 2,
    marginVertical: 30,
  },
  hintText: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 20,
  },
  timerPreview: {
    fontSize: 18,
    color: '#F59E0B',
    fontWeight: '600',
    marginBottom: 8,
  },
  passPreview: {
    fontSize: 16,
    color: '#64748B',
  },
  startButton: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    backgroundColor: '#10B981',
    paddingVertical: 20,
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
    fontSize: 24,
    fontWeight: 'bold',
  },
  backButton: {
    position: 'absolute',
    bottom: 40,
    padding: 10,
  },
  backButtonText: {
    color: '#64748B',
    fontSize: 16,
  },
});
