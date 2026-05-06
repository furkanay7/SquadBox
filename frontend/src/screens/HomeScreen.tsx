import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Animated,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../theme/theme';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.75;
const CARD_MARGIN = 20;

interface Game {
  id: string;
  title: string;
  description: string;
  playerCount: string;
  duration: string;
  color: string;
  type: 'taboo' | 'spyfall' | 'comingsoon';
  disabled?: boolean;
}

const games: Game[] = [
  {
    id: '1',
    title: 'Anlat Bakalım',
    description: 'Yasak kelimeleri kullanmadan anlat! Kelime kartları, geri sayım sayacı ve kontrol butonları ile tam oyun deneyimi.',
    playerCount: '4+ Oyuncu',
    duration: '15-30 dk',
    color: theme.colors.primary.main,
    type: 'taboo',
  },
  {
    id: '2',
    title: 'Spyfall',
    description: 'Hold-to-reveal mekanizmasıyla rol gösterimi. Kim casus? Lokasyonu bul veya gizli rolünü sakla!',
    playerCount: '3-10 Oyuncu',
    duration: '10-20 dk',
    color: theme.colors.secondary.main,
    type: 'spyfall',
  },
  {
    id: '3',
    title: 'Yakında...',
    description: 'Yeni oyunlar çok yakında! Bizi takip etmeye devam edin, heyecan verici sürprizler geliyor.',
    playerCount: '? Oyuncu',
    duration: '? dk',
    color: theme.colors.background.tertiary,
    type: 'comingsoon',
    disabled: true,
  },
];

interface HomeScreenProps {
  navigation: any;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const renderGameCard = ({ item, index }: { item: Game; index: number }) => {
    const inputRange = [
      (index - 1) * (CARD_WIDTH + CARD_MARGIN * 2),
      index * (CARD_WIDTH + CARD_MARGIN * 2),
      (index + 1) * (CARD_WIDTH + CARD_MARGIN * 2),
    ];

    const scale = scrollX.interpolate({
      inputRange,
      outputRange: [0.8, 1, 0.8],
      extrapolate: 'clamp',
    });

    const opacity = scrollX.interpolate({
      inputRange,
      outputRange: [0.5, 1, 0.5],
      extrapolate: 'clamp',
    });

    return (
      <Animated.View
        style={[
          styles.cardContainer,
          { transform: [{ scale }], opacity },
        ]}
      >
        <TouchableOpacity
          style={[styles.card, { backgroundColor: item.color }, item.disabled && styles.cardDisabled]}
          onPress={() => !item.disabled && navigation.navigate('Setup', { gameType: item.type })}
          activeOpacity={item.disabled ? 1 : 0.9}
          disabled={item.disabled}
        >
          <View style={styles.cardContent}>
            <Text style={styles.gameTitle}>{item.title}</Text>
            <Text style={styles.gameDescription}>{item.description}</Text>
            
            <View style={styles.statsContainer}>
              <View style={styles.stat}>
                <Text style={styles.statValue}>{item.playerCount}</Text>
                <Text style={styles.statLabel}>Oyuncu</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.stat}>
                <Text style={styles.statValue}>{item.duration}</Text>
                <Text style={styles.statLabel}>Süre</Text>
              </View>
            </View>

            {!item.disabled && (
              <View style={styles.playButton}>
                <Text style={styles.playButtonText}>Oyna →</Text>
              </View>
            )}
            {item.disabled && (
              <View style={[styles.playButton, styles.playButtonDisabled]}>
                <Text style={styles.playButtonText}>Çok Yakında</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderPagination = () => {
    return (
      <View style={styles.paginationContainer}>
        {games.map((_, index) => (
          <View
            key={index}
            style={[
              styles.paginationDot,
              index === activeIndex && styles.paginationDotActive,
            ]}
          />
        ))}
      </View>
    );
  };

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    {
      useNativeDriver: false,
      listener: (event: any) => {
        const index = Math.round(
          event.nativeEvent.contentOffset.x / (CARD_WIDTH + CARD_MARGIN * 2)
        );
        setActiveIndex(index);
      },
    }
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <MaterialCommunityIcons 
            name="party-popper" 
            size={64} 
            color={theme.colors.primary.main}
          />
        </View>
        <Text style={[styles.title, { color: theme.colors.text.primary }]}>SquadBox</Text>
        <Text style={[styles.subtitle, { color: theme.colors.text.secondary }]}>Oyun seç ve eğlenmeye başla!</Text>
      </View>

      <View style={styles.carouselContainer}>
        <Animated.FlatList
          ref={flatListRef}
          data={games}
          renderItem={renderGameCard}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={CARD_WIDTH + CARD_MARGIN * 2}
          decelerationRate="fast"
          contentContainerStyle={styles.carouselContent}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        />
        
        {renderPagination()}
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Tek cihaz üzerinden oynanan parti oyunları
        </Text>
        <Text style={styles.footerSubtext}>
          Arkadaşlarınla bir araya gel, eğlenceyi başlat!
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginBottom: 30,
  },
  logoContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  carouselContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  carouselContent: {
    paddingHorizontal: (width - CARD_WIDTH) / 2 - CARD_MARGIN,
    alignItems: 'center',
  },
  cardContainer: {
    width: CARD_WIDTH + CARD_MARGIN * 2,
    paddingHorizontal: CARD_MARGIN,
  },
  card: {
    width: CARD_WIDTH,
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
  cardDisabled: {
    opacity: 0.7,
  },
  cardContent: {
    height: 320,
    justifyContent: 'space-between',
  },
  gameTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  gameDescription: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 22,
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  playButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  playButtonDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  playButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    gap: 8,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.background.tertiary,
  },
  paginationDotActive: {
    width: 24,
    borderRadius: 4,
    backgroundColor: theme.colors.primary.main,
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: theme.colors.text.disabled,
    textAlign: 'center',
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 12,
    color: theme.colors.background.tertiary,
    textAlign: 'center',
  },
});
