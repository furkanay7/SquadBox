import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TouchableOpacity,
} from 'react-native';
import { theme } from '../theme/theme';

interface GameCardProps {
  title: string;
  description?: string;
  playerCount?: string;
  duration?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  onPress?: () => void;
  disabled?: boolean;
  style?: ViewStyle;
  titleStyle?: TextStyle;
  descriptionStyle?: TextStyle;
  showBadge?: boolean;
  badgeText?: string;
  badgeColor?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
}

export const GameCard: React.FC<GameCardProps> = ({
  title,
  description,
  playerCount,
  duration,
  difficulty,
  onPress,
  disabled = false,
  style,
  titleStyle,
  descriptionStyle,
  showBadge = false,
  badgeText,
  badgeColor = 'primary',
}) => {
  const getDifficultyColor = () => {
    switch (difficulty) {
      case 'easy':
        return theme.colors.success.main;
      case 'medium':
        return theme.colors.warning.main;
      case 'hard':
        return theme.colors.error.main;
      default:
        return theme.colors.text.secondary;
    }
  };

  const getBadgeColor = () => {
    switch (badgeColor) {
      case 'primary':
        return theme.colors.primary.main;
      case 'secondary':
        return theme.colors.secondary.main;
      case 'success':
        return theme.colors.success.main;
      case 'warning':
        return theme.colors.warning.main;
      case 'error':
        return theme.colors.error.main;
      default:
        return theme.colors.primary.main;
    }
  };

  const Card = onPress ? TouchableOpacity : View;
  const cardProps = onPress ? { onPress, disabled, activeOpacity: 0.8 } : {};

  return (
    <Card style={[styles.card, disabled && styles.disabledCard, style]} {...cardProps}>
      <View style={styles.header}>
        <Text style={[styles.title, titleStyle]}>{title}</Text>
        {showBadge && badgeText && (
          <View style={[styles.badge, { backgroundColor: getBadgeColor() }]}>
            <Text style={styles.badgeText}>{badgeText}</Text>
          </View>
        )}
      </View>

      {description && (
        <Text style={[styles.description, descriptionStyle]}>{description}</Text>
      )}

      <View style={styles.footer}>
        {playerCount && (
          <View style={styles.infoItem}>
            <Text style={styles.infoText}>{playerCount}</Text>
          </View>
        )}
        {duration && (
          <View style={styles.infoItem}>
            <Text style={styles.infoText}>{duration}</Text>
          </View>
        )}
        {difficulty && (
          <View style={styles.infoItem}>
            <Text style={[styles.difficultyText, { color: getDifficultyColor() }]}>
              {difficulty.toUpperCase()}
            </Text>
          </View>
        )}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    ...theme.gameStyles.card,
    marginVertical: theme.spacing.sm,
  },
  disabledCard: {
    opacity: 0.5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  title: {
    ...theme.commonStyles.sectionTitle,
    marginBottom: 0,
    flex: 1,
  },
  badge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
    marginLeft: theme.spacing.sm,
  },
  badgeText: {
    color: theme.colors.primary.contrast,
    fontSize: theme.typography.size.xs,
    fontWeight: theme.typography.weight.semibold,
  },
  description: {
    ...theme.commonStyles.description,
    marginBottom: theme.spacing.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  infoItem: {
    backgroundColor: theme.colors.background.tertiary,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.lg,
    minWidth: 60,
    alignItems: 'center',
  },
  infoText: {
    color: theme.colors.text.secondary,
    fontSize: theme.typography.size.sm,
    fontWeight: theme.typography.weight.medium,
  },
  difficultyText: {
    fontSize: theme.typography.size.sm,
    fontWeight: theme.typography.weight.semibold,
  },
});
