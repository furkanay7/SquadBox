import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { theme } from '../theme/theme';

interface Player {
  id: string;
  name: string;
}

interface SetupScreenProps {
  navigation: any;
  route: any;
}

export const SetupScreen: React.FC<SetupScreenProps> = ({ navigation, route }) => {
  const gameType = route.params?.gameType || 'taboo';
  
  // Team names for Taboo (fixed 2 teams)
  const [teamAName, setTeamAName] = useState('Takım A');
  const [teamBName, setTeamBName] = useState('Takım B');
  
  // Default players based on game type
  const defaultPlayers = gameType === 'taboo' ? 4 : 3;
  const [players, setPlayers] = useState<Player[]>(() => 
    Array.from({ length: defaultPlayers }, (_, i) => ({
      id: (i + 1).toString(),
      name: ''
    }))
  );
  
  const [timer, setTimer] = useState(60);
  const [rounds, setRounds] = useState(3);
  const [passLimit, setPassLimit] = useState(3); // Pass limit for Taboo

  const addPlayer = () => {
    if (players.length >= 10) {
      Alert.alert('Maksimum Oyuncu', 'En fazla 10 oyuncu ekleyebilirsiniz.');
      return;
    }
    const newId = (players.length + 1).toString();
    setPlayers([...players, { id: newId, name: '' }]);
  };

  const removePlayer = (id: string) => {
    const minPlayers = gameType === 'taboo' ? 4 : 3;
    if (players.length <= minPlayers) {
      Alert.alert('Minimum Oyuncu', `En az ${minPlayers} oyuncu gerekli.`);
      return;
    }
    setPlayers(players.filter(p => p.id !== id));
  };

  const updatePlayerName = (id: string, name: string) => {
    setPlayers(players.map(p => p.id === id ? { ...p, name } : p));
  };

  // Validation
  const validPlayers = useMemo(() => 
    players.filter(p => p.name.trim() !== ''),
    [players]
  );

  const canStartGame = useMemo(() => {
    const minPlayers = gameType === 'taboo' ? 4 : 3;
    return validPlayers.length >= minPlayers;
  }, [validPlayers, gameType]);

  const startGame = () => {
    const minPlayers = gameType === 'taboo' ? 4 : 3;
    
    if (validPlayers.length < minPlayers) {
      Alert.alert('Eksik Oyuncu', `Oynamak için en az ${minPlayers} oyuncu gerekli!`);
      return;
    }

    if (gameType === 'taboo') {
      navigation.navigate('TabooTurnIntro', {
        players: validPlayers,
        timer,
        rounds,
        passLimit,
        teamAName: teamAName.trim() || 'Takım A',
        teamBName: teamBName.trim() || 'Takım B',
        currentPlayerIndex: 0,
        currentRound: 1,
        teamAScore: 0,
        teamBScore: 0,
      });
    } else {
      navigation.navigate('SpyfallRole', {
        players: validPlayers,
        rounds,
        currentRound: 1,
      });
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>SquadBox</Text>
        <Text style={styles.subtitle}>
          {gameType === 'taboo' ? 'Anlat Bakalım' : 'Spyfall'}
        </Text>
      </View>

      {/* Scrollable Content */}
      <ScrollView 
        style={styles.scrollContent}
        contentContainerStyle={styles.scrollContentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Team Names Section - Only for Taboo */}
        {gameType === 'taboo' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Takım İsimleri</Text>
            <View style={styles.teamRow}>
              <View style={styles.teamInputContainer}>
                <Text style={styles.teamLabel}>Takım 1</Text>
                <TextInput
                  style={styles.teamInput}
                  placeholder="Takım A"
                  placeholderTextColor="#64748B"
                  value={teamAName}
                  onChangeText={setTeamAName}
                  maxLength={20}
                />
              </View>
              <View style={styles.teamVs}>
                <Text style={styles.teamVsText}>VS</Text>
              </View>
              <View style={styles.teamInputContainer}>
                <Text style={styles.teamLabel}>Takım 2</Text>
                <TextInput
                  style={styles.teamInput}
                  placeholder="Takım B"
                  placeholderTextColor="#64748B"
                  value={teamBName}
                  onChangeText={setTeamBName}
                  maxLength={20}
                />
              </View>
            </View>
          </View>
        )}

        {/* Players Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Oyuncular</Text>
          <Text style={styles.hintText}>
            En az {gameType === 'taboo' ? '4' : '3'} oyuncu gerekli
          </Text>
          
          {players.map((player, index) => (
            <View key={player.id} style={styles.playerRow}>
              <Text style={styles.playerNumber}>{index + 1}.</Text>
              <TextInput
                style={[
                  styles.input,
                  player.name.trim() === '' && styles.inputEmpty
                ]}
                placeholder={`Oyuncu ${index + 1} ismi`}
                placeholderTextColor="#64748B"
                value={player.name}
                onChangeText={(text) => updatePlayerName(player.id, text)}
                maxLength={20}
              />
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => removePlayer(player.id)}
              >
                <Text style={styles.removeButtonText}>×</Text>
              </TouchableOpacity>
            </View>
          ))}
          
          <TouchableOpacity style={styles.addButton} onPress={addPlayer}>
            <Text style={styles.addButtonText}>+ Oyuncu Ekle</Text>
          </TouchableOpacity>
        </View>

        {/* Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Oyun Ayarları</Text>
          
          {/* Timer - Only for Taboo */}
          {gameType === 'taboo' && (
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Süre (saniye)</Text>
              <View style={styles.timerButtons}>
                {[30, 45, 60, 90].map((t) => (
                  <TouchableOpacity
                    key={t}
                    style={[styles.timerButton, timer === t && styles.timerButtonActive]}
                    onPress={() => setTimer(t)}
                  >
                    <Text style={[styles.timerButtonText, timer === t && styles.timerButtonTextActive]}>
                      {t}s
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Rounds */}
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Tur Sayısı</Text>
            <View style={styles.timerButtons}>
              {[1, 2, 3, 5, 10].map((r) => (
                <TouchableOpacity
                  key={r}
                  style={[styles.timerButton, rounds === r && styles.timerButtonActive]}
                  onPress={() => setRounds(r)}
                >
                  <Text style={[styles.timerButtonText, rounds === r && styles.timerButtonTextActive]}>
                    {r}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Pass Limit - Only for Taboo */}
          {gameType === 'taboo' && (
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Pas Hakkı</Text>
              <View style={styles.timerButtons}>
                {[0, 1, 2, 3, 5, 999].map((p) => (
                  <TouchableOpacity
                    key={p}
                    style={[styles.timerButton, passLimit === p && styles.timerButtonActive]}
                    onPress={() => setPassLimit(p)}
                  >
                    <Text style={[styles.timerButtonText, passLimit === p && styles.timerButtonTextActive]}>
                      {p === 999 ? '∞' : p}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* Bottom Spacer for Fixed Buttons */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Fixed Bottom Buttons */}
      <View style={styles.fixedFooter}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Geri</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.startButton, !canStartGame && styles.startButtonDisabled]} 
          onPress={startGame}
          disabled={!canStartGame}
        >
          <Text style={styles.startButtonText}>
            {!canStartGame 
              ? `En az ${gameType === 'taboo' ? '4' : '3'} oyuncu` 
              : 'Oyunu Başlat'}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  header: {
    padding: 20,
    paddingTop: 60,
    alignItems: 'center',
    backgroundColor: theme.colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.background.secondary,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 18,
    color: theme.colors.primary.main,
    fontWeight: '600',
  },
  scrollContent: {
    flex: 1,
  },
  scrollContentContainer: {
    padding: 20,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#F8FAFC',
    marginBottom: 15,
  },
  hintText: {
    fontSize: 14,
    color: '#F59E0B',
    marginBottom: 10,
    fontStyle: 'italic',
  },
  teamRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  teamInputContainer: {
    flex: 1,
  },
  teamLabel: {
    fontSize: 14,
    color: '#94A3B8',
    marginBottom: 6,
  },
  teamInput: {
    backgroundColor: '#1E293B',
    borderRadius: 10,
    padding: 12,
    color: '#F8FAFC',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  teamVs: {
    paddingHorizontal: 10,
    paddingTop: 20,
  },
  teamVsText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6366F1',
  },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 10,
  },
  playerNumber: {
    color: '#64748B',
    fontSize: 16,
    width: 25,
  },
  input: {
    flex: 1,
    backgroundColor: '#1E293B',
    borderRadius: 10,
    padding: 12,
    color: '#F8FAFC',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  inputEmpty: {
    borderColor: '#475569',
    borderStyle: 'dashed',
  },
  removeButton: {
    backgroundColor: '#EF4444',
    borderRadius: 20,
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: '#334155',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 2,
    borderColor: '#6366F1',
    borderStyle: 'dashed',
  },
  addButtonText: {
    color: '#6366F1',
    fontSize: 16,
    fontWeight: '600',
  },
  settingRow: {
    marginBottom: 20,
  },
  settingLabel: {
    color: '#CBD5E1',
    fontSize: 16,
    marginBottom: 10,
  },
  timerButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  timerButton: {
    backgroundColor: '#1E293B',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
    minWidth: 50,
    alignItems: 'center',
  },
  timerButtonActive: {
    backgroundColor: '#6366F1',
    borderColor: '#6366F1',
  },
  timerButtonText: {
    color: '#CBD5E1',
    fontSize: 14,
    fontWeight: '600',
  },
  timerButtonTextActive: {
    color: '#FFFFFF',
  },
  bottomSpacer: {
    height: 100, // Space for fixed footer
  },
  fixedFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    backgroundColor: '#0F172A',
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
    gap: 10,
  },
  backButton: {
    flex: 1,
    backgroundColor: '#334155',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  startButton: {
    flex: 2,
    backgroundColor: '#6366F1',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  startButtonDisabled: {
    backgroundColor: '#334155',
    opacity: 0.6,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
