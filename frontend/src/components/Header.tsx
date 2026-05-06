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

interface HeaderProps {
  title?: string;
  subtitle?: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
  rightAction?: {
    icon?: string;
    text?: string;
    onPress: () => void;
  };
  style?: ViewStyle;
  titleStyle?: TextStyle;
  subtitleStyle?: TextStyle;
  variant?: 'default' | 'centered' | 'minimal';
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  showBackButton = false,
  onBackPress,
  rightAction,
  style,
  titleStyle,
  subtitleStyle,
  variant = 'default',
}) => {
  const renderBackButton = () => {
    if (!showBackButton) return null;

    return (
      <TouchableOpacity
        style={styles.backButton}
        onPress={onBackPress}
        activeOpacity={0.8}
      >
        <View style={styles.backIcon}>
          <Text style={styles.backIconText}>←</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderRightAction = () => {
    if (!rightAction) return null;

    return (
      <TouchableOpacity
        style={styles.rightAction}
        onPress={rightAction.onPress}
        activeOpacity={0.8}
      >
        {rightAction.icon ? (
          <Text style={styles.rightActionIcon}>{rightAction.icon}</Text>
        ) : (
          <Text style={styles.rightActionText}>{rightAction.text}</Text>
        )}
      </TouchableOpacity>
    );
  };

  const getContainerStyle = (): ViewStyle => {
    const baseStyle = [styles.container];

    if (variant === 'centered') {
      baseStyle.push(styles.centeredContainer);
    } else if (variant === 'minimal') {
      baseStyle.push(styles.minimalContainer);
    }

    return StyleSheet.flatten([baseStyle, style]);
  };

  const getTitleStyle = (): TextStyle => {
    const baseStyle = [styles.title];

    if (variant === 'minimal') {
      baseStyle.push(styles.minimalTitle);
    }

    return StyleSheet.flatten([baseStyle, titleStyle]);
  };

  return (
    <View style={getContainerStyle()}>
      <View style={styles.topBar}>
        {renderBackButton()}
        <View style={styles.titleContainer}>
          {title && <Text style={getTitleStyle()}>{title}</Text>}
          {subtitle && (
            <Text style={[styles.subtitle, subtitleStyle]}>{subtitle}</Text>
          )}
        </View>
        {renderRightAction()}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background.primary,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.base,
    ...theme.shadows.sm,
  },
  centeredContainer: {
    alignItems: 'center',
  },
  minimalContainer: {
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
    paddingHorizontal: theme.spacing.base,
    shadowOpacity: 0,
    elevation: 0,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: theme.gameStyles.touchTarget.minHeight,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'flex-start',
    marginHorizontal: theme.spacing.md,
  },
  title: {
    fontSize: theme.typography.size['2xl'],
    fontWeight: theme.typography.weight.bold,
    color: theme.colors.text.primary,
    textAlign: 'center',
  },
  minimalTitle: {
    fontSize: theme.typography.size.xl,
    fontWeight: theme.typography.weight.semibold,
  },
  subtitle: {
    fontSize: theme.typography.size.md,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginTop: theme.spacing.xs,
  },
  backButton: {
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.background.secondary,
    minWidth: theme.gameStyles.touchTarget.minHeight,
    minHeight: theme.gameStyles.touchTarget.minHeight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIconText: {
    fontSize: theme.typography.size.xl,
    fontWeight: theme.typography.weight.bold,
    color: theme.colors.text.primary,
  },
  rightAction: {
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.background.secondary,
    minWidth: theme.gameStyles.touchTarget.minHeight,
    minHeight: theme.gameStyles.touchTarget.minHeight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rightActionIcon: {
    fontSize: theme.typography.size.lg,
    color: theme.colors.text.primary,
  },
  rightActionText: {
    fontSize: theme.typography.size.sm,
    fontWeight: theme.typography.weight.semibold,
    color: theme.colors.text.primary,
  },
});
