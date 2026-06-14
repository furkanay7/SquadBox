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
  ActivityIndicator,
} from 'react-native';
import { theme } from '../theme/theme';
import { generateAITabooCards, generateAISpyfallLocations } from '../services/api';


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
  
  const [teamAName, setTeamAName] = useState('Takım A');
  const [teamBName, setTeamBName] = useState('Takım B');
  
  const defaultPlayers = gameType === 'taboo' ? 4 : 3;
  const [players, setPlayers] = useState<Player[]>(() => 
    Array.from({ length: defaultPlayers }, (_, i) => ({
      id: (i + 1).toString(),
      name: ''
    }))
  );
  
  const [timer, setTimer] = useState(60);
  const [rounds, setRounds] = useState(3);
  const [passLimit, setPassLimit] = useState(3);

  // AI Modu
  const [gameMode, setGameMode] = useState<'classic' | 'ai'>('classic');
  const [aiTopic, setAiTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

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

  const validPlayers = useMemo(() => 
    players.filter(p => p.name.trim() !== ''),
    [players]
  );

  const canStartGame = useMemo(() => {
    const minPlayers = gameType === 'taboo' ? 4 : 3;
    return validPlayers.length >= minPlayers;
  }, [validPlayers, gameType]);

  const startGame = async () => {
    const minPlayers = gameType === 'taboo' ? 4 : 3;
    
    if (validPlayers.length < minPlayers) {
      Alert.alert('Eksik Oyuncu', `Oynamak için en az ${minPlayers} oyuncu gerekli!`);
      return;
    }

    if (gameType === 'taboo') {
      if (gameMode === 'ai') {
        if (!aiTopic.trim()) {
          Alert.alert('Konu Gerekli', 'AI modu için bir konu girin!');
          return;
        }
        
        setIsGenerating(true);
        const cardCount = Math.max(20, rounds * 12);
        const cards = await generateAITabooCards(aiTopic.trim(), cardCount);
        setIsGenerating(false);
        
        if (!cards) {
          Alert.alert('Hata', 'AI kartları üretilemedi. Bağlantınızı kontrol edin.');
          return;
        }

        navigation.navigate('TabooGame', {
  players: validPlayers,
  timer,
  rounds,
  passLimit,
  teamAName: teamAName.trim() || 'Takım A',
  teamBName: teamBName.trim() || 'Takım B',
  teamAScore: 0,
  teamBScore: 0,
  aiCards: gameMode === 'ai' ? cards : null,
  gameMode,
});
      } else {
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
          aiCards: null,
          gameMode: 'classic',
        });
      }
    } else {
      if (gameMode === 'ai') {
        if (!aiTopic.trim()) {
          Alert.alert('Tema Gerekli', 'AI modu için bir tema girin!');
          return;
        }
        setIsGenerating(true);
        const locations = await generateAISpyfallLocations(aiTopic.trim());
        setIsGenerating(false);

        if (!locations) {
          Alert.alert('Hata', 'AI lokasyonları üretilemedi. Bağlantınızı kontrol edin.');
          return;
        }

        navigation.navigate('SpyfallRole', {
          players: validPlayers,
          rounds,
          currentRound: 1,
          aiLocations: locations,
          gameMode: 'ai',
        });
      } else {
        navigation.navigate('SpyfallRole', {
          players: validPlayers,
          rounds,
          currentRound: 1,
          aiLocations: null,
          gameMode: 'classic',
        });
      }
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <Text style={styles.title}>SquadBox</Text>
        <Text style={styles.subtitle}>
          {gameType === 'taboo' ? 'Anlat Bakalım' : 'Spyfall'}
        </Text>
      </View>

      <ScrollView 
        style={styles.scrollContent}
        contentContainerStyle={styles.scrollContentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Takım İsimleri - Sadece Tabu */}
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

        {/* AI Modu Seçimi - Tabu ve Spyfall */}
        {(gameType === 'taboo' || gameType === 'spyfall') && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Oyun Modu</Text>
            <View style={styles.modeContainer}>
              <TouchableOpacity
                style={[styles.modeButton, gameMode === 'classic' && styles.modeButtonActive]}
                onPress={() => setGameMode('classic')}
              >
                <Text style={styles.modeIcon}>🃏</Text>
                <Text style={[styles.modeTitle, gameMode === 'classic' && styles.modeTitleActive]}>
                  Klasik
                </Text>
                <Text style={styles.modeDesc}>Hazır kelime destesi</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modeButton, gameMode === 'ai' && styles.modeButtonActiveAI]}
                onPress={() => setGameMode('ai')}
              >
                <Text style={styles.modeIcon}>🤖</Text>
                <Text style={[styles.modeTitle, gameMode === 'ai' && styles.modeTitleActive]}>
                  AI Modu
                </Text>
                <Text style={styles.modeDesc}>Kendi konunu seç</Text>
              </TouchableOpacity>
            </View>

            {gameMode === 'ai' && (
              <View style={styles.aiTopicContainer}>
                <Text style={styles.aiTopicLabel}>Konu Gir</Text>
                <TextInput
                  style={styles.aiTopicInput}
                  placeholder={gameType === 'taboo' ? "Örn: Yazılımcı Jargonu, 90'lar Pop Müziği..." : "Örn: Uzay, Orta Çağ, Korku Filmleri..."}
                  placeholderTextColor="#64748B"
                  value={aiTopic}
                  onChangeText={setAiTopic}
                  maxLength={50}
                />
                <Text style={styles.aiHint}>
                  🤖 AI bu konuya özel 15 Tabu kartı üretecek
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Players Section */}
<View style={styles.section}>
  <Text style={styles.sectionTitle}>Oyuncular</Text>

  {gameType === 'taboo' ? (
    <>
      {/* Takım A */}
      <View style={[styles.teamDivider, { backgroundColor: '#6366F1' }]}>
        <Text style={styles.teamDividerText}>{teamAName || 'Takım A'}</Text>
      </View>
      {players.filter((_, i) => i < Math.ceil(players.length / 2)).map((player, index) => (
        <View key={player.id} style={styles.playerRow}>
          <Text style={styles.playerNumber}>{index + 1}.</Text>
          <TextInput
            style={[styles.input, player.name.trim() === '' && styles.inputEmpty]}
            placeholder={`Oyuncu ${index + 1}`}
            placeholderTextColor="#64748B"
            value={player.name}
            onChangeText={(text) => updatePlayerName(player.id, text)}
            maxLength={20}
          />
          <TouchableOpacity style={styles.removeButton} onPress={() => removePlayer(player.id)}>
            <Text style={styles.removeButtonText}>×</Text>
          </TouchableOpacity>
        </View>
      ))}
      <TouchableOpacity style={styles.addButton} onPress={addPlayer}>
        <Text style={styles.addButtonText}>+ Takım A'ya Oyuncu Ekle</Text>
      </TouchableOpacity>

      {/* Takım B */}
      <View style={[styles.teamDivider, { backgroundColor: '#6366F1', marginTop: 16 }]}>
        <Text style={styles.teamDividerText}>{teamBName || 'Takım B'}</Text>
      </View>
      {players.filter((_, i) => i >= Math.ceil(players.length / 2)).map((player, index) => {
        const realIndex = Math.ceil(players.length / 2) + index;
        return (
          <View key={player.id} style={styles.playerRow}>
            <Text style={styles.playerNumber}>{realIndex + 1}.</Text>
            <TextInput
              style={[styles.input, player.name.trim() === '' && styles.inputEmpty]}
              placeholder={`Oyuncu ${realIndex + 1}`}
              placeholderTextColor="#64748B"
              value={player.name}
              onChangeText={(text) => updatePlayerName(player.id, text)}
              maxLength={20}
            />
            <TouchableOpacity style={styles.removeButton} onPress={() => removePlayer(player.id)}>
              <Text style={styles.removeButtonText}>×</Text>
            </TouchableOpacity>
          </View>
        );
      })}
      <TouchableOpacity style={[styles.addButton, { borderColor: '#6366F1' }]} onPress={addPlayer}>
        <Text style={[styles.addButtonText, { color: '#6366F1' }]}>+ Takım B'ye Oyuncu Ekle</Text>
      </TouchableOpacity>
    </>
  ) : (
    <>
      <Text style={styles.hintText}>En az {gameType === 'spyfall' ? '3' : '2'} oyuncu gerekli</Text>
      {players.map((player, index) => (
        <View key={player.id} style={styles.playerRow}>
          <Text style={styles.playerNumber}>{index + 1}.</Text>
          <TextInput
            style={[styles.input, player.name.trim() === '' && styles.inputEmpty]}
            placeholder={`Oyuncu ${index + 1} ismi`}
            placeholderTextColor="#64748B"
            value={player.name}
            onChangeText={(text) => updatePlayerName(player.id, text)}
            maxLength={20}
          />
          <TouchableOpacity style={styles.removeButton} onPress={() => removePlayer(player.id)}>
            <Text style={styles.removeButtonText}>×</Text>
          </TouchableOpacity>
        </View>
      ))}
      <TouchableOpacity style={styles.addButton} onPress={addPlayer}>
        <Text style={styles.addButtonText}>+ Oyuncu Ekle</Text>
      </TouchableOpacity>
    </>
  )}
</View>
        {/* Oyun Ayarları */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Oyun Ayarları</Text>
          
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

        <View style={styles.bottomSpacer} />
      </ScrollView>

      <View style={styles.fixedFooter}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Geri</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.startButton, (!canStartGame || isGenerating) && styles.startButtonDisabled]} 
          onPress={startGame}
          disabled={!canStartGame || isGenerating}
        >
          {isGenerating ? (
            <View style={styles.generatingContainer}>
              <ActivityIndicator color="#FFFFFF" size="small" />
              <Text style={styles.startButtonText}> AI üretiyor...</Text>
            </View>
          ) : (
            <Text style={styles.startButtonText}>
              {!canStartGame 
                ? `En az ${gameType === 'taboo' ? '4' : '3'} oyuncu` 
                : gameMode === 'ai' ? '🤖 AI ile Başlat' : 'Oyunu Başlat'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background.primary },
  header: { padding: 20, paddingTop: 60, alignItems: 'center', backgroundColor: theme.colors.background.primary, borderBottomWidth: 1, borderBottomColor: theme.colors.background.secondary },
  title: { fontSize: 28, fontWeight: 'bold', color: theme.colors.text.primary, marginBottom: 5 },
  subtitle: { fontSize: 18, color: theme.colors.primary.main, fontWeight: '600' },
  scrollContent: { flex: 1 },
  scrollContentContainer: { padding: 20 },
  section: { marginBottom: 25 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#F8FAFC', marginBottom: 15 },
  hintText: { fontSize: 14, color: '#F59E0B', marginBottom: 10, fontStyle: 'italic' },
  teamRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  teamInputContainer: { flex: 1 },
  teamLabel: { fontSize: 14, color: '#94A3B8', marginBottom: 6 },
  teamInput: { backgroundColor: '#1E293B', borderRadius: 10, padding: 12, color: '#F8FAFC', fontSize: 16, borderWidth: 1, borderColor: '#334155' },
  teamVs: { paddingHorizontal: 10, paddingTop: 20 },
  teamVsText: { fontSize: 16, fontWeight: 'bold', color: '#6366F1' },
  modeContainer: { flexDirection: 'row', gap: 12, marginBottom: 15 },
  modeButton: { flex: 1, backgroundColor: '#1E293B', borderRadius: 12, padding: 16, alignItems: 'center', borderWidth: 2, borderColor: '#334155' },
  modeButtonActive: { borderColor: '#6366F1', backgroundColor: '#1E1B4B' },
  modeButtonActiveAI: { borderColor: '#10B981', backgroundColor: '#022C22' },
  modeIcon: { fontSize: 28, marginBottom: 8 },
  modeTitle: { fontSize: 16, fontWeight: 'bold', color: '#94A3B8', marginBottom: 4 },
  modeTitleActive: { color: '#FFFFFF' },
  modeDesc: { fontSize: 12, color: '#64748B', textAlign: 'center' },
  aiTopicContainer: { backgroundColor: '#022C22', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#10B981' },
  aiTopicLabel: { fontSize: 14, color: '#10B981', fontWeight: '600', marginBottom: 8 },
  aiTopicInput: { backgroundColor: '#1E293B', borderRadius: 10, padding: 12, color: '#F8FAFC', fontSize: 16, borderWidth: 1, borderColor: '#334155', marginBottom: 8 },
  aiHint: { fontSize: 12, color: '#64748B' },
  playerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 10 },
  playerNumber: { color: '#64748B', fontSize: 16, width: 25 },
  input: { flex: 1, backgroundColor: '#1E293B', borderRadius: 10, padding: 12, color: '#F8FAFC', fontSize: 16, borderWidth: 1, borderColor: '#334155' },
  inputEmpty: { borderColor: '#475569', borderStyle: 'dashed' },
  removeButton: { backgroundColor: '#EF4444', borderRadius: 20, width: 30, height: 30, alignItems: 'center', justifyContent: 'center' },
  removeButtonText: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
  addButton: { backgroundColor: '#334155', padding: 12, borderRadius: 10, alignItems: 'center', marginTop: 10, borderWidth: 2, borderColor: '#6366F1', borderStyle: 'dashed' },
  addButtonText: { color: '#6366F1', fontSize: 16, fontWeight: '600' },
  settingRow: { marginBottom: 20 },
  settingLabel: { color: '#CBD5E1', fontSize: 16, marginBottom: 10 },
  timerButtons: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  timerButton: { backgroundColor: '#1E293B', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8, borderWidth: 1, borderColor: '#334155', minWidth: 50, alignItems: 'center' },
  timerButtonActive: { backgroundColor: '#6366F1', borderColor: '#6366F1' },
  timerButtonText: { color: '#CBD5E1', fontSize: 14, fontWeight: '600' },
  timerButtonTextActive: { color: '#FFFFFF' },
  bottomSpacer: { height: 100 },
  fixedFooter: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', padding: 20, paddingBottom: Platform.OS === 'ios' ? 40 : 20, backgroundColor: '#0F172A', borderTopWidth: 1, borderTopColor: '#1E293B', gap: 10 },
  backButton: { flex: 1, backgroundColor: '#334155', padding: 15, borderRadius: 10, alignItems: 'center' },
  backButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  startButton: { flex: 2, backgroundColor: '#6366F1', padding: 15, borderRadius: 10, alignItems: 'center' },
  startButtonDisabled: { backgroundColor: '#334155', opacity: 0.6 },
  startButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  generatingContainer: { flexDirection: 'row', alignItems: 'center' },
  teamDivider: {
  paddingHorizontal: 12,
  paddingVertical: 6,
  borderRadius: 8,
  marginBottom: 8,
  alignSelf: 'flex-start',
},
teamDividerText: {
  color: '#FFFFFF',
  fontSize: 13,
  fontWeight: 'bold',
},
});